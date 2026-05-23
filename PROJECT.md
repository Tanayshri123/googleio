# ScoutAI — Project Spec & Implementation Blueprint

**Codename:** TerraScout (internal agents)  
**Hackathon track:** Gemini 3.5 Flash — agentic workflows, native tool use, real-world grounding  
**Demo promise:** Upload a pitch deck + target city → receive a complete market-expansion **Battle Plan** in ~30 seconds.

---

## 1. Executive Summary & Problem Statement

### Problem: Terrain blindness

Businesses expanding into new geographies (e.g., SF → Austin) lack local intelligence:

- Who are the direct competitors and where are they?
- Where do founders and buyers actually network?
- What cultural and regulatory nuances matter in that city?
- What brands or people to partner with?
- What compliance and licensing is required?

Traditional market research is slow (weeks of manual work) and expensive (consultants).

### Solution: ScoutAI

A **multi-agent market expansion platform**. The user uploads a company pitch deck or business plan and enters a target city. Sub-agents use **Google Maps** and **Google Search** grounding to autonomously map the terrain — competitors, contacts, events, compliance — and output a structured **Battle Plan** for the dashboard.

### One-liner (judges)

> *"We turn terrain blindness into a 30-second Battle Plan — 5 Gemini 3.5 Flash agents running in parallel, grounded in Maps and Search."*

---

## 2. Target Audience & Impact (20% rubric)

| Segment | Need |
|--------|------|
| Startup founders | Validate expansion before hiring locally |
| SMB owners | Compete without a research budget |
| BD / expansion managers | Prioritize cities and first-week actions |

**Impact:** Democratizes consultant-grade market research. Weeks of Googling and thousands in fees → one agentic workflow, leveling the field for smaller businesses.

---

## 3. Gemini 3.5 Flash — Why This Model

| Capability | How we use it |
|------------|----------------|
| **Google Maps grounding** | Pin competitors, hubs, retail/office clusters in the target city |
| **Google Search grounding** | Live events, chamber leaders, news, communities, local regulation |
| **1M context window** | Orchestrator ingests full PDF + all agent outputs for unified Battle Plan compilation |
| **High throughput (~289 tok/s)** | 3 parallel agents (Cartographer, Broker, ComplianceOfficer) run simultaneously via `asyncio.gather` |
| **thinking_budget** | Cartographer=256 (fast spatial), Broker=512 (web directory), Compliance=512 (legal), DeepVerifier=2048 (deep reasoning) |

**Hackathon alignment:** Native tool use + multi-step parallel agentic workflow + real-world grounding — not a single monolithic prompt.

---

## 4. Technical Architecture — Direct Gemini SDK + asyncio.gather

Framework: **Direct Gemini 3.5 Flash SDK** with native tool binding (`types.Tool(google_maps=...)`, `types.Tool(google_search=...)`). Orchestration via Python `asyncio.gather` for true non-blocking parallel agent execution.

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend: PDF upload + target city                         │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Root Orchestrator                                          │
│  • Ingests full PDF (1M context window)                     │
│  • Extracts company summary, industry, value prop           │
│  • Dispatches 3 agents in PARALLEL via asyncio.gather       │
│  • Merges all outputs → Battle Plan JSON                    │
│  • Model: gemini-3.5-flash                                  │
└───────┬─────────────────────┬───────────────────────────────┘
        │  asyncio.gather     │
        ▼                     ▼                     ▼
┌───────────────┐  ┌───────────────────┐  ┌──────────────────┐
│ Cartographer  │  │ Broker            │  │ ComplianceOfficer│
│               │  │                   │  │                  │
│ Maps grounding│  │ Search grounding  │  │ Search grounding │
│ think_budget  │  │ think_budget      │  │ think_budget     │
│ = 256         │  │ = 512             │  │ = 512            │
│               │  │                   │  │                  │
│ Output:       │  │ Output:           │  │ Output:          │
│ • Competitors │  │ • Networking orgs │  │ • Permits        │
│ • Lat/Lng     │  │ • Chambers        │  │ • Zoning         │
│ • POIs        │  │ • Accelerators    │  │ • Licensing      │
│ • Hubs        │  │ • Events          │  │ • Local laws     │
└───────┬───────┘  └─────────┬─────────┘  └────────┬─────────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             ▼
        ┌────────────────────────────────────────────────┐
        │  Orchestrator (compile phase)                  │
        │  • Merges all 3 parallel outputs               │
        │  • Enforces Pydantic JSON schema               │
        │  • response_mime_type="application/json"       │
        └───────────────────┬────────────────────────────┘
                            ▼
        ┌────────────────────────────────────────────────┐
        │  (optional) DeepVerifier                        │
        │  • Only if "Deep Scope Strategy" toggle ON     │
        │  • Runs SEQUENTIALLY after parallel agents      │
        │  • think_budget=2048                            │
        │  • Cross-examines outputs for anomalies/risks   │
        └───────────────────┬────────────────────────────┘
                            ▼
        ┌────────────────────────────────────────────────┐
        │  Next.js Dashboard                              │
        │  Map + Cards + Ask Scout chat                   │
        └────────────────────────────────────────────────┘
```

### Agent definitions

| # | Agent | Execution | Tools | thinking_budget | Role |
|---|-------|-----------|-------|-----------------|------|
| 1 | **Orchestrator** | Sequential (first) | PDF ingest, file mgmt | 1024 | Parse pitch deck, extract company/industry/value prop, fan-out to parallel agents, compile final Battle Plan JSON |
| 2 | **Cartographer** | Parallel with #3 & #4 | `google_maps` | **256** (fast) | Spatial terrain — competitors, complementary businesses, industry neighborhoods, POIs with lat/lng |
| 3 | **Broker** | Parallel with #2 & #4 | `google_search` | **512** (medium) | Web directory — local tech hubs, chambers of commerce, accelerators, networking groups, key contacts |
| 4 | **ComplianceOfficer** | Parallel with #2 & #3 | `google_search` | **512** (medium) | Legal baseline — operation permits, zoning parameters, licensing requirements for that industry in that city |
| 5 | **DeepVerifier** | On-demand (sequential after 2-4) | `google_search` | **2048** (deep) | Optional deep reasoning — cross-examines all agent outputs for anomalies, economic risks, strategy gaps |

### Orchestration pattern

```python
# Parallel fan-out via asyncio.gather
import asyncio
from google import genai
from google.genai import types

client = genai.Client()

async def run_cartographer(company_context: str, city: str) -> dict:
    return await client.aio.models.generate_content(
        model="gemini-3.5-flash",
        contents=f"Company: {company_context}\nCity: {city}\nFind competitors and map them.",
        config=types.GenerateContentConfig(
            thinking_budget=256,
            tools=[types.Tool(google_maps=types.GoogleMaps())],
            response_mime_type="application/json"
        )
    )

async def run_broker(company_context: str, city: str) -> dict:
    return await client.aio.models.generate_content(
        model="gemini-3.5-flash",
        contents=f"Company: {company_context}\nCity: {city}\nFind networking orgs and key contacts.",
        config=types.GenerateContentConfig(
            thinking_budget=512,
            tools=[types.Tool(google_search=types.GoogleSearch())],
            response_mime_type="application/json"
        )
    )

async def run_compliance(company_context: str, city: str) -> dict:
    return await client.aio.models.generate_content(
        model="gemini-3.5-flash",
        contents=f"Company: {company_context}\nCity: {city}\nFind required permits and regulations.",
        config=types.GenerateContentConfig(
            thinking_budget=512,
            tools=[types.Tool(google_search=types.GoogleSearch())],
            response_mime_type="application/json"
        )
    )

# DISPATCH ALL 3 IN PARALLEL
carto, broker, compliance = await asyncio.gather(
    run_cartographer(company_context, city),
    run_broker(company_context, city),
    run_compliance(company_context, city),
)

# Orchestrator merges outputs → Battle Plan JSON
battle_plan = await compile_battle_plan(carto, broker, compliance)

# Optional: Deep Scope Strategy (sequential, on toggle)
if deep_scope_enabled:
    battle_plan = await run_deep_verifier(battle_plan, thinking_budget=2048)
```

### Structured output schema (Battle Plan)

```json
{
  "company_summary": "string",
  "target_city": "string",
  "target_country": "string",
  "competitors": [
    { "name": "string", "address": "string", "lat": 0, "lng": 0, "notes": "string" }
  ],
  "complementary_businesses": [
    { "name": "string", "notes": "string" }
  ],
  "neighborhoods": [
    { "name": "string", "why_relevant": "string" }
  ],
  "networking_orgs": [
    { "name": "string", "type": "string", "url": "string", "relevance": "string" }
  ],
  "events": [
    { "title": "string", "date": "string", "url": "string", "relevance": "string" }
  ],
  "key_contacts": [
    { "name": "string", "role": "string", "source": "string" }
  ],
  "compliance": {
    "required_permits": ["string"],
    "zoning_notes": "string",
    "licensing_requirements": ["string"],
    "regulatory_bodies": ["string"]
  },
  "strategy_bullets": ["string"],
  "recommended_first_week": ["string"],
  "deep_analysis": {
    "risk_assessment": "string",
    "anomalies": ["string"],
    "recommendations": ["string"]
  }
}
```

---

## 5. Feature Scope

### In scope (demo-safe)

| Layer | Stack | Features |
|-------|-------|----------|
| **Frontend** | Next.js | Company input: **PDF, website URL, or text**; **city + country**; scout **plane animation** during agents; YC-style UI; map + cards; **Ask Scout** follow-up chat; **Deep Scope Strategy** toggle (no auth) |
| **Backend** | Python (FastAPI) | Direct Gemini 3.5 Flash SDK with `asyncio.gather` parallel dispatch. In-memory sessions. No database — session state lives in Python dict with 1h TTL. |
| **AI** | Gemini 3.5 Flash | Maps + Search grounding via native `types.Tool` binding. `thinking_budget` tuned per agent. Structured outputs via `response_mime_type="application/json"`. |

### Out of scope

- Mobile apps  
- Auth / user accounts  
- Persistent database (session in memory only)  

---

## 6. Simulation — What We Are Proving

The **simulation** is not a game engine — it is an **end-to-end scripted demo** that proves the multi-agent pipeline under hackathon constraints.

### Simulation goals

1. **Grounding works:** Map pins and Search citations match a real city (use a fixed demo city for reliability).  
2. **Context works:** Uploaded deck changes competitor types and neighborhood focus.  
3. **Parallel orchestration works:** Cartographer ∥ Broker ∥ ComplianceOfficer run simultaneously via `asyncio.gather` — fan-out, not sequential.  
4. **DeepVerifier works (on toggle):** Optional deep reasoning pass cross-examines outputs for anomalies and risks.  
5. **Speed works:** Full base run completes in <30s (3 parallel agents). With DeepVerifier: <60s total.  
6. **UI works:** One click from upload → Battle Plan on map + cards.

### Recommended demo scenario (frozen for judges)

| Field | Value |
|-------|--------|
| **Demo company** | B2B SaaS (e.g., "workflow automation for restaurants") — use a real 5–10 slide PDF |
| **Demo market** | **Austin** + **United States** (rich Maps/Search signal; narrative: "expanding from SF") |
| **Demo input** | Website URL or PDF or pasted company text |
| **Fallback city** | Same pipeline; pre-cache JSON if API fails live |

---

## 7. Implementation Steps (Build Order)

Execute in this order to de-risk the demo.

### Phase 0 — Setup (Day 0)

- [ ] Create repo: `frontend/` (Next.js), `backend/` (Python FastAPI)
- [ ] `pip install google-genai python-multipart python-dotenv pydantic fastapi uvicorn`
- [ ] Obtain API keys: Gemini API key (3.5 Flash), Google Maps JavaScript API (for frontend map)
- [ ] Enable Maps + Search grounding on Gemini
- [ ] Add `.env` with `GEMINI_API_KEY`, copy `.env.example` (no secrets in git)
- [ ] Smoke test: single Gemini call with Maps grounding for `"coffee shops near downtown Austin"`

### Phase 1 — Battle Plan schema + mock (Day 1)

- [ ] Define Pydantic `BattlePlan` model matching JSON schema above
- [ ] Create mock JSON (`mock/battle-plan-austin.json`) with all 5 agent outputs
- [ ] Frontend: render full dashboard (map + cards) using mock data — **before** real agents exist

**Exit criterion:** Dashboard looks finished with fake data.

### Phase 2 — Parallel agents (Day 1–2)

- [ ] **Cartographer:** Gemini call with `google_maps` tool, `thinking_budget=256`, `response_mime_type="application/json"`. Input = company context + city. Output = competitors, POIs, lat/lng.
- [ ] **Broker:** Gemini call with `google_search` tool, `thinking_budget=512`. Output = networking orgs, chambers, accelerators, events, contacts.
- [ ] **ComplianceOfficer:** Gemini call with `google_search` tool, `thinking_budget=512`. Output = permits, zoning, licensing, regulatory bodies.
- [ ] Log grounding metadata (citations) for judge questions

**Exit criterion:** Each agent returns usable JSON in isolation.

### Phase 3 — Orchestrator + parallel dispatch (Day 2)

- [ ] Company ingest: PDF parse (PyPDF2) **or** website fetch (httpx) **or** raw text → `company_summary`
- [ ] Orchestrator: parse deck → extract company context → dispatch 3 agents in parallel via `asyncio.gather`
- [ ] Orchestrator compile: merge Cartographer + Broker + Compliance outputs → validate with Pydantic → return Battle Plan JSON
- [ ] In-memory session: `sessionId → { status, active_agents, result, chat_history }`
- [ ] **DeepVerifier:** Optional sequential pass if `deep_scope=true`, `thinking_budget=2048`, cross-examines all outputs

**Exit criterion:** `POST /api/scout` with company input + city + country returns full Battle Plan JSON in <30s.

- [ ] `POST /api/scout/:sessionId/chat` for follow-up Q&A on completed analysis

### Phase 4 — Frontend integration (Day 2–3)

- [ ] Input tabs (PDF / website / text) + city & country + **Deep Scope Strategy toggle** → poll with plane animation + agent stepper (showing 3 parallel indicators)
- [ ] Map: plot `competitors[].lat/lng` via vis.gl/react-google-maps
- [ ] Cards: Competitors, Networking, Events, Compliance, Strategy, First Week; **Ask Scout** chat panel
- [ ] Deep Scope indicators — if toggle was on, show "verified" badge on analysis
- [ ] Error UI: timeout, grounding failure, retry with cached demo JSON

**Exit criterion:** One recording-quality demo path with no terminal.

### Phase 5 — Polish & rubric (Day 3)

- [ ] Slide: Problem → 5-agent architecture → 30s live demo → Gemini features table
- [ ] README: architecture, env setup, demo script
- [ ] Optional: export Battle Plan as PDF/JSON download

---

## 8. Live Demo Script

**Duration:** 90 seconds total (30s product, rest narration).

| Time | Action | Screen |
|------|--------|--------|
| 0:00 | "Meet ScoutAI — we fix terrain blindness." | Title slide |
| 0:15 | Paste company website or upload PDF / text | Input tabs |
| 0:20 | Enter `Austin` + `United States` (+ toggle Deep Scope) | Location fields + toggle |
| 0:22 | Click **Generate Battle Plan** | Scout plane flies; 3 agents run in parallel: Cartographer ∥ Broker ∥ Compliance |
| 0:40 | Map populates with competitors | Maps view |
| 0:48 | Scroll Networking + Events | Cards |
| 0:55 | Highlight Compliance section | Permits & regulations in Austin |
| 1:02 | Show Strategy bullets + First Week | "Deep verified" badge if toggled |
| 1:10 | Ask Scout: *"Who should I partner with first?"* | Chat on analysis |
| 1:15 | Mention Gemini: Maps + Search grounding, 1M context, `thinking_budget`, parallel `asyncio.gather` | Talking head / architecture inset |

**Narration hook:** *"What used to take a consultant three weeks — we did in thirty seconds with 3 parallel agents plus optional deep verification."*

---

## 9. API & Endpoint Sketch

```
POST /api/scout
  Body: { input_type: pdf|website|text, file?, website_url?, company_text?, city, country, deep_scope?: boolean }
  Response: { session_id }

GET /api/scout/:session_id
  Response: { status: "running"|"done"|"error", active_agents: string[], progress: number, result?: BattlePlan, error? }

POST /api/scout/:session_id/chat
  Body: { message: string }
  Response: { reply: string, citations?: string[] }

GET /api/health
```

Backend responsibilities:

1. Store PDF bytes in memory (session TTL ~1h).  
2. Run agent pipeline via `asyncio.gather`; stream progress labels to frontend.  
3. Return Battle Plan JSON; frontend never calls Gemini directly (keeps keys server-side).

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Live API latency | `thinking_budget=256` on Cartographer (fastest); all 3 agents run in parallel via `asyncio.gather` |
| Grounding empty results | Explicit city + industry in prompt; fallback cached Austin JSON |
| PDF parse failure | Accept `.txt` backup; pre-extracted `company_summary` in demo build |
| Geocoding missing lat/lng | Backend geocode addresses via Maps Geocoding API |
| Gemini API rate limits | 3 parallel calls within asyncio is well within limits; cache responses in dev |

---

## 11. Success Criteria (Definition of Done)

- [ ] User uploads PDF and enters city from web UI  
- [ ] At least **3** Gemini 3.5 Flash agents (Cartographer, Broker, ComplianceOfficer) run in **parallel** via `asyncio.gather`
- [ ] Cartographer uses **native Maps grounding**; Broker and ComplianceOfficer use **native Search grounding**
- [ ] Output is **structured JSON** (Pydantic-validated) consumed by the dashboard  
- [ ] Interactive map shows **≥3** competitor pins for demo city  
- [ ] Compliance section populated with permits and zoning  
- [ ] DeepVerifier runs on toggle with `thinking_budget=2048`  
- [ ] End-to-end base demo completes in **<30 seconds**; with DeepVerifier <60s  
- [ ] No auth, no database — demo-only scope honored  

---

## 12. Naming Reference

| Name | Usage |
|------|--------|
| **ScoutAI** | Product / hackathon title |
| **TerraScout** | Internal codename for agent subsystem |
| **Battle Plan** | User-facing output document |
| **Orchestrator** | Root agent that ingests PDF + dispatches + compiles |
| **Cartographer** | Maps grounding agent (competitors, POIs, spatial) |
| **Broker** | Search grounding agent (networking, events, contacts) |
| **ComplianceOfficer** | Search grounding agent (permits, zoning, regulation) |
| **DeepVerifier** | Optional deep-reasoning agent (cross-examination, risk) |

---

## 13. Next Actions (Immediate)

1. `pip install google-genai python-multipart python-dotenv pydantic fastapi uvicorn PyPDF2 httpx`
2. Implement Pydantic `BattlePlan` schema + mock JSON for Austin.
3. Build and test **Cartographer** (maps grounding, thinking_budget=256) in isolation.
4. Build and test **Broker** + **ComplianceOfficer** (search grounding, thinking_budget=512) in isolation.
5. Wire Orchestrator: PDF ingest → `asyncio.gather`(Carto, Broker, Compliance) → merge → Pydantic validate.
6. Add **DeepVerifier** optional pass with `thinking_budget=2048`.
7. Record a 30s screen capture early — even with mock data — to validate pacing.

---

*Last updated: hackathon planning — ScoutAI / TerraScout*
