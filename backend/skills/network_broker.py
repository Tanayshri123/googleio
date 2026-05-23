"""Skill 4 — B2B Connector & Lead Generation (Google Search grounded)."""
from schemas import NetworkBrokerOutput
from backend.skills.base import Skill, SkillInput


class NetworkBrokerSkill(Skill):
    name = "network_broker"
    display_name = "B2B Connector & Lead Generation"
    description = (
        "Identifies local chambers, accelerators, industry meetups, decision-makers, "
        "and communities for outreach in the target city using Google Search grounding."
    )
    grounding = "search"
    default_thinking = "medium"
    output_model = NetworkBrokerOutput

    def build_research_prompt(self, inp: SkillInput) -> str:
        return (
            f"You are a B2B network broker. Use Google Search grounding to identify "
            f"who this company should talk to first in the target city.\n\n"
            f"Company: {inp.company_summary}\n"
            f"Industry: {inp.industry}\n"
            f"Target city: {inp.target_city}\n\n"
            f"Find:\n"
            f"  - 4-6 named organizations: Chamber of Commerce, regional accelerators, "
            f"trade associations, industry-specific meetup groups. Include URLs.\n"
            f"  - 4-6 named key contacts (real people) — chamber presidents, ecosystem "
            f"directors, prominent local investors, industry conveners. Role + source.\n"
            f"  - 4-8 upcoming networking events, trade shows, mixers in the next "
            f"6 months, with date and URL if available.\n"
            f"  - 3-6 active local communities (Slack, Discord, Subreddit, LinkedIn "
            f"groups) where this industry's buyers or operators hang out.\n\n"
            f"Prefer specific named entities and live URLs over generic categories."
        )

    def build_structuring_instructions(self, inp: SkillInput) -> str:
        return (
            "Extract a NetworkBrokerOutput. organizations[] needs name, type "
            "(chamber_of_commerce|accelerator|trade_association|meetup_group|other), "
            "url, why_relevant. key_contacts[] needs name, role, source. events[] "
            "needs title, date, url, relevance. communities[] needs name, platform "
            "(Slack|Discord|Subreddit|LinkedIn|WhatsApp|Other), url."
        )
