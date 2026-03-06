export const now_ms = (): number => Date.now()

export const age_ms = (ts: number): number => now_ms() - ts
