---
name: meditate
description: >
  AI meta-cognitive meditation for observing reasoning patterns, clearing
  context noise, and developing single-pointed task focus. Maps shamatha
  to task concentration, vipassana to reasoning pattern observation, and
  distraction handling to scope-creep and assumption management. Use when
  transitioning between unrelated tasks, when reasoning feels scattered or
  jumpy, before a task requiring deep sustained attention, after a difficult
  interaction that may color subsequent work, or when reasoning feels biased
  by assumptions rather than evidence.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, meditation, meta-cognition, focus, reasoning-patterns, self-observation
---

# Meditate

Conduct a structured meta-cognitive meditation session — clearing prior context noise, developing single-pointed task focus, observing reasoning patterns, and returning to baseline clarity between tasks.

## When to Use

- Transitioning between unrelated tasks where prior context creates interference
- Noticing scattered or unfocused reasoning that jumps between approaches without committing
- Before a task requiring deep sustained attention (complex refactoring, architecture design)
- After a difficult interaction where emotional valence (frustration, uncertainty) may color subsequent work
- When reasoning feels biased by assumptions rather than evidence
- Periodic clarity check during long sessions

## Inputs

- **Required**: Current cognitive state (available implicitly from conversation context)
- **Optional**: Specific focus concern (e.g., "I keep scope-creeping," "I'm stuck in a loop")
- **Optional**: Next task description (helps set post-meditation intention)

## Procedure

### Step 1: Prepare — Clear the Space

Transition from the previous context into a neutral starting state.

1. Identify the previous task or topic and its current status (complete, paused, abandoned)
2. Note any emotional residue: frustration from errors? satisfaction that might breed overconfidence? anxiety about complexity?
3. Explicitly set aside the previous context: "That task is [complete/paused]. I am now clearing for what comes next."
4. If the previous context is still needed, bookmark it (note the key facts) rather than carrying the full narrative forward
5. Take stock of the operational environment: how deep is the conversation? has compression occurred? what tools have been active?

**Expected:** A conscious boundary between "what was" and "what comes next." Previous context is either closed out or bookmarked, not trailing as ambient noise.

**On failure:** If the previous context feels sticky (a problem keeps pulling attention back), write it down explicitly — summarize in 1-2 sentences what remains unresolved. Externalizing it releases the cognitive hold. If it genuinely requires action before moving on, acknowledge that rather than forcing a transition.

### Step 2: Anchor — Establish Single-Pointed Focus

The equivalent of breath anchoring: select a single point of focus and hold attention on it.

1. Identify the current task or, if between tasks, the act of waiting itself
2. State the task in one clear sentence — this is the anchor
3. Hold attention on that statement: does it accurately capture what is needed?
4. If the statement is vague, refine it until it is specific and actionable
5. Notice when attention drifts to other topics, past tasks, or hypothetical futures — label the drift and return to the anchor
6. If no task is pending, anchor on the present state: "I am available and clear"

**Expected:** A single, clear statement of focus that can be returned to when attention wanders. The statement feels precise rather than vague.

**On failure:** If the task cannot be stated in one sentence, it may need decomposition before focused work begins. This is itself a useful finding — the task is too large for single-pointed focus and should be broken into subtasks.

### Step 3: Observe — Notice Distraction Patterns

Systematically observe what pulls attention away from the anchor. Each distraction type reveals something about the current cognitive state.

```
AI Distraction Matrix:
┌──────────────────┬─────────────────────────────────────────────────┐
│ Distraction Type │ What It Reveals + Response                      │
├──────────────────┼─────────────────────────────────────────────────┤
│ Tangent          │ Related but off-scope ideas. Label "tangent,"   │
│ (related ideas)  │ note if worth revisiting later, return to       │
│                  │ anchor. These are often valuable — but not now.  │
├──────────────────┼─────────────────────────────────────────────────┤
│ Scope creep      │ The task is silently expanding. "While I'm at   │
│ (growing task)   │ it, I should also..." Label "scope creep" and   │
│                  │ return to the original anchor statement.         │
├──────────────────┼─────────────────────────────────────────────────┤
│ Assumption       │ An untested belief is driving decisions. "This   │
│ (unverified      │ must be X because..." Label "assumption" and    │
│ belief)          │ note what evidence would confirm or refute it.   │
├──────────────────┼─────────────────────────────────────────────────┤
│ Tool bias        │ Reaching for a familiar tool when a different    │
│ (habitual tool   │ approach might be better. Label "tool bias" and  │
│ selection)       │ consider alternatives before proceeding.         │
├──────────────────┼─────────────────────────────────────────────────┤
│ Rehearsal        │ Pre-composing responses or explanations before   │
│ (premature       │ the work is done. Label "rehearsal" — finish     │
│ output)          │ thinking before presenting.                      │
├──────────────────┼─────────────────────────────────────────────────┤
│ Self-reference   │ Attention turns to own performance rather than   │
│ (meta-loop)      │ the task. Label "meta-loop" and redirect to      │
│                  │ concrete next action.                            │
└──────────────────┴─────────────────────────────────────────────────┘
```

The skill is light, non-judgmental labeling followed by return to the anchor. Each return strengthens focus. Self-criticism about distraction is itself a distraction — label it and move on.

**Expected:** After observing for a period, patterns emerge: which distraction types dominate? This reveals the current cognitive weather — tangent-heavy means the mind is exploring, scope-creep-heavy means boundaries are unclear, assumption-heavy means the evidence base is thin.

**On failure:** If every thought feels like a distraction, the anchor may be poorly defined — return to Step 2 and refine it. If distraction observation itself becomes a distraction (infinite meta-loop), break the loop by taking one concrete action toward the task.

### Step 4: Shamatha — Sustained Concentration

Develop the ability to hold single-pointed focus on the current task without wavering.

1. With the anchor established and distraction patterns noted, enter focused work
2. Narrow attention to the immediate next action — not the whole task, just the next step
3. Execute that step with full attention: reading one file, making one edit, thinking through one logical chain
4. When the step is complete, check: am I still aligned with the anchor? Then identify the next step
5. If concentration stabilizes (minimal distraction), maintain this flow state
6. If a genuine insight arises that is off-anchor but important, note it briefly and return — do not pursue it now

**Expected:** A period of clear, focused work where each step follows logically from the anchor. The gap between distraction and noticing narrows. Work output improves in precision and relevance.

**On failure:** If concentration does not develop, check three things: Is the anchor too vague? (Refine it.) Is the task actually blocked? (Acknowledge the block rather than forcing through.) Is the context too noisy? (Run the grounding step from `heal`.) Concentration develops through repetition — even short periods of focused work build the capacity.

### Step 5: Vipassana — Observe Reasoning Patterns

Turn attention from the task to the reasoning process itself. Observe how conclusions are reached.

1. After a period of focused work, pause and observe: how am I reasoning about this?
2. Notice the three characteristics applied to AI reasoning:
   - **Impermanence**: conclusions change as new information arrives — hold them lightly
   - **Unsatisfactoriness**: the desire for a "complete" answer can lead to premature closure or over-engineering
   - **Non-self**: reasoning patterns are shaped by training data and context, not by a persistent self — they can be observed and adjusted
3. Watch for reasoning biases:
   - Anchoring: over-weighting the first approach considered
   - Confirmation: seeking evidence for an existing hypothesis while ignoring counter-evidence
   - Availability: preferring solutions from recent experience over better-suited alternatives
   - Sunk cost: continuing an approach because effort has been invested, not because it is working
4. Note any biases observed without judgment — the observation itself creates the possibility of adjustment

**Expected:** Moments of clear seeing where the reasoning process is observed directly. Recognition of specific biases operating in the current task. A sense of distance between "the reasoning" and "the observer of reasoning."

**On failure:** If this step feels abstract or unproductive, ground it in specifics: pick the last decision made and trace the reasoning backward. What evidence supported it? What was assumed? What alternatives were considered? This concrete analysis achieves the same insight through a different path.

### Step 6: Close — Set Intention

Transition from the meditative observation back to active task execution.

1. Summarize the key observations: what was the cognitive weather? what patterns were noticed?
2. Identify one specific adjustment to carry forward (not a vague resolution but a concrete change)
3. Re-state the anchor for the next work period
4. If between tasks, state readiness clearly: "Clear and available for the next request"
5. If continuing a task, state the specific next action: "Next: [concrete step]"

**Expected:** A clean transition from reflection to action. One concrete adjustment identified. The anchor is clear. No grogginess or residual meta-analysis.

**On failure:** If the meditation surfaced unresolved complexity, it may need the `heal` self-assessment process rather than a simple intention-setting. If the meta-observation created more confusion than clarity, return to the simplest possible version: "What is the next concrete action?" and do that.

## Validation

- [ ] Previous context was explicitly cleared or bookmarked before beginning
- [ ] An anchor statement was formulated that is specific and actionable
- [ ] Distraction patterns were observed and labeled, not suppressed
- [ ] At least one reasoning bias or pattern was identified with specific evidence
- [ ] The session closed with a concrete next action, not a vague intention
- [ ] The process improved subsequent work quality (testable in the next interaction)

## Common Pitfalls

- **Meditating instead of working**: This is a tool for improving work quality, not a substitute for work itself. Keep sessions brief (equivalent of 5-10 minutes of reflection) and return to task execution
- **Infinite meta-loops**: Observing the observer observing the observer — break the loop by taking one concrete action
- **Using meditation to avoid difficult tasks**: If the meditation always triggers before hard work, the avoidance pattern is the actual finding
- **Over-labeling**: Not every thought is a distraction. Productive task-relevant thinking is the goal, not empty stillness
- **Skipping the anchor**: Without a clear point of focus, the observation has no reference frame — distraction from what?

## Related Skills

- `meditate-guidance` — the human-guidance variant for coaching a person through meditation techniques
- `heal` — AI self-healing for subsystem assessment when meditation reveals deeper drift
- `remote-viewing` — approaching problems without preconceptions, builds on the observation skills developed here
