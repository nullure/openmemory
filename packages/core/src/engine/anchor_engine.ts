import { default_config, type core_config } from "../config.ts"
import { apply_decay } from "../math/decay.ts"
import { cosine } from "../math/vec.ts"
import type { Store } from "../store/types.js"
import type { Anchor } from "../types/anchor.js"
import type { SectorId } from "../types/sector.js"

const decay_anchor = (anchor: Anchor, now_ms: number, lambda: number): Anchor => {
  const dt_ms = Math.max(0, now_ms - anchor.updated_at)
  const weight = apply_decay(anchor.weight, dt_ms, lambda)
  return { ...anchor, weight }
}

const compare_anchor = (a: Anchor, b: Anchor): number => {
  if (a.weight !== b.weight) return a.weight - b.weight
  if (a.id < b.id) return -1
  if (a.id > b.id) return 1
  return 0
}

const reinforce_anchor_at = (anchor: Anchor, delta: number, now_ms: number): Anchor => ({
  ...anchor,
  weight: anchor.weight + delta,
  updated_at: now_ms,
  last_access_at: now_ms,
})

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
  const reinforced = decayed.map((candidate) => {
    if (sector !== "procedural") return candidate
    const sim = cosine(candidate.embedding, anchor.embedding)
    if (sim < config.behavioral_reinforcement.similarity_threshold) return candidate
    const delta = config.behavioral_reinforcement.delta * config.behavioral_reinforcement.factor
    return reinforce_anchor_at(candidate, delta, now_ms)
  })
  for (const updated of reinforced) await store.putAnchor(updated)
  await store.putAnchor(anchor)
  const next = [...reinforced, anchor]
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
  const now = Date.now()
  return {
    ...anchor,
    weight,
    updated_at: now,
    last_access_at: now,
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
