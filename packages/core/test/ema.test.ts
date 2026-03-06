import test from "node:test"
import assert from "node:assert/strict"
import { update_mean, update_variance, update_centroid } from "../src/math/ema.ts"

test("update_mean converges to target vector", () => {
  let mean = [0, 0]
  const x = [10, -5]
  for (let i = 0; i < 2000; i += 1) mean = update_mean(mean, x, 0.05)
  assert.ok(Math.abs(mean[0] - x[0]) < 1e-3)
  assert.ok(Math.abs(mean[1] - x[1]) < 1e-3)
})

test("update_variance stays nonnegative and converges for constant", () => {
  let mean = [0, 0]
  let varz = [0, 0]
  const x = [5, -5]
  for (let i = 0; i < 2000; i += 1) {
    mean = update_mean(mean, x, 0.05)
    varz = update_variance(varz, mean, x, 0.05)
  }
  assert.ok(varz[0] >= 0)
  assert.ok(varz[1] >= 0)
  assert.ok(Math.abs(varz[0]) < 1e-3)
  assert.ok(Math.abs(varz[1]) < 1e-3)
})

test("update_centroid converges to target", () => {
  let c = [0, 0, 0]
  const x = [3, -2, 5]
  for (let i = 0; i < 2000; i += 1) c = update_centroid(c, x, 0.05)
  assert.ok(Math.abs(c[0] - x[0]) < 1e-3)
  assert.ok(Math.abs(c[1] - x[1]) < 1e-3)
  assert.ok(Math.abs(c[2] - x[2]) < 1e-3)
})

test("alpha or beta of 1 replaces previous state", () => {
  const mean = update_mean([1, 2], [3, 4], 1)
  assert.deepEqual(mean, [3, 4])
  const varz = update_variance([1, 2], [3, 4], [3, 4], 1)
  assert.deepEqual(varz, [0, 0])
  const centroid = update_centroid([1, 2], [3, 4], 1)
  assert.deepEqual(centroid, [3, 4])
})
