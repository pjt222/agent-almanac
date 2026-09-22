#!/usr/bin/env bash
# two-column-pack.sh — what npm actually packs from the two-column fixture (#883 round 3, SF-1).
#
# The test's closing comment asserts which of the eight shapes reach the tarball, and that
# sentence has been wrong once already: it said "package.json alone", which was true before
# `A `/`AM` were added to the fixture and false afterwards. A sentence about npm's behaviour
# that no committed script re-derives is exactly the HISTORICAL figure this directory exists to
# avoid, so the fixture is rebuilt here and npm is asked.
#
# Builds the same eight codes as `scripts/test/publishable-tree.test.js`'s two-column test.
#
# DRIFT. The fixture is rebuilt here by hand rather than imported, so nothing structurally ties
# the two: a change to the test's fixture would leave this script reporting the same 3 files
# beside a comment that is false again. The tie is the comparison below, and it reads the eight
# codes OUT OF THE TEST (`expected-codes.mjs`) rather than declaring its own. A declared literal
# was the state until #883 round 5, and it was the fifth instance of this PR's recurring class:
# the guard compared two things in the same file while its comment said it refused when the
# test's fixture changed. Importing the test's `pkg()` from a results directory would couple a
# record to a suite that is free to move; the alternative worth taking if this drifts again is
# for the test itself to shell out to `npm pack --dry-run --json` and assert the listing, at
# about a second per run, retiring this script.
#
# Needs git, npm and node. It writes only under its own `mktemp -d`: `NODE_DISABLE_COMPILE_CACHE`
# is set because the `npm pack` it runs otherwise makes npm write a `node-compile-cache/` into
# `TMPDIR`, outside `DIR`, which the trap does not remove (#883 round 4, N-1). An earlier
# revision of this header claimed the clean behaviour before it was true.
set -uo pipefail

# Resolved BEFORE the cd, and absolutely: everything below runs inside a throwaway fixture.
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "${HERE:?}/../../.." && pwd)
export NODE_DISABLE_COMPILE_CACHE=1

DIR=$(mktemp -d)
trap 'rm -rf "${DIR:?}"' EXIT
cd "${DIR:?}" || exit 1
export GIT_CONFIG_NOSYSTEM=1 HOME="${DIR:?}" XDG_CONFIG_HOME="${DIR:?}/.config"

mkdir -p "${DIR:?}/skills/real/references" || exit 1
cat > "${DIR:?}/package.json" <<'JSON'
{ "name": "fixture", "version": "1.0.0", "files": ["skills/", "!skills/_template/"] }
JSON
printf '__pycache__/\n*.log\n' > "${DIR:?}/.gitignore"
printf '# real\n'    > "${DIR:?}/skills/real/SKILL.md"
printf 'print(1)\n'  > "${DIR:?}/skills/real/references/helper.py"
printf '# staged\n'  > "${DIR:?}/skills/real/staged.md"
printf '# retyped\n' > "${DIR:?}/skills/real/retyped.md"

git init -q -b main >/dev/null 2>&1
git config user.email t@example.invalid
git config user.name fixture
git add -A >/dev/null 2>&1
git commit -qm base >/dev/null 2>&1

# AD: staged add, then removed.            MD: staged edit, then removed.
printf '# added\n' > "${DIR:?}/skills/real/added.md"; git add skills/real/added.md >/dev/null 2>&1
rm -- "${DIR:?}/skills/real/added.md"
printf '# edited\n' > "${DIR:?}/skills/real/SKILL.md"; git add skills/real/SKILL.md >/dev/null 2>&1
rm -- "${DIR:?}/skills/real/SKILL.md"
#  T: tracked file retyped.                T : the same retype, staged.
rm -- "${DIR:?}/skills/real/references/helper.py"; ln -s /dev/null "${DIR:?}/skills/real/references/helper.py"
rm -- "${DIR:?}/skills/real/staged.md"; ln -s /dev/null "${DIR:?}/skills/real/staged.md"
git add skills/real/staged.md >/dev/null 2>&1
# MT: staged edit, then retyped.           AT: staged add, then retyped.
printf '# edited\n' > "${DIR:?}/skills/real/retyped.md"; git add skills/real/retyped.md >/dev/null 2>&1
rm -- "${DIR:?}/skills/real/retyped.md"; ln -s /dev/null "${DIR:?}/skills/real/retyped.md"
printf '# addsym\n' > "${DIR:?}/skills/real/addsym.md"; git add skills/real/addsym.md >/dev/null 2>&1
rm -- "${DIR:?}/skills/real/addsym.md"; ln -s /dev/null "${DIR:?}/skills/real/addsym.md"
# A : staged add, still on disk.           AM: staged add, edited after staging.
printf '# new\n'  > "${DIR:?}/skills/real/new.md"
printf '# new2\n' > "${DIR:?}/skills/real/new2.md"
git add skills/real/new.md skills/real/new2.md >/dev/null 2>&1
printf '# new2 edited\n' > "${DIR:?}/skills/real/new2.md"

echo "git $(git --version | awk '{print $3}'), npm $(npm --version), node $(node --version)"
echo
echo "=== what git reports ==="
# `LC_ALL=C sort`, because the two sides are sorted by different programs and only a byte order
# is common to both. `expected-codes.mjs` sorts with JavaScript's `Array.prototype.sort`, which
# is code-unit order, while coreutils `sort` collates by locale — and under `en_US.UTF-8`
# leading whitespace is ignored at the first collation level, so `A  new.md` lands after
# `AD added.md` instead of before it. Measured by the #883 round-6 reviewer against a privately
# compiled `en_US.UTF-8`: exit 1, REFUSED, over a diff showing the same eight lines in two
# orders. Under `C` and `C.UTF-8` the orders agree, which is why neither of us saw it until it
# was looked for. It failed closed — a false refusal in a record script, not a false pass — and
# it is a one-token fix either way.
PORCELAIN=$(git status --porcelain -z --no-renames --ignored=matching -uall -- skills/ \
  | tr '\0' '\n' | sed '/^$/d' | LC_ALL=C sort)
printf '%s\n' "$PORCELAIN"

# The tie to the test, READ FROM THE TEST. `expected-codes.mjs` parses the two-column test's
# `deepEqual` on `found.codes` and prints the eight codes it asserts, so if the test's fixture
# changes and this one does not, the run REFUSES here instead of printing a pack listing that
# backs a comment which is no longer true.
#
# This carried a literal of its own until #883 round 5: the script named the test in three
# comments and read nothing from it, so the only drift it could see was between two things in
# the same file — a check described as guarding X that never reads X. Measured: renaming
# `new2.md` to `new3.md` at all six sites of the test's fixture left the test green (27/27) and
# this script at exit 0 with zero `REFUSED` lines.
EXPECTED=$(node "${HERE:?}/expected-codes.mjs" "${REPO_ROOT:?}")
NODE_STATUS=$?
if [ "$NODE_STATUS" -ne 0 ] || [ -z "$EXPECTED" ]; then
  echo "REFUSED: could not read the codes the two-column test asserts (exit ${NODE_STATUS})." >&2
  echo "Without them this script would compare its fixture against nothing and pass." >&2
  exit 2
fi
# WHAT THIS TIE DOES NOT COVER, stated because the comparison looks stronger than it is. The
# codes match; the CONSTRUCTIONS are still duplicated, and a code does not determine whether
# npm packs the path. Measured (#883 round 6, N-1): ` T` packs the file when the COMMITTED
# object was a symlink retyped to a regular file, and drops it when a committed regular file
# was retyped to a symlink — which is this fixture's shape and the test's. So "same codes"
# implies "same pack" only because both commit regular files, and nothing here checks that. A
# change in the test that keeps a code but flips packedness would leave this listing true of
# this tree and false of the test's. The durable form, if that ever bites: the test asserts
# `npm pack --dry-run --json` on its own fixture and this script retires.
if [ "$PORCELAIN" != "$EXPECTED" ]; then
  echo "REFUSED: this fixture no longer builds the eight codes the two-column test asserts." >&2
  diff <(printf '%s\n' "$EXPECTED") <(printf '%s\n' "$PORCELAIN") >&2
  echo "Reconcile it with scripts/test/publishable-tree.test.js before quoting any pack listing." >&2
  exit 1
fi

echo
echo "=== what npm packs ==="
out=$(npm pack --dry-run --json 2>"${DIR:?}/npm.err")
rc=$?
if [ "$rc" -ne 0 ]; then
  echo "REFUSED: npm pack exited ${rc} — a zero-file listing here would read as a clean result" >&2
  head -3 "${DIR:?}/npm.err" >&2
  exit 1
fi
printf '%s' "$out" | node -e '
let s = ""; process.stdin.on("data", (d) => { s += d; }).on("end", () => {
  const files = JSON.parse(s)[0].files.map((f) => f.path).sort();
  if (files.length === 0) { console.error("REFUSED: npm listed no files at all"); process.exit(1); }
  for (const f of files) console.log(`  ${f}`);
  console.log(`  --- ${files.length} file(s)`);
});'
