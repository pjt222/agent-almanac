---
name: scale-colony
description: >
  Scale distributed systems and organizations through colony budding, role
  differentiation, and growth-triggered architectural transitions. Covers
  growth phase recognition, age polyethism, fission protocols, inter-colony
  coordination, and scaling limit detection. Use when a team or system that
  worked at 10 agents breaks down at 50, when communication overhead grows
  faster than productive output, when planning a growth phase proactively, or
  when coordination failures correlate with size such as lost messages, duplicated
  work, or unclear ownership.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: advanced
  language: natural
  tags: swarm, scaling, colony-budding, role-differentiation
---

# Scale Colony

Scale distributed systems, teams, or organizations through colony budding (splitting), role differentiation (age polyethism), and growth-triggered architectural transitions — maintaining coordination quality as the colony grows beyond its initial design capacity.

## When to Use

- A team or system that worked at 10 agents is breaking down at 50
- Communication overhead is growing faster than productive output
- Coordination patterns that were implicit need to become explicit
- Planning a growth phase and wanting to scale proactively rather than reactively
- Observing coordination failures that correlate with size (lost messages, duplicated work, unclear ownership)
- The existing system needs to split into semi-autonomous sub-colonies

## Inputs

- **Required**: Current colony size and target growth (or growth rate)
- **Required**: Current coordination mechanisms and their stress points
- **Optional**: Colony structure (flat, hierarchical, clustered)
- **Optional**: Role differentiation already in place
- **Optional**: Growth timeline and constraints
- **Optional**: Inter-colony coordination needs (if splitting)

## Procedure

### Step 1: Recognize the Growth Phase

Identify which scaling phase the colony is in to apply appropriate strategies.

1. Classify the current growth phase:

```
Colony Growth Phases:
┌───────────┬──────────────┬───────────────────────────────────────────┐
│ Phase     │ Size Range   │ Characteristics                           │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Founding  │ 1-7 agents   │ Everyone does everything, direct comms,   │
│           │              │ implicit coordination, high agility       │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Growth    │ 8-30 agents  │ Roles emerge, some specialization, comms  │
│           │              │ overhead increases, need for structure     │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Maturity  │ 30-100 agents│ Formal roles, layered coordination,       │
│           │              │ sub-groups form, inter-group coordination  │
├───────────┼──────────────┼───────────────────────────────────────────┤
│ Fission   │ 100+ agents  │ Colony too large for single coordination  │
│           │              │ framework, must bud into sub-colonies     │
└───────────┴──────────────┴───────────────────────────────────────────┘
```

2. Identify growth stress signals:
   - **Communication overload**: messages per agent per day increasing faster than colony size
   - **Decision latency**: time from proposal to decision increasing
   - **Coordination failures**: duplicated work, dropped tasks, conflicting actions increasing
   - **Knowledge dilution**: new agents take longer to become productive
   - **Identity loss**: agents can't describe the colony's purpose consistently
3. Determine if the colony is about to cross a phase boundary or has already crossed it

**Expected:** Clear identification of the current growth phase and the specific stress signals indicating the colony is approaching or has crossed a phase boundary.

**On failure:** If the phase isn't clear, measure three concrete metrics: communication volume per agent, decision latency, and coordination failure rate. Plot them over time. The inflection points reveal phase transitions. If metrics aren't available, the colony is likely in the Founding phase (where metrics aren't yet needed).

### Step 2: Implement Role Differentiation (Age Polyethism)

Introduce progressive specialization where agents take on different roles based on experience and colony needs.

1. Define the role progression path:
   - **Newcomers**: observation, learning, simple tasks (low autonomy, high guidance)
   - **Workers**: standard task execution, signal following (moderate autonomy)
   - **Specialists**: domain expertise, complex tasks, mentoring newcomers (high autonomy)
   - **Foragers/Scouts**: exploration, innovation, external interface (see `forage-resources`)
   - **Coordinators**: inter-group communication, conflict resolution, quorum management
2. Implement role transitions:
   - Transitions are triggered by experience thresholds, not appointment
   - An agent that has completed a threshold number of tasks successfully transitions to the next role (calibrate the threshold based on task complexity and colony growth rate — e.g., 5-10 tasks for simple roles, 20-30 for specialist roles)
   - Reverse transitions are possible (specialist returns to worker role in a new domain)
   - The colony's role distribution adapts to current needs:
     - Growing colony → more newcomer slots, active mentoring
     - Stable colony → balanced distribution across all roles
     - Threatened colony → more defenders, fewer scouts (see `defend-colony`)
3. Preserve role flexibility:
   - No agent is permanently locked into a role
   - Emergency protocols can temporarily reassign any agent to any role
   - Cross-training ensures agents can cover adjacent roles

**Expected:** A role structure where agents naturally progress from simple to complex responsibilities, with the colony's role distribution reflecting its current needs and phase.

**On failure:** If role differentiation creates rigid silos, increase cross-training requirements and rotation frequency. If newcomers struggle to progress, the mentoring system is insufficient — pair each newcomer with a specialist for their first N tasks. If too many agents cluster in one role, the transition triggers are miscalibrated — adjust thresholds based on colony-wide role demand.

### Step 3: Restructure Coordination for Scale

Adapt the coordination mechanisms from `coordinate-swarm` to handle increased colony size.

1. Replace direct communication with layered signaling:
   - Founding phase: everyone talks to everyone (N×N communication)
   - Growth phase: cluster into squads of 5-8; direct communication within squads, signal-based between squads
   - Maturity phase: squads form departments; intra-squad direct, inter-squad signal, inter-department broadcast
2. Implement coordination layers:
   - **Local coordination**: within a squad, direct signal exchange (stigmergy)
   - **Regional coordination**: between squads in the same department, aggregated signals
   - **Colony coordination**: between departments, broadcast signals only for colony-wide decisions
3. Design inter-layer interfaces:
   - Each squad has one designated communicator who aggregates and relays signals
   - Communicators filter noise: not every local signal gets relayed upward
   - Colony-wide broadcasts are rare and reserved for quorum decisions, alarm escalation, or major state changes
4. Communication overhead budget:
   - Target: each agent spends <20% of capacity on coordination
   - Measure actual overhead; if it exceeds the budget, add another coordination layer or split the oversized squad

**Expected:** A layered coordination structure where communication overhead grows logarithmically (not linearly) with colony size. Local coordination is fast and direct; colony-wide coordination is slower but still functional.

**On failure:** If coordination layers create information bottlenecks (communicators become overloaded), add redundant communicators or reduce the relay frequency. If layers create isolation (squads don't know what other squads are doing), increase the inter-layer signal frequency or create cross-squad liaison roles.

### Step 4: Execute Colony Budding (Fission)

Split the colony into semi-autonomous sub-colonies when it exceeds single-coordination capacity.

1. Recognize fission triggers:
   - Colony exceeds 100 agents (or the coordination layer count exceeds 3)
   - Communication overhead exceeds 30% of agent capacity despite layering
   - Decision latency exceeds acceptable thresholds for time-sensitive operations
   - Subgroups have developed distinct identities and can operate independently
2. Plan the fission:
   - Identify natural split lines (existing clusters, domain boundaries, geographic separation)
   - Ensure each daughter colony has a viable role distribution (can't split all specialists into one colony)
   - Each daughter colony must have: at least one coordinator, sufficient workers, and access to shared resources
   - Define the inter-colony interface: what information is shared, what is independent
3. Execute the split:
   - Announce the fission plan and timeline (consensus required — see `build-consensus`)
   - Transfer agents to daughter colonies based on existing cluster membership
   - Establish inter-colony communication channels (lightweight, asynchronous)
   - Each daughter colony bootstraps its own local coordination (inheriting patterns from the parent)
4. Post-fission stabilization:
   - Monitor each daughter colony for viability (can it sustain itself?)
   - Inter-colony coordination should be minimal (quarterly sync, not daily)
   - If a daughter colony fails, reabsorb it into the nearest viable colony

**Expected:** Two or more viable daughter colonies, each operating semi-autonomously with their own coordination, connected by lightweight inter-colony interfaces.

**On failure:** If daughter colonies are too small to be viable, the fission was premature — remerge and try again at a larger size. If inter-colony coordination becomes as heavy as pre-fission single-colony coordination, the split lines were wrong — the colonies are too interdependent. Re-draw boundaries along natural independence lines.

### Step 5: Monitor Scaling Limits and Adapt

Continuously assess whether the current structure matches the colony's size and needs.

1. Track scaling health metrics:
   - **Coordination overhead ratio**: time spent coordinating / time spent producing
   - **Decision throughput**: decisions per time unit (should increase or hold steady with growth)
   - **Agent satisfaction**: engagement, retention, sense of purpose (drops when scaling fails)
   - **Error rate**: coordination failures per time unit (should not increase linearly with growth)
2. Identify scaling limit indicators:
   - Overhead ratio exceeding 25% → need more automation or another coordination layer
   - Decision throughput declining → governance structure needs revision
   - Agent turnover spiking → cultural or structural issues from scaling
   - Error rate accelerating → coordination mechanisms are failing
3. Trigger adaptation:
   - Phase transition detected → apply the appropriate phase strategy from Step 1
   - Scaling limit reached → escalate to the next structural intervention (role differentiation → coordination restructure → fission)
   - External change (market shift, tech disruption) → may require colony transformation (see `adapt-architecture`)

**Expected:** A colony that monitors its own scaling health and proactively adapts its structure before scaling stress becomes scaling failure.

**On failure:** If scaling health metrics are not available, the colony lacks observability — build measurement before building more structure. If metrics show problems but the colony can't adapt, the resistance is cultural, not technical — address the human factors (fear of change, ownership attachment, trust deficits) before restructuring.

## Validation

- [ ] Current growth phase is identified with specific stress signals
- [ ] Role differentiation is defined with progressive specialization
- [ ] Coordination is layered appropriately for colony size
- [ ] Communication overhead stays below 20-25% of agent capacity
- [ ] Fission plan exists for when the colony exceeds single-coordination capacity
- [ ] Scaling health metrics are tracked and thresholds trigger adaptation
- [ ] Each daughter colony (post-fission) has viable role distribution

## Common Pitfalls

- **Scaling structure before needed**: Premature layering adds overhead without benefit. A 10-person team doesn't need department coordinators. Let stress signals guide structural changes
- **Preserving founding culture at all costs**: What worked at 5 agents won't work at 50. Scaling requires structural evolution; nostalgia for the founding phase prevents necessary adaptation
- **Fission without independence**: Splitting a colony into sub-colonies that still depend on each other for daily operations creates the worst of both worlds — overhead of coordination plus overhead of separation
- **Uniform role distribution**: Not every sub-colony needs the same role ratios. A research colony needs more scouts; a production colony needs more workers. Adapt role distribution to mission
- **Ignoring remerge as an option**: Sometimes fission fails and the best move is to remerge. Treating fission as irreversible prevents recovery from bad splits

## Related Skills

- `coordinate-swarm` — foundational coordination patterns that this skill scales
- `forage-resources` — foraging scales differently than production; role differentiation affects scout allocation
- `build-consensus` — consensus mechanisms must adapt for larger groups
- `defend-colony` — defense must scale with the colony
- `adapt-architecture` — morphic skill for structural transformation, triggered by growth pressure
- `plan-capacity` — capacity planning for growth projections
- `conduct-retrospective` — retrospectives help identify scaling stress before it becomes failure
