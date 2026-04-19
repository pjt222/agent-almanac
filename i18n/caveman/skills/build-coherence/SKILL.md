---
name: build-coherence
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  AI multi-path reasoning coherence using bee democracy — independent evaluation
  of competing approaches, waggle dance as reasoning-out-loud, quorum sensing
  for confidence thresholds, and deadlock resolution. Use when forage-solutions
  has identified multiple valid approaches and a selection must be made, when
  oscillating between options without committing, when justifying an architecture
  or tool choice with structured reasoning, or before an irreversible action where
  the cost of the wrong choice is high.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, coherence, approach-selection, confidence-thresholds, meta-cognition, ai-self-application
---

# Build Coherence

Evaluate competing approaches via independent assessment, explicit reasoning-out-loud advocacy, confidence-calibrated commitment thresholds, structured deadlock resolution — produce coherent decisions from multiple reasoning paths.

## When Use

- `forage-solutions` identified multiple valid approaches, selection must be made
- Oscillating between two approaches without committing to either
- Need to justify decision with structured reasoning (architecture choice, tool selection, implementation strategy)
- Previous decision made by gut feeling, needs evidence-based validation
- Internal reasoning producing contradictory conclusions, coherence must be restored
- Before irreversible action (merging, deploying, deleting) where cost of wrong choice high

## Inputs

- **Required**: Two or more competing approaches to evaluate
- **Optional**: Quality assessments from prior scouting (see `forage-solutions`)
- **Optional**: Decision stakes (reversible, moderate, irreversible) for threshold calibration
- **Optional**: Time budget for decision
- **Optional**: Known failure mode (oscillation, premature commitment, groupthink)

## Steps

### Step 1: Independent Evaluation

Assess each approach on its own merits before comparing. Critical rule: don't let assessment of approach A bias assessment of approach B.

For each approach, evaluate independently:

```
Approach Evaluation Template:
┌────────────────────────┬──────────────────────────────────────────┐
│ Dimension              │ Assessment                               │
├────────────────────────┼──────────────────────────────────────────┤
│ Approach name          │                                          │
├────────────────────────┼──────────────────────────────────────────┤
│ Core mechanism         │ How does this approach solve the problem? │
├────────────────────────┼──────────────────────────────────────────┤
│ Strengths (2-3)        │ What does this approach do well?          │
├────────────────────────┼──────────────────────────────────────────┤
│ Risks (2-3)            │ What could go wrong? What is assumed?     │
├────────────────────────┼──────────────────────────────────────────┤
│ Evidence quality        │ How well-supported is this approach?      │
│                        │ (verified / inferred / speculated)        │
├────────────────────────┼──────────────────────────────────────────┤
│ Quality score (0-100)  │ Overall assessment                        │
├────────────────────────┼──────────────────────────────────────────┤
│ Confidence (0-100)     │ How confident in this assessment?         │
└────────────────────────┴──────────────────────────────────────────┘
```

Fill this out for each approach separately. Do not write comparison until all individual evaluations complete.

**Got:** Independent evaluations where each approach assessed on its own terms. Evaluation of approach B does not reference approach A. Quality scores reflect genuine assessment, not ranking.

**If fail:** Evaluations contaminated (you find yourself writing "better than A" while assessing B)? Reset. Assess A completely, then clear framing, assess B from scratch. Scores all identical? Evaluation dimensions too coarse — add domain-specific criteria.

### Step 2: Waggle Dance — Reason Out Loud

Advocate for each approach proportionally to its quality. AI equivalent of bee waggle dance: make implicit reasoning explicit and public.

1. For each approach, state case for it — as if presenting to skeptical user:
   - "Approach A is strong because [evidence]. Main risk is [risk], mitigated by [mitigation]."
2. Advocacy intensity proportional to quality score:
   - High-quality approach: detailed advocacy with specific evidence
   - Medium-quality approach: brief advocacy with acknowledged limitations
   - Low-quality approach: mentioned for completeness, not actively advocated
3. **Cross-inspection**: after advocating for A, actively look for evidence supporting B instead. After advocating for B, look for evidence supporting A. Counteracts confirmation bias

Purpose of reasoning-out-loud: make decision auditable — to yourself and user. Reasoning cannot be articulated? Assessment shallower than score suggests.

**Got:** Explicit reasoning for each approach that would be persuasive to neutral observer. Cross-inspection reveals at least one consideration initially overlooked.

**If fail:** Advocacy feels perfunctory (going through motions)? Approaches may not be genuinely different — may be variations of same idea. Check: do approaches differ in mechanism, or only implementation detail? Latter? Decision may not matter much — pick either, move on.

### Step 3: Set Quorum Threshold and Commit

Set confidence threshold required to commit, calibrated to decision's stakes.

```
Confidence Thresholds by Stakes:
┌─────────────────────┬───────────┬──────────────────────────────────┐
│ Decision Type       │ Threshold │ Rationale                        │
├─────────────────────┼───────────┼──────────────────────────────────┤
│ Easily reversible   │ 60%       │ Cost of trying and reverting is  │
│ (can undo)          │           │ low. Speed matters more than     │
│                     │           │ certainty                        │
├─────────────────────┼───────────┼──────────────────────────────────┤
│ Moderate stakes     │ 75%       │ Reverting has cost but is        │
│ (costly to reverse) │           │ possible. Worth investing in     │
│                     │           │ evaluation                       │
├─────────────────────┼───────────┼──────────────────────────────────┤
│ Irreversible or     │ 90%       │ Cannot undo. Must be confident.  │
│ high-stakes         │           │ If threshold not met, gather     │
│                     │           │ more information before deciding │
└─────────────────────┴───────────┴──────────────────────────────────┘
```

1. Classify decision stakes
2. Check: does leading approach's quality score × confidence reach threshold?
3. If yes: commit. State decision, reasoning, key risk accepted
4. If no: identify what additional information would raise confidence to threshold
5. Once committed, do not revisit unless new disqualifying evidence emerges

**Got:** Clear commitment moment with stated reasoning. Decision made at appropriate confidence level for its stakes.

**If fail:** Threshold never met (can't reach 90% on irreversible decision)? Ask: decision truly irreversible? Can it be decomposed into reversible test phase + irreversible commit? Most apparently irreversible decisions can be staged. Staging impossible? Communicate uncertainty to user, ask guidance.

### Step 4: Resolve Deadlocks

Two or more approaches with similar scores, quorum threshold not met for any single one.

```
Deadlock Resolution:
┌────────────────────────┬──────────────────────────────────────────┐
│ Deadlock Type          │ Resolution                               │
├────────────────────────┼──────────────────────────────────────────┤
│ Genuine tie            │ The approaches are equivalent. Pick one  │
│ (scores within 5%)     │ and commit. The cost of deliberating     │
│                        │ exceeds the cost of picking the "wrong"  │
│                        │ equivalent option. Flip a coin mentally  │
├────────────────────────┼──────────────────────────────────────────┤
│ Information deficit    │ The tie exists because evaluation is     │
│ (scores uncertain)     │ incomplete. Invest one more specific     │
│                        │ investigation — a targeted file read, a  │
│                        │ quick test — then re-score               │
├────────────────────────┼──────────────────────────────────────────┤
│ Oscillation            │ Scoring keeps flip-flopping depending on │
│ (scores keep changing) │ which dimension gets attention. Time-box:│
│                        │ set a timer, evaluate once more, commit  │
│                        │ to the result regardless                 │
├────────────────────────┼──────────────────────────────────────────┤
│ Approach merge         │ The best parts of A and B can be         │
│ (compatible strengths) │ combined. Check for compatibility. If    │
│                        │ merge is coherent, use it. If forced,    │
│                        │ don't — pick one                         │
└────────────────────────┴──────────────────────────────────────────┘
```

**Got:** Deadlock resolved via appropriate mechanism. Resolution decisive — no lingering doubt undermining execution.

**If fail:** Deadlock persists through all resolution strategies? Decision may be premature. Ask user: "Two equally strong approaches: [A] and [B]. [Brief case for each.] Which aligns better with your priorities?" Delegating genuine tie to user not failure — acknowledges decision depends on values AI cannot infer.

### Step 5: Assess Coherence Quality

After committing, evaluate whether process produced genuine coherence or just a decision.

1. Decision evidence-based, or rubber-stamping initial preference?
   - Test: preference same before and after evaluation? If so, did evaluation change anything?
2. Losing approaches genuinely considered, or were they straw men?
   - Test: can you articulate strongest case for losing approach?
3. What signal would trigger reassessment?
   - Define specific observation that would invalidate decision ("If API doesn't support X, approach B becomes better")
4. Useful information from losing approaches that should inform implementation?
   - Risk identified in approach B might apply to approach A too

**Got:** Brief quality check either confirming decision or identifying it as weak. Weak? Return to appropriate earlier step rather than proceeding on shaky ground.

**If fail:** Quality check reveals decision was preference-based rather than evidence-based? Acknowledge honestly. Sometimes preference is all available — but label it as such, not dress up as analysis.

## Checks

- [ ] Each approach evaluated independently before comparison
- [ ] Advocacy proportional to quality (not equal attention regardless of merit)
- [ ] Cross-inspection performed (looking for counter-evidence after advocacy)
- [ ] Quorum threshold calibrated to decision stakes
- [ ] If deadlocked, specific resolution strategy applied
- [ ] Post-decision quality check performed
- [ ] Reassessment trigger defined

## Pitfalls

- **Premature commitment**: Deciding before evaluating all approaches. First approach considered has anchoring advantage — gets more mental attention simply by being first. Evaluate all before comparing
- **Equal advocacy for unequal approaches**: Approach A scored 85, approach B scored 45? Spending equal time advocating both wastes effort, creates false equivalence
- **Rubber-stamping**: Going through evaluation process to justify decision already made. Test: could evaluation have changed outcome? If not, process was theater
- **Threshold avoidance**: Lowering confidence threshold to make decision easier rather than gathering information needed to meet appropriate threshold
- **Ignoring losing side**: Losing approach often contains warnings applying to winning one. Risks identified in approach B don't disappear just because approach A was chosen

## See Also

- `build-consensus` — multi-agent consensus model this skill adapts to single-agent reasoning
- `forage-solutions` — scouts solution space coherence evaluates; typically precedes this skill
- `coordinate-reasoning` — manages information flow during multi-path evaluation
- `center` — establishes balanced baseline needed for unbiased evaluation
- `meditate` — clears assumptions between evaluating different approaches
