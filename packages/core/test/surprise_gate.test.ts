import test from "node:test"
import assert from "node:assert/strict"
import { CountMinSketch } from "../src/engine/sketch_engine.ts"
import { surprise_gate } from "../src/engine/surprise_gate.ts"

test("both branches executed", () => {
  const sketch = new CountMinSketch(3, 32)
  let created = 0
  const create_anchor = (): void => {
    created += 1
  }
  const low = surprise_gate(0.1, 0.5, sketch, ["alpha"], create_anchor)
  const lowEstimate = sketch.estimate("alpha")
  const high = surprise_gate(1.0, 0.5, sketch, ["beta"], create_anchor)
  const highEstimate = sketch.estimate("beta")
  assert.equal(low, "update_sketches")
  assert.ok(lowEstimate > 0)
  assert.equal(high, "create_anchor")
  assert.equal(highEstimate, 0)
  assert.equal(created, 1)
})
