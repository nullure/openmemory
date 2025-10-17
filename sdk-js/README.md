# 🧠 OpenMemory JavaScript SDK

**Brain-inspired memory system client for JavaScript/TypeScript applications.**

[![npm version](https://badge.fury.io/js/@openmemory%2Fsdk-js.svg)](https://www.npmjs.com/package/@openmemory/sdk-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **🧠 Brain-Inspired Architecture**: Automatic classification into 5 memory sectors
- **⚡ Fast Vector Search**: Semantic similarity search across memories
- **📉 Memory Decay**: Biologically-inspired exponential decay system
- **🔒 Type Safe**: Full TypeScript support with comprehensive types
- **🚀 Modern**: Uses fetch API, supports both Node.js and browsers
- **📱 Universal**: Works in Node.js, browsers, React Native, and Edge Functions

## 🏗️ Memory Sectors

| Sector | Function | Examples | Decay Rate |
|---------|-----------|----------|------------|
| **Episodic** | Events & experiences | "I went to Paris yesterday" | 0.015 |
| **Semantic** | Facts & knowledge | "Python is a programming language" | 0.005 |
| **Procedural** | Habits & routines | "My morning routine: coffee first" | 0.008 |
| **Emotional** | Feelings & moods | "I felt excited about the project" | 0.020 |
| **Reflective** | Meta-thoughts | "I think better in the morning" | 0.001 |

## 📦 Installation

```bash
# npm
npm install @openmemory/sdk-js

# yarn
yarn add @openmemory/sdk-js

# pnpm
pnpm add @openmemory/sdk-js
```

## 🚀 Quick Start

```typescript
import { OpenMemory } from '@openmemory/sdk-js'

// Initialize client
const memory = new OpenMemory({
  baseUrl: 'http://localhost:8080',
  apiKey: 'your-api-key' // optional
})

// Add memories (auto-classified into brain sectors)
const result = await memory.add("I felt really excited about the AI conference yesterday")
console.log(`Stored in ${result.sector} sector`) // -> "emotional" or "episodic"

// Query memories with semantic search
const memories = await memory.query("conference excitement", { k: 5 })
console.log(`Found ${memories.matches.length} relevant memories`)

// Query specific brain sectors
const emotions = await memory.querySector("happy feelings", "emotional")
const habits = await memory.querySector("morning routine", "procedural")
```

## 📖 API Reference

### Constructor

```typescript
const client = new OpenMemory({
  baseUrl?: string,    // Default: 'http://localhost:8080'
  apiKey?: string,     // Optional API key
  timeout?: number     // Request timeout in ms, default: 60000
})
```

### Core Methods

#### `add(content, options?)`
Add a new memory (automatically classified into brain sectors)

```typescript
// Simple add
const result = await client.add("I learned about vector databases today")

// With metadata and options
const result = await client.add("Python is great for data science", {
  tags: ["programming", "data-science"],
  metadata: { source: "learning", difficulty: "beginner" },
  salience: 0.8,        // Importance (0-1)
  decay_lambda: 0.01    // Custom decay override
})

// Returns: { id: string, sector: SectorType }
```

#### `query(query, options?)`
Search memories using vector similarity

```typescript
// Basic query
const results = await client.query("machine learning concepts")

// Advanced query with filters
const results = await client.query("happy memories", {
  k: 10,                    // Max results
  filters: {
    sector: "emotional",    // Search specific sector
    min_score: 0.7,        // Minimum similarity score
    tags: ["personal"]      // Filter by tags
  }
})

// Returns: { query: string, matches: QueryMatch[] }
```

#### `querySector(query, sector, k?)`
Query a specific brain sector

```typescript
// Search emotional memories
const emotions = await client.querySector("stress and anxiety", "emotional")

// Search habits and routines
const routines = await client.querySector("morning habits", "procedural", 5)
```

#### `reinforce(id, boost?)`
Boost memory salience (importance)

```typescript
// Standard reinforcement
await client.reinforce(memoryId)

// Strong reinforcement  
await client.reinforce(memoryId, 0.5)
```

#### `getAll(options?)`
Get memories with pagination

```typescript
// Get first 50 memories
const result = await client.getAll()

// Pagination and filtering
const result = await client.getAll({
  limit: 20,
  offset: 40,
  sector: "semantic"  // Optional sector filter
})
```

#### `getBySector(sector, limit?, offset?)`
Get memories from specific sector

```typescript
// Get all emotional memories
const emotions = await client.getBySector("emotional")

// With pagination
const facts = await client.getBySector("semantic", 50, 100)
```

#### `delete(id)`
Delete a memory

```typescript
await client.delete(memoryId)
```

#### `getSectors()` / `getStats()`
Get sector information and statistics

```typescript
const { sectors, stats } = await client.getStats()

stats.forEach(stat => {
  console.log(`${stat.sector}: ${stat.count} memories`)
  console.log(`Average salience: ${stat.avg_salience}`)
})
```

## 🧠 Brain Sector Examples

### Automatic Classification

The SDK automatically routes content to appropriate brain sectors:

```typescript
// Temporal/event patterns → episodic
await client.add("I met Sarah at the coffee shop last Tuesday")

// Emotional patterns → emotional
await client.add("I feel excited about the new project")

// Procedural patterns → procedural  
await client.add("My workflow: review PRs, then write code")

// Facts/knowledge → semantic (default)
await client.add("TypeScript is a superset of JavaScript")

// Meta/reflective → reflective
await client.add("I notice I'm most productive in the morning")
```

### Manual Sector Assignment

```typescript
// Force specific sector via metadata
await client.add("Important deadline coming up", {
  metadata: { sector: "emotional" }  // Override classification
})
```

## 🌍 Usage Examples

### Node.js Server
```typescript
import { OpenMemory } from '@openmemory/sdk-js'

const memory = new OpenMemory({
  baseUrl: process.env.OPENMEMORY_URL,
  apiKey: process.env.OPENMEMORY_API_KEY
})

// Use in API routes, background jobs, etc.
```

### React Application
```typescript
import { OpenMemory } from '@openmemory/sdk-js'

function useMemory() {
  const [client] = useState(() => new OpenMemory({
    baseUrl: 'https://your-memory-api.com'
  }))
  
  const addMemory = async (content: string) => {
    return await client.add(content)
  }
  
  return { addMemory, query: client.query.bind(client) }
}
```

### Edge Functions (Vercel, Cloudflare Workers)
```typescript
import { OpenMemory } from '@openmemory/sdk-js'

export default async function handler(req: Request) {
  const memory = new OpenMemory({
    baseUrl: 'https://memory-api.example.com'
  })
  
  const result = await memory.query(req.query.q)
  return Response.json(result)
}
```

### Browser Script
```html
<script type="module">
  import { OpenMemory } from 'https://cdn.skypack.dev/@openmemory/sdk-js'
  
  const memory = new OpenMemory({
    baseUrl: 'https://your-api.com'
  })
  
  // Use client-side
  window.memory = memory
</script>
```

## 🔧 TypeScript Support

Full TypeScript definitions included:

```typescript
import { 
  OpenMemory, 
  Memory, 
  QueryMatch, 
  SectorType, 
  SECTORS 
} from '@openmemory/sdk-js'

// Type-safe sector operations
const sector: SectorType = 'emotional'
const sectorInfo = SECTORS[sector]

// Typed responses
const memories: QueryMatch[] = (await client.query("test")).matches
const memory: Memory = memories[0]
```

## ⚡ Performance Tips

### Batching Operations
```typescript
// Batch multiple adds
const promises = contents.map(content => client.add(content))
const results = await Promise.all(promises)
```

### Caching Client Instance
```typescript
// Reuse client instance
const client = new OpenMemory({ baseUrl: 'https://api.com' })

// Don't create new instance per request
// ❌ const client = new OpenMemory() // in every function call
```

### Optimized Queries
```typescript
// Use specific sectors for faster queries
const emotions = await client.querySector("happy", "emotional")

// Set appropriate minimum scores
const results = await client.query("search", {
  filters: { min_score: 0.8 }  // Higher threshold = fewer, better results
})
```

## 🚧 Error Handling

```typescript
try {
  const result = await client.add("Memory content")
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Authentication required')
  } else if (error.message.includes('429')) {
    console.error('Rate limited, retry later')
  } else {
    console.error('Unknown error:', error)
  }
}

// With timeout handling
const client = new OpenMemory({ 
  timeout: 30000  // 30 second timeout
})
```

## 🔗 Related

- [OpenMemory Backend](../backend/) - TypeScript backend server
- [Python SDK](../sdk-py/) - Python client library
- [API Documentation](../docs/api.md) - Complete API reference

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Built with 🧠 by the OpenMemory Project**  
*Bringing neuroscience-inspired architectures to JavaScript applications.*