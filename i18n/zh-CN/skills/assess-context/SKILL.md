---
name: assess-context
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
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Assess Context

Evaluate the current reasoning context for malleability — identifying which elements are rigid (cannot change), which are flexible (can change cheaply), where transformation pressure is building, and whether the current approach has the capacity to adapt if needed.

## 适用场景

- When a complex task feels stuck and it is unclear whether to push through or pivot
- Before a significant approach change to assess whether the current reasoning structure can support it
- When accumulated workarounds suggest the underlying approach may be wrong
- After `heal` or `awareness` has identified drift but the appropriate response (continue, adjust, or rebuild) is unclear
- When context has grown long and it is unclear how much can be preserved versus how much needs to be rebuilt
- Periodic structural health check during extended multi-step tasks

## 输入

- **必需**: Current task context and reasoning state (available implicitly)
- **可选**: Specific concern triggering the assessment (e.g., "I keep adding workarounds")
- **可选**: Proposed pivot direction (what might the approach need to become?)
- **可选**: Previous assessment results for trend analysis

## 步骤

### 第 1 步：Inventory Reasoning Form

Catalog the structural components of the current reasoning approach without judgment.

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

Map dependencies: which components depend on which? A skeleton component with many dependents is load-bearing. A flesh component with no dependents is disposable.

**预期结果：** A complete inventory showing what the current approach is built from, what is rigid, what is flexible, and where stress is visible (workarounds). The inventory should reveal structure that was not obvious before cataloging.

**失败处理：** If the inventory is hard to construct (the approach is too tangled to decompose), that is itself a finding — high structural opacity indicates high rigidity. Start with what is visible and note the opacity zones.

### 第 2 步：Map Transformation Pressure

Identify forces pushing the current approach toward change and forces resisting it.

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

Estimate the balance: is transformation pressure growing, stable, or declining?

**预期结果：** A clear picture of forces acting on the current approach. If pressure significantly exceeds resistance, a pivot is overdue. If resistance significantly exceeds pressure, the current approach should continue.

**失败处理：** If the pressure map is ambiguous (neither strong pressure nor strong resistance), project forward: will the pressures intensify? Will the workarounds compound? An approach that is "good enough now but degrading" is under more pressure than it appears.

### 第 3 步：Assess Reasoning Rigidity

Determine how flexible the current approach is — can it adapt, or will it break?

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

**预期结果：** A rigidity score with specific evidence for each dimension. The score reveals whether the approach can absorb change or will need to be rebuilt.

**失败处理：** If all dimensions score low (claiming high flexibility), probe the "god module" dimension more carefully: is there one key conclusion or assumption that everything else depends on? If so, the flexibility is illusory — one wrong assumption collapses the whole structure.

### 第 4 步：Estimate Change Capacity

Assess the practical ability to pivot or adapt the current approach.

1. **Context window remaining**: how much room is left for new reasoning? Extensive remaining context = high capacity. Approaching limits = low capacity
2. **Information preservation on pivot**: if the approach changes, what can be carried forward? High-quality sub-task outputs survive pivots; reasoning chains tied to the old approach do not
3. **Recovery tools available**: can MEMORY.md capture key findings before pivoting? Can the user provide additional context? Are relevant files still accessible?
4. **User patience factor**: has the user indicated urgency? Multiple corrections suggest declining patience. An explicit "take your time" suggests high patience

Change capacity is not just theoretical — it includes the practical constraints of the current session.

**预期结果：** An honest assessment of the ability to change course, accounting for both technical and relational factors.

**失败处理：** If change capacity is low (limited context, critical information at risk of loss), the first priority before any pivot is preservation: summarize key findings, note critical facts, update MEMORY.md if appropriate. Pivoting without preservation is worse than not pivoting.

### 第 5 步：Classify Transformation Readiness

Combine the assessments into a readiness classification.

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

Document the classification with:
- Classification label (READY / PREPARE / INVEST / CRITICAL / DEFER)
- Key findings from each dimension
- Recommended next action
- What signal would change the classification

**预期结果：** A clear, justified classification with a specific recommended action. The classification should feel like a conclusion, not a guess.

**失败处理：** If the classification is ambiguous, default to PREPARE — reducing rigidity (clarifying assumptions, removing workarounds) is valuable regardless of whether a full pivot happens. Preparation improves the approach whether it continues or changes.

## 验证清单

- [ ] Structural inventory was completed with skeleton/flesh/scar-tissue classification
- [ ] Transformation pressures were mapped (external, internal, resistance)
- [ ] Rigidity was scored across multiple dimensions with specific evidence
- [ ] Change capacity was assessed including practical session constraints
- [ ] Readiness classification was determined with justified reasoning
- [ ] A concrete next action was identified based on the classification
- [ ] A reassessment trigger was defined

## 常见问题

- **Assessing only the technical approach**: Context readiness includes user relationship factors. An approach that is technically flexible but has generated user frustration is more rigid than it appears
- **Sunk cost as rigidity**: Prior effort is not structural rigidity. The work already done may be valuable regardless of whether the approach changes. Distinguish between "I can't change" (rigidity) and "I don't want to change" (sunk cost)
- **Assessment as avoidance**: If assess-context is invoked to avoid making a difficult decision, the assessment will be inconclusive by design. If the pressure is clear, act on it
- **Ignoring workarounds as signals**: Workarounds are scar tissue — evidence that the structure was stressed and patched rather than properly adapted. A high workaround count means the next stress is more likely to break through
- **Confusing rigidity with commitment**: A committed approach (deliberately chosen, evidence-based) is different from a rigid one (locked in by dependencies and assumptions). Commitment can be changed by decision; rigidity can only be changed by restructuring

## 相关技能

- `assess-form` — the multi-system assessment model that this skill adapts to AI reasoning context
- `adapt-architecture` — if classified READY, use architectural adaptation principles for the pivot
- `heal` — deeper subsystem scan when the assessment reveals drift beyond structural issues
- `center` — establishes the balanced baseline needed for honest assessment
- `coordinate-reasoning` — manages information freshness that the assessment depends on
