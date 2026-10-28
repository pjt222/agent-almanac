## Run: 2026-10-27-decompose-into-pointer-units-harness

**Observer**: Claude (Opus 5.5 main loop) | **PR**: #1024, review rounds 1 to 5, and the #1026 follow-up (#1030: AD6-2, AD6-7 and its review round 1) | **Skill**: `decompose-into-pointer-units`

### Objective

The skill's central rule is that a stopped unit is never re-run, reworded or rerouted. Five review rounds found the Workflow skeleton, the snippets and the Step 10 ledger breaking it, each round one level further down.

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

- **Round 5**, at `7f75f6c33`: two blocking findings. Round 4 had answered "a new run directory loses the stop" by copying the unit log into it, which made the log job-wide while reports, the owner batch and the leave-out rule stayed per directory: units that reported in the earlier directory, one with a stopped verifier, relaunched with the ledger green. And `HELD` and `RERUN` lines had no writer while every reader took the line kind from the second field, so a hold typed as documented, without its date, was invisible. With them:
  - an owner answer given before a later hold lifted that hold;
  - nothing bound a checker's `rerun` to its release;
  - the checker log line dropped "and nothing else";
  - no row covered a checker event alone.

After round 2 the owner chose to remove the class rather than patch each path: **no gap runs in the run that found it**. Critics' gaps go to the owner batch, and a gap becomes a spec only in a later run, from a topic or id the owner approved. After round 3 the owner chose **owner-gated re-runs**: once any run in the job has recorded a stop or a missing result, nothing that already ran is launched again unless the owner names it. The one exception is a no-result whose transcript shows only an enumerated transient failure. After round 4 the owner extended that exception to verifiers and critics: each re-runs once, alone, through the skeleton's `rerun` argument and the exact prompt its run returned. The owner also took back three guards round 4 had deferred: an owner spec's id is `OW-<n>` and new to the work list, one `STOP-<n>` authorises one owner spec, and an id in two spec entries is refused at launch and in Step 10. After round 5 the owner chose **one run directory per job**: once any unit has run, specs are never re-derived, and items a fixed deriver skipped are added as new specs that may not cover any pointer a recorded spec covers. The owner also counted a runtime usage or quota limit notice as transient, and took in three changes from a review of a port of the gap deriver: a pre-run owner hold line, the dropped duplicates of a merged gap shown to the owner, and an independent second read of every gap against the held scopes, which the gap deriver reads. This record checks the revision, and keeps the checks so a later edit can be re-measured.

### Environment

| Field | Value |
|-------|-------|
| Tools | `out/versions.txt`: node v26.11.1, bash 5.2.21, zsh 5.9, jq 1.7, ripgrep 14.1.0, GNU coreutils 9.4, GNU sed 4.9 (the fixtures use `sed -i`) |
| Heads measured | `51866b250` (round 1), `760f21e5d` (round 2), `d85a189d7` (round 3), `4164c5457` (round 4), `7f75f6c33` (round 5), and the revision committed with this file |
| Date | 2026-10-27; the #1026 follow-up re-measured on 2026-10-28 |

### Method

Run from the repository root, as a user other than root. Three rows (two in `ledger.sh`, one in `derivers.sh`) make the unit log unreadable with `chmod 000`, which root reads anyway, so as root those rows fail and `mutants.py` refuses its baseline.

- **`harness.mjs <EXAMPLES.md>`** extracts the Workflow skeleton from EXAMPLES.md byte for byte and runs it against mocked `agent`, `pipeline`, `parallel`, `phase` and `log`. It has 20 scenarios and 100 rows, covering:
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
  - an approved gap spec, whose prompt points at the recorded gaps file;
  - two critics reporting one gap with different `covers_held` flags: one copy is kept, the higher-priority one, it carries the flag of the copy dropped, and it lists the dropped copy's question and flag;
  - the no-result log lines of a unit and of a checker, pinned on "only for a transient failure", "and nothing else" and "re-run it once, unchanged and alone".

  The mock completeness critic is **disobedient**. It proposes every spec it sees no digest entry for, held or stopped or not, so no row can pass on the strength of the critic obeying its prompt. A missing result field is graded as a failure, not a crash.
- **`ledger.sh <SKILL.md> <bash|zsh>`** extracts eleven SKILL.md snippets, each the one fence holding its anchor, so a moved or duplicated fence is refused (exit 2) rather than run in the wrong place:
  - the Step 1 tool check, `mech_sums` and the refusal of a second freeze;
  - the Step 2 deriver, coverage checks and work-list record;
  - the Step 7 pilot listing;
  - the Step 8 stop line, the writers of the other hand-written lines, the no-result line, the release snippet and the pre-rerun check;
  - the Step 10 ledger.

  They run byte for byte with two departures: the Step 2 snippet runs at the scenario's chunk 4 (one `sed` on its argument), and of Step 1 only the tool check, `mech_sums` and the freeze refusal run, because the `cp` and `gh` lines need a real repository; the mkdir, touch and the line that writes `MECH-SHA256SUMS` are re-typed. It drives them on the test scenario's fixture through 70 rows:
  - the baseline, a second work list refused, and a second freeze refused;
  - a no-result whose partial moves to `partials/`, a partial that cannot be moved (a stand-in `mv` that fails, as one without `--backup` does) refused with nothing logged, and an empty placeholder;
  - a release refused without an Answered line or on a stopped id, a release from an Answered line, the re-run after it, and a release refused after a report;
  - a transient release, refused the second time, and a transient release of a verifier's no-result;
  - the pre-rerun check: a released no-result passes; no release, a second no-result, a stop since the release, nothing logged and an existing file are refused; a line with two spaces after its date is refused, beside a control row in which the same copy without that line passes; and a line with two spaces after its kind is refused;
  - releases refused with no unit log, for a held id with no no-result, for a no-result held over a stop since, without a transcript file, after an owner release and a second no-result, from an Answered line already used, with an unknown `BY`, and with no owner batch;
  - the owner release bound to each hold: an answer given before a later hold under another reason does not lift it, a no-result answer does not lift a later hold, an answer under another reason is refused, a pre-run owner hold is released by its own answer, and after a transient release one owner answer releases a second no-result;
  - an undated line, and a line with two spaces after its date or after its kind, refused by the release and by Step 10, a spec file whose first JSON text is not a list refused by Step 10, an unreadable log refused by both, the documented writers read by every reader, and Step 10 refused with no unit log;
  - a hand-written release that does not lift a stop;
  - a report under a new id, and verifier, critic and lead files that are not reports;
  - a recorded gap spec, with and without a report;
  - a held spec, with and without a report, a release refused after the held run, a release that lifts the hold, and a hold logged after the release that holds the id again;
  - a re-derivation at chunk 5 written to a new, recorded file, refused for the id it shares with the first;
  - a spec file added without being recorded, a re-derivation at chunk 5 in place, and a mechanical input changed after the freeze.
- **`derivers.sh <EXAMPLES.md> <bash|zsh>`** runs seven EXAMPLES.md snippets byte for byte, each the one bash fence holding its anchor, on small fixtures. Its 77 rows cover:
  - the count proofs and ledger-safe ids of the rows and item derivers;
  - recording a gaps file, once, and refusing one without `covers_held`;
  - the gap deriver: an approved topic plus a single id, a marked gap and a flagged gap kept out of the topic, a flagged gap approved by its id, refusals for a marked, unknown or space-padded id, an unknown topic, a missing marks file, an existing output and a changed gaps file, each refusal asserting the exit code and that nothing was written; and the second read: a gap it does not call `CLEAR` is not derived through its topic but is by its own id, and a read that misses a gap, names one twice, names an unknown id, gives another verdict or is missing is refused;
  - the owner-spec check: a scope on its Answered line accepted and recorded, and refused (exit 1, nothing recorded) when it is quoted only in Open, under a nested or later heading, with the wrong `STOP-<n>`, without a citation or under the wrong unit; and refused for an id that is not `OW-<n>` or is already in a spec file, and for a `STOP-<n>` that a recorded owner spec, under any file name, or a second spec in the same file already cites;
  - the launch snippet: the held list ordered in time (a no-result or hold after a release holds the id again), units that reported left out after a stop unless a `RERUN` line names them for this tag, every unit listed when the job has no stop, reported units left out on a verifier stop alone and on a critic no-result alone, and refusals for an unrecorded cluster file, an id in two spec files, a recorded cluster file that is not a spec list, an undated line, a line with two spaces after its date or after its kind, a tab after the date and its space, a spec file whose first JSON text is not a list, an unreadable log and a missing unit log;
  - the added-specs check: specs over uncovered pointers recorded; a line or a row of the same file a recorded spec covers, a pointer twice in the file, an id already carried, a kind that is not derived, a second JSON text in the added file, a spec without its pointers in the added file or in a recorded one (a recorded one read before a good one too), a file, issue or rows spec without its path, number or file, a spec file outside the work list whose first JSON text is not a list, a file already recorded, a changed work list and a missing file refused.
- **`mutants.py`** first requires all three checks to be green on the unmutated files; otherwise it refuses (exit 2). It then breaks one guard at a time in a temporary copy. A mutant counts as killed only when the check exits 1 with a failing row that names the guard's own row. Any other non-zero exit is INCONCLUSIVE. It scores `derivers.sh` and `ledger.sh` under zsh only.

### Results

| Check | Output | Result |
|---|---|---|
| `harness.mjs` on the skeleton at `51866b250` | `out/harness-at-51866b250.txt` | 84 of 100 rows FAIL |
| `harness.mjs` on the skeleton at `760f21e5d` | `out/harness-at-760f21e5d.txt` | 60 of 100 rows FAIL, including "no gap unit runs over held scope" and the verifier no-result rows: the round-2 blocking findings, reproduced |
| `harness.mjs` on the skeleton at `d85a189d7` | `out/harness-at-d85a189d7.txt` | 47 of 100 rows FAIL, including the round-3 rows (held guard, owner answer, `covers_held`, returned ids, log text) |
| `harness.mjs` on the skeleton at `4164c5457` | `out/harness-at-4164c5457.txt` | 30 of 100 rows FAIL, including the round-4 rows (`rerun_prompts`, `rerun`, the checker log text) |
| `harness.mjs` on the skeleton at `7f75f6c33` | `out/harness-at-7f75f6c33.txt` | 4 of 100 rows FAIL: the merged gap's flag and dropped copies, and the checker log lines (G5-1) |
| `harness.mjs` on the revision | `out/harness-revised.txt` | 100 of 100 PASS |
| `derivers.sh` on the revision, bash and zsh | `out/derivers-bash.txt`, `out/derivers-zsh.txt` | 77 of 77 PASS under each |
| `ledger.sh` on the revision, bash and zsh | `out/ledger-bash.txt`, `out/ledger-zsh.txt` (stdout) | 70 of 70 PASS under each |
| `mutants.py` | `out/mutants.txt` | baseline green; 121 of 121 KILLED, each on its named row |

The harness FAIL sets nest: every row failing at a later head also fails at each earlier one. Each head fails its own round's rows and every later round's, so the counts are not one round's findings each. The eight "ran once" rows pass at every control head, because no earlier skeleton re-ran anything in code; mutants M13 to M15, Ma and Mb fail each of them.

`derivers.sh` and `ledger.sh` now extract snippets that earlier heads do not have, so they refuse (exit 2) on those heads and have no control outputs here. Their controls at `4164c5457` are in `out/` at `dd032a01b`, measured with the scripts as committed there (45 and 47 rows; 13 and 20 FAIL under each shell). Rows for a changed snippet were run against the commit before the change and failed there, except rows that pin behaviour the snippet already had (an unknown `BY`, a missing batch, the checker-only launch cases, a gap the second read calls `COVERS` derived by its id) and sanctioned paths (a release after a transient release and a second no-result). Rows for a new snippet (the added-specs check, the writers, the pre-rerun check) cannot run on an earlier commit. Mutants pin both kinds.

Eight mutants are killed on their message only, because a later guard refuses the same case: D13 (the all-files id check refuses the malformed cluster), D33 (jq refuses the missing second read), L16 (the date check refuses the missing log), L28 (the owner arm finds no answer), and L38, L39, L42 and L43 (the release and the pre-rerun check read the log with awk, which splits on runs of spaces, so it sees the badly spaced line and refuses it as a hold or a stop). Each guard is defence in depth; at the launch and at Step 10, whose `rg` readers need one space, the date check is the only guard.

| Mutant | What it breaks | Killed on the row |
|---|---|---|
| M1 | stop check narrowed to one source | stop reviewer: recorded as stopped |
| M2 | verifier stop not checked | S11 verifier stop: recorded in verifier_stopped |
| M3 | spec-kind guard removed | S8 raw input spec: refused before any agent |
| M4 | held filter removed | S9 held id: never launched |
| M5 | verifier no-result not recorded | S10 verifier no result: recorded in verifier_no_result |
| M6 | owner-spec guard removed | an owner spec without its unit is refused |
| M7 | a stopped critic's gaps used | S14 critic stop: its gaps are not used |
| M8 | a gap unit run in the same run | no gap unit runs |
| M9 | a stopped unit also listed as a no-result | the stopped unit is not listed under no_result |
| M10 | no-result ids left off the HELD line | S7 no result: the completeness critic is told the no-result id is held |
| M11 | held guard removed | S15 held not an array: a string is refused before any agent |
| M12 | owner answer not bound to a STOP-<n> | an owner spec whose answer is not a STOP-<n> is refused |
| M13 | a no-result unit retried in code | S7 no result: the unit ran once |
| M14 | a no-result verifier retried in code | S10 verifier no result: 'verify CL-B#1' ran once |
| M15 | a stopped or no-result critic re-run in code | S14 critic stop: 'completeness R1' ran once |
| M16 | the verifier no-result log line dropped | S10 verifier no result: the log says the cause is undetermined |
| M17 | covers_held not required of a gap | every critic schema requires covers_held |
| M18 | a rerun prompt that is not the launched one | S10 verifier no result: its rerun prompt is the prompt it was launched with |
| M19 | a stopped critic given a rerun prompt | S14 critic stop: a stopped critic has no rerun prompt |
| M20 | a rerun that runs the whole skeleton too | S16 rerun verifier: exactly one agent runs |
| M21 | a rerun of a unit id | S18 rerun refused: a unit id is refused before any agent |
| M22 | a rerun alongside specs | S18 rerun refused: a rerun with specs is refused before any agent |
| M23 | a verifier rerun under the critic schema | S16 rerun verifier: it runs with the verifier schema |
| M24 | a stopped rerun counted | S17 rerun critic: a stop is recorded and its gaps not used |
| M25 | the stopped-unit log line without "do not re-run" | stop reviewer: the log says not to re-run the stopped unit |
| M26 | a gap spec that does not point at the recorded file | S19 gap spec: the prompt points at the recorded gaps file |
| M27 | a dropped duplicate's covers_held lost | S20 duplicate gaps: a dropped copy's covers_held is carried into the kept copy |
| M28 | "and nothing else" dropped from the checker line | S10 verifier no result: the log allows one re-run with args.rerun |
| M29 | "and nothing else" dropped from the unit line | S7 no result: the log allows one re-run, unchanged and alone |
| M30 | a dropped duplicate not listed for the owner | S20 duplicate gaps: the kept copy lists each dropped copy's question and flag |
| Ma | a stopped unit re-run in code | stop reviewer: the stopped unit ran once |
| Mb | a stopped verifier re-run in code | S11 verifier stop: 'verify CL-B#1' ran once |
| D1 | marked gaps not excluded from a topic | the marked gap and the flagged gap are not derived through the topic |
| D2 | owner check not restricted to the Answered section | owner: a scope quoted only in Open is refused |
| D3 | covers_held ignored for a topic | the marked gap and the flagged gap are not derived through the topic |
| D4 | an approved marked id not refused | gaps: an approved marked id is refused |
| D5 | owner check exits 0 on a refusal | owner: a scope quoted only in Open is refused with exit 1 |
| D6 | a release never lifts a hold in the held list | held: stopped ids and ids whose last no-result, hold or release line is not a release |
| D7 | gap deriver skips the work-list check | gaps: a gaps file changed after it was recorded is refused |
| D8 | a gaps file recorded without covers_held | record: a list without covers_held is refused |
| D9 | a release lifts a no-result or hold logged after it (held list) | held: a no-result or a hold logged after a release holds the id again |
| D10 | reported units relaunched after a stop | launch: after a stop or no-result, a unit that reported is not relaunched |
| D11 | a RERUN line not bound to its tag | launch: a RERUN line for another run does not |
| D12 | reported units held back with no stop in the job | launch: with no stop or no-result in the job, reported units relaunch |
| D13 | an unreadable cluster not refused | launch: a recorded cluster file that is not a spec list is refused |
| D14 | an owner spec id of any form | owner: an id that is not OW-<n> is refused |
| D15 | an owner spec id already in the work list | owner: an id already in the work list is refused |
| D16 | a STOP-<n> authorising two owner specs | owner: two owner specs citing one STOP-<n> in one file are refused |
| D17 | owner specs already recorded not read | owner: a STOP-<n> already used by a recorded owner spec is refused |
| D18 | an unrecorded cluster launched | launch: an unrecorded cluster file is refused |
| D19 | an id in two spec files launched | launch: an id in two spec files is refused |
| D20 | an added pointer that a recorded spec covers | added: a line a recorded spec covers is refused |
| D21 | a pointer twice in the added file | added: a pointer twice in the added file is refused |
| D22 | an added spec of any kind | added: a spec that is not of a derived kind is refused |
| D23 | a row pointer without its file | added: specs for pointers no spec covers are recorded |
| D24 | an added file recorded twice | added: a file already recorded is refused |
| D25 | an added id already in a spec file | added: an id a spec already carries is refused |
| D26 | the added check skips the work-list check | added: a changed work list is refused |
| D27 | an undated line read by the launch | launch: a unit-log line without its date is refused |
| D28 | an unreadable log read as all dated by the launch | launch: an unreadable unit log is refused |
| D29 | a gap the second read did not clear derived through its topic | gaps: a gap the second read does not call CLEAR is not derived through its topic |
| D30 | a second read that misses a gap | gaps: a second read that misses a gap is refused |
| D31 | an unknown id in the second read | gaps: an unknown id in the second read is refused |
| D32 | any verdict in the second read | gaps: a verdict other than COVERS, BORDERLINE or CLEAR is refused |
| D33 | a missing second read | gaps: a missing second read is refused |
| D34 | a verifier event does not count as a stop in the job | launch: a verifier stop alone leaves reported units out |
| D35 | a critic event does not count as a stop in the job | launch: a critic no-result alone leaves reported units out |
| D36 | the added file read through `sort` | added: a spec without its pointers is refused, nothing recorded |
| D37 | the recorded spec files read through `sort` | added: a recorded spec file with a spec without its pointers is refused, nothing recorded |
| D38 | two spaces after the date read by the launch | launch: a unit-log line with two spaces after its date is refused before any list is printed |
| D39 | the recorded spec files read without `-n inputs` | added: a broken recorded spec file read before a good one is refused, nothing recorded |
| D40 | the kind check reading only the last JSON text | added: a second JSON text in the added file is refused, nothing recorded |
| D41 | a file spec without its path read as `file:null` | added: a file spec without its path is refused, nothing recorded |
| D42 | an issue spec without its number read as `issue:null` | added: an issue spec without its number is refused, nothing recorded |
| D43 | a rows spec without its file read as `rows:null:<n>` | added: a rows spec without its file is refused, nothing recorded |
| D44 | the added check reading all ids without `-n inputs` | added: a spec file whose first JSON text is not a list is refused, nothing recorded |
| D45 | the launch reading all ids without `-n inputs` | launch: a spec file whose first JSON text is not a list is refused before any list is printed |
| D46 | any spacing after the kind read by the launch | launch: two spaces after the kind are refused before any list is printed |
| L1 | stop pattern unanchored | no-result: its partial moves to partials/ and it stays unaccounted |
| L2 | empty files counted | empty file is not reported |
| L3 | checksum re-check dropped | changed input refused |
| L4 | held ids not subtracted | held spec is held, not unaccounted |
| L5 | work-list check dropped | re-derivation at chunk 5 after launch is refused |
| L6 | a second work list not refused | a second work list is refused |
| L7 | a release never lifts a hold in the ledger | a hold released from an unused Answered line is unaccounted until it runs |
| L8 | a release after a report not refused | release after a report is refused |
| L9 | a no-result partial left in place | no-result: its partial moves to partials/ |
| L10 | a stopped id released | release of a stopped id is refused |
| L11 | a transient release not bound to a first, unreleased no-result | a transient release is logged once |
| L12 | an owner release read outside the Answered section | release by owner with no Answered line is refused |
| L13 | a release lifts a hold logged after it (Step 10) | a hold logged after a release holds the id again |
| L14 | a transient release without its transcript | a transient release naming no transcript file is refused |
| L15 | one NORESULT answer releasing a second no-result | a second owner release from the same Answered line is refused |
| L16 | a release without a unit log | release: no unit log is refused, and none is started |
| L17 | a ledger without a unit log | ledger: no unit log is refused |
| L18 | a run directory frozen twice | step 1: a frozen run directory is not frozen again |
| L20 | a failed mv logged as a no-result | no-result: a partial that cannot be moved is refused, and nothing is logged |
| L21 | a transient release over a hold logged since | a transient release of a no-result held over a stop since is refused |
| L22 | a transient release of a second no-result | a transient release after an owner release and a second no-result is refused |
| L23 | an id in two recorded spec files counted | an id in two spec entries is refused, though both files are recorded |
| L24 | a hold lifted by an answer to another | an answer given before a later hold does not lift that hold |
| L25 | a release with nothing to lift | an Answered line releases once |
| L26 | a transient release not counted against the need | after a transient release and a second no-result, one owner answer releases |
| L27 | a release with an unknown BY | a release with an unknown BY is refused |
| L28 | an owner release with no batch file | an owner release with no owner batch is refused |
| L29 | the hold reason dropped from an answer | a pre-run owner hold is released by its own Answered line |
| L30 | a release keeps the holds before it open | an Answered line releases once |
| L31 | an undated line read by the release | release: a unit-log line without its date is refused |
| L32 | an undated line read by the ledger | ledger: a unit-log line without its date is refused |
| L33 | an unreadable log read as all dated | release: an unreadable unit log is refused |
| L34 | an unreadable log read as all dated by the ledger | ledger: an unreadable unit log is refused |
| L35 | a checker re-run over its own file | pre-rerun: a checker whose file exists is refused |
| L36 | a checker re-run after a stop | pre-rerun: a checker stopped since its release is refused |
| L37 | a checker re-run with no release | pre-rerun: a no-result not released is refused |
| L38 | two spaces after the date read by the release | release: a unit-log line with two spaces after its date is refused |
| L39 | two spaces after the date read by the pre-rerun check | pre-rerun: a unit-log line with two spaces after its date is refused |
| L40 | two spaces after the date read by the ledger | ledger: a unit-log line with two spaces after its date is refused |
| L41 | Step 10 reading all ids without `-n inputs` | ledger: a spec file whose first JSON text is not a list is refused |
| L42 | any spacing after the kind read by the release | release: two spaces after the kind are refused |
| L43 | any spacing after the kind read by the pre-rerun check | pre-rerun: two spaces after the kind are refused |
| L44 | any spacing after the kind read by the ledger | ledger: two spaces after the kind are refused |

### Instrument history

Twenty defects in this record's own instruments were found and fixed before any number above was recorded:

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
15. `ledger.sh`'s carried-directory rows copied a whole run directory, reports included, so the record's only carried-directory fixture was the one shape on which round 5's AD5-1 could not show. The rows went with the second directory.
16. The checker no-result log rows matched "transient" anywhere in the line, and passed a line that said "or any other cause" (G5-1). They now pin the clauses.
17. No launch row had a checker event alone, so a mutant that narrowed the trigger to unit events survived (AD5-5). Two rows now cover it.
18. A new fixture helper's sed replacement wrote `\&`, a literal ampersand, where the matched line was meant. Read before its first run.
19. Mutant L35 deleted the line that held its own extraction anchor and came back INCONCLUSIVE. It now breaks the test and keeps the line.
20. Once the writers fence also held `STOP-%s`, the stop-line anchor matched two fences and the extractor refused, as designed. The anchor is now `routed=owner-batch`.

### Limits

- The harness mocks the Workflow runtime. How the live runtime surfaces a classifier halt was not measured in a run of this skill. The no-result rule re-runs only an enumerated transient failure with nothing else in the transcript, treats anything naming a policy, refusal, block or hook as a stop, and holds any no-result whose cause cannot be established. It therefore depends on a halt leaving some trace other than a transient failure.
- The mock critic is a literal program, not a model. Round 1's refuter reproduced the reroute with a real model as the critic. Under the revision no gap runs in the run that found it, whatever a critic proposes.
- The ledger counts by id. A re-launch of reported work under its own id leaves no trace in it, whether or not the owner named it. After a stop or no-result the launch snippet lists a reported unit only for a `RERUN` line naming its tag, and a `RERUN` line written by hand passes it. A stopped unit's partial stays at its report path, so a re-run under the stopped id that overwrites it is invisible to the ledger.
- After launch the work list is never re-derived, and an added spec is refused for any pointer a recorded spec covers: a source line, a row of the same file, a file or an issue. Gap and owner specs carry a question or a scope rather than pointers, so whether they reach held work is decided by the lead's marks, the critics' flags, the second read and the owner; Step 8 item 6's overlap test for them is a reading, not a computation. The second read is an agent's reading too: the deriver checks that it named every gap, not that its verdicts are right.
- A `RELEASED` line written by hand, not by the snippet, bypasses the snippet's refusals. A hand-written release of a stopped id changes nothing (ledger row), but one written after a held run hides `held_ran`. The owner-spec check shows that a spec matches an unused Answered line, not that its words are the owner's.
- A `rerun` launches the prompt it is given and checks only the id's form, a non-empty prompt, a tag and that no specs are passed. The pre-rerun check reads the log, but nothing checks that the prompt passed back is the one returned, and a second rerun before the first's outcome is logged passes it. A critic re-run is told its first run's held list.
- The owner arm checks that an Answered line names each open hold's reason and that enough `NORESULT` answers exist, not what the answers say; a `NORESULT` line written twice can release a later no-result. Every `RERUN` line is written by hand, and nothing compares it with its Answered line.
- A `HELD` Answered line is matched by its reason and is not used up by a release, as a `NORESULT` line is, so an earlier answer also lifts a later hold under the same reason. Step 9 says to release a re-held id only on a new answer; nothing in code enforces it.
- The added-specs check reads pointers with jq, which takes its exit status from its last input. The check therefore reads the recorded spec files through `jq -n inputs`, so an error in any of them ends the read wherever the file sits, and it requires the added file to be one JSON list. It refuses a spec without its pointers, absent or null: a `cl` or `rows` spec without its list, a `rows` spec without its `file`, a `file` spec without its `path`, an `issue` spec without its `n` (#1026, AD6-2; #1030 round 1). The all-ids reads of this check, the launch and Step 10 go through `-n inputs` too; Step 10's second read of the ids, into `ledger/ids.txt`, does not, and runs only after the first has passed the same files. A pointer field set to an empty string, `0` or an empty list is still read as a pointer that names nothing, and a stop line whose id is followed by a character outside `[A-Za-z0-9._-]` is read by the launch and Step 10 but not by the release and the pre-rerun check; both are on #1026. The owner-spec check (its id check, its all-ids read and its read of used answers) and the gaps-file record still take jq's exit from the last input; they are left to #1026. Pointers are compared as written, so a path spelled differently by the fixed deriver is caught only by Step 8 item 6's reading.
- A run that returns nothing leaves no summaries, so the verifiers of a unit whose report is whole cannot be named: its non-benign items go into the coverage statement as unverified.
- How the live runtime words a usage or quota limit notice was not measured. The rule treats a runtime-written limit notice as transient and an error citing a usage policy as a stop, so it depends on the two being told apart in the transcript.
- Planning mode (`tests/scenarios/skills/test-decompose-into-pointer-units-planning.md`) launches no agent, so it does not exercise the skeleton. The harness does.
