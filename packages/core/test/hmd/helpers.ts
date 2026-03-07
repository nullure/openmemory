import { merge_config, type core_config } from "../../src/config.ts"
import { FakeEmbeddingProvider } from "../../src/embed/fake.ts"
import { CountMinSketch } from "../../src/engine/sketch_engine.ts"
import { normalize } from "../../src/math/vec.ts"
import { MemoryStore } from "../../src/store/memory.ts"
import type { Anchor } from "../../src/types/anchor.ts"
import type { MemoryNode } from "../../src/types/memory_node.ts"
import { ALL_SECTORS, type SectorId } from "../../src/types/sector.ts"

export const HMD_USER_ID = "hmd-user"

export type hmd_harness = {
  store: MemoryStore
  provider: FakeEmbeddingProvider
  sketch: CountMinSketch
  config: core_config
}

export const create_hmd_harness = (
  dimensions = 8,
  seed = 7,
): hmd_harness => {
  const provider = new FakeEmbeddingProvider(dimensions, seed)
  return {
    store: new MemoryStore(),
    provider,
    sketch: new CountMinSketch(3, 128),
    config: merge_config({
      projection: {
        k: dimensions,
        seed: 11,
      },
    }),
  }
}

export const build_basis_centroids = (dimensions: number): Record<SectorId, number[]> => {
  const out = {} as Record<SectorId, number[]>
  for (let i = 0; i < ALL_SECTORS.length; i += 1) {
    const vec = new Array<number>(dimensions).fill(0)
    vec[i % dimensions] = 1
    out[ALL_SECTORS[i]] = normalize(vec)
  }
  return out
}

export const list_all_anchors = async (
  store: MemoryStore,
  user_id: string,
): Promise<Anchor[]> => {
  const groups = await Promise.all(ALL_SECTORS.map((sector) => store.listAnchors(user_id, sector)))
  return groups.flat()
}

export const put_memory_and_anchor = async (
  store: MemoryStore,
  user_id: string,
  node: MemoryNode,
  anchor: {
    id: string
    sector: SectorId
    embedding: number[]
    timestamp_ms: number
    salience?: number
    weight?: number
  },
): Promise<void> => {
  await store.putMemoryNode(node)
  await store.putAnchor({
    id: anchor.id,
    memory_node_id: node.id,
    user_id,
    sector: anchor.sector,
    embedding: anchor.embedding.slice(),
    weight: anchor.weight ?? 1,
    salience: anchor.salience ?? 1,
    created_at: anchor.timestamp_ms,
    updated_at: anchor.timestamp_ms,
    last_access_at: anchor.timestamp_ms,
  })
}

export const make_orthogonal = (vector: number[]): number[] => {
  if (vector.length < 2) throw new Error("need at least 2 dimensions")
  const out = new Array<number>(vector.length).fill(0)
  out[0] = -vector[1]
  out[1] = vector[0]
  if (out[0] === 0 && out[1] === 0) out[0] = 1
  return normalize(out)
}

export const blend_with_similarity = (
  base: number[],
  orthogonal: number[],
  similarity: number,
): number[] => {
  const clamped = Math.max(-1, Math.min(1, similarity))
  const side = Math.sqrt(Math.max(0, 1 - clamped * clamped))
  const mixed = base.map((v, i) => clamped * v + side * orthogonal[i])
  return normalize(mixed)
}

export const vector_norm = (vector: number[]): number =>
  Math.sqrt(vector.reduce((acc, value) => acc + value * value, 0))
