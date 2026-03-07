import type { SectorId } from "./sector.ts"

export type MemoryNode = {
  id: string
  user_id: string
  text: string
  timestamp_ms: number
  metadata: Record<string, unknown>
  sectors: SectorId[]
  temporal_markers?: string[]
}
