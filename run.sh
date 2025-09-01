#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$DIR/logs"
mkdir -p "$LOG_DIR"

BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

echo "[mdva-run] Starting services... logs: $LOG_DIR"

# Start backend
start_backend() {
  echo "[mdva-run] Backend starting..."
  pushd "$DIR/backend" >/dev/null

  # Prefer Bun, fall back to Node
  if command -v bun >/dev/null 2>&1; then
    CMD=(bun run src/app.js)
  else
    if ! command -v node >/dev/null 2>&1; then
      echo "[mdva-run] ERROR: Neither bun nor node found in PATH" >&2
      exit 1
    fi
    CMD=(node src/app.js)
  fi

  # Ensure env exists
  if [[ ! -f ./.env ]]; then
    echo "[mdva-run] WARN: backend/.env not found. Using built-in defaults." >&2
  fi

  nohup "${CMD[@]}" >"$BACKEND_LOG" 2>&1 &
  BACKEND_PID=$!
  popd >/dev/null
  echo "[mdva-run] Backend PID: $BACKEND_PID (port ${PORT:-3001})"
}

# Start frontend
start_frontend() {
  echo "[mdva-run] Frontend starting..."
  pushd "$DIR/frontend" >/dev/null

  # Install deps if node_modules missing
  if [[ ! -d node_modules ]]; then
    echo "[mdva-run] Installing frontend dependencies..."
    npm install --no-audit --no-fund
  fi

  nohup npm run dev -- --port 5173 >"$FRONTEND_LOG" 2>&1 &
  FRONTEND_PID=$!
  popd >/dev/null
  echo "[mdva-run] Frontend PID: $FRONTEND_PID (http://localhost:5173)"
}

cleanup() {
  echo "[mdva-run] Shutting down..."
  set +e
  [[ -n "${FRONTEND_PID:-}" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
  [[ -n "${BACKEND_PID:-}" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

start_backend
start_frontend

echo "[mdva-run] Tailing logs (Ctrl+C to stop and terminate)..."
echo "[mdva-run] Backend -> $BACKEND_LOG"
echo "[mdva-run] Frontend -> $FRONTEND_LOG"

touch "$BACKEND_LOG" "$FRONTEND_LOG"
tail -n +1 -f "$BACKEND_LOG" "$FRONTEND_LOG"


