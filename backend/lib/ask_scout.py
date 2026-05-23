"""Ask Scout — follow-up chat with report context, history, and Search grounding."""
from __future__ import annotations

import logging

from google import genai
from google.genai import types

from .managed_agents import _gemini_api_key, _thinking_config
from .types import BattlePlan, ChatMessage

logger = logging.getLogger(__name__)

SYSTEM_TEMPLATE = """You are Ask Scout, the follow-up assistant for Google AI Scout market expansion.

## Company & product (from user's Scout Report)
{company_summary}

## Target market
{target_city}, {target_country}

## Your job
- Answer the user's latest question using the Scout Report, the conversation so far, and Google Search when needed.
- Resolve pronouns and follow-ups ("their", "they", "it", "that company") from the **most recent** topic in the chat — not a random company from the report.
- For live facts (market cap, revenue, stock price, recent news, funding) that are NOT in the report, use Search and cite what you find.
- If the report has no data and Search finds nothing reliable, say so clearly.
- Never name or recommend contacting specific private individuals.
- Be concise (2–5 sentences unless they ask for a list). Use **bold** for company and organization names.

## Scout Report (JSON)
{report_json}
"""


def _plan_context(plan: BattlePlan) -> dict[str, str]:
    return {
        "company_summary": plan.company_summary,
        "target_city": plan.target_city,
        "target_country": plan.target_country,
        "report_json": plan.model_dump_json(indent=0)[:120000],
    }


def _history_to_contents(
    history: list[dict[str, str]], max_turns: int = 12
) -> list[types.Content]:
    """Gemini uses user / model roles."""
    contents: list[types.Content] = []
    for msg in history[-max_turns:]:
        role = msg.get("role", "user")
        text = (msg.get("content") or "").strip()
        if not text:
            continue
        gemini_role = "user" if role == "user" else "model"
        contents.append(
            types.Content(role=gemini_role, parts=[types.Part(text=text)])
        )
    return contents


async def generate_ask_scout_reply(
    plan: BattlePlan,
    message: str,
    history: list[dict[str, str]] | None = None,
) -> str:
    history = history or []
    client = genai.Client(api_key=_gemini_api_key())
    ctx = _plan_context(plan)
    system_instruction = SYSTEM_TEMPLATE.format(**ctx)

    contents = _history_to_contents(history)
    contents.append(
        types.Content(role="user", parts=[types.Part(text=message.strip())])
    )

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        thinking_config=_thinking_config(512),
        tools=[types.Tool(google_search=types.GoogleSearch())],
    )

    response = await client.aio.models.generate_content(
        model="gemini-3.5-flash",
        contents=contents,
        config=config,
    )
    reply = (response.text or "").strip()
    if not reply:
        return (
            "I couldn't generate an answer. Try rephrasing your question, "
            "or ask about competitors, strategy, or your first week in "
            f"{plan.target_city}."
        )
    return reply


def append_chat_turn(
    store: list,
    user_message: str,
    assistant_reply: str,
) -> None:
    store.append(ChatMessage(role="user", content=user_message))
    store.append(ChatMessage(role="assistant", content=assistant_reply))
    while len(store) > 24:
        store.pop(0)
