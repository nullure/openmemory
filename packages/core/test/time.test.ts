import test from "node:test"
import assert from "node:assert/strict"
import { now_ms, age_ms } from "../src/util/time.ts"

test("now_ms returns mocked time", () => {
  const prev = Date.now
  Date.now = () => 1234567890
  try {
    assert.equal(now_ms(), 1234567890)
  } finally {
    Date.now = prev
  }
})

test("age_ms computes delta from mocked time", () => {
  const prev = Date.now
  Date.now = () => 2000
  try {
    assert.equal(age_ms(1500), 500)
  } finally {
    Date.now = prev
  }
})
