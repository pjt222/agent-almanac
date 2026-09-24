## Run: 2026-08-23-memory-cap-truncation-probe

**Observer**: Claude (Opus 5, two interactive Claude Code sessions on one machine) | **Issue**: #407 | **Relates**: `anthropics/claude-code#82056`, `anthropics/claude-code#85595`

### Objective

`skills/manage-memory` documented the auto-memory index cap as 200 lines and never mentioned the
size cap, so #407 set out to correct it. Correcting it means writing a number into a public skill,
and the repo's own rule (`skills/create-skill`, "unverified tool-behavior claims", PR #409) is that
a confidently-stated claim about tool behavior gets verified rather than accepted — including when
the confident statement is ours.

Two claims needed evidence before they could be encoded:

1. The size cap counts **UTF-16 code units**, not UTF-8 bytes and not Unicode code points —
   reported externally in `anthropics/claude-code#82056` (v2.1.238 Windows; v2.1.237 Linux).
2. Where the cut actually lands, which decides what a budget check should report.

This run reproduces (1), and produces **two deltas** on (2) that the external reports do not carry.

### Environment

| Field | Value |
|---|---|
| Binaries | Claude Code **2.1.237** and **2.1.238**, invoked directly from `~/.local/share/claude/versions/`; **2.1.241** via the `claude` launcher, which resolves to the same directory. Same binaries, different entry paths — a reproducer following this table literally would not reproduce the 2.1.241 runs. |
| Platform | Ubuntu 24.04.4 LTS on WSL2, kernel 6.18.33.2-microsoft-standard-WSL2, x86_64 |
| Build flavour | linux-x64 |
| Fixture filesystem | ext4 under `/tmp` — deliberately **not** the `/mnt/d` NTFS mount, where in-place rewrites no-op |
| Session type | `claude -p` (print mode) only |
| Date | 2026-08-23 |

**This is a Linux data point.** The externally-cited v2.1.238 result was produced on native
Windows; a Windows-specific boundary cannot be confirmed or refuted from here.

### Method

Seven fixtures, each written as **bytes** (Python text mode rewrites CRLF and would destroy the
`crlf` arm), each placed at the project-slug path the harness reads. Every line carries a unique
canary token, so the cut is read out of the model's answer rather than inferred:

```
cd <arm dir> && printf '%s' "Reply with only the highest-numbered CANARY-NNN token present in your memory index, and nothing else." \
  | claude -p --tools ""
```

Generator: [`memcap-fixture.py`](memcap-fixture.py) in this directory. It emits the exact bytes
probed (verified by sha256 against the probed fixtures, 7/7 match).

**`--tools ""` is mandatory, and this is the trap worth publishing.** With tools enabled the model
answers by *reading `MEMORY.md` off disk*, returns the file's last line for every arm, and produces
a clean, internally consistent, completely wrong table showing that truncation does not exist.
`--tools` is also variadic and eats a positional prompt (`Error: Input must be provided either
through stdin or as a prompt argument when using --print`), so the prompt goes on stdin.

**`--tools ""` is not tool-zero, and this section overstated it (corrected 2026-08-25, #722).** A
wire capture of the same invocation on 2.1.245 shows one tool still offered — `advisor`, type
`advisor_20260301` — because `--tools` filters *client* tools while `advisor` is server-side,
enabled by `advisorModel` in `~/.claude/settings.json`. `--strict-mcp-config` does not remove it
either. The claim is therefore machine-dependent: true only for an operator who has not set that
key. It does not affect this run's arms, since `advisor` cannot read a file off disk and the
disk-read failure above is the one the flag exists to prevent — but "tools asserted zero" should be
read as "no file-reading tool was offered", and the honest way to assert it is to read the `tools`
array out of the request rather than to infer it from a decoy.

### Fixtures

| arm | filler | width (code points) | lines | EOL | UTF-8 bytes | UTF-16 units | code points | astral | what it discriminates |
|---|---|---:|---:|---|---:|---:|---:|---:|---|
| `ascii` | `x` | 126 | 200 | LF | 25,399 | 25,399 | 25,399 | 0 | baseline |
| `cjk` | `中` | 126 | 200 | LF | 71,399 | 25,399 | 25,399 | 0 | same units, 2.81x the bytes — is the cap bytes? |
| `astral` | emoji | 126 | 200 | LF | 94,399 | 48,399 | 25,399 | 23,000 | same code points as `cjk` — is the cap code points? |
| `ascii200` | `x` | 200 | 200 | LF | 40,199 | 40,199 | 40,199 | 0 | second width, to bracket the cap |
| `wide2000` | `x` | 2,000 | 200 | LF | 400,199 | 400,199 | 400,199 | 0 | cap lands deep inside a line — whole-line or partial? |
| `lines300` | `x` | 20 | 300 | LF | 6,299 | 6,299 | 6,299 | 0 | far under the size cap — does the line cap bite alone? |
| `crlf` | `x` | 126 | 200 | CRLF | 25,598 | 25,598 | 25,598 | 0 | do carriage returns count? |

### Observations — highest canary visible, two runs per cell

| arm | 2.1.237 | 2.1.238 | 2.1.241 |
|---|---|---|---|
| `ascii` | 196 / 196 | 196 / 196 | 196 / 196 |
| `crlf` | 195 / 195 | 195 / 195 | 195 / 195 |
| `wide2000` | 012 / 012 | 012 / 012 | 012 / 012 |
| `astral` | 103 / 103 | 103 / 103 | 103 / 103 |
| `cjk` | — | — | 196 / 196 |
| `ascii200` | — | — | 124 / 124 |
| `lines300` | — | — | 200 / 200 |

**30 probes in this table, of which 24 form the three-version matrix** (the four arms run on all
three versions); two runs per cell, zero disagreement anywhere. Auto-memory does load under
`claude -p` on all three versions.

### Verdicts

> **Verdicts 1–6 were all revised on 2026-08-25 — read the Addendum §1 before
> quoting any of them.** The observations below stand exactly as recorded; what changed is the
> confidence attachable to them, because every cell but `fenced` is reproducible by arithmetic
> over documented constants.

| # | Claim | Verdict | Evidence |
|---|---|---|---|
| 1 | The cap counts UTF-16 code units | **CONFIRMED** → *downgraded, Addendum §1* | `cjk` cuts at the same line as `ascii` while carrying 2.81x the UTF-8 bytes, so not bytes. `astral` cuts at 103 against `ascii`'s 196 — ratio 1.903 against a UTF-16-per-line ratio of 242/127 = 1.906 — while holding the same code-point count as `cjk`, so not code points. |
| 2 | The size cap is ~25,000 | **BRACKETED** to [24,958, 25,018) → *downgraded, Addendum §1* | Kept-prefix lengths for N whole lines: `ascii`/`cjk` 127N−1, `ascii200` 201N−1, `astral` 242N−1, `crlf` 128N−2. Intersecting `L(kept) <= cap < L(kept+1)` over those four distinct widths — `ascii` and `cjk` share one — gives the bracket; 25,000 sits inside it. Counting the trailing EOL shifts it to [24,960, 25,019) — same conclusion. |
| 3 | Whichever cap binds first applies | **CONFIRMED, both directions** → *downgraded, Addendum §1* | `lines300` is 300 lines / 6,299 units and cuts at 200 — the line cap biting alone. The other six arms sit exactly AT 200 lines and over the size cap, so the line cap never bites on them and every one cuts on size. |
| 4 | **Truncation is whole-line** | **MEASURED** → *downgraded, Addendum §1* | `wide2000` settles it with a large margin: lines are 2,001 units, the cap lands deep inside line 13, and that line's canary occupies units 24,012–24,022 — comfortably under the cap. Line 13 is absent. A partial-line-kept implementation cannot produce that. |
| 5 | **Carriage returns count toward the cap** | **MEASURED** → *downgraded, Addendum §1* | `crlf` cuts one line earlier than `ascii` on identical visible content — 199 extra CR units, one line lost. A budget quoted in lines is therefore EOL-dependent. At this line width a CRLF index loses roughly one line per 128; the penalty grows as lines get shorter, since the EOL's share of the budget scales inversely with width — 2/128 against 1/127 at 126 code points, but 2/22 against 1/21 at 20. |
| 6 | The boundary changed between releases | **REFUTED** → *weakened to "no change detected", Addendum §1* | Identical results on all three, byte-identical fixtures (sha256-checked before probing). Scope note: the external Linux replication reports `ccd-cli 2.1.237` while this run used the official Claude Code 2.1.237 build; if those are not the same artifact, "same version" is carrying more weight than it should. |

### What the skills ship, checked against this run

The dual-cap block that `manage-memory` and `verify-memory-integrity` now carry reports the first
line dropped as the first line whose cumulative UTF-16 size exceeds 25,000, measured over the
content that actually loads — YAML frontmatter and block-level HTML comments are stripped before
the index is loaded and excluded from both limits, so a block that measured the raw file would
over-report. None of the seven fixtures carries either, so the strip does not affect these
predictions; it was added after a fleet measurement over-reported one real store by 1.7 points of
cap. Run against these seven fixtures the block predicts every measured cut:

| arm | block predicts first dropped | implied last visible | measured |
|---|---:|---:|---:|
| `ascii` | 197 | 196 | 196 |
| `cjk` | 197 | 196 | 196 |
| `astral` | 104 | 103 | 103 |
| `ascii200` | 125 | 124 | 124 |
| `wide2000` | 13 | 12 | 12 |
| `lines300` | 201 (line-bound) | 200 | 200 |
| `crlf` | 196 | 195 | 195 |

Seven for seven, including the arm where the line cap binds instead. That comparison is pinned in
`scripts/test/memory-blocks.test.js`, which extracts the block from the SKILL.md and runs it, so a
future edit that breaks the arithmetic fails a test rather than shipping as prose.

**A precision limit that comes with it, stated because the test will be cited.** The block
hardcodes 25,000, while this run only bounds the cap to a 60-unit window. For these seven arms the
difference is immaterial — every arm's line boundaries fall far outside the window. For a line
width that places a cumulative boundary *inside* [24,958, 25,018), the block's prediction is
uncertain by one line and nothing here settles it. Seven-for-seven is evidence that the block's
model is right, not that its constant is exact.

### Follow-up arm: does the strip reach inside a fenced code block?

Run after the first eight arms, because a skill review found the shipped block taking an unmeasured
side of this fork. Documented: frontmatter and block-level HTML comments are stripped before load
and excluded from the limits. Not documented: whether a comment inside a fenced code block survives
that strip — and the nearest documented behavior, for `CLAUDE.md` rather than `MEMORY.md`, says
comments inside code blocks are preserved.

Three arms of 150 canary lines at 201 units each. The geometry is the point: at 150 lines no arm can
reach the 200-line cap even with 17 comment lines prepended, so only the size cap can move the cut.
A taller fixture would let the line cap fire in the comment-counted case and give the right answer
by the wrong mechanism.

| arm | comment | if stripped | if counted | measured (2 runs) |
|---|---|---:|---:|---:|
| `ctrl` | none | 124 | 124 | **124** |
| `bare` | 3,024 units, unfenced | 124 | 109 | **124** |
| `fenced` | same bytes, inside a ```text fence | 124 | ~109 | **109** |

**An unfenced block comment is stripped and excluded, as documented. A comment inside a fence is
preserved and counted.** One comment cost 15 lines of index.

The shipped block was fixed to track fence state and strip only outside fences; it now reproduces
all three arms. Stripping both — what it did before — under-reports, which is the dangerous
direction: it reports headroom on an index that is already losing its tail. The skill had shipped
this as a labelled unmeasured boundary, so the label was right and the code was wrong.

Boundaries: 2.1.241 only, linux-x64, `claude -p`, and ```text is the only fence tag exercised.

**The tag boundary is retired (2026-08-25, #721).** Replicated on 2.1.245 across `text`, `yaml`,
`bash`, `json` **and untagged**: all five return 109 with all 15 comment lines present in context,
and `bare` returns 124 with none. The info string does not change the answer, and an untagged fence
behaves as a fence — which is the case this repository's own default-deny i18n fence rule turns on.
See [`2026-08-25-fence-strip-replication/RESULT.md`](../2026-08-25-fence-strip-replication/RESULT.md).
Fixture directories removed afterwards — note they collect session transcripts as well as the
`memory/` subdirectory, so removing only the index leaves the slug behind.

### Where the external table and this run disagree

The external report gives the last loaded line as 197 (`ascii`, `cjk`) and 99 (`astral`); this run
measures 196 and 103. The unit finding those rows support is unaffected — it rests on the byte and
unit totals, which reproduce here exactly — but the boundary column does not reproduce on
**linux-x64 official builds of either cited version**. The qualifier is load-bearing: the external
2.1.238 result is native Windows, this run is Linux only, and the external Linux replication reports
`ccd-cli 2.1.237` rather than the official build used here. (The totals reproduce exactly for the ASCII and CJK rows. The
astral row does not: its stated totals require 126 astral code points per line with the canary
prefix counted nowhere, which is why that fixture could not be rebuilt here.)

One observation, offered as inference and not as proof: all three externally reported values equal
`ceil(25000 / units-per-line)`, where every value measured here is the floor.

| row | UTF-16 total | units/line | 25000 / units-per-line | ceil | floor | reported | measured here |
|---|---:|---:|---:|---:|---:|---:|---:|
| ASCII (external fixture) | 25,399 | 126.995 | 196.858 | 197 | 196 | 197 | 196 |
| CJK (external fixture) | 25,399 | 126.995 | 196.858 | 197 | 196 | 197 | 196 |
| astral (external fixture) | 50,599 | 252.995 | 98.816 | 99 | 98 | 99 | — not reproducible |
| astral (this run's fixture) | 48,399 | 241.995 | 103.310 | 104 | 103 | — | **103** |

The last row is the one that carries the argument: on a fixture under this run's control, the
measurement is the floor and not the ceil. The external astral row is listed with its own totals
rather than against this run's 103, because those are two different files and comparing them would
make the pattern look broken exactly where it is strongest.

A three-for-three fit to `ceil` is consistent with that column being computed from the cap rather
than read out of a model, which would also explain why the external `astral` fixture could not be
reconstructed from its stated totals (126 astral code points per line leaves no room for the canary
prefix). It is one hypothesis that survives after the version hypothesis was eliminated on both
cited versions; the way to settle it is the generator and the raw model replies, not the table.

**The direction matters.** The discrepancy is one line in the unsafe direction: a reader budgeting
from `ceil` believes one more line survives than does.

### Store identity — a slug transformation that changed

Measured on the same machine, both directions:

- **Read side**: with a different canary planted in each candidate slug directory for a project
  path containing `_`, the session loaded the hyphen-converted one.
- **Create side**: with both candidates deleted, the harness recreated exactly one — the
  hyphen-converted form.

`~/.claude/projects/` holds both forms for two real paths. The transformation itself is directly
measured on 2.1.241; its **date** is weaker evidence — the latest underscore-form mtime is
2026-03-22 and the earliest converted-form mtime is 2026-04-16, so the change falls in that window
*if no unrelated write moved either timestamp*. Directory mtimes move whenever contents change,
which makes this a plausible bracket rather than a measurement. What sits under the pre-flip slugs, counted directly:

| ghost store | contents | bytes |
|---|---|---:|
| `…-<project_a>/memory/` | `MEMORY.md` plus 2 topic files | 2,100 |
| `…-<project_b>/memory/` | 1 topic file, no index at all | 675 |

The slugs are elided: both are real private project identifiers, and the underscore is the only
part of them that carries the mechanism.

Three topic files and one orphaned index, 2,775 bytes. The first is not a stub: its converted-form
sibling holds 86 topic files under a 102-line index, so that store was in real use before it became
unreachable. Nothing will read the ghost again, and from inside a session that is indistinguishable
from "no such memory was ever written". Two project paths differing only by `_` versus `-` now also
collide onto one store.

This is the same false-negative class as an orphaned topic file, arriving one layer lower down, and
it is why `verify-memory-integrity` reports the resolved store path it measured rather than
assuming it.

### Boundaries

- One machine, linux-x64 builds, `claude -p` only. A Windows-specific boundary is not testable from
  here; CRLF — the obvious Windows-specific mechanism — moves the cut in the *other* direction.
- The instrument is the model's own report of what it can see, not a captured wire trace. Two runs
  per cell agreed everywhere, which bounds flakiness, not systematic error.

  **Retired 2026-08-25.** A captured wire trace now exists (#722, #721) and reads the loaded prefix
  out of the request body instead of out of an answer. Where the two instruments overlap they agree
  exactly — `ctrl`/`bare` at 124, `fenced` at 109 — so the systematic error this boundary warned
  about did not materialise in the cut itself. The systematic error that *did* exist was elsewhere,
  and is the subject of Addendum §1: the arms could not distinguish reading from reconstructing.
- The cap bracket is a bound from four distinct line widths across seven arms, not a read constant. A fifth width would
  narrow it.
- `~/.claude.json` was copied before invoking the older binaries in case a downgrade migrated
  state; it did not — no keys added or removed, and the five that changed are per-session activity
  counters.
- Every fixture directory created under `~/.claude/projects/` was removed afterwards, and the
  machine's real indexes were untouched throughout.

### Side finding: a probe fixture is indistinguishable from a real memory store

Each arm creates a real directory under `~/.claude/projects/<slug>/memory/` holding a real
`MEMORY.md`. Nothing marks it as synthetic. While this run was live, an independent inventory of
memory stores on the same machine counted 47 of them and had to discard 4 by name — the fixtures —
to get a true figure of 43.

That matters beyond tidiness, because it is the same failure this issue is about pointed the other
way: an orphan is a store the tooling cannot see, and a fixture is a non-store the tooling counts.

The fixture is one of several store-shaped things a walk of `~/.claude/projects/` meets, and most
of them should not be counted — each for a different reason. Counted on this machine after the
probe was cleaned up, as a **partition** of the 53 slug directories, since the first version of
this table let the classes overlap and its column summed past the population:

| shape | count | count it as a store? |
|---|---:|---|
| live store — `memory/` with an index | **42** | yes |
| pre-flip ghost **with** an index | 1 | no — unreachable; it is inside the 43 below |
| pre-flip ghost **without** an index | 1 | no — same, and it has no catalog either |
| `memory/` with no `MEMORY.md`, not a ghost | 1 | as a store with no catalog, which is its own finding |
| no `memory/` at all | 8 | no |
| **total slug directories** | **53** | |

Two derived figures, and they are not classes: **45** directories have a `memory/` (42 + 2 ghosts +
1 catalog-less), and **43** have an index (42 + the ghost that has one). One `memory.bak-…`
directory sits *inside* a live store rather than beside it as its own slug, so it is not in the
partition at all; the probe fixtures were their own slug directories and are gone.

Every one of 53 / 45 / 43 / 42 is defensible and they are all different, which is the hazard: a
figure quoted without saying which one it counted is unfalsifiable. This table asserted that in its
own text while getting it wrong — 43 + 2 + 2 + 1 exceeds the population it was drawn from. The same trap appeared one layer down while writing this — a
store reported as holding 91 files against 86, the difference being an `archive/` subdirectory the
harness never loads. The root-level count is the one that describes what loads.

**A mechanical detector for the ghost class**: on 2.1.241 the harness never emits a slug containing
`_`, so "slug contains `_`" has no false positives for it. It does not catch the general case — a
project that was renamed or moved leaves an equally unreachable store under a slug with no
underscore in it — which needs the weaker test "the slug does not round-trip to an existing path".

**A hazard for anyone tempted to repair this automatically**: the ghost's index is 226 bytes and
its live twin's is 102 lines. A merge that copies the ghost over the twin destroys 90 pointers. A
merge here has to be a link-set union, and reviewed rather than automatic.

Any tool that inventories memory stores, including `verify-memory-integrity`, reports over a
directory anyone can write into, and should report the store paths it counted rather than only the
total. Remove fixtures when a probe ends; verify the removal rather than assuming it.

### What this run does NOT claim

No statement here rests on inspecting a Claude Code build. The publishable claim is
"measurement shows the cap counts UTF-16 code units", version-stamped, and it stands on the
observations above alone. Identifiers, offsets and code shape from a shipped binary are
undocumented internals that rotate every release and do not belong in a public artifact.

---

## Addendum, 2026-08-25 — the instrument, re-examined

Added two days after the run, not folded into the tables above. The original observations stand
as recorded; what changed is the confidence attachable to them.

### 1. Every cell in this run is reconstructible except one

Prompted by an external finding that a model's self-report about its own context is unsound in
*both* directions — it returned `NONE` for an index that behavioural probing proved had loaded,
and separately volunteered an accurate "truncated on load" elsewhere. A failure with no
consistent sign cannot be corrected for.

Applying the obvious test to this run's own data — is the reported answer computable from the
documented cap and the fixture's own line width, without reading anything?

| arm | units/line | `floor(25000/u)` | measured | |
|---|---:|---:|---:|---|
| `ascii` | 126.995 | 196 | 196 | reconstructible |
| `cjk` | 126.995 | 196 | 196 | reconstructible |
| `crlf` | 127.990 | 195 | 195 | reconstructible |
| `astral` | 241.995 | 103 | 103 | reconstructible |
| `ascii200` | 200.995 | 124 | 124 | reconstructible |
| `wide2000` | 2000.995 | 12 | 12 | reconstructible |
| `ctrl` | 201.000 | 124 | 124 | reconstructible |
| `bare` | 201.000 | 124 | 124 | reconstructible |
| `lines300` | 21.000 | 200 (line cap) | 200 | reconstructible |
| **`fenced`** | 201.000 | 124 | **109** | **see below** |

**Every arm but `fenced` returns exactly `min(floor(25000 / units-per-line), 200)`** — the
size cut, clamped by the documented line cap. The clamp matters for `lines300`, whose raw size
cut is 1,190; an earlier revision of this table omitted that row and stated the formula without
it, which made the sentence false for the one arm that breaks it.

**The claim this supports, stated carefully, because an earlier revision overstated it.** It is
*not* that a model which never read the index produces this table — computing the prediction
needs the line width in UTF-16 units, and nothing but the index carries that. It is that **a
model which read the index and never attended to where it was cut produces the same table**, by
arithmetic over a width it can see. The probe asks for the highest visible canary and
`CANARY-NNN` sits on numbered lines, so reported-what-I-saw and computed-from-constants yield
the identical number. The arm cannot separate them. That is the confound, and it is enough.

**Superseded in the operator's favour on 2026-08-25 — the cap did not have to come from
documentation either.** The paragraph above concedes that reconstruction needs *one* input from
outside the model's own arithmetic: the line width, which only the index carries. It assumed the
other input, the cap itself, reaches the model from documentation outside the run. A wire capture
of the request body — not a question put to the model — shows that it does not:

**Scope, before the strings: this was captured on 2.1.245, and the arms below ran on 2.1.237,
2.1.238, 2.1.241 and (tonydzi) 2.1.201.** Whether those builds injected the notice at all, let
alone with the `limit:` figure the answer-key arithmetic needs, was **not measured**. A
third-party report of the `Only part of it was loaded` string at `tools_offered: 0` supports its
*existence* on an earlier build but does not carry the limit figure, and its build is unstated.
So the strengthening below is an INFERENCE across builds, not a measurement of this run. If the
notice turns out to be absent on 2.1.237–241, the #717 downgrades stand unchanged on their
original argument and only this strengthening lapses — the error direction is safe either way.

```
> WARNING: MEMORY.md is 29.4KB (limit: 24.4KB) — index entries are too long. Only part of it was loaded. …
> WARNING: MEMORY.md is 300 lines (limit: 200). Only part of it was loaded. …
```

The harness appends one of these **inside the same `<system-reminder>` as the index**, at read time,
in a session with no file tools. If it did so on the builds above, then every over-cap arm here
carried its own answer key: the cap stated in the notice, the width visible in the index, and
`floor(24.4 × 1024 / 201) = 124` — which is the cut measured for the 201-unit arms `ctrl`, `bare`
and `ascii200`. **Not `fenced`**, whose measured 109 is the one cell this arithmetic does not
reach, and which is why it remains the least reconstructible in the run.

Two caveats on "the width visible in the index", both of which narrow the claim rather than
overturn it. For the ASCII arms the width is directly countable. For `cjk`, `astral`, `crlf` and
`emoji` it must be counted in **UTF-16 units** — a third input, and one this corpus discovered
rather than read anywhere, so those arms are not reconstructible from the prompt alone by a model
without that rule. (The notice's own total is self-calibrating enough to recover it in principle —
a bytes reading implies fewer lines than are visibly present — but nothing here measures whether
that happens.)

`lines300` is the starkest case and needs none of that: its notice reads `is 300 lines
(limit: 200)`, so the answer `200` was a literal in its own prompt.

This makes reconstruction **cheaper** than this section claims, so it strengthens every downgrade
below rather than softening one. Full method, both verbatim strings, the delivery path and the
limits of the finding: [`2026-08-25-truncation-notice-probe/RESULT.md`](../2026-08-25-truncation-notice-probe/RESULT.md) (#722).

**Consequence for the Verdicts table above.** Verdicts 1, 4 and 5 are downgraded from
CONFIRMED/MEASURED to **consistent-with, and refuting the naive alternatives**. That is not
nothing: a model reconstructing from the *documented* figure — 25KB, bytes — gives `cjk` ≈ 70,
not 196; code-points gives `astral` 196, not 103; a CR-blind rule gives `crlf` 196, not 195.
Each of those three cells is wrong under a plausible wrong model and right under the true one.
What the arms cannot do is exclude a model that already holds the correct rule.

`fenced` is the closest thing to an exception, and it is weaker than an earlier revision of this
addendum claimed. `ctrl` and `fenced` share a geometry, so a reconstruction from the cap and the
width alone predicts 124 for both, and 109 is not on that path.

But a second path exists. The documentation states that comments inside code blocks are preserved
— for `CLAUDE.md`, not `MEMORY.md`, which is exactly the fork this arm was built to resolve. A
model transferring that rule and counting the block's 3,036 units also predicts
`floor((25000 - 3036) / 201) = 109`. That path needs the comment's size, so it needs reading, and
it needs the rule transferred across a file type the docs do not cover — materially harder than
dividing two constants, but not nothing.

So `fenced` discriminates *strip-belief from preserve-belief*. It discriminates *harness behaviour
from model belief* only on the assumption that the transfer did not happen. "Well-designed by
accident" was an overclaim; "the least reconstructible cell in the run" is the honest description,
and the fence-state repair to the shipped skill block rests on this one cell.

**Verdicts 2, 3 and 6 are downgraded too**, which an earlier revision of this addendum failed to
do while applying the same standard to an external party's bracket. They rest on the same cells:

- **Verdict 2** builds `[24,958, 25,018)` from whole-line kept-prefix arithmetic over four
  reconstructible cells — reconstructible *and* whole-line-dependent, precisely the combination
  criticised elsewhere in this document. §2's `[24999, 25023)` is therefore this run's only sound
  bracket, and verdict 2 should not be quoted beside it as though the two were peers.
- **Verdict 3** rests on `lines300`, whose answer is the documented 200-line cap — and which #722
  showed was additionally handed that number verbatim, as `(limit: 200)` in its own prompt.
- **Verdict 6** is the sharpest: an instrument that reconstructs is *insensitive to a boundary
  change*, so identical tables across three versions cannot refute one. It weakens from REFUTED to
  **no change detected, by an instrument not shown sensitive to change.**

And the shipped skill block inherits whole-line semantics from verdict 4 — "the first line dropped
is the first whose cumulative size exceeds the cap." That dependency is flagged here for the same
reason it is flagged against the external bracket.

**The rule this yields:** an arm is informative only where reading and reconstructing predict
*different* numbers. State the reconstruction-predicted value beside every measurement.

### 2. A behavioural re-measurement, 2.1.245

Invented-token needles carrying facts rather than labels, right-aligned to the line end, three
trials each, tools asserted zero behaviourally via a disk-only decoy — read that as "no
file-reading tool was offered", not literally zero: these arms ran on 2.1.245 on this machine,
the exact configuration where a wire capture later showed one server-side `advisor` tool still
present (see the Method correction above, #722). Five fixtures at 136–251
units per line:

```
cap >= 24999      line 125 of a 200-units/line fixture read      (digits at 24996..24999)
cap <  25023      line 184 of a 136-units/line fixture unread    (digits at 25023)
```

**Sound behavioural bracket `[24999, 25023)`** — 24 units, no truncation model assumed. 25,000
sits at the bottom of it and is the only round number in it. The `[24973, 25012)` figure
circulating externally is echo-derived at both ends (`34 + 153×163` and `148×169`) and is not
intersectable with this without assuming the instrument in question.

Two hazards found while doing it, both about classification rather than the cap:

- An absent needle does **not** reliably return `UNKNOWN` — it may enumerate what it does hold,
  or emit an unexecuted tool-call block as text. Classifying on the `UNKNOWN` token discards
  true negatives.
- An absent needle returns a **fabricated value** about 2% of the time (1 of 51), once with a
  justification attached — a wrong number offered together with "it was in the portion that got
  truncated". Classifying on "returned a number" scores that as present.

**Classify on presence of the exact planted value, nothing else.**

### 3. Corrections to this document and to the probes

- **The sentence under the fenced-comment arm stating that fixture slug directories "collect
  session transcripts as well as the `memory/` subdirectory" is UNSUPPORTED for this run.** The
  cleanup ends in `d.rmdir()`, which raises on a non-empty directory, and the fixtures are gone
  — so either no transcript was present at cleanup time, or removal was manual and unrecorded.
  **The run log was not preserved, so this record cannot distinguish those.** That is a
  record-keeping defect, not an observation; the probes now preserve their cleanup output.
- `fenced-comment-probe.py` verified its own cleanup with `glob("*f2probe*")` against
  `$HOME/.claude/projects` while its root came from `sys.argv[1]` — run with any other root it
  reported `fixture dirs remaining: 0` having examined nothing. A check that cannot see its
  target, which is the same shape as the thing it was checking for. Fixed to derive the pattern
  from the root.
- Both generators hand-roll the project-slug transform, whose own history this document records
  as having *changed*. `CLAUDE_CODE_PROJECT_DIR_NAME` removes the guess; adopting it is filed as
  #720, together with the cleanup's non-fail-closed `KEPT` path.

### 4. `capgeom.py` — the arithmetic, once, checkable

Every figure above had been re-derived by hand in throwaway scripts, and two of the resulting
claims were wrong: a bracket end credited to the wrong party's fixture, and a ratio quoted
against a denominator counted by eye. Both are now computed from a registry rather than prose.

```bash
python3 tools/capgeom.py --verify   # re-derive every published figure, assert, print counts
python3 tools/capgeom.py --span 163 153 --header 34
```

`--verify` exits non-zero if any published number stops following from its recorded arm. It
earned that on first run by rejecting an entry of its own: the `[24973, …]` floor is the LF
position of tonydzi's canary 163, not its last readable character, so **both ends of that
bracket assume whole-line truncation** on top of being reconstructible — a model whose only
support here is the `wide2000` arm, which §1 above shows is reconstructible too. The behavioural
bounds are stated at CONTENT positions and carry no such dependency.

It lives in `tools/` — reusable utilities meant to be run by a person across sessions, as
distinct from `scripts/`, which is the repository's own CI machinery. See `tools/README.md`.
