CREATE TABLE IF NOT EXISTS memory_nodes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp_ms INTEGER NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  sectors_json TEXT NOT NULL DEFAULT '[]',
  temporal_markers_json TEXT NOT NULL DEFAULT '[]'
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
  last_access_at INTEGER NOT NULL,
  FOREIGN KEY(memory_node_id) REFERENCES memory_nodes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sector_anchors_user_sector
  ON sector_anchors(user_id, sector, updated_at, id);

CREATE TABLE IF NOT EXISTS beliefs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  sector TEXT NOT NULL CHECK (
    sector IN ('episodic', 'semantic', 'procedural', 'emotional', 'reflective')
  ),
  source_memory_node_id TEXT NOT NULL,
  source_sector TEXT NOT NULL CHECK (
    source_sector IN ('episodic', 'semantic', 'procedural', 'emotional', 'reflective')
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

CREATE INDEX IF NOT EXISTS idx_beliefs_user_source
  ON beliefs(user_id, source_memory_node_id, id);

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
  created_at INTEGER NOT NULL,
  FOREIGN KEY(from_memory_node_id) REFERENCES memory_nodes(id) ON DELETE CASCADE,
  FOREIGN KEY(to_memory_node_id) REFERENCES memory_nodes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_waypoint_edges_user_from
  ON waypoint_edges(user_id, from_memory_node_id, id);

CREATE INDEX IF NOT EXISTS idx_waypoint_edges_user_to
  ON waypoint_edges(user_id, to_memory_node_id, id);
