---
name: manage-token-budget
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Monitor, cap, and recover from context accumulation in agentic systems.
  Covers per-cycle cost tracking, context window auditing, budget caps with
  enforcement policies, emergency pruning when approaching limits, and
  progressive disclosure integration to minimize token spend on routing.
  Use when running long-lived agent loops (heartbeats, polling, autonomous
  workflows), when context windows are growing unpredictably between cycles,
  when API costs spike beyond expected baselines, when designing new agentic
  workflows that need cost guardrails from the start, or when post-mortem
  analysis reveals a cost incident caused by context accumulation.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: token-management, cost-optimization, context-window, budget, progressive-disclosure
---

# Manage Token Budget

Control cost + ctx footprint of agentic systems → track tokens/cycle, audit ctx, enforce caps, prune low-value, route via metadata before full procs. Core: every token earns place. Inform decisions = stay; occupy space without influence = prune.

Community evidence: 37hr autonomous session = $13.74 from 30min heartbeat + verbose system instructions + unchecked ctx accumulation. Fix: 4hr intervals + notification-only + no feed browsing. This skill codifies prevention patterns.

## Use When

- Long-lived agent loops (heartbeats, polling, autonomous workflows) → costs compound
- Ctx windows grow unpredictably between cycles
- API costs spike past baseline → post-mortem
- New workflow → need cost guardrails from start
- Post-incident audit
- System prompts/memory/tool schemas dominate ctx

## In

- **Required**: System/workflow to budget (running or planned)
- **Required**: Budget ceiling ($/period or token/cycle)
- **Optional**: Cost data (API logs, billing)
- **Optional**: Model ctx window size
- **Optional**: Degradation policy (what drops at limit)

## Do

### Step 1: Per-Cycle Cost Tracking

Instrument loop → log tokens at every boundary.

Per cycle capture:

1. **Input tokens**: system prompt + memory + tool schemas + history + new content
2. **Output tokens**: model res incl. tool calls
3. **Total cost**: in × in_price + out × out_price
4. **Timestamp**: when ran
5. **Trigger**: timer/event/user

Store structured (JSONL, CSV, DB) — NOT in ctx window:

```
{"cycle": 47, "ts": "2026-03-12T14:30:00Z", "trigger": "heartbeat",
 "input_tokens": 18420, "output_tokens": 2105, "cost_usd": 0.0891,
 "cumulative_cost_usd": 3.42}
```

No instrumentation → estimate from billing:
- Total / cycles = avg/cycle
- Compare baseline (pricing × ctx size)

→ Per-cycle log w/ tokens + costs, granular enough to find expensive cycles. Log lives outside ctx.

If err: no token counts (some APIs lack metadata) → billing → averages. Coarse tracking (daily $/daily cycles) reveals trends. None possible → Step 2 + estimate from ctx size.

### Step 2: Audit Ctx Window

Measure occupants, rank by size.

Decompose:

1. **System prompt**: base instructions, CLAUDE.md, personality
2. **Memory**: MEMORY.md, auto-loaded topic files
3. **Tool schemas**: MCP server defs, fn calling
4. **Skill procs**: full SKILL.md loaded
5. **History**: prior turns
6. **Dynamic**: tool outs, file content, search results

Budget table:

```
Context Budget Audit:
+------------------------+--------+------+-----------------------------------+
| Component              | Tokens | %    | Notes                             |
+------------------------+--------+------+-----------------------------------+
| System prompt          | 4,200  | 21%  | Includes CLAUDE.md chain          |
| Memory (auto-loaded)   | 3,800  | 19%  | MEMORY.md + 4 topic files         |
| Tool schemas           | 2,600  | 13%  | 3 MCP servers, 47 tools           |
| Active skill procedure | 1,900  |  9%  | Full SKILL.md loaded              |
| Conversation history   | 5,100  | 25%  | 12 prior turns                    |
| Current cycle content  | 2,400  | 12%  | Tool outputs from this cycle      |
+------------------------+--------+------+-----------------------------------+
| TOTAL                  | 20,000 | 100% | Model limit: 200,000             |
| Remaining headroom     |180,000 |      |                                   |
+------------------------+--------+------+-----------------------------------+
```

Flag oversize vs. decision value. 4k-token memory unused this task = pure overhead.

→ Ranked table per consumer + size + %. ≥1 component stands out (usually history or verbose tool outs).

If err: hard to count → char/4 for English, char/3 for JSON/YAML. Goal = relative rank, not exact.

### Step 3: Budget Caps + Enforcement

Hard + soft limits, action per limit.

1. **Soft limit** (warn): 60-75% of hard. Hit:
   - Log warn w/ usage + remaining
   - Begin voluntary prune (Step 4) low-value first
   - Reduce frequency (e.g., 30min → 2hr)
   - Continue degraded

2. **Hard limit** (stop): absolute max. Hit:
   - Halt autonomous immediately
   - Alert operator (notify, email, log)
   - Preserve state summary
   - No new cycle till human authorizes

3. **Per-cycle cap**: max per single cycle. Stops runaway:
   - Truncate tool outs or skip low-pri actions
   - Log truncation

Doc in workflow config:

```yaml
token_budget:
  soft_limit_usd: 5.00        # warn and begin pruning
  hard_limit_usd: 10.00       # halt and alert
  per_cycle_cap_usd: 0.50     # max per individual cycle
  soft_limit_pct: 70           # % of context window triggering pruning
  hard_limit_pct: 90           # % of context window triggering halt
  enforcement: strict          # strict = halt on hard limit; advisory = log only
  alert_channel: notification  # how to notify the operator
```

→ Caps doc'd at 3 levels (soft/hard/per-cycle) + explicit actions. Policy answers "what at limit?" before limit.

If err: $ premature → ctx-% only (soft 70%, hard 90%) + add $ after 24-48hr data. Advisory mode (log no halt) OK during calibration.

### Step 4: Emergency Prune

At limits, drop low-value systematically.

Priority (drop lowest first):

1. **Old tool outs**: verbose results from prior cycles where decision made. Decision persists, evidence goes.
2. **Redundant turns**: early turns superseded by later. Turn 3 asked X, turn 7 revised to Y → turn 3 redundant.
3. **Verbose formatting**: tables, ASCII art, decorative headers. Summarize w/ one-liner.
4. **Done sub-task ctx**: multi-step, sub-task complete + outs in summary/file.
5. **Inactive skill procs**: no longer following → drop full text.
6. **Irrelevant memory**: auto-loaded, unrelated projects/sessions.

Per pruned item, tombstone:

```
[PRUNED: 2,400 tokens of npm audit output from cycle 12 — 3 vulnerabilities found, all patched]
```

~20 tokens but preserves conclusion.

→ Ctx drops below soft after prune. Each pruned item has tombstone. No decision-critical info lost.

If err: prune to lvl 4 + still over → workflow too ctx-heavy for cycle freq. Escalate: "N% post-prune. (a) longer interval, (b) reduce scope, (c) split workflows, (d) accept higher cost."

### Step 5: Progressive Disclosure for Skill Loading

Route via registry metadata before loading full procs → spend tokens on routing not reading.

Pattern:

1. **Route first**: Need skill → read registry entry (id, desc, domain, complexity, tags) from `_registry.yml` ~3-5 lines, ~50 tokens
2. **Confirm relevance**: Match? No → next candidate. ~50 tokens/miss vs. ~500-2000 for wrong SKILL.md
3. **Load on match**: Only when confirmed → load full SKILL.md
4. **Unload after**: Proc complete → prune full text (Step 4 lvl 5), keep summary

Same pattern for other large payloads:

- **Memory**: MEMORY.md index first, topic files only when relevant
- **Tool docs**: Names + one-liners for routing, full schemas only when called
- **Files**: Listings + signatures first, full only for fns being modified

```
Without progressive disclosure:
  Load 5 candidate skills → 5 × 1,500 tokens = 7,500 tokens → use 1 skill

With progressive disclosure:
  Route through 5 registry entries → 5 × 50 tokens = 250 tokens
  Load 1 matched skill → 1 × 1,500 tokens = 1,500 tokens
  Total: 1,750 tokens (77% reduction)
```

→ Skill loading = 2-phase: lightweight routing → full only on match. Same for memory, schemas, files.

If err: registry insufficient (vague descs, missing tags) → improve registry not abandon. Fix = better metadata, not more loading.

### Step 6: Cost-Aware Cycle Intervals

Set intervals from cost data, not arbitrary schedules.

1. Cost/hour at current interval:
   - `cost_per_hour = avg_cost_per_cycle × cycles_per_hour`
   - Ex: $0.09/cycle × 2/hr = $0.18/hr = $4.32/day

2. Vs. budget:
   - `hours_until_hard_limit = (hard_limit - cumulative_cost) / cost_per_hour`
   - hours < intended runtime → extend interval

3. Min effective interval:
   - Fastest change rate of monitored system? Source updates 4hr → polling 30min wastes 7/8 cycles
   - Match interval to refresh rate, not anxiety
   - Event-driven → webhooks/push, not polling

4. Apply:

```
Before: 30-minute heartbeat, verbose processing
  → 48 cycles/day × $0.09/cycle = $4.32/day

After: 4-hour heartbeat, notification-only
  → 6 cycles/day × $0.04/cycle = $0.24/day
  → 94% cost reduction
```

→ Interval justified by cost data + matches refresh rate. Tradeoff doc'd for future baseline.

If err: low-latency required, can't extend → reduce per-cycle cost (smaller prompts, fewer schemas, summarized history). 2 levers: frequency + cost/cycle.

### Step 7: Validate Controls

Confirm all working + within budget.

1. **Tracking**: 3-5 cycles → verify per-cycle logs w/ accurate counts
2. **Soft limit test**: lower temp → warn fires + prune begins
3. **Hard limit test**: lower temp → halts + alerts
4. **Per-cycle cap test**: inject large out → truncated not blown
5. **Progressive disclosure test**: trace skill load → routes registry before full SKILL.md
6. **Projection**:
   - Daily cost current settings
   - Days till hard limit at burn rate
   - Monthly expected

```
Budget Validation Report:
+-----------------------+----------+--------+
| Check                 | Expected | Actual |
+-----------------------+----------+--------+
| Per-cycle logging     | Present  |        |
| Soft limit warning    | Fires    |        |
| Hard limit halt       | Halts    |        |
| Per-cycle cap         | Truncates|        |
| Progressive disclosure| Routes   |        |
| Daily cost projection | < $X.XX  |        |
+-----------------------+----------+--------+
```

→ All 5 controls verified. Projection within budget.

If err: not firing → check enforcement wired into actual loop, not just doc'd. Config w/o enforcement = plan, not control. Projection over → Step 6, adjust interval/cost.

## Check

- [ ] Per-cycle tracking logs in/out tokens, cost, ts every cycle
- [ ] Ctx audit identifies all consumers + tokens + %
- [ ] Caps at 3 levels: soft, hard, per-cycle
- [ ] Each cap has explicit action (warn, prune, halt, alert)
- [ ] Emergency prune follows priority + tombstones
- [ ] Progressive disclosure routes metadata before full
- [ ] Cycle interval justified by cost + refresh rate
- [ ] Validation tests confirm controls fire
- [ ] Projection within budget
- [ ] Post-incident: root cause + prevention in place

## Traps

- **Tracking in ctx**: Logs in history inflate the thing controlled. Log externally, keep summary in ctx.
- **Soft limits w/o enforcement**: Warn nobody sees ≠ control. Must trigger visible action — prune/extend/notify. Silent exceed → will exceed.
- **Prune decisions over data**: Drop tool outs before decisions = lose info. Prune evidence AFTER decision, not before. Tombstone = preserve conclusion, drop evidence.
- **Interval = anxiety not refresh**: Poll 30min when source updates 4hr wastes 87.5%. Measure actual refresh first.
- **Load full skills for routing**: 400-line SKILL.md to decide "right skill?" = 10-20x cost of 3-line registry. Route metadata first.
- **Ignore system prompt**: System prompts + CLAUDE.md + auto-memory = invisible costs paid every cycle. 5k-token prompt × 48/day = 240k tokens/day for instructions. Audit + trim first.
- **Caps w/o human escalation**: Hit limits + silently degrade → damage accumulates. Hard limits MUST notify human.

## →

- `assess-context` — eval reasoning ctx structural health; complements Step 2 audit
- `metal` — extract conceptual essence; progressive disclosure applies in prospect phase
- `chrysopoeia` — value extraction + dead weight elim; same value-per-token at code level
- `manage-memory` — organize + prune persistent memory; reduces memory ctx component
