# Examples: Decompose Into Pointer Units

Extended material for [SKILL.md](../SKILL.md): a complete Workflow skeleton, derivers for the other spec kinds, a brief skeleton, an owner batch skeleton and the launch sequence.

## Workflow skeleton

Tested in the Workflow dialect (`node --check` on the wrapped body) and against mocked `agent` / `pipeline` / `parallel` primitives. In the mock, a stop reported in a unit's `stop` field (safety classifier, policy hook or reviewer) was recorded and got no verifier, a unit without a `stop` field counted as stopped, a clean report saying it was "never stopped" did not, a unit with no result was reported with its cause undetermined and not marked for re-run, the gap round was held while any unit was stopped or had no result, a gap unit with no result was reported, a held id was never launched, and a `raw` input spec or a `cl` spec without `args.source` was refused before any agent started. Adapt `scope()` to your kinds, add any preamble your environment requires to `HEAD`, and give verifiers a read-only agent type where your runtime offers one. The skeleton carries no domain detail: the evidence paths, the classification vocabulary, the refutation checks and the method rules belong in your brief, not in the script.

Holding the gap round on a unit with no result, not only on a stop, is a deliberate fail-closed choice: a missing result can hide a stop, and the completeness critic would propose that unit's scope as a gap. One transient error therefore holds a cluster's gap round until the owner answers.

```javascript
// narrow-units.mjs: pointer-only units, adversarial verify, grouped critics, capped gap round.
// Run one cluster per call; ids must be unique across parallel runs.
export const meta = {
  name: 'narrow-units',
  description: 'Run pointer-only unit specs: review, adversarial verify, grouped critics, capped gap round',
  phases: [
    { title: 'Review', detail: 'one agent per spec, report to file' },
    { title: 'Verify', detail: 'one skeptic per non-benign item' },
    { title: 'Critics', detail: 'grouped accuracy critics + one completeness critic' },
    { title: 'Gaps', detail: 'top critic gaps become units; held while any unit is stopped or has no result' },
  ],
}

const A = (typeof args === 'string') ? JSON.parse(args) : (args || {})
const DIR = A.reportDir, BRIEF = A.brief, MECH = A.mech, SOURCE = A.source, TAG = A.tag || 'R'
const HELD = new Set(Array.isArray(A.held) ? A.held : []) // ids the owner has not released (SKILL.md Step 8)
const INPUT = Array.isArray(A.specs) ? A.specs : []
const GROUP = A.criticGroup ?? 15, MAX_GAPS = A.maxGapUnits ?? 6
if (!INPUT.length || !DIR || !BRIEF || !MECH) throw new Error('args.specs, reportDir, brief and mech are required')
if (INPUT.some(s => s.kind === 'raw')) throw new Error('an input spec of kind raw is lead prose; raw specs come only from this run\'s critics')
if (INPUT.some(s => s.kind === 'cl') && !SOURCE) throw new Error('cl specs need args.source, the file their line numbers refer to')
const SPECS = INPUT.filter(s => !HELD.has(s.id))
const held = INPUT.filter(s => HELD.has(s.id)).map(s => s.id)
if (held.length) log(`HELD for the owner, not launched: ${held.join(', ')}`)

const HEAD = `You are one narrow unit in a larger review run.
FIRST read the shared brief in full and follow it exactly: ${BRIEF}
Stay inside your scope; if something outside it looks relevant, say so in one line and do not pursue it.
Do not create, edit or comment on issues, and do not commit. Structured fields are short paraphrased prose, never raw code.`

const scope = (s) => {
  switch (s.kind) {
    case 'cl': return `lines ${s.lines.join(', ')} of ${SOURCE} (release ${s.release}). For each line, say in one line whether it touches anything in the brief's CLASSIFY list; examine the lines that do.`
    case 'rows': return `lines ${s.rows.join(', ')} of ${MECH}/${s.file} (group ${s.group}). Benign rows go in one compact table; full VERDICT blocks only for rows the brief says to classify.`
    case 'file': return `the file ${MECH}/${s.path}. Examine each entry it lists.`
    case 'issue': return `issue #${s.n}. Answer the brief's question for it, using the names the issue gives as search terms, with evidence.`
    case 'gap': return `gap ${s.g}: item ${s.g} of ${s.from}, approved by the owner. Answer it as asked.`
    case 'raw': return s.question // written by a critic in this run, never by the lead
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
    stop: { type: 'string', enum: ['none', 'safety-classifier', 'policy-hook', 'reviewer'],
      description: 'none, or what stopped this unit' },
  },
}
const VSCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['unit', 'item', 'verdict', 'reasoning', 'report_path'],
  properties: {
    unit: { type: 'string' },
    item: { type: 'string', maxLength: 600 },
    verdict: { type: 'string', enum: ['CONFIRMED', 'PARTLY', 'REFUTED'] },
    reasoning: { type: 'string', maxLength: 1200 },
    report_path: { type: 'string' },
  },
}
const XSCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['report_path', 'corrections', 'gaps'],
  properties: {
    report_path: { type: 'string' },
    corrections: { type: 'array', items: { type: 'string', maxLength: 600 } },
    gaps: { type: 'array', items: {
      type: 'object', additionalProperties: false, required: ['title', 'question', 'priority'],
      properties: {
        title: { type: 'string', maxLength: 120 },
        question: { type: 'string', maxLength: 1200 },
        priority: { type: 'integer', description: '1 = could change a verdict; 3 = cosmetic' },
      } } },
  },
}

const STOP_LINE = 'If your work is stopped by a safety classifier, a policy hook or a reviewer, write "STOPPED: <source>" '
  + 'on its own line under OPEN, set stop to that source, and end. Otherwise set stop to none.'
const runUnit = (s, ph) => agent(
  `${HEAD}\n\n=== YOUR UNIT: ${s.id} ===\nWrite your report to: ${DIR}/${s.id}.txt\nScope: ${scope(s)}\n${STOP_LINE}`,
  { label: s.id, phase: ph, schema: DSCHEMA })

const verify = (r, item, n, ph) => agent(
  `${HEAD}\n\n=== ADVERSARIAL VERIFY of ${r.unit}, item ${n} ===\nThe report ${r.report_path} claims:\n  ${item}\n`
  + 'Re-derive it independently from the same evidence and try to REFUTE it: the counter-example, the misread source, '
  + 'the overstated impact, and every refutation check the brief lists. A claim that survives is CONFIRMED.\n'
  + `Write your re-derivation to: ${DIR}/V-${r.unit}-${n}.txt`,
  { label: `verify ${r.unit}#${n}`, phase: ph, schema: VSCHEMA })

const stopped = []
const verifyAll = async (r, s, ph) => {
  if (!r) return null
  // Any value but none is a stop, and so is a missing field: recorded, never verified or re-run here.
  if (r.stop !== 'none') { stopped.push(s.id); return null }
  r.unit = s.id
  const items = r.non_benign || []
  const raw = await parallel(items.map((item, i) => () => verify(r, item, i + 1, ph)))
  const verdicts = raw.filter(Boolean) // assign first: never chain onto await parallel(...)
  if (verdicts.length < items.length) log(`WARNING ${s.id}: ${items.length - verdicts.length} verifier(s) returned no result; not confirmations, apply the no-result rule`)
  return { summary: r, verdicts }
}

phase('Review')
const round1 = await pipeline(SPECS, s => runUnit(s, 'Review'), (r, s) => verifyAll(r, s, 'Verify'))
const done = round1.filter(Boolean)
const noResult = SPECS.filter((s, i) => !round1[i] && !stopped.includes(s.id)).map(s => s.id)
if (noResult.length) log(`NO RESULT, cause undetermined: read each transcript or error before any re-run; re-run once, unchanged, only for an API error or timeout; a stop or an unknown cause goes to the owner batch: ${noResult.join(', ')}`)
if (stopped.length) log(`STOPPED, record by id and route to the owner, do not re-run: ${stopped.join(', ')}`)
const holdGaps = stopped.length + noResult.length > 0

const digest = (rows) => rows.map(x => `## ${x.summary.unit} ${x.summary.report_path}\n`
  + x.summary.non_benign.map(t => `  NB ${t.slice(0, 200)}`).join('\n')
  + x.verdicts.map(v => `\n  V ${v.verdict}: ${v.item.slice(0, 160)} (${v.report_path})`).join('')).join('\n')

phase('Critics')
const groups = []
for (let i = 0; i < done.length; i += GROUP) groups.push(done.slice(i, i + GROUP))
const accuracy = groups.map((g, gi) => () => agent(
  `${HEAD}\n\n=== ACCURACY CRITIC ${TAG}-${gi + 1} over ${g.length} reports ===\nRead EVERY report and verifier file below, `
  + 'benign units included. List each claim that does not hold, with the correction and how to reproduce it, and each pair '
  + `of units that contradict each other. Write to ${DIR}/X-accuracy-${TAG}-${gi + 1}.txt\n\n${digest(g)}`,
  { label: `critic ${TAG}-${gi + 1}`, phase: 'Critics', schema: XSCHEMA }))
const completeness = () => agent(
  `${HEAD}\n\n=== COMPLETENESS CRITIC ${TAG} ===\nRead the spec list, the digest and the mechanical inputs in ${MECH}. `
  + 'What inside this run\'s scope did no unit cover, or cover only by assertion? Return each gap as a self-contained '
  + `question a fresh unit could answer, priority 1 to 3. Write to ${DIR}/X-completeness-${TAG}.txt\n\n`
  + `HELD for the owner (stopped, no result or held; propose no gap over their pointers):\n${[...stopped, ...noResult, ...held].join(', ') || 'none'}\n\n`
  + `SPECS:\n${SPECS.map(s => `- ${s.id} ${s.kind}`).join('\n')}\n\nDIGEST:\n${digest(done)}`,
  { label: `completeness ${TAG}`, phase: 'Critics', schema: XSCHEMA })
const critRaw = await parallel([...accuracy, completeness])
const critics = critRaw.filter(Boolean)
if (critics.length < critRaw.length) log(`WARNING: ${critRaw.length - critics.length} critic(s) returned no result`)

const seen = new Set() // several critics often report the same gap: keep its highest-priority copy
const gaps = critics.flatMap(c => c.gaps || []).sort((a, b) => a.priority - b.priority)
  .filter(g => { const k = g.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
let gapSpecs = []
if (holdGaps) log(`Gap round HELD for the owner batch: ${stopped.length} stopped, ${noResult.length} without a result; ${gaps.length} gap(s) returned, not run`)
else {
  if (gaps.length > MAX_GAPS) log(`Gap round capped at ${MAX_GAPS}; NOT run: ${gaps.slice(MAX_GAPS).map(g => `[p${g.priority}] ${g.title}`).join('; ')}`)
  gapSpecs = gaps.slice(0, MAX_GAPS).map((g, i) => ({ kind: 'raw', id: `G-${TAG}-${i + 1}`, question: g.question }))
}
let round2 = [], gapNoResult = []
if (gapSpecs.length) {
  phase('Gaps')
  const raw2 = await pipeline(gapSpecs, s => runUnit(s, 'Gaps'), (r, s) => verifyAll(r, s, 'Gaps'))
  round2 = raw2.filter(Boolean)
  gapNoResult = gapSpecs.filter((s, i) => !raw2[i] && !stopped.includes(s.id)).map(s => s.id)
  if (gapNoResult.length) log(`NO RESULT in the gap round, cause undetermined (same rule): ${gapNoResult.join(', ')}`)
}

return {
  tag: TAG, stopped, no_result: noResult, held,
  gaps_not_run: holdGaps ? gaps : gaps.slice(MAX_GAPS), gap_specs: gapSpecs, gap_no_result: gapNoResult,
  units: [...done, ...round2].map(x => ({ unit: x.summary.unit, report: x.summary.report_path,
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

Each one reads a frozen mechanical input and writes specs that carry only pointers. Ids are reduced to `[A-Za-z0-9._-]` where they are derived, because the Step 10 ledger reads them back from the unit log with that class; the Step 2 id check catches a collision.

Inventory rows chunked by group (a TSV with a header line, the group in column 2; `rows` are file line numbers):

```bash
awk -F'\t' 'NR > 1 { print NR "\t" $2 }' "$MECH/inventory.tsv" | jq -R -s -c --argjson n 6 '
  split("\n") | map(select(length > 0) | split("\t") | {row: (.[0] | tonumber), group: .[1]})
  | group_by(.group)
  | map(. as $g | [range(0; length; $n)]
        | map({kind: "rows", id: "RW-\($g[0].group | gsub("[^A-Za-z0-9._-]"; "_"))-\(. / $n + 1)",
               file: "inventory.tsv", group: $g[0].group, rows: ($g[.:(. + $n)] | map(.row))}))
  | flatten' > "$RUN_DIR/specs/rows.json"
```

One spec per file in a directory of per-item files (here `$MECH/items`):

```bash
ls "$MECH/items" | jq -R -s -c 'split("\n") | map(select(endswith(".md")))
  | map({kind: "file", id: "IT-\(rtrimstr(".md") | gsub("[^A-Za-z0-9._-]"; "_"))", path: "items/\(.)"})' > "$RUN_DIR/specs/files.json"
```

Gap ids from an earlier completeness critic file whose items start with `G<n>.`, limited to the ids the owner approved in the batch. A completeness critic proposes a stopped unit's scope as a gap, so no gap becomes a spec without that approval:

```bash
PRIOR_GAPS="/abs/path/reports/run-000/X-completeness-R1.txt"
APPROVED="$RUN_DIR/approved-gaps.txt"   # gap ids the owner approved, one per line
rg -o '^(G[0-9]+)\.' -r '$1' "$PRIOR_GAPS" | sort -u > "$RUN_DIR/prior-gap-ids.txt"
sort -u "$APPROVED" | comm -12 "$RUN_DIR/prior-gap-ids.txt" - | jq -R -s -c --arg from "$PRIOR_GAPS" \
  'split("\n") | map(select(length > 0)) | map({kind: "gap", id: ., g: ., from: $from})' > "$RUN_DIR/specs/gaps.json"
```

## Brief skeleton

```text
FRAME. You are one unit of a review run for <owner>. The run decides <the question>; its purpose
is <what the run assembles, and for whom>. Produce <what>; never produce <what not>. Your scope
is the pointers in your unit; stay inside them.

EVIDENCE. Everything below is already computed; read what your unit needs and do not redo it.
  mechanical/<source>         <what it holds>; line numbers in units refer to it
  mechanical/inventory.tsv    one row per <item>, column 2 is the group
  mechanical/items/<id>.md    one file per <item under review>
  Known artifacts: <the ways these files mislead, one line each>

TOOLS. Read-only. <the commands, how to count occurrences, output bounds>. Never execute <X>.

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
"STOPPED: <source>" on its own line under OPEN, set the summary's stop field to that source,
and end. Otherwise set stop to none. Say what you could not determine.
```

## Owner batch skeleton

```markdown
# <run> owner batch (<date>)

Collected for one answering pass. Each question cites its evidence. A read-only faithfulness
check ran before presentation; its corrections are folded into the question text.

## Answered

- STOP-1: <answer, date, the units it names>

## Open

- **B1. STOP-2, unit <id>.** <one line: what was stopped, at which stage, what is on disk>.
  Evidence: UNIT-LOG.txt line <n>.
  Options: (a) you name a different scope for this unit, (b) you do the work, (c) hold.
  Recommendation: (c).
- **B2. NORESULT, unit <id>.** No result, and its transcript shows no API error or timeout.
  Evidence: UNIT-LOG.txt line <n>, <transcript path>.
  Options: (a) re-run it once, unchanged, (b) treat it as a stop, (c) hold. Recommendation: (c).
- **B3. Gap round <tag> held.** <n> gaps returned while B1 and B2 were open.
  Evidence: X-completeness-<tag>.txt. Options: (a) approve gap ids <...>, (b) hold.
  Depends on: B1, B2.
```

## Launch sequence

Pilot first, read its reports, then one run per remaining cluster, started together. `HELD` is the list of ids the owner has not released: every stopped id, every id with no result, and every spec whose pointers overlap a stopped unit's.

```javascript
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R1', specs: R1, reportDir: DIR, brief: BRIEF, mech: MECH, source: SOURCE } })
// after the pilot reports pass the Step 7 checks:
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R2', specs: R2, reportDir: DIR, brief: BRIEF, mech: MECH, source: SOURCE, held: HELD } })
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R3', specs: R3, reportDir: DIR, brief: BRIEF, mech: MECH, source: SOURCE, held: HELD } })
```

Each run returns `stopped`, `no_result`, `held`, `gaps_not_run`, `gap_specs` and `gap_no_result`. Before reading any report: write one Step 8 `STOP-<n> unit=<id>` line per `stopped` id and one `NORESULT unit=<id>` line per `no_result` and `gap_no_result` id (only `STOP-<n> unit=` lines count as stops in Step 10), and write `gap_specs` to `gapspecs/<tag>.json` so Step 10 counts the gap units. When the gap round was held, `gaps_not_run` goes to the owner batch; when it was capped, the coverage statement names it.
