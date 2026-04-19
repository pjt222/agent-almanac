---
name: manage-engagement-buffer
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Ingest, deduplicate, prioritize, and rate-limit incoming engagement items across platforms, then hand off a compact digest to the action clock. The buffer sits between raw platform signals and deliberate action: it absorbs bursts, merges duplicates, enforces cooldowns, and ensures the agent acts on the highest-value items first. Without a buffer, an autonomous agent either processes items in arrival order (missing urgent ones buried in noise) or attempts everything at once (hitting rate limits and appearing spammy).

This skill composes with `du-dum`: du-dum decides *when* to observe and act; this skill decides *what* deserves action. The buffer is the queue that accumulates between du-dum's beats.

## When to Use

- An autonomous agent receives more engagement than it can process per cycle
- Duplicate or near-duplicate items waste the action budget
- Engagement needs priority ordering before the action clock fires
- Cooldown periods are needed to prevent over-engagement or rate limiting
- Multiple platform sources (GitHub, Slack, email) feed into a single agent's action loop

## Inputs

- **Required**: `buffer_path` — path to the JSONL buffer file
- **Optional**: `platform_config` — per-platform rate limits and cooldown settings
- **Optional**: `digest_size` — number of top items in digest (default: 5)
- **Optional**: `ttl_hours` — time-to-live for unacted items (default: 48)
- **Optional**: `cooldown_minutes` — per-thread cooldown after action (default: 60)

## Procedure

### Step 1: Define Buffer Schema

Design the engagement item structure. Each item in the buffer is a single JSON line with these fields:

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

Store as a JSON Lines file (one JSON object per line). This format supports append-only writes, line-by-line processing, and easy pruning by rewriting without the expired lines.

**Expected:** A JSONL buffer file initialized at `buffer_path` with the schema documented in a companion comment or header. The schema is stable enough to support all downstream steps.

**On failure:** If the buffer file cannot be created (permissions, path issues), fall back to an in-memory list for the current cycle and log the file system error. Do not silently drop items — buffer them somewhere, even temporarily.

### Step 2: Implement Ingestion

Accept items from platform adapters and append them to the buffer with initial priority assignments.

Priority assignment by item type:

| Type | Priority | Rationale |
|------|----------|-----------|
| Direct mention (@agent) | 5 | Someone explicitly asked for attention |
| Review request | 4 | Blocking someone else's work |
| Reply in tracked thread | 3 | Active conversation the agent participates in |
| Notification (assigned, subscribed) | 2 | Informational, may require action |
| Broadcast (release, announcement) | 1 | Awareness only, rarely actionable |

For each incoming item:

1. Construct the item JSON with fields from the schema
2. Assign initial priority based on the type table above
3. Set `state` to `new`
4. Set `timestamp` to current UTC time
5. Generate `dedup_key` from source + thread + author
6. Append the JSON line to the buffer file

```
# Pseudocode: ingest from GitHub adapter
for notification in github_adapter.fetch():
    item = build_item(notification)
    item.priority = priority_by_type(notification.reason)
    item.state = "new"
    append_jsonl(buffer_path, item)
    log("ingested {item.id} priority={item.priority}")
```

**Expected:** New items appear in the buffer file with correct priorities and `state=new`. Each adapter produces well-formed items independently — adapter failures do not block other adapters.

**On failure:** If a platform adapter fails (auth expired, rate limited, network down), log the failure and skip that source for this cycle. Do not clear existing buffer items — stale items from a previous successful fetch are better than an empty buffer.

### Step 3: Deduplicate

Scan the buffer for items sharing the same `dedup_key` within a configurable window (default: 24 hours). Keep the highest-priority instance and mark others as merged.

1. Group items by `dedup_key`
2. Within each group, sort by priority descending, then timestamp descending
3. Keep the first item (highest priority, most recent); mark the rest as `state=merged`
4. Detect thread bursts: same `thread_id` with different authors within 1 hour indicates a burst of activity — consolidate into a single item with a participant count appended to `content_summary`

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

**Expected:** The buffer contains no duplicate `dedup_key` entries within the window. Thread bursts are collapsed into single items with participant counts. The merged items remain in the file (for audit) but are excluded from downstream processing.

**On failure:** If deduplication produces unexpected merges (legitimate distinct items sharing a key), narrow the dedup window or refine the key construction. Adding a content hash to the dedup key can distinguish items that share source + thread + author but have genuinely different content.

### Step 4: Prioritize

Re-sort the buffer by composite score incorporating recency decay and escalation.

Composite score formula:

```
score = base_priority * recency_weight * escalation_factor

recency_weight = 0.9 ^ hours_since_ingestion
escalation_factor = 1.0 + (resubmission_count * 0.2)

# Cap effective priority at 5
effective_priority = min(5, score)
```

Behavior:

- A priority-3 item ingested 0 hours ago: `3 * 1.0 * 1.0 = 3.0`
- A priority-3 item ingested 8 hours ago: `3 * 0.43 * 1.0 = 1.29` (decayed below priority-2 items)
- A priority-2 item resubmitted twice: `2 * 1.0 * 1.4 = 2.8` (escalated near priority-3)

Sort all `state=new` items by `effective_priority` descending. This sorted order is what the digest (Step 6) presents to du-dum.

**Expected:** The buffer is sorted by composite score. Fresh high-priority items are at the top. Old items have decayed. Resubmitted items have escalated. No item exceeds priority 5.

**On failure:** If the scoring formula produces unintuitive rankings (e.g., a 1-hour-old priority-2 item ranks above a fresh priority-3 item), adjust the decay rate. A decay of 0.95 per hour is gentler; 0.85 per hour is more aggressive. Tune to match the engagement tempo.

### Step 5: Enforce Rate Limits and Cooldowns

Prevent the agent from over-engaging by enforcing per-platform write limits and per-thread cooldowns.

**Per-platform rate limits** (configurable via `platform_config`):

| Platform | Default limit | Window |
|----------|--------------|--------|
| GitHub comments | 1 per 20 seconds | rolling |
| GitHub reviews | 3 per hour | rolling |
| Slack messages | 1 per 10 seconds | rolling |
| Email replies | 5 per hour | rolling |

**Per-thread cooldown:** After the agent acts on a thread, that thread enters cooldown for `cooldown_minutes` (default: 60). During cooldown, new items for that thread are ingested but not surfaced in the digest.

**Error backoff:** On receiving a 429/rate-limit response from any platform, double the cooldown for that platform. Reset to default after a successful action.

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

**Expected:** The agent never exceeds platform rate limits. Threads have enforced cooldown periods. Rate-limit errors trigger automatic backoff. The buffer accumulates items during cooldown without losing them.

**On failure:** If rate limits are hit despite enforcement (clock skew, concurrent agents), increase the safety margin — set limits to 80% of the platform's actual limit. If cooldowns are too aggressive (missing time-sensitive threads), reduce `cooldown_minutes` for high-priority threads only.

### Step 6: Generate Digest

Produce a compact summary for du-dum's action beat. The digest is the handoff point: du-dum reads this, not the raw buffer.

Digest contents:

1. **Total pending**: count of `state=new` items
2. **Top-N items**: the highest-priority items (default N=5 from `digest_size`)
3. **Expiring soon**: items within 20% of their TTL
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

Write the digest to a known path (e.g., `buffer_path.digest.md`) that du-dum's action clock reads.

**Expected:** A digest under 50 lines that du-dum can parse in one read. The digest contains enough information to decide what to act on, but not the full buffer. If nothing is pending, the digest says so clearly.

**On failure:** If the digest grows beyond 50 lines, reduce `digest_size` or summarize the expiring/cooldown sections more aggressively. The digest is a summary — if it approaches the size of the buffer, it has lost its purpose.

### Step 7: Track State Transitions

After du-dum processes items from the digest, update their states and maintain the audit trail.

State machine:

```
new → acknowledged → acted → cooldown → expired
         ↑                       │
         └───── (re-ingested) ───┘

merged → (terminal, no further transitions)
expired → (terminal, archived)
```

For each state transition:

1. Update the item's `state` field in the buffer file
2. Append a transition log entry: `{"item_id": "...", "from": "new", "to": "acknowledged", "timestamp": "...", "reason": "du-dum digest pickup"}`
3. After acting, set the thread cooldown (feeds back into Step 5)

**Retention and pruning:**

- Archive items with `state=acted` or `state=expired` older than 7 days (configurable)
- Archive by moving to a separate file (`buffer_path.archive.jsonl`), not deleting
- Prune `state=merged` items older than 24 hours (they have served their dedup purpose)
- Run pruning at the end of each cycle, after state updates

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

**Expected:** Every state transition is logged with a timestamp and reason. The buffer file contains only active items (new, acknowledged, cooldown). Archived items are preserved separately for audit. The buffer does not grow unbounded.

**On failure:** If the buffer file becomes corrupted during rewrite (partial write, crash), restore from the pre-rewrite backup. Always write to a temp file and atomically rename — never rewrite in place. If the archive grows too large, compress or rotate it monthly.

## Validation

- [ ] Buffer schema includes all required fields (id, source, timestamp, content_summary, priority, state, dedup_key, thread_id, ttl_hours)
- [ ] Ingestion assigns correct initial priorities by item type
- [ ] Deduplication merges items sharing a dedup_key within the configured window
- [ ] Thread bursts are detected and consolidated with participant counts
- [ ] Composite scoring applies recency decay and escalation, capped at priority 5
- [ ] Per-platform rate limits are enforced before any write action
- [ ] Per-thread cooldowns prevent re-engagement within the cooldown window
- [ ] Digest is compact (<50 lines), includes top-N items, and has a clear empty state
- [ ] State transitions are logged with timestamps for audit
- [ ] Expired and acted items are archived, not deleted
- [ ] Buffer file does not grow unbounded over multiple cycles

## Common Pitfalls

- **No TTL on items**: The buffer grows unbounded; stale items crowd out fresh ones. Every item needs a TTL, and the pruning step must run every cycle.
- **Ignoring thread cooldowns**: Rapid-fire replies in the same thread feel spammy to other participants. Cooldowns are a social norm, not just a rate-limit technicality.
- **Priority without decay**: Old high-priority items block newer ones indefinitely. Recency decay ensures the buffer reflects current relevance, not historical importance.
- **Dedup window too narrow**: A 1-hour window misses duplicates that arrive hours apart (e.g., a notification followed by a reminder). Start with 24 hours and narrow only if legitimate items are being merged incorrectly.
- **Coupling buffer logic to a single platform**: Design for the adapter pattern from the start. Each platform adapter produces standard buffer items; the buffer itself is platform-agnostic.
- **Skipping the digest step**: Du-dum needs a summary, not the raw buffer. Passing the full buffer to the action clock defeats the purpose of the two-clock architecture — the action clock should read a compact digest and decide quickly.

## Related Skills

- `du-dum` — cadence pattern this buffer composes with; du-dum decides *when* to observe and act, this skill decides *what* deserves action
- `manage-token-budget` — cost accounting; the buffer respects token budget constraints when sizing digests and limiting action throughput
- `circuit-breaker-pattern` — failure handling for platform adapters feeding the buffer; when an adapter's circuit opens, ingestion degrades gracefully
- `coordinate-reasoning` — stigmergic signals between buffer and action systems; the buffer file itself is a stigmergic artifact
- `forage-resources` — discovery of new engagement sources to feed into the buffer's ingestion adapters
