import type { SectorId, SectorState } from "../types/sector.js"

const to_iso = (ms: number): string => new Date(ms).toISOString()

export const init_sector_state = (
  user_id: string,
  sector: SectorId,
  vector: number[],
  now_ms: number = Date.now(),
): SectorState => {
  const iso = to_iso(now_ms)
  return {
    id: sector,
    user_id,
    sector,
    centroid: vector.slice(),
    mean: vector.slice(),
    variance: vector.map(() => 0),
    timestamps: {
      created_at: iso,
      updated_at: iso,
    },
    valid_from: iso,
    valid_to: null,
  }
}

export const update_sector_centroid = (
  state: SectorState,
  x: number[],
  beta: number,
  now_ms: number = Date.now(),
): SectorState => {
  if (!(beta > 0 && beta <= 1)) throw new Error("invalid beta")
  if (state.centroid.length !== x.length) throw new Error("size mismatch")
  const w = 1 - beta
  const centroid: number[] = []
  for (let i = 0; i < x.length; i += 1) centroid.push(w * state.centroid[i] + beta * x[i])
  const iso = to_iso(now_ms)
  return {
    ...state,
    centroid,
    timestamps: {
      ...state.timestamps,
      updated_at: iso,
    },
  }
}
