#!/usr/bin/env bash
# read-the-kills.sh — WHICH tests each mutant in mutation-plan.tsv kills, and how they fail.
#
# `tools/mutation-envelope.sh` prints `MUTANT KILLED by N failing test(s)` and nothing about
# WHICH. N is the only number that reaches a PR body, and it is the number least worth trusting:
# `scripts/mutation-check.js` is silent by construction at small N — `BROAD_KILL_SHARE` is 0.25
# of the baseline, so 6 of 947 is 0.006 and the share signal cannot fire, and `CRASH_SIGNATURES`
# matches neither a guard's own `throw new Error(...)` nor a null-property `TypeError`. A row
# reading `by 6` can be six assertions about the property or six imports crashing, and the
# envelope renders them identically.
#
# So this script applies each row's mutation, runs THE SAME command the envelope ran, and prints
# the failing test names with the error class beside each. Read it before quoting any row.
#
# Same command, deliberately: a count taken under one test file and a count taken under
# `npm run test:scripts` are different numbers, and #874 shipped a table mixing them.
#
# It restores from an in-memory copy of the file's bytes, never `git checkout --` (which restores
# from the INDEX, not from what was on disk), and refuses to start in a dirty tree.
set -uo pipefail

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT=$(cd "${HERE:?}/../../.." && pwd)
PLAN="${HERE:?}/mutation-plan.tsv"
TEST_CMD=${TEST_CMD:-npm run test:scripts}

cd "${ROOT:?}" || exit 1
[ -f "${PLAN:?}" ] || { echo "REFUSED: no plan at ${PLAN}" >&2; exit 2; }
# `-uno`: TRACKED changes only. The restore check below compares tracked content, so an
# untracked file is not a hazard to it — and refusing on one would make this script unrunnable
# while it is itself untracked, which is exactly when it is first run.
if [ -n "$(git status --porcelain -uno)" ]; then
  echo "REFUSED: tracked files are modified; this script mutates tracked files and restores them" >&2
  exit 2
fi

echo "read-the-kills: $(git rev-parse --short HEAD), every row under: ${TEST_CMD}"
echo

LOGDIR=$(mktemp -d)
trap 'rm -rf "${LOGDIR:?}"' EXIT

rows=0
while IFS=$'\t' read -r id file mutation; do
  case "$id" in ''|'#'*) continue ;; esac
  [ -n "${mutation:-}" ] || { echo "REFUSED: malformed row: ${id}" >&2; exit 2; }
  rows=$((rows + 1))

  BACKUP="${LOGDIR:?}/$(echo "$id" | tr '/' '_').orig"
  cp -- "${ROOT:?}/${file}" "${BACKUP:?}" || exit 2

  # The split is on the FIRST `::`, exactly as mutation-check.js splits it, so the two tools
  # cannot disagree about what a row means.
  MUTATION="$mutation" FILE="$file" python3 - <<'PY'
import os, sys
mutation = os.environ['MUTATION']
sep = mutation.index('::')
old, new = mutation[:sep], mutation[sep + 2:]
path = os.environ['FILE']
with open(path, encoding='utf-8') as fh:
    src = fh.read()
n = src.count(old)
if n != 1:
    sys.exit(f'REFUSED: the needle occurs {n} time(s) in {path}, expected exactly 1')
with open(path, 'w', encoding='utf-8') as fh:
    fh.write(src.replace(old, new, 1))
PY
  if [ $? -ne 0 ]; then cp -- "${BACKUP:?}" "${ROOT:?}/${file}"; exit 2; fi

  OUT="${LOGDIR:?}/$(echo "$id" | tr '/' '_').log"
  eval "${TEST_CMD}" > "${OUT:?}" 2>&1
  rc=$?

  cp -- "${BACKUP:?}" "${ROOT:?}/${file}" || exit 2
  if ! git diff --quiet -- "${file}"; then
    echo "REFUSED: ${file} did not restore byte-identically — stop and inspect it" >&2
    exit 2
  fi

  echo "--- ${id}  (exit ${rc})"
  # The names, and the CLASS of each failure beside it. An assertion about the mutated property
  # and a crash on the way to it are both "a failing test"; only the first is coverage.
  # `✖ failing tests:` is node:test's section HEADER, not a test. Printed unfiltered it reads as
  # a seventh name in the six-name row below, which is the sort of off-by-one a reader inherits.
  awk '/^✖ / && $0 != "✖ failing tests:" {print "    " $0}' "${OUT:?}" | sed 's/ ([0-9.]*ms)$//' | sort -u
  # `awk`, not `grep`: inside Claude Code a bare `grep` is routed to a bundled ugrep with
  # `--ignore-files`, and this repository's own Bash hook blocks the name outright — a probe
  # whose counting tool differs between the machine that wrote it and the machine that reruns it
  # is a ruler nobody else holds.
  awk '
    /AssertionError/          { a++ }
    /TypeError/               { t++ }
    /ReferenceError/          { r++ }
    /^[[:space:]]*Error:/     { e++ }
    END {
      if (a) printf("    [AssertionError] x%d\n", a)
      if (t) printf("    [TypeError] x%d\n", t)
      if (r) printf("    [ReferenceError] x%d\n", r)
      if (e) printf("    [thrown Error] x%d\n", e)
    }' "${OUT:?}"
  echo
done < "${PLAN:?}"

if ! git diff --quiet; then
  echo "REFUSED: the tree did not come back clean" >&2
  exit 2
fi
echo "read-the-kills: ${rows} row(s) read; tree restored clean."
