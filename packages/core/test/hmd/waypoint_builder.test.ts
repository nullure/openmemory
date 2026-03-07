import test from "node:test"
import assert from "node:assert/strict"
import { build_waypoint_edges } from "../../src/engine/waypoint_builder.ts"
import { HMD_USER_ID, create_hmd_harness } from "./helpers.ts"

test("waypoint builder creates and stores deterministic relation edges", async () => {
  const { store, provider } = create_hmd_harness(8, 23)

  await store.putMemoryNode({
    id: "memory-1",
    user_id: HMD_USER_ID,
    text: "I deployed the server.",
    timestamp_ms: 1000,
    metadata: {},
    sectors: ["episodic"],
  })
  const latest = {
    id: "memory-2",
    user_id: HMD_USER_ID,
    text: "The server crashed yesterday.",
    timestamp_ms: 2000,
    metadata: {},
    sectors: ["episodic"],
    temporal_markers: ["yesterday"],
  } as const
  await store.putMemoryNode(latest)

  const edges = await build_waypoint_edges(store, provider, latest, {
    semantic_similarity_threshold: 0,
    entity_overlap_threshold: 1,
  })

  assert.equal(edges.length, 1)
  assert.equal(edges[0].relation, "semantic_neighbor")

  const stored = await store.listWaypointEdgesForUser(HMD_USER_ID)
  assert.equal(stored.length, 1)
  assert.equal(stored[0].id, edges[0].id)
  assert.equal(stored[0].from_memory_node_id, "memory-2")
  assert.equal(stored[0].to_memory_node_id, "memory-1")
})
