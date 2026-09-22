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

One failing test per row is the honest shape for this instrument. A broad kill would mean the
mutant crashed on import rather than being caught by an assertion (#621).

## Not covered here

The classification source itself. This guard reads git's porcelain code; npm reads the disk, and
the two disagree for `git rm --cached` (two records for one path) and for `TM`/`TT`. That is
filed as #884 with its own measurement, deliberately outside this PR.
