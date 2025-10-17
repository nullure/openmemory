import 'dotenv/config'
export const env = {
    port: parseInt(process.env.OM_PORT || '8080'),
    db_path: process.env.OM_DB_PATH || './data/openmemory.sqlite',
    api_key: process.env.OM_API_KEY || '',
    emb_kind: process.env.OM_EMBEDDINGS || 'openai',
    openai_key: process.env.OPENAI_API_KEY || process.env.OM_OPENAI_API_KEY || '',
    vec_dim: parseInt(process.env.OM_VEC_DIM || '768'),
    min_score: parseFloat(process.env.OM_MIN_SCORE || '0.3'),
    decay_lambda: parseFloat(process.env.OM_DECAY_LAMBDA || '0.02')
}