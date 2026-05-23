import asyncio
import json
import logging
import os
import re
from pathlib import Path
from typing import Optional

import httpx
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

AGENTS_DIR = Path(__file__).resolve().parent.parent / "agents"
SPECIAL_AGENTS = ["orchestrator"]
GEMINI_RETRY_ATTEMPTS = 3
GEMINI_RETRY_BASE_SEC = 2.0


def _gemini_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Add it to .env in the repo root and restart uvicorn."
        )
    return key


def discover_parallel_agents(selected_skill_ids: list[str] | None = None) -> list[dict]:
    """Discover parallel agents; optionally filter by General's selected skill IDs."""
    from .skills_registry import SKILL_BY_ID, agent_folders_for_skills, default_skill_ids

    skill_ids = selected_skill_ids or default_skill_ids()
    allowed_folders = {s.agent_folder for s in agent_folders_for_skills(skill_ids)}

    agents = []
    if not AGENTS_DIR.exists():
        return agents
    for agent_dir in sorted(AGENTS_DIR.iterdir()):
        if not agent_dir.is_dir() or agent_dir.name.startswith("."):
            continue
        if agent_dir.name in SPECIAL_AGENTS or agent_dir.name == "deep_verifier":
            continue
        if allowed_folders and agent_dir.name not in allowed_folders:
            continue
        config_path = agent_dir / "config.json"
        agents_md = agent_dir / "AGENTS.md"
        if not agents_md.exists():
            continue
        config = {}
        if config_path.exists():
            config = json.loads(config_path.read_text())
        if config.get("parallel", True) is False:
            continue
        skill_id = config.get("skill_id", agent_dir.name)
        spec = SKILL_BY_ID.get(skill_id)
        agents.append(
            {
                "name": agent_dir.name,
                "skill_id": skill_id,
                "label": spec.label if spec else agent_dir.name.replace("_", " ").title(),
                "dir": agent_dir,
                "thinking_budget": config.get("thinking_budget", 256),
                "tools": config.get("tools", []),
                "role": config.get("role", agent_dir.name),
            }
        )
    return agents


def _read_agent_files(agent_dir: Path) -> tuple[str, str]:
    agents_md = (agent_dir / "AGENTS.md").read_text()
    skill_md = ""
    skill_path = agent_dir / "SKILL.md"
    if skill_path.exists():
        skill_md = skill_path.read_text()
    return agents_md, skill_md


def _build_system_instruction(agent_dir: Path) -> str:
    agents_md, skill_md = _read_agent_files(agent_dir)
    instruction = agents_md
    if skill_md:
        instruction += f"\n\n## Skills\n\n{skill_md}"
    return instruction


def _build_tools(tool_names: list[str]) -> list:
    tools = []
    for name in tool_names:
        if name == "google_maps":
            tools.append(types.Tool(google_maps=types.GoogleMaps()))
        elif name == "google_search":
            tools.append(types.Tool(google_search=types.GoogleSearch()))
    return tools


def _uses_google_maps(tools: list | None) -> bool:
    if not tools:
        return False
    for tool in tools:
        if getattr(tool, "google_maps", None) is not None:
            return True
    return False


def _thinking_config(budget: int) -> types.ThinkingConfig:
    return types.ThinkingConfig(thinking_budget=budget)


def _is_retryable_gemini(exc: BaseException) -> bool:
    text = str(exc).lower()
    if any(t in text for t in ("503", "unavailable", "429", "rate limit", "disconnected")):
        return True
    try:
        from google.genai.errors import ServerError

        if isinstance(exc, ServerError):
            code = getattr(exc, "status_code", None)
            return code in (None, 429, 500, 502, 503, 504)
    except ImportError:
        pass
    return False


def _parse_json_response(text: str) -> dict:
    if not text or not text.strip():
        return {}
    candidates = [text.strip()]
    if "```json" in text:
        candidates.insert(0, text.split("```json")[1].split("```")[0].strip())
    if "```" in text:
        for block in re.findall(r"```(?:json)?\s*([\s\S]*?)```", text):
            candidates.append(block.strip())
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end > start:
        candidates.append(text[start : end + 1])
    for candidate in candidates:
        if not candidate:
            continue
        try:
            data = json.loads(candidate)
            if isinstance(data, dict):
                return data
        except json.JSONDecodeError:
            continue
    return {"raw_output": text}


def _schema_hint(agent_name: str) -> str:
    hints = {
        "cartographer": (
            '{"competitors":[],"complementary_businesses":[],"neighborhoods":[],'
            '"spatial_insights":""}'
        ),
        "broker": (
            '{"networking_orgs":[],"events":[],"key_contacts":[],"communities":[],'
            '"networking_strategy":""}'
        ),
        "compliance_officer": (
            '{"required_permits":[],"zoning_notes":"","licensing_requirements":[],'
            '"regulatory_bodies":[],"compliance_timeline":"","estimated_costs":""}'
        ),
        "market_vibe_check": (
            '{"sentiment_label":"","narrative_summary":"","behavioral_trends":[],'
            '"demand_signals":[],"risks":[]}'
        ),
        "cost_estimation": (
            '{"neighborhood_costs":[],"wage_benchmarks":[],"compliance_cost_bracket":"",'
            '"launch_overhead_estimate":"","cost_risks":[]}'
        ),
        "demographic_profiler": (
            '{"target_segments":[],"income_and_age_notes":"","high_fit_neighborhoods":[],'
            '"gaps_and_blind_spots":[]}'
        ),
        "monetization_audit": (
            '{"pricing_models_observed":[],"revenue_streams":[],"unit_economics_notes":"",'
            '"pricing_recommendations":[]}'
        ),
        "moat_evaluator": (
            '{"moat_factors":[],"defensibility_score":0,"local_threats":[],'
            '"moat_recommendations":[]}'
        ),
        "partner_scout": (
            '{"ideal_partners":[],"trending_partner_types":[],"connector_archetypes":[],'
            '"partnership_plays":[],"terrain_summary":""}'
        ),
        "strategist": (
            '{"company_summary":"","strategy_bullets":[],"recommended_first_week":[]}'
        ),
    }
    hint = hints.get(agent_name)
    if hint:
        return hint
    config_path = AGENTS_DIR / agent_name / "config.json"
    if config_path.exists():
        config = json.loads(config_path.read_text())
        schema = config.get("output_schema")
        if schema:
            return schema if isinstance(schema, str) else json.dumps(schema)
    return "{}"


async def _repair_json_output(agent_name: str, raw_text: str) -> dict:
    if not raw_text.strip():
        return {}
    client = genai.Client(api_key=_gemini_api_key())
    prompt = (
        f"Convert this {agent_name} research into ONE valid JSON object.\n"
        f"Schema:\n{_schema_hint(agent_name)}\n\n"
        f"Escape quotes in strings. No markdown.\n\nSOURCE:\n{raw_text[:80000]}"
    )
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        thinking_config=_thinking_config(256),
    )
    try:
        response = await client.aio.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
            config=config,
        )
        parsed = _parse_json_response(response.text or "")
        if parsed and "raw_output" not in parsed:
            return parsed
    except Exception as exc:
        logger.warning("JSON repair failed for %s: %s", agent_name, exc)
    return _parse_json_response(raw_text)


async def run_agent_from_dir(
    agent_dir: Path,
    user_prompt: str,
    thinking_budget: int = 256,
    tools: Optional[list] = None,
    response_json: bool = True,
) -> dict:
    client = genai.Client(api_key=_gemini_api_key())
    system_instruction = _build_system_instruction(agent_dir)
    agent_name = agent_dir.name
    maps_grounded = _uses_google_maps(tools)
    prompt = user_prompt
    if response_json and maps_grounded:
        prompt += (
            "\n\nReturn one valid JSON object only (no markdown). "
            "Match the output format in your instructions."
        )

    config_kwargs = {
        "thinking_config": _thinking_config(thinking_budget),
        "system_instruction": system_instruction,
    }
    if tools:
        config_kwargs["tools"] = tools
    if response_json and not maps_grounded:
        config_kwargs["response_mime_type"] = "application/json"

    model = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")
    last_exc: Exception | None = None
    for attempt in range(GEMINI_RETRY_ATTEMPTS):
        try:
            response = await client.aio.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(**config_kwargs),
            )
            break
        except (
            httpx.RemoteProtocolError,
            httpx.ConnectError,
            httpx.TimeoutException,
        ) as exc:
            last_exc = exc
            if attempt + 1 >= GEMINI_RETRY_ATTEMPTS:
                raise
            wait = GEMINI_RETRY_BASE_SEC * (2**attempt)
            logger.warning(
                "Gemini %s attempt %s failed (%s); retry in %.1fs",
                agent_name,
                attempt + 1,
                exc,
                wait,
            )
            await asyncio.sleep(wait)
        except Exception as exc:
            if not _is_retryable_gemini(exc):
                raise
            last_exc = exc
            if attempt + 1 >= GEMINI_RETRY_ATTEMPTS:
                raise
            wait = GEMINI_RETRY_BASE_SEC * (2**attempt) + 1.0
            logger.warning(
                "Gemini %s attempt %s unavailable (%s); retry in %.1fs",
                agent_name,
                attempt + 1,
                exc,
                wait,
            )
            await asyncio.sleep(wait)
    else:
        if last_exc:
            raise last_exc
        raise RuntimeError("Gemini request failed with no response")

    raw = response.text or ""
    parsed = _parse_json_response(raw)
    if maps_grounded or "raw_output" in parsed:
        parsed = await _repair_json_output(agent_name, raw or json.dumps(parsed))
    return parsed


async def run_orchestrator(user_prompt: str) -> dict:
    agent_dir = AGENTS_DIR / "orchestrator"
    config = {}
    config_path = agent_dir / "config.json"
    if config_path.exists():
        config = json.loads(config_path.read_text())
    return await run_agent_from_dir(
        agent_dir=agent_dir,
        user_prompt=user_prompt,
        thinking_budget=config.get("thinking_budget", 1024),
        response_json=True,
    )


async def run_general_skill_plan(
    company_context: str,
    city: str,
    country: str,
) -> dict:
    """The General ingests the company and selects which skills to run."""
    from .skills_registry import catalog_for_prompt, default_skill_ids, resolve_selected_skills

    prompt = (
        f"Company input:\n{company_context}\n\n"
        f"Target market: {city}, {country}\n\n"
        f"## Available skills (pick only what this expansion needs)\n"
        f"{catalog_for_prompt()}\n\n"
        "Analyze the product type and return JSON only:\n"
        "{\n"
        '  "company_name": "",\n'
        '  "industry": "",\n'
        '  "value_prop": "",\n'
        '  "target_customers": "",\n'
        '  "competitive_edge": "",\n'
        '  "context": "2-3 sentence brief for sub-agents",\n'
        '  "product_type": "b2b_saas|consumer|marketplace|hardware|services|api_platform|pure_digital|other",\n'
        '  "selected_skills": ["skill_id", ...],\n'
        '  "include_first_week": true,\n'
        '  "skill_rationale": "one sentence"\n'
        "}\n\n"
        "Rules:\n"
        "- selected_skills must use exact skill_id values from the catalog\n"
        "- Pick 3-7 skills; omit skills that do not apply (e.g. skip regulatory_hurdles for pure digital)\n"
        "- include_first_week false for enterprise-only, API-only, or research-only expansions\n"
        "- Never name individual people"
    )
    plan = await run_orchestrator(prompt)
    product_type = str(plan.get("product_type", "other"))
    plan["selected_skills"] = resolve_selected_skills(
        plan.get("selected_skills"),
        product_type,
    )
    if "include_first_week" not in plan:
        plan["include_first_week"] = True
    if not plan.get("selected_skills"):
        plan["selected_skills"] = default_skill_ids()
    return plan


async def run_deep_verifier(
    company_context: str,
    city: str,
    country: str,
    all_agent_outputs: list[dict],
) -> dict:
    agent_dir = AGENTS_DIR / "deep_verifier"
    if not (agent_dir / "AGENTS.md").exists():
        return {}
    config = {}
    config_path = agent_dir / "config.json"
    if config_path.exists():
        config = json.loads(config_path.read_text())
    outputs_text = "\n\n".join(
        f"=== AGENT: {o['agent_name']} ===\n{json.dumps(o.get('output', o), indent=2)}"
        for o in all_agent_outputs
    )
    prompt = (
        f"Company Context:\n{company_context}\n\n"
        f"Target: {city}, {country}\n\n"
        f"{outputs_text}\n\n"
        f"Cross-examine all outputs. Identify anomalies, missed opportunities, "
        f"risks, and strategic recommendations."
    )
    return await run_agent_from_dir(
        agent_dir=agent_dir,
        user_prompt=prompt,
        thinking_budget=config.get("thinking_budget", 2048),
        tools=_build_tools(config.get("tools", ["google_search"])),
        response_json=True,
    )


async def run_parallel_agent(
    agent_info: dict,
    company_context: str,
    city: str,
    country: str,
) -> dict:
    prompt = (
        f"Company Context:\n{company_context}\n\n"
        f"Target City: {city}\n"
        f"Target Country: {country}\n\n"
        f"Complete your assigned research task for this company in {city}."
    )
    output = await run_agent_from_dir(
        agent_dir=agent_info["dir"],
        user_prompt=prompt,
        thinking_budget=agent_info["thinking_budget"],
        tools=_build_tools(agent_info["tools"]),
        response_json=True,
    )
    return {
        "agent_name": agent_info["name"],
        "skill_id": agent_info.get("skill_id", agent_info["name"]),
        "label": agent_info.get("label", agent_info["name"]),
        "role": agent_info["role"],
        "output": output,
    }


async def run_strategist_synthesis(
    company_brief: str,
    city: str,
    country: str,
    parallel_results: list[dict],
    deep: dict | None = None,
    include_first_week: bool = True,
) -> dict:
    agents_text = "\n\n".join(
        f"=== {r.get('agent_name', 'agent').upper()} ===\n{json.dumps(r.get('output', r))[:25000]}"
        for r in parallel_results
    )
    prompt = (
        f"Company brief:\n{company_brief}\n\n"
        f"Target: {city}, {country}\n\n"
        f"RESEARCH FINDINGS:\n{agents_text}\n"
    )
    if deep:
        prompt += f"\nDEEP VERIFIER:\n{json.dumps(deep)[:15000]}\n"
    if include_first_week:
        prompt += (
            "\nReturn JSON: company_summary (2-3 sentences), strategy_bullets (4-5 items), "
            "recommended_first_week (5-7 concrete steps). Never name individual people."
        )
    else:
        prompt += (
            "\nReturn JSON: company_summary (2-3 sentences), strategy_bullets (4-5 items), "
            "recommended_first_week: [] (empty — no on-the-ground launch checklist for this product). "
            "Never name individual people."
        )
    client = genai.Client(api_key=_gemini_api_key())
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        thinking_config=_thinking_config(1024),
        system_instruction=(
            "You are the Strategist for Google AI Scout. Synthesize research into "
            "a concrete expansion Scout Report."
        ),
    )
    response = await client.aio.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
        config=config,
    )
    parsed = _parse_json_response(response.text or "")
    if not parsed.get("strategy_bullets"):
        parsed = await _repair_json_output("strategist", response.text or prompt)
    return parsed
