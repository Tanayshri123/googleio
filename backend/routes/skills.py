"""Standalone skill endpoints.

GET  /api/skills                  -> list of skills with descriptions + schemas
POST /api/skills/{skill_name}     -> run one skill for any city/company
"""
from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.skills import SKILL_REGISTRY, SkillInput

router = APIRouter()


class SkillRunRequest(BaseModel):
    """Request body for POST /api/skills/{name}."""
    company_summary: str = Field(..., description="One-paragraph company / value-prop summary")
    industry: str = Field(..., description="Industry tag, e.g. 'restaurant_tech_saas'")
    target_city: str = Field(..., description="Target city, e.g. 'Austin, TX'")
    target_coords: Optional[tuple[float, float]] = Field(None, description="Optional precise lat/lng center")
    deep_search: bool = Field(False, description="Reserved for future use; currently ignored")
    extra_context: Optional[str] = Field(None, description="Free-form orchestrator hints")


@router.get("/api/skills")
async def list_skills() -> dict[str, Any]:
    return {
        "skills": [skill.describe() for skill in SKILL_REGISTRY.values()],
    }


@router.post("/api/skills/{skill_name}")
async def run_skill(skill_name: str, body: SkillRunRequest) -> dict[str, Any]:
    skill = SKILL_REGISTRY.get(skill_name)
    if skill is None:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown skill '{skill_name}'. Available: {list(SKILL_REGISTRY.keys())}",
        )

    result = await skill.run(SkillInput(
        company_summary=body.company_summary,
        industry=body.industry,
        target_city=body.target_city,
        target_coords=body.target_coords,
        deep_search=body.deep_search,
        extra_context=body.extra_context,
    ))

    return {
        "skill": skill_name,
        "output": result.output.model_dump(),
        "citations": result.citations,
        "error": result.error,
    }
