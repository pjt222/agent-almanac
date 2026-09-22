#!/usr/bin/env bash
# generator-cli-arms.sh — "`node scripts/generate-readmes.js` and `--check` still behave
# identically", as a byte comparison rather than an assurance.
#
# #877's fourth acceptance criterion is an IDENTITY claim about a refactor that moved every
# `process.argv` read and every `process.exit` into a function behind a main-module guard. The
# cheap way to support it is to run `--check` once and see exit 0, which exercises one of the
# generator's five exit paths and says nothing about the other four — and the one most likely to
# break is `--list-outputs`, which now runs after a registry load that used to precede it.
#
# So every path runs, at the PARENT commit and at this one, and the two output trees are diffed:
#
#   list            --list-outputs, the twelve managed paths           exit 0
#   check-clean     --check on an untouched tree                       exit 0
#   write-clean     write mode on an untouched tree, plus `git status` exit 0, 0 dirty (ONE line)
#   check-stale     --check with one generated line perturbed          exit 1
#   check-missing   --check with one AUTO:END marker deleted           exit 2
#   write-missing   write mode with the same marker deleted            exit 2
#
# Both sides run in throwaway `git archive` labs (`_lab.sh`), because four of the six arms edit
# tracked files and two of them run the generator in WRITE mode. Nothing here touches the
# repository — the first version of this probe ran in the working tree, and a restore of its
# perturbation raced a concurrent `git status` in the same session.
#
#   bash tests/results/2026-09-22-generate-readmes-importable/generator-cli-arms.sh
#   bash ... generator-cli-arms.sh --base <sha> --out <dir>
#
# Exit 0 when the two trees are byte-identical, 1 when they differ, 2 when it could not run.
set -uo pipefail

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT=$(cd "${HERE:?}/../../.." && pwd)
# shellcheck source=_lab.sh
. "${HERE:?}/_lab.sh" || { echo "REFUSED: could not source _lab.sh" >&2; exit 2; }

# The commit this branch left: the merge of #883, where the generator ran its pipeline at import.
BASE=d6b9b9c72dea1f88ab60f84c7611dfedc16790d4
OUT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --base) BASE=${2:-}; shift 2 ;;
    --out) OUT=${2:-}; shift 2 ;;
    *) echo "REFUSED: unknown argument $1" >&2; exit 2 ;;
  esac
done

cd "${ROOT:?}" || exit 2
[ -d "${ROOT:?}/node_modules" ] || { echo "REFUSED: no node_modules to link into the labs" >&2; exit 2; }
git rev-parse --verify --quiet "${BASE}^{commit}" >/dev/null || {
  echo "REFUSED: ${BASE} is not a commit in this repository" >&2; exit 2; }

[ -n "${OUT}" ] || OUT=$(mktemp -d)
mkdir -p "${OUT:?}" || exit 2
LABS=$(mktemp -d)
trap 'rm -rf "${LABS:?}"' EXIT

echo "generator-cli-arms: base $(git rev-parse --short "${BASE}"), head $(git rev-parse --short HEAD)"
echo "  arm output under ${OUT}"
echo

# Run one arm and record stdout, stderr and the exit code. The exit code goes INTO the stdout
# file rather than beside it, so a diff that misses a file cannot also miss a verdict.
arm() {  # arm <labdir> <outdir> <name> -- <cmd...>
  a_lab=$1; a_out=$2; a_name=$3; shift 4
  ( cd "${a_lab:?}" && "$@" ) > "${a_out:?}/${a_name}.out" 2> "${a_out:?}/${a_name}.err"
  echo "exit=$?" >> "${a_out:?}/${a_name}.out"
}

for what in base head; do
  case "$what" in
    base) sha=$BASE ;;
    head) sha=$(git rev-parse HEAD) ;;
  esac
  lab="${LABS:?}/${what}"
  out="${OUT:?}/${what}"
  mkdir -p "${out:?}" || exit 2
  build_lab "${ROOT:?}" "$sha" "$lab" || { echo "REFUSED: could not build the ${what} lab" >&2; exit 2; }

  gen="scripts/generate-readmes.js"
  arm "$lab" "$out" list        -- node "$gen" --list-outputs
  arm "$lab" "$out" check-clean -- node "$gen" --check
  arm "$lab" "$out" write-clean -- node "$gen"
  # ONE line, not two. The porcelain count used to be appended BELOW the `exit=` line, and the
  # verdict comparison reads `tail -1` — so the write-clean arm's exit code was never compared at
  # all. Measured in the #888 round-2 review with a `node` shim that failed plain write mode with
  # exit 5: twelve files per side, a byte-identical diff and a green VERDICT, with write mode
  # having exited 5 on both sides. Round-1 F3's shim is refused; this was the same class one line
  # up.
  #
  # Rewritten through a temp file rather than `sed -i`: in-place sed silently no-ops on the NTFS
  # mount this repository lives on, and `--out` may point there. A no-op would leave BOTH lines
  # in place — the very defect this block exists to remove.
  wc_exit=$(sed -n 's/^exit=//p' "${out:?}/write-clean.out" | tail -1)
  # `git status | wc -l` swallows git's exit status: a `git` that fails only `status` reported
  # `porcelain=0` on both sides and the run went green (#888 round 3, F5). Capture, check, THEN
  # count — an unreadable tree is not a clean one.
  wc_status=$(git -C "${lab:?}" status --porcelain) || {
    echo "REFUSED: \`git status\` failed in the ${what} lab; a porcelain count taken from it would read as clean" >&2
    exit 2
  }
  wc_porcelain=$(printf '%s' "${wc_status}" | sed '/^$/d' | wc -l | tr -d ' ')
  sed '$d' "${out:?}/write-clean.out" > "${out:?}/write-clean.tmp"
  printf 'exit=%s,porcelain=%s\n' "${wc_exit}" "${wc_porcelain}" >> "${out:?}/write-clean.tmp"
  mv -- "${out:?}/write-clean.tmp" "${out:?}/write-clean.out"

  # STALE: perturb one generated line inside an AUTO section.
  LAB="${lab:?}" python3 - <<'PY'
import os, pathlib
p = pathlib.Path(os.environ['LAB']) / 'SECURITY.md'
s = p.read_text(encoding='utf-8')
marker = '<!-- AUTO:START:security-surface -->\n'
i = s.index(marker)
p.write_text(s[:i] + marker + 'PERTURBED\n' + s[i + len(marker):], encoding='utf-8')
PY
  # A perturbation that did not apply makes the arm run against an UNPERTURBED tree, and the
  # verdict assertion then refuses under "did not produce the six verdicts" — the right exit for
  # the wrong stated reason (#888 round-2 N3). `s.index` raises on a renamed marker; python exits
  # non-zero and this says so.
  [ $? -eq 0 ] || { echo "REFUSED: could not perturb SECURITY.md — has the AUTO marker been renamed?" >&2; exit 2; }
  arm "$lab" "$out" check-stale -- node "$gen" --check
  git -C "${lab:?}" restore SECURITY.md || exit 2

  # MISSING MARKER: drop one AUTO:END. Fatal in BOTH modes, which is why both are run.
  LAB="${lab:?}" python3 - <<'PY'
import os, pathlib
p = pathlib.Path(os.environ['LAB']) / 'i18n' / 'README.md'
s = p.read_text(encoding='utf-8')
p.write_text(s.replace('<!-- AUTO:END:i18n-locales -->\n', '', 1), encoding='utf-8')
PY
  [ $? -eq 0 ] || { echo "REFUSED: could not perturb i18n/README.md — has the AUTO marker been renamed?" >&2; exit 2; }
  arm "$lab" "$out" check-missing -- node "$gen" --check
  arm "$lab" "$out" write-missing -- node "$gen"
  git -C "${lab:?}" restore i18n/README.md || exit 2

  printf '%-6s' "$what"
  for a in list check-clean write-clean check-stale check-missing write-missing; do
    printf ' %s=%s' "$a" "$(tail -1 "${out:?}/${a}.out")"
  done
  printf '\n'
done

echo
# THE CONTROLS that a diff needs, and the file count alone was NOT one of them. Two empty trees
# are identical; so are two trees of twelve files holding the same failure. Measured in the #888
# round-1 review: a `node` shim first on PATH that printed to stderr and exited 3 produced twelve
# files per side, a byte-identical diff and a green VERDICT, having generated nothing. A missing
# `node_modules` link, a wrong Node, an `ERR_MODULE_NOT_FOUND` — any SYMMETRIC failure read as
# "AC 4 holds".
#
# So the six exit codes this file's header documents are asserted per side, not merely printed.
# They are the verdicts the arms exist to produce, and a run that cannot produce them has
# measured nothing whether or not its two halves agree.
EXPECTED='list=exit=0 check-clean=exit=0 write-clean=exit=0,porcelain=0 check-stale=exit=1 check-missing=exit=2 write-missing=exit=2'
for what in base head; do
  n=$(find "${OUT:?}/${what}" -type f | wc -l | tr -d ' ')
  [ "$n" -eq 12 ] || { echo "REFUSED: the ${what} tree holds ${n} file(s), expected 12 (six arms x stdout+stderr)" >&2; exit 2; }
  observed=""
  for a in list check-clean write-clean check-stale check-missing write-missing; do
    observed="${observed}${observed:+ }${a}=$(tail -1 "${OUT:?}/${what}/${a}.out")"
  done
  if [ "$observed" != "$EXPECTED" ]; then
    echo "REFUSED: the ${what} side did not produce the six verdicts this probe is about." >&2
    echo "  expected: ${EXPECTED}" >&2
    echo "  observed: ${observed}" >&2
    echo "  Two sides can agree byte for byte and have generated nothing; that is not AC 4." >&2
    exit 2
  fi
done

if diff -r "${OUT:?}/base" "${OUT:?}/head"; then
  echo "VERDICT: all six arms byte-identical across the two commits (stdout, stderr, exit code)."
  exit 0
fi
echo "VERDICT: the arms differ. The identity claim in the PR body is false as written." >&2
exit 1
