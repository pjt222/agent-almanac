---
name: coordinate-swarm
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Apply collective intelligence coordination patterns — stigmergy, local rules,
  and quorum sensing — to organize distributed systems, teams, or workflows
  without centralized control. Covers signal design, agent autonomy boundaries,
  emergent behavior cultivation, and feedback loop tuning. Use when designing
  distributed systems without a coordination bottleneck, organizing teams that
  must self-coordinate, building event-driven architectures with shared state
  communication, or replacing fragile centralized orchestration with resilient
  emergent coordination.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: basic
  language: natural
  tags: swarm, coordination, stigmergy, emergent-behavior
---

# Coordinate Swarm

Set up coordination across distributed agents. Use stigmergy (indirect talk through environment), local rules, quorum sensing. Coherent group behavior, no central boss.

## When Use

- Designing distributed system, no single node should be bottleneck
- Organizing teams, workflows must self-coordinate, no constant boss oversight
- Building event-driven architecture, parts talk through shared state, not direct messages
- Scaling process works fine with 3 agents, breaks at 30
- Bootstrapping coordination for new swarm domain (see `forage-resources`, `build-consensus`)
- Replacing fragile central orchestration with resilient emergent coordination

## Inputs

- **Required**: Description of agents (workers, services, team members) needing coordination
- **Required**: Collective goal or wanted emergent behavior
- **Optional**: Current coordination method and its failure modes
- **Optional**: Agent count (affects pattern choice — small swarm vs. big colony)
- **Optional**: Latency tolerance (real-time vs. eventual)
- **Optional**: Environment limits (shared state, bandwidth)

## Steps

### Step 1: Identify Coordination Problem Class

Classify challenge. Pick right patterns.

1. Map current state: who are agents, what do they do alone, where does coordination break?
2. Classify problem:
   - **Foraging** — agents search for, exploit distributed resources (see `forage-resources`)
   - **Consensus** — agents must agree on collective decision (see `build-consensus`)
   - **Construction** — agents build, maintain shared structure step by step
   - **Defense** — agents detect, respond to threats collectively (see `defend-colony`)
   - **Division of labor** — agents must self-organize into specialized roles
3. Identify failure mode of current coordination:
   - Single point of failure (central controller)
   - Communication bottleneck (too many direct messages)
   - Coherence loss (agents drift apart, no feedback)
   - Rigidity (cannot adapt to change)

**Got:** Clear classification of coordination problem type and specific failure mode to fix. Picks swarm patterns to use.

**If fail:** Problem does not fit single class? May be mixed. Break into sub-problems, address each with own pattern. Agents too heterogeneous for single model? Consider layered coordination — homogeneous clusters coordinated via inter-cluster stigmergy.

### Step 2: Design Stigmergic Signals

Build indirect talk channels. Agents influence each other through them.

1. Define shared environment (database, message queue, file system, physical space, shared board)
2. Design signals agents drop into environment:
   - **Trail signals**: markers pile up along good paths (like ant pheromones)
   - **Threshold signals**: counters trigger behavior change when crossing threshold
   - **Inhibition signals**: markers push agents away from exhausted areas
3. Define signal properties:
   - **Decay rate**: how fast signals fade (stops stale state dominating)
   - **Reinforcement**: how good outcomes strengthen signals
   - **Visibility radius**: how far signal spreads
4. Map signals to agent behaviors:
   - Agent senses signal X above threshold T → does action A
   - Agent finishes action A well → drops signal Y
   - No signal sensed → agent does default exploration

```
Signal Design Template:
┌──────────────┬───────────────────┬──────────────┬────────────────────┐
│ Signal Name  │ Deposited When    │ Decay Rate   │ Agent Response     │
├──────────────┼───────────────────┼──────────────┼────────────────────┤
│ success-trail│ Task completed OK │ 50% per hour │ Follow toward      │
│ busy-marker  │ Agent starts task │ On completion│ Avoid / pick other │
│ help-signal  │ Agent stuck >5min │ 25% per hour │ Assist if nearby   │
│ danger-flag  │ Error detected    │ 10% per hour │ Retreat & report   │
└──────────────┴───────────────────┴──────────────┴────────────────────┘
```

**Got:** Signal table mapping environment markers to deposit conditions, decay rates, response behaviors. Signals simple, composable, each meaningful alone.

**If fail:** Signal design feels too complex? Drop to two signals: one positive (success trail), one negative (danger flag). Most coordination bootstraps with attract/repel. Add nuance only after basic system works.

### Step 3: Define Local Interaction Rules

Write simple rules each agent follows. Only local info (own state + nearby signals).

1. Define agent's perception radius (what can sense?)
2. Write 3-7 local rules in priority order:
   - Rule 1 (safety): Danger-flag sensed → move away
   - Rule 2 (response): Help-signal sensed and idle → move toward
   - Rule 3 (exploitation): Success-trail sensed → follow toward strongest signal
   - Rule 4 (exploration): No signals sensed → move random, bias toward unexplored
   - Rule 5 (deposit): After task done → drop success-trail at spot
3. Each rule must be:
   - **Local**: depends only on what agent sees
   - **Simple**: one if-then statement
   - **Stateless** (preferred): no need to remember past states
4. Test rules in head: every agent follows these rules → wanted collective behavior emerges?

**Got:** Ranked rule set each agent runs alone. Applied across swarm → target collective behavior (foraging, construction, defense, etc.).

**If fail:** Mental sim does not produce wanted emergent behavior? Rules likely need feedback loop — agents must see consequences of collective actions. Add signal for collective state (e.g., "task completion rate") and rule adjusting behavior from it.

### Step 4: Calibrate Quorum Sensing

Set thresholds triggering collective state changes when enough agents agree.

1. Find decisions needing collective agreement (not just individual response):
   - Switching from exploration to exploitation mode
   - Committing to new work site or abandoning old one
   - Escalating from normal to emergency response
2. For each collective decision, define:
   - **Quorum threshold**: count or percent of agents must signal agreement
   - **Sensing window**: time period signals counted over
   - **Hysteresis**: different thresholds for activation vs. deactivation (stops oscillation)
3. Implement quorum as signal accumulation:
   - Each agent favoring decision drops vote-signal
   - Accumulated votes exceed quorum within sensing window → decision activates
   - Votes drop below deactivation threshold → decision reverses

**Got:** Quorum thresholds let swarm make collective decisions, no leader. Hysteresis gap stops fast oscillation between states.

**If fail:** Swarm oscillates between states? Widen hysteresis gap (e.g., activate at 70%, deactivate at 30%). Swarm never reaches quorum? Lower threshold or grow sensing window. Decisions too slow? Shrink sensing window — but watch for premature consensus.

### Step 5: Test and Tune Emergent Behavior

Validate local rules produce wanted collective behavior, then tune params.

1. Run sim or pilot with small agent count (5-10)
2. Observe:
   - Swarm converges on intended behavior?
   - How long convergence takes?
   - What happens when conditions change mid-task?
   - What happens when agents fail or get added?
3. Tune params:
   - Signal decay rate: too fast → no coordination memory; too slow → stale signals dominate
   - Quorum threshold: too low → premature collective decisions; too high → paralysis
   - Exploration-exploitation balance: too much exploration → wasteful; too much exploitation → local optima
4. Stress test:
   - Remove 30% of agents fast — swarm recovers?
   - Double agent count — swarm still coordinates?
   - Inject conflicting signals — swarm resolves or deadlocks?

**Got:** Tuned param set. Swarm self-organizes toward target behavior, recovers from shocks, scales clean.

**If fail:** Swarm fails stress tests? Signal design likely too tightly coupled. Simplify: fewer signals, higher decay rates (fresh info), agents have robust default behavior when no signals present. Swarm that does something reasonable with zero signals is more resilient than one depending on signal availability.

## Checks

- [ ] Coordination problem classified into known pattern (foraging, consensus, construction, defense, division of labor)
- [ ] Stigmergic signal table defined: deposit conditions, decay rates, agent responses
- [ ] Local interaction rules simple, local, prioritized (3-7 rules)
- [ ] Quorum thresholds set with hysteresis to stop oscillation
- [ ] Small-scale test shows emergent behavior matching collective goal
- [ ] Stress test (agent removal, addition, signal disruption) shows graceful degradation

## Pitfalls

- **Over-engineering signals**: Too many signal types upfront → confusion. Start with 2 signals (attract/repel), add only when proven needed
- **Centralized thinking in disguise**: "Local rule" needs agent to know global state → not local. Refactor until each rule depends only on what agent senses directly
- **Ignoring decay**: Signals never decaying → fossilized coordination state. Every signal needs half-life fitting task time scale
- **Zero hysteresis**: Quorum thresholds with no gap between activation and deactivation → fast state oscillation. Always set deactivation lower than activation
- **Assuming homogeneity**: Agents have different abilities → single rule set may fail. Consider role-differentiated rules (see `scale-colony`)

## See Also

- `forage-resources` — applies swarm coordination to resource search and explore-exploit tradeoffs
- `build-consensus` — deep dive into distributed agreement, extends quorum sensing from this skill
- `defend-colony` — collective defense patterns built on signal and rule framework here
- `scale-colony` — scaling when swarm outgrows initial coordination design
- `adapt-architecture` — morphic skill for transforming system architecture, pairs with swarm coordination triggering structural change
- `deploy-to-kubernetes` — practical distributed system deployment where swarm patterns apply
- `plan-capacity` — capacity planning informed by swarm scaling dynamics
- `coordinate-reasoning` — AI self-application variant; maps stigmergic signals to context management with info decay rates and local protocols
