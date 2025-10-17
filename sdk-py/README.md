# 🧠 OpenMemory Python SDK

**Brain-inspired memory system client for Python applications.**

[![PyPI version](https://badge.fury.io/py/openmemory.svg)](https://pypi.org/project/openmemory/)
[![Python versions](https://img.shields.io/pypi/pyversions/openmemory.svg)](https://pypi.org/project/openmemory/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **🧠 Brain-Inspired Architecture**: Automatic classification into 5 memory sectors
- **⚡ Fast Vector Search**: Semantic similarity search across memories
- **📉 Memory Decay**: Biologically-inspired exponential decay system
- **🐍 Pythonic**: Clean, intuitive API with type hints
- **🚀 Fast**: Minimal dependencies, pure Python implementation
- **📱 Universal**: Works with Django, Flask, FastAPI, Jupyter, CLI tools

## 🏗️ Memory Sectors

OpenMemory automatically classifies your content into brain-inspired sectors:

| Sector | Function | Examples | Decay Rate |
|---------|-----------|----------|------------|
| **Episodic** | Events & experiences | "I went to Paris yesterday" | 0.015 |
| **Semantic** | Facts & knowledge | "Python is a programming language" | 0.005 |
| **Procedural** | Habits & routines | "My morning routine: coffee first" | 0.008 |
| **Emotional** | Feelings & moods | "I felt excited about the project" | 0.020 |
| **Reflective** | Meta-thoughts | "I think better in the morning" | 0.001 |

## 📦 Installation

```bash
# PyPI (recommended)
pip install openmemory

# Development install
pip install -e .

# With optional dependencies
pip install "openmemory[dev]"
```

## 🚀 Quick Start

```python
from openmemory import OpenMemory

# Initialize client
client = OpenMemory(
    base_url="http://localhost:8080",
    api_key="your-api-key"  # optional
)

# Add memories (auto-classified into brain sectors)
result = client.add("I felt really excited about the AI conference yesterday")
print(f"Stored in '{result['sector']}' sector with ID: {result['id']}")
# Output: Stored in 'emotional' sector with ID: abc-123

# Query memories with semantic search
memories = client.query("conference excitement", k=5)
print(f"Found {len(memories['matches'])} relevant memories")

# Query specific brain sectors
emotions = client.query_sector("happy feelings", "emotional")
habits = client.query_sector("morning routine", "procedural")

# Reinforce important memories
client.reinforce(result['id'], boost=0.3)
```

## 📖 API Reference

### Constructor

```python
client = OpenMemory(
    base_url="http://localhost:8080",  # OpenMemory server URL
    api_key=None,                     # Optional API key
    timeout=60                        # Request timeout in seconds
)
```

### Core Methods

#### `add(content, **options)`
Add a new memory (automatically classified into brain sectors)

```python
# Simple add
result = client.add("I learned about vector databases today")
# Returns: {'id': 'mem_123', 'sector': 'semantic'}

# With metadata and options
result = client.add(
    "Python is great for data science",
    tags=["programming", "data-science"],
    metadata={
        "source": "learning", 
        "difficulty": "beginner",
        "url": "https://example.com"
    },
    salience=0.8,        # Importance (0.0-1.0)
    decay_lambda=0.01    # Custom decay override
)
```

#### `query(query_text, k=8, filters=None)`
Search memories using vector similarity

```python
# Basic query
results = client.query("machine learning concepts")

# Advanced query with filters
results = client.query(
    "happy memories",
    k=10,                           # Max results
    filters={
        "sector": "emotional",      # Search specific sector
        "min_score": 0.7,          # Minimum similarity score
        "tags": ["personal"]        # Filter by tags
    }
)

# Returns: {
#     'query': 'happy memories',
#     'matches': [
#         {
#             'id': 'mem_456',
#             'content': 'I felt joy at graduation',
#             'score': 0.89,
#             'sector': 'emotional',
#             'salience': 0.7,
#             'tags': ['personal', 'milestone'],
#             'metadata': {...}
#         },
#         # ... more matches
#     ]
# }
```

#### `query_sector(query_text, sector, k=8)`
Query a specific brain sector

```python
# Search emotional memories only
emotions = client.query_sector("stress and anxiety", "emotional")

# Search habits and routines only
routines = client.query_sector("morning habits", "procedural", k=5)

# Available sectors: 'episodic', 'semantic', 'procedural', 'emotional', 'reflective'
```

#### `reinforce(memory_id, boost=0.2)`
Boost memory salience (importance)

```python
# Standard reinforcement (+0.2 salience)
client.reinforce("mem_123")

# Strong reinforcement
client.reinforce("mem_123", boost=0.5)

# Returns: {'ok': True}
```

#### `all(limit=100, offset=0)`
Get memories with pagination

```python
# Get first 100 memories
result = client.all()

# Pagination
page_2 = client.all(limit=50, offset=50)

# Returns: {
#     'items': [
#         {
#             'id': 'mem_789',
#             'content': 'Memory content',
#             'sector': 'semantic',
#             'salience': 0.6,
#             'created_at': 1634567890000,
#             'tags': ['tag1', 'tag2'],
#             'metadata': {...}
#         },
#         # ... more memories
#     ]
# }
```

#### `delete(memory_id)`
Delete a memory

```python
client.delete("mem_123")
# Returns: {'ok': True}
```

## 🧠 Brain Sector Examples

### Automatic Classification

The SDK automatically routes content to appropriate brain sectors:

```python
# Temporal/event patterns → episodic
result = client.add("I met Sarah at the coffee shop last Tuesday")
print(result['sector'])  # → 'episodic'

# Emotional patterns → emotional
result = client.add("I feel excited about the new project")
print(result['sector'])  # → 'emotional'

# Procedural patterns → procedural
result = client.add("My workflow: review PRs, then write code")
print(result['sector'])  # → 'procedural'

# Facts/knowledge → semantic (default)
result = client.add("Python was created by Guido van Rossum")
print(result['sector'])  # → 'semantic'

# Meta/reflective → reflective
result = client.add("I notice I'm most productive in the morning")
print(result['sector'])  # → 'reflective'
```

### Manual Sector Assignment

```python
# Force specific sector via metadata
result = client.add(
    "Important deadline coming up",
    metadata={"sector": "emotional"}  # Override automatic classification
)
```

## 🌍 Usage Examples

### Django Application

```python
# views.py
from django.http import JsonResponse
from openmemory import OpenMemory

# Initialize once (consider using Django settings)
memory_client = OpenMemory(
    base_url=settings.OPENMEMORY_URL,
    api_key=settings.OPENMEMORY_API_KEY
)

def add_user_memory(request):
    content = request.POST.get('content')
    user_id = request.user.id
    
    result = memory_client.add(
        content,
        metadata={'user_id': user_id},
        tags=['user-generated']
    )
    
    return JsonResponse(result)

def search_memories(request):
    query = request.GET.get('q')
    memories = memory_client.query(query, k=10)
    return JsonResponse(memories)
```

### Flask API

```python
from flask import Flask, request, jsonify
from openmemory import OpenMemory

app = Flask(__name__)
memory = OpenMemory(base_url="http://localhost:8080")

@app.route('/memories', methods=['POST'])
def add_memory():
    data = request.json
    result = memory.add(
        data['content'],
        tags=data.get('tags', []),
        metadata=data.get('metadata', {})
    )
    return jsonify(result)

@app.route('/search')
def search():
    query = request.args.get('q')
    sector = request.args.get('sector')
    
    if sector:
        results = memory.query_sector(query, sector)
    else:
        results = memory.query(query)
    
    return jsonify(results)
```

### FastAPI Integration

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openmemory import OpenMemory

app = FastAPI()
memory = OpenMemory(base_url="http://localhost:8080")

class MemoryCreate(BaseModel):
    content: str
    tags: list[str] = []
    metadata: dict = {}
    salience: float = 0.5

@app.post("/memories")
async def create_memory(memory_data: MemoryCreate):
    try:
        result = memory.add(
            memory_data.content,
            tags=memory_data.tags,
            metadata=memory_data.metadata,
            salience=memory_data.salience
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search")
async def search_memories(q: str, sector: str = None, k: int = 8):
    if sector:
        return memory.query_sector(q, sector, k)
    else:
        return memory.query(q, k)
```

### Jupyter Notebook

```python
# Install in notebook
!pip install openmemory

from openmemory import OpenMemory

# Connect to your OpenMemory instance
memory = OpenMemory(base_url="http://localhost:8080")

# Add research notes
memory.add("Transformer architecture uses self-attention mechanism", 
          tags=["research", "nlp", "transformers"])

# Query research notes
results = memory.query("attention mechanism research")

# Analyze by sector
for match in results['matches']:
    print(f"[{match['sector']}] {match['content'][:50]}... (score: {match['score']:.3f})")
```

### CLI Tool

```python
#!/usr/bin/env python3
"""Memory CLI tool"""
import argparse
from openmemory import OpenMemory

def main():
    parser = argparse.ArgumentParser(description='OpenMemory CLI')
    parser.add_argument('--url', default='http://localhost:8080')
    parser.add_argument('--api-key')
    
    subparsers = parser.add_subparsers(dest='command')
    
    # Add command
    add_parser = subparsers.add_parser('add')
    add_parser.add_argument('content')
    add_parser.add_argument('--tags', nargs='*', default=[])
    
    # Query command
    query_parser = subparsers.add_parser('query')
    query_parser.add_argument('text')
    query_parser.add_argument('--sector')
    query_parser.add_argument('-k', type=int, default=5)
    
    args = parser.parse_args()
    
    memory = OpenMemory(base_url=args.url, api_key=args.api_key)
    
    if args.command == 'add':
        result = memory.add(args.content, tags=args.tags)
        print(f"Added: {result['id']} → {result['sector']}")
        
    elif args.command == 'query':
        if args.sector:
            results = memory.query_sector(args.text, args.sector, args.k)
        else:
            results = memory.query(args.text, args.k)
            
        for match in results['matches']:
            print(f"{match['score']:.3f} | [{match['sector']}] {match['content']}")

if __name__ == '__main__':
    main()
```

### Data Science Pipeline

```python
import pandas as pd
from openmemory import OpenMemory

# Initialize memory system
memory = OpenMemory(base_url="http://localhost:8080")

# Store research findings
findings = [
    "Linear regression works well for continuous target variables",
    "Random forests are less prone to overfitting than decision trees", 
    "Feature scaling is crucial for gradient-based algorithms",
    "Cross-validation helps prevent overfitting in model selection"
]

# Add findings to memory
for finding in findings:
    result = memory.add(finding, tags=["research", "ml"], metadata={"source": "experiment"})
    print(f"Stored: {result['sector']}")

# Query for specific topics
ml_concepts = memory.query("overfitting prevention techniques", k=3)

# Analyze storage patterns
for match in ml_concepts['matches']:
    print(f"Relevance: {match['score']:.3f}")
    print(f"Content: {match['content']}")
    print(f"Sector: {match['sector']}")
    print("---")
```

## ⚡ Performance Tips

### Connection Reuse
```python
# ✅ Good: Reuse client instance
client = OpenMemory(base_url="http://localhost:8080")

def process_batch(items):
    results = []
    for item in items:
        result = client.add(item)  # Reuses connection
        results.append(result)
    return results

# ❌ Avoid: Creating new client per request
def bad_example(item):
    client = OpenMemory(base_url="http://localhost:8080")  # Creates new connection
    return client.add(item)
```

### Batch Operations
```python
# Process multiple items efficiently
import asyncio
from concurrent.futures import ThreadPoolExecutor

def add_memory(content):
    return client.add(content)

# Batch add with threading
contents = ["memory 1", "memory 2", "memory 3"]
with ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(add_memory, contents))
```

### Optimized Queries
```python
# Use sector-specific queries for better performance
emotions = client.query_sector("happiness", "emotional")  # Faster than general query

# Set appropriate similarity thresholds
results = client.query("search term", filters={"min_score": 0.8})  # Higher threshold = fewer, better results

# Use pagination for large result sets
page_1 = client.all(limit=50, offset=0)
page_2 = client.all(limit=50, offset=50)
```

## 🔧 Configuration

### Environment Variables
```bash
# Set default connection
export OPENMEMORY_URL="http://localhost:8080"
export OPENMEMORY_API_KEY="your-secret-key"
```

```python
import os
from openmemory import OpenMemory

# Auto-load from environment
client = OpenMemory(
    base_url=os.getenv('OPENMEMORY_URL', 'http://localhost:8080'),
    api_key=os.getenv('OPENMEMORY_API_KEY')
)
```

### Timeout Configuration
```python
# Short timeout for real-time applications
client = OpenMemory(base_url="http://api.com", timeout=10)

# Long timeout for batch processing
client = OpenMemory(base_url="http://api.com", timeout=300)
```

## 🚧 Error Handling

```python
from openmemory import OpenMemory
import json

client = OpenMemory(base_url="http://localhost:8080")

try:
    result = client.add("Test memory")
    print(f"Success: {result}")
    
except ConnectionError:
    print("Failed to connect to OpenMemory server")
    
except TimeoutError:
    print("Request timed out")
    
except json.JSONDecodeError:
    print("Invalid response from server")
    
except Exception as e:
    print(f"Unexpected error: {e}")

# Graceful degradation
def safe_add_memory(content):
    try:
        return client.add(content)
    except Exception as e:
        print(f"Memory storage failed: {e}")
        # Fallback: store locally, log to file, etc.
        return None
```

## 🧪 Testing

```python
# test_memory.py
import unittest
from unittest.mock import patch, Mock
from openmemory import OpenMemory

class TestOpenMemory(unittest.TestCase):
    def setUp(self):
        self.client = OpenMemory(base_url="http://test.com")
    
    @patch('urllib.request.urlopen')
    def test_add_memory(self, mock_urlopen):
        # Mock response
        mock_response = Mock()
        mock_response.read.return_value = b'{"id": "test-id", "sector": "semantic"}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        
        result = self.client.add("Test content")
        
        self.assertEqual(result['id'], 'test-id')
        self.assertEqual(result['sector'], 'semantic')
    
    def test_initialization(self):
        client = OpenMemory(base_url="http://example.com", api_key="test-key")
        self.assertEqual(client.u, "http://example.com")
        self.assertEqual(client.k, "test-key")

if __name__ == '__main__':
    unittest.main()
```

## 🔗 Related Projects

- [OpenMemory Backend](../backend/) - TypeScript backend server
- [JavaScript SDK](../sdk-js/) - JavaScript/TypeScript client library
- [API Documentation](../docs/api.md) - Complete API reference

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Built with 🧠 by the OpenMemory Project**  
*Bringing neuroscience-inspired architectures to Python applications.*