export type add_req = { content: string, tags?: string[], metadata?: Record<string, unknown>, salience?: number, decay_lambda?: number }
export type q_req = { query: string, k?: number, filters?: { tags?: string[], min_score?: number, sector?: string } }
export type SectorType = 'episodic' | 'semantic' | 'procedural' | 'emotional' | 'reflective'

export type ingest_req = {
    source: 'file' | 'link' | 'connector'
    content_type: 'pdf' | 'docx' | 'html' | 'md' | 'txt' | 'audio'
    data: string
    metadata?: Record<string, unknown>
    config?: {
        forceRootChild?: boolean
        sectionSize?: number
        largeDocThreshold?: number
    }
}

export type ingest_url_req = {
    url: string
    metadata?: Record<string, unknown>
    config?: {
        forceRootChild?: boolean
        sectionSize?: number
        largeDocThreshold?: number
    }
}
