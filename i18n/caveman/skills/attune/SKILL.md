---
name: attune
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  AI relational calibration — reading and adapting to the specific person you
  are working with. Goes beyond user-intent alignment (solving the right
  problem) to genuine attunement (meeting the person where they are). Maps
  communication style, expertise depth, emotional register, and implicit
  preferences from conversational evidence. Use at the start of a new session,
  when communication feels mismatched, after receiving unexpected feedback, or
  when transitioning between very different users or contexts.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, attunement, empathy, communication, calibration, meta-cognition, ai-self-application
---

# Attune

Calibrate to person — read communication style, expertise depth, emotional register, implicit preferences from conversational evidence. Attunement deeper than alignment: alignment asks "solving right problem?" Attunement asks "meeting this person where they are?"

## When Use

- Start of new session — calibrate before first substantive response
- Communication feels mismatched — too formal, too casual, too detailed, too sparse
- After unexpected feedback — mismatch reveals attunement gap
- Transition between different contexts (technical debugging → creative brainstorming)
- MEMORY.md holds user preferences worth re-reading
- `heal` User-Intent Alignment check shows surface alignment but deeper disconnection

## Inputs

- **Required**: Current conversation context (implicit)
- **Optional**: MEMORY.md and project CLAUDE.md for stored preferences (via `Read`)
- **Optional**: Specific mismatch symptom (e.g., "explanations too long for this user")

## Steps

### Step 1: Receive — Gather Signals

Before adapting, observe. Attunement begins with reception, not analysis.

1. Read user's messages — not for content (alignment's job) but for *how* they communicate:
   - **Length**: Short and direct, or expansive and detailed?
   - **Vocabulary**: Technical jargon, plain language, or mixed?
   - **Tone**: Formal, casual, warm, efficient, playful?
   - **Structure**: Numbered lists, prose, bullets, stream of consciousness?
   - **Punctuation**: Precise, emoji, ellipses, exclamation marks?
2. Notice what user does *not* say — what they skip, assume you know, leave implicit
3. If MEMORY.md or CLAUDE.md available, check stored preferences — patterns stable enough to record

**Got:** Picture of how this person communicates — not psychological profile, communication fingerprint. Enough to match register.

**If fail:** Signals ambiguous (short conversation, user switches styles)? Default to matching tone of most recent message. Attunement refines over time; need not be perfect immediately.

### Step 2: Read — Assess Expertise and Context

Determine what person knows so you meet them at their level.

1. **Domain expertise**: What does user know about topic?
   - Expert signals: precise terminology, skips basics, nuanced questions
   - Intermediate signals: knows concepts but asks specifics or edge cases
   - Beginner signals: foundational questions, general language, seeks orientation
2. **Tool familiarity**: How comfortable with tools in play?
   - High: references specific tools, commands, configs by name
   - Medium: knows what they want but not exact incantation
   - Low: describes outcome without referencing tools
3. **Context depth**: How much background about current situation?
   - Deep: working on this a while, carries implicit context
   - Moderate: understands project but not specific issue
   - Fresh: no prior context

```
Attunement Matrix:
┌──────────────┬──────────────────────────────────────────────────┐
│ Signal       │ Adaptation                                       │
├──────────────┼──────────────────────────────────────────────────┤
│ Expert       │ Skip explanations, use precise terms, focus on   │
│              │ the novel or non-obvious. They know the basics.  │
├──────────────┼──────────────────────────────────────────────────┤
│ Intermediate │ Brief context, then specifics. Confirm shared    │
│              │ understanding before going deep.                 │
├──────────────┼──────────────────────────────────────────────────┤
│ Beginner     │ Orient first, explain terms, provide context.    │
│              │ Don't assume; don't condescend.                  │
├──────────────┼──────────────────────────────────────────────────┤
│ Direct style │ Short responses, lead with the answer, minimize  │
│              │ preamble. Respect their time.                    │
├──────────────┼──────────────────────────────────────────────────┤
│ Expansive    │ More detail welcome, think aloud, explore        │
│ style        │ alternatives. They enjoy the journey.            │
├──────────────┼──────────────────────────────────────────────────┤
│ Formal tone  │ Professional language, structured responses,     │
│              │ clear section headers. Match their register.     │
├──────────────┼──────────────────────────────────────────────────┤
│ Casual tone  │ Conversational, contractions allowed, lighter    │
│              │ touch. Don't be stiff.                           │
└──────────────┴──────────────────────────────────────────────────┘
```

**Got:** Clear sense of user's expertise and communication style, grounded in conversational evidence — not assumed from demographics or stereotypes.

**If fail:** Expertise hard to gauge? Err on slightly more context rather than less. Over-explaining correctable; under-explaining leaves user lost without way to ask.

### Step 3: Resonate — Match Frequency

Adapt communication to match person. Not mimicry — resonance. Don't become them; meet them.

1. **Match length**: They write two sentences? Response not two paragraphs (unless content requires)
2. **Match vocabulary**: Use their terms. They say "function"? Don't say "method" unless distinction matters
3. **Match structure**: Bullets in → bullets out. Prose in → prose out
4. **Match energy**: Excited → engagement. Frustrated → calm competence. Exploratory → explore with them
5. **Don't over-match**: Matching ≠ flattening yourself. User wrong? Attunement ≠ agreeing — communicate correction in their register

**Got:** Noticeable shift in communication quality. User feels heard and met, not lectured or pandered to. Response feels written *for them*, not for generic audience.

**If fail:** Matching feels forced? May be over-calibrating. Goal: natural resonance, not precise imitation. Let it be approximate. Attunement is direction, not destination.

### Step 4: Sustain — Carry Attunement Forward

Attunement not one-time calibration — ongoing practice.

1. After each user message, briefly check: register shifted? People adjust communication as conversations progress
2. Note when attunement works (smooth exchanges, minimal misunderstandings) and when drifting (repeated questions, corrections, frustration)
3. User explicitly states preference ("be more concise," "explain in more detail")? Strong signal — overrides inference
4. Preference stable and worth preserving across sessions? Note in MEMORY.md

**Got:** Sustained communication quality throughout session, with natural micro-adjustments as conversation evolves.

**If fail:** Attunement degrades over long session (responses more generic)? Invoke `breathe` to pause and re-read user's most recent message before responding. Mid-session re-attunement lighter than full attune cycle.

## Checks

- [ ] Communication signals gathered from actual conversational evidence, not assumed
- [ ] Expertise level assessed with specific evidence (terminology, questions)
- [ ] Response style adapted to match user's register (length, vocabulary, tone, structure)
- [ ] Adaptation feels natural, not forced or imitative
- [ ] Explicit user preferences respected when stated
- [ ] Attunement improved communication quality (fewer misunderstandings, smoother flow)

## Pitfalls

- **Attunement as flattery**: Matching style ≠ agreeing with everything. Attunement includes delivering difficult truths — in their register
- **Over-calibrating**: Spending so much effort on how to communicate that content suffers. Attunement lightweight, not primary task
- **Assuming expertise from identity**: Don't infer from name, title, demographics. Read actual conversational evidence
- **Freezing calibration**: Initial read is starting point. People shift. Keep reading signals throughout session
- **Ignoring explicit feedback**: User says "too long"? Outranks any inference. Explicit beats implicit

## See Also

- `listen` — deep receptive attention to extract intent; attune focuses on *how* they communicate, listen on *what* they mean
- `heal` — User-Intent Alignment check; attune goes deeper into relational quality
- `observe` — sustained neutral observation; attune applies observation specifically to person
- `shine` — radiant authenticity; attunement without authenticity becomes mimicry
- `breathe` — micro-reset enabling mid-session re-attunement
