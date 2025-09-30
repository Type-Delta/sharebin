#!/usr/bin/env bash
set -euo pipefail

# health_check.sh
# Reusable health check script.
# Usage: health_check.sh <base_url> <endpoint_path>
# Env overrides:
#   ATTEMPTS (default 12)
#   SLEEP_SECONDS (default 5)
#   EXPECT_STATUS (default ok) - JSON value for .status
#   CURL_EXTRA (extra curl args)

BASE_URL=${1:-}
ENDPOINT_PATH=${2:-}

if [[ -z "$BASE_URL" || -z "$ENDPOINT_PATH" ]]; then
  echo "Usage: $0 <base_url> <endpoint_path>" >&2
  exit 2
fi

ATTEMPTS=${ATTEMPTS:-12}
SLEEP_SECONDS=${SLEEP_SECONDS:-5}
EXPECT_STATUS=${EXPECT_STATUS:-ok}

FULL_URL="${BASE_URL%/}/${ENDPOINT_PATH#/}"

echo "Health check: URL=$FULL_URL expect status='$EXPECT_STATUS' attempts=$ATTEMPTS sleep=${SLEEP_SECONDS}s"

SUCCESS=0
for i in $(seq 1 "$ATTEMPTS"); do
  echo "Attempt $i/$ATTEMPTS..."
  RESP=$(curl -sS --max-time 10 -H 'Accept: application/json' ${CURL_EXTRA:-} "$FULL_URL" || true)
  echo "Response: $RESP"
  if echo "$RESP" | grep -q '"status"[[:space:]]*:[[:space:]]*"'"$EXPECT_STATUS"'"'; then
    echo "Health check passed."
    SUCCESS=1
    break
  fi
  sleep "$SLEEP_SECONDS"
done

if [[ "$SUCCESS" -ne 1 ]]; then
  echo "Service did not become healthy in time." >&2
  exit 1
fi
