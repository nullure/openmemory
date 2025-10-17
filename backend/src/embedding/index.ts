import { env } from '../config'
import { SECTOR_CONFIGS } from '../hsg'
import { q } from '../database'
export const emb_dim = () => env.vec_dim
export interface EmbeddingResult {
    sector: string
    vector: number[]
    dim: number
}
export async function embedForSector(text: string, sector: string): Promise<number[]> {
    const config = SECTOR_CONFIGS[sector]
    if (!config) throw new Error(`Unknown sector: ${sector}`)
    const d = env.vec_dim
    const v = new Array(d)
    if (env.emb_kind === 'openai' && env.openai_key) {
        const model = sector === 'semantic' ? 'text-embedding-3-small' : 'text-embedding-3-small'
        const r = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${env.openai_key}`
            },
            body: JSON.stringify({ input: text, model })
        })
        const j = await r.json() as any
        return j.data[0].embedding as number[]
    }
    const sectorSeed = {
        episodic: 0.13,
        semantic: 0.17,
        procedural: 0.19,
        emotional: 0.23,
        reflective: 0.29
    }[sector] || 0.17
    for (let i = 0; i < d; i++) {
        v[i] = Math.sin(i * 0.7 + text.length * sectorSeed + sector.length * 0.11) % 1
    }
    return v as number[]
}
export async function embedMultiSector(
    id: string,
    text: string,
    sectors: string[]
): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = []
    await q.ins_log.run(id, 'multi-sector', 'pending', Date.now(), null)
    try {
        for (const sector of sectors) {
            const vector = await embedForSector(text, sector)
            results.push({
                sector,
                vector,
                dim: vector.length
            })
        }
        await q.upd_log.run('completed', null, id)
        return results
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        await q.upd_log.run('failed', errorMessage, id)
        throw error
    }
}
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    let dotProduct = 0
    let normA = 0
    let normB = 0
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }
    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
export function vectorToBuffer(vector: number[]): Buffer {
    const buffer = Buffer.allocUnsafe(vector.length * 4) // 4 bytes per float32
    for (let i = 0; i < vector.length; i++) {
        buffer.writeFloatLE(vector[i], i * 4)
    }
    return buffer
}
export function bufferToVector(buffer: Buffer): number[] {
    const vector: number[] = []
    for (let i = 0; i < buffer.length; i += 4) {
        vector.push(buffer.readFloatLE(i))
    }
    return vector
}
export const embed = async (t: string) => embedForSector(t, 'semantic')