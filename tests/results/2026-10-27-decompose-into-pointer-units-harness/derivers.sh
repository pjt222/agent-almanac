#!/usr/bin/env bash
# derivers.sh: run the four deriver snippets of skills/decompose-into-pointer-units/references/EXAMPLES.md,
# extracted byte for byte, on small fixtures, under the shell named in $2 (bash or zsh).
# Usage (from the repository root):
#   bash tests/results/2026-10-27-decompose-into-pointer-units-harness/derivers.sh <EXAMPLES.md> <bash|zsh>
# Prints one line per check (PASS / FAIL) and exits 1 if any check fails, 2 if a snippet cannot be found.
set -u
examples=$1; shell=$2
work=$(mktemp -d) || exit 2
trap 'rm -rf "${work:?}"' EXIT

# The four bash fences under "## Derivers for the other spec kinds", each checked for an anchor line.
node -e '
  const t = require("fs").readFileSync(process.argv[1], "utf8");
  const start = t.indexOf("## Derivers for the other spec kinds"), end = t.indexOf("## Brief skeleton");
  if (start < 0 || end < 0) { console.error("derivers section not found"); process.exit(2); }
  const fences = [...t.slice(start, end).matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]);
  const want = [["rows.sh", "inventory.tsv"], ["items.sh", "$MECH/items"], ["gaps.sh", "approved-topics.txt"], ["owner.sh", "owner.json"]];
  if (fences.length !== want.length) { console.error("expected " + want.length + " deriver fences, found " + fences.length); process.exit(2); }
  want.forEach(([name, anchor], i) => {
    if (!fences[i].includes(anchor)) { console.error("fence " + (i + 1) + " (" + name + ") lacks its anchor " + anchor); process.exit(2); }
    require("fs").writeFileSync(process.argv[2] + "/" + name, fences[i]);
  });
' "$examples" "$work" || exit 2

failures=0
check() { if [ "$2" = "$3" ]; then echo "PASS  $shell $1"; else echo "FAIL  $shell $1: got [$2] want [$3]"; failures=$((failures + 1)); fi; }

RUN_DIR="$work/run"; MECH="$RUN_DIR/mechanical"; export RUN_DIR MECH
mkdir -p "$MECH/items" "$RUN_DIR/specs" "$RUN_DIR/gaps"

# Rows: a group name with a space and one with a slash; the count proof balances.
printf 'name\tgroup\na\tUI tools\nb\tUI tools\nc\tcore/net\n' > "$MECH/inventory.tsv"
out=$($shell "$work/rows.sh" 2>&1)
check 'rows count proof' "$out" 'rows=3 covered=3'
check 'rows ids are ledger-safe' "$(jq -r '[.[].id] | join(",")' "$RUN_DIR/specs/rows.json")" 'RW-UI_tools-1,RW-core_net-1'

# Items: a non-.md file is skipped, and the count proof shows it.
: > "$MECH/items/alpha.md"; : > "$MECH/items/beta two.md"; : > "$MECH/items/notes.txt"
out=$($shell "$work/items.sh" 2>&1)
check 'items count proof shows the skipped file' "$out" 'items=3 specs=2'
check 'item ids are ledger-safe' "$(jq -r '[.[].id] | join(",")' "$RUN_DIR/specs/files.json")" 'IT-alpha,IT-beta_two'

# Gaps by topic: topic A approved, one id of topic B approved singly, one gap of topic A marked as over held scope.
printf '%s\n' '[{"id":"G-R1-1","topic":"A","title":"t1","question":"q1","priority":1},{"id":"G-R1-2","topic":"A","title":"t2","question":"q2","priority":1},{"id":"G-R1-3","topic":"B","title":"t3","question":"q3","priority":2},{"id":"G-R1-4","topic":"B","title":"t4","question":"q4","priority":2}]' > "$RUN_DIR/gaps/R1.json"
printf 'A\n' > "$RUN_DIR/approved-topics.txt"
printf 'G-R1-4\n' > "$RUN_DIR/approved-gaps.txt"
printf 'G-R1-2\n' > "$RUN_DIR/gaps-over-held.txt"
$shell "$work/gaps.sh" > "$work/gaps.out" 2>&1
check 'approved topic plus single id, marked gap excluded' "$(jq -r '[.[].id] | join(",")' "$RUN_DIR/specs/gaps.json")" 'G-R1-1,G-R1-4'
check 'derived gap specs carry pointers only' "$(jq -c '[.[] | keys] | unique' "$RUN_DIR/specs/gaps.json")" '[["from","g","id","kind"]]'
printf 'G-R1-4\nG-R1-2\n' > "$RUN_DIR/approved-gaps.txt"
$shell "$work/gaps.sh" > "$work/gaps.out" 2>&1
check 'a marked gap is never derived, even when approved singly' "$(jq -r '[.[].id] | join(",")' "$RUN_DIR/specs/gaps.json")" 'G-R1-1,G-R1-4'
: > "$RUN_DIR/approved-topics.txt"; : > "$RUN_DIR/approved-gaps.txt"
$shell "$work/gaps.sh" > "$work/gaps.out" 2>&1
check 'nothing approved derives nothing' "$(jq -c '.' "$RUN_DIR/specs/gaps.json")" '[]'

# Owner specs: a scope quoted verbatim under its unit passes; any other scope is refused.
printf '%s\n' '- STOP-1, unit CL-B: "only line 6, read-only" (owner message, 2026-10-27)' > "$RUN_DIR/OWNER-QUESTIONS.md"
printf '%s\n' '[{"kind":"owner","id":"OW-1","unit":"CL-B","scope":"only line 6, read-only","answer":"B1"},{"kind":"owner","id":"OW-2","unit":"CL-B","scope":"all of it","answer":"B1"},{"kind":"owner","id":"OW-3","unit":"CL-C","scope":"only line 6, read-only","answer":"B1"}]' > "$RUN_DIR/specs/owner.json"
out=$($shell "$work/owner.sh" 2>&1 | tr '\n' ' ')
check 'owner check refuses a scope not quoted under its unit' "$out" 'REFUSED OW-2 REFUSED OW-3 '

echo
[ "$failures" -eq 0 ] && echo "ALL PASS ($shell)" || echo "$failures FAIL ($shell)"
[ "$failures" -eq 0 ]
