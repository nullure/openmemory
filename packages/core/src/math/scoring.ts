import { default_config } from "../config.ts"

export type anchor_score_input = {
    similarity: number
    weight: number
    recency: number
    betas?: {
        similarity: number
        weight: number
        recency: number
    }
}

export const anchor_score = (input: anchor_score_input): number => {
    const { similarity, weight, recency, betas } = input
    // Similarity is expected to be cosine on normalized embeddings.
    const b1 = betas?.similarity ?? default_config.scoring_betas.similarity
    const b2 = betas?.weight ?? default_config.scoring_betas.weight
    const b3 = betas?.recency ?? default_config.scoring_betas.recency
    const safe_weight = Math.max(0, weight)
    return b1 * similarity + b2 * Math.log(1 + safe_weight) + b3 * recency
}
