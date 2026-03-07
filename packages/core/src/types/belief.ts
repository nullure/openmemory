import { assert_sector_id, type SectorId } from "./sector.ts"

export type Belief = {
  id: string
  user_id: string
  sector: SectorId
  source_memory_node_id: string
  source_sector: SectorId
  embedding: number[]
  weight: number
  timestamps: {
    created_at: string
    updated_at: string
  }
  valid_from: string
  valid_to: string | null
}

export const assert_belief_source = (
  belief: Pick<Belief, "source_memory_node_id" | "source_sector">,
): void => {
  if (!belief.source_memory_node_id || !belief.source_memory_node_id.trim()) {
    throw new Error("belief requires source_memory_node_id")
  }
  assert_sector_id(belief.source_sector)
}
