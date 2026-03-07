import test from "node:test"
import assert from "node:assert/strict"
import { ingest } from "../../src/engine/ingest.ts"
import { extract_identity } from "../../src/engine/extract.ts"
import { HMD_USER_ID, create_hmd_harness } from "./helpers.ts"

test("belief system extracts identity fact and grounds belief to source memory node", async () => {
  const { store, provider, sketch, config } = create_hmd_harness(8, 41)
  const text = "My name is Demon."
  const timestamp_ms = 11_111

  await ingest(
    store,
    {
      user_id: HMD_USER_ID,
      memory_text: text,
      timestamp_ms,
    },
    {
      provider,
      centroids: {},
      sketch,
      config,
    },
  )

  const extracted = extract_identity(HMD_USER_ID, text)
  assert.deepEqual(extracted, {
    subject: HMD_USER_ID,
    predicate: "name",
    object: "Demon",
  })

  const beliefs = await store.getBeliefs(HMD_USER_ID)
  assert.equal(beliefs.length, 1)
  assert.equal(beliefs[0].source_memory_node_id, `memory-${timestamp_ms}`)
  assert.ok(beliefs[0].source_sector === "semantic" || beliefs[0].source_sector === "reflective")
})
