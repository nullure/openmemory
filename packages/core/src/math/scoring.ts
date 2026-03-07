import { default_config } from "../config.ts"

export type anchor_score_input = {
    similarity: number
    salience?: number
    recency?: number
    weight?: number
    waypoint_bonus?: number
    betas?: Partial<typeof default_config.scoring_betas>
}

export const anchor_score = (input: anchor_score_input): number => {
    const { similarity, salience = 0, recency = 0, weight = 0, waypoint_bonus = 0, betas } = input
    // Similarity is expected to be cosine on normalized embeddings.
    const b1 = betas?.similarity ?? default_config.scoring_betas.similarity
    const b2 = betas?.salience ?? default_config.scoring_betas.salience
    const b3 = betas?.recency ?? default_config.scoring_betas.recency
    const b4 = betas?.weight ?? default_config.scoring_betas.weight
    const b5 = betas?.waypoint_bonus ?? default_config.scoring_betas.waypoint_bonus
    const safe_salience = Math.max(0, salience)
    const safe_weight = Math.max(0, weight)
    const safe_waypoint_bonus = Math.max(0, waypoint_bonus)
    return (
        b1 * similarity +
        b2 * Math.log(1 + safe_salience) +
        b3 * recency +
        b4 * Math.log(1 + safe_weight) +
        b5 * safe_waypoint_bonus
    )
}
