---
title: Add Memory
description: Add new memories to OpenMemory with full control over content, metadata, and decay parameters
---

# Add Memory

Add new memories to OpenMemory with full control over content, metadata, and decay parameters.

## Endpoint

```
POST /api/memory
```

## Authentication

```bash
X-API-Key: your_api_key_here
```

## Request Body

```typescript
interface AddMemoryRequest {
  content: string;
  metadata?: Record<string, any>;
  decay_rate?: number;
  initial_strength?: number;
  sector_id?: string;
  auto_sector?: boolean;
  embedding?: number[];
  tags?: string[];
}
```

### Parameters

| Parameter          | Type     | Required | Default | Description                 |
| ------------------ | -------- | -------- | ------- | --------------------------- |
| `content`          | string   | Yes      | -       | The memory content to store |
| `metadata`         | object   | No       | `{}`    | Additional metadata         |
| `decay_rate`       | number   | No       | `0.95`  | Decay rate (0.0-1.0)        |
| `initial_strength` | number   | No       | `0.8`   | Initial strength (0.0-1.0)  |
| `sector_id`        | string   | No       | `null`  | Specific sector ID          |
| `auto_sector`      | boolean  | No       | `true`  | Auto-assign sector          |
| `embedding`        | number[] | No       | `null`  | Pre-computed embedding      |
| `tags`             | string[] | No       | `[]`    | Tags for categorization     |

## Response

```typescript
interface AddMemoryResponse {
  id: string;
  content: string;
  sector_id: string;
  strength: number;
  decay_rate: number;
  embedding_dimensions: number;
  created_at: string;
  waypoints_created: number;
}
```

## Examples

### Basic Usage

```python
from openmemory import OpenMemory

om = OpenMemory(api_key="your_api_key")

# Simple memory addition
memory_id = om.add_memory(
    content="Python uses duck typing for polymorphism"
)

print(f"Memory created: {memory_id}")
```

### With Metadata

```python
memory_id = om.add_memory(
    content="Docker Compose simplifies multi-container deployments",
    metadata={
        "category": "devops",
        "source": "tutorial",
        "difficulty": "intermediate",
        "tags": ["docker", "containers", "deployment"]
    }
)
```

### Custom Decay Settings

```python
# Important memory - slow decay
important_id = om.add_memory(
    content="Database backup runs daily at 2 AM UTC",
    decay_rate=0.99,  # Very slow decay
    initial_strength=0.95,
    metadata={"importance": "critical"}
)

# Temporary context - fast decay
temp_id = om.add_memory(
    content="User is currently debugging authentication bug",
    decay_rate=0.88,  # Fast decay
    initial_strength=0.7,
    metadata={"type": "session_context"}
)
```

### Specific Sector

```python
# Add to specific sector
memory_id = om.add_memory(
    content="React hooks must follow the rules of hooks",
    sector_id="learning/react",
    auto_sector=False  # Don't auto-assign
)
```

### Batch Addition

```python
# Add multiple memories efficiently
memories = [
    {"content": "Memory 1", "metadata": {"batch": 1}},
    {"content": "Memory 2", "metadata": {"batch": 1}},
    {"content": "Memory 3", "metadata": {"batch": 1}},
]

results = om.add_memories_batch(memories)
print(f"Added {len(results)} memories")
```

### TypeScript/Node.js

```typescript
import { OpenMemory } from '@openmemory/sdk';

const om = new OpenMemory({ apiKey: 'your_api_key' });

// Add memory
const result = await om.addMemory({
  content: 'GraphQL provides type-safe API queries',
  metadata: {
    category: 'web_development',
    topics: ['graphql', 'api', 'typescript'],
  },
  decayRate: 0.96,
  initialStrength: 0.85,
});

console.log(`Memory ID: ${result.id}`);
```

### cURL

```bash
curl -X POST https://your-domain.com/api/memory \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "content": "Kubernetes orchestrates containerized applications",
    "metadata": {
      "category": "devops",
      "difficulty": "advanced"
    },
    "decay_rate": 0.97,
    "initial_strength": 0.9,
    "tags": ["kubernetes", "containers", "orchestration"]
  }'
```

## Response Examples

### Success Response

```json
{
  "id": "mem_7k9n2x4p8q",
  "content": "Python uses duck typing for polymorphism",
  "sector_id": "sector_abc123",
  "strength": 0.8,
  "decay_rate": 0.95,
  "embedding_dimensions": 384,
  "created_at": "2025-01-20T14:30:00Z",
  "waypoints_created": 3
}
```

### Error Responses

#### Invalid Content

```json
{
  "error": "ValidationError",
  "message": "Content cannot be empty",
  "code": 400
}
```

#### Invalid Decay Rate

```json
{
  "error": "ValidationError",
  "message": "decay_rate must be between 0.0 and 1.0",
  "code": 400
}
```

#### Sector Not Found

```json
{
  "error": "NotFoundError",
  "message": "Sector 'invalid_sector' does not exist",
  "code": 404
}
```

## Advanced Options

### Pre-computed Embeddings

If you've already computed embeddings:

```python
import numpy as np

# Your pre-computed embedding (e.g., from OpenAI)
embedding = np.array([0.1, 0.2, ...])  # 384 or 1536 dimensions

memory_id = om.add_memory(
    content="Content here",
    embedding=embedding.tolist()
)
```

### Rich Metadata

```python
memory_id = om.add_memory(
    content="User reported bug in payment processing",
    metadata={
        "type": "issue",
        "priority": "high",
        "status": "open",
        "reporter": {
            "id": "user_123",
            "email": "[email protected]"
        },
        "timestamps": {
            "created": "2025-01-20T10:00:00Z",
            "updated": "2025-01-20T10:00:00Z"
        },
        "affected_components": ["payment", "api", "database"],
        "related_issues": ["issue_456", "issue_789"]
    }
)
```

### Auto-linking

Automatically create waypoints to similar memories:

```python
memory_id = om.add_memory(
    content="Content here",
    auto_link=True,  # Create waypoints to similar memories
    link_threshold=0.75,  # Minimum similarity
    max_links=5  # Maximum waypoints to create
)
```

## Best Practices

### 1. Choose Appropriate Decay Rates

```python
# System configuration - very slow decay
om.add_memory("API key: abc123", decay_rate=0.99)

# User preferences - slow decay
om.add_memory("User prefers dark mode", decay_rate=0.97)

# General knowledge - normal decay
om.add_memory("Python tip: use enumerate()", decay_rate=0.95)

# Session context - fast decay
om.add_memory("User editing profile.tsx", decay_rate=0.90)

# Temporary data - very fast decay
om.add_memory("Cache warmed", decay_rate=0.85)
```

### 2. Use Meaningful Metadata

```python
# Good metadata structure
om.add_memory(
    content="...",
    metadata={
        "source": "documentation",
        "version": "2.0",
        "language": "python",
        "confidence": 0.95,
        "author": "system",
        "verified": True
    }
)
```

### 3. Organize with Sectors

```python
# Let OpenMemory auto-organize
om.add_memory("Content", auto_sector=True)

# Or manually organize
om.add_memory("Content", sector_id="work/project_a/docs")
```

### 4. Batch Operations

```python
# More efficient than individual adds
memories = [
    {"content": f"Memory {i}", "metadata": {"index": i}}
    for i in range(100)
]
om.add_memories_batch(memories, batch_size=50)
```

### 5. Handle Errors Gracefully

```python
try:
    memory_id = om.add_memory(content="...")
except ValidationError as e:
    print(f"Invalid input: {e}")
except RateLimitError as e:
    print(f"Rate limited: {e}")
    time.sleep(60)
    # Retry
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Performance Considerations

### Content Length

- **Optimal**: 50-500 characters per memory
- **Maximum**: 10,000 characters
- **Recommendation**: Split long content into chunks

```python
# Split long content
def chunk_text(text, chunk_size=500, overlap=50):
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunks.append(text[i:i + chunk_size])
    return chunks

long_content = "..." # Very long text
for chunk in chunk_text(long_content):
    om.add_memory(chunk)
```

### Embedding Generation

- **Local embeddings**: ~50ms per memory
- **OpenAI API**: ~200ms per memory
- **Batch embedding**: More efficient for multiple memories

### Waypoint Creation

- Automatic waypoint creation adds ~10-50ms
- Depends on number of existing memories
- Disabled with `auto_link=False`

## Rate Limits

| Plan       | Requests/min | Daily Limit |
| ---------- | ------------ | ----------- |
| Free       | 10           | 1,000       |
| Pro        | 100          | 100,000     |
| Enterprise | Unlimited    | Unlimited   |

## Related Endpoints

- [Query Memory](/docs/api/query) - Search and retrieve memories
- [Update Memory](/docs/api/update-memory) - Modify existing memories
- [Delete Memory](/docs/api/delete-memory) - Remove memories
- [Multimodal Ingestion](/docs/api/ingestion) - Add files and images

## Next Steps

- Learn about [Memory Sectors](/docs/concepts/sectors)
- Understand [HMD v2 decay](/docs/concepts/hmd-v2)
- Explore [Chunking Strategies](/docs/advanced/chunking)
