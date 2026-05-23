# ScoutAI — Multi-Agent Market Expansion Platform

**Know every city like you're already there.**

Upload a pitch deck, pick a city. In ~30 seconds, five Gemini 3.5 Flash agents running in parallel map your competitors, networking opportunities, compliance requirements, and strategic path — all grounded in Google Maps and Search.

> *"We turn terrain blindness into a 30-second Battle Plan."*

---

## The Problem

Businesses expanding into new cities operate blind:

- **Who are the direct competitors and where are they?**
- **Where do founders and buyers actually network?**
- **What permits, zoning, and regulations apply?**
- **Which organizations, events, and community leaders matter?**

Traditional market research takes **weeks of manual work** and costs **thousands in consultant fees**. Smaller businesses are priced out entirely.

---

## The Solution

**ScoutAI** democratizes consultant-grade market research. Drop a pitch deck (PDF, website URL, or plain text) and enter a target city. Five specialized agents run in parallel, each using native Gemini 3.5 Flash tooling, to produce a complete expansion **Battle Plan** in under 30 seconds.

### What you get

| Section | Source | Content |
|---------|--------|---------|
| **Competitor Map** | Cartographer (Maps grounding) | Direct competitors with lat/lng, complementary businesses, industry neighborhoods |
| **Networking Ecosystem** | Broker (Search grounding) | Chambers of commerce, accelerators, key contacts, events, communities |
| **Compliance Baseline** | Compliance Officer (Search grounding) | Required permits, zoning, licensing, regulatory bodies, cost estimates |
| **Strategic Playbook** | Strategist (synthesis) | Actionable strategy bullets, recommended first-week checklist |
| **Deep Verification** | Deep Verifier (on-demand) | Cross-examination of all findings for anomalies, risks, and hidden opportunities |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     NEXT.JS FRONTEND                         │
│  Hero Landing → Scouting (plane + stepper) → Dashboard       │
│  Input: PDF | Website URL | Text   +   City & Country        │
│  Dashboard: Map (leaflet) + Intel Cards + Ask Scout Chat     │
└──────────────────────────┬───────────────────────────────────┘
                           │ FormData POST /api/scout
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    PYTHON FASTAPI BACKEND                    │
│  POST /api/scout     → creates session, fires async pipeline │
│  GET  /api/scout/:id → polls progress (active_agent, %)      │
│  POST /api/scout/:id/chat → Q&A over Battle Plan             │
│  GET  /api/geocode   → Maps geocoding proxy                  │
└──────────────────────────┬───────────────────────────────────┘
                           │ asyncio.gather (PARALLEL FAN-OUT)
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌──────────────────┐
│ Cartographer│  │   Broker    │  │ Compliance Officer│
│             │  │             │  │                  │
│ Maps API    │  │ Search API  │  │  Search API      │
│ think=256   │  │ think=512   │  │  think=512       │
└──────┬──────┘  └──────┬──────┘  └────────┬─────────┘
       │                │                  │
       └────────────────┼──────────────────┘
                        ▼
           ┌────────────────────────┐
           │    Strategist           │
           │    Merges all outputs   │
           │    → Battle Plan JSON   │
           └───────────┬────────────┘
                       │
           ┌───────────┴────────────┐
           │   Deep Verifier         │  ← only if "Deep Scope" toggle ON
           │   Cross-examines all    │
           │   think=2048            │
           └────────────────────────┘
```

### Agent Config (100% declarative — add agents without code changes)

Each agent is a directory with two files:

```
agents/cartographer/
├── AGENTS.md          ← Agent instructions (system prompt)
└── config.json        ← Runtime config
```

**`config.json` schema:**
```json
{
  "thinking_budget": 256,
  "tools": ["google_maps"],
  "parallel": true,
  "role": "cartographer"
}
```

Drop a new agent directory → auto-discovered, run in parallel, output auto-merged into Battle Plan. Custom output fields are stored in `agent_outputs` catch-all. **Zero code changes.**

### Five Agents

| # | Agent | Runs | thinking_budget | Tools | Produces |
|---|-------|------|-----------------|-------|----------|
| 1 | **Orchestrator** | Sequential first | 1024 | PDF ingest | Company context, dispatches sub-agents |
| 2 | **Cartographer** | Parallel | 256 | Google Maps | Competitors with lat/lng, neighborhoods, POIs |
| 3 | **Broker** | Parallel | 512 | Google Search | Networking orgs, events, contacts, communities |
| 4 | **Compliance Officer** | Parallel | 512 | Google Search | Permits, zoning, licensing, regulatory bodies |
| 5 | **Deep Verifier** | On-demand (toggle) | 2048 | Google Search | Risk assessment, anomaly detection, strategic QA |

---

## Why Gemini 3.5 Flash

| Capability | How ScoutAI Uses It |
|------------|---------------------|
| **Google Maps grounding** | Native `types.Tool(google_maps=...)` binds Cartographer to live Maps data — competitors pinned with real lat/lng |
| **Google Search grounding** | Native `types.Tool(google_search=...)` binds Broker, Compliance, and Deep Verifier to live web indices |
| **1M token context window** | Orchestrator ingests full pitch deck PDFs in a single pass |
| **High throughput (~289 tok/s)** | Three parallel agents via `asyncio.gather` — dashboard fills in seconds |
| **thinking_budget** | Tuned per agent: 256 for fast spatial lookups, 512 for web research, 2048 for deep cross-examination |

**Hackathon alignment:** Native tool use + multi-step parallel agentic workflow + real-world grounding. Not a monolithic prompt — a real distributed research team.

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Gemini API key ([get one here](https://aistudio.google.com))
- Google Maps API key (for geocoding, optional)

### 1. Backend

```bash
cd backend
cp .env.example .env          # Add GEMINI_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### 3. Open

`http://localhost:3000` — paste a company website, enter a city + country, toggle Deep Scope if you want the full verification pass, and click **Generate Scout Report**.

### Mock mode (no API key needed)

```bash
# frontend/.env.local
NEXT_PUBLIC_USE_MOCK=true
```

Pre-built Austin, TX Battle Plan loads instantly. Great for demos.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scout` | Start a scout. FormData: `input_type`, `city`, `country`, `deep_scope`, and `file`/`website_url`/`company_text`. Returns `{ sessionId }`. |
| `GET` | `/api/scout/:sessionId` | Poll progress. Returns `{ status, active_agent, progress, result? }`. |
| `POST` | `/api/scout/:sessionId/chat` | Follow-up Q&A on the completed Battle Plan. Body: `{ message }`. Returns `{ reply }`. |
| `GET` | `/api/geocode?q=...` | Geocode an address via Google Maps API. |
| `GET` | `/api/health` | Health check. |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Leaflet, shadcn/ui |
| **Backend** | Python FastAPI, `google-genai` SDK, Pydantic v2 |
| **AI** | Gemini 3.5 Flash with native Maps & Search grounding |
| **Orchestration** | `asyncio.gather` — non-blocking parallel agent fan-out |
| **Architecture** | Declarative agents — AGENTS.md + config.json, auto-discovered |

---

## Project Structure

```
googleio/
├── README.md                         ← You are here
├── PROJECT.md                        ← Full spec & implementation blueprint
├── FRONTEND.md                       ← Frontend design plan
├── backend/
│   ├── main.py                       ← FastAPI app
│   ├── requirements.txt
│   ├── agents/                       ← Declarative agent definitions
│   │   ├── orchestrator/             ← AGENTS.md + SKILL.md + config.json
│   │   ├── cartographer/             ← AGENTS.md + config.json
│   │   ├── broker/                   ← AGENTS.md + config.json
│   │   ├── compliance_officer/       ← AGENTS.md + config.json
│   │   └── deep_verifier/            ← AGENTS.md + config.json
│   ├── lib/
│   │   ├── types.py                  ← Pydantic BattlePlan schema
│   │   ├── managed_agents.py         ← Gemini SDK wrapper (auto-discovery)
│   │   ├── orchestrator.py           ← asyncio.gather fan-out + generic merge
│   │   └── text_utils.py             ← HTML stripping utilities
│   └── mock/
│       └── battle-plan-austin.json   ← Pre-built Austin demo data
├── frontend/
│   ├── app/                          ← Next.js App Router
│   ├── components/                   ← React components
│   │   ├── landing/                  ← Hero, input tabs, location fields
│   │   ├── scouting/                 ← Plane animation, agent stepper
│   │   ├── battle-plan/              ← Map, intel cards, strategy
│   │   └── ask-scout/                ← Chat panel
│   ├── hooks/                        ← use-scout, use-scout-chat
│   └── lib/                          ← API client, types, mock data
└── slides.md                         ← Slidev presentation deck
```

---

## Hackathon Track

**Gemini 3.5 Flash — Agentic Workflows**

- ✅ Multi-agent architecture (5 specialized agents)
- ✅ Native tool use (Google Maps + Search grounding via `types.Tool`)
- ✅ Parallel execution (3 agents via `asyncio.gather`)
- ✅ Structured outputs (`response_mime_type="application/json"`, Pydantic validated)
- ✅ Real-world grounding (live Maps pins, Search citations)
- ✅ 1M context window (full pitch deck ingestion)
- ✅ thinking_budget tuned per agent (256–2048)

---

## Team

Built at Google I/O 2026 Hackathon.

---

## License

MIT
