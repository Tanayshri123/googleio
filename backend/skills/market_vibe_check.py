"""Skill 2 — Local Market Trend & Popularity (Google Search grounded)."""
from schemas import MarketVibeOutput
from backend.skills.base import Skill, SkillInput


class MarketVibeCheckSkill(Skill):
    name = "market_vibe_check"
    display_name = "Local Market Trend & Sentiment"
    description = (
        "Gauges local appetite and sentiment for the industry in the target city. "
        "Pulls recent local news, search trend chatter, local subreddits, and city "
        "business journals via Google Search grounding."
    )
    grounding = "search"
    default_thinking = "medium"
    output_model = MarketVibeOutput

    def build_research_prompt(self, inp: SkillInput) -> str:
        return (
            f"You are a local market sentiment analyst. Use Google Search grounding "
            f"to assess demand and sentiment for this industry in the target city.\n\n"
            f"Company: {inp.company_summary}\n"
            f"Industry: {inp.industry}\n"
            f"Target city: {inp.target_city}\n\n"
            f"Investigate via search:\n"
            f"  - Recent local news mentioning this industry in {inp.target_city} "
            f"(last 12 months).\n"
            f"  - Localized search trend chatter, city subreddits "
            f"(e.g. r/{inp.target_city.split(',')[0].lower()}), business journals.\n"
            f"  - Local growth indicators: new entrants, closures, funding rounds, "
            f"hiring activity.\n"
            f"  - Cultural quirks affecting buyer behavior for this category.\n\n"
            f"Produce: a short demand/penetration verdict (e.g. 'High demand, low "
            f"penetration'), a 0-1 sentiment score, 4-6 distinct local behavioral "
            f"trends, and a one-paragraph narrative of why this industry is booming "
            f"or struggling in {inp.target_city}."
        )

    def build_structuring_instructions(self, inp: SkillInput) -> str:
        return (
            "Extract a MarketVibeOutput. sentiment_label is a short phrase. "
            "sentiment_score is a float between 0.0 and 1.0. behavioral_trends is a "
            "list of concrete, specific patterns (avoid platitudes). "
            "narrative_summary is one tight paragraph."
        )
