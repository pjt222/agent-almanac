#!/usr/bin/env bash
# Extract the SessionStart hook from skills/read-continue-here/SKILL.md and run it
# as printed. Nothing here retypes the script: the bytes under test are the bytes
# the skill publishes.
set -uo pipefail
REPO=${REPO:-$(git -C "$(dirname "$0")" rev-parse --show-toplevel)}
SKILL=$REPO/skills/read-continue-here/SKILL.md
WORK=$(mktemp -d) || exit 1
HOOK=$WORK/read-continuation.sh

awk "/^cat > ~\/.claude\/hooks\/continue-here\/read-continuation.sh << 'SCRIPT'$/{f=1;next} /^SCRIPT$/{f=0} f" "$SKILL" > "$HOOK"
chmod +x "$HOOK"
lines=$(wc -l < "$HOOK")
echo "extracted $lines lines"
[ "$lines" -gt 20 ] || { echo "EXTRACTION FAILED — refusing to report on an empty script"; exit 2; }
bash -n "$HOOK" || { echo "EXTRACTED SCRIPT DOES NOT PARSE"; exit 2; }
echo "bash -n: parses"
echo

# Validator: reads the hook's stdout, answers what Claude Code would see.
cat > "$WORK/validate.py" <<'PY'
import json, sys
raw = sys.stdin.read()
if raw.strip() == "":
    print("EMPTY (hook stayed silent)"); sys.exit(0)
try:
    obj = json.loads(raw)
except Exception as exc:
    print(f"NOT JSON: {exc}"); sys.exit(1)
hso = obj.get("hookSpecificOutput")
if not isinstance(hso, dict):
    print("NO hookSpecificOutput"); sys.exit(1)
ctx = hso.get("additionalContext")
if not isinstance(ctx, str):
    print(f"NO additionalContext directly under hookSpecificOutput; keys={sorted(hso)}"); sys.exit(1)
print(f"OK event={hso.get('hookEventName')!r} chars={len(ctx)} first={ctx.splitlines()[0][:60]!r}")
PY

arm() {
  name=$1; shift
  D=$(mktemp -d)
  ( cd "$D" || exit 1
    git init -q . 2>/dev/null
    "$@"
    out=$(cd "${SUBDIR:-.}" && bash "$HOOK" 2>"$D/err")
    verdict=$(printf '%s' "$out" | python3 "$WORK/validate.py")
    printf '%-24s %s\n' "$name" "$verdict"
    [ -s "$D/err" ] && printf '%-24s stderr: %s\n' "" "$(head -2 "$D/err")"
  )
  rm -rf "$D"
}

mk_none()   { :; }
mk_root()   { printf '# Continue Here\nroot edition\n' > CONTINUE_HERE.md; }
mk_docs()   { mkdir -p docs && printf '# Continue Here\ndocs edition\n' > docs/CONTINUE_HERE.md; }
mk_claude() { mkdir -p .claude && printf '# Continue Here\ndotclaude edition\n' > .claude/CONTINUE_HERE.md; }
mk_odd()    { mkdir -p notes && printf '# Continue Here\nstray edition\n' > notes/CONTINUE_HERE.md; }
mk_nasty()  { printf '# Continue Here\nquote " backslash \\ tab\there\nCRLF next\r\n' > CONTINUE_HERE.md; }
mk_sub()    { mkdir -p docs deep/er && printf '# Continue Here\ndocs edition\n' > docs/CONTINUE_HERE.md; }

arm "no handoff"          mk_none
arm "root"                mk_root
arm "docs/"               mk_docs
arm ".claude/"            mk_claude
arm "elsewhere notes/"    mk_odd
arm "quotes/backslash/CR" mk_nasty
SUBDIR=deep/er arm "cwd=deep/er"  mk_sub
unset SUBDIR

echo
echo "--- awk fallback (jq hidden from PATH) ---"
D=$(mktemp -d)
( cd "$D" || exit 1
  git init -q .
  printf '# Continue Here\nquote " and backslash \\ and tab\there\n' > CONTINUE_HERE.md
  mkdir -p "$D/binshim"
  for tool in bash sed awk find git head printf; do
    p=$(command -v "$tool") && ln -sf "$p" "$D/binshim/$tool"
  done
  out=$(PATH="$D/binshim" bash "$HOOK" 2>&1)
  printf '%-24s %s\n' "no-jq" "$(printf '%s' "$out" | python3 "$WORK/validate.py")" )
rm -rf "$D"

echo
echo "--- NEGATIVE ARM: the 1.x shape, same validator ---"
printf '%s' '{"hookSpecificOutput":{"sessionStartContext":{"additionalContext":"x"}}}' \
  | python3 "$WORK/validate.py"
echo "(a non-zero verdict above is the point: the validator can tell the shapes apart)"

rm -rf "$WORK"
