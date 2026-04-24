---
name: forage-solutions
locale: caveman
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

Roam a solution space with ant colony optimization ideas — send independent hypotheses as scouts, reinforce hopeful paths through evidence, spot diminishing returns, and know when to abandon a strategy and roam elsewhere.

## When Use

- Face problem with many plausible paths and no clear winner
- When first path tried not working but alternatives are unclear
- Debug with no clear root cause — many hypotheses need parallel dig
- Search codebase for source of behavior when spot is unknown
- When past solution tries have converged early on suboptimal path
- Complement `build-coherence` when solution space must be roamed before pick

## Inputs

- **Required**: Problem desc or goal (what are we foraging for?)
- **Required**: Current state of knowledge (what is already known?)
- **Optional**: Past paths tried and their outcomes
- **Optional**: Limits on roam (time budget, tool open)
- **Optional**: Urgency level (hits roam-exploit balance)

## Steps

### Step 1: Map the Solution Landscape

Before send scouts, describe shape of solution space.

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

Sort current problem. Distribution type picks how many scouts to send and how fast to switch from roam to exploit.

**Got:** Clear sort of solution landscape that tells scouting strategy. Sort should feel right to problem, not forced.

**If fail:** Landscape fully unknown? That itself is sort — treat as possibly distributed and send broad scouts. First round of scouting will show landscape character.

### Step 2: Deploy Scout Hypotheses

Make independent hypotheses as scouts. Each scout probes solution space in different direction.

1. Make 3-5 independent hypotheses about problem or its solution
2. For each hypothesis, set one cheap test — single file read, one grep, one specific check
3. Rate first promise by open evidence (not gut feel)
4. Send scouts independent: do not let check of hypothesis A hit test of hypothesis B

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

Key rule: scouts check, they do not exploit. Goal is quick signal on each hypothesis, not deep dig of first one that looks hopeful.

**Got:** 3-5 independent hypotheses with cheap tests set. No hypothesis deep roamed yet — this is breadth-first pass.

**If fail:** Fewer than 3 hypotheses can be made? Problem is either very tight (concentrated type — good, scout aggressive) or grasp too shallow (read more context before hypothesize). Hypotheses not independent (they are all variations of same idea)? Roam too narrow — force at least one hypothesis that clashes with others.

### Step 3: Trail Reinforcement — Follow the Evidence

After scout results return, reinforce hopeful trails and let weak ones decay.

1. Review scout results: which hypotheses found backing evidence?
2. **Strong evidence found** → reinforce trail: invest more dig effort here
3. **No evidence found** → let trail decay: do not dig further without new signals
4. **Clashing evidence found** → mark as inhibition signal: actively avoid this path
5. Watch for premature converge: if all effort flows to first trail reinforced, force one scout into unexplored ground

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

**Got:** Clear priority of trails by evidence, not preference. Strongest trail gets most focus, but at least one alternative stays alive.

**If fail:** All scouts return empty? Hypotheses were wrong — not the path. Reframe question: "What assumptions am I making that could be wrong?" Make new hypotheses from different angle. All scouts return strong signals? Problem may be distributed (many valid answers) — switch to `build-coherence` for path pick.

### Step 4: Marginal Value Theorem — Know When to Leave

Watch yield of current path. When info gained per unit effort drops below average across all paths, time to switch.

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

Key: factor in switch cost. Moving to new hypothesis means loading new context, which has cost. Do not switch for marginal gains — switch when current trail clearly depleted.

**Got:** Deliberate pick to continue or switch by yield check, not habit or frustration. Switches are evidence-based, not impulse-driven.

**If fail:** Switch happens too often (oscillation between hypotheses)? Switch cost being under-valued. Commit to current trail for N more actions before recheck. Switch never happens (stuck on one trail despite dropping yield)? Set hard cap: after N unproductive actions, switch no matter sunk cost.

### Step 5: Adapt Strategy to Results

By forage results, pick right next phase.

1. **Most scouts empty, one trail weak** → problem likely misframed. Step back and reframe: what question should we be asking?
2. **One strong trail, others empty** → concentrated problem. Exploit strong trail with full focus
3. **Many competing trails** → distributed problem. Apply `build-coherence` to pick among them
4. **Clear winner emerging** → move from roam to exploit. Drop scouting budget to 10-20% (keep one scout active for alternatives), commit main effort to winning path
5. **All trails exhausted** → solution may not exist in current search space. Expand: different tools, different assumptions, ask user

**Got:** Strategic pick about next phase that follows logically from forage results. Pick should feel like conclusion, not guess.

**If fail:** No strategy feels right? Forage has shown real uncertainty — and that is valid outcome. Say uncertainty to user: "I roamed N paths and found X. Most hopeful is Y because Z. Shall I pursue it, or do you have extra context?"

## Validation

- [ ] Solution landscape sorted before scouting started
- [ ] At least 3 independent hypotheses made and tested
- [ ] Scout tests cheap (one action each) and independent
- [ ] Trail reinforcement based on evidence, not preference
- [ ] Marginal value checked before commit to deep dig
- [ ] Strategy adapted to results rather than follow fixed plan

## Pitfalls

- **Premature exploit**: Dive deep into first hypothesis that shows any promise without scouting alternatives. This is most common fail — first good idea is often not best idea
- **Endless scouting**: Make hypotheses endless without ever commit to one. Set budget: after N scouts, commit to best trail no matter what
- **Non-independent hypotheses**: "Maybe it's in file A" and "maybe it's in file B, which is imported by file A" are not independent — they share assumptions. Force real diversity of path
- **Ignore inhibition signals**: When evidence clashes with hypothesis, let it go. Keep invest in contradicted trail because of effort already spent is forage equivalent of sunk cost fallacy
- **Scout without record**: If scout results not logged, later scouts will repeat earlier work. Brief note what each scout found before move to next

## See Also

- `forage-resources` — multi-agent forage model that this skill adapts to single-agent solution search
- `build-coherence` — used when forage shows many valid paths that need check
- `coordinate-reasoning` — manages info flow between scout hypotheses and exploit phases
- `awareness` — watches for premature converge and tunnel vision during forage
