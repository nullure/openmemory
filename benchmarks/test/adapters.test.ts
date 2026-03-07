import test from "node:test"
import assert from "node:assert/strict"
import { fileURLToPath } from "node:url"
import { OpenMemoryAdapter } from "../src/adapters/openmemory.ts"
import { Mem0Adapter } from "../src/adapters/mem0.ts"
import { ZepAdapter } from "../src/adapters/zep.ts"
import type { BenchmarkQuestion, BenchmarkSession } from "../src/adapters/types.ts"

const fixture_path = (name: string): string =>
  fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url))

const session: BenchmarkSession = {
  id: "s1",
  conversation_id: "c1",
  turns: [
    { id: "t1", speaker: "user", text: "Mount Everest is the tallest mountain." },
    { id: "t2", speaker: "user", text: "My name is Demon." },
  ],
}

const question: BenchmarkQuestion = {
  id: "q-1",
  conversation_id: "c1",
  question_text: "What is the tallest mountain?",
  expected_answer: "Mount Everest",
  category: "single_hop_factual_recall",
  evidence_turn_ids: ["t1"],
}

test("openmemory adapter satisfies adapter interface in inproc mode", async () => {
  const adapter = new OpenMemoryAdapter()
  await adapter.setup({
    mode: "inproc",
    user_id: "u1",
    recall_mode: "deep",
    token_budget: 1024,
    embedding_provider: "fake",
    embedding_dimensions: 8,
  })
  await adapter.reset()
  await adapter.ingestConversation(session)
  const answer = await adapter.answerQuestion(question)
  assert.equal(answer.question_id, "q-1")
  assert.equal(typeof answer.answer_text, "string")
  assert.ok(Number.isFinite(answer.latency_ms))
  assert.ok(Array.isArray(answer.retrieved_context))
  await adapter.teardown()
})

test("mem0 replay adapter returns deterministic replayed outputs", async () => {
  const adapter = new Mem0Adapter()
  await adapter.setup({
    mode: "replay",
    replay_file: fixture_path("mem0_replay.jsonl"),
  })
  const answer = await adapter.answerQuestion(question)
  assert.equal(answer.answer_text, "Mount Everest is the tallest mountain.")
  await adapter.teardown()
})

test("zep replay adapter returns deterministic replayed outputs", async () => {
  const adapter = new ZepAdapter()
  await adapter.setup({
    mode: "replay",
    replay_file: fixture_path("zep_replay.jsonl"),
  })
  const answer = await adapter.answerQuestion(question)
  assert.equal(answer.answer_text, "Mount Everest is the tallest mountain.")
  await adapter.teardown()
})
