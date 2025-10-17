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

    switch (env.emb_kind) {
        case 'openai':
            return await embedWithOpenAI(text, sector)
        case 'gemini':
            return await embedWithGemini(text, sector)
        case 'ollama':
            return await embedWithOllama(text, sector)
        case 'local':
            return await embedWithLocal(text, sector)
        case 'synthetic':
        default:
            return generateSyntheticEmbedding(text, sector)
    }
}

async function embedWithOpenAI(text: string, sector: string): Promise<number[]> {
    if (!env.openai_key) throw new Error('OpenAI API key not configured')

    const modelMap: Record<string, string> = {
        episodic: 'text-embedding-3-small',
        semantic: 'text-embedding-3-small',
        procedural: 'text-embedding-3-small',
        emotional: 'text-embedding-3-small',
        reflective: 'text-embedding-3-large'
    }

    const model = modelMap[sector] || 'text-embedding-3-small'

    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${env.openai_key}`
        },
        body: JSON.stringify({
            input: text,
            model,
            dimensions: env.vec_dim <= 1536 ? env.vec_dim : undefined
        })
    })

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as any
    return data.data[0].embedding as number[]
}

async function embedWithGemini(text: string, sector: string): Promise<number[]> {
    if (!env.gemini_key) throw new Error('Gemini API key not configured')

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${env.gemini_key}`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            content: {
                parts: [{ text }]
            },
            taskType: getSectorTaskType(sector)
        })
    })

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as any
    const embedding = data.embedding.values as number[]

    return resizeVector(embedding, env.vec_dim)
}

async function embedWithOllama(text: string, sector: string): Promise<number[]> {
    const modelMap: Record<string, string> = {
        episodic: 'nomic-embed-text',
        semantic: 'nomic-embed-text',
        procedural: 'bge-small',
        emotional: 'nomic-embed-text',
        reflective: 'bge-large'
    }

    const model = modelMap[sector] || 'nomic-embed-text'

    const response = await fetch(`${env.ollama_url}/api/embeddings`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model,
            prompt: text
        })
    })

    if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as any
    const embedding = data.embedding as number[]

    return resizeVector(embedding, env.vec_dim)
}

async function embedWithLocal(text: string, sector: string): Promise<number[]> {
    if (!env.local_model_path) {
        console.warn('Local model path not configured, falling back to synthetic')
        return generateSyntheticEmbedding(text, sector)
    }

    try {
        const { createHash } = await import('crypto')
        const hash = createHash('sha256').update(text + sector).digest()
        const embedding: number[] = []

        for (let i = 0; i < env.vec_dim; i++) {
            const byte1 = hash[i % hash.length]
            const byte2 = hash[(i + 1) % hash.length]
            const value = (byte1 * 256 + byte2) / 65535 * 2 - 1
            embedding.push(value)
        }

        const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
        return embedding.map(val => val / norm)

    } catch (error) {
        console.warn('Local embedding failed, falling back to synthetic:', error)
        return generateSyntheticEmbedding(text, sector)
    }
}

function generateSyntheticEmbedding(text: string, sector: string): number[] {
    const d = env.vec_dim
    const v = new Array(d)

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

function getSectorTaskType(sector: string): string {
    const taskTypes: Record<string, string> = {
        episodic: 'RETRIEVAL_DOCUMENT',
        semantic: 'SEMANTIC_SIMILARITY',
        procedural: 'RETRIEVAL_DOCUMENT',
        emotional: 'CLASSIFICATION',
        reflective: 'SEMANTIC_SIMILARITY'
    }
    return taskTypes[sector] || 'SEMANTIC_SIMILARITY'
}

function resizeVector(vector: number[], targetDim: number): number[] {
    if (vector.length === targetDim) return vector

    if (vector.length > targetDim) {
        return vector.slice(0, targetDim)
    }

    const result = [...vector]
    while (result.length < targetDim) {
        result.push(0)
    }
    return result
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

export function getEmbeddingProvider(): string {
    return env.emb_kind
}

export function getEmbeddingInfo(): Record<string, any> {
    const info: Record<string, any> = {
        provider: env.emb_kind,
        dimensions: env.vec_dim
    }

    switch (env.emb_kind) {
        case 'openai':
            info.configured = !!env.openai_key
            info.models = {
                episodic: 'text-embedding-3-small',
                semantic: 'text-embedding-3-small',
                procedural: 'text-embedding-3-small',
                emotional: 'text-embedding-3-small',
                reflective: 'text-embedding-3-large'
            }
            break
        case 'gemini':
            info.configured = !!env.gemini_key
            info.model = 'embedding-001'
            break
        case 'ollama':
            info.configured = true
            info.url = env.ollama_url
            info.models = {
                episodic: 'nomic-embed-text',
                semantic: 'nomic-embed-text',
                procedural: 'bge-small',
                emotional: 'nomic-embed-text',
                reflective: 'bge-large'
            }
            break
        case 'local':
            info.configured = !!env.local_model_path
            info.path = env.local_model_path
            break
        default:
            info.configured = true
            info.type = 'synthetic'
    }

    return info
}