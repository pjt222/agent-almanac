---
name: forage-solutions
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  AI solution exploration using ant colony optimization — deploying scout
  hypotheses, reinforcing promising approaches, detecting diminishing returns,
  and knowing when to abandon a strategy. Use when facing a problem with
  multiple plausible approaches and no clear winner, when the first approach
  is not working but alternatives are unclear, when debugging with no obvious
  root cause requiring parallel hypothesis investigation, or when previous
  attempts have converged prematurely on a suboptimal approach.
license: MIT
allowed-tools: Read Glob Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, foraging, solution-search, exploration-exploitation, meta-cognition, ai-self-application
---

# Forage Solutions

Explore solution space via ant colony opt — deploy indep hypotheses as scouts, reinforce promising via evidence, detect diminishing returns, know when abandon strategy + explore elsewhere.

## Use When

- Problem w/ multiple plausible approaches, no clear winner
- First approach not working but alts unclear
- Debug w/ no obvious root cause — multiple hypotheses need parallel
- Search codebase for behavior source, location unknown
- Previous attempts converged prematurely suboptimal
- Complement `build-coherence` when space must be explored before decision

## In

- **Required**: Problem/goal (what foraging for?)
- **Required**: Current knowledge state (what already known?)
- **Optional**: Previous approaches + outcomes
- **Optional**: Exploration constraints (time, tool availability)
- **Optional**: Urgency (affects explore-exploit balance)

## Do

### Step 1: Map Landscape

Before deploying, characterize shape.

```
Solution Distribution Types:
┌────────────────────┬──────────────────────────────────────────────────┐
│ Type               │ Characteristics and Strategy                     │
├────────────────────┼──────────────────────────────────────────────────┤
│ Concentrated       │ One correct answer exists (bug fix, syntax       │
│ (one right fix)    │ error). Deploy many scouts quickly to locate     │
│                    │ it. Exploit immediately when found               │
├────────────────────┼──────────────────────────────────────────────────┤
│ Distributed        │ Multiple valid approaches (architecture choice,  │
│ (many valid paths) │ implementation strategy). Scouts assess quality  │
│                    │ of each. Use `build-coherence` to choose         │
├────────────────────┼──────────────────────────────────────────────────┤
│ Ephemeral          │ Solutions depend on timing or sequence (race     │
│ (time-sensitive)   │ conditions, order-dependent bugs). Fast scouting │
│                    │ with immediate exploitation. Cannot revisit       │
├────────────────────┼──────────────────────────────────────────────────┤
│ Nested             │ Solving the surface problem reveals a deeper one │
│ (layers of cause)  │ (config issue masking an architecture problem).  │
│                    │ Scout at each layer before committing to depth   │
└────────────────────┴──────────────────────────────────────────────────┘
```

Classify. Distribution type → how many scouts + how fast switch exploration → exploitation.

→ Clear characterization informs scouting. Feels accurate not forced.

If err: completely unknown → itself = classification. Treat as potentially distributed + deploy broad scouts. First round reveals character.

### Step 2: Deploy Scout Hypotheses

Gen indep hypotheses as scouts. Each probes diff direction.

1. Gen 3-5 indep hypotheses about problem/solution
2. Each → 1 cheap test (single file read, 1 grep, 1 check)
3. Rate initial promise on evidence (not gut)
4. Deploy indep: no let A influence test of B

```
Scout Deployment Template:
┌───────┬──────────────────────┬──────────────────────┬──────────┐
│ Scout │ Hypothesis           │ Test (one action)    │ Promise  │
├───────┼──────────────────────┼──────────────────────┼──────────┤
│ 1     │                      │                      │ High/Med/│
│ 2     │                      │                      │ Low      │
│ 3     │                      │                      │          │
│ 4     │                      │                      │          │
│ 5     │                      │                      │          │
└───────┴──────────────────────┴──────────────────────┴──────────┘
```

Key: scouts assess not exploit. Quick signal each, not deep investigation first promising.

→ 3-5 indep hypotheses + cheap tests. None deeply explored yet — breadth-first pass.

If err: <3 hypotheses → (a) very constrained (concentrated — good, scout aggressive) or (b) understanding too shallow (read more context). Hypotheses not indep (variations same) → too narrow, force ≥1 contradicting others.

### Step 3: Trail Reinforcement — Follow Evidence

After scout results, reinforce promising, let weak decay.

1. Review results: which found supporting evidence?
2. **Strong evidence** → reinforce: invest more investigation
3. **No evidence** → decay: don't investigate w/o new signals
4. **Contradicting** → inhibition: actively avoid
5. Monitor premature convergence: all effort to first reinforced → force 1 scout into unexplored

```
Trail Reinforcement Decision:
┌───────────────────────────┬──────────────────────────────────────┐
│ Scout Result              │ Action                               │
├───────────────────────────┼──────────────────────────────────────┤
│ Strong supporting evidence│ REINFORCE — deepen investigation     │
│ Weak supporting evidence  │ HOLD — one more cheap test before    │
│                           │ committing                           │
│ No evidence               │ DECAY — deprioritize, scout elsewhere│
│ Contradicting evidence    │ INHIBIT — mark as dead end           │
│ Ambiguous result          │ REFINE — hypothesis was too vague,   │
│                           │ sharpen and re-scout                 │
└───────────────────────────┴──────────────────────────────────────┘
```

→ Clear prioritization on evidence not preference. Strongest gets most but ≥1 alt alive.

If err: all empty → hypotheses wrong, not approach. Reframe: "What assumptions could be wrong?" Gen new from diff angle. All strong → distributed (multiple valid) → `build-coherence` for selection.

### Step 4: Marginal Value Theorem — Know When Leave

Monitor yield. Info per effort drops below avg across all → switch.

```
Marginal Value Assessment:
┌────────────────────────┬──────────────────────────────────────────┐
│ Signal                 │ Action                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ New information per    │ CONTINUE — this trail is productive      │
│ action is high         │                                          │
├────────────────────────┼──────────────────────────────────────────┤
│ New information per    │ PREPARE TO SWITCH — squeeze remaining    │
│ action is declining    │ value, begin scouting alternatives       │
├────────────────────────┼──────────────────────────────────────────┤
│ Last 2-3 actions       │ SWITCH — the trail is depleted. The cost │
│ yielded nothing new    │ of staying exceeds the cost of switching │
├────────────────────────┼──────────────────────────────────────────┤
│ Information contradicts│ SWITCH IMMEDIATELY — not just depleted   │
│ earlier findings       │ but misleading. Cut losses               │
└────────────────────────┴──────────────────────────────────────────┘
```

Important: factor switching cost. Moving to new hypothesis = loading new context = cost. Don't switch marginal gains → only when clearly depleted.

→ Deliberate continue or switch on yield assessment, not habit/frustration. Switches evidence-based not impulse.

If err: switching too frequent (oscillation) → switching cost undervalued. Commit to current N more actions before reassess. Never switching (stuck despite declining) → hard cap: after N unproductive, switch regardless sunk cost.

### Step 5: Adapt Strategy

Based on results → select next phase.

1. **Most empty, one weak** → misframed. Step back + reframe: what question?
2. **One strong, others empty** → concentrated. Exploit strong w/ full attention
3. **Multiple competing** → distributed. `build-coherence` to select
4. **Clear winner emerging** → explore → exploit. Reduce scouting budget 10-20% (keep 1 scout active alts), commit primary effort to winning
5. **All exhausted** → solution may not exist in current space. Expand: diff tools, diff assumptions, ask user

→ Strategic decision next phase follows logically from results. Feels like conclusion not guess.

If err: no strategy feels right → foraging revealed genuine uncertainty, valid outcome. Communicate to user: "Explored N, found X. Most promising Y because Z. Pursue or additional context?"

## Check

- [ ] Landscape characterized before scouting
- [ ] ≥3 indep hypotheses gen + tested
- [ ] Tests cheap (1 action each) + indep
- [ ] Reinforcement on evidence not preference
- [ ] Marginal value assessed before deep investigation
- [ ] Strategy adapted to results not fixed plan

## Traps

- **Premature exploitation**: Dive deep first showing any promise w/o scouting alts. Most common — first good idea often not best.
- **Perpetual scouting**: Gen hypotheses endless never commit. Set budget: after N scouts, commit best regardless.
- **Non-indep hypotheses**: "Maybe in file A" + "maybe in file B imported by A" = not indep, share assumptions. Force genuine diversity.
- **Ignore inhibition**: Evidence contradicts → let go. Continue investing contradicted because effort spent = sunk cost fallacy.
- **Scout w/o record**: Not recorded → later scouts repeat. Briefly note each scout finding before moving.

## →

- `forage-resources` — multi-agent foraging model this adapts to single-agent
- `build-coherence` — foraging reveals multiple valid needing eval
- `coordinate-reasoning` — manages info flow between scout hypotheses + exploitation
- `awareness` — monitors premature convergence + tunnel vision during foraging
