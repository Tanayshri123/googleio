export type InputType = "pdf" | "website" | "text";

export type AgentId = "general" | "cartographer" | "networker" | "strategist";

export type ScoutPhase = "planning" | "skills" | "synthesis";

export type Competitor = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  notes?: string;
};

export type IdealPartner = {
  name: string;
  partner_type?: string;
  why_fit?: string;
  partnership_angle?: string;
  url?: string;
};

export type MarketVibe = {
  sentiment_label?: string;
  narrative_summary?: string;
  behavioral_trends?: string[];
  demand_signals?: string[];
};

export type BattlePlan = {
  company_summary: string;
  target_city: string;
  target_country: string;
  competitors: Competitor[];
  complementary_businesses?: { name: string; notes?: string }[];
  neighborhoods: { name: string; why_relevant: string }[];
  events: {
    title: string;
    date: string;
    url?: string;
    relevance: string;
  }[];
  /** Deprecated — real individuals are stripped; use organizations instead. */
  key_contacts: { name: string; role: string; source?: string }[];
  organizations?: {
    name: string;
    type?: string;
    url?: string;
    why_relevant: string;
  }[];
  communities?: { name: string; platform: string; url?: string }[];
  regulatory_notes?: string[];
  strategy_bullets: string[];
  recommended_first_week: string[];
  selected_skills?: string[];
  market_vibe?: MarketVibe | null;
  agent_outputs?: Record<string, unknown>;
  ideal_partners?: IdealPartner[];
  pipeline_warnings?: string[];
};

export type ScoutInput = {
  input_type: InputType;
  file?: File;
  website_url?: string;
  company_text?: string;
  city: string;
  country: string;
  deep_scope?: boolean;
};

export type ScoutStatus = {
  status: "running" | "done" | "error";
  progress?: string;
  active_agent?: AgentId;
  selected_skills?: string[];
  completed_skills?: string[];
  failed_skills?: string[];
  active_skill?: string | null;
  scout_phase?: ScoutPhase;
  result?: BattlePlan;
  error?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AppPhase = "landing" | "scouting" | "scout-report";
