import test from "node:test"
import assert from "node:assert/strict"
import { recall } from "../../src/engine/recall.ts"
import {
  HMD_USER_ID,
  blend_with_similarity,
  create_hmd_harness,
  make_orthogonal,
  put_memory_and_anchor,
} from "./helpers.ts"

test("recall returns HMD context packet with trace provenance", async () => {
  const { store, provider, config } = create_hmd_harness(8, 31)
  const query = "what is my name?"
  const semantic_query = await provider.embed_text(query, { sector: "semantic" })
  const orthogonal = make_orthogonal(semantic_query)
  const weaker = blend_with_similarity(semantic_query, orthogonal, 0.7)

  await put_memory_and_anchor(
    store,
    HMD_USER_ID,
    {
      id: "memory-seed",
      user_id: HMD_USER_ID,
      text: "I deployed a service.",
      timestamp_ms: 1000,
      metadata: {},
      sectors: ["semantic"],
    },
    { id: "anchor-seed", sector: "semantic", embedding: weaker, timestamp_ms: 1000 },
  )
  await put_memory_and_anchor(
    store,
    HMD_USER_ID,
    {
      id: "memory-target",
      user_id: HMD_USER_ID,
      text: "My name is Demon.",
      timestamp_ms: 1000,
      metadata: {},
      sectors: ["semantic"],
    },
    { id: "anchor-target", sector: "semantic", embedding: semantic_query, timestamp_ms: 1000 },
  )
  await store.putBelief({
    id: "belief-1",
    user_id: HMD_USER_ID,
    sector: "semantic",
    source_memory_node_id: "memory-target",
    source_sector: "semantic",
    embedding: semantic_query.slice(),
    weight: 1,
    timestamps: {
      created_at: "1970-01-01T00:00:00.000Z",
      updated_at: "1970-01-01T00:00:00.000Z",
    },
    valid_from: "1970-01-01T00:00:00.000Z",
    valid_to: null,
  })

  const out = await recall(
    { user_id: HMD_USER_ID, query_text: query, timestamp_ms: 1000 },
    {
      store,
      provider,
      config,
      expand_waypoints: (memory_node_id: string) =>
        memory_node_id === "memory-target"
          ? [{ memory_node_id: "memory-seed", edge_weight: 1, relation: "shared_entity" }]
          : [],
    },
  )

  assert.equal(out.query, query)
  assert.ok(Array.isArray(out.sectors_used))
  assert.ok(Array.isArray(out.memories))
  assert.ok(Array.isArray(out.active_beliefs))
  assert.ok(Array.isArray(out.waypoint_trace))

  const traces = out.memories.flatMap((memory) => memory.trace)
  assert.ok(traces.length > 0)
  for (const trace of traces) {
    assert.ok(trace.source === "vector" || trace.source === "waypoint")
    assert.equal(typeof trace.sector, "string")
  }

  const vector_trace = traces.find((trace) => trace.source === "vector")
  assert.ok(vector_trace)
  assert.equal(typeof vector_trace.similarity, "number")

  const waypoint_trace = traces.find((trace) => trace.source === "waypoint")
  assert.ok(waypoint_trace)
  assert.equal(waypoint_trace.via_memory_node_id, "memory-target")
  assert.equal(waypoint_trace.waypoint_relation, "shared_entity")
})
