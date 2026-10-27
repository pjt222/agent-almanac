## Run: 2026-10-27-decompose-into-pointer-units-harness

**Observer**: Claude (Opus 5.5 main loop) | **PR**: #1024, review rounds 1 to 4 | **Skill**: `decompose-into-pointer-units`

### Objective

The skill's central rule is that a stopped unit is never re-run, reworded or rerouted. Four review rounds found the Workflow skeleton, the snippets and the Step 10 ledger breaking it, each round one level further down.

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
- **Round 4**, at `4164c5457`: one blocking finding, in round 3's own fix. The held list and the ledger treated a `RELEASED` line as a property of the id rather than an event. A hold that a later stop put on a released id was dropped, and the id launched over the stopped unit's pointers with the ledger green. With it:
  - the release snippet's transient arm released ids that had no no-result;
  - the launch snippet relisted units that had already reported after a stop;
  - a new run directory started with an empty unit log;
  - a failed `mv` was logged as a no-result.

After round 2 the owner chose to remove the class rather than patch each path: **no gap runs in the run that found it**. Critics' gaps go to the owner batch, and a gap becomes a spec only in a later run, from a topic or id the owner approved. After round 3 the owner chose **owner-gated re-runs**: once any run in the job has recorded a stop or a missing result, nothing that already ran is launched again unless the owner names it. The one exception is a no-result whose transcript shows only an enumerated transient failure. After round 4 the owner extended that exception to verifiers and critics: each re-runs once, alone, through the skeleton's `rerun` argument and the exact prompt its run returned. The owner also took back three guards round 4 had deferred: an owner spec's id is `OW-<n>` and new to the work list, one `STOP-<n>` authorises one owner spec, and an id in two spec entries is refused at launch and in Step 10. This record checks the revision, and keeps the checks so a later edit can be re-measured.

### Environment

| Field | Value |
|-------|-------|
| Tools | `out/versions.txt`: node v26.11.1, bash 5.2.21, zsh 5.9, jq 1.7, ripgrep 14.1.0, GNU coreutils 9.4 |
| Heads measured | `51866b250` (round 1), `760f21e5d` (round 2), `d85a189d7` (round 3), `4164c5457` (round 4), and the revision committed with this file |
| Date | 2026-10-27 |

### Method

Run from the repository root.

- **`harness.mjs <EXAMPLES.md>`** extracts the Workflow skeleton from EXAMPLES.md byte for byte and runs it against mocked `agent`, `pipeline`, `parallel`, `phase` and `log`. It has 19 scenarios and 96 rows, covering:
  - every unit clean, with every gap carrying an id, a topic and a `covers_held` flag, and every critic schema requiring the flag;
  - a stop from each of the three named sources, never listed as a no-result, told to every critic, and logged as not to be re-run;
  - a missing `stop` field, and a clean line that says "never stopped";
  - a unit with no result, told to the critics as held;
  - a `raw` input spec, and a `cl` spec without `args.source`;
  - held ids, including one outside the run, and a `held` argument that is not an array;
  - a verifier with no result, and a verifier stop;
  - an `owner` spec, without its unit, and with an answer that is not a `STOP-<n>`;
  - a critic with no result, and a critic stop;
  - for each stopped or no-result unit, verifier and critic: that it was launched exactly once, that its log line says the cause is undetermined or not to re-run it, and that its returned id is the basename of the file it writes;
  - `rerun_prompts`: the exact launched prompt for a verifier or critic with no result, and nothing for a unit, a stopped verifier or a stopped critic;
  - a `rerun` of a verifier and of a critic: one agent, the returned prompt byte for byte, its own schema, a verdict or gaps under the new tag, and a stop or a second no-result recorded; and a rerun of a unit id, with specs, without its prompt or without a tag refused;
  - an approved gap spec, whose prompt points at the recorded gaps file.

  The mock completeness critic is **disobedient**. It proposes every spec it sees no digest entry for, held or stopped or not, so no row can pass on the strength of the critic obeying its prompt. A missing result field is graded as a failure, not a crash.
- **`ledger.sh <SKILL.md> <bash|zsh>`** extracts nine SKILL.md snippets, each the one fence holding its anchor, so a moved or duplicated fence is refused (exit 2) rather than run in the wrong place:
  - the Step 1 tool check, `mech_sums` and the unit-log block;
  - the Step 2 deriver, coverage checks and work-list record;
  - the Step 7 pilot listing;
  - the Step 8 stop line, no-result line and release snippet;
  - the Step 10 ledger.

  They run byte for byte with two departures: the Step 2 snippet runs at the scenario's chunk 4 (one `sed` on its argument), and of Step 1 only the tool check, `mech_sums` and the unit-log block run, because the `cp` and `gh` lines need a real repository; the line that writes `MECH-SHA256SUMS` is re-typed. It drives them on the test scenario's fixture through 47 rows:
  - the baseline, and a second work list refused;
  - the Step 1 unit log: refused without `PRIOR_RUN`, started empty with `none`, copied into a later run directory whose ledger still counts the stop, and never overwritten;
  - a no-result whose partial moves to `partials/`, a partial that cannot be moved (a `mv` without `--backup`) refused with nothing logged, and an empty placeholder;
  - a release refused without an Answered line or on a stopped id, a release from an Answered line, the re-run after it, and a release refused after a report;
  - a transient release, refused the second time, and a transient release of a verifier's no-result;
  - releases refused with no unit log, for a held id with no no-result, for a no-result held over a stop since, without a transcript file, after an owner release and a second no-result, and from an Answered line already used;
  - Step 10 refused with no unit log;
  - a hand-written release that does not lift a stop;
  - a report under a new id, and verifier, critic and lead files that are not reports;
  - a recorded gap spec, with and without a report;
  - a held spec, with and without a report, a release refused after the held run, a release that lifts the hold, and a hold logged after the release that holds the id again;
  - a re-derivation at chunk 5 written to a new, recorded file, refused for the id it shares with the first;
  - a spec file added without being recorded, a re-derivation at chunk 5 in place, and a mechanical input changed after the freeze.
- **`derivers.sh <EXAMPLES.md> <bash|zsh>`** runs six EXAMPLES.md snippets byte for byte, each the one bash fence holding its anchor, on small fixtures. Its 45 rows cover:
  - the count proofs and ledger-safe ids of the rows and item derivers;
  - recording a gaps file, once, and refusing one without `covers_held`;
  - the gap deriver: an approved topic plus a single id, a marked gap and a flagged gap kept out of the topic, a flagged gap approved by its id, refusals for a marked, unknown or space-padded id, an unknown topic, a missing marks file, an existing output and a changed gaps file, each refusal asserting the exit code and that nothing was written;
  - the owner-spec check: a scope on its Answered line accepted and recorded, and refused (exit 1, nothing recorded) when it is quoted only in Open, under a nested or later heading, with the wrong `STOP-<n>`, without a citation or under the wrong unit; and refused for an id that is not `OW-<n>` or is already in a spec file, and for a `STOP-<n>` that a recorded owner spec, under any file name, or a second spec in the same file already cites;
  - the launch snippet: the held list ordered in time (a no-result or hold after a release holds the id again), units that reported left out after a stop unless a `RERUN` line names them for this tag, every unit listed when the job has no stop, and refusals for an unrecorded cluster file, an id in two spec files, a recorded cluster file that is not a spec list, and a missing unit log.
- **`mutants.py`** first requires all three checks to be green on the unmutated files; otherwise it refuses (exit 2). It then breaks one guard at a time in a temporary copy. A mutant counts as killed only when the check exits 1 with a failing row that names the guard's own row. Any other non-zero exit is INCONCLUSIVE. It scores `derivers.sh` and `ledger.sh` under zsh only.

### Results

| Check | Output | Result |
|---|---|---|
| `harness.mjs` on the skeleton at `51866b250` | `out/harness-at-51866b250.txt` | 80 of 96 rows FAIL |
| `harness.mjs` on the skeleton at `760f21e5d` | `out/harness-at-760f21e5d.txt` | 56 of 96 rows FAIL, including "no gap unit runs over held scope" and the verifier no-result rows: the round-2 blocking findings, reproduced |
| `harness.mjs` on the skeleton at `d85a189d7` | `out/harness-at-d85a189d7.txt` | 44 of 96 rows FAIL, including the round-3 rows (held guard, owner answer, `covers_held`, returned ids, log text) |
| `harness.mjs` on the skeleton at `4164c5457` | `out/harness-at-4164c5457.txt` | 27 of 96 rows FAIL: the round-4 rows (`rerun_prompts`, `rerun`, the checker log text) |
| `harness.mjs` on the revision | `out/harness-revised.txt` | 96 of 96 PASS |
| `derivers.sh` on EXAMPLES.md at `4164c5457`, bash and zsh | `out/derivers-at-4164c5457-bash.txt`, `-zsh.txt` | 13 of 45 rows FAIL under each: the time-ordered held list (AD4-4), the launch rows and the owner-spec id and reuse rows |
| `derivers.sh` on the revision, bash and zsh | `out/derivers-bash.txt`, `out/derivers-zsh.txt` | 45 of 45 PASS under each |
| `ledger.sh` on SKILL.md at `4164c5457`, bash and zsh | `out/ledger-at-4164c5457-bash.txt`, `-zsh.txt` | 20 of 47 rows FAIL under each, including "a hold logged after a release holds the id again" (AD4-4 in the ledger) |
| `ledger.sh` on the revision, bash and zsh | `out/ledger-bash.txt`, `out/ledger-zsh.txt` | 47 of 47 PASS under each |
| `mutants.py` | `out/mutants.txt` | baseline green; 70 of 70 KILLED, each on its named row |

The harness FAIL sets nest: every row failing at `4164c5457` also fails at `d85a189d7`, every row failing there also fails at `760f21e5d`, and every row failing there also fails at `51866b250`. Each head fails its own round's rows and every later round's, so the counts are not one round's findings each. The eight "ran once" rows pass at all four control heads, because no earlier skeleton re-ran anything in code; mutants M13 to M15, Ma and Mb fail each of them.

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
| M18 | the launched prompt as the rerun prompt | S10: its rerun prompt is the prompt it was launched with |
| M19 | no rerun prompt for a stopped critic | S14 critic stop: a stopped critic has no rerun prompt |
| M20 | the early return of a rerun | S16 rerun verifier: exactly one agent runs |
| M21 | refusing a rerun of a unit id | S18: a unit id is refused before any agent |
| M22 | refusing a rerun with specs | S18: a rerun with specs is refused before any agent |
| M23 | the verifier schema for a verifier rerun | S16: it runs with the verifier schema |
| M24 | not counting a stopped rerun | S17 rerun critic: a stop is recorded and its gaps not used |
| M25 | "do not re-run" on the stopped-unit log line | stop reviewer: the log says not to re-run the stopped unit |
| M26 | the gap spec's pointer to the recorded file | S19 gap spec: the prompt points at the recorded gaps file |
| Ma | (inserted) a stopped unit re-run in code | stop reviewer: the stopped unit ran once |
| Mb | (inserted) a stopped verifier re-run in code | S11 verifier stop: 'verify CL-B#1' ran once |
| D1 | keeping a marked gap out of its topic | the marked gap and the flagged gap are not derived through the topic |
| D2 | the owner check's Answered-section restriction | owner: a scope quoted only in Open is refused |
| D3 | keeping a flagged gap out of its topic | the marked gap and the flagged gap are not derived through the topic |
| D4 | refusing an approved marked id | gaps: an approved marked id is refused |
| D5 | the owner check's exit 1 | owner: a scope quoted only in Open is refused with exit 1 |
| D6 | a release lifting the lines before it | held: stopped ids and ids whose last no-result, hold or release line is not a release |
| D7 | the gap deriver's work-list check | gaps: a gaps file changed after it was recorded is refused |
| D8 | refusing a gaps file without `covers_held` | record: a list without covers_held is refused |
| D9 | (replaced) the time order of the held list, by round 3's form | held: a no-result or a hold logged after a release holds the id again |
| D10 | leaving reported units out after a stop | launch: after a stop or no-result, a unit that reported is not relaunched |
| D11 | binding a `RERUN` line to its tag | launch: a RERUN line for another run does not |
| D12 | the stop condition on leaving reported units out | launch: with no stop or no-result in the job, reported units relaunch |
| D13 | refusing an unreadable cluster file | launch: a recorded cluster file that is not a spec list is refused (on its message: without it, the all-files id check refuses the same file) |
| D14 | an owner spec id of the form `OW-<n>` | owner: an id that is not OW-<n> is refused |
| D15 | refusing an owner spec id already in a spec file | owner: an id already in the work list is refused |
| D16 | one owner spec per `STOP-<n>` | owner: two owner specs citing one STOP-<n> in one file are refused |
| D17 | reading the recorded owner specs for used `STOP-<n>`s | owner: a STOP-<n> already used by a recorded owner spec is refused |
| D18 | refusing an unrecorded cluster file at launch | launch: an unrecorded cluster file is refused |
| D19 | refusing an id in two spec files at launch | launch: an id in two spec files is refused |
| L1 | the anchor on `STOP-<n> unit=` | no-result: its partial moves to partials/ and it stays unaccounted |
| L2 | `! -empty` | empty file is not reported |
| L3 | the mechanical checksum re-check | changed input refused |
| L4 | subtracting held ids | held spec is held, not unaccounted |
| L5 | the work-list check | re-derivation at chunk 5 after launch is refused |
| L6 | refusing a second work list | a second work list is refused |
| L7 | a release lifting the hold before it, in Step 10 | a hold released from an unused Answered line is unaccounted until it runs |
| L8 | refusing a release after a report | release after a report is refused |
| L9 | moving a no-result partial | no-result: its partial moves to partials/ |
| L10 | refusing a release of a stopped id | release of a stopped id is refused |
| L11 | binding a transient release to a first, unreleased no-result | a transient release is logged once |
| L12 | the release's Answered-section restriction | release by owner with no Answered line is refused |
| L13 | (replaced) the time order in Step 10, by round 3's form | a hold logged after a release holds the id again |
| L14 | the transient release's transcript check | a transient release naming no transcript file is refused |
| L15 | one release per Answered line | an Answered line releases once |
| L16 | the release's unit-log check | release: no unit log is refused, and none is started |
| L17 | Step 10's unit-log check | ledger: no unit log is refused |
| L18 | copying the unit log into a later run directory | step 1: with the carried log, a later run directory still counts the stop |
| L19 | keeping an existing unit log | step 1: an existing unit log is not overwritten |
| L20 | refusing a partial that `mv` could not move | no-result: a partial that cannot be moved is refused, and nothing is logged |
| L21 | refusing a transient release over a hold logged since | a transient release of a no-result held over a stop since is refused |
| L22 | refusing a transient release of a second no-result | a transient release after an owner release and a second no-result is refused |
| L23 | refusing an id in two spec entries in Step 10 | an id in two spec entries is refused, though both files are recorded |

### Instrument history

Fourteen defects in this record's own instruments were found and fixed before any number above was recorded:

1. `mutants.py` once scored a crash of the check as a kill. It now reports INCONCLUSIVE, and requires a green baseline and a failing row of the right name.
2. The round-1 harness's mock critic obeyed its prompt, so a gap over held scope passed. Review round 2 found this. The critic is now disobedient.
3. The harness crashed on a skeleton that lacked a result field, and a crash exits like a failure. It now grades the missing field.
4. `ledger.sh` and `derivers.sh` extracted fences by position. They now take the one fence holding each anchor.
5. The owner check's Open-section arm passed for the wrong reason: the line-start anchor refused it, not the section restriction. D2 came back INCONCLUSIVE and showed this; the fixture's Open line now has the Answered form.
6. The space-padded approved id lost its trailing space when the script was written, so that arm tested an ordinary id. The fixtures are now `$'...'` strings.
7. The release arm on a stopped id was answered first by the report check, because the fixture's stopped unit has a partial. The arm now moves the partial aside.
8. `derivers.sh` was published as having 35 rows, in this file, the PR body and the messages of `4fad657d6` and `4164c5457`. It had 34: a miscount, not a row removed later. Review round 4 found it.
9. Four of the eight "ran once" rows had no mutant, though this file said mutants exercised them (round 4). Ma and Mb now fail the other four.
10. `derivers.sh`'s held-list fixture reused another cluster's ids and listed a unit that had already run as one to launch, so the row endorsed a re-launch (round 4). The fixture now has its own ids and reports.
11. `ledger.sh`'s owner release of a hold appended its Answered line under `## Open`; the row passed because the report check answered first. The first run of the new release rows showed it, and the line is now in the Answered section.
12. The new release row for a missing unit log was first answered by the report check as well. Its fixture now removes the report, so that without the log check the release would be written into a new log.
13. The row for a missing transcript first named a path under the run's temporary directory, so its output differed between runs. It now names a fixed path.
14. The owner-check row for a scope under the wrong unit put its spec on the same `STOP-<n>` as the accepted one. Once one stop authorises one owner spec, the reuse refusal would answer first, so the arm now cites its own `STOP-6`.

### Limits

- The harness mocks the Workflow runtime. How the live runtime surfaces a classifier halt was not measured in a run of this skill. The no-result rule re-runs only an enumerated transient failure with nothing else in the transcript, treats anything naming a policy, refusal, block or hook as a stop, and holds any no-result whose cause cannot be established. It therefore depends on a halt leaving some trace other than a transient failure.
- The mock critic is a literal program, not a model. Round 1's refuter reproduced the reroute with a real model as the critic. Under the revision no gap runs in the run that found it, whatever a critic proposes.
- The ledger counts by id. A re-launch of reported work under its own id leaves no trace in it, whether or not the owner named it. After a stop or no-result the launch snippet lists a reported unit only for a `RERUN` line naming its tag, and a `RERUN` line written by hand passes it. A stopped unit's partial stays at its report path, so a re-run under the stopped id that overwrites it is invisible to the ledger.
- Step 8 item 6's overlap test for a later spec is a reading, not a computation. The work-list record catches a re-derivation in place, and the duplicate-id check one written to a new file under ids it shares with the first. A re-derivation whose ids change, or into a new run directory with moved pointers, is held only by item 6; the carried unit log holds an unchanged spec by its id.
- A `RELEASED` line written by hand, not by the snippet, bypasses the snippet's refusals. A hand-written release of a stopped id changes nothing (ledger row), but one written after a held run hides `held_ran`. The owner arm checks that an unused Answered line exists, not what it says, and the owner-spec check shows that a spec matches an unused Answered line, not that its words are the owner's.
- A `rerun` launches the prompt it is given. The skeleton returns the exact prompt, and nothing checks that the lead passed it back unchanged.
- Planning mode (`tests/scenarios/skills/test-decompose-into-pointer-units-planning.md`) launches no agent, so it does not exercise the skeleton. The harness does.
