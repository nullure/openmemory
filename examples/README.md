# OpenMemory Examples

This directory contains comprehensive examples for using OpenMemory across different platforms and use cases.

## Directory Structure

```
examples/
├── backend/           # Server-side examples and API testing
├── js-sdk/           # JavaScript/Node.js SDK examples  
├── py-sdk/           # Python SDK examples
└── README.md         # This file
```

## Getting Started

### Prerequisites

1. **Start the OpenMemory server:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Server will run on `http://localhost:8080`

2. **Install SDK dependencies (if needed):**
   ```bash
   # For JavaScript examples
   cd js-sdk
   npm install
   
   # Python SDK has zero dependencies
   cd py-sdk
   # No additional installation required
   ```

## Backend Examples

**Location:** `examples/backend/`

- `basic-server.js` - Simple server setup example
- `api-test.mjs` - Complete API testing suite
- `embedding-providers.mjs` - Test different embedding providers

**Run backend examples:**
```bash
cd examples/backend
node basic-server.js
node api-test.mjs
node embedding-providers.mjs
```

## JavaScript SDK Examples

**Location:** `examples/js-sdk/`

- `basic-usage.js` - Getting started with the JS SDK
- `brain-sectors.js` - Brain-inspired sector system demo
- `advanced-features.js` - Advanced SDK features and configuration

**Run JavaScript examples:**
```bash
cd examples/js-sdk
node basic-usage.js
node brain-sectors.js  
node advanced-features.js
```

## Python SDK Examples

**Location:** `examples/py-sdk/`

- `basic_usage.py` - Getting started with the Python SDK
- `brain_sectors.py` - Multi-sector memory operations
- `advanced_features.py` - Advanced features and system monitoring
- `performance_benchmark.py` - Performance testing and benchmarks

**Run Python examples:**
```bash
cd examples/py-sdk
python basic_usage.py
python brain_sectors.py
python advanced_features.py
python performance_benchmark.py
```

## Key Features Demonstrated

### 🧠 Brain-Inspired Architecture
- **5 Memory Sectors:** Episodic, Semantic, Procedural, Emotional, Reflective
- **Automatic Classification:** Content automatically routed to appropriate sectors
- **Cross-Sector Queries:** Search across multiple brain sectors simultaneously

### 🔗 Hybrid Sector Graphs (HSG)
- **Waypoint System:** Memories connected through learned associations
- **Graph Traversal:** Enhanced retrieval through memory pathways
- **Reinforcement Learning:** Memory strength adapts based on usage patterns

### 🚀 Multiple Embedding Providers
- **OpenAI:** text-embedding-3-small, text-embedding-3-large
- **Google Gemini:** embedding-001 model
- **Ollama:** Local models (nomic-embed-text, bge variants)
- **Local Models:** Custom embedding implementations
- **Synthetic Fallback:** Zero-dependency operation

### ⚡ Performance Features
- **Memory Decay:** Unused memories naturally fade over time
- **Salience Tracking:** Important memories maintain higher priority
- **Efficient Retrieval:** Vector similarity + graph traversal
- **Background Processing:** Non-blocking operations

## Configuration

### Environment Variables

```bash
# OpenAI (optional)
OPENAI_API_KEY=your_openai_key

# Google Gemini (optional)  
GEMINI_API_KEY=your_gemini_key

# Ollama (optional - for local models)
OLLAMA_BASE_URL=http://localhost:11434

# Authentication (optional)
AUTH_KEY=your_auth_key

# Embedding Provider (optional)
EMBEDDING_PROVIDER=openai  # openai, gemini, ollama, local, synthetic
```

### Server Configuration

```typescript
// Default configuration in backend/src/config/index.ts
{
  port: 8080,
  cors: true,
  embedding: {
    provider: 'synthetic',  // Fallback provider
    dimensions: 384,
    providers: {
      openai: { models: ['text-embedding-3-small', 'text-embedding-3-large'] },
      gemini: { model: 'embedding-001' },
      ollama: { models: ['nomic-embed-text', 'bge-small-en-v1.5'] },
      local: { dimensions: 384 }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Server not running:**
   ```bash
   cd backend && npm run dev
   ```

2. **Port conflicts:**
   - Change port in `backend/src/config/index.ts`
   - Update examples to match new port

3. **Embedding provider errors:**
   - Check API keys in environment variables
   - Verify provider availability (Ollama server running)
   - Fallback to synthetic provider works without setup

4. **Module import errors:**
   - Ensure correct path to SDK in examples
   - Check Node.js version compatibility

### Performance Tips

1. **Use appropriate embedding provider:**
   - Local development: `synthetic` (fastest setup)
   - Production: `openai` or `gemini` (best quality)
   - Privacy-focused: `ollama` (local processing)

2. **Optimize queries:**
   - Use sector-specific queries when possible
   - Limit `k` parameter for faster results
   - Enable graph traversal for better context

3. **Memory management:**
   - Regular cleanup of test memories
   - Monitor database size growth
   - Use memory decay for automatic cleanup

## Development

### Adding New Examples

1. Create new file in appropriate SDK directory
2. Follow existing naming convention
3. Include comprehensive error handling
4. Add documentation comments
5. Update this README with new example

### Testing Changes

1. Start the server: `cd backend && npm run dev`
2. Run example: `node your-example.js` or `python your_example.py`
3. Check server logs for detailed operation info
4. Verify memory operations in database

---

**OpenMemory** - Brain-inspired memory system with hybrid sector graphs 🧠🔗