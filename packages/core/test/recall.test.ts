import test from "node:test"
import assert from "node:assert/strict"
import { MemoryStore } from "../src/store/memory.ts"
import { recall } from "../src/engine/recall.ts"
import { FakeEmbeddingProvider } from "../src/embed/fake.ts"
import type { EmbeddingProvider } from "../src/embed/types.ts"
import type { SectorId } from "../src/types/sector.ts"

const now_ms = 1000

const put_anchor = async (
  store: MemoryStore,
  id: string,
  memory_node_id: string,
  sector: SectorId,
  embedding: number[],
): Promise<void> => {
  await store.putAnchor({
    id,
    memory_node_id,
    user_id: "user-1",
    sector,
    embedding,
    weight: 1,
    salience: 1,
    created_at: now_ms,
    updated_at: now_ms,
    last_access_at: now_ms,
  })
}

test("provider called once per selected sector", async () => {
  const store = new MemoryStore()
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
  const query = "i was sad yesterday"
  const emb_emotional = await base.embed_text(query, { sector: "emotional" })
  const emb_episodic = await base.embed_text(query, { sector: "episodic" })
  await store.putMemoryNode({
    id: "memory-1",
    user_id: "user-1",
    text: "sad yesterday",
    timestamp_ms: now_ms,
    metadata: {},
    sectors: ["emotional", "episodic"],
  })
  await put_anchor(store, "a1", "memory-1", "emotional", emb_emotional)
  await put_anchor(store, "a2", "memory-1", "episodic", emb_episodic)
  await recall(
    { user_id: "user-1", query_text: query, timestamp_ms: now_ms },
    { store, provider },
  )
  assert.equal(sector_calls.length, 2)
  assert.deepEqual(sector_calls.sort(), ["emotional", "episodic"])
})

test("sector-specific query embeddings drive ordering", async () => {
  const store = new MemoryStore()
  const provider: EmbeddingProvider = {
    embed_text: async (_input, opts) => (opts?.sector === "emotional" ? [1, 0] : [0, 1]),
    embed_texts: async (inputs, opts) =>
      inputs.map((_input) => (opts?.sector === "emotional" ? [1, 0] : [0, 1])),
    dimensions: () => 2,
    name: () => "mock",
  }
  await store.putMemoryNode({
    id: "memory-1",
    user_id: "user-1",
    text: "sad yesterday",
    timestamp_ms: now_ms,
    metadata: {},
    sectors: ["emotional", "episodic"],
  })
  await put_anchor(store, "match-emotional", "memory-1", "emotional", [1, 0])
  await put_anchor(store, "mismatch-emotional", "memory-1", "emotional", [0, 1])
  await put_anchor(store, "match-episodic", "memory-1", "episodic", [0, 1])
  const out = await recall(
    { user_id: "user-1", query_text: "i was sad yesterday", timestamp_ms: now_ms },
    { store, provider },
  )
  assert.equal(out.candidates[0].anchor.id, "match-emotional")
  assert.equal(out.candidates[1].anchor.id, "match-episodic")
})
