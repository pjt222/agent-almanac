# The `rm` audit behind the REPO_SAFETY absolute-path rule — and an instrument that read 14% of its own corpus

**Date:** 2026-09-17. **Machine:** WSL2 Ubuntu 24.04, kernel 6.18.33.2-microsoft-standard-WSL2.
**Branch:** `chore/safety-scrub-and-absolute-paths`, PR #859.
**Probes:** `rm-audit.mjs` and `rm-count-variants.mjs` beside this file; verbatim output in
`probe-runs.txt`.

> **This file's first version was wrong and its conclusion was inverted.** It reported that
> commit `c6addaea3`'s audit figures "do not reproduce". They substantially do. The failure was
> in this file's own instrument, described in full below, because it is the more useful finding.

## Question

Commit `c6addaea3` added a rule to the `REPO_SAFETY` preamble — name an absolute path under the
agent's scratch directory in every destructive command — and justified it with an audit published
in three prose sites:

> 28 subagent transcripts, 122 `rm` command lines, **zero** naming a risky absolute path and
> **55 naming a relative one**

An adversarial round on #859 objected that `122 − 0 − 55 = 67` lines were in no named category
and that the only record was a commit message. This file was written to re-derive the figures.
Its first version did so with a non-recursive directory read, and a second adversarial round
caught that.

## The instrument failure

`readdirSync(dir)` is not recursive. Under this project the transcripts sit at two depths:

```
<session>/subagents/agent-<name>.jsonl                      106 files
<session>/subagents/workflows/wf_<id>/agent-<name>.jsonl     633 files
```

Version 1 read the first row and none of the second — **106 of 739, 14%** — and published that
as "every subagent transcript retained on this machine". Every one of the 633 it skipped belonged
to a **workflow-spawned** agent. So an audit written to justify the workflow template's safety
preamble excluded precisely the population that preamble governs, and it did so while printing a
denominator, which is the part worth keeping:

**A printed denominator proves what the scan read. It never proves what the scan should have
read.** 106 was an honest count of the files opened and was never compared to what was on disk.
`rm-count-variants.mjs` shared the identical blind spot, so the four "independent counting rules"
cross-checked the splitting rule against itself and all four counted the same 14%.

Version 2 printed a second number beside the first and called it independent. **It was not, and a
third round proved it with a mutant.** Both numbers came from the same `walk()`, so any blindness
in `walk` was invisible to the check: reintroducing version 1's exact defect — one site,
`if (isDir) walk(...)` → `continue` — left every version-2 guard intact and printed
`106 / 106 / 0 risky-absolute` at exit 0. The reassuring `(recursive, before any date filter)`
in that output is a string literal asserting a property of the code, not a measurement of it.

The rule that survives all three rounds is therefore stronger than "print a denominator":

> A self-check must compare two values that were **produced by different code**. One value
> printed twice is not a check, at the level of a variable or of a function.

Version 3 counts candidates with `readdirSync(root, { recursive: true })` — Node's own
implementation, sharing no code with `walk()`, and agreeing with `find(1)` at 739 — and refuses
when the two traversals disagree. It also refuses on a root that contributes no files (a mistyped
root beside a good one), on any directory it could not list (a permission-denied subdirectory
otherwise removes files and reports clean), and it resolves directories with `statSync` rather
than `Dirent.isDirectory()`, whose lstat semantics skip a symlinked session directory in silence.
A transcript-like file that is not `.jsonl` is reported rather than passed over.

The bucket sum is compared against a separately maintained counter of strict matches; version 1
printed the same expression twice and called that a check, and a mutant returning a fifth bucket
name crashed rather than producing the advertised mismatch.

### Proof that the traversal guard fires

A two-file fixture — one `.jsonl` at the root, one nested, the nested one holding the risky row —
run against the shipped probe and against the same probe with version 1's defect reintroduced:

```
BASELINE   candidate .jsonl on disk 2  (walk(), cross-checked ... = 2)
           lines INVOKING rm        2
           risky-absolute           1          exit 0

MUTANT     REFUSED: two independent traversals disagree — walk() found 1,
           node readdirSync({recursive:true}) found 2. One of them is blind.
                                              exit 2
```

The mutant is the bug this file documents, and the fixture reproduces its signature exactly: it
would have reported **zero** risky rows. It now refuses instead. Against the real corpus the same
mutant is caught one guard earlier, by the empty-root refusal, and a partial-blindness mutant that
skips only `workflows/` is caught the same way.

## Method

`rm-audit.mjs` walks the given roots recursively for `*.jsonl`, extracts every `tool_use` block
whose tool is `Bash`, takes its `command` string, splits it into command lines on newlines and
the operators that begin a new command (`&&`, `||`, `;`, `|`), and classifies each line that
invokes `rm`.

Two denominators are reported for the match itself. *Broad*: the token `rm` appears as a word
anywhere on the line — this includes `echo "rm -rf ..."` text, so it over-counts. *Strict*: `rm`
is the command word. The gap between them is the instrument's noise, and it was measured rather
than assumed: dumping every broad-but-not-strict line over the full corpus shows all of them to
be `echo`/`printf`/comment text, with no real invocation dropped.

The four buckets, stated **as the code applies them**, not as a paraphrase:

| Bucket | Rule as implemented |
|---|---|
| `risky-absolute` | An operand naming `/`, **any path under the repository** (`bare.startsWith(REPO)`, not merely its root), a home directory, or a top-level system directory; or a bare `.`, `..`, `*` |
| `relative` | Any operand not rooted at `/`, `~` or a variable |
| `absolute-in-sandbox` | Every operand rooted at `/`, `~` or `$VAR`, none risky |
| `flag-only` | No operands after flags are removed |

## Results — full corpus

This is **one run**, the one captured verbatim in `probe-runs.txt`. The corpus grows while it is
measured (see below), so a later run will differ.

| Measure | Value |
|---|---|
| corpus digest | `603aa200b03c20c3692365be99f4ecc336e11d7ce59c8ef10c56fdc37a21468b` |
| candidate `.jsonl` on disk | **740** — `walk()` and `readdirSync({recursive:true})` agree, and `find(1)` gives the same |
| transcripts scanned | 740 |
| Bash command strings | 6027 |
| lines MENTIONING `rm` (broad) | 197 |
| lines INVOKING `rm` (strict) | **156** |
| — `risky-absolute` | **3** |
| — `relative` | **51** (46 ordinary deletes; see below) |
| — `absolute-in-sandbox` | 98 |
| — `flag-only` | 4 |

Compare version 1 of this probe, non-recursive, on the same machine: 106 transcripts, 31 strict,
**0** risky, 7 relative.

## The original figures substantially reproduce — retraction

Tested on the original claim's own terms, restricted to 2026-09-16:

| | `c6addaea3` published | measured here |
|---|---|---|
| transcripts | 28 | 21 |
| `rm` lines | 122 | 73 strict / 77 broad |
| risky absolute | **0** | **1** |
| relative | 55 | 41 |

Same order of magnitude on every row, over a corpus that has since changed (transcripts are
session-local and some have rotated). **The claim that the figures "do not reproduce" is
withdrawn.** It was an artefact of reading 14% of the corpus, and version 1 of this file stated
it in the title.

**The one number the original got wrong is the zero.** There is a `risky-absolute` row inside the
original's own window, on disk when it was written.

## The three risky rows, graded

```
agent-aac3b36dc3f99318e.jsonl  rm -rf /mnt/d/dev/p/agent-almanac/.claude/worktrees/wf_662d4356-9c9-5/.review647
agent-ae2726c8ae0fca381.jsonl  rm -rf /mnt/d/dev/p/agent-almanac/.claude/worktrees/wf_662d4356-9c9-18/.probe-scratch
agent-a6ae7416e184753b2.jsonl  rm -rf *
```

**One is unambiguous.** `rm -rf *` is a bare glob: risky under the documented rule whatever the
working directory is, and the exact shape the preamble exists to prevent. It is dated 2026-09-16
— inside the original audit's window.

The other two are a workflow deleting its own scratch directory inside its own worktree. The
*documented* rule rules out the repository root; the *implemented* rule flags anything under the
repository, and a worktree under `.claude/worktrees/` is under the repository. Those two rows are
the code being stricter than the prose. Their working directories were not read and no claim is
made that any deletion went wrong.

## The relative bucket, row by row

48 rows split three ways, and the split is stated because publishing 48 as though every row were
a real delete would repeat the original's own defect:

| | count | examples |
|---|---|---|
| splitting artefacts (operators inside quotes) | 3 | `rm CONTINUE" /mnt/…`, `rm -rf alsothis' 2>&1` |
| invocations that delete nothing by construction | 2 | `git rm -q --dry-run -- ""`, `rm -- ""` |
| **ordinary relative deletes** | **46** | `rm -rf t`, `rm -rf nobin`, `rm -f err.tmp`, `rm -rf f/T`, `rm -f lb/*` |

An earlier version of this file said
"45 of the 48", which quietly promoted the two no-op invocations into real deletes — an error in
the direction that flatters the count, found by re-deriving the split row by row rather than
subtracting.

## The near-miss

`rm -f CONTINUE_HERE.md docs/CONTINUE_HERE.md`, relative, is present in the retained transcript of
the #846 review round, in a block that also probes `rm -- ""` and `git rm -q --dry-run -- ""`.
`docs/` exists in this repository, so had that block's `cd` failed it would have taken the live
163 KB handoff. Its transcript shows `DIR="$(mktemp -d)" || exit 1; cd "$DIR" || exit 1`
immediately above, so the control held and nothing was lost.

One correction to how it has been described. The published narrative said it was run "by a
reviewer exercising that skill's cleanup block", which points a reader at
`skills/read-continue-here/SKILL.md` — where the shipped block is `rm -- "$CONTINUE_FILE"`,
already absolute and already guarded by `: "${CONTINUE_FILE:?…}"`. The relative form was the
reviewer's own teardown *while* exercising that block, not the block itself. A reader following
the old pointer found a compliant block and could not reconstruct the near-miss.

## What this instrument cannot measure

`absolute-in-sandbox` is the largest bucket — 69 of 124 — and most of its rows are `$VAR`-rooted.
The classifier does not know a variable's value, so:

- It **cannot distinguish `rm -rf "$DIR/x"` from `rm -rf "${DIR:?}/x"`.** Both land in the same
  bucket. The instrument therefore cannot measure compliance with the very rule this audit
  supports, and would score a future unbraced regression as safe.
- "Zero risky" over the literal-path rows is a statement about the minority whose operands the
  classifier can actually evaluate.

Anyone extending this should count braced versus unbraced `$VAR` forms as separate buckets. That
is a different question from the one asked here and was not attempted.

## The corpus moves while it is being measured

It contains the review rounds on this PR, and grows with each one. The strict count moved
118 → 124 → 130 across three rounds of a single session, all of it the rounds' own probes, and
**55 of the current 156 strict rows — 35% — come from this PR's own reviewer transcript.** The
rounds share one transcript file, because resuming an agent appends to its existing transcript,
so each round accumulates there, and the share has risen at every round: 118 → 124 → 130 → 137 →
149 → 156 strict, with the growth almost entirely the rounds' own probes and mutant fixtures.
Over a third of the strict count is now the review of the change measuring the change — which is
itself the reason the sixth round recommended stopping rather than running a seventh.

That share is large enough to state plainly rather than footnote: the `absolute-in-sandbox`
bucket is now materially shaped by the review of the change it is evidence for. The rows are
named rather than excluded, because a `--until` cut would have to justify its boundary — but a
reader should size the bucket accordingly.

**Any figure quoted from this file is a figure from one run.** The table above is the run captured
in `probe-runs.txt`, and `probe-runs.txt` now prints the **literal command line** for every
section — including how the root list is derived — so a re-deriver runs what was run instead of
guessing. That matters more than it sounds: the roots can legitimately be given three ways
(`*/subagents`, the project directory, or a single session) and they produce different corpora,
so a figure without its invocation is not re-derivable at all.

`--list FILE` writes the exact set of files scanned. **Its output is deliberately not committed**:
every path contains a session id, and committing 740 of them would reintroduce the class this
PR's first commit removed from `tools/fixtures/review-r2-input.json` — for a list that is
machine-local and useless to a reader on another machine. Run it locally when you need to pin a
figure to a fixed set.

`capture.sh` beside this file regenerates `probe-runs.txt`, and placeholders home paths, uids and
session ids on the way out.

**What replaces the manifest is a digest.** `probe-runs.txt` opens with a content-only,
order-independent hash of every file scanned:

```
find <roots> -name '*.jsonl' -type f -print0 | sort -z | xargs -0 sha256sum \
  | awk '{print $1}' | sort | sha256sum
```

It publishes no path and no identifier, and it gives the corpus a name. Anyone re-running gets a
different digest and knows immediately that their figures are not comparable to these — which is
precisely what the drift across five review rounds demonstrates, and what a bare count cannot
tell you.

**A mismatch is the expected case, not an error.** Any session run in this project since capture
adds or extends a transcript, so the digest moves — it moved between two review rounds at an
unchanged file count of 740, because the act of reviewing this file rewrote the corpus it
measures. The digest's purpose is letting two readers ask whether they are looking at the same
corpus, never certifying these figures forever.

One deliberate inconsistency, stated rather than left to be noticed: `probe-runs.txt` prints this
repository's own project-store slug inside the copy-pasteable root-derivation command, and
`tools/check-redaction.sh` flags it. The slug is the repository's name and its parent path is
already published in the parent `CLAUDE.md`, so it carries no information a reader does not have;
the command is worth more copy-pasteable than placeholdered. A session id is a different matter
and is placeholdered everywhere.

## What this means for the rule

The rule is unaffected and the corrected numbers make its case stronger, not weaker: 48 relative
`rm` calls rather than 7, and a real `rm -rf *`. What changed is the evidence, twice, and the
transferable lesson is the instrument one — print a second number beside the denominator, and
make the self-check compare two independently derived values rather than one value with itself.
