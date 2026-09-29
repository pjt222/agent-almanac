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
#   - The separator trap, refused up front: `mutation-check --replace` splits on the FIRST `::`.
#     When `::` occurs exactly once in a row's `<old>::<new>` field, that split is the only one.
#     When it occurs more than once — apart, or overlapping as a run of three colons — the split
#     the checker takes may not be the one the plan meant, and the checker would apply it without
#     a word (#783). Such a row is refused by name. Single colons are not the separator: an OLD
#     such as `write(dir, { 'a.md': '# a\n', 'b.md': '# b\n' });` is measured like any other.
#     Until #903 this guard cut the field at the first `::` and then looked for `::` in what was
#     left, which the cut had already removed, so it never fired on the case it was written for,
#     and it refused any OLD holding two single colons. Rows are read from the plan as TAB-separated
#     fields rather than as shell words, so no quoting reaches the needle.
#   - Every row is checked before any mutant is measured. One refused row stops the run before
#     the first checker cycle, every refused row is named in the same run, and no measuring time
#     is spent on a table that could not be finished (#903). A last row with no trailing newline
#     is read like any other; `read` alone drops it, and a one-row plan then reported
#     `0 row(s), 0 not a clean kill` and exited 0.
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
#                 blank lines and lines starting with `#` are ignored; `::` must occur exactly
#                 once in the last field, so an OLD ending in `:` or holding `::` cannot be
#                 expressed until #783 gives the checker a way to say it
#   --out DIR     where the per-row logs land (default: a fresh mktemp -d, printed at the end)
#
# Exit 0 when every row is `MUTANT KILLED`. Exit 1 when any row survives, is SUSPECT, INVALID or
# INCONCLUSIVE — read that row's log before quoting anything. Exit 2 when the envelope itself
# could not run: no plan, an unreadable plan, a plan with no rows, or any row the plan check
# refuses (a missing field, no `::`, or `::` more than once). Exit 2 is always reached before
# the first mutant is measured.
set -uo pipefail

# Resolved once, absolutely, and used for both the self-test's fixture and the checker call: an
# `npm run mutation-check` would depend on the CALLER's package.json, which the self-test's
# throwaway repository does not have — the first version did exactly that and reported two rows
# with no verdict at all.
SELF=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")
REPO=$(cd "$(dirname "$SELF")/.." && pwd)
CHECKER="$REPO/scripts/mutation-check.js"

# The separator, held in a variable so that no line of the plan check spells it out. A mutant of
# that check has to be written as `mutation-check --replace <old>::<new>`, and a needle holding
# `::` is exactly the ambiguity the check refuses: spelling it inline would make the guard
# impossible to mutate with the tool that proves it (#783, one level down).
SEP='::'

# Prints why a plan row is refused, or nothing when it may be measured.
row_problem() {
  local file=$1 mutation=$2
  if [ -z "$file" ] || [ -z "$mutation" ]; then
    printf 'malformed row (want <id><TAB><file><TAB><old>%s<new>)' "$SEP"
    return
  fi
  case "$mutation" in *"$SEP"*) : ;; *)
    printf "no '%s' separator in its <old>%s<new> field" "$SEP" "$SEP"
    return ;;
  esac
  # `mutation-check --replace` splits at the FIRST separator. With one occurrence that is the
  # only split there is. With two, apart or overlapping as a run of three colons, it may not be
  # the split the plan meant, and the checker applies it without a word (#783). The test reads
  # the WHOLE field: until #903 it cut the field at the first separator and then looked for one
  # in what was left, which the cut had already removed, so it could never fire, and its pattern
  # (any two single colons) refused OLD text that held no separator at all.
  case "$mutation" in *"$SEP"*"$SEP"*|*"$SEP":*)
    printf "'%s' occurs more than once in its <old>%s<new> field (a run of three colons counts); mutation-check splits at the first one, which may not be the split the plan meant (#783)" "$SEP" "$SEP"
    return ;;
  esac
}

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
    -h|--help) awk '/^set -uo pipefail$/ { exit } { print }' "$0"; exit 0 ;;
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

  # ── the plan check, against a stub checker ──
  # Seconds, not minutes. The stub records the --replace value it is handed and reports a kill,
  # so these arms see only what the envelope decides before a checker runs: which rows it
  # refuses, what it says, and whether one refusal anywhere stops every checker call. They run
  # first, so a mutant of the plan check dies here instead of after the full cycle below.
  STUB="${DIR:?}/stub"
  mkdir -p "${STUB:?}/tools" "${STUB:?}/scripts" "${STUB:?}/plans" || exit 2
  cp "$SELF" "${STUB:?}/tools/mutation-envelope.sh" || exit 2
  printf '{ "type": "commonjs" }\n' > "${STUB:?}/package.json"
  cat > "${STUB:?}/scripts/mutation-check.js" <<'JS'
const fs = require('fs');
const path = require('path');
const argv = process.argv.slice(2);
fs.appendFileSync(path.join(__dirname, '..', 'calls.log'), argv[argv.indexOf('--replace') + 1] + '\n');
console.log('MUTANT KILLED by 1 failing test(s)');
JS
  ARMS_FAILED=0
  # arm <name> <plan> <wanted exit> <wanted checker calls> <text stderr must carry, or ''>
  arm() {
    rm -f "${STUB:?}/calls.log"
    bash "${STUB:?}/tools/mutation-envelope.sh" --test true --plan "$2" --out "${STUB:?}/logs" \
      > "${STUB:?}/out.log" 2> "${STUB:?}/err.log"
    local rc=$? calls=0
    [ -f "${STUB:?}/calls.log" ] && calls=$(wc -l < "${STUB:?}/calls.log")
    if [ "$rc" -eq "$3" ] && [ "$calls" -eq "$4" ] && { [ -z "$5" ] || grep -qF -- "$5" "${STUB:?}/err.log"; }; then
      echo "  ok    $1"
    else
      echo "  FAIL  $1: want exit $3 and $4 checker call(s)${5:+ and stderr carrying: $5}; got exit $rc and $calls call(s)" >&2
      sed 's/^/        /' "${STUB:?}/err.log" >&2
      ARMS_FAILED=$((ARMS_FAILED + 1))
    fi
  }
  row() { printf '%s\t%s\t%s' "$1" "$2" "$3"; }
  P="${STUB:?}/plans"

  # The #886 needle: two single colons in OLD, one separator. Refused until #903.
  F886="write(dir, { 'a.md': '# a\\n', 'b.md': '# b\\n' });::write(dir, { 'a.md': '# a\\n' });"
  { row single-colons src.js "$F886"; echo; } > "$P/single-colons.tsv"
  arm accept-single-colons "$P/single-colons.tsv" 0 1 ''
  if [ "$(cat "${STUB:?}/calls.log" 2>/dev/null)" = "$F886" ]; then
    echo "  ok    accept-single-colons-verbatim"
  else
    echo "  FAIL  accept-single-colons-verbatim: the checker was not handed the field unchanged" >&2
    ARMS_FAILED=$((ARMS_FAILED + 1))
  fi

  { row two-apart src.js 'a::b::c'; echo; } > "$P/two-apart.tsv"
  arm refuse-two-separators "$P/two-apart.tsv" 2 0 "row 'two-apart': '::' occurs more than once"

  { row three-colons src.py 'def f():::def f()'; echo; } > "$P/three-colons.tsv"
  arm refuse-three-colons "$P/three-colons.tsv" 2 0 "row 'three-colons': '::' occurs more than once"

  { row no-separator src.js 'a:b'; echo; } > "$P/no-separator.tsv"
  arm refuse-no-separator "$P/no-separator.tsv" 2 0 "row 'no-separator': no '::' separator"

  printf 'short-row\tsrc.js\n' > "$P/malformed.tsv"
  arm refuse-malformed "$P/malformed.tsv" 2 0 "row 'short-row': malformed row"

  # A good row first and a refused row last: nothing may be measured, not even the good row.
  { row good src.js 'x::y'; echo; row bad-last src.js 'a::b::c'; echo; } > "$P/good-then-bad.tsv"
  arm refuse-before-any-measurement "$P/good-then-bad.tsv" 2 0 "1 of 2 row(s) refused"

  # Two refused rows: both named in one run.
  { row bad-one src.js 'a::b::c'; echo; row bad-two src.js 'a:b'; echo; } > "$P/two-bad.tsv"
  arm name-every-refused-row "$P/two-bad.tsv" 2 0 "row 'bad-two'"

  # No trailing newline on the last row, in the run loop and in the plan check.
  row last-good src.js 'x::y' > "$P/no-newline.tsv"
  arm read-last-row-without-newline "$P/no-newline.tsv" 0 1 ''
  { row good src.js 'x::y'; echo; row last-bad src.js 'a::b::c'; } > "$P/no-newline-bad.tsv"
  arm check-last-row-without-newline "$P/no-newline-bad.tsv" 2 0 "row 'last-bad'"

  printf '# a comment\n\n' > "$P/empty.tsv"
  arm refuse-empty-plan "$P/empty.tsv" 2 0 "the plan holds no rows"

  if [ "$ARMS_FAILED" -ne 0 ]; then
    echo "mutation-envelope --verify: FAILED — $ARMS_FAILED plan-check arm(s) above" >&2
    exit 1
  fi
  rm -rf "${STUB:?}"

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
    echo "mutation-envelope --verify: OK (every plan-check arm holds; a covered line is reported killed, an uncovered one survives, and a survivor fails the run)"
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

# The plan check: every row, before any checker cycle. A refusal used to be discovered only when
# the loop below reached the row, after every earlier row had spent its baseline and its mutant
# run, and the exit 2 then suppressed the summary those rows had paid for. Every refused row is
# named, not just the first, so a plan is repaired in one pass.
#
# `|| [ -n "${id:-}" ]`, here and in the run loop: `read` returns non-zero on a last line with no
# trailing newline while still filling the fields, so a bare `while read` drops that row, and a
# one-row plan was reported as `0 row(s), 0 not a clean kill` with exit 0.
PLANNED=0
REFUSED=0
while IFS=$'\t' read -r id file mutation || [ -n "${id:-}" ]; do
  case "${id:-}" in ''|'#'*) continue ;; esac
  PLANNED=$((PLANNED + 1))
  problem=$(row_problem "${file:-}" "${mutation:-}")
  if [ -n "$problem" ]; then
    echo "REFUSED: row '$id': $problem" >&2
    REFUSED=$((REFUSED + 1))
  fi
done < "$PLAN"
if [ "$REFUSED" -gt 0 ]; then
  echo "mutation-envelope: $REFUSED of $PLANNED row(s) refused by the plan check; no mutant was measured" >&2
  exit 2
fi
[ "$PLANNED" -gt 0 ] || { echo "mutation-envelope: the plan holds no rows, only blank lines and comments: $PLAN" >&2; exit 2; }

[ -n "$OUT" ] || OUT=$(mktemp -d)
mkdir -p "${OUT:?}" || exit 2

echo "mutation-envelope: every row measured under: $TEST_CMD"
echo

ROWS=0
BAD=0
while IFS=$'\t' read -r id file mutation || [ -n "${id:-}" ]; do
  case "${id:-}" in ''|'#'*) continue ;; esac
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
