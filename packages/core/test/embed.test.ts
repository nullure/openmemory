import test from "node:test"
import assert from "node:assert/strict"
import { FakeEmbeddingProvider } from "../src/embed/fake.ts"
import { norm } from "../src/math/vec.ts"

test("same text + same sector => same vector", async () => {
  const provider = new FakeEmbeddingProvider(8, 1)
  const a = await provider.embed_text("hello", { sector: "factual" })
  const b = await provider.embed_text("hello", { sector: "factual" })
  assert.deepEqual(a, b)
})

test("same text + different sector => different vector", async () => {
  const provider = new FakeEmbeddingProvider(8, 1)
  const a = await provider.embed_text("hello", { sector: "factual" })
  const b = await provider.embed_text("hello", { sector: "emotional" })
  assert.notDeepEqual(a, b)
})

test("dimensions fixed", async () => {
  const provider = new FakeEmbeddingProvider(12, 2)
  const v = await provider.embed_text("hello")
  assert.equal(v.length, provider.dimensions())
})

test("vectors normalized", async () => {
  const provider = new FakeEmbeddingProvider(8, 1)
  const v = await provider.embed_text("hello")
  assert.ok(Math.abs(norm(v) - 1) < 1e-9)
})
