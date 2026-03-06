import { default_config } from "../config.ts"

const eps = default_config.epsilons.vector_norm

export const dot = (a: number[], b: number[]): number => {
    if (a.length !== b.length) throw new Error("size mismatch")
    let s = 0
    for (let i = 0; i < a.length; i += 1) s += a[i] * b[i]
    return s
}

export const norm = (a: number[]): number => Math.sqrt(dot(a, a))

export const normalize = (a: number[]): number[] => {
    const n = Math.max(norm(a), eps)
    return a.map((v) => v / n)
}

// Assumes both vectors are already normalized; use cosine() otherwise.
export const similarity_normalized = (a: number[], b: number[]): number => dot(a, b)

export const cosine = (a: number[], b: number[]): number => {
    const na = Math.max(norm(a), eps)
    const nb = Math.max(norm(b), eps)
    return dot(a, b) / (na * nb)
}
