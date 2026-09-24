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

# The default `node:test` reporter is TAP on a non-TTY below Node 24 — measured on this machine:
# v20.20.2 and v22.16.0 open their log with `TAP version 13`, v24.20.0 and v25.9.0 with `✖ …`.
# `engines` allows `>=22.12.0`, so under a supported Node this script could print `--- <row>`
# with no names beneath it and still exit 0: the reassuring-empty shape. Pinning the reporter
# makes the bytes this file parses the same on every supported Node (verified on 20, 22 and 24).
# A caller who already pins a reporter gets TWO of them if this simply appends: the #888 round-2
# review measured every `✖` line, every class line and the `tests N` summary printed twice, which
# doubles the class counts below (the names survive `sort -u`; the label does not). So existing
# `--test-reporter*` tokens are stripped before ours is added, and nothing else in NODE_OPTIONS is
# touched.
strip_reporter() {
  printf '%s' "${1:-}" | tr ' ' '\n' | sed '/^--test-reporter/d' | tr '\n' ' ' | sed 's/  */ /g; s/^ //; s/ $//'
}
NODE_OPTIONS=$(strip_reporter "${NODE_OPTIONS:-}")
export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--test-reporter=spec --test-reporter-destination=stdout"

echo "read-the-kills: $(git rev-parse --short HEAD), node $(node --version), every row under: ${TEST_CMD}"
echo "  reporter pinned to spec via NODE_OPTIONS (the default is TAP on a non-TTY below Node 24)"
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
  # A killed row that names nothing is a parse failure, not a quiet kill. Say so rather than
  # letting an empty list read as "one unnamed failure".
  if [ "$rc" -ne 0 ] && ! awk '/^✖ / && $0 != "✖ failing tests:" {found=1} END {exit !found}' "${OUT:?}"; then
    # Copied OUT of LOGDIR first: the EXIT trap removes LOGDIR, so naming a path inside it hands
    # the reader a path that does not exist by the time they open it.
    KEEP=$(mktemp -d)
    cp -- "${OUT:?}" "${KEEP:?}/"
    echo "    REFUSED: the row is red but no ✖ line was parsed — the reporter is not spec." >&2
    echo "    Log kept at ${KEEP}/$(basename "${OUT}")" >&2
    exit 2
  fi
  # The names, and the CLASS of each failure beside it. An assertion about the mutated property
  # and a crash on the way to it are both "a failing test"; only the first is coverage.
  # `✖ failing tests:` is node:test's section HEADER, not a test. Printed unfiltered it reads as
  # a seventh name in the six-name row below, which is the sort of off-by-one a reader inherits.
  awk '/^✖ / && $0 != "✖ failing tests:" {print "    " $0}' "${OUT:?}" | sed 's/ ([0-9.]*ms)$//' | sort -u
  # These are LINE counts over the whole suite log, not a per-test classification. They are the
  # cheap half of the answer and they can disagree with the name list above: a reporter that
  # printed one error twice would double a class, and a failure whose message carries neither
  # word would be counted by none. In the #877 runs they agreed with the name counts on every
  # row — one class-line per name everywhere but `domains-from-the-module`, which is 1 + 5 for
  # six — which is why the RESULT.md paragraph built on them stands. The names are the evidence
  # and these are the label. Read the log if they ever disagree.
  #
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
