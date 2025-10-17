const server = require('./server.js')
import { env } from '../config'
import { db, q } from '../database'
import { now, rid, j, p } from '../utils'
import {
    addHSGMemory,
    hsgQuery,
    reinforceMemory,
    runDecayProcess,
    pruneWeakWaypoints,
    SECTORS,
    SECTOR_CONFIGS
} from '../hsg'
import type { add_req, q_req } from '../types'

const app = server()

app.use((req: any, res: any, next: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }
    next()
})

app.use((req: any, res: any, next: any) => {
    if (!env.api_key) return next()
    const h = req.headers['authorization'] || ''
    if (!h.startsWith('Bearer ') || h.slice(7) !== env.api_key) {
        return res.status(401).json({ err: 'auth' })
    }
    next()
})
app.get('/health', async (req: any, res: any) => {
    res.json({ ok: true, version: '2.0-hsg' })
})

app.get('/sectors', async (req: any, res: any) => {
    try {
        const { allAsync } = await import('../database')
        const stats = await allAsync(`
            select primary_sector as sector, count(*) as count, avg(salience) as avg_salience 
            from memories 
            group by primary_sector
        `)
        res.json({
            sectors: Object.keys(SECTOR_CONFIGS),
            configs: SECTOR_CONFIGS,
            stats
        })
    } catch (error) {
        res.status(500).json({ err: 'internal' })
    }
})
app.post('/memory/add', async (req: any, res: any) => {
    const b = req.body as add_req
    if (!b?.content) return res.status(400).json({ err: 'content' })
    try {
        const result = await addHSGMemory(b.content, j(b.tags || []), b.metadata)
        res.json(result)
    } catch (error) {
        console.error('Error adding HSG memory:', error)
        res.status(500).json({ err: 'internal' })
    }
})
app.post('/memory/query', async (req: any, res: any) => {
    const b = req.body as q_req
    const k = b.k || 8
    try {
        const filters = {
            sectors: b.filters?.sector ? [b.filters.sector] : undefined,
            minSalience: b.filters?.min_score
        }
        const matches = await hsgQuery(b.query, k, filters)
        res.json({
            query: b.query,
            matches: matches.map(m => ({
                id: m.id,
                content: m.content,
                score: m.score,
                sectors: m.sectors,
                primary_sector: m.primary_sector,
                path: m.path,
                salience: m.salience,
                last_seen_at: m.last_seen_at
            }))
        })
    } catch (error) {
        console.error('Error in HSG query:', error)
        res.json({ query: b.query, matches: [] })
    }
})
app.post('/memory/reinforce', async (req: any, res: any) => {
    const b = req.body as { id: string, boost?: number }
    if (!b?.id) return res.status(400).json({ err: 'id' })
    try {
        await reinforceMemory(b.id, b.boost)
        res.json({ ok: true })
    } catch (error) {
        res.status(404).json({ err: 'nf' })
    }
})
app.get('/memory/all', async (req: any, res: any) => {
    try {
        const u = (req.query as any).u ? parseInt((req.query as any).u) : 0
        const l = (req.query as any).l ? parseInt((req.query as any).l) : 100
        const sector = (req.query as any).sector
        const rawRows = sector
            ? await q.all_mem_by_sector.all(sector, l, u)
            : await q.all_mem.all(l, u)
        const rows = rawRows.map((r: any) => ({
            id: r.id,
            content: r.content,
            tags: p(r.tags),
            metadata: p(r.meta),
            created_at: r.created_at,
            updated_at: r.updated_at,
            last_seen_at: r.last_seen_at,
            salience: r.salience,
            decay_lambda: r.decay_lambda,
            primary_sector: r.primary_sector,
            version: r.version
        }))
        res.json({ items: rows })
    } catch (error) {
        res.status(500).json({ err: 'internal' })
    }
})
app.delete('/memory/:id', async (req: any, res: any) => {
    try {
        const id = (req.params as any).id
        const r = await q.get_mem.get(id)
        if (!r) return res.status(404).json({ err: 'nf' })
        await q.del_mem.run(id)
        await q.del_vec.run(id)
        await q.del_waypoints.run(id, id)
        res.json({ ok: true })
    } catch (error) {
        res.status(500).json({ err: 'internal' })
    }
})
const DECAY_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours
const PRUNE_INTERVAL = 7 * 24 * 60 * 60 * 1000 // 7 days
setInterval(async () => {
    console.log('ðŸ§  Running HSG decay process...')
    try {
        const result = await runDecayProcess()
        console.log(`âœ… Decay completed: ${result.decayed}/${result.processed} memories updated`)
    } catch (error) {
        console.error('âŒ Decay process failed:', error)
    }
}, DECAY_INTERVAL)
setInterval(async () => {
    console.log('ðŸ”— Pruning weak waypoints...')
    try {
        const pruned = await pruneWeakWaypoints()
        console.log(`âœ… Pruned ${pruned} weak waypoints`)
    } catch (error) {
        console.error('âŒ Waypoint pruning failed:', error)
    }
}, PRUNE_INTERVAL)
runDecayProcess().then(result => {
    console.log(`ðŸš€ Initial decay: ${result.decayed}/${result.processed} memories updated`)
}).catch(console.error)
console.log(`🧠 OpenMemory server starting on port ${env.port}`)
app.listen(env.port, () => {
    console.log(`✅ Server running on http://localhost:${env.port}`)
})