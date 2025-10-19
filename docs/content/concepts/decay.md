---
title: Decay Algorithm
description: Visualize and understand how OpenMemory's HMD v2 decay algorithm works in practice
---

# Decay Algorithm

Visualize and understand how OpenMemory's HMD v2 decay algorithm works in practice.

## Interactive Decay Visualization

The decay visualization on the homepage shows real-time memory strength decay over a 30-day period using different decay rates.

### Understanding the Curves

```
Strength (0-1.0)
     │
1.0  ├─────┐
     │      ╲___
0.8  │          ╲___
     │              ╲___  Critical (0.99)
0.6  │                  ╲___
     │              Important (0.97) ╲___
0.4  │          Regular (0.95)           ╲___
     │      Ephemeral (0.90) ╲___            ╲___
0.2  │                            ╲___            ╲___
     │                                ╲___            ╲___
0.0  └───────────────────────────────────────────────────
     0    5    10   15   20   25   30   35   40   45   50
                         Days
```

## Decay Rate Impact

### Half-Life Calculation

The **half-life** is the time it takes for memory strength to decay to 50%:

```
t_half = ln(0.5) / ln(decay_rate)
```

| Decay Rate | Half-Life | Use Case                              |
| ---------- | --------- | ------------------------------------- |
| 0.99       | ~69 days  | System critical, permanent knowledge  |
| 0.97       | ~23 days  | Important context, user preferences   |
| 0.95       | ~14 days  | Regular memories, general information |
| 0.90       | ~7 days   | Session data, temporary context       |
| 0.85       | ~4.5 days | Ephemeral, cache-like behavior        |

### Mathematical Derivation

Starting from the decay formula:

```
S(t) = S₀ × (decay_rate)^t
```

When `S(t) = 0.5 × S₀` (half strength):

```
0.5 × S₀ = S₀ × (decay_rate)^t
0.5 = (decay_rate)^t
ln(0.5) = t × ln(decay_rate)
t = ln(0.5) / ln(decay_rate)
```

## Practical Examples

### Example 1: User Preference

```python
# User sets dark mode preference
preference = om.add_memory(
    content="User prefers dark mode interface",
    decay_rate=0.97,  # Retain for ~23 days
    initial_strength=0.9
)

# Track strength over time
day_1 = 0.9 * (0.97 ** 1) = 0.873
day_7 = 0.9 * (0.97 ** 7) = 0.742
day_14 = 0.9 * (0.97 ** 14) = 0.630
day_30 = 0.9 * (0.97 ** 30) = 0.369
```

After 30 days without access, the preference is weakening but still retrievable.

### Example 2: Learning Material

```python
# User studies Python decorators
memory = om.add_memory(
    content="@property decorator creates managed attributes",
    decay_rate=0.95,  # Standard learning material
    initial_strength=0.8
)

# With regular review (every 5 days)
# Day 0: strength = 0.8
# Day 5: strength = 0.8 * 0.95^5 = 0.622 → REVIEWED → reinforced to 0.8
# Day 10: strength = 0.8 * 0.95^5 = 0.622 → REVIEWED → reinforced to 0.8
# Day 15: strength = 0.8 * 0.95^5 = 0.622 → REVIEWED → reinforced to 0.8
# Result: Maintained through spaced repetition
```

### Example 3: Session Context

```python
# Temporary conversation context
context = om.add_memory(
    content="User is debugging authentication flow",
    decay_rate=0.90,  # Fast decay
    initial_strength=0.7
)

# Strength over hours
hour_0 = 0.7
hour_6 = 0.7 * (0.90 ** 0.25) = 0.682  # (6 hours = 0.25 days)
hour_12 = 0.7 * (0.90 ** 0.5) = 0.664
hour_24 = 0.7 * (0.90 ** 1) = 0.630
day_3 = 0.7 * (0.90 ** 3) = 0.510
day_7 = 0.7 * (0.90 ** 7) = 0.338
```

Context quickly fades when not accessed.

## Reinforcement Effects

### Single Reinforcement

```python
# Initial strength: 0.5
# After 10 days: 0.5 * 0.95^10 = 0.299

# User reinforces memory
om.reinforce_memory("mem_123", boost=0.2)
# New strength: 0.299 + 0.2 = 0.499

# After another 10 days: 0.499 * 0.95^10 = 0.298
```

### Repeated Reinforcement

```python
def reinforce_formula(current_strength, alpha=0.15):
    """Asymptotic reinforcement"""
    return min(1.0, current_strength + alpha * (1 - current_strength))

# Starting at 0.3
reinforcement_1 = 0.3 + 0.15 * (1 - 0.3) = 0.405
reinforcement_2 = 0.405 + 0.15 * (1 - 0.405) = 0.494
reinforcement_3 = 0.494 + 0.15 * (1 - 0.494) = 0.570
reinforcement_4 = 0.570 + 0.15 * (1 - 0.570) = 0.635
```

Repeated reinforcement gradually strengthens memory towards 1.0.

## Access Patterns

### Access Multiplier

Each memory access increases a multiplier:

```python
access_multiplier = 1 + (0.3 * log(1 + access_count))

# Access history
access_0 = 1 + 0.3 * log(1) = 1.000
access_1 = 1 + 0.3 * log(2) = 1.208
access_5 = 1 + 0.3 * log(6) = 1.538
access_10 = 1 + 0.3 * log(11) = 1.719
access_50 = 1 + 0.3 * log(51) = 2.175
```

Frequently accessed memories decay slower.

### Combined Effect

```python
# Memory with decay_rate=0.95, access_count=10
base_strength = 0.8
days_elapsed = 14
access_mult = 1 + 0.3 * log(11) = 1.719

# Without access multiplier
strength_no_access = 0.8 * (0.95 ** 14) = 0.399

# With access multiplier
strength_with_access = 0.399 * 1.719 = 0.686
```

The memory retains 72% more strength due to repeated access!

## Contextual Decay

### Related Memory Boost

When related memories are accessed, strength gets a boost:

```python
def contextual_strength(base_strength, related_access_count, beta=0.2):
    context_boost = 1 + (beta * log(1 + related_access_count))
    return base_strength * context_boost

# Memory A (related to recently accessed memories)
base = 0.4
related_accesses = 5
boosted = 0.4 * (1 + 0.2 * log(6)) = 0.514
```

### Sector Decay Multiplier

Memories in active sectors decay slower:

```python
# Active sector: multiplier = 0.95
# Normal sector: multiplier = 1.00
# Archived sector: multiplier = 1.05

# Memory in active sector
strength_active = 0.6 * ((0.95 * 0.95) ** 14) = 0.272

# Same memory in normal sector
strength_normal = 0.6 * (0.95 ** 14) = 0.299

# Same memory in archived sector
strength_archived = 0.6 * ((0.95 * 1.05) ** 14) = 0.329
```

## Optimization Strategies

### Adaptive Decay Rates

Automatically adjust decay rates based on usage:

```python
def adjust_decay_rate(memory):
    """Adjust decay rate based on access patterns"""

    if memory.access_count > 50:
        # Frequently accessed → slow decay
        return min(0.99, memory.decay_rate + 0.01)

    elif memory.access_count < 5 and memory.age_days > 30:
        # Rarely accessed and old → fast decay
        return max(0.90, memory.decay_rate - 0.02)

    elif memory.reinforcement_count > 10:
        # Explicitly reinforced → preserve
        return min(0.98, memory.decay_rate + 0.01)

    return memory.decay_rate
```

### Batch Updates

```python
# Update strengths in batch
om.batch_update_strengths(
    batch_size=1000,
    parallel=True,
    threshold=0.1  # Only update if change > 10%
)
```

### Decay Schedule

```python
# Different update frequencies
CRITICAL_MEMORIES = 'hourly'   # Real-time accuracy
ACTIVE_MEMORIES = 'daily'      # Balance accuracy/performance
ARCHIVED_MEMORIES = 'weekly'   # Minimal overhead
```

## Monitoring Decay

### Strength Distribution

```python
# Get strength histogram
distribution = om.get_strength_distribution(bins=10)

print("Strength Distribution:")
for bin in distribution:
    print(f"{bin.range}: {'█' * int(bin.count / 10)} ({bin.count})")

# Output:
# 0.9-1.0: ████ (42)
# 0.8-0.9: ████████ (83)
# 0.7-0.8: ███████████ (115)
# 0.6-0.7: █████████████ (134)
# 0.5-0.6: ██████████ (102)
# 0.4-0.5: ███████ (68)
# 0.3-0.4: ████ (45)
# 0.2-0.3: ██ (23)
# 0.1-0.2: █ (12)
# 0.0-0.1: █ (8)
```

### Weak Memory Detection

```python
# Find memories approaching archival threshold
weak_memories = om.find_memories(
    max_strength=0.15,
    min_age_days=7,
    order_by='strength_asc'
)

print(f"Found {len(weak_memories)} weak memories")

for mem in weak_memories:
    print(f"ID: {mem.id}, Strength: {mem.strength:.3f}, Age: {mem.age_days} days")
```

### Decay Analytics

```python
# Analyze decay trends
analytics = om.analyze_decay_trends(period='30d')

print(f"Average decay rate: {analytics.avg_decay_rate:.3f}")
print(f"Memories archived: {analytics.archived_count}")
print(f"Memories reinforced: {analytics.reinforced_count}")
print(f"Avg strength change: {analytics.avg_strength_delta:.3f}")
```

## Simulation Tools

### Decay Simulator

```python
# Simulate decay over time
simulation = om.simulate_decay(
    memory_id="mem_123",
    days=60,
    reinforcements=[7, 14, 28],  # Days to reinforce
    access_schedule='weekly'
)

simulation.plot()  # Visualize decay curve with interventions
```

### A/B Testing Decay Rates

```python
# Test different decay rates
results = om.test_decay_strategies(
    strategies={
        'aggressive': 0.90,
        'moderate': 0.95,
        'conservative': 0.98
    },
    duration_days=30,
    sample_size=1000
)

results.compare()  # Show retention vs. storage cost tradeoff
```

## Best Practices

1. **Match decay rate to content type**

   - System knowledge: 0.99
   - User data: 0.97
   - Session context: 0.90

2. **Use reinforcement strategically**

   - Explicit user feedback
   - Spaced repetition schedules
   - Query-time implicit reinforcement

3. **Monitor and adjust**

   - Track strength distributions
   - Archive weak memories
   - Adjust rates based on usage

4. **Consider context**

   - Active sectors need slower decay
   - Related memories boost each other
   - Access patterns matter

5. **Optimize performance**
   - Batch strength updates
   - Cache calculated strengths
   - Index by strength for fast queries

## Next Steps

- Understand [HMD v2 Specification](/docs/concepts/hmd-v2) in depth
- Learn about [Reinforcement API](/docs/api/reinforce)
- Explore [Advanced Configuration](/docs/advanced/chunking)
