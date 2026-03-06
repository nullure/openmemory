const validate_rate = (rate: number): void => {
  if (!(rate > 0 && rate <= 1)) throw new Error("invalid rate")
}

const validate_lengths = (a: number[], b: number[]): void => {
  if (a.length !== b.length) throw new Error("size mismatch")
}

export const update_mean = (prev: number[], x: number[], alpha: number): number[] => {
  validate_rate(alpha)
  validate_lengths(prev, x)
  const out: number[] = []
  const w = 1 - alpha
  for (let i = 0; i < prev.length; i += 1) out.push(w * prev[i] + alpha * x[i])
  return out
}

export const update_variance = (
  prev: number[],
  mean: number[],
  x: number[],
  alpha: number,
): number[] => {
  validate_rate(alpha)
  validate_lengths(prev, mean)
  validate_lengths(prev, x)
  const out: number[] = []
  const w = 1 - alpha
  for (let i = 0; i < prev.length; i += 1) {
    const d = x[i] - mean[i]
    out.push(w * prev[i] + alpha * d * d)
  }
  return out
}

export const update_centroid = (prev: number[], x: number[], beta: number): number[] => {
  validate_rate(beta)
  validate_lengths(prev, x)
  const out: number[] = []
  const w = 1 - beta
  for (let i = 0; i < prev.length; i += 1) out.push(w * prev[i] + beta * x[i])
  return out
}
