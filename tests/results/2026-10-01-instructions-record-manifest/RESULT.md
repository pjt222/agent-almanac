## Run: 2026-10-01-instructions-record-manifest

**Observer**: Claude (Opus 5.5, one Claude Code session on one machine) | **Relates**: #407, #722, `anthropics/claude-code#82056`, `anthropics/claude-code#90046`

### Objective

On recent Claude Code builds, a transcript carries an `attachment.type == "instructions"` record
that lists the instruction files the harness delivered: `files[] = {type, path, content}`, where
`type` is one of `User`, `Project`, `Local` or `AutoMem`. On this machine records appear from the
oldest surviving transcript onward (2.1.258). Other machines place the start at 2.1.260–2.1.263,
or at a date, so the census checks the rail per transcript rather than assuming it. *(As of 2026-10-02; on 2026-10-21 the oldest surviving record is on 2.1.278, see Addendum.)*

Upstream, tonydzi read seven records that list `User` but not `AutoMem`, each between deliveries
of the same index, as misses: "it existed throughout and simply was not delivered" (5858279003).
DanceNitra declined that reading for DanceNitra's own 14 sandwiched records, because on that
machine 21 records leave out the user `CLAUDE.md`, a file that always loads, so a record "is not a
full manifest" (5870005304). Neither could settle it from records alone, and tonydzi could not
make the gap recur on demand (5874997905).

The question here: on this machine, does a record list everything that loaded? If it does not,
which records fall short?

### Method

The instrument is `instructions-census.py` in this directory. It is read-only and uses only the
standard library. `--until` pins a cutoff, because the corpus grows while it is measured.
`--label-stores` replaces project names and working directories with opaque labels.

Before any count is trusted, `--selftest` must pass on a synthetic fixture. Four arms of that
fixture must go red: a read of the plural `attachments` field, a report on records that carry no
index, an unchanged file inside a tagged record, and a store name leaking past `--label-stores`.
The selftest also asserts the headline `gaps:` line. `census-mutants.py` then shows the selftest
can fail. It applies 37 named mutants to a copy of the census, each of which changes one line,
requires a green baseline, and expects every mutant to be killed. The mutant set does not cover
every printed figure.

The census has six read-outs:

1. tag × `User` per population, plus the first line of the reminder each record rendered
2. a delta test, comparing each listed file with its previous copy and each omitted file with its
   copies before and after the record that omits it
3. untagged records that drop a file listed by an earlier record in the same transcript
4. the compaction sequence per population. This includes boundaries in transcripts with no
   record, and, for subagent deltas with no boundary of their own, the parent session's last
   boundary
5. gaps, graded by evidence:
   - a Write-tool create of the index after the record
   - the current inode born after the record (a lower bound only)
   - no index on disk and no Write-tool create of one
   - UNEXPLAINED
6. the disk side for the user `CLAUDE.md`

Every figure below traces to `FACTS.md`, which `tools/fact-sheet.sh` generates from `FACTS.spec`.

### Results

Cutoff 2026-10-01T20:30Z. The corpus holds 1,053 records: 146 from main sessions and 907 from
subagent transcripts. Of the subagent records, 902 match a main-session payload of their own
session. Together that makes 141 distinct (sessionId, payload) pairs, 137 of them in main
sessions. Builds run from 2.1.258 to 2.1.287. The earliest record is 2026-09-02T07:19Z on 2.1.258,
two minutes after the oldest surviving transcript line on the machine. All counts below are per
record.

| read-out | result |
|---|---|
| positive control: `AutoMem` deliveries | 1,012, all from `…/memory/MEMORY.md` |
| untagged carrying `User`, main / subagent | **127 of 127 / 902 of 902** |
| tagged carrying `User`, main / subagent | **0 of 19 / 0 of 5** (22 compaction, 2 session_start; 9 builds 2.1.258–2.1.280) |
| rendered preamble, untagged | "Codebase and user instructions are shown below…" on all 941 that carry `rendered` |
| rendered preamble, tagged | "Instruction files were re-read … these differ from their earlier copies — each replaces its earlier copy…" on all 23 that carry `rendered` (21 after compaction, 2 at session start) |
| files listed in a tagged record, changed vs previous copy | **43 of 43** |
| files omitted from a tagged record, identical before and after | **22 of 22 bracketed** (`User` 10, `Project` 11, `AutoMem` 1); 29 unbracketed |
| untagged records dropping a file an earlier record listed | **0** |
| main sessions: record after a compaction boundary | untagged, **30 of 30** (18 auto, 12 manual) |
| main sessions: tagged records, last boundary before them | automatic, **19 of 19** |
| subagent deltas (5, none with a boundary of its own): parent session's last boundary | automatic 4, manual 1 |
| subagent boundary in a transcript with no record | 1 (auto) |
| automatic boundaries on 2.1.281–2.1.287 | none (2.1.281 has 2 manual) |
| user `CLAUDE.md` | 1 path, 1 content across all 1,029 `User` copies; mtime 13 ms after birth, 2026-08-16 |
| gaps (untagged, `User` without `AutoMem`) | 40: **0 UNEXPLAINED**, 2 created-after, 38 absent-no-create; none between two deliveries |

The 40 gaps break down as follows:

- **36** are throwaway `/tmp` arms of `tests/results/2026-09-15-sessionstart-hook-shape/`, all main
  sessions on 2.1.272. That probe writes no index. All 28 leftover stores still hold the probe's
  transcripts, and each has an empty `memory/`. *(As of 2026-10-02; all aged out by 2026-10-21, see Addendum.)*
- **2** are records of one project. It has no `memory/MEMORY.md` on disk, and no surviving
  transcript contains a Write-tool create of one.
- **2** were each followed by a Write-tool create of the index, 125 min and 47 min after the
  record. In the second case, a later record in the same transcript delivers the index.

**From the thread.** DanceNitra's published probe result buckets DanceNitra's 14 sandwiched
records by `attachment.reason`: `{compaction: 3, session_start: 11}`, with no `untagged` bucket
(FACTS T9). All 14 are tagged.

**Reading.** On these builds, a tagged record is a delta: a change notice that follows a full
list and names only the files that changed. The harness says as much in the reminder it renders,
and the transcript agrees: 43 of 43 listed files changed, and 22 of 22 bracketed omissions are
identical. The evidence does not rest on `User`, which never changed.

DanceNitra's objection holds, but here it is confined to tagged records. DanceNitra's 14
sandwiched gaps are tagged too, which the delta reading requires but does not prove: it also
predicts that the index copies before and after each of the 14 are identical, which is untested
from here (11 of the 14 are `session_start`, a reason with only 2 records here). The 19
main-session tagged records come from 9 sessions in 4 projects, one session holding 8 (FACTS F18),
so the tagged evidence is concentrated. No untagged record here left out the
user file, dropped a file listed earlier in its transcript, or lacked an index at
`memory/MEMORY.md` that existed at the time.

Of the sandwiched gaps reported upstream, only tonydzi's 7 remain open. The draft asks tonydzi
whether they are tagged. DanceNitra's other 7 records without the index are unbracketed. Their
tags are untested here, and DanceNitra's probe cannot say whether the index existed when they
were written.

### Part B: the wire (run 2026-10-02)

New `claude -p` sessions on 2.1.287 / linux-x64 were routed through a local server that answers
with a canned reply and keeps request bodies in memory only. In every single-session arm the record
matched the instruction blocks its request added (P1 for untagged records, P2 for tagged), and file
contents were byte-equal (P3). In two concurrent bursts of 6 sessions, record and request agreed on
the index in all 12; the bursts were scored on the index only. The arms covered a fresh start, a resume, a resume after an index edit,
`/compact`, a resume after compaction, an index edit and a project-file edit after compaction, and
two concurrent bursts of 6 sessions each. On this build:

- A resume writes an untagged record only after a compaction.
- A resume writes a tagged `session_start` record when a file changed.
- A resume writes nothing when nothing changed.

The full table, the gates and five deviations from the declared read-out are in `REPLICATION.md`,
"Part B results"; the outputs are FACTS F15–F17.

### What this does not establish

- The census establishes what the transcript lists, not what the request carried. Part B
  (`REPLICATION.md`, FACTS F15–F17) connects the two, but only for new `-p` sessions against a
  canned reply on 2.1.287, where the record matched the request in every shape tried.
- It covers one machine, linux-x64. Records may be written differently on darwin or win32.
- Every tagged record in a main session followed an automatic compaction, and no automatic
  compaction ran on 2.1.281–2.1.287. Part B produced no `reason: "compaction"` record. That
  shape covers 22 of the 24 tagged records here and 3 of DanceNitra's 14, and it was never
  exercised on the wire: neither automatic compaction nor a file edit during a live session was
  tried.
- For untagged records, completeness is shown only for `User`, for the index at
  `memory/MEMORY.md`, and for files listed earlier in the same transcript. `Project` and `Local`
  entries are not checked against the files on disk.
- `instructions` is not the only channel: 38 `nested_memory` attachments carry nested `CLAUDE.md`
  files separately.
- "absent-no-create" sees only Write-tool creates. Shell writes, `mv` and lost transcripts are
  invisible to it. The 2 absent-no-create records outside `/tmp` come from one project whose
  index sits at its store root, not under `memory/`, where the census does not look. That, and
  that a shell command wrote it, is the hand check `REPLICATION.md` Part A step 5 calls for; that
  check is not in FACTS.
- Inode birth time is a lower bound on when the current file was created, not the time the index
  first appeared. For that reason gap verdicts rest on transcript Write events first.

### Side findings, nothing changed

- One project's index sits at its store root, not under `memory/`, so no record
  delivers it.
- 28 `-tmp-tmp-*` stores from 2026-09-15 remain under `~/.claude/projects/`. Each holds probe
  transcripts and an empty `memory/`. *(As of 2026-10-02; none remain on 2026-10-21, see Addendum.)*
- `tools/check-redaction.sh` and the repository's private-slug detector (`findPrivateStoreSlugs`)
  flag neither a bare store slug nor a `cwd=` project path, which is the shape the unlabelled
  census output takes. This folder relies on `--label-stores` instead. Filed as #991, with a
  synthetic repro.

### Files

| file | what |
|---|---|
| `instructions-census.py` | the instrument (`--selftest`, `--until`, `--exclude-session`, `--label-stores`) |
| `census-mutants.py` | 37 named mutants of the census, each of which `--selftest` must kill |
| `gate0-slicer.py` | Part B GATE 0: the declared block slicer, validated on the corpus (964 of 964) |
| `census-2026-10-01T2030Z.txt` | the labelled census output at the cutoff |
| `FACTS.spec` / `FACTS.md` | every figure in the draft and here, with the command that produced it |
| `UPSTREAM-DRAFT.md` | the reply to `anthropics/claude-code#82056`, not yet posted |
| `REPLICATION.md` | Part A re-runs the census; Part B is the wire experiment and its results |
| `partb/stage1.py`, `stage2.py`, `stage3.py` | the Part B arms: gates, arms 1–4d, concurrent bursts |
| `partb/p2-negative-control.py` | shows the P2 "omitted files still in the request" check goes red when they are missing |

### Addendum 2026-10-21: integration re-check

The session that wrote this folder ended on 2026-10-02 without committing it. The folder was committed on 2026-10-21. Three sentences above were reworded after a leak audit; review round 1 then reworded one of them again and added three end-of-line pointers to this addendum (both listed at the end); nothing else above changed. This addendum re-checks the folder at `6685d7b18`.

`FACTS.md` is **not** regenerated. It stays byte for byte the 2026-10-02T15:26Z sheet measured at `1e7ed10fe`, and it is the record for every figure above. `1e7ed10fe` is the HEAD the sheet ran at; this folder was untracked there, and the committed scripts are byte-identical to that untracked copy (`cmp` against a backup taken before the first commit; every script's mtime there precedes 15:26:42Z).

The re-check ran in a `git clone --shared` of `6685d7b18`, with this folder copied in.
- **Still reproduces identically:**
  - F1: `--selftest` passes.
  - F10: `census-mutants.py` prints "37 of 37 killed; survivors: []".
  - F6, F11, F12 and F17.
  - T1–T8: none of the quoted upstream comments has been edited; T9: DanceNitra's probe files are unchanged since a160b24a4.
- **No longer reproduces on this machine:**
  - F2, F7, F13, F14 and F18 read transcripts that Claude Code has since deleted. `cleanupPeriodDays` is unset, so the 30-day default applies.
    - 362 of the census's 1,053 records survive: 30 in main sessions and 332 in subagents.
    - The earliest survivor is from 2026-09-21T09:13Z, on 2.1.278. The rest age out by about 2026-10-31.
    - A control count of 1,084 records after the cutoff shows that the counter still sees the channel.
  - F3: the user `CLAUDE.md` was re-created on 2026-10-07, so its inode and birth time changed.
  - F4 and F5: the 28 `-tmp-tmp-*` stores have aged out; none remain.
  - F8: `tools/wirecap.py` changed in `513be7731` (2026-10-09).
  - F9: the installed build is now 2.1.306, not 2.1.287.
  - F15 and F16, the Part B live arms, were not re-run. They start `claude -p` sessions and write to `~/.claude`, so a re-run would be a new measurement on 2.1.306, not a regeneration.
- **Reviewed false positives:** `tools/check-redaction.sh` flags `FACTS.md:147,150` and `FACTS.spec:10,11` as `project-store-slug`. They are the generic `-tmp-tmp-*` glob of the public 2026-09-15 probe stores.

**Reworded before the first commit (leak audit, 2026-10-21):**
- The absent-no-create limit and the first side finding no longer call a project, or the evidence about it, private.
- The redaction side finding now points to #991, which reproduces the gap with a synthetic input.

**Changed in review round 1 (2026-10-21):**
- The absent-no-create limit now attributes the store-root index and the shell write to the hand check `REPLICATION.md` Part A calls for, and says that check is not in FACTS. The leak-audit wording had stated both as plain fact.
- End-of-line pointers to this addendum date three present-tense sentences it overtakes: the 2.1.258 floor in the objective, the leftover stores in the gap breakdown, and the stores side finding.
- In this addendum: T9 is no longer called a quoted comment, and the 2.1.278 floor and the note on `1e7ed10fe` were added.
- Outside this file: `REPLICATION.md` (Part A no longer writes `FACTS.md` or runs F15 and F16; "Part B results" now says how the store is adopted and when not to run the scripts, what cleanup removes, that the docstrings' "fail-closed" overclaims and no script stops on a failed GATE, and lists a second step not done), comment lines of `FACTS.spec` (no row changed, so `FACTS.md` still matches it), and the draft's header and footer.
