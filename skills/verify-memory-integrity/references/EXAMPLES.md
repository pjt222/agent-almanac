# Verify Memory Integrity — Extended Examples

Worked runs, the report template, the derivation behind step 1's measured cap properties, the full
link-form census, and the before/after compaction pairing. The store-identity resolution and the
eight checks themselves live in `../SKILL.md`; nothing here replaces one.

Every path below is written as `<memory-dir>`, and every filename is generic. A memory store is
private to its owner — do not paste a real store's file listing into a shared document, and do not
carry one back into this file. Where a sample output is illustrative rather than a capture, it says
so on the line above it.

---

## 1. A clean store

Real aggregate figures from one store, with paths and filenames removed. Step 0 and checks 1-6 pass,
7 and 8 warn; the run exits 0 because no line is a `FAIL`.

```text
STORE <memory-dir>
lines 131/200 = 65.5%    size 19021/25000 = 76.1%
USAGE 76.1% -> OK
binds: neither
mean 145 units/line — the size cap binds first above 125
utf-8 bytes 19260; not loaded, so not counted: 0 unit(s)
astral chars 0

topic files 137; linked 137
ORPHANS  0 = 0.0% of files, 0.0% of bytes
DANGLING 0 (linked, absent on disk)

LINK FORMS all flat *.md — no sub-path, anchor or URL targets
DEGRADED 0 (named in the index, not a link target; NOT reachable)
CONVENTIONS 2 in use
UNRESOLVED 0/135 = 0.0% of link targets
CATALOG ENTRIES CHECKED 75
OVERSIZE 8 of 135 topic files over 8000 bytes
VCS no — an overwrite in this store is unrecoverable
ARCHIVE none — no tombstone path for deleted topic files
```

Three things in that output are worth reading rather than skimming:

- **`binds: neither` with `USAGE 74.6%`.** No cap cuts yet, and the *size* fraction is the larger
  one. A reader who only saw `129/200` would conclude the index had 71 lines of headroom. At 145
  units per line it has closer to 44 — the `mean` line is what makes that visible.
- **`CONVENTIONS 2 in use` with `UNRESOLVED 0`.** Two naming conventions coexist and every link
  still resolves exactly. That is a latent hazard, not a finding: the next hand-written link is the
  one that guesses wrong. It belongs in the report as an observation, not as a `FAIL`.
- **`VCS no` / `ARCHIVE none` on an otherwise perfect store.** This is the normal state of a memory
  directory, and it is why check 8 exists. A store can pass every reachability check and still have
  no way back from one bad overwrite.

## 2. A store failing three checks

Illustrative. The run exits 1 because the report contains at least one `FAIL`.

```text
lines 214/200 = 107.0%    size 21400/25000 = 85.6%
USAGE 107.0% -> OVER CAP - the tail is dropped on load
binds: lines; first line dropped: 201
mean 100 units/line — the size cap binds first above 125

topic files 155; linked 107
ORPHANS  48 = 31.0% of files, 12.4% of bytes
DANGLING 3 (linked, absent on disk)
  dangling deploy-runbook.md
  dangling old_notes.md
  dangling sub/legacy.md

  in-scope suspect (sub-path) sub/legacy.md
DEGRADED 2 (named in the index, not a link target; NOT reachable)
  degraded gpu-profiling.md
  degraded release-checklist.md
CONVENTIONS 2 in use
  NORMALIZES old_notes.md -> old-notes.md
  UNRESOLVED deploy-runbook.md
  UNRESOLVED sub/legacy.md
UNRESOLVED 2/110 = 1.8% of link targets
```

How to read it, check by check:

| Signal | Verdict | Why |
|---|---|---|
| `USAGE 107.0%`, `binds: lines` | `FAIL dual-cap` | Line 201 onward never loads. Record `first line dropped` before anything edits the file |
| `ORPHANS 48 = 31.0% of files, 12.4% of bytes` | `FAIL orphans` | Both denominators, never interchangeably: a third of the files are unreachable but only an eighth of the content |
| `DEGRADED 2` | `FAIL degraded` | Both names appear in the index as prose, so a human scan reads them as present. Both also appear in the orphan list — that is the same two files counted once each, not four problems |
| `NORMALIZES old_notes.md` | still `FAIL unresolved` | Names the fix; is not the fix. The link is broken at load time until the index is edited |
| `in-scope suspect (sub-path)` | investigate | The store is flat, so a directory component usually survives a move |

Note that `ORPHANS 48` and `DEGRADED 2` overlap: a degraded reference names a file that no link
reaches, so that file is also an orphan. Report both counts and say which files are in both, or the
same defect gets fixed twice and counted twice.

## 3. Report template

One file, appended to by each check, outside the store. The first token on a line is the verdict, so
the gate at the end of the run needs nothing else:

```bash
# OUTSIDE the memory directory. A report written into the store breaks the
# read-only contract and becomes an orphan the next run has to explain.
REPORT="${TMPDIR:-/tmp}/memory-integrity-$(date +%Y%m%d-%H%M%S).txt"
# ... run checks 0-8, appending to "$REPORT" ...
# Fail closed: on a missing report `grep -q` exits 2, and a bare `|| exit 0`
# would turn "the run produced no verdicts" into a clean pass.
[ -s "$REPORT" ] || { echo "FAIL no report — the run produced no verdicts"; exit 2; }
grep -q '^FAIL' "$REPORT" && exit 1 || exit 0
```

```text
# Memory integrity report
store:   <memory-dir>
date:    YYYY-MM-DDTHH:MM:SS
skill:   verify-memory-integrity v1.0 (read-only)

0 store id       PASS  STORE <memory-dir>; no _/- sibling directory
1 dual-cap       PASS  lines 129/200 64.5%; size 18656/25000 74.6%; binds neither; 145 units/line
2 orphans        PASS  135 topic files, 135 linked, 0 orphans (0.0% files / 0.0% bytes)
3 dangling       PASS  0 dangling; link forms all flat *.md
4 degraded       PASS  0 prose-only references
5 crossrefs      PASS  0/135 unresolved; 2 conventions in use (observation, not a finding)
6 catalog        PASS  75 catalog entries checked, 0 description failures, 4 no-frontmatter
7 size hygiene   WARN  8 of 135 topic files over 8000 bytes (threshold set per project)
8 recoverability WARN  no version control, no archive path

verdict: 0 FAIL, 2 WARN -> exit 0
```

Rules the template encodes:

- **`WARN` never sets the exit code.** Only `FAIL` does. An oversize topic file costs read time on
  the one session that opens it; an oversize index costs every session, so the two must not share a
  verdict.
- **A missing report is not a clean run.** `grep -q '^FAIL' "$REPORT"` exits 2 when the file does
  not exist, and `&& exit 1 || exit 0` converts that into a pass. The guard in `SKILL.md` tests
  `[ -s "$REPORT" ]` first and exits 2 — the same fail-closed rule the `SKIPPED` verdict follows.
- **A `SKIPPED` line is a result.** Write it into the report exactly like a `PASS` or a `FAIL`, so
  that a later reader cannot mistake the absence of failures for evidence of correctness.
- **Both denominators, always labeled.** Never write "31% orphaned" without saying of what.
- **Every number carries its denominator inline.** `74.6%` alone is unreadable six months later;
  `18656/25000 74.6%` survives a change to either cap.

## 4. Why step 0 scans and normalizes instead of substituting

Building the sibling candidate by substitution — `${SLUG//-/_}` — reads as the obvious
implementation and is wrong in one direction. A slug encodes every `/` of the project path as a
hyphen, so converting *all* hyphens to underscores produces a name nothing ever had.

Measured against two real sibling pairs on one machine:

| Starting store | Substitution | Scan + normalize |
|---|---|---|
| legacy `…-<project_a>` (underscore form) | finds the modern twin | finds it |
| modern `…-<project-a>` (converted form) | **finds nothing** | finds the legacy store |
| legacy `…-<project_b>` (underscore form) | finds the modern twin | finds it |
| modern `…-<project-b>` (converted form) | **finds nothing** | finds the legacy store |

(Slugs elided — both pairs are real private project identifiers. Only the `_` versus `-` spelling
is load-bearing.)

The two misses are the direction that matters. Memory
written before the change lives under a slug the harness never opens again — which you discover
while sitting in the *modern* store, exactly where substitution is blind. Normalizing both sides to
one key (`tr '_' '-'`) collapses the two spellings and catches all four.

A negative control matters as much: a store with no sibling must stay silent, or the check becomes
noise. Verified on a third store, which prints `STORE` and nothing else.

## 5. The three further cap properties, and how they were established

`SKILL.md` step 1 states three properties of the size cap that are measured rather than documented.
Each was demonstrated with a fixture whose answer differs between the two candidate behaviors —
which is the only construction that settles a behavioral question, because a fixture both candidates
pass is a fixture that measured nothing.

| Property | What it changes for a reader |
|---|---|
| **Truncation is whole-line.** A line the cap lands inside is dropped, not kept in part | The first dropped line is the first whose *cumulative* size exceeds the cap. Report that line, not "the last line that loaded" — the latter is ambiguous unless it also says whether a partial line counts |
| **Carriage returns count.** Each CR is a unit | A CRLF index loses roughly one line per 128 against the same content with LF. A line budget is EOL-dependent, which is why the canonical block reads bytes and decodes once instead of using Python's text mode, whose CR-stripping would silently measure a different string than the loader sees |
| **Past the crossover ≠ being truncated.** The crossover names which cap will bite first when one eventually does | A real index measured at 132.3 units per line sits past the crossover and under both caps, losing nothing. `binds: neither` alongside a high `mean` is a normal, healthy reading |

Measured on Claude Code 2.1.237, 2.1.238 and 2.1.241 (linux-x64, WSL2) — 24 probes, two runs per
cell, no disagreement — with tool use disabled and the model reporting which canary lines it could
see. **Tool use must be disabled for the answer to be evidence.** A `claude -p` probe with tools
enabled answers by reading the index off disk, which produces a clean, self-consistent table showing
no truncation anywhere — a convincing result about the filesystem and no result at all about the
model's context. Anyone reproducing this hits that trap first. The full run, with a runnable fixture
generator, is at `tests/results/2026-08-23-memory-cap-truncation-probe/RESULT.md`.

The external tables in `anthropics/claude-code#82056` put the boundary one line further on. That
does not reproduce on **linux-x64 official builds of either version they cite** — the external
2.1.238 arm is native Windows and the external Linux arm reports `ccd-cli`, so neither platform nor
artifact is matched — but within that scope the release hypothesis is dead, so do not read the
difference as a release change and do not stamp the whole-line rule to one build: state it as
measured across 2.1.237–2.1.241, linux-x64.
The discrepancy is one line in the unsafe direction: a reader budgeting from the higher figure
believes one more line survives than does.

## 6. Full link-form census

`SKILL.md` step 3 prints only the in-scope suspects, because a large store has hundreds of link
targets and a check whose normal output is a wall of text does not get read. When the exclusion set
itself is under suspicion, run the full census instead:

```bash
python3 - <memory-dir> <<'PY'
import os, re, sys, collections
d = sys.argv[1]
text = re.sub(r'<!--.*?-->', '',
              open(os.path.join(d, 'MEMORY.md'), encoding='utf-8', errors='replace').read(),
              flags=re.S)
kinds = collections.Counter()
for target in re.findall(r'\]\(([^)\s]+)\)', text):
    base = os.path.basename(target.split('#')[0])
    kind = ('anchor'   if target.startswith('#')
            else 'url' if '://' in target
            else 'sub-path' if '/' in target
            else 'md'  if base.endswith('.md') else 'other')
    kinds[kind] += 1
    print(f"  {kind:9} {target}")
print('LINK FORMS ' + ', '.join(f'{k}={n}' for k, n in sorted(kinds.items())))
PY
```

Read the totals against the counts step 2 printed. A `LINK FORMS md=N` that exceeds step 2's
`linked` count is not a discrepancy — step 2 deduplicates by basename, and an index that links the
same topic file from two sections is normal. A census total *below* step 2's `linked` count is a
real discrepancy and means one of the two regexes is wrong; step 2 holds the verdict, so fix the
census.

## 7. Bracketing a compaction

Compaction is mandatory once `USAGE` crosses the warn threshold, and compaction is the operation
that strands topic files: a rewritten index drops the line that was some file's only pointer, the
write succeeds, and nothing anywhere reports it. Bracket it.

```bash
BEFORE="${TMPDIR:-/tmp}/memory-integrity-before.txt"
AFTER="${TMPDIR:-/tmp}/memory-integrity-after.txt"

# 1. Baseline. Capture the reachable set while it is still reachable.
#    (run checks 0-8, appending to "$BEFORE")

# 2. Compact with manage-memory. THIS SKILL DOES NOT DO THIS STEP.

# 3. Re-verify into a separate file, then compare the two.
#    (run checks 0-8, appending to "$AFTER")
diff <(grep -E '^[0-9] ' "$BEFORE") <(grep -E '^[0-9] ' "$AFTER")
```

What the comparison must show:

| Line | Before | After | Reading |
|---|---|---|---|
| `1 dual-cap` | `FAIL` at 107% | `PASS` at ~70% of the **binding** cap | The compaction did its job |
| `2 orphans` | *N* orphans | **no more than *N*** | Any rise is compaction collateral: an index line was dropped, not a file |
| `4 degraded` | *M* | **no more than *M*** | A link demoted to prose is the quietest way to strand a file |
| `6 catalog` | *K* entries checked | comparable *K* | A large drop means entries were merged into compound lines and check 6 stopped seeing them |

The orphan count rising while `USAGE` falls is the signature failure of a compaction, and it is
invisible from inside the compacting skill — which is the whole reason this one is read-only and
run twice.

If the baseline `BEFORE` capture is missing, do not compact. There is nothing to compare against, the
store almost certainly has no version control and no archive path (check 8), and a stranded file
announces nothing about its own condition. Take a copy of the directory first.

## What the strip does and does not remove

Documented: only content that loads counts toward either cap, and YAML frontmatter plus
block-level HTML comments are stripped before the index is loaded, so they are excluded from the
measurement.

Not documented, and the reason this section exists: whether a comment **inside a fenced code
block** survives that strip. The nearest documented behavior — for `CLAUDE.md`, not `MEMORY.md` —
says comments inside code blocks are preserved, so neither answer could be assumed.

Measured on Claude Code 2.1.241 (linux-x64, `claude -p`, tool use disabled), three arms of 150
canary lines at 201 units each, sized so the line cap can never bind and only the size cap can move
the cut:

| arm | comment | predicted if stripped | predicted if counted | measured |
|---|---|---:|---:|---:|
| `ctrl` | none | 124 | 124 | **124** |
| `bare` | ~1.9k units, not fenced | 124 | ~109 | **124** |
| `fenced` | same bytes, inside a ```text fence | 124 | ~109 | **109** |

Two runs per arm, no disagreement. So:

- an unfenced block comment **is** stripped and excluded, as documented;
- a comment inside a fence is **preserved and counted**, and 15 lines of index disappeared because
  of one.

The block therefore tracks fence state and strips only outside fences. The earlier version stripped
both, which under-reports — the dangerous direction, because it reports headroom on an index that
is already losing its tail. This was shipped as a labelled unmeasured boundary before the arm was
run; the label was correct and the code was wrong.

Boundaries: one platform, one version, `-p` only, and ```text is the only fence tag exercised. A
tagged fence (```bash, ```yaml) is untested, though nothing in the observed behavior suggests the
tag matters.

### What the state machine does not model, and which way each one errs

One collision was repaired (#734 finding 1): a ``` delimiter inside an open block comment used to
toggle the fence, carry `cmt` across the fenced region, and then strip **real index lines** once
the fence closed. The comment branch now runs first, and `scripts/test/memory-blocks.test.js`
pins it.

The rest are recorded rather than repaired, because the correct target is the loader's behaviour
and nobody has captured it — a "fix" toward CommonMark could widen the divergence it is meant to
close. Each is listed with the direction it errs, since only one direction is dangerous:

| Case | The block | CommonMark | Risk if they differ |
|---|---|---|---|
| A ``` run indented four or more spaces | toggles the fence | an indented code block, not a fence | either direction, depending on what follows |
| An info string (```yaml) *inside* an open fence | toggles the fence closed | fence content | **under-reports** the remainder |
| A ``` run shorter than the opener (``` inside a ```` block) | closes the fence | not a close | **under-reports** the remainder |
| A `~~~` fence | not a fence at all | a fence | **under-reports** its contents |
| An unclosed `<!--` | strips to EOF | an HTML block to EOF | agrees, but it is the one unbounded strip |
| A tag with attributes | not handled | — | unmeasured |

Three of those four rows were wrong when this table was first written, and an adversarial round
caught them. They are corrected here because a table whose contract is "each is listed with the
direction it errs" fails at its own job the moment a row says `unmeasured` about something one
fixture settles. Measured with the shipped stripper, lifted out of `SKILL.md` rather than retyped,
against the pre-#734 loop lifted out of the diff hunk
(`tests/results/2026-09-16-divergence-table-recheck/`):

| fixture | raw | CommonMark | this block | pre-#734 |
|---|---:|---:|---:|---:|
| `~~~text` wrapping a comment, then three entries | 9 | 9 | **6** | 6 |
| unclosed ```` ```text ````, then three entries | 5 | 5 | 5 | 5 |
| unclosed ```` ```text ````, a comment, three entries | 8 | 8 | 8 | 8 |
| `<!--` with no `-->`, containing ```` ``` ```` | 6 | 1 | **1** | **5** |

- **`~~~` is not unmeasured — it under-reports**, which is the direction this document calls the
  dangerous one. `ln.lstrip().startswith('```')` never matches a tilde fence, so the `<!--` inside
  one is treated as a real comment and the fence's contents are stripped.
- **An unclosed fence is handled, and handled correctly.** After it, `fence` stays `True` to EOF and
  nothing is stripped, which is what CommonMark says: the rest of the document is code. Listing a
  correct behaviour as an unmodelled risk is a claim about what was checked, and it was wrong — in
  the safe direction, which is exactly how it survived being written down.
- **The unclosed comment was missing, and this repair changed it.** It is the only unbounded strip
  path left, and #734 finding 1 widened the inputs reaching it. Under CommonMark the new answer is
  right; under a loader implemented as a non-greedy `<!--.*?-->` the old one was closer. The only
  signal a reader gets either way is the `not loaded, so not counted: N unit(s)` line, and nothing
  flags a large N as anomalous.

**On why finding 1 was repaired and these are not**, since "repairing toward CommonMark cannot make
things worse" is not the reason and does not hold — a `~~~` fence containing an unterminated comment
also strips to EOF. The distinction is *what kind of line* gets stripped. Finding 1 stripped ordinary
index lines sitting outside any comment and outside any fence, which no plausible loader grammar
drops; that is why repairing it never required knowing the loader. Every divergence left strips a
region that begins on a `<!--` line, i.e. comment-shaped content a loader might legitimately drop.

The arm that would settle any of them is `tools/wirecap.py` plus the generator in
`tests/results/2026-08-25-fence-strip-replication/`: capture what the loader does with the same
fixture, rather than reasoning about what it ought to do.

## Nothing here is enforced at write time

These skills run as out-of-band maintenance inside an ordinary session. The path that actually
writes memory is not the path that runs skills, so nothing in this file is a constraint the runtime
applies — the caps are enforced at load, by truncation, silently.

The consequence for how the report should be read: every line in it is *verified when the skill last
ran*. A store that passed this morning can be over both caps and half-orphaned by this evening, and
the report will not know. That is why the trigger list puts a run before and after every index
compaction rather than on a schedule: the mutating operation is the event, not the clock.

## What the size cap counts

The size cap is applied to **UTF-16 code units** — JavaScript `String.length` — rather than UTF-8
bytes or Unicode code points. For any text inside the Basic Multilingual Plane — ASCII, Latin-1
accents, CJK — the character count *is* the unit count, so a character count is exact for most real
indexes. It diverges in two places: a byte count over-reports on any non-ASCII content (up to 3x on
CJK, which is why a `wc -c` check can demand a prune the loader does not need), and a character
count *under*-reports on astral characters such as emoji, where one character costs two units.

Measured on Claude Code v2.1.238 (Windows) and 2.1.237 (Linux), and reported in
`anthropics/claude-code#82056`, August 2026. Treat as version-volatile: the two documented numbers
are the contract, and this is how the current implementation counts them.

## What is documented and what is derived

The two caps are documented, in
those words. The thresholds around them are not: no character-based entry-length guidance is
published anywhere, so `~150 characters` is a working figure for deriving the ~166-line budget
rather than a recommendation to cite. The only nearby published number is a line-based rewrite
target in a sample error message ("Rewrite it to under 140 lines") — 140/200 is the same `0.70`
used here. Nothing published fixes `0.80`; it is this skill's warn threshold.
