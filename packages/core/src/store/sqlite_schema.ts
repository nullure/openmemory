import type { DatabaseSync } from "node:sqlite"

export type sqlite_migration = {
  version: number
  name: string
  sql: string
}

const now_iso = (): string => new Date().toISOString()

const ensure_migration_table = (db: DatabaseSync): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `)
}

export const sqlite_base_migrations: readonly sqlite_migration[] = [
  {
    version: 1,
    name: "initial_hmd_schema",
    sql: `
      CREATE TABLE IF NOT EXISTS memory_nodes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp_ms INTEGER NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}',
        sectors_json TEXT NOT NULL DEFAULT '[]'
      );

      CREATE INDEX IF NOT EXISTS idx_memory_nodes_user_time
        ON memory_nodes(user_id, timestamp_ms, id);

      CREATE TABLE IF NOT EXISTS sector_anchors (
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
        last_access_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sector_anchors_user_sector
        ON sector_anchors(user_id, sector, updated_at, id);

      CREATE TABLE IF NOT EXISTS beliefs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        sector TEXT NOT NULL CHECK (
          sector IN ('episodic', 'semantic', 'procedural', 'emotional', 'reflective')
        ),
        embedding_json TEXT NOT NULL,
        weight REAL NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        valid_from TEXT NOT NULL,
        valid_to TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_beliefs_user_valid
        ON beliefs(user_id, valid_to, updated_at, id);

      CREATE TABLE IF NOT EXISTS sector_state (
        user_id TEXT NOT NULL,
        sector TEXT NOT NULL CHECK (
          sector IN ('episodic', 'semantic', 'procedural', 'emotional', 'reflective')
        ),
        id TEXT NOT NULL,
        centroid_json TEXT NOT NULL,
        mean_json TEXT NOT NULL,
        variance_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        valid_from TEXT NOT NULL,
        valid_to TEXT,
        PRIMARY KEY (user_id, sector)
      );

      CREATE TABLE IF NOT EXISTS sketches (
        user_id TEXT NOT NULL,
        key TEXT NOT NULL,
        estimate INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, key)
      );

      CREATE TABLE IF NOT EXISTS waypoint_edges (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        from_memory_node_id TEXT NOT NULL,
        to_memory_node_id TEXT NOT NULL,
        relation TEXT NOT NULL CHECK (
          relation IN ('same_sector', 'shared_entity', 'temporal_neighbor', 'semantic_neighbor')
        ),
        weight REAL NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_waypoint_edges_user_from
        ON waypoint_edges(user_id, from_memory_node_id, id);

      CREATE INDEX IF NOT EXISTS idx_waypoint_edges_user_to
        ON waypoint_edges(user_id, to_memory_node_id, id);
    `,
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
      db.exec(migration.sql)
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

