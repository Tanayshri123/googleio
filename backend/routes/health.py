import asyncio
import json
import urllib.parse
import urllib.request

from fastapi import APIRouter, HTTPException, Query

from backend.config import GEMINI_MODEL

router = APIRouter()


@router.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "model": GEMINI_MODEL}


def _nominatim_search(query: str) -> dict[str, float] | None:
    params = urllib.parse.urlencode({"q": query, "format": "json", "limit": "1"})
    url = f"https://nominatim.openstreetmap.org/search?{params}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "GoogleAIScout/1.0 (hackathon demo)"},
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        data = json.loads(resp.read().decode())
    if not data:
        return None
    return {"lat": float(data[0]["lat"]), "lng": float(data[0]["lon"])}


@router.get("/api/geocode")
async def geocode(q: str = Query(..., min_length=2, max_length=500)) -> dict[str, float]:
    """Proxy geocoding so the browser is not blocked by Nominatim CORS."""
    try:
        result = await asyncio.to_thread(_nominatim_search, q.strip())
    except Exception as exc:
        raise HTTPException(502, detail=f"Geocoding failed: {exc}") from exc
    if result is None:
        raise HTTPException(404, detail="No results for query")
    return result
