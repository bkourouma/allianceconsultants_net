#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin"
export PATH="$TMP/bin:$PATH"
export EXPECTED_SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
cat > "$TMP/bin/docker" <<'MOCK'
#!/usr/bin/env bash
if [[ "$*" == *org.opencontainers.image.revision* ]]; then
  if [[ "${CASE:-}" == wrong-label ]]; then echo bad; else echo "$EXPECTED_SHA"; fi
elif [[ "$1" == image ]]; then echo sha256:expected
elif [[ "${CASE:-}" == wrong-image ]]; then echo sha256:wrong
else echo sha256:expected
fi
MOCK
cat > "$TMP/bin/curl" <<'MOCK'
#!/usr/bin/env bash
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dump-header) HEADERS="$2"; shift 2 ;;
    *) URL="$1"; shift ;;
  esac
done
if [[ "${CASE:-}" == transport-error ]]; then exit 22; fi
SHA="$EXPECTED_SHA"
if [[ "${CASE:-}" == old-local && "$URL" == http:* ]]; then SHA=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb; fi
if [[ "${CASE:-}" == malformed-public && "$URL" == https:* ]]; then SHA="$SHA unexpected"; fi
printf 'HTTP/1.1 200 OK\r\n' > "$HEADERS"
if [[ "${CASE:-}" != absent-public || "$URL" != https:* ]]; then printf 'X-Commit-Sha: %s\r\n' "$SHA" >> "$HEADERS"; fi
if [[ "${CASE:-}" == duplicate-public && "$URL" == https:* ]]; then printf 'x-commit-sha: %s\r\n' "$SHA" >> "$HEADERS"; fi
if [[ "${CASE:-}" == redirect-public && "$URL" == https:* ]]; then printf '301'; else printf '200'; fi
MOCK
printf '#!/usr/bin/env bash\nexit 0\n' > "$TMP/bin/sleep"
chmod +x "$TMP/bin/"*
run_check() {
  bash "$ROOT/scripts/verify-deployment-sha.sh" "$1" ghcr.io/example/site container http://127.0.0.1:3000/ https://site.example/
}
CASE=valid run_check "$EXPECTED_SHA"
for CASE in wrong-label wrong-image old-local absent-public duplicate-public redirect-public malformed-public transport-error; do
  export CASE
  if run_check "$EXPECTED_SHA" > "$TMP/output" 2>&1; then echo "Expected failure: $CASE"; exit 1; fi
  echo "Rejected $CASE"
done
if run_check short > "$TMP/output" 2>&1; then echo 'Expected invalid SHA failure'; exit 1; fi
echo 'Deployment SHA checks: 10 scenarios passed.'
