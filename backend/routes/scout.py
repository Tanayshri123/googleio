"""Full battle-plan pipeline endpoints.

POST /api/scout/run    -> kick off generation (multipart: PDF or raw text)
GET  /api/scout/{sid}  -> poll status + result
"""
from __future__ import annotations

import asyncio
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend import sessions
from backend.deck_ingest import ingest_pdf, ingest_text
from backend.orchestrator import run_battle_plan
from backend.skills import SKILL_REGISTRY

router = APIRouter()


@router.post("/api/scout/run")
async def scout_run(
    city: str = Form(..., description="Target city, e.g. 'Austin, TX'"),
    skills: list[str] | None = Form(None, description="Subset of skills to run; default = all 5"),
    file: Optional[UploadFile] = File(None, description="Pitch deck PDF (optional)"),
    company_summary: Optional[str] = Form(None, description="Used if no PDF uploaded"),
    industry: Optional[str] = Form(None, description="Used if no PDF uploaded"),
) -> dict[str, str]:
    """Kick off a battle plan generation in the background. Returns session id."""

    # Validate skills selection
    selected = skills or list(SKILL_REGISTRY.keys())
    bad = [s for s in selected if s not in SKILL_REGISTRY]
    if bad:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown skill(s): {bad}. Available: {list(SKILL_REGISTRY.keys())}",
        )

    # Must have either a PDF or a (company_summary + industry) pair
    if file is None and not (company_summary and industry):
        raise HTTPException(
            status_code=400,
            detail="Provide either a 'file' (PDF) or both 'company_summary' and 'industry'.",
        )

    pdf_bytes = await file.read() if file is not None else None
    sess = sessions.new_session()

    async def _job() -> None:
        try:
            if pdf_bytes:
                sess.progress.append("Ingesting deck...")
                deck = await ingest_pdf(pdf_bytes)
                cs, ind = deck.company_summary, deck.industry
            elif company_summary and not industry:
                sess.progress.append("Inferring industry from description...")
                deck = await ingest_text(company_summary)
                cs, ind = deck.company_summary, deck.industry
            else:
                cs, ind = company_summary or "", industry or ""

            sess.progress.append(f"Running {len(selected)} skill(s) in parallel...")
            plan, results = await run_battle_plan(
                company_summary=cs,
                industry=ind,
                target_city=city,
                selected_skills=selected,
            )
            for r in results:
                tag = "✓" if r.error is None else "✗"
                sess.progress.append(f"{tag} {r.skill_name}{f' ({r.error})' if r.error else ''}")

            sess.result = plan.model_dump()
            sess.status = "done"
        except Exception as e:
            sess.error = str(e)
            sess.status = "error"

    asyncio.create_task(_job())
    return {"session_id": sess.id}


@router.get("/api/scout/{session_id}")
async def scout_status(session_id: str) -> dict:
    sess = sessions.get(session_id)
    if sess is None:
        raise HTTPException(status_code=404, detail="Unknown session id")
    return {
        "session_id": sess.id,
        "status": sess.status,
        "progress": sess.progress,
        "result": sess.result,
        "error": sess.error,
    }
