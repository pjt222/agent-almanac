---
name: listen
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Structured deep listening session. Clear assumptions. Attend with full reception. Parse multiple signal layers. Reflect understanding back. Notice what is unsaid. Integrate complete picture of user's intent.

## When Use

- User's request feels ambiguous. Rushing to action risks solving wrong problem
- User's words say one thing but context suggests something else (mismatch between literal and implied)
- Previous responses have missed mark — user keeps clarifying or rephrasing
- Complex request arrives with multiple layers: technical needs, emotional context, unstated constraints
- Before beginning large task where misunderstanding intent would waste significant effort
- After `meditate` clears internal noise, `listen` directs cleared attention outward toward user

## Inputs

- **Required**: User message(s) to attend to (available implicitly from conversation)
- **Optional**: Conversation history providing context for current request
- **Optional**: MEMORY.md or CLAUDE.md with user preferences and project context
- **Optional**: Specific concern about what might be misunderstood

## Steps

### Step 1: Clear — Release Assumptions

Before receiving user's signal, release preconceptions about what they want.

1. Notice any pre-formed responses already forming — label them, set aside
2. Check for pattern-matching: "This sounds like request I have seen before" — that match may be wrong
3. Release assumption that user's first sentence contains complete request
4. Release assumption that technical request is only request
5. Approach user's words as if hearing them for first time, even if similar requests handled before

**Got:** Receptive state where attention is open rather than already narrowing toward solution. Impulse to immediately respond paused in favor of fully receiving.

**If fail:** Assumptions cannot be released (strong pattern match persists)? Acknowledge match explicitly: "This looks like X — but let me check if that is actually what is being asked." Naming assumption weakens its grip.

### Step 2: Attend — Full Reception

Read user's message with complete attention, holding all parts in awareness at once.

1. Read entire message before processing any part of it
2. Note structure: single request, multiple requests, question, correction, narrative?
3. Mark key nouns and verbs — concrete elements user has specified
4. Note what is emphasized: what did they elaborate on? What did they state briefly?
5. Note ordering: what came first (often priority), what came last (often afterthought — or real request buried at end)
6. Read second time, this time attending to tone and framing rather than content

**Got:** Complete reception of message — no words skipped, no sentences glossed over. Message held as whole rather than immediately decomposed into actionable parts.

**If fail:** Message very long? Break into sections, still read each section completely. Attention pulled toward one part (usually most technical)? Deliberately attend to parts that are not technical — often contain intent.

### Step 3: Layer — Parse Signal Types

User's message contains multiple simultaneous signals. Parse each layer separately.

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

For each layer, note what is present and what is absent. Absent layers as informative as present ones.

**Got:** Multi-layered reading of message. Literal and procedural layers usually clear. Emotional, contextual, constraint, meta layers require more careful attention. At least one non-literal layer identified.

**If fail:** Only literal layer visible? Message may genuinely be straightforward — not all communication is layered. But check: is message unusually short for its complexity? Are there hedging words ("maybe," "I think," "if possible")? Often indicate unstated layer.

### Step 4: Reflect — Mirror Understanding

Before acting, reflect back what was heard to verify alignment.

1. Paraphrase request in different words than user used — reveals whether meaning was captured, not just words
2. Name layers explicitly if non-literal layers significant: "It sounds like you want X, and urgency suggests this is blocking other work"
3. State what you understood as priority: "The most important part seems to be..."
4. Multiple possible interpretations? Name them: "This could mean A or B — which is closer?"
5. Request contains apparent contradictions? Surface gently: "You mentioned X and also Y — how do these relate?"

**Got:** User confirms reflection or corrects it. Either outcome valuable — confirmation = intent aligned. Correction = intent now clearer. Reflection should feel like mirror, not judgment.

**If fail:** User impatient with reflection ("just do it")? May value speed over alignment — honor preference but note risk of misalignment. Reflection was wrong? Do not defend it — accept correction, update understanding immediately.

### Step 5: Notice Silence — Read Gaps

Attend to what user did not say. Can be as important as what they did say.

1. What topic related to request did they not mention? (missing context)
2. What constraint did they not state? (assumed knowledge or unstated preference)
3. What emotional tone is missing? (calmness in situation that usually causes stress, or urgency without explanation)
4. What alternative approaches did they not consider? (tunnel vision or deliberate exclusion)
5. What question did they not ask? (question behind question)

**Got:** At least one significant gap identified. Gap may not need to be addressed — awareness prevents blind spots. Most useful gaps: missing constraints (user assumed something not stated) and missing context (why they need this now).

**If fail:** No gaps apparent? User may have been thorough — more likely gaps in areas AI also blind to. Consider: what would different person working on this project want to know that user has not stated? Lateral perspective often surfaces hidden gaps.

### Step 6: Integrate — Synthesize Complete Understanding

Combine all layers and gaps into unified picture of user's actual need.

1. State complete understanding: literal request + implied intent + emotional context + constraints + gaps
2. Identify core need: if everything else fell away, what is one thing user most needs?
3. Determine appropriate response: does user want action, understanding, validation, exploration?
4. Integrated understanding differs from literal request? Decide whether to address deeper need or stated request (usually both)
5. Set intent for next action: "Based on what I heard, I will..."

**Got:** Complete, nuanced understanding of user's need going beyond surface request. Understanding specific enough to guide action, honest enough to acknowledge uncertainty.

**If fail:** Integration produces confused picture? Signals may genuinely conflict. Ask one focused question that would resolve ambiguity: "The most important thing for me to understand is..." Do not ask multiple questions — single well-chosen question reveals more than list of clarifications.

## Checks

- [ ] Assumptions cleared before attending to user's message
- [ ] Full message read before any part acted on
- [ ] At least one non-literal signal layer identified (emotional, contextual, constraint, or meta)
- [ ] Understanding reflected back to user before action taken
- [ ] Gaps and silences noticed, factored into understanding
- [ ] Integrated understanding addresses user's core need, not just surface request

## Pitfalls

- **Listening to respond**: Forming response while still receiving message. Response shapes what is heard, filtering out signals that do not fit pre-formed answer
- **Literal-only listening**: Taking words at face value, missing intent, emotion, or context behind them
- **Projection**: Hearing what user would say if they were AI, rather than what they actually said. Their priorities and context are different
- **Over-interpretation**: Finding layers not there. Sometimes request for bug fix is just request for bug fix — not every message has hidden emotional content
- **Reflecting too much**: Turning every interaction into reflective conversation when user wants quick action. Match reflection depth to request complexity
- **Neglecting literal**: So focused on subtext that explicit request not fulfilled. Literal layer still matters — address it even when deeper layers present

## See Also

- `listen-guidance` — human-guidance variant for coaching person in developing active listening skills
- `observe` — sustained neutral pattern recognition feeding listening with broader context
- `teach` — effective teaching requires listening first to understand learner's needs
- `meditate` — inward attention clearing space for outward listening
- `heal` — self-assessment revealing whether AI's listening capacity is impaired by drift
