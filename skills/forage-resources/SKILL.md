---
name: forage-resources
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

Apply foraging theory and ant colony optimization to systematically search for, evaluate, and exploit distributed resources — balancing exploration of unknown territory with exploitation of known yields.

## When to Use

- Searching a large solution space where brute-force enumeration is impractical
- Balancing investment between exploring new approaches and deepening known good ones
- Optimizing resource allocation across multiple uncertain opportunities
- Designing search strategies for distributed teams or automated agents
- Diagnosing premature convergence (stuck on local optima) or perpetual wandering (never committing)
- Complementing `coordinate-swarm` with specific resource-discovery patterns

## Inputs

- **Required**: Description of the resource being sought (information, compute, talent, solutions, opportunities)
- **Required**: Description of the search space (size, structure, known features)
- **Optional**: Current search strategy and its failure mode
- **Optional**: Number of available scouts/searchers
- **Optional**: Cost of exploration vs. cost of exploitation failure
- **Optional**: Time horizon (short-term exploitation vs. long-term exploration)

## Procedure

### Step 1: Map the Foraging Landscape

Characterize the resource environment to select appropriate foraging strategy.

1. Identify the resource type and its distribution:
   - **Concentrated**: resources cluster in rich patches (e.g., talent in specific communities)
   - **Distributed**: resources spread evenly (e.g., bugs across a codebase)
   - **Ephemeral**: resources appear and disappear (e.g., market opportunities)
   - **Nested**: rich patches contain sub-patches at different scales
2. Assess the information landscape:
   - How much is known about resource locations before foraging begins?
   - Can scouts share information with foragers? (see `coordinate-swarm` for signal design)
   - Is the landscape static or changing while you forage?
3. Determine the cost structure:
   - Cost per scout deployed (time, compute, money)
   - Cost of exploiting a low-quality resource (opportunity cost)
   - Cost of missing a high-quality resource (regret)

**Expected:** A characterized foraging landscape with resource distribution type, information availability, and cost structure. This determines which foraging model to apply.

**On failure:** If the landscape is completely unknown, start with maximum exploration (all scouts, no exploitation) for a fixed time budget to build an initial map. Switch to the appropriate model once the landscape character becomes clear.

### Step 2: Deploy Scouts with Trail Marking

Send exploratory agents into the search space with instructions to mark what they find.

1. Allocate scout percentage (start with 20-30% of available agents as scouts)
2. Define scout behavior:
   - Move through the search space using randomized or systematic patterns
   - Evaluate each location encountered (quick assessment, not deep analysis)
   - Mark discoveries with signal strength proportional to quality:
     - High quality → strong trail signal
     - Medium quality → moderate signal
     - Low quality → weak signal or no signal
   - Return information to the collective (signal deposit, report, broadcast)
3. Design the scout pattern:
   - **Random walk**: good for unknown, uniform landscapes
   - **Levy flight**: long jumps with occasional local clustering — good for patchy resources
   - **Systematic sweep**: grid or spiral — good for bounded, well-defined spaces
   - **Biased random**: lean toward areas similar to previous finds — good for clustered resources

**Expected:** Scouts deployed across the search space, depositing trail signals proportional to resource quality. The initial map of the landscape begins to emerge from scout reports.

**On failure:** If scouts find nothing in the initial sweep, either the scout percentage is too low (increase to 50%), the search pattern is wrong (switch from random walk to Levy flight for patchy resources), or the quality assessment is miscalibrated (lower the detection threshold).

### Step 3: Establish Trail Reinforcement

Create positive feedback loops that amplify successful paths and let unsuccessful ones fade.

1. When a forager follows a trail and finds a good resource:
   - Reinforce the trail signal (increase strength)
   - The reinforced signal attracts more foragers → more reinforcement → exploitation
2. When a forager follows a trail and finds nothing:
   - Do not reinforce (let the trail decay naturally)
   - The weakening signal attracts fewer foragers → trail fades → exploration resumes
3. Set reinforcement parameters:
   - **Deposit amount**: proportional to resource quality found
   - **Decay rate**: trails lose X% of strength per time unit
   - **Saturation cap**: maximum trail strength (prevents runaway exploitation of a single path)

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

**Expected:** A self-regulating feedback loop where good resources attract increasing attention and poor resources are naturally abandoned. The system balances exploitation and exploration through trail dynamics alone.

**On failure:** If all foragers converge on a single trail (premature convergence), the decay rate is too slow or the saturation cap is too high. Increase decay, lower the cap, or introduce random exploration mandates (e.g., 10% of foragers always ignore trails). If trails fade too fast and nothing gets exploited, reduce the decay rate.

### Step 4: Detect Diminishing Returns

Monitor resource yields to know when to shift from exploitation back to exploration.

1. Track yield per unit effort for each active foraging site:
   - Yield increasing → healthy exploitation, continue
   - Yield flat → approaching saturation, begin scouting alternatives
   - Yield decreasing → diminishing returns, reduce foragers, increase scouts
2. Implement the marginal value theorem:
   - Compare the current site's yield rate to the average yield rate across all known sites
   - When current site drops below the average, it's time to leave
   - Factor in travel cost (the cost of switching to a new site)
3. Trigger scouting waves when:
   - Overall yield across all sites drops below a threshold
   - The best-performing site has been exploited for longer than its expected lifetime
   - Environmental change is detected (new signals from scouts in unexplored areas)

**Expected:** The foraging swarm naturally shifts between exploitation phases (concentrated on known-good sites) and exploration phases (scouts dispersed), driven by yield monitoring rather than arbitrary schedules.

**On failure:** If the swarm stays on depleted sites too long, the marginal value threshold is set too low or the travel cost estimate is too high. Recalibrate by comparing actual yield rates. If the swarm abandons good sites too early, the threshold is too sensitive — add a smoothing window to the yield measurement.

### Step 5: Adapt Foraging Strategy to Conditions

Select and switch between foraging strategies based on environmental feedback.

1. Match strategy to landscape:
   - **Rich, clustered**: commit heavily to discovered patches (high exploitation)
   - **Sparse, scattered**: maintain high scout ratio (high exploration)
   - **Volatile, changing**: short trail decay, frequent scouting waves (adaptive)
   - **Competitive**: faster reinforcement, pre-emptive trail marking (territorial)
2. Monitor for strategy-environment mismatch:
   - High effort, low yield → strategy too exploitative for the landscape
   - High discovery rate, low follow-through → strategy too exploratory
   - Oscillating yield → strategy switching too aggressively
3. Implement adaptive switching:
   - Track a rolling average of exploration-to-exploitation ratio
   - If the ratio drifts too far from optimal (determined by landscape type), nudge it back
   - Allow gradual transitions — abrupt strategy switches cause coordination chaos

**Expected:** A foraging system that adapts its exploration-exploitation balance to the current environment, maintaining effectiveness as conditions change.

**On failure:** If strategy adaptation itself becomes unstable (oscillating between exploration and exploitation), add damping: require the mismatch signal to persist for N time units before triggering a strategy shift. If no strategy seems to work, reassess the landscape characterization from Step 1 — the resource distribution may be more complex than initially assumed.

## Validation

- [ ] Foraging landscape is characterized (distribution type, information availability, cost structure)
- [ ] Scout percentage and search pattern are defined and deployed
- [ ] Trail reinforcement loop is functional with deposit, decay, and saturation parameters
- [ ] Diminishing returns detection triggers rebalancing from exploitation to exploration
- [ ] Strategy-environment match is monitored and adaptive switching is configured
- [ ] System recovers from landscape changes (new resources, depleted resources)

## Common Pitfalls

- **Premature convergence**: All foragers pile onto the first good find, ignoring potentially better options. Cure: mandatory exploration percentage, trail saturation caps, and decay
- **Perpetual exploration**: Scouts keep finding new options but the swarm never commits. Cure: lower the quality threshold for trail reinforcement, reduce scout percentage
- **Ignoring travel costs**: Switching sites has a cost. Foragers that constantly jump between similar-quality sites waste more on travel than they gain. Factor travel cost into the marginal value calculation
- **Static strategy in dynamic landscape**: A strategy optimized for yesterday's conditions fails tomorrow. Build adaptation into the foraging loop, not as an afterthought
- **Conflating scout quality with forager quality**: Good scouts (broad, quick assessment) and good foragers (deep, thorough exploitation) require different skills. Don't force all agents into both roles

## Related Skills

- `coordinate-swarm` — foundational coordination patterns that underpin foraging signal design
- `build-consensus` — used when the swarm must collectively agree on which resource patches to prioritize
- `scale-colony` — scaling foraging operations when the resource landscape or swarm size grows
- `assess-form` — morphic skill for evaluating the current state of a system, complementary to landscape assessment
- `configure-alerting-rules` — alerting patterns applicable to diminishing returns detection
- `plan-capacity` — capacity planning shares the explore-exploit framing with foraging theory
- `forage-solutions` — AI self-application variant; maps ant colony foraging to single-agent solution exploration with scout hypotheses and trail reinforcement
