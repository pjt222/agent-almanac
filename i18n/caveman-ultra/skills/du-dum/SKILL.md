---
name: du-dum
locale: caveman-ultra
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

Split observe/act → 2 clocks diff freq. Fast (analysis) = cheap → writes digest. Slow (action) = reads digest → acts if pending. Digest empty → exit immediate. Zero cost idle.

Name = heartbeat: du-dum. First beat (du) observes. Second (dum) acts. Mostly only first fires.

## Use When

- Autonomous agent budget → observe often, act rare
- Heartbeat calls LLM every tick → waste
- Observe cheap (API read, file parse, log scan), act expensive (LLM, write, notify)
- Decoupled fail → observe fails → last digest still valid
- Cron agent → analysis + action = separate jobs

## In

- **Required**: Data sources fast clock observes (APIs, files, logs, feeds)
- **Required**: Action slow clock takes when pending
- **Optional**: Fast interval (default: 4h)
- **Optional**: Slow interval (default: 1/day)
- **Optional**: Daily cost ceiling
- **Optional**: Digest format (md, JSON, YAML)

## Do

### Step 1: Identify 2 Clocks

Split work → observe (cheap, freq) vs act (exp, rare).

1. List every op
2. Classify → observe (reads → summary) or act (LLM/write/msg)
3. Verify split: observe ≈0 marginal, act = expensive
4. Assign freq: fast catches events, slow meets response-time

| Clock | Cost | Freq | Example |
|-------|------|------|---------|
| Fast (analysis) | Cheap: API read, parse, no LLM | 4-6x/day | GitHub notifs, RSS, logs |
| Slow (action) | Exp: LLM, write | 1x/day | Compose reply, dashboard, alert |

→ Clean split. Every op on 1 clock. Fast = no LLM. Slow = no gather.

If err: op needs both → split. Fast collects raw → digest. Slow summarizes. Digest = boundary.

### Step 2: Design Digest Format

Digest = low-bandwidth msg between clocks. Compact, human-readable, parseable.

1. Define path + format (md recommended)
2. Header: timestamp + source meta
3. "Pending" section → items needing action
4. "Status" section → current state
5. Clear empty indicator (`pending: none`)

Example:

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

Empty:

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

→ Template w/ clear pending/empty. Slow clock decides by single check.

If err: digest >50 lines → too much raw. Move details to data file, digest = summary + pointers.

### Step 3: Fast Clock (Analysis)

Observation scripts on fast schedule.

1. 1 script per source (indep failures)
2. Each reads, extracts, appends/rewrites digest
3. File lock / atomic write → no partial digest
4. Log run (ts, items, errs) → separate log
5. Never LLM / write beyond digest

```
# Pseudocode: analyze-notifications.sh
fetch_notifications()
filter_actionable(notifications)
format_as_digest_entries(filtered)
atomic_write(digest_path, entries)
log("analyzed {count} notifications, {pending} actionable")
```

Cron:
```
# Fast clock: analyze every 4 hours
30 */4 * * *  /path/to/analyze-notifications.sh >> /var/log/analysis.log 2>&1
0  6   * * *  /path/to/analyze-pr-status.sh     >> /var/log/analysis.log 2>&1
```

→ Analysis scripts update digest. Indep → 1 fails, others continue.

If err: source down → log + keep prev entries. Never clear on source fail → stale > missing.

### Step 4: Slow Clock (Action)

Reads digest, decides act.

1. Read digest (Step 0)
2. Pending empty/"none" → exit immediate w/ log
3. Items pending → exp op (LLM, compose)
4. After act → clear/archive processed entries
5. Log run (items, cost, duration)

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

Cron:
```
# Slow clock: act once per day at 7am
0 7 * * *  /path/to/heartbeat.sh >> /var/log/heartbeat.log 2>&1
```

→ Script exits <1s idle. Active → processes + clears.

If err: LLM fails → no clear. Items retry next cycle. Consider retry counter → no infinite retry.

### Step 5: Idle Detection

Savings = idle detect. Distinguish "nothing"/"something" min overhead.

1. Idle check = single fast op (file read + str check)
2. Verify idle path: 0 ext calls (no API/LLM/net)
3. Measure duration <1s
4. Log idle differently from active

```bash
# Minimal idle check
if grep -q "^(none)$" "$DIGEST_PATH" || grep -q "pending: 0" "$DIGEST_PATH"; then
    echo "$(date -u +%FT%TZ) heartbeat: idle" >> "$LOG_PATH"
    exit 0
fi
```

→ Idle = 1 file read + str match. No net, no spawn.

If err: unreliable check (false pos = missed work, false neg = waste LLM) → simplify digest. Single bool field (`has_pending: true/false`) most reliable.

### Step 6: Validate Cost Model

Calculate → confirm savings.

1. Fast runs/day: `fast_runs = 24 / fast_interval_hours`
2. Slow runs/day: typ 1
3. Observe cost: `fast_runs * cost_per_analysis_run` (~$0 no LLM)
4. Act cost: `active_days_fraction * cost_per_action_run`
5. Idle cost: `(1 - active_days_fraction) * cost_per_idle_check` (~$0)
6. Compare w/ original

| Architecture | Daily (active) | Daily (idle) | Monthly (80% idle) |
|-------------|--------------------|--------------------|------------------------|
| Single loop (LLM every 30min) | $13.74/37h | $13.74/37h | ~$400 |
| Du-dum (6 analyses + 1 action) | $0.30 | $0.00 | ~$6 |

→ Model shows ≥10x cheaper on idle days.

If err: no savings → (a) fast too freq, (b) fast has hidden LLM, (c) rarely idle. Du-dum wants high idle ratio. Always active → simpler polling.

## Check

- [ ] Fast/slow split clean → no LLM in fast path
- [ ] Digest has clear empty indicator
- [ ] Idle detect <1s, 0 ext calls
- [ ] Fast fail → no digest corrupt (stale preserved)
- [ ] Slow fail → no clear pending (retry next)
- [ ] Cost model ≥10x savings idle days
- [ ] Both clocks log runs
- [ ] Digest bounded (archive/clear after process)

## Traps

- **Digest unbounded**: Append no clear → growing log. Always clear/archive after act.
- **Fast too fast**: Analysis every 5min, events daily → wastes API/IO. Match freq to event rate.
- **Slow too slow**: Once/day but need same-hour → too slow. Increase freq or urgent shortcut.
- **LLM in fast**: Breaks cost model. Audit fast scripts → 0 LLM. Defer summary to slow.
- **Coupled fast scripts**: 1 depends on another → cascade fail. Keep indep → own source, own section.
- **Silent idle log**: No log → can't distinguish "running idle" vs "crashed". Always log idle.
- **Clear digest on analysis fail**: Source down → no empty write. Slow would skip actual pending. Preserve last good.

## →

- `manage-token-budget` — cost framework du-dum makes practical; du-dum = pattern, budget = accounting
- `circuit-breaker-pattern` — failure case (tools breaking); du-dum = normal case (nothing to do). Together: du-dum idle, circuit-breaker fail
- `observe` — methodology for fast clock; du-dum structures when observes become actionable via digest
- `forage-resources` — strategic explore layer; du-dum = execution rhythm
- `coordinate-reasoning` — stigmergic signaling; digest = stigmergy (indirect coord via env artifact)
