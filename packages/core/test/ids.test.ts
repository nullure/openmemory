import test from "node:test"
import assert from "node:assert/strict"
import { generateId } from "../src/util/ids.ts"

test("generateId produces unique url-safe ids", () => {
  const ids = new Set<string>()
  for (let i = 0; i < 10000; i += 1) {
    const id = generateId()
    assert.match(id, /^[A-Za-z0-9_-]+$/)
    assert.equal(ids.has(id), false)
    ids.add(id)
  }
  assert.equal(ids.size, 10000)
})
