#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$DIR/logs"
mkdir -p "$LOG_DIR"

BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

echo "[mdva-deploy] Starting full setup and run..."

# ---- Database setup (from setup.sh) ----
# Load DB config from backend/.env if present
if [[ -f "$DIR/backend/.env" ]]; then
  set -a
  # shellcheck disable=SC2046
  source <(grep -E '^(DB_HOST|DB_PORT|DB_USER|DB_PASS|DB_NAME)=' "$DIR/backend/.env" | sed 's/\r$//')
  set +a
fi

DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_PASS=${DB_PASS:-}
DB_NAME=${DB_NAME:-mdva}

OS_NAME="$(uname -s)"
IS_MAC=false
IS_LINUX=false
case "$OS_NAME" in
  Darwin*) IS_MAC=true ;;
  Linux*) IS_LINUX=true ;;
esac

echo "[mdva-deploy] Detected OS: $OS_NAME"

if ! command -v mysql >/dev/null 2>&1; then
  echo "[mdva-deploy] ERROR: 'mysql' client not found in PATH. Please install MySQL client and retry."
  exit 1
fi

try_ping() {
  local cmd=(mysqladmin ping -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER")
  [[ -n "$DB_PASS" ]] && cmd+=(-p"$DB_PASS")
  "${cmd[@]}" >/dev/null 2>&1 && return 0
  cmd=(mysqladmin ping -h localhost -P "$DB_PORT" -u "$DB_USER")
  [[ -n "$DB_PASS" ]] && cmd+=(-p"$DB_PASS")
  "${cmd[@]}" >/dev/null 2>&1 && return 0
  cmd=(mysqladmin ping -u "$DB_USER")
  [[ -n "$DB_PASS" ]] && cmd+=(-p"$DB_PASS")
  "${cmd[@]}" >/dev/null 2>&1 && return 0
  return 1
}

set +e
try_ping
PING_STATUS=$?
set -e

if [[ $PING_STATUS -ne 0 ]]; then
  echo "[mdva-deploy] MySQL not responding. Attempting to start..."
  if $IS_MAC; then
    if command -v brew >/dev/null 2>&1; then
      brew services start mysql || brew services start mysql@8.0 || true
    fi
  elif $IS_LINUX; then
    if command -v systemctl >/dev/null 2>&1; then
      sudo systemctl start mysql || sudo systemctl start mysqld || true
    else
      sudo service mysql start || sudo service mysqld start || true
    fi
  fi

  echo "[mdva-deploy] Waiting for MySQL to be ready..."
  for i in {1..30}; do
    set +e
    try_ping
    PING_STATUS=$?
    set -e
    if [[ $PING_STATUS -eq 0 ]]; then
      break
    fi
    sleep 1
  done
  if [[ $PING_STATUS -ne 0 ]]; then
    echo "[mdva-deploy] ERROR: Unable to start or reach MySQL at $DB_HOST:$DB_PORT"
    exit 1
  fi
fi

echo "[mdva-deploy] MySQL is running. Ensuring database exists..."

CHECK_CMD=(mysql -N -s -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER")
if [[ -n "$DB_PASS" ]]; then CHECK_CMD+=(-p"$DB_PASS"); fi
CHECK_CMD+=(-e "SHOW DATABASES LIKE '$DB_NAME';")
EXISTS=$("${CHECK_CMD[@]}")

if [[ -z "$EXISTS" ]]; then
  echo "[mdva-deploy] Database '$DB_NAME' not found. Importing schema and seed..."
  IMPORT_CMD=(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER")
  if [[ -n "$DB_PASS" ]]; then IMPORT_CMD+=(-p"$DB_PASS"); fi
  "${IMPORT_CMD[@]}" < "$DIR/database/schema.sql"
  "${IMPORT_CMD[@]}" < "$DIR/database/seed.sql"
  echo "[mdva-deploy] Database '$DB_NAME' created and seeded."
else
  echo "[mdva-deploy] Database '$DB_NAME' already exists. Skipping import."
fi

# ---- Start backend and frontend (from run.sh) ----
echo "[mdva-deploy] Starting services... logs: $LOG_DIR"

start_backend() {
  echo "[mdva-deploy] Backend starting..."
  pushd "$DIR/backend" >/dev/null

  # Prefer Bun, fall back to Node
  if command -v bun >/dev/null 2>&1; then
    CMD=(bun run src/app.js)
  else
    if ! command -v node >/dev/null 2>&1; then
      echo "[mdva-deploy] ERROR: Neither bun nor node found in PATH" >&2
      exit 1
    fi
    CMD=(node src/app.js)
  fi

  if [[ ! -f ./.env ]]; then
    echo "[mdva-deploy] WARN: backend/.env not found. Using built-in defaults." >&2
  fi

  nohup "${CMD[@]}" >"$BACKEND_LOG" 2>&1 &
  BACKEND_PID=$!
  popd >/dev/null
  echo "[mdva-deploy] Backend PID: $BACKEND_PID (port ${PORT:-3001})"
}

start_frontend() {
  echo "[mdva-deploy] Frontend starting..."
  pushd "$DIR/frontend" >/dev/null

  if [[ ! -d node_modules ]]; then
    echo "[mdva-deploy] Installing frontend dependencies..."
    npm install --no-audit --no-fund
  fi

  nohup npm run dev -- --port 5173 >"$FRONTEND_LOG" 2>&1 &
  FRONTEND_PID=$!
  popd >/dev/null
  echo "[mdva-deploy] Frontend PID: $FRONTEND_PID (http://localhost:5173)"
}

cleanup() {
  echo "[mdva-deploy] Shutting down..."
  set +e
  [[ -n "${FRONTEND_PID:-}" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
  [[ -n "${BACKEND_PID:-}" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

start_backend
start_frontend

echo "[mdva-deploy] Tailing logs (Ctrl+C to stop and terminate)..."
echo "[mdva-deploy] Backend -> $BACKEND_LOG"
echo "[mdva-deploy] Frontend -> $FRONTEND_LOG"

touch "$BACKEND_LOG" "$FRONTEND_LOG"
tail -n +1 -f "$BACKEND_LOG" "$FRONTEND_LOG"


