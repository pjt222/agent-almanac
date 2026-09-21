#!/usr/bin/env bash
# Does backslash-escaping a candidate make `check-ignore` answer about the NAME rather than
# about a pathspec, and what does it echo back?
#
# This measures the INDEX side only, where the answer is yes. It is half the question, and the
# half it does not cover is what decided the design: see `escaping-matrix.mjs`, which measures
# the PATTERN side and finds escaping wrong in six of eight fixtures. The enumerator REFUSES such
# a name; this script is the record of why the alternative looked good first.
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
printf 'x\n' > tools/ab.log
printf 'x\n' > tools/xay.log
git add -f .gitignore tools/ab.log tools/xay.log
git commit -qm init
printf 'x\n' > 'tools/a\b.log'
printf 'x\n' > 'tools/x*y.log'
printf 'x\n' > 'tools/q?.sh'

echo "--- what git status --ignored says ---"
git status --porcelain --ignored | rg 'log|sh' | sort

echo
echo "--- RAW candidates (the bug) ---"
printf 'tools/a\\b.log\0tools/x*y.log\0tools/q?.sh\0' | git check-ignore -z --stdin | tr '\0' '\n'
echo "(exit ${PIPESTATUS[1]:-?})"

echo
echo "--- ESCAPED candidates ---"
printf 'tools/a\\\\b.log\0tools/x\\*y.log\0tools/q\\?.sh\0' | git check-ignore -z --stdin | tr '\0' '\n' | cat -A | head -5
echo "(exit ${PIPESTATUS[1]:-?})"

echo
echo "--- does the echo come back ESCAPED or RESOLVED? (one path, verbatim bytes) ---"
printf 'tools/x\\*y.log\0' | git check-ignore -z --stdin | od -c | head -3

echo
echo "--- control: an ordinary candidate still answers correctly when escaped ---"
mkdir -p tools/__pycache__ && printf 'x' > tools/__pycache__/a.pyc
printf '__pycache__/\n' >> .gitignore
printf 'tools/__pycache__\0tools/plain.sh\0' | git check-ignore -z --stdin | tr '\0' '\n'
echo "(exit ${PIPESTATUS[1]:-?})"
echo "and with a backslash-escape applied to a name that needs none:"
printf 'tools/__pycache__\0' | git check-ignore -z --stdin | tr '\0' '\n'
echo "(exit ${PIPESTATUS[1]:-?})"
