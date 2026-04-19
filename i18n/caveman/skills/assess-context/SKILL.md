---
name: assess-context
locale: caveman
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

Evaluate current reasoning context for malleability — identifying which elements rigid (cannot change), which flexible (can change cheaply), where transformation pressure building, whether current approach has capacity to adapt if needed.

## When Use

- Complex task feels stuck and unclear whether to push through or pivot
- Before significant approach change to assess whether current reasoning structure can support it
- Accumulated workarounds suggest underlying approach may be wrong
- After `heal` or `awareness` has identified drift but appropriate response (continue, adjust, or rebuild) unclear
- Context grown long and unclear how much can be preserved versus how much needs to be rebuilt
- Periodic structural health check during extended multi-step tasks

## Inputs

- **Required**: Current task context and reasoning state (available implicitly)
- **Optional**: Specific concern triggering assessment (e.g., "I keep adding workarounds")
- **Optional**: Proposed pivot direction (what might approach need to become?)
- **Optional**: Previous assessment results for trend analysis

## Steps

### Step 1: Inventory Reasoning Form

Catalog structural components of current reasoning approach without judgment.

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

Classify each component:
- **Skeleton**: hard to change; changing it cascades through everything downstream
- **Flesh**: easy to change; can be swapped without affecting other components
- **Scar tissue**: workarounds that indicate structural problems; often flesh pretending to be skeleton

Map dependencies: which components depend on which? Skeleton component with many dependents is load-bearing. Flesh component with no dependents is disposable.

**Got:** Complete inventory showing what current approach built from, what rigid, what flexible, where stress visible (workarounds). Inventory should reveal structure that was not obvious before cataloging.

**If fail:** Inventory hard to construct (approach too tangled to decompose)? That itself is finding — high structural opacity indicates high rigidity. Start with what is visible and note opacity zones.

### Step 2: Map Transformation Pressure

Identify forces pushing current approach toward change and forces resisting it.

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

Estimate balance: is transformation pressure growing, stable, or declining?

**Got:** Clear picture of forces acting on current approach. Pressure significantly exceeds resistance? Pivot is overdue. Resistance significantly exceeds pressure? Current approach should continue.

**If fail:** Pressure map ambiguous (neither strong pressure nor strong resistance)? Project forward: will pressures intensify? Will workarounds compound? Approach that "good enough now but degrading" is under more pressure than it appears.

### Step 3: Assess Reasoning Rigidity

Determine how flexible current approach is — can it adapt, or will it break?

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

**Got:** Rigidity score with specific evidence for each dimension. Score reveals whether approach can absorb change or will need to be rebuilt.

**If fail:** All dimensions score low (claiming high flexibility)? Probe "god module" dimension more carefully: is there one key conclusion or assumption that everything else depends on? If so, flexibility is illusory — one wrong assumption collapses whole structure.

### Step 4: Estimate Change Capacity

Assess practical ability to pivot or adapt current approach.

1. **Context window remaining**: how much room left for new reasoning? Extensive remaining context = high capacity. Approaching limits = low capacity
2. **Information preservation on pivot**: approach changes, what can be carried forward? High-quality sub-task outputs survive pivots; reasoning chains tied to old approach do not
3. **Recovery tools available**: can MEMORY.md capture key findings before pivoting? Can user provide additional context? Are relevant files still accessible?
4. **User patience factor**: has user indicated urgency? Multiple corrections suggest declining patience. Explicit "take your time" suggests high patience

Change capacity is not just theoretical — includes practical constraints of current session.

**Got:** Honest assessment of ability to change course, accounting for both technical and relational factors.

**If fail:** Change capacity low (limited context, critical information at risk of loss)? First priority before any pivot is preservation: summarize key findings, note critical facts, update MEMORY.md if appropriate. Pivoting without preservation worse than not pivoting.

### Step 5: Classify Transformation Readiness

Combine assessments into readiness classification.

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

Document classification with:
- Classification label (READY / PREPARE / INVEST / CRITICAL / DEFER)
- Key findings from each dimension
- Recommended next action
- What signal would change classification

**Got:** Clear, justified classification with specific recommended action. Classification should feel like conclusion, not guess.

**If fail:** Classification ambiguous? Default to PREPARE — reducing rigidity (clarifying assumptions, removing workarounds) is valuable regardless of whether full pivot happens. Preparation improves approach whether it continues or changes.

## Checks

- [ ] Structural inventory completed with skeleton/flesh/scar-tissue classification
- [ ] Transformation pressures mapped (external, internal, resistance)
- [ ] Rigidity scored across multiple dimensions with specific evidence
- [ ] Change capacity assessed including practical session constraints
- [ ] Readiness classification determined with justified reasoning
- [ ] Concrete next action identified based on classification
- [ ] Reassessment trigger defined

## Pitfalls

- **Assessing only technical approach**: Context readiness includes user relationship factors. Approach that technically flexible but has generated user frustration is more rigid than it appears
- **Sunk cost as rigidity**: Prior effort is not structural rigidity. Work already done may be valuable regardless of whether approach changes. Distinguish between "I can't change" (rigidity) and "I don't want to change" (sunk cost)
- **Assessment as avoidance**: Assess-context invoked to avoid making difficult decision? Assessment will be inconclusive by design. Pressure is clear? Act on it
- **Ignoring workarounds as signals**: Workarounds are scar tissue — evidence that structure was stressed and patched rather than properly adapted. High workaround count means next stress more likely to break through
- **Confusing rigidity with commitment**: Committed approach (deliberately chosen, evidence-based) different from rigid one (locked in by dependencies and assumptions). Commitment can be changed by decision; rigidity can only be changed by restructuring

## See Also

- `assess-form` — multi-system assessment model that this skill adapts to AI reasoning context
- `adapt-architecture` — if classified READY, use architectural adaptation principles for pivot
- `heal` — deeper subsystem scan when assessment reveals drift beyond structural issues
- `center` — establishes balanced baseline needed for honest assessment
- `coordinate-reasoning` — manages information freshness that assessment depends on
