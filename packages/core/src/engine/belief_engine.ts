import { default_config, type core_config } from "../config.ts"
import { apply_decay } from "../math/decay.ts"
import type { Store } from "../store/types.js"
import type { Belief } from "../types/belief.js"
import type { SectorId } from "../types/sector.js"

const to_iso = (ms: number): string => new Date(ms).toISOString()

const parse_ms = (value: string, fallback: number): number => {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const insert_belief = async (
  store: Store,
  belief: Belief,
  now_ms: number = Date.now(),
): Promise<Belief[]> => {
  const now_iso = to_iso(now_ms)
  const active = await store.getBeliefs(belief.user_id)
  for (const existing of active) {
    if (existing.valid_to !== null) continue
    if (existing.user_id !== belief.user_id) continue
    if ((existing.sector as SectorId) !== belief.sector) continue
    const closed: Belief = {
      ...existing,
      valid_to: now_iso,
      timestamps: {
        ...existing.timestamps,
        updated_at: now_iso,
      },
    }
    await store.updateBelief(closed)
  }
  const next: Belief = {
    ...belief,
    valid_from: now_iso,
    valid_to: null,
    timestamps: {
      ...belief.timestamps,
      updated_at: now_iso,
    },
  }
  await store.putBelief(next)
  return store.getBeliefs(belief.user_id)
}

export const get_active_beliefs = async (
  store: Store,
  user_id: string,
  time_ms: number,
  config: core_config = default_config,
): Promise<Belief[]> => {
  const beliefs = await store.getBeliefs(user_id)
  return beliefs.filter((belief) => {
    const from_ms = parse_ms(belief.valid_from, 0)
    const to_ms = belief.valid_to === null ? Number.POSITIVE_INFINITY : parse_ms(belief.valid_to, 0)
    return from_ms <= time_ms && time_ms < to_ms
  }).map((belief) => {
    const updated_ms = parse_ms(belief.timestamps.updated_at, time_ms)
    const dt_ms = Math.max(0, time_ms - updated_ms)
    const weight = apply_decay(belief.weight, dt_ms, config.belief_decay_lambda)
    return { ...belief, weight }
  })
}

export const reinforce_belief = (belief: Belief, delta: number): Belief => {
  const weight = Math.min(belief.weight + delta, 1)
  const updated_at = new Date(Date.now()).toISOString()
  return {
    ...belief,
    weight,
    timestamps: {
      ...belief.timestamps,
      updated_at,
    },
  }
}
