---
name: listen
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Deep receptive attention → extract intent beyond literal words. Active
  listening (counseling psych) → AI reasoning: clear assumptions, attend full
  signal, parse multi layers (literal, procedural, emotional, contextual,
  constraint, meta), reflect understanding, notice unsaid, integrate whole
  picture. Use when request ambiguous, ctx suggests diff from literal words,
  prev responses missed mark, or before large task where misunderstanding
  wastes effort.
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

Structured deep listening — clear assumptions, attend w/ full reception, parse multi signal layers, reflect understanding, notice unsaid, integrate complete picture of intent.

## Use When

- Request ambiguous, rushing to action risks wrong problem
- Words say one thing, ctx suggests else (literal vs implied mismatch)
- Prev responses missed mark — user keeps clarifying / rephrasing
- Complex request w/ multi layers: technical + emotional + unstated constraints
- Before large task where misunderstanding wastes effort
- After `meditate` clears noise → `listen` directs cleared attention outward

## In

- **Req**: User msg(s) to attend to (implicit from conv)
- **Opt**: Conv history providing ctx
- **Opt**: MEMORY.md / CLAUDE.md w/ user prefs + project ctx
- **Opt**: Specific concern about what might be misunderstood

## Do

### Step 1: Clear — Release Assumptions

Before receiving signal, release preconceptions about what they want.

1. Notice pre-formed responses → label + set aside
2. Check pattern-matching: "Looks like request I've seen" → match may be wrong
3. Release assumption first sentence = complete request
4. Release assumption technical request = only request
5. Approach words as first time, even if similar handled before

→ Receptive state, attention open not narrowing toward solution. Impulse to respond paused → fully receiving.

**If err:** Can't release (strong pattern persists) → acknowledge explicitly: "Looks like X — but check if actually asked." Naming weakens grip.

### Step 2: Attend — Full Reception

Read msg w/ complete attention, hold all parts simultaneously.

1. Read entire msg before processing any part
2. Note structure: single request, multi, q, correction, narrative?
3. Mark key nouns + verbs — concrete elements specified
4. Note emphasis: what elaborated? What brief?
5. Note ordering: first (often priority), last (often afterthought — or real request buried at end)
6. Read 2nd time, attend to tone + framing vs content

→ Complete reception — no words skipped, no sentences glossed. Msg held as whole, not immediately decomposed.

**If err:** Very long → break into sections but read each completely. Attention pulled to one part (usually most technical) → deliberately attend non-technical parts, often contain intent.

### Step 3: Layer — Parse Signal Types

Msg contains multi simultaneous signals. Parse each layer separately.

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

Per layer → note present + absent. Absent as informative as present.

→ Multi-layered reading. Literal + procedural usually clear. Emotional, contextual, constraint, meta require careful attention. ≥1 non-literal layer ID'd.

**If err:** Only literal visible → may genuinely be straightforward. But check: msg unusually short for complexity? Hedging words ("maybe", "I think", "if possible")? Often indicate unstated layer.

### Step 4: Reflect — Mirror Understanding

Before acting → reflect back to verify alignment.

1. Paraphrase in diff words than user used → reveals meaning captured, not just words
2. Name layers explicitly if non-literal significant: "Sounds like you want X, urgency suggests blocking other work"
3. State priority: "Most important part seems to be..."
4. Multi interpretations → name: "Could mean A or B — which closer?"
5. Apparent contradictions → surface gently: "Mentioned X + Y — how relate?"

→ User confirms / corrects. Either valuable — confirm = intent aligned; correct = now clearer. Feels like mirror, not judgment.

**If err:** User impatient ("just do it") → may value speed over alignment → honor pref but note risk. Reflection wrong → don't defend, accept correction, update immediately.

### Step 5: Notice Silence — Read Gaps

Attend to what not said — can be as important as what said.

1. Topic related to request not mentioned? (missing ctx)
2. Constraint not stated? (assumed knowledge / unstated pref)
3. Emotional tone missing? (calm in stressful situation, urgency w/o explanation)
4. Alt approaches not considered? (tunnel vision / deliberate exclusion)
5. Q not asked? (q behind q)

→ ≥1 significant gap ID'd. May not need addressing — awareness prevents blind spots. Most useful = missing constraints + missing ctx.

**If err:** No gaps apparent → user thorough, or more likely, gaps in areas AI also blind to. Consider: diff person working on this project would want to know what? Lateral perspective surfaces hidden gaps.

### Step 6: Integrate — Synthesize Complete Understanding

Combine all layers + gaps → unified picture of actual need.

1. State complete understanding: literal + implied + emotional + constraints + gaps
2. ID core need: if everything else fell away, what is one thing most needed?
3. Determine response type: action, understanding, validation, exploration?
4. If integrated differs from literal → decide address deeper / stated (usually both)
5. Set intent for next action: "Based on what heard, I will..."

→ Complete nuanced understanding beyond surface. Specific enough to guide action, honest enough to acknowledge uncertainty.

**If err:** Integration produces confused picture → signals genuinely conflict. Ask one focused q that resolves ambiguity: "Most important to understand is..." Don't ask multi qs — single well-chosen reveals more than list.

## Check

- [ ] Assumptions cleared before attending
- [ ] Full msg read before any part acted on
- [ ] ≥1 non-literal signal layer ID'd
- [ ] Understanding reflected back before action
- [ ] Gaps + silences noticed + factored
- [ ] Integrated understanding addresses core need, not just surface

## Traps

- **Listen to respond**: Forming response while receiving → shapes what heard, filters signals not fitting pre-formed answer.
- **Literal-only listening**: Take words at face value, miss intent, emotion, ctx behind.
- **Projection**: Hear what user would say if were AI, vs what actually said. Their priorities + ctx different.
- **Over-interpretation**: Find layers not there. Sometimes bug fix request = just bug fix — not every msg has hidden emotional content.
- **Reflect too much**: Turn every interaction reflective when user wants quick action. Match reflection depth to request complexity.
- **Neglect literal**: So focused on subtext, explicit request not fulfilled. Literal still matters — address even when deeper layers present.

## →

- `listen-guidance` — human-guidance variant → coach person developing active listening
- `observe` — sustained neutral pattern recognition feeding listening w/ broader ctx
- `teach` — effective teaching requires listening first to understand learner
- `meditate` — inward attention clears space for outward listening
- `heal` — self-assessment reveals if listening capacity impaired by drift
