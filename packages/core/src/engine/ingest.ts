import { default_config, type core_config } from "../config.ts"
import { make_projection_matrix, project } from "../math/projection.ts"
import { novelty_score } from "../math/novelty.ts"
import { route_sectors } from "../math/routing.ts"
import { update_mean, update_variance } from "../math/ema.ts"
import type { Store } from "../store/types.ts"
import type { SectorId, SectorState } from "../types/sector.ts"
import type { EmbeddingProvider } from "../embed/types.ts"
import { extract_identity, extract_preference, type extracted_belief } from "./extract.ts"
import { init_sector_state, update_sector_centroid } from "./sector_state.ts"
import { surprise_gate, type gate_action } from "./surprise_gate.ts"
import type { CountMinSketch } from "./sketch_engine.ts"

export type ingest_summary = {
  sector: SectorId
  novelty: number
  action: gate_action
  keys: string[]
  anchor_id: string | null
}

const to_iso = (ms: number): string => new Date(ms).toISOString()

const collect_beliefs = (user_id: string, text: string): extracted_belief[] => {
  const beliefs: extracted_belief[] = []
  const pref = extract_preference(user_id, text)
  if (pref) beliefs.push(pref)
  const ident = extract_identity(user_id, text)
  if (ident) beliefs.push(ident)
  return beliefs
}

const update_sector_state = (
  state: SectorState,
  x: number[],
  config: core_config,
  now_ms: number,
): SectorState => {
  const alpha = config.ema.alpha
  const beta = config.ema.beta
  const mean = update_mean(state.mean, x, alpha)
  const variance = update_variance(state.variance, mean, x, alpha)
  const updated = update_sector_centroid(state, x, beta, now_ms)
  return {
    ...updated,
    mean,
    variance,
  }
}

export const ingest = async (
  store: Store,
  user_id: string,
  text: string,
  provider: EmbeddingProvider,
  centroids: Record<SectorId, number[]>,
  sketch: CountMinSketch,
  config: core_config = default_config,
  now_ms: number = Date.now(),
): Promise<ingest_summary> => {
  const vector = await provider.embed_text(text)
  const projection = make_projection_matrix(vector.length, config.projection.k, config.projection.seed)
  const projected = project(vector, projection)
  const keys = collect_beliefs(user_id, text).map((belief) => belief.object)
  const routes = route_sectors(projected, centroids, 2)
  const sectors: SectorId[] = routes.length ? routes.map((route) => route.sector) : ["factual"]
  let summary: ingest_summary | null = null
  for (const sector of sectors) {
    const threshold = config.novelty_thresholds_by_sector[sector] ?? 0
    const existing = await store.getSectorState(user_id, sector)
    const state = existing ?? init_sector_state(user_id, sector, projected, now_ms)
    const novelty = novelty_score(projected, state.mean, state.variance, config.epsilons.novelty)
    let anchor_id: string | null = null
    const action = surprise_gate(novelty, threshold, sketch, keys, () => {
      anchor_id = `anchor-${sector}-${now_ms}`
    })
    const next_state = update_sector_state(state, projected, config, now_ms)
    await store.putSectorState(next_state)
    if (action === "create_anchor" && anchor_id) {
      const iso = to_iso(now_ms)
      await store.putAnchor({
        id: anchor_id,
        user_id,
        sector,
        embedding: projected.slice(),
        weight: 1,
        timestamps: {
          created_at: iso,
          updated_at: iso,
        },
        valid_from: iso,
        valid_to: null,
      })
    }
    if (!summary) {
      summary = {
        sector,
        novelty,
        action,
        keys,
        anchor_id,
      }
    }
  }
  return summary ?? {
    sector: "factual",
    novelty: 0,
    action: "update_sketches",
    keys,
    anchor_id: null,
  }
}
