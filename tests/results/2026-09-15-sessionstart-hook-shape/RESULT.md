# The `read-continue-here` SessionStart hook has never injected anything (#844, #468 AC6)

**Date:** 2026-09-15. **Machine:** WSL2 Ubuntu 24.04, kernel 6.18.33.2-microsoft-standard-WSL2.
**Claude Code:** 2.1.272. **Probes:** the three scripts beside this file; captured output in
`probe-runs.txt`.

**Question:** version 1.0 of the skill installs a SessionStart hook that reads `CONTINUE_HERE.md`
and prints a JSON object. Does that object reach the model — and does the 2.0 rewrite reach it for
the `docs/CONTINUE_HERE.md` layout #468 was filed about?

## Method

Every arm's sentinel is `zqx` plus six bytes from `/dev/urandom`, generated at run time and never
named in the prompt. The prompt says only *"your context may contain a line that begins with
`SENTINEL=`"*. A model that answers with the value read it; it cannot compute it. Each arm builds
its own `mktemp -d` git repository with its own settings file and runs `claude -p --settings`;
nothing touches this repository or `~/.claude`.

Two of the three probes run the hook **as published** — extracted from
`skills/read-continue-here/SKILL.md` by its heredoc delimiters, never retyped — and the 1.0 arms
extract the previous text from `origin/main` the same way. What is under test is the bytes the
skill ships.

## 1. `hook-shape-probe.sh` — is it the shape?

Three synthetic hooks, identical but for the JSON they print.

| arm | hook stdout | model saw the sentinel |
|---|---|---|
| C (control) | plain text `SENTINEL=…` | **yes** |
| A (documented) | `{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"…"}}` | **yes** |
| B (**1.0 as shipped**) | `{"hookSpecificOutput":{"sessionStartContext":{"additionalContext":"…"}}}` | **no — answered NONE** |

Reproduced twice with fresh tokens. Arm C is the control: it proves a SessionStart hook on this
machine can carry a sentinel into the model at all, so arm B's negative is a property of the shape
and not of the harness.

`sessionStartContext` occurs **zero** times in Claude Code's hooks reference (fetched
2026-09-15, grepped locally rather than summarised). That document gives the shape as
`hookSpecificOutput.additionalContext` and states that stdout which starts with `{` and fails
schema validation is reported as a *non-blocking* error — the session continues and the context is
dropped. That is why nobody noticed for the life of the skill.

## 2. `hook-arms.sh` — does the 2.0 heredoc behave, across layouts?

Extracted from the SKILL.md, `bash -n` first, then run against eight fixtures. A Python validator
reads each run's stdout and answers what Claude Code would: is it JSON, and is `additionalContext`
a string directly under `hookSpecificOutput`?

| fixture | verdict |
|---|---|
| no handoff anywhere | silent, empty stdout |
| `CONTINUE_HERE.md` | OK, 28 chars |
| `docs/CONTINUE_HERE.md` | OK, 28 chars |
| `.claude/CONTINUE_HERE.md` | OK, 33 chars |
| `notes/CONTINUE_HERE.md` (unanticipated) | OK, 356 chars — the "exists elsewhere" report |
| content with `"`, `\`, tab, CRLF | OK, 54 chars — valid JSON |
| cwd two directories below the root | OK — resolves via the git toplevel |
| `jq` hidden from `PATH` | OK — the `awk` fallback escapes correctly |

**Negative arm:** the same validator fed the 1.x object answers
`NO additionalContext directly under hookSpecificOutput; keys=['sessionStartContext']`. The
validator can tell the two shapes apart, so its OK verdicts above are not vacuous.

## 3. `ac6-docs-layout.sh` — #468 AC6, end to end

> *"Verified against a project that uses `docs/CONTINUE_HERE.md`"*

Five arms, each a real headless session with the hook registered.

| arm | expectation | result |
|---|---|---|
| `docs/` layout, hook 2.0 | sentinel reaches the model | **PASS** |
| `docs/` layout, hook 1.0 | nothing injected | **PASS** (the bug) |
| root layout, hook 1.0 | nothing injected | **PASS** (the bug, at the *supported* path) |
| `notes/` layout, hook 2.0 | the stray handoff is reported | **PASS** — the model recovered it |
| `notes/` layout, hook 1.0 | nothing injected | **PASS** (control) |

The fourth arm's first matcher was wrong and is worth recording: it looked for the report's wording
in the model's answer and found the sentinel instead. The model had been told where the stray
handoff was, opened it, and answered from its contents — the outcome AC2 asks for, scored as a
failure by a matcher that was checking for the wrong thing. The fifth arm is the control that
settles it: same layout, same prompt, 1.0's silent hook, and the model answers `NONE`. The report
is load-bearing, not something the model would have found unaided.

## What this changes

- #844: 1.x's hook is a no-op at **every** path. #468 read the wrong-path case as the bug; the
  wrong-path case was one symptom of a channel that was never open.
- #468 AC2 ("distinguishes no handoff from a handoff somewhere I did not look, and says so") could
  not have been satisfied without this: the channel that carries the message was discarded.
- Anyone who installed the 1.x hook has a script that runs on every session start and does nothing.
  It cannot be migrated from this repository — the installed copy lives in the consumer's
  `~/.claude/hooks/`. The skill says so in When to Use.

## Limits

- One machine, one Claude Code version. The shape is from the current published reference; older
  versions were not tested and `sessionStartContext` may have been valid at some point in the past.
  Nothing here establishes that it ever was.
- The `elsewhere` report's usefulness is measured through one model's behaviour on one prompt. That
  it was *emitted* is mechanical (probe 2); that it was *acted on* is a single observation.
- `find -maxdepth 3` bounds the stray search. A handoff at depth 4 is reported as absent, which is
  the old failure at a greater depth rather than its removal.
