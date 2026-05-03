---
name: scale-colony
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
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

Scale distributed systems, teams, orgs through colony budding (split), role differentiation (age polyethism), and growth-triggered architectural transitions — keep coordination quality as colony grows past initial design.

## When Use

- Team or system that worked at 10 agents breaks down at 50
- Comms overhead grows faster than productive output
- Coordination patterns implicit must become explicit
- Planning growth phase, want scale proactive not reactive
- Coordination failures correlate with size (lost messages, duplicated work, unclear ownership)
- Existing system needs split into semi-autonomous sub-colonies

## Inputs

- **Required**: Current colony size + target growth (or growth rate)
- **Required**: Current coordination mechanisms + stress points
- **Optional**: Colony structure (flat, hierarchical, clustered)
- **Optional**: Role differentiation already in place
- **Optional**: Growth timeline + constraints
- **Optional**: Inter-colony coordination needs (if splitting)

## Steps

### Step 1: Recognize Growth Phase

Identify which scaling phase colony is in to apply right strategies.

1. Classify current growth phase.

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

2. Identify growth stress signals.
   - **Communication overload**: messages per agent per day growing faster than colony size
   - **Decision latency**: time from proposal to decision growing
   - **Coordination failures**: duplicated work, dropped tasks, conflicting actions growing
   - **Knowledge dilution**: new agents take longer to become productive
   - **Identity loss**: agents cannot describe colony's purpose consistent
3. Determine if colony is about to cross phase boundary or has crossed it

**Got:** Clear identification of current growth phase + specific stress signals showing colony approaching or crossed phase boundary.

**If fail:** Phase not clear? Measure three concrete metrics: comm volume per agent, decision latency, coordination failure rate. Plot over time. Inflection points = phase transitions. No metrics? Colony likely Founding phase (where metrics not yet needed).

### Step 2: Implement Role Differentiation (Age Polyethism)

Introduce progressive specialization where agents take different roles by experience + colony needs.

1. Define role progression path.
   - **Newcomers**: observation, learning, simple tasks (low autonomy, high guidance)
   - **Workers**: standard task execution, signal following (moderate autonomy)
   - **Specialists**: domain expertise, complex tasks, mentor newcomers (high autonomy)
   - **Foragers/Scouts**: exploration, innovation, external interface (see `forage-resources`)
   - **Coordinators**: inter-group communication, conflict resolution, quorum management
2. Implement role transitions.
   - Triggered by experience thresholds, not appointment
   - Agent that completed threshold of tasks transitions to next role (calibrate by complexity, growth — 5-10 for simple, 20-30 for specialist)
   - Reverse transitions possible (specialist → worker in new domain)
   - Colony's role distribution adapts to needs.
     - Growing colony → more newcomer slots, active mentoring
     - Stable colony → balanced distribution across all roles
     - Threatened colony → more defenders, fewer scouts (see `defend-colony`)
3. Preserve role flexibility.
   - No agent permanently locked into role
   - Emergency protocols can temp reassign any agent to any role
   - Cross-training ensures agents can cover adjacent roles

**Got:** Role structure where agents progress from simple to complex responsibilities, colony's role distribution reflects current needs + phase.

**If fail:** Role differentiation creates rigid silos? Up cross-training + rotation frequency. Newcomers struggle to progress? Mentoring insufficient — pair each newcomer with specialist for first N tasks. Too many cluster in one role? Transition triggers miscalibrated — adjust by colony-wide role demand.

### Step 3: Restructure Coordination for Scale

Adapt coordination from `coordinate-swarm` to handle bigger colony.

1. Replace direct comms with layered signaling.
   - Founding: everyone talks to everyone (N×N comms)
   - Growth: cluster into squads of 5-8; direct comms within squads, signal-based between
   - Maturity: squads form departments; intra-squad direct, inter-squad signal, inter-department broadcast
2. Implement coordination layers.
   - **Local coordination**: within squad, direct signal exchange (stigmergy)
   - **Regional coordination**: between squads in same department, aggregated signals
   - **Colony coordination**: between departments, broadcast only for colony-wide decisions
3. Design inter-layer interfaces.
   - Each squad has one designated communicator who aggregates + relays signals
   - Communicators filter noise: not every local signal relayed up
   - Colony-wide broadcasts rare, reserved for quorum decisions, alarm escalation, major state changes
4. Communication overhead budget.
   - Target: each agent spends <20% of capacity on coordination
   - Measure actual overhead; if exceeds budget, add another coordination layer or split oversized squad

**Got:** Layered coordination structure where comms overhead grows logarithmic (not linear) with colony size. Local coordination fast + direct; colony-wide slower but functional.

**If fail:** Coordination layers create info bottlenecks (communicators overloaded)? Add redundant communicators or reduce relay frequency. Layers create isolation (squads do not know what others do)? Up inter-layer signal frequency or create cross-squad liaison roles.

### Step 4: Execute Colony Budding (Fission)

Split colony into semi-autonomous sub-colonies when exceeds single-coordination capacity.

1. Recognize fission triggers.
   - Colony exceeds 100 agents (or coordination layer count exceeds 3)
   - Comms overhead exceeds 30% of agent capacity despite layering
   - Decision latency exceeds acceptable thresholds for time-sensitive ops
   - Subgroups have distinct identities, can operate independently
2. Plan fission.
   - Identify natural split lines (existing clusters, domain boundaries, geographic separation)
   - Each daughter colony has viable role distribution (cannot split all specialists into one)
   - Each daughter colony must have: at least one coordinator, sufficient workers, access to shared resources
   - Define inter-colony interface: what info shared, what independent
3. Execute split.
   - Announce fission plan + timeline (consensus required — see `build-consensus`)
   - Transfer agents to daughter colonies based on existing cluster membership
   - Establish inter-colony comm channels (lightweight, async)
   - Each daughter colony bootstraps own local coordination (inheriting patterns from parent)
4. Post-fission stabilization.
   - Monitor each daughter for viability (can sustain itself?)
   - Inter-colony coordination minimal (quarterly sync, not daily)
   - If daughter fails, reabsorb into nearest viable colony

**Got:** Two or more viable daughter colonies, each operating semi-autonomous with own coordination, connected by lightweight inter-colony interfaces.

**If fail:** Daughter colonies too small to be viable? Fission was premature — remerge, try again at larger size. Inter-colony coordination as heavy as pre-fission single-colony? Split lines wrong — colonies too interdependent. Re-draw boundaries along natural independence lines.

### Step 5: Monitor Scaling Limits and Adapt

Continuous assess if current structure matches colony's size + needs.

1. Track scaling health metrics.
   - **Coordination overhead ratio**: time coordinating / time producing
   - **Decision throughput**: decisions per time unit (should grow or hold steady with growth)
   - **Agent satisfaction**: engagement, retention, sense of purpose (drops when scaling fails)
   - **Error rate**: coordination failures per time unit (should not grow linear with growth)
2. Identify scaling limit indicators.
   - Overhead ratio exceeding 25% → need more automation or another coordination layer
   - Decision throughput declining → governance structure needs revision
   - Agent turnover spiking → cultural or structural issues from scaling
   - Error rate accelerating → coordination mechanisms failing
3. Trigger adaptation.
   - Phase transition detected → apply right phase strategy from Step 1
   - Scaling limit reached → escalate to next structural intervention (role differentiation → coordination restructure → fission)
   - External change (market shift, tech disruption) → may require colony transformation (see `adapt-architecture`)

**Got:** Colony that monitors own scaling health, proactively adapts structure before scaling stress becomes scaling failure.

**If fail:** Scaling health metrics not available? Colony lacks observability — build measurement before more structure. Metrics show problems but colony cannot adapt? Resistance cultural not technical — address human factors (fear of change, ownership attachment, trust deficits) before restructuring.

## Checks

- [ ] Current growth phase identified with specific stress signals
- [ ] Role differentiation defined with progressive specialization
- [ ] Coordination layered for colony size
- [ ] Comms overhead stays below 20-25% of agent capacity
- [ ] Fission plan exists for when colony exceeds single-coordination capacity
- [ ] Scaling health metrics tracked, thresholds trigger adaptation
- [ ] Each daughter colony (post-fission) has viable role distribution

## Pitfalls

- **Scale structure before needed**: Premature layering adds overhead without benefit. 10-person team does not need department coordinators. Let stress signals guide structural changes
- **Preserve founding culture at all costs**: What worked at 5 agents will not work at 50. Scaling needs structural evolution; nostalgia for founding phase prevents necessary adaptation
- **Fission without independence**: Splitting colony into sub-colonies that still depend on each other for daily ops = worst of both worlds — overhead of coordination + overhead of separation
- **Uniform role distribution**: Not every sub-colony needs same role ratios. Research colony needs more scouts; production needs more workers. Adapt role distribution to mission
- **Ignore remerge as option**: Sometimes fission fails, best move is remerge. Treat fission as irreversible = prevents recovery from bad splits

## See Also

- `coordinate-swarm` — foundational coordination patterns this skill scales
- `forage-resources` — foraging scales different than production; role differentiation affects scout allocation
- `build-consensus` — consensus mechanisms must adapt for larger groups
- `defend-colony` — defense must scale with colony
- `adapt-architecture` — morphic skill for structural transformation, triggered by growth pressure
- `plan-capacity` — capacity planning for growth projections
- `conduct-retrospective` — retrospectives help identify scaling stress before failure
