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
  opts?: { weight?: number; salience?: number },
): Promise<void> => {
  await store.putAnchor({
    id,
    memory_node_id,
    user_id: "user-1",
    sector,
    embedding,
    weight: opts?.weight ?? 1,
    salience: opts?.salience ?? 1,
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

test("waypoint bonus can rescue slightly weaker but connected memories", async () => {
  const store = new MemoryStore()
  const provider: EmbeddingProvider = {
    embed_text: async () => [1, 0],
    embed_texts: async (inputs) => inputs.map(() => [1, 0]),
    dimensions: () => 2,
    name: () => "mock",
  }
  await store.putMemoryNode({
    id: "memory-strong",
    user_id: "user-1",
    text: "strong",
    timestamp_ms: now_ms,
    metadata: {},
    sectors: ["semantic"],
  })
  await store.putMemoryNode({
    id: "memory-weak",
    user_id: "user-1",
    text: "weak",
    timestamp_ms: now_ms,
    metadata: {},
    sectors: ["semantic"],
  })
  await put_anchor(store, "strong", "memory-strong", "semantic", [1, 0], { weight: 1, salience: 1 })
  await put_anchor(store, "weak", "memory-weak", "semantic", [0.9, 0.1], { weight: 1, salience: 1 })

  const out = await recall(
    { user_id: "user-1", query_text: "my name is demon", timestamp_ms: now_ms },
    {
      store,
      provider,
      expand_waypoints: (memory_node_id: string) =>
        memory_node_id === "memory-strong" ? [{ memory_node_id: "memory-weak", edge_weight: 1 }] : [],
    },
  )

  assert.equal(out.candidates[0].anchor.id, "weak")
  assert.equal(out.candidates[0].waypoint_bonus, 1)
})

test("deterministic ordering for equal final scores", async () => {
  const store = new MemoryStore()
  const provider: EmbeddingProvider = {
    embed_text: async () => [1, 0],
    embed_texts: async (inputs) => inputs.map(() => [1, 0]),
    dimensions: () => 2,
    name: () => "mock",
  }
  await store.putMemoryNode({
    id: "memory-a",
    user_id: "user-1",
    text: "a",
    timestamp_ms: now_ms,
    metadata: {},
    sectors: ["semantic"],
  })
  await store.putMemoryNode({
    id: "memory-b",
    user_id: "user-1",
    text: "b",
    timestamp_ms: now_ms,
    metadata: {},
    sectors: ["semantic"],
  })
  await put_anchor(store, "a-2", "memory-a", "semantic", [1, 0], { weight: 1, salience: 1 })
  await put_anchor(store, "a-1", "memory-b", "semantic", [1, 0], { weight: 1, salience: 1 })

  const out = await recall(
    { user_id: "user-1", query_text: "my name is demon", timestamp_ms: now_ms },
    { store, provider },
  )

  assert.equal(out.candidates[0].anchor.id, "a-1")
  assert.equal(out.candidates[1].anchor.id, "a-2")
})

test("recall returns active beliefs with source node ids", async () => {
  const store = new MemoryStore()
  const provider: EmbeddingProvider = {
    embed_text: async () => [1, 0],
    embed_texts: async (inputs) => inputs.map(() => [1, 0]),
    dimensions: () => 2,
    name: () => "mock",
  }
  await store.putMemoryNode({
    id: "memory-1",
    user_id: "user-1",
    text: "my name is demon",
    timestamp_ms: now_ms,
    metadata: {},
    sectors: ["semantic"],
  })
  await put_anchor(store, "a1", "memory-1", "semantic", [1, 0])
  await store.putBelief({
    id: "b1",
    user_id: "user-1",
    sector: "semantic",
    source_memory_node_id: "memory-1",
    source_sector: "semantic",
    embedding: [1, 0],
    weight: 1,
    timestamps: {
      created_at: "1970-01-01T00:00:00.000Z",
      updated_at: "1970-01-01T00:00:00.000Z",
    },
    valid_from: "1970-01-01T00:00:00.000Z",
    valid_to: null,
  })

  const out = await recall(
    { user_id: "user-1", query_text: "my name is demon", timestamp_ms: now_ms },
    { store, provider },
  )

  assert.equal(out.active_beliefs.length, 1)
  assert.equal(out.active_beliefs[0].source_memory_node_id, "memory-1")
  assert.equal(out.active_beliefs[0].source_sector, "semantic")
})

test("recall on time-oriented query surfaces temporal memories better", async () => {
  const store = new MemoryStore()
  const provider: EmbeddingProvider = {
    embed_text: async (_input, opts) => (opts?.sector === "episodic" ? [1, 0] : [0, 1]),
    embed_texts: async (inputs, opts) =>
      inputs.map((_input) => (opts?.sector === "episodic" ? [1, 0] : [0, 1])),
    dimensions: () => 2,
    name: () => "mock",
  }
  await store.putMemoryNode({
    id: "memory-temporal",
    user_id: "user-1",
    text: "I deployed yesterday.",
    timestamp_ms: now_ms,
    metadata: {},
    sectors: ["episodic"],
    temporal_markers: ["yesterday"],
  })
  await store.putMemoryNode({
    id: "memory-general",
    user_id: "user-1",
    text: "I like tea.",
    timestamp_ms: now_ms,
    metadata: {},
    sectors: ["semantic"],
    temporal_markers: [],
  })
  await put_anchor(store, "z-temporal", "memory-temporal", "episodic", [1, 0], {
    weight: 1,
    salience: 1.8,
  })
  await put_anchor(store, "a-semantic", "memory-general", "semantic", [0, 1], {
    weight: 1,
    salience: 1,
  })

  const out = await recall(
    { user_id: "user-1", query_text: "what did i do yesterday?", timestamp_ms: now_ms },
    { store, provider },
  )

  assert.equal(out.candidates[0].anchor.id, "z-temporal")
})

test("hmd context packet includes sectors_used, traces, and separate active beliefs", async () => {
  const store = new MemoryStore()
  const provider: EmbeddingProvider = {
    embed_text: async () => [1, 0],
    embed_texts: async (inputs) => inputs.map(() => [1, 0]),
    dimensions: () => 2,
    name: () => "mock",
  }
  await store.putMemoryNode({
    id: "memory-seed",
    user_id: "user-1",
    text: "I deployed a service.",
    timestamp_ms: now_ms,
    metadata: {},
    sectors: ["semantic"],
  })
  await store.putMemoryNode({
    id: "memory-target",
    user_id: "user-1",
    text: "My name is Demon.",
    timestamp_ms: now_ms,
    metadata: {},
    sectors: ["semantic"],
  })
  await put_anchor(store, "seed-anchor", "memory-seed", "semantic", [1, 0], { weight: 1, salience: 1 })
  await put_anchor(store, "target-anchor", "memory-target", "semantic", [0.95, 0.05], { weight: 1, salience: 1 })
  await store.putBelief({
    id: "b-hmd",
    user_id: "user-1",
    sector: "semantic",
    source_memory_node_id: "memory-target",
    source_sector: "semantic",
    embedding: [1, 0],
    weight: 1,
    timestamps: {
      created_at: "1970-01-01T00:00:00.000Z",
      updated_at: "1970-01-01T00:00:00.000Z",
    },
    valid_from: "1970-01-01T00:00:00.000Z",
    valid_to: null,
  })

  const out = await recall(
    { user_id: "user-1", query_text: "what is my name?", timestamp_ms: now_ms },
    {
      store,
      provider,
      expand_waypoints: (memory_node_id: string) =>
        memory_node_id === "memory-seed"
          ? [{ memory_node_id: "memory-target", edge_weight: 0.8, relation: "shared_entity" }]
          : [],
    },
  )

  assert.equal(out.query, "what is my name?")
  assert.ok(out.sectors_used.length > 0)
  assert.equal(typeof out.sectors_used[0].score, "number")
  assert.ok(out.memories.length > 0)
  const target = out.memories.find((m) => m.memory_node_id === "memory-target")
  assert.ok(target)
  assert.ok(target.trace.some((trace) => trace.source === "waypoint"))
  assert.ok(
    target.trace.some((trace) =>
      trace.source === "waypoint" &&
      trace.via_memory_node_id === "memory-seed" &&
      trace.waypoint_relation === "shared_entity",
    ),
  )
  assert.equal(out.active_beliefs.length, 1)
  assert.equal(out.active_beliefs[0].source_memory_node_id, "memory-target")
  assert.ok(out.waypoint_trace.some((trace) =>
    trace.from_memory_node_id === "memory-seed" &&
    trace.to_memory_node_id === "memory-target" &&
    trace.relation === "shared_entity",
  ))
})

test("deep returns richer context packet while staying bounded by token budget", async () => {
  const store = new MemoryStore()
  const provider: EmbeddingProvider = {
    embed_text: async () => [1, 0],
    embed_texts: async (inputs) => inputs.map(() => [1, 0]),
    dimensions: () => 2,
    name: () => "mock",
  }

  const neighbor_for = (memory_node_id: string): Array<{ memory_node_id: string; edge_weight: number; relation: string }> => {
    const idx = Number(memory_node_id.split("-")[1] ?? "-1")
    if (!Number.isFinite(idx) || idx < 1 || idx >= 7) return []
    return [{ memory_node_id: `memory-${idx + 1}`, edge_weight: 0.9, relation: "semantic_neighbor" }]
  }

  for (let i = 1; i <= 7; i += 1) {
    const memory_id = `memory-${i}`
    await store.putMemoryNode({
      id: memory_id,
      user_id: "user-1",
      text: `memory ${i}`,
      timestamp_ms: now_ms,
      metadata: {},
      sectors: ["semantic"],
    })
    await put_anchor(store, `anchor-${i}`, memory_id, "semantic", [1, 0], { weight: 1, salience: 1 })
  }
  await store.putBelief({
    id: "b-deep",
    user_id: "user-1",
    sector: "semantic",
    source_memory_node_id: "memory-1",
    source_sector: "semantic",
    embedding: [1, 0],
    weight: 1,
    timestamps: {
      created_at: "1970-01-01T00:00:00.000Z",
      updated_at: "1970-01-01T00:00:00.000Z",
    },
    valid_from: "1970-01-01T00:00:00.000Z",
    valid_to: null,
  })

  const fast = await recall(
    {
      user_id: "user-1",
      query_text: "my name is demon",
      timestamp_ms: now_ms,
      mode: "fast",
      token_budget: 1024,
    },
    { store, provider, expand_waypoints: neighbor_for },
  )
  const deep = await recall(
    {
      user_id: "user-1",
      query_text: "my name is demon",
      timestamp_ms: now_ms,
      mode: "deep",
      token_budget: 1024,
    },
    { store, provider, expand_waypoints: neighbor_for },
  )

  assert.equal(fast.mode, "fast")
  assert.equal(deep.mode, "deep")
  assert.equal(fast.token_budget, 1024)
  assert.equal(deep.token_budget, 1024)
  assert.ok(fast.memories.length <= 4)
  assert.ok(deep.memories.length <= 4)
  const fast_trace_total = fast.memories.reduce((acc, memory) => acc + memory.trace.length, 0)
  const deep_trace_total = deep.memories.reduce((acc, memory) => acc + memory.trace.length, 0)
  assert.ok(deep.waypoint_trace.length > fast.waypoint_trace.length)
  assert.ok(deep_trace_total > fast_trace_total)
  assert.equal(fast.active_beliefs.length, 1)
  assert.equal(deep.active_beliefs.length, 1)
})

test("fast mode stays smaller and uses fewer expansion calls than deep", async () => {
  const store = new MemoryStore()
  const provider: EmbeddingProvider = {
    embed_text: async () => [1, 0],
    embed_texts: async (inputs) => inputs.map(() => [1, 0]),
    dimensions: () => 2,
    name: () => "mock",
  }

  for (let i = 1; i <= 8; i += 1) {
    const memory_id = `memory-${i}`
    await store.putMemoryNode({
      id: memory_id,
      user_id: "user-1",
      text: `memory ${i}`,
      timestamp_ms: now_ms,
      metadata: {},
      sectors: ["semantic"],
    })
    await put_anchor(store, `anchor-fast-${i}`, memory_id, "semantic", [1, 0], { weight: 1, salience: 1 })
  }

  let fast_expand_calls = 0
  let deep_expand_calls = 0
  const chain_neighbors = (memory_node_id: string): Array<{ memory_node_id: string; edge_weight: number; relation: string }> => {
    const idx = Number(memory_node_id.split("-")[1] ?? "-1")
    if (!Number.isFinite(idx) || idx < 1 || idx >= 8) return []
    return [{ memory_node_id: `memory-${idx + 1}`, edge_weight: 0.7, relation: "semantic_neighbor" }]
  }

  const fast = await recall(
    {
      user_id: "user-1",
      query_text: "my name is demon",
      timestamp_ms: now_ms,
      mode: "fast",
      token_budget: 512,
    },
    {
      store,
      provider,
      expand_waypoints: (memory_node_id: string) => {
        fast_expand_calls += 1
        return chain_neighbors(memory_node_id)
      },
    },
  )
  const deep = await recall(
    {
      user_id: "user-1",
      query_text: "my name is demon",
      timestamp_ms: now_ms,
      mode: "deep",
      token_budget: 512,
    },
    {
      store,
      provider,
      expand_waypoints: (memory_node_id: string) => {
        deep_expand_calls += 1
        return chain_neighbors(memory_node_id)
      },
    },
  )

  assert.ok(fast.memories.length <= 2)
  assert.ok(deep.memories.length <= 2)
  assert.ok(fast.waypoint_trace.length < deep.waypoint_trace.length)
  assert.ok(fast_expand_calls < deep_expand_calls)
})
