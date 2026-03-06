import type { SectorId } from "./sector.js"

export type Anchor = {
  id: string
  memory_node_id: string
  user_id: string
  sector: SectorId
  embedding: number[]
  weight: number
  salience: number
  created_at: number
  updated_at: number
  last_access_at: number
}
