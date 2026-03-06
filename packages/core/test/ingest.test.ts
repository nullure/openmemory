import test from "node:test"
import assert from "node:assert/strict"
import { MemoryStore } from "../src/store/memory.ts"
import { CountMinSketch } from "../src/engine/sketch_engine.ts"
import { ingest } from "../src/engine/ingest.ts"
import { make_projection_matrix, project } from "../src/math/projection.ts"
import { merge_config } from "../src/config.ts"
import { FakeEmbeddingProvider } from "../src/embed/fake.ts"

test("ingest returns update summary", async () => {
  const store = new MemoryStore()
  const sketch = new CountMinSketch(3, 32)
  const provider = new FakeEmbeddingProvider(2, 1)
  const config = merge_config({
    projection: { k: 2, seed: 1 },
    novelty_thresholds_by_sector: { factual: 1 },
  })
  const vector = await provider.embed_text("I like pizza.")
  const projection = make_projection_matrix(vector.length, config.projection.k, config.projection.seed)
  const projected = project(vector, projection)
  const summary = await ingest(
    store,
    "user-1",
    "I like pizza.",
    provider,
    { factual: projected },
    sketch,
    config,
    0,
  )
  assert.equal(summary.sector, "factual")
  assert.ok(summary.keys.includes("pizza"))
  assert.equal(summary.action, "update_sketches")
})

test("both sectors updated", async () => {
  const store = new MemoryStore()
  const sketch = new CountMinSketch(3, 32)
  const provider = new FakeEmbeddingProvider(2, 1)
  const config = merge_config({
    projection: { k: 2, seed: 1 },
    novelty_thresholds_by_sector: { factual: 1, emotional: 1 },
  })
  const vector = await provider.embed_text("I like pizza.")
  const projection = make_projection_matrix(vector.length, config.projection.k, config.projection.seed)
  const projected = project(vector, projection)
  await ingest(
    store,
    "user-1",
    "I like pizza.",
    provider,
    { factual: projected, emotional: projected },
    sketch,
    config,
    0,
  )
  const s1 = await store.getSectorState("user-1", "factual")
  const s2 = await store.getSectorState("user-1", "emotional")
  assert.ok(s1)
  assert.ok(s2)
})
