"""Skill 3 — Operational Cost-Point Analysis (Google Search grounded)."""
from schemas import CostEstimationOutput
from backend.skills.base import Skill, SkillInput


class CostEstimationSkill(Skill):
    name = "cost_estimation"
    display_name = "Operational Cost-Point Analysis"
    description = (
        "Pulls commercial real estate averages, regional tax incentives, and local "
        "labor wage benchmarks for the target city using Google Search grounding."
    )
    grounding = "search"
    default_thinking = "medium"
    output_model = CostEstimationOutput

    def build_research_prompt(self, inp: SkillInput) -> str:
        return (
            f"You are a regional operations cost analyst. Use Google Search grounding "
            f"to estimate the cost of setting up operations for this company in the "
            f"target city.\n\n"
            f"Company: {inp.company_summary}\n"
            f"Industry: {inp.industry}\n"
            f"Target city: {inp.target_city}\n\n"
            f"Research:\n"
            f"  - Commercial real estate cost per sq.ft per month for 3-5 prominent "
            f"business districts/neighborhoods in {inp.target_city}. Specify space "
            f"type (office, retail, industrial, mixed-use).\n"
            f"  - Average annual salaries for 4-6 roles this company would hire "
            f"locally (engineers, sales, ops, support, etc. — pick what's relevant "
            f"to the industry).\n"
            f"  - Notable local business fees, tax incentives, enterprise zone "
            f"benefits, or compliance costs.\n\n"
            f"Cite live source ranges where possible (LoopNet, CBRE, BLS, city "
            f"economic development sites, Glassdoor city pages, etc.)."
        )

    def build_structuring_instructions(self, inp: SkillInput) -> str:
        return (
            "Extract a CostEstimationOutput. neighborhood_costs[] has neighborhood, "
            "cost_per_sqft_monthly (a bracket string like '$3.50-$5.00'), "
            "space_type, and notes. wage_benchmarks[] has role, average_annual "
            "(bracket string like '$75k-$95k'), and notes. compliance_fees is a "
            "list of strings, each one fee/incentive with rough amount. summary is "
            "one paragraph comparing this city's cost posture to national average."
        )
