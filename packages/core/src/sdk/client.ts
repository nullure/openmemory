import type { ingest_input, ingest_summary } from "../engine/ingest.ts"
import type { Belief } from "../types/belief.ts"
import type { ContextPacket } from "../types/context.ts"

export type recall_mode = "fast" | "deep"

export type ingest_memory_request = ingest_input

export type recall_memory_request = {
  user_id: string
  query: string
  mode?: recall_mode
  token_budget?: number
}

export type recall_memory_response = ContextPacket & {
  mode: recall_mode
  token_budget: number
}

export type active_beliefs_request = {
  user_id: string
  timestamp_ms?: number
}

type fetch_like = (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>

type endpoint_paths = {
  ingest: string
  recall: string
  active_beliefs: string
}

export type sdk_client_options = {
  base_url: string
  fetch_impl?: fetch_like
  headers?: Record<string, string>
  endpoints?: Partial<endpoint_paths>
}

const DEFAULT_ENDPOINTS: endpoint_paths = {
  ingest: "/ingest",
  recall: "/recall",
  active_beliefs: "/beliefs/active",
}

const normalize_base_url = (base_url: string): string => {
  const trimmed = base_url.trim()
  if (!trimmed) throw new Error("invalid base_url: expected non-empty URL")
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed
}

const ensure_fetch = (fetch_impl?: fetch_like): fetch_like => {
  if (fetch_impl) return fetch_impl
  if (typeof fetch !== "function") throw new Error("fetch is unavailable; provide fetch_impl")
  return fetch.bind(globalThis)
}

const parse_json_response = async <T>(response: Response): Promise<T> => {
  const text = await response.text()
  let body: unknown = null
  if (text.length) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      throw new Error(`invalid JSON response (${response.status})`)
    }
  }
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "error" in body
      ? String((body as { error: unknown }).error)
      : `request failed with status ${response.status}`
    throw new Error(message)
  }
  return body as T
}

const is_plain_object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

function assert_hmd_packet(value: unknown): asserts value is recall_memory_response {
  if (!is_plain_object(value)) throw new Error("invalid recall response: expected object")
  if (typeof value.query !== "string") throw new Error("invalid recall response: missing query")
  if (!Array.isArray(value.sectors_used)) throw new Error("invalid recall response: sectors_used must be array")
  if (!Array.isArray(value.memories)) throw new Error("invalid recall response: memories must be array")
  if (!Array.isArray(value.active_beliefs)) throw new Error("invalid recall response: active_beliefs must be array")
  if (!Array.isArray(value.waypoint_trace)) throw new Error("invalid recall response: waypoint_trace must be array")
}

export class OpenMemoryClient {
  private readonly base_url: string
  private readonly fetch_impl: fetch_like
  private readonly headers: Record<string, string>
  private readonly endpoints: endpoint_paths

  constructor(options: sdk_client_options) {
    this.base_url = normalize_base_url(options.base_url)
    this.fetch_impl = ensure_fetch(options.fetch_impl)
    this.headers = { ...(options.headers ?? {}) }
    this.endpoints = { ...DEFAULT_ENDPOINTS, ...(options.endpoints ?? {}) }
  }

  private endpoint(path: string): string {
    const normalized = path.startsWith("/") ? path : `/${path}`
    return `${this.base_url}${normalized}`
  }

  private async post_json<T>(path: string, payload: unknown): Promise<T> {
    const response = await this.fetch_impl(this.endpoint(path), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...this.headers,
      },
      body: JSON.stringify(payload),
    })
    return parse_json_response<T>(response)
  }

  async ingestMemory(input: ingest_memory_request): Promise<ingest_summary> {
    return this.post_json<ingest_summary>(this.endpoints.ingest, input)
  }

  async recallMemory(input: recall_memory_request): Promise<recall_memory_response> {
    const response = await this.post_json<unknown>(this.endpoints.recall, {
      user_id: input.user_id,
      query: input.query,
      mode: input.mode,
      token_budget: input.token_budget,
    })
    assert_hmd_packet(response)
    return response
  }

  async getActiveBeliefs(input: active_beliefs_request): Promise<Belief[]> {
    const search = new URLSearchParams({
      user_id: input.user_id,
      ...(input.timestamp_ms === undefined ? {} : { timestamp_ms: String(input.timestamp_ms) }),
    })
    const response = await this.fetch_impl(`${this.endpoint(this.endpoints.active_beliefs)}?${search.toString()}`, {
      method: "GET",
      headers: { ...this.headers },
    })
    return parse_json_response<Belief[]>(response)
  }
}
