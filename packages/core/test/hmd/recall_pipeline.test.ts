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

test("recall pipeline ranks strongest semantic match first", async () => {
  const { store, provider, config } = create_hmd_harness(8, 29)
  const query = "what is the tallest mountain?"
  const semantic_query = await provider.embed_text(query, { sector: "semantic" })
  const orthogonal = make_orthogonal(semantic_query)
  const weak = blend_with_similarity(semantic_query, orthogonal, 0.2)
  const opposite = semantic_query.map((value) => -value)

  await put_memory_and_anchor(
    store,
    HMD_USER_ID,
    {
      id: "memory-everest",
      user_id: HMD_USER_ID,
      text: "Mount Everest is the tallest mountain.",
      timestamp_ms: 1000,
      metadata: {},
      sectors: ["semantic"],
    },
    { id: "anchor-everest", sector: "semantic", embedding: semantic_query, timestamp_ms: 1000 },
  )
  await put_memory_and_anchor(
    store,
    HMD_USER_ID,
    {
      id: "memory-paris",
      user_id: HMD_USER_ID,
      text: "The capital of France is Paris.",
      timestamp_ms: 1000,
      metadata: {},
      sectors: ["semantic"],
    },
    { id: "anchor-paris", sector: "semantic", embedding: opposite, timestamp_ms: 1000 },
  )
  await put_memory_and_anchor(
    store,
    HMD_USER_ID,
    {
      id: "memory-hiking",
      user_id: HMD_USER_ID,
      text: "I went hiking last weekend.",
      timestamp_ms: 1000,
      metadata: {},
      sectors: ["semantic"],
    },
    { id: "anchor-hiking", sector: "semantic", embedding: weak, timestamp_ms: 1000 },
  )

  const out = await recall(
    { user_id: HMD_USER_ID, query_text: query, timestamp_ms: 1000 },
    { store, provider, config },
  )

  assert.equal(out.memories[0].memory_node_id, "memory-everest")
  assert.ok(out.sectors_used.some((sector) => sector.sector === "semantic"))

  const everest_candidate = out.candidates.find((candidate) => candidate.anchor.memory_node_id === "memory-everest")
  const other_candidates = out.candidates.filter((candidate) => candidate.anchor.memory_node_id !== "memory-everest")
  assert.ok(everest_candidate)
  for (const candidate of other_candidates) {
    assert.ok(everest_candidate.similarity > candidate.similarity)
  }
})

test("waypoint expansion brings connected weaker memories into recall context", async () => {
  const { store, provider, config } = create_hmd_harness(8, 37)
  const query = "what mountain is the tallest?"
  const semantic_query = await provider.embed_text(query, { sector: "semantic" })
  const orthogonal = make_orthogonal(semantic_query)
  const strong = semantic_query
  const medium = blend_with_similarity(semantic_query, orthogonal, 0.78)
  const weak = blend_with_similarity(semantic_query, orthogonal, 0.7)

  await put_memory_and_anchor(
    store,
    HMD_USER_ID,
    {
      id: "memory-everest",
      user_id: HMD_USER_ID,
      text: "Mount Everest is the tallest mountain.",
      timestamp_ms: 1000,
      metadata: {},
      sectors: ["semantic"],
    },
    { id: "anchor-everest", sector: "semantic", embedding: strong, timestamp_ms: 1000 },
  )
  await put_memory_and_anchor(
    store,
    HMD_USER_ID,
    {
      id: "memory-trail",
      user_id: HMD_USER_ID,
      text: "I climbed a mountain trail.",
      timestamp_ms: 1000,
      metadata: {},
      sectors: ["semantic"],
    },
    { id: "anchor-trail", sector: "semantic", embedding: medium, timestamp_ms: 1000 },
  )
  await put_memory_and_anchor(
    store,
    HMD_USER_ID,
    {
      id: "memory-hiking",
      user_id: HMD_USER_ID,
      text: "I went hiking last weekend.",
      timestamp_ms: 1000,
      metadata: {},
      sectors: ["semantic"],
    },
    { id: "anchor-hiking", sector: "semantic", embedding: weak, timestamp_ms: 1000 },
  )

  const out = await recall(
    { user_id: HMD_USER_ID, query_text: query, timestamp_ms: 1000 },
    {
      store,
      provider,
      config,
      expand_waypoints: (memory_node_id: string) =>
        memory_node_id === "memory-everest"
          ? [{ memory_node_id: "memory-hiking", edge_weight: 1, relation: "semantic_neighbor" }]
          : [],
    },
  )

  const everest = out.memories.find((memory) => memory.memory_node_id === "memory-everest")
  const hiking = out.memories.find((memory) => memory.memory_node_id === "memory-hiking")
  assert.ok(everest)
  assert.ok(hiking)
  assert.ok(everest.trace.some((trace) => trace.source === "vector"))
  assert.ok(hiking.trace.some((trace) => trace.source === "waypoint"))
  assert.ok(hiking.trace.some((trace) =>
    trace.source === "waypoint" &&
    trace.via_memory_node_id === "memory-everest" &&
    trace.waypoint_relation === "semantic_neighbor",
  ))
})
