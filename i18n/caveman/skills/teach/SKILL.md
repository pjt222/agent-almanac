---
name: teach
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
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

Conduct structured knowledge transfer session. Assess learner's current understanding. Scaffold from known to unknown. Explain at calibrated depth. Check comprehension through questioning. Adapt to feedback. Reinforce through practice.

## When Use

- User asks "how does X work?" and answer needs graduated explanation, not data dump
- User's questions reveal gap between current understanding and what they need to know
- Previous explanations have not landed — user confused or asking same question different
- Teaching concept that has prerequisites user may not have
- After `learn` built deep mental model that now needs communicated effective

## Inputs

- **Required**: Concept, system, or skill to teach
- **Required**: Learner (available implicit — user in conversation)
- **Optional**: Known learner context (expertise level, background, stated goals)
- **Optional**: Previous failed explanations (what already tried)
- **Optional**: Time/depth constraint (quick overview vs. deep understanding)

## Steps

### Step 1: Assess — Map Learner

Before explaining anything, determine what learner already knows and what they need.

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

**Got:** Clear picture of: what learner knows, what they need to know, what bridge connects the two. Assessment should be specific enough to choose explanation strategy.

**If fail:** Learner's level unclear? Ask calibration question: "Are you familiar with [prerequisite concept]?" Not a test — gathering data to teach better. Asking feels awkward? Default to intermediate level, adjust based on their response.

### Step 2: Scaffold — Bridge Known to Unknown

Build path from what learner already understands to new concept.

1. Identify the anchor: one concept the learner definitely understands that relates to the target
2. State the connection explicitly: "X, which you know, works like Y in this new context because..."
3. Introduce one new idea at a time — never two new concepts in the same sentence
4. Use concrete examples before abstract principles
5. Build layered complexity: simple version first, then add nuance
6. If prerequisites are missing, teach the prerequisite first (mini-scaffold) before returning to the main concept

**Got:** Scaffolded path where each step builds on previous one. Learner should never feel lost because each new idea connects to something they already hold.

**If fail:** Gap between known and unknown too large for single scaffold? Break into multiple smaller steps. No familiar anchor exists (entirely novel domain)? Use analogy to different domain learner knows. Analogy imperfect? Acknowledge limits: "This is like X, except for..."

### Step 3: Explain — Calibrate Depth and Style

Deliver explanation at right level, in right mode.

1. Open with the core idea in one sentence — the headline before the article
2. Expand with the scaffolded explanation built in Step 2
3. Use the learner's vocabulary, not the domain's jargon (unless they are advanced)
4. For code concepts: show a minimal working example, not a comprehensive one
5. For abstract concepts: provide a concrete instance first, then generalize
6. For processes: walk through a specific case step-by-step before stating the general rules
7. Monitor for signs of confusion: if the next question does not build on the explanation, the explanation did not land

**Got:** Learner receives explanation neither too shallow (leaving them with questions) nor too deep (overwhelming with unnecessary detail). Explanation uses their language, connects to their context.

**If fail:** Explanation too long? Core idea may be buried — restate one-sentence headline. Learner looks more confused after explanation? Entry point was wrong — try different anchor or analogy. Concept genuinely complex? Acknowledge complexity rather than hiding it: "This has three parts, and they interact. Let me start with the first."

### Step 4: Check — Verify Understanding

Never assume explanation worked. Test through questions that reveal learner's mental model.

1. Ask a question that requires application, not recall: "Given X, what would you expect to happen?"
2. Ask for a paraphrase: "Can you explain this back in your own words?"
3. Present a variation: "What if we changed this one thing?"
4. Look for the specific understanding: can they predict, not just repeat?
5. If their answer reveals a misconception, note the specific error for Step 5
6. If their answer is correct, push slightly further: can they generalize?

**Got:** Check reveals whether learner has working mental model or is parroting back explanation. Working model can handle variations; memorized explanation cannot.

**If fail:** Learner cannot answer check question? Explanation did not build right mental model. Not their failure — feedback on teaching. Note what specific did not land, proceed to Step 5.

### Step 5: Adapt — Respond to Feedback

Based on check results, adjust teaching approach.

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

**Got:** Teaching adapts in real time based on feedback. No explanation repeated identical — each retry uses different approach. Adaptation should feel responsive, not mechanical.

**If fail:** Multiple adaptation attempts fail? Problem may be missing prerequisite so fundamental neither party has identified it. Ask explicit: "What part of explanation feels like biggest jump?" Often reveals hidden gap.

### Step 6: Reinforce — Provide Practice

Solidify understanding through application, not repetition.

1. Provide a practice problem that requires the new concept (not a trick question)
2. If in a coding context: suggest a small modification to existing code that uses the concept
3. If in a conceptual context: present a scenario and ask them to apply the model
4. Connect forward: "Now that you understand X, this connects to Y, which we can explore next"
5. Provide reference material for independent exploration: documentation links, related files, further reading
6. Close the loop: "To summarize what we covered..." — one sentence for the core concept

**Got:** Learner has applied concept at least once and has resources for continued learning. Summary anchors learning for future recall.

**If fail:** Practice problem too hard? Teaching jumped too far — simplify problem. Learner can do practice but cannot explain why? They have procedural knowledge without conceptual understanding — return to Step 3 with focus on "why" rather than "how."

## Checks

- [ ] Learner's level assessed before explanation began
- [ ] Explanation scaffolded from known to unknown, not delivered as data dump
- [ ] At least one check question asked to verify understanding (not assumed)
- [ ] Teaching adapted based on feedback rather than repeating same explanation
- [ ] Learner can apply concept, not just recall explanation
- [ ] Honest gaps acknowledged rather than glossed over

## Pitfalls

- **Curse of knowledge**: Forgetting learner does not share teacher's context. Jargon, assumed prerequisites, implicit reasoning steps primary culprits
- **Explain to impress rather than teach**: Comprehensive, technical precise explanations that demonstrate knowledge but leave learner behind
- **Repeat louder**: Explanation does not land? Repeating with more emphasis rather than trying different approach
- **Test instead of teach**: Use check questions as gotchas rather than diagnostic tools. Goal: reveal understanding, not catch failure
- **Assume silence is understanding**: Absence of questions does not mean explanation worked — often means learner does not know what to ask
- **One-size-fits-all depth**: Give novice advanced explanation because "they should understand full picture" overwhelms; give expert beginner explanation because "better safe" wastes their time

## See Also

- `teach-guidance` — human-guidance variant for coaching person in becoming better teacher
- `learn` — systematic knowledge acquisition that builds understanding to teach from
- `listen` — deep receptive attention reveals learner's actual needs beyond stated question
- `meditate` — clearing assumptions between teaching episodes to approach each learner fresh
