"""Tiny in-memory session store with TTL.

Sessions hold the running BattlePlan generation state so the frontend can poll
GET /api/scout/{session_id} for progress.
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Literal, Optional

from backend.config import SESSION_TTL_SECONDS

SessionStatus = Literal["running", "done", "error"]


@dataclass
class Session:
    id: str
    status: SessionStatus = "running"
    progress: list[str] = field(default_factory=list)
    result: Optional[dict[str, Any]] = None
    error: Optional[str] = None
    target_country: str = ""
    chat_history: list[dict[str, str]] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)


_store: dict[str, Session] = {}


def new_session() -> Session:
    sid = uuid.uuid4().hex[:12]
    s = Session(id=sid)
    _store[sid] = s
    return s


def get(sid: str) -> Optional[Session]:
    _gc()
    return _store.get(sid)


def _gc() -> None:
    cutoff = time.time() - SESSION_TTL_SECONDS
    stale = [k for k, v in _store.items() if v.created_at < cutoff]
    for k in stale:
        _store.pop(k, None)
