# git-files enumeration: the measurements behind #874

Every figure `scripts/lib/git-files.js` cites in its header, and every figure PR #874's body
cites, is produced by one of the scripts beside this file. They are committed because a number a
reader cannot re-run is a number they have to take on trust — the #874 review asked for exactly
that and was right to.

Run them from the repository root. Each builds its own fixture under `mktemp -d` and removes it;
none writes into this repository.

| Script | Answers |
|---|---|
| `check-ignore-behaviour.sh` | does `check-ignore` report a tracked-but-ignored file, a directory, a nested `.gitignore`, a negation, `info/exclude`; what do its exit codes mean |
| `literal-pathspecs-refuted.sh` | does `--literal-pathspecs` fix the pathspec-parsing problem (no — it is rejected outright) |
| `pathspec-escaping.sh` | does backslash-escaping a candidate fix it (yes), and in what form does git echo the answer back (escaped) |
| `enumeration-cost.mjs` | what the enumeration costs over the 46 call sites `generate-readmes.js` makes, against the `readdirSync` it replaced |
| `prefix-equivalence.mjs` | does the npm-ships prefix rule admit exactly what the recursive walk it replaced admitted |
| `coverage-envelope.sh` | does `tree-counts.test.js` actually catch the defect its predecessor was measured green on |

## What they measured, 2026-09-21, git 2.43.0, Node 25.9, WSL2 (`/mnt/d` is 9p/drvfs)

**`check-ignore` behaviour.** A tracked file matching an ignore pattern (`git add -f`) is **not**
reported as ignored — `--no-index` reverses that, the default consults the index — so the module
needs no tracked-set union of its own. A directory matching `build/` **is** reported when asked
about as `build`, without the trailing slash, which is how `topLevelEntries` asks. Nested
`.gitignore` files, `!negations` and `.git/info/exclude` are all honoured. Exit 1 means "no path
matched"; exit 128 means fatal; outside a repository it is 128.

**Pathspec parsing.** A candidate is read as a **pathspec**, not as a name. `tools/x*y.log` and
`tools/a\b.log` — both of which `git status --ignored` lists as ignored — come back *not* ignored
when a tracked sibling glob-matches them. `--literal-pathspecs` is not the escape: this command
rejects it outright (`fatal: pathspec magic not supported by this command: 'literal'`, exit 128)
for ordinary candidates too. Backslash-escaping **is** accepted and correct: the two ignored files
are then reported, a genuinely-not-ignored `tools/q?.sh` still returns exit 1 with no false
positive, and git echoes the **escaped** form back, which is why the module keys its answer by the
escaped string and maps home.

**Cost.** Over the 46 call sites, on this mount:

```
ls-files --cached --others --exclude-standard   32612 ms   (the first implementation)
readdirSync + one check-ignore batch per call    3299 ms   (this implementation)
readdirSync alone, no ignore rule at all          173 ms   (what it replaced)
```

The cost is not process spawn — `git rev-parse` is 36 ms and `ls-files --cached` is 94 ms
repo-wide. It is `--others`, which walks and stats the working tree and loads a 13,492-entry index
on every call. `check-ignore` consults the ignore rules and the index and stats nothing. The two
implementations were run against each other before the replacement: identical answers on 46/46
call sites and 4/4 content trees.

`enumeration-cost.mjs` reports a slightly different total on each run (3299 ms and 3291 ms were
both observed). Quote the figure from a run, not from this file.

**Prefix equivalence.** The flat listing's ancestor-prefix test admits exactly what the recursive
walk admitted: 8 negation shapes × 4 trees, 0 disagreements, with `no negations at all` and `a
prefix that matches no boundary` as the controls that stop the other six agreeing vacuously.

**Coverage envelope.** Four arms, two of them controls: unmutated-clean green, unmutated with a
gitignored `scripts/local-probe.js` green, the count reverted to a disk walk red, and the
mutation alone red. The first version of that envelope had the wrong control — it removed the
planted file while leaving the mutation, which the fixture catches on its own — and reported
INCONCLUSIVE against a correct instrument. That is recorded because it is the same class of error
the finding was about.

## Not measured

The `readdirSync` baseline's cost **before** this change, on this mount, inside the real generator
run: it cannot be run against a working tree that is on another branch. The 173 ms figure is the
same enumeration performed standalone, which is a lower bound on what the old code paid, not a
measurement of it.
