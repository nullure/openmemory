---
title: Chunking Strategy
description: Optimize how documents are split into memories for better retrieval and context preservation
---

# Chunking Strategy

Optimize how documents are split into memories for better retrieval and context preservation.

## Chunking Methods

### Fixed-Size Chunking

Split text into fixed-length chunks.

**Best for:** Simple documents, quick setup

```python
om.ingest_file(
    'document.pdf',
    chunk_strategy='fixed',
    chunk_size=512,
    chunk_overlap=50
)
```

**Pros:**

- Fast and simple
- Predictable chunk sizes
- Low memory usage

**Cons:**

- May split sentences/paragraphs
- Loses semantic boundaries

### Semantic Chunking

Split based on semantic coherence.

**Best for:** Articles, documentation, books

```python
om.ingest_file(
    'article.md',
    chunk_strategy='semantic',
    similarity_threshold=0.75
)
```

**Pros:**

- Maintains topic coherence
- Better context preservation
- Improves retrieval quality

**Cons:**

- Slower processing
- Variable chunk sizes

### Sentence-Based Chunking

Split at sentence boundaries.

**Best for:** Chat logs, Q&A, structured text

```python
om.ingest_file(
    'conversation.txt',
    chunk_strategy='sentence',
    sentences_per_chunk=3
)
```

### Code-Aware Chunking

Split code by functions/classes.

**Best for:** Source code repositories

```python
om.ingest_file(
    'module.py',
    chunk_strategy='code',
    split_by='function'  # or 'class', 'method'
)
```

## Configuration

### Chunk Size Guidelines

| Content Type   | Recommended Size | Strategy   |
| -------------- | ---------------- | ---------- |
| Technical docs | 300-500 chars    | Semantic   |
| Books/Articles | 500-800 chars    | Semantic   |
| Code           | By function      | Code-aware |
| Chat/Logs      | 100-200 chars    | Sentence   |
| API responses  | 200-400 chars    | Fixed      |

### Overlap Strategy

```python
# High overlap - better context but more storage
om.ingest_file(
    'document.pdf',
    chunk_size=500,
    chunk_overlap=100  # 20% overlap
)

# Low overlap - less storage but may miss context
om.ingest_file(
    'document.pdf',
    chunk_size=500,
    chunk_overlap=25  # 5% overlap
)
```

## Advanced Techniques

### Hierarchical Chunking

```python
# Create parent-child chunk relationships
om.ingest_file(
    'book.pdf',
    chunk_strategy='hierarchical',
    levels=[
        {'size': 2000, 'name': 'chapter'},
        {'size': 500, 'name': 'section'},
        {'size': 100, 'name': 'paragraph'}
    ]
)
```

### Metadata-Enhanced Chunking

```python
# Extract and add metadata to chunks
om.ingest_file(
    'document.pdf',
    extract_metadata=True,  # Headers, page numbers, etc.
    metadata_strategy='inherit'  # Inherit from document
)
```

### Custom Chunking Function

```python
def custom_chunker(text: str) -> list[str]:
    """Custom chunking logic"""
    chunks = []
    # Your logic here
    return chunks

om.ingest_file(
    'document.pdf',
    chunk_function=custom_chunker
)
```

## Best Practices

1. **Match chunk size to query length** - Similar sizes work better
2. **Use semantic chunking for quality** - Worth the extra processing
3. **Add overlap for context** - 10-20% overlap recommended
4. **Preserve structure** - Keep paragraphs/sections together
5. **Test and iterate** - Evaluate retrieval quality

## Performance Impact

| Strategy   | Speed  | Storage | Quality  |
| ---------- | ------ | ------- | -------- |
| Fixed      | ⚡⚡⚡ | ✅      | ⭐⭐     |
| Sentence   | ⚡⚡   | ✅✅    | ⭐⭐⭐   |
| Semantic   | ⚡     | ✅✅✅  | ⭐⭐⭐⭐ |
| Code-aware | ⚡⚡   | ✅✅    | ⭐⭐⭐⭐ |

See [Multimodal Ingestion](/docs/api/ingestion) for file ingestion and [Custom Providers](/docs/advanced/providers) for custom chunkers.
