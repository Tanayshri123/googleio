from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import uuid
import logging
import json
import os
import httpx
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

_REPO_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_REPO_ROOT / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

from lib.types import (
    ScoutRequest,
    ScoutStatus,
    ChatRequest,
    ChatResponse,
    BattlePlan,
    GeocodeResult,
)
from lib.orchestrator import run_scout_pipeline, get_session, sessions
from lib.ask_scout import generate_ask_scout_reply, append_chat_turn
from lib.text_utils import strip_html

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MOCK_PATH = Path(__file__).resolve().parent / "mock" / "battle-plan-austin.json"


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("ScoutAI backend started")
    yield


app = FastAPI(title="ScoutAI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    has_key = bool(os.environ.get("GEMINI_API_KEY", "").strip())
    return {
        "status": "ok" if has_key else "degraded",
        "active_sessions": len(sessions),
        "gemini_configured": has_key,
    }


@app.post("/api/scout")
async def create_scout(
    input_type: str = Form(default="text"),
    city: str = Form(...),
    country: str = Form(...),
    deep_scope: str = Form(default="false"),
    company_text: Optional[str] = Form(default=None),
    website_url: Optional[str] = Form(default=None),
    file: Optional[UploadFile] = File(default=None),
):
    session_id = str(uuid.uuid4())
    company_context = ""

    if input_type == "pdf" and file:
        try:
            content = await file.read()
            company_context = content.decode("utf-8", errors="replace")[:50000]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read PDF: {e}")
    elif input_type == "website" and website_url:
        company_context = f"Website URL: {website_url}\n\nScrape and analyze this company's website."
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(website_url, follow_redirects=True)
                if resp.status_code == 200:
                    body = strip_html(resp.text, max_len=8000)
                    company_context += f"\n\nWebsite content:\n{body}"
        except Exception as e:
            logger.warning(f"Website fetch failed for {website_url}: {e}")
    elif input_type == "text" and company_text:
        company_context = company_text
    else:
        raise HTTPException(status_code=400, detail="No company input provided")

    if not city or not country:
        raise HTTPException(status_code=400, detail="City and country are required")

    is_deep = deep_scope.lower() in ("true", "1", "yes")

    asyncio.create_task(
        run_scout_pipeline(
            session_id=session_id,
            company_context=company_context,
            city=city,
            country=country,
            deep_scope=is_deep,
        )
    )
    return {"sessionId": session_id}


@app.get("/api/scout/{session_id}")
async def get_scout_status_route(session_id: str):
    status = get_session(session_id)
    if status is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return status.model_dump(mode="json")


@app.post("/api/scout/{session_id}/chat")
async def chat_with_scout(session_id: str, request: ChatRequest):
    plan: BattlePlan | None = None
    status = get_session(session_id)

    if status is not None:
        if status.status != "done" or not status.result:
            raise HTTPException(status_code=400, detail="Scout not yet complete")
        plan = status.result
    elif request.plan:
        plan = BattlePlan.model_validate(request.plan)
    else:
        raise HTTPException(status_code=404, detail="Session not found")

    history = [
        {"role": m.role, "content": m.content}
        for m in request.history
        if m.role in ("user", "assistant") and m.content.strip()
    ]
    if status is not None and not history and status.chat_history:
        history = [
            {"role": m.role, "content": m.content}
            for m in status.chat_history
        ]

    try:
        reply = await generate_ask_scout_reply(
            plan=plan,
            message=request.message,
            history=history,
        )
    except Exception as exc:
        logger.exception("Ask Scout failed for session %s", session_id)
        raise HTTPException(
            status_code=502,
            detail=f"Ask Scout could not reach the model: {exc}",
        ) from exc

    if status is not None:
        append_chat_turn(
            status.chat_history,
            request.message,
            reply,
        )
        sessions[session_id] = status

    return ChatResponse(reply=reply, citations=[])


@app.get("/api/geocode")
async def geocode(q: str):
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
    maps_key = os.environ.get("GOOGLE_MAPS_KEY", "")
    if maps_key:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://maps.googleapis.com/maps/api/geocode/json",
                params={"address": q, "key": maps_key},
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("results"):
                    loc = data["results"][0]["geometry"]["location"]
                    return GeocodeResult(lat=loc["lat"], lng=loc["lng"])
    return GeocodeResult(lat=30.2672, lng=-97.7431)


@app.post("/api/scout/mock")
async def scout_mock(
    input_type: str = Form(default="text"),
    city: str = Form(default="Austin"),
    country: str = Form(default="United States"),
    deep_scope: str = Form(default="false"),
    company_text: Optional[str] = Form(default=None),
    website_url: Optional[str] = Form(default=None),
    file: Optional[UploadFile] = File(default=None),
):
    if not MOCK_PATH.exists():
        raise HTTPException(status_code=503, detail="Mock data not available")
    session_id = str(uuid.uuid4())
    with open(MOCK_PATH) as f:
        data = json.load(f)
    battle_plan = BattlePlan(**data)
    status = ScoutStatus(
        session_id=session_id,
        status="done",
        active_agent=None,
        progress=100,
        result=battle_plan,
    )
    sessions[session_id] = status
    return {"sessionId": session_id}
