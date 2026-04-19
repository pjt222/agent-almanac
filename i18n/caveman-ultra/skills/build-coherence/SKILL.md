---
name: build-coherence
locale: caveman-ultra
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

Evaluate competing approaches → independent assess, explicit reasoning-out-loud advocacy, confidence-calibrated commit thresholds, structured deadlock res → coherent decisions from multi-path reasoning.

## Use When

- `forage-solutions` ID'd many valid approaches, must select
- Oscillating between 2 approaches, no commit
- Need to justify decision w/ structured reasoning (arch, tool, impl strategy)
- Prev decision by gut, needs evidence validation
- Internal reasoning → contradictory conclusions, restore coherence
- Before irreversible action (merge, deploy, delete) where wrong = high cost

## In

- **Required**: ≥2 competing approaches
- **Optional**: Quality assessments from prior scouting (see `forage-solutions`)
- **Optional**: Decision stakes (reversible, moderate, irreversible) for threshold calibration
- **Optional**: Time budget
- **Optional**: Known failure mode (oscillation, premature commit, groupthink)

## Do

### Step 1: Independent Evaluate

Assess each on own merits before comparing. Critical: A's assessment doesn't bias B.

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

Fill out each separately. No comparison until all individual evals complete.

**→** Independent evals, each on own terms. B's eval doesn't ref A. Scores = real assessment, not ranking.

**If err:** Evals contaminated (writing "better than A" while assessing B) → reset. Assess A fully, clear frame, assess B fresh. All scores identical → dimensions too coarse, add domain-specific criteria.

### Step 2: Waggle Dance — Reason Out Loud

Advocate proportional to quality. AI eq of bee waggle: implicit reasoning → explicit + public.

1. Each approach, state case — as if presenting to skeptical user:
   - "Approach A strong because [evidence]. Main risk [risk], mitigated by [mitigation]."
2. Advocacy intensity proportional to quality score:
   - High: detailed advocacy + specific evidence
   - Medium: brief advocacy + acknowledged limits
   - Low: mentioned for completeness, not actively advocated
3. **Cross-inspection**: After advocating A, actively seek evidence supporting B. After B, seek A. Counters confirmation bias

Point of reasoning-out-loud = decision auditable. Can't articulate → assessment shallower than score suggests.

**→** Explicit reasoning per approach, persuasive to neutral observer. Cross-inspection reveals ≥1 initially overlooked consideration.

**If err:** Advocacy perfunctory (motions) → approaches maybe not genuinely diff, just variations. Differ in mechanism or only impl detail? Latter → decision doesn't matter much, pick either, move on.

### Step 3: Quorum Threshold + Commit

Confidence threshold to commit, calibrated to stakes.

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

1. Classify stakes
2. Check: leading approach quality × confidence ≥ threshold?
3. Yes → commit. State decision, reasoning, key risk accepted
4. No → ID additional info that raises confidence to threshold
5. Committed → don't revisit unless new disqualifying evidence

**→** Clear commit moment + stated reasoning. Decision at right confidence for stakes.

**If err:** Threshold never met (can't hit 90% on irreversible) → ask: truly irreversible? Decomposable into reversible test + irreversible commit? Most apparently irreversible can be staged. Impossible → tell user uncertainty, ask guidance.

### Step 4: Deadlock Resolution

≥2 approaches similar scores + quorum not met for any.

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

**→** Deadlock resolved via mechanism. Decisive — no lingering doubt that undermines execution.

**If err:** Deadlock persists through all strategies → decision premature. Ask user: "2 equally strong approaches: [A], [B]. [Brief case each.] Which aligns w/ priorities?" Delegating genuine tie = not fail, ack decision depends on values AI can't infer.

### Step 5: Coherence Quality

Post-commit: real coherence or just a decision?

1. Evidence-based or rubber-stamped initial pref?
   - Test: Pref same before + after eval? Eval changed anything?
2. Losing approaches genuinely considered or straw men?
   - Test: Can articulate strongest case for losing approach?
3. What signal triggers reassess?
   - Specific obs that would invalidate ("If API doesn't support X, approach B better")
4. Useful info from losing approaches for impl?
   - Risk in B may apply to A too

**→** Brief quality check that confirms decision OR IDs it as weak. Weak → return to earlier step, not proceed on shaky ground.

**If err:** Quality check reveals pref-based not evidence-based → ack honestly. Sometimes pref all that's available — label as such, not dressed up as analysis.

## Check

- [ ] Each approach evaluated independently before comparison
- [ ] Advocacy proportional to quality (not equal regardless of merit)
- [ ] Cross-inspection done (counter-evidence after advocacy)
- [ ] Quorum threshold calibrated to stakes
- [ ] Deadlocked → specific resolution strategy applied
- [ ] Post-decision quality check done
- [ ] Reassess trigger defined

## Traps

- **Premature commit**: Decide before evaluating all. First approach has anchoring advantage (more mental attention from being first). Evaluate all before comparing
- **Equal advocacy, unequal approaches**: A=85, B=45 → equal time = wasted effort + false equivalence
- **Rubber-stamp**: Going through process to justify already-made decision. Test: could eval have changed outcome? If not = theater
- **Threshold avoidance**: Lower threshold to ease decision vs gather info needed to meet appropriate threshold
- **Ignore losing side**: Losing approach often contains warnings applying to winner. Risks in B don't vanish just because A chosen

## →

- `build-consensus` — multi-agent consensus model this adapts to single-agent reasoning
- `forage-solutions` — scouts solution space coherence evaluates; typically precedes this
- `coordinate-reasoning` — manages info flow during multi-path eval
- `center` — baseline needed for unbiased eval
- `meditate` — clears assumptions between evaluating diff approaches
