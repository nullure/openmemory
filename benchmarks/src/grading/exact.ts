import type { benchmark_category } from "../adapters/types.ts"
import { normalize_text } from "../utils/normalize.ts"

const abstention_markers = [
  "i dont know",
  "i don t know",
  "i do not know",
  "cannot determine",
  "insufficient information",
  "not enough information",
  "unknown",
]

const is_abstention = (value: string): boolean => {
  const normalized = normalize_text(value)
  if (!normalized) return false
  return abstention_markers.some((marker) => normalized.includes(marker))
}

export const exact_match_score = (
  expected_answer: string,
  predicted_answer: string,
  category: benchmark_category,
): number => {
  if (category === "abstention") return is_abstention(predicted_answer) ? 1 : 0
  const lhs = normalize_text(expected_answer)
  const rhs = normalize_text(predicted_answer)
  return lhs.length > 0 && lhs === rhs ? 1 : 0
}
