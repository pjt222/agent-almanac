# generate-readmes.js: from unimportable to driven by a fixture (#877)

**Subject.** Whether the *call site* in `scripts/generate-readmes.js` is covered, as opposed to
the libraries extracted out of it. Three extractions were made for one reason — `lib/readme-
sections.js` (#566), `lib/skills-inventory.js` (#691), `lib/tree-counts.js` (#874) — and each one
left the call site covered by a scan of the generator's own source.

**Provenance.** Every figure below was produced by a script in this directory, run from the
repository root.

| | |
|---|---|
| base commit | `d6b9b9c72dea1f88ab60f84c7611dfedc16790d4` (merge of #883) |
| head at measurement | every figure below re-taken at `cda4429f2`, the round-5 base; the import probe's arm table re-taken after merge, for #893, at the head of PR #895 — the second parent of that PR's merge commit, which is where to read it once the branch is gone. The generator, the fixture, the suite and the two mutation probes are byte-identical at `cda4429f2` and at that head; the import probe is not — #893 changed its grading and added arms. Its §4 main-mode table reproduces at that head on a pipe and, since #893 counts the loader before printing, to a regular file too; before that, a file stdout added the probe's own first report line to the loader column |
| working tree | clean at every run; the two probes that mutate refuse a dirty tree or run in a lab |
| command every mutant and every suite arm ran under | `npm run test:scripts` |
| node | **v25.9.0** for the suite figures, recorded rather than disclaimed — an earlier edition of this table said no figure depended on a version, and two did. The `node:test` reporter is TAP on a non-TTY below Node 24, so both mutation probes pin the spec reporter through `NODE_OPTIONS` (verified on v20.20.2, v22.16.0 and v24.20.0). The import probe was worse: its verdict was a Node-25 artefact and it REFUSED the unmodified generator on CI's own Node 24 (§4). It is now run and recorded on v22.16.0, v24.20.0 and v25.9.0, the whole range `engines` allows |

---

## 1. The bypass survived at the parent commit

`prove-the-bypass-survived.sh`, four arms, two of them controls:

```
prove-the-bypass-survived: row opendir-bypass on scripts/generate-readmes.js, every arm under: npm run test:scripts
  base: d6b9b9c72   head: 930461b0c   node v25.9.0

base-clean      exit 0  (939 tests)   <- control
base-mutated    exit 0  (939 tests)   SURVIVED — the bypass was not covered
head-clean      exit 0  (947 tests)   <- control
head-mutated    exit 1  (947 tests)   KILLED by:
    ✖ the Scripts count is git-enumerated at the CALL SITE, not just in the lib

VERDICT: the bypass survived at the parent commit and is killed at this one.
```

The mutation is one line — it does not even need the second import line the #874 review used:

```
import { workflowFileCount, localeTranslationCounts } from './lib/tree-counts.js';
import { opendirSync } from 'fs';
const scriptFileCount = (r) => { … opendirSync(resolve(r, 'scripts')) … };
```

`opendirSync`, not `readdirSync`, and that choice is the point. The tripwire in
`tree-counts.test.js` denylists `readdirSync` and `statSync` **by name**, so a `readdirSync`
mutant dies to the tripwire and demonstrates nothing about coverage. `opendirSync` walks past it,
and so would `globSync`, `fs/promises`, or either denied name reached through a dynamic import.

**The controls are not decoration.** `SURVIVED` and *the lab never ran the suite* are both exit 0.
Each lab therefore runs the suite unmutated first, and a lab whose clean arm is not green refuses
the script rather than reporting a survival it cannot justify. `939` and `947` are the two clean
arms' own test counts, and they are how a reader can tell the two labs apart.

**Is a one-commit lab a fair stand-in for this repository?** It is a fair question — the suite
contains a walker over English *history*, and a lab has none. Two things answer it. The counts:
the base lab ran 939 tests and `mutation-check`'s own baseline on the real repository at
`d6b9b9c72` reported *green (939 passing)*; the head lab ran 947 and so did the real repository
at `930461b0c`. Nothing skipped, nothing absent. And the mechanism: `english-history.test.js`
builds its own `mkdtempSync` repositories and never opens this one, which is what #559's `root`
argument was extracted for. The suites that DO run against the repository root — the `LIVE` rows
in `tree-counts.test.js` and `skills-inventory.test.js` — assert bounds a one-commit checkout of
the same tree still satisfies.

---

## 2. Every claim this change makes, as a mutant

`mutation-plan.tsv` through `tools/mutation-envelope.sh`, at `93bd30650`, and the kill reading
re-run at `1cb20d1b1` byte-identical from the first row on:

| row | verdict |
|---|---|
| `opendir-bypass` | MUTANT KILLED by 1 |
| `opendir-bypass-workflows` | MUTANT KILLED by 1 |
| `handrolled-ignore-bypass` | MUTANT KILLED by 1 |
| `root-not-injected` | MUTANT KILLED by 1 |
| `domains-from-the-module` | MUTANT KILLED by 6 |
| `guard-always-runs` | MUTANT KILLED by 1 |
| `INSTRUMENT-ROW-expected-count` | MUTANT KILLED by 1 |

`7 row(s), 0 not a clean kill.`

### What each kill actually failed on

**A count is not a verdict.** `scripts/mutation-check.js` is silent by construction at these
sizes: `BROAD_KILL_SHARE` is 0.25 of the baseline, so 6 of 947 is 0.006 and the share signal
cannot fire, and `CRASH_SIGNATURES` matches neither a guard's own `throw new Error(...)` nor a
null-property `TypeError`. So `read-the-kills.sh` re-applies each row under the same command and
prints the names:

```
--- opendir-bypass  (exit 1)
    ✖ the Scripts count is git-enumerated at the CALL SITE, not just in the lib
    [AssertionError] x1

--- opendir-bypass-workflows  (exit 1)
    ✖ the Workflows count excludes the template and what git ignores
    [AssertionError] x1

--- handrolled-ignore-bypass  (exit 1)
    ✖ the Scripts count is git-enumerated at the CALL SITE, not just in the lib
    [AssertionError] x1

--- root-not-injected  (exit 1)
    ✖ the Scripts count is git-enumerated at the CALL SITE, not just in the lib
    [AssertionError] x1

--- domains-from-the-module  (exit 1)
    ✖ a guard that exists to catch drift in this repository fires on a fixture too
    ✖ the Bash share enumerates the REGISTRY; _template declares Bash and is not a skill
    ✖ the Scripts count is git-enumerated at the CALL SITE, not just in the lib
    ✖ the Workflows count excludes the template and what git ignores
    ✖ the content-tree bullet names its non-documentation files and its executable one
    ✖ the tools bullet derives its count, its languages, its CI split and its four ids
    [AssertionError] x1
    [thrown Error] x5

--- guard-always-runs  (exit 1)
    ✖ importing the generator runs no pipeline, reads no argv and exits nothing
    [AssertionError] x1

--- INSTRUMENT-ROW-expected-count  (exit 1)
    ✖ the Scripts count is git-enumerated at the CALL SITE, not just in the lib
    [AssertionError] x1
```

**What the `[Class] xN` lines are, exactly.** Line counts over the whole suite log, not a
per-test classification — the cheap half of the answer. They can disagree with the name list
above: a reporter printing one error twice would double a class, and a failure whose message
carries neither word would be counted by none. In this run they agree with the name counts on
every row — six rows at one class-line for one name, and `domains-from-the-module` at 1 + 5 for
six — which is what lets the paragraphs below rest on them. The **names** are the evidence;
these are the label, and under a TAP reporter there would be no names at all (see the
provenance table).

Read row by row rather than as a column of KILLEDs:

- **`opendir-bypass`** and **`root-not-injected`** are the two that matter, and both are clean:
  one failing test, an `AssertionError`, in the test written for the property. The second swaps
  `scriptFileCount(root)` for `scriptFileCount(ROOT)` and is what makes the injection
  load-bearing rather than decorative — with it, the fixture is handed this repository's count.
- **`opendir-bypass-workflows` exists because its arm was VACUOUS**, and the fixture had to
  change before the row could die. This is the finding of the round, and it is in the test rather
  than in the code — the same class the whole PR is about, one level down. The fixture's
  `.gitignore` read `local-*.js`, so the ignored file it planted under `workflows/` was a `.js`,
  which `workflowFileCount` drops **by extension anyway**. A disk walk of `workflows/` therefore
  published the same 2 as git:

      const workflowFileCount = (r) => { const d = opendirSync(resolve(r, 'workflows')); … }
      node --test scripts/test/security-surface.test.js   ->   pass 8   fail 0

  The pattern is now extension-free and the planted file is `workflows/local-draft.mjs` —
  shipped-shaped, so a walk publishes 3 where git publishes 2. The arm also gained the direction
  that must not be lost with it: an untracked `three.mjs` that must count. **The Scripts arm was
  never vacuous** (`local-probe.js` is a `.js` and `scriptFileCount` counts `.js`), which is
  exactly why the Workflows one survived scrutiny: the two arms read as the same shape and only
  one of them was.
- **`handrolled-ignore-bypass` is the class row**, and it exists because the fixture could not
  tell *asks git* from *re-implements git*. A walk that opens `.gitignore`, turns each
  slash-free line into a regex and filters basenames returns 4, 4 and 5 on the three Scripts
  assertions — exactly what the real function returns — so it SURVIVED the whole suite. That is
  the fourth-glob-implementation class `lib/git-files.js` exists to prevent, and the suite was
  blind to it because the fixture's only ignore rule sat in a file any walk can read. The rule
  moved to `.git/info/exclude`, which git honours and a re-implementation has no reason to open;
  the row now dies with one `AssertionError` in the Scripts test. Found by the #888 round-1
  reviewer, re-derived here. It must be written BEFORE the fixture's first commit — after it,
  `local-probe.js` is tracked and the unmutated suite goes red, correctly.
- **`domains-from-the-module` kills by REFUSAL, not by a wrong number**, and the table above
  would hide that. Five of its six failures are one throw from `skillsDeclaringBash`, quoted
  verbatim from the run rather than described:

      Error: skills/_registry.yml lists 373 skill(s) with no SKILL.md on disk:
      create-r-package, submit-to-cran, …

  — the mutant hands the fixture this repository's registry, so all 373 ids are missing from the
  fixture's two-skill tree. The sixth failure is an `AssertionError` in the guard test, which
  expected a *different* throw (the `scripts/mutation-check.js` one) and got this. The row is
  still evidence — it proves `skillDomainsAt(root)` is reached and is load-bearing, which is the
  half #877 calls load-bearing — but what it proves is that the function *refuses* when the
  registry and the tree disagree, not that it would publish a wrong figure. Stated here because a
  `by 6` in a table reads as six assertions about the property, and one of them is.
- **`guard-always-runs`** replaces `if (invokedAsScript()) main();` with `if (true) main();`. The
  import arms then see the pipeline's output on stdout. One `AssertionError`, in the test for it.
- **The instrument row** mutates the new suite's own expected number. A run in which it does not
  die is a run that never reached the suite, and no other row's verdict in that run means
  anything. It died.

---

## 3. `--check` and write mode behave identically (AC 4)

`generator-cli-arms.sh` runs all six of the generator's exit paths at both commits, in labs, and
diffs the two output trees — stdout, stderr and exit code per arm.

```
base   list=exit=0 check-clean=exit=0 write-clean=exit=0,porcelain=0 check-stale=exit=1 check-missing=exit=2 write-missing=exit=2
head   list=exit=0 check-clean=exit=0 write-clean=exit=0,porcelain=0 check-stale=exit=1 check-missing=exit=2 write-missing=exit=2

VERDICT: all six arms byte-identical across the two commits (stdout, stderr, exit code).
```

Why six and not one: `--check` on a clean tree exercises one of five exit paths. The path most at
risk from this change is **`--list-outputs`**, which used to run after a module-scope registry
load and now runs after an explicit `loadRegistries()` call — the statement order inside `main()`
is deliberate for that reason, so a broken `skills/_registry.yml` still throws before the flag
prints rather than that flag becoming the one mode that tolerates an unreadable registry.

**The file count was not a control, and saying it was is the mistake this section made.** "Two
empty trees are identical too" is right as far as it goes; two trees of twelve files holding the
same failure are identical as well. Measured by the #888 round-1 reviewer: a `node` shim first on
PATH that printed to stderr and exited 3 produced twelve files per side, a byte-identical diff and
a green `VERDICT`, having generated nothing. Any symmetric failure — a missing `node_modules`
link, the wrong Node, an `ERR_MODULE_NOT_FOUND` — read as "AC 4 holds".

So the six exit codes this probe is about are asserted per side before the diff is believed, and
the same shim re-run against the fixed script refuses.

**It took two rounds to assert six of them.** The first fix asserted FIVE. `arm()` writes
`exit=N` as the last line of each `.out`, the write-clean arm then appended its porcelain count
BELOW that line, and the comparison reads `tail -1` — so the one arm that runs the generator in
write mode was the one arm whose exit code was never compared. Measured by the round-2 reviewer
with a `node` shim that fails only plain write mode: twelve files per side, an identical diff,
a green `VERDICT`, write mode having exited 5 on both sides. Round-1's shim (fail everything) was
refused by then; this was the same class one line up.

The arm emits a single `exit=N,porcelain=M` line now, and the reviewer's shim is refused:

```
base   list=exit=0 check-clean=exit=0 write-clean=exit=5,porcelain=1 check-stale=exit=1 check-missing=exit=2 write-missing=exit=2
REFUSED: the base side did not produce the six verdicts this probe is about.
  expected: list=exit=0 check-clean=exit=0 write-clean=exit=0,porcelain=0 check-stale=exit=1 check-missing=exit=2 write-missing=exit=2
  observed: list=exit=0 check-clean=exit=0 write-clean=exit=5,porcelain=1 check-stale=exit=1 check-missing=exit=2 write-missing=exit=2
  Two sides can agree byte for byte and have generated nothing; that is not AC 4.
```

Five arms correct, one deviating, and the refusal names it — which is what the earlier form could
not do. The rewrite goes through a temp file rather than `sed -i`, which no-ops on the NTFS mount
`--out` may point at; a no-op would have left both lines in place, the very defect being removed.

---

## 4. Importing it opens no repository content

`security-surface.test.js` proves the import prints nothing and exits 0 — the property the guard
is for, and blind to the quieter one: a module can read, or write, the whole repository in
silence. The head of `generate-readmes.js` claims it does not, so `import-side-effects.mjs`
wraps every own function-valued, non-constructor export of `node:fs`, `node:fs/promises` and
`node:child_process` before the import and records every call through them.

**On every Node the package allows, not on one:**

| node | calls | loader | guard | content | verdict |
|---|---|---|---|---|---|
| v22.16.0 | 30 | 28 | 2 | 0 | OK |
| v24.20.0 | 164 | 162 | 2 | 0 | OK |
| v25.9.0 | 86 | 84 | 2 | 0 | OK |

The totals differ because the ESM loader reads modules through different functions per version —
`fs.promises.readFile` on 22, `readFileSync` on 24, `openSync` + `readSync` + `closeSync` on 25.
What does not differ is the answer: no registry read, no YAML parse, no `git` spawn, and the two
`realpathSync` calls are `invokedAsScript()` resolving its own two paths. Confirmed independently
by the round-2 reviewer with `strace -f -e trace=openat,execve` — an instrument nobody here
wrote — which saw the modules, six `package.json` opened by the loader through an internal
binding, and no `execve` but node's own.

### The claim was wrong seven times, and the instrument was wrong six of those

Every correction came from a measurement. None came from re-reading the file.

1. It said the import "reads no file". It opens 28 modules — every import does. The claim worth
   making is about repository *content*: a registry, a `SKILL.md`, a `git` spawn.
2. The classifier read `readSync`'s first argument as a path. It is a file DESCRIPTOR, so loader
   reads were reported as content and the probe refused a module that was behaving.
3. **The patch never reached the subject.** Assigning over `fs.readFileSync` does not reach
   `import { readFileSync } from 'fs'`: an ESM named binding to a builtin is resolved at link
   time and follows a property assignment only after `module.syncBuiltinESMExports()`. The
   generator and every lib under it import by name, so the patch was invisible to all of them —
   while both controls used the DEFAULT export and fired happily. Re-derived on v25.9.0:

       after the assignment:           named === fs.readFileSync  false    named === original  true
       after syncBuiltinESMExports():  named === fs.readFileSync  true

4. **No WRITE name was patched at all.** With the patch alive, a planted `writeFileSync` was
   graded `OK, content 0` — an import that wrote a file, called clean. The negative test standing
   behind that verdict used `existsSync`: the one shape the probe was already best at. **A
   negative test that picks the instrument's strongest shape is not a negative test.**
5. **The verdict was a Node-25 artefact, and the name list kept leaking.** On the committed probe
   with an unmodified generator:

       v22.16.0  exit=1  calls=30   loader=0   content=28
       v24.20.0  exit=1  calls=164  loader=84  content=77
       v25.9.0   exit=0  calls=86   loader=84  content=0

   CI runs Node 24. The probe printed *"The comment at the head of scripts/generate-readmes.js
   says it does not"* — a false accusation — on the one version a reader would reach for. And a
   hand-written list of names still left callback `symlink`, `promises.mkdtemp` and a worker able
   to change the tree with the probe saying OK.
6. **The verdict was a SNAPSHOT.** It was taken the moment `await import()` resolved, so
   anything the import *scheduled* reached the tree afterwards, with `OK` already printed. Three
   planted writes did exactly that — `setTimeout(writeFileSync)`, `setImmediate(writeFileSync)`
   and `new WriteStream(p).end(x)`, the last a constructor the enumeration skips by the
   capitalised-name rule *and* a lazy `open`, two independent reasons to be missed. One line
   after the import is the fix, and its own knockout is the proof: remove
   `await new Promise((done) => process.once('beforeExit', done))` and `deferred-write` and
   `write-stream-ctor` both flip to `blind`.
7. **The drain's completeness was asserted from a knockout that could not show it.** The comment
   said `beforeExit` "waits for exactly the work the import left behind", on the evidence that
   removing the line flips two arms to `blind` — which shows those arms depend on it and nothing
   about work it does not wait for. **The same evidential shape as row 8 in §6, one round later,
   inside the remedy for correction 6.** Three shapes still landed after the verdict: a write
   from the subject's own `exit` handler, a timer armed from the subject's `beforeExit`, and —
   the sharp one — `process.exit(0)` during import, which left the probe with **no output at all
   and exit 0**. A silent pass, while the comment called a hang "the right failure". Two guards
   now: one registered before the import that refuses when no verdict was reached, one registered
   after it that reports content recorded past the verdict. Both proven by their own knockouts —
   and the second runs only while the subject's own `exit` handlers return, which #894 is about. Closed by #894: see the Addendum at the end of this file.

Through all of them the behavioural claim survived unchanged — no registry read, no YAML parse, no
`git` spawn at import. What kept being false was the instrument, and the number it published.

### Two rules that only work together

Classification is now **the nearest caller frame inside `node:internal/modules/` AND an argument
naming a `.js`/`.mjs`/`.cjs`**. Neither half is sufficient, and both failures were measured
rather than reasoned:

- **Extension alone** was correction 5: the loader's own reads carry module extensions and were
  graded content wherever the loader did not use `openSync`.
- **Frame alone** goes blind to a `with { type: 'json' }` import of the registry, which has a
  loader frame and *is* a content read. That is this PR's defect class appearing one level down
  **inside the remedy**, and the round-3 reviewer caught it before it was written here.
  `json-import` is an arm now, not a sentence.

The frame half needed a correction of its own, also from a run: on 24 and 25 the loader calls
`fs.readFileSync`, which calls the PUBLIC `fs.openSync`, so that `openSync`'s nearest frame is
`at readFileSync (node:fs:440:35)` — not a module frame at all. `node:fs` frames are skipped.
The first version of the rule passed on 22 and refused on 24 and 25: one version-dependent rule
swapped for another.

### Patching is by enumeration, and the reach claim is a RUN

The name list leaked four times, so there is no list. Every own function-valued,
non-constructor export of the three modules is wrapped — 92 + 32 + 8 on Node 25 — with own
properties copied onto each wrapper so `realpathSync.native` and the `util.promisify.custom`
hooks survive. The frame classifier is what makes wrapping everything safe: the loader's reads
are recognised by where they come from, not by what they are called.

And the blind list stopped being a paragraph. `--verify` plants one shape per arm into a
throwaway module, imports THAT instead of the generator, and asserts the verdict each shape is
declared to produce — identical on v22.16.0, v24.20.0 and v25.9.0:

```
--verify: 33 shape(s) on node v25.9.0, each planted into a throwaway module and imported
  wrapped by enumeration: 92 fs, 32 fs/promises, 8 child_process export(s)
  ok    empty              declared blind observed blind
  ok    sync-read          declared seen  observed seen
  ok    sync-write         declared seen  observed seen
  ok    sync-mkdir         declared seen  observed seen
  ok    access             declared seen  observed seen
  ok    callback-read      declared seen  observed seen
  ok    callback-symlink   declared seen  observed seen
  ok    promises-read      declared seen  observed seen
  ok    promises-readdir   declared seen  observed seen
  ok    promises-mkdtemp   declared seen  observed seen
  ok    glob               declared seen  observed seen
  ok    write-stream       declared seen  observed seen
  ok    cp-sync            declared seen  observed seen
  ok    spawn-sync         declared seen  observed seen
  ok    spawn-async        declared seen  observed seen
  ok    create-require     declared seen  observed seen
  ok    json-import        declared seen  observed seen
  ok    open-js-as-data    declared seen  observed seen
  ok    deferred-write     declared seen  observed seen
  ok    write-stream-ctor  declared seen  observed seen
  ok    worker-write       declared seen  observed seen
  ok    process-binding    declared seen  observed seen
  ok    dynamic-import-repo-js declared blind observed blind
  ok    dep-import         declared blind observed blind
  ok    bare-resolve-import declared blind observed blind
  ok    exits-during-import declared no-verdict(exit 0) observed no-verdict(exit 0)
  ok    bare-exit-during-import declared no-verdict(exit 0) observed no-verdict(exit 0)
  ok    exit-nonzero-during-import declared no-verdict(exit 3) observed no-verdict(exit 3)
  ok    exit-1-during-import declared no-verdict(exit 1) observed no-verdict(exit 1)
  ok    throws-during-import declared no-verdict(exit 1) observed no-verdict(exit 1)
  ok    sync-write-and-exit-handler declared seen+late observed seen+late
  ok    exit-handler-write declared seen-late observed seen-late
  ok    beforeexit-reschedule declared seen-late observed seen-late
```

`no-verdict` and `seen-late` are verdicts of their own rather than collapsed into `seen`: the
first is a subject that ended the process before the probe could say anything, the second is
content the probe found only AFTER printing its answer. Folding either into `seen` would hide
exactly the half of the class the drain cannot reach. #894 adds `unreported-exit` and `no-verdict(…)+seen`: see the Addendum.

Both are finer than they were at merge (#893). `no-verdict` carries the exit code, because the
escape `exits-during-import` is named for is the CLEAN exit — no output, exit 0, a silent pass —
and it graded identically to a crash. `exit-nonzero-during-import` exits 3, so the code is
shown to pass through rather than be folded to 0 or 1 — with only 0 and 1 planted, a mutant
printing `code ? 1 : 0` survived every arm (#893 round 1). `bare-exit-during-import` is the
spelling most code uses, `process.exit()`: its handler argument is 0 and `process.exitCode` is
`undefined`, where `exit(0)` makes both 0 — so it is the arm that pins "the argument, not
`exitCode`". Without it, a guard reading `process.exitCode ?? 1` survived all the other arms and
graded that clean exit as a crash (#893 round 2). The code is all guard 1 can see, so
`process.exit(1)` and a bare `throw` still grade alike, as `no-verdict(exit 1)`; two arms declare
that rather than leave it to be discovered. And a shape found both in time and late used to grade
`seen-late`, because `late` won the grading ternary without a word said about it. It is
`seen+late` now, with `sync-write-and-exit-handler` producing it. Each change has a mutant, and
each mutant dies only to arms planted for the property it breaks (v22.16.0, v24.20.0 and
v25.9.0): format the marker from `process.exitCode` after guard 1 sets it, and the arms whose code
is not 1 fail; fold the code with `code ? 1 : 0`, and only `exit-nonzero-during-import` fails;
read `process.exitCode ?? 1` instead of the argument, and only `bare-exit-during-import` fails;
restore the old ternary, and only `sync-write-and-exit-handler` fails, reading `seen-late`.

**Neither guard reports everything it holds, and #894 is the follow-up.** Guard 2 runs after the
subject's own `exit` handlers only while they return: one that writes and then calls
`process.exit()` or throws ends the exit phase first, and the arm prints `blind` with the file on
disk — at exit 0 for the throw form — and leaks the shape directory, since the foot cleanup is an
`exit` handler too. Guard 1's `no-verdict` refuses correctly and names none of the content
already recorded before the subject exited. Both measured, neither fixed here. Both fixed by #894, whose Addendum at the end of this file replaces this paragraph.

The arms are identical on v22.16.0, v24.20.0 and v25.9.0. Four joined in round 4:
`deferred-write` and `write-stream-ctor` for the snapshot class above, `dynamic-import-repo-js`
for the one structural gap left, and `dep-import` as a blind control. Four more in round 5:
`exits-during-import`, `exit-handler-write` and `beforeexit-reschedule` for correction 7, and
`bare-resolve-import` — because `dep-import` was *described* as exercising bare-specifier
resolution and does not: it imports an absolute `file://` URL, so nothing is resolved. Its
verdict was right and its stated mechanism was not, which is row 8's shape again in miniature.
The new arm is the one that actually resolves, and both are blind on all three Nodes, so
ordinary resolution is not a false-positive source. Five more after merge, in #893:
`bare-exit-during-import`, `exit-nonzero-during-import`, `exit-1-during-import`,
`throws-during-import` and `sync-write-and-exit-handler`, for the two finer verdicts above.

**`empty` is the arm that matters most**, and it is the one the first table lacked. A module that
does nothing must grade `blind`; under the Node-25-only classifier it graded `seen` on 22 and 24,
which means every `ok seen` row in that table passed for the wrong reason — the child refused
before the planted line mattered. A twelve-row table of `ok` is exactly the shape that invites
belief, and it was wrong.

**`worker-write` and `process-binding` used to be declared blind, and asserted nothing.** The
round-4 reviewer replaced each arm's planted access with a no-op and both still read `blind` — an
arm that passes with its subject removed. Both escape hatches are wrapped now: a worker has its
own module registry and its own `fs`, and `process.binding` returns a binding below every public
name, but the `Worker` constructor and `process.binding` itself are in THIS process and are
patchable. Both arms are `seen`, and they plant what they grade. `open-js-as-data` went the same
way one round earlier: declared blind while the classifier could not tell it from the loader,
declared `seen` once the combined rule could.

The one structural blind spot left is `dynamic-import-repo-js`. This classifier's "loader" is
whatever the loader loads, so executing an arbitrary repository `.js` at import is
indistinguishable from loading a module of the graph. Closing it means comparing against the
STATIC import graph — `importGraph()` in `scripts/check-workflow-generator-inputs.js`, which is
module-private — so it is a follow-up issue with an arm holding its place. #906 exports it as `importGraph(root, entry, seen)` from `scripts/lib/import-graph.js`; the comparison itself is #892. It landed: see the Addendum (#892) at the end of this file.

Four controls remain — the patch fires, the patch reaches a NAMED binding, the classifier can
still say *content*, and no loader descriptor outlives the import (a recycled one would excuse
whatever content call next drew that number). **They are necessary and they have never been
sufficient**: control 2 has been present since the round-1 fix and passed through every
correction from 4 on. That is what the arms are for.

Still unmeasured: a module loaded before the probe, and any side effect reaching the filesystem
through none of the wrapped entry points.

## 5. What this does NOT cover

Stated because the section above looks broader than it is.

- **One generator is injectable, not thirty.** `generateSecuritySurface({ root })` takes its tree.
  Every other `generate*` function still reads module-level registry bindings, so no fixture
  drives them. The translations table is the concrete gap: `generateTranslationsSection` calls
  `localeTranslationCounts(ROOT, …)`, and the tripwire in `tree-counts.test.js` keeps its
  call-shape assertion for exactly that call and no other.
- **`listAdapters()` takes no root.** The adapters sentence in the generated inventory is
  therefore derived from this repository's `cli/adapters/` even when the function is handed a
  fixture. It is a claim about the CLI rather than about the tree, so the fixture's numbers are
  unaffected — but a test asserting the adapter list against a fixture would be asserting against
  this repository, and none does.
- **The fixture satisfies the function's drift guards; it does not test them.** One is
  exercised (`a guard that … fires on a fixture too`, a deleted `scripts/mutation-check.js`) and
  one more by the `domains-from-the-module` mutant. The rest are reached and pass, which is what
  lets the counts be measured at all. No count of them is published here: they are spread across
  this function, `skills-inventory.js` and `tools-registry.js`, and an earlier edition said "six"
  from a five-item list (#888 round-1 N8).
- **Import inertness is tested by two spawns plus the probe's `--verify` arms, not proven for every
  shape.** `node -e` leaves `process.argv[1]` undefined; an importer file gives it a real path
  that is not this module. A third shape — a loader or a `--require` hook that rewrites
  `argv[1]` — is not covered. A worker thread and `process.binding` ARE covered since round 4;
  a native addon and a module loaded before the probe are not, and neither is a dynamic import of
  a repository `.js`, which has its own declared-blind arm and its own follow-up issue. The
  round-1 reviewer measured nine invocation shapes and three import shapes against the guard and
  found no case where it answers wrongly, including `npm run`, `node --run`, a `..` path, an
  out-of-tree symlink and `sh -c`; `--preserve-symlinks-main` on the out-of-tree symlink fails at
  module resolution before the guard is reached, and nothing here uses that shape. (The dynamic import of a repository `.js` named above has since been closed; see the Addendum (#892) at the end of this file.)
- **The fixture declares a `prepack` so it takes production's branch**, after the round-1 review
  found it taking the other one: without it `packHookSentence` returns `''` and the paragraph is
  missing a clause the real one carries. The clause is now asserted.

## 6. The defect class recurred eleven times inside the PR that is about it

Worth a table, because the pattern is the point and no single bullet above carries it. #877
exists because an instrument — a source scan — was honest about something narrower than the claim
resting on it. Building the fix reproduced that eleven times. Four of them were inside a remedy
written for a previous instance — #4, #8, #10 and #11 — and two of those same four, #8 and #11,
were in a sentence describing a fix rather than in the fix itself. The second set is inside the
first, not beside it.

| # | what | found by | how it showed |
|---|---|---|---|
| 1 | the Workflows arm's ignored file was a `.js`, which the count drops by extension anyway | this session, before round 1 reported | a disk walk of `workflows/` passed the suite 8/8 |
| 2 | the import probe's patch never reached an ESM named binding | round 1 | `named === fs.readFileSync` is false without `syncBuiltinESMExports()` |
| 3 | the fixture's ignore rule sat where a walk could read it | round 1 | a hand-rolled `.gitignore` matcher survived the suite |
| 4 | the repaired probe could not see `node:fs/promises` | this session, between rounds | a planted `await readdir(...)` graded clean |
| 5 | the probe patched no WRITE name, and its negative test used the shape it was best at | round 2 | a planted `writeFileSync` graded clean |
| 6 | the cli-arms control counted files, then counted five verdicts of six | rounds 1 and 2 | a `node` shim exiting 3, then one failing only write mode, both went green |
| 7 | the probe's verdict was a Node-25 artefact; it refused the unmodified generator on CI's Node | round 3 | `v24.20.0 exit=1 content=77` |
| 8 | **the diagnosis of a fix I had already made was wrong** — see below | round 4 | `cpSync` was seen through `lstatSync`; the stream was missed for timing, not naming |
| 9 | the verdict was a snapshot at `await import()`; anything scheduled landed after `OK` | round 4 | `setTimeout`, `setImmediate` and a lazy stream `open`, three planted writes under a green verdict |
| 10 | two declared-blind arms asserted nothing | round 4 | replacing each arm's planted access with a no-op left both reading `blind` |
| 11 | **the drain's completeness was asserted from a knockout that could not show it** — row 8's shape, inside the remedy for row 9 | round 5 | `process.exit(0)` at import gave no output and exit 0; a write from the subject's `exit` handler and a timer from its `beforeExit` both landed after `OK` |

Every one is the same shape: **an instrument that cannot fail on part of the population it
vouches for, with its OK quoted somewhere a reader will trust.**

### Row 8 is the one worth reading twice

An earlier edition of this section claimed two write paths "reached the tree through none of the
patched names". The round-4 reviewer measured both halves against the probe of the day:

```
cpSync(a, b)                            -> REFUSED   seen as: lstatSync …
createWriteStream(p).write(x)           -> OK        planted=1
createWriteStream(p).end(x), awaited    -> REFUSED   seen as: open …
```

`cpSync` was never blind. The stream was blind because its `open` ran **after the verdict**, not
because its name was absent from a list — and awaiting `.end()` made the same probe refuse it.
The knockout I ran to support the claim (drop `createWriteStream` and the arm flips to `blind`)
shows only that the *arm* depends on the name; it was never evidence about why the write had been
invisible. So the fix was right, the arms are right, and the stated mechanism was wrong — which
is the same class one level further out again: **a claim about an instrument, asserted from a
test that could not distinguish the two explanations.** It stands corrected here rather than
tidied away, and it is why row 9 exists.

### What actually catches them

Running something. #2, #5, #7, #8, #9, #10 and #11 came from a reviewer executing a planted
shape; #3 from a reviewer planting a hand-rolled matcher; #4 from asking "find one this cannot
see" and then running it; #6 from a shim. **Only #1 was caught by reading** — by asking what a
hostile input actually changed, which is the cheapest habit here and the one to reach for first.

The `createWriteStream` half of the between-rounds commit belongs with #4 as a real find by
running; its `cpSync` half does not, because `cpSync` was never blind (row 8). An earlier edition
of this paragraph credited both.

**Four of the eleven are the class inside a remedy written for a previous instance**: #4 (a gap
in the fix for #2), #8 (a sentence about the fix for #4 and #5), #10 (two declared-blind arms
added by the round-3 remedy for #7 — the commit that turned the blind-list paragraph into arms,
standing in for escape hatches #7's finding named — which asserted nothing) and #11 (a claim about the fix for #9, resting on a knockout of the same
non-discriminating shape as #8). #8 and #11 are also the two that lived in a sentence rather
than in code, so that pair is a subset of this four, not a second group. Five more were caught
before they could ship, all in remedies and none reaching `main`: the round-3 reviewer measured
a pure-frame classifier going blind to a JSON import of the registry; the frame rule's first
version passed on Node 22 while refusing on 24 and 25; and while implementing #11's fix, the
probe graded its own `console.log` output as late content on Node 22, a
`process.exit` → `process.exitCode` swap made shape mode fall through into the main report, and
the shape directory's cleanup — registered at setup — ran before a shape's own `exit` handler,
so `exit-handler-write` read `blind` for the wrong reason. Those last three are worth stating
plainly: **fixing the instrument broke the instrument, three times, in one edit** — which is why
every guard added in this PR carries its own knockout. And the cleanup fix is the one that did
reach a commit in another form: moving the handler to the foot of the file left no cleanup at
all for `exits-during-import`, which never reaches the foot. Round 6 found that residue
(R6-F1) and `1c8201b3b` fixed it before the merge.

That record is why the blind list became `--verify` arms, the file-count control became six
asserted verdicts, the name list became an enumeration, and the paragraph about what the probe
cannot see became two declared-blind arms with a control beside them. Each is a paragraph
replaced by a run.

## 7. Choices recorded so they are choices

- **The tripwire was kept, not removed.** #877's fifth criterion allows either. Its two
  call-shape assertions for `scriptFileCount` and `workflowFileCount` are gone, because renaming
  the parameter reddened them with the fix intact — the "red on a harmless refactor" half the
  #874 review measured. What is left is the two name denials plus the one call site nothing else
  reaches, under a relabelled comment.
- **`const` became `let` for twenty-two REGISTRY bindings** — twenty-three `let` lines in the
  file, the twenty-third being `CHECK_MODE`, which was also a `const` reading `process.argv` at
  module scope. The earlier "22 bindings" was the registry count offered as the file's count.

  The alternative was threading a context
  object through thirty generator functions, which is the #691-shaped extraction #877 offers as
  its second option and is a larger change than the issue asks for. The cost is that the bindings
  are mutable; the guard is that only `main()` and `loadRegistries()` assign them.
- **`skillDomainsAt(root)` re-reads `skills/_registry.yml`.** One extra YAML parse per run, so
  that a fixture's registry cannot overwrite the map the pipeline is mid-run with, and the
  repository's map cannot reach a fixture.
- **The new suite costs about 6 s standalone** (`node --test scripts/test/security-surface.test.js`,
  drvfs, 8 tests): 6.4 s measured here, 6.0 s by the round-1 reviewer on the same mount. Both are
  single runs of a figure that moves with load, which is why the sentence says "about" rather
  than picking one. No whole-suite before/after delta is published: the two whole-suite numbers
  available were taken on different filesystems, and a delta across those is not a delta.

---

## Addendum (#894): guard 2 reports whenever it runs to its end, and the parent owns the directory

§4 closed on two gaps that were measured and not fixed. Guard 2 said nothing when a subject `exit`
handler ended the process. Guard 1 dropped content it had already recorded. Both are fixed by the
probe at `f70a96408`. The transcript below is that probe's `--verify` on v25.9.0, and it is
byte-identical after the CodeQL fix described at the end of this Addendum. The same 40
rows read `ok` on v22.16.0 and v24.20.0. Only two things differ across Nodes: the enumeration line
(91 fs and 31 fs/promises on v22), and the self-arm's totals, which are each Node's own §4 row.

This is not an eighth correction. It is correction 7's remedy one level down. Guard 2 was the fix
for the drain, and it is an `exit` handler itself.

**Guard 2 prints its count whenever it runs to its end, and a missing count is a verdict.**
Nothing in the child can prove guard 2 ran, because a subject handler that calls `process.exit()`
or throws ends the exit phase before it. So guard 2 prints `SHAPE-LATE: <n>`, zero included, and
the parent grades an in-time verdict with no count as `unreported-exit(exit N)`. If the in-time
verdict was `seen`, the grade is `seen+unreported-exit(exit N)`, which keeps that finding visible
the way `seen+late` does. A `no-verdict` result is taken as printed: guard 2 is registered after
the import, so those arms never reach it.

One level further down, a subject can register an `exit` listener after guard 2, from a timer
armed in its own `beforeExit`, and that listener runs after the count was printed. Guard 2 now
withholds its count when any listener follows it. Without that check, `late-registered-exit-handler`
grades `blind` with its file on disk.

The verdict names that the count is missing, not why. The design critique also measured it for
three other cases:
- SIGKILL from a subject `exit` handler (exit null);
- `process.reallyExit(0)` from a timer that fires after the verdict;
- `process.removeAllListeners('exit')` from such a timer.

It can over-refuse. A subject `exit` handler that adds another listener during the exit phase makes
guard 2 withhold, although Node copied the listener list before calling it, so that listener never
runs. That errs loud, not silent.

**Guard 1 reports what it holds.** When the subject ended the process after content was recorded,
guard 1 prints `no-verdict(exit N)+seen` and lists the calls. That required moving the classifier
above guard 1. As `const`s declared after the import, it was in its temporal dead zone when guard 1
ran: moved back below, all six `no-verdict` arms read `error(no verdict)`.

**The parent owns the shape directory.** The child prints `SHAPE-DIR: <path>` before the import
and never removes it. The parent removes the directory after `spawnSync` returns, and only if it is
a direct child of the parent's own root with the `mkdtemp` name shape.

Every cleanup tried inside the child was an `exit` handler, and each one tried failed on some exit
path. That includes a foot handler kept alongside the new design: the designer measured it on
v24.20.0 deleting the directory before `late-registered-exit-handler` wrote.

Each child's `os.tmpdir()` is that root, so the `leak-count` row counts what the children left. The
AC3 evidence is that row together with the mutant that deletes the parent's per-arm removal, which
`leak-count` kills with 38 left. A before/after count of `/tmp/import-shape-*` cannot show that
leak, because the `finally` removes the root with everything in it. That count was 0 before and 0
after on all three Nodes, and it catches only a leaked root or a child that ignores `TMPDIR`.

When the parent itself is interrupted, the root is left behind, and that is **new with #894**.
Before it, each child removed its own directory, so a signal to the parent alone left nothing:
the orphaned child finished and cleaned up. Parent-owned cleanup moved the removal onto the
parent's exit paths, and a signal is not one of them.

Measured on v24 by signalling the parent about 3 s in:
- the pre-#894 probe left nothing;
- this one exits 143 on SIGTERM or 130 on SIGINT, and leaves `/tmp/import-shape-verify-*` holding
  the in-flight child's directory, to be removed by hand. The #904 review measured 1 entry in 3 of
  3 runs for either signal, because the parent spends almost all its time inside an arm. One
  earlier SIGINT run that landed between arms left 0.

A signal handler was tried and removed: the #904 review measured that it never runs. `--verify` is
one synchronous block, so a listener's callback cannot fire before `process.exit()`. The listener
only made the parent ignore the signal: SIGTERM to the parent 3 s in, and the run still completed
40/40 at exit 0. A child that removed its own directory at exit only when orphaned would restore
the old behaviour [proposed, not run]. Two earlier drafts of this paragraph were wrong: one
described what that handler did, and one said interruption was unchanged from before #894.

A standalone `--shape` leaves its directory and prints its path on the first line.

**Main mode prints `OK` after guard 2's count, from inside guard 2.** A report whose exit phase was
cut short therefore ends with neither the count nor `OK`. Before, it ended with `OK`. This was
measured with the generator replaced by a subject whose `exit` handler writes a file and then calls
`process.exit(0)`: on v22, v24 and v25 the report ends with no count and no `OK`, and the file is on
disk.

The exit code is still the subject's 0, which the probe cannot override. So in main mode run by
hand, the missing `OK` is the only sign.

**The loader count and the `OK` order have a gate.** A self-arm, `main-report-to-file`, runs main
mode with stdout a regular file. It asserts `calls = loader + guard + content`, and that the `OK`
line comes after guard 2's count. A pipe does not work for this check: the loader-count mutant
survives when the self-arm's stdout is a pipe, which is the control row below. Main mode on the
unmodified generator is still `content 0`, with the §4 figures on all three Nodes.

```
--verify: 38 shape(s) on node v25.9.0, each planted into a throwaway module and imported
  wrapped by enumeration: 92 fs, 32 fs/promises, 8 child_process export(s)
  ok    empty              declared blind observed blind
  ok    sync-read          declared seen  observed seen
  ok    sync-write         declared seen  observed seen
  ok    sync-mkdir         declared seen  observed seen
  ok    access             declared seen  observed seen
  ok    callback-read      declared seen  observed seen
  ok    callback-symlink   declared seen  observed seen
  ok    promises-read      declared seen  observed seen
  ok    promises-readdir   declared seen  observed seen
  ok    promises-mkdtemp   declared seen  observed seen
  ok    glob               declared seen  observed seen
  ok    write-stream       declared seen  observed seen
  ok    cp-sync            declared seen  observed seen
  ok    spawn-sync         declared seen  observed seen
  ok    spawn-async        declared seen  observed seen
  ok    create-require     declared seen  observed seen
  ok    json-import        declared seen  observed seen
  ok    open-js-as-data    declared seen  observed seen
  ok    deferred-write     declared seen  observed seen
  ok    write-stream-ctor  declared seen  observed seen
  ok    worker-write       declared seen  observed seen
  ok    process-binding    declared seen  observed seen
  ok    dynamic-import-repo-js declared blind observed blind
  ok    dep-import         declared blind observed blind
  ok    bare-resolve-import declared blind observed blind
  ok    exits-during-import declared no-verdict(exit 0) observed no-verdict(exit 0)
  ok    bare-exit-during-import declared no-verdict(exit 0) observed no-verdict(exit 0)
  ok    exit-nonzero-during-import declared no-verdict(exit 3) observed no-verdict(exit 3)
  ok    exit-1-during-import declared no-verdict(exit 1) observed no-verdict(exit 1)
  ok    throws-during-import declared no-verdict(exit 1) observed no-verdict(exit 1)
  ok    sync-write-and-exit-handler declared seen+late observed seen+late
  ok    exit-handler-write declared seen-late observed seen-late
  ok    beforeexit-reschedule declared seen-late observed seen-late
  ok    exit-handler-write-then-exit declared unreported-exit(exit 5) observed unreported-exit(exit 5)
  ok    exit-handler-write-then-throw declared unreported-exit(exit 0) observed unreported-exit(exit 0)
  ok    sync-write-and-exit-handler-exit declared seen+unreported-exit(exit 5) observed seen+unreported-exit(exit 5)
  ok    late-registered-exit-handler declared unreported-exit(exit 1) observed unreported-exit(exit 1)
  ok    write-then-exit-during-import declared no-verdict(exit 0)+seen observed no-verdict(exit 0)+seen
  ok    main-report-to-file declared calls = loader + guard + content, OK after the late count observed 86 = 84 + 2 + 0, late 0, OK after the count
  ok    leak-count         declared 0 left under the verify root observed 0
```

`plants` is the parent's count of files in the shape directory, declared on the four arms where
guard 2 never runs. On those arms the grade cannot depend on the write, so an arm whose write was
deleted would otherwise pass for the wrong reason. On `late-registered-exit-handler` it is also the
only thing that tells a withheld count from guard 2 crashing. A throw inside guard 2 ends the exit
phase before the late write runs, so the verdict is the same, and only `plants` (0, not 1) differs.

### Mutants

Each mutant was run under `--verify` on v22.16.0, v24.20.0 and v25.9.0, in a lab whose `scripts/`
is a real copy. A symlinked `scripts/` puts the generator's real path outside the guard's path set
and fails the self-arm on the unmodified probe, which the pristine control caught. The kill sets
were identical on all three Nodes:

| mutant | killed by |
|---|---|
| guard 2 prints its count only when `late.length > 0` (the child half of the old protocol) | 26: every arm where guard 2 runs and finds nothing, and `main-report-to-file` |
| the parent reads a missing count as zero (the parent half) | exactly the four `unreported-exit` arms |
| both halves: the old protocol restored | the four `unreported-exit` arms and `main-report-to-file` |
| the parent does not remove the shape directory | `leak-count` (38 left) |
| guard 1 holds nothing | `write-then-exit-during-import` |
| the loader counted after the first `console.log` | `main-report-to-file` |
| the same, with the self-arm's stdout a pipe (control) | survives |
| no listener-order check in guard 2 | `late-registered-exit-handler` |
| the child does not announce its directory | all 38 arms and `leak-count` |
| the write deleted from `exit-handler-write-then-exit` | that arm, by `plants` |
| the same, with the `plants` check off (control) | survives |
| the classifier moved back below the import | the six `no-verdict` arms |
| the `unreported-exit` code folded to 0 or 1 | the two arms that exit 5 |
| `seen` dropped from `seen+unreported-exit` | `sync-write-and-exit-handler-exit` |
| main mode stops printing its late line | `main-report-to-file` |
| `OK` printed before the exit phase again, from main mode's own branch | `main-report-to-file` (`OK` before the count) |
| the self-arm does not require the late line (check mutant) | survives alone; with the child-half mutant it is still 26, because the `OK`-after-count check needs the count line too |
| the self-arm's order check dropped (check mutant) | survives alone; it is what kills the early-`OK` mutant |

The issue asked for a mutant restoring "print only when nonzero" that dies to exactly the
exit-handler arms. A mutant on guard 2 alone cannot do that, because guard 2 never runs in those
arms. The child-half mutant fails every arm where guard 2 runs and finds nothing, since the parent
now requires the line. The parent half is the mutant that dies to exactly those arms.

Not gated, stated so nobody reads it as covered:
- **The parent's path check before `rmSync`.** No arm can make the child announce a hostile path.
- **The strict parse of the count.** No arm prints a malformed `SHAPE-LATE`.
- **The `mainInTimeClean` flag.** No arm runs main mode with content, where `OK` must be withheld.
- **The `spawnSync` timeouts.** No arm hangs.
- **Markers printed by a subject.** A subject can forge `SHAPE-LATE: 0` from its `exit` handler
  before exiting, as it already could `SHAPE-VERDICT:` during the import. The probe's subject is a
  generator, not an adversary.

**CodeQL, on #904.** The PR's CodeQL check raised three alerts, and all three are fixed in this PR:

- `js/bad-code-sanitization` on the two lines that built the shape module's source around
  `JSON.stringify(ROOT)` and `JSON.stringify(shapeDir)`. `main` already carried both as alerts #16
  and #18, and #904 re-raised one as #21. The module now reads both paths from `SHAPE_ROOT` and
  `SHAPE_TMP` in the environment, so nothing is interpolated into generated code.
- `js/incomplete-sanitization` (#19, #20) on the self-arm's two regexes, which escaped only `(`
  and `)` in `MAIN_LATE_LABEL`. They now go through a helper that escapes every metacharacter,
  backslash included.

After the fix, `--verify` passes 40/40 and main mode reports `content 0` on v22.16.0, v24.20.0 and
v25.9.0. The self-arm mutants from the table above give the same results as before on all three.

## Addendum (#892): a module outside the static import graph is content

§4 named one structural blind spot, `dynamic-import-repo-js`. It existed because the classifier's
"loader" was whatever the loader loads, so a dynamic `import()` or `require()` of a repository
`.js` at import time looked exactly like the loader reading a module of the graph. #906 extracted
`importGraph(root, entry, seen)` to `scripts/lib/import-graph.js`. The probe now compares against
it.

**The rule.** A loader-frame read of a `.js`/`.mjs`/`.cjs` counts as the loader's only when the
module is in the subject's static relative-import graph, or under the root's own `node_modules`
(spelled or realpath'd). Anything else it loaded is content, reported with the note "outside the
static import graph". The graph is taken before the patch loops, so taking it is not recorded.

**The two sets are equal on the unmodified generator.** On all three Node versions, the loader's
module reads in main mode resolve to exactly the 27 repository modules
`importGraph(ROOT, 'scripts/generate-readmes.js')` returns, with none missing, plus
`js-yaml/dist/js-yaml.mjs` from the dependency tree:

| Node | loader reads (calls) | loaded repo modules = graph | content |
|---|---|---|---|
| v22.16.0 | 28 | 27 = 27 | 0 |
| v24.20.0 | 162 | 27 = 27 | 0 |
| v25.9.0 | 84 | 27 = 27 | 0 |

The call counts are unchanged from before this addendum, and the `OK` line is present on all three.
Since the #915 review, main mode prints the sets themselves, so this table is re-derived by running
the probe: `module set: graph 27, graph loaded 27, graph not loaded 0, dependency paths 1` on v22
and v25, `… dependency paths 2` on v24.

**Why the root's `node_modules` in its realpath form too.** In a git worktree whose `node_modules`
is a symlink into the main checkout, the loader reads js-yaml at the symlink's target, which lies
outside ROOT; v24 reads it under both the spelled and the real path, so there both forms are
load-bearing. **Why not "any `node_modules` segment":** a repository `.js` under a nested
`node_modules/` would then be excused. The new arm `foreign-node-modules-import` pins that.

**Arms.** `--verify` now passes 43 rows on v22.16.0, v24.20.0 and v25.9.0: 41 shapes plus
`main-report-to-file` and `leak-count`.

| arm | before | now |
|---|---|---|
| `dynamic-import-repo-js` | declared blind | `seen` |
| `require-repo-js` (new, the `require()` twin, #888 round 4 B2) | — | `seen` |
| `foreign-node-modules-import` (new; module planted before the patch loops through a new `files` field, so writing it cannot be what the arm sees) | — | `seen` |
| `dep-import`, `bare-resolve-import` (controls) | blind | blind |
| `commented-import-then-dynamic` (new, #915 round 1: a line-start `import` inside a block comment puts a planted sibling into the regex graph, and its dynamic import then grades as the loader's) | — | declared blind |

For each new `seen` arm, on each version, every content line the shape prints is a module read
marked "outside the static import graph". Apart from the `readSync`/`closeSync` on that module's
own descriptor, no other call contributes, so the arms pass for the reason they are declared.

**Still unmeasured**, as the probe's header states: a module loaded before the probe, any side
effect reaching the filesystem through none of the wrapped entry points, and code in the root's own
dependency tree, which the rule exempts by design. A **static** import by absolute path or
`file://` URL is outside `importGraph`'s relative-only walk too, so it grades as content. That is
the loud direction, and nothing in the generator's graph is written that way.

### Mutants

Measured with `tools/mutation-envelope.sh --test 'node …/import-side-effects.mjs --verify'` on
v25.9.0; all five were killed. The failing rows come from re-running each mutant by hand, with the
file restored byte-identical (sha256) afterwards:

| mutant | failing rows |
|---|---|
| graph check dropped (`loader = moduleRead`) | `dynamic-import-repo-js`, `require-repo-js`, `foreign-node-modules-import` |
| dependency exemption dropped | `dep-import`, `bare-resolve-import`, `main-report-to-file` |
| exemption by `node_modules` segment instead of root prefix | `foreign-node-modules-import` |
| realpath of the dependency root dropped | `dep-import`, `bare-resolve-import`, `main-report-to-file` |
| pre-planting of `files` dropped | `foreign-node-modules-import` |

The realpath row is killed only where `node_modules` is a symlink, as in the worktree these were
measured in. In a checkout with a real `node_modules` directory that mutant is equivalent, and no
arm here can tell the difference.

### Round 1 of the #915 review

`BLOCKING=1 SHOULD-FIX=2 NOTE=7`. What changed:

- **B1, a structural hole nobody had declared.** The "static graph" is `importGraph`'s per-line
  regex over source text. A line-start `import … from './x'` inside a block comment or a template
  literal puts `x` into the graph without loading it, and a dynamic import of `x` then grades as the
  loader's. The reviewer measured it on the real generator: the comment alone turned `REFUSED` into
  `OK` on v22 and v25. It is now the declared-blind arm `commented-import-then-dynamic`. Its
  control, the same shape without the comment, reads `seen` on v22 and v25, so the arm does not pass
  for the wrong reason. Closing the hole needs a parser in the shared module, which is filed
  separately as #918.
- **S1:** §5's sentence about the dynamic import now carries a pointer here.
- **S2:** the header no longer carries the 27. Main mode prints the `module set:` line instead
  (see above).
- **N1:** the `files` pre-plant was pinned only on one side. Moving it to just before the import
  (the reviewer's M13) survived every arm. A check before the import now refuses a run in which
  anything was recorded after the controls. M13 is killed by `foreign-node-modules-import` and
  `commented-import-then-dynamic`.
- **N4, N5:** two more items are recorded in the header's list of what remains unmeasured. A
  `?query` re-import of a graph member is a second read and a second execution, graded as the
  loader's. And the probe itself loads `scripts/lib/import-graph.js` before patching.
- **Left unpinned, loud in both cases:**
  - The `note` text has no arm asserting it (N2).
  - `startsWith(root)` without the separator is not pinned (N3). It would excuse a sibling named
    `node_modules-…`, and none exists.
  - `modulePath` returning `null` is not pinned either (N3). No arm produces a loader-frame read
    whose argument is neither an absolute path nor a `file:` URL.
- **N7, the mutant table above was measured on v25 only.** The reviewer re-ran it:
  - All five rows reproduce by row name on v25.
  - The realpath row is equivalent with a real `node_modules` (42/42 on v25 and v22).
  - A mutant that makes `modulePath` return `null` for absolute paths is held by one arm on v22 and
    v25 (`bare-resolve-import`) and by three on v24, whose ESM resolver also calls `realpathSync`.
