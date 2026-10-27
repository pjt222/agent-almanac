#!/usr/bin/env bash
# derivers.sh: run the shell snippets of skills/decompose-into-pointer-units/references/EXAMPLES.md that
# derive, record or check a work list, extracted byte for byte, on small fixtures, under the shell named
# in $2 (bash or zsh): the rows and item derivers, the gap deriver, the owner-spec check, the held-list
# derivation and the gaps-file record.
# Usage (from the repository root):
#   bash tests/results/2026-10-27-decompose-into-pointer-units-harness/derivers.sh <EXAMPLES.md> <bash|zsh>
# Prints one line per check (PASS / FAIL) and exits 1 if any check fails, 2 if a snippet cannot be found.
# A refusal row asserts the exit code AND that nothing was written, so a snippet that prints REFUSED and
# writes anyway fails.
set -u
examples=$1; shell=$2
work=$(mktemp -d) || exit 2
trap 'rm -rf "${work:?}"' EXIT

# Each snippet is the one bash fence in EXAMPLES.md that contains its anchor; an anchor in no fence or in
# two fences is refused, so a moved or duplicated fence cannot be run in the wrong place.
node -e '
  const t = require("fs").readFileSync(process.argv[1], "utf8");
  const fences = [...t.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]);
  const want = [["rows.sh", "inventory.tsv"], ["items.sh", "$MECH/items"], ["gaps.sh", "approved-topics.txt"],
    ["owner.sh", "OWNER_SPECS="], ["held.sh", "RELEASED unit="], ["record.sh", "is not a gaps_for_owner list"]];
  for (const [name, anchor] of want) {
    const hits = fences.filter((f) => f.includes(anchor));
    if (hits.length !== 1) { console.error(name + ": anchor " + anchor + " is in " + hits.length + " fences, want 1"); process.exit(2); }
    require("fs").writeFileSync(process.argv[2] + "/" + name, hits[0]);
  }
' "$examples" "$work" || exit 2

failures=0
check() { if [ "$2" = "$3" ]; then echo "PASS  $shell $1"; else echo "FAIL  $shell $1: got [$2] want [$3]"; failures=$((failures + 1)); fi; }
# run <snippet>: its output on one line, then " rc=<exit code>"
run() { out=$($shell "$work/$1" 2>&1); rc=$?; printf '%s rc=%s' "$(printf '%s' "$out" | tr '\n' ' ')" "$rc"; }
recorded() { awk -v f="$1" '$2 == f {found = 1} END {exit !found}' "$RUN_DIR/WORK-SHA256SUMS" && echo yes || echo no; }

RUN_DIR="$work/run"; MECH="$RUN_DIR/mechanical"; export RUN_DIR MECH

# --- rows and items (Step 2 kinds) ---
mkdir -p "$MECH/items" "$RUN_DIR/specs"
printf 'name\tgroup\na\tUI tools\nb\tUI tools\nc\tcore/net\n' > "$MECH/inventory.tsv"
out=$($shell "$work/rows.sh" 2>&1)
check 'rows count proof' "$out" 'rows=3 covered=3'
check 'rows ids are ledger-safe' "$(jq -r '[.[].id] | join(",")' "$RUN_DIR/specs/rows.json")" 'RW-UI_tools-1,RW-core_net-1'
: > "$MECH/items/alpha.md"; : > "$MECH/items/beta two.md"; : > "$MECH/items/notes.txt"
out=$($shell "$work/items.sh" 2>&1)
check 'items count proof shows the skipped file' "$out" 'items=3 specs=2'
check 'item ids are ledger-safe' "$(jq -r '[.[].id] | join(",")' "$RUN_DIR/specs/files.json")" 'IT-alpha,IT-beta_two'

# --- a fresh run directory whose work list was recorded at Step 2 ---
fresh() {
  rm -rf "${RUN_DIR:?}"; mkdir -p "$RUN_DIR/specs" "$RUN_DIR/gaps" "$RUN_DIR/owner"
  printf '%s\n' '[{"kind":"cl","id":"CL-A","release":"1.0","lines":[4,5]},{"kind":"cl","id":"CL-B","release":"1.0","lines":[6,7]}]' > "$RUN_DIR/specs/cl.json"
  (cd "$RUN_DIR" && find specs gaps -name '*.json' -print0 | sort -z | xargs -0 -r sha256sum > WORK-SHA256SUMS)
  : > "$RUN_DIR/UNIT-LOG.txt"
}
# Five gaps: G-R1-2 is marked by the batch, G-R1-5 is flagged covers_held by its critic.
GAPLIST='[{"id":"G-R1-1","topic":"A","title":"t1","question":"q1","priority":1,"covers_held":false},
 {"id":"G-R1-2","topic":"A","title":"t2","question":"q2","priority":1,"covers_held":false},
 {"id":"G-R1-3","topic":"B","title":"t3","question":"q3","priority":2,"covers_held":false},
 {"id":"G-R1-4","topic":"B","title":"t4","question":"q4","priority":2,"covers_held":false},
 {"id":"G-R1-5","topic":"A","title":"t5","question":"q5","priority":1,"covers_held":true}]'
gapfixture() {   # topics, single ids, marked ids
  fresh; printf '%s\n' "$GAPLIST" > "$RUN_DIR/gaps/R1.json"
  run record.sh > /dev/null
  printf '%s' "$1" > "$RUN_DIR/owner/R1-approved-topics.txt"
  printf '%s' "$2" > "$RUN_DIR/owner/R1-approved-gaps.txt"
  printf '%s' "$3" > "$RUN_DIR/owner/R1-marked-gaps.txt"
}
derived() { [ -e "$RUN_DIR/specs/gaps-R1.json" ] && jq -r 'if length == 0 then "empty" else [.[].id] | join(",") end' "$RUN_DIR/specs/gaps-R1.json" || echo none; }

# --- recording a gaps file ---
fresh; printf '%s\n' "$GAPLIST" > "$RUN_DIR/gaps/R1.json"
check 'record: a gaps_for_owner list is recorded' "$(run record.sh) recorded=$(recorded gaps/R1.json)" ' rc=0 recorded=yes'
check 'record: a second record of the same file is refused' "$(run record.sh)" 'REFUSED: gaps/R1.json was already recorded rc=2'
printf '%s\n' '[{"id":"G-R2-1","topic":"A","title":"t","question":"q","priority":1}]' > "$RUN_DIR/gaps/R2.json"
sed 's/TAG=R1 /TAG=R2 /' "$work/record.sh" > "$work/record-r2.sh"
check 'record: a list without covers_held is refused and not recorded' "$(run record-r2.sh) recorded=$(recorded gaps/R2.json)" 'REFUSED: gaps/R2.json is not a gaps_for_owner list rc=1 recorded=no'

# --- the gap deriver ---
gapfixture $'A\n' $'G-R1-4\n' $'G-R1-2\n'
out=$(run gaps.sh)
check 'gaps: approved topic plus single id; the marked gap and the flagged gap are not derived through the topic' "$(derived)" 'G-R1-1,G-R1-4'
check 'gaps: the count line' "$out" 'gaps=5 derived=2 flagged_in_approved_topics=1 rc=0'
check 'gaps: derived specs carry pointers only, from the recorded file' "$(jq -c '([.[] | keys] | unique), ([.[].from] | unique)' "$RUN_DIR/specs/gaps-R1.json" | tr '\n' ' ')" '[["from","g","id","kind"]] ["gaps/R1.json"] '
check 'gaps: the output is recorded in the work list' "$(recorded specs/gaps-R1.json) $(cd "$RUN_DIR" && sha256sum -c --quiet WORK-SHA256SUMS && echo sums-ok)" 'yes sums-ok'
before=$(sha256sum "$RUN_DIR/specs/gaps-R1.json")
check 'gaps: a second derivation into the same name is refused' "$(run gaps.sh) unchanged=$([ "$before" = "$(sha256sum "$RUN_DIR/specs/gaps-R1.json")" ] && echo yes)" 'REFUSED: specs/gaps-R1.json exists; derive a later approval into a new name rc=2 unchanged=yes'
gapfixture $'A\n' $'G-R1-4\nG-R1-2\n' $'G-R1-2\n'
check 'gaps: an approved marked id is refused, nothing written' "$(run gaps.sh) $(derived) $(recorded specs/gaps-R1.json)" 'REFUSED: marked id G-R1-2 rc=1 none no'
gapfixture $'' $'G-R1-9\n' $''
check 'gaps: an unknown approved id is refused, nothing written' "$(run gaps.sh) $(derived)" 'REFUSED: unknown id G-R1-9 rc=1 none'
gapfixture $'' $'G-R1-4 \n' $''
check 'gaps: an id with a trailing space is refused, not dropped' "$(run gaps.sh) $(derived)" 'REFUSED: unknown id G-R1-4  rc=1 none'
gapfixture $'Z\n' $'' $''
check 'gaps: an unknown topic is refused, nothing written' "$(run gaps.sh) $(derived)" 'REFUSED: unknown topic Z rc=1 none'
gapfixture $'A\n' $'G-R1-5\n' $'G-R1-2\n'
run gaps.sh > /dev/null
check 'gaps: a flagged gap the batch did not mark is derived when approved by its id' "$(derived)" 'G-R1-1,G-R1-5'
gapfixture $'' $'' $''
check 'gaps: nothing approved derives nothing' "$(run gaps.sh) $(derived)" 'gaps=5 derived=0 flagged_in_approved_topics=0 rc=0 empty'
gapfixture $'A\n' $'' $''
rm "$RUN_DIR/owner/R1-marked-gaps.txt"
check 'gaps: a missing marks file is refused' "$(run gaps.sh) $(derived)" 'REFUSED: no owner/R1-marked-gaps.txt rc=2 none'
gapfixture $'A\n' $'' $''
jq '.[0].question = "a different question"' "$RUN_DIR/gaps/R1.json" > "$work/changed.json" && mv "$work/changed.json" "$RUN_DIR/gaps/R1.json"
check 'gaps: a gaps file changed after it was recorded is refused' "$(run gaps.sh | sed 's/.*REFUSED/REFUSED/') $(derived)" 'REFUSED: gaps/R1.json was never recorded, or the work list changed after it was rc=1 none'

# --- the owner-spec check ---
ownerfixture() {   # the owner specs file content
  fresh
  cat > "$RUN_DIR/OWNER-QUESTIONS.md" <<'EOF'
# run owner batch (2026-10-27)

## Answered

- STOP-1, unit CL-B: "only line 6, read-only" (owner message, 2026-10-27)
- STOP-2, unit CL-A: "line 4 only" no citation

## Open

- **B3. Gaps.** G-R1-2 covers unit CL-C: "lines 8 and 9 another way" (critic wording)
- STOP-5, unit CL-C: "lines 8 and 9 another way" (a lead note in the Answered form, 2026-10-27)

### Answered

- STOP-3, unit CL-D: "a nested heading is not the section" (owner message, 2026-10-27)

## Appendix

- STOP-4, unit CL-E: "after the section" (owner message, 2026-10-27)
EOF
  printf '%s\n' "$1" > "$RUN_DIR/specs/owner-1.json"
}
OWNER_OK='{"kind":"owner","id":"OW-1","unit":"CL-B","scope":"only line 6, read-only","answer":"STOP-1"}'
ownerfixture "[$OWNER_OK]"
check 'owner: a scope quoted on its Answered line passes and is recorded' "$(run owner.sh) $(recorded specs/owner-1.json)" 'owner specs checked: 1 rc=0 yes'
for arm in \
  'quoted only in Open|{"kind":"owner","id":"OW-2","unit":"CL-C","scope":"lines 8 and 9 another way","answer":"STOP-5"}' \
  'under a nested heading|{"kind":"owner","id":"OW-3","unit":"CL-D","scope":"a nested heading is not the section","answer":"STOP-3"}' \
  'under a later heading|{"kind":"owner","id":"OW-4","unit":"CL-E","scope":"after the section","answer":"STOP-4"}' \
  'with the wrong STOP number|{"kind":"owner","id":"OW-5","unit":"CL-B","scope":"only line 6, read-only","answer":"STOP-2"}' \
  'on a line with no citation|{"kind":"owner","id":"OW-6","unit":"CL-A","scope":"line 4 only","answer":"STOP-2"}' \
  'under the wrong unit|{"kind":"owner","id":"OW-7","unit":"CL-A","scope":"only line 6, read-only","answer":"STOP-1"}'; do
  name=${arm%%|*}; spec=${arm#*|}; id=$(printf '%s' "$spec" | jq -r .id)
  ownerfixture "[$OWNER_OK,$spec]"
  check "owner: a scope $name is refused with exit 1, nothing recorded" "$(run owner.sh) $(recorded specs/owner-1.json)" "owner specs checked: 2 REFUSED $id rc=1 no"
done
ownerfixture '[]'
check 'owner: an empty list checks nothing and says so' "$(run owner.sh)" 'owner specs checked: 0 rc=0'
ownerfixture "[$OWNER_OK,{\"kind\":\"cl\",\"id\":\"CL-X\",\"release\":\"1.0\",\"lines\":[8]}]"
check 'owner: a non-owner spec in the file is refused' "$(run owner.sh | sed 's/jq: error[^R]*REFUSED/REFUSED/') $(recorded specs/owner-1.json)" 'REFUSED: specs/owner-1.json rc=2 no'
ownerfixture "[$OWNER_OK]"; rm "$RUN_DIR/specs/owner-1.json"
check 'owner: a missing file is refused' "$(run owner.sh)" 'REFUSED: no specs/owner-1.json rc=2'
ownerfixture "[$OWNER_OK]"; run owner.sh > /dev/null
check 'owner: a file already recorded is refused' "$(run owner.sh)" 'REFUSED: specs/owner-1.json was already recorded rc=2'

# --- the held list ---
fresh
printf '%s\n' '[{"kind":"cl","id":"CL-A"},{"kind":"cl","id":"CL-B"},{"kind":"cl","id":"CL-C"},{"kind":"cl","id":"CL-D"},{"kind":"cl","id":"CL-E"},{"kind":"cl","id":"CL-F"}]' > "$RUN_DIR/specs/rows.json"
cat > "$RUN_DIR/UNIT-LOG.txt" <<'EOF'
2026-10-27 STOP-1 unit=CL-B stage=report-write written=partial routed=owner-batch
2026-10-27 NORESULT unit=CL-D cause=undetermined
2026-10-27 NORESULT unit=CL-E cause=undetermined
2026-10-27 RELEASED unit=CL-E by=owner
2026-10-27 HELD unit=CL-F reason=overlaps-STOP-1
2026-10-27 STOP-2 unit=V-CL-A-1 stage=verify written=nothing routed=owner-batch
2026-10-27 NORESULT unit=X-accuracy-R1-1 cause=undetermined
2026-10-27 RELEASED unit=CL-B by=owner
EOF
out=$($shell "$work/held.sh" 2>&1)
check 'held: stopped ids and unreleased no-result and held ids; a release does not lift a stop; labels left out' "$(printf '%s\n' "$out" | sed -n 1p)" 'held=["CL-B","CL-D","CL-F"]'
check 'held: the cluster list leaves the held ids out' "$(printf '%s\n' "$out" | sed -n 2p | jq -r '[.[].id] | join(",")')" 'CL-A,CL-C,CL-E'
rm "$RUN_DIR/UNIT-LOG.txt"
check 'held: a missing unit log is refused' "$(run held.sh)" 'REFUSED: no UNIT-LOG.txt (Step 1 creates it) rc=2'

echo
[ "$failures" -eq 0 ] && echo "ALL PASS ($shell)" || echo "$failures FAIL ($shell)"
[ "$failures" -eq 0 ]
