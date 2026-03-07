type primitive = string | number | boolean | null | undefined

const escape_csv = (value: primitive): string => {
  const raw = value === null || value === undefined ? "" : String(value)
  if (!/[",\n]/.test(raw)) return raw
  return `"${raw.replace(/"/g, "\"\"")}"`
}

const to_rows = (summary: Record<string, unknown>): Array<Record<string, primitive>> => {
  const rows: Array<Record<string, primitive>> = []
  const overall = summary.overall as Record<string, unknown>
  rows.push({
    section: "overall",
    dataset: summary.dataset as primitive,
    adapter: summary.adapter as primitive,
    run_id: summary.run_id as primitive,
    count: overall.count as primitive,
    exact_match: overall.exact_match as primitive,
    f1: overall.f1 as primitive,
    judge_score: overall.judge_score as primitive,
  })
  const per_category = (summary.per_category ?? {}) as Record<string, Record<string, unknown>>
  for (const [category, metrics] of Object.entries(per_category)) {
    rows.push({
      section: "category",
      category,
      count: metrics.count as primitive,
      exact_match: metrics.exact_match as primitive,
      f1: metrics.f1 as primitive,
      judge_score: metrics.judge_score as primitive,
    })
  }
  return rows
}

export const render_summary_csv = (summary: Record<string, unknown>): string => {
  const rows = to_rows(summary)
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
  const out = [headers.join(",")]
  for (const row of rows) {
    out.push(headers.map((header) => escape_csv(row[header])).join(","))
  }
  return `${out.join("\n")}\n`
}
