import { default_config, type core_config } from "../config.ts"
import { classify_memory } from "../classifier/rule_based.ts"
import { anchor_score } from "../math/scoring.ts"
import { recency_score } from "../math/recency.ts"
import { cosine, similarity_normalized } from "../math/vec.ts"
import type { Store } from "../store/types.ts"
import type { Anchor } from "../types/anchor.ts"
import type { ContextPacket } from "../types/context.ts"
import type { MemoryNode } from "../types/memory_node.ts"
import type { SectorId } from "../types/sector.ts"
import type { EmbeddingProvider } from "../embed/types.ts"
import { get_anchors } from "./anchor_engine.ts"

export type recall_input = {
  user_id: string
  query_text: string
  timestamp_ms?: number
  limit?: number
}

export type recall_candidate = {
  anchor: Anchor
  similarity: number
  score: number
}

export type recall_summary = {
  sectors: SectorId[]
  embeddings_by_sector: Record<SectorId, number[]>
  candidates: recall_candidate[]
  context: ContextPacket
}

export type recall_deps = {
  store: Store
  provider: EmbeddingProvider
  config?: core_config
  expand_waypoints?: (memory_node_id: string) => Promise<string[]> | string[]
}

const to_iso = (ms: number): string => new Date(ms).toISOString()

const candidate_key = (candidate: recall_candidate): string => candidate.anchor.id

const build_context = (
  anchor: Anchor | null,
  node: MemoryNode | null,
  embeddings_by_sector: Record<SectorId, number[]>,
  now_ms: number,
): ContextPacket => {
  const sector = anchor?.sector ?? "semantic"
  const created_at = anchor ? to_iso(anchor.created_at) : to_iso(now_ms)
  const updated_at = anchor ? to_iso(anchor.updated_at) : to_iso(now_ms)
  return {
    id: `context-${anchor?.id ?? `empty-${now_ms}`}`,
    user_id: node?.user_id ?? "",
    sector,
    embedding: anchor?.embedding ?? [],
    memory_text: node?.text ?? "",
    metadata: node?.metadata ?? null,
    embeddings_by_sector,
    weight: anchor?.weight ?? 0,
    timestamps: {
      created_at,
      updated_at,
    },
    valid_from: created_at,
    valid_to: null,
  }
}

export const recall = async (
  input: recall_input,
  deps: recall_deps,
): Promise<recall_summary> => {
  const now_ms = input.timestamp_ms ?? Date.now()
  const limit = input.limit ?? 10
  const config = deps.config ?? default_config
  const predictions = classify_memory(input.query_text)
  const sectors = predictions.map((p) => p.sector)
  const embeddings_by_sector = {} as Record<SectorId, number[]>
  for (const sector of sectors) {
    embeddings_by_sector[sector] = await deps.provider.embed_text(input.query_text, { sector })
  }

  const candidates: recall_candidate[] = []
  const anchors_by_memory = new Map<string, Anchor[]>()
  for (const sector of sectors) {
    const query_vector = embeddings_by_sector[sector]
    const anchors = await get_anchors(deps.store, input.user_id, sector, config, now_ms)
    for (const anchor of anchors) {
      // Embeddings are normalized by provider; dot equals cosine in this path.
      const similarity = similarity_normalized(anchor.embedding, query_vector)
      const recency = recency_score(now_ms, anchor.updated_at, config.recency.gamma)
      const score = anchor_score({ similarity, weight: anchor.weight, recency })
      candidates.push({ anchor, similarity, score })
      const bucket = anchors_by_memory.get(anchor.memory_node_id) ?? []
      bucket.push(anchor)
      anchors_by_memory.set(anchor.memory_node_id, bucket)
    }
  }

  if (deps.expand_waypoints) {
    const seed = candidates.slice().sort((a, b) => b.score - a.score).slice(0, 3)
    for (const entry of seed) {
      const neighbors = await deps.expand_waypoints(entry.anchor.memory_node_id)
      for (const neighbor of neighbors) {
        const linked = anchors_by_memory.get(neighbor)
        if (!linked) continue
        for (const anchor of linked) {
          const similarity = similarity_normalized(anchor.embedding, embeddings_by_sector[anchor.sector])
          const recency = recency_score(now_ms, anchor.updated_at, config.recency.gamma)
          const score = anchor_score({ similarity, weight: anchor.weight, recency }) * 0.9
          candidates.push({ anchor, similarity, score })
        }
      }
    }
  }

  const ranked = candidates
    .slice()
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score
      return a.anchor.id < b.anchor.id ? -1 : a.anchor.id > b.anchor.id ? 1 : 0
    })
    .filter((entry, index, arr) => arr.findIndex((e) => candidate_key(e) === candidate_key(entry)) === index)
    .slice(0, Math.max(0, limit))

  const top = ranked[0]?.anchor ?? null
  const node = top ? await deps.store.getMemoryNode(top.memory_node_id) : null
  const context = build_context(top, node, embeddings_by_sector, now_ms)

  return {
    sectors,
    embeddings_by_sector,
    candidates: ranked,
    context,
  }
}
