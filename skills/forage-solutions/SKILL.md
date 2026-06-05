---
name: forage-solutions
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

Explore a solution space using ant colony optimization principles — deploying independent hypotheses as scouts, reinforcing promising approaches through evidence, detecting diminishing returns, and knowing when to abandon a strategy and explore elsewhere.

## When to Use

- Facing a problem with multiple plausible approaches and no clear winner
- When the first approach tried is not working but alternatives are unclear
- Debugging with no obvious root cause — multiple hypotheses need parallel investigation
- Searching a codebase for the source of a behavior when the location is unknown
- When previous solution attempts have converged prematurely on a suboptimal approach
- Complementing `build-coherence` when the solution space must be explored before a decision is made

## Inputs

- **Required**: Problem description or goal (what are we foraging for?)
- **Required**: Current state of knowledge (what is already known?)
- **Optional**: Previous approaches tried and their outcomes
- **Optional**: Constraints on exploration (time budget, tool availability)
- **Optional**: Urgency level (affects exploration-exploitation balance)

## Procedure

### Step 1: Map the Solution Landscape

Before deploying scouts, characterize the shape of the solution space.

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

Classify the current problem. The distribution type determines how many scouts to deploy and how quickly to switch from exploration to exploitation.

**Expected:** A clear characterization of the solution landscape that informs scouting strategy. The classification should feel accurate to the problem, not forced.

**On failure:** If the landscape is completely unknown, that itself is the classification — treat it as potentially distributed and deploy broad scouts. The first round of scouting will reveal the landscape character.

### Step 2: Deploy Scout Hypotheses

Generate independent hypotheses as scouts. Each scout probes the solution space in a different direction.

1. Generate 3-5 independent hypotheses about the problem or its solution
2. For each hypothesis, define one cheap test — a single file read, one grep, one specific check
3. Rate initial promise based on available evidence (not gut feeling)
4. Deploy scouts independently: do not let the assessment of hypothesis A influence the test of hypothesis B

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

Key principle: scouts assess, they do not exploit. The goal is a quick signal on each hypothesis, not a deep investigation of the first one that looks promising.

**Expected:** 3-5 independent hypotheses with cheap tests defined. No hypothesis has been deeply explored yet — this is a breadth-first pass.

**On failure:** If fewer than 3 hypotheses can be generated, the problem is either very constrained (concentrated type — good, scout aggressively) or understanding is too shallow (read more context before hypothesizing). If hypotheses are not independent (they are all variations of the same idea), the exploration is too narrow — force at least one hypothesis that contradicts the others.

### Step 3: Trail Reinforcement — Follow the Evidence

After scout results return, reinforce promising trails and let weak ones decay.

1. Review scout results: which hypotheses found supporting evidence?
2. **Strong evidence found** → reinforce the trail: invest more investigation effort here
3. **No evidence found** → let the trail decay: do not investigate further without new signals
4. **Contradicting evidence found** → mark as inhibition signal: actively avoid this path
5. Monitor for premature convergence: if all effort flows to the first trail reinforced, force one scout into unexplored territory

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

**Expected:** A clear prioritization of trails based on evidence, not preference. The strongest trail gets the most attention, but at least one alternative stays alive.

**On failure:** If all scouts return empty, the hypotheses were wrong — not the approach. Reframe the question: "What assumptions am I making that could be wrong?" Generate new hypotheses from a different angle. If all scouts return strong signals, the problem may be distributed (multiple valid answers) — switch to `build-coherence` for approach selection.

### Step 4: Marginal Value Theorem — Know When to Leave

Monitor the yield of the current approach. When the information gained per unit of effort drops below the average across all approaches, it is time to switch.

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

Important: factor in switching cost. Moving to a new hypothesis means loading new context, which has a cost. Do not switch for marginal gains — switch when the current trail is clearly depleted.

**Expected:** A deliberate decision to continue or switch based on yield assessment, not habit or frustration. Switches are evidence-based, not impulse-driven.

**On failure:** If switching happens too frequently (oscillation between hypotheses), the switching cost is being undervalued. Commit to the current trail for N more actions before reassessing. If switching never happens (stuck on one trail despite declining yield), set a hard cap: after N unproductive actions, switch regardless of sunk cost.

### Step 5: Adapt Strategy to Results

Based on the foraging results, select the appropriate next phase.

1. **Most scouts empty, one trail weak** → the problem is likely misframed. Step back and reframe: what question should we be asking?
2. **One strong trail, others empty** → concentrated problem. Exploit the strong trail with full attention
3. **Multiple competing trails** → distributed problem. Apply `build-coherence` to select among them
4. **Clear winner emerging** → transition from exploration to exploitation. Reduce scouting budget to 10-20% (keep one scout active for alternatives), commit primary effort to the winning approach
5. **All trails exhausted** → the solution may not exist in the current search space. Expand: different tools, different assumptions, ask the user

**Expected:** A strategic decision about the next phase that follows logically from the foraging results. The decision should feel like a conclusion, not a guess.

**On failure:** If no strategy feels right, the foraging has revealed genuine uncertainty — and that is a valid outcome. Communicate the uncertainty to the user: "I explored N approaches and found X. The most promising is Y because Z. Shall I pursue it, or do you have additional context?"

## Validation

- [ ] Solution landscape was characterized before scouting began
- [ ] At least 3 independent hypotheses were generated and tested
- [ ] Scout tests were cheap (one action each) and independent
- [ ] Trail reinforcement was based on evidence, not preference
- [ ] Marginal value was assessed before committing to deep investigation
- [ ] The strategy adapted to results rather than following a fixed plan

## Common Pitfalls

- **Premature exploitation**: Diving deep into the first hypothesis that shows any promise without scouting alternatives. This is the most common failure — the first good idea is often not the best idea
- **Perpetual scouting**: Generating hypotheses endlessly without ever committing to one. Set a budget: after N scouts, commit to the best trail regardless
- **Non-independent hypotheses**: "Maybe it's in file A" and "maybe it's in file B, which is imported by file A" are not independent — they share assumptions. Force genuine diversity of approach
- **Ignoring inhibition signals**: When evidence contradicts a hypothesis, let it go. Continuing to invest in a contradicted trail because of effort already spent is the foraging equivalent of sunk cost fallacy
- **Scouting without recording**: If scout results are not recorded, later scouts will repeat earlier work. Briefly note what each scout found before moving to the next

## Related Skills

- `forage-resources` — the multi-agent foraging model that this skill adapts to single-agent solution search
- `build-coherence` — used when foraging reveals multiple valid approaches that need evaluation
- `coordinate-reasoning` — manages the information flow between scout hypotheses and exploitation phases
- `awareness` — monitors for premature convergence and tunnel vision during foraging
