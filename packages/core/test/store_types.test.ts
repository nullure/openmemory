import test from "node:test"
import assert from "node:assert/strict"
import type { Store } from "../src/store/types.ts"
import type { Anchor } from "../src/types/anchor.ts"
import type { Belief } from "../src/types/belief.ts"
import type { SectorId, SectorState } from "../src/types/sector.ts"

test("store interface compiles", async () => {
  const store = {
    async getAnchors(user_id: string, sector: SectorId): Promise<Anchor[]> {
      return [{ ...mk_anchor(user_id, sector), id: "a1" }]
    },
    async putAnchor(_anchor: Anchor): Promise<void> {},
    async deleteAnchor(_id: string): Promise<void> {},
    async listAnchors(user_id: string, sector: SectorId): Promise<Anchor[]> {
      return [{ ...mk_anchor(user_id, sector), id: "a2" }]
    },
    async getBeliefs(user_id: string): Promise<Belief[]> {
      return [{ ...mk_belief(user_id), id: "b1" }]
    },
    async putBelief(_belief: Belief): Promise<void> {},
    async updateBelief(_belief: Belief): Promise<void> {},
    async getSectorState(user_id: string, sector: SectorId): Promise<SectorState | null> {
      return { ...mk_sector_state(user_id, sector), id: sector }
    },
    async putSectorState(_state: SectorState): Promise<void> {},
  } satisfies Store

  assert.ok(typeof store.getAnchors === "function")
})

const mk_anchor = (user_id: string, sector: SectorId): Anchor => ({
  id: "anchor",
  user_id,
  sector,
  embedding: [0.1],
  weight: 1,
  timestamps: {
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  valid_from: "2026-01-01T00:00:00Z",
  valid_to: null,
})

const mk_belief = (user_id: string): Belief => ({
  id: "belief",
  user_id,
  sector: "sector-a",
  embedding: [0.2],
  weight: 1,
  timestamps: {
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  valid_from: "2026-01-01T00:00:00Z",
  valid_to: null,
})

const mk_sector_state = (user_id: string, sector: SectorId): SectorState => ({
  id: sector,
  user_id,
  sector,
  embedding: [0.3],
  weight: 1,
  timestamps: {
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  valid_from: "2026-01-01T00:00:00Z",
  valid_to: null,
})
