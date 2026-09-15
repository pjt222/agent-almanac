#!/usr/bin/env bash
# #468 AC6 — "Verified against a project that uses docs/CONTINUE_HERE.md".
#
# End to end, with the hook EXTRACTED from the SKILL.md rather than retyped: a
# throwaway project keeps its handoff at docs/, the hook is registered as a real
# SessionStart hook, and a headless session is asked for a sentinel that appears
# only inside that handoff. The sentinel is random per run and never named in the
# prompt, so an answer that carries it was read, not reconstructed.
#
# Arms:
#   1  docs/ layout, hook from SKILL.md 2.0   -> expect the sentinel
#   2  same project, hook from SKILL.md 1.0   -> expect NONE (the bug, negative arm)
#   3  handoff at notes/, hook 2.0            -> expect the "exists elsewhere" report
set -uo pipefail
REPO=${REPO:-/mnt/d/dev/p/agent-almanac}
SKILL=$REPO/skills/read-continue-here/SKILL.md
WORK=$(mktemp -d) || exit 1
trap 'rm -rf "$WORK"' EXIT

awk "/^cat > ~\/.claude\/hooks\/continue-here\/read-continuation.sh << 'SCRIPT'$/{f=1;next} /^SCRIPT$/{f=0} f" \
  "$SKILL" > "$WORK/hook-2.0.sh"
chmod +x "$WORK/hook-2.0.sh"
[ "$(wc -l < "$WORK/hook-2.0.sh")" -gt 20 ] || { echo "EXTRACTION FAILED"; exit 2; }

# The 1.0 hook, recovered from git rather than retyped, so the negative arm is the
# real previous published text.
git -C "$REPO" show "origin/main:skills/read-continue-here/SKILL.md" \
  | awk "/^cat > ~\/.claude\/hooks\/continue-here\/read-continuation.sh << 'SCRIPT'$/{f=1;next} /^SCRIPT$/{f=0} f" \
  > "$WORK/hook-1.0.sh"
chmod +x "$WORK/hook-1.0.sh"
[ "$(wc -l < "$WORK/hook-1.0.sh")" -gt 20 ] || { echo "1.0 EXTRACTION FAILED"; exit 2; }
echo "hook 2.0: $(wc -l < "$WORK/hook-2.0.sh") lines   hook 1.0: $(wc -l < "$WORK/hook-1.0.sh") lines"
echo

PROMPT='Your context may contain a line that begins with SENTINEL= followed by a value. Reply with that value and nothing else. If there is no such line, reply with the single word NONE.'

arm() {
  label=$1; hook=$2; where=$3; expect=$4
  P=$(mktemp -d); token="zqx$(od -An -N6 -tx1 /dev/urandom | tr -d ' \n')"
  ( cd "$P" || exit 1
    git init -q .
    mkdir -p "$(dirname "$where")" 2>/dev/null
    printf '# Continue Here\n\n## Objective\nSENTINEL=%s\n' "$token" > "$where"
    cat > settings.json <<JSON
{"hooks":{"SessionStart":[{"matcher":"","hooks":[{"type":"command","command":"$hook","timeout":15}]}]}}
JSON
    answer=$(claude -p --settings "$P/settings.json" "$PROMPT" 2>&1)
    case "$expect" in
      sentinel) if printf '%s' "$answer" | grep -qF "$token"; then v="PASS (sentinel reached the model)"; else v="FAIL — answered: $answer"; fi ;;
      none)     if printf '%s' "$answer" | grep -qi 'NONE'; then v="PASS (nothing injected, as expected for 1.0)"; else v="FAIL — answered: $answer"; fi ;;
      report)   if printf '%s' "$answer" | grep -qF "$token"; then v="PASS (report was actionable — the model recovered the stray handoff)"; elif printf '%s' "$answer" | grep -qiE 'elsewhere|not where|resolve'; then v="PASS (hook reported the stray handoff; model did not open it)"; else v="FAIL — answered: $answer"; fi ;;
    esac
    printf '%-42s %s\n' "$label" "$v" )
  rm -rf "$P"
}

arm "docs/ layout, hook 2.0"            "$WORK/hook-2.0.sh" docs/CONTINUE_HERE.md  sentinel
arm "docs/ layout, hook 1.0 (negative)" "$WORK/hook-1.0.sh" docs/CONTINUE_HERE.md  none
arm "root layout, hook 1.0 (negative)"  "$WORK/hook-1.0.sh" CONTINUE_HERE.md       none
arm "notes/ layout, hook 2.0 (reports)" "$WORK/hook-2.0.sh" notes/CONTINUE_HERE.md report
# Control for the arm above: without the hook's report, does the model find the stray
# handoff on its own? If this also returned the sentinel, the report proved nothing.
arm "notes/ layout, hook 1.0 (control)" "$WORK/hook-1.0.sh" notes/CONTINUE_HERE.md none
