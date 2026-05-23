# Google AI Scout — Project Spec & Simulation Steps

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
- what brands or people to parter with

Traditional market research is slow (weeks of manual work) and expensive (consultants).

### Solution: Google AI Scout

A **multi-agent market expansion platform**. The user uploads a company pitch deck or business plan and enters a target city. Sub-agents use **Google Maps** and **Google Search** grounding to autonomously map the terrain—competitors, contacts, events, neighborhood/industry signals—and output a structured **Battle Plan** for the dashboard.

### One-liner (judges)

> *"We turn terrain blindness into a 30-second Battle Plan—Gemini 3.5 Flash agents grounded in Maps and Search, orchestrated like a distributed research team."*

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
| **1M context window** | Ingest full PDFs (deck, financials, catalog) for niche-accurate research |
| **High throughput (~289 tok/s)** | Many sub-agent turns; dashboard fills in seconds for live demo |

**Hackathon alignment:** Native tool use + multi-step agentic workflow + real-world grounding—not a single monolithic prompt.

---

## 4. Technical Architecture — Google ADK (Agent Development Kit)

Framework: **Google ADK** — root orchestrator dispatches tasks to n parallel specialist sub-agents, then a compiler merges their outputs.

```
┌─────────────────────────────────────────────────────────────┐
│  User: PDF upload + target city                             │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Root Orchestrator ("The General")      ← ADK Agent          │
│  • Ingest PDF, extract value prop & niche                   │
│  • Decompose tasks, route to sub-agents                     │
│  • Model: gemini-3.5-flash                                  │
└───────┬─────────────────────┬───────────────┬───────────────┘
        │                     │               │  ← ADK parallel dispatch
        ▼                     ▼               ▼ (extensible — add more)
┌───────────────┐  ┌───────────────────┐  ┌──────────────────┐
│ Cartographer  │  │ Networker         │  │ [Future Agent]   │
│ Maps agent    │  │ Search agent      │  │ e.g. Financial   │
│ thinking: low │  │ thinking: medium  │  │ Legal / Culture  │
│ Maps tool     │  │ Search tool       │  │ ...              │
└───────┬───────┘  └─────────┬─────────┘  └────────┬─────────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             ▼
        ┌───────────────────────────────────────────────┐
        │ Strategist (Compiler)         ← ADK Agent      │
        │ Pydantic / JSON schema                         │
        │ Merges all sub-agent outputs → Battle Plan      │
        └───────────────────┬───────────────────────────┘
                            ▼
        ┌───────────────────────────────────────────────┐
        │ Next.js dashboard                             │
        │ Map + data cards      │
        └───────────────────────┘
```

### Agent definitions (Google ADK)

All agents are built as **ADK agents** with `gemini-3.5-flash`. The Orchestrator dispatches sub-agents in parallel via ADK's built-in orchestration. Adding new sub-agents is a matter of defining a new ADK agent and registering it on the dispatch list.

| Agent | ADK Type | Role | Tools | Output |
|-------|----------|------|-------|--------|
| **Root Orchestrator** | `LlmAgent` | Parse deck, summarize company, assign research to sub-agents | File ingest (PDF) | Task briefs dispatched to sub-agents |
| **Cartographer** | `LlmAgent` (thinking: low) | Spatial / competitive terrain | **Google Maps grounding** | Competitors, complements, industry neighborhoods, POIs |
| **Networker** | `LlmAgent` (thinking: medium) | Temporal / people / web intel | **Google Search grounding** | Leaders, events, communities, regulatory notes |
| **Strategist** | `LlmAgent` | Merge + structure for UI | None (synthesis) | Validated JSON via Pydantic schema |
| *[Extensible]* | `LlmAgent` | Add more parallel agents (Legal, Financial, Culture, Talent…) | Any Google grounding tool | Merged by Strategist |

### Structured output schema (Strategist)

```json
# can be modified
{
  "company_summary": "string",
  "target_city": "string",
  "target_country": "string",
  "competitors": [
    { "name": "string", "address": "string", "lat": 0, "lng": 0, "notes": "string" }
  ],
  "complementary_businesses": [],
  "neighborhoods": [
    { "name": "string", "why_relevant": "string" }
  ],
  "events": [
    { "title": "string", "date": "string", "url": "string", "relevance": "string" }
  ],
  "key_contacts": [
    { "name": "string", "role": "string", "source": "string" }
  ],
  "communities": [
    { "name": "string", "platform": "string", "url": "string" }
  ],
  "regulatory_notes": ["string"],
  "strategy_bullets": ["string"],
  "recommended_first_week": ["string"]
}
```

---

## 5. Feature Scope

### In scope (demo-safe)

| Layer | Stack | Features |
|-------|-------|----------|
| **Frontend** | Next.js | Company input: **PDF, website URL, or text**; **city + country**; scout **plane animation** during agents; YC-style UI; map + cards; **Ask Scout** follow-up chat (no auth) |
| **Backend** | Python (FastAPI) | **Google ADK** multi-agent orchestration, in-memory session (no DB). Extensible — add new parallel sub-agents by defining ADK agents and registering on orchestrate list. |
| **AI** | Gemini 3.5 Flash | Maps + Search grounding, structured outputs |

### Out of scope

- Mobile apps  
- Auth / user accounts  
- Persistent database (session in memory only)  

---

## 6. Simulation — What We Are Proving

The **simulation** is not a game engine—it is an **end-to-end scripted demo** that proves the multi-agent pipeline under hackathon constraints.

### Simulation goals

1. **Grounding works:** Map pins and Search citations match a real city (use a fixed demo city for reliability).  
2. **Context works:** Uploaded deck changes competitor types and neighborhood focus.  
3. **ADK orchestration works:** Orchestrator dispatches multiple sub-agents in parallel via ADK, then Strategist merges their outputs. Pipeline is extensible — adding a new agent is additive only.  
4. **Speed works:** Full run completes in &lt; 60s (target ~30s) with visible progress.  
5. **UI works:** One click from upload → Battle Plan on map + cards.

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

- [ ] Create repo: `frontend/` (Next.js), `backend/` (Python FastAPI or Node Express)
- [ ] Obtain API keys: Gemini (3.5 Flash), Google Maps JavaScript API, enable Maps + Search grounding on Gemini
- [ ] Add `.env.example` (no secrets in git)
- [ ] Smoke test: single Gemini call with Maps grounding for `"coffee shops near downtown Austin"`

### Phase 1 — Strategist contract first (Day 1)

- [ ] Define Pydantic models matching JSON schema above
- [ ] Mock Strategist input: hard-coded Cartographer + Networker blobs → validate JSON → return to client
- [ ] Frontend: render mock Battle Plan (map markers + three card sections) **before** agents exist

**Exit criterion:** Dashboard looks finished with fake data.

### Phase 2 — Single specialist agents (ADK) (Day 1–2)

- [ ] **Cartographer:** Define as ADK `LlmAgent` with Maps grounding tool; input = `{ company_summary, city, industry }`; output = raw findings JSON
- [ ] **Networker:** Define as ADK `LlmAgent` with Search grounding tool; same inputs; output = events, contacts, regulation
- [ ] Log grounding metadata (citations) for judge questions

**Exit criterion:** Each ADK agent returns usable JSON in isolation via CLI or `/api/test/cartographer`.

### Phase 3 — ADK Orchestrator (Day 2)

- [ ] Company ingest: PDF **or** website fetch **or** raw text → `company_summary`
- [ ] Orchestrator (ADK): dispatches parallel sub-agents (Cartographer ∥ Networker ∥ *future agents*)
- [ ] Wire ADK pipeline: Orchestrator → {Cartographer, Networker, ...} (parallel dispatch) → Strategist
- [ ] In-memory session: `sessionId → { status, partial, final }`

**Exit criterion:** `POST /api/scout` with company input + city + country returns full Battle Plan JSON.

- [ ] `POST /api/scout/:sessionId/chat` for follow-up Q&A on completed analysis

### Phase 4 — Frontend integration (Day 2–3)

- [ ] Input tabs (PDF / website / text) + city & country → poll with plane animation + agent stepper
- [ ] Map: plot `competitors[].lat/lng` (geocode if agent returns addresses only)
- [ ] Cards: Competitors, Events, Strategy / First week; **Ask Scout** chat panel
- [ ] Error UI: timeout, grounding failure, retry with cached demo JSON

**Exit criterion:** One recording-quality demo path with no terminal.

### Phase 5 — Polish & rubric (Day 3)

- [ ] Slide: Problem → Agents diagram → 30s live demo → Gemini features table
- [ ] README: architecture, env setup, demo script
- [ ] Optional: export Battle Plan as PDF/JSON download

---

## 8. Live Demo Script (Simulation Runbook)

**Duration:** 90 seconds total (30s product, rest narration).

| Time | Action | Screen |
|------|--------|--------|
| 0:00 | "Meet Google AI Scout—we fix terrain blindness." | Title slide |
| 0:15 | Paste company website or upload PDF / text | Input tabs |
| 0:20 | Enter `Austin` + `United States` | Location fields |
| 0:22 | Click **Generate Battle Plan** | Scout plane flies; agents: General → Cartographer → Networker → Strategist |
| 1:10 | Ask Scout: *"Who should I partner with first?"* | Chat on analysis |
| 0:45 | Map populates with competitors | Maps view |
| 0:55 | Scroll Events + Key contacts | Cards |
| 1:05 | Highlight Strategy bullets | "First week in Austin" |
| 1:15 | Mention Gemini: Maps + Search grounding, 1M context, ADK orchestration | Talking head / architecture inset |

**Narration hook:** *"What used to take a consultant three weeks—we did in thirty seconds with ADK agents grounded in Maps and Search."*

---

## 9. API & Endpoint Sketch

```
POST /api/scout
  Body: { input_type: pdf|website|text, file?, website_url?, company_text?, city, country }
  Response: { sessionId }

GET /api/scout/:sessionId
  Response: { status, progress?, active_agent?, result?: BattlePlan, error? }

POST /api/scout/:sessionId/chat
  Body: { message: string }
  Response: { reply: string, citations?: string[] }

GET /api/health
```

Backend responsibilities:

1. Store PDF bytes in memory (session TTL ~1h).  
2. Run agent pipeline; stream progress labels to frontend.  
3. Return Strategist JSON; frontend never calls Gemini directly (keeps keys server-side).

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Live API latency | Parallel Cartographer + Networker; `thinking_level: low` on Maps agent |
| Grounding empty results | Prompt with explicit city + industry; fallback cached Austin JSON |
| PDF parse failure | Accept `.txt` backup; pre-extracted `company_summary` in demo build |
| Geocoding missing lat/lng | Backend geocode addresses via Maps Geocoding API |
| ADK API changes (beta) | All agents wrapped in thin adapter layer; swap implementation without UI change. ADK abstracts agent execution — adding new parallel agents is additive, not a rewrite. |

---

## 11. Success Criteria (Definition of Done)

- [ ] User uploads PDF and enters city from web UI  
- [ ] At least **two** Gemini 3.5 Flash ADK agents use **native** Maps and Search grounding respectively
- [ ] ADK orchestrator dispatches sub-agents in parallel; pipeline is extensible for future agents
- [ ] Output is **structured JSON** consumed by the dashboard  
- [ ] Interactive map shows **≥3** competitor pins for demo city  
- [ ] Events and strategy sections populated from Search agent  
- [ ] End-to-end demo completes in **&lt; 60 seconds** on conference Wi‑Fi (cached fallback acceptable if disclosed)  
- [ ] No auth, no database—demo-only scope honored  

---

## 12. Naming Reference

| Name | Usage |
|------|--------|
| **Google AI Scout** | Product / hackathon title |
| **TerraScout** | Internal codename for agent subsystem (optional in UI) |
| **Battle Plan** | User-facing output document |
| **The General** | Root orchestrator (docs/slides only) |
| **Cartographer / Networker / Strategist** | Sub-agent personas |

---

## 13. Next Actions (Immediate)

1. Initialize monorepo (`frontend` + `backend`) with **Google ADK** as agent framework.  
2. Implement Pydantic `BattlePlan` schema + mock API.  
3. Build Cartographer as ADK agent with Maps grounding against Austin.  
4. Wire ADK orchestrator with parallel sub-agent dispatch.  
5. Record a 30s screen capture early—even with mock data—to validate pacing.  

---

*Last updated: hackathon planning — Google AI Scout / TerraScout*
