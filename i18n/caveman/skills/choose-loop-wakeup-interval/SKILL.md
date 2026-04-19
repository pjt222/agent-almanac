---
name: choose-loop-wakeup-interval
locale: caveman
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

Pick `delaySeconds` for `ScheduleWakeup`. Respect prompt cache 5-minute TTL, scheduler whole-minute granularity, `[60, 3600]` runtime clamp. Instinct "wait about 5 minutes" lands in worst-of-both zone — pay cache miss without amortizing wait.

Reasoning travels with `ScheduleWakeup` tool description at call time, but by then loop already scheduled. This skill hoists reasoning to planning time, where it belongs.

## When Use

- Designing autonomous `/loop` or `ScheduleWakeup`-driven continuation. Pick per-tick delay.
- Planning heartbeat cadence for long-running agent. Poll, watch, iterate.
- Tuning polling cadence against cost or cache-warmth pressure
- Post-hoc review of loop costs → interval mis-sized
- Writing guide, runbook, worked example involving `delaySeconds`

## Inputs

- **Required**: What loop waits for (specific event, state transition, idle tick, periodic check)
- **Required**: Next tick needs fresh context (cache-warm)? Or cold re-read OK (cache-miss acceptable)?
- **Optional**: Known lower bound on when awaited event could occur (e.g., "build takes at least 4 minutes")
- **Optional**: Cost ceiling on total loop (ticks × per-tick cost)

## Steps

### Step 1: Classify the Wait

Pick tier:

- **Active watch (cache-warm)**: something expected to change within 5 minutes — build nearing completion, state transition polled, process just kicked off
- **Cache-miss wait**: nothing worth checking sooner than 5 minutes; context cache goes cold, acceptable
- **Idle**: no specific signal; loop checks in because might find something, not because will

**Got:** Clear classification: active-watch, cache-miss, or idle.

**If fail:** Cannot classify? No honest answer to "what am I waiting for?" → loop probably should not exist. Skip to Step 5. Consider not scheduling at all.

### Step 2: Apply the Three-Tier Decision

Pick `delaySeconds` from classification:

| Tier | Range | Cache behaviour | Use when |
|---|---|---|---|
| Cache-warm | **60 – 270 s** | Cache stays warm (under 5-minute TTL) | Active watch — next tick needs fast, cheap re-entry |
| Cache-miss | **1200 – 3600 s** | Cache goes cold; one miss buys long wait | Genuinely idle, or awaited event cannot happen sooner |
| Idle default | **1200 – 1800 s** (20–30 min) | Cache goes cold | No specific signal; periodic check, user can interrupt |

**Do not pick 300 s.** Worst-of-both interval: cache misses, but wait too short to amortize miss. Reaching for "about 5 minutes"? Drop to 270 s (stay warm) or commit to 1200 s+ (amortize miss).

**Got:** Specific `delaySeconds` from one of three tiers. Not round-number-minute picked from habit.

**If fail:** Choice keeps landing on 300 s? Underlying question: "should this loop exist at this cadence at all?" Re-examine Step 1.

### Step 3: Size for the Minute Boundary

Scheduler fires on whole-minute boundaries. `delaySeconds` of `N` produces actual delay of `N` to `N + 60` s. Depends on what second of minute you call tool.

Worked example:

> `ScheduleWakeup({delaySeconds: 90})` at `HH:MM:40` → target `HH:(MM+2):00`. Actual wait 140 s, not 90 s.

Consequence: sub-minute intent meaningless. Treat value as **floor**, not precise schedule. If minute of skew matters, loop cadence too tight for this mechanism.

**Got:** Accepted: actual wait up to 60 s longer than requested `delaySeconds`. Cache-warm ticks affected — 270 s can become ~330 s in practice, tipping into cache-miss territory.

**If fail:** Near-ceiling values (e.g., 265 s targeting cache-warmth) common? Pad downward. Use 240 s instead of 270 s. Preserves cache-warm guarantee under worst-case skew.

### Step 4: Respect the Clamp

Runtime clamps `delaySeconds` to `[60, 3600]`. Outside range silently adjusted. Telemetry distinguishes `chosen_delay_seconds` from `clamped_delay_seconds`. Sets `was_clamped: true` on mismatch.

Plan against clamped value, not requested:

- Request below 60 → actual wait 60 s plus minute-boundary skew (up to 120 s in practice)
- Request above 3600 → actual wait 3600 s (1 hour)
- No runtime extends ceiling. Multi-hour waits require multiple ticks.

**Got:** Chosen value falls inside `[60, 3600]`. Or clamped behaviour deliberately accepted.

**If fail:** Need genuinely multi-hour (e.g., "wake me in 4 hours")? Chain wakeups — schedule 3600 s tick that reschedules itself. Or use cron-based loop (`CronCreate` with `kind: "loop"`).

### Step 5: Write a Specific `reason`

`reason` field = telemetry + user-visible status + prompt-cache warmth reasoning. One line. Truncated to 200 chars. Make specific.

- Good: `checking long bun build`, `polling for EC2 instance running-state`, `idle heartbeat — watching the feed`
- Bad: `waiting`, `loop`, `next tick`, `continuing`

Reader: user trying to understand what loop is doing without predicting cadence in advance. Write for them.

**Got:** Concrete, one-phrase reason. Makes sense to user glancing at status.

**If fail:** No specific reason available? Revisit whether loop should exist (Step 1, Step 6).

### Step 6: Recognize the Don't-Loop Case

Not every "come back later" impulse warrants scheduled wakeup. Do NOT schedule tick when:

- User actively watching — their input is right trigger, not timer
- No convergence criterion — loop has no definition of "done"
- Task interactive (asks user questions between ticks)
- Cadence shorter than clamp floor (60 s) — polling that tight belongs to event-driven mechanism, not loop

**Got:** Conscious choice between scheduling wakeup and not looping. "Because I could" not a reason.

**If fail:** Keep scheduling wakeups user interrupts before they fire? Pattern is wrong — not interval.

## Checks

- [ ] Wait classified as active-watch, cache-miss, or idle
- [ ] Chosen `delaySeconds` falls in one of three tier ranges (60–270, 1200–3600, or 1200–1800 for idle)
- [ ] Value is not 300 (worst-of-both)
- [ ] Value inside `[60, 3600]` or clamped behaviour explicitly accepted
- [ ] Minute-boundary skew accounted for (value as floor)
- [ ] `reason` concrete, under 200 chars
- [ ] Don't-loop check performed — wakeup actually warranted

## Pitfalls

- **Round-minute default (300 s)**: Single most common mistake. "About 5 minutes" feels natural, exactly wrong. Drop to 270 s or commit to 1200 s+.
- **Ignoring minute-boundary skew**: Request 60 s near end of minute → ~120 s actual delay. Cache-warm ticks: can push past 5-minute TTL.
- **Chasing sub-minute precision**: Scheduler has minute granularity. 85 vs 90 vs 95 s is noise. Pick value, move on.
- **Opaque `reason` fields**: `"waiting"` tells user nothing. Telemetry useless. Write reason as if user reads it on status line.
- **Using this skill to justify unnecessary loop**: Honest answer to "what am I watching for?" vague? No interval choice helps. Loop should not exist.
- **Hand-clamping in prompt**: Do not clamp in model reasoning ("I'll cap at 3600 to be safe"). Runtime clamps. Let it.
- **Forgetting 7-day age-out**: Dynamic loop reaped after 7 days default (user-configurable up to 30). Long loops designed to end well before ceiling, not race it.

## Examples

### Example 1 — Cache-warm active watch

`bun build` kicked off. Agent wants to check in quickly, cache still warm when results arrive.

- Classification: active watch (Step 1)
- Tier: cache-warm (Step 2), pick **240 s**
- Minute boundary (Step 3): worst-case actual wait ~300 s — still under 5-minute TTL with 60 s buffer
- Reason (Step 5): `checking long bun build`

### Example 2 — Idle heartbeat

Autonomous agent watches low-volume feed once an hour for anything worth acting on.

- Classification: idle (Step 1)
- Tier: idle default (Step 2), pick **1800 s** (30 min)
- Minute boundary (Step 3): irrelevant — 60 s skew negligible at this cadence
- Reason (Step 5): `idle heartbeat — watching the feed`

### Example 3 — The anti-pattern

Agent wants to "wait 5 minutes" while remote API retries. Request is 300 s.

- Problem: cache goes cold at 5 minutes. 300 s pays miss — but 300 s too short to amortize miss.
- Fix: drop to 270 s (stay warm) or commit to 1500 s (amortize miss). Do not pick 300.

## See Also

- `manage-token-budget` — cost ceilings for long-lived agent loops; cache-aware sizing one lever
- `du-dum` — observe/act separation pattern; sizes observe-clock interval when loop is cron-less
- `read-continue-here` — cross-session handoff; this skill covers within-session wakeups
- `write-continue-here` — complement of `read-continue-here`

<!-- Keep under 500 lines. Current: ~200 lines. -->
