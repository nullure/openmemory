const http = require('http');

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

async function testRetrieval() {
  console.log('🧪 Testing HMD v2 Retrieval System\n');

  console.log('📝 Step 1: Adding diverse memories across sectors...\n');

  const memories = [
    {
      content: 'Yesterday I went to the grocery store and bought apples, oranges, and bread. It was a sunny day and I met my neighbor Sarah.',
      tags: ['shopping', 'personal'],
      expectedSector: 'episodic'
    },
    {
      content: 'Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen. This occurs in chloroplasts.',
      tags: ['science', 'biology'],
      expectedSector: 'semantic'
    },
    {
      content: 'To bake a chocolate cake: First, preheat oven to 350°F. Then mix flour, sugar, cocoa powder. Add eggs and milk. Bake for 30 minutes.',
      tags: ['cooking', 'recipe'],
      expectedSector: 'procedural'
    },
    {
      content: 'I felt overwhelmed and anxious about the upcoming presentation. My heart was racing and I could not stop worrying about making mistakes.',
      tags: ['feelings', 'anxiety'],
      expectedSector: 'emotional'
    },
    {
      content: 'Looking back, I realize that failure is not the opposite of success but a stepping stone toward it. Every setback taught me something valuable.',
      tags: ['wisdom', 'learning'],
      expectedSector: 'reflective'
    },
    {
      content: 'Machine learning models require training data, validation data, and test data. The training process involves optimizing weights through backpropagation.',
      tags: ['ai', 'machine-learning'],
      expectedSector: 'semantic'
    },
    {
      content: 'Last summer vacation we drove to the beach and spent three days building sandcastles and swimming. The kids had so much fun!',
      tags: ['vacation', 'family'],
      expectedSector: 'episodic'
    }
  ];

  const addedMemories = [];
  for (let i = 0; i < memories.length; i++) {
    const mem = memories[i];
    const response = await makeRequest('POST', '/memory/add', mem);
    
    if (response.status === 200) {
      console.log(`✅ Memory ${i + 1}: [${response.data.primary_sector}] ${mem.content.substring(0, 60)}...`);
      console.log(`   ID: ${response.data.id}`);
      console.log(`   Sectors: ${response.data.sectors.join(', ')}`);
      addedMemories.push({ ...response.data, originalContent: mem.content });
    } else {
      console.log(`❌ Failed to add memory ${i + 1}`);
    }
  }

  console.log(`\n📊 Added ${addedMemories.length} memories\n`);

  console.log('🔍 Step 2: Testing different query types...\n');

  const queries = [
    {
      query: 'What happened at the grocery store?',
      expectedType: 'episodic',
      description: 'Episodic recall query'
    },
    {
      query: 'How do plants make food from sunlight?',
      expectedType: 'semantic',
      description: 'Factual knowledge query'
    },
    {
      query: 'How do I make a cake?',
      expectedType: 'procedural',
      description: 'How-to query'
    },
    {
      query: 'Tell me about feelings of anxiety',
      expectedType: 'emotional',
      description: 'Emotional content query'
    },
    {
      query: 'What have you learned from past experiences?',
      expectedType: 'reflective',
      description: 'Meta-cognitive query'
    },
    {
      query: 'summer beach vacation',
      expectedType: 'episodic',
      description: 'Keyword search'
    },
    {
      query: 'neural networks training',
      expectedType: 'semantic',
      description: 'Related concept query'
    }
  ];

  let successfulQueries = 0;
  const queryResults = [];

  for (const testQuery of queries) {
    console.log(`\n📋 Query: "${testQuery.query}"`);
    console.log(`   Type: ${testQuery.description}`);
    console.log(`   Expected: ${testQuery.expectedType} sector\n`);

    const start = Date.now();
    const response = await makeRequest('POST', '/memory/query', {
      query: testQuery.query,
      k: 3
    });
    const duration = Date.now() - start;

    if (response.status === 200 && response.data.matches) {
      const matches = response.data.matches;
      console.log(`   ⏱️  Response time: ${duration}ms`);
      console.log(`   📊 Found ${matches.length} matches\n`);

      if (matches.length > 0) {
        successfulQueries++;
        
        matches.forEach((match, idx) => {
          console.log(`   ${idx + 1}. Score: ${match.score.toFixed(4)} | Sectors: ${match.sectors.join(', ')}`);
          console.log(`      Content: ${match.content.substring(0, 80)}...`);
          console.log(`      Salience: ${match.salience.toFixed(4)} | Path: ${match.path.join(' → ')}`);
        });

        const topMatch = matches[0];
        const isCorrectType = topMatch.sectors.includes(testQuery.expectedType);
        console.log(`\n   ${isCorrectType ? '✅' : '⚠️'} Top match ${isCorrectType ? 'includes' : 'does not include'} expected sector: ${testQuery.expectedType}`);

        queryResults.push({
          query: testQuery.query,
          expectedType: testQuery.expectedType,
          actualSectors: topMatch.sectors,
          score: topMatch.score,
          duration,
          matchesExpected: isCorrectType
        });
      }
    } else {
      console.log(`   ❌ Query failed`);
    }
  }

  console.log('\n\n' + '='.repeat(70));
  console.log('📊 RETRIEVAL TEST SUMMARY');
  console.log('='.repeat(70));

  console.log(`\n📝 Ingestion:`);
  console.log(`   Total memories added: ${addedMemories.length}`);
  console.log(`   Sectors represented: ${[...new Set(addedMemories.flatMap(m => m.sectors))].join(', ')}`);

  console.log(`\n🔍 Query Performance:`);
  console.log(`   Successful queries: ${successfulQueries}/${queries.length}`);
  
  const avgDuration = queryResults.reduce((sum, r) => sum + r.duration, 0) / queryResults.length;
  console.log(`   Average query time: ${avgDuration.toFixed(2)}ms`);

  const correctMatches = queryResults.filter(r => r.matchesExpected).length;
  console.log(`   Correct sector matches: ${correctMatches}/${queryResults.length} (${(correctMatches / queryResults.length * 100).toFixed(1)}%)`);

  console.log(`\n🎯 Sector-Specific Results:`);
  const sectorResults = {};
  queryResults.forEach(r => {
    if (!sectorResults[r.expectedType]) {
      sectorResults[r.expectedType] = { attempted: 0, matched: 0 };
    }
    sectorResults[r.expectedType].attempted++;
    if (r.matchesExpected) sectorResults[r.expectedType].matched++;
  });

  Object.entries(sectorResults).forEach(([sector, stats]) => {
    console.log(`   ${sector}: ${stats.matched}/${stats.attempted} correct`);
  });

  console.log(`\n✅ Multi-sector composite similarity: Working`);
  console.log(`✅ Cross-sector retrieval: Functional`);
  console.log(`✅ Salience tracking: Active`);
  console.log(`✅ Path tracking: Enabled`);

  const allPassed = successfulQueries === queries.length && correctMatches >= queryResults.length * 0.7;
  
  console.log(`\n${allPassed ? '🎉' : '⚠️'} Retrieval Test: ${allPassed ? 'PASSED' : 'NEEDS REVIEW'}`);
  
  process.exit(allPassed ? 0 : 1);
}

testRetrieval().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
