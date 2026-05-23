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

## 4. Technical Architecture — Distributed Orchestrator (ADK)

Pattern: **Root orchestrator** + **specialist sub-agents** + **compiler** (Google ADK / Interactions API style).

```
┌─────────────────────────────────────────────────────────────┐
│  User: PDF upload + target city                             │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Root Orchestrator ("The General")                          │
│  • Ingest PDF, extract value prop & niche                   │
│  • Decompose tasks, route to sub-agents                     │
│  • Model: gemini-3.5-flash                                  │
└───────┬─────────────────────┬───────────────────────────────┘
        ▼                     ▼
┌───────────────┐     ┌───────────────────┐
│ Cartographer  │     │ Networker         │
│ Maps agent    │     │ Search agent      │
│ thinking: low │     │ thinking: medium  │
│ Maps tool     │     │ Search tool       │
└───────┬───────┘     └─────────┬─────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
        ┌───────────────────────┐
        │ Strategist (Compiler) │
        │ Pydantic / JSON schema│
        │ Structured Battle Plan│
        └───────────┬───────────┘
                    ▼
        ┌───────────────────────┐
        │ Next.js dashboard     │
        │ Map + data cards      │
        └───────────────────────┘
```

### Agent definitions

| Agent | Role | Model config | Tools | Output |
|-------|------|--------------|-------|--------|
| **Root Orchestrator** | Parse deck, summarize company, assign research | `gemini-3.5-flash` | File ingest (PDF) | Task briefs for sub-agents |
| **Cartographer** | Spatial / competitive terrain | `gemini-3.5-flash`, `thinking_level: low` | **Google Maps grounding** | Competitors, complements, industry neighborhoods, POIs |
| **Networker** | Temporal / people / web intel | `gemini-3.5-flash`, `thinking_level: medium` | **Google Search grounding** | Leaders, events, communities, regulatory notes |
| **Strategist** | Merge + structure for UI | `gemini-3.5-flash` | None (synthesis) | Validated JSON via Pydantic schema |

### Structured output schema (Strategist)

```json
# can be modified
{
  "company_summary": "string",
  "target_city": "string",
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
| **Frontend** | Next.js or React | File upload (PDF), city input, loading states, map (Google Maps JS API), cards: Competitors, Events, Strategy |
| **Backend** | Node.js or Python | Interactions API (beta) / ADK multi-agent workflow, in-memory session (no DB) |
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
3. **Orchestration works:** Three specialists run in sequence (or parallel where API allows), then Strategist merges.  
4. **Speed works:** Full run completes in &lt; 60s (target ~30s) with visible progress.  
5. **UI works:** One click from upload → Battle Plan on map + cards.

### Recommended demo scenario (frozen for judges)

| Field | Value |
|-------|--------|
| **Demo company** | B2B SaaS (e.g., "workflow automation for restaurants") — use a real 5–10 slide PDF |
| **Demo city** | **Austin, TX** (rich Maps/Search signal; narrative: "expanding from SF") |
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

### Phase 2 — Single specialist agents (Day 1–2)

- [ ] **Cartographer:** Prompt + Maps grounding only; input = `{ company_summary, city, industry }`; output = raw findings text/JSON
- [ ] **Networker:** Prompt + Search grounding only; same inputs; output = events, contacts, regulation
- [ ] Log grounding metadata (citations) for judge questions

**Exit criterion:** Each agent returns usable JSON in isolation via CLI or `/api/test/cartographer`.

### Phase 3 — Orchestrator (Day 2)

- [ ] PDF upload → extract text (or pass file to Gemini multimodal) → `company_summary`
- [ ] Orchestrator prompt: decompose into Cartographer + Networker task strings
- [ ] Wire pipeline: Orchestrator → Cartographer ∥ Networker (parallel if supported) → Strategist
- [ ] In-memory session: `sessionId → { status, partial, final }`

**Exit criterion:** `POST /api/scout` with PDF + city returns full Battle Plan JSON.

### Phase 4 — Frontend integration (Day 2–3)

- [ ] Upload + city form → call backend → SSE or polling for progress ("Cartographer mapping…")
- [ ] Map: plot `competitors[].lat/lng` (geocode if agent returns addresses only)
- [ ] Cards: Competitors, Events, Strategy / First week
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
| 0:15 | Upload sample pitch deck | Drop zone |
| 0:20 | Enter `Austin, TX` | City field |
| 0:22 | Click **Generate Battle Plan** | Loading: Orchestrator → Cartographer → Networker → Strategist |
| 0:45 | Map populates with competitors | Maps view |
| 0:55 | Scroll Events + Key contacts | Cards |
| 1:05 | Highlight Strategy bullets | "First week in Austin" |
| 1:15 | Mention Gemini: Maps + Search grounding, 1M context, ADK orchestration | Talking head / architecture inset |

**Narration hook:** *"What used to take a consultant three weeks—we did in thirty seconds with three grounded agents."*

---

## 9. API & Endpoint Sketch

```
POST /api/scout
  Body: multipart { file: PDF, city: string }
  Response: { sessionId }

GET /api/scout/:sessionId
  Response: { status: "running"|"done"|"error", progress: string, result?: BattlePlan }

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
| Interactions API beta changes | Thin adapter layer; swap implementation without UI change |

---

## 11. Success Criteria (Definition of Done)

- [ ] User uploads PDF and enters city from web UI  
- [ ] At least **two** Gemini 3.5 Flash agents use **native** Maps and Search grounding respectively  
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

1. Initialize monorepo (`frontend` + `backend`).  
2. Implement Pydantic `BattlePlan` schema + mock API.  
3. Build Cartographer with Maps grounding against Austin.  
4. Record a 30s screen capture early—even with mock data—to validate pacing.  

---

*Last updated: hackathon planning — Google AI Scout / TerraScout*
