import { readFileSync } from "node:fs"
import type { DatabaseSync } from "node:sqlite"

export type sqlite_migration = {
  version: number
  name: string
  sql?: string
  up?: (db: DatabaseSync) => void
}

const now_iso = (): string => new Date().toISOString()

const schema_sql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8")

const ensure_migration_table = (db: DatabaseSync): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `)
}

const table_exists = (db: DatabaseSync, table: string): boolean => {
  const row = db
    .prepare(`SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .get(table) as { ok: number } | undefined
  return Boolean(row?.ok)
}

const column_exists = (db: DatabaseSync, table: string, column: string): boolean => {
  if (!table_exists(db, table)) return false
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
  return rows.some((row) => row.name === column)
}

const foreign_key_exists = (
  db: DatabaseSync,
  table: string,
  from_column: string,
  to_table: string,
): boolean => {
  if (!table_exists(db, table)) return false
  const rows = db.prepare(`PRAGMA foreign_key_list(${table})`).all() as Array<{
    from: string
    table: string
  }>
  return rows.some((row) => row.from === from_column && row.table === to_table)
}

const ensure_column = (
  db: DatabaseSync,
  table: string,
  column: string,
  sql_type: string,
  default_sql?: string,
): void => {
  if (column_exists(db, table, column)) return
  const default_clause = default_sql ? ` DEFAULT ${default_sql}` : ""
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${sql_type}${default_clause};`)
}

const rebuild_sector_anchors_for_node_linkage = (db: DatabaseSync): void => {
  if (!table_exists(db, "sector_anchors")) return
  if (foreign_key_exists(db, "sector_anchors", "memory_node_id", "memory_nodes")) return

  db.exec(`
    CREATE TABLE sector_anchors_v2 (
      id TEXT PRIMARY KEY,
      memory_node_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      sector TEXT NOT NULL CHECK (
        sector IN ('episodic', 'semantic', 'procedural', 'emotional', 'reflective')
      ),
      embedding_json TEXT NOT NULL,
      salience REAL NOT NULL,
      weight REAL NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_access_at INTEGER NOT NULL,
      FOREIGN KEY(memory_node_id) REFERENCES memory_nodes(id) ON DELETE CASCADE
    );

    INSERT INTO sector_anchors_v2(
      id, memory_node_id, user_id, sector, embedding_json, salience, weight, created_at, updated_at, last_access_at
    )
    SELECT
      sa.id,
      sa.memory_node_id,
      sa.user_id,
      sa.sector,
      sa.embedding_json,
      sa.salience,
      sa.weight,
      sa.created_at,
      sa.updated_at,
      sa.last_access_at
    FROM sector_anchors AS sa
    WHERE EXISTS (
      SELECT 1
      FROM memory_nodes AS mn
      WHERE mn.id = sa.memory_node_id
    );

    DROP TABLE sector_anchors;
    ALTER TABLE sector_anchors_v2 RENAME TO sector_anchors;

    CREATE INDEX IF NOT EXISTS idx_sector_anchors_user_sector
      ON sector_anchors(user_id, sector, updated_at, id);
  `)
}

const rebuild_waypoint_edges_for_node_linkage = (db: DatabaseSync): void => {
  if (!table_exists(db, "waypoint_edges")) return
  if (
    foreign_key_exists(db, "waypoint_edges", "from_memory_node_id", "memory_nodes")
    && foreign_key_exists(db, "waypoint_edges", "to_memory_node_id", "memory_nodes")
  ) {
    return
  }

  db.exec(`
    CREATE TABLE waypoint_edges_v2 (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      from_memory_node_id TEXT NOT NULL,
      to_memory_node_id TEXT NOT NULL,
      relation TEXT NOT NULL CHECK (
        relation IN ('same_sector', 'shared_entity', 'temporal_neighbor', 'semantic_neighbor')
      ),
      weight REAL NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(from_memory_node_id) REFERENCES memory_nodes(id) ON DELETE CASCADE,
      FOREIGN KEY(to_memory_node_id) REFERENCES memory_nodes(id) ON DELETE CASCADE
    );

    INSERT INTO waypoint_edges_v2(
      id, user_id, from_memory_node_id, to_memory_node_id, relation, weight, created_at
    )
    SELECT
      we.id,
      we.user_id,
      we.from_memory_node_id,
      we.to_memory_node_id,
      we.relation,
      we.weight,
      we.created_at
    FROM waypoint_edges AS we
    WHERE EXISTS (
      SELECT 1 FROM memory_nodes AS mn_from WHERE mn_from.id = we.from_memory_node_id
    )
    AND EXISTS (
      SELECT 1 FROM memory_nodes AS mn_to WHERE mn_to.id = we.to_memory_node_id
    );

    DROP TABLE waypoint_edges;
    ALTER TABLE waypoint_edges_v2 RENAME TO waypoint_edges;

    CREATE INDEX IF NOT EXISTS idx_waypoint_edges_user_from
      ON waypoint_edges(user_id, from_memory_node_id, id);
    CREATE INDEX IF NOT EXISTS idx_waypoint_edges_user_to
      ON waypoint_edges(user_id, to_memory_node_id, id);
  `)
}

const ensure_hmd_v2_columns = (db: DatabaseSync): void => {
  ensure_column(db, "memory_nodes", "temporal_markers_json", "TEXT", "'[]'")
  ensure_column(db, "beliefs", "source_memory_node_id", "TEXT", "'legacy-source'")
  ensure_column(db, "beliefs", "source_sector", "TEXT", "'semantic'")
  db.exec(`
    UPDATE beliefs
    SET source_memory_node_id = 'legacy-source'
    WHERE source_memory_node_id IS NULL OR source_memory_node_id = '';
    UPDATE beliefs
    SET source_sector = 'semantic'
    WHERE source_sector IS NULL OR source_sector = '';

    CREATE INDEX IF NOT EXISTS idx_beliefs_user_source
      ON beliefs(user_id, source_memory_node_id, id);
  `)
}

const retrofit_hmd_v2_linkage = (db: DatabaseSync): void => {
  db.exec(schema_sql)
  ensure_hmd_v2_columns(db)
  rebuild_sector_anchors_for_node_linkage(db)
  rebuild_waypoint_edges_for_node_linkage(db)
}

export const sqlite_base_migrations: readonly sqlite_migration[] = [
  {
    version: 1,
    name: "hmd_v2_schema",
    sql: schema_sql,
  },
  {
    version: 2,
    name: "ensure_hmd_v2_columns",
    up: ensure_hmd_v2_columns,
  },
  {
    version: 3,
    name: "retrofit_hmd_v2_linkage",
    up: retrofit_hmd_v2_linkage,
  },
]

export const apply_sqlite_migrations = (
  db: DatabaseSync,
  migrations: readonly sqlite_migration[] = sqlite_base_migrations,
): number => {
  ensure_migration_table(db)
  const rows = db
    .prepare(`SELECT version FROM schema_migrations ORDER BY version ASC`)
    .all() as Array<{ version: number }>
  const applied_versions = new Set(rows.map((row) => Number(row.version)))
  const sorted = migrations.slice().sort((a, b) => a.version - b.version)
  let applied_count = 0

  for (const migration of sorted) {
    if (applied_versions.has(migration.version)) continue
    db.exec("BEGIN IMMEDIATE TRANSACTION")
    try {
      if (migration.sql) db.exec(migration.sql)
      if (migration.up) migration.up(db)
      db
        .prepare(`INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)`)
        .run(migration.version, migration.name, now_iso())
      db.exec("COMMIT")
      applied_count += 1
    } catch (error) {
      db.exec("ROLLBACK")
      throw error
    }
  }

  return applied_count
}
