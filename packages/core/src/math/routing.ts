import { assert_sector_id, type SectorId } from "../types/sector.ts"
import { dot } from "./vec.ts"

export type sector_route = {
    sector: SectorId
    score: number
    prob: number
}

export const route_sectors = (
    v: number[],
    centroids: Record<SectorId, number[]>,
    topN = 2,
): sector_route[] => {
    const entries = Object.entries(centroids)
    if (!entries.length) return []
    const scores: number[] = []
    const sectors: SectorId[] = []
    for (let i = 0; i < entries.length; i += 1) {
        const [sector, centroid] = entries[i]
        if (centroid.length !== v.length) throw new Error("size mismatch")
        sectors.push(assert_sector_id(sector))
        scores.push(dot(centroid, v))
    }
    let mx = scores[0]
    for (let i = 1; i < scores.length; i += 1) if (scores[i] > mx) mx = scores[i]
    const exps: number[] = []
    let sum = 0
    for (let i = 0; i < scores.length; i += 1) {
        const vexp = Math.exp(scores[i] - mx)
        exps.push(vexp)
        sum += vexp
    }
    const routes: sector_route[] = sectors.map((sector, i) => ({
        sector,
        score: scores[i],
        prob: sum === 0 ? 0 : exps[i] / sum,
    }))
    routes.sort((a, b) => b.prob - a.prob)
    return routes.slice(0, Math.max(0, topN))
}
