---
title: "Production Coordination Patterns"
description: "Real-world multi-agent orchestration patterns: barrier synchronization, silence budgets, health checks, degraded-wave policies, and cost-aware scheduling"
category: workflow
agents: [swarm-strategist, project-manager, devops-engineer]
teams: [devops-platform-engineering, opaque-team]
skills: [coordinate-swarm, build-consensus, create-team, test-team-coordination, manage-token-budget, circuit-breaker-pattern, verify-agent-output]
---

# Production Coordination Patterns

This guide documents six coordination patterns that emerge when multi-agent systems run in production over hours, days, or indefinitely. The existing seven patterns (hub-and-spoke, sequential, parallel, adaptive, timeboxed, wave-parallel, reciprocal) define *how agents relate to each other*. The patterns in this guide define *how long-running agent systems stay healthy* -- they layer on top of any base coordination pattern to handle the realities of sustained operation: agents that stall, budgets that burn, waves that cannot proceed at full strength, and failures that must escalate.

These patterns draw from parallel computing, distributed systems engineering, and hard-won lessons from early adopters running multi-agent stacks in production.

## When to Use This Guide

- You are designing a multi-agent system that will run for more than a single task cycle
- You have a wave-parallel or parallel team and need to handle agent failures gracefully
- Your agent system has cost constraints and you need to spread expensive operations across time
- Agents in your system are producing unnecessary work and you want to introduce action budgets
- You need escalation logic from agent-level failures up to human intervention
- You are reviewing or extending the coordination pattern of an existing team

## Prerequisites

- Understanding of the seven base coordination patterns documented in [Understanding the System](understanding-the-system.md)
- Familiarity with team composition and the CONFIG block format described in [Creating Agents and Teams](creating-agents-and-teams.md)
- Experience running at least one team (any coordination pattern) through a complete task cycle

## Workflow Overview

The six production patterns address different failure modes of sustained agent operation:

```text
Base coordination pattern (hub-and-spoke, parallel, wave-parallel, etc.)
  |
  +-- Barrier Synchronization .... agents wait for each other before proceeding
  +-- Silence Budgets ............ agents justify action rather than defaulting to it
  +-- Self-Reporting Health Checks  agents declare their own status
  +-- Degraded-Wave Policy ....... waves proceed with reduced agent count
  +-- Cost-Aware Scheduling ...... expensive operations spread across cycles
  +-- Escalation Cascades ........ failures propagate from agent to team to human
```

The [swarm-strategist](../agents/swarm-strategist.md) agent is the primary advisor for implementing these patterns. The [project-manager](../agents/project-manager.md) handles escalation decisions. The [devops-engineer](../agents/devops-engineer.md) handles the infrastructure side -- monitoring, alerting, and resource constraints.

## Barrier Synchronization

Adapted from parallel computing's barrier synchronization primitive. In a wave-parallel or parallel coordination pattern, all agents in a wave must report ready before the wave proceeds to its next phase.

### The Problem

Without barriers, fast agents race ahead while slow agents fall behind. In a 5-agent parallel wave, if agent C stalls on an API call, agents A, B, D, and E may produce work that depends on C's output -- or worse, proceed to wave 2 while wave 1 is incomplete.

### The Pattern

```text
Wave 1:  [Agent A: ready]  [Agent B: ready]  [Agent C: ...]  [Agent D: ready]  [Agent E: ready]
                                    |
                              barrier waits
                                    |
         timeout policy triggers after N cycles
                                    |
                   [proceed without C] or [retry C] or [abort wave]
```

Each agent signals completion by producing its output artifact. The coordination layer (typically the team lead) checks all signals before advancing.

### Timeout Policy

The barrier must have a timeout. Three options, chosen per-team:

1. **Proceed without**: Mark the slow agent as degraded and advance with partial results. Best for review workflows where one missing perspective is acceptable.
2. **Retry**: Re-invoke the stalled agent with a simplified prompt. Best when the agent's contribution is critical but the failure is likely transient.
3. **Abort**: Halt the wave entirely and escalate. Best for compliance or safety workflows where incomplete results are worse than no results.

Define the timeout policy in the team's CONFIG block:

```yaml
coordination_extensions:
  barrier:
    timeout_cycles: 3
    policy: proceed-without  # proceed-without | retry | abort
```

### Relationship to Base Patterns

Barrier synchronization extends **wave-parallel** and **parallel** patterns. It is unnecessary for sequential (agents already wait by definition) or hub-and-spoke (the lead controls pacing).

## Silence Budgets

> "Agents Need a Silence Budget, Not Just More Tools" -- HarryBotter_Weggel

### The Problem

Agents biased toward action generate unnecessary output. In a heartbeat-based system, every cycle tempts every agent to produce *something* -- a summary, a status update, a speculative analysis. Over hours of operation, this noise drowns signal and burns tokens.

### The Pattern

Each agent receives a silence budget: a count of cycles in which it is explicitly permitted to do nothing. Silence is the default state. Action requires justification -- the agent must identify a trigger condition before producing output.

```text
Cycle 1:  Agent observes inputs --> no trigger --> silence (budget: 5/5)
Cycle 2:  Agent observes inputs --> no trigger --> silence (budget: 4/5)
Cycle 3:  Agent observes inputs --> TRIGGER    --> action  (budget resets to 5/5)
Cycle 4:  Agent observes inputs --> no trigger --> silence (budget: 4/5)
...
Cycle 9:  Agent observes inputs --> no trigger --> silence (budget: 0/5)
Cycle 10: Agent MUST act: produce status report or explicitly request more silence
```

### Trigger Conditions

Define trigger conditions in the agent's skill list or team CONFIG. Examples:

- **Data trigger**: New input appeared since last cycle
- **Threshold trigger**: A monitored metric crossed a boundary
- **Request trigger**: Another agent or the human explicitly asked for output
- **Expiry trigger**: Silence budget exhausted -- agent must produce at minimum a status heartbeat

### Configuration

```yaml
coordination_extensions:
  silence_budget:
    default_cycles: 5
    per_agent:
      security-analyst: 3    # security checks more frequently
      code-reviewer: 8       # code review can wait longer
    exhaustion_action: status-report  # status-report | request-extension
```

### Relationship to Base Patterns

Silence budgets apply to any pattern that involves repeated cycles: **timeboxed**, **adaptive**, and long-running **parallel** or **wave-parallel** teams. They are less relevant for one-shot **sequential** or **hub-and-spoke** patterns.

## Self-Reporting Health Checks

### The Problem

External monitoring (polling agents for status, checking output freshness) adds coordination overhead and creates a single point of failure in the monitor itself. Agents know their own state better than any external observer.

### The Pattern

Each agent maintains and reports one of three statuses:

| Status | Meaning | Coordination Response |
|---|---|---|
| **healthy** | Operating normally, producing expected output | No action needed |
| **degraded** | Functional but impaired (slow API, partial data, high error rate) | Log warning, consider reduced scope |
| **stalled** | Cannot proceed without intervention | Trigger escalation cascade |

Agents report status as a structured prefix to their output:

```text
STATUS: healthy
[normal output follows]
```

```text
STATUS: degraded
REASON: API rate limit hit, operating at 50% throughput
[reduced output follows]
```

```text
STATUS: stalled
REASON: Authentication token expired, cannot access data source
[no output]
```

### Aggregation

The team lead (or coordination layer) aggregates status reports and decides:

- All healthy: proceed normally
- One degraded: log and continue
- Multiple degraded: consider pausing the wave, reducing scope, or rotating agents
- Any stalled: trigger the escalation cascade (see below)

### Relationship to Base Patterns

Health checks extend every coordination pattern. Even a two-agent **reciprocal** team benefits from knowing when the partner is degraded.

## Degraded-Wave Policy

### The Problem

Strict barrier synchronization blocks the entire wave when one agent fails. In production, waiting indefinitely for a stalled agent is worse than proceeding with reduced coverage.

### The Pattern

Define a minimum viable agent count for each wave. If that threshold is met, the wave proceeds even if some agents are missing.

```text
Wave 1 (5 agents, minimum 3):
  [A: healthy]  [B: healthy]  [C: stalled]  [D: healthy]  [E: degraded]

  Count: 3 healthy + 1 degraded = 4 operational >= 3 minimum
  Decision: PROCEED with reduced scope

  Output includes coverage annotation:
  "Wave 1 completed at 80% coverage (C stalled, excluded from results)"
```

### Scope Reduction Rules

When proceeding at reduced strength, the team must narrow scope rather than pretending full coverage was achieved:

1. **Drop optional subtasks**: If the stalled agent handled a non-critical review dimension, skip it and annotate
2. **Redistribute critical subtasks**: If the stalled agent handled something essential, reassign to a healthy agent with a simplified prompt
3. **Never claim full coverage**: The wave output must state which agents were missing and what was not reviewed

### Configuration

```yaml
coordination_extensions:
  degraded_wave:
    minimum_agents: 3          # out of 5 total
    scope_reduction: drop      # drop | redistribute
    coverage_annotation: true  # require coverage % in output
```

### Relationship to Base Patterns

Degraded-wave policy extends **wave-parallel** and **parallel** patterns. It combines naturally with barrier synchronization (the barrier's timeout policy triggers degraded-wave evaluation).

## Cost-Aware Scheduling

### The Problem

Running every agent at full capacity every cycle is expensive. A 9-agent stack running every agent every heartbeat for 37 hours cost $13.74 in one documented case -- sustainable for experimentation but prohibitive at scale. Many operations (feed browsing, full memory audits, comprehensive codebase scans) do not need to run every cycle.

### The Pattern

Classify agent operations by frequency tier and distribute them across cycles:

| Tier | Frequency | Examples |
|---|---|---|
| **Critical** | Every cycle | Health checks, human request processing, security monitoring |
| **Regular** | Every N cycles | Code review, status summaries, dependency checks |
| **Background** | Every M cycles (M >> N) | Full codebase scans, memory audits, feed browsing, documentation updates |

### Scheduling Algorithm

```text
Cycle 1:  critical + regular-A + background-X
Cycle 2:  critical + regular-B
Cycle 3:  critical + regular-C
Cycle 4:  critical + regular-A + background-Y
Cycle 5:  critical + regular-B
...
```

Spread background operations so no single cycle bears disproportionate cost. If the background tier contains 4 operations and runs every 8 cycles, schedule them at cycles 2, 4, 6, and 8 -- not all at cycle 8.

### Configuration

```yaml
coordination_extensions:
  cost_schedule:
    cycle_budget_tokens: 50000   # max tokens per cycle across all agents
    tiers:
      critical:
        frequency: 1
        agents: [security-analyst, project-manager]
      regular:
        frequency: 3
        agents: [code-reviewer, r-developer]
      background:
        frequency: 10
        agents: [librarian, senior-researcher]
```

### Relationship to Base Patterns

Cost-aware scheduling applies primarily to **timeboxed** and **adaptive** patterns where the system runs over many cycles. It can also govern how frequently the lead in a **hub-and-spoke** pattern polls its members.

## Escalation Cascades

### The Problem

When an agent fails, someone must decide what to do. When a team cannot recover, someone must decide whether to retry, restructure, or involve a human. Without explicit escalation paths, failures either go unhandled or every failure immediately escalates to the human.

### The Pattern

Three escalation levels with clear boundaries:

```text
Level 1: Agent Self-Recovery
  Agent detects failure --> retries with simplified approach
  If resolved: continue, log incident
  If not resolved after N retries: escalate to Level 2

Level 2: Team-Level Response
  Lead receives stalled status --> applies degraded-wave policy
  Lead may: redistribute work, reduce scope, swap agents
  If resolved: continue with annotations
  If team cannot recover: escalate to Level 3

Level 3: Human Intervention
  System pauses and presents:
    - What failed and why
    - What the team tried
    - Recommended options (retry, restructure, abort)
  Human decides; system resumes or terminates
```

### Escalation Triggers

| Trigger | Level | Response |
|---|---|---|
| Single agent retry fails | 1 to 2 | Lead evaluates, applies degraded-wave |
| Multiple agents stalled | 2 | Lead attempts redistribution |
| Minimum viable agent count not met | 2 to 3 | Cannot proceed, human decides |
| Cost budget exceeded | 2 to 3 | Pause all agents, human approves continuation |
| Conflicting agent outputs | 2 | Lead invokes [build-consensus](../skills/build-consensus/SKILL.md) |
| Security-critical failure | 1 to 3 | Immediate human escalation, no intermediate recovery |

### Configuration

```yaml
coordination_extensions:
  escalation:
    agent_retries: 2
    team_recovery_timeout_cycles: 5
    human_escalation_triggers:
      - minimum_agents_not_met
      - cost_budget_exceeded
      - security_critical
    notification: stdout  # stdout | webhook | email
```

## Worked Example: 9-Agent Company Stack

This example is based on saidigdatech's documented experiment of running a 9-agent stack to operate an entire company autonomously for 37 hours.

### The Stack

```text
[CEO Agent] ---- hub-and-spoke lead
    |
    +-- [Sales Agent]         regular tier, silence budget 5
    +-- [Marketing Agent]     regular tier, silence budget 8
    +-- [Engineering Agent]   critical tier, silence budget 2
    +-- [Support Agent]       critical tier, silence budget 3
    +-- [Finance Agent]       background tier, silence budget 15
    +-- [HR Agent]            background tier, silence budget 20
    +-- [Legal Agent]         background tier, silence budget 20
    +-- [Analytics Agent]     regular tier, silence budget 10
```

### Production Patterns Applied

1. **Barrier synchronization**: Not used -- this is hub-and-spoke, not wave-parallel. The CEO agent polls members on its own schedule.

2. **Silence budgets**: Finance, HR, and Legal agents have high silence budgets (15-20 cycles). They only act when triggered by specific events (invoice due, policy question, contract review). Without silence budgets, these agents generated unnecessary summaries every cycle.

3. **Health checks**: Every agent reports status to the CEO agent. When the Sales agent hit an API rate limit, it reported `degraded` and the CEO agent reduced its polling frequency rather than retrying aggressively.

4. **Degraded-wave policy**: Not directly applicable (hub-and-spoke), but the CEO agent applied a similar principle: when Legal stalled on a complex contract review, the CEO continued operating with a "pending legal review" annotation rather than blocking all decisions.

5. **Cost-aware scheduling**: The $13.74/37h cost came from running all agents every cycle. With tiered scheduling, critical agents (Engineering, Support) run every cycle, regular agents (Sales, Marketing, Analytics) every 3 cycles, and background agents (Finance, HR, Legal) every 10 cycles. Estimated cost reduction: 40-60%.

6. **Escalation cascade**: When the Engineering agent encountered a failing CI pipeline it could not fix, it escalated to the CEO agent (Level 2), which attempted to redistribute the task to Analytics for diagnostics. When that also failed, the system paused and presented the human with a structured incident report (Level 3).

### Key Lesson

The base coordination pattern (hub-and-spoke) was sufficient for task distribution. The production patterns were necessary for *sustainability* -- without silence budgets and cost-aware scheduling, the system burned tokens on noise; without health checks and escalation, failures propagated silently.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| Barrier never completes | One agent consistently stalls | Set a timeout policy; use `proceed-without` for non-critical agents or `retry` with a simplified prompt |
| Agents produce output every cycle despite silence budgets | Trigger conditions too broad | Narrow triggers to specific data events; increase silence budget; review agent instructions for action bias |
| Health status always "healthy" | Agent does not detect its own degradation | Add explicit checks: API response time, error rate, output completeness |
| Degraded wave produces misleading results | Coverage annotation missing | Enforce `coverage_annotation: true`; review output template for coverage percentage |
| Cost exceeds budget despite tiering | Background operations too expensive individually | Split large operations into smaller chunks; add per-operation token limits |
| Every failure escalates to human | Agent-level retries too aggressive or team recovery too narrow | Increase agent retry count; expand team lead's redistribution authority; add intermediate recovery strategies |
| Stalled agent not detected for many cycles | Health check frequency too low | Require health status prefix on every output; reduce silence budget for critical agents |

## Related Resources

### Agents

- [swarm-strategist](../agents/swarm-strategist.md) -- collective intelligence advisor for distributed coordination
- [project-manager](../agents/project-manager.md) -- escalation decisions and sprint management
- [devops-engineer](../agents/devops-engineer.md) -- infrastructure monitoring and resource constraints

### Teams

- [devops-platform-engineering](../teams/devops-platform-engineering.md) -- parallel coordination pattern, natural fit for barrier synchronization
- [opaque-team](../teams/opaque-team.md) -- adaptive coordination, benefits most from silence budgets and health checks

### Skills

- [coordinate-swarm](../skills/coordinate-swarm/SKILL.md) -- stigmergy and quorum sensing for distributed coordination
- [build-consensus](../skills/build-consensus/SKILL.md) -- distributed agreement when agents produce conflicting outputs
- [create-team](../skills/create-team/SKILL.md) -- authoring team definitions with CONFIG blocks
- [test-team-coordination](../skills/test-team-coordination/SKILL.md) -- validating coordination patterns with structured test scenarios

### Guides

- [Understanding the System](understanding-the-system.md) -- the seven base coordination patterns this guide extends
- [Creating Agents and Teams](creating-agents-and-teams.md) -- team composition, CONFIG blocks, and pattern selection
