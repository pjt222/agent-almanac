#!/usr/bin/env bash
# Measure F6 and F2 against the snippet exactly as PR #843 prints it.
set -uo pipefail

AS_PRINTED_HEAD='ID=<skill-name>'

CORPUS='find skills i18n -type f -name SKILL.md | while IFS= read -r f; do
  n=$(wc -l < "$f")
  case "$n" in ""|*[!0-9]*) echo "UNREADABLE: $f ($n)"; continue ;; esac
  [ "$n" -gt 500 ] && echo "OVER: $f ($n lines)"
done
echo "cap scan complete — no OVER line above means nothing is over"'

echo '### F6: the per-skill snippet, first line, as printed'
for sh in bash zsh; do
  command -v "$sh" >/dev/null 2>&1 || continue
  out=$(printf '%s\n' "$AS_PRINTED_HEAD" | "$sh" 2>&1); rc=$?
  printf '  %-5s exit=%s  %s\n' "$sh" "$rc" "$(printf '%s' "$out" | head -1)"
done
echo '  --- with the one-character fix, ID="<skill-name>" ---'
for sh in bash zsh; do
  command -v "$sh" >/dev/null 2>&1 || continue
  out=$(printf '%s\n' 'ID="<skill-name>"' | "$sh" 2>&1); rc=$?
  printf '  %-5s exit=%s  %s\n' "$sh" "$rc" "${out:-(no output, assignment succeeded)}"
done

echo
echo '### F2: the corpus half, run where its trees are absent or partial'
run_corpus() { # $1 = label, cwd already set
  local out rc
  out=$(bash -c "$CORPUS" 2>&1); rc=$?
  echo "  --- $1"
  printf '%s\n' "$out" | sed 's/^/      /'
  echo "      exit=$rc"
}

D="$(mktemp -d)" || exit 1
cd "$D" || exit 1
run_corpus 'A: neither skills/ nor i18n/ present (wrong cwd)'

mkdir -p skills/demo
seq 1 501 > skills/demo/SKILL.md
run_corpus 'B: skills/ present with an OVER file, i18n/ missing — the tree that binds is skipped'

cd /; rm -rf "$D"
