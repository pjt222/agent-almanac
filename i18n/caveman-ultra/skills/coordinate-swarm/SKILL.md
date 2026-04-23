---
name: coordinate-swarm
locale: caveman-ultra
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

Stigmergy + local rules + quorum → coherent collective, no central ctrl.

## Use When

- Distributed sys → no central bottleneck
- Self-coord teams → no mgr overhead
- Event-driven arch → shared state, not direct msg
- Works @3 agents → breaks @30 → scale
- Bootstrap new swarm domain (`forage-resources`, `build-consensus`)
- Replace fragile central orch → resilient emergent

## In

- **Required**: Agents desc (workers, services, team)
- **Required**: Collective goal / target behavior
- **Optional**: Current coord + fail modes
- **Optional**: Agent count → pattern choice
- **Optional**: Latency tolerance (realtime vs eventual)
- **Optional**: Env constraints (shared state, bandwidth)

## Do

### Step 1: Classify Problem

1. Map: who agents, what do, where coord breaks
2. Classify:
   - **Foraging** → search distributed res (`forage-resources`)
   - **Consensus** → agree collective decision (`build-consensus`)
   - **Construction** → build shared structure
   - **Defense** → detect threats (`defend-colony`)
   - **Division of labor** → self-organize roles
3. Fail mode:
   - Single point fail (central ctrl)
   - Comm bottleneck (too many msg)
   - Coherence loss (drift, no feedback)
   - Rigidity (no adapt)

→ Clear class + fail mode → pattern choice.

If err: no single class → composite → decompose. Heterogeneous → layered coord (homogeneous clusters + inter-cluster stigmergy).

### Step 2: Design Signals

Indirect comm channels.

1. Shared env (DB, queue, FS, board)
2. Signal types:
   - **Trail**: accumulate on success paths (ant pheromone)
   - **Threshold**: counter → behavior switch
   - **Inhibition**: repel from exhausted areas
3. Props:
   - **Decay**: fade rate → no stale dominance
   - **Reinforce**: success strengthens
   - **Radius**: propagation range
4. Signal → behavior map:
   - Signal X > T → action A
   - A done → deposit Y
   - No signal → default explore

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

→ Signal table: deposit conds + decay + responses. Simple + composable.

If err: too complex → 2 signals (attract/repel). Add nuance after basic works.

### Step 3: Local Rules

Simple rules, local info only.

1. Perception radius (what sense?)
2. 3-7 rules, priority order:
   - Rule 1 (safety): danger-flag → flee
   - Rule 2 (response): help-signal + idle → move toward
   - Rule 3 (exploit): success-trail → follow strongest
   - Rule 4 (explore): no signal → random + unexplored bias
   - Rule 5 (deposit): task done → deposit success-trail
3. Each rule:
   - **Local**: only what agent perceives
   - **Simple**: one if-then
   - **Stateless** (pref): no past mem
4. Mental test → does collective behavior emerge?

→ Prioritized rules, independent exec → target behavior emerges.

If err: no emergence → feedback loop needed. Add signal for collective state + adjust rule.

### Step 4: Quorum Thresholds

Trigger collective changes when enough agree.

1. Collective decisions:
   - Explore → exploit mode
   - New worksite commit / abandon
   - Normal → emergency
2. Per decision:
   - **Threshold**: # / % agents agreeing
   - **Window**: signal count period
   - **Hysteresis**: different on/off thresh → no osc
3. Quorum = signal accumulation:
   - Fav agent → vote-signal
   - Votes > thresh in window → activate
   - Votes < deact thresh → reverse

→ Leaderless decisions. Hysteresis gap → no rapid osc.

If err: oscillation → widen hyst gap (70/30). Never reaches quorum → lower thresh / widen window. Too slow → shrink window (beware premature).

### Step 5: Test + Tune

1. Pilot 5-10 agents
2. Observe:
   - Converges on behavior?
   - How long?
   - Conditions change mid-task → what?
   - Agents fail / added → what?
3. Tune params:
   - Decay: fast → no memory; slow → stale dominates
   - Quorum: low → premature; high → paralysis
   - Explore/exploit balance: too explore → inefficient; too exploit → local optima
4. Stress:
   - Remove 30% agents → recover?
   - Double count → still coord?
   - Conflict signals → resolve / deadlock?

→ Tuned params, self-organizes, recovers, scales.

If err: stress fails → too tightly coupled. Simplify: fewer signals, faster decay, robust default. Swarm w/ zero-signal default > signal-dependent swarm.

## Check

- [ ] Problem classified (foraging / consensus / construction / defense / labor)
- [ ] Signal table: deposit + decay + response
- [ ] Rules simple + local + prioritized (3-7)
- [ ] Quorum w/ hysteresis → no osc
- [ ] Small test → emergent behavior matches goal
- [ ] Stress test → graceful degradation

## Traps

- **Signal bloat**: Too many types → confusion. Start 2 (attract/repel)
- **Fake local**: Rule needs global state → not local. Refactor
- **No decay**: Fossilized coord state. Half-life per task scale
- **Zero hysteresis**: Rapid osc. Deact < act always
- **Homogeneity assumed**: Diff caps → role-diff rules (`scale-colony`)

## →

- `forage-resources` — res search + explore-exploit
- `build-consensus` — distrib agreement deep-dive
- `defend-colony` — collective defense on signal framework
- `scale-colony` — scaling past initial coord
- `adapt-architecture` — morphic arch transform
- `deploy-to-kubernetes` — distrib sys deploy
- `plan-capacity` — capacity + swarm scaling
- `coordinate-reasoning` — AI self-variant; stigmergy → ctx mgmt
