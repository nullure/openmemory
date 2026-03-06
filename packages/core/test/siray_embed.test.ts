import test from "node:test"
import assert from "node:assert/strict"
import { SirayEmbeddingProvider } from "../src/embed/siray.ts"
import { norm } from "../src/math/vec.ts"

const make_client = () => {
  const calls: Array<Record<string, unknown>> = []
  const client = {
    embeddings: {
      create: async (params: Record<string, unknown>) => {
        calls.push(params)
        const input = params.input
        const inputs = Array.isArray(input) ? input : [input]
        return {
          data: inputs.map((_, index) => ({ embedding: [3, 4], index })),
        }
      },
    },
  }
  return { client, calls }
}

test("siray embed_text applies sector prefix and normalizes", async () => {
  const { client, calls } = make_client()
  const provider = new SirayEmbeddingProvider({
    apiKey: "test",
    dimensions: 2,
    client,
  })
  const out = await provider.embed_text("hello", { sector: "semantic" })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].model, "openai/text-embedding-3-small")
  assert.equal(calls[0].encoding_format, "float")
  assert.equal(calls[0].dimensions, 2)
  assert.equal(calls[0].input, "sector:semantic\n\nhello")
  assert.ok(Math.abs(norm(out) - 1) < 1e-12)
})

test("siray embed_texts supports batches and sector prefix", async () => {
  const { client, calls } = make_client()
  const provider = new SirayEmbeddingProvider({
    apiKey: "test",
    model: "text-embedding-3-small",
    client,
  })
  const out = await provider.embed_texts(["a", "b"], { sector: "episodic" })
  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0].input, ["sector:episodic\n\na", "sector:episodic\n\nb"])
  assert.ok(!("dimensions" in calls[0]))
  assert.equal(out.length, 2)
  assert.ok(Math.abs(out[0][0] - 0.6) < 1e-12)
  assert.ok(Math.abs(out[0][1] - 0.8) < 1e-12)
})

test("siray provider rejects empty input", async () => {
  const { client } = make_client()
  const provider = new SirayEmbeddingProvider({ apiKey: "test", client })
  await assert.rejects(() => provider.embed_text(""))
  await assert.rejects(() => provider.embed_texts([""]))
})
