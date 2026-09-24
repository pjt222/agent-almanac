#!/usr/bin/env bash
# M3 and M4 need needles that shell quoting makes painful, so they are built here
# as literals instead of typed into a command line.
set -uo pipefail
cd /mnt/d/dev/p/agent-almanac || exit 1

TEST='node --test scripts/test/continue-here-blocks.test.js'

# --- M3: remove ONLY Step 5's unset-path guard -------------------------------
# The same guard line appears three times (Steps 2 and 5), so the needle carries
# the following line, which is unique to the cleanup block.
GUARD=': "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"'
NEXT='if git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; then'
OLD="${GUARD}
${NEXT}"
NEW="${NEXT}"

echo '##### M3: delete Step 5 unset-path guard only (N7) #####'
node scripts/mutation-check.js --file skills/read-continue-here/SKILL.md \
  --replace "${OLD}::${NEW}" --test "$TEST" 2>&1 | tail -6

echo
echo '##### M4: shrink the carrier list to one entry (N8) #####'
node scripts/mutation-check.js --file scripts/test/continue-here-blocks.test.js \
  --replace 'const RESOLVER_CARRIERS = [READ, WRITE];::const RESOLVER_CARRIERS = [READ];' \
  --test "$TEST" 2>&1 | tail -6
