import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

export const ensure_parent_dir = async (path: string): Promise<void> => {
  await mkdir(dirname(path), { recursive: true })
}

export const append_jsonl = async (path: string, row: unknown): Promise<void> => {
  await ensure_parent_dir(path)
  const serialized = JSON.stringify(row)
  await writeFile(path, `${serialized}\n`, { encoding: "utf8", flag: "a" })
}

export const read_jsonl = async <T>(path: string): Promise<T[]> => {
  try {
    const raw = await readFile(path, "utf8")
    const lines = raw
      .split(/\r?\n/g)
      .map((line) => line.trim())
      .filter(Boolean)
    return lines.map((line, index) => {
      try {
        return JSON.parse(line) as T
      } catch {
        throw new Error(`invalid JSONL at ${path}:${index + 1}`)
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes("ENOENT")) return []
    throw error
  }
}

export const write_json = async (path: string, value: unknown): Promise<void> => {
  await ensure_parent_dir(path)
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}
