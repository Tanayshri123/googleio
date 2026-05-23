"""Skill 1 — Density & Competitor Mapping (Google Maps grounded)."""
from schemas import CompetitorAnalysisOutput
from backend.skills.base import Skill, SkillInput


class CompetitorAnalysisSkill(Skill):
    name = "competitor_analysis"
    display_name = "Density & Competitor Mapping"
    description = (
        "Scans the target city for direct and indirect competitors using Google Maps "
        "grounding. Returns pins (name, address, lat/lng), complementary businesses, "
        "and dense operational neighborhoods."
    )
    grounding = "maps"
    default_thinking = "low"
    output_model = CompetitorAnalysisOutput

    def build_research_prompt(self, inp: SkillInput) -> str:
        coord_hint = ""
        if inp.target_coords:
            coord_hint = f" Center your search near coordinates ({inp.target_coords[0]}, {inp.target_coords[1]})."
        return (
            f"You are a market terrain analyst. Use Google Maps grounding to find the "
            f"competitive landscape for the following company expanding into a new city.\n\n"
            f"Company: {inp.company_summary}\n"
            f"Industry: {inp.industry}\n"
            f"Target city: {inp.target_city}.{coord_hint}\n\n"
            f"Find:\n"
            f"  1. Up to 8 direct and indirect competitors in {inp.target_city}. "
            f"For each, capture name, exact address, lat/lng, Google Maps rating if "
            f"visible, and a one-line market-impact note.\n"
            f"  2. 4-6 complementary businesses (adjacent service providers, partners, "
            f"referral sources) operating in the same neighborhoods.\n"
            f"  3. 3-5 high-density commercial neighborhoods/districts where this "
            f"industry clusters in {inp.target_city}, with a brief 'why relevant' note.\n\n"
            f"Be specific — real business names, real addresses, real coordinates."
        )

    def build_structuring_instructions(self, inp: SkillInput) -> str:
        return (
            f"Extract a CompetitorAnalysisOutput from the research notes. "
            f"competitors[] needs lat/lng as numbers (use 0.0 if truly unknown but "
            f"prefer real coordinates). complementary_businesses is a flat list of "
            f"strings. neighborhoods[] needs name + why_relevant. "
            f"summary is one paragraph describing the competitive density picture for "
            f"this company in {inp.target_city}."
        )


if __name__ == "__main__":
    # Quick CLI smoke test:
    #   python -m backend.skills.competitor_analysis
    import asyncio
    import json

    async def _main() -> None:
        skill = CompetitorAnalysisSkill()
        result = await skill.run(SkillInput(
            company_summary="Workflow automation SaaS for independent restaurants",
            industry="restaurant_tech_saas",
            target_city="Austin, TX",
        ))
        print(json.dumps(result.output.model_dump(), indent=2))
        if result.error:
            print("ERROR:", result.error)

    asyncio.run(_main())
