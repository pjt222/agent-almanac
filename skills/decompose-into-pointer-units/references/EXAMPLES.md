# Examples: Decompose Into Pointer Units

Extended material for [SKILL.md](../SKILL.md): a complete Workflow skeleton, derivers for the other spec kinds, a brief skeleton, an owner batch skeleton and the launch sequence.

## Workflow skeleton

Tested in the Workflow dialect (`node --check` on the wrapped body) and against mocked `agent` / `pipeline` / `parallel` primitives. In the mock:

- A stop reported in a unit's, a verifier's or a critic's `stop` field (safety classifier, policy hook or reviewer) was recorded, a missing `stop` field counted as a stop, and a clean report saying it was "never stopped" did not.
- A stopped unit got no verifier, a stopped verifier's verdict was not counted, and a stopped critic's gaps were not used.
- A unit, verifier or critic with no result was recorded with its cause undetermined and was not marked for re-run.
- A held id was never launched and was reported to the completeness critic.
- An input spec of a kind the skeleton does not know (including `raw`), a `cl` spec without `args.source`, and an `owner` spec without its unit, scope and answer were refused before any agent started.
- No gap unit ever ran, even when a critic ignored its instructions and proposed a stopped or held unit's scope.

Adapt `scope()` to your kinds, add any preamble your environment requires to `HEAD`, and give verifiers a read-only agent type where your runtime offers one. The skeleton keeps only the generic method: its templates defer to the brief, and its refutation checks are generic. The evidence paths, the classification vocabulary, the domain's refutation checks and the method rules belong in your brief, not in the script.

The skeleton runs no gap unit. Every gap a critic returns goes to the owner batch, and a gap becomes a spec only in a later run, from an id the owner approved (the gap deriver below). A completeness critic sees a stopped or held unit's scope as uncovered and proposes it as a gap, and no rule in code can reliably tell such a gap from a new one. Only the owner can.

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
const HELD = new Set(Array.isArray(A.held) ? A.held : []) // ids the owner has not released (SKILL.md Step 8)
const INPUT = Array.isArray(A.specs) ? A.specs : []
const GROUP = A.criticGroup ?? 15
const KINDS = new Set(['cl', 'rows', 'file', 'issue', 'gap', 'owner'])
if (!INPUT.length || !DIR || !BRIEF || !MECH) throw new Error('args.specs, reportDir, brief and mech are required')
const unknown = INPUT.filter(s => !KINDS.has(s.kind))
if (unknown.length) throw new Error(`spec kinds not accepted: ${unknown.map(s => `${s.id}:${s.kind}`).join(', ')}`)
if (INPUT.some(s => s.kind === 'cl') && !SOURCE) throw new Error('cl specs need args.source, the file their line numbers refer to')
if (INPUT.some(s => s.kind === 'owner' && !(s.unit && s.scope && s.answer))) throw new Error('an owner spec names its unit, scope and answer')
const SPECS = INPUT.filter(s => !HELD.has(s.id))
const held = [...HELD]
if (held.length) log(`HELD for the owner, not launched: ${held.join(', ')}`)

const HEAD = `You are one narrow unit in a larger review run.
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
    case 'gap': return `gap ${s.g}: item ${s.g} of ${s.from}, approved by the owner. Answer it as asked.`
    case 'owner': return `owner-authorised re-scope of ${s.unit}: ${s.scope} (answer: ${s.answer}; the scope text is the owner's, verbatim)`
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
      type: 'object', additionalProperties: false, required: ['title', 'question', 'priority'],
      properties: {
        title: { type: 'string', maxLength: 120 },
        question: { type: 'string', maxLength: 1200 },
        priority: { type: 'integer', description: '1 = could change a verdict; 3 = cosmetic' },
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
    const id = `${s.id}#${i + 1}`
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
const UNDETERMINED = 'cause undetermined: read the transcript by structure before any re-run; re-run once, unchanged, only for a transient '
  + 'failure (overload or 5xx, rate limit, network timeout, structured-output retry exhaustion); anything else goes to the owner batch'
if (noResult.length) log(`NO RESULT, ${UNDETERMINED}: ${noResult.join(', ')}`)
if (verifierNoResult.length) log(`NO RESULT from verifier, ${UNDETERMINED}: ${verifierNoResult.join(', ')}`)
if (stopped.length) log(`STOPPED, record by id and route to the owner, do not re-run: ${stopped.join(', ')}`)
if (verifierStopped.length) log(`STOPPED verifier, record by id; its verdict is not counted: ${verifierStopped.join(', ')}`)

const digest = (rows) => rows.map(x => `## ${x.summary.unit} ${x.summary.report_path}\n`
  + x.summary.non_benign.map(t => `  NB ${t.slice(0, 200)}`).join('\n')
  + x.verdicts.map(v => `\n  V ${v.verdict}: ${v.item.slice(0, 160)} (${v.report_path})`).join('')).join('\n')

phase('Critics')
const groups = []
for (let i = 0; i < done.length; i += GROUP) groups.push(done.slice(i, i + GROUP))
const criticLabels = groups.map((g, gi) => `critic ${TAG}-${gi + 1}`).concat(`completeness ${TAG}`)
const accuracy = groups.map((g, gi) => () => agent(
  `${HEAD}\n\n=== ACCURACY CRITIC ${TAG}-${gi + 1} over ${g.length} reports ===\nRead EVERY report and verifier file below, `
  + 'benign units included. List each claim that does not hold, with the correction and how to reproduce it, and each pair '
  + `of units that contradict each other. Write to ${DIR}/X-accuracy-${TAG}-${gi + 1}.txt\n${STOP_LINE}\n\n${digest(g)}`,
  { label: criticLabels[gi], phase: 'Critics', schema: XSCHEMA }))
const completeness = () => agent(
  `${HEAD}\n\n=== COMPLETENESS CRITIC ${TAG} ===\nRead the spec list, the digest and the mechanical inputs in ${MECH}. `
  + 'What inside this run\'s scope did no unit cover, or cover only by assertion? Return each gap as a self-contained '
  + `question a fresh unit could answer, priority 1 to 3. No gap runs in this run; every gap goes to the owner. `
  + `Write to ${DIR}/X-completeness-${TAG}.txt\n${STOP_LINE}\n\n`
  + `HELD for the owner (stopped, no result or held; mark any gap over their pointers as such):\n${[...new Set([...stopped, ...noResult, ...held])].join(', ') || 'none'}\n\n`
  + `SPECS:\n${SPECS.map(s => `- ${s.id} ${s.kind}`).join('\n')}\n\nDIGEST:\n${digest(done)}`,
  { label: criticLabels[criticLabels.length - 1], phase: 'Critics', schema: XSCHEMA })
const critRaw = await parallel([...accuracy, completeness])
const criticNoResult = criticLabels.filter((label, i) => !critRaw[i])
const criticStopped = criticLabels.filter((label, i) => critRaw[i] && isStop(critRaw[i]))
const critics = critRaw.filter(c => c && !isStop(c))
if (criticNoResult.length) log(`NO RESULT from critic, ${UNDETERMINED}: ${criticNoResult.join(', ')}`)
if (criticStopped.length) log(`STOPPED critic, record by label; its gaps and corrections are not used: ${criticStopped.join(', ')}`)

const seen = new Set() // several critics often report the same gap: keep its highest-priority copy
const gaps = critics.flatMap(c => c.gaps || []).sort((a, b) => a.priority - b.priority)
  .filter(g => { const k = g.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
if (gaps.length) log(`${gaps.length} gap(s) returned for the owner batch; none runs in this run`)

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
echo "rows=$(($(wc -l < "$MECH/inventory.tsv") - 1)) covered=$(jq '[.[].rows[]] | length' "$RUN_DIR/specs/rows.json")"   # unequal: a row the deriver skipped
```

One spec per file in a directory of per-item files (here `$MECH/items`):

```bash
ls "$MECH/items" | jq -R -s -c 'split("\n") | map(select(endswith(".md")))
  | map({kind: "file", id: "IT-\(rtrimstr(".md") | gsub("[^A-Za-z0-9._-]"; "_"))", path: "items/\(.)"})' > "$RUN_DIR/specs/files.json"
echo "items=$(ls "$MECH/items" | wc -l) specs=$(jq length "$RUN_DIR/specs/files.json")"   # unequal: a file the deriver skipped
```

Gap ids from an earlier completeness critic file whose items start with `G<n>.`, limited to the ids the owner approved in the batch, and never one the batch marked as covering a stopped or held unit's pointers:

```bash
PRIOR_GAPS="/abs/path/reports/run-000/X-completeness-R1.txt"
APPROVED="$RUN_DIR/approved-gaps.txt"   # gap ids the owner approved, one per line
rg -o '^(G[0-9]+)\.' -r '$1' "$PRIOR_GAPS" | sort -u > "$RUN_DIR/prior-gap-ids.txt"
sort -u "$APPROVED" | comm -12 "$RUN_DIR/prior-gap-ids.txt" - | jq -R -s -c --arg from "$PRIOR_GAPS" \
  'split("\n") | map(select(length > 0)) | map({kind: "gap", id: ., g: ., from: $from})' > "$RUN_DIR/specs/gaps.json"
```

An owner spec re-scopes a stopped unit in the owner's words. Write it to `specs/owner.json` by hand from the batch, then check that each scope is quoted verbatim, on one line, under the unit it names in the batch's Answered section (format in the owner batch skeleton). Any id printed is refused. The check shows that the spec matches an Answered line, not that the line holds the owner's words, so the Answered line cites where the words came from:

```bash
jq -r '.[] | select(.kind == "owner") | [.id, .unit, .scope] | @tsv' "$RUN_DIR/specs/owner.json" |
  while IFS="$(printf '\t')" read -r id unit scope; do
    rg -F -q -- "unit $unit: \"$scope\"" "$RUN_DIR/OWNER-QUESTIONS.md" || echo "REFUSED $id"
  done
```

## Brief skeleton

```text
FRAME. You are one unit of a review run for <owner>. The run decides <the question>; its purpose
is <what the run assembles, and for whom>. Produce <what>; never produce <what not>. Your scope
is the pointers in your unit; stay inside them.

EVIDENCE. Everything below is already computed; read what your unit needs and do not redo it.
  mechanical/<source>         <what it holds>; line numbers in units refer to it
  mechanical/issue-<n>.json   each issue as frozen in Step 1
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
"STOPPED: <source>" on its own line under OPEN, set the summary's stop field to
safety-classifier, policy-hook or reviewer, and end. Otherwise set stop to none. Say what you
could not determine.
```

## Owner batch skeleton

```markdown
# <run> owner batch (<date>)

Collected for one answering pass. Each question cites its evidence. A read-only faithfulness
check ran before presentation; its corrections are folded into the question text.

## Answered

- STOP-1, unit <id>: "<the owner's words, verbatim, on one line>" (<where the words came from>, <date>)

## Open

- **B1. STOP-2, unit <id>.** <one line: what was stopped, at which stage, what is on disk>.
  Evidence: UNIT-LOG.txt line <n>.
  Options: (a) you name a different scope for this unit, (b) you do the work, (c) hold.
  Recommendation: (c).
- **B2. NORESULT, unit <id>.** No result, and its transcript shows no transient failure.
  Evidence: UNIT-LOG.txt line <n>, <transcript path>.
  Options: (a) re-run it once, unchanged, (b) treat it as a stop, (c) hold. Recommendation: (c).
- **B3. Gaps from run <tag>.** Each gap's question in full, from X-completeness-<tag>.txt and
  X-accuracy-<tag>-*.txt. A gap whose question covers a stopped or held unit's pointers is
  marked and not offered here: it belongs only to that unit's stop entry, option (a).
  Options: (a) approve gap ids <...>, (b) hold. Depends on: B1, B2.
```

## Launch sequence

Pilot first, read its reports, then one run per remaining cluster, started together. `HELD` is every id the owner has not released: every stopped id, every no-result id, and every spec whose pointers overlap a stopped unit's. Pass it to every run, including a re-run of the pilot, and keep held ids in the spec lists: a run that does not know an id cannot hold it.

```javascript
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R1', specs: R1, reportDir: DIR, brief: BRIEF, mech: MECH, source: SOURCE } })
// after the pilot reports pass the Step 7 checks:
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R2', specs: R2, reportDir: DIR, brief: BRIEF, mech: MECH, source: SOURCE, held: HELD } })
Workflow({ scriptPath: 'narrow-units.mjs', args: { tag: 'R3', specs: R3, reportDir: DIR, brief: BRIEF, mech: MECH, source: SOURCE, held: HELD } })
```

Each run returns `stopped`, `no_result`, `held`, `verifier_stopped`, `verifier_no_result`, `critic_stopped`, `critic_no_result` and `gaps_for_owner`. Before reading any report, write to the unit log:

- one Step 8 `STOP-<n> unit=<id>` line per `stopped` id;
- one `NORESULT unit=<id>` line per `no_result` id;
- one `HELD unit=<id>` line per `held` id.

Only `STOP-<n> unit=` and `HELD unit=` lines move a spec in Step 10. Verifier and critic stops and no-results are logged the same way under their labels (`unit=V-<id>-<n>`, `unit=critic-<tag>-<n>`). Step 10 counts spec units only, so these are recorded in the coverage statement and the owner batch rather than in the ledger, and the claim behind a stopped or missing verdict counts as unverified. `gaps_for_owner` goes to the owner batch as B3.
