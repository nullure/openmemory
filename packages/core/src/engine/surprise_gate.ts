import type { CountMinSketch } from "./sketch_engine.ts"

export type gate_action = "update_sketches" | "create_anchor"

export const surprise_gate = (
  novelty: number,
  threshold: number,
  sketch: CountMinSketch,
  keys: string[],
  create_anchor: () => void,
): gate_action => {
  if (novelty < threshold) {
    for (const key of keys) sketch.update(key)
    return "update_sketches"
  }
  create_anchor()
  return "create_anchor"
}
