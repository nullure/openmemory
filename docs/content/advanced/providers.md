---
title: Custom Providers
description: Implement custom embedding providers, storage backends, and chunking strategies
---

# Custom Providers

Implement custom embedding providers, storage backends, and chunking strategies.

## Custom Embedding Provider

```python
from openmemory.providers import EmbeddingProvider
import numpy as np

class CustomEmbeddingProvider(EmbeddingProvider):
    def __init__(self, model_path: str):
        self.model = load_your_model(model_path)

    def embed(self, text: str) -> np.ndarray:
        """Generate embedding for text"""
        return self.model.encode(text)

    def embed_batch(self, texts: list[str]) -> np.ndarray:
        """Generate embeddings for multiple texts"""
        return self.model.encode_batch(texts)

    @property
    def dimensions(self) -> int:
        """Return embedding dimensions"""
        return 768

# Register custom provider
om = OpenMemory()
om.register_embedding_provider('custom', CustomEmbeddingProvider('./model'))
om.set_embedding_provider('custom')
```

## Custom Storage Backend

```python
from openmemory.storage import StorageBackend

class RedisStorage(StorageBackend):
    def __init__(self, redis_url: str):
        self.client = redis.from_url(redis_url)

    def store_memory(self, memory: Memory) -> str:
        """Store memory and return ID"""
        memory_id = generate_id()
        self.client.hset(f"memory:{memory_id}", mapping=memory.to_dict())
        return memory_id

    def retrieve_memory(self, memory_id: str) -> Memory:
        """Retrieve memory by ID"""
        data = self.client.hgetall(f"memory:{memory_id}")
        return Memory.from_dict(data)

    def search_memories(self, embedding: np.ndarray, limit: int) -> list[Memory]:
        """Vector similarity search"""
        # Implement using Redis Vector Search
        pass

# Use custom storage
om = OpenMemory(storage_backend=RedisStorage('redis://localhost'))
```

## Custom Chunking Strategy

```python
from openmemory.chunking import ChunkingStrategy

class CustomChunker(ChunkingStrategy):
    def chunk(self, text: str) -> list[str]:
        """Split text into chunks"""
        # Your custom logic
        chunks = []
        # ... chunking implementation
        return chunks

# Register custom chunker
om.register_chunking_strategy('custom', CustomChunker())
om.ingest_file('document.pdf', chunk_strategy='custom')
```

## Plugin System

Create OpenMemory plugins:

```python
from openmemory import Plugin

class AnalyticsPlugin(Plugin):
    def on_memory_added(self, memory: Memory):
        """Hook: Called when memory is added"""
        self.track_event('memory_added', memory.metadata)

    def on_query_executed(self, query: str, results: list):
        """Hook: Called after query"""
        self.track_event('query', {'query': query, 'result_count': len(results)})

    def track_event(self, event_name: str, data: dict):
        # Send to analytics service
        pass

# Load plugin
om.load_plugin(AnalyticsPlugin())
```

Learn about [Embedding Modes](/docs/advanced/embedding-modes) and [Chunking Strategies](/docs/advanced/chunking).
