import test from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, readFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { fetch_benchmark_datasets } from "../src/datasets/fetch.ts"

type fake_response = {
  ok: boolean
  status: number
  body: string
}

const make_fetch = (responses: Record<string, fake_response>) => {
  return async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input)
    const row = responses[url]
    if (!row) return new Response("not found", { status: 404 })
    return new Response(row.body, { status: row.status })
  }
}

test("fetch downloads selected dataset assets and writes lock file", async () => {
  const out = await mkdtemp(join(tmpdir(), "openmemory-fetch-"))
  const fake_fetch = make_fetch({
    "https://raw.githubusercontent.com/snap-research/locomo/main/data/locomo10.json": {
      ok: true,
      status: 200,
      body: "[{\"sample_id\":\"S1\",\"conversation\":{\"session_1\":[]},\"qa\":[]}]",
    },
  })

  const summary = await fetch_benchmark_datasets("locomo", out, { fetch_impl: fake_fetch })
  assert.equal(summary.selected, "locomo")
  assert.equal(summary.assets.length, 1)
  assert.equal(summary.assets[0].id, "locomo10")

  const lock = JSON.parse(await readFile(join(out, "dataset-lock.json"), "utf8")) as { assets: Array<{ id: string }> }
  assert.ok(lock.assets.some((asset) => asset.id === "locomo10"))
})

test("fetch skip existing files when force is false", async () => {
  const out = await mkdtemp(join(tmpdir(), "openmemory-fetch-skip-"))
  const fake_fetch = make_fetch({
    "https://raw.githubusercontent.com/snap-research/locomo/main/data/locomo10.json": {
      ok: true,
      status: 200,
      body: "[{\"sample_id\":\"S1\",\"conversation\":{\"session_1\":[]},\"qa\":[]}]",
    },
  })

  const first = await fetch_benchmark_datasets("locomo", out, { fetch_impl: fake_fetch })
  assert.equal(first.assets[0].skipped, false)
  const second = await fetch_benchmark_datasets("locomo", out, { fetch_impl: fake_fetch })
  assert.equal(second.assets[0].skipped, true)
})
