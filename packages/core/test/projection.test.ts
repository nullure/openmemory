import test from "node:test"
import assert from "node:assert/strict"
import { make_projection_matrix, project } from "../src/math/projection.ts"

test("projection matrix reproducibility", () => {
  const r1 = make_projection_matrix(4, 3, 123)
  const r2 = make_projection_matrix(4, 3, 123)
  assert.deepEqual(r1, r2)
})

test("projection matrix changes with seed", () => {
  const r1 = make_projection_matrix(4, 3, 123)
  const r2 = make_projection_matrix(4, 3, 124)
  assert.notDeepEqual(r1, r2)
})

test("projection output determinism", () => {
  const r = make_projection_matrix(4, 3, 123)
  const v = [1, 2, 3, 4]
  assert.deepEqual(project(v, r), project(v, r))
})

test("projection output length and normalization", () => {
  const r = make_projection_matrix(3, 2, 42)
  const out = project([1, 0, 0], r)
  assert.equal(out.length, 2)
  const n = Math.sqrt(out[0] * out[0] + out[1] * out[1])
  assert.ok(Math.abs(n - 1) < 1e-12)
})
