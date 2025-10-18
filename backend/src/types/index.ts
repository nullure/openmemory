export type add_req = { content: string, tags?: string[], metadata?: Record<string, unknown>, salience?: number, decay_lambda?: number }
export type q_req = { query: string, k?: number, filters?: { tags?: string[], min_score?: number, sector?: string } }
export type SectorType = 'episodic' | 'semantic' | 'procedural' | 'emotional' | 'reflective'
