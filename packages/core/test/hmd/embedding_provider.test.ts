import test from "node:test"
import assert from "node:assert/strict"
import { FakeEmbeddingProvider } from "../../src/embed/fake.ts"
import { vector_norm } from "./helpers.ts"

test("fake embedding provider is deterministic, sector-aware, and normalized", async () => {
  const provider = new FakeEmbeddingProvider(8, 17)
  const text = "Mount Everest is the tallest mountain."

  const a = await provider.embed_text(text)
  const b = await provider.embed_text(text)
  const semantic = await provider.embed_text(text, { sector: "semantic" })
  const episodic = await provider.embed_text(text, { sector: "episodic" })

  assert.deepEqual(a, b)
  assert.notDeepEqual(semantic, episodic)
  assert.equal(a.length, provider.dimensions())
  assert.equal(semantic.length, provider.dimensions())
  assert.ok(Math.abs(vector_norm(a) - 1) < 1e-9)
  assert.ok(Math.abs(vector_norm(semantic) - 1) < 1e-9)
  assert.ok(Math.abs(vector_norm(episodic) - 1) < 1e-9)
})
