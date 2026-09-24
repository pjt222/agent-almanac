# Comment for `anthropics/claude-code#82056`

**Status: POSTED 2026-08-25 as
[comment 5412833938](https://github.com/anthropics/claude-code/issues/82056#issuecomment-5412833938).**

The posted text differs from the draft below: it was rewritten after
[DanceNitra's reply](https://github.com/anthropics/claude-code/issues/82056#issuecomment-5411236356),
which retracted four echo-derived cells and the `[24955, 25012)` ceiling to the reconstruction
ruler, kept `198` on a shuffled-label arm, and **replicated this run's floor on Windows**
(`cap >= 24,999`, a third platform). The posted version adds the point that the shuffled-label arm
is immune to the notice finding — the cap gives you a line NUMBER, and that arm's answer is a
label only reading yields — which the draft below does not make.

**Two scoping corrections are owed on the posted text**, both raised by an adversarial review
after it went out, and both narrowing rather than retracting:

1. The capture is 2.1.245. The thread's brackets rest on arms from 2.1.201–2.1.241, where the
   notice's presence and wording are unmeasured.
2. The fixtures are all-ASCII, so the KB figure's NUMERATOR is unmeasured — `bytes/1024` and
   `units/1024` are indistinguishable on them. That decides whether the answer-key arithmetic
   reaches `cjk`, `astral` and `emoji`, which are precisely the thread's non-ASCII arms.

---

## Draft as first written, before the reply (kept for the record)

The premise under every bracket in this thread — mine, and I think all three of the others — is
that a session has to *derive* where its index was cut. It doesn't. **The harness states the cap
in the prompt.**

I stopped asking the model anything and captured the request body instead: `ANTHROPIC_BASE_URL`
pointed at a local server that records the POST and answers with a canned SSE reply. Three
fixtures on 2.1.245, linux-x64, `claude -p`, no file tools, no `Edit` anywhere in the session.

## The two strings

Present in an over-cap capture, absent from an under-cap one, appended **inside the same
`<system-reminder>` as the index itself**, immediately after the already-truncated content:

```
> WARNING: MEMORY.md is 29.4KB (limit: 24.4KB) — index entries are too long. Only part of it was loaded. Keep index entries to one line under ~200 chars; move detail into topic files.
```

```
> WARNING: MEMORY.md is 300 lines (limit: 200). Only part of it was loaded. Keep index entries to one line under ~200 chars; move detail into topic files.
```

Inline text in `messages[0].content[0].text` — not a hook attachment, not a separate block. This
is the read-time sibling of the `approaching the N-line read limit` advisories, which fire on
`PostToolUse:Edit`; it needs no tool call and no edit. It also confirms the `Only part of it was
loaded` string reported here at `tools_offered: 0`, and supplies the rest of it.

## Why this matters more than it looks

My earlier comment argued that a canary-echo arm can't separate *read* from *computed*, but
conceded that computing needs one input from outside — the line width, which only the index
carries — and assumed the cap arrived from documentation.

It doesn't. It's in the prompt. So an over-cap arm hands the model **both** constants:

```
told:  limit: 24.4KB
seen:  201-unit lines
       floor(24.4 × 1024 / 201) = 124
```

124 is exactly what the wire shows was kept (lines 1–124 of a 150-line fixture). No
documentation, no prior knowledge of Claude Code, nothing but arithmetic over text in front of
it.

The line-cap arm is starker still. Its notice reads `is 300 lines (limit: 200)`, and the answer
is `200`. There is nothing to reconstruct — the number is a literal in its own prompt.

## What it does not change

- **The behavioural bracket stands.** `24.4KB` rounds, so it brackets the cap only to
  `[24934.4, 25036.8)` — 102 units, four times *wider* than the `[24999, 25023)` I posted from
  invented-token fixtures. It names the cap without measuring it, so please don't intersect it
  with anything; it's the harness describing its own constant, which is a documentation channel.
  Worth noting only that 25,000 sits inside both.
- **It says nothing about whether the model reads the notice.** Presence in context is not use,
  and I think this is the clean explanation for why self-report here has had no consistent sign:
  the information is always there, and attending to it is optional. That still can't be settled
  by asking.
- **One build, one platform.** 2.1.245 on WSL2/Ubuntu. I can't speak for Windows or macOS, and
  the notice text is exactly the kind of thing that gets reworded.

## The methodological bit

Reading the wire isn't subject to the reconstruction ruler at all — bytes that were *sent* can't
be confused with bytes that were *computed* — so it's a strictly stronger instrument than
anything I've posted here before, and it's cheap. If anyone wants to check the strings on another
platform, the capture tool and the fixture generator are both in the writeup and are
dependency-free Python.

One correction to my own method while I'm here: `--tools ""` is **not** tool-zero. The capture
shows one tool still offered — a server-side `advisor` tool enabled by `advisorModel` in
`settings.json`. `--tools` filters client tools only, and `--strict-mcp-config` doesn't touch it.
It can't read a file off disk so it doesn't affect the disk-read failure that flag exists to
prevent, but "tools asserted zero" was machine-dependent and I'd stated it flatly. Reading the
`tools` array out of the captured request is the honest assertion.
