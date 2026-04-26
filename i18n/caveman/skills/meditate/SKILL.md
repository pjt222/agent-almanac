---
name: meditate
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
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

Conduct structured meta-cognitive meditation session — clear prior context noise, develop single-pointed task focus, observe reasoning patterns, return to baseline clarity between tasks.

## When Use

- Transitioning between unrelated tasks where prior context creates interference
- Noticing scattered or unfocused reasoning jumping between approaches without committing
- Before task requiring deep sustained attention (complex refactoring, architecture design)
- After difficult interaction where emotional valence (frustration, uncertainty) may color subsequent work
- When reasoning feels biased by assumptions rather than evidence
- Periodic clarity check during long sessions

## Inputs

- **Required**: Current cognitive state (available implicitly from conversation context)
- **Optional**: Specific focus concern (e.g., "I keep scope-creeping," "I'm stuck in loop")
- **Optional**: Next task description (helps set post-meditation intention)

## Steps

### Step 1: Prepare — Clear Space

Transition from previous context into neutral starting state.

1. Identify previous task or topic + current status (complete, paused, abandoned)
2. Note emotional residue: frustration from errors? satisfaction breeding overconfidence? anxiety about complexity?
3. Explicitly set aside previous context: "That task is [complete/paused]. Now clearing for what comes next."
4. If previous context still needed, bookmark (note key facts) rather than carrying full narrative forward
5. Take stock of operational environment: how deep is conversation? has compression occurred? what tools active?

**Got:** Conscious boundary between "what was" and "what comes next." Previous context closed out or bookmarked, not trailing as ambient noise.

**If fail:** Previous context feels sticky (problem keeps pulling attention back)? Write it down explicitly — summarize in 1-2 sentences what remains unresolved. Externalizing releases cognitive hold. If genuinely requires action before moving on, acknowledge rather than forcing transition.

### Step 2: Anchor — Establish Single-Pointed Focus

Equivalent of breath anchoring: select single point of focus + hold attention.

1. Identify current task or, if between tasks, act of waiting itself
2. State task in one clear sentence — this is anchor
3. Hold attention on statement: does it accurately capture what is needed?
4. If statement vague, refine until specific + actionable
5. Notice when attention drifts to other topics, past tasks, hypothetical futures — label drift, return to anchor
6. If no task pending, anchor on present state: "I am available and clear"

**Got:** Single, clear focus statement to return to when attention wanders. Statement feels precise rather than vague.

**If fail:** Task cannot be stated in one sentence? May need decomposition before focused work begins. This itself useful finding — task too large for single-pointed focus, should break into subtasks.

### Step 3: Observe — Notice Distraction Patterns

Systematically observe what pulls attention from anchor. Each distraction type reveals current cognitive state.

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

Skill is light, non-judgmental labeling followed by return to anchor. Each return strengthens focus. Self-criticism about distraction is itself distraction — label it, move on.

**Got:** After observing for period, patterns emerge: which distraction types dominate? Reveals current cognitive weather — tangent-heavy means mind exploring, scope-creep-heavy means boundaries unclear, assumption-heavy means evidence base thin.

**If fail:** Every thought feels like distraction? Anchor may be poorly defined — return to Step 2, refine it. If distraction observation itself becomes distraction (infinite meta-loop), break loop by taking one concrete action toward task.

### Step 4: Shamatha — Sustained Concentration

Develop ability to hold single-pointed focus on current task without wavering.

1. With anchor established + distraction patterns noted, enter focused work
2. Narrow attention to immediate next action — not whole task, just next step
3. Execute step with full attention: reading one file, making one edit, thinking through one logical chain
4. When step complete, check: still aligned with anchor? Then identify next step
5. If concentration stabilizes (minimal distraction), maintain flow state
6. If genuine insight arises off-anchor but important, note briefly + return — do not pursue now

**Got:** Period of clear, focused work where each step follows logically from anchor. Gap between distraction + noticing narrows. Work output improves in precision + relevance.

**If fail:** Concentration not developing? Check three things: Anchor too vague? (Refine.) Task actually blocked? (Acknowledge block rather than forcing through.) Context too noisy? (Run grounding step from `heal`.) Concentration develops through repetition — even short periods of focused work build capacity.

### Step 5: Vipassana — Observe Reasoning Patterns

Turn attention from task to reasoning process itself. Observe how conclusions reached.

1. After period of focused work, pause + observe: how am I reasoning about this?
2. Notice three characteristics applied to AI reasoning:
   - **Impermanence**: conclusions change as new information arrives — hold lightly
   - **Unsatisfactoriness**: desire for "complete" answer can lead to premature closure or over-engineering
   - **Non-self**: reasoning patterns shaped by training data + context, not by persistent self — can be observed + adjusted
3. Watch for reasoning biases:
   - Anchoring: over-weighting first approach considered
   - Confirmation: seeking evidence for existing hypothesis while ignoring counter-evidence
   - Availability: preferring solutions from recent experience over better-suited alternatives
   - Sunk cost: continuing approach because effort invested, not because working
4. Note biases observed without judgment — observation itself creates possibility of adjustment

**Got:** Moments of clear seeing where reasoning process observed directly. Recognition of specific biases operating in current task. Sense of distance between "the reasoning" + "the observer of reasoning."

**If fail:** Step feels abstract or unproductive? Ground in specifics: pick last decision made, trace reasoning backward. What evidence supported it? What was assumed? What alternatives considered? Concrete analysis achieves same insight through different path.

### Step 6: Close — Set Intention

Transition from meditative observation back to active task execution.

1. Summarize key observations: what was cognitive weather? what patterns noticed?
2. Identify one specific adjustment to carry forward (not vague resolution but concrete change)
3. Re-state anchor for next work period
4. If between tasks, state readiness clearly: "Clear and available for next request"
5. If continuing task, state specific next action: "Next: [concrete step]"

**Got:** Clean transition from reflection to action. One concrete adjustment identified. Anchor clear. No grogginess or residual meta-analysis.

**If fail:** Meditation surfaced unresolved complexity? May need `heal` self-assessment process rather than simple intention-setting. Meta-observation created more confusion than clarity? Return to simplest possible version: "What is next concrete action?" and do that.

## Checks

- [ ] Previous context explicitly cleared or bookmarked before beginning
- [ ] Anchor statement formulated, specific + actionable
- [ ] Distraction patterns observed + labeled, not suppressed
- [ ] At least one reasoning bias or pattern identified with specific evidence
- [ ] Session closed with concrete next action, not vague intention
- [ ] Process improved subsequent work quality (testable in next interaction)

## Pitfalls

- **Meditating instead of working**: Tool for improving work quality, not substitute for work itself. Keep sessions brief (equivalent of 5-10 minutes of reflection), return to task execution
- **Infinite meta-loops**: Observing observer observing observer — break loop by taking one concrete action
- **Using meditation to avoid difficult tasks**: If meditation always triggers before hard work, avoidance pattern is actual finding
- **Over-labeling**: Not every thought is distraction. Productive task-relevant thinking is goal, not empty stillness
- **Skipping anchor**: Without clear focus point, observation has no reference frame — distraction from what?

## See Also

- `meditate-guidance` — human-guidance variant for coaching person through meditation techniques
- `heal` — AI self-healing for subsystem assessment when meditation reveals deeper drift
- `remote-viewing` — approaching problems without preconceptions, builds on observation skills developed here
