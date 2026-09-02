#!/usr/bin/env bash
#
# Guards the no-CSR rule: content pages must stay pre-rendered with no client-side JS.
#
# The Keystatic admin UI is gated behind ENABLE_KEYSTATIC (astro.config.mjs)
# so it never reaches production. This script proves that held, and will also catch a
# stray <script> added to any component. Run it against a dist/ built WITHOUT ENABLE_KEYSTATIC.
#
# Usage: npm run build && ./scripts/check-no-client-js.sh
#
# Note: dist/pagefind/* is excluded throughout — Pagefind ships its own prebuilt search bundle.

set -euo pipefail

fail=0
check() { # name, actual, expected
  if [ "$2" = "$3" ]; then
    printf '  ok    %-42s %s\n' "$1" "$2"
  else
    printf '  FAIL  %-42s %s (expected %s)\n' "$1" "$2" "$3"
    fail=1
  fi
}

[ -d dist ] || { echo "dist/ not found — run 'npm run build' first."; exit 1; }

echo "Checking dist/ ships no client-side JS…"

check "JS files in output" \
  "$(find dist -name '*.js' -not -path 'dist/pagefind/*' | wc -l | tr -d ' ')" "0"

# grep -o, not grep -c: the HTML is minified, so several tags share a line and grep -c
# (which counts matching lines) would undercount them.
check "script tags in /index.html" \
  "$(grep -o '<script' dist/index.html | wc -l | tr -d ' ')" "2"

check "script tags in /es/index.html" \
  "$(grep -o '<script' dist/es/index.html | wc -l | tr -d ' ')" "2"

check "files referencing the admin UI" \
  "$(grep -rl '@keystatic\|keystatic/ui' dist --exclude-dir=pagefind 2>/dev/null | wc -l | tr -d ' ')" "0"


if [ "$fail" -ne 0 ]; then
  echo ""
  echo "The production build is shipping client-side JS."
  echo "The two expected script tags are the JSON-LD block and the opening-hours inline"
  echo "module (which only unhides today's pre-rendered row)."
  echo "The cookie banner renders nothing while `analytics` is null in src/config/site.ts."
  echo "If you added a third intentionally, update the expected count here."
  exit 1
fi

echo "All checks passed — production output is JS-free."
