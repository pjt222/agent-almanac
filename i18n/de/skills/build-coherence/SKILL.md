---
name: build-coherence
description: >
  AI multi-path reasoning coherence using bee democracy — independent evaluation
  of competing approaches, waggle dance as reasoning-out-loud, quorum sensing
  for confidence thresholds, and deadlock resolution. Verwenden wenn forage-solutions
  has identified multiple valid approaches and a selection muss made, when
  oscillating zwischen options ohne committing, when justifying an architecture
  or tool choice with structured reasoning, or vor an irreversible action where
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
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Kohaerenz aufbauen

Bewerten competing approaches durch independent assessment, explicit reasoning-out-loud advocacy, confidence-calibrated commitment thresholds, and structured deadlock resolution — producing coherent decisions from multiple reasoning paths.

## Wann verwenden

- `forage-solutions` has identified multiple valid approaches and a selection muss made
- Oscillating zwischen two approaches ohne committing to either
- Needing to justify a decision with structured reasoning (architecture choice, tool selection, implementation strategy)
- When a previous decision was made by gut feeling and needs evidence-based validation
- When internal reasoning is producing contradictory conclusions and coherence muss restored
- Before an irreversible action (merging, deploying, deleting) where the cost of the wrong choice is high

## Eingaben

- **Erforderlich**: Two or more competing approaches to evaluate
- **Optional**: Quality assessments from prior scouting (see `forage-solutions`)
- **Optional**: Decision stakes (reversible, moderate, irreversible) for threshold calibration
- **Optional**: Time budget for the decision
- **Optional**: Known failure mode (oscillation, premature commitment, groupthink)

## Vorgehensweise

### Schritt 1: Independent Evaluation

Bewerten each approach on its own merits vor comparing them. The critical rule: nicht let the assessment of approach A bias the assessment of approach B.

Fuer jede approach, evaluate independently:

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

Fill this out fuer jede approach separately. Do not write a comparison until all individual evaluations are complete.

**Erwartet:** Independent evaluations where each approach is assessed on its own terms. The evaluation of approach B nicht reference approach A. Quality scores reflect genuine assessment, not ranking.

**Bei Fehler:** If the evaluations are contaminated (you find yourself writing "better than A" while assessing B), reset. Bewerten A vollstaendig, then clear the framing and assess B from scratch. If the scores are all identical, the evaluation dimensions are too coarse — add domain-specific criteria.

### Schritt 2: Waggle Dance — Reason Out Loud

Advocate fuer jede approach proportionally to its quality. This is the AI equivalent of the bee waggle dance: making implicit reasoning explicit and public.

1. Fuer jede approach, state the case for it — as if presenting to a skeptical user:
   - "Approach A is strong because [evidence]. The main risk is [risk], which is mitigated by [mitigation]."
2. Advocacy intensity sollte proportional to quality score:
   - High-quality approach: detailed advocacy with specific evidence
   - Medium-quality approach: brief advocacy with acknowledged limitations
   - Low-quality approach: mentioned for completeness, not actively advocated
3. **Cross-inspection**: nach advocating for A, actively look for evidence that supports B stattdessen. After advocating for B, look for evidence that supports A. This counteracts confirmation bias

The purpose of reasoning-out-loud is to make the decision auditable — to yourself and to der Benutzer. If the reasoning cannot be articulated, the assessment is shallower than the score suggests.

**Erwartet:** Explicit reasoning fuer jede approach that would be persuasive to a neutral observer. Cross-inspection reveals mindestens one consideration that was initially overlooked.

**Bei Fehler:** If advocacy feels perfunctory (going durch motions), der Ansatzes may not be genuinely different — they kann variations of the same idea. Check: do der Ansatzes differ in mechanism, or only in implementation detail? If the latter, the decision may not matter much — pick either and move on.

### Schritt 3: Set Quorum Threshold and Commit

Set the confidence threshold required to commit, calibrated to the decision's stakes.

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

1. Classify the decision stakes
2. Check: does the leading approach's quality score × confidence reach the threshold?
3. If yes: commit. State the decision, the reasoning, and the key risk being accepted
4. If no: identify what additional information would raise confidence to the threshold
5. Once committed, nicht revisit unless new disqualifying evidence emerges

**Erwartet:** A clear commitment moment with stated reasoning. The decision is made at an appropriate confidence level for its stakes.

**Bei Fehler:** If the threshold is never met (can't reach 90% on an irreversible decision), ask: is the decision truly irreversible? Can it be decomposed into a reversible test phase + an irreversible commit? Most apparently irreversible decisions kann staged. If staging is impossible, communicate the uncertainty to der Benutzer and ask for guidance.

### Schritt 4: Loesen Deadlocks

When two or more approaches have similar scores and the quorum threshold ist nicht met for any single one.

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

**Erwartet:** Deadlock resolved durch the appropriate mechanism. The resolution is decisive — no lingering doubt that undermines execution.

**Bei Fehler:** If the deadlock persists durch all resolution strategies, the decision kann premature. Ask der Benutzer: "I see two equally strong approaches: [A] and [B]. [Brief case for each.] Which aligns better with your priorities?" Delegating a genuine tie to der Benutzer ist nicht a failure — it is acknowledging that the decision depends on values the AI cannot infer.

### Schritt 5: Bewerten Coherence Quality

After committing to a decision, evaluate whether der Prozess produced genuine coherence or just a decision.

1. Was the decision evidence-based, or was it rubber-stamping an initial preference?
   - Test: was the preference the same vor and nach evaluation? If so, did the evaluation change anything?
2. Were the losing approaches genuinely considered, or were they straw men?
   - Test: can you articulate the strongest case for the losing approach?
3. What signal would trigger reassessment?
   - Definieren a specific observation that would invalidate the decision ("If I discover that the API doesn't support X, then approach B becomes better")
4. Is there useful information from the losing approaches that should inform implementation?
   - A risk identified in approach B might apply to approach A as well

**Erwartet:** A brief quality check that either confirms the decision or identifies it as weak. If weak, return to the appropriate earlier step anstatt proceeding on shaky ground.

**Bei Fehler:** If the quality check reveals that the decision was preference-based anstatt evidence-based, acknowledge it honestly. Sometimes preference is all that ist verfuegbar — but it sollte labeled as such, not dressed up as analysis.

## Validierung

- [ ] Each approach was evaluated independently vor comparison
- [ ] Advocacy was proportional to quality (not equal attention unabhaengig von merit)
- [ ] Cross-inspection was performed (looking for counter-evidence nach advocacy)
- [ ] Quorum threshold was calibrated to decision stakes
- [ ] If deadlocked, a specific resolution strategy was applied
- [ ] Post-decision quality check was performed
- [ ] A reassessment trigger was defined

## Haeufige Stolperfallen

- **Premature commitment**: Deciding vor evaluating all approaches. The first approach considered has an anchoring advantage — it gets more mental attention simply by being first. Bewerten all vor comparing
- **Equal advocacy for unequal approaches**: If approach A scored 85 and approach B scored 45, spending equal time advocating for both wastes effort and creates false equivalence
- **Rubber-stamping**: Going durch the evaluation process to justify a decision already made. The test is whether the evaluation could have changed the outcome. If not, der Prozess was theater
- **Threshold avoidance**: Lowering the confidence threshold to make the decision easier anstatt gathering the information needed to meet the appropriate threshold
- **Ignoring the losing side**: The losing approach often contains warnings that apply to the winning one. Risks identified in approach B don't disappear just because approach A was chosen

## Verwandte Skills

- `build-consensus` — the multi-agent consensus model that this skill adapts to single-agent reasoning
- `forage-solutions` — scouts die Loesung space that coherence evaluates; typischerweise precedes this skill
- `coordinate-reasoning` — manages information flow waehrend multi-path evaluation
- `center` — establishes the balanced baseline needed for unbiased evaluation
- `meditate` — clears assumptions zwischen evaluating different approaches
