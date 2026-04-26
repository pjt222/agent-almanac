---
name: manage-engagement-buffer
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Manage an engagement buffer that ingests, prioritizes, rate-limits,
  deduplicates, and tracks state for incoming engagement items across
  platforms. Generates periodic digests and enforces cooldown periods.
  Composes with du-dum: du-dum sets the observation/action cadence,
  this skill manages the queue between beats.
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

Ingest, deduplicate, prioritize, rate-limit incoming engagement items across platforms. Hand off compact digest to action clock. Buffer sits between raw platform signals and deliberate action: absorbs bursts, merges duplicates, enforces cooldowns, ensures agent acts on highest-value items first. Without buffer, autonomous agent either processes items in arrival order (missing urgent ones buried in noise) or attempts everything at once (hitting rate limits and appearing spammy).

Skill composes with `du-dum`: du-dum decides *when* to observe and act. This skill decides *what* deserves action. Buffer is queue accumulating between du-dum's beats.

## When Use

- Autonomous agent receives more engagement than it can process per cycle
- Duplicate or near-duplicate items waste action budget
- Engagement needs priority ordering before action clock fires
- Cooldown periods needed to prevent over-engagement or rate limiting
- Multiple platform sources (GitHub, Slack, email) feed into single agent's action loop

## Inputs

- **Required**: `buffer_path` — path to JSONL buffer file
- **Optional**: `platform_config` — per-platform rate limits and cooldown settings
- **Optional**: `digest_size` — number of top items in digest (default: 5)
- **Optional**: `ttl_hours` — time-to-live for unacted items (default: 48)
- **Optional**: `cooldown_minutes` — per-thread cooldown after action (default: 60)

## Steps

### Step 1: Define Buffer Schema

Design engagement item structure. Each item in buffer is single JSON line with these fields:

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
| `timestamp` | ISO 8601 | When item was ingested |
| `content_summary` | string | One-line description of engagement item |
| `priority` | int 1-5 | Composite priority (see Step 4) |
| `state` | enum | `new`, `acknowledged`, `acted`, `cooldown`, `merged`, `expired` |
| `dedup_key` | string | Composite key: source + thread + author |
| `thread_id` | string | Conversation thread identifier for cooldown tracking |
| `ttl_hours` | int | Hours until item expires if unacted (default: 48) |

Store as JSON Lines file (one JSON object per line). Format supports append-only writes, line-by-line processing, easy pruning by rewriting without expired lines.

**Got:** JSONL buffer file initialized at `buffer_path` with schema documented in companion comment or header. Schema stable enough to support all downstream steps.

**If fail:** Buffer file cannot be created (permissions, path issues)? Fall back to in-memory list for current cycle. Log file system error. Do not silently drop items — buffer them somewhere, even temporarily.

### Step 2: Implement Ingestion

Accept items from platform adapters. Append to buffer with initial priority assignments.

Priority assignment by item type:

| Type | Priority | Rationale |
|------|----------|-----------|
| Direct mention (@agent) | 5 | Someone explicitly asked for attention |
| Review request | 4 | Blocking someone else's work |
| Reply in tracked thread | 3 | Active conversation agent participates in |
| Notification (assigned, subscribed) | 2 | Informational, may require action |
| Broadcast (release, announcement) | 1 | Awareness only, rarely actionable |

For each incoming item:

1. Construct item JSON with fields from schema
2. Assign initial priority based on type table above
3. Set `state` to `new`
4. Set `timestamp` to current UTC time
5. Generate `dedup_key` from source + thread + author
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

**Got:** New items appear in buffer file with correct priorities and `state=new`. Each adapter produces well-formed items independently — adapter failures do not block other adapters.

**If fail:** Platform adapter fails (auth expired, rate limited, network down)? Log failure, skip that source for this cycle. Do not clear existing buffer items — stale items from previous successful fetch better than empty buffer.

### Step 3: Deduplicate

Scan buffer for items sharing same `dedup_key` within configurable window (default: 24 hours). Keep highest-priority instance. Mark others as merged.

1. Group items by `dedup_key`
2. Within each group, sort by priority descending, then timestamp descending
3. Keep first item (highest priority, most recent). Mark rest as `state=merged`
4. Detect thread bursts: same `thread_id` with different authors within 1 hour = burst of activity. Consolidate into single item with participant count appended to `content_summary`

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

**Got:** Buffer contains no duplicate `dedup_key` entries within window. Thread bursts collapsed into single items with participant counts. Merged items remain in file (for audit) but excluded from downstream processing.

**If fail:** Deduplication produces unexpected merges (legitimate distinct items sharing key)? Narrow dedup window or refine key construction. Adding content hash to dedup key can distinguish items sharing source + thread + author but with genuinely different content.

### Step 4: Prioritize

Re-sort buffer by composite score incorporating recency decay and escalation.

Composite score formula:

```
score = base_priority * recency_weight * escalation_factor

recency_weight = 0.9 ^ hours_since_ingestion
escalation_factor = 1.0 + (resubmission_count * 0.2)

# Cap effective priority at 5
effective_priority = min(5, score)
```

Behavior:

- Priority-3 item ingested 0 hours ago: `3 * 1.0 * 1.0 = 3.0`
- Priority-3 item ingested 8 hours ago: `3 * 0.43 * 1.0 = 1.29` (decayed below priority-2 items)
- Priority-2 item resubmitted twice: `2 * 1.0 * 1.4 = 2.8` (escalated near priority-3)

Sort all `state=new` items by `effective_priority` descending. Sorted order = what digest (Step 6) presents to du-dum.

**Got:** Buffer sorted by composite score. Fresh high-priority items at top. Old items decayed. Resubmitted items escalated. No item exceeds priority 5.

**If fail:** Scoring formula produces unintuitive rankings (e.g., 1-hour-old priority-2 item ranks above fresh priority-3 item)? Adjust decay rate. Decay of 0.95 per hour gentler. 0.85 per hour more aggressive. Tune to match engagement tempo.

### Step 5: Enforce Rate Limits and Cooldowns

Prevent agent from over-engaging by enforcing per-platform write limits and per-thread cooldowns.

**Per-platform rate limits** (configurable via `platform_config`):

| Platform | Default limit | Window |
|----------|--------------|--------|
| GitHub comments | 1 per 20 seconds | rolling |
| GitHub reviews | 3 per hour | rolling |
| Slack messages | 1 per 10 seconds | rolling |
| Email replies | 5 per hour | rolling |

**Per-thread cooldown:** After agent acts on thread, that thread enters cooldown for `cooldown_minutes` (default: 60). During cooldown, new items for that thread are ingested but not surfaced in digest.

**Error backoff:** On receiving 429/rate-limit response from any platform, double cooldown for that platform. Reset to default after successful action.

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

**Got:** Agent never exceeds platform rate limits. Threads have enforced cooldown periods. Rate-limit errors trigger automatic backoff. Buffer accumulates items during cooldown without losing them.

**If fail:** Rate limits hit despite enforcement (clock skew, concurrent agents)? Increase safety margin — set limits to 80% of platform's actual limit. Cooldowns too aggressive (missing time-sensitive threads)? Reduce `cooldown_minutes` for high-priority threads only.

### Step 6: Generate Digest

Produce compact summary for du-dum's action beat. Digest = handoff point. Du-dum reads this, not raw buffer.

Digest contents:

1. **Total pending**: count of `state=new` items
2. **Top-N items**: highest-priority items (default N=5 from `digest_size`)
3. **Expiring soon**: items within 20% of TTL
4. **Threads in cooldown**: active cooldowns with time remaining
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

**Got:** Digest under 50 lines that du-dum can parse in one read. Contains enough information to decide what to act on, but not full buffer. Nothing pending? Digest says so clearly.

**If fail:** Digest grows beyond 50 lines? Reduce `digest_size` or summarize expiring/cooldown sections more aggressively. Digest is summary — approaches size of buffer, it has lost purpose.

### Step 7: Track State Transitions

After du-dum processes items from digest, update states and maintain audit trail.

State machine:

```
new → acknowledged → acted → cooldown → expired
         ↑                       │
         └───── (re-ingested) ───┘

merged → (terminal, no further transitions)
expired → (terminal, archived)
```

For each state transition:

1. Update item's `state` field in buffer file
2. Append transition log entry: `{"item_id": "...", "from": "new", "to": "acknowledged", "timestamp": "...", "reason": "du-dum digest pickup"}`
3. After acting, set thread cooldown (feeds back into Step 5)

**Retention and pruning:**

- Archive items with `state=acted` or `state=expired` older than 7 days (configurable)
- Archive by moving to separate file (`buffer_path.archive.jsonl`), not deleting
- Prune `state=merged` items older than 24 hours (served dedup purpose)
- Run pruning at end of each cycle, after state updates

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

**Got:** Every state transition logged with timestamp and reason. Buffer file contains only active items (new, acknowledged, cooldown). Archived items preserved separately for audit. Buffer does not grow unbounded.

**If fail:** Buffer file becomes corrupted during rewrite (partial write, crash)? Restore from pre-rewrite backup. Always write to temp file and atomically rename — never rewrite in place. Archive grows too large? Compress or rotate it monthly.

## Checks

- [ ] Buffer schema includes all required fields (id, source, timestamp, content_summary, priority, state, dedup_key, thread_id, ttl_hours)
- [ ] Ingestion assigns correct initial priorities by item type
- [ ] Deduplication merges items sharing dedup_key within configured window
- [ ] Thread bursts detected and consolidated with participant counts
- [ ] Composite scoring applies recency decay and escalation, capped at priority 5
- [ ] Per-platform rate limits enforced before any write action
- [ ] Per-thread cooldowns prevent re-engagement within cooldown window
- [ ] Digest compact (<50 lines), includes top-N items, has clear empty state
- [ ] State transitions logged with timestamps for audit
- [ ] Expired and acted items archived, not deleted
- [ ] Buffer file does not grow unbounded over multiple cycles

## Pitfalls

- **No TTL on items**: Buffer grows unbounded. Stale items crowd out fresh ones. Every item needs TTL, and pruning step must run every cycle.
- **Ignoring thread cooldowns**: Rapid-fire replies in same thread feel spammy to other participants. Cooldowns are social norm, not just rate-limit technicality.
- **Priority without decay**: Old high-priority items block newer ones indefinitely. Recency decay ensures buffer reflects current relevance, not historical importance.
- **Dedup window too narrow**: 1-hour window misses duplicates arriving hours apart (e.g., notification followed by reminder). Start with 24 hours, narrow only if legitimate items being merged incorrectly.
- **Coupling buffer logic to single platform**: Design for adapter pattern from start. Each platform adapter produces standard buffer items. Buffer itself platform-agnostic.
- **Skipping digest step**: Du-dum needs summary, not raw buffer. Passing full buffer to action clock defeats purpose of two-clock architecture — action clock should read compact digest and decide quickly.

## See Also

- `du-dum` — cadence pattern this buffer composes with. Du-dum decides *when* to observe and act. This skill decides *what* deserves action
- `manage-token-budget` — cost accounting. Buffer respects token budget constraints when sizing digests and limiting action throughput
- `circuit-breaker-pattern` — failure handling for platform adapters feeding buffer. When adapter's circuit opens, ingestion degrades gracefully
- `coordinate-reasoning` — stigmergic signals between buffer and action systems. Buffer file itself is stigmergic artifact
- `forage-resources` — discovery of new engagement sources to feed into buffer's ingestion adapters
