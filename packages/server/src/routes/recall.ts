export type recall_mode = "fast" | "deep"

export type recall_request = {
  user_id: string
  query: string
  mode?: recall_mode
  token_budget?: number
}

export type recall_engine_input = {
  user_id: string
  query_text: string
  limit: number
  mode: recall_mode
  token_budget: number
}

export type hmd_recall_response = {
  query: string
  sectors_used: unknown[]
  memories: unknown[]
  active_beliefs: unknown[]
  waypoint_trace: unknown[]
}

export type recall_route_response = hmd_recall_response & {
  mode: recall_mode
  token_budget: number
}

export type recall_route_deps = {
  recall: (input: recall_engine_input) => Promise<hmd_recall_response> | hmd_recall_response
}

const DEFAULT_FAST_TOKEN_BUDGET = 1024
const DEFAULT_DEEP_TOKEN_BUDGET = 4096
const TOKENS_PER_MEMORY = 256

const is_plain_object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const read_required_string = (payload: Record<string, unknown>, key: string): string => {
  const value = payload[key]
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`invalid ${key}: expected non-empty string`)
  }
  return value
}

const parse_mode = (value: unknown): recall_mode | undefined => {
  if (value === undefined) return undefined
  if (value === "fast" || value === "deep") return value
  throw new Error("invalid mode: expected fast|deep")
}

const parse_token_budget = (value: unknown): number | undefined => {
  if (value === undefined) return undefined
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error("invalid token_budget: expected positive number")
  }
  return Math.floor(value)
}

const effective_token_budget = (mode: recall_mode, token_budget?: number): number =>
  token_budget ?? (mode === "deep" ? DEFAULT_DEEP_TOKEN_BUDGET : DEFAULT_FAST_TOKEN_BUDGET)

const limit_from_budget = (budget: number): number =>
  Math.max(1, Math.floor(budget / TOKENS_PER_MEMORY))

const assert_hmd_response = (response: hmd_recall_response): void => {
  if (!Array.isArray(response.sectors_used)) throw new Error("invalid recall response: sectors_used must be array")
  if (!Array.isArray(response.memories)) throw new Error("invalid recall response: memories must be array")
  if (!Array.isArray(response.active_beliefs)) throw new Error("invalid recall response: active_beliefs must be array")
  if (!Array.isArray(response.waypoint_trace)) throw new Error("invalid recall response: waypoint_trace must be array")
}

export const parse_recall_request = (payload: unknown): recall_request => {
  if (!is_plain_object(payload)) throw new Error("invalid request body: expected object")
  const user_id = read_required_string(payload, "user_id")
  const query = read_required_string(payload, "query")
  const mode = parse_mode(payload.mode)
  const token_budget = parse_token_budget(payload.token_budget)
  return { user_id, query, mode, token_budget }
}

export const create_recall_route = (deps: recall_route_deps) => {
  return async (payload: unknown): Promise<recall_route_response> => {
    const request = parse_recall_request(payload)
    const mode = request.mode ?? "fast"
    const token_budget = effective_token_budget(mode, request.token_budget)
    const limit = limit_from_budget(token_budget)
    const response = await deps.recall({
      user_id: request.user_id,
      query_text: request.query,
      limit,
      mode,
      token_budget,
    })
    assert_hmd_response(response)
    return {
      query: response.query,
      sectors_used: response.sectors_used,
      memories: response.memories,
      active_beliefs: response.active_beliefs,
      waypoint_trace: response.waypoint_trace,
      mode,
      token_budget,
    }
  }
}
