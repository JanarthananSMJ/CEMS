#!/usr/bin/env bash
set -e
set -m

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_SERVICES=(auth-service event-service gateway leaderboard-service notification-service settings-service)

install_if_needed() {
  local dir="$1"
  local name="$2"

  if [ ! -d "$dir/node_modules" ]; then
    echo "Installing dependencies for $name..."
    (cd "$dir" && npm install)
  else
    echo "$name dependencies already installed, skipping."
  fi
}

echo "Checking dependencies..."
install_if_needed "$FRONTEND_DIR" "frontend"
for svc in "${BACKEND_SERVICES[@]}"; do
  install_if_needed "$BACKEND_DIR/$svc" "backend/$svc"
done

PIDS=()

cleanup() {
  echo ""
  echo "Stopping all services..."
  for pid in "${PIDS[@]}"; do
    kill -- "-$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  exit 0
}

trap cleanup INT TERM

run_labeled() {
  local dir="$1"
  local label="$2"
  (cd "$dir" && npm run dev 2>&1 | sed -e "s/^/[$label] /") &
  PIDS+=("$!")
  echo "  - $label started (pid $!)"
}

echo ""
echo "Starting backend services..."
for svc in "${BACKEND_SERVICES[@]}"; do
  run_labeled "$BACKEND_DIR/$svc" "$svc"
done

echo ""
echo "Starting frontend..."
run_labeled "$FRONTEND_DIR" "frontend"

echo ""
echo "All services running. Press Ctrl+C to stop."
wait
