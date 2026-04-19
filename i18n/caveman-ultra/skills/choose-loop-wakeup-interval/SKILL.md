---
name: choose-loop-wakeup-interval
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Select a `delaySeconds` value when scheduling a loop wakeup via the
  `ScheduleWakeup` tool or the `/loop` slash command. Covers the three-tier
  cache-aware decision (cache-warm under 5 minutes, cache-miss 5 minutes to
  1 hour, idle default 20 to 30 minutes), the 300-second anti-pattern, the
  [60, 3600] runtime clamp, the minute-boundary rounding quirk, and writing
  a telemetry-worthy `reason` field. Use when designing an autonomous loop,
  when a heartbeat cadence is being planned, when polling cadence is being
  tuned, or when post-hoc review of loop costs reveals interval mis-sizing.
license: MIT
allowed-tools: ""
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: loop, wakeup, cache, scheduling, delay, general
---

# Choose Loop Wakeup Interval

Pick a `delaySeconds` value for `ScheduleWakeup` that respects the prompt cache's 5-minute TTL, the scheduler's whole-minute granularity, and the `[60, 3600]` runtime clamp. The decision is structurally non-trivial: the common instinct "wait about 5 minutes" lands in the worst-of-both zone — pay the cache miss without amortizing the wait.

The reasoning travels with the `ScheduleWakeup` tool description at tool-call time, but by then the loop is already being scheduled. This skill hoists that reasoning to planning time, where it belongs.

## When to Use

- Designing an autonomous `/loop` or `ScheduleWakeup`-driven continuation and picking the per-tick delay
- Planning a heartbeat cadence for a long-running agent that will poll, watch, or iterate
- Tuning polling cadence against cost or cache-warmth pressure
- Post-hoc reviewing loop costs and discovering the interval was mis-sized
- Writing a guide, runbook, or worked example that involves picking `delaySeconds`

## Inputs

- **Required**: What the loop is waiting for (a specific event, a state transition, an idle tick, a periodic check)
- **Required**: Whether the reader of this tick will need fresh context (cache-warm) or can tolerate a cold re-read (cache-miss acceptable)
- **Optional**: Any known lower bound on when the awaited event could possibly occur (e.g. "the build takes at least 4 minutes")
- **Optional**: A cost ceiling on the total loop (number of ticks × per-tick cost)

## Procedure

### Step 1: Classify the Wait

Decide which tier the wait belongs to:

- **Active watch (cache-warm)**: something is expected to change within the next 5 minutes — a build nearing completion, a state transition being polled, a process that was just kicked off
- **Cache-miss wait**: nothing worth checking sooner than 5 minutes from now; the context cache will go cold and that is acceptable
- **Idle**: no specific signal to watch; the loop is checking in because it might find something, not because it will

**Expected:** A clear classification: active-watch, cache-miss, or idle.

**On failure:** If the wait cannot be classified — if there is no honest answer to "what am I waiting for?" — the loop probably should not exist. Skip to Step 5 and consider not scheduling a wakeup at all.

### Step 2: Apply the Three-Tier Decision

Pick a `delaySeconds` based on the classification:

| Tier | Range | Cache behaviour | Use when |
|---|---|---|---|
| Cache-warm | **60 – 270 s** | Cache stays warm (under 5-minute TTL) | Active watch — the next tick needs fast, cheap re-entry |
| Cache-miss | **1200 – 3600 s** | Cache goes cold; one miss buys a long wait | Genuinely idle, or the awaited event cannot happen sooner |
| Idle default | **1200 – 1800 s** (20–30 min) | Cache goes cold | No specific signal; periodic check with user able to interrupt |

**Do not pick 300 s.** It is the worst-of-both interval: the cache misses, but the wait is too short to amortize the miss. If you find yourself reaching for "about 5 minutes," drop to 270 s (stay warm) or commit to 1200 s+ (amortize the miss).

**Expected:** A specific `delaySeconds` value chosen from one of the three tiers, not a round-number-minute value picked out of habit.

**On failure:** If the choice keeps landing on 300 s, the underlying question is usually "should this loop exist at this cadence at all?" — re-examine Step 1.

### Step 3: Size for the Minute Boundary

The scheduler fires on whole-minute boundaries. A `delaySeconds` of `N` produces an actual delay of `N` to `N + 60` s, depending on what second of the minute you call the tool.

Worked example:

> Calling `ScheduleWakeup({delaySeconds: 90})` at `HH:MM:40` produces a target of `HH:(MM+2):00` — i.e. an actual wait of 140 s, not 90 s.

Consequence: sub-minute intent is meaningless. Treat the value you pass as a **floor**, not a precise schedule. If a minute of skew matters, your loop cadence is too tight for this mechanism.

**Expected:** You have accepted that the actual wait will be up to 60 s longer than the requested `delaySeconds`. For cache-warm ticks this matters — 270 s can become ~330 s in practice, tipping into cache-miss territory.

**On failure:** If near-the-ceiling values (e.g. 265 s when targeting cache-warmth) are common, pad downward — use 240 s instead of 270 s to preserve the cache-warm guarantee even under worst-case minute-boundary skew.

### Step 4: Respect the Clamp

The runtime clamps `delaySeconds` to `[60, 3600]` — values outside that range are silently adjusted. Telemetry distinguishes what the model asked for (`chosen_delay_seconds`) from what actually scheduled (`clamped_delay_seconds`) and sets `was_clamped: true` on any mismatch.

Plan against the clamped value, not the requested one:

- Request below 60 → actual wait is 60 s plus minute-boundary skew (up to 120 s in practice)
- Request above 3600 → actual wait is 3600 s (1 hour)
- No runtime extends the ceiling; multi-hour waits require multiple ticks

**Expected:** Your chosen value falls inside `[60, 3600]`, or you have deliberately accepted the clamped behaviour.

**On failure:** If the need is genuinely multi-hour (e.g. "wake me in 4 hours"), chain wakeups — schedule a 3600 s tick that itself reschedules — or use a cron-based loop (`CronCreate` with `kind: "loop"`) instead.

### Step 5: Write a Specific `reason`

The `reason` field is telemetry, user-visible status, and prompt-cache warmth reasoning in one line. It is truncated to 200 chars. Make it specific.

- Good: `checking long bun build`, `polling for EC2 instance running-state`, `idle heartbeat — watching the feed`
- Bad: `waiting`, `loop`, `next tick`, `continuing`

The reader of this field is a user trying to understand what the loop is doing without having to predict your cadence in advance. Write for them.

**Expected:** A concrete, one-phrase reason that would make sense to a user glancing at status.

**On failure:** If no specific reason can be given, revisit whether the loop should exist (Step 1 and Step 6).

### Step 6: Recognize the Don't-Loop Case

Not every "come back later" impulse warrants a scheduled wakeup. Do NOT schedule a tick when:

- The user is actively watching — their input is the right trigger, not a timer
- There is no convergence criterion — the loop has no definition of "done"
- The task is interactive (asks the user questions between ticks)
- The cadence needed is shorter than the clamp floor (60 s) — polling that tight belongs to an event-driven mechanism, not a loop

**Expected:** A conscious choice between scheduling a wakeup and not looping at all. "Because I could" is not a reason to loop.

**On failure:** If you keep scheduling wakeups that the user interrupts before they fire, the pattern is wrong — not the interval.

## Validation

- [ ] The wait was classified as active-watch, cache-miss, or idle (one of three)
- [ ] The chosen `delaySeconds` falls in one of the three tier ranges (60–270, 1200–3600, or 1200–1800 for idle)
- [ ] The value is not 300 (worst-of-both)
- [ ] The value is inside `[60, 3600]` or the clamped behaviour is explicitly accepted
- [ ] Minute-boundary skew has been accounted for (treat the value as a floor)
- [ ] `reason` is concrete and under 200 chars
- [ ] The don't-loop check was performed — the wakeup is actually warranted

## Common Pitfalls

- **Round-minute default (300 s)**: The single most common mistake. "About 5 minutes" feels natural and is exactly wrong. Drop to 270 s or commit to 1200 s+.
- **Ignoring minute-boundary skew**: Requesting 60 s near the end of a minute can produce ~120 s of actual delay. For cache-warm ticks, this can push the tick past the 5-minute TTL unexpectedly.
- **Chasing sub-minute precision**: The scheduler has minute granularity. Asking for 85 s vs. 90 s vs. 95 s is noise — pick a value and move on.
- **Opaque `reason` fields**: `"waiting"` tells the user nothing and makes telemetry less useful. Write the reason as if the user will read it on a status line.
- **Using this skill to justify an unnecessary loop**: If the honest answer to "what am I watching for?" is vague, no interval choice will help — the loop should not exist.
- **Hand-clamping in the prompt**: Do not clamp in the model's reasoning ("I'll cap at 3600 to be safe"). The runtime clamps. Let it.
- **Forgetting the 7-day age-out**: A dynamic loop is reaped after 7 days by default (user-configurable up to 30 days). Long-running loops should be designed to end well before that ceiling, not to race against it.

## Examples

### Example 1 — Cache-warm active watch

A `bun build` was kicked off; the agent wants to check in quickly so the cache is still warm when results arrive.

- Classification: active watch (Step 1)
- Tier: cache-warm (Step 2), pick **240 s**
- Minute boundary (Step 3): worst-case actual wait ~300 s — still under the 5-minute TTL with the 60 s buffer
- Reason (Step 5): `checking long bun build`

### Example 2 — Idle heartbeat

An autonomous agent watches a low-volume feed once an hour for anything worth acting on.

- Classification: idle (Step 1)
- Tier: idle default (Step 2), pick **1800 s** (30 min)
- Minute boundary (Step 3): irrelevant — 60 s of skew is negligible at this cadence
- Reason (Step 5): `idle heartbeat — watching the feed`

### Example 3 — The anti-pattern

An agent wants to "wait 5 minutes" while a remote API retries. The request is 300 s.

- Problem: the cache goes cold at 5 minutes, so 300 s pays the miss — but 300 s is too short to amortize the miss
- Fix: either drop to 270 s (stay warm) or commit to 1500 s (amortize the miss). Do not pick 300.

## Related Skills

- `manage-token-budget` — cost ceilings for long-lived agent loops; cache-aware sizing is one lever
- `du-dum` — observe/act separation pattern; this skill sizes the observe-clock interval when the loop is cron-less
- `read-continue-here` — cross-session handoff; this skill covers within-session wakeups
- `write-continue-here` — the complement of `read-continue-here`

<!-- Keep under 500 lines. Current: ~200 lines. -->
