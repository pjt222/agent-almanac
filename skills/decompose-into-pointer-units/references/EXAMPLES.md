# Examples: Decompose Into Pointer Units

Extended material for [SKILL.md](../SKILL.md): a complete Workflow skeleton, derivers for the other spec kinds, a brief skeleton, an owner batch skeleton and the launch sequence.

## Workflow skeleton

Tested in the Workflow dialect (`node --check` on the wrapped body) and against mocked `agent` / `pipeline` / `parallel` primitives. In the mock, a clean report reading "Not stopped by a safety classifier" was not counted as a stop, a stopped unit and a died unit were reported separately, and the gap cap logged what it dropped. Adapt `scope()` to your kinds and add any preamble your environment requires to `HEAD`. The skeleton carries no domain detail: the evidence paths, the classification vocabulary, the refutation checks and the method rules belong in your brief, not in the script.

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
    { title: 'Gaps', detail: 'top critic gaps become units, the rest are logged' },
  ],
}

const A = (typeof args === 'string') ? JSON.parse(args) : (args || {})
const DIR = A.reportDir, BRIEF = A.brief, MECH = A.mech, TAG = A.tag || 'R'
const SPECS = Array.isArray(A.specs) ? A.specs : []
const GROUP = A.criticGroup ?? 15, MAX_GAPS = A.maxGapUnits ?? 6
if (!SPECS.length || !DIR || !BRIEF || !MECH) throw new Error('args.specs, reportDir, brief and mech are required')
const SOURCE = `${MECH}/changelog.md`

const HEAD = `You are one narrow unit in a larger review run.
FIRST read the shared brief in full and follow it exactly: ${BRIEF}
Stay inside your scope; if something outside it looks relevant, say so in one line and do not pursue it.
Do not create, edit or comment on issues, and do not commit. Structured fields are short paraphrased prose, never raw code.`

const scope = (s) => {
  switch (s.kind) {
    case 'cl': return `lines ${s.lines.join(', ')} of ${SOURCE} (release ${s.release}). For each line, say in one line whether it touches anything in the brief's CLASSIFY list; examine the lines that do.`
    case 'rows': return `lines ${s.rows.join(', ')} of ${MECH}/${s.file} (group ${s.group}). Benign rows go in one compact table; full VERDICT blocks only for rows the brief says to classify.`
    case 'file': return `the file ${MECH}/${s.path}. Examine each added or removed entry it lists.`
    case 'issue': return `tracked issue #${s.n}. Locate its mechanism by the names the issue gives and say whether it is unchanged, narrowed, widened, closed or moved, with evidence.`
    case 'gap': return `gap ${s.g}: item ${s.g} of ${s.from}. Answer it as asked.`
    case 'raw': return s.question // written by a critic in this run, never by the lead
    default: throw new Error(`unknown spec kind ${s.kind}`)
  }
}

const DSCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['unit', 'report_path', 'items', 'non_benign', 'open'],
  properties: {
    unit: { type: 'string' },
    report_path: { type: 'string' },
    items: { type: 'integer', description: 'how many items the report covers' },
    non_benign: { type: 'array', items: { type: 'string', maxLength: 600 },
      description: 'one line per non-benign item: id | claim | class | severity | source pointer' },
    open: { type: 'array', items: { type: 'string', maxLength: 300 } },
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

const runUnit = (s, ph) => agent(
  `${HEAD}\n\n=== YOUR UNIT: ${s.id} ===\nWrite your report to: ${DIR}/${s.id}.txt\nScope: ${scope(s)}`,
  { label: s.id, phase: ph, schema: DSCHEMA })

const verify = (r, item, n, ph) => agent(
  `${HEAD}\n\n=== ADVERSARIAL VERIFY of ${r.unit}, item ${n} ===\nThe report ${r.report_path} claims:\n  ${item}\n`
  + 'Re-derive it independently from the same evidence and try to REFUTE it: the counter-example, the condition the '
  + 'claim overlooked, the misread source, the wrong default, the overstated impact, the item that is not new, and any '
  + 'refutation check the brief adds. A claim that survives is CONFIRMED.\n'
  + `Write your re-derivation to: ${DIR}/V-${r.unit}-${n}.txt`,
  { label: `verify ${r.unit}#${n}`, phase: ph, schema: VSCHEMA })

// The lookbehind keeps a clean report that says "not stopped by a safety classifier" from matching.
const STOP_RE = /(?<!not )(stopped by a safety classifier|classifier[- ]stopped)/i
const stopped = []
const verifyAll = async (r, s, ph) => {
  if (!r) return null
  if ((r.open || []).some(x => STOP_RE.test(x))) { stopped.push(s.id); return null } // recorded, never re-run here
  r.unit = s.id
  const items = r.non_benign || []
  const raw = await parallel(items.map((item, i) => () => verify(r, item, i + 1, ph)))
  const verdicts = raw.filter(Boolean) // assign first: never chain onto await parallel(...)
  if (verdicts.length < items.length) log(`WARNING ${s.id}: ${items.length - verdicts.length} verifier(s) returned nothing`)
  return { summary: r, verdicts }
}

phase('Review')
const round1 = await pipeline(SPECS, s => runUnit(s, 'Review'), (r, s) => verifyAll(r, s, 'Verify'))
const done = round1.filter(Boolean)
const died = SPECS.filter((s, i) => !round1[i] && !stopped.includes(s.id)).map(s => s.id)
if (died.length) log(`NO RESULT, re-run as-is and never answer by hand: ${died.join(', ')}`)
if (stopped.length) log(`STOPPED, record by id and route to the owner, do not re-run: ${stopped.join(', ')}`)

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
  + `SPECS:\n${SPECS.map(s => `- ${s.id} ${s.kind}`).join('\n')}\n\nDIGEST:\n${digest(done)}`,
  { label: `completeness ${TAG}`, phase: 'Critics', schema: XSCHEMA })
const critRaw = await parallel([...accuracy, completeness])
const critics = critRaw.filter(Boolean)
if (critics.length < critRaw.length) log(`WARNING: ${critRaw.length - critics.length} critic(s) returned nothing`)

const seen = new Set() // several critics often report the same gap: keep its highest-priority copy
const gaps = critics.flatMap(c => c.gaps || []).sort((a, b) => a.priority - b.priority)
  .filter(g => { const k = g.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
if (gaps.length > MAX_GAPS) log(`Gap round capped at ${MAX_GAPS}; NOT run: ${gaps.slice(MAX_GAPS).map(g => `[p${g.priority}] ${g.title}`).join('; ')}`)
const gapSpecs = gaps.slice(0, MAX_GAPS).map((g, i) => ({ kind: 'raw', id: `G-${TAG}-${i + 1}`, question: g.question }))
let round2 = []
if (gapSpecs.length) {
  phase('Gaps')
  const raw2 = await pipeline(gapSpecs, s => runUnit(s, 'Gaps'), (r, s) => verifyAll(r, s, 'Gaps'))
  round2 = raw2.filter(Boolean)
}

return {
  tag: TAG, died, stopped, gaps_not_run: gaps.slice(MAX_GAPS),
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

Each one reads a frozen mechanical input and writes specs that carry only pointers.

Inventory rows chunked by group (a TSV with a header line, the group in column 2; `rows` are file line numbers):

```bash
awk -F'\t' 'NR > 1 { print NR "\t" $2 }' "$MECH/inventory.tsv" | jq -R -s -c --argjson n 10 '
  split("\n") | map(select(length > 0) | split("\t") | {row: (.[0] | tonumber), group: .[1]})
  | group_by(.group)
  | map(. as $g | [range(0; length; $n)]
        | map({kind: "rows", id: "RW-\($g[0].group)-\(. / $n + 1)", file: "inventory.tsv",
               group: $g[0].group, rows: ($g[.:(. + $n)] | map(.row))}))
  | flatten' > "$RUN_DIR/specs/rows.json"
```

One spec per diff file:

```bash
ls "$MECH/diff" | jq -R -s -c 'split("\n") | map(select(endswith(".md"))) | to_entries
  | map({kind: "file", id: "DF\(.key + 1)", path: "diff/\(.value)"})' > "$RUN_DIR/specs/files.json"
```

Gap ids from an earlier completeness critic file whose items start with `G<n>.`:

```bash
PRIOR_GAPS="/abs/path/reports/run-000/X-completeness-R1.txt"
rg -o '^(G[0-9]+)\.' -r '$1' "$PRIOR_GAPS" | jq -R -s -c --arg from "$PRIOR_GAPS" \
  'split("\n") | map(select(length > 0)) | map({kind: "gap", id: ., g: ., from: $from})' > "$RUN_DIR/specs/gaps.json"
```

## Brief skeleton

```text
FRAME. You are one unit of a review run for <owner>. The run decides <the question>. Produce
<what>; never produce <what not>. Your scope is the pointers in your unit; stay inside them.

EVIDENCE. Everything below is already computed; read what your unit needs and do not redo it.
  mechanical/changelog.md     the changelog in scope; line numbers in units refer to it
  mechanical/inventory.tsv    one row per <item>, column 2 is the group
  mechanical/diff/<A>--<B>.md one file per compared pair
  Known artifacts: <the ways these files mislead, one line each>

TOOLS. Read-only. <the commands, how to count occurrences, output bounds>. Never execute <X>.

METHOD RULES (each one has cost a wrong conclusion before):
  1. Negative case first: before calling something new, show it absent in the baseline.
  2. Measure, do not argue: a claim about one function needs its callers.
  3. A source's own summary is a claim, not evidence: check it against the primary artifact.
  ...

CLASSIFY. category in {...}; direction in {NEW, PRE-EXISTING, WIDENED, NARROWED, REMOVED};
severity in {...} with the rule for each; <any field every non-benign item must carry>.

OUTPUT. Write your report to the path in your unit (plain .txt), in several short writes:
  1. VERDICT per item   2. EVIDENCE with short quoted windows and the command that reproduces each
  3. OPEN: what you could not settle and the exact next check
Return the structured summary. Every structured field is paraphrased prose, never raw code.
If your work is stopped by a safety classifier or a reviewer, write "stopped by a safety
classifier" (or "stopped by a reviewer") in an OPEN line and end. Say what you could not determine.
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
  Options: (a) you name a different scope for this unit, (b) <another unit> covers it, (c) hold.
- **B2. <decision>.** <context in two lines>. Evidence: <paths>.
  Options: (a) ..., (b) .... Recommendation: (a), because <reason>. Depends on: B1.
```

## Launch sequence

Pilot first, read its reports, then one run per remaining cluster, started together:

```javascript
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R1', specs: R1, reportDir: DIR, brief: BRIEF, mech: MECH } })
// after the pilot reports pass the Step 7 checks:
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R2', specs: R2, reportDir: DIR, brief: BRIEF, mech: MECH } })
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R3', specs: R3, reportDir: DIR, brief: BRIEF, mech: MECH, maxGapUnits: 4 } })
```

Each run returns `died`, `stopped` and `gaps_not_run`. Copy all three into the unit log before reading any report, so the ledger in Step 10 has every id.
