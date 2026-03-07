import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"

export type fetch_dataset = "locomo" | "longmemeval" | "all"

export type dataset_asset = {
  id: string
  dataset: "locomo" | "longmemeval"
  url: string
  rel_path: string
  description: string
}

export type downloaded_asset = dataset_asset & {
  abs_path: string
  bytes: number
  sha256: string
  downloaded_at: string
  skipped: boolean
}

export type fetch_summary = {
  output_dir: string
  selected: fetch_dataset
  assets: downloaded_asset[]
}

type fetch_like = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

const DEFAULT_OUTPUT_DIR = resolve("benchmarks", "data")

export const OFFICIAL_DATASET_ASSETS: dataset_asset[] = [
  {
    id: "locomo10",
    dataset: "locomo",
    url: "https://raw.githubusercontent.com/snap-research/locomo/main/data/locomo10.json",
    rel_path: "locomo/locomo10.json",
    description: "Official LoCoMo 10-conversation benchmark JSON",
  },
  {
    id: "longmemeval_oracle",
    dataset: "longmemeval",
    url: "https://huggingface.co/datasets/xiaowu0162/longmemeval-cleaned/resolve/main/longmemeval_oracle.json",
    rel_path: "longmemeval/longmemeval_oracle.json",
    description: "Official LongMemEval oracle variant (cleaned)",
  },
  {
    id: "longmemeval_s_cleaned",
    dataset: "longmemeval",
    url: "https://huggingface.co/datasets/xiaowu0162/longmemeval-cleaned/resolve/main/longmemeval_s_cleaned.json",
    rel_path: "longmemeval/longmemeval_s_cleaned.json",
    description: "Official LongMemEval-S cleaned variant",
  },
  {
    id: "longmemeval_m_cleaned",
    dataset: "longmemeval",
    url: "https://huggingface.co/datasets/xiaowu0162/longmemeval-cleaned/resolve/main/longmemeval_m_cleaned.json",
    rel_path: "longmemeval/longmemeval_m_cleaned.json",
    description: "Official LongMemEval-M cleaned variant",
  },
]

const ensure_fetch = (impl?: fetch_like): fetch_like => {
  if (impl) return impl
  if (typeof fetch !== "function") throw new Error("fetch is unavailable; provide fetch implementation")
  return fetch.bind(globalThis)
}

const sha256 = (buffer: Buffer): string =>
  createHash("sha256").update(buffer).digest("hex")

const should_include = (requested: fetch_dataset, asset: dataset_asset): boolean => {
  if (requested === "all") return true
  return asset.dataset === requested
}

const ensure_parent = async (path: string): Promise<void> => {
  await mkdir(dirname(path), { recursive: true })
}

const parse_json = async <T>(path: string, fallback: T): Promise<T> => {
  try {
    const raw = await readFile(path, "utf8")
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const as_dataset = (value: string): fetch_dataset => {
  if (value === "locomo" || value === "longmemeval" || value === "all") return value
  throw new Error(`invalid dataset value: ${value}`)
}

export const fetch_benchmark_datasets = async (
  requested: string,
  output_dir = DEFAULT_OUTPUT_DIR,
  options?: {
    force?: boolean
    fetch_impl?: fetch_like
  },
): Promise<fetch_summary> => {
  const dataset = as_dataset(requested)
  const force = options?.force ?? false
  const fetch_impl = ensure_fetch(options?.fetch_impl)
  const selected_assets = OFFICIAL_DATASET_ASSETS.filter((asset) => should_include(dataset, asset))
  const out_assets: downloaded_asset[] = []

  for (const asset of selected_assets) {
    const abs_path = join(output_dir, asset.rel_path)
    await ensure_parent(abs_path)
    let skipped = false
    let buffer: Buffer
    if (!force) {
      try {
        buffer = await readFile(abs_path)
        skipped = true
      } catch {
        const response = await fetch_impl(asset.url)
        if (!response.ok) throw new Error(`failed to download ${asset.id}: ${response.status}`)
        buffer = Buffer.from(await response.arrayBuffer())
        await writeFile(abs_path, buffer)
      }
    } else {
      const response = await fetch_impl(asset.url)
      if (!response.ok) throw new Error(`failed to download ${asset.id}: ${response.status}`)
      buffer = Buffer.from(await response.arrayBuffer())
      await writeFile(abs_path, buffer)
    }

    out_assets.push({
      ...asset,
      abs_path,
      bytes: buffer.byteLength,
      sha256: sha256(buffer),
      downloaded_at: new Date().toISOString(),
      skipped,
    })
  }

  const lock_path = join(output_dir, "dataset-lock.json")
  const existing = await parse_json<{ assets: downloaded_asset[] }>(lock_path, { assets: [] })
  const by_id = new Map<string, downloaded_asset>()
  for (const row of existing.assets) by_id.set(row.id, row)
  for (const row of out_assets) by_id.set(row.id, row)
  const merged_assets = Array.from(by_id.values()).sort((lhs, rhs) => lhs.id.localeCompare(rhs.id))
  await writeFile(lock_path, `${JSON.stringify({
    generated_at: new Date().toISOString(),
    output_dir: resolve(output_dir),
    assets: merged_assets,
    sources: [
      "https://github.com/snap-research/locomo",
      "https://github.com/xiaowu0162/LongMemEval",
      "https://huggingface.co/datasets/xiaowu0162/longmemeval-cleaned",
    ],
  }, null, 2)}\n`, "utf8")

  return {
    output_dir: resolve(output_dir),
    selected: dataset,
    assets: out_assets,
  }
}
