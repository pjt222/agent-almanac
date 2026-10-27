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

Split a job that is too large for one agent into many narrow units without letting the lead's judgement leak into each unit as hand-written prose. The work list comes from a script reading source artifacts; each unit gets pointers, a shared brief and one template per kind. The lead's judgement lives in three reviewable places: the derivation script, the brief and the templates. A reviewer audits the whole run by reading those three and the per-unit pointers. Narrow units exist for scoping, provenance and auditability. They do not change what any unit is allowed to do.

## When to Use

- A review, audit or migration has more items than one agent can hold, and each item can be answered by reading named sources
- The work list already exists in artifacts: changelog bullets, inventory or census rows, issue numbers, gap IDs from a prior critic, one diff file per pair
- Every conclusion must trace back to a source pointer (compliance review, code or dependency audit, migration sign-off)
- An earlier fan-out drifted because hand-written unit prompts differed in method or scope
- Not when the right domain is unknown (use `unleash-the-agents`), and not when each step depends on the last (use a team)

## Inputs

- **Required**: The source artifacts the work list comes from, computed before the run (paths)
- **Required**: The question every unit answers and the closed vocabulary it classifies with
- **Required**: An absolute report directory outside the repository under review
- **Required**: A human owner who decides stopped units and batched questions
- **Optional**: Chunk size per spec kind (default: 4-8 source lines or rows per unit)
- **Optional**: Critic group size (default: 15 reports per accuracy critic)
- **Optional**: Gap-round cap (default: 6 gap units per run)

## Procedure

### Step 1: Freeze the Mechanical Inputs

Compute every input a unit will cite before any unit runs. Units read these files; they never recompute them.

```bash
RUN_DIR="/abs/path/reports/run-001"   # outside the repository under review
MECH="$RUN_DIR/mechanical"
mkdir -p "$MECH" "$RUN_DIR/specs"
cp CHANGELOG.md "$MECH/changelog.md"
gh issue list --label tracked --state open --json number --jq '.[].number' > "$MECH/issues.txt"
sha256sum "$MECH"/* > "$RUN_DIR/MECH-SHA256SUMS"
```

**Expected:** `$MECH` holds every input the brief will name, with a checksum file; nothing in it is hand-edited.

**On failure:** If an input cannot be computed yet, compute it before going on. A unit that derives its own copy of an input creates a second, unreviewed version of the facts.

### Step 2: Derive the Work List With a Script

A spec is a kind, a stable id and pointers, and nothing else. A script writes every spec. The lead writes no per-unit sentence.

```javascript
// derive-specs.mjs: node derive-specs.mjs <changelog.md> [chunk] > specs/cl.json
import { readFileSync } from 'node:fs'
const [file, chunk = '6'] = process.argv.slice(2)
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

Then prove coverage: every source item lands in exactly one spec.

```bash
node derive-specs.mjs "$MECH/changelog.md" 6 > "$RUN_DIR/specs/cl.json"
jq -R -s -c 'split("\n") | map(select(length > 0) | tonumber) | map({kind: "issue", id: "IS\(.)", n: .})' \
  "$MECH/issues.txt" > "$RUN_DIR/specs/issues.json"
echo "bullets=$(rg -c '^\s*[-*] ' "$MECH/changelog.md") covered=$(jq '[.[].lines[]] | length' "$RUN_DIR/specs/cl.json") unique=$(jq '[.[].lines[]] | unique | length' "$RUN_DIR/specs/cl.json")"
jq -s 'add | map(.id) | length == (unique | length)' "$RUN_DIR"/specs/*.json   # ids unique across all clusters
```

Other kinds follow the same shape: inventory rows chunked by group, one spec per diff file, gap IDs from a prior critic file. See [EXAMPLES.md](references/EXAMPLES.md).

**Expected:** `bullets`, `covered` and `unique` are equal; the id check prints `true`; each spec holds only `kind`, `id` and pointer fields.

**On failure:** A count mismatch means the parser skipped items (nested bullets, an unusual heading, bullets before the first heading). Fix the parser and regenerate. Never hand-edit a spec file to add a unit.

### Step 3: Write the Shared Brief Once

Every unit reads one plain-text brief first. It holds everything that is the same for all units, so no template repeats it.

```text
FRAME     Who the run works for, the question every unit answers, what a unit must not produce.
EVIDENCE  Each file in mechanical/ with one line on what it holds and its known artifacts.
TOOLS     Read-only commands only; how to count; what must never be executed.
METHOD    Numbered rules, each naming the past mistake it prevents.
CLASSIFY  A closed vocabulary: category, direction, severity, and any field your domain needs.
OUTPUT    Sections VERDICT / EVIDENCE / OPEN, in several short writes; structured fields are
          paraphrase only; if your work is stopped, put "stopped by a safety classifier" (or
          "stopped by a reviewer") in an OPEN line and end; say what you could not determine.
```

**Expected:** One brief file under about 200 lines; no sentence in it names a single unit.

**On failure:** A rule that applies to one kind only belongs in that kind's template (Step 4). A rule that applies to one unit only is a sign that the spec kind is wrong.

### Step 4: Assemble Prompts From One Template per Kind

A script builds each prompt from a fixed HEAD (read the brief first, stay in scope, no side effects such as commits or issue edits), the unit id, its report path, and `scope(spec)`. `scope` holds one neutral template per kind that only fills in pointers.

```javascript
const scope = (s) => {
  switch (s.kind) {
    case 'cl': return `lines ${s.lines.join(', ')} of ${SOURCE} (release ${s.release}). For each line, say whether it touches anything in the brief's CLASSIFY list; examine the lines that do.`
    case 'issue': return `tracked issue #${s.n}. Locate its mechanism by the names the issue gives and say whether it is unchanged, narrowed, widened, closed or moved.`
    case 'raw': return s.question   // written by a critic in this run, never by the lead
    default: throw new Error(`unknown spec kind ${s.kind}`)
  }
}
const prompt = (s) => `${HEAD}\n\n=== YOUR UNIT: ${s.id} ===\nWrite your report to: ${DIR}/${s.id}.txt\nScope: ${scope(s)}`
```

[EXAMPLES.md](references/EXAMPLES.md) carries a tested Workflow skeleton of this shape. Write your own from it with `create-workflow`.

**Expected:** Any prompt can be rebuilt from its spec, the brief and the template. Two units' prompts differ only in pointers.

**On failure:** An unknown kind throws before any agent starts. If a kind needs per-unit prose to make sense, split the kind or add a pointer field.

### Step 5: Fix the Unit Output Contract

Each unit writes a `.txt` report in several short writes: it creates the file with VERDICT, then appends EVIDENCE per item, then OPEN. A unit that dies mid-report then still leaves its verdict on disk, and a reviewer can follow the report as it grows. The unit returns a flat structured summary; findings travel in the file, because message channels truncate.

```javascript
const DSCHEMA = { type: 'object', additionalProperties: false,
  required: ['unit', 'report_path', 'items', 'non_benign', 'open'],
  properties: {
    unit: { type: 'string' }, report_path: { type: 'string' }, items: { type: 'integer' },
    non_benign: { type: 'array', items: { type: 'string', maxLength: 600 } },  // id | claim | class | severity | source pointer
    open: { type: 'array', items: { type: 'string', maxLength: 300 } } } }
```

**Expected:** Every finished unit has a report file at its path and a summary whose `non_benign` lines match the file.

**On failure:** If units exhaust their structured-output retries, they are pasting raw code or quotes into fields. Tighten the paraphrase rule in HEAD and re-run those units. Never write their results by hand.

### Step 6: Wire Verifiers, Grouped Critics and a Capped Gap Round

1. **Verify**: one adversarial verifier per non-benign item. It gets the same evidence and is told to refute: the counter-example, the condition the claim overlooked, the misread source, the wrong default, the overstated impact, the item that is not new, plus any refutation check the brief adds for the domain. It writes `V-<unit>-<n>.txt`.
2. **Accuracy critics**: one per group of at most 15 reports. Each reads every report in its group, benign ones included. Per-item verifiers never see a wrong claim inside a benign verdict.
3. **Completeness critic**: one per run, over the spec list, the digest and the mechanical inputs. It asks what in scope no unit covered.
4. **Gap round**: sort the critics' gaps by priority, merge duplicates, run the top N as `raw` units, and log every gap the cap drops.

```javascript
const groups = []
for (let i = 0; i < done.length; i += GROUP) groups.push(done.slice(i, i + GROUP))
const seen = new Set()   // several critics report the same gap: keep its highest-priority copy
const gaps = critics.flatMap(c => c.gaps || []).sort((a, b) => a.priority - b.priority)
  .filter(g => !seen.has(g.title.toLowerCase()) && seen.add(g.title.toLowerCase()))
if (gaps.length > MAX_GAPS) log(`Gap round capped at ${MAX_GAPS}; NOT run: ${gaps.slice(MAX_GAPS).map(g => g.title).join('; ')}`)
```

**Expected:** One verifier file per non-benign item; `ceil(units / 15)` accuracy files plus one completeness file per run; a log line naming every gap not run.

**On failure:** A verifier that returns nothing is not a confirmation. Log it and re-run it. Assign `await parallel(...)` to a variable before filtering: `await parallel(...).filter(...)` calls `.filter` on the promise.

### Step 7: Pilot One Cluster, Then Launch the Rest in Parallel

Group the specs into clusters (one spec file each, for example). Run one cluster alone, then read two or three of its reports end to end before launching anything else.

```bash
for f in "$RUN_DIR"/CL*-0[1-3].txt; do
  printf '%s:' "$f"
  for section in VERDICT EVIDENCE OPEN; do rg -q "$section" "$f" && printf ' %s' "$section"; done
  echo
done
```

Check that each report cites the pointers it was given, that its summary matches the file, that verifiers ran, and that no clean report was counted as stopped. Fix the brief or a template, and re-run the pilot if the contract changed. Then start the remaining clusters together, one run each, with unique tags.

**Expected:** The pilot reports pass every check before any other cluster starts.

**On failure:** A defect found after all clusters launched must be fixed once per cluster. Stop runs that started early, fix, and restart them.

### Step 8: Respect a Stop

A safety classifier, a policy hook or a human reviewer may stop a unit, a verifier or the lead's own drafting. A stop is a decision about that work. This step respects it; it is never a puzzle to solve.

1. Record it by id in the unit log: what was stopped, at which stage, and what exists on disk (partial or nothing).
2. Do not re-run it, do not reword it, and do not reproduce its content by hand. That includes the lead's own stopped draft: delete an untracked partial draft and do not re-draft it. Keep a unit's partial report as it is, marked partial.
3. Put it in the owner batch (Step 9) with plain options: hold, the owner sets a different scope, or the owner does the work.
4. Continue every other unit. A stop routes to the batch; it does not block the run.
5. A re-scoped run of that unit happens only if the owner authorises that unit by name. An authorisation does not carry over to other units or later stops. If the authorised run is stopped again, propose nothing further; record it and leave the next step to the owner.

```bash
TODAY=$(date -I)
printf '%s STOP-%s unit=%s stage=%s written=%s routed=owner-batch\n' \
  "$TODAY" 1 CL1.5.0-02 report-write partial >> "$RUN_DIR/UNIT-LOG.txt"
```

A died unit (API error, timeout, no result) is different: re-run it unchanged, and never answer it yourself.

**Expected:** Every stop has a log line and a batch entry, and no stopped unit ran again without an owner answer naming it.

**On failure:** If a stopped unit was re-run or reworded by mistake, do not use that output. Log the deviation and tell the owner in the batch.

### Step 9: Batch Owner Questions With a Faithfulness Check

Collect every decision the owner must make in one `OWNER-QUESTIONS.md` in the run directory. Each question has an id, short context, cited evidence paths, options and a recommendation. Before presenting the batch, run a read-only faithfulness check. One checker per group of questions compares each factual sentence and each recommendation with the cited files and current tracker state. A completeness pass lists dependencies between questions and open items that no question covers. Checkers never read a stopped unit's content.

```markdown
- **B1. STOP-1, unit CL1.5.0-02.** Stopped while writing its report; report partial.
  Evidence: UNIT-LOG.txt line 1, CL1.5.0-02.txt (partial).
  Options: (a) you name a different scope, (b) another unit's result covers it, (c) hold.
  Recommendation: (c) until (b) is checked.
```

**Expected:** Each stop and each pending decision appears exactly once with at least one evidence path; checker corrections are in the question text; dependent questions come after the ones they depend on.

**On failure:** When a checker contradicts a question, open the primary file yourself before changing it. Record answers in the file as they arrive, so an interrupted session loses none.

### Step 10: Reconcile the Ledger Before Claiming Coverage

Compute the coverage statement from files. Never derive it from agents' idle status or from memory.

```bash
cd "${RUN_DIR:?}" || exit 1
jq -r '.[].id' specs/*.json | sort -u > ids.txt
ls -1 | sed -n 's/\.txt$//p' | sort -u | comm -12 ids.txt - > reported.txt
rg -o 'unit=([A-Za-z0-9._-]+)' -r '$1' UNIT-LOG.txt | sort -u > stopped.txt
comm -23 ids.txt reported.txt | comm -23 - stopped.txt > unaccounted.txt
echo "specs=$(wc -l < ids.txt) reported=$(wc -l < reported.txt) stopped=$(wc -l < stopped.txt) unaccounted=$(wc -l < unaccounted.txt)"
```

**Expected:** `unaccounted=0`. The written coverage statement quotes these four numbers, lists the stopped ids, and names the gaps that were not run.

**On failure:** An unaccounted id died silently. Re-run it unchanged. A stopped unit with a partial report counts as reported: say so next to its id.

## Validation

- [ ] Every spec file was produced by a script from `mechanical/`, and no spec carries text beyond pointers
- [ ] The Step 2 coverage check printed equal counts, and ids are unique across all clusters
- [ ] Every prompt is HEAD + id + report path + `scope(spec)`, and `scope` throws on an unknown kind
- [ ] One verifier file per non-benign item, grouped accuracy critics, one completeness critic, and a log line for every gap not run
- [ ] Pilot reports were read before the other clusters launched
- [ ] Every stop has a log line and a batch entry; no stopped unit was re-run, reworded or reproduced without an owner answer naming it
- [ ] The owner batch passed the read-only faithfulness check before it was presented
- [ ] The ledger reconciliation prints `unaccounted=0`

## Common Pitfalls

- **Per-unit prose from the lead**: Hand-written unit prompts drift in method and scope, and no reviewer can tell which judgement went where. If you are typing a sentence for one unit, add a pointer field or a spec kind instead.
- **One critic for the whole run**: A single critic cannot read hundreds of reports; it skims the digest and misses the wrong claim inside a benign verdict. Group critics at 15 reports or fewer, and make each read every report in its group.
- **Idle or died read as answered**: An agent that went idle has not necessarily written its report, and a died unit answered by hand is a guess. One traced function shows what that function does, not whether it is the only route. Reconcile from files (Step 10) and re-run died units unchanged.
- **Using narrow splits to get past a stop**: Narrowing is a scoping tool. It never changes what a unit may do, and it must not be used to rephrase or reroute stopped work. Only the owner decides whether stopped work continues, and in what scope.
- **A stop detector that matches its own negation**: A clean report that says "not stopped by a safety classifier" matches an unanchored pattern, and the unit is lost as a false stop. Use a negative lookbehind, as in the EXAMPLES skeleton, and test it on a clean line.
- **Launching every cluster before reading the pilot**: A template defect then has to be fixed once per cluster, and the reports already written under it must be re-run. Read the pilot reports first.

## Related Skills

- `create-workflow` - author the Workflow script that carries the templates, verifiers and critics
- `verify-agent-output` - the evidence-trail and external-anchor discipline each verifier applies
- `unleash-the-agents` - the alternative when the domain is unknown and no artifact yields a work list
- `create-work-breakdown-structure` - the project-management analogue: decomposing scope into work packages
- `manage-token-budget` - size chunk, critic group and gap cap against cost before launching
