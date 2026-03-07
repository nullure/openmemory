import test from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath } from "node:url"
import { run_benchmark } from "../src/runner.ts"

const fixture_path = (name: string): string =>
  fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url))

test("runner supports resumable runs", async () => {
  const output_dir = await mkdtemp(join(tmpdir(), "openmemory-benchmark-resume-"))
  const config = {
    dataset: {
      name: "locomo" as const,
      path: fixture_path("locomo.json"),
      split: "test",
    },
    adapter: "openmemory" as const,
    adapter_config: {
      mode: "inproc",
      user_id: "resume-user",
      recall_mode: "deep",
      token_budget: 1024,
      embedding_provider: "fake",
      embedding_dimensions: 8,
    },
    output_dir,
    resume: true,
    fairness: {
      question_limit: 2,
      max_turns_per_session: 100,
      timeout_ms: 30_000,
      retry: { max_attempts: 1, base_delay_ms: 1, max_delay_ms: 1 },
      seed: 1,
    },
    llm_judge: {
      enabled: false,
      provider: "openai" as const,
      model: "gpt-4.1-mini",
      api_key_env: "OPENAI_API_KEY",
      endpoint: "https://api.openai.com/v1/responses",
      temperature: 0,
      f1_threshold: 0.99,
    },
  }

  const first = await run_benchmark(config)
  assert.ok(first.counts.graded >= 1)

  const second = await run_benchmark(config)
  assert.ok(second.counts.resumed >= first.counts.graded)
})

test("runner continues after per-question adapter failures", async () => {
  const output_dir = await mkdtemp(join(tmpdir(), "openmemory-benchmark-failure-"))
  const replay_file = join(output_dir, "mem0_replay.jsonl")
  await writeFile(
    replay_file,
    "{\"question_id\":\"S1-q1\",\"answer_text\":\"Alice\",\"latency_ms\":5,\"prompt_tokens\":2,\"retrieved_context_tokens\":2,\"retrieved_context_size\":1}\n",
    "utf8",
  )

  const summary = await run_benchmark({
    dataset: {
      name: "locomo",
      path: fixture_path("locomo.json"),
      split: "test",
    },
    adapter: "mem0",
    adapter_config: {
      mode: "replay",
      replay_file,
    },
    output_dir,
    resume: false,
    fairness: {
      question_limit: 2,
      max_turns_per_session: 100,
      timeout_ms: 30_000,
      retry: { max_attempts: 1, base_delay_ms: 1, max_delay_ms: 1 },
      seed: 1,
    },
    llm_judge: {
      enabled: false,
      provider: "openai",
      model: "gpt-4.1-mini",
      api_key_env: "OPENAI_API_KEY",
      endpoint: "https://api.openai.com/v1/responses",
      temperature: 0,
      f1_threshold: 0.99,
    },
    selected_question_ids: ["S1-q1", "S1-q2"],
  })

  assert.equal(summary.counts.questions_total, 2)
  assert.equal(summary.counts.graded, 1)
  assert.ok(summary.counts.errors >= 1)
})
