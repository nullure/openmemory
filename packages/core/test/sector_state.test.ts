import test from "node:test"
import assert from "node:assert/strict"
import { init_sector_state, update_sector_centroid } from "../src/engine/sector_state.ts"

test("initialization correct", () => {
  const state = init_sector_state("user-1", "semantic", [1, 2, 3], 0)
  assert.deepEqual(state.centroid, [1, 2, 3])
  assert.deepEqual(state.mean, [1, 2, 3])
  assert.deepEqual(state.variance, [0, 0, 0])
  assert.equal(state.valid_from, "1970-01-01T00:00:00.000Z")
  assert.equal(state.valid_to, null)
})

test("centroid moves toward input", () => {
  const state = init_sector_state("user-1", "semantic", [0, 0], 0)
  const next = update_sector_centroid(state, [1, 0], 0.5, 0)
  assert.ok(next.centroid[0] > state.centroid[0])
  assert.equal(next.centroid[1], state.centroid[1])
})
