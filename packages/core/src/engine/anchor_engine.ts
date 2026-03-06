import { default_config, type core_config } from "../config.ts"
import { apply_decay } from "../math/decay.ts"
import { cosine } from "../math/vec.ts"
import type { Store } from "../store/types.js"
import type { Anchor } from "../types/anchor.js"
import type { SectorId } from "../types/sector.js"

const parse_ms = (value: string, fallback: number): number => {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const decay_anchor = (anchor: Anchor, now_ms: number, lambda: number): Anchor => {
  const ts_ms = parse_ms(anchor.timestamps.updated_at, now_ms)
  const dt_ms = Math.max(0, now_ms - ts_ms)
  const weight = apply_decay(anchor.weight, dt_ms, lambda)
  return { ...anchor, weight }
}

const compare_anchor = (a: Anchor, b: Anchor): number => {
  if (a.weight !== b.weight) return a.weight - b.weight
  if (a.id < b.id) return -1
  if (a.id > b.id) return 1
  return 0
}

export const insert_anchor = async (
  store: Store,
  anchor: Anchor,
  config: core_config = default_config,
  now_ms: number = Date.now(),
): Promise<Anchor[]> => {
  const sector = anchor.sector as SectorId
  const existing = await store.listAnchors(anchor.user_id, sector)
  const lambda = config.decay_lambdas_by_sector[sector] ?? 0
  const decayed = existing.map((a) => decay_anchor(a, now_ms, lambda))
  for (const updated of decayed) await store.putAnchor(updated)
  await store.putAnchor(anchor)
  const next = [...decayed, anchor]
  if (next.length > config.anchor_limit) {
    const sorted = next.slice().sort(compare_anchor)
    const evict = sorted[0]
    await store.deleteAnchor(evict.id)
  }
  return store.listAnchors(anchor.user_id, sector)
}

export const get_anchors = async (
  store: Store,
  user_id: string,
  sector: SectorId,
  config: core_config = default_config,
  now_ms: number = Date.now(),
): Promise<Anchor[]> => {
  const existing = await store.listAnchors(user_id, sector)
  const lambda = config.decay_lambdas_by_sector[sector] ?? 0
  return existing.map((a) => decay_anchor(a, now_ms, lambda))
}

export const reinforce_anchor = (anchor: Anchor, delta: number): Anchor => {
  const weight = anchor.weight + delta
  const updated_at = new Date(Date.now()).toISOString()
  return {
    ...anchor,
    weight,
    timestamps: {
      ...anchor.timestamps,
      updated_at,
    },
  }
}

export const find_similar_anchors = (anchors: Anchor[], query_vector: number[]): Anchor[] => {
  return anchors
    .map((anchor) => ({ anchor, sim: cosine(anchor.embedding, query_vector) }))
    .sort((a, b) => {
      if (a.sim !== b.sim) return b.sim - a.sim
      if (a.anchor.id < b.anchor.id) return -1
      if (a.anchor.id > b.anchor.id) return 1
      return 0
    })
    .map((entry) => entry.anchor)
}
