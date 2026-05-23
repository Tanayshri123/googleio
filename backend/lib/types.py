from __future__ import annotations

from pydantic import BaseModel, Field
from typing import List, Optional


class Competitor(BaseModel):
    name: str
    address: str
    lat: float
    lng: float
    notes: Optional[str] = ""


class Business(BaseModel):
    name: str
    address: Optional[str] = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    notes: Optional[str] = ""


class Neighborhood(BaseModel):
    name: str
    why_relevant: str


class NetworkingOrg(BaseModel):
    name: str
    type: str
    url: Optional[str] = ""
    relevance: str


class Event(BaseModel):
    title: str
    date: str
    url: Optional[str] = ""
    relevance: str


class KeyContact(BaseModel):
    name: str
    role: str
    source: Optional[str] = ""


class Community(BaseModel):
    name: str
    platform: str
    url: Optional[str] = ""


class Compliance(BaseModel):
    required_permits: List[str] = []
    zoning_notes: str = ""
    licensing_requirements: List[str] = []
    regulatory_bodies: List[str] = []
    compliance_timeline: Optional[str] = ""
    estimated_costs: Optional[str] = ""


class DeepAnalysis(BaseModel):
    risk_assessment: str = ""
    anomalies: List[str] = []
    missed_opportunities: List[str] = []
    verified_findings: List[str] = []
    recommendations: List[str] = []
    confidence_score: float = 0.0


class MarketVibe(BaseModel):
    sentiment_label: str = ""
    narrative_summary: str = ""
    behavioral_trends: List[str] = []
    demand_signals: List[str] = []


class IdealPartner(BaseModel):
    name: str
    partner_type: str = ""
    why_fit: str = ""
    partnership_angle: str = ""
    url: Optional[str] = ""


class BattlePlan(BaseModel):
    company_summary: str
    target_city: str
    target_country: str
    competitors: List[Competitor] = []
    complementary_businesses: List[Business] = []
    neighborhoods: List[Neighborhood] = []
    organizations: List[dict] = []
    networking_orgs: List[NetworkingOrg] = []
    events: List[Event] = []
    key_contacts: List[KeyContact] = []
    communities: List[Community] = []
    regulatory_notes: List[str] = []
    compliance: Compliance = Compliance()
    strategy_bullets: List[str] = []
    recommended_first_week: List[str] = []
    deep_analysis: Optional[DeepAnalysis] = None
    agent_outputs: dict = {}
    selected_skills: List[str] = []
    market_vibe: Optional[MarketVibe] = None
    ideal_partners: List[IdealPartner] = []
    pipeline_warnings: List[str] = []


class ScoutRequest(BaseModel):
    input_type: str = "text"
    company_text: Optional[str] = None
    website_url: Optional[str] = None
    file_content: Optional[str] = None
    filename: Optional[str] = None
    city: str
    country: str
    deep_scope: bool = False


class ScoutStatus(BaseModel):
    session_id: str
    sessionId: str = ""
    status: str = "running"
    active_agent: Optional[str] = None
    progress: str = "Launching scout…"
    selected_skills: List[str] = Field(default_factory=list)
    completed_skills: List[str] = Field(default_factory=list)
    failed_skills: List[str] = Field(default_factory=list)
    active_skill: Optional[str] = None
    scout_phase: str = "planning"
    result: Optional[BattlePlan] = None
    error: Optional[str] = None
    chat_history: List[ChatMessage] = Field(default_factory=list)

    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        data["sessionId"] = data.pop("session_id", self.session_id)
        return data


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: List[ChatMessage] = Field(default_factory=list)
    plan: Optional[dict] = Field(
        default=None,
        description="Optional Scout Report payload when session is demo/offline",
    )


class ChatResponse(BaseModel):
    reply: str
    citations: List[str] = []


class GeocodeResult(BaseModel):
    lat: float
    lng: float
