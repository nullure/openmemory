export const ALL_SECTORS = ["factual", "emotional", "temporal", "relational", "behavioral"] as const

export type SectorId = (typeof ALL_SECTORS)[number]

export const is_sector_id = (value: string): value is SectorId =>
    (ALL_SECTORS as readonly string[]).includes(value)

export const assert_sector_id = (value: string): SectorId => {
    if (!is_sector_id(value)) throw new Error("invalid sector id")
    return value
}

export type SectorState = {
    id: SectorId
    user_id: string
    sector: SectorId
    centroid: number[]
    mean: number[]
    variance: number[]
    timestamps: {
        created_at: string
        updated_at: string
    }
    valid_from: string
    valid_to: string | null
}
