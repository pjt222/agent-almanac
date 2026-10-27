## Run: 2026-10-27-decompose-into-pointer-units-harness

**Observer**: Claude (Opus 5.5 main loop) | **PR**: #1024, review rounds 1 to 3 | **Skill**: `decompose-into-pointer-units`

### Objective

The skill's central rule is that a stopped unit is never re-run, reworded or rerouted. Three review rounds found the Workflow skeleton, the snippets and the Step 10 ledger breaking it, each round one level further down.

- **Round 1**, at `51866b250`:
  - a stop detector that knew one wording;
  - "re-run as-is" for a unit with no result;
  - a gap round that ran a stopped unit's scope;
  - a ledger that counted any `unit=` token as a stop.
- **Round 2**, at `760f21e5d`: the gap round could still run over a held id's scope, or while a verifier or critic had returned nothing, because the only guard was an instruction to the critic.
- **Round 3**, at `d85a189d7`: no blocking finding survived refutation, but the class moved across runs and into the later-run snippets:
  - a pilot re-run or cluster restart re-launched a stopped verifier or critic;
  - a `held` argument of the wrong type held nothing;
  - the gap deriver and the owner-spec check had guards in prose only, and the owner check exited 0 after printing a refusal;
  - a re-derivation at another chunk size moved stopped lines into a spec that still ran, and the ledger stayed green;
  - a release of a hold could not be recorded.

After round 2 the owner chose to remove the class rather than patch each path: **no gap runs in the run that found it**. Critics' gaps go to the owner batch, and a gap becomes a spec only in a later run, from a topic or id the owner approved. After round 3 the owner chose **owner-gated re-runs**: once any run in the job has recorded a stop or a missing result, nothing that already ran is launched again unless the owner names it. The one exception is a no-result whose transcript shows only an enumerated transient failure. This record checks the revision, and keeps the checks so a later edit can be re-measured.

### Environment

| Field | Value |
|-------|-------|
| Tools | `out/versions.txt`: node v26.11.1, bash 5.2.21, zsh 5.9, jq 1.7, ripgrep 14.1.0, GNU coreutils 9.4 |
| Heads measured | `51866b250` (round 1), `760f21e5d` (round 2), `d85a189d7` (round 3), and the revision committed with this file |
| Date | 2026-10-27 |

### Method

Run from the repository root.

- **`harness.mjs <EXAMPLES.md>`** extracts the Workflow skeleton from EXAMPLES.md byte for byte and runs it against mocked `agent`, `pipeline`, `parallel`, `phase` and `log`. It has 15 scenarios and 67 rows, covering:
  - every unit clean, with every gap carrying an id, a topic and a `covers_held` flag, and every critic schema requiring the flag;
  - a stop from each of the three named sources, never listed as a no-result, and told to every critic;
  - a missing `stop` field, and a clean line that says "never stopped";
  - a unit with no result, told to the critics as held;
  - a `raw` input spec, and a `cl` spec without `args.source`;
  - held ids, including one outside the run, and a `held` argument that is not an array;
  - a verifier with no result, and a verifier stop;
  - an `owner` spec, without its unit, and with an answer that is not a `STOP-<n>`;
  - a critic with no result, and a critic stop;
  - for each stopped or no-result unit, verifier and critic: that it was launched exactly once, that its log line says the cause is undetermined or not to re-run it, and that its returned id is the basename of the file it writes.

  The mock completeness critic is **disobedient**. It proposes every spec it sees no digest entry for, held or stopped or not, so no row can pass on the strength of the critic obeying its prompt. A missing result field is graded as a failure, not a crash.
- **`ledger.sh <SKILL.md> <bash|zsh>`** extracts nine SKILL.md snippets, each the one fence holding its anchor, so a moved or duplicated fence is refused (exit 2) rather than run in the wrong place:
  - the Step 1 tool check and `mech_sums`;
  - the Step 2 deriver, coverage checks and work-list record;
  - the Step 7 pilot listing;
  - the Step 8 stop line, no-result line and release snippet;
  - the Step 10 ledger.

  They run byte for byte with two departures: the Step 2 snippet runs at the scenario's chunk 4 (one `sed` on its argument), and of Step 1 only the tool check and `mech_sums` run, because the `cp` and `gh` lines need a real repository; the line that writes `MECH-SHA256SUMS` is re-typed. It drives them on the test scenario's fixture through 29 rows:
  - the baseline, and a second work list refused;
  - a no-result whose partial moves to `partials/`, and an empty placeholder;
  - a hold, a release refused without an Answered line or on a stopped id, a release from an Answered line, the re-run after it, and a release refused after a report;
  - a transient release, refused the second time;
  - a hand-written release that does not lift a stop;
  - a report under a new id, and verifier, critic and lead files that are not reports;
  - a recorded gap spec, with and without a report;
  - a held spec, with and without a report, and a release refused after the held run;
  - a spec file added without being recorded, a re-derivation at chunk 5, and a mechanical input changed after the freeze.
- **`derivers.sh <EXAMPLES.md> <bash|zsh>`** runs six EXAMPLES.md snippets byte for byte, each the one bash fence holding its anchor, on small fixtures. Its 35 rows cover:
  - the count proofs and ledger-safe ids of the rows and item derivers;
  - recording a gaps file, once, and refusing one without `covers_held`;
  - the gap deriver: an approved topic plus a single id, a marked gap and a flagged gap kept out of the topic, a flagged gap approved by its id, refusals for a marked, unknown or space-padded id, an unknown topic, a missing marks file, an existing output and a changed gaps file, each refusal asserting the exit code and that nothing was written;
  - the owner-spec check: a scope on its Answered line accepted and recorded, and refused (exit 1, nothing recorded) when it is quoted only in Open, under a nested or later heading, with the wrong `STOP-<n>`, without a citation or under the wrong unit;
  - the held list from the unit log, and the cluster list without its held ids.
- **`mutants.py`** first requires all three checks to be green on the unmutated files; otherwise it refuses (exit 2). It then breaks one guard at a time in a temporary copy. A mutant counts as killed only when the check exits 1 with a failing row that names the guard's own row. Any other non-zero exit is INCONCLUSIVE.

### Results

| Check | Output | Result |
|---|---|---|
| `harness.mjs` on the skeleton at `51866b250` | `out/harness-at-51866b250.txt` | 52 of 67 rows FAIL |
| `harness.mjs` on the skeleton at `760f21e5d` | `out/harness-at-760f21e5d.txt` | 30 of 67 rows FAIL, including "no gap unit runs over held scope" and the verifier no-result rows: the round-2 blocking findings, reproduced |
| `harness.mjs` on the skeleton at `d85a189d7` | `out/harness-at-d85a189d7.txt` | 18 of 67 rows FAIL: the round-3 rows (held guard, owner answer, `covers_held`, returned ids, log text) |
| `harness.mjs` on the revision | `out/harness-revised.txt` | 67 of 67 PASS |
| `derivers.sh` under bash and zsh | `out/derivers-bash.txt`, `out/derivers-zsh.txt` | 35 of 35 PASS under each |
| `ledger.sh` under bash and zsh | `out/ledger-bash.txt`, `out/ledger-zsh.txt` | 29 of 29 PASS under each |
| `mutants.py` | `out/mutants.txt` | baseline green; 37 of 37 KILLED, each on its named row |

The eight "ran once" rows pass at all three control heads: no earlier skeleton re-ran anything in code. They discriminate only through mutants M13 to M15, so the control FAIL counts above do not include them.

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
| M9 | keeping a stopped unit out of `no_result` | the stopped unit is not listed under no_result |
| M10 | no-result ids on the HELD line | S7: the completeness critic is told the no-result id is held |
| M11 | the `held` type guard | S15: a string is refused before any agent |
| M12 | binding an owner answer to a `STOP-<n>` | an owner spec whose answer is not a STOP-<n> is refused |
| M13 | (inserted) a no-result unit retried in code | S7: the unit ran once |
| M14 | (inserted) a no-result verifier retried in code | S10: 'verify CL-B#1' ran once |
| M15 | (inserted) a stopped or no-result critic re-run in code | S14: 'completeness R1' ran once |
| M16 | the verifier no-result log line | S10: the log says the cause is undetermined |
| M17 | `covers_held` required of a gap | every critic schema requires covers_held |
| D1 | keeping a marked gap out of its topic | the marked gap and the flagged gap are not derived through the topic |
| D2 | the owner check's Answered-section restriction | owner: a scope quoted only in Open is refused |
| D3 | keeping a flagged gap out of its topic | the marked gap and the flagged gap are not derived through the topic |
| D4 | refusing an approved marked id | gaps: an approved marked id is refused |
| D5 | the owner check's exit 1 | owner: a scope quoted only in Open is refused with exit 1 |
| D6 | subtracting released ids from the held list | held: stopped ids and unreleased no-result and held ids |
| D7 | the gap deriver's work-list check | gaps: a gaps file changed after it was recorded is refused |
| D8 | refusing a gaps file without `covers_held` | record: a list without covers_held is refused |
| L1 | the anchor on `STOP-<n> unit=` | no-result: its partial moves to partials/ and it stays unaccounted |
| L2 | `! -empty` | empty file is not reported |
| L3 | the mechanical checksum re-check | changed input refused |
| L4 | subtracting held ids | held spec is held, not unaccounted |
| L5 | the work-list check | re-derivation at chunk 5 after launch is refused |
| L6 | refusing a second work list | a second work list is refused |
| L7 | subtracting released ids in Step 10 | released and not yet re-run is unaccounted |
| L8 | refusing a release after a report | release after a report is refused |
| L9 | moving a no-result partial | no-result: its partial moves to partials/ |
| L10 | refusing a release of a stopped id | release of a stopped id is refused |
| L11 | refusing a second transient release | a transient release is logged once |
| L12 | the release's Answered-section restriction | release by owner with no Answered line is refused |

### Instrument history

Seven defects in this record's own instruments were found and fixed before any number above was recorded:

1. `mutants.py` once scored a crash of the check as a kill. It now reports INCONCLUSIVE, and requires a green baseline and a failing row of the right name.
2. The round-1 harness's mock critic obeyed its prompt, so a gap over held scope passed. Review round 2 found this. The critic is now disobedient.
3. The harness crashed on a skeleton that lacked a result field, and a crash exits like a failure. It now grades the missing field.
4. `ledger.sh` and `derivers.sh` extracted fences by position. They now take the one fence holding each anchor.
5. The owner check's Open-section arm passed for the wrong reason: the line-start anchor refused it, not the section restriction. D2 came back INCONCLUSIVE and showed this; the fixture's Open line now has the Answered form.
6. The space-padded approved id lost its trailing space when the script was written, so that arm tested an ordinary id. The fixtures are now `$'...'` strings.
7. The release arm on a stopped id was answered first by the report check, because the fixture's stopped unit has a partial. The arm now moves the partial aside.

### Limits

- The harness mocks the Workflow runtime. How the live runtime surfaces a classifier halt was not measured in a run of this skill. The no-result rule re-runs only an enumerated transient failure with nothing else in the transcript, treats anything naming a policy, refusal, block or hook as a stop, and holds any no-result whose cause cannot be established. It therefore depends on a halt leaving some trace other than a transient failure.
- The mock critic is a literal program, not a model. Round 1's refuter reproduced the reroute with a real model as the critic. Under the revision no gap runs in the run that found it, whatever a critic proposes.
- The ledger counts by id. A re-launch of reported work under its own id, after the owner named it, leaves no trace in it; Step 8 logs it as `RERUN`. A stopped unit's partial stays at its report path, so a re-run under the stopped id that overwrites it is invisible to the ledger.
- Step 8 item 6's overlap test for a later spec is a reading, not a computation. The work-list record catches a re-derivation, not a hand-chosen later spec over held pointers; the gap deriver's marks and `covers_held` flag are the guards on that path.
- A `RELEASED` line written by hand, not by the snippet, bypasses the snippet's refusals. A hand-written release of a stopped id changes nothing (ledger row), but one written after a held run hides `held_ran`.
- Planning mode (`tests/scenarios/skills/test-decompose-into-pointer-units-planning.md`) launches no agent, so it does not exercise the skeleton. The harness does.
