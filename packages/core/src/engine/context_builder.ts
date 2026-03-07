import type { SectorPrediction } from "../classifier/types.ts"
import type { Belief } from "../types/belief.ts"
import type {
  ContextMemory,
  ContextPacket,
  ContextTrace,
  WaypointTrace,
} from "../types/context.ts"
import type { MemoryNode } from "../types/memory_node.ts"

export type context_memory_input = {
  memory_node_id: string
  score: number
  trace: ContextTrace[]
}

export type context_builder_input = {
  query: string
  sectors_used: SectorPrediction[]
  memories: context_memory_input[]
  memory_nodes_by_id: Map<string, MemoryNode>
  active_beliefs: Belief[]
  waypoint_trace: WaypointTrace[]
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
  const relationA = a.waypoint_relation ?? ""
  const relationB = b.waypoint_relation ?? ""
  return relationA.localeCompare(relationB)
}

const trace_key = (trace: ContextTrace): string =>
  [
    trace.source,
    trace.sector,
    trace.similarity ?? "",
    trace.via_memory_node_id ?? "",
    trace.waypoint_relation ?? "",
  ].join("|")

const uniq_traces = (traces: ContextTrace[]): ContextTrace[] => {
  const seen = new Set<string>()
  const out: ContextTrace[] = []
  for (const trace of traces) {
    const key = trace_key(trace)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(trace)
  }
  return out.sort(compare_trace)
}

const compare_memories = (a: ContextMemory, b: ContextMemory): number => {
  if (a.score !== b.score) return b.score - a.score
  return a.memory_node_id.localeCompare(b.memory_node_id)
}

const compare_waypoints = (a: WaypointTrace, b: WaypointTrace): number => {
  if (a.edge_weight !== b.edge_weight) return b.edge_weight - a.edge_weight
  const fromDelta = a.from_memory_node_id.localeCompare(b.from_memory_node_id)
  if (fromDelta !== 0) return fromDelta
  const toDelta = a.to_memory_node_id.localeCompare(b.to_memory_node_id)
  if (toDelta !== 0) return toDelta
  return (a.relation ?? "").localeCompare(b.relation ?? "")
}

export const build_context_packet = (input: context_builder_input): ContextPacket => {
  const memories = new Map<string, ContextMemory>()
  for (const candidate of input.memories) {
    const node = input.memory_nodes_by_id.get(candidate.memory_node_id)
    if (!node) continue
    const existing = memories.get(candidate.memory_node_id)
    if (!existing) {
      memories.set(candidate.memory_node_id, {
        memory_node_id: candidate.memory_node_id,
        text: node.text,
        sectors: node.sectors.slice(),
        score: candidate.score,
        trace: uniq_traces(candidate.trace),
      })
      continue
    }
    existing.score = Math.max(existing.score, candidate.score)
    existing.trace = uniq_traces([...existing.trace, ...candidate.trace])
  }

  return {
    query: input.query,
    sectors_used: input.sectors_used,
    memories: Array.from(memories.values()).sort(compare_memories),
    active_beliefs: input.active_beliefs,
    waypoint_trace: input.waypoint_trace.slice().sort(compare_waypoints),
  }
}
