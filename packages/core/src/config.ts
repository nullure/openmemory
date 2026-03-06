import { ALL_SECTORS, type SectorId } from "./types/sector.ts"

export type sector_config = {
  decay_lambda: number
  novelty_threshold: number
  classifier_weight: number
}

export type embedding_config = {
  provider: "fake" | "openai" | "siray"
  model?: string
  dimensions?: number
  api_key?: string
}

export type core_config = {
  embedding: embedding_config
  projection: {
    k: number
    seed: number
  }
  novelty_thresholds_by_sector: Record<SectorId, number>
  decay_lambdas_by_sector: Record<SectorId, number>
  classifier_weights_by_sector: Record<SectorId, number>
  recency: {
    gamma: number
  }
  scoring_betas: {
    similarity: number
    weight: number
    recency: number
  }
  ema: {
    alpha: number
    beta: number
  }
  anchor_limit: number
  belief_decay_lambda: number
  epsilons: {
    vector_norm: number
    novelty: number
  }
}

export type core_config_overrides = {
  embedding?: Partial<core_config["embedding"]>
  projection?: Partial<core_config["projection"]>
  novelty_thresholds_by_sector?: Partial<Record<SectorId, number>>
  decay_lambdas_by_sector?: Partial<Record<SectorId, number>>
  classifier_weights_by_sector?: Partial<Record<SectorId, number>>
  recency?: Partial<core_config["recency"]>
  scoring_betas?: Partial<core_config["scoring_betas"]>
  ema?: Partial<core_config["ema"]>
  anchor_limit?: core_config["anchor_limit"]
  belief_decay_lambda?: core_config["belief_decay_lambda"]
  epsilons?: Partial<core_config["epsilons"]>
}

export const default_sector_config: Record<SectorId, sector_config> = {
  episodic: { decay_lambda: 0, novelty_threshold: 0, classifier_weight: 1 },
  semantic: { decay_lambda: 0, novelty_threshold: 0, classifier_weight: 1 },
  procedural: { decay_lambda: 0, novelty_threshold: 0, classifier_weight: 1 },
  emotional: { decay_lambda: 0, novelty_threshold: 0, classifier_weight: 1 },
  reflective: { decay_lambda: 0, novelty_threshold: 0, classifier_weight: 1 },
}

const map_sector_values = <K extends keyof sector_config>(key: K): Record<SectorId, number> => {
  const out = {} as Record<SectorId, number>
  for (const sector of ALL_SECTORS) out[sector] = default_sector_config[sector][key]
  return out
}

export const default_config: core_config = {
  embedding: {
    provider: "fake",
    model: undefined,
    dimensions: undefined,
    api_key: undefined,
  },
  projection: {
    k: 64,
    seed: 1,
  },
  novelty_thresholds_by_sector: map_sector_values("novelty_threshold"),
  decay_lambdas_by_sector: map_sector_values("decay_lambda"),
  classifier_weights_by_sector: map_sector_values("classifier_weight"),
  recency: {
    gamma: 0.1,
  },
  scoring_betas: {
    similarity: 1.0,
    weight: 0.35,
    recency: 0.2,
  },
  ema: {
    alpha: 0.05,
    beta: 0.05,
  },
  anchor_limit: 100,
  belief_decay_lambda: 0,
  epsilons: {
    vector_norm: 1e-12,
    novelty: 1e-8,
  },
}

const is_plain_object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const map_fields = new Set([
  "novelty_thresholds_by_sector",
  "decay_lambdas_by_sector",
  "classifier_weights_by_sector",
])

const sector_set = new Set<string>(ALL_SECTORS)

const validate_map = (value: Record<string, unknown>, path: string): void => {
  for (const [key, v] of Object.entries(value)) {
    if (!sector_set.has(key)) throw new Error(`invalid sector id: ${key}`)
    if (typeof v !== "number" || Number.isNaN(v)) throw new Error(`invalid config value: ${path}.${key}`)
  }
}

const merge_known = <T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown>,
  path: string,
): T => {
  const out: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(override)) {
    if (!(key in base)) throw new Error(`unknown config key: ${path}${key}`)
    if (map_fields.has(key)) {
      if (!is_plain_object(value)) throw new Error(`invalid config value: ${path}${key}`)
      const base_map = (base as Record<string, unknown>)[key]
      if (!is_plain_object(base_map)) throw new Error(`invalid config value: ${path}${key}`)
      validate_map(value, `${path}${key}`)
      out[key] = { ...base_map, ...value }
      continue
    }
    const base_value = (base as Record<string, unknown>)[key]
    if (is_plain_object(base_value)) {
      if (!is_plain_object(value)) throw new Error(`invalid config value: ${path}${key}`)
      out[key] = merge_known(base_value, value, `${path}${key}.`)
      continue
    }
    out[key] = value
  }
  return out as T
}

export const merge_config = (overrides: core_config_overrides = {}): core_config => {
  if (!is_plain_object(overrides)) throw new Error("invalid config overrides")
  return merge_known(default_config, overrides, "")
}
