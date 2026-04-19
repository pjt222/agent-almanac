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

Pick `delaySeconds` for `ScheduleWakeup` → respects prompt cache 5-min TTL + scheduler whole-min granularity + `[60, 3600]` clamp. Non-trivial: "wait ~5 min" → worst-of-both zone → pay cache miss without amortizing wait.

Reasoning travels w/ `ScheduleWakeup` tool desc at call time → but loop already scheduled. This skill hoists reasoning → planning time.

## Use When

- Designing autonomous `/loop` or `ScheduleWakeup` continuation → pick per-tick delay
- Heartbeat cadence for long-running agent
- Tuning polling vs. cost/cache-warmth
- Post-hoc: loop cost review → mis-sized interval
- Guide/runbook w/ `delaySeconds` example

## In

- **Required**: What loop waits for (event, state transition, idle tick, periodic check)
- **Required**: Next tick needs fresh ctx (cache-warm) or cold re-read OK (cache-miss OK)
- **Optional**: Known lower bound on event occurrence ("build ≥4 min")
- **Optional**: Cost ceiling (ticks × per-tick cost)

## Do

### Step 1: Classify the Wait

Tier decision:

- **Active watch (cache-warm)**: Change expected <5 min → build near done, state transition, just-kicked proc
- **Cache-miss wait**: Nothing worth checking <5 min → cache cold OK
- **Idle**: No specific signal → checking in case

**→** Classification: active-watch, cache-miss, or idle.

**If err:** Can't classify → no honest answer to "what waiting for?" → loop shouldn't exist → skip to Step 5.

### Step 2: Apply Three-Tier Decision

Pick `delaySeconds`:

| Tier | Range | Cache | Use when |
|---|---|---|---|
| Cache-warm | **60 – 270 s** | Warm (<5-min TTL) | Active watch — fast cheap re-entry |
| Cache-miss | **1200 – 3600 s** | Cold; miss buys long wait | Idle, or event can't happen sooner |
| Idle default | **1200 – 1800 s** (20–30 min) | Cold | No specific signal; periodic |

**Do not pick 300 s.** Worst-of-both: cache misses, wait too short to amortize. Reaching for "~5 min" → drop to 270 s (warm) or 1200 s+ (amortize).

**→** Specific `delaySeconds` from one of three tiers, not round-minute habit.

**If err:** Keep landing on 300 s → real question is "should loop exist at this cadence?" → re-examine Step 1.

### Step 3: Size for Minute Boundary

Scheduler fires on whole-min boundaries. `delaySeconds` = `N` → actual `N` to `N + 60` s, depending on call second.

Example:

> `ScheduleWakeup({delaySeconds: 90})` at `HH:MM:40` → target `HH:(MM+2):00` → actual 140 s, not 90 s.

Sub-minute intent meaningless. Value = **floor**, not precise. Min of skew matters → cadence too tight for this mech.

**→** Accepted actual wait up to 60 s longer than requested. Cache-warm: 270 s → ~330 s → tips into cache-miss.

**If err:** Near-ceiling values common (265 s for cache-warm) → pad down → 240 s preserves warmth under worst-case skew.

### Step 4: Respect the Clamp

Runtime clamps `delaySeconds` → `[60, 3600]`. Out-of-range → silently adjusted. Telemetry: `chosen_delay_seconds` vs. `clamped_delay_seconds` + `was_clamped: true`.

Plan vs. clamped, not requested:

- Req <60 → actual 60 s + skew (up to 120 s)
- Req >3600 → actual 3600 s (1 h)
- No ceiling extension → multi-hour = multi tick

**→** Value in `[60, 3600]` or clamp accepted.

**If err:** Genuinely multi-hour ("wake in 4 h") → chain wakeups (3600 s tick reschedules) or cron loop (`CronCreate` w/ `kind: "loop"`).

### Step 5: Write Specific `reason`

`reason` = telemetry + user status + cache-warmth reasoning. 200-char limit. Specific.

- Good: `checking long bun build`, `polling for EC2 instance running-state`, `idle heartbeat — watching the feed`
- Bad: `waiting`, `loop`, `next tick`, `continuing`

Reader = user glancing at status → write for them.

**→** Concrete one-phrase reason sensible to glancing user.

**If err:** No specific reason → revisit loop existence (Step 1, Step 6).

### Step 6: Recognize Don't-Loop Case

Not every "come back later" = scheduled wakeup. Do NOT schedule when:

- User actively watching → their input is trigger, not timer
- No convergence criterion → no "done" def
- Interactive task (asks user between ticks)
- Cadence <clamp floor (60 s) → tight polling = event-driven, not loop

**→** Conscious choice: schedule wakeup vs. no loop. "Because I could" ≠ reason.

**If err:** User keeps interrupting wakeups → pattern wrong, not interval.

## Check

- [ ] Wait classified: active-watch, cache-miss, or idle
- [ ] `delaySeconds` in one of three tier ranges (60–270, 1200–3600, 1200–1800 idle)
- [ ] Value ≠ 300 (worst-of-both)
- [ ] Value in `[60, 3600]` or clamp explicitly accepted
- [ ] Minute-boundary skew accounted (value = floor)
- [ ] `reason` concrete + <200 chars
- [ ] Don't-loop check done → wakeup warranted

## Traps

- **Round-minute default (300 s)**: #1 mistake. "About 5 min" feels natural, is wrong. → 270 s or 1200 s+.
- **Ignoring minute-boundary skew**: 60 s req near min end → ~120 s actual. Cache-warm: past 5-min TTL.
- **Sub-min precision**: Min granularity. 85 vs. 90 vs. 95 s = noise. Pick + move.
- **Opaque `reason`**: `"waiting"` = nothing. Write for user status line.
- **Justifying unnecessary loop**: Vague "watching for?" → no interval helps → loop shouldn't exist.
- **Hand-clamping in prompt**: Don't clamp in reasoning ("cap at 3600"). Runtime clamps.
- **Forgetting 7-day age-out**: Dynamic loop reaped after 7 days default (up to 30). Long loops end before ceiling.

## Examples

### Example 1 — Cache-warm active watch

`bun build` kicked off → agent checks quick → cache warm at results.

- Classify: active watch (Step 1)
- Tier: cache-warm (Step 2) → **240 s**
- Min boundary (Step 3): worst-case ~300 s → under 5-min TTL w/ 60 s buffer
- Reason (Step 5): `checking long bun build`

### Example 2 — Idle heartbeat

Autonomous agent watches low-volume feed 1×/h.

- Classify: idle (Step 1)
- Tier: idle default (Step 2) → **1800 s** (30 min)
- Min boundary (Step 3): irrelevant → 60 s skew negligible
- Reason (Step 5): `idle heartbeat — watching the feed`

### Example 3 — Anti-pattern

Agent wants "wait 5 min" → remote API retries → 300 s req.

- Problem: cache cold at 5 min → 300 s pays miss but too short to amortize
- Fix: → 270 s (warm) or 1500 s (amortize). Not 300.

## →

- `manage-token-budget` — cost ceilings; cache-aware sizing is one lever
- `du-dum` — observe/act pattern; this skill sizes observe-clock when cron-less
- `read-continue-here` — cross-session handoff; this = within-session wakeups
- `write-continue-here` — complement of `read-continue-here`

<!-- Keep under 500 lines. Current: ~200 lines. -->
