#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-3000}"
# Avoid $HOSTNAME — macOS sets it to the machine name (e.g. Mac.fritz.box).
BIND_HOST="${BIND_HOST:-0.0.0.0}"

get_local_ip() {
  local ip=""
  local iface=""

  for iface in en0 en1 en2; do
    ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
    if [ -n "$ip" ]; then
      echo "$ip"
      return 0
    fi
  done

  iface="$(route get default 2>/dev/null | awk '/interface:/{print $2}' || true)"
  if [ -n "$iface" ]; then
    ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
    if [ -n "$ip" ]; then
      echo "$ip"
      return 0
    fi
  fi

  return 1
}

LOCAL_IP="$(get_local_ip || true)"
PHONE_URL=""

if [ -n "$LOCAL_IP" ]; then
  PHONE_URL="http://${LOCAL_IP}:${PORT}"
fi

echo ""
echo "Split Bill — phone dev server"
echo "=============================="
echo ""
echo "Laptop:  http://localhost:${PORT}"
if [ -n "$PHONE_URL" ]; then
  echo "Phone:   ${PHONE_URL}"
  if command -v pbcopy >/dev/null 2>&1; then
    printf "%s" "$PHONE_URL" | pbcopy
    echo ""
    echo "Phone URL copied to clipboard."
  fi
else
  echo "Phone:   (could not detect local IP — check Wi-Fi, then use your laptop IP manually)"
fi
echo ""
echo "Requirements:"
echo "  - Phone and laptop on the same Wi-Fi"
echo "  - VPN off on both devices"
echo "  - Allow Node through the Mac firewall if the phone cannot connect"
echo ""
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port ${PORT} is already in use."
  if [ -n "$PHONE_URL" ]; then
    echo "Open on your phone: ${PHONE_URL}"
    echo ""
    echo "Phone taps won't work unless the running server was started with:"
    echo "  ALLOWED_DEV_ORIGINS=${LOCAL_IP}"
    echo "Stop the current server (Ctrl+C), then run npm run dev:phone again."
  fi
  exit 0
fi

if [ -n "$LOCAL_IP" ]; then
  export ALLOWED_DEV_ORIGINS="${ALLOWED_DEV_ORIGINS:-$LOCAL_IP}"
  echo "allowedDevOrigins: ${ALLOWED_DEV_ORIGINS}"
  echo ""
fi

echo "Starting Next.js on ${BIND_HOST}:${PORT}…"
echo "Press Ctrl+C to stop."
echo ""

exec npx next dev --hostname "$BIND_HOST" --port "$PORT"
