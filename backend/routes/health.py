from fastapi import APIRouter

from backend.config import GEMINI_MODEL

router = APIRouter()


@router.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "model": GEMINI_MODEL}
