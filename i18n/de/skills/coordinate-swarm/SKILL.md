---
name: coordinate-swarm
description: >
  Anwenden collective intelligence coordination patterns — stigmergy, local rules,
  and quorum sensing — to organize distributed systems, teams, or workflows
  ohne centralized control. Umfasst signal design, agent autonomy boundaries,
  emergent behavior cultivation, and feedback loop tuning. Verwenden wenn designing
  distributed systems ohne a coordination bottleneck, organizing teams that
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
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Schwarm koordinieren

Establish coordination across distributed agents using stigmergy (indirect communication durch environment modification), local interaction rules, and quorum sensing — enabling coherent collective behavior ohne a central controller.

## Wann verwenden

- Designing distributed systems where no single node sollte a coordination bottleneck
- Organizing teams or workflows that must self-coordinate ohne constant management oversight
- Building event-driven architectures where components communicate durch shared state anstatt direct messaging
- Scaling a process that works well with 3 agents but breaks down at 30
- Bootstrapping coordination patterns for a new swarm-style domain (see `forage-resources`, `build-consensus`)
- Replacing fragile centralized orchestration with resilient emergent coordination

## Eingaben

- **Erforderlich**: Description of the agents (workers, services, team members) that need coordination
- **Erforderlich**: The collective goal or desired emergent behavior
- **Optional**: Current coordination mechanism and its failure modes
- **Optional**: Number of agents (affects pattern selection — small swarms vs. large colonies)
- **Optional**: Latency tolerance (real-time vs. eventual coordination)
- **Optional**: Environmental constraints (shared state availability, communication bandwidth)

## Vorgehensweise

### Schritt 1: Identifizieren the Coordination Problem Class

Classify the coordination challenge to select appropriate patterns.

1. Abbilden the current state: who are the agents, what do they do individually, where does coordination break down?
2. Classify das Problem:
   - **Foraging** — agents search for and exploit distributed resources (see `forage-resources`)
   - **Consensus** — agents must agree on a collective decision (see `build-consensus`)
   - **Construction** — agents build or maintain a shared structure incrementally
   - **Defense** — agents detect and respond to threats collectively (see `defend-colony`)
   - **Division of labor** — agents must self-organize into specialized roles
3. Identifizieren the failure mode of current coordination:
   - Single point of failure (centralized controller)
   - Communication bottleneck (too many direct messages)
   - Coherence loss (agents drift apart ohne feedback)
   - Rigidity (cannot adapt to changing conditions)

**Erwartet:** A clear classification of the coordination problem type and the specific failure mode to address. This determines which swarm patterns to apply.

**Bei Fehler:** If das Problem doesn't fit a single class, it kann a composite. Decompose into sub-problems and address each with the appropriate pattern. If agents are too heterogeneous for a single coordination model, consider layered coordination — homogeneous clusters coordinated via inter-cluster stigmergy.

### Schritt 2: Entwerfen Stigmergic Signals

Erstellen the indirect communication channels durch which agents influence each other's behavior.

1. Definieren the shared environment (database, message queue, Dateisystem, physical space, shared board)
2. Entwerfen signals that agents deposit into die Umgebung:
   - **Trail signals**: markers that accumulate along successful paths (like ant pheromones)
   - **Threshold signals**: counters that trigger behavior changes when they cross thresholds
   - **Inhibition signals**: markers that repel agents from exhausted areas
3. Definieren signal properties:
   - **Decay rate**: how quickly signals fade (prevents stale state from dominating)
   - **Reinforcement**: how successful outcomes strengthen signals
   - **Visibility radius**: how far a signal propagates
4. Abbilden signals to agent behaviors:
   - When an agent detects signal X ueber threshold T, it performs action A
   - When an agent completes action A erfolgreich, it deposits signal Y
   - When no signal is detected, the agent follows its default exploration behavior

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

**Erwartet:** A signal table mapping environmental markers to agent deposit conditions, decay rates, and response behaviors. Signals sollte simple, composable, and independently meaningful.

**Bei Fehler:** If signal design feels overly complex, reduce to two signals: one positive (success trail) and one negative (danger flag). Most coordination problems kann bootstrapped with attract/repel dynamics. Hinzufuegen nuance only nach the basic system is functioning.

### Schritt 3: Definieren Local Interaction Rules

Angeben the simple rules each agent follows, using only local information (their own state + nearby signals).

1. Definieren the agent's perception radius (what can it sense?)
2. Schreiben 3-7 local rules in priority order:
   - Rule 1 (safety): If danger-flag detected, move away
   - Rule 2 (response): If help-signal detected and idle, move toward
   - Rule 3 (exploitation): If success-trail detected, follow toward strongest signal
   - Rule 4 (exploration): If no signals detected, move randomly with bias toward unexplored areas
   - Rule 5 (deposit): After completing task, deposit success-trail at location
3. Each rule muss:
   - **Local**: depends only on what the individual agent can perceive
   - **Simple**: expressible in one if-then statement
   - **Stateless** (preferred): nicht require the agent to remember past states
4. Testen rules mentally: if every agent follows these rules, does the desired collective behavior emerge?

**Erwartet:** A prioritized rule set that each agent executes independently. When applied across the swarm, these local rules produce das Ziel collective behavior (foraging, construction, defense, etc.).

**Bei Fehler:** If mental simulation doesn't produce the desired emergent behavior, the rules likely need a feedback loop — agents muss able to observe the consequences of their collective actions. Hinzufuegen a signal that represents the collective state (e.g., "task completion rate") and a rule that adjusts behavior basierend auf it.

### Schritt 4: Kalibrieren Quorum Sensing

Set thresholds that trigger collective state changes when enough agents agree.

1. Identifizieren decisions that require collective agreement (not just individual response):
   - Switching from exploration to exploitation mode
   - Committing to a new work site or abandoning an old one
   - Escalating from normal to emergency response
2. Fuer jede collective decision, define:
   - **Quorum threshold**: number or percentage of agents that must signal agreement
   - **Sensing window**: time period over which signals are counted
   - **Hysteresis**: different thresholds for activation vs. deactivation (prevents oscillation)
3. Implementieren quorum as signal accumulation:
   - Each agent that favors the decision deposits a vote-signal
   - When accumulated votes exceed the quorum threshold innerhalb the sensing window, the decision activates
   - When votes drop unter the deactivation threshold, the decision reverses

**Erwartet:** Quorum thresholds that allow the swarm to make collective decisions ohne a leader. The hysteresis gap prevents rapid oscillation zwischen states.

**Bei Fehler:** If the swarm oscillates zwischen states, widen the hysteresis gap (e.g., activate at 70%, deactivate at 30%). If the swarm never reaches quorum, lower the threshold or increase the sensing window. If decisions are too slow, reduce the sensing window — but beware of premature consensus.

### Schritt 5: Testen and Abstimmen Emergent Behavior

Validieren that local rules produce the desired collective behavior, then tune parameters.

1. Ausfuehren a simulation or pilot with a small number of agents (5-10)
2. Observe:
   - Does the swarm converge on the intended behavior?
   - How long does convergence take?
   - What happens when conditions change mid-task?
   - What happens when agents fail or are added?
3. Abstimmen parameters:
   - Signal decay rate: too fast → no coordination memory; too slow → stale signals dominate
   - Quorum threshold: too low → premature collective decisions; too high → paralysis
   - Exploration-exploitation balance: too much exploration → inefficient; too much exploitation → local optima
4. Stress test:
   - Entfernen 30% of agents suddenly — does the swarm recover?
   - Double the agent count — does the swarm still coordinate?
   - Introduce conflicting signals — does the swarm resolve or deadlock?

**Erwartet:** A tuned parameter set where the swarm self-organizes toward das Ziel behavior, recovers from perturbations, and scales gracefully.

**Bei Fehler:** If the swarm fails stress tests, the signal design is likely too tightly coupled. Simplify: reduce to fewer signals, increase decay rates (fresher information), and ensure agents have a robust default behavior when no signals are present. A swarm that does something reasonable with zero signals is more resilient than one that depends on signal availability.

## Validierung

- [ ] Coordination problem is classified into a recognized pattern (foraging, consensus, construction, defense, division of labor)
- [ ] Stigmergic signal table is defined with deposit conditions, decay rates, and agent responses
- [ ] Local interaction rules are simple, local, and prioritized (3-7 rules)
- [ ] Quorum thresholds are set with hysteresis to prevent oscillation
- [ ] Small-scale test shows emergent behavior matching the collective goal
- [ ] Stress test (agent removal, addition, signal disruption) shows graceful degradation

## Haeufige Stolperfallen

- **Over-engineering signals**: Starting with too many signal types creates confusion. Beginnen with 2 signals (attract/repel) and add only when proven necessary
- **Centralized thinking in disguise**: If your "local rule" requires an agent to know the global state, it's not local. Refactor until each rule depends only on what the agent can directly perceive
- **Ignoring decay**: Signals that never decay create fossilized coordination state. Every signal needs a half-life appropriate to the task's time scale
- **Zero hysteresis**: Quorum thresholds ohne a gap zwischen activation and deactivation cause rapid state oscillation. Always set deactivation lower than activation
- **Assuming homogeneity**: If agents have different capabilities, a single rule set may not work. Erwaegen role-differentiated rules (see `scale-colony`)

## Verwandte Skills

- `forage-resources` — applies swarm coordination specifically to resource search and explore-exploit tradeoffs
- `build-consensus` — deep dive into distributed agreement mechanisms, extending the quorum sensing from this skill
- `defend-colony` — collective defense patterns that build on the signal and rule framework here
- `scale-colony` — scaling strategies for when the swarm outgrows its initial coordination design
- `adapt-architecture` — morphic skill for transforming system architecture, complementary when swarm coordination triggers structural change
- `deploy-to-kubernetes` — practical distributed system deployment where swarm coordination patterns apply
- `plan-capacity` — capacity planning informed by swarm scaling dynamics
- `coordinate-reasoning` — AI self-application variant; maps stigmergic signals to context management with information decay rates and local protocols
