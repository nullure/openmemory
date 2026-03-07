import { performance } from "node:perf_hooks"

export const now_ms = (): number => performance.now()

export const time_async = async <T>(fn: () => Promise<T>): Promise<{ value: T; elapsed_ms: number }> => {
  const start = now_ms()
  const value = await fn()
  return {
    value,
    elapsed_ms: now_ms() - start,
  }
}
