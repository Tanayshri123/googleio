import os
from dotenv import load_dotenv

load_dotenv()

# Single key: a Gemini API key from Google AI Studio (https://aistudio.google.com).
# This key covers both Gemini model calls AND Google Maps / Search grounding
# (grounding is server-side inside the Gemini call, billed via your Gemini tier).
# A separate Google Maps Platform JS key is only needed by the frontend if/when
# we render an interactive map widget.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

SESSION_TTL_SECONDS = 60 * 60  # 1 hour
SKILL_TIMEOUT_SECONDS = 45
