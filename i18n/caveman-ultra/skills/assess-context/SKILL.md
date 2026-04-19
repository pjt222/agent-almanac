---
name: assess-context
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  AI context assessment — evaluating problem malleability, mapping structural
  rigidity versus flexibility, analyzing transformation pressure, and estimating
  capacity to adapt. Use when a complex task feels stuck and it is unclear
  whether to push through or pivot, before a significant approach change to
  assess whether the current reasoning structure can support it, when accumulated
  workarounds suggest the underlying approach may be wrong, or as a periodic
  structural health check during extended multi-step tasks.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, assessment, context-evaluation, malleability, meta-cognition, ai-self-application
---

# Assess Context

Eval current reasoning ctx for malleability — ID rigid (no change), flexible (cheap change), where transformation pressure building, current approach has capacity to adapt.

## Use When

- Complex task feels stuck, unclear push through or pivot
- Before significant approach change → assess current reasoning structure support
- Accumulated workarounds suggest underlying approach wrong
- After `heal` or `awareness` → drift ID'd but appropriate response (continue, adjust, rebuild) unclear
- Context grown long → unclear how much preserve vs rebuild
- Periodic structural health check during extended multi-step

## In

- **Required**: Current task ctx + reasoning state (implicit)
- **Optional**: Specific concern triggering ("I keep adding workarounds")
- **Optional**: Proposed pivot direction (what approach need to become?)
- **Optional**: Previous results for trend

## Do

### Step 1: Inventory Reasoning Form

Catalog structural components no judgment.

```
Structural Inventory Table:
┌────────────────────┬──────────────┬──────────────────────────────────┐
│ Component          │ Type         │ Description                      │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Main task          │ Skeleton     │ The user's core request — cannot │
│                    │              │ change without user direction     │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Sub-task breakdown │ Flesh        │ How the task is decomposed —     │
│                    │              │ can be restructured               │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Tool strategy      │ Flesh        │ Which tools are being used and   │
│                    │              │ in what order — can be changed    │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Output plan        │ Flesh/Skel   │ The expected deliverable format  │
│                    │              │ — may be constrained by user     │
│                    │              │ expectations                      │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Key assumptions    │ Skeleton     │ Facts treated as given — may be  │
│                    │              │ wrong but are load-bearing        │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Constraints        │ Skeleton     │ Hard limits (user-imposed, tool  │
│                    │              │ limitations, time)                │
├────────────────────┼──────────────┼──────────────────────────────────┤
│ Workarounds        │ Scar tissue  │ Patches for things that didn't   │
│                    │              │ work as expected — signals of     │
│                    │              │ structural stress                 │
└────────────────────┴──────────────┴──────────────────────────────────┘
```

Classify each:
- **Skeleton**: hard to change; changing cascades downstream
- **Flesh**: easy to change; swappable no affecting others
- **Scar tissue**: workarounds indicating structural problems; often flesh pretending skeleton

Map deps: which components depend on which? Skeleton w/ many dependents = load-bearing. Flesh w/ no dependents = disposable.

**→** Complete inventory: what built from, what rigid, what flexible, where stress visible (workarounds). Reveals structure not obvious pre-catalog.

**If err:** Inventory hard to construct (too tangled) → that itself = finding. High opacity = high rigidity. Start w/ visible + note opacity zones.

### Step 2: Map Transformation Pressure

Forces pushing toward change + forces resisting.

```
Pressure Map:
┌─────────────────────────┬──────────────────────────────────────────┐
│ External Pressure       │ Forces from outside the reasoning        │
│ (pushing toward change) │                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ New information         │ Tool results or user input that          │
│                         │ contradicts current approach              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool contradictions     │ Tools returning unexpected results that  │
│                         │ the current approach cannot explain       │
├─────────────────────────┼──────────────────────────────────────────┤
│ Time pressure           │ The current approach is too slow for the │
│                         │ complexity of the task                    │
├─────────────────────────┼──────────────────────────────────────────┤
│ Internal Pressure       │ Forces from within the reasoning         │
│ (pushing toward change) │                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Diminishing returns     │ Each step yields less progress than the  │
│                         │ previous one                              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Workaround accumulation │ The number of patches is growing —       │
│                         │ complexity is outpacing the structure     │
├─────────────────────────┼──────────────────────────────────────────┤
│ Coherence loss          │ Sub-tasks are not fitting together       │
│                         │ cleanly anymore                           │
├─────────────────────────┼──────────────────────────────────────────┤
│ Resistance              │ Forces opposing change                    │
│ (pushing against change)│                                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Sunk cost               │ Significant work already done on current │
│                         │ approach — pivoting "wastes" that effort  │
├─────────────────────────┼──────────────────────────────────────────┤
│ "Good enough"           │ The current approach is producing        │
│                         │ acceptable (if not optimal) results       │
├─────────────────────────┼──────────────────────────────────────────┤
│ Pivot cost              │ Switching approaches means rebuilding    │
│                         │ context, losing momentum, potential      │
│                         │ confusion                                 │
└─────────────────────────┴──────────────────────────────────────────┘
```

Estimate balance: pressure growing, stable, declining?

**→** Clear picture of forces on approach. Pressure significantly > resistance → pivot overdue. Resistance significantly > pressure → approach continues.

**If err:** Pressure map ambiguous (neither strong) → project forward: pressures intensify? Workarounds compound? "Good enough now but degrading" under more pressure than appears.

### Step 3: Assess Rigidity

How flexible is approach — can adapt or break?

```
Rigidity Score:
┌──────────────────────────┬─────┬──────────┬──────┬──────────────┐
│ Dimension                │ Low │ Moderate │ High │ Assessment   │
│                          │ (1) │ (2)      │ (3)  │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Component swappability   │ Can swap parts   │ Changing one │              │
│                          │ freely          │ breaks others│              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ "God module" dependency  │ No single point  │ Everything   │              │
│                          │ of failure       │ depends on   │              │
│                          │                  │ one conclusion│             │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Tool entanglement        │ Tools serve      │ Approach is  │              │
│                          │ reasoning        │ shaped by    │              │
│                          │                  │ tool limits   │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Assumption transparency  │ Assumptions are  │ Assumptions  │              │
│                          │ stated, testable │ are implicit, │             │
│                          │                  │ untested      │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Workaround count         │ None or few      │ Multiple     │              │
│                          │                  │ accumulating  │              │
├──────────────────────────┼─────┼──────────┼──────┼──────────────┤
│ Total (max 15)           │ 5-7: flexible    │              │              │
│                          │ 8-10: moderate   │              │              │
│                          │ 11-15: rigid     │              │              │
└──────────────────────────┴─────┴──────────┴──────┴──────────────┘
```

**→** Rigidity score + specific evidence per dim. Score reveals whether approach absorbs change or needs rebuild.

**If err:** All dims low (claiming high flexibility) → probe "god module" dim carefully: 1 key conclusion/assumption everything depends? If yes → flexibility illusory — 1 wrong assumption collapses whole.

### Step 4: Estimate Change Capacity

Practical ability to pivot/adapt.

1. **Ctx window remaining**: room for new reasoning? Extensive = high capacity. Approaching limits = low capacity
2. **Info preservation on pivot**: approach changes → what carries forward? High-quality sub-task outputs survive pivots; reasoning chains tied to old approach do not
3. **Recovery tools**: MEMORY.md capture key findings pre-pivoting? User provide additional ctx? Relevant files accessible?
4. **User patience**: urgency indicated? Multi corrections → declining patience. Explicit "take your time" → high patience

Change capacity includes practical constraints of current session.

**→** Honest assessment of ability to change course, both technical + relational.

**If err:** Low capacity (limited ctx, critical info at risk) → first priority pre-pivot = preservation: summarize key findings, note critical facts, update MEMORY.md. Pivoting no preservation worse than not pivoting.

### Step 5: Classify Readiness

Combine into readiness classification.

```
Transformation Readiness Matrix:
┌─────────────────┬────────────────────────┬────────────────────────┐
│                  │ Low Rigidity           │ High Rigidity          │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ READY — pivot now.     │ PREPARE — simplify     │
│ + High Capacity │ The approach can adapt  │ first. Remove          │
│                 │ and should. Preserve    │ workarounds, clarify   │
│                 │ valuable sub-outputs,   │ assumptions, then      │
│                 │ rebuild the structure   │ pivot                  │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ INVEST — preserve      │ CRITICAL — ask the     │
│ + Low Capacity  │ findings first. Update  │ user. Explain the      │
│                 │ MEMORY.md, summarize    │ situation: approach is  │
│                 │ progress, then pivot    │ struggling, pivoting   │
│                 │ with preserved context  │ is costly, what do     │
│                 │                        │ they want to prioritize?│
├─────────────────┼────────────────────────┼────────────────────────┤
│ Low Pressure    │ DEFER — the approach   │ DEFER — no urgency,    │
│ + Any Capacity  │ is working. Continue.   │ continue. Monitor for  │
│                 │ Reassess if pressure    │ pressure changes        │
│                 │ increases               │                        │
└─────────────────┴────────────────────────┴────────────────────────┘
```

Doc classification:
- Label (READY / PREPARE / INVEST / CRITICAL / DEFER)
- Key findings per dim
- Recommended next action
- Signal changing classification

**→** Clear justified classification + specific recommended action. Feels like conclusion not guess.

**If err:** Ambiguous → default PREPARE — reducing rigidity (clarifying assumptions, removing workarounds) valuable regardless of full pivot happens. Prep improves approach whether continues or changes.

## Check

- [ ] Structural inventory done w/ skeleton/flesh/scar-tissue classification
- [ ] Transformation pressures mapped (external, internal, resistance)
- [ ] Rigidity scored across multi dims + specific evidence
- [ ] Change capacity assessed including practical session constraints
- [ ] Readiness classification determined w/ justified reasoning
- [ ] Concrete next action ID'd per classification
- [ ] Reassessment trigger defined

## Traps

- **Assess only technical approach**: Ctx readiness includes user relationship factors. Technically flexible but user-frustrated approach more rigid than appears
- **Sunk cost as rigidity**: Prior effort not structural rigidity. Work done may be valuable regardless. Distinguish "I can't change" (rigidity) from "I don't want to" (sunk cost)
- **Assessment as avoidance**: Invoking assess-context to avoid difficult decision → inconclusive by design. Pressure clear → act
- **Ignore workarounds as signals**: Workarounds = scar tissue — evidence structure stressed + patched not properly adapted. High count → next stress more likely to break through
- **Confuse rigidity w/ commitment**: Committed approach (deliberately chosen, evidence-based) diff from rigid (locked by deps + assumptions). Commitment changeable by decision; rigidity only by restructuring

## →

- `assess-form` — multi-system assessment model this adapts to AI reasoning ctx
- `adapt-architecture` — classified READY → use architectural adaptation principles for pivot
- `heal` — deeper subsystem scan when drift beyond structural issues
- `center` — establishes balanced baseline for honest assessment
- `coordinate-reasoning` — manages info freshness assessment depends on
