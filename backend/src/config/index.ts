import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

export const env = {
    port: Number(process.env.OM_PORT) || 8080,
    db_path: process.env.OM_DB_PATH || './data/openmemory.sqlite',
    api_key: /*process.env.OM_API_KEY ||*/ '',
    emb_kind: process.env.OM_EMBEDDINGS || 'synthetic',
    openai_key: process.env.OPENAI_API_KEY || process.env.OM_OPENAI_API_KEY || '',
    gemini_key: process.env.GEMINI_API_KEY || process.env.OM_GEMINI_API_KEY || '',
    ollama_url: process.env.OLLAMA_URL || process.env.OM_OLLAMA_URL || 'http://localhost:11434',
    local_model_path: process.env.LOCAL_MODEL_PATH || process.env.OM_LOCAL_MODEL_PATH || '',
    vec_dim: Number(process.env.OM_VEC_DIM) || 768,
    min_score: Number(process.env.OM_MIN_SCORE) || 0.3,
    decay_lambda: Number(process.env.OM_DECAY_LAMBDA) || 0.02
}