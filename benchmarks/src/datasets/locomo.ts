import { readFile } from "node:fs/promises"
import type { BenchmarkDataset, BenchmarkSession, benchmark_category, benchmark_turn } from "../adapters/types.ts"

type locomo_turn = {
  speaker?: unknown
  text?: unknown
  dia_id?: unknown
}

type locomo_question = {
  question?: unknown
  answer?: unknown
  adversarial_answer?: unknown
  category?: unknown
  evidence?: unknown
}

type locomo_sample = {
  sample_id?: unknown
  conversation?: unknown
  qa?: unknown
}

const as_object = (value: unknown, context: string): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`invalid ${context}: expected object`)
  }
  return value as Record<string, unknown>
}

const as_array = (value: unknown, context: string): unknown[] => {
  if (!Array.isArray(value)) throw new Error(`invalid ${context}: expected array`)
  return value
}

const as_string = (value: unknown, context: string): string => {
  if (typeof value !== "string") throw new Error(`invalid ${context}: expected string`)
  return value
}

const maybe_string = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined)

const parse_date_time = (value: string): number | undefined => {
  const normalized = value.replace(" on ", " ")
  const parsed = Date.parse(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

const map_locomo_category = (raw: number): benchmark_category => {
  if (raw === 1) return "single_hop_factual_recall"
  if (raw === 2) return "temporal_reasoning"
  if (raw === 3) return "multi_hop_reasoning"
  if (raw === 4) return "open_domain_knowledge"
  if (raw === 5) return "abstention"
  return "other"
}

const is_session_key = (key: string): boolean =>
  /^session_\d+$/.test(key)

const sort_session_keys = (keys: string[]): string[] => {
  return keys.slice().sort((lhs, rhs) => {
    const a = Number(lhs.split("_")[1] ?? "0")
    const b = Number(rhs.split("_")[1] ?? "0")
    return a - b
  })
}

const parse_turn = (value: unknown, context: string, fallback_id: string): benchmark_turn => {
  const row = as_object(value, context) as locomo_turn
  return {
    id: maybe_string(row.dia_id) ?? fallback_id,
    speaker: as_string(row.speaker, `${context}.speaker`),
    text: as_string(row.text, `${context}.text`),
  }
}

const parse_session = (
  sample_id: string,
  key: string,
  conversation: Record<string, unknown>,
): BenchmarkSession => {
  const rows = as_array(conversation[key], `conversation.${key}`)
  const date_key = `${key}_date_time`
  const date_text = maybe_string(conversation[date_key])
  const turns = rows.map((row, index) =>
    parse_turn(row, `${sample_id}.${key}[${index}]`, `${sample_id}-${key}-turn-${index + 1}`))
  return {
    id: `${sample_id}-${key}`,
    conversation_id: sample_id,
    turns,
    timestamp_ms: date_text ? parse_date_time(date_text) : undefined,
    metadata: date_text ? { date_time: date_text } : undefined,
  }
}

export const load_locomo_dataset = async (
  path: string,
  split = "test",
): Promise<BenchmarkDataset> => {
  const raw = await readFile(path, "utf8")
  const payload = JSON.parse(raw) as unknown
  const rows = as_array(payload, "locomo root array")
  const conversations = rows.map((value, sample_index) => {
    const sample = as_object(value, `locomo[${sample_index}]`) as locomo_sample
    const sample_id = as_string(sample.sample_id, `locomo[${sample_index}].sample_id`)
    const conversation = as_object(sample.conversation, `locomo[${sample_index}].conversation`)
    const session_keys = sort_session_keys(Object.keys(conversation).filter(is_session_key))
    const sessions = session_keys.map((key) => parse_session(sample_id, key, conversation))

    const qa_rows = as_array(sample.qa, `locomo[${sample_index}].qa`)
    const questions = qa_rows.map((row, qa_index) => {
      const qa = as_object(row, `locomo[${sample_index}].qa[${qa_index}]`) as locomo_question
      const category_raw = qa.category
      const category_id = typeof category_raw === "number"
        ? category_raw
        : Number.parseInt(String(category_raw ?? "0"), 10)
      const question = as_string(qa.question, `locomo[${sample_index}].qa[${qa_index}].question`)
      const answer = maybe_string(qa.answer) ?? ""
      const evidence = Array.isArray(qa.evidence)
        ? qa.evidence
          .filter((entry): entry is string => typeof entry === "string")
        : []
      const adversarial_answer = maybe_string(qa.adversarial_answer)
      return {
        id: `${sample_id}-q${qa_index + 1}`,
        conversation_id: sample_id,
        question_text: question,
        expected_answer: answer,
        category: map_locomo_category(Number.isFinite(category_id) ? category_id : 0),
        evidence_turn_ids: evidence,
        metadata: {
          dataset_category: category_id,
          ...(adversarial_answer ? { adversarial_answer } : {}),
        },
      }
    })

    return {
      id: sample_id,
      dataset: "locomo" as const,
      sessions,
      questions,
      metadata: {
        source_sample_index: sample_index,
      },
    }
  })

  return {
    name: "locomo",
    split,
    conversations,
    metadata: {
      source_path: path,
      format: "locomo",
      note: "parsed from official LoCoMo JSON structure",
    },
  }
}
