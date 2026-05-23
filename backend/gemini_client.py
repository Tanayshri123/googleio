"""Thin wrapper around google-genai for grounded + structured calls.

Why a wrapper:
  Gemini grounding tools (google_search, google_maps) generally cannot be
  combined with response_schema in a single call. The standard pattern is
  two-step:
    1) Grounded call -> rich free-form text + citations
    2) Structuring call -> coerce that text into a typed Pydantic schema
"""
from __future__ import annotations

import asyncio
from typing import Any, Literal, Type, TypeVar

from google import genai
from google.genai import types
from pydantic import BaseModel

from backend.config import GEMINI_API_KEY, GEMINI_MODEL

T = TypeVar("T", bound=BaseModel)

GroundingTool = Literal["maps", "search", "none"]

_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set. Copy .env.example to .env and fill it in.")
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def _build_tool(grounding: GroundingTool) -> list[types.Tool] | None:
    if grounding == "search":
        return [types.Tool(google_search=types.GoogleSearch())]
    if grounding == "maps":
        # google-genai exposes Google Maps grounding via the same Tool wrapper.
        # If the SDK version on the machine doesn't have GoogleMaps yet,
        # we degrade to search so the skill still returns something usable.
        if hasattr(types, "GoogleMaps"):
            return [types.Tool(google_maps=types.GoogleMaps())]
        return [types.Tool(google_search=types.GoogleSearch())]
    return None


def _thinking_config(level: str) -> types.ThinkingConfig | None:
    # Gemini 2.5/3.5 "thinking" budget. Levels map to token budgets;
    # 0 disables, higher = more reasoning. SDK accepts an int budget.
    budgets = {"low": 512, "medium": 2048, "high": 8192}
    budget = budgets.get(level, 1024)
    try:
        return types.ThinkingConfig(thinking_budget=budget)
    except Exception:
        return None


async def generate_grounded_text(
    prompt: str,
    grounding: GroundingTool,
    thinking: str = "medium",
) -> tuple[str, list[dict[str, Any]]]:
    """Run a grounded call and return (text, citations).

    Citations are extracted from the grounding metadata when available.
    """
    client = get_client()
    tools = _build_tool(grounding)
    config = types.GenerateContentConfig(
        tools=tools,
        thinking_config=_thinking_config(thinking),
    )

    response = await asyncio.to_thread(
        client.models.generate_content,
        model=GEMINI_MODEL,
        contents=prompt,
        config=config,
    )

    text = (response.text or "").strip()
    citations: list[dict[str, Any]] = []
    try:
        for cand in response.candidates or []:
            meta = getattr(cand, "grounding_metadata", None)
            if not meta:
                continue
            for chunk in getattr(meta, "grounding_chunks", []) or []:
                web = getattr(chunk, "web", None)
                if web:
                    citations.append({"title": getattr(web, "title", ""), "uri": getattr(web, "uri", "")})
                maps_ref = getattr(chunk, "maps", None)
                if maps_ref:
                    citations.append({"title": getattr(maps_ref, "title", ""), "uri": getattr(maps_ref, "uri", "")})
    except Exception:
        pass

    return text, citations


async def structure_text(
    raw_text: str,
    schema: Type[T],
    instructions: str,
    thinking: str = "low",
) -> T:
    """Convert raw grounded text into a typed Pydantic instance."""
    client = get_client()
    prompt = (
        f"{instructions}\n\n"
        f"Source material to extract from:\n---\n{raw_text}\n---\n\n"
        f"Return a JSON object matching the requested schema exactly. "
        f"If a field has no good answer, return an empty list or empty string."
    )
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema,
        thinking_config=_thinking_config(thinking),
    )
    response = await asyncio.to_thread(
        client.models.generate_content,
        model=GEMINI_MODEL,
        contents=prompt,
        config=config,
    )

    # SDK returns a parsed instance on response.parsed when response_schema is set
    parsed = getattr(response, "parsed", None)
    if parsed is not None:
        return parsed  # type: ignore[return-value]
    # Fallback: parse JSON manually
    import json
    return schema.model_validate(json.loads(response.text or "{}"))


async def generate_grounded_then_structured(
    research_prompt: str,
    structuring_instructions: str,
    schema: Type[T],
    grounding: GroundingTool,
    thinking: str = "medium",
) -> tuple[T, list[dict[str, Any]]]:
    """Two-step workhorse: grounded research -> structured schema."""
    raw_text, citations = await generate_grounded_text(
        prompt=research_prompt,
        grounding=grounding,
        thinking=thinking,
    )
    parsed = await structure_text(
        raw_text=raw_text,
        schema=schema,
        instructions=structuring_instructions,
        thinking="low",
    )
    return parsed, citations
