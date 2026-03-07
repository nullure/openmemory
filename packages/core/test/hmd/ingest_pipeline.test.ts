import test from "node:test"
import assert from "node:assert/strict"
import { create_engine } from "../../src/create.ts"
import {
  HMD_USER_ID,
  build_basis_centroids,
  create_hmd_harness,
  list_all_anchors,
} from "./helpers.ts"

test("ingest pipeline creates canonical memory nodes and sector anchors", async () => {
  const harness = create_hmd_harness(8, 19)
  const centroids = build_basis_centroids(harness.config.projection.k)
  const engine = create_engine({
    store: harness.store,
    provider: harness.provider,
    sketch: harness.sketch,
    centroids,
    config: harness.config,
  })

  const memories = [
    "Mount Everest is the tallest mountain.",
    "I went hiking last weekend.",
    "Jamie likes sushi.",
    "I usually code Rust at night.",
    "I felt stressed during exams.",
  ]

  const base = 1_700_000_000_000
  for (let i = 0; i < memories.length; i += 1) {
    await engine.ingest({
      user_id: HMD_USER_ID,
      memory_text: memories[i],
      timestamp_ms: base + i,
    })
  }

  const nodes = await harness.store.listMemoryNodes(HMD_USER_ID)
  assert.equal(nodes.length, 5)

  const anchors = await list_all_anchors(harness.store, HMD_USER_ID)
  assert.ok(anchors.length >= 5)

  const node_ids = new Set(nodes.map((node) => node.id))
  const anchors_by_node = new Map<string, number>()
  for (const node of nodes) anchors_by_node.set(node.id, 0)
  for (const anchor of anchors) {
    assert.ok(node_ids.has(anchor.memory_node_id))
    anchors_by_node.set(
      anchor.memory_node_id,
      (anchors_by_node.get(anchor.memory_node_id) ?? 0) + 1,
    )
  }
  for (const node of nodes) {
    assert.ok((anchors_by_node.get(node.id) ?? 0) > 0, `missing anchor for ${node.id}`)
  }
})
