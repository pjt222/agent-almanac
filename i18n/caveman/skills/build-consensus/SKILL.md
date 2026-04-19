---
name: build-consensus
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Achieve distributed agreement without central authority using bee democracy,
  threshold voting, and quorum sensing. Covers proposal generation, advocacy
  dynamics, commitment thresholds, deadlock resolution, and consensus quality
  assessment. Use when a group must decide between options without a designated
  leader, when centralized decision-making is a bottleneck, when stakeholders
  have different perspectives to integrate, or when designing automated systems
  that must reach consensus such as distributed databases or multi-agent AI.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, consensus, quorum-sensing, distributed-agreement
---

# Build Consensus

Achieve collective agreement across distributed agents without central authority — use scout advocacy, threshold quorum sensing, commitment dynamics modeled on honeybee swarm decision-making.

## When Use

- Group must collectively decide between multiple options without designated leader
- Centralized decision-making is bottleneck or single point of failure
- Stakeholders have different information, perspectives that must be integrated
- Past decisions suffered from groupthink (premature convergence) or analysis paralysis (no convergence)
- Designing automated systems that must reach consensus (distributed databases, multi-agent AI)
- Complementing `coordinate-swarm` when coordination requires explicit collective decisions

## Inputs

- **Required**: Decision to be made (binary choice, selection from N options, parameter setting)
- **Required**: Participating agents (team members, services, voters)
- **Optional**: Known options with preliminary quality assessments
- **Optional**: Decision urgency (time budget)
- **Optional**: Acceptable error rate (can group occasionally pick second-best option?)
- **Optional**: Current decision-making failure mode (groupthink, deadlock, flip-flopping)

## Steps

### Step 1: Generate Proposals Through Independent Scouting

Ensure decision space adequately explored before any advocacy begins.

1. Assign scouts to independently explore option space:
   - Each scout evaluates options without knowing other scouts' findings
   - Independent evaluation prevents early herding toward popular-but-mediocre options
   - Scout count: minimum 3 scouts per serious option (for reliability)
2. Scouts produce structured assessments:
   - Option identifier
   - Quality score (normalized 0-100 or categorical: poor/fair/good/excellent)
   - Key strengths and risks identified
   - Confidence level (how thoroughly was option evaluated?)
3. Aggregate scout reports without filtering — all options above minimum quality threshold enter advocacy phase

**Got:** Set of independently evaluated proposals with quality scores and assessments. No option eliminated by single evaluator; diversity of perspective preserved.

**If fail:** Scouts converge on same option without independent evaluation? Scouting not truly independent. Rerun with explicit information barriers. Too many options survive to advocacy phase? Raise minimum quality threshold. Too few survive? Lower it or add more scouts.

### Step 2: Run Advocacy Dynamics (Waggle Dance)

Allow scouts to advocate for preferred options. Advocacy intensity proportional to quality.

1. Each scout advocates for their top-rated option:
   - Advocacy intensity proportional to quality score (better options get more vigorous advocacy)
   - Advocacy public — all agents observe all advocacy signals
   - Advocates present evidence and quality assessment, not just preference
2. Uncommitted agents observe advocacy and evaluate:
   - Follow up on advocated options by inspecting them independently
   - Agent's own inspection confirms quality → joins advocacy
   - Inspection reveals lower quality than advertised → does not join
3. Cross-inspection dynamics:
   - Advocates for weaker options naturally lose followers as agents independently verify
   - Advocates for stronger options gain followers through confirmed quality
   - Process self-correcting: exaggerated advocacy fails verification step

```
Advocacy Dynamics:
┌─────────────────────────────────────────────────────────┐
│ Scout A advocates Option 1 (quality 85) ──→ ◉◉◉◉◉     │
│ Scout B advocates Option 2 (quality 70) ──→ ◉◉◉        │
│ Scout C advocates Option 3 (quality 45) ──→ ◉           │
│                                                         │
│ Uncommitted agents inspect:                             │
│   Agent D inspects Option 1 → confirms → joins ◉◉◉◉◉◉  │
│   Agent E inspects Option 2 → confirms → joins ◉◉◉◉    │
│   Agent F inspects Option 3 → disagrees → inspects Opt 1│
│                               → confirms → joins ◉◉◉◉◉◉◉│
│                                                         │
│ Over time: Option 1 advocacy grows, Option 3 fades      │
└─────────────────────────────────────────────────────────┘
```

**Got:** Advocacy for best option(s) grows over time as agents independently verify quality. Advocacy for weaker options fades as verification fails. Group naturally converges toward strongest option without any agent dictating choice.

**If fail:** Advocacy doesn't converge (two options remain neck-and-neck)? Options may be genuinely equivalent — proceed to quorum with either, or use tiebreaker rule. Advocacy converges too fast on mediocre option? Increase independence of evaluation (more scouts, stricter information barriers), add mandatory cross-inspection step.

### Step 3: Set Quorum Threshold and Commit

Define commitment threshold that triggers collective action.

1. Set quorum threshold:
   - **Simple decisions**: 50% + 1 of agents committed to one option
   - **Important decisions**: 66-75% committed to one option
   - **Critical/irreversible decisions**: 80%+ committed to one option
   - Rule of thumb: higher stakes → higher quorum → slower but more reliable consensus
2. Monitor commitment accumulation:
   - Track how many agents have committed to each option over time
   - Display commitment levels transparently (all agents can see current state)
   - Do not allow commitment withdrawal mid-cycle (prevents oscillation)
3. Quorum reached:
   - Winning option adopted as collective decision
   - Advocates for losing options acknowledge decision (no rogue agents)
   - Implementation begins immediately — delay after consensus erodes commitment

**Got:** Clear quorum moment where enough agents have independently committed to one option. Decision legitimate because emerged from independent evaluation, not authority or coercion.

**If fail:** Quorum never reached within time budget? Escalate to Step 4 (deadlock resolution). Quorum reached but agents unhappy? Advocacy phase was too short — agents committed without adequate evaluation. Consensus was wrong (discovered after fact)? Independent scouting insufficient — increase scout diversity and evaluation thoroughness in next cycle.

### Step 4: Resolve Deadlocks

Break decision gridlock when natural consensus process stalls.

1. Diagnose deadlock type:
   - **Genuine tie**: two options equally good → flip coin; cost of delay exceeds cost of picking "wrong" equal option
   - **Information deficit**: agents can't evaluate options well enough → invest in more scouting before re-running advocacy
   - **Faction formation**: entrenched subgroups refuse to cross-inspect → introduce mandatory rotation where advocates must inspect opposing option
   - **Option proliferation**: too many options fragment commitment → eliminate bottom 50%, re-run advocacy
2. Apply appropriate resolution:
   - Genuine tie: random selection or merge options if compatible
   - Information deficit: time-boxed scouting extension
   - Faction formation: forced cross-inspection round
   - Option proliferation: ranked elimination tournament
3. After resolution, reset quorum clock, re-run Step 3

**Got:** Deadlock resolved through appropriate intervention. Resolution visible and accepted by group as fair process, even if individual agents preferred different outcome.

**If fail:** Deadlocks recur on same decision? Decision framing may be wrong. Step back, ask: can decision be decomposed into smaller, independent decisions? Can scope be reduced? Is there "try both and see" option? Sometimes best consensus is "we'll run time-boxed experiment."

### Step 5: Assess Consensus Quality

Evaluate whether consensus process produced good decision, not just decision.

1. Post-decision assessment:
   - Was winning option independently verified by at least N agents?
   - Was decision speed appropriate (not too fast/groupthink, not too slow/paralysis)?
   - Did process surface information that would have been missed by single decision-maker?
   - Are agents committed to implementation, or merely compliant?
2. Track consensus health metrics:
   - **Time to quorum**: decreasing over successive decisions indicates learning; increasing indicates growing complexity or dysfunction
   - **Scout-to-commit ratio**: how much scouting was needed per commitment? High ratio = difficult decision or low trust
   - **Post-decision regret rate**: how often does group wish it had chosen differently?
3. Feed learnings back into process:
   - Adjust quorum thresholds based on decision importance and past accuracy
   - Adjust scout count based on option complexity
   - Adjust time budgets based on historical time-to-quorum

**Got:** Feedback loop that improves consensus quality over time. Group learns to scout more effectively, advocate more honestly, commit more confidently.

**If fail:** Consensus quality metrics poor (high regret, slow decisions)? Audit process for structural failures: insufficient scouting diversity, advocacy without verification, or thresholds set too low for decision type. Rebuild specific failing stage rather than overhauling entire process.

## Checks

- [ ] Proposals generated through independent scouting (no herding)
- [ ] Advocacy intensity proportional to assessed quality
- [ ] Uncommitted agents independently verified advocated options
- [ ] Quorum threshold appropriate for decision's importance
- [ ] Quorum reached, decision implemented promptly
- [ ] Deadlock resolution mechanism available (even if unused)
- [ ] Post-decision quality assessment conducted

## Pitfalls

- **Skipping independent scouting**: Jumping directly to advocacy produces groupthink. Quality of consensus depends entirely on quality of independent evaluation
- **Equal advocacy for unequal options**: Every option gets same advocacy regardless of quality? Process degenerates into random selection. Advocacy must be proportional to assessed quality
- **Commitment withdrawal**: Allowing agents to un-commit creates oscillation. Once committed in cycle, agents stay committed until cycle resolves
- **Confusing consensus with unanimity**: Consensus requires sufficient agreement, not total agreement. Waiting for 100% creates permanent deadlock
- **Ignoring losing side**: Agents who advocated for losing option have information group needs. Their concerns should inform implementation, even if they don't block decision

## See Also

- `coordinate-swarm` — foundational coordination framework supporting signal-based consensus mechanism
- `defend-colony` — collective defense decisions often require rapid consensus under threat
- `scale-colony` — consensus mechanisms must adapt when group size changes significantly
- `dissolve-form` — morphic skill for controlled dismantling, where consensus before dissolution is critical
- `plan-sprint` — sprint planning involves team consensus on commitment scope
- `conduct-retrospective` — retrospectives are form of consensus-building about process improvement
- `build-coherence` — AI self-application variant; maps bee democracy to single-agent multi-path reasoning with confidence thresholds and deadlock resolution
