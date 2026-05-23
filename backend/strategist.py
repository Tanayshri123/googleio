"""Synthesize strategy_bullets + recommended_first_week from skill outputs."""
from __future__ import annotations

from pydantic import BaseModel, Field

from schemas import BattlePlanPayload
from backend.gemini_client import structure_text


class StrategySynthesis(BaseModel):
    strategy_bullets: list[str] = Field(
        description="3-5 high-impact market entry plays"
    )
    recommended_first_week: list[str] = Field(
        description="5-7 concrete actions for week one on the ground"
    )


async def synthesize_strategy(plan: BattlePlanPayload) -> BattlePlanPayload:
    """Fill strategy fields if empty, using a fast Gemini structuring pass."""
    if plan.strategy_bullets and plan.recommended_first_week:
        return plan

    context = plan.model_dump_json(indent=0)
    instructions = (
        "Given this market expansion Battle Plan JSON, produce StrategySynthesis. "
        "strategy_bullets: 3-5 specific, actionable plays referencing real data "
        "from the skills. recommended_first_week: 5-7 ordered steps a founder "
        "should take in the first 7 days in the target city."
    )

    try:
        out = await structure_text(
            raw_text=context,
            schema=StrategySynthesis,
            instructions=instructions,
            thinking="low",
        )
        if not plan.strategy_bullets:
            plan.strategy_bullets = out.strategy_bullets
        if not plan.recommended_first_week:
            plan.recommended_first_week = out.recommended_first_week
    except Exception:
        pass

    return plan
