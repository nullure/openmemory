export type WaypointRelation =
  | "same_sector"
  | "shared_entity"
  | "temporal_neighbor"
  | "semantic_neighbor"

export type WaypointEdge = {
  id: string
  user_id: string
  from_memory_node_id: string
  to_memory_node_id: string
  relation: WaypointRelation
  weight: number
  created_at: number
}

const relation_set = new Set<WaypointRelation>([
  "same_sector",
  "shared_entity",
  "temporal_neighbor",
  "semantic_neighbor",
])

export const assert_waypoint_relation = (value: string): WaypointRelation => {
  if (!relation_set.has(value as WaypointRelation)) throw new Error("invalid waypoint relation")
  return value as WaypointRelation
}
