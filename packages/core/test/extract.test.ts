import test from "node:test"
import assert from "node:assert/strict"
import { extract_preference, extract_identity } from "../src/engine/extract.ts"

test("sentence parsed correctly", () => {
  const out = extract_preference("user-1", "I like pizza.")
  assert.ok(out)
  assert.equal(out.subject, "user-1")
  assert.equal(out.predicate, "likes")
  assert.equal(out.object, "pizza")
})

test("name extracted", () => {
  const out = extract_identity("user-1", "My name is Sam.")
  assert.ok(out)
  assert.equal(out.subject, "user-1")
  assert.equal(out.predicate, "name")
  assert.equal(out.object, "Sam")
})

test("negative captured", () => {
  const out = extract_preference("user-1", "I don't like celery.")
  assert.ok(out)
  assert.equal(out.subject, "user-1")
  assert.equal(out.predicate, "dislikes")
  assert.equal(out.object, "celery")
})
