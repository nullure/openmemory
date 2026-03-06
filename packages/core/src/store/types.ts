import type { Anchor } from "../types/anchor.js"
import type { Belief } from "../types/belief.js"
import type { SectorId, SectorState } from "../types/sector.js"

export interface Store {
  getAnchors(user_id: string, sector: SectorId): Promise<Anchor[]>
  putAnchor(anchor: Anchor): Promise<void>
  deleteAnchor(id: string): Promise<void>
  listAnchors(user_id: string, sector: SectorId): Promise<Anchor[]>
  getBeliefs(user_id: string): Promise<Belief[]>
  putBelief(belief: Belief): Promise<void>
  updateBelief(belief: Belief): Promise<void>
  getSectorState(user_id: string, sector: SectorId): Promise<SectorState | null>
  putSectorState(state: SectorState): Promise<void>
}
