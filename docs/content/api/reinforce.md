---
title: Reinforcement
description: Strengthen memories through explicit reinforcement signals
---

# Reinforcement

Strengthen memories through explicit reinforcement signals.

## Endpoint

```
POST /api/reinforce
```

## Request

```typescript
interface ReinforceRequest {
  memory_id: string;
  strength_boost?: number;
  feedback?: 'positive' | 'negative' | 'neutral';
  metadata?: Record<string, any>;
}
```

## Examples

### Basic Reinforcement

```python
om = OpenMemory()

# Strengthen a memory
om.reinforce_memory(
    memory_id="mem_abc123",
    strength_boost=0.2
)
```

### User Feedback

```python
# Positive feedback strengthens
om.reinforce_memory(
    memory_id="mem_xyz789",
    feedback="positive",
    metadata={"reason": "user_liked"}
)

# Negative feedback weakens
om.reinforce_memory(
    memory_id="mem_bad456",
    feedback="negative",
    strength_boost=-0.15
)
```

### Spaced Repetition

```python
# Implement spaced repetition
def schedule_review(memory):
    om.reinforce_memory(
        memory_id=memory.id,
        strength_boost=0.25,
        metadata={
            "review_count": memory.review_count + 1,
            "next_review": datetime.now() + timedelta(days=7)
        }
    )
```

See [HMD v2 Specification](/docs/concepts/hmd-v2) for decay mechanics and [Decay Algorithm](/docs/concepts/decay) for reinforcement strategies.
