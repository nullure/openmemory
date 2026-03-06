import test from "node:test"
import assert from "node:assert/strict"
import { dot, norm, normalize, cosine } from "../src/math/vec.ts"

test("dot", () => {
  assert.equal(dot([1, 2], [3, 4]), 11)
})

test("norm", () => {
  assert.equal(norm([3, 4]), 5)
})

test("cosine", () => {
  assert.ok(Math.abs(cosine([1, 0], [1, 0]) - 1) < 1e-12)
  assert.ok(Math.abs(cosine([1, 0], [0, 1])) < 1e-12)
})

test("normalize zero vector", () => {
  assert.deepEqual(normalize([0, 0]), [0, 0])
})
