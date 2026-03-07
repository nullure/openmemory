import { DatabaseSync } from "node:sqlite"
import type { Anchor } from "../types/anchor.ts"
import { assert_belief_source, type Belief } from "../types/belief.ts"
import type { MemoryNode } from "../types/memory_node.ts"
import type { SectorId, SectorState } from "../types/sector.ts"
import type { WaypointEdge } from "../types/waypoint.ts"
import { assert_waypoint_relation } from "../types/waypoint.ts"
import type { Store } from "./types.ts"
import { apply_sqlite_migrations } from "./sqlite_schema.ts"

export type sqlite_store_options = {
  path?: string
  auto_migrate?: boolean
}

type anchor_row = {
  id: string
  memory_node_id: string
  user_id: string
  sector: string
  embedding_json: string
  salience: number
  weight: number
  created_at: number
  updated_at: number
  last_access_at: number
}

type belief_row = {
  id: string
  user_id: string
  sector: string
  source_memory_node_id: string
  source_sector: string
  embedding_json: string
  weight: number
  created_at: string
  updated_at: string
  valid_from: string
  valid_to: string | null
}

type memory_node_row = {
  id: string
  user_id: string
  text: string
  timestamp_ms: number
  metadata_json: string
  sectors_json: string
  temporal_markers_json: string
}

type sector_state_row = {
  user_id: string
  sector: string
  id: string
  centroid_json: string
  mean_json: string
  variance_json: string
  created_at: string
  updated_at: string
  valid_from: string
  valid_to: string | null
}

type waypoint_row = {
  id: string
  user_id: string
  from_memory_node_id: string
  to_memory_node_id: string
  relation: string
  weight: number
  created_at: number
}

const to_json = (value: unknown): string => JSON.stringify(value)

const from_json = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export class SQLiteStore implements Store {
  private readonly db: DatabaseSync

  constructor(options: sqlite_store_options = {}) {
    this.db = new DatabaseSync(options.path ?? ":memory:")
    this.db.exec("PRAGMA journal_mode = WAL;")
    this.db.exec("PRAGMA foreign_keys = ON;")
    if (options.auto_migrate !== false) apply_sqlite_migrations(this.db)
  }

  close(): void {
    this.db.close()
  }

  async getAnchors(user_id: string, sector: SectorId): Promise<Anchor[]> {
    return this.listAnchors(user_id, sector)
  }

  async putAnchor(anchor: Anchor): Promise<void> {
    this.db
      .prepare(`
        INSERT INTO sector_anchors(
          id, memory_node_id, user_id, sector, embedding_json, salience, weight, created_at, updated_at, last_access_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          memory_node_id = excluded.memory_node_id,
          user_id = excluded.user_id,
          sector = excluded.sector,
          embedding_json = excluded.embedding_json,
          salience = excluded.salience,
          weight = excluded.weight,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          last_access_at = excluded.last_access_at
      `)
      .run(
        anchor.id,
        anchor.memory_node_id,
        anchor.user_id,
        anchor.sector,
        to_json(anchor.embedding),
        anchor.salience,
        anchor.weight,
        anchor.created_at,
        anchor.updated_at,
        anchor.last_access_at,
      )
  }

  async deleteAnchor(id: string): Promise<void> {
    this.db.prepare(`DELETE FROM sector_anchors WHERE id = ?`).run(id)
  }

  async listAnchors(user_id: string, sector: SectorId): Promise<Anchor[]> {
    const rows = this.db
      .prepare(`
        SELECT id, memory_node_id, user_id, sector, embedding_json, salience, weight, created_at, updated_at, last_access_at
        FROM sector_anchors
        WHERE user_id = ? AND sector = ?
        ORDER BY id ASC
      `)
      .all(user_id, sector) as anchor_row[]
    return rows.map((row) => ({
      id: row.id,
      memory_node_id: row.memory_node_id,
      user_id: row.user_id,
      sector: row.sector as SectorId,
      embedding: from_json<number[]>(row.embedding_json, []),
      salience: Number(row.salience),
      weight: Number(row.weight),
      created_at: Number(row.created_at),
      updated_at: Number(row.updated_at),
      last_access_at: Number(row.last_access_at),
    }))
  }

  async putMemoryNode(node: MemoryNode): Promise<void> {
    this.db
      .prepare(`
        INSERT INTO memory_nodes(id, user_id, text, timestamp_ms, metadata_json, sectors_json, temporal_markers_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          text = excluded.text,
          timestamp_ms = excluded.timestamp_ms,
          metadata_json = excluded.metadata_json,
          sectors_json = excluded.sectors_json,
          temporal_markers_json = excluded.temporal_markers_json
      `)
      .run(
        node.id,
        node.user_id,
        node.text,
        node.timestamp_ms,
        to_json(node.metadata ?? {}),
        to_json(node.sectors),
        to_json(node.temporal_markers ?? []),
      )
  }

  async getMemoryNode(id: string): Promise<MemoryNode | null> {
    const row = this.db
      .prepare(`
        SELECT id, user_id, text, timestamp_ms, metadata_json, sectors_json, temporal_markers_json
        FROM memory_nodes
        WHERE id = ?
      `)
      .get(id) as memory_node_row | undefined
    if (!row) return null
    return {
      id: row.id,
      user_id: row.user_id,
      text: row.text,
      timestamp_ms: Number(row.timestamp_ms),
      metadata: from_json<Record<string, unknown>>(row.metadata_json, {}),
      sectors: from_json<SectorId[]>(row.sectors_json, []),
      temporal_markers: from_json<string[]>(row.temporal_markers_json, []),
    }
  }

  async listMemoryNodes(user_id: string): Promise<MemoryNode[]> {
    const rows = this.db
      .prepare(`
        SELECT id, user_id, text, timestamp_ms, metadata_json, sectors_json, temporal_markers_json
        FROM memory_nodes
        WHERE user_id = ?
        ORDER BY timestamp_ms ASC, id ASC
      `)
      .all(user_id) as memory_node_row[]
    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      text: row.text,
      timestamp_ms: Number(row.timestamp_ms),
      metadata: from_json<Record<string, unknown>>(row.metadata_json, {}),
      sectors: from_json<SectorId[]>(row.sectors_json, []),
      temporal_markers: from_json<string[]>(row.temporal_markers_json, []),
    }))
  }

  async putWaypointEdge(edge: WaypointEdge): Promise<void> {
    assert_waypoint_relation(edge.relation)
    this.db
      .prepare(`
        INSERT INTO waypoint_edges(id, user_id, from_memory_node_id, to_memory_node_id, relation, weight, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          from_memory_node_id = excluded.from_memory_node_id,
          to_memory_node_id = excluded.to_memory_node_id,
          relation = excluded.relation,
          weight = excluded.weight,
          created_at = excluded.created_at
      `)
      .run(
        edge.id,
        edge.user_id,
        edge.from_memory_node_id,
        edge.to_memory_node_id,
        edge.relation,
        edge.weight,
        edge.created_at,
      )
  }

  async listWaypointEdgesFrom(user_id: string, from_memory_node_id: string): Promise<WaypointEdge[]> {
    const rows = this.db
      .prepare(`
        SELECT id, user_id, from_memory_node_id, to_memory_node_id, relation, weight, created_at
        FROM waypoint_edges
        WHERE user_id = ? AND from_memory_node_id = ?
        ORDER BY id ASC
      `)
      .all(user_id, from_memory_node_id) as waypoint_row[]
    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      from_memory_node_id: row.from_memory_node_id,
      to_memory_node_id: row.to_memory_node_id,
      relation: assert_waypoint_relation(row.relation),
      weight: Number(row.weight),
      created_at: Number(row.created_at),
    }))
  }

  async listWaypointEdgesForUser(user_id: string): Promise<WaypointEdge[]> {
    const rows = this.db
      .prepare(`
        SELECT id, user_id, from_memory_node_id, to_memory_node_id, relation, weight, created_at
        FROM waypoint_edges
        WHERE user_id = ?
        ORDER BY id ASC
      `)
      .all(user_id) as waypoint_row[]
    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      from_memory_node_id: row.from_memory_node_id,
      to_memory_node_id: row.to_memory_node_id,
      relation: assert_waypoint_relation(row.relation),
      weight: Number(row.weight),
      created_at: Number(row.created_at),
    }))
  }

  async getBeliefs(user_id: string): Promise<Belief[]> {
    const rows = this.db
      .prepare(`
        SELECT id, user_id, sector, source_memory_node_id, source_sector, embedding_json, weight, created_at, updated_at, valid_from, valid_to
        FROM beliefs
        WHERE user_id = ?
        ORDER BY id ASC
      `)
      .all(user_id) as belief_row[]
    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      sector: row.sector as SectorId,
      source_memory_node_id: row.source_memory_node_id,
      source_sector: row.source_sector as SectorId,
      embedding: from_json<number[]>(row.embedding_json, []),
      weight: Number(row.weight),
      timestamps: {
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      valid_from: row.valid_from,
      valid_to: row.valid_to,
    }))
  }

  async putBelief(belief: Belief): Promise<void> {
    assert_belief_source(belief)
    this.db
      .prepare(`
        INSERT INTO beliefs(id, user_id, sector, source_memory_node_id, source_sector, embedding_json, weight, created_at, updated_at, valid_from, valid_to)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          sector = excluded.sector,
          source_memory_node_id = excluded.source_memory_node_id,
          source_sector = excluded.source_sector,
          embedding_json = excluded.embedding_json,
          weight = excluded.weight,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          valid_from = excluded.valid_from,
          valid_to = excluded.valid_to
      `)
      .run(
        belief.id,
        belief.user_id,
        belief.sector,
        belief.source_memory_node_id,
        belief.source_sector,
        to_json(belief.embedding),
        belief.weight,
        belief.timestamps.created_at,
        belief.timestamps.updated_at,
        belief.valid_from,
        belief.valid_to,
      )
  }

  async updateBelief(belief: Belief): Promise<void> {
    await this.putBelief(belief)
  }

  async getSectorState(user_id: string, sector: SectorId): Promise<SectorState | null> {
    const row = this.db
      .prepare(`
        SELECT user_id, sector, id, centroid_json, mean_json, variance_json, created_at, updated_at, valid_from, valid_to
        FROM sector_state
        WHERE user_id = ? AND sector = ?
      `)
      .get(user_id, sector) as sector_state_row | undefined
    if (!row) return null
    return {
      id: row.id as SectorId,
      user_id: row.user_id,
      sector: row.sector as SectorId,
      centroid: from_json<number[]>(row.centroid_json, []),
      mean: from_json<number[]>(row.mean_json, []),
      variance: from_json<number[]>(row.variance_json, []),
      timestamps: {
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      valid_from: row.valid_from,
      valid_to: row.valid_to,
    }
  }

  async putSectorState(state: SectorState): Promise<void> {
    this.db
      .prepare(`
        INSERT INTO sector_state(
          user_id, sector, id, centroid_json, mean_json, variance_json, created_at, updated_at, valid_from, valid_to
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, sector) DO UPDATE SET
          id = excluded.id,
          centroid_json = excluded.centroid_json,
          mean_json = excluded.mean_json,
          variance_json = excluded.variance_json,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          valid_from = excluded.valid_from,
          valid_to = excluded.valid_to
      `)
      .run(
        state.user_id,
        state.sector,
        state.id,
        to_json(state.centroid),
        to_json(state.mean),
        to_json(state.variance),
        state.timestamps.created_at,
        state.timestamps.updated_at,
        state.valid_from,
        state.valid_to,
      )
  }
}
