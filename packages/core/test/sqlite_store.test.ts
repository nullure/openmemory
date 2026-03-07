import test from "node:test"
import assert from "node:assert/strict"
import { MemoryStore } from "../src/store/memory.ts"
import type { Store } from "../src/store/types.ts"
import type { Anchor } from "../src/types/anchor.ts"
import type { Belief } from "../src/types/belief.ts"
import type { MemoryNode } from "../src/types/memory_node.ts"
import type { SectorState } from "../src/types/sector.ts"
import type { WaypointEdge } from "../src/types/waypoint.ts"

const USER_ID = "sqlite-user"

type sqlite_runtime = {
  SQLiteStore: typeof import("../src/store/sqlite.ts")["SQLiteStore"]
  apply_sqlite_migrations: typeof import("../src/store/sqlite_schema.ts")["apply_sqlite_migrations"]
  DatabaseSync: typeof import("node:sqlite")["DatabaseSync"]
}

const load_sqlite_runtime = async (): Promise<sqlite_runtime | null> => {
  try {
    const [{ SQLiteStore }, { apply_sqlite_migrations }, { DatabaseSync }] = await Promise.all([
      import("../src/store/sqlite.ts"),
      import("../src/store/sqlite_schema.ts"),
      import("node:sqlite"),
    ])
    return { SQLiteStore, apply_sqlite_migrations, DatabaseSync }
  } catch {
    return null
  }
}

const node_a: MemoryNode = {
  id: "memory-a",
  user_id: USER_ID,
  text: "Mount Everest is the tallest mountain.",
  timestamp_ms: 1000,
  metadata: { source: "seed" },
  sectors: ["semantic"],
  temporal_markers: [],
}

const node_b: MemoryNode = {
  id: "memory-b",
  user_id: USER_ID,
  text: "I went hiking last weekend.",
  timestamp_ms: 2000,
  metadata: {},
  sectors: ["episodic"],
  temporal_markers: ["last weekend"],
}

const anchor_a: Anchor = {
  id: "anchor-a",
  memory_node_id: node_a.id,
  user_id: USER_ID,
  sector: "semantic",
  embedding: [1, 0, 0],
  weight: 1,
  salience: 1.2,
  created_at: 1000,
  updated_at: 1000,
  last_access_at: 1000,
}

const belief_a: Belief = {
  id: "belief-a",
  user_id: USER_ID,
  sector: "semantic",
  source_memory_node_id: node_a.id,
  source_sector: "semantic",
  embedding: [1, 0, 0],
  weight: 0.8,
  timestamps: {
    created_at: "1970-01-01T00:00:01.000Z",
    updated_at: "1970-01-01T00:00:01.000Z",
  },
  valid_from: "1970-01-01T00:00:01.000Z",
  valid_to: null,
}

const state_a: SectorState = {
  id: "semantic",
  user_id: USER_ID,
  sector: "semantic",
  centroid: [1, 0, 0],
  mean: [1, 0, 0],
  variance: [0, 0, 0],
  timestamps: {
    created_at: "1970-01-01T00:00:01.000Z",
    updated_at: "1970-01-01T00:00:01.000Z",
  },
  valid_from: "1970-01-01T00:00:01.000Z",
  valid_to: null,
}

const edge_a: WaypointEdge = {
  id: "edge-a",
  user_id: USER_ID,
  from_memory_node_id: node_a.id,
  to_memory_node_id: node_b.id,
  relation: "semantic_neighbor",
  weight: 0.76,
  created_at: 2000,
}

const seed_store = async (store: Store): Promise<void> => {
  await store.putMemoryNode(node_a)
  await store.putMemoryNode(node_b)
  await store.putAnchor(anchor_a)
  await store.putBelief(belief_a)
  await store.putSectorState(state_a)
  await store.putWaypointEdge(edge_a)
}

const snapshot = async (store: Store) => ({
  nodes: await store.listMemoryNodes(USER_ID),
  anchor_semantic: await store.listAnchors(USER_ID, "semantic"),
  beliefs: await store.getBeliefs(USER_ID),
  sector_state: await store.getSectorState(USER_ID, "semantic"),
  waypoints: await store.listWaypointEdgesForUser(USER_ID),
})

test("sqlite schema creates cleanly for HMD v2", async (t) => {
  const runtime = await load_sqlite_runtime()
  if (!runtime) {
    t.skip("node:sqlite is unavailable in this runtime")
    return
  }

  const db = new runtime.DatabaseSync(":memory:")
  try {
    const applied = runtime.apply_sqlite_migrations(db)
    assert.ok(applied > 0)

    const tables = db
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`)
      .all() as Array<{ name: string }>
    const names = new Set(tables.map((row) => row.name))
    for (const table of [
      "memory_nodes",
      "sector_anchors",
      "beliefs",
      "sector_state",
      "sketches",
      "waypoint_edges",
    ]) {
      assert.ok(names.has(table), `missing table ${table}`)
    }

    const fk = db.prepare(`PRAGMA foreign_key_list(sector_anchors)`).all() as Array<{
      table: string
      from: string
    }>
    assert.ok(fk.some((row) => row.table === "memory_nodes" && row.from === "memory_node_id"))

    const second_run = runtime.apply_sqlite_migrations(db)
    assert.equal(second_run, 0)
  } finally {
    db.close()
  }
})

test("sqlite store inserts and reads HMD entities", async (t) => {
  const runtime = await load_sqlite_runtime()
  if (!runtime) {
    t.skip("node:sqlite is unavailable in this runtime")
    return
  }

  const store = new runtime.SQLiteStore({ path: ":memory:" })
  try {
    await seed_store(store)
    const out = await snapshot(store)
    assert.equal(out.nodes.length, 2)
    assert.equal(out.anchor_semantic.length, 1)
    assert.equal(out.anchor_semantic[0].memory_node_id, node_a.id)
    assert.equal(out.beliefs.length, 1)
    assert.equal(out.beliefs[0].source_memory_node_id, node_a.id)
    assert.equal(out.sector_state?.id, "semantic")
    assert.equal(out.waypoints.length, 1)
    assert.equal(out.waypoints[0].id, edge_a.id)
  } finally {
    store.close()
  }
})

test("memory and sqlite stores share behavior for canonical HMD entities", async (t) => {
  const runtime = await load_sqlite_runtime()
  if (!runtime) {
    t.skip("node:sqlite is unavailable in this runtime")
    return
  }

  const memory_store = new MemoryStore()
  const sqlite_store = new runtime.SQLiteStore({ path: ":memory:" })
  try {
    await seed_store(memory_store)
    await seed_store(sqlite_store)
    const memory_view = await snapshot(memory_store)
    const sqlite_view = await snapshot(sqlite_store)
    assert.deepEqual(sqlite_view, memory_view)
  } finally {
    sqlite_store.close()
  }
})
