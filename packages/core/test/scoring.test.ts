import test from "node:test"
import assert from "node:assert/strict"
import { anchor_score } from "../src/math/scoring.ts"

test("strong direct similarity still matters most when other signals match", () => {
  const a = anchor_score({ similarity: 0.9, salience: 1, recency: 1, weight: 1, waypoint_bonus: 0 })
  const b = anchor_score({ similarity: 0.2, salience: 1, recency: 1, weight: 1, waypoint_bonus: 0 })
  assert.ok(a > b)
})

test("waypoint bonus can rescue a slightly weaker memory", () => {
  const direct = anchor_score({
    similarity: 0.8,
    salience: 1,
    recency: 1,
    weight: 1,
    waypoint_bonus: 0,
  })
  const connected = anchor_score({
    similarity: 0.7,
    salience: 1,
    recency: 1,
    weight: 1,
    waypoint_bonus: 1,
  })
  assert.ok(connected > direct)
})

test("higher salience improves score", () => {
  const a = anchor_score({ similarity: 0, salience: 0, recency: 0, weight: 0, waypoint_bonus: 0 })
  const b = anchor_score({ similarity: 0, salience: 10, recency: 0, weight: 0, waypoint_bonus: 0 })
  assert.ok(b > a)
})

test("higher recency improves score", () => {
  const a = anchor_score({ similarity: 0, salience: 0, weight: 0, recency: 0.1, waypoint_bonus: 0 })
  const b = anchor_score({ similarity: 0, salience: 0, weight: 0, recency: 0.9, waypoint_bonus: 0 })
  assert.ok(b > a)
})

test("higher weight improves score", () => {
  const a = anchor_score({ similarity: 0, salience: 0, weight: 0, recency: 0, waypoint_bonus: 0 })
  const b = anchor_score({ similarity: 0, salience: 0, weight: 10, recency: 0, waypoint_bonus: 0 })
  assert.ok(b > a)
})

test("negative weights do not reduce score", () => {
  const a = anchor_score({ similarity: 0, salience: 0, weight: -5, recency: 0, waypoint_bonus: -2 })
  const b = anchor_score({ similarity: 0, salience: 0, weight: 0, recency: 0, waypoint_bonus: 0 })
  assert.equal(a, b)
})
