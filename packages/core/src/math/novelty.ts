import { default_config } from "../config.ts"

export const novelty_score = (
  x: number[],
  mean: number[],
  varz: number[],
  eps = default_config.epsilons.novelty,
): number => {
  if (x.length !== mean.length || x.length !== varz.length) throw new Error("size mismatch")
  let s = 0
  for (let i = 0; i < x.length; i += 1) {
    const d = x[i] - mean[i]
    const v = varz[i] + eps
    s += (d * d) / v
  }
  return s
}
