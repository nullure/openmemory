const BASE = 'http://localhost:8080'
const path = require('path');

async function testWaypointCreation() {
    console.log('🔗 Testing Waypoint Creation\n')
    
    // Test 1: Simple memory with waypoint
    console.log('Test 1: Adding first memory...')
    const mem1 = await fetch(`${BASE}/memory/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: 'The first memory about neural networks and deep learning architectures.'
        })
    }).then(r => r.json())
    console.log(`  Memory 1 ID: ${mem1.id}`)
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 500))
    
    // Test 2: Similar memory should create waypoint
    console.log('\nTest 2: Adding similar memory...')
    const mem2 = await fetch(`${BASE}/memory/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: 'Another memory about neural networks, transformers, and machine learning models.'
        })
    }).then(r => r.json())
    console.log(`  Memory 2 ID: ${mem2.id}`)
    
    // Wait for processing
    await new Promise(r => setTimeout(r, 1000))
    
    // Check waypoints
    console.log('\n📊 Checking database...')
const sqlite3 = require('../../backend/node_modules/sqlite3');
const db = new sqlite3.Database(path.join(__dirname, '../../backend/data/openmemory.sqlite'));
    
    const waypoints = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM waypoints', (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
    
    console.log(`\n🔗 Waypoints found: ${waypoints.length}`)
    waypoints.forEach((w, i) => {
        console.log(`  ${i + 1}. ${w.src_id.slice(0, 8)} → ${w.dst_id.slice(0, 8)} (weight: ${w.weight})`)
    })
    
    // Test 3: Large document ingestion
    console.log('\n\nTest 3: Large document with root-child strategy...')
    const largeText = 'Deep learning is transforming AI. '.repeat(300)
    
    const ingestResult = await fetch(`${BASE}/memory/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            source: 'file',
            content_type: 'txt',
            data: largeText,
            metadata: { test: 'waypoint_test' }
        })
    }).then(r => r.json())
    
    console.log(`  Strategy: ${ingestResult.strategy}`)
    console.log(`  Root ID: ${ingestResult.root_memory_id}`)
    console.log(`  Children: ${ingestResult.child_count}`)
    
    await new Promise(r => setTimeout(r, 2000))
    
    const waypointsAfter = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM waypoints ORDER BY created_at DESC', (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })
    
    console.log(`\n🔗 Total waypoints after ingestion: ${waypointsAfter.length}`)
    console.log('\nLatest waypoints:')
    waypointsAfter.slice(0, 5).forEach((w, i) => {
        console.log(`  ${i + 1}. ${w.src_id.slice(0, 8)} → ${w.dst_id.slice(0, 8)} (weight: ${w.weight}, created: ${new Date(w.created_at).toISOString()})`)
    })
    
    // Find root-child waypoints
    if (ingestResult.strategy === 'root-child') {
        const rootWaypoints = waypointsAfter.filter(w => w.src_id === ingestResult.root_memory_id)
        console.log(`\n📌 Root waypoints (${ingestResult.root_memory_id.slice(0, 8)}): ${rootWaypoints.length}`)
        rootWaypoints.forEach((w, i) => {
            console.log(`  ${i + 1}. → ${w.dst_id.slice(0, 8)} (weight: ${w.weight})`)
        })
        
        if (rootWaypoints.length !== ingestResult.child_count) {
            console.log(`\n❌ ERROR: Expected ${ingestResult.child_count} waypoints, found ${rootWaypoints.length}`)
        } else {
            console.log(`\n✅ All ${ingestResult.child_count} root→child waypoints created!`)
        }
    }
    
    db.close()
}

testWaypointCreation().catch(console.error)
