import test from "node:test"
import assert from "node:assert/strict"
import { cosine, normalize, similarity_normalized } from "../src/math/vec.ts"

test("normalized cosine and dot similarity rank candidates the same", () => {
  const query = normalize([1, 2])
  const a = normalize([2, 0])
  const b = normalize([0, 2])
  const cosOrder = [a, b].sort((x, y) => cosine(y, query) - cosine(x, query))
  const dotOrder = [a, b].sort((x, y) => similarity_normalized(y, query) - similarity_normalized(x, query))
  assert.equal(cosOrder[0], dotOrder[0])
})

test("cosine handles non-normalized vectors", () => {
  const a = [2, 0]
  const b = [0, 3]
  const sim = cosine(a, b)
  assert.ok(Math.abs(sim) < 1e-12)
})
