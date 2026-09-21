# git-files enumeration: the measurements behind #874

Every figure `scripts/lib/git-files.js` cites in its header, and every figure PR #874's body
cites, traces either to one of the scripts beside this file or to a command quoted in place.
They are committed because a number a reader cannot re-run is a number they have to take on
trust — the #874 review asked for exactly that and was right to.

**Three figures are HISTORICAL and no committed script reproduces them**, because they measure an
implementation this PR deleted: the 32612 ms row below, the "identical answers on 46/46 call
sites and 4/4 content trees" comparison, and the ext4 timings (0.33 s before / 1.2 s first design
/ 1.87-1.80 s current, measured by the reviewer on its own clone). They were taken at b8eee5b7e,
when both implementations existed side by side. Treat them as recorded history, not as claims
this directory can re-derive.

The first version of these scripts hardcoded `/mnt/d/dev/p/agent-almanac`, so they measured
whatever branch the author had checked out rather than the revision they were committed at — and
`enumeration-cost.mjs` could not run at its own sha at all, since it imported a function the same
PR removed. They derive their root from `import.meta.url` now.

Run them from the repository root. Each builds its own fixture under `mktemp -d` and removes it;
none writes into this repository.

| Script | Answers |
|---|---|
| `check-ignore-behaviour.sh` | does `check-ignore` report a tracked-but-ignored file, a directory, a nested `.gitignore`, a negation, `info/exclude`; what do its exit codes mean |
| `literal-pathspecs-refuted.sh` | does `--literal-pathspecs` fix the pathspec-parsing problem (no — it is rejected outright) |
| `pathspec-escaping.sh` | does backslash-escaping fix the index-side case (yes), and in what form does git echo the answer back (escaped) |
| `escaping-matrix.mjs` | is escaping correct in GENERAL (no — eight one-pattern fixtures, RAW agrees with git 8/8, ESCAPED 2/8) |
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

**Pathspec parsing, and why the module REFUSES such a name.** A candidate is read as a
**pathspec**, not as a name. Sent raw, `tools/x*y.log` and `tools/a\b.log` — both of which
`git status --ignored` lists as ignored — come back *not* ignored when a tracked sibling
glob-matches them. `--literal-pathspecs` is no escape: this command rejects it outright
(`fatal: pathspec magic not supported by this command: 'literal'`, exit 128) for ordinary
candidates too.

Backslash-escaping fixes that index-side case, and an intermediate revision of the module shipped
it. `escaping-matrix.mjs` then measured the other side, eight one-pattern fixtures with **no
tracked sibling anywhere**, and the recommendation did not survive: `check-ignore` matches the
pattern against the pathspec string **as typed**, so escaping breaks the pattern-side match
whenever the pattern itself carries the metacharacter — `x?y.log`, `x\*y.log`, `x[*]y.log`,
`a?b.log`, `a\\b.log`, `q\?.sh`. Against `git status --ignored`: **RAW agrees 8/8, ESCAPED 2/8.**

So neither form is git's own answer in general. Raw is wrong when the name glob-matches the index;
escaped is wrong when the pattern carries the metacharacter; and the second failure is the quiet
one — `tree-counts` would inflate a published count with nothing red anywhere. The module refuses
such a candidate by name, which is what the first revision did before the escape replaced it.

**Cost.** The three figures below are one historical run over **46** sites; the committed probe
now measures the **42** the generator actually makes, and reports 3.1-3.5 s against a ~170 ms
`readdirSync` baseline.

```
ls-files --cached --others --exclude-standard   32612 ms   (the first implementation)
readdirSync + one check-ignore batch per call    3299 ms   (this implementation)
readdirSync alone, no ignore rule at all          173 ms   (what it replaced)
```

The 46 came from deriving the locale list from the DIRECTORIES under `i18n/`, which includes
`glossaries`; the generator iterates `_config.yml`'s `supported_locales`, which is ten. The four
extra sites are absent directories that spawn no git process, so the timings stood while the
count did not — the probe derives its locales from `_config.yml` now (#874 review, N3).

The cost is not process spawn — `git rev-parse` is 36 ms and `ls-files --cached` is 94 ms
repo-wide. It is `--others`, which walks and stats the working tree and loads a 13,492-entry index
on every call. `check-ignore` consults the ignore rules and the index and stats nothing. The two
implementations were run against each other before the replacement: identical answers on 46/46
call sites and 4/4 content trees.

`enumeration-cost.mjs` reports a different total on each run (3054, 3291, 3299, 3312 and 3460 ms
have all been observed, the last two at 42 sites). Quote the figure from a run, not from this
file. The 32612 ms row is historical — no committed script produces it.

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
