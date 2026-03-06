import test from "node:test"
import assert from "node:assert/strict"
import { anchor_score } from "../src/math/scoring.ts"

test("higher similarity dominates", () => {
  const a = anchor_score({ similarity: 0.9, weight: 0, recency: 0 })
  const b = anchor_score({ similarity: 0.2, weight: 0, recency: 0 })
  assert.ok(a > b)
})

test("higher weight improves score", () => {
  const a = anchor_score({ similarity: 0, weight: 0, recency: 0 })
  const b = anchor_score({ similarity: 0, weight: 10, recency: 0 })
  assert.ok(b > a)
})

test("higher recency improves score", () => {
  const a = anchor_score({ similarity: 0, weight: 0, recency: 0.1 })
  const b = anchor_score({ similarity: 0, weight: 0, recency: 0.9 })
  assert.ok(b > a)
})

test("negative weights do not reduce score", () => {
  const a = anchor_score({ similarity: 0, weight: -5, recency: 0 })
  const b = anchor_score({ similarity: 0, weight: 0, recency: 0 })
  assert.equal(a, b)
})
