---
name: decompose-into-pointer-units
description: >
  Run a large review, audit or migration as many small agent units whose work
  list is derived mechanically from source artifacts, so the lead writes no
  per-unit prose. Each spec carries pointers only (file and line numbers,
  names, an issue number); one shared brief holds the frame, method rules and
  output format; a script assembles every prompt from one neutral template per
  spec kind. Units write reports to files, every non-benign item gets an
  adversarial verifier, grouped critics check the whole set and send their gaps
  to the owner, and a unit stopped by a safety classifier, a policy hook or a
  reviewer is recorded and routed to the human owner, never re-run or reworded.
  Use when a job has dozens to hundreds of checkable items, when the work list
  can be read off changelogs, inventory rows, issue lists or diff files, or
  when every conclusion must trace back to a pointer a reviewer can re-open.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: advanced
  language: multi
  tags: general, multi-agent, decomposition, provenance, audit, workflow
  locale: ja
  source_locale: en
  source_commit: 7738c1623
  fence_basis_commit: 7738c1623
  translator: "(untranslated stub)"
  translation_date: "2026-10-28"
---

# Decompose Into Pointer Units

Split a job that is too large for one agent into many narrow units without letting the lead's judgement leak into each unit as hand-written prose. The work list comes from a script reading source artifacts; each unit gets pointers, a shared brief and one template per kind. The lead's judgement lives in reviewable places: the derivation script, the brief, the templates, and the critic prompts whose gaps the owner may approve as later units. A reviewer audits the whole run by reading those and the per-unit pointers. Narrow units exist for scoping, provenance and auditability. They do not change what any unit is allowed to do: a job the lead would not do as one task does not become acceptable by splitting it, and the brief never withholds the run's purpose from units to make them narrower in understanding.

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
- **Required**: `node`, `jq` and `rg` on PATH; `gh` when issues are a source; GNU coreutils and findutils (`sha256sum -c --quiet`, `mv --backup`, `xargs -r`, `find -print0`). The snippets are written for bash or zsh, run without `set -e` or `set -o pipefail`: several let `rg` or `awk` exit 1 on a normal path, which errexit would turn into a silent stop
- **Optional**: Chunk size per spec kind (default: 4-8 source lines or rows per unit; fewer when items are long)
- **Optional**: Critic group size (default: 15 reports per accuracy critic, an estimate of what one critic reads end to end rather than a measurement; size it against report length and cost with `manage-token-budget`)

## Procedure

### Step 1: Freeze the Mechanical Inputs

Compute every input a unit will cite before any unit runs. Units read these files; they never recompute them.

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

**Expected:** `$MECH` holds every input the brief will name. The checksum covers every file under it, subdirectories included, and Steps 7 and 10 re-derive it and compare it byte for byte. A checksum taken at the freeze cannot show what happened before it. At the run directory's top level the only `.txt` files are reports, `V-` and `X-` files and `UNIT-LOG.txt`, because Step 10 reads every other top-level `.txt` as a report. Everything else the lead writes is a `.md` file or goes in a subdirectory: the brief is `BRIEF.md`, and the repository records go under `repo/`, the owner's decisions under `owner/` and no-result partials under `partials/`. One run directory holds the whole job: every run of it, its unit log, its owner batch and its reports. A later run launches in the same directory under a new tag. A second directory would not see this one's stops, reports or answers, so there is none; the freeze is refused if the directory is already frozen, and a run of this step that failed before writing the checksum can be repeated.

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

No id starts with `V-` or `X-`: those prefixes name the verifier and critic files, and the launch snippet's held list leaves them out, so a stop under such a spec id would not hold it. Once the counts are equal and both checks print `true`, record the work list. It is written once. A later spec or gaps file is added to it only by the EXAMPLES.md snippet that writes or checks that file (the gaps-file record, the gap deriver, the owner-spec check); a hand append is a re-take. Step 10 refuses a work list that differs from the record, and the launch snippet and Step 10 both refuse an id that is in two spec entries:

```bash
work_sums() { (cd "${RUN_DIR:?}" && find specs gaps -name '*.json' -print0 | sort -z | xargs -0 -r sha256sum); }
[ ! -e "$RUN_DIR/WORK-SHA256SUMS" ] || { echo 'REFUSED: the work list is already recorded; a new one is a re-run (Step 8 item 2)'; exit 2; }
work_sums > "$RUN_DIR/WORK-SHA256SUMS"
```

Other kinds follow the same shape: inventory rows chunked by group, one spec per item file, and gaps the owner approved from an earlier run's recorded gaps file. See [EXAMPLES.md](references/EXAMPLES.md). Give each deriver its own count proof, and compare the sets of source items, not only their counts, when a deriver filters differently from the command that counts.

**Expected:** `bullets`, `covered` and `unique` are equal; `issues` equals `issue_specs`; both id checks print `true`; `WORK-SHA256SUMS` lists every spec file; each spec holds only `kind`, `id` and pointer fields (an `owner` spec also carries the owner's words, Step 8 item 5), and its id is fixed by the frozen input and the chunk size.

**On failure:** A count mismatch means the parser skipped items (nested bullets, an unusual heading, bullets before the first heading). Fix the parser and regenerate before the work list is recorded. An unsafe id means a deriver did not reduce a name to `[A-Za-z0-9._-]`. After any unit has launched, the work list is never re-derived. A regeneration is a re-run (Step 8 item 2): it can move a stopped unit's lines into a spec that still runs, under a surviving id or a new one, so Step 10 refuses a work list changed in place, and the launch snippet and Step 10 refuse an id in two spec entries. Fix the deriver, have it write only the items the first derivation skipped to a new spec file with new ids, and record that file with the added-specs check (EXAMPLES.md), which refuses any pointer a recorded spec already covers. The added specs launch as a cluster not yet run, in the same run directory. Never hand-edit a spec file to add a unit.

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
          field to safety-classifier, policy-hook or reviewer, and end; otherwise set stop to
          none. Say what you could not determine.
```

**Expected:** One brief, saved as `$RUN_DIR/BRIEF.md` (Step 1 says why not `.txt`), under about 200 lines; FRAME states the run's whole purpose; no sentence in it names a single unit.

**On failure:** A rule that applies to one kind only belongs in that kind's template (Step 4). A rule that applies to one unit only is a sign that the spec kind is wrong.

### Step 4: Assemble Prompts From One Template per Kind

A script builds each prompt from a fixed HEAD (read the brief first, stay in scope, no side effects such as commits or issue edits), the unit id, its report path, `scope(spec)` and the stop instruction. `scope` holds one neutral template per kind that only fills in pointers.

```javascript
// HEAD, SOURCE (args.source), MECH, DIR and STOP_LINE as in the EXAMPLES skeleton; the rows, file and gap cases are there too
const scope = (s) => {
  switch (s.kind) {
    case 'cl': return `lines ${s.lines.join(', ')} of ${SOURCE} (release ${s.release}). For each line, say whether it touches anything in the brief's CLASSIFY list; examine the lines that do.`
    case 'issue': return `issue #${s.n} as frozen in ${MECH}/issue-${s.n}.json. Answer the brief's question for it, using the names the issue gives as search terms, with evidence.`
    case 'owner': return `owner-authorised re-scope of ${s.unit}: ${s.scope} (the owner's words, verbatim, from the Answered line ${s.answer})`
    default: throw new Error(`unknown spec kind ${s.kind}`)
  }
}
const prompt = (s) => `${HEAD}\n\n=== YOUR UNIT: ${s.id} ===\nWrite your report to: ${DIR}/${s.id}.txt\nScope: ${scope(s)}\n${STOP_LINE}`
```

[EXAMPLES.md](references/EXAMPLES.md) carries a tested Workflow skeleton of this shape. Write your own from it with `create-workflow`.

**Expected:** Any prompt can be rebuilt from its spec, the brief and the template. Two units of the same kind differ only in pointers, except an `owner` unit, which carries the owner's answer verbatim.

**On failure:** A kind the skeleton does not accept throws before any agent starts (there is no kind for lead prose), and so do a `cl` spec without `args.source`, an `owner` spec without its unit, scope and `STOP-<n>` answer, and a `held` argument that is not an array. If a kind needs per-unit prose to make sense, split the kind or add a pointer field.

### Step 5: Fix the Unit Output Contract

Each unit writes a `.txt` report in several short writes: it creates the file with `VERDICT:`, then appends `EVIDENCE:` per item, then `OPEN:`. A unit that dies mid-report then still leaves its verdict on disk, and a reviewer can follow the report as it grows. The unit returns a flat structured summary with a required `stop` field, and verifiers and critics return the same field; findings travel in the file, because message channels truncate.

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

### Step 6: Wire Verifiers and Grouped Critics; Gaps Go to the Owner

1. **Verify**: one adversarial verifier per non-benign item. It gets the same evidence and is told to refute: the counter-example, the misread source, the overstated impact, and every refutation check the brief lists. It writes `V-<unit>-<n>.txt`. A verifier that reports a stop or returns nothing is recorded; its verdict is not counted, and the claim stays unverified.
2. **Accuracy critics**: one per group of at most the critic group size (default 15) reports. Each reads every report in its group, benign ones included. Per-item verifiers never see a wrong claim inside a benign verdict.
3. **Completeness critic**: one per run, over the spec list, the digest and the mechanical inputs. It asks what in scope no unit covered. Every critic is told which ids are held for the owner (stopped, no result or held) when its run starts, and sets a required `covers_held` flag on any gap over their pointers. A critic re-run through `rerun` is told its first run's list, so a stop or hold logged since reaches its gaps only through the marking and the second read (Step 9).
4. **Gaps go to the owner**: sort the critics' gaps by priority and drop exact-title duplicates (after lowercasing, keeping the highest-priority copy, which takes `covers_held` if any copy set it and lists each dropped copy's question and flag for the owner; a reworded duplicate is not caught). No gap runs in the run that found it. Every gap goes to the owner batch, and a gap becomes a spec only in a later run, from an id the owner approved. A completeness critic sees a stopped or held unit's scope as uncovered and proposes it, and nothing in code can reliably tell that from a new gap; the owner can. A stopped critic's gaps and corrections are not used. Each gap carries an id, a topic from the brief's CLASSIFY categories, so the owner can approve by topic, and its `covers_held` flag.

```javascript
const groups = []
for (let i = 0; i < done.length; i += GROUP) groups.push(done.slice(i, i + GROUP))
const kept = new Map()   // several critics report the same gap: keep its highest-priority copy, with any copy's covers_held
for (const g of critics.flatMap(c => c.gaps || []).sort((a, b) => a.priority - b.priority)) {
  const k = g.title.toLowerCase(), first = kept.get(k)
  if (!first) kept.set(k, { ...g, dropped: [] })
  else {
    first.covers_held = Boolean(first.covers_held || g.covers_held)
    first.dropped.push({ question: g.question, covers_held: g.covers_held === true })   // shown to the owner
  }
}
const gaps = [...kept.values()].map((g, i) => ({ ...g, id: `G-${TAG}-${i + 1}` }))   // each gap also carries a topic
if (gaps.length) log(`${gaps.length} gap(s) for the owner batch, by topic; none runs in this run`)
```

**Expected:** One verifier file per non-benign item; `ceil(finished units / group size)` accuracy files plus one completeness file per run; every gap in the owner batch, and no unit outside the input specs ran.

**On failure:** A verifier that returns nothing or reports a stop is not a confirmation: record it and apply Step 8. Assign `await parallel(...)` to a variable before filtering: `await parallel(...).filter(...)` calls `.filter` on the promise.

### Step 7: Pilot One Cluster, Then Launch the Rest in Parallel

Group the specs into clusters (one spec file each, for example). Before the pilot, record `git -C <repo> rev-parse HEAD` and `git -C <repo> status --porcelain` for the repository under review into `$RUN_DIR/repo/`; after every run, compare both and stop on any difference, because `git status` alone cannot see a commit. Run one cluster alone, then read two or three of its reports end to end before launching anything else. This lists which sections each pilot report starts; the checks below are done by reading:

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

Check that each report cites the pointers it was given, that its summary matches the file, that verifiers ran, that every report with a `STOPPED:` line is in the run's `stopped` list, and that no clean report is. A report whose `STOPPED:` line disagrees with its `stop` field is logged as a stop (`STOP-<n>`, Step 8), so that the unit log stays the one record of stops; then fix the brief or a template. Re-run the pilot under the fixed contract only if `UNIT-LOG.txt` has no `STOP` or `NORESULT` line, which needs all six stop and no-result lists empty (`stopped`, `no_result`, `verifier_stopped`, `verifier_no_result`, `critic_stopped`, `critic_no_result`) and no disagreeing report. Otherwise do not re-run it, because re-launching its units launches their verifiers and critics again. It goes to the owner batch, which notes that its reports were written under the old brief, and only the units the owner names run again (Step 8 item 2). Then start the remaining clusters together, one run each, with unique tags, each with its held ids taken out of its spec list and passed as `held` (Step 8; the snippet is in EXAMPLES.md).

**Expected:** The pilot reports pass every check before any other cluster starts, and the repository's HEAD and status are unchanged.

**On failure:** A defect found after all clusters launched must be fixed once per cluster. Stop runs that started early and fix. Restart a run only if no run in the job has recorded a stop or a missing result; otherwise it goes to the owner batch as above. A run stopped from outside may not return its lists, so read its reports for `STOPPED:` lines and its transcripts before deciding. A run that returns nothing at all, halted from outside or by a usage limit, leaves no lists, no `rerun_prompts` and no `gaps_for_owner`. Log a no-result (Step 8) for each of its units whose report is missing or has no `OPEN:` section (Step 5's last write); the snippet moves that partial. Log one for each verifier whose transcript exists and whose file is missing, and for each critic that has no file. A unit whose report is whole counts as reported; its non-benign items, whose verifiers cannot be named without its summary, go into the coverage statement as unverified. The halted run returned no prompts, and a transcript's first message carries the runtime's own framing rather than the prompt, so its verifiers and critics go to the owner batch.

### Step 8: Respect a Stop

A safety classifier, a policy hook or a human reviewer may stop a unit, a verifier, a critic or the lead's own drafting. A stop is a decision about that work. This step respects it; it is never a puzzle to solve.

1. Record it by id in the unit log: what was stopped, at which stage, and what exists on disk (partial or nothing).
2. Do not re-run it, do not reword it, and do not reproduce its content by hand. This applies to the lead's own drafting as much as to a unit: stopped text is not re-drafted. Keep whatever partial exists as it is, marked partial, and let the owner decide what happens to it. A partial drafted inside a repository working tree moves, unedited, into the run directory, so that it cannot be committed or continued; the owner batch cites its path. A pilot re-run, a cluster restart, a re-derivation at another chunk size and a gap unit are all re-runs. Once any run in the job has recorded a stop or a missing result, from a unit, a verifier or a critic, nothing that already ran is launched again unless the owner names it, because re-launching a unit launches its verifiers and critics again. Clusters not yet launched still start, with the held list. The one exception is the transient re-run of a no-result below. When the owner names reported units for a re-run, record the answer on a `RERUN-<n>` Answered line (Step 9) and, before launching, log one `RERUN-<n> unit=<id> as=<tag>` line per unit, naming the tag of the launch it authorises. Once the job has a stop or a no-result, the launch snippet (EXAMPLES.md) relaunches a unit that already reported only for such a line.
3. Put it in the owner batch (Step 9) with plain options: hold, the owner sets a different scope, or the owner does the work.
4. Continue every other unit. A stop routes to the batch; it does not block the run.
5. A re-scoped run of that unit happens only if the owner authorises that unit by name. It runs as an `owner` spec (`id` `OW-<n>`, new to the work list, `unit`, `scope`, `answer`) whose scope is the owner's answer copied verbatim from a one-line Answered entry and whose `answer` is that entry's `STOP-<n>`. The owner-spec check in EXAMPLES.md exits 1 on a scope not quoted on that line in the Answered section, and records the spec file only when nothing is refused. The check shows consistency with the batch, not that the words are the owner's, so the Answered entry cites where they came from. An authorisation does not carry over to other units or later stops: a `STOP-<n>` authorises one owner spec, and the check refuses a second one citing it, in the same file or a later one. If the authorised run is stopped again, propose nothing further; record it and leave the next step to the owner.
6. A stop binds the unit's pointers, not only its id. Before launching any later spec, add every spec whose pointers overlap a stopped unit's to the held list, to the unit log as `HELD unit=<id> reason=overlaps-STOP-<n>`, and to the owner batch, except an owner spec authorised for that unit under item 5. Such a hold is decided under its stop's entry: it runs only as that entry's option (a), an owner spec in the owner's words, unless the owner rules the overlap out. A `HELD` Answered line releases it only on that ruling, and cites it.

The unit log holds one line per event, and every line starts with its date, its kind and `unit=`, one space apart, as each `printf` below writes it. Every reader takes the kind from the second field, so a line without its date would be invisible to all of them, and the `rg` readers match exactly one space on each side of the kind, so a line spaced any other way would be invisible to those; each reader refuses a log that holds either. Only `STOP-<n> unit=<id>` lines are stops and only `HELD unit=<id>` lines are holds; Step 10 reads nothing else as either. A `HELD` line is written for item 6, with `reason=overlaps-STOP-<n>`, or before the first launch with `reason=owner`, for work the owner keeps back and for the specs over a stop outside any unit, such as the lead's own drafting, so that every held list and every critic sees it. A unit with no result is logged as `NORESULT unit=<id>`. A no-result or held id is released only by a `RELEASED unit=<id>` line; a stop is never released, only re-scoped under item 5. A release is an event, not a property of the id: it lifts the `NORESULT` and `HELD` lines before it, and a later no-result or hold holds the id again. Verifier and critic stops and no-results are logged the same way, under the ids the run returns, which are the basenames of the files those agents write (`V-<id>-<n>`, `X-accuracy-<tag>-<n>`, `X-completeness-<tag>`). Step 10 counts spec units only, so these go into the coverage statement and the owner batch; the claim behind a stopped verdict stays unverified, and the claim behind a missing one until a transient re-run returns a verdict.

```bash
TODAY=$(date +%F)
printf '%s STOP-%s unit=%s stage=%s written=%s routed=owner-batch\n' \
  "$TODAY" 1 CL1.5.0-02 report-write partial >> "$RUN_DIR/UNIT-LOG.txt"
```

The other hand-written lines, each before the launch it bears on:

```bash
TODAY=$(date +%F)
printf '%s HELD unit=%s reason=overlaps-STOP-%s\n' "$TODAY" IS15 1 >> "$RUN_DIR/UNIT-LOG.txt"   # item 6
printf '%s HELD unit=%s reason=owner\n' "$TODAY" CL1.4.0-01 >> "$RUN_DIR/UNIT-LOG.txt"         # held by the owner before any run
printf '%s RERUN-%s unit=%s as=%s\n' "$TODAY" 1 CL1.4.1-01 R2 >> "$RUN_DIR/UNIT-LOG.txt"       # item 2: the launch tagged R2
```

A unit, verifier or critic with no result has an undetermined cause: the runtime returns nothing for a subagent that was skipped mid-run or died on an API error, and a stopped subagent can look the same. Log it and move any partial file it wrote to `partials/`, so that the ledger keeps a unit unaccounted and a later release is not refused by its own partial:

```bash
ID=CL1.4.1-02   # the unit, verifier or critic with no result
mkdir -p "$RUN_DIR/partials"
[ ! -e "$RUN_DIR/$ID.txt" ] || mv --backup=numbered "$RUN_DIR/$ID.txt" "$RUN_DIR/partials/$ID.txt" ||
  { echo "REFUSED: $ID.txt was not moved to partials/ (mv --backup needs GNU coreutils)"; exit 1; }
printf '%s NORESULT unit=%s cause=undetermined\n' "$(date +%F)" "$ID" >> "$RUN_DIR/UNIT-LOG.txt"
```

Then read its transcript or error by structure, not by substring. A stop shows as an assistant turn ending in a refusal, or as a stop or interrupt notice that the runtime itself wrote for that subagent (name your runtime's exact notices in the brief's TOOLS section). A subagent that read text containing those strings can carry them anywhere in its output.

- **Transient**: the transcript shows an overload or 5xx response, a rate limit, a usage or quota limit notice written by the runtime, or a network timeout, and nothing else. Release it with `BY=transient:<transcript path>` and re-run it once, unchanged and alone, under a new tag: a unit through the launch snippet, and a verifier or critic, once the pre-rerun check below passes, through the skeleton's `rerun` argument, with the prompt its run returned in `rerun_prompts` (EXAMPLES.md).
- **Stop**: an error that cites a usage policy, a refusal, a blocked request or a hook is a stop, even when it is labelled as an API error. Add a `STOP-<n> unit=<id>` line.
- **Otherwise** the cause is not established. Keep the `NORESULT` line, do not re-run or reword it, and put it in the owner batch; a unit stays unaccounted until the owner answers.

A second no-result of the same id goes to the owner batch whatever its cause, and so does a no-result held over a stop since (item 6). Never answer either yourself. Until a verifier or critic returns, its claim stays unverified, or its group unchecked. A release is written only by this snippet. It refuses a missing unit log, an id that has a report, a stopped id, a transient release whose transcript file does not exist (it checks the file is there, not what it holds, so read the transcript by structure), a transient release of anything but an id's first no-result with no release or hold since, and an owner release that the Answered lines do not cover (Step 9). The owner arm checks that an Answered line exists, not what it says:

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

The skeleton cannot read the unit log, so before a verifier or critic re-runs through `rerun`, this check binds the re-run to its release. It passes only an id whose last no-result, hold or release line is a release, with no stop and no file of its own:

```bash
cd "${RUN_DIR:?}" || exit 1
ID=V-CL1.5.0-01-1   # the verifier or critic about to re-run through args.rerun
[ -f UNIT-LOG.txt ] || { echo 'REFUSED: no UNIT-LOG.txt'; exit 2; }
rg -q -v '^[0-9]{4}-[0-9]{2}-[0-9]{2} \S+ unit=' UNIT-LOG.txt; [ $? -eq 1 ] || { echo 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date, its kind and unit=, one space apart'; exit 2; }   # rg: 1 = every line dated
[ ! -s "$ID.txt" ] || { echo "REFUSED: $ID.txt exists; it has a result"; exit 1; }
awk -v u="unit=$ID" '$3 != u {next} $2 ~ /^STOP-[0-9]+$/ {s = 1} $2 == "NORESULT" || $2 == "HELD" || $2 == "RELEASED" {l = $2}
  END {exit !(!s && l == "RELEASED")}' UNIT-LOG.txt || { echo "REFUSED: $ID is stopped, or has no release since its last no-result"; exit 1; }
echo "rerun $ID: released, not stopped, no result yet"
```

**Expected:** Every stop has a `STOP-<n> unit=` line and a batch entry; every no-result has a `NORESULT` line, its partial under `partials/`, and either a transient release or a batch entry; every item-6 hold has a `HELD` line; nothing that ran was launched again after a stop or no-result without an owner answer naming it, except the one transient re-run the release snippet recorded.

**On failure:** If a stopped unit was re-run or reworded by mistake, do not use that output. Log the deviation and tell the owner in the batch.

### Step 9: Batch Owner Questions With a Faithfulness Check

Collect every decision the owner must make in one `OWNER-QUESTIONS.md` in the run directory. Each question has an id, short context, cited evidence paths, options and a recommendation. For a stop entry the recommendation is hold: no option proposes a narrower, reworded or rerouted scope, and another unit's output is never offered as covering stopped work. Before presenting the batch, run a read-only faithfulness check. One checker per group of questions compares each factual sentence and each recommendation with the cited files and current tracker state. A completeness pass lists dependencies between questions and open items that no question covers. Checkers never read a stopped unit's content. Present gaps by topic: one entry per topic with its count and every question in full, and the owner approves or holds a topic as a whole, or names single gap ids. Before any answer, mark every gap whose question covers a stopped or held unit's pointers and write the marked ids to `owner/<tag>-marked-gaps.txt` (it may be empty, and must exist). Marking is the lead's reading of each question against the held pointers, so it can miss one. The critic's own `covers_held` flag is the second, independent signal. The third is an independent read-only checker, run before any answer, which reads every gap's question against the pointers of every held id and writes `owner/<tag>-second-read.tsv`: one line per gap, with its id, a tab, and `COVERS`, `BORDERLINE` or `CLEAR`. It reads the gaps file, the spec files and the unit log, never a stopped unit's report. The gap deriver honours all three in code: it refuses a second read that does not name every gap exactly once, and derives a gap through its topic only when the gap is unmarked, unflagged and called `CLEAR`. List marked and flagged gaps apart. A marked gap is never approved: it belongs only to its unit's stop entry, option (a). A flagged gap the batch did not mark is approved only by its id, with the reason it was not marked. The owner who approves a topic still sees every question in it. A checker correction to a gap's question is not folded into the question, because a later unit reads the question as recorded; list it beside the gap and recommend hold. Record each answer on one line in the Answered section: `- STOP-<n>, unit <id>: "<owner's words verbatim>" (<where the words came from>, <date>)` for a stop, the same with `NORESULT` in place of `STOP-<n>` for a no-result, `- HELD, unit <id>, <reason>: "<owner's words>" (<where>, <date>)` for a hold, its reason as its `HELD` line names it (`overlaps-STOP-<n>` or `owner`), and `- RERUN-<n>, run <tag>: "<owner's words>" (<where>, <date>)` for a re-run of reported work. An owner release lifts only what has an answer: each hold logged since the id's last release needs a line under its reason, so an answer under another reason does not lift a later hold, and a no-result needs a `NORESULT` line not yet used by an earlier owner release. A `HELD` line is matched by its reason and never used up, so an earlier answer would also lift a later hold under the same reason: release a re-held id only on a new answer. The owner-spec check and the release snippet read these lines. Transcribe topic and id approvals to `owner/<tag>-approved-topics.txt` and `owner/<tag>-approved-gaps.txt` for the gap deriver.

```markdown
- **B1. STOP-1, unit CL1.5.0-02.** Stopped while writing its report; report partial.
  Evidence: UNIT-LOG.txt line 1, CL1.5.0-02.txt (partial).
  Options: (a) you name a different scope for this unit, (b) you do the work, (c) hold.
  Recommendation: (c).
```

**Expected:** Each stop, each unresolved no-result, each held id, each run that would need a re-run and each pending decision appears exactly once with at least one evidence path; checker corrections are in the question text, or beside a gap's question; dependent questions come after the ones they depend on.

**On failure:** When a checker contradicts a question, open the primary file yourself before changing it. Record answers in the file as they arrive, so an interrupted session loses none.

### Step 10: Reconcile the Ledger Before Claiming Coverage

Compute the coverage statement from files. Never derive it from agents' idle status or from memory.

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

**Expected:** Both checksums match and no id is in two spec entries; `extra=0` and `held_ran=0`; every unaccounted id is a no-result awaiting the owner or released and not yet re-run, named in the coverage statement and the batch; and `specs` equals the spec total from Step 2 plus any approved gap and owner specs (non-zero). The written coverage statement quotes these seven numbers, lists the stopped and held ids separately, lists verifier and critic stops and no-results with the claims they leave unverified, and names the gaps sent to the owner.

**On failure:** An unaccounted id has no non-empty report, no stop record and no `HELD` line after its last release: apply Step 8's no-result rule before any re-run. A held id with a report ran while held: do not use that report (Step 8 On failure). An extra report belongs to no spec: find what launched it before using it. It catches a run of stopped work under an id no spec carries. A re-run under the stopped id itself, or an approved gap or owner spec over its pointers, does not show here (Step 8 items 5 and 6, Step 9), and a re-launch of reported work leaves no trace in the ledger. That is why, once the job has a stop or a no-result, the launch snippet lists a reported unit only for a `RERUN` line naming its tag (Step 8 item 2); every `RERUN` line is written by hand, with Step 8's writer, and nothing compares it with its Answered `RERUN-<n>` line, so the launch snippet trusts it. A stopped unit with a partial report counts as reported: say so next to its id. A mechanical checksum mismatch means an input changed after the freeze: find which before claiming anything. A work-list mismatch means a spec or gaps file was regenerated, edited or added without being recorded, and an id in two spec entries means a re-derivation into a new file or a spec written twice. That is a re-run (Step 8 item 2): use no report over the changed pointers until the owner decides.

## Validation

- [ ] Every spec file was produced by a script from `mechanical/`, or from a gaps file recorded when it was written, or, for owner specs, checked against the batch; each was recorded in `WORK-SHA256SUMS`; no spec carries text beyond pointers except an `owner` spec, whose scope is the owner's answer verbatim
- [ ] The Step 2 coverage check printed equal counts, and ids are unique and safe across all clusters
- [ ] Every prompt is HEAD + id + report path + `scope(spec)` + the stop instruction, and `scope` throws on an unknown kind
- [ ] One verifier file per non-benign item, grouped accuracy critics, one completeness critic, and every gap sent to the owner batch; no unit outside the input specs ran
- [ ] Pilot reports were read before the other clusters launched; once any run had recorded a stop or a missing result, nothing that ran was launched again without an owner answer naming it, except the one transient re-run the release snippet recorded; and the repository's HEAD and status were unchanged after every run
- [ ] Every stop has a `STOP-<n> unit=` line and a batch entry; no stopped unit was re-run, reworded or reproduced except as an item-5 owner spec, and no held id ran before its `RELEASED` line; verifier and critic stops and no-results are in the coverage statement
- [ ] Every no-result had its transcript read before any re-run, and every release was written by the release snippet
- [ ] The owner batch passed the read-only faithfulness check before it was presented, and the independent second read named every gap once
- [ ] The ledger prints `extra=0` and `held_ran=0`, every unaccounted id is a no-result in the batch or released and not yet re-run, and both checksums still match

## Common Pitfalls

- **Per-unit prose from the lead**: Hand-written unit prompts drift in method and scope, and no reviewer can tell which judgement went where. If you are typing a sentence for one unit, add a pointer field or a spec kind instead.
- **One critic for the whole run**: A single critic cannot read hundreds of reports; it skims the digest and misses the wrong claim inside a benign verdict. Group critics small enough that each reads every report in its group (default 15).
- **Idle or no result read as answered**: An agent that went idle has not necessarily written its report, and a unit with no result answered by hand is a guess. Reconcile from files (Step 10), and apply Step 8's no-result rule before any re-run.
- **Using narrow splits to get past a stop**: Narrowing is a scoping tool. It never changes what a unit may do, and it must not be used to rephrase or reroute stopped work. Only the owner decides whether stopped work continues, and in what scope. A completeness critic does this on its own: it sees a stopped unit's scope as uncovered and proposes it as a gap, which is why no gap runs in the run that found it, and the owner decides which gaps become specs.
- **A stop detector that reads free text**: A pattern over report text misses a stop worded differently ("stopped by a reviewer") and matches a clean line that negates it ("never stopped by a safety classifier"). Read the required `stop` field instead, treat any value but `none`, or a missing field, as a stop, and read a transcript by structure (Step 8).
- **Launching every cluster before reading the pilot**: A template defect then has to be fixed once per cluster, and the reports already written under it must be re-run, which after any stop or missing result needs the owner to name what runs again (Step 8 item 2). Read the pilot reports first.

## Related Skills

- `create-workflow` — author the Workflow script that carries the templates, verifiers and critics
- `verify-agent-output` — the evidence-trail and external-anchor discipline each verifier applies
- `unleash-the-agents` — the alternative when the domain is unknown and no artifact yields a work list
- `create-work-breakdown-structure` — the project-management analogue: decomposing scope into work packages
- `manage-token-budget` — size chunk and critic group against cost before launching
