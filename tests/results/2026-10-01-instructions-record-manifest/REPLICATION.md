# Replication steps — anthropics/claude-code#82056: is an `instructions` record a manifest?

This document has two parts. Part A re-derives every number in `FACTS.md` except those of Part B's
live arms (F15, F16). It writes only temporary directories (and Python's bytecode cache under
`partb/`) and takes a few minutes. Part B is the wire experiment that draft §3 reports. It
**was run on 2026-10-02** (scripts in `partb/`, results under "Part B results" at the end). Each step marked **GATE** must pass before the next one runs. Every prediction
is declared before any arm runs, and every Part B expectation that rests on extrapolation is
tagged *[extrapolated]*.

> **2026-10-21.** On the machine that measured them, Part A can no longer reproduce the census
> figures. Claude Code's default 30-day transcript retention has deleted most of the transcripts
> they came from: 362 of 1,053 records survive. The selftest and the 37 mutants still reproduce.
> See `RESULT.md`, Addendum 2026-10-21. Run on another machine, Part A measures that machine.

## Part A — the census (read-only)

Run these from the repository root:

```zsh
D=tests/results/2026-10-01-instructions-record-manifest
python3 $D/instructions-census.py --selftest        # must print PASS, exit 0
python3 $D/census-mutants.py                         # must print "37 of 37 killed", exit 0
python3 $D/instructions-census.py --exclude-session <this-session-id> \
    --until 2026-10-01T20:30:00Z --gap-detail 40 --label-stores
OUT_DIR=$(mktemp -d)   # FACTS.md is the 2026-10-02 record: never write to it
rg -v '^F1[56] ' $D/FACTS.spec > "$OUT_DIR/partA.spec"   # F15/F16 are Part B's live arms (claude -p, writes ~/.claude)
bash tools/fact-sheet.sh "$OUT_DIR/partA.spec" "$OUT_DIR/FACTS.regen.md"   # compare with FACTS.md; do not copy over it
```

Before sharing `FACTS.regen.md`, replace your home directory in it: F3, F4 and F5 can print it (see
`FACTS.spec`). `tools/check-redaction.sh` does not settle this. Its home-path rule matches only
`/home/<user>/`, and it already exits 1 on `FACTS.md` for the `-tmp-tmp-*` glob.

The last three lines regenerate every other cited figure, with its command, into a temporary
directory. The filter keeps F15 and F16 out of Part A: they start `claude -p` sessions and create
and remove stores under `~/.claude`, and `FACTS.md` holds their 2026-10-02 output. The only
`claude` the filtered spec starts is F9's `claude --version`. Run F15 and F16 only as Part B, and
not while anything else can create a directory under `~/.claude/projects` (a session starting in a
new directory, a worktree, a `claude -p` probe); "Part B results" says why.

The census reads `~/.claude/projects/*/*.jsonl` and `*/*/subagents/**/*.jsonl`, and stats the user
`CLAUDE.md` and the index files. It writes nothing except the selftest's temporary fixture;
`census-mutants.py` and the fact sheet write only temporary directories (F17's import of `stage2` can
also leave a gitignored `partb/__pycache__`).

- `--until` pins the cutoff for transcript contents. Gap verdicts that fall back to disk state
  read the disk as it is at run time.
- The `transcript files in window` count and the `in N transcripts` count shrink as old
  transcripts age out under retention.
- `--exclude-session` matches only a session: the file stem of a main transcript, or the session
  folder of a subagent transcript. It refuses prefixes shorter than 8 characters.

**What `--selftest` checks on a synthetic fixture:**

- the cutoff, an undated record, a naive timestamp, session-only exclusion, and refusal of a short
  prefix
- an unreadable file, which is counted rather than fatal
- the main/subagent split
- `reason`-only and `changed`-only tags
- the rendered preamble by tag
- an `AutoMem` path outside `memory/MEMORY.md`
- the delta classes: changed, bracketed-unchanged, and bracketed-but-differing (ambiguous)
- an untagged record that drops an earlier file
- the record after a boundary, a boundary in a transcript with no record, and a subagent delta's
  parent boundary
- a gap verdict for each grade except `inode-after` (`created-after`, `absent-no-create`,
  UNEXPLAINED), keyed by transcript, with the create offset and the earlier/later flags
- the headline `gaps:` line
- the disk side
- four arms that **must go red**:
  - the plural `attachments` field
  - `report()` on records that carry no index (it must refuse with exit 2)
  - an unchanged file in a tagged record
  - a store name, cwd or root path in `--label-stores` output, checked against an unlabelled
    run so the test cannot pass vacuously

`inode-after` is not fixtured, because its result depends on whether the filesystem reports a
birth time.

**Before quoting any zero, the census must show:**

1. a non-zero POSITIVE CONTROL
2. in section 1, untagged records all carrying `User` and tagged records carrying none, in each
   population
3. in section 2, 0 `listed: UNCHANGED` and no `bracketed, copies differ` line. That line would be
   ambiguous rather than counter-evidence, but it has to be read first.
4. in section 3, 0 untagged omissions
5. in section 5, 0 UNEXPLAINED, with the earlier/later counts read. `absent-no-create` sees
   Write-tool creates only, so check it by hand. On this machine it covers two things: the 36
   arms of `tests/results/2026-09-15-sessionstart-hook-shape/`, which writes no `MEMORY.md`, and
   one project whose index a shell command wrote to the store root, never under `memory/`.
6. `True` in section 6

Do not run without `--label-stores` when the output may be published. Neither
`tools/check-redaction.sh` nor `scripts/lib/store-slug.js` catches the project names in unlabelled
output (see RESULT.md, side findings). Filed as #991.

## Part B — the wire experiment (declared before the run; run 2026-10-02)

**Question.** For the request that produced each record, does the record list exactly the
instruction blocks that request added?

**Base.** Start from `tests/results/2026-08-26-cap-constant-closure/reprex_memory_cap.py`, not from
`wirecap.py --out`. The reprex holds each body in memory and never writes it to disk. A body
carries the email, account and device ids, home paths, and the full user `CLAUDE.md`.

Change its recorder to keep `(method, raw path, body)` per request; today it keeps only the body.
If a file is ever needed for debugging, write it to an absolute path under the session
scratchpad, outside every repository, and delete it during cleanup.

### Guards (reuse the reprex's; do not reimplement them)

- **Placement.** Arms run under the system temp directory with no ancestor `.git`, because memory
  keys to the git toplevel. Assert that no ancestor of the arm dir has a `CLAUDE.md` or
  `CLAUDE.local.md`.
- **Store.** Discover the store path; never compute it. Assert that the wire's `AutoMem` path is
  that store (reprex GUARD 3).
- **Invocation.**
  - Run every arm from Python: `subprocess.run(..., env=..., cwd=<arm dir>, input=<prompt>)`, so
    the prompt arrives on stdin.
  - Use one argument list for every arm: `["claude", "-p", "--strict-mcp-config", "--tools", ""]`.
    Add `--session-id <uuid4>` on arm 1 and `--resume <that uuid>` afterwards.
  - Never pass `--no-session-persistence`, because the record lives in the transcript.
  - Never write `VAR=x printf … | claude`. The assignment reaches `printf`, not `claude`
    (anthropics/claude-code#82056 comment 5424142726).
- **Hooks.** In the run record, list the active hooks from `~/.claude/settings.json` **and the
  enabled plugins**. Assert that no hook-injected text contains a line-anchored `Contents of`. Do
  not use `--bare`, `--safe-mode` or `--restricted`; `--bare` also skips auto-memory and
  `CLAUDE.md` discovery.
- **Cleanup.** Fail closed. Remove the arm dirs, the `~/.claude/projects/<slug>/` entries, and the
  arm sessions' `~/.claude/session-env` and `~/.claude/tasks` entries. Name the `~/.claude.json`
  project entries to the operator; do not edit that file.

### Read-out (declared before any run)

- **Reminder scope.** Slice only `<system-reminder>` blocks whose first line begins with one of
  three instructions preambles, measured on this corpus:
  - `Codebase and user instructions are shown below`, on 941 untagged records
  - `Instruction files were re-read after the conversation was compacted`, on 21 tagged records
  - `Instruction files were re-read when this session started`, on 2 tagged records

  Skip any reminder whose first line is itself a `Contents of /…:` header; that is the
  `nested_memory` shape. Fail closed on any other reminder that has an unknown preamble and still
  contains a line-anchored `Contents of /`.
- **Slicer.** Use the multiline header regex
  `^Contents of (?P<path>/[^\n]*?)(?: \((?P<label>[^)\n]*)\))?:\n\n`. A block ends at the `\n\n`
  before the next header, or at `\n</system-reminder>` for the last block. Fail closed if the
  separator is missing.

  Map labels to types as follows, and fail closed on an unknown label. The map was measured
  one-to-one over 3,619 headers.

  | label | type |
  |---|---|
  | `user's private global instructions for all projects` | `User` |
  | `project instructions, checked into the codebase` | `Project` |
  | `user's private project instructions, not checked in` | `Local` |
  | `user's auto-memory, persists across conversations` | `AutoMem` |
- **GATE 0 — validate the slicer on the corpus before any arm.** On every record that carries a
  top-level `rendered` array, the extracted `(type, path)` set must equal `files[]`, and each block
  must be byte-equal to `files[].content`. Measured with `gate0-slicer.py` (FACTS F14): 964 of 964.
  The looser `:\n` rule matches paths on all 964 but content on none, and a single-preamble scope
  fails the 23 tagged records. Re-measure before any arm runs.
- **Body `Bn`.** `Bn` is a POST whose `urlsplit(path).path` is `/v1/messages`; the client may add
  a query such as `?beta=true`. Its last user message must contain a text block equal to this
  arm's prompt. When the arm wrote a record, the messages must also contain that record's
  `rendered[0].content` byte-exactly.
  - Require exactly one `Bn` per session turn, and fail closed otherwise.
  - Title-generation, `count_tokens` and summarization requests are never `Bn`.
  - **Arm 4a has no `Bn`.** It is scored only by GATE 2 and its record outcome.
  - In arm 5, each session gets a distinct prompt (`hi-<n>`), and `Bn` is selected per session.
  - **GATE 1** prints the raw paths seen on arm 0. The selector must pick exactly one request
    there.
- **Record.** Before each arm, note the transcript's line count. Score only records written after
  it. If no new record appears, the outcome is `NO_RECORD`: it is recorded as such, it is neither
  a pass nor a fail, and an older record is never substituted.
- **Added set.** Locate the record's `rendered[0].content` at some `Bn.messages[i]`, comparing with
  `cache_control` keys removed. Which messages count as added depends on the request:

  | request | added set |
  |---|---|
  | arm 1 (no earlier `Bn` in the session) | every message |
  | the first `Bn` after a `compact_boundary` (arm 4b) | every message after the summary message |
  | every other `Bn` (arms 2, 3, 4c, and each arm-5 session, which must be created in-run) | the messages beyond the count that the previous `Bn` of the same session carried |

  On arm 1, a missing rendered text is an instrument failure (**GATE 1b**): stop and score
  nothing. Instruction blocks in added messages that no record covers are reported as
  "unrecorded delivery".

### Arms

| arm | steps | what is scored |
|---|---|---|
| 0 | Bootstrap in the arm dir and discover the store. Write `memory/MEMORY.md` with canary `IDX-A`, and `<arm dir>/CLAUDE.md` with canary `PRJ-A` (bytes, no trailing newline). | **GATE 1**: under the canned SSE reply, the transcript exists and holds an `instructions` record written after the arm started. Otherwise stop. |
| 1 | Fresh start with `--session-id <uuid>`. | P1 and P3. **GATE 1c**: a `Project` block for `<arm dir>/CLAUDE.md` is on the wire. The corpus has Project records from a non-git cwd (2 untagged, latest 2.1.283), but none under the system temp directory. If the block is absent, strike `Project` from the predictions. |
| 2 | Resume with nothing changed. | The record shape is **open**: untagged repeat (as DanceNitra saw), tagged, or `NO_RECORD`. Score P1 or P2 according to the shape. |
| 3 | Change the canary to `IDX-B`, then resume. | Score P1 or P2 according to the shape, as in arm 2. **Faithful** means the added set holds a new `MEMORY.md` block with `IDX-B`, and the record lists `AutoMem` with `IDX-B`. **Replay** means only the old `IDX-A` block, with no new block. Report whether any block is in `system`. If one is, repeat with `--system-prompt-snapshot off` before calling the result a replay. |
| 4a | Resume with `/compact`. | **GATE 2**: a `compact_boundary` appeared. Expected record outcome: `NO_RECORD`; an untagged record inside this window is recordable, not a failure. *[extrapolated: on this machine the post-boundary record was written on the next prompt; all 12 manual boundaries here were interactive continuations, and no `-p` compaction is in the corpus]* |
| 4b | Resume with a plain prompt. | Expect an untagged record on the first request after the boundary, scored under P1. A tagged `session_start` is a recordable alternative. *[extrapolated, as 4a]* |
| 4c | Change only the canary, to `IDX-C`, then resume. | Expect a tagged record listing only `AutoMem`. Score P2 on the delta property, not on the `reason` string. *[extrapolated: no tagged record in a main session followed a manual compaction here. One subagent delta did, after a manual `/compact` in its parent session.]* If none appears, report "P2 not exercised". |
| 5 | N concurrent queued resumes of N in-run sessions (tonydzi's shape), each with its own prompt. | Per session, one of: record lacks `AutoMem` while the wire has it; both lack it; record has it while the wire lacks it; both have it; `NO_RECORD`. |

### Predictions

- **P1.** An untagged record's `(type, path)` set equals the added set.
- **P2.** A tagged record's set equals the added set, and the blocks for the files it leaves out
  are still in the request from earlier turns. Without a compaction since those files were last
  sent, the second half holds trivially, and it is reported as trivial.
- **P3.** Every listed file's content is byte-equal to its block.

If P1 holds on 2.1.287 / linux-x64 in these shapes, then an untagged record without `AutoMem`, in
those shapes and on that build and platform, is a delivery miss. If P1 fails in a shape, gap
counts from that shape cannot be read as misses, this machine's included. Nothing here transfers
to other builds or platforms.

**Already known about the header.** The `MEMORY.md` header was matched in captured bodies on
2026-08-26 (`tests/results/2026-08-26-cap-constant-closure/`). The `User` and `Project` headers,
and build 2.1.287, remain unconfirmed until arm 1.

## Part B results (run 2026-10-02, 2.1.287 / Linux x86_64)

Scripts: `partb/stage1.py` (arm 0 and arm 1 gates), `partb/stage2.py` (arms 1–4d in one session),
`partb/stage3.py` (arm 5 bursts). Run them from that directory with `PARTB_ROOT` pointing outside
any repository. Arms go under it and request bodies stay in memory. Cleanup removes the arm
directory, the store the directory diff adopted, and the arms' empty `session-env` entries. FACTS
F15 and F16 carry the output; both runs printed `cleanup: complete`.

**Do not run them while anything else can create a directory under `~/.claude/projects`** (a
session starting in a new directory, a worktree, a `claude -p` probe). The store is adopted as the
single new directory under `~/.claude/projects`, and nothing checks that the bootstrap created it.
If the bootstrap creates none while something else creates exactly one, that store gets a canary
`memory/MEMORY.md` and is deleted by cleanup. GUARD 3, placed after adoption as in the reprex,
would not prevent this.

The docstrings of `stage1.py` and `stage2.py` say "Cleanup is fail-closed". That overclaims, and
the scripts are kept as they ran. A non-empty `session-env` entry is kept and reported as
`cleanup: INCOMPLETE`, but the script still exits 0. When more than one new store appears, the
script refuses before adopting any, prints `cleanup: complete`, and leaves the arm's own store on
disk. Nor do the scripts stop on a failed GATE: `stage2.py` records GATE 2's outcome and goes on
to score arm 4b either way.

| gate | result |
|---|---|
| GATE 0 | 964 of 964 corpus records sliced byte-exactly (F14) |
| GATE 1 | a record is written under the canned reply |
| GATE 1b | the untagged record's `rendered` text is in the request, byte for byte |
| GATE 1c | the `Project` canary block is on the wire |
| GATE 2 | `/compact` in `-p` writes a manual `compact_boundary` |
| Bn | one POST per turn, path `/v1/messages?beta=true`; instruction blocks are in `messages`, never in `system` (checked on arms 1–4d, F15; the bursts did not check it) |

| arm | record | P1 / P2 | P3 |
|---|---|---|---|
| 1 fresh start | untagged, User+Project+AutoMem | P1 holds | holds |
| 2 resume, nothing changed | `NO_RECORD`, and no instruction block added | — | — |
| 3 index → IDX-B | tagged `session_start`, AutoMem only | P2 holds; the omitted User and Project are still in the request | holds |
| 4a `/compact` | `NO_RECORD`, manual boundary, as predicted | — | — |
| 4b resume after compaction | untagged, full list; old canary gone from the body | P1 holds | holds |
| 4c index → IDX-C | tagged `session_start` (not `compaction`), AutoMem only | P2 holds | holds |
| 4d project → PRJ-B (added arm) | tagged `session_start`, Project only | P2 holds | holds |
| 5a 6 concurrent resumes after an index edit | both-have, tagged `session_start`: 6 of 6 | — | — |
| 5c 6 concurrent fresh starts | both-have, untagged: 6 of 6 | — | — |

Three earlier runs of `stage3.py` gave the same 12 of 12. They are not in FACTS, so only F16's
run is citable.

The scripts remove the arm directories, the store the directory diff adopted, and the arms' empty
`session-env` entries. They do not touch `~/.claude.json` or `~/.claude/tasks`. After the runs,
both were checked by hand and held no arm entry; that check is not in FACTS.

**Deviations from the declared read-out, and why** (the cleanup and gate-stop departures are described above the tables):

- **`Bn` selection.** The declared rule required the prompt in the request's *last* message.
  Hooks append their context as trailing `system`-role messages, so the first run selected nothing
  and failed closed on every arm, as designed. The rule now matches the last *user*-role message.
- **Rendered text.** A tagged record's `rendered` text appears in the request with one extra
  trailing newline. The untagged record's text appears exactly. The scorer reports which of the
  two it saw; file contents (P3) are byte-exact in both cases.
- **Arm 4 prediction.** The prediction left the shape of the delta after the manual compaction
  open. On this build the delta came as a `session_start` record, not a `compaction` one.
- **P2 second half.** As first written, the check of "files the record omits are still in the request"
  built the omitted list from the request's own blocks, so it could not fail. The advocatus-diaboli
  review found this. It now takes the files delivered earlier in the session, and
  `partb/p2-negative-control.py` (F17) shows it goes red when they are missing. F15 is the re-run.
- **Added arm.** Arm 4d (edit the project file, then resume) was not declared. It was added to put a
  second mutable type on the wire.
- **Not done.** The declared listing of active hooks and plugins was not recorded.
- **Not done.** The Store guard (GUARD 3: the wire's `AutoMem` path is the discovered store) was
  not implemented as a gate. `stage1.py` prints the comparison; `stage2.py` and `stage3.py` do not
  compute it. In F15 the `IDX-A` canary reached the wire, and F16's transcripts were read from the
  adopted store, so both runs used the arms' own store.
- **Not done.** The slicer's fail-closed conditions are not enforced. In `stage2.py`, an unknown
  preamble that carries a `Contents of /` header, a missing separator, or a lone unknown label sets
  `slicer_ok` false, and P1/P2/P3 are still scored. An unknown label next to a known one raises a
  TypeError. `stage3.py` discards the flag. F15 reports `slicer_ok: true` on every arm it scored;
  F16 does not compute it.
- **Arm 4b added set.** Declared: every message after the summary message. `stage2.py` takes every
  message of the first request after the boundary. The declared rule was not applied, and whether
  it gives the same verdict was not measured.
- **Arm 5.** The bursts are simultaneous `-p` resumes and starts against a canned reply, scored on
  the index only. They do not reproduce tonydzi's automated queued resumes on 2.1.266, and 5a
  resumed after an index edit, which tonydzi's resumes did not. 5c (six fresh starts at once) was not
  declared.

**Reading.** On 2.1.287 / linux-x64, in the single-session arms the record lists exactly what each
request added: untagged records are complete, and tagged records are exactly the changed files.
In the bursts, record and request agreed on the index. A resume writes an untagged record only after a compaction; when a file changed it writes
a tagged `session_start`, and when nothing changed it writes nothing. On 2.1.287 an unchanged
resume writes no record, so tonydzi's shape cannot occur on this build except after a compaction;
nothing here bears on 2.1.266. None of this says anything about other builds, other platforms or
interactive sessions.
