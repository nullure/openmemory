import test from "node:test"
import assert from "node:assert/strict"
import { decay_factor, apply_decay } from "../src/math/decay.ts"

test("decay_factor handles zero dt", () => {
  assert.ok(Math.abs(decay_factor(0, 0.5) - 1) < 1e-12)
})

test("apply_decay handles zero lambda", () => {
  assert.equal(apply_decay(3, 1000, 0), 3)
})

test("apply_decay decreases with larger dt", () => {
  const v1 = apply_decay(10, 1000, 0.1)
  const v2 = apply_decay(10, 2000, 0.1)
  assert.ok(v2 < v1)
})

test("apply_decay preserves nonnegative input", () => {
  const v = apply_decay(5, 5000, 0.3)
  assert.ok(v >= 0)
})
