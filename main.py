"""FastAPI entrypoint when running from repo root.

    uvicorn main:app --reload --port 8000

The app implementation lives in ``backend/main.py`` and uses ``lib.*``
imports relative to the ``backend/`` directory.
"""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

from dotenv import load_dotenv

_REPO_ROOT = Path(__file__).resolve().parent
_BACKEND_DIR = _REPO_ROOT / "backend"

# Load repo root .env (and optional backend/.env override) before the app imports lib.*
load_dotenv(_REPO_ROOT / ".env")
load_dotenv(_BACKEND_DIR / ".env", override=True)


def _load_app():
    if str(_BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(_BACKEND_DIR))

    main_path = _BACKEND_DIR / "main.py"
    spec = importlib.util.spec_from_file_location("scout_backend_main", main_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load backend app from {main_path}")

    module = importlib.util.module_from_spec(spec)
    sys.modules["scout_backend_main"] = module
    spec.loader.exec_module(module)
    return module.app


app = _load_app()
