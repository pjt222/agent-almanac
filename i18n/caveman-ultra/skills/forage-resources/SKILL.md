---
name: forage-resources
locale: caveman-ultra
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

Apply foraging theory + ant colony opt → systematically search, evaluate, exploit distributed resources — balance exploration unknown vs exploitation known yields.

## Use When

- Search large solution space, brute-force impractical
- Balance invest between explore new vs deepen known good
- Optimize resource alloc across uncertain opportunities
- Design search strategies distributed teams/automated agents
- Diagnose premature convergence (stuck local optima) or perpetual wandering (never commit)
- Complement `coordinate-swarm` w/ specific resource-discovery patterns

## In

- **Required**: Resource being sought (info, compute, talent, solutions, opportunities)
- **Required**: Search space (size, structure, known features)
- **Optional**: Current strategy + failure mode
- **Optional**: N available scouts/searchers
- **Optional**: Cost exploration vs cost exploitation failure
- **Optional**: Time horizon (short-term exploitation vs long-term exploration)

## Do

### Step 1: Map Landscape

Characterize resource env → select strategy.

1. Resource type + distribution:
   - **Concentrated**: cluster rich patches (talent in specific communities)
   - **Distributed**: spread evenly (bugs across codebase)
   - **Ephemeral**: appear + disappear (market opportunities)
   - **Nested**: rich patches contain sub-patches diff scales
2. Information landscape:
   - How much known about locations before foraging?
   - Scouts share info w/ foragers? (see `coordinate-swarm` for signal design)
   - Static or changing while foraging?
3. Cost structure:
   - Cost per scout deployed (time, compute, money)
   - Cost exploiting low-quality (opportunity cost)
   - Cost missing high-quality (regret)

→ Characterized landscape w/ distribution, info, cost. Determines foraging model.

If err: completely unknown → max exploration (all scouts, no exploit) for fixed budget → build initial map. Switch to model once character clear.

### Step 2: Deploy Scouts w/ Trail Marking

Exploratory agents into search space + instructions mark what find.

1. Allocate scout % (start 20-30% of available)
2. Scout behavior:
   - Move through space randomized/systematic
   - Evaluate each location (quick not deep)
   - Mark discoveries w/ signal strength proportional to quality:
     - High quality → strong trail
     - Medium → moderate
     - Low → weak or no signal
   - Return info to collective (signal deposit, report, broadcast)
3. Scout pattern:
   - **Random walk**: unknown, uniform landscapes
   - **Levy flight**: long jumps + local clustering — patchy
   - **Systematic sweep**: grid/spiral — bounded, well-defined
   - **Biased random**: lean toward similar previous finds — clustered

→ Scouts deployed, depositing signals proportional to quality. Initial map emerges from reports.

If err: nothing initial sweep → (a) scout % too low (increase 50%), (b) wrong pattern (random walk → Levy flight for patchy), (c) quality miscalibrated (lower detection threshold).

### Step 3: Trail Reinforcement

Positive feedback loops amplify successful paths, let unsuccessful fade.

1. Forager follows trail + finds good:
   - Reinforce signal (increase strength)
   - Reinforced → more foragers → more reinforcement → exploitation
2. Forager follows trail + finds nothing:
   - No reinforce (trail decays naturally)
   - Weakening → fewer foragers → fades → exploration resumes
3. Reinforcement params:
   - **Deposit**: proportional to quality
   - **Decay rate**: trails lose X%/time
   - **Saturation cap**: max strength (prevents runaway single path)

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

→ Self-regulating loop: good attract, poor abandoned. Balance via trail dynamics.

If err: all converge single trail (premature convergence) → decay too slow or cap too high. Increase decay, lower cap, or random exploration mandates (10% ignore trails). Fade too fast → reduce decay.

### Step 4: Diminishing Returns

Monitor yields → know when shift exploit back to explore.

1. Track yield/effort each active site:
   - Increasing → healthy, continue
   - Flat → approach saturation, begin scouting alts
   - Decreasing → diminishing, reduce foragers, increase scouts
2. Marginal value theorem:
   - Compare current yield vs avg across known sites
   - Current drops below avg → time to leave
   - Factor travel cost (switching to new)
3. Trigger scouting waves:
   - Overall yield across all drops below threshold
   - Best-performing exploited longer than expected lifetime
   - Env change detected (new signals from unexplored areas)

→ Swarm shifts between exploit (known-good) + exploration (scouts dispersed), driven by monitoring not arbitrary schedules.

If err: stays depleted too long → marginal threshold too low or travel cost too high. Recalibrate via actual rates. Abandons good too early → threshold too sensitive, add smoothing window.

### Step 5: Adapt Strategy

Select + switch strategies based on env feedback.

1. Match to landscape:
   - **Rich, clustered**: commit heavy discovered patches (high exploit)
   - **Sparse, scattered**: high scout ratio (high explore)
   - **Volatile, changing**: short decay, frequent scouting waves (adaptive)
   - **Competitive**: faster reinforcement, pre-emptive marking (territorial)
2. Monitor strategy-env mismatch:
   - High effort, low yield → too exploitative
   - High discovery, low follow-through → too exploratory
   - Oscillating yield → switching too aggressively
3. Adaptive switching:
   - Rolling avg explore-to-exploit ratio
   - Ratio drifts too far from optimal (by landscape type) → nudge back
   - Gradual transitions — abrupt cause coordination chaos

→ System adapts balance to env, maintains effectiveness as conditions change.

If err: adaptation unstable (oscillating) → damping: require mismatch persist N time units before shift. No strategy works → reassess Step 1 landscape, distribution may be more complex than assumed.

## Check

- [ ] Landscape characterized (distribution, info, cost)
- [ ] Scout % + pattern defined + deployed
- [ ] Trail reinforcement loop functional (deposit, decay, saturation)
- [ ] Diminishing returns triggers rebalance exploit → explore
- [ ] Strategy-env match monitored + adaptive switching
- [ ] System recovers landscape changes (new/depleted)

## Traps

- **Premature convergence**: All pile on first good find, ignore better. Cure: mandatory exploration %, trail saturation caps, decay.
- **Perpetual exploration**: Scouts find new but swarm never commits. Cure: lower quality threshold for reinforcement, reduce scout %.
- **Ignore travel costs**: Switching has cost. Constantly jumping similar-quality → waste travel > gain. Factor travel into marginal value.
- **Static strategy dynamic landscape**: Optimized for yesterday fails tomorrow. Build adaptation into loop not afterthought.
- **Conflate scout + forager quality**: Good scouts (broad, quick) + good foragers (deep, thorough) require diff skills. Don't force both roles.

## →

- `coordinate-swarm` — foundational coordination underpinning signal design
- `build-consensus` — swarm must collectively agree which patches prioritize
- `scale-colony` — scaling operations as landscape/swarm grows
- `assess-form` — morphic for system current state, complementary to landscape
- `configure-alerting-rules` — alerting applicable to diminishing returns
- `plan-capacity` — capacity planning shares explore-exploit framing
- `forage-solutions` — AI self-application variant; maps ant colony to single-agent solution exploration w/ scout hypotheses + trail reinforcement
