import asyncio
import logging
from typing import Optional

from .managed_agents import (
    discover_parallel_agents,
    run_deep_verifier,
    run_general_skill_plan,
    run_parallel_agent,
    run_strategist_synthesis,
)
from .skills_registry import SKILL_BY_ID, default_skill_ids
from .text_utils import strip_html
from .types import BattlePlan, ScoutStatus, DeepAnalysis, Compliance, IdealPartner

logger = logging.getLogger(__name__)

sessions: dict[str, ScoutStatus] = {}


def _map_agent_name(internal: str) -> str:
    mapping = {
        "orchestrator": "general",
        "cartographer": "cartographer",
        "broker": "networker",
        "compliance_officer": "strategist",
        "deep_verifier": "strategist",
        "strategist": "strategist",
    }
    return mapping.get(internal, internal)


def _persist(session_id: str, status: ScoutStatus) -> None:
    sessions[session_id] = status


def _set_phase(
    session_id: str,
    status: ScoutStatus,
    *,
    agent: str,
    message: str,
    scout_phase: str | None = None,
    selected_skills: list[str] | None = None,
    active_skill: str | None = None,
    clear_active_skill: bool = False,
) -> None:
    status.active_agent = _map_agent_name(agent)
    status.progress = message
    status.status = "running"
    status.result = None
    if scout_phase is not None:
        status.scout_phase = scout_phase
    if selected_skills is not None:
        status.selected_skills = selected_skills
    if clear_active_skill:
        status.active_skill = None
    elif active_skill is not None:
        status.active_skill = active_skill
    _persist(session_id, status)


def _short_error(exc: BaseException, max_len: int = 120) -> str:
    text = str(exc).strip() or type(exc).__name__
    if len(text) > max_len:
        return text[: max_len - 3] + "..."
    return text


def _fallback_synthesis(
    company_brief: str,
    city: str,
    country: str,
    parallel_results: list[dict],
    include_first_week: bool,
) -> dict:
    has_findings = any(
        isinstance(r.get("output"), dict) and r["output"] for r in parallel_results
    )
    bullets = [
        f"Prioritize {city}, {country} using the research sections below.",
    ]
    if has_findings:
        bullets.append(
            "Some agents completed successfully — validate gaps and rerun specific skills if needed."
        )
    else:
        bullets.append(
            "Agent research was limited this run — retry when Gemini is available for a fuller report."
        )
    week = (
        [
            f"Validate top competitors and partners in {city}.",
            "Confirm regulatory and cost assumptions with local sources.",
            "Schedule outreach to organizations listed in the report.",
        ]
        if include_first_week
        else []
    )
    return {
        "company_summary": company_brief[:800] or f"Expansion research for {city}, {country}.",
        "strategy_bullets": bullets,
        "recommended_first_week": week,
    }


async def _run_selected_skills(
    session_id: str,
    status: ScoutStatus,
    parallel_agents: list[dict],
    company_brief: str,
    city: str,
    country: str,
    *,
    max_concurrent: int = 2,
) -> tuple[list[dict], list[str]]:
    """Run skill agents; failures are logged and skipped — pipeline continues."""
    sem = asyncio.Semaphore(max_concurrent)
    status_lock = asyncio.Lock()
    warnings: list[str] = []

    async def run_one(agent_info: dict) -> dict:
        skill_id = agent_info.get("skill_id", agent_info["name"])
        label = agent_info.get("label", skill_id.replace("_", " ").title())
        role = agent_info["role"]
        mapped = "cartographer" if role == "cartographer" else (
            "networker" if role == "networker" else "strategist"
        )
        _set_phase(
            session_id,
            status,
            agent=mapped,
            message=f"{label} is researching…",
            scout_phase="skills",
            active_skill=skill_id,
        )
        try:
            async with sem:
                result = await run_parallel_agent(
                    agent_info, company_brief, city, country
                )
            async with status_lock:
                if skill_id not in status.completed_skills:
                    status.completed_skills.append(skill_id)
                status.active_skill = None
                _persist(session_id, status)
            return result
        except Exception as exc:
            logger.warning(
                "[%s] Skill %s failed: %s", session_id, skill_id, exc
            )
            async with status_lock:
                if skill_id not in status.failed_skills:
                    status.failed_skills.append(skill_id)
                status.active_skill = None
                _persist(session_id, status)
            warnings.append(f"{label} skipped ({_short_error(exc)})")
            return {
                "agent_name": agent_info["name"],
                "skill_id": skill_id,
                "label": label,
                "role": role,
                "output": {},
            }

    if not parallel_agents:
        return [], warnings

    results = await asyncio.gather(*[run_one(a) for a in parallel_agents])
    return list(results), warnings


def _company_brief_from_orchestrator(orch: dict, fallback: str) -> str:
    if orch.get("context"):
        return str(orch["context"])[:1200]
    parts = [
        orch.get("company_name"),
        orch.get("industry"),
        orch.get("value_prop"),
        orch.get("target_customers"),
        orch.get("competitive_edge"),
    ]
    text = ". ".join(p for p in parts if p)
    return (text or fallback)[:1200]


def _networking_to_organizations(networking_orgs: list) -> list[dict]:
    return [
        {
            "name": o.get("name", ""),
            "type": o.get("type", ""),
            "url": o.get("url", ""),
            "why_relevant": o.get("relevance", o.get("why_relevant", "")),
        }
        for o in networking_orgs
        if isinstance(o, dict)
    ]


def _compliance_to_regulatory_notes(compliance: dict) -> list[str]:
    notes = []
    permits = compliance.get("required_permits", [])
    if permits:
        notes.append("Required permits: " + ", ".join(str(p) for p in permits))
    zoning = compliance.get("zoning_notes", "")
    if zoning:
        notes.append(f"Zoning: {zoning}")
    licensing = compliance.get("licensing_requirements", [])
    if licensing:
        notes.append("Licensing: " + ", ".join(str(x) for x in licensing))
    bodies = compliance.get("regulatory_bodies", [])
    if bodies:
        notes.append("Regulatory bodies: " + ", ".join(str(b) for b in bodies))
    return notes


def _normalize_competitors(raw: list) -> list[dict]:
    out = []
    for item in raw:
        if not isinstance(item, dict) or not item.get("name"):
            continue
        try:
            out.append(
                {
                    "name": str(item.get("name", "")),
                    "address": str(item.get("address", "")),
                    "lat": float(item.get("lat") or 0),
                    "lng": float(item.get("lng") or 0),
                    "notes": str(item.get("notes", "")),
                }
            )
        except (TypeError, ValueError):
            continue
    return out


def _clean_company_context(raw: str) -> str:
    if "<html" in raw.lower() or "<!doctype" in raw.lower():
        return strip_html(raw)
    return raw[:8000]


KNOWN_LIST_FIELDS = {
    "competitors",
    "complementary_businesses",
    "neighborhoods",
    "networking_orgs",
    "events",
    "key_contacts",
    "communities",
    "organizations",
    "ideal_partners",
}

KNOWN_SINGLE_FIELDS = {
    "spatial_insights",
    "networking_strategy",
    "zoning_notes",
    "compliance_timeline",
    "estimated_costs",
    "required_permits",
    "licensing_requirements",
    "regulatory_bodies",
}


def _extract_market_vibe(agent_outputs: dict) -> Optional[dict]:
    vibe = agent_outputs.get("market_vibe_check")
    if isinstance(vibe, dict) and vibe.get("narrative_summary"):
        return {
            "sentiment_label": vibe.get("sentiment_label", ""),
            "narrative_summary": vibe.get("narrative_summary", ""),
            "behavioral_trends": vibe.get("behavioral_trends", []) or [],
            "demand_signals": vibe.get("demand_signals", []) or [],
        }
    return None


def _merge_battle_plan(
    company_summary: str,
    city: str,
    country: str,
    parallel_results: list[dict],
    synthesis: dict,
    deep: Optional[dict] = None,
    selected_skills: Optional[list[str]] = None,
    pipeline_warnings: Optional[list[str]] = None,
) -> BattlePlan:
    """
    Generic merge — scans ALL agent outputs for known fields.
    New agents with standard field names (competitors, events, etc.) auto-merge.
    Unknown fields go into agent_outputs catch-all.
    """
    merged = {k: [] for k in KNOWN_LIST_FIELDS}
    singles: dict[str, list] = {k: [] for k in KNOWN_SINGLE_FIELDS}
    agent_outputs: dict[str, dict] = {}

    for result in parallel_results:
        agent_name = result.get("agent_name", "unknown")
        output = result.get("output", {})
        if not isinstance(output, dict):
            continue
        agent_outputs[agent_name] = output
        for key, value in output.items():
            if key in KNOWN_LIST_FIELDS and isinstance(value, list):
                merged[key].extend(value)
            elif key in KNOWN_SINGLE_FIELDS and isinstance(value, (list, str)):
                if isinstance(value, list):
                    singles[key].extend(str(v) for v in value)
                elif value:
                    singles[key].append(str(value))
        if agents_custom := output.get("agent_outputs"):
            if isinstance(agents_custom, dict):
                agent_outputs[agent_name] = {**agent_outputs[agent_name], **agents_custom}

    competitors = _normalize_competitors(
        merged.get("competitors", []) + merged.get("complementary_businesses", [])
    )
    comp_biz = merged.get("complementary_businesses", [])
    neighborhoods = list(
        {
            n.get("name", ""): n
            for n in merged.get("neighborhoods", [])
            if isinstance(n, dict) and n.get("name")
        }.values()
    )
    networking_orgs = merged.get("networking_orgs", [])
    events = merged.get("events", [])
    communities = merged.get("communities", [])
    ideal_raw = merged.get("ideal_partners", [])
    ideal_partners: list[IdealPartner] = []
    for p in ideal_raw:
        if not isinstance(p, dict) or not p.get("name"):
            continue
        ideal_partners.append(
            IdealPartner(
                name=str(p.get("name", "")),
                partner_type=str(p.get("partner_type", "")),
                why_fit=str(p.get("why_fit", "")),
                partnership_angle=str(p.get("partnership_angle", "")),
                url=str(p.get("url", "") or ""),
            )
        )

    partner_orgs = [
        {
            "name": ip.name,
            "type": ip.partner_type or "ideal_partner",
            "url": ip.url or "",
            "why_relevant": ip.why_fit or ip.partnership_angle,
        }
        for ip in ideal_partners
    ]
    organizations = _networking_to_organizations(
        networking_orgs + merged.get("organizations", []) + partner_orgs
    )

    required_permits = singles.get("required_permits", [])
    zoning_parts = singles.get("zoning_notes", [])
    licensing = singles.get("licensing_requirements", [])
    regulatory = singles.get("regulatory_bodies", [])

    regulatory_notes = []
    if required_permits:
        regulatory_notes.append("Required permits: " + ", ".join(required_permits[:8]))
    if zoning_parts:
        regulatory_notes.append("Zoning: " + "; ".join(zoning_parts[:3]))
    if licensing:
        regulatory_notes.append("Licensing: " + ", ".join(licensing[:8]))
    if regulatory:
        regulatory_notes.append("Regulatory bodies: " + ", ".join(regulatory[:5]))

    estimated_costs = singles.get("estimated_costs", [""])[0] if singles.get("estimated_costs") else ""
    cost_agent = agent_outputs.get("cost_estimation", {})
    if isinstance(cost_agent, dict) and not estimated_costs:
        parts = [
            cost_agent.get("launch_overhead_estimate"),
            cost_agent.get("compliance_cost_bracket"),
        ]
        estimated_costs = " | ".join(p for p in parts if p)[:500]

    compliance_data = Compliance(
        required_permits=list(dict.fromkeys(required_permits))[:8],
        zoning_notes="; ".join(zoning_parts[:3]),
        licensing_requirements=list(dict.fromkeys(licensing))[:8],
        regulatory_bodies=list(dict.fromkeys(regulatory))[:5],
        compliance_timeline=singles.get("compliance_timeline", [""])[0] if singles.get("compliance_timeline") else "",
        estimated_costs=estimated_costs,
    )

    strategy_bullets = synthesis.get("strategy_bullets") or []
    if isinstance(strategy_bullets, str):
        strategy_bullets = [strategy_bullets]
    recommended_first_week = synthesis.get("recommended_first_week") or []
    if isinstance(recommended_first_week, str):
        recommended_first_week = [recommended_first_week]

    summary = synthesis.get("company_summary") or company_summary
    if "<" in str(summary) and ">" in str(summary):
        summary = strip_html(str(summary))[:800] or company_summary[:800]

    events_out = []
    for e in events:
        if isinstance(e, dict) and e.get("title"):
            events_out.append(e)
        elif isinstance(e, str):
            events_out.append({"title": e, "date": "", "relevance": e})

    deep_analysis = None
    if deep:
        deep_analysis = DeepAnalysis(
            risk_assessment=deep.get("risk_assessment", ""),
            anomalies=deep.get("anomalies", []),
            missed_opportunities=deep.get("missed_opportunities", []),
            verified_findings=deep.get("verified_findings", []),
            recommendations=deep.get("recommendations", []),
            confidence_score=float(deep.get("confidence_score", 0.0) or 0.0),
        )
        for rec in deep.get("recommendations", [])[:2]:
            if rec and rec not in strategy_bullets:
                strategy_bullets.append(str(rec))

    market_vibe = _extract_market_vibe(agent_outputs)

    return BattlePlan(
        company_summary=str(summary)[:1200],
        target_city=city,
        target_country=country,
        competitors=competitors[:20],
        complementary_businesses=comp_biz[:10],
        neighborhoods=list(neighborhoods)[:10],
        organizations=organizations[:15],
        networking_orgs=networking_orgs[:15],
        events=events_out[:10],
        key_contacts=[],
        communities=communities[:10],
        regulatory_notes=regulatory_notes,
        compliance=compliance_data,
        strategy_bullets=[str(b) for b in strategy_bullets[:6] if b],
        recommended_first_week=[str(s) for s in recommended_first_week[:7] if s],
        deep_analysis=deep_analysis,
        agent_outputs=agent_outputs,
        selected_skills=selected_skills or [],
        market_vibe=market_vibe,
        ideal_partners=ideal_partners[:12],
        pipeline_warnings=list(pipeline_warnings or [])[:8],
    )


async def run_scout_pipeline(
    session_id: str,
    company_context: str,
    city: str,
    country: str,
    deep_scope: bool = False,
) -> None:
    company_context = _clean_company_context(company_context)
    status = ScoutStatus(
        session_id=session_id,
        status="running",
        active_agent="general",
        progress="The General is reading your company profile…",
    )
    _persist(session_id, status)

    warnings: list[str] = []
    orch: dict = {}
    selected_skills = default_skill_ids()
    include_first_week = True

    try:
        _set_phase(
            session_id,
            status,
            agent="general",
            message="The General is reading your company profile…",
            scout_phase="planning",
        )
        orch = await run_general_skill_plan(company_context, city, country)
        selected_skills = orch.get("selected_skills") or selected_skills
        include_first_week = bool(orch.get("include_first_week", True))
    except Exception as e:
        logger.warning("[%s] General planning failed: %s", session_id, e)
        warnings.append(f"The General used default agents ({_short_error(e)})")

    company_brief = _company_brief_from_orchestrator(orch, company_context[:800])
    status.completed_skills = []
    status.failed_skills = []

    skill_labels = [
        SKILL_BY_ID[sid].label for sid in selected_skills if sid in SKILL_BY_ID
    ]
    dispatch_msg = (
        f"The General selected {len(selected_skills)} agents: "
        + ", ".join(skill_labels[:5])
        + ("…" if len(skill_labels) > 5 else "")
    )

    parallel_agents = discover_parallel_agents(selected_skills)

    _set_phase(
        session_id,
        status,
        agent="general",
        message=dispatch_msg,
        scout_phase="skills",
        selected_skills=selected_skills,
        clear_active_skill=True,
    )
    parallel_results, skill_warnings = await _run_selected_skills(
        session_id,
        status,
        parallel_agents,
        company_brief,
        city,
        country,
    )
    warnings.extend(skill_warnings)

    deep_output = None
    if deep_scope and parallel_results:
        try:
            _set_phase(
                session_id,
                status,
                agent="deep_verifier",
                message="Deep Verifier is cross-checking all findings…",
            )
            deep_output = await run_deep_verifier(
                company_brief, city, country, parallel_results
            )
        except Exception as e:
            logger.warning("[%s] Deep verifier failed: %s", session_id, e)
            warnings.append(f"Deep verification skipped ({_short_error(e)})")

    _set_phase(
        session_id,
        status,
        agent="strategist",
        message="Strategist is compiling your Scout Report…",
        scout_phase="synthesis",
        clear_active_skill=True,
    )
    try:
        synthesis = await run_strategist_synthesis(
            company_brief,
            city,
            country,
            parallel_results,
            deep_output,
            include_first_week=include_first_week,
        )
    except Exception as e:
        logger.warning("[%s] Strategist synthesis failed: %s", session_id, e)
        warnings.append(f"Strategy used fallback summary ({_short_error(e)})")
        synthesis = _fallback_synthesis(
            company_brief, city, country, parallel_results, include_first_week
        )

    try:
        battle_plan = _merge_battle_plan(
            company_brief,
            city,
            country,
            parallel_results,
            synthesis,
            deep_output,
            selected_skills=selected_skills,
            pipeline_warnings=warnings,
        )
    except Exception as e:
        logger.exception("[%s] Merge failed, minimal plan: %s", session_id, e)
        warnings.append(f"Report merge partial ({_short_error(e)})")
        battle_plan = _merge_battle_plan(
            company_brief,
            city,
            country,
            parallel_results,
            _fallback_synthesis(
                company_brief, city, country, parallel_results, include_first_week
            ),
            None,
            selected_skills=selected_skills,
            pipeline_warnings=warnings,
        )

    status.result = battle_plan
    status.status = "done"
    status.error = None
    if warnings:
        status.progress = (
            f"Scout Report ready — {len(warnings)} agent(s) skipped; "
            "see warnings on the report."
        )
    else:
        status.progress = "Scout Report ready."
    status.active_agent = None
    status.active_skill = None
    _persist(session_id, status)
    logger.info(
        "[%s] Done — %s competitors, %s events, %s warning(s)",
        session_id,
        len(battle_plan.competitors),
        len(battle_plan.events),
        len(warnings),
    )


def get_session(session_id: str) -> Optional[ScoutStatus]:
    return sessions.get(session_id)
