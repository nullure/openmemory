import { normalize } from "../math/vec.ts"
import type { SectorId } from "../types/sector.ts"
import type { EmbeddingProvider } from "./types.ts"

export const DEFAULT_MAX_TOKENS = 8192

const estimate_tokens = (text: string): number => Math.max(1, Math.ceil(text.length / 4))

export const chunk_text = (text: string, max_tokens: number = DEFAULT_MAX_TOKENS): string[] => {
  if (estimate_tokens(text) <= max_tokens) return [text]
  const max_chars = Math.max(1, max_tokens * 4)
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return [text]
  const chunks: string[] = []
  let current: string[] = []
  let current_len = 0
  for (const word of words) {
    const next_len = current_len === 0 ? word.length : current_len + 1 + word.length
    if (current_len > 0 && next_len > max_chars) {
      chunks.push(current.join(" "))
      current = [word]
      current_len = word.length
      continue
    }
    current.push(word)
    current_len = next_len
  }
  if (current.length > 0) chunks.push(current.join(" "))
  return chunks
}

const average_vectors = (vectors: number[][]): number[] => {
  if (vectors.length === 0) throw new Error("empty vectors")
  const dim = vectors[0].length
  const sums = new Array(dim).fill(0)
  for (const vec of vectors) {
    if (vec.length !== dim) throw new Error("size mismatch")
    for (let i = 0; i < dim; i += 1) sums[i] += vec[i]
  }
  return sums.map((v) => v / vectors.length)
}

export const chunk_and_embed = async (
  provider: EmbeddingProvider,
  text: string,
  opts?: { sector?: SectorId },
  max_tokens: number = DEFAULT_MAX_TOKENS,
): Promise<number[]> => {
  const chunks = chunk_text(text, max_tokens)
  if (chunks.length === 1) return provider.embed_text(chunks[0], opts)
  const vectors = await provider.embed_texts(chunks, opts)
  return normalize(average_vectors(vectors))
}
