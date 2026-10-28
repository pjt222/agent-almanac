#!/usr/bin/env bash
# derivers.sh: run the shell snippets of skills/decompose-into-pointer-units/references/EXAMPLES.md that
# derive, record or check a work list, extracted byte for byte, on small fixtures, under the shell named
# in $2 (bash or zsh): the rows and item derivers, the gap deriver, the owner-spec check, the launch snippet
# (held list and launch list) and the gaps-file record.
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
    ["owner.sh", "OWNER_SPECS="], ["held.sh", "CLUSTER="], ["record.sh", "is not a gaps_for_owner list"],
    ["added.sh", "ADDED="]];
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
ALLCLEAR=$'G-R1-1\tCLEAR\nG-R1-2\tCLEAR\nG-R1-3\tCLEAR\nG-R1-4\tCLEAR\nG-R1-5\tCLEAR\n'
gapfixture() {   # topics, single ids, marked ids, and the second read (default: every gap CLEAR)
  fresh; printf '%s\n' "$GAPLIST" > "$RUN_DIR/gaps/R1.json"
  run record.sh > /dev/null
  printf '%s' "$1" > "$RUN_DIR/owner/R1-approved-topics.txt"
  printf '%s' "$2" > "$RUN_DIR/owner/R1-approved-gaps.txt"
  printf '%s' "$3" > "$RUN_DIR/owner/R1-marked-gaps.txt"
  printf '%s' "${4-$ALLCLEAR}" > "$RUN_DIR/owner/R1-second-read.tsv"
}
derived() { [ -e "$RUN_DIR/specs/gaps-R1.json" ] && jq -r 'if length == 0 then "empty" else [.[].id] | join(",") end' "$RUN_DIR/specs/gaps-R1.json" || echo none; }

# --- recording a gaps file ---
fresh; printf '%s\n' "$GAPLIST" > "$RUN_DIR/gaps/R1.json"
check 'record: a gaps_for_owner list is recorded' "$(run record.sh) recorded=$(recorded gaps/R1.json)" ' rc=0 recorded=yes'
check 'record: a second record of the same file is refused, nothing written' "$(run record.sh) lines=$(awk '$2 == "gaps/R1.json"' "$RUN_DIR/WORK-SHA256SUMS" | wc -l | tr -d ' ')" 'REFUSED: gaps/R1.json was already recorded rc=2 lines=1'
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
# The independent second read: every gap named exactly once, and only a CLEAR gap can come through its topic.
gapfixture $'A\n' $'G-R1-4\n' $'G-R1-2\n' $'G-R1-1\tBORDERLINE\nG-R1-2\tCLEAR\nG-R1-3\tCLEAR\nG-R1-4\tCLEAR\nG-R1-5\tCLEAR\n'
check 'gaps: a gap the second read does not call CLEAR is not derived through its topic' "$(run gaps.sh > /dev/null; derived)" 'G-R1-4'
gapfixture $'' $'G-R1-1\n' $'' $'G-R1-1\tCOVERS\nG-R1-2\tCLEAR\nG-R1-3\tCLEAR\nG-R1-4\tCLEAR\nG-R1-5\tCLEAR\n'
check 'gaps: a gap the second read calls COVERS is derived only by its own id' "$(run gaps.sh > /dev/null; derived)" 'G-R1-1'
gapfixture $'A\n' $'' $'' $'G-R1-1\tCLEAR\nG-R1-2\tCLEAR\nG-R1-4\tCLEAR\nG-R1-5\tCLEAR\n'
check 'gaps: a second read that misses a gap is refused, nothing written' "$(run gaps.sh) $(derived)" 'REFUSED: the second read names G-R1-3 0 times rc=1 none'
gapfixture $'A\n' $'' $'' $'G-R1-1\tCLEAR\nG-R1-2\tCLEAR\nG-R1-3\tCLEAR\nG-R1-3\tCOVERS\nG-R1-4\tCLEAR\nG-R1-5\tCLEAR\n'
check 'gaps: a second read that names a gap twice is refused' "$(run gaps.sh) $(derived)" 'REFUSED: the second read names G-R1-3 2 times rc=1 none'
gapfixture $'A\n' $'' $'' "$ALLCLEAR"$'G-R1-9\tCLEAR\n'
check 'gaps: an unknown id in the second read is refused' "$(run gaps.sh) $(derived)" 'REFUSED: unknown second-read id G-R1-9 rc=1 none'
gapfixture $'A\n' $'' $'' $'G-R1-1\tMAYBE\nG-R1-2\tCLEAR\nG-R1-3\tCLEAR\nG-R1-4\tCLEAR\nG-R1-5\tCLEAR\n'
check 'gaps: a verdict other than COVERS, BORDERLINE or CLEAR is refused' "$(run gaps.sh) $(derived)" $'REFUSED: bad second-read line G-R1-1\tMAYBE rc=1 none'
gapfixture $'A\n' $'' $''; rm "$RUN_DIR/owner/R1-second-read.tsv"
check 'gaps: a missing second read is refused' "$(run gaps.sh) $(derived)" 'REFUSED: no owner/R1-second-read.tsv rc=2 none'
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
- STOP-6, unit CL-F: "line 9 only" (owner message, 2026-10-27)

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
  'under the wrong unit|{"kind":"owner","id":"OW-7","unit":"CL-A","scope":"line 9 only","answer":"STOP-6"}'; do
  name=${arm%%|*}; spec=${arm#*|}; id=$(printf '%s' "$spec" | jq -r .id)
  ownerfixture "[$OWNER_OK,$spec]"
  check "owner: a scope $name is refused with exit 1, nothing recorded" "$(run owner.sh) $(recorded specs/owner-1.json)" "owner specs checked: 2 REFUSED $id rc=1 no"
done
ownerfixture '[]'
check 'owner: an empty list checks nothing and says so' "$(run owner.sh)" 'owner specs checked: 0 rc=0'
ownerfixture "[$OWNER_OK,{\"kind\":\"cl\",\"id\":\"CL-X\",\"release\":\"1.0\",\"lines\":[8]}]"
check 'owner: a non-owner spec in the file is refused' "$(run owner.sh | sed 's/jq: error[^R]*REFUSED/REFUSED/') $(recorded specs/owner-1.json)" 'REFUSED: specs/owner-1.json rc=2 no'
ownerfixture "[$OWNER_OK]"; rm "$RUN_DIR/specs/owner-1.json"
check 'owner: a missing file is refused' "$(run owner.sh) $(recorded specs/owner-1.json)" 'REFUSED: no specs/owner-1.json rc=2 no'
ownerfixture "[$OWNER_OK]"; run owner.sh > /dev/null
check 'owner: a file already recorded is refused, nothing written' "$(run owner.sh) lines=$(awk '$2 == "specs/owner-1.json"' "$RUN_DIR/WORK-SHA256SUMS" | wc -l | tr -d ' ')" 'REFUSED: specs/owner-1.json was already recorded rc=2 lines=1'
# An owner spec's id is OW-<n>, and no id is in two spec entries (R4-2).
ownerfixture '[{"kind":"owner","id":"OW 1","unit":"CL-B","scope":"only line 6, read-only","answer":"STOP-1"}]'
check 'owner: an id that is not OW-<n> is refused, nothing recorded' "$(run owner.sh) $(recorded specs/owner-1.json)" 'REFUSED: an owner spec id is OW-<n> rc=2 no'
ownerfixture "[$OWNER_OK]"; run owner.sh > /dev/null
printf '%s\n' '[{"kind":"owner","id":"OW-1","unit":"CL-F","scope":"line 9 only","answer":"STOP-6"}]' > "$RUN_DIR/specs/owner-2.json"
sed 's|^OWNER_SPECS="specs/owner-1.json"|OWNER_SPECS="specs/owner-2.json"|' "$work/owner.sh" > "$work/owner-2.sh"
check 'owner: an id already in the work list is refused, nothing recorded' "$(run owner-2.sh) $(recorded specs/owner-2.json)" 'REFUSED: an id is in two spec entries: OW-1 rc=2 no'
# A STOP-<n> authorises one owner spec, in a later file of any name or in the same file (AD4-3).
ownerfixture "[$OWNER_OK]"; mv "$RUN_DIR/specs/owner-1.json" "$RUN_DIR/specs/owner.json"
sed 's|^OWNER_SPECS="specs/owner-1.json"|OWNER_SPECS="specs/owner.json"|' "$work/owner.sh" > "$work/owner-plain.sh"
first=$(run owner-plain.sh)
printf '%s\n' '[{"kind":"owner","id":"OW-2","unit":"CL-B","scope":"only line 6, read-only","answer":"STOP-1"}]' > "$RUN_DIR/specs/owner-1.json"
check 'owner: a STOP-<n> already used by a recorded owner spec is refused, nothing recorded' "$first|$(run owner.sh) $(recorded specs/owner-1.json)" 'owner specs checked: 1 rc=0|owner specs checked: 1 REFUSED: a STOP-<n> authorises one owner spec; already used: STOP-1 rc=1 no'
ownerfixture "[$OWNER_OK,{\"kind\":\"owner\",\"id\":\"OW-2\",\"unit\":\"CL-B\",\"scope\":\"only line 6, read-only\",\"answer\":\"STOP-1\"}]"
check 'owner: two owner specs citing one STOP-<n> in one file are refused' "$(run owner.sh) $(recorded specs/owner-1.json)" 'owner specs checked: 2 REFUSED: a STOP-<n> authorises one owner spec; already used: STOP-1 rc=1 no'

# --- specs for items a deriver skipped, added after launch in the same run directory ---
# fresh() has CL-A on lines 4-5 and CL-B on lines 6-7 of the one source; rows-x.json covers rows 2-3 of inv.tsv.
addfixture() {   # the added specs file content
  fresh
  printf '%s\n' '[{"kind":"rows","id":"RW-X1","file":"inv.tsv","group":"g","rows":[2,3]}]' > "$RUN_DIR/specs/rows-x.json"
  (cd "$RUN_DIR" && sha256sum specs/rows-x.json >> WORK-SHA256SUMS)
  printf '%s\n' "$1" > "$RUN_DIR/specs/added-1.json"
}
addfixture '[{"kind":"cl","id":"CL-S1","release":"1.0","lines":[8,9]},{"kind":"rows","id":"RW-S1","file":"other.tsv","group":"g","rows":[2]}]'
check 'added: specs for pointers no spec covers are recorded' "$(run added.sh) $(recorded specs/added-1.json)" 'added specs: 2 rc=0 yes'
check 'added: a file already recorded is refused, nothing written' "$(run added.sh) lines=$(awk '$2 == "specs/added-1.json"' "$RUN_DIR/WORK-SHA256SUMS" | wc -l | tr -d ' ')" 'REFUSED: specs/added-1.json was already recorded rc=2 lines=1'
addfixture '[{"kind":"cl","id":"CL-S1","release":"1.0","lines":[7,8]}]'
check 'added: a line a recorded spec covers is refused, nothing recorded' "$(run added.sh) $(recorded specs/added-1.json)" 'REFUSED: specs/added-1.json covers pointers a spec already covers: cl:7 rc=1 no'
addfixture '[{"kind":"rows","id":"RW-S1","file":"inv.tsv","group":"g","rows":[3,4]}]'
check 'added: a row of the same file a recorded spec covers is refused' "$(run added.sh) $(recorded specs/added-1.json)" 'REFUSED: specs/added-1.json covers pointers a spec already covers: rows:inv.tsv:3 rc=1 no'
addfixture '[{"kind":"cl","id":"CL-S1","release":"1.0","lines":[8]},{"kind":"cl","id":"CL-S2","release":"1.0","lines":[8,9]}]'
check 'added: a pointer twice in the added file is refused' "$(run added.sh) $(recorded specs/added-1.json)" 'REFUSED: specs/added-1.json covers pointers a spec already covers: cl:8 rc=1 no'
addfixture '[{"kind":"cl","id":"CL-A","release":"1.0","lines":[8]}]'
check 'added: an id a spec already carries is refused' "$(run added.sh) $(recorded specs/added-1.json)" 'REFUSED: an id in specs/added-1.json is already in a spec file: CL-A rc=1 no'
addfixture '[{"kind":"owner","id":"OW-9","unit":"CL-B","scope":"x","answer":"STOP-1"}]'
check 'added: a spec that is not of a derived kind is refused' "$(run added.sh) $(recorded specs/added-1.json)" 'REFUSED: specs/added-1.json is not a list of derived specs rc=1 no'
# jq stops at a spec without its pointers, so the specs after it would go uncompared: CL-S1 overlaps CL-B's
# line 7 and RW-X1 covers the row RW-S1 adds (AD6-2).
addfixture '[{"kind":"cl","id":"CL-S0","release":"1.0"},{"kind":"cl","id":"CL-S1","release":"1.0","lines":[7,8]}]'
check 'added: a spec without its pointers is refused, nothing recorded' "$(run added.sh | sed 's/.*REFUSED/REFUSED/') $(recorded specs/added-1.json)" 'REFUSED: specs/added-1.json has a spec without its pointers rc=1 no'
addfixture '[{"kind":"rows","id":"RW-S1","file":"inv.tsv","group":"g","rows":[3]}]'
printf '%s\n' '[{"kind":"rows","id":"RW-X0","file":"inv.tsv","group":"g"},{"kind":"rows","id":"RW-X1","file":"inv.tsv","group":"g","rows":[2,3]}]' > "$RUN_DIR/specs/rows-x.json"
(cd "$RUN_DIR" && sed -i '/ specs\/rows-x.json$/d' WORK-SHA256SUMS && sha256sum specs/rows-x.json >> WORK-SHA256SUMS)
check 'added: a recorded spec file with a spec without its pointers is refused, nothing recorded' "$(run added.sh | sed 's/.*REFUSED/REFUSED/') $(recorded specs/added-1.json)" 'REFUSED: a recorded spec file is not a spec list rc=2 no'
# jq takes its exit from its last input, so the recorded files are read through -n inputs: a broken one read
# before a good one, as Step 2's sorted record puts a-rows.json, is refused too (A1-1).
addfixture '[{"kind":"rows","id":"RW-S1","file":"inv.tsv","group":"g","rows":[5]}]'
printf '%s\n' '[{"kind":"rows","id":"RW-Y0","file":"inv.tsv","group":"g"},{"kind":"rows","id":"RW-Y1","file":"inv.tsv","group":"g","rows":[5]}]' > "$RUN_DIR/specs/a-rows.json"
(cd "$RUN_DIR" && find specs gaps -name '*.json' ! -name 'added-1.json' -print0 | sort -z | xargs -0 -r sha256sum > WORK-SHA256SUMS)
check 'added: a broken recorded spec file read before a good one is refused, nothing recorded' "$(run added.sh | sed 's/.*REFUSED/REFUSED/') $(recorded specs/added-1.json)" 'REFUSED: a recorded spec file is not a spec list rc=2 no'
# The added file holds one JSON list: with a second text, the kind check took its exit from that text and dropped
# its verdict on the owner spec in the first (A1-2).
addfixture "$(printf '%s\n%s' '[{"kind":"owner","id":"OW-9","unit":"CL-B","scope":"x","answer":"STOP-1"}]' '[{"kind":"cl","id":"CL-S9","release":"1.0","lines":[12]}]')"
check 'added: a second JSON text in the added file is refused, nothing recorded' "$(run added.sh) $(recorded specs/added-1.json)" 'REFUSED: specs/added-1.json is not a list of derived specs rc=1 no'
# A file, issue or rows spec without its field read as file:null, issue:null or rows:null:<n>, which no
# recorded pointer equals; RW-S1's row 3 is RW-X1's (A1-5).
addfixture '[{"kind":"file","id":"IT-S0"}]'
check 'added: a file spec without its path is refused, nothing recorded' "$(run added.sh | sed 's/.*REFUSED/REFUSED/') $(recorded specs/added-1.json)" 'REFUSED: specs/added-1.json has a spec without its pointers rc=1 no'
addfixture '[{"kind":"issue","id":"IS-S0"}]'
check 'added: an issue spec without its number is refused, nothing recorded' "$(run added.sh | sed 's/.*REFUSED/REFUSED/') $(recorded specs/added-1.json)" 'REFUSED: specs/added-1.json has a spec without its pointers rc=1 no'
addfixture '[{"kind":"rows","id":"RW-S1","group":"g","rows":[3]}]'
check 'added: a rows spec without its file is refused, nothing recorded' "$(run added.sh | sed 's/.*REFUSED/REFUSED/') $(recorded specs/added-1.json)" 'REFUSED: specs/added-1.json has a spec without its pointers rc=1 no'
# Only the all-ids read sees a spec file outside the work list; its first text is an object carrying CL-S1.
addfixture '[{"kind":"cl","id":"CL-S1","release":"1.0","lines":[8]}]'
printf '%s\n%s\n' '{"kind":"cl","id":"CL-S1","release":"1.0","lines":[30]}' '[{"kind":"cl","id":"CL-J1","release":"1.0","lines":[31]}]' > "$RUN_DIR/specs/junk.json"
check 'added: a spec file whose first JSON text is not a list is refused, nothing recorded' "$(run added.sh | sed 's/.*REFUSED/REFUSED/') $(recorded specs/added-1.json)" 'REFUSED: a spec file is not a spec list rc=2 no'
addfixture '[{"kind":"cl","id":"CL-S1","release":"1.0","lines":[8]}]'; printf '[]\n' > "$RUN_DIR/specs/cl.json"
check 'added: a changed work list is refused' "$(run added.sh | sed 's/.*REFUSED/REFUSED/') $(recorded specs/added-1.json)" 'REFUSED: the work list changed after it was recorded rc=1 no'
addfixture '[]'; rm "$RUN_DIR/specs/added-1.json"
check 'added: a missing file is refused' "$(run added.sh) $(recorded specs/added-1.json)" 'REFUSED: no specs/added-1.json rc=2 no'

# --- the held list and the launch list ---
# The cluster's ids are its own (none is in cl.json). RW-A and RW-C reported; RW-A's verifier was stopped.
# RW-G no-results again after its release, and RW-H is held again by a later stop after its release.
fresh
printf '%s\n' '[{"kind":"rows","id":"RW-A"},{"kind":"rows","id":"RW-B"},{"kind":"rows","id":"RW-C"},{"kind":"rows","id":"RW-D"},{"kind":"rows","id":"RW-E"},{"kind":"rows","id":"RW-F"},{"kind":"rows","id":"RW-G"},{"kind":"rows","id":"RW-H"}]' > "$RUN_DIR/specs/rows.json"
(cd "$RUN_DIR" && sha256sum specs/rows.json >> WORK-SHA256SUMS)   # recorded, as Step 2 records every spec file
cat > "$RUN_DIR/UNIT-LOG.txt" <<'EOF'
2026-10-27 STOP-1 unit=RW-B stage=report-write written=partial routed=owner-batch
2026-10-27 NORESULT unit=RW-D cause=undetermined
2026-10-27 NORESULT unit=RW-E cause=undetermined
2026-10-27 RELEASED unit=RW-E by=owner
2026-10-27 HELD unit=RW-F reason=overlaps-STOP-1
2026-10-27 STOP-2 unit=V-RW-A-1 stage=verify written=nothing routed=owner-batch
2026-10-27 NORESULT unit=X-accuracy-R1-1 cause=undetermined
2026-10-27 RELEASED unit=RW-B by=owner
2026-10-27 NORESULT unit=RW-G cause=undetermined
2026-10-27 RELEASED unit=RW-G by=transient:/t/RW-G.jsonl
2026-10-27 NORESULT unit=RW-G cause=undetermined
2026-10-27 HELD unit=RW-H reason=overlaps-STOP-1
2026-10-27 RELEASED unit=RW-H by=owner
2026-10-27 STOP-3 unit=RW-Z stage=report-write written=nothing routed=owner-batch
2026-10-27 HELD unit=RW-H reason=overlaps-STOP-3
EOF
printf 'VERDICT: ok\n' > "$RUN_DIR/RW-A.txt"; printf 'VERDICT: ok\n' > "$RUN_DIR/RW-C.txt"
launch() { out=$($shell "$work/held.sh" 2>&1); printf '%s|%s|%s' "$(printf '%s\n' "$out" | sed -n 1p)" "$(printf '%s\n' "$out" | sed -n 2p)" "$(printf '%s\n' "$out" | sed -n 3p | jq -r '[.[].id] | join(",")' 2>/dev/null)"; }
out=$(launch)
check 'held: stopped ids and ids whose last no-result, hold or release line is not a release; labels left out' "${out%%|*}" 'held=["RW-B","RW-D","RW-F","RW-G","RW-H","RW-Z"]'
check 'held: a no-result or a hold logged after a release holds the id again' "$(printf '%s' "${out%%|*}" | sed 's/^held=//' | jq -r 'map(select(. == "RW-G" or . == "RW-H")) | join(",")')" 'RW-G,RW-H'
check 'launch: after a stop or no-result, a unit that reported is not relaunched' "${out#*|}" 'not relaunched, reported already: ["RW-A","RW-C"]|RW-E'
printf '2026-10-27 RERUN-1 unit=RW-A as=R2\n' >> "$RUN_DIR/UNIT-LOG.txt"
check 'launch: a RERUN line for this run relaunches the unit it names' "$(launch | cut -d'|' -f3)" 'RW-A,RW-E'
sed -i 's/ as=R2$/ as=R1b/' "$RUN_DIR/UNIT-LOG.txt"
check 'launch: a RERUN line for another run does not' "$(launch | cut -d'|' -f3)" 'RW-E'
: > "$RUN_DIR/UNIT-LOG.txt"
check 'launch: with no stop or no-result in the job, reported units relaunch (a clean pilot re-run)' "$(launch)" 'held=[]|not relaunched, reported already: []|RW-A,RW-B,RW-C,RW-D,RW-E,RW-F,RW-G,RW-H'
# A checker's stop or no-result alone, with no unit event, is a stop in the job too (AD4-6's own case, AD5-5).
printf '%s\n' '2026-10-27 STOP-4 unit=V-RW-A-1 stage=verify written=nothing routed=owner-batch' > "$RUN_DIR/UNIT-LOG.txt"
check 'launch: a verifier stop alone leaves reported units out' "$(launch)" 'held=[]|not relaunched, reported already: ["RW-A","RW-C"]|RW-B,RW-D,RW-E,RW-F,RW-G,RW-H'
printf '%s\n' '2026-10-27 NORESULT unit=X-completeness-R1 cause=undetermined' > "$RUN_DIR/UNIT-LOG.txt"
check 'launch: a critic no-result alone leaves reported units out' "$(launch)" 'held=[]|not relaunched, reported already: ["RW-A","RW-C"]|RW-B,RW-D,RW-E,RW-F,RW-G,RW-H'
: > "$RUN_DIR/UNIT-LOG.txt"
# The cluster must be a recorded spec file, readable, and no id may be in two spec entries (AD4-2).
printf '%s\n' '[{"kind":"rows","id":"RW-X"}]' > "$RUN_DIR/specs/rows2.json"
sed 's|^CLUSTER="specs/rows.json"|CLUSTER="specs/rows2.json"|' "$work/held.sh" > "$work/held-2.sh"
check 'launch: an unrecorded cluster file is refused before any list is printed' "$(run held-2.sh)" 'REFUSED: specs/rows2.json is not a recorded spec file, or the work list changed rc=1'
printf '%s\n' '[{"kind":"rows","id":"RW-A"}]' > "$RUN_DIR/specs/rows2.json"; (cd "$RUN_DIR" && sha256sum specs/rows2.json >> WORK-SHA256SUMS)
check 'launch: an id in two spec files is refused before any list is printed' "$(run held.sh)" 'REFUSED: an id is in two spec entries: RW-A rc=1'
printf 'not json\n' > "$RUN_DIR/specs/rows2.json"; (cd "$RUN_DIR" && sed -i '/ specs\/rows2.json$/d' WORK-SHA256SUMS && sha256sum specs/rows2.json >> WORK-SHA256SUMS)
check 'launch: a recorded cluster file that is not a spec list is refused before any list is printed' "$(run held-2.sh | sed 's/.*REFUSED/REFUSED/')" 'REFUSED: specs/rows2.json is not a spec list rc=2'
rm "$RUN_DIR/specs/rows2.json"; (cd "$RUN_DIR" && sed -i '/ specs\/rows2.json$/d' WORK-SHA256SUMS)
printf '%s\n' '2026-10-27 STOP-1 unit=RW-B stage=report-write written=partial routed=owner-batch' 'HELD unit=RW-C reason=overlaps-STOP-1' > "$RUN_DIR/UNIT-LOG.txt"
check 'launch: a unit-log line without its date is refused before any list is printed' "$(run held.sh)" 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date, its kind and unit=, one space apart rc=2'
# Two spaces after the date would hide RW-C's hold from the launch's rg readers, which match one (AD6-7).
printf '%s\n' '2026-10-27 STOP-1 unit=RW-B stage=report-write written=partial routed=owner-batch' '2026-10-27  HELD unit=RW-C reason=overlaps-STOP-1' > "$RUN_DIR/UNIT-LOG.txt"
check 'launch: a unit-log line with two spaces after its date is refused before any list is printed' "$(run held.sh)" 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date, its kind and unit=, one space apart rc=2'
# The rg readers also match one space after the kind: with two, RW-B's stop vanished and every unit launched,
# the stopped one included (A1-4). A tab after the date's space hid RW-C's hold the same way (C1-1).
printf '%s\n' '2026-10-27 STOP-1  unit=RW-B stage=report-write written=partial routed=owner-batch' > "$RUN_DIR/UNIT-LOG.txt"
check 'launch: two spaces after the kind are refused before any list is printed' "$(run held.sh)" 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date, its kind and unit=, one space apart rc=2'
printf '%s\n' '2026-10-27 STOP-1 unit=RW-B stage=report-write written=partial routed=owner-batch' "$(printf '2026-10-27 \tHELD unit=RW-C reason=overlaps-STOP-1')" > "$RUN_DIR/UNIT-LOG.txt"
check 'launch: a tab after the date and its space is refused before any list is printed' "$(run held.sh)" 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date, its kind and unit=, one space apart rc=2'
# A stop found after the run on RW-A, which reported, holds RW-A like any other stop, and as the log's only line it
# alone makes the job stopped, so the units that reported are not relaunched (#1026, the transcript pass).
printf '%s\n' '2026-10-28 STOP-1 unit=RW-A stage=after-run written=whole routed=owner-batch' > "$RUN_DIR/UNIT-LOG.txt"
check 'launch: a stop found after the run holds a unit that reported' "$(run held.sh)" 'held=["RW-A"] not relaunched, reported already: ["RW-A","RW-C"] [{"kind":"rows","id":"RW-B"},{"kind":"rows","id":"RW-D"},{"kind":"rows","id":"RW-E"},{"kind":"rows","id":"RW-F"},{"kind":"rows","id":"RW-G"},{"kind":"rows","id":"RW-H"}] rc=0'
# The all-ids read takes jq's exit from every text of every spec file: an object first hid RW-B's id.
printf '%s\n' '2026-10-27 STOP-1 unit=RW-B stage=report-write written=partial routed=owner-batch' > "$RUN_DIR/UNIT-LOG.txt"
printf '%s\n%s\n' '{"kind":"rows","id":"RW-B"}' '[{"kind":"rows","id":"RW-J1"}]' > "$RUN_DIR/specs/junk.json"
check 'launch: a spec file whose first JSON text is not a list is refused before any list is printed' "$(run held.sh | sed 's/.*REFUSED/REFUSED/')" 'REFUSED: a spec file is not a spec list rc=2'
rm "$RUN_DIR/specs/junk.json"
printf '%s\n' '2026-10-27 STOP-1 unit=RW-B stage=report-write written=partial routed=owner-batch' > "$RUN_DIR/UNIT-LOG.txt"; chmod 000 "$RUN_DIR/UNIT-LOG.txt"
check 'launch: an unreadable unit log is refused before any list is printed' "$(run held.sh | sed 's/.*REFUSED/REFUSED/')" 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date, its kind and unit=, one space apart rc=2'
chmod 600 "$RUN_DIR/UNIT-LOG.txt"
rm "$RUN_DIR/UNIT-LOG.txt"
check 'held: a missing unit log is refused' "$(run held.sh)" 'REFUSED: no UNIT-LOG.txt (Step 1 creates it) rc=2'

echo
[ "$failures" -eq 0 ] && echo "ALL PASS ($shell)" || echo "$failures FAIL ($shell)"
[ "$failures" -eq 0 ]
