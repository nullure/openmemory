import type { SectorId } from "./sector.js"

export type ContextPacket = {
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
