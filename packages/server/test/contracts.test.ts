import test from "node:test"
import assert from "node:assert/strict"
import { load_server_config } from "../src/config.ts"
import { create_ingest_route, parse_ingest_request } from "../src/routes/ingest.ts"
import { create_recall_route, parse_recall_request } from "../src/routes/recall.ts"
import { merge_config } from "../../core/src/config.ts"
import { FakeEmbeddingProvider } from "../../core/src/embed/fake.ts"
import { ingest } from "../../core/src/engine/ingest.ts"
import { recall } from "../../core/src/engine/recall.ts"
import { CountMinSketch } from "../../core/src/engine/sketch_engine.ts"
import { normalize } from "../../core/src/math/vec.ts"
import { MemoryStore } from "../../core/src/store/memory.ts"
import { ALL_SECTORS, type SectorId } from "../../core/src/types/sector.ts"

const USER_ID = "server-contract-user"

const build_basis_centroids = (dimensions: number): Record<SectorId, number[]> => {
  const out = {} as Record<SectorId, number[]>
  for (let i = 0; i < ALL_SECTORS.length; i += 1) {
    const vec = new Array<number>(dimensions).fill(0)
    vec[i % dimensions] = 1
    out[ALL_SECTORS[i]] = normalize(vec)
  }
  return out
}

test("schema validation for ingest and recall contracts", async () => {
  const ingest_req = parse_ingest_request({
    user_id: "u1",
    memory_text: "I deployed the server yesterday.",
    timestamp_ms: 123,
    metadata: { source: "unit-test" },
  })
  assert.equal(ingest_req.user_id, "u1")
  assert.equal(ingest_req.memory_text, "I deployed the server yesterday.")
  assert.deepEqual(ingest_req.metadata, { source: "unit-test" })

  assert.throws(
    () => parse_ingest_request({ user_id: "u1", memory_text: "", metadata: {} }),
    /memory_text/i,
  )
  assert.throws(
    () => parse_ingest_request({ user_id: "u1", memory_text: "ok", metadata: [] }),
    /metadata/i,
  )

  const store = new MemoryStore()
  const route = create_ingest_route({
    ingest: (input) => ingest(store, input, {
      provider: new FakeEmbeddingProvider(8, 1),
      centroids: build_basis_centroids(8),
      sketch: new CountMinSketch(3, 64),
      config: merge_config({ projection: { k: 8, seed: 5 } }),
    }),
  })
  const out = await route({ user_id: "u1", memory_text: "I usually code at night." })
  assert.ok(out)

  const recall_req = parse_recall_request({
    user_id: "u1",
    query: "what did i do?",
    mode: "fast",
    token_budget: 512,
  })
  assert.equal(recall_req.mode, "fast")
  assert.equal(recall_req.token_budget, 512)

  assert.throws(
    () => parse_recall_request({ user_id: "u1", query: "", mode: "fast" }),
    /query/i,
  )
  assert.throws(
    () => parse_recall_request({ user_id: "u1", query: "ok", mode: "turbo" }),
    /mode/i,
  )
})

test("recall route returns HMD response shape", async () => {
  const store = new MemoryStore()
  const provider = new FakeEmbeddingProvider(8, 17)
  const sketch = new CountMinSketch(3, 64)
  const config = merge_config({ projection: { k: 8, seed: 7 } })
  const centroids = build_basis_centroids(config.projection.k)
  const timestamp_ms = 1_700_000_123_000

  await ingest(
    store,
    {
      user_id: USER_ID,
      memory_text: "My name is Demon.",
      timestamp_ms,
    },
    { provider, centroids, sketch, config },
  )

  const route = create_recall_route({
    recall: async (input) =>
      recall(
        {
          user_id: input.user_id,
          query_text: input.query_text,
          limit: input.limit,
          timestamp_ms: timestamp_ms + 500,
        },
        { store, provider, config },
      ),
  })

  const response = await route({
    user_id: USER_ID,
    query: "what is my name?",
    mode: "fast",
    token_budget: 512,
  })

  assert.equal(response.mode, "fast")
  assert.equal(response.token_budget, 512)
  assert.equal(response.query, "what is my name?")
  assert.ok(Array.isArray(response.sectors_used))
  assert.ok(Array.isArray(response.memories))
  assert.ok(Array.isArray(response.active_beliefs))
  assert.ok(Array.isArray(response.waypoint_trace))
  assert.ok(response.memories.length <= 2, "token budget should bound recall output")

  const beliefs = response.active_beliefs as Array<{ source_memory_node_id: string }>
  assert.ok(beliefs.length >= 1)
  for (const belief of beliefs) {
    const node = await store.getMemoryNode(belief.source_memory_node_id)
    assert.ok(node)
  }
})

test("config fails clearly when provider=openai and OPENAI_API_KEY is missing", () => {
  assert.throws(
    () =>
      load_server_config({
        OPENMEMORY_EMBED_PROVIDER: "openai",
        OPENAI_EMBED_MODEL: "text-embedding-3-small",
        OPENMEMORY_STORE_PATH: ":memory:",
      }),
    /OPENAI_API_KEY/,
  )
})

