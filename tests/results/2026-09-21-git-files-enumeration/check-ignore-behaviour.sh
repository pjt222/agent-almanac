#!/usr/bin/env bash
# Does `git check-ignore` report a TRACKED path as ignored?
#
# It decides whether the enumerator needs its own tracked-set union: if git already refuses to
# call a tracked path ignored, the union is dead code, and dead code in an accept rule is worse
# than absent code because a reader believes it does something.
#
# Fixture only. Every destructive command uses a braced absolute path under $DIR.
set -uo pipefail

DIR=$(mktemp -d)
cd "${DIR:?}" || exit 1
export GIT_CONFIG_NOSYSTEM=1 HOME="${DIR:?}" XDG_CONFIG_HOME="${DIR:?}/.config"

git init -q -b main .
git config user.email t@example.invalid
git config user.name fixture
printf '*.log\nbuild/\n' > .gitignore
printf 'x\n' > tracked-but-ignored.log
printf 'x\n' > plain.log
mkdir build
printf 'x\n' > build/a.txt
printf 'x\n' > normal.txt
git add .gitignore normal.txt
git add -f tracked-but-ignored.log
git commit -qm init

echo "--- tracked ---"
git ls-files

echo "--- check-ignore (default, index consulted) ---"
printf 'tracked-but-ignored.log\0plain.log\0build\0build/a.txt\0normal.txt\0' \
  | git check-ignore -z --stdin | tr '\0' '\n'
echo "(exit ${PIPESTATUS[1]:-?})"

echo "--- check-ignore --no-index ---"
printf 'tracked-but-ignored.log\0plain.log\0' \
  | git check-ignore -z --no-index --stdin | tr '\0' '\n'
echo "(exit ${PIPESTATUS[1]:-?})"

echo "--- exit code when NOTHING matches ---"
printf 'normal.txt\0' | git check-ignore -z --stdin
echo "(exit ${PIPESTATUS[1]:-?})"

echo "--- exit code outside a repository ---"
cd /tmp || exit 1
printf 'x\0' | git check-ignore -z --stdin 2>&1 | head -1
echo "(exit ${PIPESTATUS[1]:-?})"

echo "--- a nested .gitignore and a negation ---"
cd "${DIR:?}" || exit 1
mkdir -p deep/sub
printf '*.tmp\n!keep.tmp\n' > deep/.gitignore
printf 'x\n' > deep/drop.tmp
printf 'x\n' > deep/keep.tmp
printf 'x\n' > deep/sub/drop.tmp
printf 'deep/drop.tmp\0deep/keep.tmp\0deep/sub/drop.tmp\0' | git check-ignore -z --stdin | tr '\0' '\n'
echo "(exit ${PIPESTATUS[1]:-?})"

echo "--- info/exclude ---"
printf 'excluded-here\n' > .git/info/exclude
printf 'x\n' > excluded-here
printf 'excluded-here\0' | git check-ignore -z --stdin | tr '\0' '\n'
echo "(exit ${PIPESTATUS[1]:-?})"

cd /tmp || exit 1
rm -rf "${DIR:?}"
