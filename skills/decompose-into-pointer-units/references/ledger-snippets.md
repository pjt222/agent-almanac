# Ledger & Control Snippets — decompose-into-pointer-units

Canonical executable bash and JavaScript snippets for `decompose-into-pointer-units` (Steps 1, 2, 7, 8, and 10). Written for bash or zsh **without** `set -e` or `set -o pipefail` (several commands intentionally let `rg` or `awk` exit 1 on a normal path). Preserved byte-for-byte for the scenario harness (`tests/results/2026-10-27-decompose-into-pointer-units-harness/ledger.sh`).

## Step 1: Freeze Mechanical Inputs

```bash
for t in node jq rg sha256sum; do command -v "$t" >/dev/null || { echo "missing: $t" >&2; exit 1; }; done
RUN_DIR="/abs/path/reports/run-001"   # outside the repository under review; one directory for the whole job
MECH="$RUN_DIR/mechanical"
[ ! -e "$RUN_DIR/MECH-SHA256SUMS" ] || { echo 'REFUSED: this run directory is already frozen'; exit 1; }
mkdir -p "$MECH" "$RUN_DIR/specs" "$RUN_DIR/gaps" "$RUN_DIR/owner" "$RUN_DIR/repo"
touch "$RUN_DIR/UNIT-LOG.txt"
cp CHANGELOG.md "$MECH/changelog.md"
gh issue list --label "${TRACKING_LABEL:?}" --state open --json number --jq '.[].number' > "$MECH/issues.txt" || exit 1
while read -r n; do gh issue view "$n" --json number,title,body,labels > "$MECH/issue-$n.json" || exit 1; done < "$MECH/issues.txt"
mech_sums() { (cd "${MECH:?}" && find . -type f -print0 | sort -z | xargs -0 -r sha256sum); }
mech_sums > "$RUN_DIR/MECH-SHA256SUMS"
```

## Step 2: Derive Specs, Prove Coverage, and Record Work List

### `derive-specs.mjs`

```javascript
// derive-specs.mjs: node derive-specs.mjs <changelog.md> [chunk] > specs/cl.json
// Items are lines starting with "-" or "*" under a "## <release>" heading.
import { readFileSync } from 'node:fs'
const [file, chunk = '6'] = process.argv.slice(2)
if (!(Number(chunk) >= 1)) throw new Error('chunk must be a positive integer')
const specs = []
let release = null, buf = [], k = 0
const flush = () => {
  if (buf.length) specs.push({ kind: 'cl', id: `CL${release}-${String(++k).padStart(2, '0')}`, release, lines: buf })
  buf = []
}
readFileSync(file, 'utf8').split('\n').forEach((text, i) => {
  const heading = text.match(/^## \[?v?([\w.-]+)/)
  if (heading) { flush(); release = heading[1]; k = 0; return }
  if (release && /^\s*[-*] /.test(text)) { buf.push(i + 1); if (buf.length >= Number(chunk)) flush() }
})
flush()
process.stdout.write(JSON.stringify(specs) + '\n')
```

### Coverage & ID Checks

```bash
node derive-specs.mjs "$MECH/changelog.md" 6 > "$RUN_DIR/specs/cl.json"
jq -R -s -c 'split("\n") | map(select(length > 0) | tonumber) | map({kind: "issue", id: "IS\(.)", n: .})' \
  "$MECH/issues.txt" > "$RUN_DIR/specs/issues.json"
echo "bullets=$(rg -c '^\s*[-*] ' "$MECH/changelog.md") covered=$(jq '[.[].lines[]] | length' "$RUN_DIR/specs/cl.json") unique=$(jq '[.[].lines[]] | unique | length' "$RUN_DIR/specs/cl.json")"
echo "issues=$(wc -l < "$MECH/issues.txt") issue_specs=$(jq length "$RUN_DIR/specs/issues.json")"
jq -s 'add | map(.id) | length == (unique | length)' "$RUN_DIR"/specs/*.json   # ids unique across all clusters
jq -s 'add | all(.id | test("^[A-Za-z0-9._-]+$"))' "$RUN_DIR"/specs/*.json   # ids readable back from the unit log
```

### Record `WORK-SHA256SUMS`

```bash
work_sums() { (cd "${RUN_DIR:?}" && find specs gaps -name '*.json' -print0 | sort -z | xargs -0 -r sha256sum); }
[ ! -e "$RUN_DIR/WORK-SHA256SUMS" ] || { echo 'REFUSED: the work list is already recorded; a new one is a re-run (Step 8 item 2)'; exit 2; }
work_sums > "$RUN_DIR/WORK-SHA256SUMS"
```

## Step 7: Pilot Section Glance & Checksum Verification

```bash
cd "${RUN_DIR:?}" || exit 1
mech_sums | cmp -s - MECH-SHA256SUMS || { echo 'mechanical/ changed since the freeze'; exit 1; }   # mech_sums: Step 1
PILOT="specs/cl.json"   # the one cluster launched as the pilot
[ -s "$PILOT" ] || { echo "REFUSED: no pilot spec file $PILOT"; exit 2; }
n=0
for id in $(jq -r '.[].id' "$PILOT" | head -3); do
  n=$((n + 1))
  if [ ! -s "$id.txt" ]; then echo "$id: MISSING"; continue; fi
  printf '%s:' "$id"
  for section in VERDICT EVIDENCE OPEN; do rg -q "^$section:" "$id.txt" && printf ' %s' "$section"; done
  echo
done
echo "pilot reports listed: $n (read each one end to end before launching the rest)"
```

## Step 8: Unit-Log Writers, No-Result, Release, and Pre-Rerun Check

### Log a Stop

```bash
TODAY=$(date +%F)
printf '%s STOP-%s unit=%s stage=%s written=%s routed=owner-batch\n' \
  "$TODAY" 1 CL1.5.0-02 report-write partial >> "$RUN_DIR/UNIT-LOG.txt"
```

### Log a Hold or Owner-Authorised Re-Run

```bash
TODAY=$(date +%F)
printf '%s HELD unit=%s reason=overlaps-STOP-%s\n' "$TODAY" IS15 1 >> "$RUN_DIR/UNIT-LOG.txt"   # item 6
printf '%s HELD unit=%s reason=owner\n' "$TODAY" CL1.4.0-01 >> "$RUN_DIR/UNIT-LOG.txt"         # held by the owner before any run
printf '%s RERUN-%s unit=%s as=%s\n' "$TODAY" 1 CL1.4.1-01 R2 >> "$RUN_DIR/UNIT-LOG.txt"       # item 2: the launch tagged R2
```

### Log a No-Result and Move Partial

```bash
ID=CL1.4.1-02   # the unit, verifier or critic with no result
mkdir -p "$RUN_DIR/partials"
[ ! -e "$RUN_DIR/$ID.txt" ] || mv --backup=numbered "$RUN_DIR/$ID.txt" "$RUN_DIR/partials/$ID.txt" ||
  { echo "REFUSED: $ID.txt was not moved to partials/ (mv --backup needs GNU coreutils)"; exit 1; }
printf '%s NORESULT unit=%s cause=undetermined\n' "$(date +%F)" "$ID" >> "$RUN_DIR/UNIT-LOG.txt"
```

### Release a No-Result or Hold

```bash
cd "${RUN_DIR:?}" || exit 1
[ -f UNIT-LOG.txt ] || { echo 'REFUSED: no UNIT-LOG.txt'; exit 2; }
rg -q -v '^[0-9]{4}-[0-9]{2}-[0-9]{2} \S+ unit=' UNIT-LOG.txt; [ $? -eq 1 ] || { echo 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date, its kind and unit=, one space apart'; exit 2; }   # rg: 1 = every line dated
ID=CL1.4.1-02; BY=owner   # or BY=transient:<transcript path>; a verifier or critic id the same way
[ ! -s "$ID.txt" ] || { echo "REFUSED: $ID.txt exists; a release comes before the run"; exit 1; }
awk -v u="unit=$ID" '$2 ~ /^STOP-[0-9]+$/ && $3 == u {f = 1} END {exit !f}' UNIT-LOG.txt && { echo "REFUSED: $ID is stopped; only an owner spec re-scopes it"; exit 1; }
case "$BY" in
  transient:?*) [ -f "${BY#transient:}" ] || { echo "REFUSED: no transcript at ${BY#transient:}"; exit 1; }
    awk -v u="unit=$ID" '$3 != u {next} $2 == "NORESULT" {n++} $2 == "RELEASED" {s = ""; next} $2 == "NORESULT" || $2 == "HELD" {s = s $2 " "}
      END {exit !(n == 1 && s == "NORESULT ")}' UNIT-LOG.txt ||
      { echo "REFUSED: a transient release is for the first no-result of $ID, with no release or hold since"; exit 1; } ;;
  owner) [ -f OWNER-QUESTIONS.md ] || { echo 'REFUSED: no OWNER-QUESTIONS.md'; exit 2; }
    # Answered lines for this id, one per line: "NORESULT", or "HELD <reason>" as the hold's line names it
    answers=$(ID="$ID" awk '/^## /{answered = ($0 == "## Answered")} !answered {next}
      index($0, "- NORESULT, unit " ENVIRON["ID"] ": \"") == 1 {print "NORESULT"}
      index($0, "- HELD, unit " ENVIRON["ID"] ", ") == 1 {r = substr($0, length("- HELD, unit " ENVIRON["ID"] ", ") + 1); sub(/: ".*/, "", r); print "HELD " r}' OWNER-QUESTIONS.md)
    # what this release lifts: the no-result and every hold, by reason, logged since the id's last release
    open=$(awk -v u="unit=$ID" '$3 != u {next} $2 == "RELEASED" {delete h; nr = 0; next} $2 == "NORESULT" {nr = 1}
      $2 == "HELD" {r = $4; sub(/^reason=/, "", r); h[r] = 1} END {if (nr) print "NORESULT"; for (r in h) print "HELD " r}' UNIT-LOG.txt)
    [ -n "$open" ] || { echo "REFUSED: $ID has no no-result or hold to release"; exit 1; }
    unanswered=$(printf '%s\n' "$open" | rg '^HELD ' | sort -u | comm -23 - <(printf '%s\n' "$answers" | rg '^HELD ' | sort -u) | paste -sd ',' -)
    [ -z "$unanswered" ] || { echo "REFUSED: no Answered line releases $ID from: $unanswered"; exit 1; }
    need=$(awk -v u="unit=$ID" '$3 != u {next} $2 == "NORESULT" {n++} $2 == "RELEASED" && $4 ~ /^by=transient:/ {n--} END {print n + 0}' UNIT-LOG.txt)
    have=$(printf '%s\n' "$answers" | awk '$0 == "NORESULT" {n++} END {print n + 0}')
    ! printf '%s\n' "$open" | rg -q '^NORESULT$' || [ "$have" -ge "$need" ] || { echo "REFUSED: no unused Answered line releases $ID"; exit 1; } ;;
  *) echo 'REFUSED: BY is owner or transient:<transcript path>'; exit 1 ;;
esac
printf '%s RELEASED unit=%s by=%s\n' "$(date +%F)" "$ID" "$BY" >> UNIT-LOG.txt
```

### Pre-Rerun Check for Verifiers and Critics

```bash
cd "${RUN_DIR:?}" || exit 1
ID=V-CL1.5.0-01-1   # the verifier or critic about to re-run through args.rerun
[ -f UNIT-LOG.txt ] || { echo 'REFUSED: no UNIT-LOG.txt'; exit 2; }
rg -q -v '^[0-9]{4}-[0-9]{2}-[0-9]{2} \S+ unit=' UNIT-LOG.txt; [ $? -eq 1 ] || { echo 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date, its kind and unit=, one space apart'; exit 2; }   # rg: 1 = every line dated
[ ! -s "$ID.txt" ] || { echo "REFUSED: $ID.txt exists; it has a result"; exit 1; }
case $ID in V-*) U=${ID#V-}; U=${U%-*}; awk -v u="unit=$U" '$2 ~ /^STOP-[0-9]+$/ && $3 == u {f = 1} END {exit !f}' UNIT-LOG.txt &&
  { echo "REFUSED: $ID verifies $U, which is stopped"; exit 1; } ;; esac   # V-<unit>-<n>: its unit stopped, after the run too
awk -v u="unit=$ID" '$3 != u {next} $2 ~ /^STOP-[0-9]+$/ {s = 1} $2 == "NORESULT" || $2 == "HELD" || $2 == "RELEASED" {l = $2}
  END {exit !(!s && l == "RELEASED")}' UNIT-LOG.txt || { echo "REFUSED: $ID is stopped, or has no release since its last no-result"; exit 1; }
echo "rerun $ID: released, not stopped, no result yet"
```

## Step 10: Reconcile the Ledger

```bash
cd "${RUN_DIR:?}" || exit 1
[ -f UNIT-LOG.txt ] || { echo 'REFUSED: no UNIT-LOG.txt'; exit 2; }
rg -q -v '^[0-9]{4}-[0-9]{2}-[0-9]{2} \S+ unit=' UNIT-LOG.txt; [ $? -eq 1 ] || { echo 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date, its kind and unit=, one space apart'; exit 2; }   # rg: 1 = every line dated
mech_sums | cmp -s - MECH-SHA256SUMS || { echo 'mechanical/ changed during the run'; exit 1; }   # mech_sums: Step 1
work_sums | sort | cmp -s - <(sort WORK-SHA256SUMS) || { echo 'the work list changed after it was recorded'; exit 1; }   # work_sums: Step 2
all_ids=$(find specs -name '*.json' -exec jq -n -r 'inputs | .[].id' {} +) || { echo 'a spec file is not a spec list'; exit 1; }
dup_ids=$(printf '%s\n' "$all_ids" | sort | uniq -d | paste -sd ' ' -)
[ -z "$dup_ids" ] || { echo "an id is in two spec entries: $dup_ids"; exit 1; }
mkdir -p ledger
find specs -name '*.json' -exec jq -r '.[].id' {} + | sort -u > ledger/ids.txt
find . -maxdepth 1 -name '*.txt' ! -empty | sed -n 's|^\./||; s/\.txt$//p' | sort -u > ledger/files.txt
comm -12 ledger/ids.txt ledger/files.txt > ledger/reported.txt
rg -o '^\S+ STOP-[0-9]+ unit=([A-Za-z0-9._-]+)' -r '$1' UNIT-LOG.txt | sort -u | comm -12 ledger/ids.txt - > ledger/stopped.txt
rg -o '^\S+ (HELD|RELEASED) unit=([A-Za-z0-9._-]+)' -r '$1 $2' UNIT-LOG.txt | awk '{h[$2] = ($1 == "HELD")} END {for (i in h) if (h[i]) print i}' |
  sort -u | comm -12 ledger/ids.txt - | comm -23 - ledger/stopped.txt > ledger/held.txt   # the last HELD or RELEASED line decides
comm -12 ledger/held.txt ledger/reported.txt > ledger/held_ran.txt
comm -23 ledger/ids.txt ledger/reported.txt | comm -23 - ledger/stopped.txt | comm -23 - ledger/held.txt > ledger/unaccounted.txt
rg -v '^(V-|X-)' ledger/files.txt | rg -v -x 'UNIT-LOG' | comm -23 - ledger/ids.txt > ledger/extra.txt
cd ledger && echo "specs=$(wc -l < ids.txt) reported=$(wc -l < reported.txt) stopped=$(wc -l < stopped.txt) held=$(wc -l < held.txt) unaccounted=$(wc -l < unaccounted.txt) extra=$(wc -l < extra.txt) held_ran=$(wc -l < held_ran.txt)"
```
