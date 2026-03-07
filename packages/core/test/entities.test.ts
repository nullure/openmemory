import test from "node:test"
import assert from "node:assert/strict"
import { classify_memory } from "../src/classifier/rule_based.ts"
import { extract_entities } from "../src/engine/entities.ts"
import { MemoryStore } from "../src/store/memory.ts"
import { CountMinSketch } from "../src/engine/sketch_engine.ts"
import { ingest } from "../src/engine/ingest.ts"
import { make_projection_matrix, project } from "../src/math/projection.ts"
import { merge_config } from "../src/config.ts"
import { FakeEmbeddingProvider } from "../src/embed/fake.ts"

test("normalization consistent", () => {
  const text = "Met Alex with @Alex on #Launch at OPENMEMORY and OpenMemory."
  const entities = extract_entities(text)
  assert.ok(entities.includes("@alex"))
  assert.ok(entities.includes("#launch"))
  assert.ok(entities.includes("openmemory"))
  assert.ok(entities.includes("alex"))
  assert.equal(new Set(entities).size, entities.length)
  for (const entity of entities) assert.equal(entity, entity.toLowerCase())
})

test("relational sector benefits from entity-rich memories", () => {
  const out = classify_memory("Met Alex with Priya on OpenMemory with @team #launch")
  assert.equal(out[0].sector, "reflective")
})

test("relational salience increases for entity-rich reflective memory", async () => {
  const store = new MemoryStore()
  const sketch = new CountMinSketch(3, 32)
  const provider = new FakeEmbeddingProvider(2, 1)
  const config = merge_config({
    projection: { k: 2, seed: 1 },
    novelty_thresholds_by_sector: { reflective: 0 },
  })
  const text = "Met Alex with Priya at OpenMemory #launch @team"
  const vector = await provider.embed_text(text)
  const projection = make_projection_matrix(vector.length, config.projection.k, config.projection.seed)
  const projected = project(vector, projection)
  await ingest(store, {
    user_id: "u1",
    memory_text: text,
    timestamp_ms: 0,
  }, {
    provider,
    centroids: { reflective: projected },
    sketch,
    config,
  })
  const anchors = await store.getAnchors("u1", "reflective")
  assert.ok(anchors.length > 0)
  assert.ok(anchors[0].salience > 1)
})
