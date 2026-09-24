## Run: 2026-08-25-truncation-notice-probe

**Observer**: Claude (Opus 5, one Claude Code session on one machine) | **Issue**: #722 | **Relates**: #407, #717, #720, `anthropics/claude-code#82056`

### Objective

#717 downgraded every verdict in the [2026-08-23 memory-cap run](../2026-08-23-memory-cap-truncation-probe/RESULT.md)
on one argument: the reported answer in almost every arm equals `min(floor(25000 / units-per-line), 200)`,
so the probe cannot separate *reported where the index was cut* from *computed the same number by
arithmetic*.

That argument carried an untested premise. It assumed the model must **derive** the boundary — that
the cap constant reaches it from documentation, outside the measurement. If the harness instead
injects a truncation notice naming the cut, the line count or the byte total, then the boundary is
simply *told*, reconstruction costs nothing, and the confound is worse than the addendum states.

This run settles it. **A notice exists, in two variants, and it names the limit.**

### The read-out is the wire, not the model

#717 established that a session's self-report about its own context is unsound in **both**
directions — `NONE` for an index that behavioural probing proved had loaded, and elsewhere an
accurate unprompted "truncated on load". A failure with no consistent sign cannot be corrected for,
so no question of the form "did you see a notice?" can answer this.

So nothing here asks the model anything. The outbound request body is captured with
[`tools/wirecap.py`](../../../tools/wirecap.py) — `ANTHROPIC_BASE_URL` points at a local server that
records the POST body and answers with a canned, well-formed SSE reply. The captured body is the
entire context the client assembled. **The model's answer is not an input to any conclusion below**,
and the reconstruction ruler therefore does not apply to this instrument at all: reading bytes that
were sent cannot be confused with computing them.

Nothing is forwarded anywhere — the request is answered locally. Credential headers are redacted at
capture time and never written to disk (`wirecap.py --verify` asserts this, including that a planted
secret does not reach the file).

### Environment

| Field | Value |
|---|---|
| Binary | Claude Code **2.1.245** via the `claude` launcher (`/home/phtho/.local/bin/claude`) |
| Platform | Ubuntu 24.04.4 LTS on WSL2, kernel 6.18.33.2-microsoft-standard-WSL2, x86_64 |
| Session type | `claude -p` (print mode), `--tools "" --strict-mcp-config`, prompt on stdin |
| Model named in request | `claude-opus-5` |
| Fixture filesystem | ext4 under `$HOME` — not the `/mnt/d` NTFS mount |
| Date | 2026-08-25 |

**One build, one platform, one OS.** A Windows or macOS notice string cannot be confirmed or refuted
from here, and neither can a different build's.

### Method

Three fixtures, each 200-char or 20-char ASCII lines carrying a unique `CANARY-NNN` token, written as
bytes. Generator: [`notice-probe.py`](notice-probe.py) in this directory.

| arm | lines | chars/line | UTF-16 units | over which cap |
|---|---:|---:|---:|---|
| `under` | 100 | 200 | 20,099 | neither — the control |
| `over` | 150 | 200 | 30,149 | size |
| `lines` | 300 | 20 | 6,299 | line count only |

`under` is a strict **line-prefix** of `over` — the line text depends only on the line's own index —
so every line of `under` also occurs in `over`.

**The residual set is not purely canaries-plus-notice, and the first draft of this section said it
was.** The two arms ran in different directories, so the only-in-A set also contains per-session
and per-store noise. Measured, it was 29 lines, of which four are that noise:

| only in A | what it is |
|---|---|
| 24 × `CANARY-101…124` | the lines `under` does not have |
| ` - Primary working directory: …/over` | differs by arm |
| `Contents of <store-slug>/memory/MEMORY.md …` | differs by arm |
| `You have a persistent file-based memory at …` | embeds the store path |
| `{"device_id":…,"session_id":…}` | differs per session |
| **the WARNING line** | **the finding** |

So the identification is: strip the canaries, strip the four lines that name a path or a session,
and one line remains. That is a judgement over a small residual, not the logical guarantee
"whatever else is in that set is the notice" claimed. It still needs **no advance guess at the
wording**, which is the point of differencing rather than grepping for a string someone reported
elsewhere — but the honest version is "a five-line residual a human reads", not "exactly one line".

Running both arms sequentially in the SAME directory, varying only `MEMORY.md`, would make the
exact-set claim nearly true by construction. Worth doing if this is repeated.

Prompts were deliberately unrelated to memory (`Reply with the single word OK.`, `What is 2+2?`).

#### The store path is discovered, never computed

Both generators in the 2026-08-23 run hand-roll the project-slug transform, whose history that
document records as having *changed* (#720). This one does not guess it: it runs a throwaway session
in the arm directory, observes which `~/.claude/projects/` entry appears, and fails closed if none
does.

**That was not caution for its own sake — a computed slug would have been wrong.** The observed
directory was `-home-<user>--claude-jobs-…`: the `.` of `.claude` maps to `-`, giving a doubled dash.
`memcap-fixture.py`'s hand-rolled `slug()` implements `/`→`-` and `_`→`-` and **not** `.`→`-`, so it
would have written all three fixtures to paths nothing reads, and all three arms would have reported
no memory index at all. Concrete support for #720, found by following it.

### Observations

#### 1. The cut, measured on the wire

Highest `CANARY-NNN` present in the captured request body:

| arm | fixture lines | on the wire | predicted | |
|---|---:|---:|---:|---|
| `under` | 100 | 100 | — | complete, no cut |
| `over` | 150 | **124** | `floor(25000/201) = 124` | cut |
| `lines` | 300 | **200** | `min(300, 200) = 200` | cut |

Whole lines throughout — no partial line appears in any capture.

This is the first cut measurement in this corpus taken from bytes rather than from an answer. It
agrees with the behavioural arms exactly, which is a point in the earlier run's favour: the
instrument was confounded, not wrong.

#### 2. A notice exists. Two variants, verbatim

Present in the `over` capture and **absent from the `under` capture**:

```
> WARNING: MEMORY.md is 29.4KB (limit: 24.4KB) — index entries are too long. Only part of it was loaded. Keep index entries to one line under ~200 chars; move detail into topic files.
```

Present in the `lines` capture:

```
> WARNING: MEMORY.md is 300 lines (limit: 200). Only part of it was loaded. Keep index entries to one line under ~200 chars; move detail into topic files.
```

183 and 154 characters respectively. The size variant carries an em-dash and the clause `index
entries are too long`; the line variant has neither. Both share the tail from `Only part of it was
loaded.` onward.

The `over` arm was run twice, with different prompts, and reproduced the string and the cut exactly.

#### 3. Delivery mechanism

Not a hook, and not a separate content block. The notice is **inline text inside the first user
message** — `body.messages[0].content[0].text` — within the `<system-reminder>` block that carries
the memory index, appended immediately after the (already truncated) index and before the
`# userEmail` section:

```
Contents of <store>/memory/MEMORY.md (user's auto-memory, persists across conversations):

<... index, truncated ...>

> WARNING: MEMORY.md is 29.4KB (limit: 24.4KB) — …
# userEmail
…
      IMPORTANT: this context may or may not be relevant to your tasks. …
</system-reminder>
```

This confirms the third-party report of an `Only part of it was loaded` string at `tools_offered: 0`
referenced in #722, and supplies the full string and the delivery path it lacked. It is a **read**-time
injection: the session ran no `Edit` — it had no file tools at all — so it is a different family from
the `approaching the N-line read limit` advisories, which fire on `PostToolUse:Edit` and arrive as
`hook_additional_context`.

#### 4. The notice reports the WHOLE file, not the loaded part

`29.4KB` is the full 30,149-unit fixture (`30149/1024 = 29.44`). The loaded 124 lines are 24,923
units = 24.3KB. So the notice tells the reader both what was offered and what the ceiling is — and
by subtraction, roughly how much went missing.

The **divisor is 1024, not 1000**: `30149/1000` would display `30.1KB`.

**The numerator is not measured here, and an earlier draft of this line claimed it was.** The
fixture is all-ASCII, so UTF-8 bytes, UTF-16 units and code points are the same 30,149 number, and
`bytes/1024` predicts the identical 29.4. This arm discriminates the divisor and nothing else.

That gap matters downstream rather than here: if the harness computed the KB figure from *bytes*,
then a model doing the answer-key arithmetic on `cjk` would derive ≈65 rather than the measured
196, and the "every over-cap arm carried its own answer key" claim would hold only for the ASCII
arms. **A single CJK-line fixture separates it cheaply and was not run.**

### Verdicts

| # | Claim | Status |
|---|---|---|
| 1 | An over-cap auto-memory index produces an in-context notice at read time, in a session that ran no `Edit` | **MEASURED** — present in `over` and `lines`, absent in `under`, reproduced |
| 2 | The notice names the limit | **MEASURED** — `limit: 24.4KB` and `limit: 200` |
| 3 | The notice is precise enough to reconstruct the boundary from | **MEASURED for the line cap; MEASURED-with-rounding for the size cap** — see below |
| 4 | The notice is delivered as inline text in `messages[0]`, inside the memory `<system-reminder>` | **MEASURED** |
| 5 | The cut is whole-line | **MEASURED on the wire** — no partial line in any capture; first non-behavioural confirmation in this corpus |
| 5b | …at `floor(cap/units-per-line)`, clamped by a 200-line cap | **consistent at two widths** (201 and 21), not measured in generality — two points do not establish a formula |

#### On verdict 3, stated carefully

For the **line** cap there is nothing to reconstruct: the notice names `300` and `200` outright.

For the **size** cap the figure is rounded to one decimal. `24.4KB` brackets the cap to
`[24934.4, 25036.8)` — a 102.4-unit window. That is 4x wider than the behavioural bracket
`[24999, 25023)` from the 2026-08-23 addendum §2, so **it does not improve the cap estimate** and is
not intersectable with it as an independent measurement: it is the harness describing its own
constant, which is a documentation channel, not an observation of behaviour. It is worth recording
only that the two are consistent and that 25,000 lies in both.

But *bracketing the cap* is not what matters here. What matters is that a model holding
`limit: 24.4KB` and seeing 201-unit lines computes `floor(24.4 x 1024 / 201) = 124` — **the measured
cut, exactly**. The rounding is far too coarse to pin the cap and far too fine to prevent the
division from landing on the right integer.

### What this means for the 2026-08-23 corpus

The #717 addendum argued that reconstruction requires the line width, "and nothing but the index
carries that" — true, and it is why a model that never read the index cannot produce the table. The
addendum then assumed the *other* input, the cap, arrives from documentation outside the run.

**It does not. It is injected into the very context being probed, in every over-cap arm.** So:

- Every over-cap arm carried its own answer key. Both constants needed for
  `floor(cap / units-per-line)` were in the prompt: the cap stated in the notice, the width visible
  in the index. No external documentation, no prior knowledge of Claude Code, nothing but arithmetic
  over the text in front of it.
- The `lines300` arm is worse than "its answer is the documented 200-line cap" (addendum §1). Its
  notice states `is 300 lines (limit: 200)`. **The answer 200 was handed to it verbatim**, as a
  literal in its own context.
- This strengthens the downgrade of verdicts 1–6 rather than qualifying it. Nothing in the addendum
  needs walking back; §1's characterisation of what reconstruction *costs* was too generous.

The one cell it does not touch is `fenced` (109 where geometry predicts 124), which is
reconstructible only by a longer path that requires reading the block and transferring a
`CLAUDE.md` documentation rule to `MEMORY.md`. That cell's standing is unchanged.

### Side finding: `--tools ""` did not produce tool-zero

The captured request carries **one** tool in every arm:

```json
{"name": "advisor", "type": "advisor_20260301", "model": "…"}
```

`--tools ""` filters *client* tools; `advisor` is server-side, enabled by `advisorModel` in
`~/.claude/settings.json`, and neither `--tools ""` nor `--strict-mcp-config` removes it.

**Benign for this run, and the airtight reason is not the one I reached for first.** The first draft
argued that `advisor` "cannot read a file off disk" — an untested assertion about a server-side tool,
which is precisely the docstring-guarantee-nobody-ran shape this repo bans. The sound argument needs
no claim about what `advisor` can do:

**the canned SSE reply never emits a `tool_use` block, so no tool — client or server — executed in
any session in this run.** That is a property of the instrument, checkable in `wirecap.py`'s
`SSE_EVENTS`, not a belief about a tool.

One narrower caveat survives it. Tool availability *does* change the assembled request — the `tools`
array is part of it, and plausibly some system-prompt text. It cannot affect the **differential**
conclusions, since both arms share the configuration. The single-capture observations, such as where
in the block the notice sits, are therefore conditioned on a machine with `advisorModel` set.

**Not benign as a convention.** The 2026-08-23 method section and #722's own acceptance criteria both
say "tools asserted zero", and on this machine that assertion is false. It is machine-dependent: it
holds only for an operator with no `advisorModel` set. The cheap fix is to assert tool-zero from the
captured request's `tools` array — a direct reading — rather than behaviourally via a disk-only
decoy, which can only ever show that *the tools present did not read the decoy*.

### What this run does NOT claim

- **Nothing about whether the model attends to the notice.** Presence in context is not use. This run
  measures what is *sent*; it says nothing about what is read, and the inconsistent self-report the
  earlier work recorded is entirely compatible with a notice that is always present and sometimes
  ignored. That remains open and is not answerable by asking.
- **Nothing about other platforms or builds.** 2.1.245, linux-x64, WSL2, one machine. This bites
  harder than it looks: the corpus this run re-reads ran on **2.1.237, 2.1.238, 2.1.241** and
  (tonydzi) **2.1.201**. Whether those builds injected the notice, or injected it with a `limit:`
  figure, is unmeasured. The "carried its own answer key" consequence is therefore an INFERENCE
  across builds. Its failure is safe — the #717 downgrades stand on their original argument and
  only the strengthening lapses.
- **The KB numerator is unmeasured.** The fixtures are all-ASCII, where bytes, UTF-16 units and
  code points coincide, so `bytes/1024` and `units/1024` are indistinguishable here. One CJK
  fixture would settle it, and it decides whether the answer-key arithmetic reaches the non-ASCII
  arms at all.
- **No improvement to the cap bracket.** `[24999, 25023)` from the 2026-08-23 addendum §2 stands as
  the sound bracket; the notice's `24.4KB` is coarser and is not an independent behavioural
  measurement.
- **Nothing about how the harness computes the displayed KB internally.** `units/1024` is consistent
  with both observations and refutes `/1000`; it is not proof of the implementation.
- **Nothing about a store whose index is over cap for both reasons at once.** No arm combined a
  >200-line and >25,000-unit fixture, so which variant wins, or whether both print, is unmeasured.

### Reproduction

An earlier version of this block did not reproduce the run: it pointed one capture file at both the
build phase and the measurement, so the three arms' **discovery** sessions landed in the file the
diff then read. Build and measure must use different capture files.

```bash
P=tests/results/2026-08-25-truncation-notice-probe/notice-probe.py

python3 tools/wirecap.py --verify                              # self-test the instrument first

# 1. Build. Discovery traffic goes to its own file and is never diffed.
python3 tools/wirecap.py --port 8787 --out discovery.jsonl &
python3 $P --build /tmp/t722 --port 8787
#   NOTICE_PROBE_ONLY=lines python3 $P --build /tmp/t722 --port 8787   # one arm only

# 2. Measure. One server and one capture file PER ARM.
python3 tools/wirecap.py --port 8788 --out over.jsonl &
cd /tmp/t722/over && printf '%s' 'Reply with the single word OK.' \
  | ANTHROPIC_BASE_URL=http://127.0.0.1:8788 claude -p --tools "" --strict-mcp-config
#   repeat on 8789 -> under.jsonl, 8790 -> lines.jsonl

python3 tools/wirecap.py --diff over.jsonl under.jsonl
python3 $P --cleanup /tmp/t722
```

Two properties of `notice-probe.py` worth knowing before trusting a rerun. `discover_store` takes
`sorted(new)[0]` of whatever `~/.claude/projects` entries appear, so a **concurrent peer session**
creating a store during the build can be selected instead — fail-open to the wrong store. And the
cleanup cross-check below globs `*t722*`, which only matches because the disposable root was named
`…/t722`; point it at a differently-named root and the pattern sees nothing, which is the
cannot-see-its-target shape §3 of the 2026-08-23 record already documents for the other probe.

**The raw captures are not committed.** They contain `device_id`, `account_uuid`, `session_id` and
the operator's email — the request body is the whole assembled context, which is exactly what makes
the instrument useful and exactly what makes it unpublishable. Only the notice strings and the canary
counts appear above. Cleanup was verified independently of the script:
`find ~/.claude/projects -maxdepth 1 -name '*t722*'` returned 0.
