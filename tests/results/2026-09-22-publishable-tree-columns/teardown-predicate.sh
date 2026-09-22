#!/usr/bin/env bash
# teardown-predicate.sh — how many suites really have no fixture teardown, and does the one
# that qualifies actually leak? (#883 round 2, SF-3; the issue is #885.)
#
# The PR body published a count taken under a predicate the same sentence called wrong:
# `mkdtempSync(` calls outnumbering `t.after(` calls. That misses `try { … } finally {
# rmTree(dir) }`, which is an equally legitimate shape, and the refined count is smaller by a
# factor of twenty. Quoting the crude figure gave a number nobody had checked the authority of
# a finding; this script is what the sentence should have cited.
#
# Root derived from this file's own location, so it runs from anywhere.
set -uo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
cd "${ROOT:?}" || exit 1
[ -d scripts/test ] || { echo "REFUSED: no scripts/test under ${ROOT:?}" >&2; exit 2; }

echo "=== counts over scripts/test/*.test.js at $(git rev-parse --short HEAD 2>/dev/null || echo '<no repo>') ==="
node -e '
const { readdirSync, readFileSync } = require("node:fs");
const dir = "scripts/test";
let using = 0; let crude = 0; const refined = [];
for (const f of readdirSync(dir)) {
  if (!/\.test\.[cm]?js$/.test(f)) continue;
  const src = readFileSync(`${dir}/${f}`, "utf8");
  const mk = (src.match(/mkdtempSync\(/g) || []).length;
  if (mk === 0) continue;
  using++;
  const after = (src.match(/t\.after\(/g) || []).length;
  const fin = (src.match(/\bfinally\b/g) || []).length;
  if (mk > after) crude++;
  if (mk > after + fin) refined.push(`${f} (mkdtempSync=${mk} t.after=${after} finally=${fin})`);
}
console.log(`suites using mkdtempSync:                 ${using}`);
console.log(`crude   (mkdtempSync > t.after):          ${crude}`);
console.log(`refined (mkdtempSync > t.after+finally):  ${refined.length}`);
for (const r of refined) console.log(`  ${r}`);
'

echo
echo "=== GROUND TRUTH: the whole suite under an isolated TMPDIR ==="
# The predicate above is a heuristic in BOTH directions, and its under-count is the one that
# matters: it counts the token `finally` per file, not a `finally` that pairs with a given
# `mkdtempSync`, so a suite with three fixtures and three unrelated `finally` blocks passes it.
# This section does not reason about that — it runs the suite the way CI does and counts what
# is left. What it reports is the leak set; the predicate is only the cheap way to guess it.
if [ "${SKIP_GROUND_TRUTH:-0}" = "1" ]; then
  echo "skipped (SKIP_GROUND_TRUTH=1)"
else
  SANDBOX=$(mktemp -d)
  TMPDIR="${SANDBOX:?}" npm run test:scripts >/dev/null 2>&1
  rc=$?
  total=$(find "${SANDBOX:?}" -mindepth 1 -maxdepth 1 | wc -l)
  echo "npm run test:scripts exit ${rc}; ${total} entr(ies) left, by fixture prefix:"
  # `node-compile-cache` is node's own, not a fixture — it is listed rather than filtered, so
  # the reader sees everything the run left and decides.
  find "${SANDBOX:?}" -mindepth 1 -maxdepth 1 -printf '%f\n' \
    | sed 's/[A-Za-z0-9]\{6\}$//' | sort | uniq -c | sort -rn | sed 's/^/    /'
  rm -rf "${SANDBOX:?}"
fi

echo
echo "=== does the refined member leak on its own? (control row second) ==="
# memory-blocks is the member; publishable-tree is the CONTROL — a suite whose teardown is known
# good. Without it, a probe that counted nothing anywhere would look like a clean result.
for suite in memory-blocks publishable-tree; do
  [ -f "scripts/test/${suite}.test.js" ] || { echo "${suite}.test.js: MISSING — the suite moved or was renamed"; continue; }
  SANDBOX=$(mktemp -d)
  TMPDIR="${SANDBOX:?}" node --test "scripts/test/${suite}.test.js" >/dev/null 2>&1
  rc=$?
  left=$(find "${SANDBOX:?}" -mindepth 1 -maxdepth 1 | wc -l)
  echo "${suite}.test.js: node --test exit ${rc}; directories left in an isolated TMPDIR: ${left}"
  find "${SANDBOX:?}" -mindepth 1 -maxdepth 1 -printf '    %f\n' 2>/dev/null | sort | head -3
  rm -rf "${SANDBOX:?}"
done
