"""PDF -> {company_summary, industry, value_prop} preprocessor.

Uses Gemini multimodal so we don't have to roll our own PDF extraction
heuristics. Falls back to pypdf text extraction if the multimodal call fails
or the file is small/text-based.
"""
from __future__ import annotations

import asyncio
import io
from typing import Optional

from pydantic import BaseModel, Field

from backend.config import GEMINI_MODEL
from backend.gemini_client import get_client
from google.genai import types


class DeckSummary(BaseModel):
    company_summary: str = Field(description="One paragraph capturing what the company does, who buys it, and the core value prop")
    industry: str = Field(description="Concise industry tag, snake_case, e.g. 'restaurant_tech_saas'")
    value_prop: str = Field(description="One-sentence value proposition")


_STRUCTURING_INSTRUCTIONS = (
    "Read the pitch deck and extract a DeckSummary. company_summary is one "
    "paragraph (3-5 sentences). industry is a short snake_case tag. "
    "value_prop is one sentence."
)


async def ingest_pdf(pdf_bytes: bytes) -> DeckSummary:
    """Multimodal PDF -> DeckSummary."""
    client = get_client()
    pdf_part = types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=DeckSummary,
    )
    response = await asyncio.to_thread(
        client.models.generate_content,
        model=GEMINI_MODEL,
        contents=[pdf_part, _STRUCTURING_INSTRUCTIONS],
        config=config,
    )
    parsed = getattr(response, "parsed", None)
    if parsed is not None:
        return parsed  # type: ignore[return-value]
    import json
    return DeckSummary.model_validate(json.loads(response.text or "{}"))


async def ingest_text(raw_text: str) -> DeckSummary:
    """Fallback: take a plain-text company description and structure it."""
    client = get_client()
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=DeckSummary,
    )
    prompt = (
        f"{_STRUCTURING_INSTRUCTIONS}\n\nCompany description:\n---\n{raw_text}\n---"
    )
    response = await asyncio.to_thread(
        client.models.generate_content,
        model=GEMINI_MODEL,
        contents=prompt,
        config=config,
    )
    parsed = getattr(response, "parsed", None)
    if parsed is not None:
        return parsed  # type: ignore[return-value]
    import json
    return DeckSummary.model_validate(json.loads(response.text or "{}"))


def extract_pdf_text(pdf_bytes: bytes) -> str:
    """Local fallback extraction with pypdf — no API call."""
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(pdf_bytes))
    return "\n".join((page.extract_text() or "") for page in reader.pages)
