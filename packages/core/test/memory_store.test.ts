import test from "node:test"
import assert from "node:assert/strict"
import { MemoryStore } from "../src/store/memory.ts"
import type { Anchor } from "../src/types/anchor.ts"
import type { Belief } from "../src/types/belief.ts"
import type { SectorId } from "../src/types/sector.ts"

const mk_anchor = (id: string, user_id: string, sector: SectorId): Anchor => ({
  id,
  user_id,
  sector,
  embedding: [0.1, 0.2],
  weight: 1,
  timestamps: {
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  valid_from: "2026-01-01T00:00:00Z",
  valid_to: null,
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
