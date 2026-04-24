---
name: du-dum
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Separate expensive observation from cheap decision-making in autonomous agent
  loops using a two-clock architecture. A fast clock accumulates data into a
  digest file; a slow clock reads the digest and acts only when something is
  pending. Idle cycles cost nothing because the action clock returns immediately
  after reading an empty digest. Use when building autonomous agents that must
  observe continuously but can only afford to act occasionally, when API or LLM
  costs dominate and most cycles have nothing to do, when designing cron-based
  agent architectures with observation and action phases, or when an existing
  heartbeat loop is too expensive because it calls the LLM on every tick.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: autonomous-agents, cost-optimization, two-clock, digest, heartbeat, batch-then-act, cron
---

# Du-Dum: Batch-Then-Act Pattern

Split watching from acting. Two clocks run at different speeds. Fast clock (look) grab data cheap and write tight digest. Slow clock (do) read digest and pick act or skip. Digest empty? Action clock quit fast -- zero cost for idle tick.

Name come from heartbeat: du-dum, du-dum. First beat (du) watch; second beat (dum) act. Most time, only first beat fire.

## When Use

- Build autonomous agent on budget; must watch often, act less
- Old heartbeat loop call LLM every tick even when nothing change
- Watch cheap (API read, file parse, log scan) but act costly (LLM call, write, ping)
- Need split failure: if watch break, last good digest still good for action clock
- Design cron-based agent where look and do run as separate jobs

## Inputs

- **Required**: List of data sources fast clock must watch (APIs, files, logs, feeds)
- **Required**: Act slow clock must take when digest show pending work
- **Optional**: Fast clock gap (default: every 4 hours)
- **Optional**: Slow clock gap (default: once per day)
- **Optional**: Cost cap per day (to check clock config)
- **Optional**: Digest format pick (markdown, JSON, YAML)

## Steps

### Step 1: Spot Two Clocks

Split all work into watch (cheap, often) and act (costly, rare).

1. List every op in current loop or planned flow
2. Tag each as watch (read data, make summary) or act (call LLM, write out, send msg)
3. Check split: watch ops should cost zero or near-zero edge cost; act ops should be costly ones
4. Set speed: fast clock runs often enough to catch events; slow clock runs often enough to hit response-time goal

| Clock | Cost profile | Speed | Example |
|-------|-------------|-----------|---------|
| Fast (look) | Cheap: API read, file parse, no LLM | 4-6x/day | Scan GitHub notifications, parse RSS, read logs |
| Slow (act) | Costly: LLM inference, write ops | 1x/day | Compose reply, update dashboard, send alerts |

**Got:** Clean two-column split. Every op put in exactly one clock. Fast clock has no LLM calls; slow clock has no data grab.

**If fail:** Op need both read and LLM (e.g., "summarize new issues")? Split: fast clock grab raw issues into digest; slow clock summarize. Digest is boundary.

### Step 2: Design Digest Format

Digest is low-bandwidth message bridging two clocks. Must be tight, human-readable, machine-parse.

1. Set digest file path and format (markdown good for human debug)
2. Add header with timestamp and source meta
3. Set "pending" section list items needing act
4. Set "status" section with state now (for dashboards or logs)
5. Add clear empty mark (e.g., `pending: none` or empty section)

Example digest shape:

```markdown
# Digest — 2026-03-22T06:30:00Z

## Pending

- PR #42 needs review response (opened 2h ago, author requested feedback)
- Issue #99 has new comment from maintainer (action: reply)

## Status

- Last analyzed: 2026-03-22T06:30:00Z
- Sources checked: github-notifications, rss-feed, error-log
- Items scanned: 14
- Items pending: 2
```

When nothing pending:

```markdown
# Digest — 2026-03-22T06:30:00Z

## Pending

(none)

## Status

- Last analyzed: 2026-03-22T06:30:00Z
- Sources checked: github-notifications, rss-feed, error-log
- Items scanned: 8
- Items pending: 0
```

**Got:** Digest template with clear pending/empty states. Action clock can pick go/no-go by one field or section.

**If fail:** Digest too big (>50 lines)? Fast clock packing too much raw data. Move detail to separate data file; keep digest as summary with pointers.

### Step 3: Build Fast Clock (Look)

Build watch scripts running on fast schedule.

1. Make one script per data source (keep fails split)
2. Each script read its source, pull relevant events, append or rewrite digest
3. Use file lock or atomic write to block partial digest
4. Log run (timestamp, items found, errors) to separate log file
5. Never call LLM or do write ops beyond updating digest

```
# Pseudocode: analyze-notifications.sh
fetch_notifications()
filter_actionable(notifications)
format_as_digest_entries(filtered)
atomic_write(digest_path, entries)
log("analyzed {count} notifications, {pending} actionable")
```

Schedule example (cron):
```
# Fast clock: analyze every 4 hours
30 */4 * * *  /path/to/analyze-notifications.sh >> /var/log/analysis.log 2>&1
0  6   * * *  /path/to/analyze-pr-status.sh     >> /var/log/analysis.log 2>&1
```

**Got:** One or more watch scripts, each make or update digest file. Scripts run split -- one fails, others still update their sections.

**If fail:** Source down short time? Script log err and leave old digest entry alone. Do not clear digest on source fail -- stale data better than missing data for action clock.

### Step 4: Build Slow Clock (Act)

Build act script that read digest and pick act or skip.

1. Read digest file (Step 0 of every act cycle)
2. Check pending: empty or "none"? Quit fast with log entry
3. Items pending? Fire costly op (LLM call, msg compose, etc.)
4. After act, clear or archive done entries
5. Log run (items done, cost, time)

```
# Pseudocode: heartbeat.sh (the slow clock)
digest = read_file(digest_path)

if digest.pending is empty:
    log("heartbeat: nothing pending, exiting")
    exit(0)

# Only reaches here if work exists
response = call_llm(digest.pending, system_prompt)
execute_actions(response)
archive_digest(digest_path)
log("heartbeat: processed {count} items, cost: {tokens} tokens")
```

Schedule example (cron):
```
# Slow clock: act once per day at 7am
0 7 * * *  /path/to/heartbeat.sh >> /var/log/heartbeat.log 2>&1
```

**Got:** Act script quits under 1 sec on idle cycle (only file read and empty check). On busy cycle, handle pending items and clear digest.

**If fail:** LLM call fail? Do not clear digest. Pending items stay for next act cycle. Think about retry count in digest to stop infinite retry on permanently broken items.

### Step 5: Setup Idle Detect

Cost savings come from idle detect -- action clock must reliably pick "nothing to do" vs "something to do" with low cost.

1. Set idle check as one fast op (file read + string check)
2. Check idle path has zero outside calls (no API, no LLM, no net)
3. Time idle path -- should be under 1 sec
4. Log idle cycles different from busy cycles for watch

```bash
# Minimal idle check
if grep -q "^(none)$" "$DIGEST_PATH" || grep -q "pending: 0" "$DIGEST_PATH"; then
    echo "$(date -u +%FT%TZ) heartbeat: idle" >> "$LOG_PATH"
    exit 0
fi
```

**Got:** Idle path is one file read then string match. No net calls, no process spawning past script itself.

**If fail:** Idle check flaky (false hits miss work, or false miss cause bad LLM calls)? Simpler digest. One bool field (`has_pending: true/false`) at top is most reliable.

### Step 6: Check Cost Model

Tally expected cost to confirm two-clock arch delivers savings.

1. Count fast clock runs per day: `fast_runs = 24 / fast_interval_hours`
2. Count slow clock runs per day: usually 1
3. Watch cost: `fast_runs * cost_per_analysis_run` (should be ~$0 if no LLM)
4. Act cost: `active_days_fraction * cost_per_action_run`
5. Idle cost: `(1 - active_days_fraction) * cost_per_idle_check` (should be ~$0)
6. Compare vs old single-loop cost

Example cost compare:

| Architecture | Daily cost (active) | Daily cost (idle) | Monthly cost (80% idle) |
|-------------|--------------------|--------------------|------------------------|
| Single loop (LLM every 30min) | $13.74/37h | $13.74/37h | ~$400 |
| Du-dum (6 analyses + 1 action) | $0.30 | $0.00 | ~$6 |

**Got:** Cost model show du-dum cheaper than old by at least 10x on idle day.

**If fail:** Cost model not show big savings? One likely true: (a) fast clock too fast, (b) fast clock has hidden LLM calls, or (c) system rarely idle. Du-dum helps high-idle systems. Always busy? Simpler poll may fit better.

## Checks

- [ ] Fast and slow clocks clean split, no LLM calls in fast path
- [ ] Digest format has clear empty mark
- [ ] Idle detect quits under 1 sec with zero outside calls
- [ ] Fast clock fail not corrupt digest (stale data kept)
- [ ] Slow clock fail not clear pending items (retry next cycle)
- [ ] Cost model show at least 10x savings on idle day vs single-loop arch
- [ ] Both clocks log runs for watch and debug
- [ ] Digest not grow without bound (old entries archived or cleared after done)

## Pitfalls

- **Digest grow without bound**: Fast clock append but slow clock never clear? Digest becomes growing log. Always clear or archive done entries after act cycle end.
- **Fast clock too fast**: Run look every 5 min when events land daily wastes API quota and disk I/O. Match fast clock speed to real event rate of data sources.
- **Slow clock too slow**: Act window once per day but events need same-hour reply? Slow clock too slow. Bump speed or add urgent-event shortcut that fires act fast.
- **LLM calls in fast clock**: Whole cost model break if fast clock has LLM inference. Audit every fast-clock script; confirm zero LLM calls. Need summary? Defer to slow clock.
- **Coupled fast clock scripts**: One look script depend on another's out? Fail in first cascades. Keep fast-clock scripts split -- each read own source and write own digest section.
- **Silent idle log**: Idle cycles make no log out? Cannot tell "running and idle" from "crashed and not running." Always log idle cycle, even just timestamp.
- **Clear digest on look fail**: Source down? Do not write empty digest. Slow clock would see "nothing pending" and skip work that actually pending. Keep last good digest on fail.

## See Also

- `manage-token-budget` -- cost control frame that du-dum make real; du-dum is arch pattern, token budget is count layer
- `circuit-breaker-pattern` -- handle fail case (tools break); du-dum handle normal case (nothing to do). Use together: du-dum for idle detect, circuit-breaker for fail recovery
- `observe` -- watch method for fast clock; du-dum shape when and how watch become act via digest
- `forage-resources` -- strategy roam layer; du-dum is run rhythm forage-resources sits in
- `coordinate-reasoning` -- stigmergic signal patterns; digest file is form of stigmergy (indirect coord through env artifacts)
