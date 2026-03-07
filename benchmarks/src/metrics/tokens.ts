import type { graded_answer } from "../adapters/types.ts"

export type token_metrics = {
  average_prompt_tokens: number
  average_retrieved_context_tokens: number
  average_retrieved_context_size: number
}

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

export const compute_token_metrics = (rows: graded_answer[]): token_metrics => {
  return {
    average_prompt_tokens: average(rows.map((row) => row.prompt_tokens)),
    average_retrieved_context_tokens: average(rows.map((row) => row.retrieved_context_tokens)),
    average_retrieved_context_size: average(rows.map((row) => row.retrieved_context_size)),
  }
}
