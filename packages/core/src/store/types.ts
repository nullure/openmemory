import type { Anchor } from "../types/anchor.js"
import type { Belief } from "../types/belief.js"
import type { MemoryNode } from "../types/memory_node.ts"
import type { SectorId, SectorState } from "../types/sector.js"
import type { WaypointEdge } from "../types/waypoint.ts"

export interface Store {
  getAnchors(user_id: string, sector: SectorId): Promise<Anchor[]>
  putAnchor(anchor: Anchor): Promise<void>
  deleteAnchor(id: string): Promise<void>
  listAnchors(user_id: string, sector: SectorId): Promise<Anchor[]>
  putMemoryNode(node: MemoryNode): Promise<void>
  getMemoryNode(id: string): Promise<MemoryNode | null>
  listMemoryNodes(user_id: string): Promise<MemoryNode[]>
  putWaypointEdge(edge: WaypointEdge): Promise<void>
  listWaypointEdgesFrom(user_id: string, from_memory_node_id: string): Promise<WaypointEdge[]>
  listWaypointEdgesForUser(user_id: string): Promise<WaypointEdge[]>
  getBeliefs(user_id: string): Promise<Belief[]>
  putBelief(belief: Belief): Promise<void>
  updateBelief(belief: Belief): Promise<void>
  getSectorState(user_id: string, sector: SectorId): Promise<SectorState | null>
  putSectorState(state: SectorState): Promise<void>
}
