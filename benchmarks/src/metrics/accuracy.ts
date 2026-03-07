import type { graded_answer } from "../adapters/types.ts"

export type accuracy_metrics = {
  count: number
  exact_match: number
  f1: number
  judge_score: number | null
}

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

export const compute_accuracy = (rows: graded_answer[]): accuracy_metrics => {
  const exact = rows.map((row) => row.exact_match)
  const f1 = rows.map((row) => row.f1)
  const judge = rows.map((row) => row.judge_score).filter((value): value is number => typeof value === "number")
  return {
    count: rows.length,
    exact_match: average(exact),
    f1: average(f1),
    judge_score: judge.length ? average(judge) : null,
  }
}
