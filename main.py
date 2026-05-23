"""Google AI Scout — FastAPI entrypoint.

Run locally:
    uvicorn main:app --reload --port 8000

Endpoints:
    GET  /api/health
    GET  /api/skills                    — list available skills + their schemas
    POST /api/skills/{name}             — run one skill standalone
    POST /api/scout/run                 — full pipeline (multipart)
    GET  /api/scout/{session_id}        — poll a running pipeline
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import health, scout, skills

app = FastAPI(
    title="Google AI Scout",
    description="Multi-agent market expansion battle planner.",
    version="0.1.0",
)

# Permissive CORS for hackathon dev — tighten before any real deploy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(skills.router)
app.include_router(scout.router)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "name": "Google AI Scout",
        "docs": "/docs",
        "skills": "/api/skills",
    }
