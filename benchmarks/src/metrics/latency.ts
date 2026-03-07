import type { graded_answer } from "../adapters/types.ts"

export type latency_stats = {
  mean_ms: number
  p50_ms: number
  p95_ms: number
}

export type latency_metrics = {
  ingest: latency_stats
  query: latency_stats
}

const empty_stats = (): latency_stats => ({
  mean_ms: 0,
  p50_ms: 0,
  p95_ms: 0,
})

const percentile = (sorted: number[], p: number): number => {
  if (sorted.length === 0) return 0
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[index]
}

const summarize = (values: number[]): latency_stats => {
  if (values.length === 0) return empty_stats()
  const sorted = values.slice().sort((a, b) => a - b)
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length
  return {
    mean_ms: mean,
    p50_ms: percentile(sorted, 50),
    p95_ms: percentile(sorted, 95),
  }
}

export const compute_latency = (
  rows: graded_answer[],
  ingest_latencies_ms: number[],
): latency_metrics => {
  return {
    ingest: summarize(ingest_latencies_ms),
    query: summarize(rows.map((row) => row.answer_latency_ms)),
  }
}
