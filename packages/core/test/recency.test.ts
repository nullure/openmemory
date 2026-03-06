import test from "node:test"
import assert from "node:assert/strict"
import { recency_score } from "../src/math/recency.ts"

test("recency score is 1 at same time", () => {
  assert.equal(recency_score(1000, 1000, 0.5), 1)
})

test("older memory has smaller score", () => {
  const r1 = recency_score(2000, 1000, 0.5)
  const r2 = recency_score(5000, 1000, 0.5)
  assert.ok(r2 < r1)
})

test("much older approaches zero", () => {
  const r = recency_score(1000 * 1000, 0, 0.5)
  assert.ok(r < 1e-6)
})

test("future timestamp treated as age 0", () => {
  assert.equal(recency_score(1000, 2000, 0.5), 1)
})
