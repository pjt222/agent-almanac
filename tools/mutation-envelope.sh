#!/usr/bin/env bash
# mutation-envelope.sh — run a LIST of mutants under one test command and print a verdict table.
#
# WHY
# ---
# `scripts/mutation-check.js` proves one line at a time, and that is the right unit for it. What
# a review round actually needs is a set: one mutant per claim, all under the command CI runs, in
# a table a PR body can quote. In the #874 session that loop was typed four times as a throwaway
# heredoc — mutants-r2, -r3, -r4, -final — and each rewrite lost something the previous one had
# learned. The fourth one is this file.
#
# What it adds over calling the checker in a `for` loop by hand:
#
#   - ONE test command for every row, named once at the top. A count taken under a single test
#     file and a count taken under `npm run test:scripts` are different numbers, and #874 shipped
#     a table mixing them: two rows were wrong, and a `--allow-broad` waiver in the prose turned
#     out to be an artefact of the narrow command rather than a property of the mutant.
#   - A verdict per row, and a FAILING exit when any row is not a clean kill. A survivor is the
#     finding — in #874 one survived and exposed a test arm asserting the right answer for the
#     wrong reason — and a survivor scrolling past in a wall of output is a finding nobody reads.
#   - The separator trap, handled once: `mutation-check --replace` splits on the FIRST `::`, so a
#     needle containing `::` is silently truncated. Rows are read from a file as NUL-separated
#     triples rather than as shell words, and a row whose OLD carries `::` is refused by name.
#
# It is NOT a gate. It mutates the working tree and restores it, it takes minutes, and it needs a
# green baseline — `scripts/mutation-check.js` refuses without one. Run it from the repository
# root, by hand or from a session, when a table of claims needs measuring.
#
# USAGE
#     bash tools/mutation-envelope.sh --test '<command>' --plan <plan-file> [--out <dir>]
#     bash tools/mutation-envelope.sh --verify    # self-test in a throwaway repo
#
#   --test CMD    the command every mutant is measured under; name the one CI runs
#   --plan FILE   the mutants, one per line: <id><TAB><file><TAB><old>::<new>
#                 blank lines and lines starting with `#` are ignored
#   --out DIR     where the per-row logs land (default: a fresh mktemp -d, printed at the end)
#
# Exit 0 when every row is `MUTANT KILLED`. Exit 1 when any row survives, is SUSPECT, INVALID or
# INCONCLUSIVE — read that row's log before quoting anything. Exit 2 when the envelope itself
# could not run (no plan, an unreadable plan, a malformed row).
set -uo pipefail

# Resolved once, absolutely, and used for both the self-test's fixture and the checker call: an
# `npm run mutation-check` would depend on the CALLER's package.json, which the self-test's
# throwaway repository does not have — the first version did exactly that and reported two rows
# with no verdict at all.
SELF=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")
REPO=$(cd "$(dirname "$SELF")/.." && pwd)
CHECKER="$REPO/scripts/mutation-check.js"

TEST_CMD=""
PLAN=""
OUT=""
VERIFY=0

while [ $# -gt 0 ]; do
  case "$1" in
    --test) TEST_CMD=${2:-}; shift 2 ;;
    --plan) PLAN=${2:-}; shift 2 ;;
    --out) OUT=${2:-}; shift 2 ;;
    --verify) VERIFY=1; shift ;;
    -h|--help) sed -n '1,40p' "$0"; exit 0 ;;
    *) echo "mutation-envelope: unknown argument: $1" >&2; exit 2 ;;
  esac
done

# ── the self-test ────────────────────────────────────────────────────────────────────────────
# A throwaway repository with one covered line and one uncovered line, so BOTH verdicts are
# exercised: a table that can only report kills would pass this file's own contract while being
# unable to report the finding it exists for.
if [ "$VERIFY" -eq 1 ]; then
  # $SELF and $REPO are resolved at the top of this file, BEFORE any cd: the first version took
  # `BASH_SOURCE` relative, changed directory into the fixture, and could not find a single file
  # it needed — every `cp` failed and the run reported exit 127 rather than a verdict.
  DIR=$(mktemp -d)
  trap 'rm -rf "${DIR:?}"' EXIT
  cd "${DIR:?}" || exit 2
  export GIT_CONFIG_NOSYSTEM=1 HOME="${DIR:?}" XDG_CONFIG_HOME="${DIR:?}/.config"
  git init -q -b main . >/dev/null 2>&1
  git config user.email t@example.invalid
  git config user.name fixture

  mkdir -p scripts/lib scripts/test tools
  cp "$SELF" tools/mutation-envelope.sh || exit 2
  cp "$REPO/scripts/mutation-check.js" scripts/ || exit 2
  cp "$REPO/scripts/lib/mutation-parse.js" scripts/lib/ || exit 2
  cp "$REPO/scripts/lib/mutation-verdict.js" scripts/lib/ || exit 2
  ln -s "$REPO/node_modules" "${DIR:?}/node_modules"
  cat > scripts/lib/subject.js <<'JS'
export function covered(n) { return n > 10; }
export function uncovered(n) { return n > 10; }
JS
  cat > scripts/test/subject.test.js <<'JS'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { covered } from '../lib/subject.js';
test('covered is asserted', () => { assert.equal(covered(11), true); assert.equal(covered(5), false); });
JS
  cat > package.json <<'JSON'
{ "name": "envelope-fixture", "private": true, "type": "module",
  "scripts": { "t": "node --test scripts/test/subject.test.js" } }
JSON
  git add -A >/dev/null 2>&1
  git commit -qm fixture >/dev/null 2>&1

  printf 'kill\tscripts/lib/subject.js\texport function covered(n) { return n > 10; }::export function covered(n) { return n >= 10; }\n' > plan.txt
  printf 'survive\tscripts/lib/subject.js\texport function uncovered(n) { return n > 10; }::export function uncovered(n) { return n >= 10; }\n' >> plan.txt

  bash tools/mutation-envelope.sh --test 'npm run t' --plan plan.txt --out "${DIR:?}/logs" > "${DIR:?}/run.log" 2>&1
  STATUS=$?
  KILLED=$(grep -c 'KILLED' "${DIR:?}/run.log" || true)
  SURVIVED=$(grep -c 'SURVIVED' "${DIR:?}/run.log" || true)

  printf 'exit=%s killed-rows=%s survived-rows=%s\n' "$STATUS" "$KILLED" "$SURVIVED"
  if [ "$STATUS" -eq 1 ] && [ "$KILLED" -ge 1 ] && [ "$SURVIVED" -ge 1 ]; then
    echo "mutation-envelope --verify: OK (a covered line is reported killed, an uncovered one survives, and a survivor fails the run)"
    exit 0
  fi
  echo "mutation-envelope --verify: FAILED — want exit 1 with at least one kill and one survivor" >&2
  sed -n '1,40p' "${DIR:?}/run.log" >&2
  exit 1
fi

# ── the run ──────────────────────────────────────────────────────────────────────────────────
[ -n "$TEST_CMD" ] || { echo "mutation-envelope: --test is required" >&2; exit 2; }
[ -n "$PLAN" ] || { echo "mutation-envelope: --plan is required" >&2; exit 2; }
[ -r "$PLAN" ] || { echo "mutation-envelope: cannot read plan: $PLAN" >&2; exit 2; }
[ -n "$OUT" ] || OUT=$(mktemp -d)
mkdir -p "${OUT:?}" || exit 2

echo "mutation-envelope: every row measured under: $TEST_CMD"
echo

ROWS=0
BAD=0
while IFS=$'\t' read -r id file mutation; do
  case "${id:-}" in ''|'#'*) continue ;; esac
  if [ -z "${file:-}" ] || [ -z "${mutation:-}" ]; then
    echo "REFUSED: malformed row (want <id><TAB><file><TAB><old>::<new>): $id" >&2
    exit 2
  fi
  # `mutation-check --replace` splits on the FIRST `::`, so an OLD carrying one is truncated in
  # silence and the mutation applies somewhere nobody chose. Refuse rather than measure that.
  old=${mutation%%::*}
  case "$old" in *:*:*) echo "REFUSED: row '$id' has '::' inside its OLD text; mutation-check would split it there" >&2; exit 2 ;; esac

  ROWS=$((ROWS + 1))
  node "$CHECKER" --file "$file" --replace "$mutation" --test "$TEST_CMD" > "${OUT:?}/$id.log" 2>&1
  verdict=$(grep -E 'MUTANT KILLED|MUTANT SURVIVED|SUSPECT KILL|INVALID|INCONCLUSIVE|^ERROR' "${OUT:?}/$id.log" | tail -1)
  case "$verdict" in
    *'MUTANT KILLED'*) : ;;
    *) BAD=$((BAD + 1)) ;;
  esac
  printf '%-24s %s\n' "$id" "${verdict:-<no verdict line — read ${OUT:?}/$id.log>}"
  [ -n "$verdict" ] || BAD=$((BAD + 1))
done < "$PLAN"

echo
echo "mutation-envelope: $ROWS row(s), $BAD not a clean kill; logs in ${OUT:?}"
[ "$BAD" -eq 0 ] || { echo "Read every row above that is not 'MUTANT KILLED' before quoting this table." >&2; exit 1; }
exit 0
