import type { graded_answer } from "../adapters/types.ts"

export type memory_usage_metrics = {
  measurable_count: number
  average_bytes: number | null
  max_bytes: number | null
}

export const compute_memory_usage = (rows: graded_answer[]): memory_usage_metrics => {
  const values = rows
    .map((row) => row.memory_usage_bytes)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0)
  if (values.length === 0) {
    return {
      measurable_count: 0,
      average_bytes: null,
      max_bytes: null,
    }
  }
  return {
    measurable_count: values.length,
    average_bytes: values.reduce((sum, value) => sum + value, 0) / values.length,
    max_bytes: values.reduce((max, value) => Math.max(max, value), 0),
  }
}
