import test from "node:test"
import assert from "node:assert/strict"
import { classify_memory } from "../../src/classifier/rule_based.ts"
import type { SectorId } from "../../src/types/sector.ts"

type case_row = {
  input: string
  expected_primary: SectorId
}

const cases: case_row[] = [
  { input: "My name is Morven", expected_primary: "semantic" },
  { input: "I deployed the server yesterday", expected_primary: "episodic" },
  { input: "I usually code at night", expected_primary: "procedural" },
  { input: "I feel frustrated with this bug", expected_primary: "emotional" },
  { input: "I realized debugging earlier would help", expected_primary: "reflective" },
]

test("sector classifier routes deterministic top-2 sectors", () => {
  for (const row of cases) {
    const predictions = classify_memory(row.input)
    assert.equal(predictions.length, 2, `expected top-2 sectors for: ${row.input}`)
    assert.equal(predictions[0].sector, row.expected_primary, `wrong primary sector for: ${row.input}`)
    const prob_sum = predictions.reduce((acc, value) => acc + value.prob, 0)
    assert.ok(Math.abs(prob_sum - 1) < 1e-9, `probabilities must sum to 1 for: ${row.input}`)
  }
})
