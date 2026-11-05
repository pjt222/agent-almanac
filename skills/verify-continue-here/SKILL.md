---
name: verify-continue-here
description: >
  Verify a CONTINUE_HERE.md draft to the full gate before it is installed:
  rounds of the verify-handoff workflow against a facts file and at least one
  source, applying findings between rounds and stopping at the first round
  with no blocking finding and complete coverage. Use when the reader may not
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
---

# Verify Continue Here

Run the full verification loop on a handoff draft, and stop at the first round that passes. It runs on the draft between `write-continue-here` Steps 3 and 4; that skill alone resolves the location and installs.

## When to Use

- The reader may not run `read-continue-here` (a human, an unattended loop), the next session is days away, or the single pass left a finding unsettled

## Inputs

- **Required**: The draft, its facts file, and at least one source: the previous edition, or the plan the work follows when there is none

## Procedure

### Step 1: Run Rounds Until the First Pass

From an almanac checkout or plugin install (`<almanac>` is two directories above the `realpath` of this skill's directory), run `workflows/verify-handoff.mjs` as `Workflow({ scriptPath: '<almanac>/workflows/verify-handoff.mjs', args: { drafts: [{ key, draft, facts, sources, context }], round: N } })`. An npm install ships no `workflows/`. A copy saved as `.claude/workflows/verify-handoff.js` runs by name but does not update itself; a `.mjs` there is not discovered (`tests/results/2026-10-14-workflow-loader-probe/RESULT.md`). `context` says what the file is, who consumes it, and which repositories the agents must not read. Coming from `write-continue-here` Step 3, start at round 2 with its findings file among `sources`; otherwise start at round 1. After each round, read the gate from the run's return value, not its log:

1. `blocking` is 0 and `coverage.complete` is true: **stop**. A further round costs minutes and hundreds of thousands of tokens, and its only effect is to re-open a question the gate has closed.
2. Otherwise, write the findings to `handoff-findings-rN.md` beside the facts file, apply them, add that file to `sources`, and run round N+1.

**Expected:** A round that returned `blocking` 0 and `coverage.complete` true, and one findings file per earlier round.

**On failure:** A draft without a facts file is dropped, and without a source the completeness lens is skipped, so coverage stays incomplete: fix the inputs rather than counting the round. Answer a finding you disagree with in the draft (tag the claim, cite the fact), never by deleting it.

### Step 2: Record the Passing Round

Set the header to `Verified: verify-handoff round N, 0 blocking, coverage complete`, with N the round that passed, and return to `write-continue-here` Step 4 to install.

**Expected:** The draft names its passing round, and `read-continue-here` will act on it without re-confirming.

**On failure:** If the loop is not converging, stop and hand the open findings to the user; installing with an honest single-pass `Verified:` value is better than an unbounded loop.

## Validation

- [ ] Every round had the facts file and a source, and each earlier findings file was among the next round's sources
- [ ] The loop stopped at the first round with `blocking` 0 and `coverage.complete` true, `Verified:` names it, and `write-continue-here` installed the draft

## Common Pitfalls

- **Running past the first pass, or reading the log**: the gate is `blocking` and `coverage.complete` in the return value, and a round after it passes costs minutes and tokens to re-open a closed question.

## Related Skills

- `write-continue-here` — drafts the handoff, verifies it once, and installs it
- `read-continue-here` — re-confirms a handoff that stopped short of this gate
