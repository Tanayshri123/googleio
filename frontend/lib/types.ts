export type InputType = "pdf" | "website" | "text";

export type AgentId = "general" | "cartographer" | "networker" | "strategist";

export type Competitor = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  notes?: string;
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
  key_contacts: { name: string; role: string; source?: string }[];
  communities?: { name: string; platform: string; url?: string }[];
  regulatory_notes?: string[];
  strategy_bullets: string[];
  recommended_first_week: string[];
};

export type ScoutInput = {
  input_type: InputType;
  file?: File;
  website_url?: string;
  company_text?: string;
  city: string;
  country: string;
};

export type ScoutStatus = {
  status: "running" | "done" | "error";
  progress?: string;
  active_agent?: AgentId;
  result?: BattlePlan;
  error?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AppPhase = "landing" | "scouting" | "battle-plan";
