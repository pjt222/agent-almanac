## Run: 2026-08-26-cap-constant-closure

**Observer**: Claude (Opus 5, one Claude Code session on one machine) | **Relates**: #407, #717, #720, #722, `anthropics/claude-code#82056`

### Objective

Settle, on **linux-x64**, five open questions about the auto-memory index caps that no fixture in
the corpus has been able to answer, and do it from the wire rather than by asking the model.

Prior work in `anthropics/claude-code#82056` bracketed the size cap and then measured it at
**25,000 UTF-16 code units** on two platforms — win32 (DanceNitra, comment 5421352343) and
darwin-arm64 (yacb2, comment 5423768912). Both used the capture instrument this repository
published in `tools/wirecap.py`. What remained open:

| | prediction | why it was open |
|---|---|---|
| **P1** | the SIZE cap is exactly 25,000 units, threshold strictly `>` | measured on two platforms, neither of them this one; a different platform is a different build |
| **P2** | the LINE cap is exactly 200, same strict comparison | nobody had fixtured the line boundary at all |
| **P3** | the cut keeps whole lines, retreating to the last newline at or before the cap, and falls back to exactly the cap only when there is no newline | asserted from behaviour, never isolated. **Only the fallback half is tested by this run** — see below |
| **P4** | both counts are taken after trimming | untested by anyone |
| **P5** | when BOTH caps are exceeded the notice takes a third form, naming lines and size together with **no** `(limit: …)` clause | the thread had two notice variants and believed that was all of them |

### Method

`cap-closure-probe.py` in this directory. Seven arms, one capture each, every figure counted out
of the captured POST body — nothing is asked of the model, because #717 established that a
session's self-report about its own context is unsound in **both** directions.

The store path is **discovered, never computed**: each arm runs a throwaway session in its own
directory and observes which `~/.claude/projects/` entry appears. The slug transform has changed
before (#720), so a computed one would be a guess.

**This is not a clean room and the write-up does not claim one.** Isolation is per-arm *cwd* —
a distinct project directory yields a distinct slug and therefore a distinct store, which is all
the arms require. `CLAUDE_CONFIG_DIR` is **not** isolated: `run_claude()` sets exactly one
variable, `ANTHROPIC_BASE_URL`, so the throwaway sessions load the operator's real user config.
An earlier draft of the upstream comment claimed `CLAUDE_CONFIG_DIR` isolation; it was false and
was caught in review before posting. The measurements are unaffected — the read-out is the
injected `MEMORY.md` segment, which is per-store — but in a thread where an isolation claim has
already produced one retraction, the weaker true statement is the one worth making.

**Why the size arms contain no newline.** Under P3 a fixture built out of lines reads the cap
*through* a line width and can never resolve it better than one line — which is why a week of
line-based fixtures upstream landed on a 24-unit bracket rather than a constant. Remove every
newline and the whole-line retreat has nothing to retreat to, so the cut lands on the constant
itself.

### Results — 7 of 7 arms as predicted

| arm | fixture | on disk | on the wire | lines | notice |
|---|---|---:|---:|---:|---|
| `size_exact` | 5-char markers × 5,000 | 25,000 | 25,000 | 1 | **(none)** |
| `size_over1` | the same + one character | 25,001 | 25,000 | 1 | `24.4KB (limit: 24.4KB) — index entries are too long` |
| `size_over7` | 7-char markers × 4,000 | 28,000 | 25,000 | 1 | `27.3KB (limit: 24.4KB) — index entries are too long` |
| `line_exact` | 200 lines × 20 chars | 4,199 | 4,199 | 200 | **(none)** |
| `line_over1` | 201 lines × 20 chars | 4,220 | 4,199 | 200 | `201 lines (limit: 200)` |
| `both` | 300 lines × 100 chars | 30,299 | 20,199 | 200 | **`300 lines and 29.6KB`** |
| `trim` | `size_exact` + a trailing blank run | 25,003 | 25,000 | 1 | **(none)** |

Every notice is prefixed `MEMORY.md is ` and suffixed `. Only part of it was loaded. Keep index
entries to one line under ~200 chars; move detail into topic files.`

#### P1 — the size cap is 25,000, and the threshold is strictly greater-than

`size_exact` and `size_over1` put **byte-identical content on the wire** — both end
`…M4997M4998M4999M5000` at 25,000 units. They differ by exactly one character *on disk*, and that
one character is the whole difference between silence and a notice. A cap of 24,999 would have cut
`size_exact`; a threshold of `>=` would have warned on it.

#### P2 — the line cap is 200, on the same strict comparison

`line_exact` at 200 lines arrives whole and silent. `line_over1` at 201 lines is cut to exactly
200 — its last surviving line is `L00200` — and announces `201 lines (limit: 200)`.

#### P3 — the fallback branch holds; the retreat branch is NOT tested here

`size_over7` is the position proof, and it replicates DanceNitra's win32 arm on linux:

```
3,571 whole markers = 24,997 units, remainder 3 units      total 25,000
last whole marker   M003571
the cut lands THREE characters into marker 3,572
```

A cut landing on a marker boundary would have indicted the fixture rather than measured anything.
It does not.

**No arm in this run exercises the size cut's newline retreat, and an earlier draft of this file
claimed one did.** `line_over1` is cut by the LINE cap — 4,220 units against a 25,000 ceiling, so
the size cap never binds — and a cut expressed in whole lines lands on a line boundary trivially.
Its 21 unused units are measured against a budget that was never the constraint. The three size
arms are newline-free by construction and `both` is line-cut as well, so the branch is untested
here. Treat P3's retreat clause as open on this build.

The demonstration is in the 2026-08-25 run instead: a 150 × 200-char + LF fixture, 30,149 units,
cut at exactly line 124 = 24,923 units — the size cut retreating **77 units** from the ceiling to
reach a newline, where line 125 would have ended at 25,124.

#### P4 — the counts are taken after trimming

`trim` weighs **25,003** units on disk and arrives **whole**, at 25,000, silent. Its trailing blank
run is not counted. Nothing else in this corpus separates trimmed from untrimmed counting: every
other fixture is identical under both readings.

#### P5 — a third notice variant exists

`both` exceeds both caps and produces a form the thread had not seen:

```
MEMORY.md is 300 lines and 29.6KB. Only part of it was loaded. …
```

**No `(limit: …)` clause at all**, where each single-cap variant carries one.

The arm also shows that **both figures in the notice describe the whole file, not what survived** —
300 lines and 29.6KB are the on-disk counts, against 200 lines and 20,199 units on the wire. That
matches the size-only finding recorded in the 2026-08-25 run: the notice reports what was offered
and what the ceiling is, so the shortfall is available by subtraction.

**What this arm does NOT show, and an earlier draft of this file claimed it did: the order of the
two cuts.** At this geometry line-cut-then-size-check and size-cut-then-line-cut produce
byte-identical output — both 20,199 units over 200 lines — so the observation cannot separate them.
Separating them requires a fixture where the size cap binds harder than the line cap: fewer, much
longer lines. Not run here.

#### Incidental: the tools array

`tools` is **`['advisor']`, n=1, in all seven captures** — not empty, despite
`--tools "" --strict-mcp-config`. That reproduces from the wire the correction published in
`anthropics/claude-code#82056` comment 5412833938: `--tools` filters client tools and does not
remove one contributed by `settings.json`. Asserting tool-zero from the CLI's init event is the
weaker surface; reading the `tools` array out of the captured request is free once you are
capturing.

### A defect this run found in our own tooling

`tools/wirecap.py`'s usage docstring documented the invocation as:

```
ANTHROPIC_BASE_URL=http://127.0.0.1:8787 \
  printf '%s' 'hello' | claude -p --tools "" --strict-mcp-config
```

Assignments before a pipeline apply to the **first command only**, so `ANTHROPIC_BASE_URL` never
reaches `claude`. Measured on this box:

```
piped-form  FOO=[UNSET]
prefix-form FOO=[bar]
```

Following our own published docstring, the capture is empty, the real API answers, and the fixture
lands in a **live** memory store. This is not hypothetical: it is the cause of a false finding
published upstream and retracted the same day (`anthropics/claude-code#82056`, yacb2, comment
5424142726 retracting 5423768912 — reported as "a nested session ignores the isolation variables",
actually a shell-assignment scoping bug). `cap-closure-probe.py` passes `env=` explicitly and pipes
input via stdin, so the form cannot occur. The docstring fix is a separate commit from this run
(`eb1534911`, `tools/wirecap.py` alone), made after the captures were taken.

### What this does NOT claim

- **Nothing about other platforms.** linux-x64, one build. The win32 and darwin figures agree, but
  they are different compilations and this run does not merge with them.
- **Nothing about why the constants are what they are.** This measures behaviour at two
  boundaries. It does not license any statement about the implementation that produces it.
- **Nothing about whether the model reads the notice.** Presence on the wire is not use. That
  question is untouched here.
- **One trial per arm.** The arms are deterministic and each predicted its own outcome in advance,
  which is a different kind of evidence from repetition, not a substitute for it.

### Reproducing

```bash
cd tests/results/2026-08-26-cap-constant-closure
python3 cap-closure-probe.py --build   "$ROOT"
python3 cap-closure-probe.py --capture "$ROOT"
python3 cap-closure-probe.py --analyze "$ROOT"
python3 cap-closure-probe.py --cleanup "$ROOT"     # fail-closed; run it
```

`--analyze` asserts every cell — wire units, wire line count, and the FULL notice string — against
a table declared before the run, and exits non-zero on any mismatch.

**It did not always, and the difference is the whole point of recording it.** The first version
stored a boolean per arm and asserted only whether *a* notice appeared. An independent reviewer
killed it with a mutant: every wire body corrupted to 5 units and the `both` notice replaced with
`999.9KB (limit: 24.4KB) - TOTALLY DIFFERENT NOTICE`. It printed `OK`, exit 0. Under that check
the `both` arm would have passed carrying `300 lines (limit: 200)` — precisely the outcome P5
predicts against — and every figure in the table above was in fact human-read. The current
version kills that mutant on all seven arms; the reproduction is worth re-running before trusting
any future edit to `EXPECTED`.

Independently of the tool, every figure in this file was re-derived from the raw captures by a
second party using their own parser, explicitly forbidden from importing the probe's helpers, so
a bug in `_memory_segment` or `utf16_units` could not reproduce itself into the check.

**Run `--cleanup`.** A probe fixture is indistinguishable from a real memory store to anything that
walks that directory, and left-behind fixtures have already corrupted one published census
upstream: 75 of 80 "empty memory stores" on one observer's machine turned out to be their own
residue (`anthropics/claude-code#82056`, comment 5423768912). Cleanup here is fail-closed and
refuses to guess what to delete. Verified after this run: the projects directory returned to its
prior count, with zero arms left behind.

### An OS-agnostic reprex, and the trap it caught in itself

`reprex_memory_cap.py` in this directory is the whole run as one self-contained file: Python 3.8+,
standard library only, no repository, no network. It exists because every other participant in
`anthropics/claude-code#82056` is on a different platform and has been hand-rolling instruments.

```bash
python3 reprex_memory_cap.py --selftest    # no `claude` needed; checks the instrument
python3 reprex_memory_cap.py --run         # the seven arms
```

It reproduced all seven arms independently of `cap-closure-probe.py` — different code, different
temporary location, same seven verdicts — a second confirmation of the table above rather than a
convenience wrapper around it.

**Its first end-to-end run failed, and the failure is worth more than the pass.** It put its arm
directories beside itself, inside this repository, and all seven arms returned an identical 15,222
units over 141 lines: this repository's own `MEMORY.md`, read seven times. **Memory is keyed to the
git repository, not the working directory**, so every arm shared one store and not one fixture was
ever loaded. Nothing was written to that store and it was unharmed — the fixtures went to the
per-cwd transcript directories, which cleanup removed — but every number was of the wrong file.

That is the asymmetry JhouCode reported upstream the same morning (inside a repo, `cd` keeps the
store; outside one, it does not) arriving as an instrument bug rather than as an observation. The
original probe was unaffected only because its root was under `/tmp`, outside any repository —
which was luck, not design.

Three guards now make it unreachable, and only the third catches it directly:

1. arms run under the system temp directory, never beside the file
2. an ancestor `.git` refuses the run outright
3. **each capture asserts that the index path the harness reports is the store that arm just wrote
   to** — because reading the wrong store returns perfectly well-formed numbers for the wrong file,
   which is precisely how this failed

Guard 3 is the one worth copying into any fixture for this question.

### Disclosure

This run was drafted against `skills/redact-for-public-disclosure` and gated with
`tools/check-redaction.sh`, which was written for it — the skills specified that scanner and four
others, and none of them had ever been implemented or invoked. On its first real use the gate
caught four findings in **this directory's own probe script**, which was headed for a public
repository. See `tools/check-redaction.sh` and the notes in `tools/README.md`.
