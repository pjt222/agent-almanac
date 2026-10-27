## Run: 2026-10-27-decompose-into-pointer-units-harness

**Observer**: Claude (Opus 5.5 main loop) | **PR**: #1024, review round 1 | **Skill**: `decompose-into-pointer-units`

### Objective

Review round 1 of #1024 found that the skill's central rule, that a stopped unit is never re-run, reworded or rerouted, did not hold in the shipped Workflow skeleton or in the Step 10 ledger:

- a reviewer or policy-hook stop was not detected, because the stop detector was a regex that knew one wording;
- a unit with no result was logged as "re-run as-is", although the runtime returns no result for a skipped subagent too;
- the completeness critic proposed a stopped unit's scope as a gap, and the gap round ran it;
- the ledger counted any `unit=` token as a stop, so a logged no-result disappeared from `unaccounted`.

This record checks the revision against those paths, and keeps the checks so a later edit can be re-measured.

### Environment

| Field | Value |
|-------|-------|
| Tools | `out/versions.txt`: node v26.11.1, bash 5.2.21, zsh 5.9, jq 1.7, ripgrep 14.1.0, GNU coreutils 9.4 |
| Reviewed head | `51866b250` (the skeleton before the revision) |
| Date | 2026-10-27 |

### Method

Run from the repository root.

- `harness.mjs <EXAMPLES.md>` extracts the Workflow skeleton from EXAMPLES.md byte for byte and runs it against mocked `agent`, `pipeline`, `parallel`, `phase` and `log`. It has eleven scenarios: every unit clean; a stop from each of the three sources the skill names; a summary without a `stop` field; a clean line that says "never stopped"; a unit with no result; a `raw` input spec; a held id; a gap unit with no result; and a `cl` spec without `args.source`. The mock completeness critic proposes every spec it sees no digest entry for, unless the prompt marks that id as held. That is a literal reading of its prompt, and it is how the reroute was found.
- `ledger.sh <SKILL.md> <bash|zsh>` extracts the Step 1, 2, 7, 8 and 10 snippets from SKILL.md byte for byte. It runs them on the test scenario's fixture: a baseline with one stop, a logged no-result, an empty placeholder file, a report under a new id, verifier and critic files, a gap unit with and without a report, and a mechanical input changed after the freeze.
- `mutants.py` breaks one guard at a time in a temporary copy and runs the matching check. A mutant counts as killed only when the check exits 1 with a failing row. Any other non-zero exit is reported as INCONCLUSIVE.

### Results

| Check | Output | Result |
|---|---|---|
| `harness.mjs` on the skeleton at `51866b250` | `out/harness-at-51866b250.txt` | the control: 21 of 30 assertions FAIL. The all-clean scenario passes, a safety-classifier stop is recorded and gets no verifier as it did at that head, and every other stop-handling path fails |
| `harness.mjs` on the revised skeleton | `out/harness-revised.txt` | 30 PASS |
| `ledger.sh` under bash | `out/ledger-bash.txt` | 12 PASS |
| `ledger.sh` under zsh | `out/ledger-zsh.txt` | 12 PASS |
| `mutants.py` | `out/mutants.txt` | 7 of 7 KILLED |

| Mutant | Guard removed | Killed by |
|---|---|---|
| M1 | the gap-round hold | the four "no gap unit runs" rows |
| M2 | `stop !== 'none'`, narrowed to one source | the reviewer and policy-hook rows, and the missing-field row (9) |
| M3 | the refusal of a `raw` input spec | S8 |
| M4 | the `held` filter | S9 |
| L1 | the anchor on `STOP-<n> unit=` in Step 10 | six ledger rows, which read `stopped=2 unaccounted=0` for a logged no-result, as round 1 measured |
| L2 | `! -empty` in Step 10 | the empty-placeholder row |
| L3 | the checksum re-check in Step 10 | the changed-input row |

The instrument was checked as well. A copy whose `ledger.sh` cannot run reports L1 to L3 as INCONCLUSIVE, not KILLED. An earlier version of `mutants.py` scored that crash as a kill. It was found in this run and fixed before any number above was recorded.

### Limits

- The harness mocks the Workflow runtime. What `agent()` returns when a safety classifier halts a subagent mid-turn was not measured. The skill now treats any missing result as having an undetermined cause, so it does not depend on that answer.
- The mock critic is a literal reading of the prompt, not a model. Round 1's refuter reproduced the reroute with a real model as the critic. This record does not repeat that.
- Planning mode (`tests/scenarios/skills/test-decompose-into-pointer-units-planning.md`) launches no agent, so it does not exercise the skeleton. The harness does.
