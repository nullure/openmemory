import test from "node:test"
import assert from "node:assert/strict"
import { MemoryStore } from "../src/store/memory.ts"
import { CountMinSketch } from "../src/engine/sketch_engine.ts"
import { ingest } from "../src/engine/ingest.ts"
import { make_projection_matrix, project } from "../src/math/projection.ts"
import { merge_config } from "../src/config.ts"
import { FakeEmbeddingProvider } from "../src/embed/fake.ts"
import type { EmbeddingProvider } from "../src/embed/types.ts"
import type { SectorId } from "../src/types/sector.ts"

test("ingest with plain text works", async () => {
  const store = new MemoryStore()
  const sketch = new CountMinSketch(3, 32)
  const provider = new FakeEmbeddingProvider(2, 1)
  const config = merge_config({
    projection: { k: 2, seed: 1 },
    novelty_thresholds_by_sector: { semantic: 1 },
  })
  const vector = await provider.embed_text("I like pizza.")
  const projection = make_projection_matrix(vector.length, config.projection.k, config.projection.seed)
  const projected = project(vector, projection)
  const summary = await ingest(store, {
    user_id: "user-1",
    memory_text: "I like pizza.",
    timestamp_ms: 0,
  }, {
    provider,
    centroids: { semantic: projected },
    sketch,
    config,
  })
  assert.equal(summary.sector, "semantic")
  assert.ok(summary.keys.includes("pizza"))
  assert.equal(summary.action, "create_anchor")
  assert.equal(summary.context.memory_text, "I like pizza.")
})

test("provider is called", async () => {
  const store = new MemoryStore()
  const sketch = new CountMinSketch(3, 32)
  const base = new FakeEmbeddingProvider(2, 1)
  let calls = 0
  const provider: EmbeddingProvider = {
    embed_text: async (input, opts) => {
      calls += 1
      return base.embed_text(input, opts)
    },
    embed_texts: async (inputs, opts) => {
      calls += inputs.length
      return base.embed_texts(inputs, opts)
    },
    dimensions: () => base.dimensions(),
    name: () => base.name(),
  }
  const config = merge_config({
    projection: { k: 2, seed: 1 },
    novelty_thresholds_by_sector: { semantic: 1, emotional: 1 },
  })
  const vector = await base.embed_text("I like pizza.")
  const projection = make_projection_matrix(vector.length, config.projection.k, config.projection.seed)
  const projected = project(vector, projection)
  await ingest(store, {
    user_id: "user-1",
    memory_text: "I like pizza.",
    timestamp_ms: 0,
  }, {
    provider,
    centroids: { semantic: projected, emotional: projected },
    sketch,
    config,
  })
  assert.equal(calls, 3)
})

test("vectors stored per selected sector", async () => {
  const store = new MemoryStore()
  const sketch = new CountMinSketch(3, 32)
  const provider = new FakeEmbeddingProvider(2, 1)
  const config = merge_config({
    projection: { k: 2, seed: 1 },
    novelty_thresholds_by_sector: { semantic: 0, emotional: 0 },
  })
  const vector = await provider.embed_text("I like pizza.")
  const projection = make_projection_matrix(vector.length, config.projection.k, config.projection.seed)
  const projected = project(vector, projection)
  await ingest(store, {
    user_id: "user-1",
    memory_text: "I like pizza.",
    timestamp_ms: 0,
  }, {
    provider,
    centroids: { semantic: projected, emotional: projected },
    sketch,
    config,
  })
  const a1 = await store.getAnchors("user-1", "semantic")
  const a2 = await store.getAnchors("user-1", "emotional")
  assert.ok(a1.length > 0)
  assert.ok(a2.length > 0)
  assert.notDeepEqual(a1[0].embedding, a2[0].embedding)
  assert.equal(a1[0].memory_node_id, a2[0].memory_node_id)
  const nodes = await store.listMemoryNodes("user-1")
  assert.equal(nodes.length, 1)
  assert.deepEqual(nodes[0].sectors.sort(), ["emotional", "semantic"])
})

test("provider called once per selected sector", async () => {
  const store = new MemoryStore()
  const sketch = new CountMinSketch(3, 32)
  const base = new FakeEmbeddingProvider(2, 1)
  const sector_calls: Array<SectorId> = []
  const provider: EmbeddingProvider = {
    embed_text: async (input, opts) => {
      if (opts?.sector) sector_calls.push(opts.sector)
      return base.embed_text(input, opts)
    },
    embed_texts: async (inputs, opts) => base.embed_texts(inputs, opts),
    dimensions: () => base.dimensions(),
    name: () => base.name(),
  }
  const config = merge_config({
    projection: { k: 2, seed: 1 },
    novelty_thresholds_by_sector: { semantic: 0, emotional: 0 },
  })
  const vector = await base.embed_text("I like pizza.")
  const projection = make_projection_matrix(vector.length, config.projection.k, config.projection.seed)
  const projected = project(vector, projection)
  const summary = await ingest(store, {
    user_id: "user-1",
    memory_text: "I like pizza.",
    timestamp_ms: 0,
  }, {
    provider,
    centroids: { semantic: projected, emotional: projected },
    sketch,
    config,
  })
  assert.equal(sector_calls.length, 2)
  assert.deepEqual(sector_calls.sort(), ["emotional", "semantic"])
  assert.equal(Object.keys(summary.embeddings_by_sector).length, 2)
})
