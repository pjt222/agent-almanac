---
name: listen
description: >
  Deep receptive attention to extract intent beyond literal words. Maps
  active listening from counseling psychology to AI reasoning: clearing
  assumptions, attending to full signal, parsing multiple layers (literal,
  procedural, emotional, contextual, constraint, meta), reflecting
  understanding, noticing what is unsaid, and integrating the whole picture.
  Use when a user's request feels ambiguous, when context suggests something
  different from the literal words, when previous responses have missed the
  mark, or before beginning a large task where misunderstanding intent would
  waste significant effort.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, listening, active-listening, intent-extraction, meta-cognition, receptive-attention
---

# Listen

Conduct a structured deep listening session — clearing assumptions, attending with full reception, parsing multiple signal layers, reflecting understanding back, noticing what is unsaid, and integrating the complete picture of the user's intent.

## When to Use

- A user's request feels ambiguous and rushing to action risks solving the wrong problem
- The user's words say one thing but the context suggests something else (mismatch between literal and implied)
- Previous responses have missed the mark — the user keeps clarifying or rephrasing
- A complex request arrives that contains multiple layers: technical needs, emotional context, unstated constraints
- Before beginning a large task where misunderstanding the intent would waste significant effort
- After `meditate` clears internal noise, `listen` directs cleared attention outward toward the user

## Inputs

- **Required**: User message(s) to attend to (available implicitly from conversation)
- **Optional**: Conversation history providing context for the current request
- **Optional**: MEMORY.md or CLAUDE.md with user preferences and project context
- **Optional**: Specific concern about what might be misunderstood

## Procedure

### Step 1: Clear — Release Assumptions

Before receiving the user's signal, release preconceptions about what they want.

1. Notice any pre-formed responses already forming — label them and set them aside
2. Check for pattern-matching: "This sounds like a request I have seen before" — that match may be wrong
3. Release the assumption that the user's first sentence contains the complete request
4. Release the assumption that the technical request is the only request
5. Approach the user's words as if hearing them for the first time, even if similar requests have been handled before

**Expected:** A receptive state where attention is open rather than already narrowing toward a solution. The impulse to immediately respond is paused in favor of fully receiving.

**On failure:** If assumptions cannot be released (a strong pattern match persists), acknowledge the match explicitly: "This looks like X — but let me check if that is actually what is being asked." Naming the assumption weakens its grip.

### Step 2: Attend — Full Reception

Read the user's message with complete attention, holding all parts in awareness simultaneously.

1. Read the entire message before processing any part of it
2. Note the structure: is this a single request, multiple requests, a question, a correction, a narrative?
3. Mark the key nouns and verbs — the concrete elements the user has specified
4. Note what is emphasized: what did they elaborate on? What did they state briefly?
5. Note the ordering: what came first (often the priority), what came last (often the afterthought — or the real request buried at the end)
6. Read a second time, this time attending to tone and framing rather than content

**Expected:** A complete reception of the message — no words skipped, no sentences glossed over. The message is held as a whole rather than immediately decomposed into actionable parts.

**On failure:** If the message is very long, break it into sections but still read each section completely. If attention is pulled toward one part (usually the most technical), deliberately attend to the parts that are not technical — they often contain the intent.

### Step 3: Layer — Parse Signal Types

The user's message contains multiple simultaneous signals. Parse each layer separately.

```
Signal Layer Taxonomy:
┌──────────────┬──────────────────────────────┬──────────────────────────┐
│ Layer        │ What to Extract              │ Evidence                 │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Literal      │ What the words explicitly    │ Direct statements,       │
│              │ say — the surface request    │ specific instructions     │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Procedural   │ What they want done — the    │ Verbs, action words,     │
│              │ desired action or output     │ "I want," "please,"      │
│              │                              │ "can you"                │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Emotional    │ How they feel about the      │ Frustration ("I keep     │
│              │ situation — frustration,     │ trying"), urgency ("I    │
│              │ curiosity, urgency, delight  │ need this now"), delight │
│              │                              │ ("this is cool")         │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Contextual   │ The situation surrounding    │ Mentions of deadlines,   │
│              │ the request — why now,       │ other people, projects,  │
│              │ what prompted it             │ prior attempts           │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Constraint   │ Boundaries on the solution   │ "Without changing X,"    │
│              │ — what must be preserved,    │ "keep it simple,"        │
│              │ what cannot change           │ "compatible with Y"      │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Meta         │ The request about the        │ "Am I asking the right   │
│              │ request — are they asking    │ question?", "Is this     │
│              │ whether they are asking      │ even possible?",         │
│              │ the right thing?             │ "Should I be doing X?"   │
└──────────────┴──────────────────────────────┴──────────────────────────┘
```

For each layer, note what is present and what is absent. The absent layers are as informative as the present ones.

**Expected:** A multi-layered reading of the message. The literal and procedural layers are usually clear. The emotional, contextual, constraint, and meta layers require more careful attention. At least one non-literal layer should be identified.

**On failure:** If only the literal layer is visible, the message may genuinely be straightforward — not all communication is layered. But check: is the message unusually short for its complexity? Are there hedging words ("maybe," "I think," "if possible")? These often indicate an unstated layer.

### Step 4: Reflect — Mirror Understanding

Before acting, reflect back what was heard to verify alignment.

1. Paraphrase the request in different words than the user used — this reveals whether the meaning was captured, not just the words
2. Name the layers explicitly if non-literal layers are significant: "It sounds like you want X, and the urgency suggests this is blocking other work"
3. State what you understood as the priority: "The most important part seems to be..."
4. If there are multiple possible interpretations, name them: "This could mean A or B — which is closer?"
5. If the request contains apparent contradictions, surface them gently: "You mentioned X and also Y — how do these relate?"

**Expected:** The user confirms the reflection or corrects it. Either outcome is valuable — confirmation means the intent is aligned; correction means the intent is now clearer. The reflection should feel like a mirror, not a judgment.

**On failure:** If the user seems impatient with the reflection ("just do it"), they may value speed over alignment — honor that preference but note the risk of misalignment. If the reflection was wrong, do not defend it — accept the correction and update understanding immediately.

### Step 5: Notice Silence — Read the Gaps

Attend to what the user did not say, which can be as important as what they did say.

1. What topic related to their request did they not mention? (missing context)
2. What constraint did they not state? (assumed knowledge or unstated preference)
3. What emotional tone is missing? (calmness in a situation that usually causes stress, or urgency without explanation)
4. What alternative approaches did they not consider? (tunnel vision or deliberate exclusion)
5. What question did they not ask? (the question behind the question)

**Expected:** At least one significant gap identified. This gap may not need to be addressed — but awareness of it prevents blind spots. The most useful gaps are missing constraints (the user assumed something they did not state) and missing context (why they need this now).

**On failure:** If no gaps are apparent, the user may have been thorough — but more likely, the gaps are in areas the AI is also blind to. Consider: what would a different person working on this project want to know that the user has not stated? This lateral perspective often surfaces hidden gaps.

### Step 6: Integrate — Synthesize Complete Understanding

Combine all layers and gaps into a unified picture of the user's actual need.

1. State the complete understanding: literal request + implied intent + emotional context + constraints + gaps
2. Identify the core need: if everything else fell away, what is the one thing the user most needs?
3. Determine the appropriate response: does the user want action, understanding, validation, or exploration?
4. If the integrated understanding differs from the literal request, decide whether to address the deeper need or the stated request (usually both)
5. Set the intent for the next action: "Based on what I heard, I will..."

**Expected:** A complete, nuanced understanding of the user's need that goes beyond the surface request. The understanding is specific enough to guide action and honest enough to acknowledge uncertainty.

**On failure:** If integration produces a confused picture, the signals may genuinely conflict. In that case, ask one focused question that would resolve the ambiguity: "The most important thing for me to understand is..." Do not ask multiple questions — a single well-chosen question reveals more than a list of clarifications.

## Validation

- [ ] Assumptions were cleared before attending to the user's message
- [ ] The full message was read before any part was acted on
- [ ] At least one non-literal signal layer was identified (emotional, contextual, constraint, or meta)
- [ ] Understanding was reflected back to the user before action was taken
- [ ] Gaps and silences were noticed and factored into understanding
- [ ] The integrated understanding addresses the user's core need, not just the surface request

## Common Pitfalls

- **Listening to respond**: Forming a response while still receiving the message. The response shapes what is heard, filtering out signals that do not fit the pre-formed answer
- **Literal-only listening**: Taking the words at face value and missing the intent, emotion, or context behind them
- **Projection**: Hearing what the user would say if they were the AI, rather than what they actually said. Their priorities and context are different
- **Over-interpretation**: Finding layers that are not there. Sometimes a request for a bug fix is just a request for a bug fix — not every message has hidden emotional content
- **Reflecting too much**: Turning every interaction into a reflective conversation when the user wants quick action. Match the reflection depth to the request complexity
- **Neglecting the literal**: So focused on subtext that the explicit request is not fulfilled. The literal layer still matters — address it even when deeper layers are present

## Related Skills

- `listen-guidance` — the human-guidance variant for coaching a person in developing active listening skills
- `observe` — sustained neutral pattern recognition that feeds listening with broader context
- `teach` — effective teaching requires listening first to understand the learner's needs
- `meditate` — inward attention that clears the space for outward listening
- `heal` — self-assessment that reveals whether the AI's listening capacity is impaired by drift
