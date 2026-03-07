export type benchmark_dataset_name = "locomo" | "longmemeval"

export type benchmark_adapter_name = "openmemory" | "mem0" | "zep"

export type benchmark_category =
  | "single_hop_factual_recall"
  | "multi_hop_reasoning"
  | "temporal_reasoning"
  | "user_preference_memory"
  | "multi_session_synthesis"
  | "knowledge_update"
  | "open_domain_knowledge"
  | "abstention"
  | "other"

export type benchmark_turn = {
  id: string
  speaker: string
  text: string
  timestamp_ms?: number
  metadata?: Record<string, unknown>
}

export type BenchmarkSession = {
  id: string
  conversation_id: string
  turns: benchmark_turn[]
  timestamp_ms?: number
  metadata?: Record<string, unknown>
}

export type BenchmarkQuestion = {
  id: string
  conversation_id: string
  question_text: string
  expected_answer: string
  category: benchmark_category
  evidence_turn_ids: string[]
  metadata?: Record<string, unknown>
}

export type BenchmarkConversation = {
  id: string
  dataset: benchmark_dataset_name
  sessions: BenchmarkSession[]
  questions: BenchmarkQuestion[]
  metadata?: Record<string, unknown>
}

export type BenchmarkDataset = {
  name: benchmark_dataset_name
  split: string
  conversations: BenchmarkConversation[]
  metadata: Record<string, unknown>
}

export type benchmark_retrieved_context_item = {
  memory_node_id?: string
  text?: string
  score?: number
  metadata?: Record<string, unknown>
}

export type BenchmarkAnswer = {
  question_id: string
  answer_text: string
  latency_ms: number
  prompt_tokens: number
  retrieved_context_tokens: number
  retrieved_context_size: number
  retrieved_context?: benchmark_retrieved_context_item[]
  traces?: unknown
  raw?: unknown
  metadata?: Record<string, unknown>
}

export interface MemorySystemAdapter {
  name(): string
  setup(config: Record<string, unknown>): Promise<void>
  reset(): Promise<void>
  ingestConversation(session: BenchmarkSession): Promise<void>
  answerQuestion(input: BenchmarkQuestion): Promise<BenchmarkAnswer>
  teardown(): Promise<void>
  metadata?(): Record<string, unknown>
}

export type graded_answer = {
  dataset: benchmark_dataset_name
  adapter: benchmark_adapter_name | string
  conversation_id: string
  question_id: string
  category: benchmark_category
  question_text: string
  expected_answer: string
  raw_answer_text: string
  normalized_expected: string
  normalized_answer: string
  exact_match: number
  f1: number
  judge_label?: "correct" | "incorrect" | "uncertain"
  judge_score?: number
  judge_reason?: string
  answer_latency_ms: number
  prompt_tokens: number
  retrieved_context_tokens: number
  retrieved_context_size: number
  memory_usage_bytes?: number
  retries: number
  error?: string
  traces?: unknown
  raw?: unknown
}

export type run_outcome = {
  run_id: string
  dataset: benchmark_dataset_name
  split: string
  adapter: string
  run_dir: string
  started_at: string
  finished_at: string
  metadata: Record<string, unknown>
  graded_answers: graded_answer[]
}
