#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

# Load DB config from backend/.env if present
if [[ -f "$DIR/backend/.env" ]]; then
  # Export only needed keys; strip CRLF if present
  set -a
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

echo "[mdva-setup] Detected OS: $OS_NAME"

# Ensure mysql client is installed
if ! command -v mysql >/dev/null 2>&1; then
  echo "[mdva-setup] ERROR: 'mysql' client not found in PATH. Please install MySQL client and retry."
  exit 1
fi

# Check if MySQL server is reachable; try to start if not
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
  echo "[mdva-setup] MySQL not responding. Attempting to start..."
  if $IS_MAC; then
    if command -v brew >/dev/null 2>&1; then
      brew services start mysql || brew services start mysql@8.0 || true
    fi
    # As fallback, nothing else to do automatically
  elif $IS_LINUX; then
    if command -v systemctl >/dev/null 2>&1; then
      sudo systemctl start mysql || sudo systemctl start mysqld || true
    else
      sudo service mysql start || sudo service mysqld start || true
    fi
  fi

  echo "[mdva-setup] Waiting for MySQL to be ready..."
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
    echo "[mdva-setup] ERROR: Unable to start or reach MySQL at $DB_HOST:$DB_PORT"
    exit 1
  fi
fi

echo "[mdva-setup] MySQL is running."

# Check if database exists
CHECK_CMD=(mysql -N -s -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER")
if [[ -n "$DB_PASS" ]]; then CHECK_CMD+=(-p"$DB_PASS"); fi
CHECK_CMD+=(-e "SHOW DATABASES LIKE '$DB_NAME';")
EXISTS=$("${CHECK_CMD[@]}")

if [[ -z "$EXISTS" ]]; then
  echo "[mdva-setup] Database '$DB_NAME' not found. Importing schema and seed..."
  IMPORT_CMD=(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER")
  if [[ -n "$DB_PASS" ]]; then IMPORT_CMD+=(-p"$DB_PASS"); fi
  "${IMPORT_CMD[@]}" < "$DIR/database/schema.sql"
  "${IMPORT_CMD[@]}" < "$DIR/database/seed.sql"
  echo "[mdva-setup] Database '$DB_NAME' created and seeded."
else
  echo "[mdva-setup] Database '$DB_NAME' already exists. Skipping import."
fi

echo "[mdva-setup] Done."


