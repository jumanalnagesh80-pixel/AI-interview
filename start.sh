#!/usr/bin/env bash
# One-command bootstrapper.
# Installs frontend deps, sets up a Python venv for the backend, and runs both with concurrently.

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [ ! -d node_modules ]; then
  echo "[start.sh] Installing frontend dependencies..."
  npm install --no-audit --no-fund
fi

if [ ! -d backend/.venv ]; then
  echo "[start.sh] Creating Python virtualenv..."
  python3 -m venv backend/.venv
  ./backend/.venv/bin/pip install --quiet -r backend/requirements.txt
fi

if [ ! -f .env.local ]; then
  echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
fi

echo "[start.sh] Booting AceTerview (web :3000 + api :8000)..."
exec npx concurrently -n web,api -c magenta,cyan \
  "next dev" \
  "./backend/.venv/bin/python -m uvicorn app.main:app --reload --port 8000 --app-dir backend"
