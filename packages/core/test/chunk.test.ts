import test from "node:test"
import assert from "node:assert/strict"
import { chunk_and_embed, chunk_text } from "../src/embed/chunk.ts"
import { norm } from "../src/math/vec.ts"
import type { EmbeddingProvider } from "../src/embed/types.ts"

test("short text embeds once", async () => {
  let embed_text_calls = 0
  let embed_texts_calls = 0
  const provider: EmbeddingProvider = {
    embed_text: async () => {
      embed_text_calls += 1
      return [1, 0]
    },
    embed_texts: async () => {
      embed_texts_calls += 1
      return [[1, 0]]
    },
    dimensions: () => 2,
    name: () => "mock",
  }
  const out = await chunk_and_embed(provider, "short text", undefined, 1000)
  assert.equal(embed_text_calls, 1)
  assert.equal(embed_texts_calls, 0)
  assert.equal(out.length, 2)
})

test("long text chunks and merged vector normalized", async () => {
  let embed_texts_calls = 0
  const provider: EmbeddingProvider = {
    embed_text: async () => [0, 0],
    embed_texts: async (inputs) => {
      embed_texts_calls += 1
      return inputs.map((_, index) => (index === 0 ? [3, 4] : [0, 5]))
    },
    dimensions: () => 2,
    name: () => "mock",
  }
  const text = Array.from({ length: 50 }).fill("token").join(" ")
  const chunks = chunk_text(text, 4)
  assert.ok(chunks.length > 1)
  const out = await chunk_and_embed(provider, text, undefined, 4)
  assert.equal(embed_texts_calls, 1)
  assert.ok(Math.abs(norm(out) - 1) < 1e-12)
})

test("chunking deterministic", () => {
  const text = "alpha beta gamma delta epsilon zeta eta theta iota kappa"
  const a = chunk_text(text, 3)
  const b = chunk_text(text, 3)
  assert.deepEqual(a, b)
})
