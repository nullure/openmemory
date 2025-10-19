---
title: Waypoints & Graph
description: Navigate through related memories with multi-hop retrieval like traversing a knowledge graph
---

# Waypoints & Graph

Waypoints are OpenMemory's solution to multi-hop memory retrieval, enabling navigation through related memories like traversing a knowledge graph.

## What are Waypoints?

A **Waypoint** is a special node in the memory graph that serves as a connection point between related memories, enabling multi-hop traversal and contextual discovery.

Think of waypoints as:

- 🚏 **Bus stops** connecting different routes
- 🔗 **Hyperlinks** between related concepts
- 🌉 **Bridges** between memory sectors
- 🗺️ **Landmarks** in your knowledge landscape

## Graph Structure

### Memory Graph Anatomy

```
Memory A ────waypoint───→ Memory B
    ↓                         ↓
    └─────waypoint───────────┘
                ↓
            Memory C
```

### Node Types

1. **Memory Nodes**: Actual content/memories
2. **Waypoint Nodes**: Connection facilitators
3. **Sector Nodes**: Hierarchical containers
4. **Concept Nodes**: Abstract topic representations

### Edge Types

```typescript
type EdgeType =
  | 'semantic' // Similar meaning
  | 'temporal' // Time-based sequence
  | 'causal' // Cause-effect relationship
  | 'reference' // Direct citation
  | 'elaboration' // Expands on concept
  | 'contradiction'; // Conflicting information
```

## How Waypoints Work

### Automatic Waypoint Creation

When you add memories, OpenMemory automatically creates waypoints:

```python
from openmemory import OpenMemory

om = OpenMemory()

# Add related memories
mem1 = om.add_memory("Python supports multiple inheritance")
mem2 = om.add_memory("Multiple inheritance can lead to the diamond problem")
mem3 = om.add_memory("Python uses C3 linearization to resolve MRO")

# Waypoints automatically created:
# mem1 ←→ mem2 (semantic similarity)
# mem2 ←→ mem3 (elaboration relationship)
```

### Manual Waypoint Creation

Create explicit connections:

```python
# Link two memories
om.create_waypoint(
    source_id=mem1,
    target_id=mem2,
    relationship='causal',
    strength=0.9,
    metadata={'note': 'Design pattern consequence'}
)
```

## Multi-Hop Retrieval

### Basic Multi-Hop Query

```python
# Query with multi-hop enabled
results = om.query(
    query="inheritance problems in Python",
    max_hops=3,
    min_path_strength=0.6
)

for result in results:
    print(f"Content: {result.content}")
    print(f"Distance: {result.hops} hops")
    print(f"Path: {' → '.join(result.path)}")
    print(f"Score: {result.score}")
    print("---")
```

### Advanced Path Finding

```python
# Find all paths between two memories
paths = om.find_paths(
    start_memory="mem_abc",
    end_memory="mem_xyz",
    max_depth=5,
    algorithm='dijkstra'  # or 'bfs', 'dfs', 'a_star'
)

for path in paths:
    print(f"Path strength: {path.total_strength}")
    print(f"Nodes: {' → '.join(path.nodes)}")
```

## Graph Algorithms

### Shortest Path

Find the most direct connection:

```python
path = om.shortest_path(
    start="Python basics",
    end="Advanced metaprogramming",
    weight='semantic'  # or 'temporal', 'access_count'
)
```

### Graph Traversal

Explore related memories:

```python
# Breadth-first traversal
related = om.traverse(
    start_memory="mem_123",
    strategy='bfs',
    max_depth=3,
    filter_by={'sector': 'Programming'}
)

# Depth-first traversal
deep_dive = om.traverse(
    start_memory="mem_123",
    strategy='dfs',
    max_depth=5,
    stop_condition=lambda node: node.strength < 0.3
)
```

### Community Detection

Find clusters of related memories:

```python
# Detect memory communities
communities = om.detect_communities(
    algorithm='louvain',  # or 'label_propagation', 'girvan_newman'
    min_community_size=5
)

for community in communities:
    print(f"Community: {community.name}")
    print(f"Size: {len(community.members)}")
    print(f"Topics: {community.top_topics}")
```

## Waypoint Strategies

### Semantic Waypoints

Based on content similarity:

```python
om.create_semantic_waypoints(
    threshold=0.75,  # Cosine similarity
    max_connections_per_memory=10
)
```

### Temporal Waypoints

Based on time relationships:

```python
om.create_temporal_waypoints(
    strategy='sequential',  # Connect memories in order
    time_window=timedelta(hours=24)
)
```

### Hierarchical Waypoints

Based on sector structure:

```python
om.create_hierarchical_waypoints(
    connect_siblings=True,
    connect_parent_child=True,
    connect_cousins=False
)
```

### User-Defined Waypoints

Custom relationship types:

```python
om.create_waypoint(
    source="Project A requirements",
    target="Project A implementation",
    relationship='implements',
    bidirectional=False
)
```

## Graph Operations

### Waypoint Management

```python
# List waypoints for a memory
waypoints = om.get_waypoints(memory_id="mem_123")

# Update waypoint strength
om.update_waypoint(
    waypoint_id="wp_456",
    strength=0.95
)

# Remove weak waypoints
om.prune_waypoints(min_strength=0.3)

# Rebuild waypoint graph
om.rebuild_waypoints()
```

### Graph Analytics

```python
# Get graph statistics
stats = om.graph_stats()
print(f"Total nodes: {stats.node_count}")
print(f"Total edges: {stats.edge_count}")
print(f"Average degree: {stats.avg_degree}")
print(f"Clustering coefficient: {stats.clustering}")
print(f"Graph density: {stats.density}")

# Find central memories (PageRank)
central = om.find_central_memories(algorithm='pagerank', limit=10)

# Find bridge memories (connecting different sectors)
bridges = om.find_bridge_memories()
```

### Subgraph Extraction

```python
# Extract subgraph around a memory
subgraph = om.extract_subgraph(
    center="mem_123",
    radius=2,
    include_waypoints=True
)

# Export subgraph
om.export_subgraph(
    subgraph,
    format='graphml',  # or 'json', 'dot'
    file='knowledge_graph.graphml'
)
```

## Visualization

### Graph Visualization

```python
# Visualize memory graph
om.visualize_graph(
    center_memory="mem_123",
    depth=3,
    layout='force_directed',  # or 'hierarchical', 'circular'
    node_size_by='strength',
    edge_width_by='relationship_strength',
    color_by='sector',
    save_to='memory_graph.html'
)
```

### Path Visualization

```python
# Visualize specific path
om.visualize_path(
    start="Python basics",
    end="Metaclasses",
    highlight_waypoints=True,
    show_metadata=True
)
```

## Performance Optimization

### Index Strategies

```sql
-- Graph indexes for fast traversal
CREATE INDEX idx_waypoints_source ON waypoints(source_id);
CREATE INDEX idx_waypoints_target ON waypoints(target_id);
CREATE INDEX idx_waypoints_strength ON waypoints(strength DESC);
CREATE INDEX idx_waypoints_type ON waypoints(relationship_type);

-- Composite index for path finding
CREATE INDEX idx_waypoints_composite
ON waypoints(source_id, target_id, strength DESC);
```

### Caching

```python
# Enable graph caching
om.configure_graph_cache(
    enabled=True,
    cache_size=1000,  # Most accessed paths
    ttl=3600  # 1 hour
)
```

### Lazy Loading

```python
# Load waypoints on-demand
memory = om.get_memory("mem_123", load_waypoints=False)

# Load waypoints when needed
waypoints = memory.get_waypoints()  # Lazy loaded
```

## Advanced Features

### Dynamic Waypoint Strength

Waypoints strengthen/weaken based on usage:

```python
om.enable_dynamic_waypoints(
    strengthen_on_traversal=True,
    weaken_unused=True,
    update_interval='daily'
)
```

### Semantic Zoom

Navigate between abstraction levels:

```python
# Zoom out to see high-level concepts
overview = om.semantic_zoom(
    center="Python decorators",
    level='concepts'
)

# Zoom in to see specific details
details = om.semantic_zoom(
    center="Python decorators",
    level='examples'
)
```

### Temporal Graph

Track how connections evolve:

```python
# Query graph at specific time
historical_graph = om.get_graph_snapshot(
    timestamp=datetime(2025, 1, 1)
)

# Animate graph evolution
om.animate_graph_evolution(
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2025, 1, 1),
    interval='monthly',
    save_to='graph_evolution.mp4'
)
```

### Probabilistic Paths

Find likely exploration paths:

```python
# Random walk from a memory
walk = om.random_walk(
    start="mem_123",
    steps=10,
    bias='strength'  # Prefer stronger connections
)

# Monte Carlo path sampling
probable_paths = om.sample_paths(
    start="mem_123",
    end="mem_456",
    samples=1000,
    strategy='metropolis_hastings'
)
```

## Use Cases

### Knowledge Discovery

```python
# Find unexpected connections
surprising = om.find_surprising_connections(
    start="Machine Learning",
    min_path_length=3,
    max_semantic_similarity=0.5  # Different but connected
)
```

### Learning Paths

```python
# Generate learning curriculum
curriculum = om.generate_learning_path(
    start_topic="Python basics",
    end_topic="Advanced async programming",
    optimize_for='shortest',  # or 'comprehensive', 'beginner_friendly'
)
```

### Research Assistance

```python
# Find related research
related = om.find_related_research(
    paper_id="mem_paper_123",
    include_citations=True,
    max_hops=4,
    semantic_threshold=0.6
)
```

### Explanation Generation

```python
# Generate explanation path
explanation = om.explain_connection(
    start="REST APIs",
    end="GraphQL",
    style='narrative'  # or 'bullet_points', 'technical'
)
```

## Best Practices

1. **Create meaningful waypoints**: Not every memory needs to connect to every other
2. **Use appropriate edge types**: Semantic vs. temporal vs. causal relationships
3. **Prune weak connections**: Remove waypoints below threshold strength
4. **Balance breadth and depth**: Don't over-connect or under-connect
5. **Monitor graph health**: Check for disconnected components and bottlenecks

## Next Steps

- Explore [Decay Algorithm](/docs/concepts/decay) for waypoint strength
- See [Query API](/docs/api/query) for multi-hop queries
- Learn about [Memory Sectors](/docs/concepts/sectors) for graph organization
