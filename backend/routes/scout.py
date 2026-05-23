"""Scout pipeline endpoints — backend + frontend contracts."""
from __future__ import annotations

import asyncio
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from backend import sessions
from backend.deck_ingest import ingest_pdf, ingest_text, ingest_website
from backend.frontend_adapter import derive_agent_progress, payload_to_frontend
from backend.orchestrator import run_battle_plan
from backend.skills import SKILL_REGISTRY
from backend.gemini_client import generate_grounded_text

router = APIRouter()


def _status_response(sess: sessions.Session) -> dict:
    active_agent, progress_msg = derive_agent_progress(
        sess.status, sess.progress, sess.error
    )
    out: dict = {
        "session_id": sess.id,
        "sessionId": sess.id,
        "status": sess.status,
        "progress": progress_msg,
        "active_agent": active_agent,
    }
    if sess.error:
        out["error"] = sess.error
    if sess.result is not None:
        out["result"] = payload_to_frontend(sess.result, sess.target_country)
    return out


async def _run_scout_job(
    sess: sessions.Session,
    *,
    target_city: str,
    pdf_bytes: bytes | None = None,
    company_summary: str | None = None,
    industry: str | None = None,
    website_url: str | None = None,
    company_text: str | None = None,
    skills: list[str] | None = None,
) -> None:
    selected = skills or list(SKILL_REGISTRY.keys())
    try:
        if pdf_bytes:
            sess.progress.append("The General is reading your deck…")
            deck = await ingest_pdf(pdf_bytes)
            cs, ind = deck.company_summary, deck.industry
        elif website_url:
            sess.progress.append("The General is reading your website…")
            deck = await ingest_website(website_url)
            cs, ind = deck.company_summary, deck.industry
        elif company_text:
            sess.progress.append("The General is reading your company profile…")
            deck = await ingest_text(company_text)
            cs, ind = deck.company_summary, deck.industry
        elif company_summary and industry:
            cs, ind = company_summary, industry
        elif company_summary:
            sess.progress.append("Inferring industry from description…")
            deck = await ingest_text(company_summary)
            cs, ind = deck.company_summary, deck.industry
        else:
            raise ValueError("No company input provided")

        sess.progress.append(
            f"Cartographer & Networker scouting {target_city} ({len(selected)} agents)…"
        )
        plan, results = await run_battle_plan(
            company_summary=cs,
            industry=ind,
            target_city=target_city,
            selected_skills=selected,
        )
        for r in results:
            tag = "✓" if r.error is None else "✗"
            sess.progress.append(f"{tag} {r.skill_name}")

        sess.progress.append("Strategist is compiling your Battle Plan…")
        sess.result = plan.model_dump()
        sess.status = "done"
    except Exception as e:
        sess.error = str(e)
        sess.status = "error"


# ---------------------------------------------------------------------------
# Frontend contract (Next.js)
# ---------------------------------------------------------------------------


@router.post("/api/scout")
async def scout_start(
    input_type: str = Form(...),
    city: str = Form(...),
    country: str = Form(...),
    file: Optional[UploadFile] = File(None),
    website_url: Optional[str] = Form(None),
    company_text: Optional[str] = Form(None),
) -> dict[str, str]:
    """Start scout — matches frontend `POST /api/scout` multipart shape."""
    if input_type not in ("pdf", "website", "text"):
        raise HTTPException(400, detail="input_type must be pdf, website, or text")

    target_city = f"{city.strip()}, {country.strip()}"
    sess = sessions.new_session()
    sess.target_country = country.strip()
    sess.progress.append("Launching scout…")

    pdf_bytes: bytes | None = None
    if input_type == "pdf":
        if file is None:
            raise HTTPException(400, detail="PDF file required for input_type=pdf")
        pdf_bytes = await file.read()
    elif input_type == "website":
        if not website_url:
            raise HTTPException(400, detail="website_url required")
    elif input_type == "text":
        if not company_text or len(company_text.strip()) < 20:
            raise HTTPException(400, detail="company_text required (min 20 chars)")

    asyncio.create_task(
        _run_scout_job(
            sess,
            target_city=target_city,
            pdf_bytes=pdf_bytes,
            website_url=website_url if input_type == "website" else None,
            company_text=company_text if input_type == "text" else None,
        )
    )
    return {"sessionId": sess.id, "session_id": sess.id}


@router.get("/api/scout/{session_id}")
async def scout_poll(session_id: str) -> dict:
    sess = sessions.get(session_id)
    if sess is None:
        raise HTTPException(404, detail="Unknown session id")
    return _status_response(sess)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


@router.post("/api/scout/{session_id}/chat")
async def scout_chat(session_id: str, body: ChatRequest) -> dict:
    sess = sessions.get(session_id)
    if sess is None:
        raise HTTPException(404, detail="Unknown session id")
    if sess.status != "done" or not sess.result:
        raise HTTPException(400, detail="Battle Plan not ready yet")

    plan_view = payload_to_frontend(sess.result, sess.target_country)
    history = "\n".join(
        f"{m['role']}: {m['content']}" for m in sess.chat_history[-6:]
    )
    prompt = (
        "You are Ask Scout, a follow-up assistant for Google AI Scout market expansion.\n"
        f"Battle Plan JSON:\n{plan_view}\n\n"
        f"Prior chat:\n{history or '(none)'}\n\n"
        f"User question: {body.message}\n\n"
        "Answer concisely using only the Battle Plan. Use **bold** for names. "
        "If unsure, say what data is missing."
    )
    reply, _ = await generate_grounded_text(prompt, grounding="none", thinking="low")
    sess.chat_history.append({"role": "user", "content": body.message})
    sess.chat_history.append({"role": "assistant", "content": reply})
    return {"reply": reply}


# ---------------------------------------------------------------------------
# Original backend contract (CLI / tests)
# ---------------------------------------------------------------------------


@router.post("/api/scout/run")
async def scout_run(
    city: str = Form(..., description="Target city, e.g. 'Austin, TX'"),
    skills: list[str] | None = Form(None),
    file: Optional[UploadFile] = File(None),
    company_summary: Optional[str] = Form(None),
    industry: Optional[str] = Form(None),
) -> dict[str, str]:
    selected = skills or list(SKILL_REGISTRY.keys())
    bad = [s for s in selected if s not in SKILL_REGISTRY]
    if bad:
        raise HTTPException(
            400,
            detail=f"Unknown skill(s): {bad}. Available: {list(SKILL_REGISTRY.keys())}",
        )

    if file is None and not (company_summary and industry) and not company_summary:
        raise HTTPException(
            400,
            detail="Provide file (PDF) or company_summary (and optionally industry).",
        )

    pdf_bytes = await file.read() if file is not None else None
    sess = sessions.new_session()

    asyncio.create_task(
        _run_scout_job(
            sess,
            target_city=city,
            pdf_bytes=pdf_bytes,
            company_summary=company_summary,
            industry=industry,
            skills=selected,
        )
    )
    return {"session_id": sess.id}
