import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { createHash } from "node:crypto"
import {
  default_fairness_config,
  default_llm_judge_config,
  default_mem0_config,
  default_openmemory_config,
  default_zep_config,
  merge_config,
  type benchmark_compare_config,
  type benchmark_run_config,
  type dataset_config,
  type fairness_config,
} from "./config.ts"
import { create_openmemory_adapter } from "./adapters/openmemory.ts"
import { create_mem0_adapter } from "./adapters/mem0.ts"
import { create_zep_adapter } from "./adapters/zep.ts"
import type {
  BenchmarkDataset,
  BenchmarkQuestion,
  benchmark_adapter_name,
  graded_answer,
  MemorySystemAdapter,
} from "./adapters/types.ts"
import { load_locomo_dataset } from "./datasets/locomo.ts"
import { load_longmemeval_dataset } from "./datasets/longmemeval.ts"
import { exact_match_score } from "./grading/exact.ts"
import { token_f1_score } from "./grading/f1.ts"
import { grade_with_llm_judge } from "./grading/llm_judge.ts"
import { compute_accuracy } from "./metrics/accuracy.ts"
import { compute_latency } from "./metrics/latency.ts"
import { compute_memory_usage } from "./metrics/memory_usage.ts"
import { compute_per_category } from "./metrics/per_category.ts"
import { compute_token_metrics } from "./metrics/tokens.ts"
import { render_summary_csv } from "./reports/csv.ts"
import { write_summary_json } from "./reports/json.ts"
import { render_summary_markdown } from "./reports/markdown.ts"
import { append_jsonl, read_jsonl, write_json } from "./utils/jsonl.ts"
import { normalize_text } from "./utils/normalize.ts"
import { retry_async, with_timeout } from "./utils/retry.ts"
import { time_async } from "./utils/timer.ts"

type flat_question = {
  conversation_id: string
  question: BenchmarkQuestion
}

type ingest_row = {
  conversation_id: string
  session_id: string
  latency_ms: number
  turn_count: number
}

type error_row = {
  stage: "setup" | "ingest" | "answer" | "teardown"
  conversation_id?: string
  question_id?: string
  session_id?: string
  message: string
  timestamp: string
}

export type run_summary = {
  run_id: string
  dataset: string
  split: string
  adapter: string
  started_at: string
  finished_at: string
  overall: ReturnType<typeof compute_accuracy>
  per_category: ReturnType<typeof compute_per_category>
  latency: ReturnType<typeof compute_latency>
  tokens: ReturnType<typeof compute_token_metrics>
  memory_usage: ReturnType<typeof compute_memory_usage>
  counts: {
    questions_total: number
    graded: number
    errors: number
    skipped: number
    resumed: number
  }
  config: Record<string, unknown>
  system_metadata: Record<string, unknown>
  artifacts: Record<string, string>
}

const create_run_id = (dataset: string, adapter: string): string => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  return `run-${stamp}-${dataset}-${adapter}`
}

const dataset_loader = async (config: dataset_config): Promise<BenchmarkDataset> => {
  if (config.name === "locomo") return load_locomo_dataset(config.path, config.split)
  if (config.name === "longmemeval") return load_longmemeval_dataset(config.path, config.split)
  throw new Error(`unsupported dataset: ${config.name}`)
}

const create_adapter = (name: benchmark_adapter_name): MemorySystemAdapter => {
  if (name === "openmemory") return create_openmemory_adapter()
  if (name === "mem0") return create_mem0_adapter()
  if (name === "zep") return create_zep_adapter()
  throw new Error(`unsupported adapter: ${name}`)
}

const hash_seed = (seed: number, key: string): number => {
  const digest = createHash("sha1").update(`${seed}:${key}`).digest("hex").slice(0, 8)
  return Number.parseInt(digest, 16) >>> 0
}

const choose_questions = (
  dataset: BenchmarkDataset,
  fairness: fairness_config,
  selected_question_ids?: string[],
): flat_question[] => {
  const flat = dataset.conversations.flatMap((conversation) =>
    conversation.questions.map((question) => ({
      conversation_id: conversation.id,
      question,
    })))

  const selected = selected_question_ids
    ? flat.filter((entry) => selected_question_ids.includes(entry.question.id))
    : flat

  const sorted = selected
    .slice()
    .sort((lhs, rhs) => {
      const seed_a = hash_seed(fairness.seed, lhs.question.id)
      const seed_b = hash_seed(fairness.seed, rhs.question.id)
      if (seed_a !== seed_b) return seed_a - seed_b
      return lhs.question.id.localeCompare(rhs.question.id)
    })

  if (fairness.question_limit === null) return sorted
  return sorted.slice(0, Math.max(0, fairness.question_limit))
}

const build_artifact_paths = (run_dir: string): Record<string, string> => ({
  config: join(run_dir, "config.json"),
  metadata: join(run_dir, "metadata.json"),
  raw_answers: join(run_dir, "raw_answers.jsonl"),
  grading: join(run_dir, "grading.jsonl"),
  ingest: join(run_dir, "ingest.jsonl"),
  errors: join(run_dir, "errors.jsonl"),
  retries: join(run_dir, "retries.jsonl"),
  judge: join(run_dir, "judge.jsonl"),
  summary_json: join(run_dir, "summary.json"),
  summary_csv: join(run_dir, "summary.csv"),
  summary_md: join(run_dir, "report.md"),
})

const write_reports = async (summary: run_summary, paths: Record<string, string>): Promise<void> => {
  await write_summary_json(paths.summary_json, summary)
  await writeFile(paths.summary_csv, render_summary_csv(summary as unknown as Record<string, unknown>), "utf8")
  await writeFile(paths.summary_md, render_summary_markdown(summary as unknown as Record<string, unknown>), "utf8")
}

const build_default_adapter_config = (name: benchmark_adapter_name): Record<string, unknown> => {
  if (name === "openmemory") return { ...default_openmemory_config }
  if (name === "mem0") return { ...default_mem0_config }
  return { ...default_zep_config }
}

const merge_run = (input: benchmark_run_config): benchmark_run_config => {
  const fairness = merge_config(default_fairness_config, input.fairness as Record<string, unknown>)
  const llm_judge = merge_config(default_llm_judge_config, input.llm_judge as Record<string, unknown>)
  const adapter_config = merge_config(build_default_adapter_config(input.adapter), input.adapter_config)
  return {
    ...input,
    fairness,
    llm_judge,
    adapter_config,
  }
}

const filter_sessions_for_fairness = (dataset: BenchmarkDataset, fairness: fairness_config): BenchmarkDataset => {
  if (fairness.max_turns_per_session <= 0) return dataset
  return {
    ...dataset,
    conversations: dataset.conversations.map((conversation) => ({
      ...conversation,
      sessions: conversation.sessions.map((session) => ({
        ...session,
        turns: session.turns.slice(0, fairness.max_turns_per_session),
      })),
    })),
  }
}

const load_completed = async (grading_path: string): Promise<Map<string, graded_answer>> => {
  const rows = await read_jsonl<graded_answer>(grading_path)
  return new Map(rows.map((row) => [row.question_id, row]))
}

const record_error = async (paths: Record<string, string>, error: error_row): Promise<void> => {
  await append_jsonl(paths.errors, error)
}

const run_single = async (
  input: benchmark_run_config,
  dataset_input?: BenchmarkDataset,
): Promise<run_summary> => {
  const config = merge_run(input)
  const started_at = new Date().toISOString()
  const run_id = create_run_id(config.dataset.name, config.adapter)
  const run_dir = config.resume ? join(config.output_dir, `${config.dataset.name}-${config.adapter}`) : join(config.output_dir, run_id)
  await mkdir(run_dir, { recursive: true })

  const paths = build_artifact_paths(run_dir)
  await write_json(paths.config, config)

  const dataset_raw = dataset_input ?? await dataset_loader(config.dataset)
  const dataset = filter_sessions_for_fairness(dataset_raw, config.fairness)
  const selected_questions = choose_questions(dataset, config.fairness, config.selected_question_ids)
  const selected_ids = new Set(selected_questions.map((entry) => entry.question.id))

  const adapter = create_adapter(config.adapter)
  const completed = config.resume ? await load_completed(paths.grading) : new Map<string, graded_answer>()
  const ingest_rows = config.resume ? await read_jsonl<ingest_row>(paths.ingest) : []

  const graded: graded_answer[] = Array.from(completed.values())
  let errors = 0
  let skipped = 0
  let resumed = completed.size
  let metadata: Record<string, unknown> = {}
  let setup_ok = false

  try {
    const merged_adapter_config = config.adapter_config
    await with_timeout(adapter.setup(merged_adapter_config), config.fairness.timeout_ms, "adapter setup timeout")
    setup_ok = true
    metadata = adapter.metadata?.() ?? {}
  } catch (error) {
    errors += 1
    await record_error(paths, {
      stage: "setup",
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    })
  }

  if (setup_ok) {
    for (const conversation of dataset.conversations) {
      const conversation_questions = conversation.questions.filter((question) => selected_ids.has(question.id))
      if (conversation_questions.length === 0) continue
      const unanswered = conversation_questions.filter((question) => !completed.has(question.id))
      if (unanswered.length === 0) {
        skipped += conversation_questions.length
        continue
      }

      try {
        await with_timeout(adapter.reset(), config.fairness.timeout_ms, "adapter reset timeout")
      } catch (error) {
        errors += 1
        for (const question of unanswered) {
          await record_error(paths, {
            stage: "ingest",
            conversation_id: conversation.id,
            question_id: question.id,
            message: `adapter reset failed: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date().toISOString(),
          })
        }
        continue
      }

      for (const session of conversation.sessions) {
        try {
          const { elapsed_ms } = await time_async(async () =>
            with_timeout(adapter.ingestConversation(session), config.fairness.timeout_ms, "ingest timeout"))
          const row: ingest_row = {
            conversation_id: conversation.id,
            session_id: session.id,
            latency_ms: elapsed_ms,
            turn_count: session.turns.length,
          }
          ingest_rows.push(row)
          await append_jsonl(paths.ingest, row)
        } catch (error) {
          errors += 1
          await record_error(paths, {
            stage: "ingest",
            conversation_id: conversation.id,
            session_id: session.id,
            message: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          })
        }
      }

      for (const question of unanswered) {
        try {
          const retried = await retry_async(
            async () =>
              with_timeout(adapter.answerQuestion(question), config.fairness.timeout_ms, "answer timeout"),
            config.fairness.retry,
            async (attempt, error, backoff_ms) => {
              await append_jsonl(paths.retries, {
                question_id: question.id,
                attempt,
                backoff_ms,
                message: error.message,
                timestamp: new Date().toISOString(),
              })
            },
          )
          const answer = retried.value
          const normalized_expected = normalize_text(question.expected_answer)
          const normalized_answer = normalize_text(answer.answer_text)
          const exact = exact_match_score(question.expected_answer, answer.answer_text, question.category)
          const f1 = token_f1_score(question.expected_answer, answer.answer_text)
          const judge = exact === 0 && f1 < config.llm_judge.f1_threshold
            ? await grade_with_llm_judge(config.llm_judge, {
              question: question.question_text,
              expected_answer: question.expected_answer,
              predicted_answer: answer.answer_text,
            })
            : null
          if (judge) {
            await append_jsonl(paths.judge, {
              question_id: question.id,
              prompt: judge.prompt,
              label: judge.label,
              score: judge.score,
              reason: judge.reason,
              raw_response: judge.raw_response,
            })
          }

          const row: graded_answer = {
            dataset: dataset.name,
            adapter: adapter.name(),
            conversation_id: conversation.id,
            question_id: question.id,
            category: question.category,
            question_text: question.question_text,
            expected_answer: question.expected_answer,
            raw_answer_text: answer.answer_text,
            normalized_expected,
            normalized_answer,
            exact_match: exact,
            f1,
            judge_label: judge?.label,
            judge_score: judge?.score,
            judge_reason: judge?.reason,
            answer_latency_ms: answer.latency_ms,
            prompt_tokens: answer.prompt_tokens,
            retrieved_context_tokens: answer.retrieved_context_tokens,
            retrieved_context_size: answer.retrieved_context_size,
            memory_usage_bytes: typeof answer.metadata?.memory_usage_bytes === "number"
              ? answer.metadata.memory_usage_bytes
              : undefined,
            retries: retried.attempts - 1,
            traces: answer.traces,
            raw: answer.raw,
          }
          graded.push(row)
          completed.set(question.id, row)
          await append_jsonl(paths.raw_answers, {
            question_id: question.id,
            conversation_id: conversation.id,
            raw_answer_text: answer.answer_text,
            normalized_answer,
            answer,
          })
          await append_jsonl(paths.grading, row)
        } catch (error) {
          errors += 1
          await record_error(paths, {
            stage: "answer",
            conversation_id: conversation.id,
            question_id: question.id,
            message: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          })
        }
      }
    }
  }

  try {
    await adapter.teardown()
  } catch (error) {
    errors += 1
    await record_error(paths, {
      stage: "teardown",
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    })
  }

  const finished_at = new Date().toISOString()
  const overall = compute_accuracy(graded)
  const per_category = compute_per_category(graded)
  const latency = compute_latency(graded, ingest_rows.map((row) => row.latency_ms))
  const tokens = compute_token_metrics(graded)
  const memory_usage = compute_memory_usage(graded)

  const summary: run_summary = {
    run_id,
    dataset: dataset.name,
    split: dataset.split,
    adapter: adapter.name(),
    started_at,
    finished_at,
    overall,
    per_category,
    latency,
    tokens,
    memory_usage,
    counts: {
      questions_total: selected_questions.length,
      graded: graded.length,
      errors,
      skipped,
      resumed,
    },
    config: {
      dataset: config.dataset,
      adapter: config.adapter,
      adapter_config: config.adapter_config,
      fairness: config.fairness,
      llm_judge: config.llm_judge,
      selected_question_ids: config.selected_question_ids ?? null,
    },
    system_metadata: {
      dataset_metadata: dataset.metadata,
      adapter_metadata: metadata,
      fairness_rules_applied: {
        same_dataset_split: true,
        same_question_set: true,
        same_grading_logic: true,
        same_timeout_rules: true,
        same_retry_rules: true,
        same_answer_normalization: true,
      },
    },
    artifacts: paths,
  }

  await write_json(paths.metadata, {
    run_id,
    started_at,
    finished_at,
    adapter: config.adapter,
    dataset: config.dataset,
    system_metadata: summary.system_metadata,
  })
  await write_reports(summary, paths)
  return summary
}

export const run_benchmark = async (config: benchmark_run_config): Promise<run_summary> =>
  run_single(config)

export const compare_benchmarks = async (
  config: benchmark_compare_config,
): Promise<run_summary[]> => {
  const fairness = merge_config(default_fairness_config, config.fairness as Record<string, unknown>)
  const llm_judge = merge_config(default_llm_judge_config, config.llm_judge as Record<string, unknown>)
  const out: run_summary[] = []
  for (const dataset_cfg of config.datasets) {
    const dataset = await dataset_loader(dataset_cfg)
    const selected_ids = choose_questions(dataset, fairness).map((entry) => entry.question.id)
    for (const adapter of config.adapters) {
      const adapter_cfg = config.adapter_configs[adapter] ?? build_default_adapter_config(adapter)
      const summary = await run_single({
        dataset: dataset_cfg,
        adapter,
        adapter_config: adapter_cfg,
        output_dir: config.output_dir,
        resume: true,
        fairness,
        llm_judge,
        selected_question_ids: selected_ids,
      }, dataset)
      out.push(summary)
    }
  }
  return out
}

export const regenerate_report = async (run_dir: string): Promise<run_summary> => {
  const summary_path = join(run_dir, "summary.json")
  const raw = await readFile(summary_path, "utf8")
  const item = JSON.parse(raw) as run_summary
  const artifacts = build_artifact_paths(run_dir)
  await write_reports(item, artifacts)
  return item
}
