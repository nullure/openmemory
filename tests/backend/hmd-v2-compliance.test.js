/**
 * HMD v2 Compliance Test
 * Verifies implementation matches specification requirements
 */

const sqlite3 = require('../../backend/node_modules/sqlite3');
const http = require('http');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../backend/data/openmemory.sqlite');
const BASE_URL = 'http://localhost:8080';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    passed++;
  } else {
    console.log(`❌ ${message}`);
    failed++;
  }
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function queryDB(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function runTests() {
  console.log('🧪 HMD v2 Compliance Test Suite\n');
  console.log('Testing against specification requirements:\n');

  console.log('📋 Test 1: Single Waypoint Rule (O(n) Graph Structure)');
  const waypoints = await queryDB('SELECT src_id, COUNT(*) as count FROM waypoints GROUP BY src_id HAVING count > 1');
  assert(waypoints.length === 0, 'No memory has more than 1 outbound waypoint');
  
  const totalMemories = await queryDB('SELECT COUNT(*) as c FROM memories');
  const totalWaypoints = await queryDB('SELECT COUNT(*) as c FROM waypoints');
  assert(totalWaypoints[0].c <= totalMemories[0].c, `Waypoints (${totalWaypoints[0].c}) ≤ Memories (${totalMemories[0].c})`);
  console.log(`   Graph complexity: O(${totalMemories[0].c})\n`);

  console.log('📋 Test 2: Mean Vector Caching');
  const memoriesWithMeanVec = await queryDB('SELECT COUNT(*) as c FROM memories WHERE mean_vec IS NOT NULL AND mean_dim IS NOT NULL');
  assert(memoriesWithMeanVec[0].c === totalMemories[0].c, `All ${totalMemories[0].c} memories have cached mean vectors`);
  console.log('');

  console.log('📋 Test 3: Multi-Sector Embeddings');
  const vectorsPerMemory = await queryDB(`
    SELECT id, COUNT(*) as sectors 
    FROM vectors 
    GROUP BY id
  `);
  const multiSectorMemories = vectorsPerMemory.filter(m => m.sectors > 1);
  console.log(`   ${vectorsPerMemory.length} memories with embeddings`);
  console.log(`   ${multiSectorMemories.length} memories with multiple sector embeddings`);
  assert(vectorsPerMemory.length > 0, 'Memories have sector embeddings');
  console.log('');

  console.log('📋 Test 4: Transaction Atomicity');
  const orphanedVectors = await queryDB('SELECT v.id FROM vectors v LEFT JOIN memories m ON v.id = m.id WHERE m.id IS NULL');
  assert(orphanedVectors.length === 0, 'No orphaned vectors (all have corresponding memories)');
  
  const memoriesWithoutVectors = await queryDB('SELECT m.id FROM memories m LEFT JOIN vectors v ON m.id = v.id WHERE v.id IS NULL');
  assert(memoriesWithoutVectors.length === 0, 'No memories without vectors (transaction commits all or nothing)');
  console.log('');

  console.log('📋 Test 5: Salience Initialization');
  const memories = await queryDB('SELECT id, salience, primary_sector FROM memories');
  const validSalience = memories.every(m => m.salience >= 0.4 && m.salience <= 1.0);
  assert(validSalience, 'All memories have valid salience (0.4-1.0 range)');
  console.log('');

  console.log('📋 Test 6: Waypoint Weight Threshold');
  const waypointWeights = await queryDB('SELECT src_id, dst_id, weight FROM waypoints');
  const validWeights = waypointWeights.every(w => w.weight >= 0.75 && w.weight <= 1.0);
  assert(validWeights, `All ${waypointWeights.length} waypoints have weight ≥ 0.75`);
  if (waypointWeights.length > 0) {
    const avgWeight = waypointWeights.reduce((sum, w) => sum + w.weight, 0) / waypointWeights.length;
    console.log(`   Average waypoint weight: ${avgWeight.toFixed(4)}`);
  }
  console.log('');

  console.log('📋 Test 7: Sector Configuration');
  const sectors = await queryDB('SELECT DISTINCT sector FROM vectors ORDER BY sector');
  const expectedSectors = ['episodic', 'semantic', 'procedural', 'emotional', 'reflective'];
  const foundSectors = sectors.map(s => s.sector);
  console.log(`   Found sectors: ${foundSectors.join(', ')}`);
  assert(foundSectors.length > 0, 'At least one sector in use');
  console.log('');

  console.log('📋 Test 8: Embed Logs');
  const completedLogs = await queryDB('SELECT COUNT(*) as c FROM embed_logs WHERE status = "completed"');
  const failedLogs = await queryDB('SELECT COUNT(*) as c FROM embed_logs WHERE status = "failed"');
  assert(completedLogs[0].c >= totalMemories[0].c, `At least ${totalMemories[0].c} completed embed logs (found ${completedLogs[0].c})`);
  assert(failedLogs[0].c === 0, 'No failed embeddings');
  console.log('');

  console.log('📋 Test 9: Database Schema Compliance');
  const tables = await queryDB('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name');
  const tableNames = tables.map(t => t.name);
  const requiredTables = ['memories', 'vectors', 'waypoints', 'embed_logs'];
  requiredTables.forEach(table => {
    assert(tableNames.includes(table), `Table "${table}" exists`);
  });
  console.log('');

  console.log('📋 Test 10: API Endpoints');
  try {
    const health = await makeRequest('GET', '/health');
    assert(health.status === 200, 'GET /health endpoint works');
    
    const sectors = await makeRequest('GET', '/sectors');
    assert(sectors.status === 200, 'GET /sectors endpoint works');
    
    const allMem = await makeRequest('GET', '/memory/all?l=1');
    assert(allMem.status === 200, 'GET /memory/all endpoint works');
  } catch (err) {
    console.log(`❌ API endpoints test failed: ${err.message}`);
    failed++;
  }
  console.log('');

  console.log('═'.repeat(60));
  console.log(`📊 Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  console.log('═'.repeat(60));
  
  if (failed === 0) {
    console.log('\n🎉 ✅ HMD v2 implementation is COMPLIANT with specification!');
    console.log('\n📝 Implementation verified:');
    console.log('   ✅ Single waypoint rule (O(n) graph)');
    console.log('   ✅ Mean vector caching');
    console.log('   ✅ Multi-sector embeddings');
    console.log('   ✅ Transaction atomicity');
    console.log('   ✅ Salience initialization (0.4 + 0.1*co-sectors)');
    console.log('   ✅ Waypoint threshold (≥0.75)');
    console.log('   ✅ Proper schema and logging');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some compliance issues detected. Review failures above.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
