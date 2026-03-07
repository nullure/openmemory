import type { retry_config } from "../config.ts"

export const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const with_timeout = async <T>(promise: Promise<T>, timeout_ms: number, message = "operation timed out"): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeout_ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export type retry_result<T> = {
  value: T
  attempts: number
}

export const retry_async = async <T>(
  fn: () => Promise<T>,
  config: retry_config,
  on_retry?: (attempt: number, error: Error, backoff_ms: number) => Promise<void> | void,
): Promise<retry_result<T>> => {
  const attempts = Math.max(1, Math.floor(config.max_attempts))
  let last_error: Error | null = null
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return { value: await fn(), attempts: attempt }
    } catch (error) {
      last_error = error instanceof Error ? error : new Error(String(error))
      if (attempt >= attempts) break
      const backoff_ms = Math.min(
        config.max_delay_ms,
        config.base_delay_ms * Math.pow(2, attempt - 1),
      )
      if (on_retry) await on_retry(attempt, last_error, backoff_ms)
      await sleep(backoff_ms)
    }
  }
  throw last_error ?? new Error("retry_async failed")
}
