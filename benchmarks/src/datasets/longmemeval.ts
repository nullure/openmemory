import { readFile } from "node:fs/promises"
import type { BenchmarkDataset, BenchmarkSession, benchmark_category, benchmark_turn } from "../adapters/types.ts"

type longmemeval_row = {
  question_id?: unknown
  question?: unknown
  answer?: unknown
  question_type?: unknown
  answer_type?: unknown
  question_date?: unknown
  haystack_dates?: unknown
  haystack_session_ids?: unknown
  haystack_session_names?: unknown
  haystack_sessions?: unknown
  answer_session_ids?: unknown
  answer_session_names?: unknown
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

const as_optional_string_array = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === "string")
}

const parse_pair_turn = (value: unknown, context: string, fallback_id: string): benchmark_turn => {
  if (Array.isArray(value) && value.length >= 2) {
    const speaker = String(value[0] ?? "unknown")
    const text = String(value[1] ?? "")
    return { id: fallback_id, speaker, text }
  }
  const row = as_object(value, context)
  const speaker = typeof row.speaker === "string" ? row.speaker : "unknown"
  const text = typeof row.text === "string" ? row.text : ""
  return { id: fallback_id, speaker, text }
}

const map_longmemeval_category = (question_type_raw: string, answer_type_raw: string, question_id: string): benchmark_category => {
  const question_type = question_type_raw.toLowerCase()
  const answer_type = answer_type_raw.toLowerCase()
  if (question_id.toLowerCase().endsWith("_abs")) return "abstention"
  if (answer_type.includes("unanswerable") || answer_type.includes("abstain")) return "abstention"
  if (question_type.includes("temporal")) return "temporal_reasoning"
  if (question_type.includes("knowledge-update")) return "knowledge_update"
  if (question_type.includes("preference")) return "user_preference_memory"
  if (question_type.includes("multi-session")) return "multi_session_synthesis"
  if (question_type.includes("multi-hop")) return "multi_hop_reasoning"
  if (question_type.includes("single-session")) return "single_hop_factual_recall"
  return "other"
}

const parse_session = (
  row: longmemeval_row,
  conversation_id: string,
  session_index: number,
): BenchmarkSession => {
  const session_ids = as_optional_string_array(row.haystack_session_ids)
  const session_names = as_optional_string_array(row.haystack_session_names)
  const session_dates = as_optional_string_array(row.haystack_dates)
  const sessions = as_array(row.haystack_sessions, `${conversation_id}.haystack_sessions`)
  const turn_rows = as_array(sessions[session_index], `${conversation_id}.haystack_sessions[${session_index}]`)
  const turns = turn_rows.map((turn_row, turn_index) =>
    parse_pair_turn(turn_row, `${conversation_id}.haystack_sessions[${session_index}][${turn_index}]`, `${conversation_id}-s${session_index + 1}-t${turn_index + 1}`))

  const session_id = session_ids[session_index] ?? `${conversation_id}-session-${session_index + 1}`
  const session_name = session_names[session_index]
  const session_date = session_dates[session_index]
  const parsed_time = session_date ? Date.parse(session_date) : Number.NaN
  return {
    id: session_id,
    conversation_id,
    turns,
    timestamp_ms: Number.isFinite(parsed_time) ? parsed_time : undefined,
    metadata: {
      ...(session_name ? { session_name } : {}),
      ...(session_date ? { session_date } : {}),
    },
  }
}

export const load_longmemeval_dataset = async (
  path: string,
  split = "test",
): Promise<BenchmarkDataset> => {
  const raw = await readFile(path, "utf8")
  const payload = JSON.parse(raw) as unknown
  const rows = as_array(payload, "longmemeval root array")
  const conversations = rows.map((value, row_index) => {
    const row = as_object(value, `longmemeval[${row_index}]`) as longmemeval_row
    const question_id = as_string(row.question_id, `longmemeval[${row_index}].question_id`)
    const question_text = as_string(row.question, `longmemeval[${row_index}].question`)
    const answer_text = as_string(row.answer, `longmemeval[${row_index}].answer`)
    const question_type = as_string(row.question_type, `longmemeval[${row_index}].question_type`)
    const answer_type = typeof row.answer_type === "string" ? row.answer_type : ""
    const haystack_sessions = as_array(row.haystack_sessions, `longmemeval[${row_index}].haystack_sessions`)
    const sessions = haystack_sessions.map((_, session_index) => parse_session(row, question_id, session_index))
    const evidence_ids = as_optional_string_array(row.answer_session_ids)
    const evidence_names = as_optional_string_array(row.answer_session_names)
    const question_date = typeof row.question_date === "string" ? row.question_date : undefined
    const category = map_longmemeval_category(question_type, answer_type, question_id)
    return {
      id: question_id,
      dataset: "longmemeval" as const,
      sessions,
      questions: [{
        id: question_id,
        conversation_id: question_id,
        question_text,
        expected_answer: answer_text,
        category,
        evidence_turn_ids: evidence_ids,
        metadata: {
          question_type,
          ...(answer_type ? { answer_type } : {}),
          ...(question_date ? { question_date } : {}),
          ...(evidence_names.length ? { answer_session_names: evidence_names } : {}),
        },
      }],
      metadata: {
        source_row_index: row_index,
      },
    }
  })

  return {
    name: "longmemeval",
    split,
    conversations,
    metadata: {
      source_path: path,
      format: "longmemeval",
      note: "parsed from official LongMemEval JSON structure",
    },
  }
}
