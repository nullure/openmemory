---
title: Embedding Modes
description: Optimize performance with Simple vs Advanced embedding strategies
---

# Embedding Modes

OpenMemory supports two embedding modes that balance **speed vs precision** for the HMD v2 multi-sector specification.

## Overview

The HMD v2 specification requires **5 sector embeddings** per memory:
1. Factual
2. Emotional  
3. Temporal
4. Relational
5. Behavioral

Different embedding modes control how these 5 embeddings are generated.

## Simple Mode (Default)

**One batch API call** generates all 5 sector embeddings simultaneously.

### How It Works

Instead of making 5 separate embedding API calls, Simple mode:
1. Constructs 5 sector-specific prompts
2. Sends them in a **single batch request**
3. Receives all 5 embeddings at once

### API Support

- **Gemini**: Uses `batchEmbedContents` endpoint
- **OpenAI**: Sends array of 5 texts to `/embeddings` endpoint
- **Voyage AI**: Uses batch parameter with array input

### Configuration

```env
EMBED_MODE=simple
```

### Advantages

✅ **5x faster** than making individual API calls  
✅ **Lower latency** - one network round trip  
✅ **Better rate limit usage** - counts as 1 request with many providers  
✅ **Lower cost** - batch discounts with some providers

### When to Use

- **Default choice** for most use cases
- High-throughput systems ingesting many memories
- Cost-sensitive applications
- Real-time conversational agents

### Example: OpenAI Simple Mode

```typescript
// Single API call with array input
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: [
    "Factual: User prefers dark mode",
    "Emotional: User feels frustrated with bright UI",
    "Temporal: User changed settings today",
    "Relational: User interacts with design team",
    "Behavioral: User actively customizes interface"
  ]
});

// response.data contains 5 embeddings
```

## Advanced Mode

**Five separate API calls** with optional parallelization and delay control.

### How It Works

Advanced mode makes **individual embedding requests** for each sector:
1. Generates sector-specific prompt
2. Calls embedding API
3. (Optional) Waits for delay
4. Repeats for next sector

### Configuration

```env
EMBED_MODE=advanced
ADV_EMBED_PARALLEL=false
EMBED_DELAY_MS=200
```

### Options

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `EMBED_MODE` | string | `simple` | Set to `advanced` to enable |
| `ADV_EMBED_PARALLEL` | boolean | `false` | Run 5 calls in parallel |
| `EMBED_DELAY_MS` | number | `200` | Delay between sequential calls (ms) |

### Advantages

✅ **More accurate sector separation** - each embedding is isolated  
✅ **Fine-tuned rate limiting** - control timing between calls  
✅ **Retry flexibility** - can retry individual sectors on failure  
✅ **Provider compatibility** - works with all providers

### Disadvantages

❌ **5x slower** - 5 separate network requests  
❌ **Higher latency** - especially with delays  
❌ **Rate limit risk** - more likely to hit 429 errors  
❌ **Higher cost** - no batch discounts

### When to Use

- Providers that **don't support batch embedding**
- When sector **precision is critical**
- Systems with **low memory throughput**
- Research or analysis workloads
- When you need **custom retry logic per sector**

### Sequential Mode (Default)

```typescript
// 5 separate API calls with delay
for (const sector of sectors) {
  const embedding = await getEmbedding(sectorPrompt[sector]);
  await sleep(200); // EMBED_DELAY_MS
}
```

### Parallel Mode

Enable parallel processing:

```env
ADV_EMBED_PARALLEL=true
```

```typescript
// 5 parallel API calls (no delay)
const embeddings = await Promise.all(
  sectors.map(sector => getEmbedding(sectorPrompt[sector]))
);
```

## Performance Comparison

| Mode | API Calls | Latency (est.) | Rate Limit Risk | Cost | Accuracy |
|------|-----------|----------------|-----------------|------|----------|
| **Simple** | 1 batch | ~200ms | Low | Lower | Good |
| **Advanced (Sequential)** | 5 separate | ~1000ms+ | Medium | Higher | Better |
| **Advanced (Parallel)** | 5 parallel | ~200ms | **High** | Higher | Better |

*Latency estimates assume 200ms per embedding API call*

## Rate Limiting Considerations

### Gemini API

- **429 "Too Many Requests"** errors are common
- Simple mode reduces risk (1 batch vs 5 calls)
- Advanced mode includes **exponential backoff** with 3 retries
- Fallback to **synthetic embeddings** if all retries fail

### OpenAI API

- Rate limits based on **tokens per minute (TPM)** and **requests per minute (RPM)**
- Simple mode uses **5x fewer RPM** (1 request vs 5)
- Batch requests count as 1 RPM regardless of array size

### Voyage AI

- Similar batch support as OpenAI
- Simple mode recommended

## Implementation Details

### Simple Mode: Gemini

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'embedding-001' });

const result = await model.batchEmbedContents({
  requests: [
    { content: { parts: [{ text: factualPrompt }] } },
    { content: { parts: [{ text: emotionalPrompt }] } },
    { content: { parts: [{ text: temporalPrompt }] } },
    { content: { parts: [{ text: relationalPrompt }] } },
    { content: { parts: [{ text: behavioralPrompt }] } }
  ]
});

// result.embeddings contains 5 vectors
```

### Advanced Mode: Sequential

```typescript
const embeddings = [];

for (const [sector, prompt] of Object.entries(sectorPrompts)) {
  const embedding = await getEmbedding(prompt);
  embeddings.push(embedding);
  
  if (env.embed_delay_ms > 0) {
    await sleep(env.embed_delay_ms);
  }
}
```

## Switching Modes

### Runtime Switch

You can change modes without rebuilding:

```bash
# Switch to Advanced mode
echo "EMBED_MODE=advanced" >> .env
npm start

# Switch back to Simple mode
echo "EMBED_MODE=simple" >> .env
npm start
```

### Migration Notes

- **No database changes required** - embedding format is identical
- Existing memories work with either mode
- Query performance is unaffected by the mode used during ingestion

## Recommendations

### For Most Users
Use **Simple mode** - it's fast, cost-effective, and accurate enough for production.

### For High Precision
Use **Advanced mode (Sequential)** if you need maximum sector separation and can tolerate higher latency.

### For Research
Use **Advanced mode (Parallel)** during development to quickly test different sector prompts.

### For Rate-Limited APIs
Use **Simple mode** with Gemini to minimize 429 errors.

## Next Steps

- **[Custom Providers](/docs/advanced/providers)**: Add support for new embedding APIs
- **[HMD v2 Specification](/docs/concepts/hmd-v2)**: Understand sector definitions
- **[API Reference](/docs/api/add-memory)**: Learn about embedding parameters
