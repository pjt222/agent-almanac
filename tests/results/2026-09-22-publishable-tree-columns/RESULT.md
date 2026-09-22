# PR #883 — the two-column porcelain classification, measured

Target: `scripts/check-publishable-tree.js` and `scripts/lib/skills-inventory.js` on branch
`fix/879-r3-worktree-column`, the round-3 follow-up to #879 (which closed #876).

## What is here

`mutation-plan.tsv` — the mutants behind the verdict table in the PR body, one row per claim,
runnable as a set. The count lives in the plan and in the envelope's own summary line, not in
this sentence: it said "twelve" for two rounds after the plan had grown to sixteen (#883 round
4, N-2).

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

Provenance, because "and after" is not one. The sixteen rows were taken as a set at
`d19981306` under `npm run test:scripts`, the command CI runs; the three that read `by 2` there
were re-taken after the parser fix at `e0df06cb3` and read `by 1`. The round-5 reviewer then ran
all sixteen in one envelope call at `d0e91c97e` in its own lab, under the file-level command,
and read every row `by 1` — the table below is that shape:

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
sf1r3-staged-gone-drops-worktree-test      MUTANT KILLED by 1 failing test(s)
sf2-absent-remedy-names-one-form           MUTANT KILLED by 1 failing test(s)

16 row(s), 0 not a clean kill
```

**Three rows earned their place by surviving, and they are the only ones whose kill carries
information.** `sf1-staged-gone-A-to-T` and `sf1-staged-gone-narrows-to-AD` survived the
twelve-row revision: the arm was pinned by its block's *count*, and a swap preserves a count —
turning `raw(path)[0] === 'A'` into `=== 'T'` put `AD` back under "a file the commit has" and
moved `T ` into STAGED-BUT-GONE, leaving the 4 and the 1 untouched. `sf1r3-…` then survived the
fifteen-row revision, for the mirror-image reason: membership over the codes the arm INCLUDES
says nothing about the code it must EXCLUDE, and no fixture read the report for an `A ` path.

**Every row is `KILLED by 1`, and three of them were `KILLED by 2` for a bad reason until the
parser test was fixed.** The claim published here at that revision — that the second failing
test was a second genuine assertion of the property — was false, and measuring it is what
showed that:

```
sfb-staged-gone-folds-into-absent   two-column test: AssertionError deep-equal
                                    parser test:     TypeError: Cannot read properties of null
```

The parser test hardcoded `refusedBlock(truncated, 'STAGED-BUT-GONE')`. Any mutant routing `AD`
elsewhere made that block absent, `refusedBlock` returned `null`, and `.length` threw — a crash
in a test asserting nothing about the mutated line, which is #621's shape with the roles
reversed. It reads the label back out of `report`'s own output now, so the test is about the
parser whatever bucket the paths land in, and all three rows return to 1.

Two things worth keeping from that. The checker could not have caught it: its broad-kill
heuristic trips at `BROAD_KILL_SHARE = 0.25` of the baseline and 2/939 is 0.002, so the count
was never going to be questioned — **a `by 2` needs a human to read which two**. And "both
assertions are about the property" was written from the shape of the tests rather than from
their output; the failure names were one `node --test` away (#883 round 4, SF-1).

One qualification about HOW the table was taken, because the envelope's contract is one command
for every row and the transcript shows four invocations. A row costs about 74 s here — the
checker takes a fresh baseline per row — so sixteen rows is roughly twenty minutes, past the
session's 600 s per-call ceiling. The plan was split into four parts of four, each run with the
same `--test 'npm run test:scripts'`. What the envelope guarantees is that no row is measured
under a different command, and that holds; what a split costs is a single exit code over the
set, so the four `0 not a clean kill` lines stand in for it.

**No one-call run of this plan under `npm run test:scripts` has been taken in any lab**, and
this file will not predict one. What was measured, by the round-2 reviewer in its own lab, is
the twelve-row revision of the plan in a single envelope call under a different command —
`--test 'node --test scripts/test/publishable-tree.test.js'`, the file-level one: `12 row(s), 0
not a clean kill`, exit 0, **53 s in total**. Under `npm run test:scripts` a single row cost
53 s in that same lab, which is where twelve rows ≈ 636 s comes from. The two 53 s figures are
a coincidence of that lab and mean different things; an earlier revision of this paragraph
attributed the one-call run to the CI command and merged them (#883 round 3, SF-2). This is the
mixing the plan file's own header warns about.

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
| `sf1r3-staged-gone-drops-worktree-test` | the arm EXCLUDES a staged add still on disk; `A `/`AM` are MODIFIED, and the pack does carry them |
| `sf2-absent-remedy-names-one-form` | the ABSENT remedy names a restore form per code, not one form for all of them |

One failing test per row is the honest shape for this instrument. A broad kill would mean the
mutant crashed on import rather than being caught by an assertion (#621) — and so, as the
by-2 episode above shows, can a kill by two.

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
    1 memcap-arms-               (only with python3 on PATH — see below)
    1 node-compile-cache         (npm's, not a fixture — see below)

memory-blocks.test.js alone:  21 directories left
publishable-tree.test.js:      0   (the control row)
```

The ground-truth section is what settles it, because **both predicates are heuristics and the
refined one can UNDER-count**: it counts the token `finally` per file, not a `finally` that
pairs with a given `mkdtempSync`, so a suite with three fixtures and three unrelated `finally`
blocks passes it. Rather than refine the predicate further, the script runs the suite the way
CI runs it and counts what is left. Every leaked **fixture** belongs to `memory-blocks.test.js`,
so the refined count of 1 is right here — measured, not argued.

Two qualifications on that `22`, because a bare total invites being quoted without them:

- **`node-compile-cache` is not a fixture and not the suite's.** Measured: a bare
  `node --test <suite>` under a fresh `TMPDIR` leaves 0 entries, while `npm run` of an entirely
  unrelated script leaves exactly `node-compile-cache/`. It is npm enabling Node's compile
  cache, and it appears here only because the probe goes through `npm run`. An earlier revision
  of this paragraph said every leaked *entry* belonged to `memory-blocks.test.js`, which this
  one entry refutes (#883 round 3 delta, N-B).
- **`22` is conditional on `python3`.** The `memcap-arms-` fixture sits inside a test carrying
  `skip: PYTHON3 === null` (`scripts/test/memory-blocks.test.js:277`, fixture at `:279`), so on
  a machine without `python3` on `PATH` the run leaves **21** and that row disappears. The
  probe prints the breakdown, so its own output shows the difference; prose quoting the total
  has to carry the clause (N-A).

The control row is the point of the last section, not decoration: a probe that counted nothing
anywhere would otherwise read as a clean result.

`two-column-pack.sh` — what npm packs from the eight-code fixture the two-column test builds.
The test's closing comment states which of the eight reach the tarball, and that sentence has
been wrong once already (it said "package.json alone", true before `A `/`AM` were added to the
fixture and false after), so it is re-derived rather than remembered:

```
git reports:  A  new.md   AD added.md   AM new2.md   AT addsym.md
              MD SKILL.md  MT retyped.md  T  staged.md   T references/helper.py
npm packs:    package.json, skills/real/new.md, skills/real/new2.md   — 3 files
```

Exactly the two paths whose worktree file exists. "Packed with their WORKING-TREE bytes" is
true of those two and false of all six absences, which is the whole basis for splitting the
remedy sentences by bucket.

`expected-codes.mjs` — the eight codes, read out of the test. `two-column-pack.sh` calls it and
compares its own fixture's porcelain against the result, so there is ONE source for the set and
nothing left for it to drift against.

It carried a literal of its own for one round, and that was the fifth instance of this PR's
recurring class: the script named the test in three comments, read nothing from it, and claimed
to refuse when the test's fixture changed. Measured — rename `new2.md` to `new3.md` at all six
sites of the TEST's fixture, and the test stays green at 27/27 while the script exits 0 with
zero `REFUSED` lines, still reporting `new2.md` (#883 round 5, SF-1). The exercise that had
been offered as evidence renamed the script's own literal, which is the one direction a
self-comparison covers.

A parser doing that job has the same defect available to it one level down, and the first
version had it: a parser that DROPS what it cannot read reports an absence where a reader
would see a mismatch. Measured — adding a double-quoted ninth entry to the test's `deepEqual`
left it printing eight codes, the script's eight-code fixture matched, and the guard passed
while the test asserted nine (#883 round 5 delta, SF-A). It now accounts for every non-blank
line inside the block: an entry or a comment, anything else exits 2. The anchor is the test's
TITLE rather than its assertion message, so a reworded message cannot move it onto another
block, and the block's extent is taken by brace matching rather than a lazy match that stops
at the first nested `}`.

`prove-expected-codes.sh` is the negative evidence, one archive lab per arm:

```
control: untouched                 codes exit 0 (8 lines)  script exit 0
double-quoted ninth entry          codes exit 2 (0 lines)  script exit 2
comment quoting a pair             codes exit 0 (8 lines)  script exit 0
test title reworded                codes exit 2 (0 lines)  script exit 2
test fixture renamed               codes exit 0 (8 lines)  script exit 1
assertion message reworded         codes exit 0 (8 lines)  script exit 0
```

The control arm and the two that must NOT refuse are as load-bearing as the two that must: a
rule that refuses everything would pass a matrix made only of the bad rows.

## Not covered here

The classification source itself. This guard reads git's porcelain code; npm reads the disk, and
the two disagree for `git rm --cached` (two records for one path) and for `TM`/`TT`. That is
filed as #884 with its own measurement, deliberately outside this PR.
