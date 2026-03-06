import type { SectorId } from "../types/sector.ts"

export type SectorPrediction = {
  sector: SectorId
  score: number
  prob: number
}
