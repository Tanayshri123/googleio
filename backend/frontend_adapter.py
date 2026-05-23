"""Map backend BattlePlanPayload -> frontend BattlePlan JSON shape."""
from __future__ import annotations

from typing import Any, Literal, Optional

AgentId = Literal["general", "cartographer", "networker", "strategist"]


def _split_city_country(target_city: str, target_country: str = "") -> tuple[str, str]:
    if target_country:
        return target_city.split(",")[0].strip(), target_country
    parts = [p.strip() for p in target_city.split(",")]
    if len(parts) >= 2:
        return parts[0], ", ".join(parts[1:])
    return target_city, target_country or "United States"


def payload_to_frontend(
    payload: dict[str, Any],
    target_country: str = "",
) -> dict[str, Any]:
    """Convert BattlePlanPayload dict to the Next.js `BattlePlan` type."""
    ca = payload.get("competitor_analysis") or {}
    nb = payload.get("network_broker") or {}
    rh = payload.get("regulatory_hurdles") or {}
    mv = payload.get("market_vibe") or {}
    ce = payload.get("cost_estimation") or {}

    city, country = _split_city_country(
        payload.get("target_city", ""),
        target_country,
    )

    competitors = []
    for c in ca.get("competitors") or []:
        competitors.append(
            {
                "name": c.get("name", ""),
                "address": c.get("address", ""),
                "lat": float(c.get("lat") or 0),
                "lng": float(c.get("lng") or 0),
                "notes": c.get("notes") or c.get("popularity") or "",
            }
        )

    complementary: list[dict[str, str]] = []
    for item in ca.get("complementary_businesses") or []:
        if isinstance(item, str):
            complementary.append({"name": item, "notes": ""})
        elif isinstance(item, dict):
            complementary.append(
                {"name": item.get("name", ""), "notes": item.get("notes", "")}
            )

    neighborhoods = ca.get("neighborhoods") or []

    events = nb.get("events") or []
    key_contacts = nb.get("key_contacts") or []
    communities = nb.get("communities") or []

    regulatory_notes: list[str] = []
    if rh:
        if rh.get("summary"):
            regulatory_notes.append(rh["summary"])
        regulatory_notes.extend(rh.get("zoning_notes") or [])
        regulatory_notes.extend(rh.get("demographic_flags") or [])
        for p in rh.get("required_permits") or []:
            if isinstance(p, dict):
                regulatory_notes.append(
                    f"{p.get('name', 'Permit')} — {p.get('issuing_body', '')} "
                    f"({p.get('typical_timeline', 'timeline unknown')})"
                )

    strategy_bullets: list[str] = list(payload.get("strategy_bullets") or [])
    if not strategy_bullets:
        if ca.get("summary"):
            strategy_bullets.append(ca["summary"])
        if mv.get("narrative_summary"):
            strategy_bullets.append(mv["narrative_summary"])
        strategy_bullets.extend((mv.get("behavioral_trends") or [])[:2])

    recommended_first_week: list[str] = list(
        payload.get("recommended_first_week") or []
    )
    if not recommended_first_week:
        for e in (nb.get("events") or [])[:2]:
            recommended_first_week.append(
                f"Attend {e.get('title', 'local event')} ({e.get('date', 'TBD')})"
            )
        for org in (nb.get("organizations") or [])[:2]:
            recommended_first_week.append(
                f"Reach out to {org.get('name', 'local org')}"
            )
        if ce.get("summary"):
            recommended_first_week.append(f"Review cost posture: {ce['summary'][:120]}")

    return {
        "company_summary": payload.get("company_summary", ""),
        "target_city": city,
        "target_country": country,
        "competitors": competitors,
        "complementary_businesses": complementary,
        "neighborhoods": neighborhoods,
        "events": events,
        "key_contacts": key_contacts,
        "communities": communities,
        "regulatory_notes": regulatory_notes,
        "strategy_bullets": strategy_bullets[:6],
        "recommended_first_week": recommended_first_week[:7],
        # raw skill payloads for future UI depth
        "_skills": {
            "competitor_analysis": ca or None,
            "market_vibe": mv or None,
            "cost_estimation": ce or None,
            "network_broker": nb or None,
            "regulatory_hurdles": rh or None,
        },
    }


def derive_agent_progress(
    status: str,
    progress: list[str],
    error: Optional[str] = None,
) -> tuple[AgentId, str]:
    """Infer plane stepper state from backend progress log lines."""
    if status == "error":
        return "general", error or "Scout failed"
    if status == "done":
        return "strategist", "Battle Plan ready."

    if not progress:
        return "general", "Launching scout…"

    last = progress[-1]
    joined = " ".join(progress).lower()

    if any(k in last.lower() for k in ("ingesting", "inferring", "industry")):
        return "general", last

    if "running" in last.lower() and "skill" in last.lower():
        return "cartographer", last

    done = sum(1 for p in progress if p.startswith("✓"))
    if done == 0 and "parallel" in joined:
        return "cartographer", last
    if done < 3:
        return "networker", last
    if status == "running":
        return "strategist", last

    return "networker", last
