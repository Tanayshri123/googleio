"""Skill registry — central lookup of skill_name -> Skill instance."""
from backend.skills.base import Skill, SkillInput, SkillResult
from backend.skills.competitor_analysis import CompetitorAnalysisSkill
from backend.skills.market_vibe_check import MarketVibeCheckSkill
from backend.skills.cost_estimation import CostEstimationSkill
from backend.skills.network_broker import NetworkBrokerSkill
from backend.skills.regulatory_hurdles import RegulatoryHurdlesSkill

SKILL_REGISTRY: dict[str, Skill] = {
    s.name: s
    for s in [
        CompetitorAnalysisSkill(),
        MarketVibeCheckSkill(),
        CostEstimationSkill(),
        NetworkBrokerSkill(),
        RegulatoryHurdlesSkill(),
    ]
}

__all__ = ["Skill", "SkillInput", "SkillResult", "SKILL_REGISTRY"]
