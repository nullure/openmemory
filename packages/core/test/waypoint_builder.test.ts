import test from "node:test"
import assert from "node:assert/strict"
import { MemoryStore } from "../src/store/memory.ts"
import { build_waypoint_edges } from "../src/engine/waypoint_builder.ts"
import type { EmbeddingProvider } from "../src/embed/types.ts"

const make_provider = (): EmbeddingProvider => ({
  embed_text: async (input) => {
    if (input.includes("pizza")) return [1, 0]
    if (input.includes("celery")) return [0, 1]
    return [0, 1]
  },
  embed_texts: async (inputs) => inputs.map((input) => (input.includes("pizza") ? [1, 0] : [0, 1])),
  dimensions: () => 2,
  name: () => "mock",
})

test("semantically similar memories form edges", async () => {
  const store = new MemoryStore()
  const provider = make_provider()
  await store.putMemoryNode({
    id: "m1",
    user_id: "u1",
    text: "I like pizza.",
    timestamp_ms: 1000,
    metadata: {},
    sectors: ["factual"],
  })
  await store.putMemoryNode({
    id: "m2",
    user_id: "u1",
    text: "I like pizza too.",
    timestamp_ms: 1100,
    metadata: {},
    sectors: ["factual"],
  })
  const node = await store.getMemoryNode("m2")
  assert.ok(node)
  const edges = await build_waypoint_edges(store, provider, node, {
    semantic_similarity_threshold: 0.8,
    entity_overlap_threshold: 0.9,
    temporal_window_ms: 0,
  })
  assert.equal(edges.length, 1)
  assert.equal(edges[0].relation, "semantic_neighbor")
})

test("unrelated memories do not form edges", async () => {
  const store = new MemoryStore()
  const provider = make_provider()
  await store.putMemoryNode({
    id: "m1",
    user_id: "u1",
    text: "I like pizza.",
    timestamp_ms: 1000,
    metadata: {},
    sectors: ["factual"],
  })
  await store.putMemoryNode({
    id: "m2",
    user_id: "u1",
    text: "I like celery.",
    timestamp_ms: 1100,
    metadata: {},
    sectors: ["emotional"],
  })
  const node = await store.getMemoryNode("m2")
  assert.ok(node)
  const edges = await build_waypoint_edges(store, provider, node, {
    semantic_similarity_threshold: 0.9,
    entity_overlap_threshold: 0.9,
    temporal_window_ms: 0,
  })
  assert.equal(edges.length, 0)
})

test("recent window respected", async () => {
  const store = new MemoryStore()
  const provider = make_provider()
  for (let i = 0; i < 30; i += 1) {
    await store.putMemoryNode({
      id: `m${i}`,
      user_id: "u1",
      text: `note ${i}`,
      timestamp_ms: i * 1000,
      metadata: {},
      sectors: ["factual"],
    })
  }
  const node = await store.getMemoryNode("m29")
  assert.ok(node)
  const edges = await build_waypoint_edges(store, provider, node, {
    recent_limit: 25,
    semantic_similarity_threshold: 2,
    entity_overlap_threshold: 2,
    temporal_window_ms: 0,
  })
  assert.equal(edges.length, 25)
  const ids = edges.map((edge) => edge.to_memory_node_id).sort()
  assert.ok(!ids.includes("m0"))
  assert.ok(!ids.includes("m1"))
  assert.ok(!ids.includes("m2"))
  assert.ok(!ids.includes("m3"))
  assert.ok(ids.includes("m4"))
})
