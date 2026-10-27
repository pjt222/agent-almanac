# Examples: Decompose Into Pointer Units

Extended material for [SKILL.md](../SKILL.md): a complete Workflow skeleton, derivers for the other spec kinds, a brief skeleton, an owner batch skeleton and the launch sequence.

## Workflow skeleton

Tested in the Workflow dialect (`node --check` on the wrapped body) and against mocked `agent` / `pipeline` / `parallel` primitives. In the mock:

- A stop reported in a unit's, a verifier's or a critic's `stop` field (safety classifier, policy hook or reviewer) was recorded, a missing `stop` field counted as a stop, and a clean report saying it was "never stopped" did not.
- A stopped unit got no verifier and was not listed as a no-result, a stopped verifier's verdict was not counted, and a stopped critic's gaps were not used.
- A unit, verifier or critic with no result was recorded with its cause undetermined, and its log line did not say to re-run it as-is. Each stopped or no-result unit, verifier and critic was launched exactly once.
- A held id was never launched, and every critic was told it was held, as it was told every stopped and no-result id. A `held` argument that is not an array was refused.
- An input spec of a kind the skeleton does not know (including `raw`), a `cl` spec without `args.source`, and an `owner` spec without its unit, scope and a `STOP-<n>` answer were refused before any agent started.
- No gap unit ever ran, even when a critic ignored its instructions and proposed a stopped or held unit's scope. Every returned gap carried an id, a topic and a `covers_held` flag, and every returned verifier or critic id was the basename of the file that agent writes.

Adapt `scope()` to your kinds, add any preamble your environment requires to `HEAD`, and give verifiers a read-only agent type where your runtime offers one. The skeleton keeps only the generic method: its templates defer to the brief, and its refutation checks are generic. The evidence paths, the classification vocabulary, the domain's refutation checks and the method rules belong in your brief, not in the script.

The skeleton runs no gap unit. Every gap a critic returns goes to the owner batch, and a gap becomes a spec only in a later run, from a topic or an id the owner approved (the gap deriver below). A completeness critic sees a stopped or held unit's scope as uncovered and proposes it as a gap, and no rule in code can reliably tell such a gap from a new one. Only the owner can.

```javascript
// narrow-units.mjs: pointer-only units, adversarial verify, grouped critics; gaps go to the owner.
// Run one cluster per call; ids must be unique across parallel runs.
export const meta = {
  name: 'narrow-units',
  description: 'Run pointer-only unit specs: review, adversarial verify, grouped critics; gaps returned for the owner',
  phases: [
    { title: 'Review', detail: 'one agent per spec, report to file' },
    { title: 'Verify', detail: 'one skeptic per non-benign item' },
    { title: 'Critics', detail: 'grouped accuracy critics + one completeness critic; their gaps go to the owner' },
  ],
}

const A = (typeof args === 'string') ? JSON.parse(args) : (args || {})
const DIR = A.reportDir, BRIEF = A.brief, MECH = A.mech, SOURCE = A.source, TAG = A.tag || 'R'
// A held list that is not an array would otherwise hold nothing and launch every stopped id passed in specs.
if (A.held !== undefined && !Array.isArray(A.held)) throw new Error('args.held must be an array of ids')
const HELD = new Set(A.held || []) // ids the owner has not released (SKILL.md Step 8)
const INPUT = Array.isArray(A.specs) ? A.specs : []
const GROUP = A.criticGroup ?? 15
const KINDS = new Set(['cl', 'rows', 'file', 'issue', 'gap', 'owner'])
if (!INPUT.length || !DIR || !BRIEF || !MECH) throw new Error('args.specs, reportDir, brief and mech are required')
const unknown = INPUT.filter(s => !KINDS.has(s.kind))
if (unknown.length) throw new Error(`spec kinds not accepted: ${unknown.map(s => `${s.id}:${s.kind}`).join(', ')}`)
if (INPUT.some(s => s.kind === 'cl') && !SOURCE) throw new Error('cl specs need args.source, the file their line numbers refer to')
if (INPUT.some(s => s.kind === 'owner' && !(s.unit && s.scope && /^STOP-\d+$/.test(s.answer || ''))))
  throw new Error('an owner spec names its unit, its scope, and as answer the STOP-<n> of its Answered line')
const SPECS = INPUT.filter(s => !HELD.has(s.id))
const held = [...HELD]
if (held.length) log(`HELD for the owner, not launched: ${held.join(', ')}`)

const HEAD = `You are one narrow unit in a larger run.
FIRST read the shared brief in full and follow it exactly: ${BRIEF}
Stay inside your scope; if something outside it looks relevant, say so in one line and do not pursue it.
Do not create, edit or comment on issues, and do not commit. Structured fields are short paraphrased prose, never raw code.`
const STOP_LINE = 'If your work is stopped by a safety classifier, a policy hook or a reviewer, write "STOPPED: <source>" '
  + 'on its own line under OPEN, set stop to safety-classifier, policy-hook or reviewer, and end. Otherwise set stop to none.'
const STOP_FIELD = { type: 'string', enum: ['none', 'safety-classifier', 'policy-hook', 'reviewer'], description: 'none, or what stopped this work' }

const scope = (s) => {
  switch (s.kind) {
    case 'cl': return `lines ${s.lines.join(', ')} of ${SOURCE} (release ${s.release}). For each line, say in one line whether it touches anything in the brief's CLASSIFY list; examine the lines that do.`
    case 'rows': return `lines ${s.rows.join(', ')} of ${MECH}/${s.file} (group ${s.group}). Benign rows go in one compact table; full VERDICT blocks only for rows the brief says to classify.`
    case 'file': return `the file ${MECH}/${s.path}. Examine each entry it lists.`
    case 'issue': return `issue #${s.n} as frozen in ${MECH}/issue-${s.n}.json. Answer the brief's question for it, using the names the issue gives as search terms, with evidence.`
    case 'gap': return `the question with id ${s.g} in ${DIR}/${s.from}, approved by the owner. Answer it as asked.`
    case 'owner': return `owner-authorised re-scope of ${s.unit}: ${s.scope} (the owner's words, verbatim, from the Answered line ${s.answer})`
    default: throw new Error(`unknown spec kind ${s.kind}`)
  }
}

const DSCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['unit', 'report_path', 'items', 'non_benign', 'open', 'stop'],
  properties: {
    unit: { type: 'string' },
    report_path: { type: 'string' },
    items: { type: 'integer', description: 'how many items the report covers' },
    non_benign: { type: 'array', items: { type: 'string', maxLength: 600 },
      description: 'one line per non-benign item: id | claim | class | severity | source pointer' },
    open: { type: 'array', items: { type: 'string', maxLength: 300 } },
    stop: STOP_FIELD,
  },
}
const VSCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['unit', 'item', 'verdict', 'reasoning', 'report_path', 'stop'],
  properties: {
    unit: { type: 'string' },
    item: { type: 'string', maxLength: 600 },
    verdict: { type: 'string', enum: ['CONFIRMED', 'PARTLY', 'REFUTED'] },
    reasoning: { type: 'string', maxLength: 1200 },
    report_path: { type: 'string' },
    stop: STOP_FIELD,
  },
}
const XSCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['report_path', 'corrections', 'gaps', 'stop'],
  properties: {
    report_path: { type: 'string' },
    corrections: { type: 'array', items: { type: 'string', maxLength: 600 } },
    gaps: { type: 'array', items: {
      type: 'object', additionalProperties: false, required: ['title', 'question', 'priority', 'topic', 'covers_held'],
      properties: {
        title: { type: 'string', maxLength: 120 },
        topic: { type: 'string', maxLength: 60, description: 'one of the brief\'s CLASSIFY categories' },
        question: { type: 'string', maxLength: 1200 },
        priority: { type: 'integer', description: '1 = could change a verdict; 3 = cosmetic' },
        covers_held: { type: 'boolean', description: 'true if the question covers a pointer of an id on the HELD line' },
      } } },
    stop: STOP_FIELD,
  },
}

const runUnit = (s, ph) => agent(
  `${HEAD}\n\n=== YOUR UNIT: ${s.id} ===\nWrite your report to: ${DIR}/${s.id}.txt\nScope: ${scope(s)}\n${STOP_LINE}`,
  { label: s.id, phase: ph, schema: DSCHEMA })

const verify = (r, item, n, ph) => agent(
  `${HEAD}\n\n=== ADVERSARIAL VERIFY of ${r.unit}, item ${n} ===\nThe report ${r.report_path} claims:\n  ${item}\n`
  + 'Re-derive it independently from the same evidence and try to REFUTE it: the counter-example, the misread source, '
  + 'the overstated impact, and every refutation check the brief lists. A claim that survives is CONFIRMED.\n'
  + `Write your re-derivation to: ${DIR}/V-${r.unit}-${n}.txt\n${STOP_LINE}`,
  { label: `verify ${r.unit}#${n}`, phase: ph, schema: VSCHEMA })

// Any stop value but none is a stop, and so is a missing field: recorded, never verified, counted or re-run here.
const isStop = (x) => x.stop !== 'none'
const stopped = [], verifierStopped = [], verifierNoResult = []
const verifyAll = async (r, s, ph) => {
  if (!r) return null
  if (isStop(r)) { stopped.push(s.id); return null }
  r.unit = s.id
  const items = r.non_benign || []
  const raw = await parallel(items.map((item, i) => () => verify(r, item, i + 1, ph)))
  const verdicts = [] // assign first: never chain onto await parallel(...)
  raw.forEach((v, i) => {
    const id = `V-${s.id}-${i + 1}` // the basename of the file this verifier writes, as the unit log records it
    if (!v) verifierNoResult.push(id)
    else if (isStop(v)) verifierStopped.push(id)
    else verdicts.push(v)
  })
  return { summary: r, verdicts }
}

phase('Review')
const round1 = await pipeline(SPECS, s => runUnit(s, 'Review'), (r, s) => verifyAll(r, s, 'Verify'))
const done = round1.filter(Boolean)
const noResult = SPECS.filter((s, i) => !round1[i] && !stopped.includes(s.id)).map(s => s.id)
const UNDETERMINED = 'cause undetermined: read the transcript by structure before any re-run; re-run once, unchanged and alone, only for a '
  + 'transient failure (overload or 5xx, rate limit, network timeout) and nothing else; anything else goes to the owner batch'
const NOT_RERUN = 'do not re-run; its unit and cluster are re-launched only if the owner names them'
if (noResult.length) log(`NO RESULT, ${UNDETERMINED}: ${noResult.join(', ')}`)
if (verifierNoResult.length) log(`NO RESULT from verifier, cause undetermined; its claim stays unverified, ${NOT_RERUN}: ${verifierNoResult.join(', ')}`)
if (stopped.length) log(`STOPPED, record by id and route to the owner, do not re-run: ${stopped.join(', ')}`)
if (verifierStopped.length) log(`STOPPED verifier, record by id; its verdict is not counted, ${NOT_RERUN}: ${verifierStopped.join(', ')}`)

const digest = (rows) => rows.map(x => `## ${x.summary.unit} ${x.summary.report_path}\n`
  + x.summary.non_benign.map(t => `  NB ${t.slice(0, 200)}`).join('\n')
  + x.verdicts.map(v => `\n  V ${v.verdict}: ${v.item.slice(0, 160)} (${v.report_path})`).join('')).join('\n')

phase('Critics')
const groups = []
for (let i = 0; i < done.length; i += GROUP) groups.push(done.slice(i, i + GROUP))
// Display labels for the progress view; the returned ids are the basenames of the files the critics write.
const criticLabels = groups.map((g, gi) => `critic ${TAG}-${gi + 1}`).concat(`completeness ${TAG}`)
const criticIds = groups.map((g, gi) => `X-accuracy-${TAG}-${gi + 1}`).concat(`X-completeness-${TAG}`)
const HELD_LINE = 'HELD for the owner (stopped, no result or held; set covers_held on any gap whose question covers their pointers):\n'
  + `${[...new Set([...stopped, ...noResult, ...held])].join(', ') || 'none'}`
const GAP_RULE = 'Give each gap a topic from the brief\'s CLASSIFY categories and a covers_held flag. No gap runs in this run; every gap goes to the owner.'
const accuracy = groups.map((g, gi) => () => agent(
  `${HEAD}\n\n=== ACCURACY CRITIC ${TAG}-${gi + 1} over ${g.length} reports ===\nRead EVERY report and verifier file below, `
  + 'benign units included. List each claim that does not hold, with the correction and how to reproduce it, and each pair '
  + `of units that contradict each other. ${GAP_RULE} `
  + `Write to ${DIR}/${criticIds[gi]}.txt\n${STOP_LINE}\n\n${HELD_LINE}\n\n${digest(g)}`,
  { label: criticLabels[gi], phase: 'Critics', schema: XSCHEMA }))
const completeness = () => agent(
  `${HEAD}\n\n=== COMPLETENESS CRITIC ${TAG} ===\nRead the spec list, the digest and the mechanical inputs in ${MECH}. `
  + 'What inside this run\'s scope did no unit cover, or cover only by assertion? Return each gap as a self-contained '
  + `question a fresh unit could answer, priority 1 to 3. ${GAP_RULE} `
  + `Write to ${DIR}/${criticIds[criticIds.length - 1]}.txt\n${STOP_LINE}\n\n${HELD_LINE}\n\n`
  + `SPECS:\n${SPECS.map(s => `- ${s.id} ${s.kind}`).join('\n')}\n\nDIGEST:\n${digest(done)}`,
  { label: criticLabels[criticLabels.length - 1], phase: 'Critics', schema: XSCHEMA })
const critRaw = await parallel([...accuracy, completeness])
const criticNoResult = criticIds.filter((id, i) => !critRaw[i])
const criticStopped = criticIds.filter((id, i) => critRaw[i] && isStop(critRaw[i]))
const critics = critRaw.filter(c => c && !isStop(c))
if (criticNoResult.length) log(`NO RESULT from critic, cause undetermined; its group stays unchecked, ${NOT_RERUN}: ${criticNoResult.join(', ')}`)
if (criticStopped.length) log(`STOPPED critic, record by id; its gaps and corrections are not used, ${NOT_RERUN}: ${criticStopped.join(', ')}`)

const seen = new Set() // several critics often report the same gap: keep its highest-priority copy
const gaps = critics.flatMap(c => c.gaps || []).sort((a, b) => a.priority - b.priority)
  .filter(g => { const k = g.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
  .map((g, i) => ({ ...g, id: `G-${TAG}-${i + 1}` }))
const byTopic = gaps.reduce((m, g) => ({ ...m, [g.topic]: (m[g.topic] || 0) + 1 }), {})
if (gaps.length) log(`${gaps.length} gap(s) for the owner batch, by topic: ${Object.entries(byTopic).map(([k, n]) => `${k} ${n}`).join(', ')}; none runs in this run`)

return {
  tag: TAG, stopped, no_result: noResult, held,
  verifier_stopped: verifierStopped, verifier_no_result: verifierNoResult,
  critic_stopped: criticStopped, critic_no_result: criticNoResult,
  gaps_for_owner: gaps,
  units: done.map(x => ({ unit: x.summary.unit, report: x.summary.report_path,
    non_benign: x.summary.non_benign, open: x.summary.open,
    verdicts: x.verdicts.map(v => ({ verdict: v.verdict, item: v.item, report: v.report_path })) })),
  critics: critics.map(c => ({ report: c.report_path, corrections: c.corrections })),
}
```

Validate it before every run:

```bash
{ echo '(async()=>{'; sed 's/^[[:space:]]*export const meta/const meta/' narrow-units.mjs; echo '})()'; } | node --check -
```

## Derivers for the other spec kinds

Each one reads a frozen input, under `mechanical/` or recorded in `WORK-SHA256SUMS` (SKILL.md Step 2), and writes specs that carry only pointers. Ids are reduced to `[A-Za-z0-9._-]` where they are derived, because the Step 10 ledger reads them back from the unit log with that class; the Step 2 id check catches a collision.

Inventory rows chunked by group (a TSV with a header line, the group in column 2; `rows` are file line numbers):

```bash
awk -F'\t' 'NR > 1 { print NR "\t" $2 }' "$MECH/inventory.tsv" | jq -R -s -c --argjson n 6 '
  split("\n") | map(select(length > 0) | split("\t") | {row: (.[0] | tonumber), group: .[1]})
  | group_by(.group)
  | map(. as $g | [range(0; length; $n)]
        | map({kind: "rows", id: "RW-\($g[0].group | gsub("[^A-Za-z0-9._-]"; "_"))-\(. / $n + 1)",
               file: "inventory.tsv", group: $g[0].group, rows: ($g[.:(. + $n)] | map(.row))}))
  | flatten' > "$RUN_DIR/specs/rows.json"
echo "rows=$(($(wc -l < "$MECH/inventory.tsv") - 1)) covered=$(jq '[.[].rows[]] | length' "$RUN_DIR/specs/rows.json")"   # unequal: a row the deriver skipped
```

One spec per file in a directory of per-item files (here `$MECH/items`):

```bash
ls "$MECH/items" | jq -R -s -c 'split("\n") | map(select(endswith(".md")))
  | map({kind: "file", id: "IT-\(rtrimstr(".md") | gsub("[^A-Za-z0-9._-]"; "_"))", path: "items/\(.)"})' > "$RUN_DIR/specs/files.json"
echo "items=$(ls "$MECH/items" | wc -l) specs=$(jq length "$RUN_DIR/specs/files.json")"   # unequal: a file the deriver skipped
```

Gap specs come only from a gaps file recorded in `WORK-SHA256SUMS` when it was written (Launch sequence), so the question a unit reads is the one the owner approved. The owner's decisions are transcribed from the batch into `owner/`: the topics approved, the single gap ids approved, and the ids the batch marked as covering a stopped or held unit's pointers. A marked id is never derived, whatever its topic, and an approved id that is marked or unknown is refused. A gap a critic flagged with `covers_held` is never derived through its topic, only by its own id. The deriver refuses rather than writing a partial list, and it records its output in the work list:

```bash
cd "${RUN_DIR:?}" || exit 1
TAG=R1                                    # the run whose gaps the owner answered
GAPS="gaps/$TAG.json"                     # its gaps_for_owner, recorded in WORK-SHA256SUMS when it was written
TOPICS="owner/$TAG-approved-topics.txt"   # topics the owner approved, one per line (may be empty)
IDS="owner/$TAG-approved-gaps.txt"        # single gap ids the owner approved, one per line (may be empty)
MARKED="owner/$TAG-marked-gaps.txt"       # ids the batch marked as covering stopped or held pointers (may be empty)
OUT="specs/gaps-$TAG.json"
for f in "$GAPS" "$TOPICS" "$IDS" "$MARKED"; do [ -f "$f" ] || { echo "REFUSED: no $f"; exit 2; }; done
[ ! -e "$OUT" ] || { echo "REFUSED: $OUT exists; derive a later approval into a new name"; exit 2; }
sha256sum -c --quiet WORK-SHA256SUMS && awk -v f="$GAPS" '$2 == f {found = 1} END {exit !found}' WORK-SHA256SUMS ||
  { echo "REFUSED: $GAPS was never recorded, or the work list changed after it was"; exit 1; }
LISTS='def lines: split("\n") | map(select(length > 0));
  ($topics | lines) as $t | ($ids | lines) as $i | ($marked | lines) as $m | . as $g'
bad=$(jq -r --rawfile topics "$TOPICS" --rawfile ids "$IDS" --rawfile marked "$MARKED" "$LISTS"'
  | ($t[] | select(. as $x | $g | all(.topic != $x)) | "unknown topic \(.)"),
    ($i[] | select(. as $x | $g | all(.id != $x)) | "unknown id \(.)"),
    ($i[] | select(. as $x | $m | index($x)) | "marked id \(.)")' "$GAPS") || exit 2
[ -z "$bad" ] || { printf '%s\n' "$bad" | sed 's/^/REFUSED: /'; exit 1; }
jq -c --rawfile topics "$TOPICS" --rawfile ids "$IDS" --rawfile marked "$MARKED" --arg from "$GAPS" "$LISTS"'
  | map(select((.id as $x | $m | index($x)) | not)
        | select(((.topic as $x | $t | index($x)) and (.covers_held | not)) or (.id as $x | $i | index($x))))
  | map({kind: "gap", id: .id, g: .id, from: $from})' "$GAPS" > "$OUT" || exit 2
echo "gaps=$(jq length "$GAPS") derived=$(jq length "$OUT") flagged_in_approved_topics=$(jq --rawfile topics "$TOPICS" --rawfile ids "$IDS" '[.[] | select(.covers_held and (.topic as $x | $topics | split("\n") | index($x)) and ((.id as $x | $ids | split("\n") | index($x)) | not))] | length' "$GAPS")"
sha256sum "$OUT" >> WORK-SHA256SUMS
```

`flagged_in_approved_topics` counts the flagged gaps an approved topic did not derive; each is already listed apart in the batch (B4) for a decision by id.

An owner spec re-scopes a stopped unit in the owner's words. Write it by hand from the batch to a new file `specs/owner-<n>.json`, with `answer` set to the `STOP-<n>` of the Answered line it comes from. The check refuses unless each scope is quoted verbatim on that Answered line, under the unit it names, in the section headed exactly `## Answered`. It exits 1 and names each refused id, says how many owner specs it checked, and records the file in the work list only when nothing is refused. The check shows that the spec matches an Answered line, not that the line holds the owner's words, so the Answered line cites where the words came from:

```bash
cd "${RUN_DIR:?}" || exit 1
OWNER_SPECS="specs/owner-1.json"   # one new file per batch of answers
[ -f "$OWNER_SPECS" ] || { echo "REFUSED: no $OWNER_SPECS"; exit 2; }
awk -v f="$OWNER_SPECS" '$2 == f {found = 1} END {exit !found}' WORK-SHA256SUMS && { echo "REFUSED: $OWNER_SPECS was already recorded"; exit 2; }
sha256sum -c --quiet WORK-SHA256SUMS || { echo 'REFUSED: the work list changed after it was recorded'; exit 1; }
owner_specs=$(jq -r 'if all(.[]; .kind == "owner") then .[] | [.id, .unit, .scope, .answer] | @tsv
  else error("a spec in this file is not an owner spec") end' "$OWNER_SPECS") || { echo "REFUSED: $OWNER_SPECS"; exit 2; }
refused=$(printf '%s\n' "$owner_specs" | while IFS="$(printf '\t')" read -r id unit scope answer; do
  [ -n "$id" ] || continue
  NEEDLE="- $answer, unit $unit: \"$scope\" (" awk '/^## /{answered = ($0 == "## Answered")}
    answered && index($0, ENVIRON["NEEDLE"]) == 1 {found = 1} END {exit !found}' OWNER-QUESTIONS.md || echo "REFUSED $id"
done)
echo "owner specs checked: $(printf '%s\n' "$owner_specs" | rg -c . || echo 0)"
[ -z "$refused" ] || { printf '%s\n' "$refused"; exit 1; }
sha256sum "$OWNER_SPECS" >> WORK-SHA256SUMS
```

## Brief skeleton

```text
FRAME. You are one unit of a <review|audit|migration> run for <owner>. The run decides <the question>; its purpose
is <what the run assembles, and for whom>. Produce <what>; never produce <what not>. Your scope
is the pointers in your unit; stay inside them.

EVIDENCE. Everything below is already computed; read what your unit needs and do not redo it.
  mechanical/<source>         <what it holds>; line numbers in units refer to it
  mechanical/issue-<n>.json   each issue as frozen in Step 1
  mechanical/inventory.tsv    one row per <item>, column 2 is the group
  mechanical/items/<id>.md    one file per <item under review>
  Known artifacts: <the ways these files mislead, one line each>

TOOLS. Read-only. <the commands, how to count occurrences, output bounds>. Never execute <X>.
  Stop notices: <the exact text your runtime writes when it stops or interrupts a subagent>.

METHOD RULES (each names the past mistake it prevents):
  1. A source's own summary is a claim, not evidence: check it against the primary artifact.
  2. <rule> (prevents: <mistake>)
  ...

CLASSIFY. category in {...}; <any further field your domain needs> in {...};
severity in {...} with the rule for each.

OUTPUT. Write your report to the path in your unit (plain .txt), in several short writes. Each
section starts a line with its name in capitals and a colon:
  VERDICT: per item
  EVIDENCE: short quoted windows and the command that reproduces each
  OPEN: what you could not settle and the exact next check
Return the structured summary. Every structured field is paraphrased prose, never raw code.
If your work is stopped by a safety classifier, a policy hook or a reviewer, write
"STOPPED: <source>" on its own line under OPEN, set the summary's stop field to
safety-classifier, policy-hook or reviewer, and end. Otherwise set stop to none. Say what you
could not determine.
```

## Owner batch skeleton

```markdown
# <run> owner batch (<date>)

Collected for one answering pass. Each question cites its evidence. A read-only faithfulness
check ran before presentation; its corrections are folded into the question text, except a
gap's question, which a later unit reads as recorded: a gap the check finds wrong is listed
with the correction and recommended for hold.

## Answered

- STOP-1, unit <id>: "<the owner's words, verbatim, on one line>" (<where the words came from>, <date>)
- NORESULT, unit <id>: "<the owner's words>" (<where the words came from>, <date>)
- RERUN-1, run <tag>: "<the owner's words, naming the units>" (<where the words came from>, <date>)

## Open

- **B1. STOP-2, unit <id>.** <one line: what was stopped, at which stage, what is on disk>.
  Evidence: UNIT-LOG.txt line <n>.
  Options: (a) you name a different scope for this unit, (b) you do the work, (c) hold.
  Recommendation: (c).
- **B2. NORESULT, unit <id>.** No result, and its transcript shows no transient failure.
  Evidence: UNIT-LOG.txt line <n>, <transcript path>, partials/<id>.txt if it wrote one.
  Options: (a) release it: re-run it once, unchanged, (b) treat it as a stop, (c) hold.
  Recommendation: (c).
- **B3. Gaps from run <tag>, topic <topic> (<n> gaps).** Each question in full, with its id, from
  gaps/<tag>.json. Options: (a) approve the topic, (b) approve only ids <...>, (c) hold.
  Recommendation: (c) until B1 and B2 are answered. Depends on: B1, B2. One such entry per topic.
- **B4. Gaps from run <tag> over stopped or held scope.** Each question in full: the ids the batch
  marked (owner/<tag>-marked-gaps.txt) and the ids a critic flagged with covers_held. None is
  approved through its topic. A marked gap belongs only to its unit's stop entry, option (a).
  Options for a flagged gap the batch did not mark, with the reason it was not marked:
  (a) approve it by its id, (b) hold. Recommendation: (b).
- **B5. Re-run of run <tag>.** <why: the brief changed, or a defect>. The run recorded <the stops and
  missing results>; re-launching its units launches their verifiers and critics again. Its reports
  were written under the old brief. Options: (a) re-run the units you name, (b) keep the reports,
  marked as written under the old brief, (c) hold. Recommendation: (c).
```

## Launch sequence

Pilot first, read its reports, then one run per remaining cluster, started together. Before each launch after the pilot, derive the held list from the unit log: every stopped id, and every no-result or held id without a `RELEASED` line. Take the held ids out of the cluster's spec list, and pass the list as `held`; the spec files keep the ids for Step 10. An id left out of the spec list cannot run even if `held` is forgotten, and the skeleton refuses a `held` that is not an array.

```bash
cd "${RUN_DIR:?}" || exit 1
[ -f UNIT-LOG.txt ] || { echo 'REFUSED: no UNIT-LOG.txt (Step 1 creates it)'; exit 2; }
released=$(rg -o '^\S+ RELEASED unit=([A-Za-z0-9._-]+)' -r '$1' UNIT-LOG.txt | sort -u)
HELD=$( { rg -o '^\S+ STOP-[0-9]+ unit=([A-Za-z0-9._-]+)' -r '$1' UNIT-LOG.txt
          rg -o '^\S+ (NORESULT|HELD) unit=([A-Za-z0-9._-]+)' -r '$2' UNIT-LOG.txt | sort -u | comm -23 - <(printf '%s\n' "$released"); } |
        rg -v '^(V-|X-)' | sort -u | jq -R -s -c 'split("\n") | map(select(length > 0))')
echo "held=$HELD"
CLUSTER="specs/rows.json"   # the cluster about to launch
jq -c --argjson held "$HELD" 'map(select(.id as $x | $held | index($x) | not))' "$CLUSTER"   # pass as specs, with HELD as held
```

```javascript
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R1', specs: R1, reportDir: DIR, brief: BRIEF, mech: MECH, source: SOURCE } })
// After the pilot reports pass the Step 7 checks. A pilot re-run (tag R1b) only if R1 returned all six
// stop and no-result lists empty; otherwise it goes to the owner batch (B5), and only the units the owner names run again.
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R2', specs: R2_UNHELD, reportDir: DIR, brief: BRIEF, mech: MECH, source: SOURCE, held: HELD } })
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R3', specs: R3_UNHELD, reportDir: DIR, brief: BRIEF, mech: MECH, source: SOURCE, held: HELD } })
```

Each run returns `stopped`, `no_result`, `held`, `verifier_stopped`, `verifier_no_result`, `critic_stopped`, `critic_no_result` and `gaps_for_owner`. Before reading any report, write to the unit log:

- one Step 8 `STOP-<n> unit=<id>` line per `stopped` id;
- one `NORESULT unit=<id>` line per `no_result` id, with its partial moved (Step 8);
- one `HELD unit=<id>` line per `held` id.

Verifier and critic stops and no-results are logged the same way, under the ids the run returns. Those ids are the basenames of the files the agents write (`V-<id>-<n>`, `X-accuracy-<tag>-<n>`, `X-completeness-<tag>`), and the ledger and the held list leave them out. Step 10 counts spec units only, so these go into the coverage statement and the owner batch, and the claim behind a stopped or missing verdict counts as unverified.

Write `gaps_for_owner` to `gaps/<tag>.json` and record it before the batch is built, so the questions the owner approves are the ones a later unit reads:

```bash
cd "${RUN_DIR:?}" || exit 1
TAG=R1   # after writing the run's gaps_for_owner to gaps/$TAG.json
awk -v f="gaps/$TAG.json" '$2 == f {found = 1} END {exit !found}' WORK-SHA256SUMS && { echo "REFUSED: gaps/$TAG.json was already recorded"; exit 2; }
sha256sum -c --quiet WORK-SHA256SUMS || { echo 'REFUSED: the work list changed after it was recorded'; exit 1; }
jq -e 'type == "array" and all(.[]; (.id | test("^G-[A-Za-z0-9._-]+$")) and (.topic | type == "string") and (.covers_held | type == "boolean"))' \
  "gaps/$TAG.json" > /dev/null || { echo "REFUSED: gaps/$TAG.json is not a gaps_for_owner list"; exit 1; }
sha256sum "gaps/$TAG.json" >> WORK-SHA256SUMS
```

The gaps go to the owner batch by topic (B3). Any gap the batch marks, or a critic flags with `covers_held`, is listed apart (B4).
