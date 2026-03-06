import { normalize } from "../math/vec.ts"
import type { SectorId } from "../types/sector.ts"
import type { EmbeddingProvider } from "./types.ts"

type siray_embeddings_create = {
  model: string
  input: string | string[]
  encoding_format: "float"
  dimensions?: number
}

type siray_embeddings_response = {
  data: Array<{ embedding: number[]; index?: number }>
}

type siray_client = {
  embeddings: {
    create: (params: siray_embeddings_create) => Promise<siray_embeddings_response>
  }
}

export type SirayEmbeddingProviderOptions = {
  apiKey: string
  model?: string
  dimensions?: number
  baseUrl?: string
  client?: siray_client
}

const ensure_non_empty = (input: string): void => {
  if (!input.trim()) throw new Error("empty input")
}

const apply_sector_prefix = (input: string, sector?: SectorId): string => {
  if (!sector) return input
  return `sector:${sector}\n\n${input}`
}

export class SirayEmbeddingProvider implements EmbeddingProvider {
  private client: siray_client | null
  private apiKey: string
  private model: string
  private dim?: number
  private baseUrl: string
  private last_dim: number | null = null

  constructor(options: SirayEmbeddingProviderOptions) {
    if (!options.apiKey) throw new Error("missing api key")
    if (options.dimensions !== undefined && options.dimensions <= 0) throw new Error("invalid dimensions")
    this.client = options.client ?? null
    this.apiKey = options.apiKey
    this.model = options.model ?? "openai/text-embedding-3-small"
    this.dim = options.dimensions
    this.baseUrl = options.baseUrl ?? "https://api.siray.ai/v1"
  }

  dimensions(): number {
    return this.dim ?? this.last_dim ?? 0
  }

  name(): string {
    return "siray"
  }

  private async get_client(): Promise<siray_client> {
    if (this.client) return this.client
    const mod = (await import("openai")) as {
      default: new (opts: { apiKey: string; baseURL: string }) => siray_client
    }
    this.client = new mod.default({ apiKey: this.apiKey, baseURL: this.baseUrl })
    return this.client
  }

  async embed_text(input: string, opts?: { sector?: SectorId }): Promise<number[]> {
    ensure_non_empty(input)
    const prefixed = apply_sector_prefix(input, opts?.sector)
    const client = await this.get_client()
    const response = await client.embeddings.create({
      model: this.model,
      input: prefixed,
      encoding_format: "float",
      ...(this.dim !== undefined ? { dimensions: this.dim } : {}),
    })
    const first = response.data[0]?.embedding ?? []
    this.last_dim = first.length
    return normalize(first)
  }

  async embed_texts(inputs: string[], opts?: { sector?: SectorId }): Promise<number[][]> {
    if (inputs.length === 0) throw new Error("empty input")
    for (const input of inputs) ensure_non_empty(input)
    const payload = inputs.map((input) => apply_sector_prefix(input, opts?.sector))
    const client = await this.get_client()
    const response = await client.embeddings.create({
      model: this.model,
      input: payload,
      encoding_format: "float",
      ...(this.dim !== undefined ? { dimensions: this.dim } : {}),
    })
    const sorted = response.data.slice().sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    const vectors = sorted.map((entry) => normalize(entry.embedding))
    if (vectors.length > 0) this.last_dim = vectors[0].length
    return vectors
  }
}
