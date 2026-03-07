import { default_config, type core_config } from "../config.ts"
import { classify_memory } from "../classifier/rule_based.ts"
import { anchor_score } from "../math/scoring.ts"
import { recency_score } from "../math/recency.ts"
import { similarity_normalized } from "../math/vec.ts"
import type { Store } from "../store/types.ts"
import type { Anchor } from "../types/anchor.ts"
import type { ContextPacket, ContextTrace, WaypointTrace } from "../types/context.ts"
import type { MemoryNode } from "../types/memory_node.ts"
import type { SectorId } from "../types/sector.ts"
import type { EmbeddingProvider } from "../embed/types.ts"
import { get_anchors } from "./anchor_engine.ts"
import { get_active_beliefs } from "./belief_engine.ts"
import { build_context_packet } from "./context_builder.ts"

export type recall_input = {
  user_id: string
  query_text: string
  timestamp_ms?: number
  limit?: number
  mode?: "fast" | "deep"
  token_budget?: number
}

export type recall_candidate = {
  anchor: Anchor
  similarity: number
  waypoint_bonus: number
  score: number
  trace: ContextTrace[]
}

export type recall_summary = ContextPacket & {
  sectors: SectorId[]
  embeddings_by_sector: Record<SectorId, number[]>
  candidates: recall_candidate[]
  mode: "fast" | "deep"
  token_budget: number
}

export type recall_deps = {
  store: Store
  provider: EmbeddingProvider
  config?: core_config
  expand_waypoints?: (memory_node_id: string) => Promise<waypoint_neighbor[]> | waypoint_neighbor[]
}

const candidate_key = (candidate: recall_candidate): string => candidate.anchor.id

export type waypoint_neighbor = string | {
  memory_node_id: string
  edge_weight: number
  relation?: string
}

const normalize_waypoint_neighbor = (
  neighbor: waypoint_neighbor,
): { memory_node_id: string; edge_weight: number; relation?: string } => {
  if (typeof neighbor === "string") return { memory_node_id: neighbor, edge_weight: 0 }
  return {
    memory_node_id: neighbor.memory_node_id,
    edge_weight: Math.max(0, neighbor.edge_weight),
    relation: neighbor.relation,
  }
}

type raw_candidate = {
  anchor: Anchor
  similarity: number
  waypoint_bonus: number
  score: number
  trace: ContextTrace
}

type recall_mode_profile = {
  mode: "fast" | "deep"
  default_limit: number
  default_token_budget: number
  waypoint_seed_limit: number
  waypoint_hops: number
  candidate_pool_multiplier: number
  trace_limit: number
  max_waypoint_expansions: number
}

const TOKENS_PER_MEMORY = 256

const RECALL_MODE_PROFILE: Record<"fast" | "deep", recall_mode_profile> = {
  fast: {
    mode: "fast",
    default_limit: 10,
    default_token_budget: 10 * TOKENS_PER_MEMORY,
    waypoint_seed_limit: 3,
    waypoint_hops: 1,
    candidate_pool_multiplier: 2,
    trace_limit: 2,
    max_waypoint_expansions: 24,
  },
  deep: {
    mode: "deep",
    default_limit: 20,
    default_token_budget: 20 * TOKENS_PER_MEMORY,
    waypoint_seed_limit: 8,
    waypoint_hops: 2,
    candidate_pool_multiplier: 4,
    trace_limit: 8,
    max_waypoint_expansions: 96,
  },
}

const compare_recall_candidates = (a: recall_candidate, b: recall_candidate): number => {
  if (a.score !== b.score) return b.score - a.score
  return a.anchor.id < b.anchor.id ? -1 : a.anchor.id > b.anchor.id ? 1 : 0
}

const compare_raw_candidate = (a: raw_candidate, b: raw_candidate): number => {
  if (a.score !== b.score) return b.score - a.score
  return a.anchor.id < b.anchor.id ? -1 : a.anchor.id > b.anchor.id ? 1 : 0
}

const source_rank = (value: ContextTrace["source"]): number => (value === "vector" ? 0 : 1)

const compare_trace = (a: ContextTrace, b: ContextTrace): number => {
  const sourceDelta = source_rank(a.source) - source_rank(b.source)
  if (sourceDelta !== 0) return sourceDelta
  const sectorDelta = a.sector.localeCompare(b.sector)
  if (sectorDelta !== 0) return sectorDelta
  const similarityA = a.similarity ?? Number.NEGATIVE_INFINITY
  const similarityB = b.similarity ?? Number.NEGATIVE_INFINITY
  if (similarityA !== similarityB) return similarityB - similarityA
  const viaA = a.via_memory_node_id ?? ""
  const viaB = b.via_memory_node_id ?? ""
  if (viaA !== viaB) return viaA.localeCompare(viaB)
  return (a.waypoint_relation ?? "").localeCompare(b.waypoint_relation ?? "")
}

const trace_key = (trace: ContextTrace): string =>
  [
    trace.source,
    trace.sector,
    trace.similarity ?? "",
    trace.via_memory_node_id ?? "",
    trace.waypoint_relation ?? "",
  ].join("|")

const merge_trace = (
  current: ContextTrace[],
  incoming: ContextTrace,
  max_traces: number,
): ContextTrace[] => {
  const seen = new Set<string>()
  const out: ContextTrace[] = []
  for (const trace of [...current, incoming]) {
    const key = trace_key(trace)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(trace)
    if (out.length >= max_traces) break
  }
  return out.sort(compare_trace).slice(0, max_traces)
}

const is_better = (entry: raw_candidate, existing: recall_candidate): boolean => {
  if (entry.score !== existing.score) return entry.score > existing.score
  return entry.waypoint_bonus > existing.waypoint_bonus
}

const consolidate_candidates = (
  entries: raw_candidate[],
  trace_limit: number,
): recall_candidate[] => {
  const by_anchor = new Map<string, recall_candidate>()
  for (const entry of entries) {
    const key = entry.anchor.id
    const existing = by_anchor.get(key)
    if (!existing) {
      by_anchor.set(key, {
        anchor: entry.anchor,
        similarity: entry.similarity,
        waypoint_bonus: entry.waypoint_bonus,
        score: entry.score,
        trace: [entry.trace],
      })
      continue
    }
    existing.trace = merge_trace(existing.trace, entry.trace, trace_limit)
    if (is_better(entry, existing)) {
      existing.similarity = entry.similarity
      existing.waypoint_bonus = entry.waypoint_bonus
      existing.score = entry.score
    }
  }
  return Array.from(by_anchor.values()).sort(compare_recall_candidates)
}

const resolve_recall_mode = (mode: recall_input["mode"]): "fast" | "deep" =>
  mode === "deep" ? "deep" : "fast"

const resolve_token_budget = (
  profile: recall_mode_profile,
  token_budget: recall_input["token_budget"],
): number => {
  if (typeof token_budget !== "number" || !Number.isFinite(token_budget) || token_budget <= 0) {
    return profile.default_token_budget
  }
  return Math.floor(token_budget)
}

const resolve_limit = (
  profile: recall_mode_profile,
  input_limit: recall_input["limit"],
  token_budget: number,
): number => {
  const budget_limit = Math.max(1, Math.floor(token_budget / TOKENS_PER_MEMORY))
  if (typeof input_limit === "number" && Number.isFinite(input_limit)) {
    return Math.max(0, Math.min(Math.floor(input_limit), budget_limit))
  }
  return Math.min(profile.default_limit, budget_limit)
}

const append_waypoint_trace = (
  out: WaypointTrace[],
  next: WaypointTrace,
): void => {
  out.push(next)
}

export const recall = async (
  input: recall_input,
  deps: recall_deps,
): Promise<recall_summary> => {
  const now_ms = input.timestamp_ms ?? Date.now()
  const mode = resolve_recall_mode(input.mode)
  const profile = RECALL_MODE_PROFILE[mode]
  const token_budget = resolve_token_budget(profile, input.token_budget)
  const limit = resolve_limit(profile, input.limit, token_budget)
  const candidate_pool_limit = Math.max(
    profile.waypoint_seed_limit,
    limit * profile.candidate_pool_multiplier,
  )
  const config = deps.config ?? default_config
  const predictions = classify_memory(input.query_text)
  const sectors = predictions.map((p) => p.sector)
  const embeddings_by_sector = {} as Record<SectorId, number[]>
  for (const sector of sectors) {
    embeddings_by_sector[sector] = await deps.provider.embed_text(input.query_text, { sector })
  }

  const direct_candidates: raw_candidate[] = []
  const candidates: raw_candidate[] = []
  const anchors_by_memory = new Map<string, Anchor[]>()
  for (const sector of sectors) {
    const query_vector = embeddings_by_sector[sector]
    const anchors = await get_anchors(deps.store, input.user_id, sector, config, now_ms)
    for (const anchor of anchors) {
      // Embeddings are normalized by provider; dot equals cosine in this path.
      const similarity = similarity_normalized(anchor.embedding, query_vector)
      const recency = recency_score(now_ms, anchor.updated_at, config.recency.gamma)
      const score = anchor_score({
        similarity,
        salience: anchor.salience,
        recency,
        weight: anchor.weight,
        waypoint_bonus: 0,
      })
      const entry: raw_candidate = {
        anchor,
        similarity,
        waypoint_bonus: 0,
        score,
        trace: {
          source: "vector",
          sector: anchor.sector,
          similarity,
        },
      }
      direct_candidates.push(entry)
      candidates.push(entry)
      const bucket = anchors_by_memory.get(anchor.memory_node_id) ?? []
      bucket.push(anchor)
      anchors_by_memory.set(anchor.memory_node_id, bucket)
    }
  }

  const waypoint_trace: WaypointTrace[] = []
  if (deps.expand_waypoints) {
    const visited_edges = new Set<string>()
    let expansion_count = 0
    let frontier = direct_candidates
      .slice()
      .sort(compare_raw_candidate)
      .slice(0, Math.min(profile.waypoint_seed_limit, candidate_pool_limit))

    for (let hop = 0; hop < profile.waypoint_hops; hop += 1) {
      if (!frontier.length) break
      if (expansion_count >= profile.max_waypoint_expansions) break
      const next_frontier: raw_candidate[] = []
      for (const entry of frontier) {
        if (expansion_count >= profile.max_waypoint_expansions) break
        const neighbors = await deps.expand_waypoints(entry.anchor.memory_node_id)
        for (const raw_neighbor of neighbors) {
          if (expansion_count >= profile.max_waypoint_expansions) break
          const neighbor = normalize_waypoint_neighbor(raw_neighbor)
          const edge_key = `${entry.anchor.memory_node_id}|${neighbor.memory_node_id}`
          if (visited_edges.has(edge_key)) continue
          visited_edges.add(edge_key)
          expansion_count += 1
          append_waypoint_trace(waypoint_trace, {
            from_memory_node_id: entry.anchor.memory_node_id,
            to_memory_node_id: neighbor.memory_node_id,
            edge_weight: neighbor.edge_weight,
            relation: neighbor.relation,
          })
          const linked = anchors_by_memory.get(neighbor.memory_node_id)
          if (!linked) continue
          for (const anchor of linked) {
            const query_vector = embeddings_by_sector[anchor.sector]
            if (!query_vector) continue
            const similarity = similarity_normalized(anchor.embedding, query_vector)
            const recency = recency_score(now_ms, anchor.updated_at, config.recency.gamma)
            const score = anchor_score({
              similarity,
              salience: anchor.salience,
              recency,
              weight: anchor.weight,
              waypoint_bonus: neighbor.edge_weight,
            })
            const expanded_entry: raw_candidate = {
              anchor,
              similarity,
              waypoint_bonus: neighbor.edge_weight,
              score,
              trace: {
                source: "waypoint",
                sector: anchor.sector,
                similarity,
                via_memory_node_id: entry.anchor.memory_node_id,
                waypoint_relation: neighbor.relation,
              },
            }
            candidates.push(expanded_entry)
            if (hop + 1 < profile.waypoint_hops) next_frontier.push(expanded_entry)
          }
        }
      }
      frontier = next_frontier
        .sort(compare_raw_candidate)
        .slice(0, Math.min(profile.waypoint_seed_limit, candidate_pool_limit))
    }
  }

  const ranked = consolidate_candidates(candidates, profile.trace_limit)
    .filter((entry, index, arr) => arr.findIndex((e) => candidate_key(e) === candidate_key(entry)) === index)
    .slice(0, Math.max(0, Math.min(limit, candidate_pool_limit)))

  const active_beliefs = await get_active_beliefs(deps.store, input.user_id, now_ms, config)
  const memory_nodes_by_id = new Map<string, MemoryNode>()
  for (const candidate of ranked) {
    if (memory_nodes_by_id.has(candidate.anchor.memory_node_id)) continue
    const node = await deps.store.getMemoryNode(candidate.anchor.memory_node_id)
    if (!node) continue
    memory_nodes_by_id.set(candidate.anchor.memory_node_id, node)
  }
  const context = build_context_packet({
    query: input.query_text,
    sectors_used: predictions,
    memories: ranked.map((candidate) => ({
      memory_node_id: candidate.anchor.memory_node_id,
      score: candidate.score,
      trace: candidate.trace,
    })),
    memory_nodes_by_id,
    active_beliefs,
    waypoint_trace,
  })

  return {
    sectors,
    embeddings_by_sector,
    candidates: ranked,
    mode,
    token_budget,
    query: context.query,
    sectors_used: context.sectors_used,
    memories: context.memories,
    active_beliefs: context.active_beliefs,
    waypoint_trace: context.waypoint_trace,
  }
}
