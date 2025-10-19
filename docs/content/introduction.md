---
title: Introduction to OpenMemory
description: Learn about OpenMemory's long-term memory system for AI agents
---

# Introduction to OpenMemory

OpenMemory is a production-ready **long-term memory system** designed specifically for AI agents and conversational systems. It implements the **HMD v2 (Holistic Memory Descriptor v2) specification** with advanced features like multi-sector embeddings, time-based decay, and graph-based waypoints.

## Why OpenMemory?

Traditional AI chatbots are stateless - they forget everything after a conversation ends. While context windows have grown larger, they still can't retain information across sessions or scale to thousands of interactions.

OpenMemory solves this by:

- **Persistent Memory Storage**: Stores memories in SQLite with vector embeddings for semantic retrieval
- **Intelligent Decay**: Old memories naturally fade while important ones can be reinforced
- **Multi-dimensional Understanding**: 5-sector embeddings capture factual, emotional, temporal, relational, and behavioral aspects
- **Graph Connections**: Waypoints link related memories creating a knowledge graph
- **Multimodal Support**: Ingest PDFs, DOCX files, HTML pages, and URLs

## Key Concepts

### 1. Multi-Sector Embeddings (HMD v2)

Each memory is embedded across 5 specialized dimensions:

- **Factual**: What happened? Core information and facts
- **Emotional**: How did it feel? Sentiment and emotional context
- **Temporal**: When did it occur? Time-based ordering and recency
- **Relational**: Who was involved? Entity relationships
- **Behavioral**: What actions were taken? Intent and behavior patterns

This allows retrieval to be context-aware. A query about "frustrations" will match the emotional sector, while "yesterday's meeting" targets the temporal sector.

### 2. Decay Algorithm

Memories decay over time using a configurable formula:

```
score = similarity * (1 + log(1 + reinforcements)) * exp(-decay_factor * age_days)
```

- **Similarity**: Vector cosine similarity to the query
- **Reinforcements**: Number of times the memory has been accessed or reinforced
- **Age**: Time since memory was created (in days)
- **Decay Factor**: Configurable rate (default: 0.1)

This mimics human memory - recent and frequently accessed memories rank higher.

### 3. Graph Waypoints

Memories can be connected via **waypoints** - bidirectional edges that link related content:

```
Memory A <---waypoint---> Memory B
```

When you query for Memory A, the system can optionally traverse waypoints to fetch related memories, creating context-aware retrieval chains.

### 4. Root-Child Memory Strategy

For large documents (>8000 tokens), OpenMemory automatically:

1. Creates a **root memory** with a reflective summary
2. Splits the document into **child sections** (~3000 chars each)
3. Links children to the root via waypoints
4. Allows querying the summary while drilling down to specific sections

## Architecture

```
┌─────────────────────────────────────────┐
│         HTTP REST API                    │
│  /memory/add  /memory/query  /reinforce │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼─────┐          ┌─────▼────┐
   │ Embedding │          │  Decay   │
   │  Service  │          │  Engine  │
   └────┬─────┘          └─────┬────┘
        │                       │
        └───────────┬───────────┘
                    │
            ┌───────▼────────┐
            │   SQLite DB    │
            │  + Vec Search  │
            └────────────────┘
```

## What's Next?

- **[Quick Start](/docs/quick-start)**: Get OpenMemory running in 5 minutes
- **[HMD v2 Specification](/docs/concepts/hmd-v2)**: Deep dive into multi-sector embeddings
- **[API Reference](/docs/api/add-memory)**: Explore all endpoints and parameters
- **[Embedding Modes](/docs/advanced/embedding-modes)**: Learn about Simple vs Advanced embedding strategies
