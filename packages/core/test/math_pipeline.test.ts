import test from "node:test"
import assert from "node:assert/strict"
import { make_projection_matrix, project } from "../src/math/projection.ts"
import { route_sectors } from "../src/math/routing.ts"
import { update_mean, update_variance } from "../src/math/ema.ts"
import { novelty_score } from "../src/math/novelty.ts"
import { recency_score } from "../src/math/recency.ts"
import { anchor_score } from "../src/math/scoring.ts"
import { cosine } from "../src/math/vec.ts"

const round = (n: number): number => Math.round(n * 1e6) / 1e6

test("math pipeline deterministic snapshot", () => {
  const input = [0.2, -0.4, 0.9]
  const R = make_projection_matrix(3, 2, 42)
  const projected = project(input, R)
  assert.equal(projected.length, 2)

  const centroids = {
    factual: [-0.8, -0.2],
    emotional: [-0.3, 0.95],
    temporal: [0.6, 0.8],
    relational: [0.2, -0.7],
    behavioral: [0.1, 0.3],
  }
  const routes_all = route_sectors(projected, centroids, 3)
  const prob_sum = routes_all.reduce((acc, r) => acc + r.prob, 0)
  assert.ok(Math.abs(prob_sum - 1) < 1e-12)
  assert.equal(routes_all[0].sector, "factual")
  const routes = routes_all.slice(0, 2)

  const mean1 = update_mean([0, 0], projected, 0.05)
  const var1 = update_variance([0, 0], mean1, projected, 0.05)
  const novelty = novelty_score(projected, mean1, var1)
  assert.ok(novelty >= 0)
  assert.ok(Number.isFinite(novelty))

  const recency = recency_score(10000, 9000, 0.1)
  const similarity = cosine(projected, centroids[routes[0].sector as keyof typeof centroids])
  const score = anchor_score({ similarity, weight: 0.8, recency })
  assert.ok(Number.isFinite(score))

  const snapshot = {
    projected: projected.map(round),
    routes: routes.map((r) => ({
      sector: r.sector,
      score: round(r.score),
      prob: round(r.prob),
    })),
    mean: mean1.map(round),
    variance: var1.map(round),
    novelty: round(novelty),
    recency: round(recency),
    similarity: round(similarity),
    score: round(score),
  }

  assert.deepEqual(snapshot, {
    projected: [-0.913862, -0.406026],
    routes: [
      { sector: "factual", score: 0.812294, prob: 0.462369 },
      { sector: "emotional", score: -0.111566, prob: 0.183354 },
    ],
    mean: [-0.045693, -0.020301],
    variance: [0.037686, 0.007439],
    novelty: 39.999968,
    recency: 0.904837,
    similarity: 0.985052,
    score: 1.371745,
  })
})
