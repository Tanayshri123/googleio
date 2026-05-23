from pydantic import BaseModel, Field
from typing import List, Optional


# ---------------------------------------------------------------------------
# Leaf types (shared across skills)
# ---------------------------------------------------------------------------

class CompetitorPin(BaseModel):
    name: str = Field(description="Name of the direct or indirect competitor business found via Maps")
    address: str = Field(description="Full physical address or string location descriptor")
    lat: float = Field(description="Latitude coordinate derived for plotting on a visual map grid")
    lng: float = Field(description="Longitude coordinate derived for plotting on a visual map grid")
    rating: Optional[float] = Field(None, description="Google Maps rating 0-5 if available")
    popularity: Optional[str] = Field(None, description="Qualitative popularity descriptor e.g. 'high foot traffic'")
    notes: str = Field(description="Brief assessment of their market impact or specific offering mismatch")


class OperationalZone(BaseModel):
    name: str = Field(description="Name of the neighborhood, industrial center, or district")
    why_relevant: str = Field(description="Clear explanation of why this zone fits the business model taxonomy")


class LiveEvent(BaseModel):
    title: str = Field(description="Name of local professional event, industry mixer, summit, or meetup group")
    date: str = Field(description="Estimated date or seasonal timeline of event occurrence")
    url: Optional[str] = Field(None, description="Actual website address reference if recovered by Search Grounding")
    relevance: str = Field(description="Why the target company's team must attend this event to source early clients")


class KeyContact(BaseModel):
    name: str = Field(description="Name of prominent local ecosystem leader, accelerator manager, or public official")
    role: str = Field(description="Title or organizational designation (e.g., Chamber President, Tech Hub Director)")
    source: str = Field(description="Affiliation context or reference platform")


class CommunityNode(BaseModel):
    name: str = Field(description="Name of localized channel (e.g., Austin Startup Slack, Digital Hub Guild)")
    platform: str = Field(description="Platform medium: Slack, Discord, LinkedIn, Subreddit, WhatsApp")
    url: Optional[str] = Field(None, description="Web link to community forum or invite string")


class Organization(BaseModel):
    name: str = Field(description="Local body, chamber, accelerator, or industry association")
    type: str = Field(description="Category: chamber_of_commerce, accelerator, trade_association, meetup_group, etc.")
    url: Optional[str] = Field(None, description="Website if found")
    why_relevant: str = Field(description="Why this org is a high-priority outreach target for this company")


class NeighborhoodCost(BaseModel):
    neighborhood: str = Field(description="Name of business district or neighborhood")
    cost_per_sqft_monthly: Optional[str] = Field(None, description="Average commercial real estate cost bracket, e.g. '$3.50-$5.00 / sq.ft / month'")
    space_type: str = Field(description="office, retail, industrial, mixed-use")
    notes: str = Field(description="Trend direction, vacancy, or other context")


class WageBenchmark(BaseModel):
    role: str = Field(description="Job title relevant to the company's hiring needs")
    average_annual: Optional[str] = Field(None, description="Annual salary range bracket e.g. '$75k-$95k'")
    notes: str = Field(description="Local market dynamics for this role")


class Permit(BaseModel):
    name: str = Field(description="Name of required permit, license, or registration")
    issuing_body: str = Field(description="Municipal department or agency that issues it")
    typical_timeline: Optional[str] = Field(None, description="Estimated approval timeline e.g. '4-6 weeks'")
    notes: str = Field(description="Cost, prerequisites, or gotchas")


# ---------------------------------------------------------------------------
# Per-skill output models
# ---------------------------------------------------------------------------

class CompetitorAnalysisOutput(BaseModel):
    """Output of the competitor_analysis skill — Google Maps grounded."""
    competitors: List[CompetitorPin] = Field(description="Top direct + indirect competitors found in the city")
    complementary_businesses: List[str] = Field(description="Adjacent businesses that could be partners or referral sources")
    neighborhoods: List[OperationalZone] = Field(description="High-density commercial zones for this industry")
    summary: str = Field(description="One-paragraph summary of the competitive density picture")


class MarketVibeOutput(BaseModel):
    """Output of the market_vibe_check skill — Google Search grounded."""
    sentiment_label: str = Field(description="Short label e.g. 'High Demand / Low Penetration' or 'Saturated'")
    sentiment_score: float = Field(description="Numerical demand score 0.0 (no appetite) to 1.0 (extreme appetite)")
    behavioral_trends: List[str] = Field(description="Local consumer or business behavior patterns")
    narrative_summary: str = Field(description="Why the industry is booming or struggling in this geography")


class CostEstimationOutput(BaseModel):
    """Output of the cost_estimation skill — Google Search grounded."""
    neighborhood_costs: List[NeighborhoodCost] = Field(description="Real estate cost brackets per prominent neighborhood")
    wage_benchmarks: List[WageBenchmark] = Field(description="Local wage averages for roles the company would hire")
    compliance_fees: List[str] = Field(description="Notable local business fees, tax incentives, or registration costs")
    summary: str = Field(description="Top-level cost posture for this city vs. national average")


class NetworkBrokerOutput(BaseModel):
    """Output of the network_broker skill — Google Search grounded."""
    organizations: List[Organization] = Field(description="Local chambers, accelerators, trade associations to engage")
    key_contacts: List[KeyContact] = Field(
        default_factory=list,
        description="Deprecated — leave empty; use organizations only, never named individuals",
    )
    events: List[LiveEvent] = Field(description="Upcoming networking events, trade shows, mixers")
    communities: List[CommunityNode] = Field(description="Slack/Discord/Subreddit/LinkedIn communities to join")


class RegulatoryHurdlesOutput(BaseModel):
    """Output of the regulatory_hurdles skill — Google Search grounded."""
    required_permits: List[Permit] = Field(description="Mandatory permits and licenses for this business type in this city")
    zoning_notes: List[str] = Field(description="Hyper-local zoning laws relevant to the company's operating model")
    demographic_flags: List[str] = Field(description="Demographic or municipal traps that could block expansion")
    summary: str = Field(description="One-paragraph regulatory difficulty assessment")


# ---------------------------------------------------------------------------
# Composed master payload — what the frontend renders
# ---------------------------------------------------------------------------

class BattlePlanPayload(BaseModel):
    """Master output combining any subset of skill outputs into one document."""
    company_summary: str = Field(description="Synthesized target profile showing extracted core value prop")
    industry: str = Field(description="Industry tag used to drive the skills")
    target_city: str = Field(description="Geographical expansion city analyzed")

    # Skill outputs — all optional so frontend can render any subset
    competitor_analysis: Optional[CompetitorAnalysisOutput] = None
    market_vibe: Optional[MarketVibeOutput] = None
    cost_estimation: Optional[CostEstimationOutput] = None
    network_broker: Optional[NetworkBrokerOutput] = None
    regulatory_hurdles: Optional[RegulatoryHurdlesOutput] = None

    # Optional final synthesis layer (filled by orchestrator's strategist pass)
    strategy_bullets: List[str] = Field(default_factory=list, description="High-impact market entry plays synthesized from all skills")
    recommended_first_week: List[str] = Field(default_factory=list, description="Actionable calendar runbook for week one on the ground")
