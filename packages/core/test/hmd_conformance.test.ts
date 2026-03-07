import test from "node:test"
import assert from "node:assert/strict"
import { classify_memory } from "../src/classifier/rule_based.ts"
import { merge_config } from "../src/config.ts"
import { FakeEmbeddingProvider } from "../src/embed/fake.ts"
import { OpenAIEmbeddingProvider } from "../src/embed/openai.ts"
import { CountMinSketch } from "../src/engine/sketch_engine.ts"
import { ingest } from "../src/engine/ingest.ts"
import { recall } from "../src/engine/recall.ts"
import { build_waypoint_edges } from "../src/engine/waypoint_builder.ts"
import { normalize } from "../src/math/vec.ts"
import { MemoryStore } from "../src/store/memory.ts"
import { ALL_SECTORS, type SectorId } from "../src/types/sector.ts"
import type { MemoryNode } from "../src/types/memory_node.ts"

const USER_ID = "hmd-conformance-user"

const list_all_anchors = async (store: MemoryStore, user_id: string) => {
  const groups = await Promise.all(ALL_SECTORS.map((sector) => store.listAnchors(user_id, sector)))
  return groups.flat()
}

const build_basis_centroids = (dimensions: number): Record<SectorId, number[]> => {
  const out = {} as Record<SectorId, number[]>
  for (let i = 0; i < ALL_SECTORS.length; i += 1) {
    const vec = new Array<number>(dimensions).fill(0)
    vec[i % dimensions] = 1
    out[ALL_SECTORS[i]] = normalize(vec)
  }
  return out
}

const put_memory_and_anchor = async (
  store: MemoryStore,
  node: MemoryNode,
  anchor: {
    id: string
    sector: SectorId
    embedding: number[]
    timestamp_ms: number
    salience?: number
    weight?: number
  },
) => {
  await store.putMemoryNode(node)
  await store.putAnchor({
    id: anchor.id,
    memory_node_id: node.id,
    user_id: node.user_id,
    sector: anchor.sector,
    embedding: anchor.embedding.slice(),
    weight: anchor.weight ?? 1,
    salience: anchor.salience ?? 1,
    created_at: anchor.timestamp_ms,
    updated_at: anchor.timestamp_ms,
    last_access_at: anchor.timestamp_ms,
  })
}

test("conformance: one text routes to top-2 sectors deterministically", () => {
  const predictions = classify_memory("I usually code at night and deployed yesterday.")
  assert.equal(predictions.length, 2)
  assert.ok(predictions[0].score >= predictions[1].score)
  const prob_sum = predictions[0].prob + predictions[1].prob
  assert.ok(Math.abs(prob_sum - 1) < 1e-9)
})

test("conformance: one memory node produces 2 sector anchors", async () => {
  const store = new MemoryStore()
  const provider = new FakeEmbeddingProvider(8, 31)
  const sketch = new CountMinSketch(3, 64)
  const config = merge_config({ projection: { k: 8, seed: 13 } })
  const centroids = build_basis_centroids(config.projection.k)

  await ingest(
    store,
    {
      user_id: USER_ID,
      memory_text: "I usually code at night.",
      timestamp_ms: 1_700_000_000_000,
    },
    { provider, centroids, sketch, config },
  )

  const nodes = await store.listMemoryNodes(USER_ID)
  assert.equal(nodes.length, 1)
  const anchors = await list_all_anchors(store, USER_ID)
  const linked = anchors.filter((anchor) => anchor.memory_node_id === nodes[0].id)
  assert.equal(linked.length, 2)
  assert.equal(new Set(linked.map((anchor) => anchor.sector)).size, 2)
})

test("conformance: waypoint edges are created for related memories", async () => {
  const store = new MemoryStore()
  const provider = new FakeEmbeddingProvider(8, 19)
  const sketch = new CountMinSketch(3, 64)
  const config = merge_config({ projection: { k: 8, seed: 5 } })
  const centroids = build_basis_centroids(config.projection.k)

  await ingest(
    store,
    {
      user_id: USER_ID,
      memory_text: "I deployed the server yesterday.",
      timestamp_ms: 1_700_000_000_100,
    },
    { provider, centroids, sketch, config },
  )
  await ingest(
    store,
    {
      user_id: USER_ID,
      memory_text: "The server crashed today.",
      timestamp_ms: 1_700_000_000_200,
    },
    { provider, centroids, sketch, config },
  )

  const nodes = await store.listMemoryNodes(USER_ID)
  const latest = nodes[nodes.length - 1]
  const edges = await build_waypoint_edges(store, provider, latest)
  assert.ok(edges.length >= 1)
  assert.equal(edges[0].from_memory_node_id, latest.id)

  const stored = await store.listWaypointEdgesFrom(USER_ID, latest.id)
  assert.equal(stored.length, edges.length)
})

test("conformance: recall includes waypoint traces", async () => {
  const store = new MemoryStore()
  const provider = new FakeEmbeddingProvider(8, 41)
  const config = merge_config({ projection: { k: 8, seed: 3 } })
  const query = "what mountain is tallest?"
  const query_embedding = await provider.embed_text(query, { sector: "semantic" })

  await put_memory_and_anchor(
    store,
    {
      id: "memory-everest",
      user_id: USER_ID,
      text: "Mount Everest is the tallest mountain.",
      timestamp_ms: 1_700_000_001_000,
      metadata: {},
      sectors: ["semantic"],
    },
    {
      id: "anchor-everest",
      sector: "semantic",
      embedding: query_embedding,
      timestamp_ms: 1_700_000_001_000,
    },
  )
  await put_memory_and_anchor(
    store,
    {
      id: "memory-hiking",
      user_id: USER_ID,
      text: "I climbed a mountain trail last week.",
      timestamp_ms: 1_700_000_001_100,
      metadata: {},
      sectors: ["semantic"],
    },
    {
      id: "anchor-hiking",
      sector: "semantic",
      embedding: query_embedding,
      timestamp_ms: 1_700_000_001_100,
      weight: 0.8,
    },
  )

  const out = await recall(
    {
      user_id: USER_ID,
      query_text: query,
      timestamp_ms: 1_700_000_001_200,
      limit: 5,
    },
    {
      store,
      provider,
      config,
      expand_waypoints: (memory_node_id: string) =>
        memory_node_id === "memory-everest"
          ? [{ memory_node_id: "memory-hiking", edge_weight: 0.8, relation: "semantic_neighbor" }]
          : [],
    },
  )

  assert.ok(out.waypoint_trace.length >= 1)
  const hiking = out.memories.find((memory) => memory.memory_node_id === "memory-hiking")
  assert.ok(hiking)
  assert.ok(hiking.trace.some((trace) => trace.source === "waypoint"))
})

test("conformance: active beliefs link back to source memory nodes", async () => {
  const store = new MemoryStore()
  const provider = new FakeEmbeddingProvider(8, 53)
  const sketch = new CountMinSketch(3, 64)
  const config = merge_config({ projection: { k: 8, seed: 7 } })
  const centroids = build_basis_centroids(config.projection.k)
  const timestamp_ms = 1_700_000_002_000

  await ingest(
    store,
    {
      user_id: USER_ID,
      memory_text: "My name is Demon.",
      timestamp_ms,
    },
    { provider, centroids, sketch, config },
  )

  const nodes = await store.listMemoryNodes(USER_ID)
  assert.equal(nodes.length, 1)

  const out = await recall(
    {
      user_id: USER_ID,
      query_text: "what is my name?",
      timestamp_ms: timestamp_ms + 1,
      limit: 3,
    },
    { store, provider, config },
  )

  assert.ok(out.active_beliefs.length >= 1)
  for (const belief of out.active_beliefs) {
    assert.equal(belief.source_memory_node_id, nodes[0].id)
    const source = await store.getMemoryNode(belief.source_memory_node_id)
    assert.ok(source)
  }
})

test("conformance: bounded recall output respects token budget limit", async () => {
  const store = new MemoryStore()
  const provider = new FakeEmbeddingProvider(8, 67)
  const config = merge_config({ projection: { k: 8, seed: 17 } })
  const query = "what mountain is tallest?"
  const embedding = await provider.embed_text(query, { sector: "semantic" })

  for (let i = 0; i < 5; i += 1) {
    await put_memory_and_anchor(
      store,
      {
        id: `memory-${i}`,
        user_id: USER_ID,
        text: `Mountain fact ${i}`,
        timestamp_ms: 1_700_000_003_000 + i,
        metadata: {},
        sectors: ["semantic"],
      },
      {
        id: `anchor-${i}`,
        sector: "semantic",
        embedding,
        timestamp_ms: 1_700_000_003_000 + i,
      },
    )
  }

  const out = await recall(
    {
      user_id: USER_ID,
      query_text: query,
      timestamp_ms: 1_700_000_003_999,
      limit: 2,
    },
    { store, provider, config },
  )

  assert.equal(out.memories.length, 2)
  assert.equal(out.candidates.length, 2)
})

test("conformance: real embedding provider can be mocked cleanly", async () => {
  const calls: Array<{ input: string | string[]; model: string }> = []
  const deterministic_vector = (input: string): number[] => {
    let sum = 0
    for (let i = 0; i < input.length; i += 1) sum += input.charCodeAt(i)
    return [sum % 17 + 1, sum % 13 + 1, sum % 11 + 1]
  }
  const provider = new OpenAIEmbeddingProvider({
    apiKey: "test-key",
    model: "text-embedding-3-small",
    dimensions: 3,
    client: {
      embeddings: {
        create: async (params) => {
          calls.push({ input: params.input, model: params.model })
          const inputs = Array.isArray(params.input) ? params.input : [params.input]
          return {
            data: inputs.map((value, index) => ({
              index,
              embedding: deterministic_vector(value),
            })),
          }
        },
      },
    },
  })

  const store = new MemoryStore()
  const sketch = new CountMinSketch(3, 64)
  const config = merge_config({ projection: { k: 3, seed: 23 } })
  const centroids = build_basis_centroids(config.projection.k)

  await ingest(
    store,
    {
      user_id: USER_ID,
      memory_text: "My name is Mock Demon.",
      timestamp_ms: 1_700_000_004_000,
    },
    { provider, centroids, sketch, config },
  )

  const out = await recall(
    {
      user_id: USER_ID,
      query_text: "what is my name?",
      timestamp_ms: 1_700_000_004_500,
      limit: 2,
    },
    { store, provider, config },
  )

  assert.ok(out.memories.length >= 1)
  assert.ok(calls.length > 0)
  assert.ok(calls.every((call) => call.model === "text-embedding-3-small"))
  const saw_sector_prefix = calls.some((call) => {
    const payload = Array.isArray(call.input) ? call.input : [call.input]
    return payload.some((value) => value.startsWith("sector:"))
  })
  assert.ok(saw_sector_prefix)
})

