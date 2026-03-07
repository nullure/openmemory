import test from "node:test"
import assert from "node:assert/strict"
import { MemoryStore } from "../src/store/memory.ts"
import { CountMinSketch } from "../src/engine/sketch_engine.ts"
import { ingest } from "../src/engine/ingest.ts"
import { make_projection_matrix, project } from "../src/math/projection.ts"
import { merge_config } from "../src/config.ts"
import { FakeEmbeddingProvider } from "../src/embed/fake.ts"

test("temporal markers stored and episodic salience boosted", async () => {
  const store = new MemoryStore()
  const sketch = new CountMinSketch(3, 32)
  const provider = new FakeEmbeddingProvider(2, 1)
  const config = merge_config({
    projection: { k: 2, seed: 1 },
    novelty_thresholds_by_sector: { episodic: 0 },
  })
  const text = "I deployed the server yesterday."
  const vector = await provider.embed_text(text)
  const projection = make_projection_matrix(vector.length, config.projection.k, config.projection.seed)
  const projected = project(vector, projection)
  await ingest(store, {
    user_id: "user-1",
    memory_text: text,
    timestamp_ms: 0,
  }, {
    provider,
    centroids: { episodic: projected },
    sketch,
    config,
  })

  const nodes = await store.listMemoryNodes("user-1")
  assert.equal(nodes.length, 1)
  assert.ok((nodes[0].temporal_markers ?? []).includes("yesterday"))

  const anchors = await store.getAnchors("user-1", "episodic")
  assert.ok(anchors.length > 0)
  assert.ok(anchors[0].salience > 1)
})

