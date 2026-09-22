#!/usr/bin/env bash
# prove-the-bypass-survived.sh — the #877 claim, as four arms with two controls.
#
# THE CLAIM
#   Before this change, a directory walk reintroduced into `generate-readmes.js` did not fail
#   `npm run test:scripts`. The tripwire in `tree-counts.test.js` denylists `readdirSync` and
#   `statSync` BY NAME, so `opendirSync` walks straight past it — and because the mutation can be
#   written as ONE line (drop the name from the `lib/tree-counts.js` import, define it locally),
#   it needs no second import line either. That is the #874 review's M1, minus the hand edit.
#
# WHY A LAB RATHER THAN THE WORKING TREE
#   The interesting arm runs at the PARENT commit, where `security-surface.test.js` does not
#   exist. Reproducing that by editing the checkout means restoring three files and a deletion
#   afterwards, and a probe that can leave the repository in a state nobody expects is worth
#   less than the figure it produces. Each arm therefore runs in a throwaway `git archive`
#   extraction under TMPDIR, with `node_modules` symlinked in. Nothing here writes to the
#   repository.
#
# THE CONTROLS ARE NOT OPTIONAL
#   `SURVIVED` and `the lab never ran the suite` render identically as exit 0. So each lab runs
#   the suite UNMUTATED first, and a lab whose clean arm is not green refuses the whole script
#   rather than reporting a survival it cannot justify.
#
# The mutation is READ OUT OF `mutation-plan.tsv`, never retyped here: the row a reader can
# re-run through `tools/mutation-envelope.sh` and the string this script applies are then one
# string, and a plan edit cannot leave this file quietly measuring something else.
#
#   bash tests/results/2026-09-22-generate-readmes-importable/prove-the-bypass-survived.sh
#   bash ... prove-the-bypass-survived.sh --base <sha>     # a different parent
#
# Exit 0 when the four arms come out base-clean green, base-mutated GREEN (survived), head-clean
# green, head-mutated RED (killed). Exit 1 when an arm disagrees. Exit 2 when it could not run.
set -uo pipefail

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT=$(cd "${HERE:?}/../../.." && pwd)
# shellcheck source=_lab.sh
. "${HERE:?}/_lab.sh" || { echo "REFUSED: could not source _lab.sh" >&2; exit 2; }
PLAN="${HERE:?}/mutation-plan.tsv"
ROW_ID=${ROW_ID:-opendir-bypass}
# The commit this branch left: the merge of #883, where the generator was still unimportable.
BASE=d6b9b9c72dea1f88ab60f84c7611dfedc16790d4
TEST_CMD=${TEST_CMD:-npm run test:scripts}

while [ $# -gt 0 ]; do
  case "$1" in
    --base) BASE=${2:-}; shift 2 ;;
    *) echo "REFUSED: unknown argument $1" >&2; exit 2 ;;
  esac
done

cd "${ROOT:?}" || exit 2
[ -f "${PLAN:?}" ] || { echo "REFUSED: no plan at ${PLAN}" >&2; exit 2; }
[ -d "${ROOT:?}/node_modules" ] || { echo "REFUSED: no node_modules to link into the labs" >&2; exit 2; }
git rev-parse --verify --quiet "${BASE}^{commit}" >/dev/null || {
  echo "REFUSED: ${BASE} is not a commit in this repository" >&2; exit 2; }

MUTATION=$(ROW="${ROW_ID}" PLAN="${PLAN}" python3 - <<'PY'
import os, sys
want = os.environ['ROW']
for line in open(os.environ['PLAN'], encoding='utf-8'):
    if line.startswith('#') or not line.strip():
        continue
    parts = line.rstrip('\n').split('\t')
    if len(parts) == 3 and parts[0] == want:
        print(f'{parts[1]}\t{parts[2]}', end='')
        sys.exit(0)
sys.exit(f'REFUSED: no row `{want}` in the plan')
PY
) || { echo "${MUTATION}" >&2; exit 2; }
MUT_FILE=${MUTATION%%$'\t'*}
MUT_BODY=${MUTATION#*$'\t'}
# The default `node:test` reporter is TAP on a non-TTY below Node 24 (measured: v20.20.2 and
# v22.16.0 open with `TAP version 13`, v24.20.0 and v25.9.0 with `✖ …`), and `engines` allows
# `>=22.12.0`. Under TAP the `KILLED by:` block below prints nothing beneath its heading while
# the script still exits 0. Pin the reporter so every supported Node produces the bytes this
# file parses (verified on 20, 22 and 24).
export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--test-reporter=spec --test-reporter-destination=stdout"

echo "prove-the-bypass-survived: row ${ROW_ID} on ${MUT_FILE}, every arm under: ${TEST_CMD}"
echo "  base: $(git rev-parse --short "${BASE}")   head: $(git rev-parse --short HEAD)   node $(node --version)"
echo

LABS=$(mktemp -d)
trap 'rm -rf "${LABS:?}"' EXIT

# Apply the row's mutation inside a lab, refusing unless the needle occurs exactly once.
apply_mutation() {  # apply_mutation <dir>
  MUTATION="${MUT_BODY}" TARGET="${1:?}/${MUT_FILE}" python3 - <<'PY'
import os, sys
mutation = os.environ['MUTATION']
sep = mutation.index('::')
old, new = mutation[:sep], mutation[sep + 2:]
path = os.environ['TARGET']
with open(path, encoding='utf-8') as fh:
    src = fh.read()
n = src.count(old)
if n != 1:
    sys.exit(f'REFUSED: the needle occurs {n} time(s) in {path}, expected exactly 1')
with open(path, 'w', encoding='utf-8') as fh:
    fh.write(src.replace(old, new, 1))
PY
}

run_suite() {  # run_suite <dir> -> exit code
  ( cd "${1:?}" && eval "${TEST_CMD}" ) > "${1:?}/suite.log" 2>&1
  echo $?
}

fail=0
for what in base head; do
  case "$what" in
    base) sha=$BASE ;;
    head) sha=$(git rev-parse HEAD) ;;
  esac
  dir="${LABS:?}/${what}"
  if ! build_lab "${ROOT:?}" "$sha" "$dir"; then
    echo "REFUSED: could not build the ${what} lab at ${sha}" >&2
    exit 2
  fi

  # CONTROL first. An arm that reports SURVIVED from a lab that never ran the suite is the
  # vacuous pass this whole file exists to refuse.
  clean_rc=$(run_suite "$dir")
  clean_tests=$(sed -n 's/^. tests \([0-9]*\)$/\1/p' "${dir:?}/suite.log" | tail -1)
  if [ "$clean_rc" -ne 0 ] || [ -z "${clean_tests:-}" ]; then
    # The log is copied OUT of LABS before the message names it. The EXIT trap removes LABS, so
    # the earlier form pointed a reader at a path that no longer existed the moment they read it
    # — and it happened: a load-dependent red on a base lab was unidentifiable because the
    # evidence had been deleted by the script reporting it (#888 round-1 N7).
    keep=$(mktemp -d)
    cp -- "${dir:?}/suite.log" "${keep:?}/${what}-clean-suite.log" 2>/dev/null
    echo "REFUSED: the ${what} lab is not green UNMUTATED (exit ${clean_rc}, tests '${clean_tests:-none}')." >&2
    echo "  Nothing measured against it would mean anything." >&2
    echo "  Its log is kept at ${keep}/${what}-clean-suite.log" >&2
    tail -12 "${dir:?}/suite.log" >&2
    exit 2
  fi
  echo "${what}-clean      exit ${clean_rc}  (${clean_tests} tests)   <- control"

  apply_mutation "$dir" || exit 2
  mut_rc=$(run_suite "$dir")
  mut_tests=$(sed -n 's/^. tests \([0-9]*\)$/\1/p' "${dir:?}/suite.log" | tail -1)
  names=$(awk '/^✖ / && $0 != "✖ failing tests:" {sub(/ \([0-9.]*ms\)$/, ""); print}' "${dir:?}/suite.log" | sort -u)

  if [ "$what" = base ]; then
    if [ "$mut_rc" -eq 0 ]; then
      echo "base-mutated    exit ${mut_rc}  (${mut_tests} tests)   SURVIVED — the bypass was not covered"
    else
      echo "base-mutated    exit ${mut_rc}   EXPECTED SURVIVED, got a kill by:"
      printf '%s\n' "$names" | sed 's/^/    /'
      fail=1
    fi
  else
    if [ "$mut_rc" -ne 0 ]; then
      # A kill that names nothing is a parse failure, not a quiet kill: under a TAP reporter the
      # heading below would print with an empty block beneath it and the script would exit 0.
      if [ -z "$names" ]; then
        keep=$(mktemp -d)
        cp -- "${dir:?}/suite.log" "${keep:?}/head-mutated-suite.log" 2>/dev/null
        echo "REFUSED: the head arm is red but no ✖ line was parsed — the reporter is not spec." >&2
        echo "  Log kept at ${keep}/head-mutated-suite.log" >&2
        exit 2
      fi
      echo "head-mutated    exit ${mut_rc}  (${mut_tests} tests)   KILLED by:"
      printf '%s\n' "$names" | sed 's/^/    /'
    else
      echo "head-mutated    exit ${mut_rc}   EXPECTED KILLED, SURVIVED — the fix does not close it"
      fail=1
    fi
  fi
done

echo
if [ "$fail" -eq 0 ]; then
  echo "VERDICT: the bypass survived at the parent commit and is killed at this one."
else
  echo "VERDICT: an arm disagreed with the claim above. Read it before quoting anything." >&2
fi
exit "$fail"
