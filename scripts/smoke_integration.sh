#!/usr/bin/env bash
# Quick smoke test: backend health + scout session (needs GEMINI_API_KEY in .env)
set -euo pipefail
API="${API_URL:-http://localhost:8000}"

echo "→ Health"
curl -sf "$API/api/health" | head -c 200
echo ""

echo "→ Start scout (text input)"
RESP=$(curl -sf -X POST "$API/api/scout" \
  -F "input_type=text" \
  -F "city=Austin" \
  -F "country=United States" \
  -F "company_text=We build workflow automation SaaS for independent restaurants. Our product handles staff scheduling, inventory sync, and daily ops in one dashboard for owners with 1-10 locations.")

SID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('sessionId') or json.load(sys.stdin).get('session_id',''))" 2>/dev/null || echo "$RESP" | sed -n 's/.*"sessionId":"\([^"]*\)".*/\1/p')
echo "session: $SID"

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  sleep 3
  STATUS=$(curl -sf "$API/api/scout/$SID")
  echo "poll $i: $(echo "$STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status'), d.get('progress','')[:60])")"
  echo "$STATUS" | grep -q '"status":"done"' && break
  echo "$STATUS" | grep -q '"status":"error"' && echo "$STATUS" && exit 1
done

echo "→ Done"
