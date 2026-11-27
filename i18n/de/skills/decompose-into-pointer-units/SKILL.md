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
  version: "1.1"
  domain: general
  complexity: advanced
  language: multi
  tags: general, multi-agent, decomposition, provenance, audit, workflow
  locale: de
  source_locale: en
  source_commit: "ee6fdee79"
  fence_basis_commit: "ee6fdee79"
  translator: "(untranslated stub)"
  translation_date: "2026-10-28"
---

# Decompose Into Pointer Units

Split a job that is too large for one agent into many narrow units without letting the lead's judgement leak into each unit as hand-written prose. The work list comes from a script reading source artifacts; each unit gets pointers, a shared brief and one template per kind. The lead's judgement lives in reviewable places: the derivation script, the brief, the templates, and the critic prompts whose gaps the owner may approve as later units. Narrow units exist for scoping, provenance and auditability — never to bypass what a unit is allowed to do, and the brief never withholds the run's purpose from units.

## When to Use

- A review, audit or migration has more items than one agent can hold, and each item can be answered by reading named sources
- The work list already exists in artifacts: changelog bullets, inventory or census rows, issue numbers, gap IDs from a prior critic, one file per item under review
- Every conclusion must trace back to a source pointer (compliance review, code or dependency audit, migration sign-off)
- An earlier fan-out drifted because hand-written unit prompts differed in method or scope
- Not when the right domain is unknown (use `unleash-the-agents`), and not when each step depends on the last (use a team)

## Inputs

- **Required**: Source artifacts the work list comes from, computed before the run (paths)
- **Required**: The question every unit answers and the closed vocabulary it classifies with
- **Required**: An absolute report directory outside the repository under review
- **Required**: A human owner who decides stopped units and batched questions
- **Required**: `node`, `jq` and `rg` on PATH; `gh` when issues are a source; GNU coreutils and findutils (`sha256sum -c --quiet`, `mv --backup`, `xargs -r`, `find -print0`). All shell snippets target bash or zsh **without** `set -e` or `set -o pipefail` (several intentionally let `rg` or `awk` exit 1 on normal paths)
- **Optional**: Chunk size per spec kind (default: 4–8 source lines or rows per unit; fewer when items are long)
- **Optional**: Critic group size (default: 15 reports per accuracy critic, sized with `manage-token-budget`)

## Procedure

### Step 1: Freeze the Mechanical Inputs

Compute every input a unit will cite before any unit runs — units read frozen files under `$RUN_DIR/mechanical/` and never recompute them. Run the freeze snippet in [ledger-snippets.md](references/ledger-snippets.md#step-1-freeze-mechanical-inputs) to verify tools, refuse re-freezing an existing `MECH-SHA256SUMS`, create `$RUN_DIR/{mechanical,specs,gaps,owner,repo}` + `UNIT-LOG.txt`, freeze source artifacts, and record `MECH-SHA256SUMS`.

**Expected:** `$MECH` holds every input the brief names; `MECH-SHA256SUMS` covers all files under it (re-checked byte-for-byte in Steps 7 and 10). Keep one `$RUN_DIR` for the whole job and reserve top-level `.txt` files strictly for unit reports, `V-`/`X-` files, and `UNIT-LOG.txt` (Step 10 treats any other top-level `.txt` as a report); put `BRIEF.md` in `.md` and store repo records in `repo/`, owner decisions in `owner/`, and no-result partials in `partials/`.

**On failure:** A `missing:` line names a tool to install first. If `gh` fails, stop rather than run with an empty list or live issue reads. If an input cannot be computed yet, compute it before proceeding.

### Step 2: Derive the Work List With a Script

A spec carries only `kind`, a stable id (`[A-Za-z0-9._-]+`, never starting with `V-` or `X-`), and pointers — never lead prose. Run `derive-specs.mjs`, the coverage/uniqueness checks, and the one-time `WORK-SHA256SUMS` recorder in [ledger-snippets.md](references/ledger-snippets.md#step-2-derive-specs-prove-coverage-and-record-work-list) (other spec kinds and derivers live in [EXAMPLES.md](references/EXAMPLES.md)).

**Expected:** Source item counts equal covered and unique counts; all ids are unique across clusters and match `^[A-Za-z0-9._-]+$` (none prefixed `V-` or `X-`); `WORK-SHA256SUMS` records every spec file once. Later spec/gaps files are added only via the checked snippets in [EXAMPLES.md](references/EXAMPLES.md), never by hand.

**On failure:** A count mismatch means the parser skipped items — fix and regenerate before recording `WORK-SHA256SUMS`. Once any unit has launched, never re-derive or hand-edit a recorded spec file (that is a re-run under Step 8 item 2): derive only missed items into a new spec file with new ids and record it via the added-specs check in [EXAMPLES.md](references/EXAMPLES.md).

### Step 3: Write the Shared Brief Once

Every unit reads one plain-text brief (`$RUN_DIR/BRIEF.md`) holding everything shared across units:

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

Keep the section markers `VERDICT:`, `EVIDENCE:`, `OPEN:`, `STOPPED:`, the `stop` enum values, and `## Answered` (Step 9) in English even in translated briefs, because the scripts read them literally.

**Expected:** One brief at `$RUN_DIR/BRIEF.md`, under ~200 lines; `FRAME` states the whole run's purpose; no sentence names a single unit.

**On failure:** A rule for one kind belongs in its Step 4 template; a rule for one unit means the spec kind is wrong.

### Step 4: Assemble Prompts From One Template per Kind

Build every prompt mechanically from a fixed `HEAD` (read brief, stay in scope, no side effects), the unit id, report path `${DIR}/${s.id}.txt`, `scope(s)` (one neutral template per kind filling pointers only, throwing on unknown kinds), and `STOP_LINE`. See [stop-and-batch-rules.md](references/stop-and-batch-rules.md#prompt-assembly-template-step-4) for the `scope()` template and [EXAMPLES.md](references/EXAMPLES.md) for the tested Workflow skeleton (adapt with `create-workflow`).

**Expected:** Any prompt can be rebuilt from its spec, brief, and template. Same-kind units differ only in pointers (except `owner` specs, which quote the owner's Answered line verbatim).

**On failure:** Unknown kinds, `cl` specs missing `args.source`, `owner` specs missing unit/scope/`STOP-<n>` answer, or non-array `held` arguments throw before any agent starts. If a kind needs per-unit prose, split the kind or add a pointer field.

### Step 5: Fix the Unit Output Contract

Each unit writes `${DIR}/${s.id}.txt` in several short writes (`VERDICT:`, then `EVIDENCE:` per item, then `OPEN:`) so mid-report deaths still leave a verdict on disk, and returns a flat structured summary (`DSCHEMA`: `unit`, `report_path`, `items`, `non_benign`, `open`, and required `stop` enum `none | safety-classifier | policy-hook | reviewer` — full schema in [stop-and-batch-rules.md](references/stop-and-batch-rules.md#structured-unit-summary-schema-step-5)). Verifiers and critics return the same `stop` field; detailed findings live in report files because message channels truncate.

**Expected:** Every finished unit has a report file matching its summary's `non_benign` lines, with `stop: "none"` unless stopped.

**On failure:** Structured-output retry exhaustion usually means units are pasting raw code/quotes into summary fields — tighten `HEAD`'s paraphrase rule for unlaunched units, and handle units that returned nothing under Step 8's no-result rule. Never write unit results by hand.

### Step 6: Wire Verifiers and Grouped Critics; Gaps Go to the Owner

1. **Adversarial verifiers:** One per non-benign item, given the same evidence and told to refute; writes `V-<unit>-<n>.txt`. A stopped or missing verifier is recorded and its claim stays unverified.
2. **Accuracy critics:** One per group of at most the critic group size (default 15) reports, reading benign reports as well.
3. **Completeness critic:** One per run over the spec list, digest, and frozen inputs, given the current held list so it sets `covers_held` on any gap touching held pointers.
4. **Gaps go to the owner:** Deduplicate exact lowercase titles (keeping highest priority, OR-ing `covers_held`, recording dropped copies' questions/flags for the owner — snippet in [stop-and-batch-rules.md](references/stop-and-batch-rules.md#critic-grouping--gap-deduplication-step-6)). No gap runs in the run that found it; stopped critics' outputs are discarded.

**Expected:** One verifier file per non-benign item, `ceil(finished / group size)` accuracy files plus one completeness file, every gap routed to the owner batch, and zero units outside input specs run.

**On failure:** A verifier returning nothing or a stop is not a confirmation — record it and apply Step 8. Assign `await parallel(...)` to a variable before calling `.filter(...)`.

### Step 7: Pilot One Cluster, Then Launch the Rest in Parallel

Before the pilot, record `git -C <repo> rev-parse HEAD` and `git -C <repo> status --porcelain` under `$RUN_DIR/repo/` (compare both after every run; `git status` alone misses commits). Run one pilot cluster alone, run the checksum & section glance in [ledger-snippets.md](references/ledger-snippets.md#step-7-pilot-section-glance--checksum-verification), and read 2–3 pilot reports end to end (checking pointer citations, summary parity, verifier runs, and `STOPPED:` vs. `stop` field agreement). Only then launch remaining clusters in parallel under unique tags with held ids stripped into `held` ([EXAMPLES.md](references/EXAMPLES.md)).

**Expected:** Pilot reports pass all checks before any other cluster starts, and target-repo `HEAD` and status remain unchanged.

**On failure:** Fix template defects before launching other clusters. Re-run the pilot only if `UNIT-LOG.txt` has zero `STOP`/`NORESULT` entries across all six lists and no `STOPPED:` disagreement; otherwise route to the owner batch. For externally halted runs that return no lists, follow the halted-run logging procedure in [stop-and-batch-rules.md](references/stop-and-batch-rules.md#detailed-step-7-pilot--halted-run-rules).

### Step 8: Respect a Stop

A stop (from a safety classifier, policy hook, or reviewer) is a decision about that work, never a puzzle to solve. After every run — before Step 9 or any later launch — read every unit, verifier, and critic transcript by **structure** (not substring) because an agent refused part way can still write `stop: none`.

Follow the seven stop rules and unit-log grammar in [stop-and-batch-rules.md](references/stop-and-batch-rules.md#detailed-step-8-stop-hold-owner-spec--release-rules), using the exact writers and checks in [ledger-snippets.md](references/ledger-snippets.md#step-8-unit-log-writers-no-result-release-and-pre-rerun-check):

1. Log stops by id (`STOP-<n> unit=<id> ...`, `stage=after-run` when found in transcripts), holds (`HELD`), no-results (`NORESULT`, moving any partial to `partials/`), and owner-named re-runs (`RERUN-<n>`).
2. Never re-run, reword, or reproduce stopped work (including lead drafting). Once any stop or no-result exists, nothing that already ran launches again without an owner `RERUN-<n>` line — except one transient no-result re-run released via `BY=transient:<transcript>` (verifiers/critics also require the pre-rerun check).
3. Batch every stop in `OWNER-QUESTIONS.md` (Step 9) with plain options: hold (recommended), owner sets a different scope, or owner does the work.
4. Continue all other units — stops route to the owner batch and never block unrelated units.
5. Re-scope a stopped unit only as a single `owner` spec (`OW-<n>`) quoting the owner's `STOP-<n>` Answered line verbatim, validated by the owner-spec check in [EXAMPLES.md](references/EXAMPLES.md).
6. Bind stops at the **pointer** level: log `HELD unit=<id> reason=overlaps-STOP-<n>` for unlaunched overlapping specs (never `HELD` on specs that already reported — list those under the stop entry as reported-not-used).
7. Handle stops found after the run (transcript audit): the report counts as reported and stopped, its verifiers' claims stay unverified (never re-run), and critics/gaps citing it are isolated for the owner batch rather than transiently re-run or derived by topic.

**Expected:** Every stop, no-result, and overlap hold is logged in `UNIT-LOG.txt` and routed to the owner batch; no stopped unit was re-run/reworded outside an authorised `owner` spec, and no held id ran before its `RELEASED` line.

**On failure:** If a stopped unit was re-run or reworded by mistake, discard that output, log the deviation, and report it in the owner batch.

### Step 9: Batch Owner Questions With a Faithfulness Check

Collect every pending owner decision once in `$RUN_DIR/OWNER-QUESTIONS.md` with context, evidence paths, options, and recommendation (always **hold** for stops; never propose narrowed/reworded scopes or substitute another unit's output):

```markdown
- **B1. STOP-1, unit CL1.5.0-02.** Stopped while writing its report; report partial.
  Evidence: UNIT-LOG.txt line 1, CL1.5.0-02.txt (partial).
  Options: (a) you name a different scope for this unit, (b) you do the work, (c) hold.
  Recommendation: (c).
```

Before presenting the batch: (1) run read-only faithfulness and completeness checkers (never reading stopped reports); (2) gate topic-level gap derivation with all **three** independent signals — lead marks (`owner/<tag>-marked-gaps.txt`), critic `covers_held`, and an independent second read (`owner/<tag>-second-read.tsv`: `COVERS | BORDERLINE | CLEAR`); and (3) record owner answers in the exact one-line `## Answered` syntax parsed by the release and owner-spec scripts. Full rules and line formats in [stop-and-batch-rules.md](references/stop-and-batch-rules.md#detailed-step-9-owner-batch-three-signal-gap-gating--answered-formats).

**Expected:** Every stop, unresolved no-result, held id, and pending re-run appears once with evidence paths; checker corrections sit in question text or beside gap questions; dependent questions follow their prerequisites.

**On failure:** When a checker contradicts a question, re-open the primary file before editing. Record answers as they arrive so an interrupted session loses none.

### Step 10: Reconcile the Ledger Before Claiming Coverage

Compute coverage strictly from files on disk — never from idle status or memory. Run the reconciliation snippet in [ledger-snippets.md](references/ledger-snippets.md#step-10-reconcile-the-ledger) to verify `UNIT-LOG.txt` format, `MECH-SHA256SUMS`, `WORK-SHA256SUMS`, duplicate spec ids, and the seven ledger counts (`specs`, `reported`, `stopped`, `held`, `unaccounted`, `extra`, `held_ran`).

**Expected:** Both checksums match, zero duplicate spec ids, `extra=0`, `held_ran=0`, every `unaccounted` id is an open or released-not-yet-rerun no-result, and `specs` equals Step 2's total plus approved gap/owner specs. The coverage statement quotes all seven counts, lists stopped/held ids and verifier/critic stops or no-results (with unverified claims), and names gaps sent to the owner.

**On failure:** Apply Step 8's no-result rule to any unaccounted id; discard any `held_ran` report; investigate any `extra` report before use; on any checksum mismatch or duplicate id, do not use reports over changed pointers until the owner decides (edge cases in [stop-and-batch-rules.md](references/stop-and-batch-rules.md#step-10-ledger-reconciliation-edge-cases)).

## Validation

- [ ] Every spec file was generated mechanically from `mechanical/`, recorded gaps, or batch-verified owner specs, recorded in `WORK-SHA256SUMS`, with pointer-only fields (except verbatim owner scope)
- [ ] Step 2 coverage counts matched and all ids are unique and safe (`^[A-Za-z0-9._-]+$`, none prefixed `V-` or `X-`)
- [ ] Every prompt is `HEAD + id + report_path + scope(spec) + STOP_LINE`, and `scope` throws on unknown kinds
- [ ] One verifier per non-benign item, grouped accuracy critics, one completeness critic, every gap routed to the owner batch, zero unscheduled units run
- [ ] Pilot reports were read before parallel cluster launch; target repo `HEAD` and status stayed unchanged; no re-run occurred after a stop/no-result without owner authorisation (except one logged transient re-run)
- [ ] Every stop, hold, and no-result is logged in `UNIT-LOG.txt` and batched; no stopped unit was re-run/reworded outside an item-5 `owner` spec; verifier/critic stops and no-results appear in the coverage statement
- [ ] Every run transcript was read by structure before Step 9 and every no-result transcript before release; releases used the release snippet
- [ ] `OWNER-QUESTIONS.md` passed faithfulness review and `owner/<tag>-second-read.tsv` named every gap once
- [ ] Step 10 ledger prints `extra=0` and `held_ran=0`, both checksums match, and all `unaccounted` ids are explained

## Common Pitfalls

- **Per-unit prose from the lead**: Hand-written prompts drift in scope and method; add a pointer field or spec kind instead.
- **One critic for the whole run**: Skims the digest and misses wrong claims inside benign verdicts; keep critic groups small enough to read every report (default 15).
- **Idle or no result read as answered**: Reconcile from files (Step 10) and apply Step 8's no-result rule before any re-run.
- **Using narrow splits to get past a stop**: Narrowing is for scoping and auditability, never for rephrasing or rerouting stopped work — including via completeness-critic gaps, which is why gaps go to the owner.
- **Reading stops from free text**: Substring matching misses reworded stops and triggers on negated lines; read the required `stop` enum field AND inspect transcripts by structure (Step 8).
- **Launching every cluster before reading the pilot**: A template defect multiplies across clusters and, once any stop/no-result occurs, requires owner approval to re-run (Step 8 item 2).

## Related Skills

- `create-workflow` — author the Workflow script that carries the templates, verifiers and critics
- `verify-agent-output` — the evidence-trail and external-anchor discipline each verifier applies
- `unleash-the-agents` — the alternative when the domain is unknown and no artifact yields a work list
- `create-work-breakdown-structure` — the project-management analogue: decomposing scope into work packages
- `manage-token-budget` — size chunk and critic group against cost before launching
