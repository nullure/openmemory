import test from "node:test"
import assert from "node:assert/strict"
import type { Anchor } from "../src/types/anchor.js"
import type { Belief } from "../src/types/belief.js"
import type { ContextPacket } from "../src/types/context.js"
import type { SectorId, SectorState } from "../src/types/sector.js"

test("core module loads", async () => {
  const mod = await import("../dist/index.js")
  assert.equal(typeof mod, "object")
})

test("core type structures", () => {
  const sectorId = "factual" satisfies SectorId

  const anchor = {
    id: "anchor-1",
    user_id: "user-1",
    sector: sectorId,
    embedding: [0.1, 0.2, 0.3],
    weight: 0.8,
    timestamps: {
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    },
    valid_from: "2026-01-01T00:00:00Z",
    valid_to: null,
  } satisfies Anchor

  const belief = {
    id: "belief-1",
    user_id: "user-1",
    sector: sectorId,
    embedding: [0.5, 0.6],
    weight: 0.4,
    timestamps: {
      created_at: "2026-01-03T00:00:00Z",
      updated_at: "2026-01-04T00:00:00Z",
    },
    valid_from: "2026-01-03T00:00:00Z",
    valid_to: "2026-02-01T00:00:00Z",
  } satisfies Belief

  const context = {
    id: "context-1",
    user_id: "user-2",
    sector: sectorId,
    embedding: [0.9],
    weight: 1,
    timestamps: {
      created_at: "2026-01-05T00:00:00Z",
      updated_at: "2026-01-06T00:00:00Z",
    },
    valid_from: "2026-01-05T00:00:00Z",
    valid_to: null,
  } satisfies ContextPacket

  const sectorState = {
    id: sectorId,
    user_id: "user-3",
    sector: sectorId,
    centroid: [0.25, 0.75],
    mean: [0.25, 0.75],
    variance: [0, 0],
    timestamps: {
      created_at: "2026-01-07T00:00:00Z",
      updated_at: "2026-01-08T00:00:00Z",
    },
    valid_from: "2026-01-07T00:00:00Z",
    valid_to: null,
  } satisfies SectorState

  assert.equal(anchor.id, "anchor-1")
  assert.equal(belief.user_id, "user-1")
  assert.equal(context.sector, sectorId)
  assert.equal(sectorState.id, sectorId)
})
