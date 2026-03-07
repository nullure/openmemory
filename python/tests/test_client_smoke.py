from __future__ import annotations

import json
import threading
import unittest
from dataclasses import dataclass, field
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, List
from urllib.parse import parse_qs, urlparse

import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from openmemory_py.client import OpenMemoryClient


def iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


@dataclass
class ServerState:
    memory_nodes: List[Dict[str, Any]] = field(default_factory=list)
    beliefs: List[Dict[str, Any]] = field(default_factory=list)
    next_id: int = 1

    def ingest(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        memory_node_id = f"memory-{self.next_id}"
        self.next_id += 1
        text = str(payload["memory_text"])
        user_id = str(payload["user_id"])
        sectors = ["semantic", "episodic"]
        node = {
            "id": memory_node_id,
            "user_id": user_id,
            "text": text,
            "sectors": sectors,
            "timestamp_ms": int(payload.get("timestamp_ms") or 1_700_000_000_000),
        }
        self.memory_nodes.append(node)

        lower = text.lower()
        if lower.startswith("my name is "):
            name = text[len("My name is ") :].strip().rstrip(".")
            now = iso_now()
            self.beliefs.append(
                {
                    "id": f"belief-{memory_node_id}",
                    "user_id": user_id,
                    "sector": "semantic",
                    "source_memory_node_id": memory_node_id,
                    "source_sector": "semantic",
                    "embedding": [],
                    "weight": 1.0,
                    "timestamps": {"created_at": now, "updated_at": now},
                    "valid_from": now,
                    "valid_to": None,
                    "subject": "user",
                    "predicate": "name",
                    "object": name,
                }
            )

        return {
            "sector": "semantic",
            "novelty": 0.2,
            "action": "create_anchor",
            "anchor_id": f"anchor-semantic-{memory_node_id}",
            "memory_node_id": memory_node_id,
            "sectors": sectors,
        }

    def recall(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        query = str(payload["query"])
        user_id = str(payload["user_id"])
        mode = payload.get("mode") or "fast"
        token_budget = int(payload.get("token_budget") or 1024)

        ranked = [node for node in self.memory_nodes if node["user_id"] == user_id]
        ranked.sort(key=lambda node: 1 if "tallest" in node["text"].lower() else 0, reverse=True)

        memories = []
        waypoint_trace = []
        for idx, node in enumerate(ranked[:2]):
            if idx == 0:
                trace = [{"source": "vector", "sector": "semantic", "similarity": 0.93}]
            else:
                trace = [
                    {
                        "source": "waypoint",
                        "sector": "episodic",
                        "via_memory_node_id": ranked[0]["id"],
                        "waypoint_relation": "shared_entity",
                    }
                ]
                waypoint_trace.append(
                    {
                        "from_memory_node_id": ranked[0]["id"],
                        "to_memory_node_id": node["id"],
                        "edge_weight": 0.61,
                        "relation": "shared_entity",
                    }
                )

            memories.append(
                {
                    "memory_node_id": node["id"],
                    "text": node["text"],
                    "sectors": node["sectors"],
                    "score": 0.93 - (idx * 0.1),
                    "trace": trace,
                }
            )

        sectors_used = [
            {"sector": "semantic", "score": 0.9, "prob": 0.7},
            {"sector": "episodic", "score": 0.4, "prob": 0.3},
        ]

        active_beliefs = [belief for belief in self.beliefs if belief["user_id"] == user_id]
        return {
            "query": query,
            "sectors_used": sectors_used,
            "memories": memories,
            "active_beliefs": active_beliefs,
            "waypoint_trace": waypoint_trace,
            "mode": mode,
            "token_budget": token_budget,
        }

    def get_active_beliefs(self, user_id: str) -> List[Dict[str, Any]]:
        return [belief for belief in self.beliefs if belief["user_id"] == user_id]


class SmokeHandler(BaseHTTPRequestHandler):
    state = ServerState()

    def _write_json(self, status: int, payload: Any) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        length = int(self.headers.get("content-length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        payload = json.loads(raw or "{}")

        if parsed.path == "/ingest":
            self._write_json(200, self.state.ingest(payload))
            return
        if parsed.path == "/recall":
            self._write_json(200, self.state.recall(payload))
            return
        self._write_json(404, {"error": "not found"})

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/beliefs/active":
            self._write_json(404, {"error": "not found"})
            return

        params = parse_qs(parsed.query)
        user_id = (params.get("user_id") or [""])[0]
        if not user_id:
            self._write_json(400, {"error": "missing user_id"})
            return
        self._write_json(200, self.state.get_active_beliefs(user_id))

    def log_message(self, format: str, *args: Any) -> None:
        return


class ClientSmokeTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        SmokeHandler.state = ServerState()
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), SmokeHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        host, port = cls.server.server_address
        cls.base_url = f"http://{host}:{port}"

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def test_sdk_smoke_round_trip(self) -> None:
        client = OpenMemoryClient(self.base_url)
        ingest_one = client.ingest_memory(
            {
                "user_id": "sdk-user",
                "memory_text": "Mount Everest is the tallest mountain.",
                "timestamp_ms": 1_700_000_000_000,
            }
        )
        self.assertIn("memory_node_id", ingest_one)

        client.ingest_memory(
            {
                "user_id": "sdk-user",
                "memory_text": "My name is Demon.",
                "timestamp_ms": 1_700_000_000_010,
            }
        )

        packet = client.recall_memory(
            {
                "user_id": "sdk-user",
                "query": "What mountain is tallest?",
                "mode": "deep",
                "token_budget": 1024,
            }
        )
        self.assertEqual(packet["query"], "What mountain is tallest?")
        self.assertEqual(packet["mode"], "deep")
        self.assertEqual(packet["token_budget"], 1024)
        self.assertIsInstance(packet["sectors_used"], list)
        self.assertIsInstance(packet["memories"], list)
        self.assertIsInstance(packet["active_beliefs"], list)
        self.assertIsInstance(packet["waypoint_trace"], list)
        self.assertGreaterEqual(len(packet["memories"]), 1)

        beliefs = client.get_active_beliefs("sdk-user")
        self.assertGreaterEqual(len(beliefs), 1)
        self.assertTrue(any("source_memory_node_id" in belief for belief in beliefs))


if __name__ == "__main__":
    unittest.main()
