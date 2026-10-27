---
name: decompose-into-pointer-units
description: >
  Run a large review, audit or migration as many small agent units whose work
  list is derived mechanically from source artifacts, so the lead writes no
  per-unit prose. Each spec carries pointers only (file and line numbers,
  names, an issue number); one shared brief holds the frame, method rules and
  output format; a script assembles every prompt from one neutral template per
  spec kind. Units write reports to files, every non-benign item gets an
  adversarial verifier, grouped critics and a capped gap round check the whole
  set, and a unit stopped by a safety classifier or reviewer is recorded and
  routed to the human owner, never re-run or reworded. Use when a job has
  dozens to hundreds of checkable items, when the work list can be read off
  changelogs, inventory rows, issue lists or diff files, or when every
  conclusion must trace back to a pointer a reviewer can re-open.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: advanced
  language: multi
  tags: general, multi-agent, decomposition, provenance, audit, workflow
---

# Decompose Into Pointer Units

Split a job that is too large for one agent into many narrow units without letting the lead's judgement leak into each unit as hand-written prose. The work list comes from a script reading source artifacts; each unit gets pointers, a shared brief and one template per kind. The lead's judgement lives in reviewable places: the derivation script, the brief, the templates, and the critic prompts whose gaps can become units. A reviewer audits the whole run by reading those and the per-unit pointers. Narrow units exist for scoping, provenance and auditability. They do not change what any unit is allowed to do: a job the lead would not do as one task does not become acceptable by splitting it, and the brief never withholds the run's purpose from units to make them narrower in understanding.

## When to Use

- A review, audit or migration has more items than one agent can hold, and each item can be answered by reading named sources
- The work list already exists in artifacts: changelog bullets, inventory or census rows, issue numbers, gap IDs from a prior critic, one file per item under review
- Every conclusion must trace back to a source pointer (compliance review, code or dependency audit, migration sign-off)
- An earlier fan-out drifted because hand-written unit prompts differed in method or scope
- Not when the right domain is unknown (use `unleash-the-agents`), and not when each step depends on the last (use a team)

## Inputs

- **Required**: The source artifacts the work list comes from, computed before the run (paths)
- **Required**: The question every unit answers and the closed vocabulary it classifies with
- **Required**: An absolute report directory outside the repository under review
- **Required**: A human owner who decides stopped units and batched questions
- **Required**: `node`, `jq` and `rg` on PATH; `gh` when issues are a source; GNU `sha256sum` (on macOS, `shasum -a 256`). The snippets are written for bash or zsh
- **Optional**: Chunk size per spec kind (default: 4-8 source lines or rows per unit; fewer when items are long)
- **Optional**: Critic group size (default: 15 reports per accuracy critic, an estimate of what one critic reads end to end rather than a measurement; size it against report length and cost with `manage-token-budget`)
- **Optional**: Gap-round cap (default: 6 gap units per run; size it against cost)

## Procedure

### Step 1: Freeze the Mechanical Inputs

Compute every input a unit will cite before any unit runs. Units read these files; they never recompute them.

```bash
for t in node jq rg sha256sum; do command -v "$t" >/dev/null || { echo "missing: $t" >&2; exit 1; }; done
RUN_DIR="/abs/path/reports/run-001"   # outside the repository under review
MECH="$RUN_DIR/mechanical"
mkdir -p "$MECH" "$RUN_DIR/specs" "$RUN_DIR/gapspecs"
cp CHANGELOG.md "$MECH/changelog.md"
gh issue list --label "${TRACKING_LABEL:?}" --state open --json number --jq '.[].number' > "$MECH/issues.txt" || exit 1
while read -r n; do gh issue view "$n" --json number,title,body,labels > "$MECH/issue-$n.json" || exit 1; done < "$MECH/issues.txt"
mech_sums() { (cd "${MECH:?}" && find . -type f -print0 | sort -z | xargs -0 -r sha256sum); }
mech_sums > "$RUN_DIR/MECH-SHA256SUMS"
```

**Expected:** `$MECH` holds every input the brief will name. The checksum covers every file under it, subdirectories included, and Steps 7 and 10 re-derive it and compare it byte for byte. A checksum taken at the freeze cannot show what happened before it.

**On failure:** A `missing:` line names a tool to install first. If `gh` fails, the issues are not frozen: stop rather than run with an empty list, or with units reading issue text live. If an input cannot be computed yet, compute it before going on. A unit that derives its own copy of an input creates a second, unreviewed version of the facts.

### Step 2: Derive the Work List With a Script

A spec is a kind, a stable id and pointers, and nothing else. A script writes every spec. The lead writes no per-unit sentence.

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

Then prove coverage: every source item lands in exactly one spec, and every id is safe for the Step 10 ledger.

```bash
node derive-specs.mjs "$MECH/changelog.md" 6 > "$RUN_DIR/specs/cl.json"
jq -R -s -c 'split("\n") | map(select(length > 0) | tonumber) | map({kind: "issue", id: "IS\(.)", n: .})' \
  "$MECH/issues.txt" > "$RUN_DIR/specs/issues.json"
echo "bullets=$(rg -c '^\s*[-*] ' "$MECH/changelog.md") covered=$(jq '[.[].lines[]] | length' "$RUN_DIR/specs/cl.json") unique=$(jq '[.[].lines[]] | unique | length' "$RUN_DIR/specs/cl.json")"
echo "issues=$(wc -l < "$MECH/issues.txt") issue_specs=$(jq length "$RUN_DIR/specs/issues.json")"
jq -s 'add | map(.id) | length == (unique | length)' "$RUN_DIR"/specs/*.json   # ids unique across all clusters
jq -s 'add | all(.id | test("^[A-Za-z0-9._-]+$"))' "$RUN_DIR"/specs/*.json   # ids readable back from the unit log
```

Other kinds follow the same shape: inventory rows chunked by group, one spec per item file, and owner-approved gap IDs from a prior critic file. See [EXAMPLES.md](references/EXAMPLES.md). Give each deriver its own count proof, and compare the sets of source items, not only their counts, when a deriver filters differently from the command that counts.

**Expected:** `bullets`, `covered` and `unique` are equal; `issues` equals `issue_specs`; both id checks print `true`; each spec holds only `kind`, `id` and pointer fields, and its id is fixed by the frozen input and the chunk size.

**On failure:** A count mismatch means the parser skipped items (nested bullets, an unusual heading, bullets before the first heading). Fix the parser and regenerate. An unsafe id means a deriver did not reduce a name to `[A-Za-z0-9._-]`. Never hand-edit a spec file to add a unit.

### Step 3: Write the Shared Brief Once

Every unit reads one plain-text brief first. It holds everything that is the same for all units, so no template repeats it.

```text
FRAME     Who the run works for, the whole run's purpose stated plainly, the question every unit
          answers, what a unit must not produce.
EVIDENCE  Each file in mechanical/ with one line on what it holds and its known artifacts.
TOOLS     Read-only commands only; how to count; what must never be executed.
METHOD    Numbered rules, each naming the past mistake it prevents.
CLASSIFY  A closed vocabulary: category, severity, and any field your domain needs.
OUTPUT    Sections that each start a line with VERDICT:, EVIDENCE: or OPEN:, in several short
          writes; structured fields are paraphrase only. If your work is stopped, write
          "STOPPED: <safety classifier|policy hook|reviewer>" under OPEN, set the summary's stop
          field to that source, and end; otherwise set stop to none. Say what you could not
          determine.
```

**Expected:** One brief file under about 200 lines; FRAME states the run's whole purpose; no sentence in it names a single unit.

**On failure:** A rule that applies to one kind only belongs in that kind's template (Step 4). A rule that applies to one unit only is a sign that the spec kind is wrong.

### Step 4: Assemble Prompts From One Template per Kind

A script builds each prompt from a fixed HEAD (read the brief first, stay in scope, no side effects such as commits or issue edits), the unit id, its report path, `scope(spec)` and the stop instruction. `scope` holds one neutral template per kind that only fills in pointers.

```javascript
// HEAD, SOURCE (args.source), MECH, DIR and STOP_LINE as in the EXAMPLES skeleton
const scope = (s) => {
  switch (s.kind) {
    case 'cl': return `lines ${s.lines.join(', ')} of ${SOURCE} (release ${s.release}). For each line, say whether it touches anything in the brief's CLASSIFY list; examine the lines that do.`
    case 'issue': return `issue #${s.n} as frozen in ${MECH}/issue-${s.n}.json. Answer the brief's question for it, using the names the issue gives as search terms, with evidence.`
    case 'raw': return s.question   // written by a critic in this run, never by the lead
    default: throw new Error(`unknown spec kind ${s.kind}`)
  }
}
const prompt = (s) => `${HEAD}\n\n=== YOUR UNIT: ${s.id} ===\nWrite your report to: ${DIR}/${s.id}.txt\nScope: ${scope(s)}\n${STOP_LINE}`
```

[EXAMPLES.md](references/EXAMPLES.md) carries a tested Workflow skeleton of this shape. Write your own from it with `create-workflow`.

**Expected:** Any prompt can be rebuilt from its spec, the brief and the template. Two units of the same input kind differ only in pointers; gap units (`G-*`) carry critic text and are returned by the run for review, and an `owner` unit carries the owner's answer verbatim.

**On failure:** An unknown kind throws before any agent starts, and so do an input spec of kind `raw` (lead prose) and a `cl` spec without `args.source`. If a kind needs per-unit prose to make sense, split the kind or add a pointer field.

### Step 5: Fix the Unit Output Contract

Each unit writes a `.txt` report in several short writes: it creates the file with `VERDICT:`, then appends `EVIDENCE:` per item, then `OPEN:`. A unit that dies mid-report then still leaves its verdict on disk, and a reviewer can follow the report as it grows. The unit returns a flat structured summary with a required `stop` field; findings travel in the file, because message channels truncate.

```javascript
const DSCHEMA = { type: 'object', additionalProperties: false,
  required: ['unit', 'report_path', 'items', 'non_benign', 'open', 'stop'],
  properties: {
    unit: { type: 'string' }, report_path: { type: 'string' }, items: { type: 'integer' },
    non_benign: { type: 'array', items: { type: 'string', maxLength: 600 } },  // id | claim | class | severity | source pointer
    open: { type: 'array', items: { type: 'string', maxLength: 300 } },
    stop: { type: 'string', enum: ['none', 'safety-classifier', 'policy-hook', 'reviewer'] } } }
```

**Expected:** Every finished unit has a report file at its path and a summary whose `non_benign` lines match the file; `stop` is `none` unless the unit was stopped.

**On failure:** If units exhaust their structured-output retries, they are pasting raw code or quotes into fields. Tighten the paraphrase rule in HEAD for units not yet run; a unit that already returned nothing falls under Step 8's no-result rule. Never write their results by hand.

### Step 6: Wire Verifiers, Grouped Critics and a Capped Gap Round

1. **Verify**: one adversarial verifier per non-benign item. It gets the same evidence and is told to refute: the counter-example, the misread source, the overstated impact, and every refutation check the brief lists. It writes `V-<unit>-<n>.txt`.
2. **Accuracy critics**: one per group of at most 15 reports. Each reads every report in its group, benign ones included. Per-item verifiers never see a wrong claim inside a benign verdict.
3. **Completeness critic**: one per run, over the spec list, the digest and the mechanical inputs. It asks what in scope no unit covered, and it is told which ids are held for the owner (stopped, no result, or held), so that it proposes no gap over their pointers.
4. **Gap round**: sort the critics' gaps by priority, drop exact-title duplicates (after lowercasing, keeping the highest-priority copy; a reworded duplicate is not caught), run the top N as `raw` units, and log every gap the cap drops. If any unit in the run was stopped or returned no result, the gap round does not run and its gaps go to the owner batch: a completeness critic sees that unit's scope as uncovered and proposes it. Holding on a no-result as well is a fail-closed choice, because a missing result can hide a stop.

```javascript
const holdGaps = stopped.length + noResult.length > 0   // a missing result can hide a stop
const groups = []
for (let i = 0; i < done.length; i += GROUP) groups.push(done.slice(i, i + GROUP))
const seen = new Set()   // several critics report the same gap: keep its highest-priority copy
const gaps = critics.flatMap(c => c.gaps || []).sort((a, b) => a.priority - b.priority)
  .filter(g => !seen.has(g.title.toLowerCase()) && seen.add(g.title.toLowerCase()))
if (holdGaps) log(`Gap round HELD for the owner batch: ${gaps.length} gap(s) not run`)
else if (gaps.length > MAX_GAPS) log(`Gap round capped at ${MAX_GAPS}; NOT run: ${gaps.slice(MAX_GAPS).map(g => g.title).join('; ')}`)
```

**Expected:** One verifier file per non-benign item; `ceil(finished units / 15)` accuracy files plus one completeness file per run; a log line naming every gap not run, or saying the round was held.

**On failure:** A verifier that returns nothing is not a confirmation: log it and apply Step 8's no-result rule. Assign `await parallel(...)` to a variable before filtering: `await parallel(...).filter(...)` calls `.filter` on the promise.

### Step 7: Pilot One Cluster, Then Launch the Rest in Parallel

Group the specs into clusters (one spec file each, for example). Before the pilot, record `git -C <repo> rev-parse HEAD` and `git -C <repo> status --porcelain` for the repository under review; after every run, compare both and stop on any difference, because `git status` alone cannot see a commit. Run one cluster alone, then read two or three of its reports end to end before launching anything else. This lists which sections each pilot report starts; the checks below are done by reading:

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

Check that each report cites the pointers it was given, that its summary matches the file, that verifiers ran, that every report with a `STOPPED:` line is in the run's `stopped` list, and that no clean report is. Fix the brief or a template, and re-run the pilot without its stopped ids if the contract changed: a changed brief is a reworded prompt. Then start the remaining clusters together, one run each, with unique tags and the `held` list (Step 8).

**Expected:** The pilot reports pass every check before any other cluster starts, and the repository's HEAD and status are unchanged.

**On failure:** A defect found after all clusters launched must be fixed once per cluster. Stop runs that started early, fix, and restart them without any id already stopped.

### Step 8: Respect a Stop

A safety classifier, a policy hook or a human reviewer may stop a unit, a verifier or the lead's own drafting. A stop is a decision about that work. This step respects it; it is never a puzzle to solve.

1. Record it by id in the unit log: what was stopped, at which stage, and what exists on disk (partial or nothing).
2. Do not re-run it, do not reword it, and do not reproduce its content by hand. This applies to the lead's own drafting as much as to a unit: stopped text is not re-drafted. Keep whatever partial exists as it is, marked partial, and let the owner decide what happens to it. A pilot re-run, a cluster restart, a re-derivation at another chunk size and a gap unit are all re-runs.
3. Put it in the owner batch (Step 9) with plain options: hold, the owner sets a different scope, or the owner does the work.
4. Continue every other unit. A stop routes to the batch; it does not block the run.
5. A re-scoped run of that unit happens only if the owner authorises that unit by name. It runs as an `owner` spec whose scope is the owner's answer copied verbatim, with a pointer to that answer, so the one prompt not built from pointers is still traceable to the owner's words. An authorisation does not carry over to other units or later stops. If the authorised run is stopped again, propose nothing further; record it and leave the next step to the owner.
6. A stop binds the unit's pointers, not only its id. Before launching any later spec, add every spec whose pointers overlap a stopped unit's to the `held` list and to the owner batch.

The unit log holds one line per event, and only `STOP-<n> unit=<id>` lines are stops; Step 10 reads nothing else as one. A unit with no result is logged as `NORESULT unit=<id>`.

```bash
TODAY=$(date +%F)
printf '%s STOP-%s unit=%s stage=%s written=%s routed=owner-batch\n' \
  "$TODAY" 1 CL1.5.0-02 report-write partial >> "$RUN_DIR/UNIT-LOG.txt"
```

A unit, verifier or critic with no result has an undetermined cause: the runtime returns nothing for a subagent that was skipped mid-run or died on an API error, and a stopped subagent can look the same. Read its transcript or error before any re-run. Re-run it once, unchanged, only when that shows an API error, a timeout or retry exhaustion. If it shows a stop, or the cause cannot be established, record it as a stop (items 1-3) and route it to the owner. A second no-result goes to the owner batch. Never answer it yourself.

**Expected:** Every stop has a `STOP-<n> unit=` line and a batch entry; every no-result has a `NORESULT` line and either a recorded API error or a batch entry; no stopped unit ran again without an owner answer naming it.

**On failure:** If a stopped unit was re-run or reworded by mistake, do not use that output. Log the deviation and tell the owner in the batch.

### Step 9: Batch Owner Questions With a Faithfulness Check

Collect every decision the owner must make in one `OWNER-QUESTIONS.md` in the run directory. Each question has an id, short context, cited evidence paths, options and a recommendation. For a stop entry the recommendation is hold: no option proposes a narrower, reworded or rerouted scope, and another unit's output is never offered as covering stopped work. Before presenting the batch, run a read-only faithfulness check. One checker per group of questions compares each factual sentence and each recommendation with the cited files and current tracker state. A completeness pass lists dependencies between questions and open items that no question covers. Checkers never read a stopped unit's content.

```markdown
- **B1. STOP-1, unit CL1.5.0-02.** Stopped while writing its report; report partial.
  Evidence: UNIT-LOG.txt line 1, CL1.5.0-02.txt (partial).
  Options: (a) you name a different scope for this unit, (b) you do the work, (c) hold.
  Recommendation: (c).
```

**Expected:** Each stop, each unresolved no-result and each pending decision appears exactly once with at least one evidence path; checker corrections are in the question text; dependent questions come after the ones they depend on.

**On failure:** When a checker contradicts a question, open the primary file yourself before changing it. Record answers in the file as they arrive, so an interrupted session loses none.

### Step 10: Reconcile the Ledger Before Claiming Coverage

Compute the coverage statement from files. Never derive it from agents' idle status or from memory. Write each run's returned `gap_specs` to `gapspecs/<tag>.json` first, so gap units are counted.

```bash
cd "${RUN_DIR:?}" || exit 1
mech_sums | cmp -s - MECH-SHA256SUMS || { echo 'mechanical/ changed during the run'; exit 1; }   # mech_sums: Step 1
mkdir -p ledger
find specs gapspecs -name '*.json' -exec jq -r '.[].id' {} + | sort -u > ledger/ids.txt
find . -maxdepth 1 -name '*.txt' ! -empty | sed -n 's|^\./||; s/\.txt$//p' | sort -u > ledger/files.txt
comm -12 ledger/ids.txt ledger/files.txt > ledger/reported.txt
rg -o '^\S+ STOP-[0-9]+ unit=([A-Za-z0-9._-]+)' -r '$1' UNIT-LOG.txt | sort -u | comm -12 ledger/ids.txt - > ledger/stopped.txt
comm -23 ledger/ids.txt ledger/reported.txt | comm -23 - ledger/stopped.txt > ledger/unaccounted.txt
rg -v '^(V-|X-)' ledger/files.txt | rg -v -x 'UNIT-LOG|approved-gaps|prior-gap-ids' | comm -23 - ledger/ids.txt > ledger/extra.txt
cd ledger && echo "specs=$(wc -l < ids.txt) reported=$(wc -l < reported.txt) stopped=$(wc -l < stopped.txt) unaccounted=$(wc -l < unaccounted.txt) extra=$(wc -l < extra.txt)"
```

**Expected:** `unaccounted=0` and `extra=0`, and `specs` equals the spec total from Step 2 plus the gap units (non-zero). The written coverage statement quotes these five numbers, lists the stopped ids, and names the gaps that were not run or were held.

**On failure:** An unaccounted id has no non-empty report and no stop record: apply Step 8's no-result rule before any re-run. An extra report belongs to no spec: find what launched it before using it, since a narrower or reworded run of stopped work shows up here. A stopped unit with a partial report counts as reported: say so next to its id. A checksum mismatch means a mechanical input changed after the freeze: find which before claiming anything.

## Validation

- [ ] Every spec file was produced by a script from `mechanical/`; no input spec carries text beyond pointers except an `owner` spec, whose scope is the owner's answer verbatim, and gap specs (`G-*`) carry critic text returned for review
- [ ] The Step 2 coverage check printed equal counts, and ids are unique and safe across all clusters
- [ ] Every prompt is HEAD + id + report path + `scope(spec)` + the stop instruction, and `scope` throws on an unknown kind
- [ ] One verifier file per non-benign item, grouped accuracy critics, one completeness critic, and a log line for every gap not run or held
- [ ] Pilot reports were read before the other clusters launched, and the repository's HEAD and status were unchanged after every run
- [ ] Every stop has a `STOP-<n> unit=` line and a batch entry; no stopped unit was re-run, reworded or reproduced without an owner answer naming it; no gap round ran while a unit was stopped or had no result
- [ ] Every no-result had its transcript read before any re-run
- [ ] The owner batch passed the read-only faithfulness check before it was presented
- [ ] The ledger reconciliation prints `unaccounted=0` and `extra=0`, and the mechanical checksum still matches

## Common Pitfalls

- **Per-unit prose from the lead**: Hand-written unit prompts drift in method and scope, and no reviewer can tell which judgement went where. If you are typing a sentence for one unit, add a pointer field or a spec kind instead.
- **One critic for the whole run**: A single critic cannot read hundreds of reports; it skims the digest and misses the wrong claim inside a benign verdict. Group critics at 15 reports or fewer, and make each read every report in its group.
- **Idle or no result read as answered**: An agent that went idle has not necessarily written its report, and a unit with no result answered by hand is a guess. Reconcile from files (Step 10), and apply Step 8's no-result rule before any re-run.
- **Using narrow splits to get past a stop**: Narrowing is a scoping tool. It never changes what a unit may do, and it must not be used to rephrase or reroute stopped work. Only the owner decides whether stopped work continues, and in what scope. A completeness critic does this on its own: it sees a stopped unit's scope as uncovered and proposes it as a gap, which is why the gap round is held while any unit is stopped.
- **A stop detector that reads free text**: A pattern over report text misses a stop worded differently ("stopped by a reviewer") and matches a clean line that negates it ("never stopped by a safety classifier"). Read the required `stop` field instead, and treat any value but `none`, or a missing field, as a stop.
- **Launching every cluster before reading the pilot**: A template defect then has to be fixed once per cluster, and the reports already written under it must be re-run, stopped units excepted. Read the pilot reports first.

## Related Skills

- `create-workflow` — author the Workflow script that carries the templates, verifiers and critics
- `verify-agent-output` — the evidence-trail and external-anchor discipline each verifier applies
- `unleash-the-agents` — the alternative when the domain is unknown and no artifact yields a work list
- `create-work-breakdown-structure` — the project-management analogue: decomposing scope into work packages
- `manage-token-budget` — size chunk, critic group and gap cap against cost before launching
