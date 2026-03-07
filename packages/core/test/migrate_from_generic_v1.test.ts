import test from "node:test"
import assert from "node:assert/strict"
import { migrate_from_generic_v1, migrate_from_generic_v1_into_store, type generic_v1_record } from "../src/migrate/from_generic_v1.ts"
import { MemoryStore } from "../src/store/memory.ts"
import { ALL_SECTORS } from "../src/types/sector.ts"

const USER_ID = "migration-user"

const fixture: generic_v1_record[] = [
  {
    id: "legacy-1",
    user_id: USER_ID,
    memory_text: "I deployed the server yesterday.",
    timestamp_ms: 1700000001000,
    metadata: { source: "prompt-chain" },
    embeddings_by_sector: {
      temporal: [0.91, 0.09, 0],
      factual: [0.64, 0.36, 0],
    },
    weight: 1.1,
    salience: 1.3,
  },
  {
    id: "legacy-2",
    user_id: USER_ID,
    text: "I usually code Rust at night.",
    created_at: 1700000002000,
    anchors: [
      {
        id: "legacy-2-anchor",
        sector: "behavioral",
        embedding: [0.05, 0.94, 0.01],
        weight: 2.4,
        salience: 1.5,
      },
    ],
  },
  {
    id: "legacy-3",
    user_id: USER_ID,
    text: "Jamie likes sushi.",
    created_at: 1700000003000,
    sectors: ["semantic", "relational"],
    embedding: [0.12, 0.22, 0.66],
  },
]

const list_all_user_anchors = async (store: MemoryStore, user_id: string) => {
  const groups = await Promise.all(ALL_SECTORS.map((sector) => store.listAnchors(user_id, sector)))
  return groups.flat()
}

test("generic v1 fixture migrates into canonical nodes and linked anchors", () => {
  const out = migrate_from_generic_v1(fixture, { now_ms: 1700000000000 })
  assert.equal(out.issues.length, 0)
  assert.equal(out.memory_nodes.length, 3)
  assert.equal(out.anchors.length, 5)

  const nodes_by_id = new Map(out.memory_nodes.map((node) => [node.id, node]))
  assert.equal(nodes_by_id.get("memory-legacy-1")?.text, "I deployed the server yesterday.")
  assert.deepEqual(nodes_by_id.get("memory-legacy-1")?.sectors, ["episodic", "semantic"])

  for (const anchor of out.anchors) {
    assert.ok(nodes_by_id.has(anchor.memory_node_id), `orphan anchor: ${anchor.id}`)
  }

  const legacy3_node = out.memory_nodes.find((node) => node.id.includes("legacy-3"))
  assert.ok(legacy3_node)
  assert.deepEqual(legacy3_node.sectors, ["semantic", "reflective"])
  assert.equal(
    (legacy3_node.metadata.migrated_from_generic_v1 as { source_id: string }).source_id,
    "legacy-3",
  )
})

test("store migration leaves no orphan anchors", async () => {
  const store = new MemoryStore()
  const out = await migrate_from_generic_v1_into_store(store, fixture, { now_ms: 1700000000000 })
  assert.equal(out.issues.length, 0)

  const nodes = await store.listMemoryNodes(USER_ID)
  const node_ids = new Set(nodes.map((node) => node.id))
  const anchors = await list_all_user_anchors(store, USER_ID)
  assert.equal(anchors.length, out.anchors.length)

  for (const anchor of anchors) {
    assert.ok(node_ids.has(anchor.memory_node_id), `orphan anchor in store: ${anchor.id}`)
  }
})

test("strict migration fails loudly on invalid records", () => {
  const broken_fixture: generic_v1_record[] = [
    {
      id: "broken-1",
      user_id: USER_ID,
      memory_text: "This record has no embedding.",
      sector: "semantic",
    },
  ]

  assert.throws(
    () => migrate_from_generic_v1(broken_fixture, { now_ms: 1700000000000 }),
    /migration failed/i,
  )

  const non_strict = migrate_from_generic_v1(broken_fixture, { strict: false, now_ms: 1700000000000 })
  assert.equal(non_strict.memory_nodes.length, 0)
  assert.equal(non_strict.anchors.length, 0)
  assert.equal(non_strict.issues.length, 1)
})
