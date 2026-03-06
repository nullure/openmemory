import type { SectorId } from "../types/sector.ts"

export interface EmbeddingProvider {
  embed_text(input: string, opts?: { sector?: SectorId }): Promise<number[]>
  embed_texts(inputs: string[], opts?: { sector?: SectorId }): Promise<number[][]>
  dimensions(): number
  name(): string
}
