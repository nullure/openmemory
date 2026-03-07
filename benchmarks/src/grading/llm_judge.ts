import type { llm_judge_config } from "../config.ts"

export type llm_judge_input = {
  question: string
  expected_answer: string
  predicted_answer: string
}

export type llm_judge_output = {
  label: "correct" | "incorrect" | "uncertain"
  score: number
  reason: string
  prompt: string
  raw_response: unknown
}

export type llm_judge_runner = (
  prompt: string,
  config: llm_judge_config,
) => Promise<unknown>

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

export const build_llm_judge_prompt = (input: llm_judge_input): string => {
  return [
    "You are grading memory QA outputs.",
    "Return strict JSON with keys: label, score, reason.",
    "label must be one of: correct, incorrect, uncertain.",
    "score must be a number from 0 to 1.",
    "Do not include markdown.",
    "",
    `QUESTION: ${input.question}`,
    `EXPECTED: ${input.expected_answer}`,
    `PREDICTED: ${input.predicted_answer}`,
  ].join("\n")
}

const parse_judge_payload = (payload: unknown): { label: llm_judge_output["label"]; score: number; reason: string } => {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new Error("invalid llm judge payload")
  }
  const label_raw = (payload as Record<string, unknown>).label
  const score_raw = (payload as Record<string, unknown>).score
  const reason_raw = (payload as Record<string, unknown>).reason
  const label = label_raw === "correct" || label_raw === "incorrect" || label_raw === "uncertain"
    ? label_raw
    : "uncertain"
  const score = typeof score_raw === "number" && Number.isFinite(score_raw) ? clamp(score_raw, 0, 1) : 0
  const reason = typeof reason_raw === "string" ? reason_raw : "no reason returned"
  return { label, score, reason }
}

const default_runner: llm_judge_runner = async (prompt, config) => {
  const api_key = process.env[config.api_key_env]
  if (!api_key) throw new Error(`missing ${config.api_key_env} for llm judge`)
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${api_key}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: config.temperature,
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "judge",
          strict: true,
          schema: {
            type: "object",
            properties: {
              label: { type: "string", enum: ["correct", "incorrect", "uncertain"] },
              score: { type: "number" },
              reason: { type: "string" },
            },
            required: ["label", "score", "reason"],
            additionalProperties: false,
          },
        },
      },
    }),
  })
  if (!response.ok) throw new Error(`llm judge request failed: ${response.status}`)
  const body = await response.json() as Record<string, unknown>
  const output = body.output
  if (!Array.isArray(output)) return body
  for (const item of output) {
    if (typeof item !== "object" || item === null) continue
    const content = (item as Record<string, unknown>).content
    if (!Array.isArray(content)) continue
    for (const part of content) {
      if (typeof part !== "object" || part === null) continue
      const text = (part as Record<string, unknown>).text
      if (typeof text !== "string") continue
      try {
        return JSON.parse(text) as unknown
      } catch {
        continue
      }
    }
  }
  return body
}

export const grade_with_llm_judge = async (
  config: llm_judge_config,
  input: llm_judge_input,
  runner: llm_judge_runner = default_runner,
): Promise<llm_judge_output | null> => {
  if (!config.enabled) return null
  const prompt = build_llm_judge_prompt(input)
  const raw = await runner(prompt, config)
  const parsed = parse_judge_payload(raw)
  return {
    ...parsed,
    prompt,
    raw_response: raw,
  }
}
