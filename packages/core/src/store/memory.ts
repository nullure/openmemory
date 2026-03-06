import type { Anchor } from "../types/anchor.js"
import type { Belief } from "../types/belief.js"
import type { MemoryNode } from "../types/memory_node.ts"
import type { SectorId, SectorState } from "../types/sector.js"
import type { WaypointEdge } from "../types/waypoint.ts"
import { assert_waypoint_relation } from "../types/waypoint.ts"
import type { Store } from "./types.js"

const mk_key = (user_id: string, sector: SectorId): string => `${user_id}::${sector}`

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export class MemoryStore implements Store {
    private anchors = new Map<string, Map<string, Anchor>>()
    private beliefs = new Map<string, Map<string, Belief>>()
    private sector_states = new Map<string, SectorState>()
    private memory_nodes = new Map<string, MemoryNode>()
    private waypoint_edges = new Map<string, Map<string, WaypointEdge>>()

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

    async putMemoryNode(node: MemoryNode): Promise<void> {
        this.memory_nodes.set(node.id, clone(node))
    }

    async getMemoryNode(id: string): Promise<MemoryNode | null> {
        const node = this.memory_nodes.get(id)
        return node ? clone(node) : null
    }

    async listMemoryNodes(user_id: string): Promise<MemoryNode[]> {
        return Array.from(this.memory_nodes.values())
            .filter((node) => node.user_id === user_id)
            .sort((a, b) => a.timestamp_ms - b.timestamp_ms)
            .map((node) => clone(node))
    }

    async putWaypointEdge(edge: WaypointEdge): Promise<void> {
        assert_waypoint_relation(edge.relation)
        const bucket = this.waypoint_edges.get(edge.user_id) ?? new Map<string, WaypointEdge>()
        bucket.set(edge.id, clone(edge))
        this.waypoint_edges.set(edge.user_id, bucket)
    }

    async listWaypointEdgesFrom(user_id: string, from_memory_node_id: string): Promise<WaypointEdge[]> {
        const bucket = this.waypoint_edges.get(user_id)
        if (!bucket) return []
        return Array.from(bucket.values())
            .filter((edge) => edge.from_memory_node_id === from_memory_node_id)
            .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
            .map((edge) => clone(edge))
    }

    async listWaypointEdgesForUser(user_id: string): Promise<WaypointEdge[]> {
        const bucket = this.waypoint_edges.get(user_id)
        if (!bucket) return []
        return Array.from(bucket.values())
            .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
            .map((edge) => clone(edge))
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
