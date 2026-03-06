import test from "node:test"
import assert from "node:assert/strict"
import { MemoryStore } from "../src/store/memory.ts"
import type { Anchor } from "../src/types/anchor.ts"
import type { Belief } from "../src/types/belief.ts"
import type { SectorId } from "../src/types/sector.ts"
import type { WaypointEdge } from "../src/types/waypoint.ts"

const mk_anchor = (id: string, user_id: string, sector: SectorId): Anchor => ({
  id,
  user_id,
  sector,
  memory_node_id: "memory-1",
  embedding: [0.1, 0.2],
  weight: 1,
  salience: 1,
  created_at: 0,
  updated_at: 0,
  last_access_at: 0,
})

const mk_belief = (id: string, user_id: string, sector: SectorId): Belief => ({
  id,
  user_id,
  sector,
  embedding: [0.4],
  weight: 0.5,
  timestamps: {
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
  },
  valid_from: "2026-01-02T00:00:00Z",
  valid_to: null,
})

const mk_edge = (id: string, user_id: string, from_id: string, to_id: string): WaypointEdge => ({
  id,
  user_id,
  from_memory_node_id: from_id,
  to_memory_node_id: to_id,
  relation: "same_sector",
  weight: 0.7,
  created_at: 0,
})

test("putAnchor and getAnchors works", async () => {
  const store = new MemoryStore()
  const a1 = mk_anchor("a1", "u1", "factual")
  const a2 = mk_anchor("a2", "u1", "factual")
  await store.putAnchor(a1)
  await store.putAnchor(a2)
  const out = await store.getAnchors("u1", "factual")
  assert.equal(out.length, 2)
  assert.equal(out[0].id, "a1")
  out[0].weight = 99
  const again = await store.getAnchors("u1", "factual")
  assert.equal(again[0].weight, 1)
})

test("deleteAnchor removes anchor", async () => {
  const store = new MemoryStore()
  const a1 = mk_anchor("a1", "u1", "factual")
  const a2 = mk_anchor("a2", "u1", "factual")
  await store.putAnchor(a1)
  await store.putAnchor(a2)
  await store.deleteAnchor("a1")
  const out = await store.listAnchors("u1", "factual")
  assert.deepEqual(out.map((a) => a.id), ["a2"])
})

test("beliefs persist", async () => {
  const store = new MemoryStore()
  await store.putBelief(mk_belief("b1", "u1", "factual"))
  await store.putBelief(mk_belief("b2", "u1", "factual"))
  const out = await store.getBeliefs("u1")
  assert.equal(out.length, 2)
  out[0].weight = 2
  const again = await store.getBeliefs("u1")
  assert.equal(again[0].weight, 0.5)
})

test("memory nodes persist", async () => {
  const store = new MemoryStore()
  await store.putMemoryNode({
    id: "memory-1",
    user_id: "u1",
    text: "hello",
    timestamp_ms: 1000,
    metadata: { source: "test" },
    sectors: ["factual", "emotional"],
  })
  await store.putMemoryNode({
    id: "memory-2",
    user_id: "u1",
    text: "world",
    timestamp_ms: 2000,
    metadata: {},
    sectors: ["temporal"],
  })
  const node = await store.getMemoryNode("memory-1")
  assert.ok(node)
  assert.equal(node.text, "hello")
  const list = await store.listMemoryNodes("u1")
  assert.equal(list.length, 2)
  assert.equal(list[0].id, "memory-1")
})

test("waypoint edges insert and isolate by user", async () => {
  const store = new MemoryStore()
  await store.putWaypointEdge(mk_edge("e1", "u1", "m1", "m2"))
  await store.putWaypointEdge(mk_edge("e2", "u1", "m1", "m3"))
  await store.putWaypointEdge(mk_edge("e3", "u2", "m1", "m4"))
  const out = await store.listWaypointEdgesFrom("u1", "m1")
  assert.deepEqual(out.map((e) => e.id).sort(), ["e1", "e2"])
  const all = await store.listWaypointEdgesForUser("u1")
  assert.equal(all.length, 2)
})

test("waypoint relation validated", async () => {
  const store = new MemoryStore()
  await assert.rejects(() =>
    store.putWaypointEdge({
      id: "e1",
      user_id: "u1",
      from_memory_node_id: "m1",
      to_memory_node_id: "m2",
      relation: "bad" as unknown as WaypointEdge["relation"],
      weight: 0.4,
      created_at: 0,
    }),
  )
})
