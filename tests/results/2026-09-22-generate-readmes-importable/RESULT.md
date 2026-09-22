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
| head at measurement | every figure below re-taken at `0b49d8041`, the round-3 fix commit |
| working tree | clean at every run; the two probes that mutate refuse a dirty tree or run in a lab |
| command every mutant and every suite arm ran under | `npm run test:scripts` |
| node | **v25.9.0** for the suite figures, recorded rather than disclaimed — an earlier edition of this table said no figure depended on a version, and two did. The `node:test` reporter is TAP on a non-TTY below Node 24, so both mutation probes pin the spec reporter through `NODE_OPTIONS` (verified on v20.20.2, v22.16.0 and v24.20.0). The import probe was worse: its verdict was a Node-25 artefact and it REFUSED the unmodified generator on CI's own Node 24 (§4). It is now run and recorded on v22.16.0, v24.20.0 and v25.9.0, the whole range `engines` allows |

---

## 1. The bypass survived at the parent commit

`prove-the-bypass-survived.sh`, four arms, two of them controls:

```
prove-the-bypass-survived: row opendir-bypass on scripts/generate-readmes.js, every arm under: npm run test:scripts
  base: d6b9b9c72   head: 0b49d8041   node v25.9.0

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
at `0b49d8041`. Nothing skipped, nothing absent. And the mechanism: `english-history.test.js`
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

### The claim was wrong five times, and the instrument was wrong four of those

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

Through all five the behavioural claim survived unchanged — no registry read, no YAML parse, no
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
--verify: 20 shape(s) on node v25.9.0, each planted into a throwaway module and imported
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
  ok    worker-write       declared blind observed blind
  ok    process-binding    declared blind observed blind
```

**`empty` is the arm that matters most**, and it is the one the first table lacked. A module that
does nothing must grade `blind`; under the Node-25-only classifier it graded `seen` on 22 and 24,
which means every `ok seen` row in that table passed for the wrong reason — the child refused
before the planted line mattered. A twelve-row table of `ok` is exactly the shape that invites
belief, and it was wrong.

`worker-write` and `process-binding` are declared blind and measured blind: a worker has its own
module registry and its own `fs`, and `process.binding` reaches the internal binding below every
public name. `open-js-as-data` was declared blind while the classifier could not tell it from the
loader; the combined rule can, so it is declared `seen` and the excuse is gone.

Three controls remain — the patch fires, the patch reaches a NAMED binding, the classifier can
still say *content*. **They are necessary and they were never sufficient**: control 2 passed
while writes, promises, callbacks and async spawns were all unreached. That is what the arms are
for.

Still unmeasured: a module loaded before the probe, and any side effect reaching the filesystem
through neither those three modules nor a worker.

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
- **Import inertness is tested by two spawns plus twenty probe arms, not proven for every
  shape.** `node -e` leaves `process.argv[1]` undefined; an importer file gives it a real path
  that is not this module. A third shape — a loader or a `--require` hook that rewrites
  `argv[1]` — is not covered, and neither is a native addon, a worker thread or `process.binding`
  (§4 lists them). The
  round-1 reviewer measured nine invocation shapes and three import shapes against the guard and
  found no case where it answers wrongly, including `npm run`, `node --run`, a `..` path, an
  out-of-tree symlink and `sh -c`; `--preserve-symlinks-main` on the out-of-tree symlink fails at
  module resolution before the guard is reached, and nothing here uses that shape.
- **The fixture declares a `prepack` so it takes production's branch**, after the round-1 review
  found it taking the other one: without it `packHookSentence` returns `''` and the paragraph is
  missing a clause the real one carries. The clause is now asserted.

## 6. The defect class recurred eight times inside the PR that is about it

Worth a table, because the pattern is the point and no single bullet above carries it. #877
exists because an instrument — a source scan — was honest about something narrower than the claim
resting on it. Building the fix reproduced that eight times, twice inside a remedy written for a
previous instance:

| # | what | found by | how it showed |
|---|---|---|---|
| 1 | the Workflows arm's ignored file was a `.js`, which the count drops by extension anyway | this session, before round 1 reported | a disk walk of `workflows/` passed the suite 8/8 |
| 2 | the import probe's patch never reached an ESM named binding | round 1 | `named === fs.readFileSync` is false without `syncBuiltinESMExports()` |
| 3 | the fixture's ignore rule sat where a walk could read it | round 1 | a hand-rolled `.gitignore` matcher survived the suite |
| 4 | the repaired probe could not see `node:fs/promises` | this session, between rounds | a planted `await readdir(...)` graded clean |
| 5 | the probe patched no WRITE name, and its negative test used the shape it was best at | round 2 | a planted `writeFileSync` graded clean |
| 6 | the cli-arms control counted files, then counted five verdicts of six | rounds 1 and 2 | a `node` shim exiting 3, then one failing only write mode, both went green |
| 7 | the probe's verdict was a Node-25 artefact; it refused the unmodified generator on CI's Node | round 3 | `v24.20.0 exit=1 content=77` |
| 8 | two write paths reached the tree through none of the patched names | this session, ahead of round 3 | `createWriteStream` and `cpSync` graded clean |

Every one is the same shape: **an instrument that cannot fail on part of the population it
vouches for, with its OK quoted somewhere a reader will trust.**

Two of them are the harder variant — the class appearing inside a remedy written for it. #4 and
#8 are gaps in the fix for #2 and #5. A third was caught before it shipped: the round-3 reviewer
measured a pure-frame classifier, the natural remedy for #7, going blind to a JSON import of the
registry. That would have been the ninth.

What actually caught them: running something. #2, #5, #7 and the near-miss came from a reviewer
executing a planted shape; #4 and #8 from asking "find one this cannot see" and then running it.
Only #1 was caught by reading — by asking what a hostile input actually changed, which is the
cheapest habit here and the one to reach for first. That is why the blind list became `--verify`
arms, the file-count control became six asserted verdicts, and the name list became an
enumeration: each is a paragraph replaced by a run.

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
