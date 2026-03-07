import test from "node:test"
import assert from "node:assert/strict"
import { classify_memory } from "../src/classifier/rule_based.ts"
import { extract_temporal_markers } from "../src/engine/temporal.ts"

test("temporal markers extracted", () => {
  const text = "I met Alex yesterday, then on 2026-03-07 we planned next month after lunch."
  const markers = extract_temporal_markers(text)
  assert.ok(markers.includes("yesterday"))
  assert.ok(markers.includes("2026-03-07"))
  assert.ok(markers.includes("next month"))
  assert.ok(markers.includes("after lunch"))
})

test("temporal sector boosted", () => {
  const out = classify_memory("we should discuss this after lunch")
  assert.equal(out[0].sector, "episodic")
})

