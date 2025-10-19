---
title: Quick Start Guide
description: Get OpenMemory up and running in 5 minutes
---

# Quick Start Guide

Get OpenMemory running in just a few minutes.

## Prerequisites

- **Node.js 18+** and npm/yarn
- **Python 3.9+** (for SDK)
- An API key for embedding provider (OpenAI, Gemini, or Voyage AI)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nullure/openmemory.git
cd openmemory
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

Create a `.env` file in the `backend` directory:

```env
# Embedding Provider (openai, gemini, or voyage)
EMBED_PROVIDER=openai
OPENAI_API_KEY=your_openai_key_here

# Embedding Mode (simple or advanced)
EMBED_MODE=simple

# Server Configuration
PORT=3000

# Decay Configuration
DECAY_FACTOR=0.1

# Database
DB_PATH=./data/openmemory.db
```

**Gemini Example:**
```env
EMBED_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key_here
```

**Voyage AI Example:**
```env
EMBED_PROVIDER=voyage
VOYAGE_API_KEY=your_voyage_key_here
```

### 4. Build and Start the Server

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`.

## First Memory

### Add a Memory

```bash
curl -X POST http://localhost:3000/memory/add \
  -H "Content-Type: application/json" \
  -d '{
    "content": "User prefers dark mode and minimal design",
    "metadata": {
      "source": "preferences",
      "category": "ui"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "memoryId": "mem_abc123",
  "message": "Memory added successfully"
}
```

### Query Memories

```bash
curl -X POST http://localhost:3000/memory/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the UI preferences?",
    "topK": 5
  }'
```

**Response:**
```json
{
  "results": [
    {
      "id": "mem_abc123",
      "content": "User prefers dark mode and minimal design",
      "score": 0.89,
      "metadata": {
        "source": "preferences",
        "category": "ui"
      },
      "created_at": "2025-01-15T10:30:00Z",
      "reinforcements": 0
    }
  ],
  "query": "What are the UI preferences?",
  "topK": 5
}
```

## Python SDK

### Install SDK

```bash
cd sdk-py
pip install -e .
```

### Use the SDK

```python
from openmemory import OpenMemoryClient

# Initialize client
client = OpenMemoryClient(base_url="http://localhost:3000")

# Add memory
result = client.add_memory(
    content="User loves hiking and outdoor activities",
    metadata={"category": "hobbies"}
)
print(f"Memory ID: {result['memoryId']}")

# Query memories
results = client.query(
    query="What does the user enjoy?",
    top_k=5
)

for memory in results['results']:
    print(f"Score: {memory['score']:.2f} - {memory['content']}")
```

## Multimodal Ingestion

### Ingest a PDF

```bash
curl -X POST http://localhost:3000/memory/ingest \
  -F "file=@document.pdf" \
  -F "metadata={\"source\":\"research_paper\"}"
```

### Ingest a URL

```bash
curl -X POST http://localhost:3000/memory/ingest/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "metadata": {"source": "web"}
  }'
```

For documents over 8000 tokens, OpenMemory automatically creates a **root-child structure**:
- Root memory contains a summary
- Child memories contain sections
- Waypoints link them together

## Reinforce Memories

Boost important memories to prevent decay:

```bash
curl -X POST http://localhost:3000/memory/reinforce \
  -H "Content-Type: application/json" \
  -d '{
    "memoryId": "mem_abc123",
    "strength": 1.0
  }'
```

## Next Steps

- **[Core Concepts](/docs/concepts/sectors)**: Understand multi-sector embeddings
- **[API Reference](/docs/api/add-memory)**: Explore all endpoints
- **[Embedding Modes](/docs/advanced/embedding-modes)**: Optimize performance with Simple vs Advanced modes
- **[Waypoints](/docs/concepts/waypoints)**: Learn about memory graph connections
