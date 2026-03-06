import type { Anchor } from "../types/anchor.js"
import type { Belief } from "../types/belief.js"
import type { SectorId, SectorState } from "../types/sector.js"
import type { Store } from "./types.js"

const mk_key = (user_id: string, sector: SectorId): string => `${user_id}::${sector}`

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export class MemoryStore implements Store {
    private anchors = new Map<string, Map<string, Anchor>>()
    private beliefs = new Map<string, Map<string, Belief>>()
    private sector_states = new Map<string, SectorState>()

    async getAnchors(user_id: string, sector: SectorId): Promise<Anchor[]> {
        return this.listAnchors(user_id, sector)
    }

    async putAnchor(anchor: Anchor): Promise<void> {
        const key = mk_key(anchor.user_id, anchor.sector)
        const bucket = this.anchors.get(key) ?? new Map<string, Anchor>()
        bucket.set(anchor.id, clone(anchor))
        this.anchors.set(key, bucket)
    }

    async deleteAnchor(id: string): Promise<void> {
        for (const [key, bucket] of this.anchors.entries()) {
            if (bucket.delete(id) && bucket.size === 0) this.anchors.delete(key)
        }
    }

    async listAnchors(user_id: string, sector: SectorId): Promise<Anchor[]> {
        const key = mk_key(user_id, sector)
        const bucket = this.anchors.get(key)
        if (!bucket) return []
        return Array.from(bucket.values())
            .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
            .map((a) => clone(a))
    }

    async getBeliefs(user_id: string): Promise<Belief[]> {
        const bucket = this.beliefs.get(user_id)
        if (!bucket) return []
        return Array.from(bucket.values())
            .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
            .map((b) => clone(b))
    }

    async putBelief(belief: Belief): Promise<void> {
        const bucket = this.beliefs.get(belief.user_id) ?? new Map<string, Belief>()
        bucket.set(belief.id, clone(belief))
        this.beliefs.set(belief.user_id, bucket)
    }

    async updateBelief(belief: Belief): Promise<void> {
        await this.putBelief(belief)
    }

    async getSectorState(user_id: string, sector: SectorId): Promise<SectorState | null> {
        const key = mk_key(user_id, sector)
        const state = this.sector_states.get(key)
        return state ? clone(state) : null
    }

    async putSectorState(state: SectorState): Promise<void> {
        const key = mk_key(state.user_id, state.sector)
        this.sector_states.set(key, clone(state))
    }
}
