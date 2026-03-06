import test from "node:test"
import assert from "node:assert/strict"
import { CountMinSketch } from "../src/engine/sketch_engine.ts"
import { ingest_text } from "../src/engine/ingest_engine.ts"

test("sketch updated", () => {
  const sketch = new CountMinSketch(3, 32)
  ingest_text("user-1", "I like pizza.", sketch)
  assert.ok(sketch.estimate("pizza") > 0)
})
