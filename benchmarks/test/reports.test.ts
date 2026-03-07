import test from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, readFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { render_summary_csv } from "../src/reports/csv.ts"
import { render_summary_markdown } from "../src/reports/markdown.ts"
import { write_summary_json } from "../src/reports/json.ts"

const summary = {
  run_id: "run-1",
  dataset: "locomo",
  split: "test",
  adapter: "openmemory",
  overall: { count: 2, exact_match: 0.5, f1: 0.75, judge_score: null },
  per_category: {
    single_hop_factual_recall: { count: 1, exact_match: 1, f1: 1, judge_score: null },
    temporal_reasoning: { count: 1, exact_match: 0, f1: 0.5, judge_score: null },
  },
  latency: {
    ingest: { mean_ms: 10, p50_ms: 8, p95_ms: 14 },
    query: { mean_ms: 5, p50_ms: 4, p95_ms: 8 },
  },
  tokens: {
    average_prompt_tokens: 11,
    average_retrieved_context_tokens: 22,
    average_retrieved_context_size: 2,
  },
  memory_usage: {
    measurable_count: 2,
    average_bytes: 1024,
    max_bytes: 2048,
  },
  config: { fairness: { timeout_ms: 1000 } },
  system_metadata: { adapter: { mode: "inproc" } },
  finished_at: "2026-01-01T00:00:00.000Z",
}

test("csv report rendering includes overall and category rows", () => {
  const csv = render_summary_csv(summary)
  assert.ok(csv.includes("section"))
  assert.ok(csv.includes("overall"))
  assert.ok(csv.includes("category"))
})

test("markdown report rendering includes key sections", () => {
  const markdown = render_summary_markdown(summary)
  assert.ok(markdown.includes("# Benchmark Report"))
  assert.ok(markdown.includes("## Overall"))
  assert.ok(markdown.includes("## Per-Category"))
})

test("json summary writer persists report payload", async () => {
  const dir = await mkdtemp(join(tmpdir(), "openmemory-benchmark-report-"))
  const output = join(dir, "summary.json")
  await write_summary_json(output, summary)
  const raw = await readFile(output, "utf8")
  const parsed = JSON.parse(raw) as { run_id: string }
  assert.equal(parsed.run_id, "run-1")
})
