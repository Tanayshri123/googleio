"""Skill 5 — Regulatory & Demographic Terrain Navigation (Google Search grounded)."""
from schemas import RegulatoryHurdlesOutput
from backend.skills.base import Skill, SkillInput


class RegulatoryHurdlesSkill(Skill):
    name = "regulatory_hurdles"
    display_name = "Regulatory & Demographic Terrain"
    description = (
        "Flags municipal laws, required permits, zoning restrictions, and "
        "demographic traps that could derail expansion. Targets local municipal "
        "code sites and city council records via Google Search grounding."
    )
    grounding = "search"
    default_thinking = "medium"
    output_model = RegulatoryHurdlesOutput

    def build_research_prompt(self, inp: SkillInput) -> str:
        return (
            f"You are a municipal compliance analyst. Use Google Search grounding to "
            f"surface the regulatory landscape this company must navigate to operate "
            f"in the target city.\n\n"
            f"Company: {inp.company_summary}\n"
            f"Industry: {inp.industry}\n"
            f"Target city: {inp.target_city}\n\n"
            f"Investigate:\n"
            f"  - Mandatory permits, licenses, registrations required to operate this "
            f"business in {inp.target_city}. For each: issuing body, typical "
            f"approval timeline, costs/prereqs.\n"
            f"  - Hyper-local zoning laws affecting where this company can locate "
            f"(zoning codes, restricted use districts, signage rules).\n"
            f"  - Demographic or municipal traps: ordinances unique to this city, "
            f"recent rule changes, pending council legislation that could affect "
            f"this category.\n\n"
            f"Pull from official city municipal code sites, council records, and "
            f"state regulatory portals."
        )

    def build_structuring_instructions(self, inp: SkillInput) -> str:
        return (
            "Extract a RegulatoryHurdlesOutput. required_permits[] needs name, "
            "issuing_body, typical_timeline (string like '4-6 weeks'), and notes. "
            "zoning_notes is a list of strings (each one a specific zoning rule). "
            "demographic_flags is a list of strings (each one a specific trap or "
            "pending ordinance). summary is a one-paragraph difficulty assessment."
        )
