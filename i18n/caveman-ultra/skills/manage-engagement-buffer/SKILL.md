---
name: manage-engagement-buffer
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Manage engagement buffer ingesting, prioritizing, rate-limiting, deduping,
  tracking state for incoming engagement items across platforms. Gen periodic
  digests + enforces cooldown periods. Composes w/ du-dum: du-dum sets
  observation/action cadence, this skill manages queue between beats.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: engagement, buffer, queue, rate-limiting, deduplication, digest, cooldown, autonomous-agents
---

# Manage Engagement Buffer

Ingest, dedup, prioritize, rate-limit incoming engagement items across platforms → hand off compact digest to action clock. Buffer between raw platform signals + deliberate action: absorbs bursts, merges dups, enforces cooldowns, ensures agent acts on highest-value first. W/o buffer → agent either processes in arrival order (missing urgent buried in noise) or attempts everything at once (hitting rate limits + spammy).

Composes w/ `du-dum`: du-dum decides *when* to observe + act; this skill decides *what* deserves action. Buffer = queue accumulating between du-dum's beats.

## Use When

- Autonomous agent receives > engagement than can process per cycle
- Dup / near-dup items waste action budget
- Engagement needs priority ordering before action clock fires
- Cooldowns needed → prevent over-engagement / rate limiting
- Multi platform sources (GitHub, Slack, email) feed single agent's action loop

## In

- **Req**: `buffer_path` — path to JSONL buffer file
- **Opt**: `platform_config` — per-platform rate limits + cooldown settings
- **Opt**: `digest_size` — # top items in digest (default 5)
- **Opt**: `ttl_hours` — TTL for unacted items (default 48)
- **Opt**: `cooldown_minutes` — per-thread cooldown after action (default 60)

## Do

### Step 1: Define Buffer Schema

Design engagement item structure. Each in buffer = single JSON line:

```json
{
  "id": "gh-notif-20260408-001",
  "source": "github:pjt222/agent-almanac",
  "timestamp": "2026-04-08T09:15:00Z",
  "content_summary": "PR #218 review requested by contributor",
  "priority": 4,
  "state": "new",
  "dedup_key": "github:pjt222/agent-almanac:pr-218:contributor-name",
  "thread_id": "pr-218",
  "ttl_hours": 48
}
```

Field definitions:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (source prefix + date + sequence) |
| `source` | string | Platform and channel (`github:repo`, `slack:channel`, `email:inbox`) |
| `timestamp` | ISO 8601 | When the item was ingested |
| `content_summary` | string | One-line description of the engagement item |
| `priority` | int 1-5 | Composite priority (see Step 4) |
| `state` | enum | `new`, `acknowledged`, `acted`, `cooldown`, `merged`, `expired` |
| `dedup_key` | string | Composite key: source + thread + author |
| `thread_id` | string | Conversation thread identifier for cooldown tracking |
| `ttl_hours` | int | Hours until item expires if unacted (default: 48) |

Store JSONL (one JSON per line). Supports append-only writes, line-by-line processing, easy pruning by rewriting w/o expired lines.

→ JSONL buffer init at `buffer_path` w/ schema documented. Stable enough to support downstream.

**If err:** Buffer file can't be created (perms, path) → fallback in-mem list for current cycle + log err. Don't silently drop items.

### Step 2: Implement Ingestion

Accept items from platform adapters → append to buffer w/ initial priority.

Priority by item type:

| Type | Priority | Rationale |
|------|----------|-----------|
| Direct mention (@agent) | 5 | Someone explicitly asked for attention |
| Review request | 4 | Blocking someone else's work |
| Reply in tracked thread | 3 | Active conversation the agent participates in |
| Notification (assigned, subscribed) | 2 | Informational, may require action |
| Broadcast (release, announcement) | 1 | Awareness only, rarely actionable |

Per incoming:

1. Construct item JSON from schema
2. Assign initial priority
3. Set `state=new`
4. Set `timestamp` = UTC now
5. Gen `dedup_key` from source + thread + author
6. Append JSON line to buffer file

```
# Pseudocode: ingest from GitHub adapter
for notification in github_adapter.fetch():
    item = build_item(notification)
    item.priority = priority_by_type(notification.reason)
    item.state = "new"
    append_jsonl(buffer_path, item)
    log("ingested {item.id} priority={item.priority}")
```

→ New items in buffer w/ correct priorities + `state=new`. Each adapter produces well-formed items independently — failures don't block others.

**If err:** Platform adapter fails (auth expired, rate limited, network down) → log + skip source for cycle. Don't clear existing — stale > empty.

### Step 3: Dedupe

Scan buffer for items sharing `dedup_key` within configurable window (default 24h). Keep highest-priority, mark others merged.

1. Group by `dedup_key`
2. Per group → sort priority desc, timestamp desc
3. Keep first (highest priority, most recent); mark rest `state=merged`
4. Detect thread bursts: same `thread_id` w/ diff authors within 1h = burst → consolidate into single item w/ participant count appended to `content_summary`

```
# Dedup logic
groups = group_by(buffer, "dedup_key", window_hours=24)
for key, items in groups:
    if len(items) > 1:
        keeper = max(items, key=lambda i: (i.priority, i.timestamp))
        for item in items:
            if item.id != keeper.id:
                item.state = "merged"

# Thread burst detection
thread_groups = group_by(buffer, "thread_id", window_hours=1)
for thread_id, items in thread_groups:
    active_items = [i for i in items if i.state == "new"]
    if len(active_items) >= 3:
        keeper = max(active_items, key=lambda i: i.priority)
        keeper.content_summary += f" ({len(active_items)} participants)"
        for item in active_items:
            if item.id != keeper.id:
                item.state = "merged"
```

→ Buffer has no dup `dedup_key` w/in window. Thread bursts collapsed into single items w/ participant counts. Merged remain in file (audit) but excluded from downstream.

**If err:** Dedup produces unexpected merges (legit distinct items sharing key) → narrow dedup window / refine key construction. Adding content hash distinguishes items sharing source+thread+author but diff content.

### Step 4: Prioritize

Re-sort by composite score (recency decay + escalation).

Composite score formula:

```
score = base_priority * recency_weight * escalation_factor

recency_weight = 0.9 ^ hours_since_ingestion
escalation_factor = 1.0 + (resubmission_count * 0.2)

# Cap effective priority at 5
effective_priority = min(5, score)
```

Behavior:

- P-3 item 0h ago: `3 * 1.0 * 1.0 = 3.0`
- P-3 item 8h ago: `3 * 0.43 * 1.0 = 1.29` (decayed below P-2)
- P-2 resubmitted 2×: `2 * 1.0 * 1.4 = 2.8` (escalated near P-3)

Sort `state=new` items by `effective_priority` desc. Sorted order → digest (Step 6).

→ Buffer sorted by score. Fresh high-priority at top. Old decayed. Resubmitted escalated. No item > 5.

**If err:** Scoring produces unintuitive rankings (1h-old P-2 > fresh P-3) → adjust decay. 0.95/h gentler; 0.85/h aggressive. Tune to match tempo.

### Step 5: Rate Limits + Cooldowns

Prevent over-engaging → per-platform write limits + per-thread cooldowns.

**Per-platform** (via `platform_config`):

| Platform | Default limit | Window |
|----------|--------------|--------|
| GitHub comments | 1 per 20 seconds | rolling |
| GitHub reviews | 3 per hour | rolling |
| Slack messages | 1 per 10 seconds | rolling |
| Email replies | 5 per hour | rolling |

**Per-thread cooldown:** After acting → thread in cooldown for `cooldown_minutes` (default 60). During cooldown, new items for thread ingested but not surfaced in digest.

**Err backoff:** On 429/rate-limit from platform → double cooldown for that platform. Reset to default after successful action.

```
# Rate limit check before action
def can_act(platform, thread_id):
    if rate_limit_exceeded(platform):
        return False, "rate limited"
    if thread_in_cooldown(thread_id):
        return False, "thread cooldown active"
    return True, "clear"

# After action
def record_action(platform, thread_id):
    increment_rate_counter(platform)
    set_cooldown(thread_id, cooldown_minutes)

# After rate-limit error
def handle_rate_error(platform):
    current_cooldown = get_platform_cooldown(platform)
    set_platform_cooldown(platform, current_cooldown * 2)
```

→ Agent never exceeds rate limits. Threads have cooldowns. Rate-limit errs → auto backoff. Buffer accumulates during cooldown w/o losing items.

**If err:** Rate limits hit despite enforcement (clock skew, concurrent agents) → increase safety margin → limits to 80% of actual. Cooldowns too aggressive (missing time-sensitive threads) → reduce `cooldown_minutes` for high-priority only.

### Step 6: Gen Digest

Produce compact summary for du-dum's action beat. Digest = handoff point: du-dum reads this, not raw buffer.

Digest contents:

1. **Total pending**: count of `state=new`
2. **Top-N**: highest-priority (default N=5 from `digest_size`)
3. **Expiring soon**: items w/in 20% of TTL
4. **Threads in cooldown**: active cooldowns + time remaining
5. **Buffer health**: total items, merged count, expired count

```markdown
# Engagement Digest — 2026-04-08T12:00:00Z

## Pending: 12 items

### Top 5 by Priority
| # | Priority | Source | Summary | Age |
|---|----------|--------|---------|-----|
| 1 | 5.0 | github:pr-218 | Review requested by contributor | 2h |
| 2 | 4.2 | github:issue-99 | Maintainer question (escalated) | 6h |
| 3 | 3.0 | slack:dev | Build failure alert | 1h |
| 4 | 2.8 | github:pr-215 | CI check feedback (3 participants) | 3h |
| 5 | 2.1 | email:inbox | Collaboration inquiry | 8h |

### Expiring Soon
- github:issue-85 — 4h remaining (TTL 48h, ingested 44h ago)

### Cooldowns Active
- pr-210: 22 min remaining
- issue-92: 45 min remaining

### Buffer Health
- Total items: 47 | New: 12 | Merged: 18 | Acted: 11 | Expired: 6
```

Write digest to known path (e.g., `buffer_path.digest.md`) that du-dum's action clock reads.

→ Digest < 50 lines du-dum can parse in one read. Enough info to decide what to act on, not full buffer. Nothing pending → digest says so clearly.

**If err:** Digest > 50 lines → reduce `digest_size` / summarize expiring+cooldown sections aggressively. Digest = summary — approaches buffer size → lost purpose.

### Step 7: Track State Transitions

After du-dum processes items from digest → update states + maintain audit.

State machine:

```
new → acknowledged → acted → cooldown → expired
         ↑                       │
         └───── (re-ingested) ───┘

merged → (terminal, no further transitions)
expired → (terminal, archived)
```

Per transition:

1. Update `state` in buffer file
2. Append transition log: `{"item_id": "...", "from": "new", "to": "acknowledged", "timestamp": "...", "reason": "du-dum digest pickup"}`
3. After acting → set thread cooldown (feeds back to Step 5)

**Retention + pruning:**

- Archive `state=acted` / `state=expired` older than 7 days (configurable)
- Archive by moving to separate file (`buffer_path.archive.jsonl`), not delete
- Prune `state=merged` older than 24h (served dedup purpose)
- Run pruning at end of cycle, after state updates

```
# End-of-cycle maintenance
for item in buffer:
    if item.state == "new" and age_hours(item) > item.ttl_hours:
        transition(item, "expired", reason="TTL exceeded")
    if item.state in ("acted", "expired") and age_days(item) > retention_days:
        archive(item)
    if item.state == "merged" and age_hours(item) > 24:
        archive(item)
rewrite_buffer(buffer_path, active_items_only)
```

→ Every transition logged w/ timestamp + reason. Buffer file has only active items (new, acknowledged, cooldown). Archived preserved separately for audit. Buffer doesn't grow unbounded.

**If err:** Buffer corrupted during rewrite (partial write, crash) → restore from pre-rewrite backup. Always write temp + atomic rename — never rewrite in place. Archive too large → compress / rotate monthly.

## Check

- [ ] Schema incl all req fields (id, source, timestamp, content_summary, priority, state, dedup_key, thread_id, ttl_hours)
- [ ] Ingestion assigns correct initial priorities by type
- [ ] Dedup merges items sharing dedup_key w/in window
- [ ] Thread bursts detected + consolidated w/ participant counts
- [ ] Composite scoring applies recency decay + escalation, capped at 5
- [ ] Per-platform rate limits enforced before write action
- [ ] Per-thread cooldowns prevent re-engagement w/in window
- [ ] Digest compact (<50 lines), top-N, clear empty state
- [ ] State transitions logged w/ timestamps for audit
- [ ] Expired + acted items archived, not deleted
- [ ] Buffer doesn't grow unbounded over cycles

## Traps

- **No TTL**: Buffer grows unbounded; stale crowds out fresh. Every item needs TTL + pruning runs every cycle.
- **Ignore thread cooldowns**: Rapid-fire replies in same thread feel spammy. Cooldowns = social norm, not just rate-limit technicality.
- **Priority w/o decay**: Old high-priority block newer indefinitely. Decay ensures buffer reflects current relevance, not historical importance.
- **Dedup window too narrow**: 1h misses dups arriving hours apart (notification + reminder). Start 24h, narrow only if legit items merged incorrectly.
- **Couple buffer to single platform**: Design adapter pattern from start. Each platform adapter produces std buffer items; buffer itself platform-agnostic.
- **Skip digest step**: Du-dum needs summary, not raw buffer. Passing full buffer defeats two-clock architecture — action clock reads compact digest + decides quickly.

## →

- `du-dum` — cadence pattern this buffer composes w/; du-dum decides when, this skill decides what
- `manage-token-budget` — cost accounting; buffer respects token budget when sizing digests + limiting action throughput
- `circuit-breaker-pattern` — failure handling for platform adapters feeding buffer; circuit opens → ingestion degrades gracefully
- `coordinate-reasoning` — stigmergic signals between buffer + action systems; buffer file itself = stigmergic artifact
- `forage-resources` — discovery of new engagement sources → feed buffer's ingestion adapters
