import {
  default_openmemory_config,
  merge_config,
  type openmemory_adapter_config,
} from "../config.ts"
import type {
  BenchmarkAnswer,
  BenchmarkQuestion,
  BenchmarkSession,
  MemorySystemAdapter,
} from "./types.ts"
import { estimate_tokens } from "../utils/normalize.ts"
import { time_async } from "../utils/timer.ts"
import { merge_config as merge_core_config } from "../../../packages/core/src/config.ts"
import { FakeEmbeddingProvider } from "../../../packages/core/src/embed/fake.ts"
import { OpenAIEmbeddingProvider } from "../../../packages/core/src/embed/openai.ts"
import { SirayEmbeddingProvider } from "../../../packages/core/src/embed/siray.ts"
import { ingest } from "../../../packages/core/src/engine/ingest.ts"
import { recall } from "../../../packages/core/src/engine/recall.ts"
import { build_waypoint_edges } from "../../../packages/core/src/engine/waypoint_builder.ts"
import { CountMinSketch } from "../../../packages/core/src/engine/sketch_engine.ts"
import { normalize } from "../../../packages/core/src/math/vec.ts"
import { OpenMemoryClient } from "../../../packages/core/src/sdk/client.ts"
import { MemoryStore } from "../../../packages/core/src/store/memory.ts"
import { ALL_SECTORS, type SectorId } from "../../../packages/core/src/types/sector.ts"
import type { EmbeddingProvider } from "../../../packages/core/src/embed/types.ts"

type mode_state =
  | {
    mode: "http"
    client: OpenMemoryClient
  }
  | {
    mode: "inproc"
    store: MemoryStore
    provider: EmbeddingProvider
    centroids: Record<SectorId, number[]>
    sketch: CountMinSketch
    turn_clock_ms: number
  }

const as_object = (value: unknown): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("invalid adapter config")
  }
  return value as Record<string, unknown>
}

const build_basis_centroids = (dimensions: number): Record<SectorId, number[]> => {
  const out = {} as Record<SectorId, number[]>
  for (let i = 0; i < ALL_SECTORS.length; i += 1) {
    const vec = new Array<number>(dimensions).fill(0)
    vec[i % dimensions] = 1
    out[ALL_SECTORS[i]] = normalize(vec)
  }
  return out
}

const build_provider = (config: openmemory_adapter_config): EmbeddingProvider => {
  const dimensions = config.embedding_dimensions ?? 64
  if (config.embedding_provider === "openai") {
    const api_key = config.embedding_api_key ?? process.env.OPENAI_API_KEY
    if (!api_key) throw new Error("openmemory adapter missing openai api key")
    return new OpenAIEmbeddingProvider({
      apiKey: api_key,
      model: config.embedding_model,
      dimensions,
    })
  }
  if (config.embedding_provider === "siray") {
    const api_key = config.embedding_api_key ?? process.env.SIRAY_API_KEY
    if (!api_key) throw new Error("openmemory adapter missing siray api key")
    return new SirayEmbeddingProvider({
      apiKey: api_key,
      model: config.embedding_model,
      dimensions,
    })
  }
  return new FakeEmbeddingProvider(dimensions, 1)
}

const build_answer_text = (question: string, context_memories: Array<{ text: string }>): string => {
  const q = question.toLowerCase()
  if (context_memories.length === 0) return "I don't know."
  if (q.includes("name")) return context_memories[0].text
  return context_memories[0].text
}

export class OpenMemoryAdapter implements MemorySystemAdapter {
  private config: openmemory_adapter_config = { ...default_openmemory_config }
  private state: mode_state | null = null

  name(): string {
    return "openmemory"
  }

  metadata(): Record<string, unknown> {
    return {
      mode: this.config.mode,
      embedding_provider: this.config.embedding_provider,
      embedding_model: this.config.embedding_model ?? null,
      embedding_dimensions: this.config.embedding_dimensions ?? null,
      recall_mode: this.config.recall_mode,
      token_budget: this.config.token_budget,
    }
  }

  async setup(config: Record<string, unknown>): Promise<void> {
    this.config = merge_config(default_openmemory_config, as_object(config))
    if (this.config.mode === "http") {
      if (!this.config.server_url) throw new Error("openmemory http mode requires server_url")
      this.state = {
        mode: "http",
        client: new OpenMemoryClient({
          base_url: this.config.server_url,
        }),
      }
      return
    }

    const provider = build_provider(this.config)
    const centroids = build_basis_centroids(provider.dimensions() || (this.config.embedding_dimensions ?? 64))
    this.state = {
      mode: "inproc",
      store: new MemoryStore(),
      provider,
      centroids,
      sketch: new CountMinSketch(3, 512),
      turn_clock_ms: Date.now(),
    }
  }

  async reset(): Promise<void> {
    if (!this.state) throw new Error("openmemory adapter not initialized")
    if (this.state.mode === "http") return
    this.state.store = new MemoryStore()
    this.state.sketch = new CountMinSketch(3, 512)
    this.state.turn_clock_ms = Date.now()
  }

  async ingestConversation(session: BenchmarkSession): Promise<void> {
    if (!this.state) throw new Error("openmemory adapter not initialized")
    if (this.state.mode === "http") {
      for (const turn of session.turns) {
        await this.state.client.ingestMemory({
          user_id: this.config.user_id,
          memory_text: `${turn.speaker}: ${turn.text}`,
          timestamp_ms: turn.timestamp_ms,
          metadata: {
            conversation_id: session.conversation_id,
            session_id: session.id,
            turn_id: turn.id,
          },
        })
      }
      return
    }

    const core_config = merge_core_config({
      projection: {
        k: this.config.embedding_dimensions ?? 64,
        seed: 1,
      },
      embedding: {
        provider: this.config.embedding_provider,
        model: this.config.embedding_model,
        dimensions: this.config.embedding_dimensions,
        api_key: this.config.embedding_api_key,
      },
    })

    for (const turn of session.turns) {
      const timestamp_ms = turn.timestamp_ms ?? ++this.state.turn_clock_ms
      await ingest(
        this.state.store,
        {
          user_id: this.config.user_id,
          memory_text: `${turn.speaker}: ${turn.text}`,
          timestamp_ms,
          metadata: {
            conversation_id: session.conversation_id,
            session_id: session.id,
            turn_id: turn.id,
          },
        },
        {
          provider: this.state.provider,
          centroids: this.state.centroids,
          sketch: this.state.sketch,
          config: core_config,
        },
      )

      const node = await this.state.store.getMemoryNode(`memory-${timestamp_ms}`)
      if (node) {
        await build_waypoint_edges(this.state.store, this.state.provider, node)
      }
    }
  }

  async answerQuestion(input: BenchmarkQuestion): Promise<BenchmarkAnswer> {
    if (!this.state) throw new Error("openmemory adapter not initialized")
    if (this.state.mode === "http") {
      const { value: packet, elapsed_ms } = await time_async(async () =>
        this.state!.mode === "http"
          ? this.state.client.recallMemory({
            user_id: this.config.user_id,
            query: input.question_text,
            mode: this.config.recall_mode,
            token_budget: this.config.token_budget,
          })
          : Promise.reject(new Error("invalid state")))

      const context_text = packet.memories.map((memory) => memory.text).join("\n")
      return {
        question_id: input.id,
        answer_text: build_answer_text(input.question_text, packet.memories.map((memory) => ({ text: memory.text }))),
        latency_ms: elapsed_ms,
        prompt_tokens: estimate_tokens(input.question_text),
        retrieved_context_tokens: estimate_tokens(context_text),
        retrieved_context_size: packet.memories.length,
        retrieved_context: packet.memories.map((memory) => ({
          memory_node_id: memory.memory_node_id,
          text: memory.text,
          score: memory.score,
        })),
        traces: {
          memories: packet.memories.map((memory) => memory.trace),
          waypoint_trace: packet.waypoint_trace,
          sectors_used: packet.sectors_used,
        },
        raw: packet,
      }
    }

    const core_config = merge_core_config({
      projection: {
        k: this.config.embedding_dimensions ?? 64,
        seed: 1,
      },
      embedding: {
        provider: this.config.embedding_provider,
        model: this.config.embedding_model,
        dimensions: this.config.embedding_dimensions,
        api_key: this.config.embedding_api_key,
      },
    })

    const { value: packet, elapsed_ms } = await time_async(async () =>
      recall(
        {
          user_id: this.config.user_id,
          query_text: input.question_text,
          mode: this.config.recall_mode,
          token_budget: this.config.token_budget,
        },
        {
          store: this.state.store,
          provider: this.state.provider,
          config: core_config,
          expand_waypoints: async (memory_node_id: string) => {
            const edges = this.state?.mode === "inproc"
              ? await this.state.store.listWaypointEdgesFrom(this.config.user_id, memory_node_id)
              : []
            return edges.map((edge) => ({
              memory_node_id: edge.to_memory_node_id,
              edge_weight: edge.weight,
              relation: edge.relation,
            }))
          },
        },
      ))

    const context_text = packet.memories.map((memory) => memory.text).join("\n")
    return {
      question_id: input.id,
      answer_text: build_answer_text(input.question_text, packet.memories.map((memory) => ({ text: memory.text }))),
      latency_ms: elapsed_ms,
      prompt_tokens: estimate_tokens(input.question_text),
      retrieved_context_tokens: estimate_tokens(context_text),
      retrieved_context_size: packet.memories.length,
      retrieved_context: packet.memories.map((memory) => ({
        memory_node_id: memory.memory_node_id,
        text: memory.text,
        score: memory.score,
      })),
      traces: {
        memories: packet.memories.map((memory) => memory.trace),
        waypoint_trace: packet.waypoint_trace,
        sectors_used: packet.sectors_used,
      },
      raw: packet,
    }
  }

  async teardown(): Promise<void> {
    this.state = null
  }
}

export const create_openmemory_adapter = (): MemorySystemAdapter => new OpenMemoryAdapter()
