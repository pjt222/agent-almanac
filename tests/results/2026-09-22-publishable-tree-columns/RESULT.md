# PR #883 — the two-column porcelain classification, measured

Target: `scripts/check-publishable-tree.js` and `scripts/lib/skills-inventory.js` on branch
`fix/879-r3-worktree-column`, the round-3 follow-up to #879 (which closed #876).

## What is here

`mutation-plan.tsv` — the twelve mutants behind the verdict table in the PR body, one row per
claim, runnable as a set:

```
bash tools/mutation-envelope.sh --test 'npm run test:scripts' \
  --plan tests/results/2026-09-22-publishable-tree-columns/mutation-plan.tsv
```

## Why it was added after the fact

The PR body published the table before this file existed. The rows had been measured, but in a
session scratchpad that is now gone, so no committed artifact reproduced them. A published
number whose measurement cannot be re-taken is HISTORICAL by this repository's own convention
(`tests/results/2026-09-21-git-files-enumeration/RESULT.md` marks three figures that way for the
same reason), and quoting one as a live verdict is the thing the convention exists to prevent.

The table in the PR body is now the output of this plan, taken at the head that carries this
file, rather than a quotation of a run nobody else can take.

## The verdicts

Taken at `342a94777`, every row under `npm run test:scripts` — the command CI runs:

```
sfc-absent-drops-T-index-column            MUTANT KILLED by 1 failing test(s)
sfb-staged-gone-folds-into-absent          MUTANT KILLED by 1 failing test(s)
sfd-unmerged-sentence-reverts              MUTANT KILLED by 1 failing test(s)
n1-unmerged-drops-UU                       MUTANT KILLED by 1 failing test(s)
n1-unmerged-drops-AA                       MUTANT KILLED by 1 failing test(s)
n1-unmerged-drops-UD                       MUTANT KILLED by 1 failing test(s)
n1-unmerged-drops-DU                       MUTANT KILLED by 1 failing test(s)
n1-unmerged-drops-DD                       MUTANT KILLED by 1 failing test(s)
n5-dot-slash-refusal-disabled              MUTANT KILLED by 1 failing test(s)
r1-worktree-column-reverts-to-trim         MUTANT KILLED by 1 failing test(s)
r1-absent-drops-T-worktree-column          MUTANT KILLED by 1 failing test(s)
r1-negation-prefix-loses-segment-boundary  MUTANT KILLED by 1 failing test(s)
sf1-staged-gone-A-to-T                     MUTANT KILLED by 1 failing test(s)
sf1-staged-gone-narrows-to-AD              MUTANT KILLED by 1 failing test(s)
sf2-absent-remedy-names-one-form           MUTANT KILLED by 1 failing test(s)

15 row(s), 0 not a clean kill
```

**The last three rows are the ones that matter most, and two of them earned their place by
surviving.** At the twelve-row revision, `sf1-staged-gone-A-to-T` and
`sf1-staged-gone-narrows-to-AD` both reported `MUTANT SURVIVED — this line is not covered`
against all 938 tests. The arm was pinned by its block's *count*, and a swap preserves a count:
turning `raw(path)[0] === 'A'` into `=== 'T'` put `AD` back under "a file the commit has" and
moved `T ` into STAGED-BUT-GONE, leaving the 4 and the 1 untouched. Both are killed now that
the blocks are asserted by membership. A row that once survived is the only kind whose kill
carries information.

One qualification about HOW the table was taken, because the envelope's contract is one command
for every row and the transcript shows three invocations. A row costs about 74 s here — the
checker takes a fresh baseline per row — so fifteen rows is roughly nineteen minutes, past the
session's 600 s per-call ceiling. The plan was split into three parts of five, each run with the
same `--test 'npm run test:scripts'`. What the envelope guarantees is that no row is measured
under a different command, and that holds; what a split costs is a single exit code over the
set, so the three `0 not a clean kill` lines stand in for it.

Whether one call reproduces the table was **not** measured at fifteen rows and this file will
not predict it. What was measured, by the round-2 reviewer in its own lab, is the twelve-row
plan in a single envelope call under this file's own command: `12 row(s), 0 not a clean kill`,
exit 0. Under the CI command a row cost 53 s there, so twelve rows is about 636 s and the split
was needed in that lab too.

## What each row pins

| row | the claim it kills |
|---|---|
| `sfc-absent-drops-T-index-column` | the INDEX column's retype half (`T `) has a fixture — the reviewer's own mutant, which survived 937 tests before the two-column fixture |
| `sfb-staged-gone-folds-into-absent` | `AD`/`AT` get the STAGED-BUT-GONE sentence, not "the commit has it" |
| `sfd-unmerged-sentence-reverts` | the UNMERGED remedy no longer asserts conflict markers for all seven codes |
| `n1-unmerged-drops-{UU,AA,UD,DU,DD}` | each of the five codes the rename/rename fixture cannot reach has one |
| `n5-dot-slash-refusal-disabled` | a `./`-prefixed `files` entry is refused rather than silently under-counted |
| `r1-worktree-column-reverts-to-trim` | the predicate reads git's two columns, not a trimmed pair |
| `r1-absent-drops-T-worktree-column` | the WORKTREE column's retype half (` T`) has a fixture |
| `r1-negation-prefix-loses-segment-boundary` | a directory negation prefixes on a segment boundary, so `lib` does not carve from `lib-extra/x/` |
| `sf1-staged-gone-A-to-T` | the STAGED-BUT-GONE arm is pinned by membership; a swap that preserves both counts is caught |
| `sf1-staged-gone-narrows-to-AD` | `AT` is in the fixture, so narrowing the arm to `AD` alone no longer passes unnoticed |
| `sf2-absent-remedy-names-one-form` | the ABSENT remedy names a restore form per code, not one form for all of them |

One failing test per row is the honest shape for this instrument. A broad kill would mean the
mutant crashed on import rather than being caught by an assertion (#621).

## The two round-2 measurements, as scripts rather than as prose

Both are runnable from anywhere and derive what they need themselves, so neither figure below
is HISTORICAL.

`restore-remedy-matrix.sh` — what `git restore` does for each absence code, one fresh
repository per (code, command) pair. Measured on git 2.43.0. The row that moved the source:

```
[T ] | T  f.md | git restore -- f.md                     | exit 0  after: T  f.md
[T ] | T  f.md | git restore --staged --worktree -- f.md | exit 0  after: (clean)
```

Plain restore on `T ` is a silent exit-0 no-op — the index holds the symlink, so restoring from
it changes nothing — and the operator re-runs the guard, sees the same refusal, and has no error
to explain it. The inverse trap is `MD`/`MT`, where the two-flag form clears the tree by
DISCARDING the staged edit that plain restore recovers. That is why the remedy names a form per
code instead of one form for all of them.

`teardown-predicate.sh` — the #885 population, and whether it leaks:

```
suites using mkdtempSync:                 43
crude   (mkdtempSync > t.after):          20
refined (mkdtempSync > t.after+finally):   1   memory-blocks.test.js

GROUND TRUTH — npm run test:scripts under an isolated TMPDIR, exit 0, 22 entries left:
   20 memblocks-
    1 memcap-arms-
    1 node-compile-cache          (node's own, not a fixture)

memory-blocks.test.js alone:  21 directories left
publishable-tree.test.js:      0   (the control row)
```

The ground-truth section is what settles it, because **both predicates are heuristics and the
refined one can UNDER-count**: it counts the token `finally` per file, not a `finally` that
pairs with a given `mkdtempSync`, so a suite with three fixtures and three unrelated `finally`
blocks passes it. Rather than refine the predicate further, the script runs the suite the way
CI runs it and counts what is left. Every leaked entry belongs to `memory-blocks.test.js`, so
the refined count of 1 is right here — measured, not argued.

The control row is the point of the last section, not decoration: a probe that counted nothing
anywhere would otherwise read as a clean result.

## Not covered here

The classification source itself. This guard reads git's porcelain code; npm reads the disk, and
the two disagree for `git rm --cached` (two records for one path) and for `TM`/`TT`. That is
filed as #884 with its own measurement, deliberately outside this PR.
