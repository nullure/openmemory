import { tokenize } from "../utils/normalize.ts"

const token_counts = (tokens: string[]): Map<string, number> => {
  const counts = new Map<string, number>()
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1)
  return counts
}

export const token_f1_score = (expected_answer: string, predicted_answer: string): number => {
  const expected_tokens = tokenize(expected_answer)
  const predicted_tokens = tokenize(predicted_answer)
  if (expected_tokens.length === 0 && predicted_tokens.length === 0) return 1
  if (expected_tokens.length === 0 || predicted_tokens.length === 0) return 0

  const expected_counts = token_counts(expected_tokens)
  const predicted_counts = token_counts(predicted_tokens)
  let overlap = 0
  for (const [token, count] of expected_counts.entries()) {
    const rhs = predicted_counts.get(token) ?? 0
    overlap += Math.min(count, rhs)
  }
  if (overlap === 0) return 0
  const precision = overlap / predicted_tokens.length
  const recall = overlap / expected_tokens.length
  return (2 * precision * recall) / (precision + recall)
}
