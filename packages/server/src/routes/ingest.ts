export type ingest_request = {
  user_id: string
  memory_text: string
  timestamp_ms?: number
  metadata?: Record<string, unknown>
}

export type ingest_response = unknown

export type ingest_route_deps = {
  ingest: (input: ingest_request) => Promise<ingest_response> | ingest_response
}

const is_plain_object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const read_required_string = (payload: Record<string, unknown>, key: string): string => {
  const value = payload[key]
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`invalid ${key}: expected non-empty string`)
  }
  return value
}

export const parse_ingest_request = (payload: unknown): ingest_request => {
  if (!is_plain_object(payload)) throw new Error("invalid request body: expected object")

  const user_id = read_required_string(payload, "user_id")
  const memory_text = read_required_string(payload, "memory_text")

  const timestamp_raw = payload.timestamp_ms
  let timestamp_ms: number | undefined
  if (timestamp_raw !== undefined) {
    if (typeof timestamp_raw !== "number" || !Number.isFinite(timestamp_raw)) {
      throw new Error("invalid timestamp_ms: expected finite number")
    }
    timestamp_ms = timestamp_raw
  }

  const metadata_raw = payload.metadata
  let metadata: Record<string, unknown> | undefined
  if (metadata_raw !== undefined) {
    if (!is_plain_object(metadata_raw)) {
      throw new Error("invalid metadata: expected object")
    }
    metadata = metadata_raw
  }

  return { user_id, memory_text, timestamp_ms, metadata }
}

export const create_ingest_route = (deps: ingest_route_deps) => {
  return async (payload: unknown): Promise<ingest_response> => {
    const request = parse_ingest_request(payload)
    return deps.ingest(request)
  }
}

