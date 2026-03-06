import test from "node:test"
import assert from "node:assert/strict"
import { novelty_score } from "../src/math/novelty.ts"

test("novelty near zero for identical vector", () => {
  const mean = [1, -2]
  const varz = [0, 0]
  const n = novelty_score([1, -2], mean, varz)
  assert.ok(n < 1e-6)
})

test("novelty higher for farther vector", () => {
  const mean = [0, 0]
  const varz = [1, 1]
  const near = novelty_score([0.1, -0.1], mean, varz)
  const far = novelty_score([5, 0], mean, varz)
  assert.ok(far > near)
})

test("novelty is nonnegative and finite", () => {
  const mean = [0, 0]
  const varz = [0, 0]
  const n = novelty_score([1, 2], mean, varz)
  assert.ok(n >= 0)
  assert.ok(Number.isFinite(n))
})
