from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional, TypedDict

SectorId = Literal["episodic", "semantic", "procedural", "emotional", "reflective"]
RecallMode = Literal["fast", "deep"]


class SectorPrediction(TypedDict):
    sector: SectorId
    score: float
    prob: float


class ContextTrace(TypedDict, total=False):
    source: Literal["vector", "waypoint"]
    sector: SectorId
    similarity: float
    via_memory_node_id: str
    waypoint_relation: str


class ContextMemory(TypedDict):
    memory_node_id: str
    text: str
    sectors: List[SectorId]
    score: float
    trace: List[ContextTrace]


class WaypointTrace(TypedDict, total=False):
    from_memory_node_id: str
    to_memory_node_id: str
    edge_weight: float
    relation: str


class BeliefTimestamps(TypedDict):
    created_at: str
    updated_at: str


class Belief(TypedDict):
    id: str
    user_id: str
    sector: SectorId
    source_memory_node_id: str
    source_sector: SectorId
    embedding: List[float]
    weight: float
    timestamps: BeliefTimestamps
    valid_from: str
    valid_to: Optional[str]


class HMDRecallPacket(TypedDict):
    query: str
    sectors_used: List[SectorPrediction]
    memories: List[ContextMemory]
    active_beliefs: List[Belief]
    waypoint_trace: List[WaypointTrace]


class RecallMemoryResponse(HMDRecallPacket):
    mode: RecallMode
    token_budget: int


class _IngestRequired(TypedDict):
    user_id: str
    memory_text: str


class IngestMemoryRequest(_IngestRequired, total=False):
    timestamp_ms: int
    metadata: Dict[str, Any]


class _RecallRequired(TypedDict):
    user_id: str
    query: str


class RecallMemoryRequest(_RecallRequired, total=False):
    mode: RecallMode
    token_budget: int
