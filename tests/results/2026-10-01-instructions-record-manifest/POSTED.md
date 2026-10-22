Picking the manifest question back up from [DanceNitra 5870005304](https://github.com/anthropics/claude-code/issues/82056#issuecomment-5870005304) and [tonydzi 5874997905](https://github.com/anthropics/claude-code/issues/82056#issuecomment-5874997905). The thread has since moved to recall and hooks; the figures about this machine below were measured on 2026-10-02, from transcripts up to 2026-10-01T20:30Z.

@DanceNitra @tonydzi, on whether an `instructions` record is a full manifest: on this machine **it depends on the tag. A tagged record's own rendered text says it lists only the files that changed, and the transcript agrees.** That untagged records are complete is inferred from the data below.

This is linux-x64, builds 2.1.258–2.1.287. I read every `attachment.type == "instructions"` record (singular `attachment`) under `~/.claude/projects/` up to 2026-10-01T20:30Z, excluding the session that ran the census. There were 1,053 records. Subagent transcripts mostly repeat their session's payload, so the 1,053 come to 141 distinct (sessionId, payload) pairs, 137 of them in main sessions.

On the recall numbers JhouCode asked for in [5910419239](https://github.com/anthropics/claude-code/issues/82056#issuecomment-5910419239): I did not measure which memory files were opened on this machine, so I have no open rate to add.

## 1. Tagged records here are deltas

In main sessions, 127 of 127 untagged records carry `User`, and 0 of 19 tagged ones do. Those 19 tagged records come from 9 sessions in 4 projects, one session holding 8 of them, so the tagged evidence is concentrated.

Records that carry the top-level `rendered` field open, when untagged, with "Codebase and user instructions are shown below." When tagged (23 of 24), they open with "Instruction files were re-read", followed in 21 by "after the conversation was compacted" and in 2 by "when this session started", then "these differ from their earlier copies — each replaces its earlier copy…". The transcript agrees. I compared each file with its other copies in the same transcript:

```
listed in a tagged record, changed since its previous copy           43 of 43
left out of a tagged record, identical before and after it           22 of 22 bracketed (Project 11, AutoMem 1, User 10)
untagged records dropping a file an earlier record listed             0
```

`User` has one content across all 1,029 copies, so its 10 can't fail. The test that carries weight is Project and AutoMem. In main sessions every compaction boundary (30 of 30) is followed by an untagged record, and every tagged record in a main session comes later.

@DanceNitra, your `result.json` buckets the 14 sandwiched records as `{compaction: 3, session_start: 11}`, with no `untagged` bucket. That is necessary for the delta reading but doesn't prove it. The reading also says the index had not changed when each of the 14 was written. The copies before and after test that in one direction only: identical copies fit it, while a difference is ambiguous, because the index may have been edited after the record (here all 22 bracketed omissions were identical). Are yours identical? And for the 21 that name the index without the user file: is each one tagged, and does each differ from its previous copy (here 43 of 43 listed files did)?

@tonydzi, for your 7 (each preceded by a delivery in its own transcript), were they untagged? Here no untagged record left out the user file, or an index at `memory/MEMORY.md` that existed at the time. Separately, at least 17 of the 18 tagged records in your [5858279003](https://github.com/anthropics/claude-code/issues/82056#issuecomment-5858279003) carry `User` (407 of your 408 records do), and none of mine do. Build alone doesn't explain that, since 14 of my 24 are on your 2.1.260–2.1.266 builds. If your tagged records are deltas, your user `CLAUDE.md` changed before each one. If the `User` copies are identical, your machine writes them differently, and the `rendered` preamble would show which kind each record is.

@JhouCode, in your 76 ([5922245389](https://github.com/anthropics/claude-code/issues/82056#issuecomment-5922245389)), does "the only file was `MEMORY.md`" mean the only memory file, or the only entry in the record? Only the second would bear on this.

## 2. No untagged record here lacks a `memory/MEMORY.md` that existed at the time

The positive control: 1,012 index deliveries, all from `…/memory/MEMORY.md`. 40 untagged records carry `User` without `AutoMem`. They break down as:
- 36 come from throwaway `/tmp` sessions of an earlier probe of mine that writes no index.
- 2 are one project with no `memory/MEMORY.md` on disk, and no Write that created one in any surviving transcript. That check sees Write-tool creates only, not shell writes.
- 2 came before a Write created the index, at +125 and +47 min.

None sits between two deliveries.

## 3. On the wire (2.1.287, linux-x64, `claude -p`), each record in the single-session arms matched what its request added

The question is whether the record lists what was sent, and that can be tested without the gap firing. I routed new `claude -p` sessions (2.1.287, linux-x64) through a local server that answers with a canned reply and keeps request bodies in memory. The recorder is adapted from [`reprex_memory_cap.py`](https://github.com/pjt222/agent-almanac/blob/dd75182a962b261130893112ce8abf404789b543/tests/results/2026-08-26-cap-constant-closure/reprex_memory_cap.py). Each arm ran in a throwaway non-repo directory with a project `CLAUDE.md` canary and an index canary. Resumed bodies replay earlier turns, so for each request I took the instruction blocks it *added* and compared them with the record that request produced. The predictions were written down in `REPLICATION.md` before the run; they are not independently timestamped, and the deviations from them are listed there.

| arm | record written | record = blocks added | contents |
|---|---|---|---|
| fresh start | untagged: User, Project, AutoMem | yes | byte-equal |
| resume, nothing changed | **none**, and no block added | — | — |
| edit index, resume | tagged `session_start`: AutoMem | yes | byte-equal |
| `/compact`, then resume | untagged: full list; old index canary gone | yes | byte-equal |
| edit index again, resume (after compaction) | tagged `session_start`: AutoMem | yes | byte-equal |
| edit project file, resume | tagged `session_start`: Project | yes | byte-equal |
| 6 resumes at once after an index edit | tagged, 6 of 6 | index only: both have it | — |
| 6 fresh starts at once | untagged, 6 of 6 | index only: both have it | — |

After each of the three tagged records in the single-session arms, the files it left out (User and Project, or User and AutoMem) were still in the request from earlier turns. A negative control shows that check goes red when they're missing. No instruction block was in `system` in the single-session arms.

Two cautions:
- The code that splits a request into instruction blocks was built from, and checked on, the records' own `rendered` text: for every record here that carries it, splitting it gives back that record's file list byte for byte (964 of 964). So the table's record-to-request match is not independent of the records. The independent evidence is the new-value canaries: each edit in the single-session arms showed up in both the record and the request.
- This bears on 2.1.287 only. In these arms an unchanged resume wrote no record, and the only untagged resume record came on the turn after a compaction. DanceNitra read 2.1.263–2.1.273 as writing one on every resume ([5711174716](https://github.com/anthropics/claude-code/issues/82056#issuecomment-5711174716)). So none of this bears on your 7, @tonydzi; it shows only that on 2.1.287 the index was on the wire in each of the 12 concurrent resumes and starts of the recorded burst run (F16 in `FACTS.md`).

## What this does not establish

- §1–§2 are records, not context. §3 covers new `-p` sessions with a canned reply on 2.1.287, not the historical records, real model replies or interactive sessions.
- One machine, linux-x64. Records may be written differently on darwin or win32.
- No `reason: "compaction"` record appeared on the wire. That shape covers 22 of the 24 tagged records here and 3 of DanceNitra's 14. Neither automatic compaction nor a file edit during a live session was exercised.
- `Project` and `Local` entries are not checked against the files on disk, and `instructions` is not the only channel: 38 `nested_memory` attachments carry nested `CLAUDE.md` files separately.

*Written with AI assistance (Claude Code). Figures about this machine were computed from its transcripts on 2026-10-02. Claude Code's default 30-day retention has since deleted most of those transcripts, so `FACTS.md` is the record. Figures from others are quoted. The census script reads the transcripts under `~/.claude/projects/`, writes nothing outside its selftest fixture, and has a selftest that goes red on broken input; `--exclude-session baeb8d5c --until 2026-10-01T20:30:00Z` reproduced it on 2026-10-02. The wire scripts report their checks rather than stopping on a failed one. The recorded runs removed the arm directories, stores and `session-env` entries they created, and `~/.claude.json` and `~/.claude/tasks` were checked by hand; `REPLICATION.md` says what the cleanup covers. Write-up (`RESULT.md`), scripts, fact sheet and replication steps: [`tests/results/2026-10-01-instructions-record-manifest`](https://github.com/pjt222/agent-almanac/tree/7142dd8d90ce5f95778d720c0e456bb8decd6b85/tests/results/2026-10-01-instructions-record-manifest).*
