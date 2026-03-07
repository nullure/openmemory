import test from "node:test"
import assert from "node:assert/strict"
import { fileURLToPath } from "node:url"
import { load_locomo_dataset } from "../src/datasets/locomo.ts"
import { load_longmemeval_dataset } from "../src/datasets/longmemeval.ts"

const fixture_path = (name: string): string =>
  fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url))

test("locomo dataset loader normalizes sessions and categories", async () => {
  const dataset = await load_locomo_dataset(fixture_path("locomo.json"), "test")
  assert.equal(dataset.name, "locomo")
  assert.equal(dataset.conversations.length, 1)
  const conversation = dataset.conversations[0]
  assert.equal(conversation.sessions.length, 2)
  assert.equal(conversation.questions.length, 3)
  assert.equal(conversation.questions[0].category, "single_hop_factual_recall")
  assert.equal(conversation.questions[1].category, "temporal_reasoning")
  assert.equal(conversation.questions[2].category, "multi_hop_reasoning")
})

test("longmemeval loader normalizes question types into benchmark categories", async () => {
  const dataset = await load_longmemeval_dataset(fixture_path("longmemeval.json"), "test")
  assert.equal(dataset.name, "longmemeval")
  assert.equal(dataset.conversations.length, 2)
  const temporal = dataset.conversations[0]
  const update = dataset.conversations[1]
  assert.equal(temporal.questions[0].category, "temporal_reasoning")
  assert.equal(update.questions[0].category, "knowledge_update")
})
