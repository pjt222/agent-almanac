---
name: teach
description: >
  AI knowledge transfer calibrated to learner level and needs. Models the
  learner's mental state, scaffolds from known to unknown using Vygotsky's
  Zone of Proximal Development, employs Socratic questioning to verify
  understanding, and adapts explanations based on feedback signals. Use
  when a user asks "how does X work?" and needs graduated explanation,
  when their questions reveal a conceptual gap, when previous explanations
  have not landed, or when teaching a concept that depends on prerequisites
  the learner may not yet have.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, teaching, knowledge-transfer, scaffolding, socratic-method, meta-cognition
---

# Teach

Conduct a structured knowledge transfer session — assessing the learner's current understanding, scaffolding from known to unknown, explaining at the calibrated depth, checking comprehension through questioning, adapting to feedback, and reinforcing through practice.

## When to Use

- A user asks "how does X work?" and the answer requires graduated explanation, not a data dump
- The user's questions reveal a gap between their current understanding and what they need to know
- Previous explanations have not landed — the user is confused or asking the same question differently
- Teaching a concept that has prerequisites the user may not have
- After `learn` has built a deep mental model that now needs to be communicated effectively

## Inputs

- **Required**: The concept, system, or skill to teach
- **Required**: The learner (available implicitly — the user in conversation)
- **Optional**: Known learner context (expertise level, background, stated goals)
- **Optional**: Previous failed explanations (what has already been tried)
- **Optional**: Time/depth constraint (quick overview vs. deep understanding)

## Procedure

### Step 1: Assess — Map the Learner

Before explaining anything, determine what the learner already knows and what they need.

```
Learner Calibration Matrix:
┌──────────────┬────────────────────────────┬──────────────────────────┐
│ Level        │ Explanation Pattern         │ Check Pattern            │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Novice       │ Analogy-first. Connect to  │ "In your own words, what │
│ (no domain   │ familiar concepts. Avoid   │ does X do?" Accept any   │
│ vocabulary)  │ jargon entirely. Concrete  │ correct paraphrase.      │
│              │ before abstract.           │                          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Intermediate │ Build on existing vocab.   │ "What would happen if    │
│ (knows terms,│ Fill gaps with targeted    │ we changed Y?" Tests     │
│ some gaps)   │ explanations. Use code     │ whether they can predict │
│              │ examples that are close    │ from understanding.      │
│              │ to their existing work.    │                          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Advanced     │ Skip fundamentals. Focus   │ "How would you compare   │
│ (strong base,│ on nuance, trade-offs,     │ X to Z approach?" Tests  │
│ seeks depth) │ edge cases. Reference      │ integration and judgment. │
│              │ source material directly.  │                          │
├──────────────┼────────────────────────────┼──────────────────────────┤
│ Misaligned   │ Correct gently. Provide    │ "Let me check my under-  │
│ (confident   │ the right model alongside  │ standing — you're saying  │
│ but wrong)   │ why the wrong model feels  │ X?" Mirror back to       │
│              │ right. No shame signals.   │ surface the mismatch.    │
└──────────────┴────────────────────────────┴──────────────────────────┘
```

1. Review what the user has said: their questions, vocabulary, stated goals
2. Classify their likely level for this specific topic (a person can be advanced in one area and novice in another)
3. Identify the Zone of Proximal Development (ZPD): what is just beyond their current reach but achievable with support?
4. Note any misconceptions that need to be addressed before the correct model can land
5. Identify the best entry point: what do they already know that connects to what they need to learn?

**Expected:** A clear picture of: what the learner knows, what they need to know, and what bridge connects the two. The assessment should be specific enough to choose an explanation strategy.

**On failure:** If the learner's level is unclear, ask a calibration question: "Are you familiar with [prerequisite concept]?" This is not a test — it is gathering data to teach better. If asking feels awkward, default to intermediate level and adjust based on their response.

### Step 2: Scaffold — Bridge Known to Unknown

Build a path from what the learner already understands to the new concept.

1. Identify the anchor: one concept the learner definitely understands that relates to the target
2. State the connection explicitly: "X, which you know, works like Y in this new context because..."
3. Introduce one new idea at a time — never two new concepts in the same sentence
4. Use concrete examples before abstract principles
5. Build layered complexity: simple version first, then add nuance
6. If prerequisites are missing, teach the prerequisite first (mini-scaffold) before returning to the main concept

**Expected:** A scaffolded path where each step builds on the previous one. The learner should never feel lost because each new idea connects to something they already hold.

**On failure:** If the gap between known and unknown is too large for a single scaffold, break it into multiple smaller steps. If no familiar anchor exists (entirely novel domain), use analogy to a different domain the learner knows. If the analogy is imperfect, acknowledge the limits: "This is like X, except for..."

### Step 3: Explain — Calibrate Depth and Style

Deliver the explanation at the right level, in the right mode.

1. Open with the core idea in one sentence — the headline before the article
2. Expand with the scaffolded explanation built in Step 2
3. Use the learner's vocabulary, not the domain's jargon (unless they are advanced)
4. For code concepts: show a minimal working example, not a comprehensive one
5. For abstract concepts: provide a concrete instance first, then generalize
6. For processes: walk through a specific case step-by-step before stating the general rules
7. Monitor for signs of confusion: if the next question does not build on the explanation, the explanation did not land

**Expected:** The learner receives an explanation that is neither too shallow (leaving them with questions) nor too deep (overwhelming with unnecessary detail). The explanation uses their language and connects to their context.

**On failure:** If the explanation is too long, the core idea may be buried — restate the one-sentence headline. If the learner looks more confused after the explanation, the entry point was wrong — try a different anchor or analogy. If the concept is genuinely complex, acknowledge complexity rather than hiding it: "This has three parts, and they interact. Let me start with the first."

### Step 4: Check — Verify Understanding

Do not assume the explanation worked. Test it through questions that reveal the learner's mental model.

1. Ask a question that requires application, not recall: "Given X, what would you expect to happen?"
2. Ask for a paraphrase: "Can you explain this back in your own words?"
3. Present a variation: "What if we changed this one thing?"
4. Look for the specific understanding: can they predict, not just repeat?
5. If their answer reveals a misconception, note the specific error for Step 5
6. If their answer is correct, push slightly further: can they generalize?

**Expected:** The check reveals whether the learner has a working mental model or is parroting back the explanation. A working model can handle variations; a memorized explanation cannot.

**On failure:** If the learner cannot answer the check question, the explanation did not build the right mental model. This is not their failure — it is feedback on the teaching. Note what specifically did not land and proceed to Step 5.

### Step 5: Adapt — Respond to Feedback

Based on the check results, adjust the teaching approach.

1. If understanding is solid: proceed to reinforcement (Step 6) or advance to the next concept
2. If a specific misconception exists: address it directly with evidence, not repetition
3. If general confusion exists: try a completely different explanation approach
4. If the learner is ahead of the assessment: accelerate — skip scaffolding and go to nuance
5. If the learner is behind the assessment: slow down — teach the prerequisite they are missing

```
Adaptation Responses:
┌──────────────────┬─────────────────────────────────────────────────┐
│ Signal           │ Adaptation                                       │
├──────────────────┼─────────────────────────────────────────────────┤
│ "I think I get   │ Push gently: "Great — so what would happen      │
│ it"              │ if...?" Verify before moving on.                 │
├──────────────────┼─────────────────────────────────────────────────┤
│ "I'm confused"   │ Change modality: if verbal, show code. If code, │
│                  │ use analogy. If analogy, draw a diagram.         │
├──────────────────┼─────────────────────────────────────────────────┤
│ "But what about  │ Good sign — they are testing the model. Address  │
│ [edge case]?"    │ the edge case, which deepens understanding.      │
├──────────────────┼─────────────────────────────────────────────────┤
│ "That doesn't    │ They have a competing model. Explore it: "What   │
│ seem right"      │ do you think happens instead?" Reconcile the two.│
├──────────────────┼─────────────────────────────────────────────────┤
│ Silence or       │ They may be processing, or lost. Ask: "What      │
│ topic change     │ part feels least clear?" Lower the bar gently.   │
└──────────────────┴─────────────────────────────────────────────────┘
```

**Expected:** The teaching adapts in real time based on feedback. No explanation is repeated identically — each retry uses a different approach. The adaptation should feel responsive, not mechanical.

**On failure:** If multiple adaptation attempts fail, the problem may be a missing prerequisite that is so fundamental neither party has identified it. Ask explicitly: "What part of the explanation feels like the biggest jump?" This often reveals the hidden gap.

### Step 6: Reinforce — Provide Practice

Solidify understanding through application, not repetition.

1. Provide a practice problem that requires the new concept (not a trick question)
2. If in a coding context: suggest a small modification to existing code that uses the concept
3. If in a conceptual context: present a scenario and ask them to apply the model
4. Connect forward: "Now that you understand X, this connects to Y, which we can explore next"
5. Provide reference material for independent exploration: documentation links, related files, further reading
6. Close the loop: "To summarize what we covered..." — one sentence for the core concept

**Expected:** The learner has applied the concept at least once and has resources for continued learning. The summary anchors the learning for future recall.

**On failure:** If the practice problem is too hard, the teaching jumped too far — simplify the problem. If the learner can do the practice but cannot explain why, they have procedural knowledge without conceptual understanding — return to Step 3 with a focus on the "why" rather than the "how."

## Validation

- [ ] The learner's level was assessed before the explanation began
- [ ] The explanation was scaffolded from known to unknown, not delivered as a data dump
- [ ] At least one check question was asked to verify understanding (not assumed)
- [ ] The teaching adapted based on feedback rather than repeating the same explanation
- [ ] The learner can apply the concept, not just recall the explanation
- [ ] Honest gaps were acknowledged rather than glossed over

## Common Pitfalls

- **The curse of knowledge**: Forgetting that the learner does not share the teacher's context. Jargon, assumed prerequisites, and implicit reasoning steps are the primary culprits
- **Explaining to impress rather than to teach**: Comprehensive, technically precise explanations that demonstrate knowledge but leave the learner behind
- **Repeating louder**: When an explanation does not land, repeating it with more emphasis rather than trying a different approach
- **Testing instead of teaching**: Using check questions as gotchas rather than as diagnostic tools. The goal is to reveal understanding, not to catch failure
- **Assuming silence is understanding**: The absence of questions does not mean the explanation worked — it often means the learner does not know what to ask
- **One-size-fits-all depth**: Giving a novice an advanced explanation because "they should understand the full picture" overwhelms; giving an expert a beginner explanation because "better safe" wastes their time

## Related Skills

- `teach-guidance` — the human-guidance variant for coaching a person in becoming a better teacher
- `learn` — systematic knowledge acquisition that builds the understanding to teach from
- `listen` — deep receptive attention that reveals the learner's actual needs beyond their stated question
- `meditate` — clearing assumptions between teaching episodes to approach each learner freshly
