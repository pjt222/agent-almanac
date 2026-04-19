---
name: build-consensus
locale: caveman-ultra
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

Collective agreement across distributed agents w/o central authority — scout advocacy, threshold quorum sensing, commit dynamics from honeybee swarm decisions.

## Use When

- Group must decide between many options w/o designated leader
- Centralized decision = bottleneck or single point of failure
- Stakeholders diff info/perspectives must be integrated
- Past decisions suffered groupthink (premature conv) or analysis paralysis (no conv)
- Designing auto systems needing consensus (distributed DBs, multi-agent AI)
- Complements `coordinate-swarm` when coordination needs explicit collective decisions

## In

- **Required**: Decision (binary, select from N, param set)
- **Required**: Participating agents (team, services, voters)
- **Optional**: Known options w/ prelim quality assessments
- **Optional**: Urgency (time budget)
- **Optional**: Acceptable err rate (group occasionally pick 2nd-best?)
- **Optional**: Current failure mode (groupthink, deadlock, flip-flop)

## Do

### Step 1: Generate Proposals — Independent Scouting

Decision space explored before advocacy begins.

1. Assign scouts to independently explore:
   - Each scout evaluates w/o knowing others' findings
   - Independent eval prevents early herding → popular-but-mediocre
   - Scout count: min 3 per serious option (reliability)
2. Scouts produce structured assessments:
   - Option ID
   - Quality score (normalized 0-100 or categorical: poor/fair/good/excellent)
   - Key strengths + risks
   - Confidence (how thoroughly evaluated?)
3. Aggregate reports w/o filter — all above min quality enter advocacy

**→** Independently evaluated proposals w/ scores + assessments. No option eliminated by single evaluator; perspective diversity preserved.

**If err:** Scouts converge on same option w/o independent eval → scouting not truly independent. Rerun w/ explicit info barriers. Too many survive → raise min threshold. Too few → lower or add scouts.

### Step 2: Advocacy Dynamics (Waggle Dance)

Scouts advocate preferred options, intensity proportional to quality.

1. Each scout advocates top-rated:
   - Intensity proportional to quality (better → more vigorous)
   - Public — all observe
   - Present evidence + quality, not just pref
2. Uncommitted observe + evaluate:
   - Follow up by inspecting independently
   - Own inspection confirms → join advocacy
   - Inspection shows lower quality → don't join
3. Cross-inspection dynamics:
   - Weaker advocates naturally lose followers as agents verify
   - Stronger gain through confirmed quality
   - Self-correcting: exaggerated advocacy fails verification

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

**→** Advocacy for best option(s) grows as agents verify. Weaker fades. Group converges naturally w/o any agent dictating.

**If err:** No convergence (2 options neck-and-neck) → genuinely equivalent, proceed to quorum w/ either or tiebreaker. Converges too fast on mediocre → increase eval independence (more scouts, stricter barriers) + mandatory cross-inspection.

### Step 3: Quorum Threshold + Commit

Commit threshold → collective action.

1. Set quorum:
   - **Simple**: 50% + 1
   - **Important**: 66-75%
   - **Critical/irreversible**: 80%+
   - Rule: higher stakes → higher quorum → slower but more reliable
2. Monitor commit accumulation:
   - Track # committed per option over time
   - Transparent (all see state)
   - No commit withdrawal mid-cycle (prevents oscillation)
3. Quorum reached:
   - Winning option = collective decision
   - Losers ack (no rogue agents)
   - Implement immediately — delay erodes commit

**→** Clear quorum moment, enough agents independently committed. Legitimate because emerged from independent eval, not authority.

**If err:** Quorum never reached in time → escalate Step 4. Reached but agents unhappy → advocacy too short, committed w/o adequate eval. Wrong consensus (discovered after) → independent scouting insufficient, increase scout diversity + eval thoroughness next cycle.

### Step 4: Deadlock Resolution

Break gridlock when natural process stalls.

1. Diagnose type:
   - **Genuine tie**: Equally good → flip coin; delay cost exceeds picking "wrong" equal
   - **Info deficit**: Can't eval well → invest more scouting before re-advocacy
   - **Faction**: Entrenched subgroups refuse to cross-inspect → mandatory rotation, advocates inspect opposing
   - **Option proliferation**: Too many fragment commit → eliminate bottom 50%, re-advocate
2. Apply resolution:
   - Tie: random or merge if compatible
   - Deficit: time-boxed scouting extension
   - Faction: forced cross-inspection round
   - Proliferation: ranked elimination tournament
3. After res, reset quorum clock, re-run Step 3

**→** Deadlock resolved via intervention. Visible + accepted as fair process even if indiv preferred diff outcome.

**If err:** Deadlocks recur on same decision → framing wrong. Step back: decomposable into smaller independent decisions? Scope reduction? "Try both and see"? Sometimes best consensus = "time-boxed experiment".

### Step 5: Consensus Quality

Eval whether process produced good decision, not just decision.

1. Post-decision:
   - Winning option independently verified by ≥N agents?
   - Speed appropriate (not too fast/groupthink, not too slow/paralysis)?
   - Process surfaced info missed by single decider?
   - Agents committed to impl or merely compliant?
2. Health metrics:
   - **Time to quorum**: decreasing = learning; increasing = complexity/dysfunction
   - **Scout-to-commit ratio**: scouting per commit. High = difficult or low trust
   - **Post-decision regret rate**: how often group wishes diff?
3. Feed learnings back:
   - Adjust thresholds based on importance + past accuracy
   - Adjust scout count based on complexity
   - Adjust time budgets based on historical time-to-quorum

**→** Feedback loop improves quality over time. Group learns to scout better, advocate honestly, commit confidently.

**If err:** Poor metrics (high regret, slow) → audit for structural fails: insufficient scout diversity, advocacy w/o verification, thresholds too low. Rebuild failing stage vs overhauling whole.

## Check

- [ ] Proposals via independent scouting (no herding)
- [ ] Advocacy proportional to assessed quality
- [ ] Uncommitted verified advocated options
- [ ] Quorum appropriate for importance
- [ ] Quorum reached + implemented promptly
- [ ] Deadlock mechanism available (even if unused)
- [ ] Post-decision quality assessment done

## Traps

- **Skip independent scouting**: Jump to advocacy → groupthink. Consensus quality = eval quality
- **Equal advocacy, unequal options**: Same advocacy regardless of quality → random selection. Must be proportional
- **Commit withdrawal**: Un-commit → oscillation. Once committed in cycle, stay until resolves
- **Consensus = unanimity confusion**: Consensus = sufficient agreement, not total. Waiting 100% = permanent deadlock
- **Ignore losing side**: Losers have info group needs. Concerns should inform impl even if don't block

## →

- `coordinate-swarm` — foundational coordination framework supporting signal-based consensus
- `defend-colony` — collective defense often needs rapid consensus under threat
- `scale-colony` — consensus mechanisms adapt when group size changes significantly
- `dissolve-form` — morphic controlled dismantling; consensus before dissolution critical
- `plan-sprint` — sprint planning involves team consensus on scope
- `conduct-retrospective` — retrospectives = consensus-building about process improvement
- `build-coherence` — AI self-app variant; maps bee democracy to single-agent multi-path reasoning
