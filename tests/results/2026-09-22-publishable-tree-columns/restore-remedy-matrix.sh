#!/usr/bin/env bash
# restore-remedy-matrix.sh — what `git restore` actually does for each absence code the
# ABSENT-OR-RETYPED remedy speaks to (#883 round 2, SF-2).
#
# The remedy named `git restore --staged --worktree` for `D ` and implied plain restore
# sufficed for everything else. It does not: on `T ` plain restore is a silent exit-0 no-op,
# and on `MD`/`MT` the two-flag form DISCARDS the staged edit that plain restore recovers.
#
# One fresh repository per (code, command) pair, so no earlier restore contaminates the next.
# Run it from anywhere; it needs only git and a writable TMPDIR.
set -uo pipefail

DIR=$(mktemp -d)
trap 'rm -rf "${DIR:?}"' EXIT
cd "${DIR:?}" || exit 1
export GIT_CONFIG_NOSYSTEM=1 HOME="${DIR:?}" XDG_CONFIG_HOME="${DIR:?}/.config"

build() {           # build <name> <code>
  local repo="${DIR:?}/$1" code="$2"
  rm -rf "${repo:?}"
  mkdir -p "${repo:?}" || return 1
  git -C "${repo:?}" init -q -b main >/dev/null 2>&1
  git -C "${repo:?}" config user.email t@example.invalid
  git -C "${repo:?}" config user.name fixture
  printf '# original\n' > "${repo:?}/f.md"
  git -C "${repo:?}" add f.md >/dev/null 2>&1
  git -C "${repo:?}" commit -qm base >/dev/null 2>&1
  case "$code" in
    ' D') rm -- "${repo:?}/f.md" ;;
    'D ') git -C "${repo:?}" rm -q --cached f.md >/dev/null 2>&1; rm -- "${repo:?}/f.md" ;;
    'MD') printf '# edited\n' > "${repo:?}/f.md"; git -C "${repo:?}" add f.md >/dev/null 2>&1; rm -- "${repo:?}/f.md" ;;
    ' T') rm -- "${repo:?}/f.md"; ln -s /dev/null "${repo:?}/f.md" ;;
    'T ') rm -- "${repo:?}/f.md"; ln -s /dev/null "${repo:?}/f.md"; git -C "${repo:?}" add f.md >/dev/null 2>&1 ;;
    'MT') printf '# edited\n' > "${repo:?}/f.md"; git -C "${repo:?}" add f.md >/dev/null 2>&1; rm -- "${repo:?}/f.md"; ln -s /dev/null "${repo:?}/f.md" ;;
    'AD') printf '# new\n' > "${repo:?}/g.md"; git -C "${repo:?}" add g.md >/dev/null 2>&1; rm -- "${repo:?}/g.md" ;;
    'AT') printf '# new\n' > "${repo:?}/g.md"; git -C "${repo:?}" add g.md >/dev/null 2>&1; rm -- "${repo:?}/g.md"; ln -s /dev/null "${repo:?}/g.md" ;;
    *) echo "unknown code: [$code]" >&2; return 1 ;;
  esac
}

target() { case "$1" in 'AD'|'AT') echo g.md ;; *) echo f.md ;; esac; }

echo "git $(git --version | awk '{print $3}')"
printf '%-6s | %-8s | %-42s | %s\n' code built command 'exit / status after'
printf -- '-------+----------+--------------------------------------------+----------------------------\n'
for code in ' D' 'D ' 'MD' ' T' 'T ' 'MT' 'AD' 'AT'; do
  build one "$code" || exit 1
  built=$(git -C "${DIR:?}/one" status --porcelain -z --no-renames | tr '\0' '\n' | head -1)
  for cmd in "restore" "restore --staged --worktree"; do
    build two "$code" || exit 1
    f=$(target "$code")
    # shellcheck disable=SC2086
    out=$(git -C "${DIR:?}/two" $cmd -- "$f" 2>&1); rc=$?
    after=$(git -C "${DIR:?}/two" status --porcelain -z --no-renames | tr '\0' '\n' | head -1)
    [ -z "$after" ] && after='(clean)'
    printf '%-6s | %-8s | %-42s | exit %s  after: %s %s\n' \
      "[$code]" "$built" "git $cmd -- $f" "$rc" "$after" "$(echo "$out" | head -1 | cut -c1-40)"
  done
done
