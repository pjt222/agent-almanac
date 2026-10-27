## Run: 2026-10-27-decompose-into-pointer-units-harness

**Observer**: Claude (Opus 5.5 main loop) | **PR**: #1024, review rounds 1 and 2 | **Skill**: `decompose-into-pointer-units`

### Objective

The skill's central rule is that a stopped unit is never re-run, reworded or rerouted. Two review rounds found that the Workflow skeleton and the Step 10 ledger broke it.

- **Round 1**, at `51866b250`:
  - a stop detector that knew one wording;
  - "re-run as-is" for a unit with no result;
  - a gap round that ran a stopped unit's scope;
  - a ledger that counted any `unit=` token as a stop.
- **Round 2**, at `760f21e5d`: the same class one level down. The gap round could still run over a held id's scope, or while a verifier or critic had returned nothing, because the only guard was an instruction to the critic.

After round 2 the owner chose to remove the class rather than patch each path: **no gap runs in the run that found it.** Critics' gaps go to the owner batch, and a gap becomes a spec only in a later run, from an id the owner approved. This record checks the revision, and keeps the checks so a later edit can be re-measured.

### Environment

| Field | Value |
|-------|-------|
| Tools | `out/versions.txt`: node v26.11.1, bash 5.2.21, zsh 5.9, jq 1.7, ripgrep 14.1.0, GNU coreutils 9.4 |
| Heads measured | `51866b250` (round 1), `760f21e5d` (round 2), and the revision committed with this file |
| Date | 2026-10-27 |

### Method

Run from the repository root.

- **`harness.mjs <EXAMPLES.md>`** extracts the Workflow skeleton from EXAMPLES.md byte for byte and runs it against mocked `agent`, `pipeline`, `parallel`, `phase` and `log`. It has 14 scenarios and 42 rows, covering:
  - every unit clean;
  - a stop from each of the three named sources;
  - a missing `stop` field, and a clean line that says "never stopped";
  - a unit with no result;
  - a `raw` input spec, and a `cl` spec without `args.source`;
  - held ids, including one outside the run;
  - a verifier with no result, and a verifier stop;
  - an `owner` spec, with and without its unit;
  - a critic with no result, and a critic stop.

  The mock completeness critic is **disobedient**. It proposes every spec it sees no digest entry for, held or stopped or not, so no row can pass on the strength of the critic obeying its prompt. A missing result field is graded as a failure, not a crash.
- **`ledger.sh <SKILL.md> <bash|zsh>`** extracts SKILL.md's snippets byte for byte: the Step 1 tool check and `mech_sums`, and the Step 2, 7, 8 and 10 snippets. Each fence is checked for an anchor line, so a moved fence is refused (exit 2) rather than run in the wrong place. The Step 1 freeze lines (`cp`, `gh`) need a real repository and are not run. It drives these snippets on the test scenario's fixture through 14 rows:
  - the baseline;
  - a logged no-result;
  - an empty placeholder;
  - a report under a new id;
  - verifier and critic files;
  - an owner-approved gap spec, with and without a report;
  - a held spec, with and without a report;
  - a mechanical input changed after the freeze.
- **`mutants.py`** first requires both checks to be green on the unmutated files; otherwise it refuses (exit 2). It then breaks one guard at a time in a temporary copy. A mutant counts as killed only when the check exits 1 with a failing row that names the guard's own row. Any other non-zero exit is INCONCLUSIVE.

### Results

| Check | Output | Result |
|---|---|---|
| `harness.mjs` on the skeleton at `51866b250` | `out/harness-at-51866b250.txt` | 34 of 42 rows FAIL |
| `harness.mjs` on the skeleton at `760f21e5d` | `out/harness-at-760f21e5d.txt` | 16 of 42 rows FAIL, including "no gap unit runs over held scope" and the verifier no-result rows: the round-2 blocking findings, reproduced |
| `harness.mjs` on the revision | `out/harness-revised.txt` | 42 of 42 PASS |
| `ledger.sh` under bash and zsh | `out/ledger-bash.txt`, `out/ledger-zsh.txt` | 14 of 14 PASS under each |
| `mutants.py` | `out/mutants.txt` | baseline green; 12 of 12 KILLED, each on its named row |

| Mutant | Guard removed | Killed on the row |
|---|---|---|
| M1 | `stop !== 'none'`, narrowed to one source | stop reviewer: recorded as stopped |
| M2 | the verifier stop check | S11 verifier stop: recorded in verifier_stopped |
| M3 | the spec-kind allowlist | S8 raw input spec: refused before any agent |
| M4 | the `held` filter | S9 held id: never launched |
| M5 | recording a verifier no-result | S10 verifier no result: recorded in verifier_no_result |
| M6 | the owner-spec guard | an owner spec without its unit is refused |
| M7 | dropping a stopped critic's gaps | S14 critic stop: its gaps are not used |
| M8 | (inserted) a gap unit run in the same run | no gap unit runs (7 rows) |
| L1 | the anchor on `STOP-<n> unit=` | no-result stays unaccounted |
| L2 | `! -empty` | empty file is not reported |
| L3 | the checksum re-check | changed input refused |
| L4 | subtracting held ids | held spec is held, not unaccounted |

### Instrument history

Four defects in this record's own instruments were found and fixed before any number above was recorded:

1. `mutants.py` once scored a crash of the check as a kill. It now reports INCONCLUSIVE, and requires a green baseline and a failing row of the right name.
2. The round-1 harness's mock critic obeyed its prompt, so a gap over held scope passed. Review round 2 found this. The critic is now disobedient.
3. The harness crashed on a skeleton that lacked a result field, and a crash exits like a failure. It now grades the missing field.
4. `ledger.sh` extracted fences by position. It now checks an anchor line in each one.

### Limits

- The harness mocks the Workflow runtime. How the live runtime surfaces a classifier halt was not measured. The no-result rule does not depend on it: it re-runs only an enumerated transient failure, and treats anything naming a policy, refusal, block or hook as a stop.
- The mock critic is a literal program, not a model. Round 1's refuter reproduced the reroute with a real model as the critic. Under the revision no gap runs in the run that found it, whatever a critic proposes.
- Planning mode (`tests/scenarios/skills/test-decompose-into-pointer-units-planning.md`) launches no agent, so it does not exercise the skeleton. The harness does.
