#!/usr/bin/env bash
#
# Guards the no-CSR rule: content pages must stay pre-rendered with no client-side JS.
#
# It used to check <script> counts on exactly two of the site's pages, so a stray
# script added to any other page passed unnoticed. This scans every page, tells
# executable scripts apart from JSON-LD data blocks, and caps the total weight of
# inline script so the budget cannot creep upward one component at a time.
#
# The Keystatic admin UI is gated behind ENABLE_KEYSTATIC (astro.config.mjs) so it
# never reaches production; this proves that held.
#
# Usage: pnpm run build && ./scripts/check-no-client-js.sh
#
# dist/pagefind/* is excluded throughout — Pagefind ships its own prebuilt bundle,
# loaded only on the search page.

set -euo pipefail

# Executable inline scripts allowed per page. Currently one: the opening-hours
# toggle, which only unhides today's pre-rendered row.
MAX_INLINE_PER_PAGE=1
# Bytes of inline script on a single page. A site-wide total would just scale with
# the number of pages — the footer script is on all of them — and would say nothing
# about what any one visitor downloads.
MAX_INLINE_BYTES_PER_PAGE=2048

fail=0
check() { # name, actual, expected
  if [ "$2" = "$3" ]; then
    printf '  ok    %-44s %s\n' "$1" "$2"
  else
    printf '  FAIL  %-44s %s (expected %s)\n' "$1" "$2" "$3"
    fail=1
  fi
}

[ -d dist ] || { echo "dist/ not found — run 'pnpm run build' first."; exit 1; }

echo "Checking dist/ ships no client-side JS…"

check "JS files in output" \
  "$(find dist -name '*.js' -not -path 'dist/pagefind/*' | wc -l | tr -d ' ')" "0"

check "files referencing the admin UI" \
  "$(grep -rl '@keystatic\|keystatic/ui' dist --exclude-dir=pagefind 2>/dev/null | wc -l | tr -d ' ')" "0"

# External scripts are never allowed: no CDN, no analytics, no embeds.
check "pages loading an external script" \
  "$(grep -rlE '<script[^>]+src=' dist --include='*.html' --exclude-dir=pagefind 2>/dev/null \
     | grep -v '/actualitat/cerca/' | grep -v '/es/actualitat/cerca/' | wc -l | tr -d ' ')" "0"

# Every page, not just the two homepages. JSON-LD is data, not code, so it is
# excluded by type; anything else counts.
worst=0
worst_page=""
worst_bytes=0
worst_bytes_page=""

while IFS= read -r page; do
  case "$page" in
    dist/pagefind/*) continue ;;
    # The search page is the one documented exception: Pagefind's UI needs its own
    # bundle, the page is noindex, and nothing else on the site loads it.
    */actualitat/cerca/index.html) continue ;;
  esac
  n=$(perl -0777 -ne 'print scalar(() = /<script(?![^>]*type="application\/ld\+json")/g)' "$page")
  [ "$n" -gt "$worst" ] && { worst=$n; worst_page=$page; }
  b=$(perl -0777 -ne 'my $t=0; while (/<script(?![^>]*type="application\/ld\+json")[^>]*>(.*?)<\/script>/gs) { $t += length($1) } print $t' "$page")
  [ "$b" -gt "$worst_bytes" ] && { worst_bytes=$b; worst_bytes_page=$page; }
done < <(find dist -name '*.html')

if [ "$worst" -le "$MAX_INLINE_PER_PAGE" ]; then
  printf '  ok    %-44s %s\n' "max inline scripts on any page" "$worst"
else
  printf '  FAIL  %-44s %s (max %s, worst: %s)\n' \
    "max inline scripts on any page" "$worst" "$MAX_INLINE_PER_PAGE" "$worst_page"
  fail=1
fi

if [ "$worst_bytes" -le "$MAX_INLINE_BYTES_PER_PAGE" ]; then
  printf '  ok    %-44s %s bytes\n' "heaviest page's inline script" "$worst_bytes"
else
  printf '  FAIL  %-44s %s bytes (max %s, worst: %s)\n' \
    "heaviest page's inline script" "$worst_bytes" "$MAX_INLINE_BYTES_PER_PAGE" "$worst_bytes_page"
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "The production build is shipping client-side JS."
  echo "The only executable inline script expected is the opening-hours toggle."
  echo "JSON-LD blocks do not count — they are data, not code."
  echo "If you added something intentionally, raise the limits at the top of this file"
  echo "and say in the commit message what it buys."
  exit 1
fi

echo "All checks passed — production output is JS-free."
