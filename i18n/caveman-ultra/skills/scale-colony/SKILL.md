---
name: scale-colony
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scale distributed sys+orgs → colony budding, role differentiation, growth-triggered arch transitions. Growth phase recognition, age polyethism, fission protocols, inter-colony coord, scaling limit detect. Use → team that worked at 10 breaks at 50, comms overhead > productive output, plan growth proactive, coord failures correlate w/ size.
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

Scale distributed sys|teams|orgs → budding (split), role diff (age polyethism), growth-triggered arch transitions — maintain coord quality as colony grows beyond initial design.

## Use When

- Worked @ 10 agents, breaks @ 50
- Comms overhead > productive output
- Implicit coord patterns need explicit
- Plan growth → scale proactive
- Coord fails correlate w/ size (lost msgs, dup work, unclear ownership)
- Existing sys needs split → semi-autonomous sub-colonies

## In

- **Required**: Current size + target growth
- **Required**: Current coord mechanisms + stress points
- **Optional**: Structure (flat|hierarchical|clustered)
- **Optional**: Role diff already in place
- **Optional**: Growth timeline + constraints
- **Optional**: Inter-colony coord needs (if splitting)

## Do

### Step 1: Recognize Growth Phase

Identify scaling phase → apply right strategy.

1. Classify phase:

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

2. Stress signals:
   - **Comms overload**: msgs/agent/day grows faster than colony size
   - **Decision latency**: proposal→decision time ↑
   - **Coord failures**: dup work, dropped tasks, conflicting actions ↑
   - **Knowledge dilution**: newcomers slow to productive
   - **Identity loss**: agents can't describe purpose consistently
3. About to cross phase boundary or already crossed?

→ Clear phase ID + stress signals indicating approach|cross.

If err: phase unclear → measure 3 metrics: comm vol/agent, decision latency, coord fail rate. Plot over time. Inflection points = phase transitions. No metrics → likely Founding (where metrics not yet needed).

### Step 2: Role Differentiation (Age Polyethism)

Progressive specialization → roles by experience + colony needs.

1. Role progression:
   - **Newcomers**: observation, learning, simple (low autonomy, high guidance)
   - **Workers**: standard exec, signal following (mod autonomy)
   - **Specialists**: domain expertise, complex tasks, mentor newcomers (high autonomy)
   - **Foragers/Scouts**: exploration, innovation, external interface (see `forage-resources`)
   - **Coordinators**: inter-group comms, conflict resolution, quorum mgmt
2. Role transitions:
   - Triggered by experience thresholds, not appointment
   - Agent done threshold tasks successfully → next role (calibrate by complexity + growth rate — 5-10 simple, 20-30 specialist)
   - Reverse possible (specialist → worker in new domain)
   - Distribution adapts to needs:
     - Growing → more newcomer slots, active mentoring
     - Stable → balanced across all roles
     - Threatened → more defenders, fewer scouts (see `defend-colony`)
3. Preserve flexibility:
   - No agent permanently locked
   - Emergency protocols can temp reassign any agent any role
   - Cross-training → cover adjacent roles

→ Roles where agents progress simple→complex, distribution reflects needs+phase.

If err: rigid silos → ↑cross-training + rotation freq. Newcomers struggle progress → mentoring insufficient — pair w/ specialist for first N tasks. Too many in one role → triggers miscalibrated — adjust by colony-wide demand.

### Step 3: Restructure Coord for Scale

Adapt mechanisms from `coordinate-swarm` for size.

1. Replace direct comms → layered signaling:
   - Founding: everyone→everyone (N×N)
   - Growth: cluster squads of 5-8; direct in squad, signal between
   - Maturity: squads → departments; intra-squad direct, inter-squad signal, inter-dept broadcast
2. Coord layers:
   - **Local**: in squad, direct signal exchange (stigmergy)
   - **Regional**: between squads same dept, aggregated signals
   - **Colony**: between depts, broadcast only for colony-wide decisions
3. Inter-layer interfaces:
   - Each squad has 1 designated communicator who aggregates+relays
   - Communicators filter noise: not every local signal relayed up
   - Colony broadcasts rare → quorum, alarm escalation, major state changes
4. Comms overhead budget:
   - Target: each agent <20% capacity on coord
   - Measure actual; exceed → add layer or split oversized squad

→ Layered coord, comms overhead grows logarithmic (not linear) w/ size. Local fast direct; colony-wide slower but functional.

If err: layers create info bottlenecks (communicators overloaded) → add redundant communicators or ↓relay freq. Layers create isolation (squads don't know others) → ↑inter-layer signal freq or cross-squad liaison roles.

### Step 4: Execute Budding (Fission)

Split colony → semi-autonomous sub-colonies when exceeds single-coord capacity.

1. Fission triggers:
   - >100 agents (or coord layer count >3)
   - Comms overhead >30% capacity despite layering
   - Decision latency exceeds time-sensitive thresholds
   - Subgroups have distinct identities + can operate independent
2. Plan fission:
   - Identify natural split lines (existing clusters, domain bounds, geo)
   - Each daughter has viable role distribution (can't split all specialists into one)
   - Each must have: ≥1 coordinator, sufficient workers, access to shared resources
   - Define inter-colony interface: what shared, what independent
3. Execute split:
   - Announce plan + timeline (consensus required — see `build-consensus`)
   - Transfer agents → daughters by existing cluster membership
   - Establish inter-colony channels (lightweight, async)
   - Each daughter bootstraps own local coord (inheriting from parent)
4. Post-fission stabilization:
   - Monitor each for viability (sustains itself?)
   - Inter-colony coord minimal (quarterly sync, not daily)
   - Failed daughter → reabsorb into nearest viable

→ ≥2 viable daughters semi-autonomous w/ own coord, connected by lightweight interfaces.

If err: daughters too small → fission premature; remerge + retry larger. Inter-colony coord as heavy as pre-fission → split lines wrong, too interdependent. Re-draw on natural independence.

### Step 5: Monitor Limits + Adapt

Continuous assess: structure matches size+needs?

1. Scaling health metrics:
   - **Coord overhead ratio**: time coord/time produce
   - **Decision throughput**: decisions/time (↑ or steady w/ growth)
   - **Agent satisfaction**: engagement, retention, purpose (drops on fail)
   - **Err rate**: coord fails/time (not linear w/ growth)
2. Limit indicators:
   - Overhead ratio >25% → more automation or layer
   - Throughput declining → governance needs revision
   - Turnover spiking → cultural|structural issues
   - Err rate accelerating → coord failing
3. Trigger adapt:
   - Phase transition → apply Step 1 strategy
   - Limit reached → escalate (role diff → coord restructure → fission)
   - External change (market, tech) → may need transformation (see `adapt-architecture`)

→ Colony monitors own health + proactively adapts before stress = failure.

If err: no metrics → lacks observability — build measurement before more structure. Metrics show problems but can't adapt → resistance cultural not technical — address human factors (fear, ownership, trust) before restructure.

## Check

- [ ] Phase ID'd w/ specific stress signals
- [ ] Role diff defined w/ progressive specialization
- [ ] Coord layered for size
- [ ] Comms overhead <20-25% capacity
- [ ] Fission plan exists for >single-coord capacity
- [ ] Health metrics tracked + thresholds trigger adapt
- [ ] Daughter colonies (post-fission) viable distribution

## Traps

- **Scale structure pre-needed**: Premature layering = overhead w/o benefit. 10-team doesn't need dept coordinators. Stress signals guide.
- **Preserve founding culture at all costs**: 5-agent ways break @ 50. Scaling needs evolution; nostalgia prevents adaptation.
- **Fission w/o independence**: Sub-colonies still depend daily → worst of both — coord overhead + separation overhead.
- **Uniform role distribution**: Not every sub-colony needs same ratios. Research → more scouts; production → more workers.
- **Ignore remerge**: Sometimes fission fails; remerge best move. Treating fission irreversible prevents recovery.

## →

- `coordinate-swarm` — foundational patterns this skill scales
- `forage-resources` — scales diff than production; role diff affects scout alloc
- `build-consensus` — must adapt for larger groups
- `defend-colony` — defense scales w/ colony
- `adapt-architecture` — morphic skill for structural transformation
- `plan-capacity` — capacity planning for growth
- `conduct-retrospective` — identify stress before failure
