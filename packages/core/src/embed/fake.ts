import type { SectorId } from "../types/sector.ts"
import { normalize } from "../math/vec.ts"
import type { EmbeddingProvider } from "./types.ts"

const hash32 = (value: string, seed: number): number => {
  let h = seed >>> 0
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

const to_unit = (value: number): number => (value / 4294967296) * 2 - 1

export class FakeEmbeddingProvider implements EmbeddingProvider {
  private dim: number
  private seed: number

  constructor(dimensions = 8, seed = 1) {
    if (dimensions <= 0) throw new Error("invalid dimensions")
    this.dim = dimensions
    this.seed = seed >>> 0
  }

  dimensions(): number {
    return this.dim
  }

  name(): string {
    return "fake"
  }

  async embed_text(input: string, opts?: { sector?: SectorId }): Promise<number[]> {
    const salt = opts?.sector ? `${opts.sector}|` : ""
    const key = `${salt}${input}`
    const vec: number[] = []
    for (let i = 0; i < this.dim; i += 1) {
      const h = hash32(key, this.seed + i * 0x9e3779b9)
      vec.push(to_unit(h))
    }
    return normalize(vec)
  }

  async embed_texts(inputs: string[], opts?: { sector?: SectorId }): Promise<number[][]> {
    const out: number[][] = []
    for (const input of inputs) out.push(await this.embed_text(input, opts))
    return out
  }
}
