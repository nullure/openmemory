export const recency_score = (now_ms: number, timestamp_ms: number, gamma: number): number => {
  if (gamma < 0) throw new Error("invalid gamma")
  const age_s = Math.max(0, (now_ms - timestamp_ms) / 1000)
  const r = Math.exp(-gamma * age_s)
  if (r < 0) return 0
  if (r > 1) return 1
  return r
}
