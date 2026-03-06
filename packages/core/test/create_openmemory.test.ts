import test from "node:test"
import assert from "node:assert/strict"
import { MemoryStore } from "../src/store/memory.ts"
import { createOpenMemory } from "../src/create.ts"
import { ALL_SECTORS, type SectorId } from "../src/types/sector.ts"

const make_centroids = (): Record<SectorId, number[]> => {
  const out = {} as Record<SectorId, number[]>
  const values = [
    [1, 0],
    [0, 1],
    [1, 1],
    [-1, 0],
    [0, -1],
  ]
  for (let i = 0; i < ALL_SECTORS.length; i += 1) out[ALL_SECTORS[i]] = values[i]
  return out
}

test("fake provider selected by default", () => {
  const engine = createOpenMemory({
    store: new MemoryStore(),
    centroids: make_centroids(),
  })
  assert.equal(engine.provider.name(), "fake")
})

test("openai provider selected when configured", () => {
  const engine = createOpenMemory({
    store: new MemoryStore(),
    centroids: make_centroids(),
    config: {
      embedding: {
        provider: "openai",
        api_key: "test",
        dimensions: 3,
      },
    },
  })
  assert.equal(engine.provider.name(), "openai")
  assert.equal(engine.provider.dimensions(), 3)
})

test("siray provider selected when configured", () => {
  const engine = createOpenMemory({
    store: new MemoryStore(),
    centroids: make_centroids(),
    config: {
      embedding: {
        provider: "siray",
        api_key: "test",
        dimensions: 5,
      },
    },
  })
  assert.equal(engine.provider.name(), "siray")
  assert.equal(engine.provider.dimensions(), 5)
})

test("missing api key throws for openai provider", () => {
  assert.throws(() => {
    createOpenMemory({
      store: new MemoryStore(),
      centroids: make_centroids(),
      config: {
        embedding: {
          provider: "openai",
        },
      },
    })
  }, /missing openai api key/)
})

test("missing api key throws for siray provider", () => {
  assert.throws(() => {
    createOpenMemory({
      store: new MemoryStore(),
      centroids: make_centroids(),
      config: {
        embedding: {
          provider: "siray",
        },
      },
    })
  }, /missing siray api key/)
})
