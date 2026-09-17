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

Version 2 therefore prints a **second number beside the first** — an independent recursive count
of candidate files — and refuses when `scanned + filtered ≠ candidates`. The bucket sum is also
now compared against a separately maintained counter of strict matches rather than against
itself; version 1 printed the same expression twice and called it a check, and a mutant that
returned a fifth bucket name crashed rather than producing the advertised mismatch.

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

| Measure | Value |
|---|---|
| candidate `.jsonl` on disk (recursive) | **739** |
| transcripts scanned | 739 |
| Bash command strings | 5955 |
| lines MENTIONING `rm` (broad) | 145 |
| lines INVOKING `rm` (strict) | **124** |
| — `risky-absolute` | **3** |
| — `relative` | **48** |
| — `absolute-in-sandbox` | 69 |
| — `flag-only` | 4 |

Compare version 1, same probe, non-recursive: 106 transcripts, 31 strict, **0** risky, 7
relative.

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

## The relative bucket

45 of the 48 are ordinary relative deletes inside what an agent believed was its own directory —
`rm -rf t`, `rm -rf nobin`, `rm -f err.tmp`, `rm -rf fixtures`, `rm -rf f/T`, `rm -f lb/*`. Three
are artefacts of splitting on operators without parsing quotes (`rm CONTINUE" /mnt/...`,
`rm -rf alsothis' 2>&1`). So the population the rule is about is real and is the large majority of
the bucket; publishing 48 as though every row were a real call would repeat the original's own
defect, which is why the 45 is stated separately.

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

It contains the review rounds on this PR, and grows with each one: between two runs inside a
single session the broad count moved 139 → 145 and the strict count 118 → 124, all of it the
round's own probes. Three rows come from round 1 (`rm -rf fixtures` as its ARM A demonstration,
`rm -rf "$WORK/fixtures"` as ARM B, and `rm -rf "${DIR:?}/fixtures"` as the fix). They are named
rather than excluded, because a `--until` cut would have to justify its boundary.

`--list FILE` writes the exact set of files scanned, so a figure can be re-derived against a
fixed set rather than a moving one.

## What this means for the rule

The rule is unaffected and the corrected numbers make its case stronger, not weaker: 48 relative
`rm` calls rather than 7, and a real `rm -rf *`. What changed is the evidence, twice, and the
transferable lesson is the instrument one — print a second number beside the denominator, and
make the self-check compare two independently derived values rather than one value with itself.
