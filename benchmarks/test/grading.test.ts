import test from "node:test"
import assert from "node:assert/strict"
import { exact_match_score } from "../src/grading/exact.ts"
import { token_f1_score } from "../src/grading/f1.ts"
import { build_llm_judge_prompt, grade_with_llm_judge } from "../src/grading/llm_judge.ts"

test("exact grading is normalized and deterministic", () => {
  assert.equal(exact_match_score("Mount Everest", "mount everest.", "single_hop_factual_recall"), 1)
  assert.equal(exact_match_score("Paris", "Lyon", "single_hop_factual_recall"), 0)
  assert.equal(exact_match_score("", "I don't know", "abstention"), 1)
})

test("token-level F1 grading works", () => {
  const f1_full = token_f1_score("Mount Everest", "Mount Everest")
  const f1_partial = token_f1_score("Mount Everest", "Everest")
  assert.equal(f1_full, 1)
  assert.ok(f1_partial > 0 && f1_partial < 1)
})

test("llm judge prompt is deterministic and judge runner is injectable", async () => {
  const prompt = build_llm_judge_prompt({
    question: "What is the tallest mountain?",
    expected_answer: "Mount Everest",
    predicted_answer: "Everest",
  })
  assert.ok(prompt.includes("QUESTION: What is the tallest mountain?"))

  const judged = await grade_with_llm_judge(
    {
      enabled: true,
      provider: "openai",
      model: "test-model",
      api_key_env: "OPENAI_API_KEY",
      endpoint: "http://localhost/not-used",
      temperature: 0,
      f1_threshold: 0.9,
    },
    {
      question: "Q",
      expected_answer: "A",
      predicted_answer: "B",
    },
    async () => ({ label: "incorrect", score: 0, reason: "wrong" }),
  )

  assert.equal(judged?.label, "incorrect")
  assert.equal(judged?.score, 0)
})
