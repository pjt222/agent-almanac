# The `rm` audit behind the REPO_SAFETY absolute-path rule — re-derived, and the published figure does not reproduce

**Date:** 2026-09-17. **Machine:** WSL2 Ubuntu 24.04, kernel 6.18.33.2-microsoft-standard-WSL2.
**Branch:** `chore/safety-scrub-and-absolute-paths`, PR #859.
**Probes:** `rm-audit.mjs` and `rm-count-variants.mjs` beside this file; verbatim output in
`probe-runs.txt`.

## Question

Commit `c6addaea3` added a rule to the `REPO_SAFETY` preamble — name an absolute path under the
agent's scratch directory in every destructive command — and justified it with an audit stated in
three published prose sites and in the commit body:

> 28 subagent transcripts, 122 `rm` command lines, **zero** naming a risky absolute path and
> **55 naming a relative one**

An adversarial round on #859 raised two objections: `122 − 0 − 55 = 67` lines fall in no named
category, and the only durable record of any of it is a commit message over transcripts that are
session-local and private. The measurement below was run to settle both. It settled a third thing
instead.

## Method

`rm-audit.mjs` reads Claude Code subagent transcripts (`*.jsonl`), extracts every `tool_use` block
whose tool is `Bash`, takes its `command` string, splits it into command lines on newlines and the
operators that begin a new command (`&&`, `||`, `;`, `|`), and classifies each line that invokes
`rm`.

Two deliberate properties:

- **It reports two denominators, not one.** A *broad* count (the token `rm` appears as a word
  anywhere on the line) and a *strict* count (`rm` is the command word, optionally behind
  `sudo`/`command`/`time`/`git`). The gap between them is the instrument's own noise: a line like
  `echo "rm -rf \"$DIR/fixtures\" -> ..."` mentions `rm` and invokes nothing. The first version of
  this probe reported only the broad number and put 15 lines in the relative bucket, 8 of which
  were `echo` text. Hiding that gap is the exact failure this audit was convened to correct, so
  both numbers are printed and the strict one is the finding.
- **It refuses rather than reporting clean.** A directory set that matches no transcript exits 2
  with `REFUSED: no transcripts matched — a scan over nothing reports clean`.

The classifier's four buckets are exhaustive and their sum is printed against the strict count on
every run, so a line falling in no bucket would be visible as a mismatch.

| Bucket | Rule |
|---|---|
| `risky-absolute` | An operand naming `/`, the repository root, a home directory, or a top-level system directory; or a bare `.`, `..`, `*` |
| `relative` | Any operand that is not rooted at `/`, `~` or a variable |
| `absolute-in-sandbox` | Every operand rooted at `/`, `~` or `$VAR`, and none of them risky |
| `flag-only` | No operands at all after flags are removed |

`rm-count-variants.mjs` is the cross-check: it counts the same corpus four different ways
(command strings containing `rm`; newline-split lines; operator-split lines; raw token
occurrences) so that a disagreement with the published figure cannot be blamed on one splitting
choice.

## Results

Corpus: every subagent transcript retained on this machine for this project — **106 files across
18 session directories**, **704** Bash command strings.

| Measure | Value |
|---|---|
| lines MENTIONING `rm` (broad) | 39 |
| lines INVOKING `rm` (strict) | **31** |
| — `risky-absolute` | **0** |
| — `relative` | **7** |
| — `absolute-in-sandbox` | **22** |
| — `flag-only` | **2** |

The four counting rules in `rm-count-variants.mjs`, same corpus:

| Rule | Count |
|---|---|
| command strings containing `rm` | 24 |
| newline-split lines with `rm` | 34 |
| operator-split lines with `rm` | 39 |
| raw `rm` token occurrences | 36 |

## The published figure does not reproduce

**No counting rule over the retained corpus approaches 122.** The maximum is 39, and that is the
broad count over **all 106 transcripts**, not over one day: restricted to 2026-09-15 and later —
the two days the rule was written across — the corpus is 14 transcripts, 36 broad, and the
published claim was 28 transcripts.

This is a failure to reproduce, not a refutation. Transcripts are session-local and this set may
not be the set that existed on 2026-09-16; the mtime distribution in `probe-runs.txt` shows 4
files dated 2026-09-16 and 9 dated 2026-09-15, which is already inconsistent with "28 subagent
transcripts" measured that day, but retention behaviour was not investigated. What can be said is
narrow and sufficient: **a reader following the published numbers today cannot arrive at them**,
which is what § "a prose count needs an owner that fails" exists to prevent.

## What survives, and it is the part the rule rests on

Both measurements agree on the two things the rule was written for:

1. **Zero `rm` calls named a risky absolute path.** 0 of 31 here, 0 of 122 there.
2. **A real population of relative `rm` calls runs inside an agent's sandbox**, each safe only
   because `cd "$DIR" || exit 1` held — 7 of 31 here, 55 of 122 there. The proportion differs; the
   existence does not, and the rule is about the existence.

The near-miss is also corroborated. `rm -f CONTINUE_HERE.md docs/CONTINUE_HERE.md`, relative, is
present in the retained transcript of the #846 review round, in a block that also probes
`rm -- ""` and `git rm -q --dry-run -- ""`. Two notes on it. First, `docs/` exists in this
repository, so had that block's `cd` failed it would have taken the live handoff. Second, the
published narrative describes it as run "by a reviewer exercising that skill's cleanup block",
which points a reader at `skills/read-continue-here/SKILL.md` — where the shipped block is
`rm -- "$CONTINUE_FILE"`, already absolute and already guarded by `: "${CONTINUE_FILE:?…}"`. The
relative form was the reviewer's own teardown *while* exercising that block, not the block itself.

## Consequence for the prose

The three published sites are changed to cite this file and this measurement. The rule is
unchanged; only its evidence is. The original figures are not deleted from history — commit
`c6addaea3` carries them, and this file says why they are not repeated.

## The corpus contains this PR's own review round

`agent-aadvocatus-859-*` is the adversarial round on the PR that this audit supports, and it
contributes three of the 31 rows: `rm -rf fixtures` (its ARM A, a deliberate demonstration of the
unguarded shape), `rm -rf "$WORK/fixtures"` (its ARM B, the guarded shape) and
`rm -rf "${DIR:?}/fixtures"` (the fix being proposed). Evidence for a rule should not contain the
rule under test, so they are named rather than left to be discovered.

Removing that transcript does not change any conclusion: `risky-absolute` stays 0, and the
relative bucket loses one row — the ARM A demonstration — leaving six, of which the near-miss and
the two `rm -f err.tmp` calls are the genuinely incidental ones. The corpus was left whole because
a `--until` cut would also have to justify its boundary, and naming three rows is the smaller
claim.

## Limitation

The classifier splits on shell operators without parsing quotes, so an operator inside a quoted
string over-splits a line. That inflates the denominator rather than hiding a finding, which is
the safe direction, but it means the strict count of 31 is an upper bound on distinct invocations
and three of the seven `relative` rows are probe artefacts (`rm -- ""`, `git rm --dry-run -- ""`,
and one line split mid-quote). The genuinely relative destructive calls in the retained corpus
number four. The `risky-absolute` count of zero is unaffected by this, since over-splitting can
only create more rows to classify, never fewer.
