import test from "node:test"
import assert from "node:assert/strict"
import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { merge_config } from "../src/config.ts"
import { FakeEmbeddingProvider } from "../src/embed/fake.ts"
import { get_active_beliefs } from "../src/engine/belief_engine.ts"
import { ingest } from "../src/engine/ingest.ts"
import { recall } from "../src/engine/recall.ts"
import { CountMinSketch } from "../src/engine/sketch_engine.ts"
import { normalize } from "../src/math/vec.ts"
import { OpenMemoryClient } from "../src/sdk/client.ts"
import { MemoryStore } from "../src/store/memory.ts"
import { ALL_SECTORS, type SectorId } from "../src/types/sector.ts"
import type { ContextPacket } from "../src/types/context.ts"

const parse_body = async (req: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  const text = Buffer.concat(chunks).toString("utf8").trim()
  if (!text) return {}
  return JSON.parse(text) as unknown
}

const write_json = (res: ServerResponse, status: number, payload: unknown): void => {
  res.statusCode = status
  res.setHeader("content-type", "application/json")
  res.end(JSON.stringify(payload))
}

const as_context_packet = (value: ContextPacket): ContextPacket => value

const build_basis_centroids = (dimensions: number): Record<SectorId, number[]> => {
  const out = {} as Record<SectorId, number[]>
  for (let i = 0; i < ALL_SECTORS.length; i += 1) {
    const vec = new Array<number>(dimensions).fill(0)
    vec[i % dimensions] = 1
    out[ALL_SECTORS[i]] = normalize(vec)
  }
  return out
}

test("sdk round-trips against local test server and preserves HMD packet shape", async (t) => {
  const store = new MemoryStore()
  const provider = new FakeEmbeddingProvider(8, 101)
  const config = merge_config({ projection: { k: 8, seed: 17 } })
  const centroids = build_basis_centroids(config.projection.k)
  const sketch = new CountMinSketch(3, 128)
  const now_ms = 1_700_000_555_000

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://127.0.0.1")

      if (req.method === "POST" && url.pathname === "/ingest") {
        const body = await parse_body(req)
        if (typeof body !== "object" || body === null) throw new Error("invalid ingest payload")
        const out = await ingest(store, body as {
          user_id: string
          memory_text: string
          timestamp_ms?: number
          metadata?: Record<string, unknown>
        }, {
          provider,
          centroids,
          sketch,
          config,
        })
        write_json(res, 200, out)
        return
      }

      if (req.method === "POST" && url.pathname === "/recall") {
        const body = await parse_body(req)
        if (typeof body !== "object" || body === null) throw new Error("invalid recall payload")
        const payload = body as {
          user_id: string
          query: string
          mode?: "fast" | "deep"
          token_budget?: number
        }
        const out = await recall(
          {
            user_id: payload.user_id,
            query_text: payload.query,
            mode: payload.mode,
            token_budget: payload.token_budget,
            timestamp_ms: now_ms + 10,
          },
          { store, provider, config },
        )
        write_json(res, 200, out)
        return
      }

      if (req.method === "GET" && url.pathname === "/beliefs/active") {
        const user_id = url.searchParams.get("user_id")
        if (!user_id) {
          write_json(res, 400, { error: "missing user_id" })
          return
        }
        const ts = Number(url.searchParams.get("timestamp_ms") ?? String(now_ms + 10))
        const beliefs = await get_active_beliefs(store, user_id, Number.isFinite(ts) ? ts : now_ms + 10, config)
        write_json(res, 200, beliefs)
        return
      }

      write_json(res, 404, { error: "not found" })
    } catch (error) {
      write_json(res, 500, { error: error instanceof Error ? error.message : String(error) })
    }
  })

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  t.after(() => server.close())
  const addr = server.address()
  assert.ok(addr && typeof addr === "object")

  const client = new OpenMemoryClient({
    base_url: `http://127.0.0.1:${addr.port}`,
  })

  await client.ingestMemory({
    user_id: "sdk-user",
    memory_text: "Mount Everest is the tallest mountain.",
    timestamp_ms: now_ms,
  })
  await client.ingestMemory({
    user_id: "sdk-user",
    memory_text: "My name is Demon.",
    timestamp_ms: now_ms + 1,
  })

  const recall_packet = await client.recallMemory({
    user_id: "sdk-user",
    query: "what is the tallest mountain?",
    mode: "deep",
    token_budget: 1024,
  })

  assert.equal(recall_packet.query, "what is the tallest mountain?")
  assert.equal(recall_packet.mode, "deep")
  assert.equal(recall_packet.token_budget, 1024)
  assert.ok(Array.isArray(recall_packet.sectors_used))
  assert.ok(Array.isArray(recall_packet.memories))
  assert.ok(Array.isArray(recall_packet.active_beliefs))
  assert.ok(Array.isArray(recall_packet.waypoint_trace))
  assert.ok(recall_packet.memories.length <= 4)
  for (const memory of recall_packet.memories) {
    assert.ok(Array.isArray(memory.trace))
    if (memory.trace[0]) {
      assert.equal(typeof memory.trace[0].source, "string")
      assert.equal(typeof memory.trace[0].sector, "string")
    }
  }

  const context_packet = as_context_packet(recall_packet)
  assert.equal(context_packet.query, recall_packet.query)
  assert.ok(context_packet.active_beliefs.length >= 1)

  const beliefs = await client.getActiveBeliefs({ user_id: "sdk-user", timestamp_ms: now_ms + 10 })
  assert.ok(beliefs.length >= 1)
  assert.ok(beliefs.some((belief) => belief.source_memory_node_id.startsWith("memory-")))
})
