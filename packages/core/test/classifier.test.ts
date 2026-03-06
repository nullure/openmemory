import test from "node:test"
import assert from "node:assert/strict"
import { classify_memory } from "../src/classifier/rule_based.ts"

test("my name is demon routes semantic", () => {
  const out = classify_memory("my name is demon")
  assert.equal(out[0].sector, "semantic")
  const sum = out.reduce((acc, r) => acc + r.prob, 0)
  assert.ok(Math.abs(sum - 1) < 1e-9)
})

test("i was sad yesterday routes emotional + episodic", () => {
  const out = classify_memory("i was sad yesterday")
  const sectors = out.map((r) => r.sector).sort()
  assert.deepEqual(sectors, ["emotional", "episodic"])
  const sum = out.reduce((acc, r) => acc + r.prob, 0)
  assert.ok(Math.abs(sum - 1) < 1e-9)
})

test("i usually code at night routes procedural + episodic", () => {
  const out = classify_memory("i usually code at night")
  const sectors = out.map((r) => r.sector).sort()
  assert.deepEqual(sectors, ["episodic", "procedural"])
  const sum = out.reduce((acc, r) => acc + r.prob, 0)
  assert.ok(Math.abs(sum - 1) < 1e-9)
})
