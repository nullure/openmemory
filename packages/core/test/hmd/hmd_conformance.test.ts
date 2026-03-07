import test from "node:test"
import assert from "node:assert/strict"
import { recall } from "../../src/engine/recall.ts"
import { HMD_USER_ID, create_hmd_harness, put_memory_and_anchor } from "./helpers.ts"

test("HMD conformance: sector-specific queries return matching sector memories", async () => {
  const { store, provider, config } = create_hmd_harness(8, 43)

  const semantic_query = "what mountain is tallest?"
  const episodic_query = "what did i do last weekend?"
  const procedural_query = "what habit do i have when coding?"

  const semantic_embedding = await provider.embed_text(semantic_query, { sector: "semantic" })
  const episodic_embedding = await provider.embed_text(episodic_query, { sector: "episodic" })
  const procedural_embedding = await provider.embed_text(procedural_query, { sector: "procedural" })

  await put_memory_and_anchor(
    store,
    HMD_USER_ID,
    {
      id: "memory-semantic",
      user_id: HMD_USER_ID,
      text: "Mount Everest is the tallest mountain.",
      timestamp_ms: 1000,
      metadata: {},
      sectors: ["semantic"],
    },
    { id: "anchor-semantic", sector: "semantic", embedding: semantic_embedding, timestamp_ms: 1000 },
  )
  await put_memory_and_anchor(
    store,
    HMD_USER_ID,
    {
      id: "memory-episodic",
      user_id: HMD_USER_ID,
      text: "I went hiking last weekend.",
      timestamp_ms: 1000,
      metadata: {},
      sectors: ["episodic"],
      temporal_markers: ["last weekend"],
    },
    { id: "anchor-episodic", sector: "episodic", embedding: episodic_embedding, timestamp_ms: 1000 },
  )
  await put_memory_and_anchor(
    store,
    HMD_USER_ID,
    {
      id: "memory-procedural",
      user_id: HMD_USER_ID,
      text: "I usually code Rust at night.",
      timestamp_ms: 1000,
      metadata: {},
      sectors: ["procedural"],
    },
    { id: "anchor-procedural", sector: "procedural", embedding: procedural_embedding, timestamp_ms: 1000 },
  )

  const semantic = await recall(
    { user_id: HMD_USER_ID, query_text: semantic_query, timestamp_ms: 1000 },
    { store, provider, config },
  )
  const episodic = await recall(
    { user_id: HMD_USER_ID, query_text: episodic_query, timestamp_ms: 1000 },
    { store, provider, config },
  )
  const procedural = await recall(
    { user_id: HMD_USER_ID, query_text: procedural_query, timestamp_ms: 1000 },
    { store, provider, config },
  )

  assert.equal(semantic.sectors_used[0].sector, "semantic")
  assert.equal(semantic.memories[0].memory_node_id, "memory-semantic")

  assert.equal(episodic.sectors_used[0].sector, "episodic")
  assert.equal(episodic.memories[0].memory_node_id, "memory-episodic")

  assert.equal(procedural.sectors_used[0].sector, "procedural")
  assert.equal(procedural.memories[0].memory_node_id, "memory-procedural")
})
