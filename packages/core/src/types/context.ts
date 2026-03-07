import type { SectorPrediction } from "../classifier/types.ts"
import type { Belief } from "./belief.ts"
import type { SectorId } from "./sector.ts"

export type ContextTrace = {
  source: "vector" | "waypoint"
  sector: SectorId
  similarity?: number
  via_memory_node_id?: string
  waypoint_relation?: string
}

export type ContextMemory = {
  memory_node_id: string
  text: string
  sectors: SectorId[]
  score: number
  trace: ContextTrace[]
}

export type WaypointTrace = {
  from_memory_node_id: string
  to_memory_node_id: string
  edge_weight: number
  relation?: string
}

export type ContextPacket = {
  query: string
  sectors_used: SectorPrediction[]
  memories: ContextMemory[]
  active_beliefs: Belief[]
  waypoint_trace: WaypointTrace[]
}

// Ingest still emits a per-anchor packet for pipeline diagnostics.
export type IngestContextPacket = {
  id: string
  user_id: string
  sector: SectorId
  embedding: number[]
  memory_text: string
  metadata: Record<string, unknown> | null
  embeddings_by_sector: Record<SectorId, number[]>
  weight: number
  timestamps: {
    created_at: string
    updated_at: string
  }
  valid_from: string
  valid_to: string | null
}
