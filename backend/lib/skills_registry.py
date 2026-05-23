"""Skill catalog — The General picks from this list per product type."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class SkillSpec:
    skill_id: str
    agent_folder: str
    label: str
    description: str
    tools: tuple[str, ...]
    thinking_budget: int
    role: str
    default_on: bool
    """Include in default set if General does not specify."""
    good_for: tuple[str, ...]
    """product_type tags: b2b_saas, consumer, marketplace, hardware, services, digital, other"""
    usually_skip_for: tuple[str, ...]


SKILL_CATALOG: list[SkillSpec] = [
    SkillSpec(
        skill_id="competitor_analysis",
        agent_folder="cartographer",
        label="Competitor analysis",
        description="Map competitors, complementary businesses, and neighborhoods via Google Maps.",
        tools=("google_maps",),
        thinking_budget=256,
        role="cartographer",
        default_on=True,
        good_for=("b2b_saas", "consumer", "marketplace", "hardware", "services", "digital", "other"),
        usually_skip_for=(),
    ),
    SkillSpec(
        skill_id="network_broker",
        agent_folder="broker",
        label="Network broker",
        description="Organizations, events, and communities for local outreach.",
        tools=("google_search",),
        thinking_budget=512,
        role="networker",
        default_on=True,
        good_for=("b2b_saas", "consumer", "marketplace", "services", "digital", "other"),
        usually_skip_for=(),
    ),
    SkillSpec(
        skill_id="partner_scout",
        agent_folder="partner_scout",
        label="Partner scout",
        description=(
            "Trending partner types, ideal organizations to ally with, and connector "
            "archetypes for this terrain (no individual names)."
        ),
        tools=("google_search",),
        thinking_budget=512,
        role="networker",
        default_on=False,
        good_for=("b2b_saas", "consumer", "marketplace", "services", "hardware", "digital", "other"),
        usually_skip_for=("api_platform",),
    ),
    SkillSpec(
        skill_id="regulatory_hurdles",
        agent_folder="compliance_officer",
        label="Regulatory hurdles",
        description="Permits, zoning, licensing, and regulatory bodies.",
        tools=("google_search",),
        thinking_budget=512,
        role="strategist",
        default_on=True,
        good_for=("b2b_saas", "consumer", "hardware", "services", "marketplace", "other"),
        usually_skip_for=("pure_digital",),
    ),
    SkillSpec(
        skill_id="market_vibe_check",
        agent_folder="market_vibe_check",
        label="Market vibe check",
        description="Demand sentiment, behavioral trends, and market appetite.",
        tools=("google_search",),
        thinking_budget=512,
        role="strategist",
        default_on=True,
        good_for=("b2b_saas", "consumer", "marketplace", "services", "digital", "other"),
        usually_skip_for=(),
    ),
    SkillSpec(
        skill_id="cost_estimation",
        agent_folder="cost_estimation",
        label="Cost estimation",
        description="Real estate, wages, and compliance cost brackets for the city.",
        tools=("google_search",),
        thinking_budget=512,
        role="strategist",
        default_on=True,
        good_for=("b2b_saas", "consumer", "hardware", "services", "marketplace", "other"),
        usually_skip_for=("pure_digital",),
    ),
    SkillSpec(
        skill_id="demographic_profiler",
        agent_folder="demographic_profiler",
        label="Demographic profiler",
        description="Target segments, income bands, and neighborhood demographics.",
        tools=("google_search",),
        thinking_budget=512,
        role="strategist",
        default_on=False,
        good_for=("consumer", "marketplace", "services", "retail", "other"),
        usually_skip_for=("enterprise_b2b", "api_platform"),
    ),
    SkillSpec(
        skill_id="monetization_audit",
        agent_folder="monetization_audit",
        label="Monetization audit",
        description="Pricing models, unit economics, and revenue levers in-market.",
        tools=("google_search",),
        thinking_budget=512,
        role="strategist",
        default_on=False,
        good_for=("b2b_saas", "consumer", "marketplace", "digital", "other"),
        usually_skip_for=("nonprofit", "hardware_only"),
    ),
    SkillSpec(
        skill_id="moat_evaluator",
        agent_folder="moat_evaluator",
        label="Moat evaluator",
        description="Defensibility, switching costs, and competitive moat vs local players.",
        tools=("google_search",),
        thinking_budget=768,
        role="strategist",
        default_on=False,
        good_for=("b2b_saas", "marketplace", "digital", "consumer", "other"),
        usually_skip_for=(),
    ),
]

SKILL_BY_ID = {s.skill_id: s for s in SKILL_CATALOG}
FOLDER_TO_SKILL = {s.agent_folder: s.skill_id for s in SKILL_CATALOG}


def catalog_for_prompt() -> str:
    lines = []
    for s in SKILL_CATALOG:
        lines.append(
            f"- **{s.skill_id}** ({s.label}): {s.description} "
            f"[tools: {', '.join(s.tools)}; good for: {', '.join(s.good_for)}; "
            f"often skip for: {', '.join(s.usually_skip_for) or 'n/a'}]"
        )
    return "\n".join(lines)


def default_skill_ids() -> list[str]:
    return [s.skill_id for s in SKILL_CATALOG if s.default_on]


def resolve_selected_skills(
    selected: list[str] | None,
    product_type: str = "other",
) -> list[str]:
    if not selected:
        return default_skill_ids()
    valid = [sid for sid in selected if sid in SKILL_BY_ID]
    if valid:
        return valid
    return default_skill_ids()


def agent_folders_for_skills(skill_ids: list[str]) -> list[SkillSpec]:
    return [SKILL_BY_ID[sid] for sid in skill_ids if sid in SKILL_BY_ID]
