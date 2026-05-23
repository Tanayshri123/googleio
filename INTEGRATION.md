# Google AI Scout — Frontend ↔ Backend Integration

## Architecture

| Layer | Port | Role |
|-------|------|------|
| **Next.js** (`frontend/`) | 3000 | UI, polls `GET /api/scout/{id}` |
| **FastAPI** (`main.py`) | 8000 | Gemini 3.5 Flash agents, session store |

Model: **`gemini-3.5-flash`** via `GEMINI_MODEL` in root `.env`.

## Setup

### 1. Backend API key (required for real runs)

```bash
cp .env.example .env
# Edit .env — set GEMINI_API_KEY from https://aistudio.google.com
```

### 2. Python backend

```bash
cd /path/to/googleio
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Verify: `curl http://localhost:8000/api/health`  
→ `{"status":"ok","model":"gemini-3.5-flash"}`

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

`.env.local`:

```bash
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Open http://localhost:3000 — submit PDF, website, or text + city/country.

## API contract (wired)

| Frontend | Backend |
|----------|---------|
| `POST /api/scout` (multipart) | `routes/scout.py` → `scout_start` |
| `GET /api/scout/:sessionId` | Returns `status`, `progress`, `active_agent`, `result` (frontend-shaped) |
| `POST /api/scout/:sessionId/chat` | Ask Scout follow-ups |

`result` is transformed from `BattlePlanPayload` (5 skills) → flat `BattlePlan` for the dashboard.

## Smoke test

```bash
chmod +x scripts/smoke_integration.sh
./scripts/smoke_integration.sh
```

## Mock mode (no backend)

```bash
# frontend/.env.local
NEXT_PUBLIC_USE_MOCK=true
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `GEMINI_API_KEY is not set` | Add key to root `.env`, restart uvicorn |
| CORS / network error | Ensure backend on 8000, `NEXT_PUBLIC_API_URL` correct |
| Stuck on scouting | Check terminal running uvicorn for skill errors |
| Empty map pins | Competitor skill may have failed — check `progress` lines with `✗` |
