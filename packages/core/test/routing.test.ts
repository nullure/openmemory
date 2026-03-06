import test from "node:test"
import assert from "node:assert/strict"
import { route_sectors } from "../src/math/routing.ts"

test("route_sectors returns top 2 by probability", () => {
  const v = [1, 0]
  const cents = {
    episodic: [-1, 0],
    semantic: [1, 0],
    procedural: [-0.4, 0],
    emotional: [0.5, 0],
    reflective: [-0.2, 0],
  }
  const out = route_sectors(v, cents, 2)
  assert.equal(out.length, 2)
  assert.equal(out[0].sector, "semantic")
  assert.equal(out[1].sector, "emotional")
  assert.ok(out[0].prob >= out[1].prob)
})

test("route_sectors handles empty input", () => {
  assert.deepEqual(route_sectors([1, 2], {}), [])
})

test("route_sectors probabilities sum to 1", () => {
  const v = [1, 0]
  const cents = {
    episodic: [-1, 0],
    semantic: [1, 0],
    procedural: [-0.4, 0],
    emotional: [0, 1],
    reflective: [-0.2, 0],
  }
  const out = route_sectors(v, cents, 5)
  const sum = out.reduce((acc, r) => acc + r.prob, 0)
  assert.ok(Math.abs(sum - 1) < 1e-12)
})

test("route_sectors handles large logits stably", () => {
  const v = [1000, 0]
  const cents = {
    episodic: [-1, 0],
    semantic: [1, 0],
    procedural: [-0.4, 0],
    emotional: [0.9, 0],
    reflective: [-0.2, 0],
  }
  const out = route_sectors(v, cents, 2)
  assert.equal(out[0].sector, "semantic")
  assert.ok(out[0].prob >= out[1].prob)
  assert.ok(out[0].prob <= 1)
})
