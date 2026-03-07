import type { EmbeddingProvider } from "../embed/types.ts"
import { chunk_and_embed } from "../embed/chunk.ts"
import { similarity_normalized } from "../math/vec.ts"
import type { Store } from "../store/types.ts"
import type { MemoryNode } from "../types/memory_node.ts"
import type { WaypointEdge, WaypointRelation } from "../types/waypoint.ts"
import { extract_entities } from "./entities.ts"

export type waypoint_builder_options = {
  recent_limit?: number
  entity_overlap_threshold?: number
  semantic_similarity_threshold?: number
  temporal_window_ms?: number
}

type scored_relation = {
  relation: WaypointRelation
  semantic_similarity: number
  entity_overlap: number
  same_sector_bonus: number
  temporal_bonus: number
}

const default_options: Required<waypoint_builder_options> = {
  recent_limit: 25,
  entity_overlap_threshold: 0.2,
  semantic_similarity_threshold: 0.8,
  temporal_window_ms: 24 * 60 * 60 * 1000,
}

const collect_entities = (text: string): Set<string> => new Set(extract_entities(text))

const jaccard = (a: Set<string>, b: Set<string>): number => {
  if (a.size === 0 && b.size === 0) return 0
  let intersect = 0
  for (const value of a) if (b.has(value)) intersect += 1
  const union = a.size + b.size - intersect
  return union === 0 ? 0 : intersect / union
}

const pick_relation = (
  semantic_similarity: number,
  entity_overlap: number,
  same_sector_bonus: number,
  temporal_bonus: number,
  options: Required<waypoint_builder_options>,
): WaypointRelation | null => {
  if (semantic_similarity >= options.semantic_similarity_threshold) return "semantic_neighbor"
  if (entity_overlap >= options.entity_overlap_threshold) return "shared_entity"
  if (same_sector_bonus > 0) return "same_sector"
  if (temporal_bonus > 0) return "temporal_neighbor"
  return null
}

const compute_scored_relation = (
  node: MemoryNode,
  candidate: MemoryNode,
  semantic_similarity: number,
  entity_overlap: number,
  options: Required<waypoint_builder_options>,
): scored_relation | null => {
  const same_sector_bonus = node.sectors[0] && candidate.sectors[0] && node.sectors[0] === candidate.sectors[0] ? 1 : 0
  const temporal_bonus = Math.abs(node.timestamp_ms - candidate.timestamp_ms) <= options.temporal_window_ms ? 1 : 0
  const relation = pick_relation(
    semantic_similarity,
    entity_overlap,
    same_sector_bonus,
    temporal_bonus,
    options,
  )
  if (!relation) return null
  return {
    relation,
    semantic_similarity,
    entity_overlap,
    same_sector_bonus,
    temporal_bonus,
  }
}

const edge_weight = (relation: scored_relation): number => {
  return (
    0.35 * relation.semantic_similarity +
    0.25 * relation.entity_overlap +
    0.2 * relation.same_sector_bonus +
    0.2 * relation.temporal_bonus
  )
}

export const build_waypoint_edges = async (
  store: Store,
  provider: EmbeddingProvider,
  node: MemoryNode,
  opts: waypoint_builder_options = {},
): Promise<WaypointEdge[]> => {
  const options = { ...default_options, ...opts }
  const nodes = await store.listMemoryNodes(node.user_id)
  const recent = nodes
    .filter((n) => n.id !== node.id && n.timestamp_ms <= node.timestamp_ms)
    .slice(-options.recent_limit)
  if (recent.length === 0) return []

  const node_embedding = await chunk_and_embed(provider, node.text)
  const node_entities = collect_entities(node.text)
  const edges: WaypointEdge[] = []

  for (const candidate of recent) {
    const candidate_embedding = await chunk_and_embed(provider, candidate.text)
    const semantic_similarity = similarity_normalized(node_embedding, candidate_embedding)
    const entity_overlap = jaccard(node_entities, collect_entities(candidate.text))
    const relation = compute_scored_relation(node, candidate, semantic_similarity, entity_overlap, options)
    if (!relation) continue
    const edge: WaypointEdge = {
      id: `edge-${node.id}-${candidate.id}`,
      user_id: node.user_id,
      from_memory_node_id: node.id,
      to_memory_node_id: candidate.id,
      relation: relation.relation,
      weight: edge_weight(relation),
      created_at: node.timestamp_ms,
    }
    await store.putWaypointEdge(edge)
    edges.push(edge)
  }

  return edges
}
