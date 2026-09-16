#!/usr/bin/env bash
# Re-derive B1 and B2 against PR #856's Step 4 fence as published.
set -uo pipefail

RESOLVER='ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || ROOT=$PWD
CONTINUE_FILE=
for candidate in CONTINUE_HERE.md docs/CONTINUE_HERE.md .claude/CONTINUE_HERE.md; do
  if [ -f "$ROOT/$candidate" ]; then CONTINUE_FILE="$ROOT/$candidate"; break; fi
done'

STEP4_AS_SHIPPED='if git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; then
  echo "lifecycle: TRACKED"
elif git check-ignore -q "$CONTINUE_FILE" 2>/dev/null; then
  echo "lifecycle: IGNORED"
else
  echo "lifecycle: UNDECIDED — untracked and not ignored"
fi'

STEP4_FIXED='HOME_DIR=$(dirname -- "$CONTINUE_FILE")
if ! git -C "$HOME_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "lifecycle: NOT IN A REPOSITORY"
elif git -C "$HOME_DIR" ls-files --error-unmatch -- "$CONTINUE_FILE" >/dev/null 2>&1; then
  echo "lifecycle: TRACKED"
elif git -C "$HOME_DIR" check-ignore -q -- "$CONTINUE_FILE" 2>/dev/null; then
  echo "lifecycle: IGNORED"
else
  echo "lifecycle: UNDECIDED — untracked and not ignored"
fi'

newrepo() { local d="$1"; git init -q "$d"; git -C "$d" config user.email t@t; git -C "$d" config user.name t; }

echo "### B1 — does Step 2's resolver set CONTINUE_FILE for a FIRST handoff?"
D="$(mktemp -d)" || exit 1
cd "$D" || exit 1
newrepo "$D/proj" >/dev/null 2>&1
cd "$D/proj" || exit 1
# Step 2 says: no handoff at all -> write the draft at the root
printf 'draft\n' > CONTINUE_HERE.draft.md
eval "$RESOLVER"
printf '  before Step 3 installs: CONTINUE_FILE=[%s]  -> %s\n' "$CONTINUE_FILE" \
  "$([ -z "$CONTINUE_FILE" ] && echo 'EMPTY, so Step 4 guard aborts' || echo set)"
# Step 3: mv -n
mv -n CONTINUE_HERE.draft.md CONTINUE_HERE.md
eval "$RESOLVER"
printf '  after  Step 3 installs: CONTINUE_FILE=[%s]  -> %s\n' "${CONTINUE_FILE##*/}" \
  "$([ -z "$CONTINUE_FILE" ] && echo EMPTY || echo 'set, Step 4 works')"
cd /; rm -rf "$D"

echo
echo "### B2 — the else arm, thirteen-ish cases, shipped vs fixed"
printf '  %-46s %-12s %-12s %s\n' CASE 'ls-files' 'check-ignore' 'shipped -> fixed'
run_case() { # $1 label, $2 dir holding the handoff, $3 cwd
  local label="$1" f="$2" cwd="$3"
  ( cd "$cwd" 2>/dev/null || cd /; CONTINUE_FILE="$f"
    git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; local a=$?
    git check-ignore -q "$CONTINUE_FILE" 2>/dev/null; local b=$?
    local shipped fixed
    shipped=$(eval "$STEP4_AS_SHIPPED")
    fixed=$(eval "$STEP4_FIXED")
    printf '  %-46s %-12s %-12s %s -> %s\n' "$label" "$a" "$b" \
      "${shipped#lifecycle: }" "${fixed#lifecycle: }" )
}

D="$(mktemp -d)" || exit 1
newrepo "$D/A" >/dev/null 2>&1
printf 'x\n' > "$D/A/CONTINUE_HERE.md"
git -C "$D/A" add CONTINUE_HERE.md >/dev/null 2>&1
git -C "$D/A" commit -qm init >/dev/null 2>&1
run_case 'A tracked' "$D/A/CONTINUE_HERE.md" "$D/A"

newrepo "$D/B" >/dev/null 2>&1
printf 'CONTINUE_HERE*.md\n' > "$D/B/.gitignore"
printf 'x\n' > "$D/B/CONTINUE_HERE.md"
run_case 'B ignored by the repo rule' "$D/B/CONTINUE_HERE.md" "$D/B"

newrepo "$D/C" >/dev/null 2>&1
printf 'x\n' > "$D/C/CONTINUE_HERE.md"
run_case 'C untracked, not ignored' "$D/C/CONTINUE_HERE.md" "$D/C"

mkdir -p "$D/plain"; printf 'x\n' > "$D/plain/CONTINUE_HERE.md"
run_case 'D outside any repository' "$D/plain/CONTINUE_HERE.md" "$D/plain"

run_case 'L handoff in repo B, cwd is plain dir' "$D/B/CONTINUE_HERE.md" "$D/plain"

newrepo "$D/M" >/dev/null 2>&1
printf 'x\n' > "$D/M/CONTINUE_HERE.md"
mv "$D/M/.git" "$D/M/.git-broken"
run_case 'M no .git (corrupt/absent)' "$D/M/CONTINUE_HERE.md" "$D/M"

newrepo "$D/J" >/dev/null 2>&1
printf 'CONTINUE_HERE*.md\n' > "$D/J/.gitignore"
printf 'x\n' > "$D/J/CONTINUE_HERE.md"
git -C "$D/J" add -f CONTINUE_HERE.md >/dev/null 2>&1
git -C "$D/J" commit -qm init >/dev/null 2>&1
run_case 'J tracked AND matching an ignore rule' "$D/J/CONTINUE_HERE.md" "$D/J"

cd /; rm -rf "$D"
