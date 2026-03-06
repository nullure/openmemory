import { normalize } from "./vec.ts"

const mk_rng = (seed: number): (() => number) => {
    let x = seed >>> 0
    if (x === 0) x = 1
    return () => {
        x ^= x << 13
        x ^= x >>> 17
        x ^= x << 5
        return (x >>> 0) / 4294967296
    }
}

export const make_projection_matrix = (d: number, k: number, seed: number): number[][] => {
    if (d <= 0 || k <= 0) throw new Error("bad dimensions")
    const rng = mk_rng(seed)
    const scale = 1 / Math.sqrt(k)
    const mat: number[][] = []
    for (let i = 0; i < k; i += 1) {
        const row: number[] = []
        for (let j = 0; j < d; j += 1) row.push((rng() * 2 - 1) * scale)
        mat.push(row)
    }
    return mat
}

export const project = (x: number[], R: number[][]): number[] => {
    if (!R.length || !R[0]?.length) throw new Error("bad dimensions")
    const d = R[0].length
    if (x.length !== d) throw new Error("size mismatch")
    const k = R.length
    const y: number[] = []
    for (let i = 0; i < k; i += 1) {
        const row = R[i]
        if (row.length !== d) throw new Error("bad dimensions")
        let s = 0
        for (let j = 0; j < d; j += 1) s += row[j] * x[j]
        y.push(s)
    }
    return normalize(y)
}
