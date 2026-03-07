import test from "node:test"
import assert from "node:assert/strict"
import { insert_belief, get_active_beliefs, reinforce_belief } from "../src/engine/belief_engine.ts"
import { MemoryStore } from "../src/store/memory.ts"
import { default_config } from "../src/config.ts"
import type { Belief } from "../src/types/belief.ts"
import type { SectorId } from "../src/types/sector.ts"

const mk_belief = (id: string, user_id: string, sector: SectorId): Belief => ({
  id,
  user_id,
  sector,
  source_memory_node_id: `memory-${id}`,
  source_sector: sector,
  embedding: [0.3],
  weight: 1,
  timestamps: {
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  valid_from: "2026-01-01T00:00:00.000Z",
  valid_to: null,
})

test("active belief carries source linkage", async () => {
  const store = new MemoryStore()
  await insert_belief(store, mk_belief("b1", "u1", "semantic"), 0)
  const active = await get_active_beliefs(store, "u1", 0)
  assert.equal(active.length, 1)
  assert.equal(active[0].source_memory_node_id, "memory-b1")
  assert.equal(active[0].source_sector, "semantic")
})

test("conflicting belief closes prior one", async () => {
  const store = new MemoryStore()
  await insert_belief(store, mk_belief("b1", "u1", "semantic"), 0)
  await insert_belief(store, mk_belief("b2", "u1", "semantic"), 1000)
  const beliefs = await store.getBeliefs("u1")
  const first = beliefs.find((b) => b.id === "b1")
  const second = beliefs.find((b) => b.id === "b2")
  assert.ok(first)
  assert.ok(second)
  assert.equal(first.valid_to, "1970-01-01T00:00:01.000Z")
  assert.equal(second.valid_to, null)
})

test("expired beliefs not returned", async () => {
  const store = new MemoryStore()
  await store.putBelief({
    ...mk_belief("b1", "u1", "semantic"),
    valid_from: "1970-01-01T00:00:00.000Z",
    valid_to: "1970-01-01T00:00:01.000Z",
  })
  await store.putBelief({
    ...mk_belief("b2", "u1", "semantic"),
    valid_from: "1970-01-01T00:00:00.000Z",
    valid_to: null,
  })
  const active = await get_active_beliefs(store, "u1", 2000)
  assert.deepEqual(active.map((b) => b.id), ["b2"])
})

test("confidence decreases over time", async () => {
  const store = new MemoryStore()
  await store.putBelief({
    ...mk_belief("b1", "u1", "semantic"),
    weight: 1,
    valid_from: "1970-01-01T00:00:00.000Z",
    valid_to: null,
    timestamps: {
      created_at: "1970-01-01T00:00:00.000Z",
      updated_at: "1970-01-01T00:00:00.000Z",
    },
  })
  const cfg = { ...default_config, belief_decay_lambda: 1 }
  const early = await get_active_beliefs(store, "u1", 0, cfg)
  const later = await get_active_beliefs(store, "u1", 1000, cfg)
  assert.ok(later[0].weight < early[0].weight)
})

test("provenance preserved", async () => {
  const store = new MemoryStore()
  await insert_belief(store, mk_belief("b1", "u1", "semantic"), 0)
  await insert_belief(store, mk_belief("b2", "u1", "semantic"), 1000)
  const beliefs = await store.getBeliefs("u1")
  const byId = new Map(beliefs.map((b) => [b.id, b]))
  assert.equal(byId.get("b1")?.source_memory_node_id, "memory-b1")
  assert.equal(byId.get("b2")?.source_memory_node_id, "memory-b2")
  assert.equal(byId.get("b1")?.source_sector, "semantic")
  assert.equal(byId.get("b2")?.source_sector, "semantic")
})

test("repeated confirmation increases confidence", () => {
  const belief = { ...mk_belief("b1", "u1", "semantic"), weight: 0.4 }
  const once = reinforce_belief(belief, 0.2)
  const twice = reinforce_belief(once, 0.2)
  assert.ok(twice.weight > once.weight)
})

test("source-less beliefs are rejected", async () => {
  const store = new MemoryStore()
  await assert.rejects(() =>
    insert_belief(
      store,
      {
        ...mk_belief("b1", "u1", "semantic"),
        source_memory_node_id: "",
      },
      0,
    ),
  )
})
