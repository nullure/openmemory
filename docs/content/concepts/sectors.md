---
title: Memory Sectors
description: Organize memories into hierarchical, contextual groups like your brain naturally does
---

# Memory Sectors

Memory Sectors are OpenMemory's way of organizing memories into hierarchical, contextual groups - similar to how your brain organizes memories into categories and contexts.

## What are Memory Sectors?

A **Memory Sector** is a logical container that groups related memories together. Think of it as a folder, but with semantic relationships and automatic organization based on content similarity and access patterns.

### Key Characteristics

- **Hierarchical**: Sectors can contain sub-sectors
- **Semantic**: Automatically grouped by content similarity
- **Dynamic**: Grow and split as needed
- **Connected**: Cross-sector links via waypoints

## Architecture

```
Root Sector
├── Work
│   ├── Project A
│   │   ├── Technical Docs
│   │   └── Meeting Notes
│   └── Project B
├── Personal
│   ├── Health
│   └── Finance
└── Learning
    ├── AI/ML
    └── Programming
```

## How Sectors Work

### Automatic Sector Creation

When you add memories, OpenMemory automatically:

1. **Analyzes content** using embeddings
2. **Finds similar memories** in existing sectors
3. **Assigns to appropriate sector** or creates new one
4. **Updates sector metadata** with new topics

```python
from openmemory import OpenMemory

om = OpenMemory()

# Memory is automatically assigned to appropriate sector
om.add_memory(
    content="Python decorators are powerful for metaprogramming",
    auto_sector=True  # Default behavior
)
```

### Manual Sector Management

You can also explicitly manage sectors:

```python
# Create a specific sector
sector_id = om.create_sector(
    name="Python Learning",
    parent_sector="Learning/Programming"
)

# Add memory to specific sector
om.add_memory(
    content="List comprehensions are faster than loops",
    sector_id=sector_id
)

# Query within a sector
results = om.query(
    query="performance tips",
    sector_id=sector_id
)
```

## Sector Properties

### Metadata

Each sector maintains metadata:

```json
{
  "id": "sector_abc123",
  "name": "AI/ML Research",
  "parent": "Learning",
  "created_at": "2025-01-15T10:30:00Z",
  "memory_count": 247,
  "topics": ["neural networks", "transformers", "attention"],
  "last_accessed": "2025-01-20T14:22:00Z",
  "decay_multiplier": 0.95
}
```

### Decay Multiplier

Each sector has a decay multiplier that affects all memories within:

- **Active sectors** (frequently accessed): 0.90-0.95 (slower decay)
- **Normal sectors**: 0.95-0.98
- **Archived sectors**: 0.98-0.99 (faster decay)

```python
# Adjust sector decay rate
om.update_sector(
    sector_id="sector_abc123",
    decay_multiplier=0.90  # Preserve these memories longer
)
```

## Sector Operations

### List Sectors

```python
# Get all sectors
sectors = om.list_sectors()

for sector in sectors:
    print(f"{sector.name}: {sector.memory_count} memories")
```

### Sector Statistics

```python
# Get detailed sector stats
stats = om.get_sector_stats(sector_id)

print(f"Total memories: {stats.memory_count}")
print(f"Avg strength: {stats.avg_strength}")
print(f"Top topics: {stats.top_topics}")
print(f"Last access: {stats.last_accessed}")
```

### Move Memories

```python
# Move memory to different sector
om.move_memory(
    memory_id="mem_xyz789",
    target_sector="Work/Project B"
)

# Merge sectors
om.merge_sectors(
    source="Old Project",
    target="Archive"
)
```

### Delete Sectors

```python
# Soft delete (marks as archived)
om.archive_sector("Old Project")

# Hard delete (removes all memories)
om.delete_sector("Temporary", hard=True)
```

## Sector Strategies

### By Domain

Organize by knowledge domains:

```
Knowledge Base
├── Technical
│   ├── Backend
│   ├── Frontend
│   └── DevOps
├── Business
│   ├── Marketing
│   └── Sales
└── Operations
```

### By Time

Organize chronologically:

```
Timeline
├── 2025
│   ├── Q1
│   └── Q2
└── 2024
    └── Q4
```

### By Project

Organize by projects:

```
Projects
├── Active
│   ├── Website Redesign
│   └── API v2
├── Maintenance
└── Archived
```

### Hybrid Approach

Combine multiple strategies:

```
Root
├── Work
│   ├── 2025
│   │   └── Project A
│   └── Archive
└── Personal
    └── Health
        └── 2025
```

## Sector Linking

Sectors can be linked through waypoints, enabling cross-sector navigation:

```python
# Create link between sectors
om.link_sectors(
    source="Technical/API",
    target="Documentation/API",
    relationship="documented_by"
)

# Query with cross-sector navigation
results = om.query(
    query="authentication flow",
    start_sector="Technical/API",
    allow_cross_sector=True,
    max_hops=3
)
```

## Performance Considerations

### Sector Size

- **Optimal size**: 100-10,000 memories per sector
- **Too small**: Overhead from sector management
- **Too large**: Slower queries, less semantic coherence

### Sector Depth

- **Recommended depth**: 3-5 levels
- **Deeper hierarchies**: Slower navigation
- **Flatter hierarchies**: Less organization

### Auto-splitting

OpenMemory automatically splits large sectors:

```python
# Configure auto-split threshold
om.configure_sectors(
    max_memories_per_sector=5000,
    auto_split=True,
    split_strategy="semantic"  # or "balanced", "temporal"
)
```

## Best Practices

### 1. Start Simple

Begin with broad categories:

```python
om.create_sector("Work")
om.create_sector("Personal")
om.create_sector("Learning")
```

### 2. Let It Grow Organically

Allow auto-sector assignment to work:

```python
om.add_memory(content="...", auto_sector=True)
```

### 3. Review and Reorganize

Periodically review sector structure:

```python
# Get underutilized sectors
unused = om.list_sectors(min_memories=10, max_last_access_days=90)

# Merge or archive them
for sector in unused:
    om.archive_sector(sector.id)
```

### 4. Use Metadata

Tag sectors for better organization:

```python
om.update_sector(
    sector_id="project_a",
    metadata={
        "status": "active",
        "team": "engineering",
        "priority": "high"
    }
)
```

### 5. Monitor Performance

Track sector health:

```python
# Get slow sectors
slow_sectors = om.analyze_sectors(metric="query_time")

# Optimize large sectors
for sector in slow_sectors:
    if sector.memory_count > 10000:
        om.split_sector(sector.id)
```

## Advanced Features

### Sector Templates

Create reusable sector structures:

```python
# Define template
template = {
    "name": "Project Template",
    "children": ["Docs", "Code", "Meetings", "Research"]
}

# Apply template
om.create_from_template("New Project", template)
```

### Sector Permissions

Control access to sectors:

```python
om.set_sector_permissions(
    sector_id="confidential",
    read=["user_1", "user_2"],
    write=["user_1"]
)
```

### Sector Export

Export sector contents:

```python
# Export as JSON
om.export_sector("Work/Project A", format="json", file="project_a.json")

# Export as markdown
om.export_sector("Learning/AI", format="markdown", file="ai_notes.md")
```

## Next Steps

- Learn about [Waypoints & Graph](/docs/concepts/waypoints) for cross-sector navigation
- Understand [HMD v2 Specification](/docs/concepts/hmd-v2) for decay mechanics
- Explore [API Reference](/docs/api/add-memory) for sector operations
