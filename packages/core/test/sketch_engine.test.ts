import test from "node:test"
import assert from "node:assert/strict"
import { CountMinSketch } from "../src/engine/sketch_engine.ts"

test("frequent key has larger estimate", () => {
  const sketch = new CountMinSketch(3, 32)
  for (let i = 0; i < 5; i += 1) sketch.update("hot")
  sketch.update("cold")
  const hot = sketch.estimate("hot")
  const cold = sketch.estimate("cold")
  assert.ok(hot > cold)
})
