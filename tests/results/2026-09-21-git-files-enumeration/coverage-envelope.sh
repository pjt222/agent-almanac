#!/usr/bin/env bash
# B1 envelope: does the NEW behavioural coverage catch the exact scenario the old source scan
# was measured green on, and does it stay green on the states that are not that scenario?
#
# Four arms, because two are controls. The first version of this script had only one control and
# it was the wrong one — it removed the planted file while LEAVING the mutation, which the
# fixture test catches on its own, so a correct instrument reported INCONCLUSIVE.
#
#   A  unmutated, clean tree                 expect GREEN  (baseline)
#   B  unmutated + a gitignored script       expect GREEN  (the suite does not flag any ignored file)
#   C  mutated (disk walk) + that file       expect RED    (the B1 scenario the old scan passed)
#   D  mutated, clean tree                   expect RED    (the fixture alone is enough)
#
# Runs entirely inside a clone under the scratchpad; every destructive command uses a braced
# absolute path under $DIR.
set -uo pipefail

# Derived from this script's own location, so the clone is of the revision the script was
# committed at rather than of whatever the author has checked out.
SRC=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
DIR=$(mktemp -d)
trap 'rm -rf "${DIR:?}"' EXIT
cd "${DIR:?}" || exit 1

git clone -q -s "$SRC" clone || exit 1
cd "${DIR:?}/clone" || exit 1
[ "$(git rev-parse --show-toplevel)" = "${DIR:?}/clone" ] || { echo "REFUSED: not in the clone"; exit 1; }
ln -s "$SRC/node_modules" "${DIR:?}/clone/node_modules"

suite() {
  node --test scripts/test/tree-counts.test.js > "${DIR:?}/$1.log" 2>&1
  local code=$?
  printf '%-4s exit=%s  %s\n' "$1" "$code" "$(rg -N 'ℹ (pass|fail) [0-9]+' "${DIR:?}/$1.log" | tr '\n' ' ')"
  return $code
}

plant() {
  printf 'local-*.js\n' >> .git/info/exclude
  printf 'console.log(1)\n' > "${DIR:?}/clone/scripts/local-probe.js"
  git check-ignore -q scripts/local-probe.js || { echo "REFUSED: the planted file is not ignored"; exit 1; }
  # `rg -c` prints NOTHING and exits 1 on zero matches, where GNU grep prints 0 — so the count
  # has to be defaulted or the guard refuses on the very state it is checking for.
  SEEN=$(git status --porcelain | rg -c "local-probe" || echo 0)
  [ "$SEEN" = "0" ] || { echo "REFUSED: git status can see it, so it is not the silent case"; exit 1; }
}

mutate() {
  python3 "$SRC/tools/patch-literal.py" scripts/lib/tree-counts.js \
    --replace "import { existsSync } from 'node:fs';::import { existsSync, readdirSync } from 'node:fs';" \
    --replace "  return topLevelEntries(root, 'scripts').files
    .filter((name) => SCRIPT_EXTENSIONS.some((ext) => name.endsWith(ext))).length;::  return readdirSync(resolve(root, 'scripts'))
    .filter((name) => SCRIPT_EXTENSIONS.some((ext) => name.endsWith(ext))).length;" \
    > "${DIR:?}/patch.log" 2>&1 || { echo "REFUSED: the mutation did not apply"; tail -2 "${DIR:?}/patch.log"; exit 1; }
}

echo "=== A: unmutated, clean (expect GREEN) ==="
suite A; A=$?

echo
echo "=== B: unmutated + a gitignored scripts/local-probe.js (expect GREEN) ==="
plant
suite B; B=$?

echo
echo "=== C: scriptFileCount reverted to a disk walk, file still planted (expect RED) ==="
mutate
suite C; C=$?
rg -N '^✖ |not part of the artifact' "${DIR:?}/C.log" | head -3

echo
echo "=== D: same mutation, planted file removed (expect RED — the fixture alone catches it) ==="
rm -f "${DIR:?}/clone/scripts/local-probe.js"
suite D; D=$?

echo
if [ "$A" -eq 0 ] && [ "$B" -eq 0 ] && [ "$C" -ne 0 ] && [ "$D" -ne 0 ]; then
  echo "VERDICT: coverage is real. Green on both non-defect states, red on the B1 scenario,"
  echo "and red on the mutation alone — so it does not depend on the repository's own tree."
else
  echo "VERDICT: INCONCLUSIVE — A=$A (want 0) B=$B (want 0) C=$C (want non-zero) D=$D (want non-zero)."
fi
