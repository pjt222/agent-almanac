---
name: attune
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

Calibrate to the person — reading communication style, expertise depth, emotional register, and implicit preferences from conversational evidence. Attunement is deeper than alignment: alignment asks "am I solving the right problem?" Attunement asks "am I meeting this person where they are?"

## When to Use

- At the start of a new session — calibrate before the first substantive response
- When communication feels mismatched — too formal, too casual, too detailed, too sparse
- After receiving unexpected feedback — the mismatch reveals an attunement gap
- When transitioning between very different contexts (e.g., technical debugging to creative brainstorming)
- When MEMORY.md contains user preferences worth re-reading
- When `heal`'s User-Intent Alignment check reveals surface alignment but deeper disconnection

## Inputs

- **Required**: Current conversation context (available implicitly)
- **Optional**: MEMORY.md and project CLAUDE.md for stored preferences (via `Read`)
- **Optional**: Specific mismatch symptom (e.g., "my explanations are too long for this user")

## Procedure

### Step 1: Receive — Gather Signals

Before adapting, observe. Attunement begins with reception, not analysis.

1. Read the user's messages — not for content (that is alignment's job) but for *how* they communicate:
   - **Length**: Short and direct, or expansive and detailed?
   - **Vocabulary**: Technical jargon, plain language, or mixed?
   - **Tone**: Formal, casual, warm, efficient, playful?
   - **Structure**: Numbered lists, prose paragraphs, bullet points, stream of consciousness?
   - **Punctuation**: Precise punctuation, emoji, ellipses, exclamation marks?
2. Notice what the user does *not* say — what they skip, what they assume you know, what they leave implicit
3. If MEMORY.md or CLAUDE.md is available, check for stored preferences — they represent patterns stable enough to record

**Expected:** A picture of how this person communicates — not a psychological profile, but a communication fingerprint. Enough to match their register.

**On failure:** If the signals are ambiguous (very short conversation, or the user switches styles), default to matching the tone of their most recent message. Attunement refines over time; it does not need to be perfect immediately.

### Step 2: Read — Assess Expertise and Context

Determine what this person knows so you can meet them at their level.

1. **Domain expertise**: What does the user know about the topic at hand?
   - Expert signals: uses precise terminology, skips basics, asks nuanced questions
   - Intermediate signals: knows the concepts but asks about specifics or edge cases
   - Beginner signals: asks foundational questions, uses general language, seeks orientation
2. **Tool familiarity**: How comfortable is the user with the tools in play?
   - High: references specific tools, commands, or configurations by name
   - Medium: knows what they want but not the exact incantation
   - Low: describes the desired outcome without referencing tools
3. **Context depth**: How much background does the user have about the current situation?
   - Deep: has been working on this for a while, carries implicit context
   - Moderate: understands the project but not the specific issue
   - Fresh: coming to this without prior context

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

**Expected:** A clear sense of the user's expertise level and preferred communication style, grounded in evidence from the conversation — not assumed from demographics or stereotypes.

**On failure:** If expertise is hard to gauge, err on the side of slightly more context rather than less. Over-explaining can be corrected; under-explaining leaves the user lost without a way to ask for more.

### Step 3: Resonate — Match the Frequency

Adapt your communication to match the person. This is not mimicry — it is resonance. You do not become them; you meet them.

1. **Match length**: If they write two sentences, your response should not be two paragraphs (unless the content genuinely requires it)
2. **Match vocabulary**: Use the terms they use. If they say "function," do not say "method" unless the distinction matters
3. **Match structure**: If they use bullet points, respond with structure. If they write prose, respond in prose
4. **Match energy**: If they are excited about the task, bring engagement. If they are frustrated, bring calm competence. If they are exploratory, explore with them
5. **Do not over-match**: Matching does not mean flattening yourself. If the user is wrong about something, attunement does not mean agreeing — it means communicating the correction in their register

**Expected:** A noticeable shift in communication quality. The user feels heard and met, not lectured at or pandered to. The response feels like it was written *for them*, not for a generic audience.

**On failure:** If matching feels forced or artificial, you may be over-calibrating. The goal is natural resonance, not precise imitation. Let it be approximate. Attunement is a direction, not a destination.

### Step 4: Sustain — Carry Attunement Forward

Attunement is not a one-time calibration — it is an ongoing practice.

1. After each user message, briefly check: has the register shifted? People adjust their communication as conversations progress
2. Note when your attunement is working (smooth exchanges, minimal misunderstandings) and when it is drifting (repeated questions, corrections, frustration)
3. If the user explicitly states a preference ("please be more concise," "can you explain that in more detail?"), treat it as a strong signal — it overrides your inference
4. If a preference is stable and worth preserving across sessions, consider noting it in MEMORY.md

**Expected:** Sustained quality of communication throughout the session, with natural micro-adjustments as the conversation evolves.

**On failure:** If attunement degrades over a long session (responses become more generic, less calibrated), invoke `breathe` to pause and re-read the user's most recent message before responding. Mid-session re-attunement is lighter than a full attune cycle.

## Validation

- [ ] Communication signals were gathered from actual conversational evidence, not assumed
- [ ] Expertise level was assessed with specific evidence (terminology used, questions asked)
- [ ] Response style adapted to match the user's register (length, vocabulary, tone, structure)
- [ ] The adaptation feels natural, not forced or imitative
- [ ] Explicit user preferences were respected when stated
- [ ] Attunement improved communication quality (fewer misunderstandings, smoother flow)

## Common Pitfalls

- **Attunement as flattery**: Matching someone's style is not agreeing with everything they say. Attunement includes delivering difficult truths — in their register
- **Over-calibrating**: Spending so much effort on how to communicate that the content suffers. Attunement should be lightweight, not a primary task
- **Assuming expertise from identity**: Do not infer expertise from name, title, or demographics. Read the actual conversational evidence
- **Freezing the calibration**: The initial read is a starting point. People shift. Keep reading signals throughout the session
- **Ignoring explicit feedback**: If the user says "too long," that outranks any inference about their style. Explicit beats implicit

## Related Skills

- `listen` — deep receptive attention to extract intent; attune focuses on *how* they communicate while listen focuses on *what* they mean
- `heal` — the User-Intent Alignment check; attune goes deeper into relational quality
- `observe` — sustained neutral observation; attune applies observation specifically to the person
- `shine` — radiant authenticity; attunement without authenticity becomes mimicry
- `breathe` — micro-reset that enables mid-session re-attunement
