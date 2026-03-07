const num = (value: unknown, digits = 4): string =>
  typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits) : "-"

const section_table = (title: string, entries: Array<[string, unknown]>): string => {
  const lines = [`## ${title}`, "", "| Metric | Value |", "| --- | --- |"]
  for (const [key, value] of entries) lines.push(`| ${key} | ${typeof value === "number" ? num(value) : String(value)} |`)
  lines.push("")
  return lines.join("\n")
}

export const render_summary_markdown = (summary: Record<string, unknown>): string => {
  const overall = (summary.overall ?? {}) as Record<string, unknown>
  const latency = (summary.latency ?? {}) as Record<string, unknown>
  const tokens = (summary.tokens ?? {}) as Record<string, unknown>
  const memory_usage = (summary.memory_usage ?? {}) as Record<string, unknown>
  const per_category = (summary.per_category ?? {}) as Record<string, Record<string, unknown>>

  const lines: string[] = []
  lines.push(`# Benchmark Report: ${summary.adapter} on ${summary.dataset}`)
  lines.push("")
  lines.push(`- run_id: ${String(summary.run_id)}`)
  lines.push(`- split: ${String(summary.split)}`)
  lines.push(`- timestamp: ${String(summary.finished_at ?? summary.timestamp ?? "")}`)
  lines.push("")

  lines.push(section_table("Overall", [
    ["Count", overall.count],
    ["Exact Match", overall.exact_match],
    ["F1", overall.f1],
    ["Judge Score", overall.judge_score],
  ]))

  const query = (latency.query ?? {}) as Record<string, unknown>
  const ingest = (latency.ingest ?? {}) as Record<string, unknown>
  lines.push(section_table("Latency", [
    ["Ingest Mean (ms)", ingest.mean_ms],
    ["Ingest P50 (ms)", ingest.p50_ms],
    ["Ingest P95 (ms)", ingest.p95_ms],
    ["Query Mean (ms)", query.mean_ms],
    ["Query P50 (ms)", query.p50_ms],
    ["Query P95 (ms)", query.p95_ms],
  ]))

  lines.push(section_table("Token Usage", [
    ["Average Prompt Tokens", tokens.average_prompt_tokens],
    ["Average Retrieved Context Tokens", tokens.average_retrieved_context_tokens],
    ["Average Retrieved Context Size", tokens.average_retrieved_context_size],
  ]))

  lines.push(section_table("Memory Usage", [
    ["Measurable Count", memory_usage.measurable_count],
    ["Average Bytes", memory_usage.average_bytes],
    ["Max Bytes", memory_usage.max_bytes],
  ]))

  lines.push("## Per-Category")
  lines.push("")
  lines.push("| Category | Count | Exact | F1 | Judge |")
  lines.push("| --- | --- | --- | --- | --- |")
  for (const [category, metrics] of Object.entries(per_category)) {
    lines.push(
      `| ${category} | ${String(metrics.count ?? 0)} | ${num(metrics.exact_match)} | ${num(metrics.f1)} | ${num(metrics.judge_score)} |`,
    )
  }
  lines.push("")

  lines.push("## Config")
  lines.push("")
  lines.push("```json")
  lines.push(JSON.stringify(summary.config ?? {}, null, 2))
  lines.push("```")
  lines.push("")

  lines.push("## System Metadata")
  lines.push("")
  lines.push("```json")
  lines.push(JSON.stringify(summary.system_metadata ?? {}, null, 2))
  lines.push("```")
  lines.push("")
  return `${lines.join("\n")}\n`
}
