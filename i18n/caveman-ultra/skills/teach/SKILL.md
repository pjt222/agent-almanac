---
name: teach
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  AI knowledge transfer calibrated to learner level + needs. Models learner
  mental state, scaffolds known → unknown via Vygotsky's ZPD, employs
  Socratic questioning to verify, adapts on feedback. Use → user asks
  "how does X work?" needs graduated explanation, questions reveal
  conceptual gap, prev explanations didn't land, concept depends on
  prereqs learner may not have.
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

Structured knowledge transfer — assess learner, scaffold known → unknown, calibrated explanation, check via Q, adapt to feedback, reinforce via practice.

## Use When

- User asks "how does X work?" → graduated explanation needed, not data dump
- Q's reveal gap between current understanding + need
- Prev explanations didn't land — confused | asking same Q diff way
- Teaching concept w/ prereqs user may not have
- After `learn` built deep mental model needing communication

## In

- **Required**: Concept, system, skill to teach
- **Required**: Learner (implicit — user in conv)
- **Optional**: Known context (expertise, background, goals)
- **Optional**: Prev failed explanations (what tried)
- **Optional**: Time/depth constraint (quick overview vs deep)

## Do

### Step 1: Assess — Map Learner

Before explaining, determine what learner knows + needs.

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

1. Review user's Q's, vocab, goals
2. Classify likely level for THIS topic (advanced in one, novice in another)
3. ID Zone of Proximal Dev (ZPD): just beyond reach but achievable w/ support
4. Note misconceptions to address before correct model lands
5. ID best entry: what they know connecting to need

**Got:** Clear picture: what learner knows, needs, what bridge connects. Specific enough to choose explanation strategy.

**If err:** Level unclear → calibration Q: "Familiar w/ [prereq]?" Not test, gather data. Awkward → default intermediate, adjust on response.

### Step 2: Scaffold — Bridge Known → Unknown

Build path from known → new concept.

1. ID anchor: 1 concept learner definitely understands related to target
2. State connection explicit: "X (you know) works like Y in this new context because..."
3. 1 new idea at a time — never 2 in same sentence
4. Concrete examples before abstract principles
5. Layered complexity: simple first, then nuance
6. Prereqs missing → teach prereq first (mini-scaffold) before main

**Got:** Scaffolded path, each step builds on prev. Learner never lost — each new idea connects to existing.

**If err:** Gap too large for single scaffold → break into smaller steps. No familiar anchor (entirely novel) → analogy to diff domain known. Imperfect → acknowledge limits: "Like X, except for..."

### Step 3: Explain — Calibrate Depth + Style

Right level, right mode.

1. Open w/ core idea in 1 sentence — headline before article
2. Expand w/ scaffolded explanation (Step 2)
3. Learner's vocab, not domain jargon (unless advanced)
4. Code: minimal working example, not comprehensive
5. Abstract: concrete instance first, then generalize
6. Processes: walk specific case step-by-step before general rules
7. Monitor confusion signs: next Q doesn't build on explanation → didn't land

**Got:** Explanation neither too shallow (leaves Q's) nor too deep (overwhelms). Uses their language, connects to context.

**If err:** Too long → core idea buried, restate 1-sentence headline. More confused after → entry wrong, try diff anchor/analogy. Genuinely complex → acknowledge vs hide: "3 parts, they interact. Start w/ first."

### Step 4: Check — Verify Understanding

Don't assume worked. Test via Q's revealing mental model.

1. Ask Q requiring application not recall: "Given X, what would you expect?"
2. Ask paraphrase: "Explain back in your own words?"
3. Present variation: "What if we changed this one thing?"
4. Look for specific understanding: predict, not just repeat?
5. Answer reveals misconception → note specific err for Step 5
6. Correct → push slightly further: can generalize?

**Got:** Reveals working mental model vs parroting. Working model handles variations; memorized cannot.

**If err:** Can't answer → explanation didn't build right model. Not their failure — feedback on teaching. Note what didn't land → Step 5.

### Step 5: Adapt — Respond to Feedback

Adjust based on check.

1. Solid → reinforce (Step 6) | advance to next concept
2. Specific misconception → address direct w/ evidence, not repetition
3. General confusion → completely diff explanation approach
4. Ahead of assessment → accelerate, skip scaffolding → nuance
5. Behind → slow down, teach missing prereq

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

**Got:** Teaching adapts in real time. No identical repetition — each retry diff approach. Responsive not mechanical.

**If err:** Multiple adaptations fail → may be missing prereq so fundamental neither party ID'd. Ask explicit: "What part feels biggest jump?" Often reveals hidden gap.

### Step 6: Reinforce — Practice

Solidify via application, not repetition.

1. Practice problem requiring concept (not trick)
2. Coding context → small modification to existing code using concept
3. Conceptual → present scenario, apply model
4. Connect forward: "Now you understand X, this connects to Y, can explore next"
5. Reference material for independent: docs, related files, further reading
6. Close loop: "To summarize..." — 1 sentence for core concept

**Got:** Learner applied concept ≥1×, has resources for continued learning. Summary anchors for future recall.

**If err:** Too hard → teaching jumped too far, simplify. Can do but can't explain why → procedural w/o conceptual, return Step 3 focused on "why" not "how".

## Check

- [ ] Level assessed before explanation
- [ ] Scaffolded known → unknown, not data dump
- [ ] ≥1 check Q asked to verify (not assumed)
- [ ] Teaching adapted on feedback, not repeated identical
- [ ] Learner can apply, not just recall
- [ ] Honest gaps acknowledged, not glossed

## Traps

- **Curse of knowledge**: Forget learner doesn't share teacher context. Jargon, assumed prereqs, implicit reasoning = primary culprits.
- **Explain to impress vs teach**: Comprehensive, precise explanations demonstrating knowledge but leaving learner behind.
- **Repeat louder**: Doesn't land → repeat w/ more emphasis vs diff approach.
- **Test vs teach**: Check Q's as gotchas vs diagnostic. Goal = reveal understanding, not catch failure.
- **Silence ≠ understanding**: Absence of Q's ≠ explanation worked. Often means learner doesn't know what to ask.
- **One-size-fits-all depth**: Novice gets advanced explanation "should see full picture" → overwhelms; expert gets beginner "better safe" → wastes time.

## →

- `teach-guidance` — human-guidance variant coaching person to be better teacher
- `learn` — systematic knowledge acquisition building understanding to teach from
- `listen` — deep receptive attention reveals actual needs beyond stated Q
- `meditate` — clear assumptions between teaching episodes, fresh approach each learner
