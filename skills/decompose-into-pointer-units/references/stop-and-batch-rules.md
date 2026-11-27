# Stop, Hold, Batch & Re-Run Governance Rules — decompose-into-pointer-units

Detailed governance rules, schema templates, and edge-case specifications extracted from `SKILL.md` Steps 4–10. See [ledger-snippets.md](ledger-snippets.md) for executable shell snippets and [EXAMPLES.md](EXAMPLES.md) for the Workflow skeleton and derivers.

## Step 4–6 Code Contracts (`scope`, `DSCHEMA`, Gap Deduplication)

### Prompt Assembly Template (Step 4)

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

### Structured Unit Summary Schema (Step 5)

```javascript
const DSCHEMA = { type: 'object', additionalProperties: false,
  required: ['unit', 'report_path', 'items', 'non_benign', 'open', 'stop'],
  properties: {
    unit: { type: 'string' }, report_path: { type: 'string' }, items: { type: 'integer' },
    non_benign: { type: 'array', items: { type: 'string', maxLength: 600 } },  // id | claim | class | severity | source pointer
    open: { type: 'array', items: { type: 'string', maxLength: 300 } },
    stop: { type: 'string', enum: ['none', 'safety-classifier', 'policy-hook', 'reviewer'] } } }
```

### Critic Grouping & Gap Deduplication (Step 6)

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

## Detailed Step 7 Pilot & Halted-Run Rules

- **Pilot re-run eligibility:** Re-run a pilot under a fixed contract **only** if `UNIT-LOG.txt` has no `STOP` or `NORESULT` line (all six lists empty: `stopped`, `no_result`, `verifier_stopped`, `verifier_no_result`, `critic_stopped`, `critic_no_result`, and no report whose `STOPPED:` line disagrees with its `stop` field). Otherwise send it to the owner batch noting the old brief; only units named by the owner run again (Step 8 item 2).
- **Externally halted runs:** A run returning nothing (halted from outside or by a usage limit) leaves no lists, no `rerun_prompts`, and no `gaps_for_owner`. Log a `NORESULT` for each unit whose report is missing or lacks an `OPEN:` section (moving its partial via the Step 8 snippet), for each verifier whose transcript exists with a missing file, and for each critic with no file. A unit whose report is whole counts as reported; its non-benign items (whose verifiers cannot be named without the summary) go into the coverage statement as unverified, and its verifiers/critics go to the owner batch.

## Detailed Step 8 Stop, Hold, Owner-Spec & Release Rules

### The Seven Stop Rules

1. **Log by id:** Record `STOP-<n> unit=<id> stage=<stage> written=<partial|none|whole> routed=owner-batch`. After every run, read every unit, verifier, and critic transcript by structure — log stops discovered there with `stage=after-run` and `written=whole` when the report is complete, regardless of the `stop` field.
2. **Never re-run, reword, or reproduce stopped work:** Applies to the lead's own drafting too (move any partial drafted inside a repo working tree unedited into `$RUN_DIR` and cite it in the batch). A pilot re-run, cluster restart, chunk-size re-derivation, or gap unit is a re-run. Once any run records a stop or missing result, nothing that already ran launches again unless named by the owner on a `RERUN-<n>` Answered line and logged via `RERUN-<n> unit=<id> as=<tag>` (except one transient no-result re-run below).
3. **Batch with plain options:** Hold (recommended), owner sets a different scope, or owner does the work.
4. **Continue other units:** Stops route to the batch and never block unrelated units.
5. **Owner-authorised re-scope (`owner` spec):** Runs only with `id` `OW-<n>` (new to the work list), `unit`, `scope` (copied verbatim from a one-line Answered entry), and `answer` (`STOP-<n>`). The owner-spec check in [EXAMPLES.md](EXAMPLES.md) refuses a scope not quoted on that Answered line and refuses reusing a `STOP-<n>` for a second `owner` spec. If an authorised run stops again, propose nothing further.
6. **Pointer-level stop binding (`HELD`):** Before launching any later spec, add every spec whose pointers overlap a stopped unit's to the held list, to `UNIT-LOG.txt` as `HELD unit=<id> reason=overlaps-STOP-<n>`, and to the owner batch (except an item-5 `owner` spec). A spec over those pointers that already reported gets **no** `HELD` line (which Step 10 would flag as `held_ran`): list it under the stop's entry and in the coverage statement as reported-not-used until the owner rules.
7. **Stops found after the run:** The unit's report counts as reported and stopped (Step 10); its verifiers' verdicts count as stopped (claims stay unverified; pre-rerun check refuses re-running its verifiers). Any critic whose group or digest held it is not transiently re-run (only if the owner names it). Critic entries and gaps citing it are listed apart in the owner batch, unchecked, recommending hold; gaps citing it are marked (Step 9) so they are never derived by topic.

### Unit-Log Line Grammar & No-Result Classification

Every line in `UNIT-LOG.txt` starts with `<YYYY-MM-DD> <KIND> unit=<id>`, one space apart (enforced by every reader). Valid kinds: `STOP-<n>`, `HELD` (`reason=overlaps-STOP-<n>` or `reason=owner`), `NORESULT`, `RELEASED` (`by=owner` or `by=transient:<transcript>`), `RERUN-<n>`. Verifier and critic events use their file basenames (`V-<id>-<n>`, `X-accuracy-<tag>-<n>`, `X-completeness-<tag>`).

Read no-result transcripts by **structure**, not substring:
- **Transient:** overload/5xx, rate limit, runtime usage/quota limit notice, or network timeout — and nothing else. Release once via `BY=transient:<transcript path>` and re-run unchanged and alone under a new tag (units via the launch snippet; verifiers/critics via `args.rerun` + `rerun_prompts` after passing the pre-rerun check). Never transiently re-run a critic whose group/digest holds a stopped unit, nor a second no-result of the same id, nor an id held over a stop since.
- **Stop:** any error citing a usage policy, refusal, blocked request, or hook — even if labelled as an API error. Log `STOP-<n>`.
- **Otherwise:** undetermined — keep `NORESULT`, do not re-run, send to the owner batch.

## Detailed Step 9 Owner Batch, Three-Signal Gap Gating & Answered Formats

1. **Faithfulness & completeness check:** Before presenting `OWNER-QUESTIONS.md`, run read-only checkers (never reading stopped-unit content) to compare each factual sentence and recommendation against cited files/tracker state and list dependencies or uncovered open items.
2. **Three independent signals before deriving any gap by topic:**
   - Lead marking: `owner/<tag>-marked-gaps.txt` (must exist, even if empty) — marks any gap covering stopped/held pointers or citing an after-run stopped unit.
   - Critic flag: `covers_held` on the gap object.
   - Independent second read: `owner/<tag>-second-read.tsv` (`<gap-id>\tCOVERS|BORDERLINE|CLEAR`), produced by a read-only checker reading the gaps file, specs, and `UNIT-LOG.txt` (never stopped reports).
   The gap deriver refuses a second read missing or duplicating any gap, and derives via topic **only** when a gap is unmarked, unflagged, and `CLEAR`. Marked gaps belong solely to their stop entry's option (a); flagged-but-unmarked gaps require single-id approval with stated rationale; checker corrections sit beside (never folded into) the gap's question.
3. **One-line `## Answered` formats** (parsed literally by the release snippet and owner-spec check):
   - `- STOP-<n>, unit <id>: "<owner's words verbatim>" (<where>, <date>)`
   - `- NORESULT, unit <id>: "<owner's words verbatim>" (<where>, <date>)`
   - `- HELD, unit <id>, <reason>: "<owner's words>" (<where>, <date>)` (`<reason>` matches `overlaps-STOP-<n>` or `owner`; note `HELD` lines match by reason and are not consumed, so re-held ids require a new answer)
   - `- RERUN-<n>, run <tag>: "<owner's words>" (<where>, <date>)`
   Transcribe topic and id approvals to `owner/<tag>-approved-topics.txt` and `owner/<tag>-approved-gaps.txt`.

## Step 10 Ledger Reconciliation Edge Cases

- `extra > 0` catches any report belonging to no spec (e.g., stopped work run under an unrecorded id).
- `held_ran > 0` means a held id ran before release — do not use that report.
- `unaccounted` ids have no report, stop, or active hold — apply Step 8's no-result rule before any re-run.
- A re-launch of already-reported work leaves no ledger trace, which is why the launch snippet requires a hand-written `RERUN` line (Step 8 item 2) once any stop or no-result exists.
- Mechanical or work-list checksum mismatches, or duplicate ids across spec files, mean inputs or specs changed after freeze/recording — do not use reports over changed pointers until the owner decides.
