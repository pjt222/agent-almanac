---
title: "Self-Continuation Loops Playbook"
description: "Choose among ScheduleWakeup, CronCreate loops, and loop.md; select sentinels; plan for the 7-day age-out."
category: workflow
agents: []
teams: []
skills: [choose-loop-wakeup-interval, read-continue-here, write-continue-here, manage-token-budget, du-dum]
---

# Self-Continuation Loops Playbook

Claude Code exposes three overlapping mechanisms for a session to continue itself across a time gap: the `ScheduleWakeup` tool (model self-paced), `CronCreate` with `kind: "loop"` (fixed cadence), and a file-backed `loop.md` (prompt in a file). Four sentinels resolve prompt text at fire time, and a 7-day lifecycle reaps stale loops. The mechanisms interlock — dynamic loops are implemented on top of the cron system internally, file-backed loops are addressed via the sentinel resolver — but the decision of which to use at planning time is not documented in one place. This guide is that one place.

The goal is navigational: pick the right mechanism for the task, pick the right sentinel for the mechanism, plan for the age-out before you hit it, and know when not to loop at all.

## When to Use This Guide

- **Designing an autonomous loop** — you need the loop to wake itself up repeatedly without the user re-initiating.
- **Picking between `ScheduleWakeup` and a cron schedule** — you know *what* should repeat but not *how* to schedule it.
- **Planning a `loop.md` workflow** — you want an editable task list the loop reads at every tick.
- **Reviewing a long-running loop for cost or lifecycle risk** — it has been running for days and the 7-day age-out is approaching.
- **Composing within-session loops with cross-session handoff** — you already use `CONTINUE_HERE.md` for cross-session handoff and want to know how dynamic wakeups interact with that pattern.
- **Deciding not to loop** — you suspect a scheduled wakeup would be the wrong tool for the job and want the explicit "don't loop" criteria.

## Prerequisites

- A working Claude Code install with the `/loop` slash command and `ScheduleWakeup` tool available (both are behind server-side flags that ship enabled in recent versions).
- Familiarity with the [`choose-loop-wakeup-interval`](../skills/choose-loop-wakeup-interval/SKILL.md) skill — this guide cross-links into it rather than duplicating the `delaySeconds` sizing math.
- A basic understanding of cron expressions if you plan to use `CronCreate` loops directly.
- If your workflow crosses session boundaries, read [`write-continue-here`](../skills/write-continue-here/SKILL.md) and [`read-continue-here`](../skills/read-continue-here/SKILL.md) first — they complement, rather than replace, within-session loops.

## Workflow Overview

The three mechanisms and their relationship:

```
             ScheduleWakeup           CronCreate (kind: "loop")        loop.md
             (dynamic, model-paced)   (fixed cadence)                  (file-backed prompt)
                     |                         |                            |
                     v                         v                            v
             delaySeconds          cron expression              prompt text lives in a file
             chosen per tick       chosen at schedule time      read at every tick
                     |                         |                            |
                     +-------------------------+----------------------------+
                                               |
                                               v
                                 sentinel resolver at fire time
                                 -----------------------------
                                 <<autonomous-loop>>          (cron)
                                 <<autonomous-loop-dynamic>>  (ScheduleWakeup)
                                 <<loop.md>>                  (cron + file)
                                 <<loop.md-dynamic>>          (ScheduleWakeup + file)
                                               |
                                               v
                                        prompt delivered
                                               |
                                               v
                                        next turn runs
```

Internally, `ScheduleWakeup` schedules a cron-backed tick under the hood — dynamism comes from the model issuing a fresh `ScheduleWakeup` call on each wake, not from a separate scheduler. This matters for two things: the 7-day age-out applies to both, and the `CLAUDE_CODE_DISABLE_CRON` kill switch disables both.

## Mechanism Decision Tree

Pick the mechanism by answering three questions:

| Question | If "known / fixed" | If "adaptive / evolving" |
|---|---|---|
| **Cadence** — do you know the schedule in advance? | `CronCreate` loop | `ScheduleWakeup` |
| **Prompt** — does the prompt text stay the same every tick? | Inline prompt | `loop.md` |
| **Iteration** — is the work bounded (converges) or open-ended? | Either | `ScheduleWakeup` (easier to end) |

Concrete mapping:

| Scenario | Mechanism | Sentinel |
|---|---|---|
| Hourly log digest, prompt never changes | `CronCreate` loop, inline prompt | none (or `<<autonomous-loop>>` if using a shared preamble) |
| Wait for a long build to finish, then continue | `ScheduleWakeup` | `<<autonomous-loop-dynamic>>` |
| Daily task list you edit as the week progresses | `CronCreate` loop + `loop.md` | `<<loop.md>>` |
| Self-paced investigation where the task list grows | `ScheduleWakeup` + `loop.md` | `<<loop.md-dynamic>>` |
| Interactive work watched by the user right now | **Don't loop** | n/a |

If the decision is still ambiguous after this table, default to `ScheduleWakeup` — it is the easiest mechanism to end (omit the tool call) and is the lightest-weight choice.

## The Three Mechanisms

### `ScheduleWakeup` (dynamic, self-paced)

The model calls the `ScheduleWakeup` tool with `delaySeconds`, `prompt`, and `reason`. The runtime schedules a cron-backed tick at the computed target, the turn ends, and a fresh turn begins when the tick fires. The model chooses the next `delaySeconds` on each wake; it ends the loop by omitting the call.

**Picking `delaySeconds`**: see the dedicated [`choose-loop-wakeup-interval`](../skills/choose-loop-wakeup-interval/SKILL.md) skill. The core rule is the three-tier cache-aware decision: 60–270 s stays within the 5-minute prompt cache; 300 s is the worst-of-both anti-pattern; 1200–3600 s is the cache-miss range. Default for idle ticks: 1200–1800 s.

**Clamp**: `delaySeconds` is clamped to `[60, 3600]` at the runtime. Values outside are silently adjusted; the telemetry records both the requested value and the clamped value.

**Rounding**: the scheduler fires on whole-minute boundaries. A call at `HH:MM:40` with `delaySeconds: 90` produces a target of `HH:(MM+2):00` — a ~140 s actual delay. Treat `delaySeconds` as a **floor**, not a precise schedule.

**Idle defer**: when the REPL is mid-query at the scheduled fire time, the tick is deferred past the scheduled minute. Treat scheduled wakeups as *earliest-fire*, not *guaranteed-fire*. For time-sensitive polling this is a hard constraint — you cannot guarantee a wakeup lands within a specific minute if the user might be typing at that moment.

**Best for**: adaptive cadence, investigation workflows, "check again once the build finishes," loops the model ends itself.

### `CronCreate` with `kind: "loop"` (fixed cadence)

The user (or a tool call) creates a cron-backed loop with a standard cron expression. Every tick runs the same prompt text. The loop runs until explicitly ended or until it ages out at 7 days.

**Invocation**: `/loop <interval> <prompt>` from the user side, or `CronCreate` with `kind: "loop"` from a tool-calling context.

**Best for**: periodic heartbeats, scheduled reports, routine checks that do not need to vary cadence based on what the last tick saw.

**Worst for**: workflows where the right cadence depends on what the tick finds. Cron cannot adapt — if yesterday's tick found nothing and today's tick will also find nothing, cron still fires. Use `ScheduleWakeup` or `du-dum` (see [`du-dum`](../skills/du-dum/SKILL.md)) when adaptive silence matters.

### `loop.md` (file-backed prompt)

The user maintains a `loop.md` file (searched at `./.claude/loop.md`, then `./loop.md`). When the tick's prompt is `<<loop.md>>` or `<<loop.md-dynamic>>`, the resolver reads the file and injects its contents as the tick's prompt. The file is truncated to 25,000 bytes at read time; longer files are cut with a warning appended.

A content-hash cache suppresses re-injecting identical file contents on consecutive ticks — if the file hasn't changed since the last fire, only the autonomous-tick preamble is sent, saving tokens.

**Best for**: evolving task lists the user edits between ticks; shared documents that multiple sessions or cron fires consume; anything where "what should this tick do?" is stored outside the conversation.

**Worst for**: loops where the prompt is inherently dynamic and depends on the previous tick's output. Use inline `ScheduleWakeup` prompts for that — `loop.md` is a shared document, not a conversation memory.

## Sentinel Reference

Four sentinels resolve prompt text at fire time. The resolver is gated by a server-side flag; if the flag is disabled, the sentinel strings are passed through unresolved, and the model sees the raw sentinel as the prompt (and should no-op).

| Sentinel | Mechanism | Resolves to |
|---|---|---|
| `<<autonomous-loop>>` | `CronCreate` loop | The autonomous-tick preamble inline |
| `<<autonomous-loop-dynamic>>` | `ScheduleWakeup` | Same preamble, marking the tick as dynamic |
| `<<loop.md>>` | `CronCreate` loop + file | `loop.md` contents wrapped in a task-list preamble |
| `<<loop.md-dynamic>>` | `ScheduleWakeup` + file | Same wrapper, dynamic variant |

**Picking a sentinel**:
- Use `<<autonomous-loop>>` when the cron loop has a stable, repeating task that doesn't need a task list — the preamble covers "run the autonomous check defined earlier in this conversation."
- Use `<<autonomous-loop-dynamic>>` for `ScheduleWakeup` ticks that continue work established in the parent conversation.
- Use `<<loop.md>>` when the task list lives in a file and the cadence is fixed.
- Use `<<loop.md-dynamic>>` when the task list lives in a file and the model should self-pace.

**Sentinel collision hazard**: the resolver scans the entire prompt for sentinel strings. If your `prompt` argument accidentally contains one of the four sentinel strings (quoting a user message that happens to include `<<autonomous-loop-dynamic>>`, for example), the runtime will attempt to resolve it. Defensive quoting is your responsibility.

## Age-Out Lifecycle

Loops age out after 7 days by default. The ceiling is user-configurable up to 30 days. When a loop's age exceeds the configured `recurringMaxAgeMs`:

1. The next scheduling attempt returns early and emits an age-out telemetry event.
2. The loop's state record is marked aged-out; subsequent scheduling calls are ignored.
3. The loop terminates silently from the runtime side — no error is shown to the user.

**Design consequence**: a loop that must run for weeks cannot simply rely on the default. Either (a) configure a 30-day ceiling deliberately, or (b) design the loop to end well before the ceiling and restart fresh when needed. The ceiling exists precisely to prevent one-shot mistakes from turning into perpetual background work.

**What to do as the age-out approaches**:
- Use [`write-continue-here`](../skills/write-continue-here/SKILL.md) to checkpoint the loop's state to disk before the loop terminates.
- Have the loop detect approaching age-out (e.g., track its own start time and compare) and gracefully transition to a fresh loop on the next wake.
- If the loop's work genuinely spans months, consider whether it should be a loop at all — a cron job defined at the OS level, outside of Claude Code, may be more appropriate.

## Idle-Defer Behavior

Dynamic-loop wakeups are **deferred past the scheduled minute** when the REPL is busy mid-query at fire time. This is not a bug — it prevents a scheduled tick from interrupting interactive work. But it has consequences:

- Wakeup times are **earliest-fire**, not guaranteed-fire.
- Short-cadence loops (60–120 s) that coincide with chatty user activity can be deferred arbitrarily — sometimes skipping the scheduled minute entirely.
- Time-sensitive polling (e.g., "check this API exactly at the top of the hour") cannot rely on the loop alone. Pair it with a detection mechanism in the tick itself ("has the target moment passed? if yes, act now, don't wait for the next scheduled tick").

**Rule of thumb**: if a minute of skew would break the workflow, the workflow should not be built on dynamic loops.

## Clamp and Rounding

(Pointing into the skill rather than duplicating — see [`choose-loop-wakeup-interval`](../skills/choose-loop-wakeup-interval/SKILL.md) for the full treatment.)

- `delaySeconds` is clamped to `[60, 3600]` by the runtime. Outside values are silently adjusted.
- The scheduler fires on whole-minute boundaries. Your chosen `delaySeconds` is a floor; actual delay can be up to 60 s longer.
- Requesting 300 s is the specific anti-pattern: cache-miss paid, miss not amortized. Pick 270 s (stay warm) or 1200 s+ (amortize the miss).

## Composing with Cross-Session Handoff

Within-session loops (`ScheduleWakeup`, `CronCreate`) and cross-session handoff ([`write-continue-here`](../skills/write-continue-here/SKILL.md) / [`read-continue-here`](../skills/read-continue-here/SKILL.md)) solve different problems:

| Concern | Within-session loop | Cross-session handoff |
|---|---|---|
| Lifetime | Until aged out (max 30 days) or explicitly ended | Until a future session reads the file |
| State storage | The active conversation | A file on disk (`CONTINUE_HERE.md`) |
| Prompt | Injected by the runtime each tick | Read by the fresh session at start |
| Right tool when... | You need to come back in minutes or hours | You need to come back in a fresh session |

They compose cleanly: a dynamic loop running today that writes a `CONTINUE_HERE.md` before the loop ages out allows the next Claude Code session to pick up where the loop left off. That's a deliberate bridge, not a workaround.

## When NOT to Loop

Not every "come back later" impulse warrants a scheduled wakeup. Do NOT use a self-continuation loop when:

- **The user is actively watching.** Interactive work should be driven by user input, not by a scheduled tick. A loop that fires while the user is mid-conversation produces confusing conversational turns.
- **There is no convergence criterion.** If the loop has no definition of "done," it will run until the age-out ends it — which is not the same as finishing the task.
- **The task is interactive** — asking the user questions between ticks. The loop fires without the user present; any tick that requires user input will stall.
- **The cadence you need is shorter than the clamp floor** (60 s). Tight polling belongs to an event-driven mechanism (file watcher, webhook, process monitor), not a loop.
- **You are about to act in a way you would not want repeated.** Loops amplify one-shot mistakes into perpetual background work — write operations, external API calls, notifications. If the first tick would be uncomfortable to run without review, every subsequent tick should also make you uncomfortable.

If your case matches any of these, step back and pick a different pattern — usually direct work, a one-shot tool call, or cross-session handoff.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| The loop stopped firing after ~7 days | Age-out ceiling reached | Reset the loop by running a fresh `ScheduleWakeup` / `CronCreate`; consider configuring a 30-day ceiling if the long lifetime is intentional |
| A wakeup fired much later than the scheduled time | Idle-defer: the REPL was busy at fire time | This is expected. Treat the time as earliest-fire and detect inside the tick if the target moment has already passed |
| The prompt came through as `<<autonomous-loop-dynamic>>` literally | Sentinel resolver is disabled or the prompt flag is off | Check the three relevant feature flags server-side; until resolved, use inline prompts instead of sentinels |
| The model chose `delaySeconds: 300` three ticks in a row | Round-minute default instinct | Coach the loop with the [`choose-loop-wakeup-interval`](../skills/choose-loop-wakeup-interval/SKILL.md) skill; 300 s is specifically the anti-pattern |
| `loop.md` content seems stale | Content-hash cache thinks the file hasn't changed | Edit the file in a way that changes bytes (not just metadata); the cache keys on content, not mtime |
| The loop's cost is much higher than expected | Cache-miss on every tick from too-long delays or too-verbose context | Review per-tick token usage with [`manage-token-budget`](../skills/manage-token-budget/SKILL.md); consider `du-dum` split if observation and action have different costs |
| The loop fires but does nothing useful | No convergence criterion; the tick cannot decide whether to act | Pair the loop with `du-dum` — fast observe, slow act. The loop becomes the observe clock; action gates on a digest signal |

## Related Resources

**Skills:**
- [choose-loop-wakeup-interval](../skills/choose-loop-wakeup-interval/SKILL.md) — pick the `delaySeconds` value with cache-aware sizing
- [manage-token-budget](../skills/manage-token-budget/SKILL.md) — cost guardrails for long-lived loops
- [du-dum](../skills/du-dum/SKILL.md) — separate cheap observation from expensive action using a two-clock architecture
- [write-continue-here](../skills/write-continue-here/SKILL.md) — write a cross-session handoff file before a loop ages out
- [read-continue-here](../skills/read-continue-here/SKILL.md) — consume a handoff file at the start of a fresh session
- [circuit-breaker-pattern](../skills/circuit-breaker-pattern/SKILL.md) — graceful degradation when loop ticks hit tool failures

**Guides:**
- [Understanding the System](understanding-the-system.md) — how skills, agents, and teams compose

<!-- Target 300-500 lines. Current: ~260 lines. -->
