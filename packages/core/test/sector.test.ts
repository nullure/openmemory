import test from "node:test"
import assert from "node:assert/strict"
import { ALL_SECTORS, assert_sector_id } from "../src/types/sector.ts"
import { default_config, default_sector_config } from "../src/config.ts"

test("exactly 5 sectors exist", () => {
  assert.equal(ALL_SECTORS.length, 5)
  assert.deepEqual(ALL_SECTORS, ["factual", "emotional", "temporal", "relational", "behavioral"])
})

test("invalid sector ids fail", () => {
  assert.throws(() => assert_sector_id("s1"), /invalid sector id/)
})

test("config loads sector defaults correctly", () => {
  for (const sector of ALL_SECTORS) {
    assert.equal(
      default_config.decay_lambdas_by_sector[sector],
      default_sector_config[sector].decay_lambda,
    )
    assert.equal(
      default_config.novelty_thresholds_by_sector[sector],
      default_sector_config[sector].novelty_threshold,
    )
    assert.equal(
      default_config.classifier_weights_by_sector[sector],
      default_sector_config[sector].classifier_weight,
    )
  }
})
