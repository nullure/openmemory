import { MemoryStore } from "../src/store/memory.ts"
import { CountMinSketch } from "../src/engine/sketch_engine.ts"
import { ingest } from "../src/engine/ingest.ts"
import { recall } from "../src/engine/recall.ts"
import { build_waypoint_edges } from "../src/engine/waypoint_builder.ts"
import { merge_config } from "../src/config.ts"
import { SirayEmbeddingProvider } from "../src/embed/siray.ts"
import { chunk_and_embed } from "../src/embed/chunk.ts"
import { make_projection_matrix, project } from "../src/math/projection.ts"
import { ALL_SECTORS, type SectorId } from "../src/types/sector.ts"

const apiKey = "sk-0aKupCkSiGRQFX73zJwI8GZDCpCfD0CgWi9PsoJJi4EoDX7S"
const userId = "user-1"

const baseSeed =
  "Human: I’m trying to remember what I did last weekend and how I felt about it.\nAI: You spent Saturday morning hiking with Jamie, felt energized, and mentioned the weather was clear and cool.\nHuman: Right, and Sunday?\nAI: You stayed in, cooked pasta, and said you felt relaxed but a bit tired in the evening.\nHuman: What about next week’s plan?\nAI: You planned a dentist appointment on Tuesday at 10 a.m. and a team sync on Thursday afternoon."
const sectorSeeds: Record<SectorId, string> = ALL_SECTORS.reduce((acc, sector) => {
  acc[sector] = `sector:${sector}\n\n${baseSeed}`
  return acc
}, {} as Record<SectorId, string>)

const build_centroids = async (
  provider: SirayEmbeddingProvider,
  projection: number[][],
): Promise<Record<SectorId, number[]>> => {
  const out = {} as Record<SectorId, number[]>
  for (const sector of ALL_SECTORS) {
    const vector = await chunk_and_embed(provider, sectorSeeds[sector], { sector })
    out[sector] = project(vector, projection)
  }
  return out
}

const run = async (): Promise<void> => {
  const store = new MemoryStore()
  const provider = new SirayEmbeddingProvider({ apiKey })
  const config = merge_config()
  const sketch = new CountMinSketch(3, 32)
  const seedVector = await chunk_and_embed(provider, sectorSeeds.semantic, { sector: "semantic" })
  const projection = make_projection_matrix(
    seedVector.length,
    config.projection.k,
    config.projection.seed,
  )
  const centroids = await build_centroids(provider, projection)
  const now = Date.now()

  await ingest(store, {
    user_id: userId,
    memory_text: "Mount Everest is 8,848.86 meters tall.",
    timestamp_ms: now - 2000,
  }, {
    provider,
    centroids,
    sketch,
    config,
  })

  await ingest(store, {
    user_id: userId,
    memory_text: "The Eiffel Tower is 330 meters tall.",
    timestamp_ms: now - 1000,
  }, {
    provider,
    centroids,
    sketch,
    config,
  })

  const nodes = await store.listMemoryNodes(userId)
  const latest = nodes[nodes.length - 1]
  if (latest) {
    await build_waypoint_edges(store, provider, latest)
  }

  const result = await recall({
    user_id: userId,
    query_text: "How tall is Mount Everest?",
    timestamp_ms: now,
  }, {
    store,
    provider,
    config,
    expand_waypoints: async (memory_node_id: string) => {
      const edges = await store.listWaypointEdgesFrom(userId, memory_node_id)
      return edges.map((edge) => edge.to_memory_node_id)
    },
  })

  console.log({
    sectors: result.sectors,
    candidates: result.candidates.map((c) => ({
      id: c.anchor.id,
      memory_node_id: c.anchor.memory_node_id,
      score: c.score,
    })),
    context: result.context,
  })
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
