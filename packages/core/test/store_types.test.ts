import test from "node:test"
import assert from "node:assert/strict"
import type { Store } from "../src/store/types.ts"
import type { Anchor } from "../src/types/anchor.ts"
import type { Belief } from "../src/types/belief.ts"
import type { MemoryNode } from "../src/types/memory_node.ts"
import type { SectorId, SectorState } from "../src/types/sector.ts"
import type { WaypointEdge } from "../src/types/waypoint.ts"

test("store interface compiles", async () => {
  const store = {
    async getAnchors(user_id: string, sector: SectorId): Promise<Anchor[]> {
      return [{ ...mk_anchor(user_id, sector), id: "a1" }]
    },
    async putAnchor(_anchor: Anchor): Promise<void> { },
    async deleteAnchor(_id: string): Promise<void> { },
    async listAnchors(user_id: string, sector: SectorId): Promise<Anchor[]> {
      return [{ ...mk_anchor(user_id, sector), id: "a2" }]
    },
    async putMemoryNode(_node: MemoryNode): Promise<void> { },
    async getMemoryNode(_id: string): Promise<MemoryNode | null> {
      return null
    },
    async listMemoryNodes(user_id: string): Promise<MemoryNode[]> {
      return [mk_memory_node(user_id)]
    },
    async putWaypointEdge(_edge: WaypointEdge): Promise<void> { },
    async listWaypointEdgesFrom(_user_id: string, _from_memory_node_id: string): Promise<WaypointEdge[]> {
      return [mk_waypoint_edge("user-1")]
    },
    async listWaypointEdgesForUser(user_id: string): Promise<WaypointEdge[]> {
      return [mk_waypoint_edge(user_id)]
    },
    async getBeliefs(user_id: string): Promise<Belief[]> {
      return [{ ...mk_belief(user_id), id: "b1" }]
    },
    async putBelief(_belief: Belief): Promise<void> { },
    async updateBelief(_belief: Belief): Promise<void> { },
    async getSectorState(user_id: string, sector: SectorId): Promise<SectorState | null> {
      return { ...mk_sector_state(user_id, sector), id: sector }
    },
    async putSectorState(_state: SectorState): Promise<void> { },
  } satisfies Store

  assert.ok(typeof store.getAnchors === "function")
})

const mk_anchor = (user_id: string, sector: SectorId): Anchor => ({
  id: "anchor",
  user_id,
  sector,
  memory_node_id: "memory-1",
  embedding: [0.1],
  weight: 1,
  salience: 1,
  created_at: 0,
  updated_at: 0,
  last_access_at: 0,
})

const mk_belief = (user_id: string): Belief => ({
  id: "belief",
  user_id,
  sector: "semantic",
  source_memory_node_id: "memory-1",
  source_sector: "semantic",
  embedding: [0.2],
  weight: 1,
  timestamps: {
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  valid_from: "2026-01-01T00:00:00Z",
  valid_to: null,
})

const mk_sector_state = (user_id: string, sector: SectorId): SectorState => ({
  id: sector,
  user_id,
  sector,
  centroid: [0.3],
  mean: [0.3],
  variance: [0],
  timestamps: {
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  valid_from: "2026-01-01T00:00:00Z",
  valid_to: null,
})

const mk_memory_node = (user_id: string): MemoryNode => ({
  id: "memory-1",
  user_id,
  text: "hello",
  timestamp_ms: 0,
  metadata: {},
  sectors: ["factual"],
})

const mk_waypoint_edge = (user_id: string): WaypointEdge => ({
  id: "edge-1",
  user_id,
  from_memory_node_id: "memory-1",
  to_memory_node_id: "memory-2",
  relation: "same_sector",
  weight: 0.5,
  created_at: 0,
})
