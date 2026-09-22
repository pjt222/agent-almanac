#!/usr/bin/env bash
# prove-expected-codes.sh — negative evidence for `expected-codes.mjs`.
#
# Each row is a shape the predecessor parser got wrong, or one the new line-accounting rule
# must NOT over-refuse. The first was measured live: a double-quoted ninth entry in the test's
# `deepEqual` left the parser printing eight codes, the script's eight-code fixture matched,
# and the guard passed while the test asserted nine (#883 round 5 delta, SF-A). A parser that
# drops what it cannot read reports an absence where a reader would see a mismatch, and only
# the second reading is safe.
#
# Every arm builds its own `git archive` lab, so no arm sees another arm's edit, and each lab
# takes the WORKING-TREE copies of the two files under test — this runs before they are
# committed as well as after.
#
# Root derived from this file's own location; override with argv[1]. Scratch defaults to a
# fresh mktemp -d. Exit 0 when every arm lands where it should, 1 otherwise.
set -uo pipefail

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO=${1:-$(cd "${HERE:?}/../../.." && pwd)}
S=${2:-$(mktemp -d)}
TEST=scripts/test/publishable-tree.test.js
SCRIPT=tests/results/2026-09-22-publishable-tree-columns/two-column-pack.sh
CODES=tests/results/2026-09-22-publishable-tree-columns/expected-codes.mjs

lab() {                       # lab <name> -> prints the lab path
  local dir="${S:?}/exp-$1"
  rm -rf "${dir:?}"
  mkdir -p "${dir:?}" || return 1
  (cd "${REPO:?}" && git archive HEAD) | tar -x -C "${dir:?}"
  # The working-tree copies, since the fix is not committed yet.
  cp "${REPO:?}/${CODES}" "${dir:?}/${CODES}"
  cp "${REPO:?}/${SCRIPT}" "${dir:?}/${SCRIPT}"
  printf '%s' "${dir:?}"
}

row() {                       # row <label> <lab> <want-codes-exit> <want-script-exit>
  local label="$1" dir="$2" wantc="$3" wants="$4"
  node "${dir:?}/${CODES}" "${dir:?}" > "${dir:?}/codes.out" 2> "${dir:?}/codes.err"
  local cexit=$?
  local lines
  lines=$(wc -l < "${dir:?}/codes.out")
  bash "${dir:?}/${SCRIPT}" > "${dir:?}/script.out" 2>&1
  local sexit=$?
  local verdict="ok"
  [ "$cexit" = "$wantc" ] || verdict="WRONG (codes exit $cexit, wanted $wantc)"
  [ "$sexit" = "$wants" ] || verdict="WRONG (script exit $sexit, wanted $wants)"
  printf '%-34s codes exit %s (%s line(s))  script exit %s   %s\n' \
    "$label" "$cexit" "$lines" "$sexit" "$verdict"
  [ "$verdict" = "ok" ]
}

# Provenance, because a table quoted out of this transcript has to say what it measured. Each
# lab is `git archive HEAD` with the WORKING-TREE copies of the two files under test laid over
# it, so a dirty copy is the normal case while a fix is being written — and a reader who does
# not know that cannot tell a proof of the committed state from a proof of an uncommitted one
# (#883 round 6 delta, N-3).
SHA=$(cd "${REPO:?}" && git rev-parse --short HEAD 2>/dev/null || echo '<no repo>')
DIRTY=$(cd "${REPO:?}" && git status --porcelain -- "${CODES}" "${SCRIPT}" 2>/dev/null)
printf 'measuring: %s at %s, overlaid with the working-tree copies of\n' "$(basename "${BASH_SOURCE[0]}")" "$SHA"
printf '  %s\n  %s\n' "${CODES}" "${SCRIPT}"
if [ -n "$DIRTY" ]; then
  printf 'those copies are DIRTY against %s:\n%s\n\n' "$SHA" "$(printf '%s' "$DIRTY" | sed 's/^/  /')"
else
  printf 'those copies are CLEAN against %s\n\n' "$SHA"
fi

BAD=0

d=$(lab control) || exit 1
row "control: untouched" "$d" 0 0 || BAD=$((BAD + 1))

# The comment goes after the FIRST entry, not the last. A premature close has to drop something
# for this arm to be able to fail: `staged.md` is the last key in the block, so a comment placed
# after it truncates nothing and the arm would pass against the very parser it is meant to
# catch. Placed here, the old character walk closed the block at the commented brace and kept
# ONE entry.
d=$(lab brace-comment) || exit 1
python3 "${REPO:?}/tools/patch-literal.py" "${d:?}/${TEST}" --replace \
  "    'skills/real/SKILL.md': 'MD',::    'skills/real/SKILL.md': 'MD',
    // a comment carrying a stray } brace" >/dev/null
row "} inside a comment in the block" "$d" 0 0 || BAD=$((BAD + 1))

d=$(lab title-twice) || exit 1
python3 "${REPO:?}/tools/patch-literal.py" "${d:?}/${TEST}" --replace \
  "test('the four unmerged codes::test('a TWO-COLUMN code — the four unmerged codes" >/dev/null
row "title prefix occurs twice" "$d" 2 2 || BAD=$((BAD + 1))

d=$(lab dquote) || exit 1
python3 "${REPO:?}/tools/patch-literal.py" "${d:?}/${TEST}" --replace \
  "    'skills/real/staged.md': 'T ',::    'skills/real/staged.md': 'T ',
    \"skills/real/ninth.md\": \"AM\"," >/dev/null
row "double-quoted ninth entry" "$d" 2 2 || BAD=$((BAD + 1))

d=$(lab comment) || exit 1
python3 "${REPO:?}/tools/patch-literal.py" "${d:?}/${TEST}" --replace \
  "    'skills/real/staged.md': 'T ',::    'skills/real/staged.md': 'T ',
    // a comment mentioning 'skills/real/ghost.md': 'AM' in passing" >/dev/null
row "comment quoting a pair" "$d" 0 0 || BAD=$((BAD + 1))

d=$(lab retitled) || exit 1
python3 "${REPO:?}/tools/patch-literal.py" "${d:?}/${TEST}" --replace \
  "test('a TWO-COLUMN code is read::test('a two column code is read" >/dev/null
row "test title reworded" "$d" 2 2 || BAD=$((BAD + 1))

d=$(lab renamed) || exit 1
python3 "${REPO:?}/tools/patch-literal.py" "${d:?}/${TEST}" --count 6 --replace \
  "new2.md::new3.md" >/dev/null
row "test fixture renamed" "$d" 0 1 || BAD=$((BAD + 1))

d=$(lab message) || exit 1
python3 "${REPO:?}/tools/patch-literal.py" "${d:?}/${TEST}" --replace \
  "'the fixture is vacuous unless git reports all eight shapes::'all eight shapes must be reported" >/dev/null
row "assertion message reworded" "$d" 0 0 || BAD=$((BAD + 1))

echo
if [ "$BAD" -eq 0 ]; then
  echo "prove-expected-codes: OK — every arm landed where it should"
  exit 0
fi
echo "prove-expected-codes: $BAD arm(s) wrong" >&2
exit 1
