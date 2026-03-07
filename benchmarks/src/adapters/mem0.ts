import type { BenchmarkAnswer, BenchmarkQuestion, BenchmarkSession, MemorySystemAdapter } from "./types.ts"
import { read_jsonl } from "../utils/jsonl.ts"
import { estimate_tokens } from "../utils/normalize.ts"

type mem0_mode = "unimplemented" | "http" | "replay"

type mem0_http_response = {
  answer_text?: unknown
  latency_ms?: unknown
  prompt_tokens?: unknown
  retrieved_context_tokens?: unknown
  retrieved_context_size?: unknown
  retrieved_context?: unknown
  traces?: unknown
  raw?: unknown
}

type replay_row = {
  question_id: string
  answer_text: string
  latency_ms?: number
  prompt_tokens?: number
  retrieved_context_tokens?: number
  retrieved_context_size?: number
  traces?: unknown
  raw?: unknown
}

const as_object = (value: unknown): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("invalid mem0 config: expected object")
  }
  return value as Record<string, unknown>
}

const as_string = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`invalid mem0 config: ${field}`)
  return value
}

const as_number = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined

export class Mem0Adapter implements MemorySystemAdapter {
  private mode: mem0_mode = "unimplemented"
  private endpoint: string | null = null
  private ingest_path: string | null = null
  private query_path: string | null = null
  private replay_map = new Map<string, replay_row>()

  name(): string {
    return "mem0"
  }

  metadata(): Record<string, unknown> {
    return {
      mode: this.mode,
      native_integration: false,
      replay_entries: this.replay_map.size,
    }
  }

  async setup(config: Record<string, unknown>): Promise<void> {
    const row = as_object(config)
    this.mode = (row.mode as mem0_mode) ?? "unimplemented"
    if (this.mode === "unimplemented") {
      throw new Error("Mem0 adapter is not implemented natively in this environment; use replay or explicit http mapping")
    }

    if (this.mode === "replay") {
      const replay_file = as_string(row.replay_file, "replay_file")
      const rows = await read_jsonl<replay_row>(replay_file)
      this.replay_map = new Map(rows.map((entry) => [entry.question_id, entry]))
      return
    }

    this.endpoint = as_string(row.endpoint, "endpoint")
    this.ingest_path = as_string(row.ingest_path, "ingest_path")
    this.query_path = as_string(row.query_path, "query_path")
  }

  async reset(): Promise<void> {
    return
  }

  async ingestConversation(session: BenchmarkSession): Promise<void> {
    if (this.mode === "replay") return
    if (this.mode !== "http") return
    const response = await fetch(`${this.endpoint}${this.ingest_path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session }),
    })
    if (!response.ok) throw new Error(`mem0 ingest failed: ${response.status}`)
  }

  async answerQuestion(input: BenchmarkQuestion): Promise<BenchmarkAnswer> {
    if (this.mode === "replay") {
      const replay = this.replay_map.get(input.id)
      if (!replay) throw new Error(`mem0 replay missing question_id=${input.id}`)
      return {
        question_id: input.id,
        answer_text: replay.answer_text,
        latency_ms: replay.latency_ms ?? 0,
        prompt_tokens: replay.prompt_tokens ?? estimate_tokens(input.question_text),
        retrieved_context_tokens: replay.retrieved_context_tokens ?? 0,
        retrieved_context_size: replay.retrieved_context_size ?? 0,
        traces: replay.traces,
        raw: replay.raw,
      }
    }

    if (this.mode !== "http") {
      throw new Error("mem0 adapter unavailable")
    }

    const response = await fetch(`${this.endpoint}${this.query_path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: input }),
    })
    if (!response.ok) throw new Error(`mem0 query failed: ${response.status}`)
    const payload = await response.json() as mem0_http_response
    if (typeof payload.answer_text !== "string") {
      throw new Error("mem0 query response missing answer_text")
    }
    return {
      question_id: input.id,
      answer_text: payload.answer_text,
      latency_ms: as_number(payload.latency_ms) ?? 0,
      prompt_tokens: as_number(payload.prompt_tokens) ?? estimate_tokens(input.question_text),
      retrieved_context_tokens: as_number(payload.retrieved_context_tokens) ?? 0,
      retrieved_context_size: as_number(payload.retrieved_context_size) ?? 0,
      retrieved_context: Array.isArray(payload.retrieved_context) ? payload.retrieved_context : undefined,
      traces: payload.traces,
      raw: payload.raw ?? payload,
    }
  }

  async teardown(): Promise<void> {
    this.endpoint = null
    this.ingest_path = null
    this.query_path = null
    this.replay_map.clear()
  }
}

export const create_mem0_adapter = (): MemorySystemAdapter => new Mem0Adapter()
