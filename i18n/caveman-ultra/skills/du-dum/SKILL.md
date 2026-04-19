---
name: du-dum
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Separate observation from action using two clocks running at different frequencies. The fast clock (analysis) collects data cheaply and writes a compact digest. The slow clock (action) reads the digest and decides whether to act. If the digest says nothing is pending, the action clock exits immediately -- zero cost for idle cycles.

The name comes from the heartbeat rhythm: du-dum, du-dum. The first beat (du) observes; the second beat (dum) acts. Most of the time, only the first beat fires.

## When to Use

- Building autonomous agents that run on a budget and must observe more often than they act
- An existing heartbeat loop calls the LLM every tick, even when nothing has changed
- Observation is cheap (API reads, file parsing, log scanning) but action is expensive (LLM calls, write operations, notifications)
- You need decoupled failure: if observation fails, the last good digest should still be valid for the action clock
- Designing cron-based agent architectures where analysis and action run as separate jobs

## Inputs

- **Required**: List of data sources the fast clock should observe (APIs, files, logs, feeds)
- **Required**: Action the slow clock should take when the digest indicates pending work
- **Optional**: Fast clock interval (default: every 4 hours)
- **Optional**: Slow clock interval (default: once per day)
- **Optional**: Cost ceiling per day (to validate the clock configuration)
- **Optional**: Digest format preference (markdown, JSON, YAML)

## Procedure

### Step 1: Identify the Two Clocks

Separate all work into observation (cheap, frequent) and action (expensive, rare).

1. List every operation in the current loop or planned workflow
2. Classify each as observation (reads data, produces summary) or action (calls LLM, writes output, sends messages)
3. Verify the split: observations should have zero or near-zero marginal cost; actions should be the expensive operations
4. Assign frequencies: the fast clock runs often enough to catch events; the slow clock runs often enough to meet response-time requirements

| Clock | Cost profile | Frequency | Example |
|-------|-------------|-----------|---------|
| Fast (analysis) | Cheap: API reads, file parsing, no LLM | 4-6x/day | Scan GitHub notifications, parse RSS, read logs |
| Slow (action) | Expensive: LLM inference, write operations | 1x/day | Compose response, update dashboard, send alerts |

**Expected:** A clear two-column split where every operation is assigned to exactly one clock. The fast clock has no LLM calls; the slow clock has no data gathering.

**On failure:** If an operation needs both reading and LLM inference (e.g., "summarize new issues"), split it: the fast clock collects the raw issues into the digest; the slow clock summarizes them. The digest is the boundary.

### Step 2: Design the Digest Format

The digest is the low-bandwidth message that bridges the two clocks. It must be compact, human-readable, and machine-parseable.

1. Define the digest file path and format (markdown recommended for human debugging)
2. Include a header with timestamp and source metadata
3. Define a "pending" section listing items that require action
4. Define a "status" section with current state (for dashboards or logging)
5. Include a clear empty-state indicator (e.g., `pending: none` or empty section)

Example digest structure:

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

When nothing is pending:

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

**Expected:** A digest template with clear pending/empty states. The action clock can determine whether to proceed by checking a single field or section.

**On failure:** If the digest grows too large (>50 lines), the fast clock is including too much raw data. Move details to a separate data file and keep the digest as a summary with pointers.

### Step 3: Implement the Fast Clock (Analysis)

Build the observation scripts that run on the fast schedule.

1. Create one script per data source (keeps failures independent)
2. Each script reads its source, extracts relevant events, and appends to or rewrites the digest
3. Use file locking or atomic writes to prevent partial digests
4. Log the analysis run (timestamp, items found, errors) to a separate log file
5. Never call the LLM or perform write operations beyond updating the digest

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

**Expected:** One or more analysis scripts, each producing or updating the digest file. Scripts run independently -- if one fails, the others still update their sections.

**On failure:** If a data source is temporarily unavailable, the script should log the error and leave the previous digest entries intact. Do not clear the digest on source failure -- stale data is better than missing data for the action clock.

### Step 4: Implement the Slow Clock (Action)

Build the action script that reads the digest and decides whether to act.

1. Read the digest file (Step 0 of every action cycle)
2. Check the pending section: if empty or "none", exit immediately with a log entry
3. If items are pending, invoke the expensive operation (LLM call, message composition, etc.)
4. After acting, clear or archive the processed digest entries
5. Log the action run (items processed, cost, duration)

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

**Expected:** The action script exits in under 1 second on idle cycles (just a file read and empty check). On active cycles, it processes pending items and clears the digest.

**On failure:** If the LLM call fails, do not clear the digest. The pending items remain for the next action cycle. Consider implementing a retry counter in the digest to avoid infinite retries on permanently failing items.

### Step 5: Configure Idle Detection

The cost savings come from idle detection -- the action clock must reliably distinguish "nothing to do" from "something to do" with minimal overhead.

1. Define the idle check as a single, fast operation (file read + string check)
2. Verify the idle path has zero external calls (no API, no LLM, no network)
3. Measure the idle path duration -- it should be under 1 second
4. Log idle cycles differently from active cycles for monitoring

```bash
# Minimal idle check
if grep -q "^(none)$" "$DIGEST_PATH" || grep -q "pending: 0" "$DIGEST_PATH"; then
    echo "$(date -u +%FT%TZ) heartbeat: idle" >> "$LOG_PATH"
    exit 0
fi
```

**Expected:** The idle path is a single file read followed by a string match. No network calls, no process spawning beyond the script itself.

**On failure:** If the idle check is unreliable (false positives causing missed work, or false negatives causing unnecessary LLM calls), simplify the digest format. A single boolean field (`has_pending: true/false`) at the top of the file is the most reliable approach.

### Step 6: Validate the Cost Model

Calculate the expected cost to confirm the two-clock architecture delivers savings.

1. Count fast clock runs per day: `fast_runs = 24 / fast_interval_hours`
2. Count slow clock runs per day: typically 1
3. Calculate observation cost: `fast_runs * cost_per_analysis_run` (should be ~$0 if no LLM)
4. Calculate action cost: `active_days_fraction * cost_per_action_run`
5. Calculate idle cost: `(1 - active_days_fraction) * cost_per_idle_check` (should be ~$0)
6. Compare with the original single-loop cost

Example cost comparison:

| Architecture | Daily cost (active) | Daily cost (idle) | Monthly cost (80% idle) |
|-------------|--------------------|--------------------|------------------------|
| Single loop (LLM every 30min) | $13.74/37h | $13.74/37h | ~$400 |
| Du-dum (6 analyses + 1 action) | $0.30 | $0.00 | ~$6 |

**Expected:** A cost model showing the du-dum architecture is cheaper than the original by at least 10x on idle days.

**On failure:** If the cost model does not show significant savings, one of these is likely true: (a) the fast clock is too frequent, (b) the fast clock includes hidden LLM calls, or (c) the system is rarely idle. Du-dum benefits systems with high idle ratios. If the system is always active, a simpler polling approach may be more appropriate.

## Validation

- [ ] Fast and slow clocks are cleanly separated with no LLM calls in the fast path
- [ ] Digest format has a clear empty-state indicator
- [ ] Idle detection exits in under 1 second with zero external calls
- [ ] Fast clock failure does not corrupt the digest (stale data preserved)
- [ ] Slow clock failure does not clear pending items (retry on next cycle)
- [ ] Cost model shows at least 10x savings on idle days vs. single-loop architecture
- [ ] Both clocks log their runs for monitoring and debugging
- [ ] Digest does not grow unbounded (old entries archived or cleared after processing)

## Common Pitfalls

- **Digest growing unbounded**: If the fast clock appends but the slow clock never clears, the digest becomes a growing log. Always clear or archive processed entries after the action cycle completes.
- **Fast clock too fast**: Running analysis every 5 minutes when events arrive daily wastes API quota and disk I/O. Match the fast clock frequency to the actual event rate of your data sources.
- **Slow clock too slow**: If the action window is once per day but events need same-hour response, the slow clock is too slow. Increase its frequency or add an urgent-event shortcut that triggers immediate action.
- **LLM calls in the fast clock**: The entire cost model breaks if the fast clock includes LLM inference. Audit every fast-clock script to confirm zero LLM calls. If summarization is needed, defer it to the slow clock.
- **Coupling fast clock scripts**: If one analysis script depends on another's output, a failure in the first cascades. Keep fast-clock scripts independent -- each reads its own source and writes its own digest section.
- **Silent idle logging**: If idle cycles produce no log output, you cannot distinguish "running and idle" from "crashed and not running." Always log idle cycles, even if just a timestamp.
- **Clearing digest on analysis failure**: If a data source is down, do not write an empty digest. The slow clock would see "nothing pending" and skip work that is actually pending. Preserve the last good digest on failure.

## Related Skills

- `manage-token-budget` -- cost control framework that du-dum makes practical; du-dum is the architectural pattern, token budget is the accounting layer
- `circuit-breaker-pattern` -- handles the failure case (tools breaking); du-dum handles the normal case (nothing to do). Use together: du-dum for idle detection, circuit-breaker for failure recovery
- `observe` -- observation methodology for the fast clock; du-dum structures when and how observations become actionable via the digest
- `forage-resources` -- strategic exploration layer; du-dum is the execution rhythm that forage-resources operates within
- `coordinate-reasoning` -- stigmergic signaling patterns; the digest file is a form of stigmergy (indirect coordination through environmental artifacts)
