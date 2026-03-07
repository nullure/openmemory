from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict, List, Mapping, Optional, cast
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .types import Belief, IngestMemoryRequest, RecallMemoryRequest, RecallMemoryResponse


class OpenMemoryClientError(RuntimeError):
    pass


@dataclass(frozen=True)
class EndpointPaths:
    ingest: str = "/ingest"
    recall: str = "/recall"
    active_beliefs: str = "/beliefs/active"


def _normalize_base_url(base_url: str) -> str:
    trimmed = base_url.strip()
    if not trimmed:
        raise ValueError("invalid base_url: expected non-empty URL")
    return trimmed[:-1] if trimmed.endswith("/") else trimmed


class OpenMemoryClient:
    def __init__(
        self,
        base_url: str,
        *,
        headers: Optional[Mapping[str, str]] = None,
        timeout_s: float = 30.0,
        endpoints: Optional[EndpointPaths] = None,
    ) -> None:
        self._base_url = _normalize_base_url(base_url)
        self._headers = dict(headers or {})
        self._timeout_s = timeout_s
        self._endpoints = endpoints or EndpointPaths()

    def _endpoint(self, path: str) -> str:
        normalized = path if path.startswith("/") else f"/{path}"
        return f"{self._base_url}{normalized}"

    def _request_json(
        self,
        method: str,
        path: str,
        *,
        payload: Optional[Dict[str, Any]] = None,
        query: Optional[Dict[str, Any]] = None,
    ) -> Any:
        url = self._endpoint(path)
        if query:
            compact_query = {k: v for k, v in query.items() if v is not None}
            if compact_query:
                url = f"{url}?{urlencode(compact_query)}"

        body: Optional[bytes] = None
        req_headers = dict(self._headers)
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")
            req_headers["content-type"] = "application/json"

        request = Request(url=url, method=method, headers=req_headers, data=body)
        try:
            with urlopen(request, timeout=self._timeout_s) as response:
                raw = response.read().decode("utf-8").strip()
                if not raw:
                    return None
                return json.loads(raw)
        except HTTPError as exc:
            detail = ""
            try:
                raw = exc.read().decode("utf-8").strip()
                if raw:
                    parsed = json.loads(raw)
                    if isinstance(parsed, dict) and "error" in parsed:
                        detail = str(parsed["error"])
                    else:
                        detail = raw
            except Exception:
                detail = exc.reason if isinstance(exc.reason, str) else str(exc.reason)
            message = detail or f"request failed with status {exc.code}"
            raise OpenMemoryClientError(message) from exc
        except URLError as exc:
            raise OpenMemoryClientError(f"network error: {exc.reason}") from exc
        except json.JSONDecodeError as exc:
            raise OpenMemoryClientError("invalid JSON response") from exc

    @staticmethod
    def _assert_hmd_packet(payload: Any) -> None:
        if not isinstance(payload, dict):
            raise OpenMemoryClientError("invalid recall response: expected object")
        required_array_fields = (
            "sectors_used",
            "memories",
            "active_beliefs",
            "waypoint_trace",
        )
        if not isinstance(payload.get("query"), str):
            raise OpenMemoryClientError("invalid recall response: missing query")
        for field in required_array_fields:
            if not isinstance(payload.get(field), list):
                raise OpenMemoryClientError(f"invalid recall response: {field} must be array")

    def ingest_memory(self, request: IngestMemoryRequest) -> Dict[str, Any]:
        return cast(
            Dict[str, Any],
            self._request_json("POST", self._endpoints.ingest, payload=cast(Dict[str, Any], request)),
        )

    def recall_memory(self, request: RecallMemoryRequest) -> RecallMemoryResponse:
        response = self._request_json("POST", self._endpoints.recall, payload=cast(Dict[str, Any], request))
        self._assert_hmd_packet(response)
        return cast(RecallMemoryResponse, response)

    def get_active_beliefs(self, user_id: str, timestamp_ms: Optional[int] = None) -> List[Belief]:
        response = self._request_json(
            "GET",
            self._endpoints.active_beliefs,
            query={"user_id": user_id, "timestamp_ms": timestamp_ms},
        )
        if not isinstance(response, list):
            raise OpenMemoryClientError("invalid active beliefs response: expected array")
        return cast(List[Belief], response)
