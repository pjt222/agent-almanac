---
name: forage-resources
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Apply ant colony optimization and foraging theory to resource search,
  exploration-exploitation tradeoffs, and distributed discovery. Covers
  scout deployment, trail reinforcement, diminishing returns detection,
  and adaptive foraging strategy selection. Use when searching a large
  solution space where brute-force enumeration is impractical, balancing
  investment between exploring new approaches and deepening known good ones,
  optimizing resource allocation across uncertain opportunities, or diagnosing
  premature convergence on local optima.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, foraging, ant-colony-optimization, exploration-exploitation
---

# Forage Resources

Apply foraging theory and ant colony optimization to system search for, check, and exploit spread resources — balance roam of unknown ground with exploit of known yields.

## When Use

- Search large solution space where brute-force count is not practical
- Balance invest between roaming new paths and deepening known good ones
- Tune resource spend across many uncertain chances
- Design search strategies for spread teams or auto agents
- Spot premature converge (stuck on local optima) or endless wander (never commit)
- Complement `coordinate-swarm` with specific resource-find patterns

## Inputs

- **Required**: Desc of resource being sought (info, compute, talent, solutions, chances)
- **Required**: Desc of search space (size, structure, known features)
- **Optional**: Current search strategy and its fail mode
- **Optional**: Count of open scouts/searchers
- **Optional**: Cost of roam vs cost of exploit fail
- **Optional**: Time horizon (short-term exploit vs long-term roam)

## Steps

### Step 1: Map the Foraging Landscape

Describe resource env to pick right forage strategy.

1. Spot resource type and its distribution:
   - **Concentrated**: resources cluster in rich patches (e.g., talent in specific communities)
   - **Distributed**: resources spread evenly (e.g., bugs across codebase)
   - **Ephemeral**: resources appear and vanish (e.g., market chances)
   - **Nested**: rich patches hold sub-patches at different scales
2. Check info landscape:
   - How much known about resource spots before forage starts?
   - Can scouts share info with foragers? (see `coordinate-swarm` for signal design)
   - Is landscape static or shifting while you forage?
3. Figure cost structure:
   - Cost per scout sent (time, compute, money)
   - Cost of exploit low-quality resource (chance cost)
   - Cost of missing high-quality resource (regret)

**Got:** Described forage landscape with resource distribution type, info availability, cost structure. This picks which forage model to apply.

**If fail:** Landscape fully unknown? Start with max roam (all scouts, no exploit) for fixed time budget to build first map. Switch to right model once landscape character becomes clear.

### Step 2: Deploy Scouts with Trail Marking

Send roam agents into search space with orders to mark what they find.

1. Set scout percent (start with 20-30% of open agents as scouts)
2. Set scout behavior:
   - Move through search space with randomized or systematic patterns
   - Check each spot met (quick check, not deep analysis)
   - Mark finds with signal strength by quality:
     - High quality → strong trail signal
     - Medium quality → moderate signal
     - Low quality → weak signal or no signal
   - Return info to collective (signal deposit, report, broadcast)
3. Design scout pattern:
   - **Random walk**: good for unknown, uniform landscapes
   - **Levy flight**: long jumps with occasional local clustering — good for patchy resources
   - **Systematic sweep**: grid or spiral — good for bounded, well-defined spaces
   - **Biased random**: lean toward areas like past finds — good for clustered resources

**Got:** Scouts sent across search space, dropping trail signals by resource quality. First map of landscape starts to emerge from scout reports.

**If fail:** Scouts find nothing in first sweep? Either scout percent too low (bump to 50%), search pattern wrong (switch from random walk to Levy flight for patchy resources), or quality check miscalibrated (lower detection threshold).

### Step 3: Establish Trail Reinforcement

Make positive feedback loops that amplify good paths and let bad ones fade.

1. When forager follows trail and finds good resource:
   - Reinforce trail signal (bump strength)
   - Reinforced signal pulls more foragers → more reinforcement → exploit
2. When forager follows trail and finds nothing:
   - Do not reinforce (let trail decay natural)
   - Weakening signal pulls fewer foragers → trail fades → roam resumes
3. Set reinforcement params:
   - **Deposit amount**: by resource quality found
   - **Decay rate**: trails lose X% of strength per time unit
   - **Saturation cap**: max trail strength (blocks runaway exploit of single path)

```
Trail Reinforcement Dynamics:
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Strong trail ──→ More foragers ──→ If good: reinforce ──→ EXPLOIT │
│       ↑                                                      │      │
│       │                              If bad: no reinforce    │      │
│       │                                     │                │      │
│       │                                     ↓                │      │
│  Decay ←── Weak trail ←── Fewer foragers ←── Trail fades    │      │
│       │                                                      │      │
│       ↓                                                      │      │
│  No trail ──→ Scouts explore ──→ New discovery ──→ New trail ↗      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Got:** Self-regulating feedback loop where good resources pull growing focus and poor resources naturally abandoned. System balances exploit and roam through trail dynamics alone.

**If fail:** All foragers converge on single trail (premature converge)? Decay rate too slow or saturation cap too high. Bump decay, lower cap, or add random roam rules (e.g., 10% of foragers always ignore trails). Trails fade too fast and nothing gets exploited? Drop decay rate.

### Step 4: Detect Diminishing Returns

Watch resource yields to know when to shift from exploit back to roam.

1. Track yield per unit effort for each active forage site:
   - Yield rising → healthy exploit, keep going
   - Yield flat → close to saturation, start scouting alternatives
   - Yield dropping → diminishing returns, cut foragers, bump scouts
2. Apply marginal value theorem:
   - Compare current site yield rate to average yield rate across all known sites
   - When current site drops below average, time to leave
   - Factor in travel cost (cost of switching to new site)
3. Fire scouting waves when:
   - Overall yield across all sites drops below threshold
   - Best-performing site exploited longer than its expected life
   - Env change spotted (new signals from scouts in unexplored areas)

**Got:** Forage swarm naturally shifts between exploit phases (focused on known-good sites) and roam phases (scouts spread), driven by yield watch rather than fixed schedules.

**If fail:** Swarm stays on depleted sites too long? Marginal value threshold too low or travel cost estimate too high. Recalibrate by compare real yield rates. Swarm abandons good sites too early? Threshold too sensitive — add smoothing window to yield measure.

### Step 5: Adapt Foraging Strategy to Conditions

Pick and switch between forage strategies by env feedback.

1. Match strategy to landscape:
   - **Rich, clustered**: commit heavy to found patches (high exploit)
   - **Sparse, scattered**: keep high scout ratio (high roam)
   - **Volatile, changing**: short trail decay, frequent scouting waves (adaptive)
   - **Competitive**: faster reinforcement, pre-emptive trail marking (territorial)
2. Watch for strategy-env mismatch:
   - High effort, low yield → strategy too exploit for landscape
   - High find rate, low follow-through → strategy too roam
   - Oscillating yield → strategy switching too aggressive
3. Do adaptive switching:
   - Track rolling average of roam-to-exploit ratio
   - If ratio drifts too far from best (set by landscape type), nudge back
   - Allow gradual shifts — abrupt strategy switches cause coord chaos

**Got:** Forage system that adapts its roam-exploit balance to current env, keeping effect as conditions shift.

**If fail:** Strategy adapt itself becomes unstable (oscillating between roam and exploit)? Add damping: need mismatch signal to stick for N time units before fire strategy shift. No strategy seems to work? Recheck landscape description from Step 1 — resource distribution may be more complex than first assumed.

## Validation

- [ ] Forage landscape described (distribution type, info open, cost structure)
- [ ] Scout percent and search pattern set and deployed
- [ ] Trail reinforcement loop works with deposit, decay, and saturation params
- [ ] Diminishing returns detect fires rebalance from exploit to roam
- [ ] Strategy-env match watched and adaptive switch configured
- [ ] System recovers from landscape shifts (new resources, depleted resources)

## Pitfalls

- **Premature converge**: All foragers pile onto first good find, skip possibly better options. Cure: mandatory roam percent, trail saturation caps, and decay
- **Endless roam**: Scouts keep finding new options but swarm never commits. Cure: lower quality threshold for trail reinforcement, drop scout percent
- **Ignore travel costs**: Switch sites has cost. Foragers that jump between same-quality sites waste more on travel than they gain. Factor travel cost into marginal value count
- **Static strategy in dynamic landscape**: Strategy tuned for yesterday fails tomorrow. Build adapt into forage loop, not as afterthought
- **Mix scout quality with forager quality**: Good scouts (broad, quick check) and good foragers (deep, full exploit) need different skills. Do not force all agents into both roles

## See Also

- `coordinate-swarm` — base coord patterns that back forage signal design
- `build-consensus` — used when swarm must collectively agree on which resource patches to prioritize
- `scale-colony` — scaling forage ops when resource landscape or swarm size grows
- `assess-form` — morphic skill for check of current state of system, complement to landscape check
- `configure-alerting-rules` — alerting patterns apply to diminishing returns detect
- `plan-capacity` — capacity plan shares explore-exploit frame with forage theory
- `forage-solutions` — AI self-apply variant; maps ant colony forage to single-agent solution roam with scout hypotheses and trail reinforcement
