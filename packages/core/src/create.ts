import { merge_config, type core_config, type core_config_overrides } from "./config.ts"
import { FakeEmbeddingProvider } from "./embed/fake.ts"
import { OpenAIEmbeddingProvider } from "./embed/openai.ts"
import { SirayEmbeddingProvider } from "./embed/siray.ts"
import type { EmbeddingProvider } from "./embed/types.ts"
import { ingest, type ingest_input, type ingest_summary } from "./engine/ingest.ts"
import { CountMinSketch } from "./engine/sketch_engine.ts"
import type { Store } from "./store/types.ts"
import type { SectorId } from "./types/sector.ts"

export type create_options = {
  store: Store
  provider: EmbeddingProvider
  centroids: Record<SectorId, number[]>
  sketch?: CountMinSketch
  config?: core_config
}

export type MemoryEngine = {
  ingest(input: ingest_input): Promise<ingest_summary>
}

export type open_memory_options = {
  store: Store
  centroids: Record<SectorId, number[]>
  config?: core_config_overrides
  sketch?: CountMinSketch
}

export type OpenMemory = MemoryEngine & {
  provider: EmbeddingProvider
  config: core_config
}

export const create_engine = (options: create_options): MemoryEngine => {
  const sketch = options.sketch ?? new CountMinSketch(3, 32)
  return {
    ingest: (input: ingest_input): Promise<ingest_summary> =>
      ingest(options.store, input, {
        provider: options.provider,
        centroids: options.centroids,
        sketch,
        config: options.config,
      }),
  }
}

const build_provider = (config: core_config): EmbeddingProvider => {
  const embedding = config.embedding
  if (embedding.provider === "openai") {
    if (!embedding.api_key) throw new Error("missing openai api key")
    return new OpenAIEmbeddingProvider({
      apiKey: embedding.api_key,
      model: embedding.model,
      dimensions: embedding.dimensions,
    })
  }
  if (embedding.provider === "siray") {
    if (!embedding.api_key) throw new Error("missing siray api key")
    return new SirayEmbeddingProvider({
      apiKey: embedding.api_key,
      model: embedding.model,
      dimensions: embedding.dimensions,
    })
  }
  return new FakeEmbeddingProvider(embedding.dimensions ?? 8, 1)
}

export const createOpenMemory = (options: open_memory_options): OpenMemory => {
  const config = merge_config(options.config)
  const provider = build_provider(config)
  const engine = create_engine({
    store: options.store,
    centroids: options.centroids,
    provider,
    sketch: options.sketch,
    config,
  })
  return { ...engine, provider, config }
}
