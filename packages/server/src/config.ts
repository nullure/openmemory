export type embed_provider = "fake" | "openai" | "siray"

export type provider_config = {
  api_key?: string
  model?: string
  dimensions?: number
}

export type server_config = {
  embedding_provider: embed_provider
  openmemory_store_path: string
  openai: provider_config
  siray: provider_config
}

type env_map = Record<string, string | undefined>

const as_non_empty = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const parse_optional_dimensions = (
  value: string | undefined,
  env_key: string,
): number | undefined => {
  const parsed = as_non_empty(value)
  if (!parsed) return undefined
  const num = Number(parsed)
  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(`invalid ${env_key}: must be a positive integer`)
  }
  return num
}

const parse_provider = (value: string | undefined): embed_provider => {
  const raw = as_non_empty(value)?.toLowerCase() ?? "fake"
  if (raw === "fake" || raw === "openai" || raw === "siray") return raw
  throw new Error("invalid OPENMEMORY_EMBED_PROVIDER: expected fake|openai|siray")
}

export const load_server_config = (env: env_map = process.env): server_config => {
  const embedding_provider = parse_provider(env.OPENMEMORY_EMBED_PROVIDER)
  const config: server_config = {
    embedding_provider,
    openmemory_store_path: as_non_empty(env.OPENMEMORY_STORE_PATH) ?? ":memory:",
    openai: {
      api_key: as_non_empty(env.OPENAI_API_KEY),
      model: as_non_empty(env.OPENAI_EMBED_MODEL),
      dimensions: parse_optional_dimensions(env.OPENAI_EMBED_DIMENSIONS, "OPENAI_EMBED_DIMENSIONS"),
    },
    siray: {
      api_key: as_non_empty(env.SIRAY_API_KEY),
      model: as_non_empty(env.SIRAY_EMBED_MODEL),
      dimensions: parse_optional_dimensions(env.SIRAY_EMBED_DIMENSIONS, "SIRAY_EMBED_DIMENSIONS"),
    },
  }

  if (embedding_provider === "openai" && !config.openai.api_key) {
    throw new Error("missing OPENAI_API_KEY when OPENMEMORY_EMBED_PROVIDER=openai")
  }
  if (embedding_provider === "siray" && !config.siray.api_key) {
    throw new Error("missing SIRAY_API_KEY when OPENMEMORY_EMBED_PROVIDER=siray")
  }

  return config
}

