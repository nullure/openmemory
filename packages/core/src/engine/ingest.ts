import { default_config, type core_config } from "../config.ts"
import { make_projection_matrix, project } from "../math/projection.ts"
import { novelty_score } from "../math/novelty.ts"
import { route_sectors } from "../math/routing.ts"
import { update_mean, update_variance } from "../math/ema.ts"
import type { Store } from "../store/types.ts"
import type { ContextPacket } from "../types/context.ts"
import type { MemoryNode } from "../types/memory_node.ts"
import type { SectorId, SectorState } from "../types/sector.ts"
import type { EmbeddingProvider } from "../embed/types.ts"
import { chunk_and_embed } from "../embed/chunk.ts"
import { extract_identity, extract_preference, type extracted_belief } from "./extract.ts"
import { init_sector_state, update_sector_centroid } from "./sector_state.ts"
import { surprise_gate, type gate_action } from "./surprise_gate.ts"
import type { CountMinSketch } from "./sketch_engine.ts"
import { insert_belief } from "./belief_engine.ts"

export type ingest_summary = {
  sector: SectorId
  novelty: number
  action: gate_action
  keys: string[]
  anchor_id: string | null
  sectors: SectorId[]
  embeddings_by_sector: Record<SectorId, number[]>
  context: ContextPacket
}

export type ingest_input = {
  user_id: string
  memory_text: string
  timestamp_ms?: number
  metadata?: Record<string, unknown>
}

export type ingest_deps = {
  provider: EmbeddingProvider
  centroids: Partial<Record<SectorId, number[]>>
  sketch: CountMinSketch
  config?: core_config
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
  input: ingest_input,
  deps: ingest_deps,
): Promise<ingest_summary> => {
  const { user_id, memory_text, metadata } = input
  const now_ms = input.timestamp_ms ?? Date.now()
  const config = deps.config ?? default_config
  const vector = await chunk_and_embed(deps.provider, memory_text)
  const projection = make_projection_matrix(vector.length, config.projection.k, config.projection.seed)
  const projected = project(vector, projection)
  const keys = collect_beliefs(user_id, memory_text).map((belief) => belief.object)
  const routes = route_sectors(projected, deps.centroids, 2)
  const sectors: SectorId[] = routes.length ? routes.map((route) => route.sector) : ["semantic"]
  const memory_node_id = `memory-${now_ms}`
  const node: MemoryNode = {
    id: memory_node_id,
    user_id,
    text: memory_text,
    timestamp_ms: now_ms,
    metadata: metadata ?? {},
    sectors,
  }
  await store.putMemoryNode(node)
  const embeddings_by_sector = {} as Record<SectorId, number[]>
  for (const sector of sectors) {
    embeddings_by_sector[sector] = await chunk_and_embed(deps.provider, memory_text, { sector })
  }
  let summary: ingest_summary | null = null
  let created_anchor = false
  for (const sector of sectors) {
    const sector_vector = embeddings_by_sector[sector]
    const projected_sector = project(sector_vector, projection)
    const threshold = config.novelty_thresholds_by_sector[sector] ?? 0
    const existing = await store.getSectorState(user_id, sector)
    const state = existing ?? init_sector_state(user_id, sector, projected_sector, now_ms)
    const novelty = novelty_score(projected_sector, state.mean, state.variance, config.epsilons.novelty)
    let anchor_id: string | null = null
    const action = surprise_gate(novelty, threshold, deps.sketch, keys, () => {
      anchor_id = `anchor-${sector}-${now_ms}`
    })
    const next_state = update_sector_state(state, projected_sector, config, now_ms)
    await store.putSectorState(next_state)
    if (action === "create_anchor" && anchor_id) {
      created_anchor = true
      const iso = to_iso(now_ms)
      await store.putAnchor({
        id: anchor_id,
        memory_node_id,
        user_id,
        sector,
        embedding: sector_vector.slice(),
        weight: 1,
        salience: 1,
        created_at: now_ms,
        updated_at: now_ms,
        last_access_at: now_ms,
      })
    }
    const extracted = collect_beliefs(user_id, memory_text)
    for (let i = 0; i < extracted.length; i += 1) {
      await insert_belief(
        store,
        {
          id: `belief-${sector}-${now_ms}-${i}`,
          user_id,
          sector,
          embedding: sector_vector.slice(),
          weight: 1,
          timestamps: {
            created_at: to_iso(now_ms),
            updated_at: to_iso(now_ms),
          },
          valid_from: to_iso(now_ms),
          valid_to: null,
        },
        now_ms,
      )
    }
    if (!summary) {
      summary = {
        sector,
        novelty,
        action,
        keys,
        anchor_id,
        sectors,
        embeddings_by_sector,
        context: {
          id: `context-${now_ms}`,
          user_id,
          sector,
          embedding: sector_vector.slice(),
          memory_text,
          metadata: metadata ?? null,
          embeddings_by_sector,
          weight: 1,
          timestamps: {
            created_at: to_iso(now_ms),
            updated_at: to_iso(now_ms),
          },
          valid_from: to_iso(now_ms),
          valid_to: null,
        },
      }
    }
  }
  if (!created_anchor) {
    const sector = sectors[0] ?? "semantic"
    const sector_vector = embeddings_by_sector[sector] ?? []
    const anchor_id = `anchor-${sector}-${now_ms}`
    await store.putAnchor({
      id: anchor_id,
      memory_node_id,
      user_id,
      sector,
      embedding: sector_vector.slice(),
      weight: 1,
      salience: 1,
      created_at: now_ms,
      updated_at: now_ms,
      last_access_at: now_ms,
    })
    if (summary) {
      summary.anchor_id = anchor_id
      summary.action = "create_anchor"
    }
  }
  return summary ?? {
    sector: "semantic",
    novelty: 0,
    action: "update_sketches",
    keys,
    anchor_id: null,
    sectors: ["semantic"],
    embeddings_by_sector: {} as Record<SectorId, number[]>,
    context: {
      id: `context-${now_ms}`,
      user_id,
      sector: "semantic",
      embedding: [],
      memory_text,
      metadata: metadata ?? null,
      embeddings_by_sector: {} as Record<SectorId, number[]>,
      weight: 1,
      timestamps: {
        created_at: to_iso(now_ms),
        updated_at: to_iso(now_ms),
      },
      valid_from: to_iso(now_ms),
      valid_to: null,
    },
  }
}
