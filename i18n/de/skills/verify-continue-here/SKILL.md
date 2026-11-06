---
name: verify-continue-here
description: >
  Verify a CONTINUE_HERE.md draft to the full gate before it is installed:
  rounds of the verify-handoff workflow against a facts file and at least one
  source, applying findings between rounds and stopping at the first round
  with no blocking finding and complete coverage, or after round 3. Use when the reader may not
  run read-continue-here, the next session is days away, or a single pass left
  a finding unsettled.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: session, continuity, handoff, verification, workflow
  locale: de
  source_locale: en
  source_commit: "8b7a744c081d84f1b2bccc7c75794635de1e6e16"
  fence_basis_commit: "8b7a744c081d84f1b2bccc7c75794635de1e6e16"
  translator: "(untranslated stub)"
  translation_date: "2026-11-05"
---

# Verify Continue Here

Run the full verification loop on a handoff draft, and stop at the first round that passes, or after round 3. It runs on the draft between `write-continue-here` Steps 3 and 4; that skill alone resolves the location and installs.

## When to Use

- The reader may not run `read-continue-here` (a human, an unattended loop), the next session is days away, or the single pass left a finding unsettled

## Inputs

- **Required**: The draft, its facts file, and at least one source: the previous edition, or the plan the work follows when there is none

## Procedure

### Step 1: Run Rounds Until the First Pass, Up to Round 3

From an almanac checkout or plugin install (`<almanac>` is two directories above the `realpath` of this skill's directory), run `workflows/verify-handoff.mjs` as `Workflow({ scriptPath: '<almanac>/workflows/verify-handoff.mjs', args: { drafts: [{ key, draft, facts, sources, context }], round: N } })`. An npm install ships no `workflows/`. A copy saved as `.claude/workflows/verify-handoff.js` runs by name but does not update itself; a `.mjs` there is not discovered (`tests/results/2026-10-14-workflow-loader-probe/RESULT.md`). `context` says what the file is, who consumes it, and which repositories the agents must not read. Coming from `write-continue-here` Step 3, start at round 2 with its findings file among `sources`; otherwise start at round 1. After each round, read the gate from the run's return value, not its log:

1. `blocking` is 0 and `coverage.complete` is true: **stop**. The gate is met, and each further round costs minutes and hundreds of thousands of tokens.
2. Otherwise, write the findings to `handoff-findings-rN.md` beside the facts file, apply them, list each repair in Context with the line it changed, add that file to `sources`, and run round N+1, **up to round 3**.

**Expected:** A round that returned `blocking` 0 and `coverage.complete` true, and one findings file per earlier round.

**On failure:** A draft without a facts file is dropped, and without a source the completeness lens is skipped, so coverage stays incomplete: fix the inputs rather than counting the round. Answer a finding you disagree with in the draft (tag the claim, cite the fact), never by deleting it.

### Step 2: Record the Passing Round

Set the header to `Verified: verify-handoff round N, 0 blocking, coverage complete`, with N the round that passed, and return to `write-continue-here` Step 4 to install.

**Expected:** The draft names its passing round, so `read-continue-here` skips the recheck of repaired lines; it still re-confirms the branch, `HEAD:` and the named PRs and issues.

**On failure:** If round 3 does not pass, stop and hand the open findings to the user. The user decides whether to keep working, or to install with `Verified: verify-handoff round 3, N blocking open, coverage <complete|incomplete>, findings <file>`, after listing each finding still open in Context with its line. Any value other than the full-gate one makes `read-continue-here` re-check the lines Context lists as repaired or open.

## Validation

- [ ] Every round had the facts file and a source, and each earlier findings file was among the next round's sources
- [ ] The loop stopped at the first round with `blocking` 0 and `coverage.complete` true, or after round 3; `Verified:` names what happened, and `write-continue-here` installed the draft

## Common Pitfalls

- **Running past the first pass, or reading the log**: the gate is `blocking` and `coverage.complete` in the return value, and a round after it passes costs minutes and tokens to re-open a closed question.

## Related Skills

- `write-continue-here` — drafts the handoff, verifies it once, and installs it
- `read-continue-here` — re-confirms every handoff, and re-checks its repaired and open lines when it stopped short of this gate
