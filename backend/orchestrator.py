"""Pipeline composer — runs N skills in parallel and folds outputs into a BattlePlan.

Each selected skill is invoked concurrently via asyncio.gather, then the
results are mapped into their named slot on BattlePlanPayload. Missing
skills stay None so the frontend can render any subset.
"""
from __future__ import annotations

import asyncio
from typing import Iterable

from schemas import BattlePlanPayload
from backend.skills import SKILL_REGISTRY, SkillInput, SkillResult

# Maps skill.name -> attribute on BattlePlanPayload that should receive its output
_SKILL_TO_FIELD: dict[str, str] = {
    "competitor_analysis": "competitor_analysis",
    "market_vibe_check": "market_vibe",
    "cost_estimation": "cost_estimation",
    "network_broker": "network_broker",
    "regulatory_hurdles": "regulatory_hurdles",
}


async def run_battle_plan(
    company_summary: str,
    industry: str,
    target_city: str,
    selected_skills: Iterable[str] | None = None,
    target_coords: tuple[float, float] | None = None,
) -> tuple[BattlePlanPayload, list[SkillResult]]:
    """Compose a BattlePlan by running the selected skills concurrently."""
    skill_names = list(selected_skills) if selected_skills else list(SKILL_REGISTRY.keys())
    skills = [SKILL_REGISTRY[name] for name in skill_names if name in SKILL_REGISTRY]

    inp = SkillInput(
        company_summary=company_summary,
        industry=industry,
        target_city=target_city,
        target_coords=target_coords,
    )

    results: list[SkillResult] = await asyncio.gather(*(s.run(inp) for s in skills))

    plan = BattlePlanPayload(
        company_summary=company_summary,
        industry=industry,
        target_city=target_city,
    )
    for r in results:
        field = _SKILL_TO_FIELD.get(r.skill_name)
        if field and r.error is None:
            setattr(plan, field, r.output)

    return plan, results
