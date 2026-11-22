#!/usr/bin/env bash
# Fail closed: image identity AND the application response must attest the expected build.
set -euo pipefail
EXPECTED_SHA="${1:?Expected full commit SHA}"
IMAGE="${2:?Expected image repository}"
CONTAINER="${3:?Running container}"
LOCAL_URL="${4:?Local health URL}"
PUBLIC_URL="${5:?Public health URL}"
if [[ ! "$EXPECTED_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "::error::Expected a full lowercase 40-character commit SHA."
  exit 1
fi
EXPECTED_IMAGE_ID="$(docker image inspect --format '{{.Id}}' "$IMAGE:$EXPECTED_SHA")"
RUNNING_IMAGE_ID="$(docker inspect --format '{{.Image}}' "$CONTAINER")"
REVISION="$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$CONTAINER")"
if [[ "$RUNNING_IMAGE_ID" != "$EXPECTED_IMAGE_ID" || "$REVISION" != "$EXPECTED_SHA" ]]; then
  echo "::error::Running image identity or OCI revision does not match $EXPECTED_SHA."
  exit 1
fi
HEADERS="$(mktemp)"
trap 'rm -f "$HEADERS"' EXIT
for URL in "$LOCAL_URL" "$PUBLIC_URL"; do
  VERIFIED=0
  # Use GET (not HEAD), bounded timeouts, and a cache-busting key. Never follow a redirect to a different site.
  for ATTEMPT in $(seq 1 30); do
    if HTTP_STATUS="$(curl --fail --silent --show-error --connect-timeout 5 --max-time 15 \
      --header 'Cache-Control: no-cache' --dump-header "$HEADERS" --output /dev/null \
      --write-out '%{http_code}' "${URL}?deployment_sha=${EXPECTED_SHA}")" && [[ "$HTTP_STATUS" == 200 ]]; then
      ACTUAL="$(awk 'tolower($1) == "x-commit-sha:" { sub(/^[^:]*:[ \t]*/, ""); sub(/[ \t\r]+$/, ""); print }' "$HEADERS")"
      # Duplicate headers, absent values and old versions all fail this exact comparison.
      if [[ "$ACTUAL" == "$EXPECTED_SHA" ]]; then VERIFIED=1; break; fi
    fi
    sleep 2
  done
  if [[ "$VERIFIED" != 1 ]]; then
    echo "::error::$URL does not attest commit $EXPECTED_SHA."
    exit 1
  fi
  echo "Verified $URL -> $EXPECTED_SHA"
done
