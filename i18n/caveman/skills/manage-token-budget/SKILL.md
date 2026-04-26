---
name: manage-token-budget
locale: caveman
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

Control cost + context footprint of agentic systems. Track tokens per cycle, audit what consumes context, enforce budget caps, prune low-value context under pressure, route through metadata before loading full procedures. Core principle: every token in context window must earn its place. Tokens informing decisions stay; tokens occupying space without influencing output get pruned.

Community evidence: 37-hour autonomous session cost $13.74 from 30-minute heartbeat interval combined with verbose system instructions + unchecked context accumulation. Fix: rewrote heartbeat to 4-hour intervals, switched to notification-only mode, eliminated feed browsing from loop. This skill codifies patterns preventing such incidents.

## When Use

- Running long-lived agent loops (heartbeats, polling, autonomous workflows) where costs compound
- Context windows growing unpredictably between cycles
- API costs spiked beyond baselines, post-mortem needed
- Designing new agentic workflow, want cost guardrails built in from start
- After cost incident, audit what went wrong, prevent recurrence
- System prompts, memory files, tool schemas grown large enough to dominate context window

## Inputs

- **Required**: Agentic system or workflow to budget (running or planned)
- **Required**: Budget ceiling (dollar per period, or token limit per cycle)
- **Optional**: Current cost data (API logs, billing dashboard exports)
- **Optional**: Context window size of target model (default: check model docs)
- **Optional**: Acceptable degradation policy (what can drop when limits hit)

## Steps

### Step 1: Set Per-Cycle Cost Tracking

Instrument agent loop to log token usage at every execution boundary.

For each cycle (heartbeat, poll, task), capture:

1. **Input tokens**: system prompt + memory + tool schemas + conversation history + new user/system content
2. **Output tokens**: model response including tool calls
3. **Total cost**: input tokens x input price + output tokens x output price
4. **Cycle timestamp**: when cycle ran
5. **Cycle trigger**: what initiated (timer, event, user action)

Store these in structured log (JSON lines, CSV, database) — not in context window itself:

```
{"cycle": 47, "ts": "2026-03-12T14:30:00Z", "trigger": "heartbeat",
 "input_tokens": 18420, "output_tokens": 2105, "cost_usd": 0.0891,
 "cumulative_cost_usd": 3.42}
```

If system has no instrumentation, estimate from API billing:

- Total cost / number of cycles = average cost per cycle
- Compare against expected baseline (model pricing x expected context size)

**Got:** Log shows per-cycle token counts + costs, with granularity to identify expensive cycles + why. Log lives outside context window.

**If fail:** Exact token counts unavailable (some APIs do not return usage metadata)? Use billing dashboard for averages. Even coarse tracking (daily cost / daily cycle count) reveals trends. No tracking possible? Go to Step 2, work from context audit — estimate costs from context size.

### Step 2: Audit Context Window

Measure what occupies context window, rank consumers by size.

Decompose context into components, measure each:

1. **System prompt**: base instructions, CLAUDE.md content, personality directives
2. **Memory**: MEMORY.md, topic files loaded via auto-memory
3. **Tool schemas**: MCP server tool definitions, function calling schemas
4. **Skill procedures**: full SKILL.md content loaded for active skills
5. **Conversation history**: prior turns in current session
6. **Dynamic content**: tool outputs, file contents, search results from current cycle

Produce context budget table:

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

Flag components disproportionately large vs decision-making value. 4,000-token memory file current task never references is pure overhead.

**Got:** Ranked table shows each context consumer, size, percent of window. At least one component stands out as candidate for reduction — most often conversation history or verbose tool outputs.

**If fail:** Exact token counts per component hard to get? Use character count / 4 as rough approximation for English. For structured data (JSON, YAML), character count / 3. Goal is relative ranking, not exact measurement.

### Step 3: Set Budget Caps with Enforcement Policies

Define hard + soft limits, specify what happens when each reached.

1. **Soft limit** (warning threshold): typically 60-75% of hard limit. When hit:
   - Log warning with current usage + remaining budget
   - Begin voluntary pruning (Step 4) on lowest-value context
   - Reduce cycle frequency if applicable (e.g., heartbeat interval 30min → 2h)
   - Continue with degraded context

2. **Hard limit** (stop threshold): absolute max spend or context size. When hit:
   - Halt autonomous operation immediately
   - Send alert to human operator (notification, email, log entry)
   - Preserve summary of current state for resumption
   - Do not start another cycle until human reviews + authorizes

3. **Per-cycle cap**: max tokens or cost for any single cycle. Prevents single runaway cycle from consuming whole budget:
   - If cycle would exceed cap, truncate tool outputs or skip low-priority actions
   - Log truncation for post-mortem

Document caps in workflow config:

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

**Got:** Documented budget caps at three levels (soft, hard, per-cycle) with explicit enforcement actions. Policy answers "what happens when we hit the limit?" before limit hit.

**If fail:** Setting precise dollar limits premature (new workflow, unknown cost profile)? Start with context-percentage limits only (soft 70%, hard 90%), add dollar limits after 24-48 hours of cost tracking. Advisory mode (log not halt) acceptable during calibration.

### Step 4: Implement Emergency Pruning

When approaching limits, drop low-value context to stay within budget.

Pruning priority order (drop lowest-value first):

1. **Old tool outputs**: verbose search results, file contents, API responses from previous cycles informing decisions already made. Decision persists; evidence can go.
2. **Redundant conversation turns**: early turns superseded by later corrections or refinements. Turn 3 asked X, turn 7 revised to Y, turn 3 redundant.
3. **Verbose formatting**: tables, ASCII art, decorative headers in tool outputs. Summarize with one-line description of what output contained.
4. **Completed sub-task context**: for multi-step tasks, context from sub-tasks fully complete with outputs captured in summary or file.
5. **Inactive skill procedures**: if skill loaded for previous step but no longer being followed, full procedure text can drop.
6. **Memory sections irrelevant to current task**: auto-loaded memory about unrelated projects or past sessions.

For each pruned item, preserve one-line tombstone:

```
[PRUNED: 2,400 tokens of npm audit output from cycle 12 — 3 vulnerabilities found, all patched]
```

Tombstone costs ~20 tokens but preserves decision-relevant conclusion.

**Got:** Context window usage drops below soft limit after pruning. Each pruned item has tombstone preserving conclusion. No decision-critical info lost — only evidence behind already-made decisions.

**If fail:** Pruning to priority level 4 still leaves usage above soft limit? Workflow fundamentally too context-heavy for current cycle frequency. Escalate to human: "Context usage at N% after pruning. Options: (a) increase cycle interval, (b) reduce scope per cycle, (c) split into sub-workflows, (d) accept higher cost."

### Step 5: Integrate Progressive Disclosure for Skill Loading

Route through registry metadata before loading full skill procedures — spend tokens on routing, not on reading.

Pattern:

1. **Route first**: When task requires skill, read skill's registry entry (id, description, domain, complexity, tags) from `_registry.yml` — roughly 3-5 lines, ~50 tokens
2. **Confirm relevance**: Does registry description match current need? If not, check next candidate. Costs ~50 tokens per miss vs ~500-2000 tokens for loading wrong SKILL.md
3. **Load on match**: Only when registry entry confirms relevance, load full SKILL.md procedure
4. **Unload after use**: Once skill procedure done, full text can be pruned (Step 4, priority 5) — keep only summary of what was done

Apply same pattern to other large context payloads:

- **Memory files**: Read MEMORY.md index lines first; load topic files only when topic relevant
- **Tool documentation**: Use tool names + one-line descriptions for routing; load full schemas only for tools being called
- **File contents**: Read file listings + function signatures first; load full file contents only for functions being modified

```
Without progressive disclosure:
  Load 5 candidate skills → 5 × 1,500 tokens = 7,500 tokens → use 1 skill

With progressive disclosure:
  Route through 5 registry entries → 5 × 50 tokens = 250 tokens
  Load 1 matched skill → 1 × 1,500 tokens = 1,500 tokens
  Total: 1,750 tokens (77% reduction)
```

**Got:** Skill loading follows two-phase pattern: lightweight routing via metadata, then full loading only on confirmed match. Same pattern applied to memory, tool schemas, file contents where applicable.

**If fail:** Registry metadata insufficient for routing (descriptions too vague, tags missing)? Improve registry entries rather than abandoning progressive disclosure. Fix is better metadata, not more context loading.

### Step 6: Design Cost-Aware Cycle Intervals

Set execution intervals based on cost data, not arbitrary schedules.

1. Calculate cost-per-hour at current cycle interval:
   - `cost_per_hour = avg_cost_per_cycle × cycles_per_hour`
   - Example: $0.09/cycle at 2 cycles/hour = $0.18/hour = $4.32/day

2. Compare against budget:
   - `hours_until_hard_limit = (hard_limit - cumulative_cost) / cost_per_hour`
   - If hours_until_hard_limit < intended runtime, extend cycle interval

3. Determine minimum effective interval:
   - Fastest rate of change in monitored system? If data source updates every 4 hours, polling every 30 minutes wastes 7 of 8 cycles
   - Match cycle interval to data refresh rate, not anxiety about missing events
   - Event-driven systems: replace polling with webhooks or push notifications where possible

4. Apply interval:

```
Before: 30-minute heartbeat, verbose processing
  → 48 cycles/day × $0.09/cycle = $4.32/day

After: 4-hour heartbeat, notification-only
  → 6 cycles/day × $0.04/cycle = $0.24/day
  → 94% cost reduction
```

**Got:** Cycle interval justified by cost data, matches monitored system refresh rate. Interval-cost tradeoff documented so future adjustments have baseline.

**If fail:** System requires low-latency response, cannot tolerate longer intervals? Reduce per-cycle cost instead (smaller system prompts, fewer tool schemas loaded, summarized history). Budget equation has two levers: frequency + cost-per-cycle.

### Step 7: Validate Budget Controls

Confirm all controls working, system operates within budget.

1. **Tracking validation**: Run 3-5 cycles, verify per-cycle logs written with accurate token counts
2. **Soft limit test**: Temporarily lower soft limit, verify warning fires + pruning begins
3. **Hard limit test**: Temporarily lower hard limit, verify system halts + alerts
4. **Per-cycle cap test**: Inject large tool output, verify it gets truncated rather than blowing cap
5. **Progressive disclosure test**: Trace skill-loading sequence, confirm it routes through registry before loading full SKILL.md
6. **Cost projection**: From validation data, project:
   - Daily cost at current settings
   - Days until hard limit at current burn rate
   - Expected monthly cost

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

**Got:** All five controls (tracking, soft limit, hard limit, per-cycle cap, progressive disclosure) verified working. Cost projection within intended budget.

**If fail:** Controls not firing? Check enforcement mechanism wired into actual execution loop, not just documented. Configuration without enforcement is plan, not control. Cost projection exceeds budget? Return to Step 6, adjust cycle interval or per-cycle cost.

## Checks

- [ ] Per-cycle cost tracking logs input tokens, output tokens, cost, timestamp every cycle
- [ ] Context window audit identifies all consumers with approximate token counts + percentages
- [ ] Budget caps defined at three levels: soft limit, hard limit, per-cycle cap
- [ ] Each cap has explicit enforcement action (warn, prune, halt, alert)
- [ ] Emergency pruning follows priority order, preserves tombstones
- [ ] Progressive disclosure routes through metadata before loading full content
- [ ] Cycle interval justified by cost data, matches monitored system refresh rate
- [ ] Validation tests confirm all controls fire correctly
- [ ] Cost projection within defined budget
- [ ] Post-incident: root cause identified, specific prevention measure in place

## Pitfalls

- **Tracking in context window**: Storing per-cycle logs inside conversation history inflates the very thing you trying to control. Log externally (file, DB, API), keep only current summary in context.
- **Soft limits without enforcement**: Warning nobody sees is not a control. Soft limits must trigger visible action — pruning, interval extension, operator notification. If system can silently exceed soft limit, it will.
- **Pruning decisions over data**: Dropping tool outputs before decisions made loses information. Prune evidence AFTER decision it informed, not before. Tombstone pattern preserves conclusions while dropping evidence.
- **Matching cycle interval to anxiety, not data refresh**: Polling source every 30 minutes when it updates every 4 hours wastes 87.5% of cycles. Measure data source actual refresh rate before setting interval.
- **Loading full skills for routing**: Reading 400-line SKILL.md to decide "is this right skill?" costs 10-20x more than reading 3-line registry entry. Route through metadata first; load procedure only on confirmed match.
- **Ignoring system prompt**: System prompts, CLAUDE.md chains, auto-loaded memory are invisible costs — paid every single cycle. 5,000-token system prompt in 48-cycle/day loop costs 240,000 input tokens/day just for instructions. Audit + trim these first.
- **Budget caps without human escalation**: Autonomous systems hitting budget limits + silently degrading (instead of alerting human) can accumulate damage. Hard limits must include human notification channel.

## See Also

- `assess-context` — evaluate reasoning context for structural health; complements context window audit in Step 2
- `metal` — extract conceptual essence from codebases; progressive disclosure pattern applies to metal's prospect phase
- `chrysopoeia` — value extraction + dead weight elimination; applies same value-per-token thinking at code level
- `manage-memory` — organize + prune persistent memory files; directly reduces memory component of context budgets
