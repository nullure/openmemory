import type { Store } from "../store/types.ts"
import type { Anchor } from "../types/anchor.ts"
import type { MemoryNode } from "../types/memory_node.ts"
import { ALL_SECTORS, type SectorId } from "../types/sector.ts"

export type generic_v1_record = Record<string, unknown>

export type generic_v1_migration_issue = {
  index: number
  source_id: string | null
  message: string
}

export type generic_v1_migration_options = {
  strict?: boolean
  now_ms?: number
}

export type generic_v1_migration_result = {
  memory_nodes: MemoryNode[]
  anchors: Anchor[]
  issues: generic_v1_migration_issue[]
  warnings: generic_v1_migration_issue[]
}

type legacy_anchor_input = {
  id?: unknown
  sector?: unknown
  embedding?: unknown
  weight?: unknown
  salience?: unknown
  timestamp_ms?: unknown
  created_at?: unknown
  updated_at?: unknown
  last_access_at?: unknown
}

const is_object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const as_non_empty_string = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const get_first = (record: Record<string, unknown>, keys: readonly string[]): unknown => {
  for (const key of keys) {
    if (key in record) return record[key]
  }
  return undefined
}

const to_number = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed.length) return null
    const as_numeric = Number(trimmed)
    if (Number.isFinite(as_numeric)) return as_numeric
  }
  return null
}

const to_timestamp_ms = (value: unknown): number | null => {
  const numeric = to_number(value)
  if (numeric !== null) return Math.trunc(numeric)
  if (typeof value === "string") {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return null
}

const pick_timestamp_ms = (...values: unknown[]): number | null => {
  for (const value of values) {
    const ts = to_timestamp_ms(value)
    if (ts !== null) return ts
  }
  return null
}

const sort_sectors = (sectors: SectorId[]): SectorId[] => {
  const order = new Map<SectorId, number>()
  for (let i = 0; i < ALL_SECTORS.length; i += 1) order.set(ALL_SECTORS[i], i)
  return sectors
    .slice()
    .sort((a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER))
}

const with_unique_id = (base_id: string, existing_ids: Set<string>): string => {
  const trimmed = base_id.trim()
  const clean = trimmed.length ? trimmed : "legacy"
  if (!existing_ids.has(clean)) {
    existing_ids.add(clean)
    return clean
  }
  let i = 2
  while (existing_ids.has(`${clean}-${i}`)) i += 1
  const next = `${clean}-${i}`
  existing_ids.add(next)
  return next
}

const legacy_sector_aliases: Record<string, SectorId> = {
  episodic: "episodic",
  event: "episodic",
  events: "episodic",
  temporal: "episodic",
  timeline: "episodic",

  semantic: "semantic",
  fact: "semantic",
  facts: "semantic",
  factual: "semantic",
  concept: "semantic",

  procedural: "procedural",
  behavior: "procedural",
  behavioural: "procedural",
  behavioral: "procedural",
  habit: "procedural",
  habits: "procedural",
  routine: "procedural",
  routines: "procedural",

  emotional: "emotional",
  emotion: "emotional",
  affective: "emotional",
  sentiment: "emotional",

  reflective: "reflective",
  reflection: "reflective",
  reflective_meta: "reflective",
  relational: "reflective",
  relation: "reflective",
  metacognitive: "reflective",
  meta: "reflective",
}

const to_sector_id = (value: unknown, label: string): SectorId => {
  const raw = as_non_empty_string(value)
  if (!raw) throw new Error(`${label} is required`)
  const mapped = legacy_sector_aliases[raw.toLowerCase()]
  if (!mapped) throw new Error(`${label} "${raw}" is not supported`)
  return mapped
}

const read_embedding = (value: unknown, label: string): number[] => {
  if (!Array.isArray(value)) throw new Error(`${label} embedding is required`)
  const embedding = value.map((entry, i) => {
    const parsed = to_number(entry)
    if (parsed === null) throw new Error(`${label} embedding[${i}] is invalid`)
    return parsed
  })
  return embedding
}

const parse_sector_list = (record: Record<string, unknown>): SectorId[] => {
  const sectors = new Set<SectorId>()
  const record_sectors = record.sectors
  if (Array.isArray(record_sectors)) {
    for (let i = 0; i < record_sectors.length; i += 1) {
      sectors.add(to_sector_id(record_sectors[i], `sectors[${i}]`))
    }
  }
  if ("sector" in record) sectors.add(to_sector_id(record.sector, "sector"))
  if (!sectors.size) sectors.add("semantic")
  return sort_sectors(Array.from(sectors))
}

const to_legacy_anchor_inputs = (record: Record<string, unknown>, sectors: SectorId[]): legacy_anchor_input[] => {
  const out: legacy_anchor_input[] = []

  const anchors = record.anchors
  if (Array.isArray(anchors)) {
    for (const entry of anchors) {
      if (!is_object(entry)) throw new Error("anchors[] must contain objects")
      out.push({
        id: entry.id,
        sector: entry.sector,
        embedding: entry.embedding ?? entry.vector,
        weight: entry.weight,
        salience: entry.salience,
        timestamp_ms: entry.timestamp_ms,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        last_access_at: entry.last_access_at,
      })
    }
  }

  const embeddings_by_sector = record.embeddings_by_sector
  if (is_object(embeddings_by_sector)) {
    const keys = Object.keys(embeddings_by_sector).sort()
    for (const key of keys) {
      out.push({
        sector: key,
        embedding: embeddings_by_sector[key],
        weight: record.weight,
        salience: record.salience,
        timestamp_ms: record.timestamp_ms,
        created_at: record.created_at,
        updated_at: record.updated_at,
        last_access_at: record.last_access_at,
      })
    }
  }

  if (!out.length) {
    const shared_embedding = get_first(record, ["embedding", "vector"])
    if (!Array.isArray(shared_embedding)) {
      throw new Error("record has no anchors and no fallback embedding")
    }
    for (const sector of sectors) {
      out.push({
        sector,
        embedding: shared_embedding,
        weight: record.weight,
        salience: record.salience,
        timestamp_ms: record.timestamp_ms,
        created_at: record.created_at,
        updated_at: record.updated_at,
        last_access_at: record.last_access_at,
      })
    }
  }

  return out
}

const issue_text = (issues: generic_v1_migration_issue[]): string =>
  issues.map((issue) => `[index ${issue.index}${issue.source_id ? ` id=${issue.source_id}` : ""}] ${issue.message}`).join("; ")

export const migrate_from_generic_v1 = (
  records: readonly generic_v1_record[],
  options: generic_v1_migration_options = {},
): generic_v1_migration_result => {
  const strict = options.strict !== false
  const fallback_now = options.now_ms ?? Date.now()
  const memory_nodes: MemoryNode[] = []
  const anchors: Anchor[] = []
  const issues: generic_v1_migration_issue[] = []
  const warnings: generic_v1_migration_issue[] = []
  const memory_ids = new Set<string>()
  const anchor_ids = new Set<string>()

  for (let index = 0; index < records.length; index += 1) {
    const raw = records[index]
    let source_id: string | null = null
    try {
      if (!is_object(raw)) throw new Error("record is not an object")
      source_id = as_non_empty_string(get_first(raw, ["id", "anchor_id", "legacy_id"]))
      const user_id = as_non_empty_string(get_first(raw, ["user_id", "userId"]))
      if (!user_id) throw new Error("missing user_id")
      const text = as_non_empty_string(get_first(raw, ["memory_text", "text", "content", "value"]))
      if (!text) throw new Error("missing memory text")
      const sectors = parse_sector_list(raw)
      const anchor_inputs = to_legacy_anchor_inputs(raw, sectors)
      if (!anchor_inputs.length) throw new Error("record did not produce anchors")

      const record_timestamp = pick_timestamp_ms(raw.timestamp_ms, raw.timestamp, raw.created_at, raw.updated_at)
      let timestamp_ms = record_timestamp
      if (timestamp_ms === null) {
        timestamp_ms = pick_timestamp_ms(
          anchor_inputs[0]?.timestamp_ms,
          anchor_inputs[0]?.created_at,
          anchor_inputs[0]?.updated_at,
        )
      }
      if (timestamp_ms === null) {
        timestamp_ms = fallback_now
        warnings.push({
          index,
          source_id,
          message: "timestamp missing; used fallback now_ms",
        })
      }

      const metadata = is_object(raw.metadata) ? { ...raw.metadata } : {}
      const node_id_seed = as_non_empty_string(raw.memory_node_id)
        ?? (source_id ? `memory-${source_id}` : `memory-generic-v1-${index + 1}`)
      const memory_node_id = with_unique_id(node_id_seed, memory_ids)
      const migrated_anchors: Anchor[] = []
      for (let i = 0; i < anchor_inputs.length; i += 1) {
        const input = anchor_inputs[i]
        const sector = input.sector === undefined ? sectors[0] : to_sector_id(input.sector, `anchors[${i}].sector`)
        const embedding_value = input.embedding ?? get_first(raw, ["embedding", "vector"])
        const embedding = read_embedding(embedding_value, `anchors[${i}]`)
        const created_at = pick_timestamp_ms(
          input.timestamp_ms,
          input.created_at,
          raw.timestamp_ms,
          raw.timestamp,
          raw.created_at,
          timestamp_ms,
        ) ?? timestamp_ms
        const updated_at = pick_timestamp_ms(input.updated_at, raw.updated_at, created_at) ?? created_at
        const last_access_at = pick_timestamp_ms(input.last_access_at, updated_at) ?? updated_at
        const weight = Math.max(0, to_number(input.weight ?? raw.weight) ?? 1)
        const salience = Math.max(0, to_number(input.salience ?? raw.salience) ?? 1)
        const anchor_seed = as_non_empty_string(input.id)
          ?? `${source_id ? `anchor-${source_id}` : `anchor-generic-v1-${index + 1}`}-${sector}-${i + 1}`
        migrated_anchors.push({
          id: with_unique_id(anchor_seed, anchor_ids),
          memory_node_id,
          user_id,
          sector,
          embedding,
          weight,
          salience,
          created_at,
          updated_at,
          last_access_at,
        })
      }

      const node_sectors = sort_sectors(Array.from(new Set(migrated_anchors.map((anchor) => anchor.sector))))
      memory_nodes.push({
        id: memory_node_id,
        user_id,
        text,
        timestamp_ms,
        metadata: {
          ...metadata,
          migrated_from_generic_v1: {
            source_id,
            source_index: index,
          },
        },
        sectors: node_sectors,
        temporal_markers: [],
      })
      anchors.push(...migrated_anchors)
    } catch (error) {
      issues.push({
        index,
        source_id,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  if (strict && issues.length) {
    throw new Error(`generic v1 migration failed: ${issue_text(issues)}`)
  }

  return { memory_nodes, anchors, issues, warnings }
}

export const migrate_from_generic_v1_into_store = async (
  store: Store,
  records: readonly generic_v1_record[],
  options: generic_v1_migration_options = {},
): Promise<generic_v1_migration_result> => {
  const migrated = migrate_from_generic_v1(records, options)
  for (const node of migrated.memory_nodes) await store.putMemoryNode(node)
  for (const anchor of migrated.anchors) await store.putAnchor(anchor)
  return migrated
}

