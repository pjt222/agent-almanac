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

Taken at `d19981306`, every row under `npm run test:scripts` — the command CI runs:

```
sfc-absent-drops-T-index-column            MUTANT KILLED by 1 failing test(s)
sfb-staged-gone-folds-into-absent          MUTANT KILLED by 2 failing test(s)
sfd-unmerged-sentence-reverts              MUTANT KILLED by 1 failing test(s)
n1-unmerged-drops-UU                       MUTANT KILLED by 1 failing test(s)
n1-unmerged-drops-AA                       MUTANT KILLED by 1 failing test(s)
n1-unmerged-drops-UD                       MUTANT KILLED by 1 failing test(s)
n1-unmerged-drops-DU                       MUTANT KILLED by 1 failing test(s)
n1-unmerged-drops-DD                       MUTANT KILLED by 1 failing test(s)
n5-dot-slash-refusal-disabled              MUTANT KILLED by 1 failing test(s)
r1-worktree-column-reverts-to-trim         MUTANT KILLED by 2 failing test(s)
r1-absent-drops-T-worktree-column          MUTANT KILLED by 1 failing test(s)
r1-negation-prefix-loses-segment-boundary  MUTANT KILLED by 1 failing test(s)
sf1-staged-gone-A-to-T                     MUTANT KILLED by 2 failing test(s)
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

Three rows kill by **2** rather than 1, and that is not the crash signature #621 warns about.
The second failing test is `refusedBlock reads one block, and not the truncation line`, which
calls `report` directly over a synthetic set of codes — so a mutation of the bucket predicates
is genuinely asserted twice, once through the fixture and once through the parser's own unit
test. Both assertions are about the property, which is what separates a real double kill from a
mutant that crashed on import.

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

## Not covered here

The classification source itself. This guard reads git's porcelain code; npm reads the disk, and
the two disagree for `git rm --cached` (two records for one path) and for `TM`/`TT`. That is
filed as #884 with its own measurement, deliberately outside this PR.
