import type { benchmark_adapter_name, benchmark_dataset_name } from "./adapters/types.ts"

export type retry_config = {
  max_attempts: number
  base_delay_ms: number
  max_delay_ms: number
}

export type llm_judge_config = {
  enabled: boolean
  provider: "openai"
  model: string
  api_key_env: string
  endpoint: string
  temperature: number
  f1_threshold: number
}

export type fairness_config = {
  question_limit: number | null
  max_turns_per_session: number
  timeout_ms: number
  retry: retry_config
  seed: number
}

export type dataset_config = {
  name: benchmark_dataset_name
  path: string
  split: string
}

export type openmemory_adapter_config = {
  mode: "inproc" | "http"
  user_id: string
  recall_mode: "fast" | "deep"
  token_budget: number
  server_url?: string
  embedding_provider: "fake" | "openai" | "siray"
  embedding_model?: string
  embedding_dimensions?: number
  embedding_api_key?: string
}

export type mem0_adapter_config = {
  mode: "unimplemented" | "http" | "replay"
  endpoint?: string
  api_key?: string
  replay_file?: string
}

export type zep_adapter_config = {
  mode: "unimplemented" | "http" | "replay"
  endpoint?: string
  api_key?: string
  replay_file?: string
}

export type benchmark_run_config = {
  dataset: dataset_config
  adapter: benchmark_adapter_name
  adapter_config: Record<string, unknown>
  output_dir: string
  resume: boolean
  fairness: fairness_config
  llm_judge: llm_judge_config
  selected_question_ids?: string[]
}

export type benchmark_compare_config = {
  datasets: dataset_config[]
  adapters: benchmark_adapter_name[]
  adapter_configs: Partial<Record<benchmark_adapter_name, Record<string, unknown>>>
  output_dir: string
  fairness: fairness_config
  llm_judge: llm_judge_config
}

export const default_retry_config: retry_config = {
  max_attempts: 2,
  base_delay_ms: 250,
  max_delay_ms: 1500,
}

export const default_llm_judge_config: llm_judge_config = {
  enabled: false,
  provider: "openai",
  model: "gpt-4.1-mini",
  api_key_env: "OPENAI_API_KEY",
  endpoint: "https://api.openai.com/v1/responses",
  temperature: 0,
  f1_threshold: 0.999,
}

export const default_fairness_config: fairness_config = {
  question_limit: null,
  max_turns_per_session: 2000,
  timeout_ms: 30_000,
  retry: default_retry_config,
  seed: 1,
}

export const default_openmemory_config: openmemory_adapter_config = {
  mode: "inproc",
  user_id: "benchmark-user",
  recall_mode: "deep",
  token_budget: 4096,
  embedding_provider: "fake",
  embedding_model: "text-embedding-3-small",
  embedding_dimensions: 64,
}

export const default_mem0_config: mem0_adapter_config = {
  mode: "unimplemented",
}

export const default_zep_config: zep_adapter_config = {
  mode: "unimplemented",
}

const as_object = (value: unknown): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("invalid config: expected object")
  }
  return value as Record<string, unknown>
}

export const merge_config = <T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown> | undefined,
): T => {
  if (!override) return { ...base }
  const out: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(override)) {
    const base_value = out[key]
    if (typeof base_value === "object" && base_value !== null && !Array.isArray(base_value)) {
      out[key] = merge_config(as_object(base_value), as_object(value))
      continue
    }
    out[key] = value
  }
  return out as T
}
