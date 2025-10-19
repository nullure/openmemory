---
title: Query Memory
description: Search and retrieve memories using semantic search with multi-hop navigation
---

# Query Memory

Search and retrieve memories using semantic search with multi-hop navigation.

## Endpoint

```
POST /api/query
```

## Request Body

```typescript
interface QueryRequest {
  query: string;
  limit?: number;
  max_hops?: number;
  min_strength?: number;
  sector_id?: string;
  metadata_filter?: Record<string, any>;
  include_paths?: boolean;
}
```

### Parameters

| Parameter         | Type    | Required | Default | Description             |
| ----------------- | ------- | -------- | ------- | ----------------------- |
| `query`           | string  | Yes      | -       | Search query text       |
| `limit`           | number  | No       | `10`    | Max results to return   |
| `max_hops`        | number  | No       | `3`     | Multi-hop depth         |
| `min_strength`    | number  | No       | `0.3`   | Minimum memory strength |
| `sector_id`       | string  | No       | `null`  | Search within sector    |
| `metadata_filter` | object  | No       | `{}`    | Filter by metadata      |
| `include_paths`   | boolean | No       | `true`  | Include traversal paths |

## Response

```typescript
interface QueryResponse {
  results: MemoryResult[];
  query_time_ms: number;
  total_memories_searched: number;
}

interface MemoryResult {
  id: string;
  content: string;
  score: number;
  strength: number;
  hops: number;
  path?: string[];
  metadata: Record<string, any>;
}
```

## Examples

### Basic Query

```python
from openmemory import OpenMemory

om = OpenMemory(api_key="your_api_key")

# Simple search
results = om.query(
    query="How does Python handle memory management?",
    limit=5
)

for result in results:
    print(f"Score: {result.score:.3f}")
    print(f"Content: {result.content}")
    print("---")
```

### Multi-hop Query

```python
# Navigate through related memories
results = om.query(
    query="machine learning optimization",
    max_hops=4,
    include_paths=True
)

for result in results:
    print(f"Found after {result.hops} hops")
    print(f"Path: {' → '.join(result.path)}")
    print(f"Content: {result.content}")
```

### Filtered Query

```python
# Filter by metadata and sector
results = om.query(
    query="authentication patterns",
    sector_id="work/backend",
    metadata_filter={
        "language": "python",
        "verified": True
    },
    min_strength=0.5
)
```

### TypeScript

```typescript
const results = await om.query({
  query: 'React hooks best practices',
  limit: 10,
  maxHops: 2,
  metadataFilter: {
    category: 'react',
  },
});

results.forEach((r) => {
  console.log(`${r.score}: ${r.content}`);
});
```

See [Add Memory](/docs/api/add-memory) for creating memories and [Reinforcement](/docs/api/reinforce) for strengthening them.
