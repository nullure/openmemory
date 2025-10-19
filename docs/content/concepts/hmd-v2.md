---
title: HMD v2 Specification
description: OpenMemory's proprietary algorithm that simulates natural memory decay and reinforcement patterns
---

# HMD v2 Specification

**Hierarchical Memory Decay version 2** is OpenMemory's proprietary algorithm that simulates natural memory decay and reinforcement patterns observed in human cognition.

## Overview

Unlike traditional time-based expiration or LRU (Least Recently Used) caching, HMD v2 creates a sophisticated strength-based system where memories:

- **Decay naturally** over time
- **Strengthen with access** and reinforcement
- **Maintain relationships** through connected memories
- **Form hierarchies** based on importance

## Core Concepts

### Memory Strength

Every memory has a strength value (0.0 to 1.0):

```
strength = initial_strength × decay_factor^time_elapsed × access_multiplier
```

- **Initial strength**: 0.5-1.0 (based on importance)
- **Decay factor**: 0.95-0.99 (slower = better retention)
- **Access multiplier**: 1.1-1.5 (each access strengthens memory)

### Decay Curves

HMD v2 uses multiple decay curves for different memory types:

```python
# Short-term memory (fast decay)
short_term_curve = lambda t: 0.5 * (0.92 ** t)

# Long-term memory (slow decay)
long_term_curve = lambda t: 0.8 * (0.98 ** t)

# Episodic memory (contextual decay)
episodic_curve = lambda t, context: base_strength * (decay_rate ** t) * context_factor
```

## Mathematical Model

### Base Decay Formula

```
S(t) = S₀ × e^(-λt)
```

Where:

- `S(t)` = Strength at time t
- `S₀` = Initial strength
- `λ` = Decay constant (derived from decay_rate)
- `t` = Time elapsed (in configurable units)

### Reinforcement Formula

```
S_new = min(1.0, S_old + α × (1 - S_old))
```

Where:

- `α` = Learning rate (0.1-0.3)
- Asymptotically approaches 1.0 with repeated access

### Context-Aware Decay

```
S_contextual = S_base × (1 + β × relatedness)
```

Where:

- `β` = Context strength factor
- `relatedness` = Cosine similarity to recently accessed memories

## Implementation

### Memory Structure

```typescript
interface Memory {
  id: string;
  content: string;
  embedding: number[];
  strength: number;
  decay_rate: number;
  last_accessed: Date;
  access_count: number;
  reinforcement_count: number;
  created_at: Date;
  sector_id: string;
}
```

### Decay Calculation

```python
from datetime import datetime, timedelta
import math

def calculate_current_strength(memory):
    """Calculate current memory strength using HMD v2"""

    # Time elapsed since last access
    now = datetime.now()
    elapsed = (now - memory.last_accessed).total_seconds() / 3600  # hours

    # Base decay
    base_decay = memory.decay_rate ** elapsed

    # Access multiplier (logarithmic scaling)
    access_multiplier = 1 + (0.3 * math.log(1 + memory.access_count))

    # Reinforcement boost
    reinforcement_boost = 1 + (0.2 * memory.reinforcement_count)

    # Combined strength
    current_strength = (
        memory.strength
        * base_decay
        * access_multiplier
        * reinforcement_boost
    )

    return min(1.0, max(0.0, current_strength))
```

### Memory Lifecycle

```
Creation → Active Use → Gradual Decay → Potential Forgetting
    ↓         ↓              ↓                ↓
  S=0.8    S=0.95         S=0.4          S<0.1 (archived)
```

## Decay Tiers

HMD v2 uses tiered decay rates based on importance:

### Tier 1: Critical Memories

- **Decay rate**: 0.99
- **Use case**: System prompts, core knowledge
- **Half-life**: ~69 days

### Tier 2: Important Memories

- **Decay rate**: 0.97
- **Use case**: User preferences, recent context
- **Half-life**: ~23 days

### Tier 3: Regular Memories

- **Decay rate**: 0.95 (default)
- **Use case**: General information
- **Half-life**: ~14 days

### Tier 4: Ephemeral Memories

- **Decay rate**: 0.90
- **Use case**: Temporary context, session data
- **Half-life**: ~7 days

## Configuration

### Setting Decay Rates

```python
from openmemory import OpenMemory

om = OpenMemory()

# Add memory with custom decay rate
om.add_memory(
    content="Critical system configuration",
    decay_rate=0.99,  # Very slow decay
    initial_strength=0.95
)

# Update existing memory decay rate
om.update_memory(
    memory_id="mem_123",
    decay_rate=0.97
)
```

### Global Decay Settings

```python
# Configure default decay behavior
om.configure_decay(
    default_decay_rate=0.95,
    min_strength_threshold=0.1,  # Archive below this
    auto_reinforce_on_access=True,
    reinforcement_strength=0.15
)
```

## Reinforcement Strategies

### Explicit Reinforcement

User-triggered strengthening:

```python
# Manually reinforce a memory
om.reinforce_memory(
    memory_id="mem_123",
    strength_boost=0.3
)
```

### Implicit Reinforcement

Automatic strengthening on access:

```python
# Occurs automatically during query
results = om.query("important topic")
# All returned memories are implicitly reinforced
```

### Spaced Repetition

Implement spaced repetition algorithms:

```python
def schedule_review(memory, performance):
    """SM-2 algorithm for optimal review timing"""
    if performance >= 3:  # Easy
        memory.decay_rate = min(0.99, memory.decay_rate + 0.01)
        return 6  # Review in 6 days
    elif performance == 2:  # Good
        return 3  # Review in 3 days
    else:  # Hard
        memory.decay_rate = max(0.90, memory.decay_rate - 0.02)
        return 1  # Review tomorrow
```

## Query-Time Strength Adjustment

Memories are ranked by adjusted strength during queries:

```python
def calculate_query_score(memory, query_embedding, query_time):
    """Calculate relevance score considering strength"""

    # Semantic similarity
    similarity = cosine_similarity(memory.embedding, query_embedding)

    # Current strength
    strength = calculate_current_strength(memory)

    # Recency boost
    hours_since_access = (query_time - memory.last_accessed).total_seconds() / 3600
    recency = 1.0 if hours_since_access < 24 else 0.8

    # Combined score
    return similarity * 0.6 + strength * 0.3 + recency * 0.1
```

## Memory Consolidation

Periodic process to optimize memory graph:

```python
def consolidate_memories():
    """Daily consolidation process"""

    # 1. Archive weak memories
    weak_memories = om.find_memories(max_strength=0.1)
    om.archive_memories(weak_memories)

    # 2. Merge similar memories
    similar_clusters = om.find_similar_clusters(threshold=0.95)
    for cluster in similar_clusters:
        om.merge_memories(cluster, strategy="strongest")

    # 3. Update waypoints
    om.rebuild_waypoints()

    # 4. Rebalance sectors
    om.rebalance_sectors()
```

## Visualization

### Decay Curve Example

For a memory with decay_rate=0.95:

```
Strength over time (days):
Day 0:  ████████████████████ 100%
Day 7:  ██████████████ 70%
Day 14: ██████████ 50%
Day 21: ███████ 35%
Day 30: █████ 25%
```

### Interactive Decay Visualization

```python
import matplotlib.pyplot as plt
import numpy as np

def plot_decay_curves():
    days = np.linspace(0, 60, 200)

    # Different decay rates
    critical = 0.99 ** (days / 1)
    important = 0.97 ** (days / 1)
    regular = 0.95 ** (days / 1)
    ephemeral = 0.90 ** (days / 1)

    plt.plot(days, critical, label='Critical (0.99)')
    plt.plot(days, important, label='Important (0.97)')
    plt.plot(days, regular, label='Regular (0.95)')
    plt.plot(days, ephemeral, label='Ephemeral (0.90)')

    plt.xlabel('Days')
    plt.ylabel('Memory Strength')
    plt.title('HMD v2 Decay Curves')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.show()
```

## Performance Optimization

### Batch Strength Updates

```python
# Update strengths in batch during off-peak hours
om.batch_update_strengths(
    update_interval="1 hour",
    batch_size=1000
)
```

### Lazy Evaluation

```python
# Only calculate strength when needed
memory.strength  # Cached value
memory.current_strength  # Calculated on-demand
```

### Indexing Strategy

```sql
-- Database indexes for efficient strength queries
CREATE INDEX idx_memory_strength ON memories(strength DESC);
CREATE INDEX idx_memory_last_accessed ON memories(last_accessed DESC);
CREATE INDEX idx_memory_sector_strength ON memories(sector_id, strength DESC);
```

## Advanced Features

### Adaptive Decay

Automatically adjust decay rates based on usage patterns:

```python
om.enable_adaptive_decay(
    learn_from_patterns=True,
    adjustment_frequency="weekly"
)
```

### Context-Dependent Decay

Memories decay slower when related memories are accessed:

```python
om.configure_contextual_decay(
    enabled=True,
    context_window=7,  # days
    boost_factor=1.2
)
```

### Forgetting Curves

Implement Ebbinghaus forgetting curve:

```python
def ebbinghaus_decay(t, S0=1.0, k=1.84):
    """
    R = e^(-t/S)
    where S = (k / ln(t + 1))
    """
    S = k / math.log(t + 1)
    return S0 * math.exp(-t / S)
```

## Comparison with Alternatives

| Approach   | Pros                                        | Cons                   |
| ---------- | ------------------------------------------- | ---------------------- |
| **HMD v2** | Natural decay, reinforcement, context-aware | More complex           |
| **TTL**    | Simple, predictable                         | Binary (exists or not) |
| **LRU**    | Easy to implement                           | Ignores importance     |
| **LFU**    | Frequency-based                             | No decay over time     |

## Best Practices

1. **Set appropriate initial strength** (0.7-0.9 for most memories)
2. **Use reinforcement** for important memories
3. **Monitor weak memories** and archive when needed
4. **Adjust decay rates** based on memory type
5. **Run consolidation** regularly (daily or weekly)

## Next Steps

- Learn about [Waypoints & Graph](/docs/concepts/waypoints)
- Explore [Decay Algorithm](/docs/concepts/decay) visualization
- See [Reinforcement API](/docs/api/reinforce)
