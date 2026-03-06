import test from "node:test"
import assert from "node:assert/strict"
import { default_config, merge_config } from "../src/config.ts"

test("merge_config overrides specified values", () => {
  const merged = merge_config({
    projection: { k: 32 },
    scoring_betas: { weight: 0.5 },
    novelty_thresholds_by_sector: { factual: 1.2 },
  })
  assert.equal(merged.projection.k, 32)
  assert.equal(merged.scoring_betas.weight, 0.5)
  assert.equal(merged.novelty_thresholds_by_sector.factual, 1.2)
})

test("merge_config preserves defaults", () => {
  const merged = merge_config({ projection: { k: 32 } })
  assert.equal(merged.projection.seed, default_config.projection.seed)
  assert.equal(merged.scoring_betas.similarity, default_config.scoring_betas.similarity)
  assert.equal(merged.anchor_limit, default_config.anchor_limit)
  assert.equal(merged.belief_decay_lambda, default_config.belief_decay_lambda)
  assert.equal(
    merged.classifier_weights_by_sector.factual,
    default_config.classifier_weights_by_sector.factual,
  )
})

test("merge_config rejects unknown keys", () => {
  assert.throws(
    () => merge_config({ projection: { k: 12, bad: 1 } as never }),
    /unknown config key/,
  )
  assert.throws(() => merge_config({ bad: 1 } as never), /unknown config key/)
})

test("merge_config rejects invalid sector ids", () => {
  assert.throws(
    () => merge_config({ novelty_thresholds_by_sector: { bad: 1 } as never }),
    /invalid sector id/,
  )
})
