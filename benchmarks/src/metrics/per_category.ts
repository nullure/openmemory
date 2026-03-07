import type { benchmark_category, graded_answer } from "../adapters/types.ts"
import { compute_accuracy, type accuracy_metrics } from "./accuracy.ts"

export type per_category_metrics = Record<benchmark_category, accuracy_metrics>

const categories: benchmark_category[] = [
  "single_hop_factual_recall",
  "multi_hop_reasoning",
  "temporal_reasoning",
  "user_preference_memory",
  "multi_session_synthesis",
  "knowledge_update",
  "open_domain_knowledge",
  "abstention",
  "other",
]

export const compute_per_category = (rows: graded_answer[]): per_category_metrics => {
  const out = {} as per_category_metrics
  for (const category of categories) {
    out[category] = compute_accuracy(rows.filter((row) => row.category === category))
  }
  return out
}
