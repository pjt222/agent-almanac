#!/usr/bin/env bash
# W1 from the #874 review: `git check-ignore` parses each candidate as a PATHSPEC, so a literal
# file named `x*y.log` is reported NOT ignored when a tracked sibling glob-matches it.
#
# Question this answers: does `--literal-pathspecs` fix it, or must the enumerator refuse such a
# candidate? A fix is better than a refusal if git offers one.
set -uo pipefail

DIR=$(mktemp -d)
trap 'rm -rf "${DIR:?}"' EXIT
cd "${DIR:?}" || exit 1
export GIT_CONFIG_NOSYSTEM=1 HOME="${DIR:?}" XDG_CONFIG_HOME="${DIR:?}/.config"

git init -q -b main .
git config user.email t@example.invalid
git config user.name fixture
mkdir -p tools
printf '*.log\n' > .gitignore
# The tracked sibling that makes the glob match something in the index.
printf 'x\n' > tools/xay.log
git add -f .gitignore tools/xay.log
git commit -qm init
# The literal file whose NAME contains glob metacharacters.
printf 'x\n' > 'tools/x*y.log'

echo "--- git status --ignored sees both as ignored ---"
git status --porcelain --ignored | rg 'log'

echo
echo "--- default check-ignore ---"
printf 'tools/x*y.log\0tools/xay.log\0' | git check-ignore -z --stdin | tr '\0' '\n'
echo "(exit ${PIPESTATUS[1]:-?})"

echo
echo "--- with --literal-pathspecs ---"
printf 'tools/x*y.log\0tools/xay.log\0' | git --literal-pathspecs check-ignore -z --stdin | tr '\0' '\n'
echo "(exit ${PIPESTATUS[1]:-?})"

echo
echo "--- with GIT_LITERAL_PATHSPECS=1 ---"
printf 'tools/x*y.log\0tools/xay.log\0' | GIT_LITERAL_PATHSPECS=1 git check-ignore -z --stdin | tr '\0' '\n'
echo "(exit ${PIPESTATUS[1]:-?})"

echo
echo "--- control: does --literal-pathspecs still answer an ORDINARY candidate correctly? ---"
mkdir -p tools/__pycache__
printf '__pycache__/\n' >> .gitignore
printf 'x\n' > tools/__pycache__/a.pyc
printf 'x\n' > tools/plain.sh
printf 'tools/__pycache__\0tools/plain.sh\0tools/xay.log\0' | git --literal-pathspecs check-ignore -z --stdin | tr '\0' '\n'
echo "(exit ${PIPESTATUS[1]:-?})"

echo
echo "--- and a path THROUGH a symlink, which was 128 for the whole batch ---"
mkdir -p real && printf 'x\n' > real/f.log
ln -s real tools/link
printf 'tools/link/f.log\0tools/plain.sh\0' | git --literal-pathspecs check-ignore -z --stdin 2>&1 | tr '\0' '\n' | head -2
echo "(exit ${PIPESTATUS[1]:-?})"
