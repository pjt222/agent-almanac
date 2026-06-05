---
name: manage-token-budget
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

Control the cost and context footprint of agentic systems by tracking token usage per cycle, auditing what consumes context space, enforcing budget caps, pruning low-value context under pressure, and routing through metadata before loading full procedures. The core principle: every token in the context window should earn its place. Tokens that inform decisions stay; tokens that occupy space without influencing output get pruned.

Community evidence: a 37-hour autonomous session cost $13.74 from a 30-minute heartbeat interval combined with verbose system instructions and unchecked context accumulation. The fix was rewriting the heartbeat to 4-hour intervals, switching to notification-only mode, and eliminating feed browsing from the loop. This skill codifies the patterns that prevent such incidents.

## When to Use

- Running long-lived agent loops (heartbeats, polling cycles, autonomous workflows) where costs compound over time
- Context windows are growing unpredictably between execution cycles
- API costs have spiked beyond expected baselines and a post-mortem is needed
- Designing a new agentic workflow and want cost guardrails built in from the start
- After a cost incident to audit what went wrong and prevent recurrence
- When system prompts, memory files, or tool schemas have grown large enough to dominate the context window

## Inputs

- **Required**: The agentic system or workflow to budget (running or planned)
- **Required**: Budget ceiling (dollar amount per period, or token limit per cycle)
- **Optional**: Current cost data (API logs, billing dashboard exports)
- **Optional**: Context window size of the target model (default: check model documentation)
- **Optional**: Acceptable degradation policy (what can be dropped when limits are hit)

## Procedure

### Step 1: Establish Per-Cycle Cost Tracking

Instrument the agentic loop to log token usage at every execution boundary.

For each cycle (heartbeat, poll, task execution), capture:

1. **Input tokens**: system prompt + memory + tool schemas + conversation history + new user/system content
2. **Output tokens**: the model's response including tool calls
3. **Total cost**: input tokens x input price + output tokens x output price
4. **Cycle timestamp**: when the cycle ran
5. **Cycle trigger**: what initiated it (timer, event, user action)

Store these in a structured log (JSON lines, CSV, or database) — not in the context window itself:

```
{"cycle": 47, "ts": "2026-03-12T14:30:00Z", "trigger": "heartbeat",
 "input_tokens": 18420, "output_tokens": 2105, "cost_usd": 0.0891,
 "cumulative_cost_usd": 3.42}
```

If the system has no instrumentation, estimate from API billing:

- Total cost / number of cycles = average cost per cycle
- Compare against expected baseline (model pricing x expected context size)

**Expected:** A log showing per-cycle token counts and costs, with enough granularity to identify which cycles are expensive and why. The log itself lives outside the context window.

**On failure:** If exact token counts are unavailable (some APIs do not return usage metadata), use the billing dashboard to derive averages. Even coarse tracking (daily cost / daily cycle count) reveals trends. If no tracking is possible at all, proceed to Step 2 and work from the context audit — you can estimate costs from context size.

### Step 2: Audit the Context Window

Measure what occupies the context window and rank consumers by size.

Decompose the context into its components and measure each:

1. **System prompt**: base instructions, CLAUDE.md content, personality directives
2. **Memory**: MEMORY.md, topic files loaded via auto-memory
3. **Tool schemas**: MCP server tool definitions, function calling schemas
4. **Skill procedures**: full SKILL.md content loaded for active skills
5. **Conversation history**: prior turns in the current session
6. **Dynamic content**: tool outputs, file contents, search results from the current cycle

Produce a context budget table:

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

Flag components that are disproportionately large relative to their decision-making value. A 4,000-token memory file that the current task never references is pure overhead.

**Expected:** A ranked table showing each context consumer, its size, and its percentage of the window. At least one component will stand out as a candidate for reduction — most commonly conversation history or verbose tool outputs.

**On failure:** If exact token counts per component are hard to obtain, use character count / 4 as a rough approximation for English text. For structured data (JSON, YAML), use character count / 3. The goal is relative ranking, not exact measurement.

### Step 3: Set Budget Caps with Enforcement Policies

Define hard and soft limits, and specify what happens when each is reached.

1. **Soft limit** (warning threshold): typically 60-75% of the hard limit. When hit:
   - Log a warning with current usage and remaining budget
   - Begin voluntary pruning (Step 4) on lowest-value context
   - Reduce cycle frequency if applicable (e.g., heartbeat interval from 30min to 2h)
   - Continue operation with degraded context

2. **Hard limit** (stop threshold): the absolute maximum spend or context size. When hit:
   - Halt autonomous operation immediately
   - Send alert to the human operator (notification, email, log entry)
   - Preserve a summary of current state for resumption
   - Do not start another cycle until a human reviews and authorizes

3. **Per-cycle cap**: maximum tokens or cost for any single cycle. Prevents a single runaway cycle from consuming the entire budget:
   - If a cycle would exceed the cap, truncate tool outputs or skip low-priority actions
   - Log the truncation for post-mortem analysis

Document the caps in the workflow configuration:

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

**Expected:** Documented budget caps at three levels (soft, hard, per-cycle) with explicit enforcement actions for each. The policy answers "what happens when we hit the limit?" before the limit is hit.

**On failure:** If setting precise dollar limits is premature (new workflow with unknown cost profile), start with context-percentage limits only (soft at 70%, hard at 90%) and add dollar limits after 24-48 hours of cost tracking data. Advisory mode (log but don't halt) is acceptable during the calibration period.

### Step 4: Implement Emergency Pruning

When approaching limits, systematically drop low-value context to stay within budget.

Pruning priority order (drop lowest-value first):

1. **Old tool outputs**: verbose search results, file contents, or API responses from previous cycles that informed decisions already made. The decision persists; the evidence can go.
2. **Redundant conversation turns**: early turns that have been superseded by later corrections or refinements. If turn 3 asked for X and turn 7 revised it to Y, turn 3 is redundant.
3. **Verbose formatting**: tables, ASCII art, decorative headers in tool outputs. Summarize with a one-line description of what the output contained.
4. **Completed sub-task context**: for multi-step tasks, context from sub-tasks that are fully complete and whose outputs are captured in a summary or file.
5. **Inactive skill procedures**: if a skill was loaded for a previous step but is no longer being followed, its full procedure text can be dropped.
6. **Memory sections irrelevant to current task**: auto-loaded memory about unrelated projects or past sessions.

For each pruned item, preserve a one-line tombstone:

```
[PRUNED: 2,400 tokens of npm audit output from cycle 12 — 3 vulnerabilities found, all patched]
```

The tombstone costs ~20 tokens but preserves the decision-relevant conclusion.

**Expected:** Context window usage drops below the soft limit after pruning. Each pruned item has a tombstone preserving its conclusion. No decision-critical information is lost — only the evidence behind already-made decisions.

**On failure:** If pruning to priority level 4 still leaves usage above the soft limit, the workflow is fundamentally too context-heavy for the current cycle frequency. Escalate to the human operator: "Context usage at N% after pruning. Options: (a) increase cycle interval, (b) reduce scope per cycle, (c) split into sub-workflows, (d) accept higher cost."

### Step 5: Integrate Progressive Disclosure for Skill Loading

Route through registry metadata before loading full skill procedures — spend tokens on routing, not on reading.

The pattern:

1. **Route first**: When a task requires a skill, read the skill's registry entry (id, description, domain, complexity, tags) from `_registry.yml` — roughly 3-5 lines, ~50 tokens
2. **Confirm relevance**: Does the registry description match the current need? If not, check the next candidate. This costs ~50 tokens per miss instead of ~500-2000 tokens for loading a wrong SKILL.md
3. **Load on match**: Only when the registry entry confirms relevance, load the full SKILL.md procedure
4. **Unload after use**: Once the skill's procedure is complete, the full text can be pruned (Step 4, priority 5) — keep only the summary of what was done

Apply the same pattern to other large context payloads:

- **Memory files**: Read MEMORY.md index lines first; load topic files only when the topic is relevant
- **Tool documentation**: Use tool names and one-line descriptions for routing; load full schemas only for tools being called
- **File contents**: Read file listings and function signatures first; load full file contents only for the functions being modified

```
Without progressive disclosure:
  Load 5 candidate skills → 5 × 1,500 tokens = 7,500 tokens → use 1 skill

With progressive disclosure:
  Route through 5 registry entries → 5 × 50 tokens = 250 tokens
  Load 1 matched skill → 1 × 1,500 tokens = 1,500 tokens
  Total: 1,750 tokens (77% reduction)
```

**Expected:** Skill loading follows a two-phase pattern: lightweight routing via metadata, then full loading only on confirmed match. The same pattern is applied to memory, tool schemas, and file contents where applicable.

**On failure:** If the registry metadata is insufficient for routing (descriptions too vague, tags missing), improve the registry entries rather than abandoning progressive disclosure. The fix is better metadata, not more context loading.

### Step 6: Design Cost-Aware Cycle Intervals

Set execution intervals based on cost data, not arbitrary schedules.

1. Calculate the cost-per-hour at the current cycle interval:
   - `cost_per_hour = avg_cost_per_cycle × cycles_per_hour`
   - Example: $0.09/cycle at 2 cycles/hour = $0.18/hour = $4.32/day

2. Compare against the budget:
   - `hours_until_hard_limit = (hard_limit - cumulative_cost) / cost_per_hour`
   - If hours_until_hard_limit < intended runtime, extend the cycle interval

3. Determine the minimum effective interval:
   - What is the fastest rate of change in the monitored system? If the data source updates every 4 hours, polling every 30 minutes wastes 7 out of 8 cycles
   - Match the cycle interval to the data's refresh rate, not to anxiety about missing events
   - For event-driven systems, replace polling with webhooks or push notifications where possible

4. Apply the interval:

```
Before: 30-minute heartbeat, verbose processing
  → 48 cycles/day × $0.09/cycle = $4.32/day

After: 4-hour heartbeat, notification-only
  → 6 cycles/day × $0.04/cycle = $0.24/day
  → 94% cost reduction
```

**Expected:** Cycle interval is justified by cost data and matches the monitored system's refresh rate. The interval-cost tradeoff is documented so future adjustments have a baseline.

**On failure:** If the system requires low-latency response and cannot tolerate longer intervals, reduce per-cycle cost instead (smaller system prompts, fewer tool schemas loaded, summarized history). The budget equation has two levers: frequency and cost-per-cycle.

### Step 7: Validate Budget Controls

Confirm that all controls are working and the system operates within budget.

1. **Tracking validation**: Run 3-5 cycles and verify that per-cycle logs are being written with accurate token counts
2. **Soft limit test**: Temporarily lower the soft limit and verify that the warning fires and pruning begins
3. **Hard limit test**: Temporarily lower the hard limit and verify that the system halts and alerts
4. **Per-cycle cap test**: Inject a large tool output and verify it gets truncated rather than blowing the cap
5. **Progressive disclosure test**: Trace a skill-loading sequence and confirm it routes through the registry before loading the full SKILL.md
6. **Cost projection**: From the validation data, project:
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

**Expected:** All five controls (tracking, soft limit, hard limit, per-cycle cap, progressive disclosure) are verified working. Cost projection is within the intended budget.

**On failure:** If controls are not firing, check that the enforcement mechanism is wired into the actual execution loop, not just documented. Configuration without enforcement is a plan, not a control. If cost projection exceeds budget, return to Step 6 and adjust the cycle interval or per-cycle cost.

## Validation

- [ ] Per-cycle cost tracking is logging input tokens, output tokens, cost, and timestamp for every cycle
- [ ] Context window audit identifies all consumers with approximate token counts and percentages
- [ ] Budget caps are defined at three levels: soft limit, hard limit, and per-cycle cap
- [ ] Each cap has an explicit enforcement action (warn, prune, halt, alert)
- [ ] Emergency pruning follows the priority order and preserves tombstones
- [ ] Progressive disclosure routes through metadata before loading full content
- [ ] Cycle interval is justified by cost data and matches the monitored system's refresh rate
- [ ] Validation tests confirm all controls fire correctly
- [ ] Cost projection is within the defined budget
- [ ] Post-incident: root cause is identified and a specific prevention measure is in place

## Common Pitfalls

- **Tracking in the context window**: Storing per-cycle logs inside the conversation history inflates the very thing you are trying to control. Log externally (file, database, API) and keep only the current summary in context.
- **Soft limits without enforcement**: A warning that nobody sees is not a control. Soft limits must trigger a visible action — pruning, interval extension, or operator notification. If the system can silently exceed the soft limit, it will.
- **Pruning decisions over data**: Dropping tool outputs before decisions are made loses information. Prune evidence AFTER the decision it informed, not before. The tombstone pattern preserves conclusions while dropping evidence.
- **Matching cycle interval to anxiety, not data refresh**: Polling a source every 30 minutes when it updates every 4 hours wastes 87.5% of cycles. Measure the data source's actual refresh rate before setting the interval.
- **Loading full skills for routing**: Reading a 400-line SKILL.md to decide "is this the right skill?" costs 10-20x more than reading the 3-line registry entry. Route through metadata first; load procedure only on confirmed match.
- **Ignoring the system prompt**: System prompts, CLAUDE.md chains, and auto-loaded memory are invisible costs — they are paid on every single cycle. A 5,000-token system prompt in a 48-cycle/day loop costs 240,000 input tokens/day just for instructions. Audit and trim these first.
- **Budget caps without human escalation**: Autonomous systems that hit budget limits and silently degrade (instead of alerting a human) can accumulate damage. Hard limits must include a human notification channel.

## Related Skills

- `assess-context` — evaluate reasoning context for structural health; complements the context window audit in Step 2
- `metal` — extract conceptual essence from codebases; the progressive disclosure pattern applies to metal's prospect phase
- `chrysopoeia` — value extraction and dead weight elimination; applies the same value-per-token thinking at the code level
- `manage-memory` — organize and prune persistent memory files; directly reduces the memory component of context budgets
