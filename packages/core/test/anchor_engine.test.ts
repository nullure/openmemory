import test from "node:test"
import assert from "node:assert/strict"
import { insert_anchor, reinforce_anchor, get_anchors, find_similar_anchors } from "../src/engine/anchor_engine.ts"
import { MemoryStore } from "../src/store/memory.ts"
import { merge_config } from "../src/config.ts"
import type { Anchor } from "../src/types/anchor.ts"
import type { SectorId } from "../src/types/sector.ts"

const mk_anchor = (id: string, user_id: string, sector: SectorId, weight: number): Anchor => ({
  id,
  user_id,
  sector,
  memory_node_id: "memory-1",
  embedding: [0.1],
  weight,
  salience: 1,
  created_at: 0,
  updated_at: 0,
  last_access_at: 0,
})

test("insert until limit", async () => {
  const store = new MemoryStore()
  const config = merge_config({ anchor_limit: 2, decay_lambdas_by_sector: { semantic: 0 } })
  await insert_anchor(store, mk_anchor("a1", "u1", "semantic", 0.4), config, 0)
  const out = await insert_anchor(store, mk_anchor("a2", "u1", "semantic", 0.6), config, 0)
  assert.equal(out.length, 2)
})

test("next insert evicts smallest weight", async () => {
  const store = new MemoryStore()
  const config = merge_config({ anchor_limit: 2, decay_lambdas_by_sector: { semantic: 0 } })
  await insert_anchor(store, mk_anchor("a1", "u1", "semantic", 0.2), config, 0)
  await insert_anchor(store, mk_anchor("a2", "u1", "semantic", 0.9), config, 0)
  const out = await insert_anchor(store, mk_anchor("a3", "u1", "semantic", 0.5), config, 0)
  const ids = out.map((a) => a.id).sort()
  assert.deepEqual(ids, ["a2", "a3"])
})

test("reinforcement increases score", () => {
  const anchor = mk_anchor("a1", "u1", "semantic", 0.4)
  const updated = reinforce_anchor(anchor, 0.3)
  assert.ok(updated.weight > anchor.weight)
})

test("reinforcement updates timestamp", () => {
  const prev = Date.now
  Date.now = () => 1735689600000
  try {
    const anchor = mk_anchor("a1", "u1", "semantic", 0.4)
    const updated = reinforce_anchor(anchor, 0.3)
    assert.equal(updated.updated_at, 1735689600000)
    assert.equal(anchor.updated_at, 0)
  } finally {
    Date.now = prev
  }
})

test("simulated time increases decay", async () => {
  const store = new MemoryStore()
  const config = merge_config({ decay_lambdas_by_sector: { semantic: 1 } })
  await store.putAnchor({
    ...mk_anchor("a1", "u1", "semantic", 1),
    created_at: 0,
    updated_at: 0,
    last_access_at: 0,
  })
  const now_short = await get_anchors(store, "u1", "semantic", config, 0)
  const now_long = await get_anchors(store, "u1", "semantic", config, 1000)
  assert.ok(now_long[0].weight < now_short[0].weight)
})

test("closest anchor returned first", () => {
  const anchors = [
    { ...mk_anchor("a1", "u1", "semantic", 1), embedding: [1, 0] },
    { ...mk_anchor("a2", "u1", "semantic", 1), embedding: [0, 1] },
  ]
  const out = find_similar_anchors(anchors, [0.9, 0.1])
  assert.equal(out[0].id, "a1")
})
