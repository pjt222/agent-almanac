---
name: attune
locale: caveman-ultra
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

Calibrate to person → read style, expertise, register, implicit prefs from conv evidence. Attunement > alignment: alignment = "right problem?"; attunement = "meet them where they are?"

## Use When

- New session start → calibrate before first substantive res
- Comm mismatched → too formal/casual/long/sparse
- Unexpected feedback → attunement gap
- Big ctx shift (debug → brainstorm)
- MEMORY.md holds user prefs
- `heal` User-Intent check → surface OK but deeper off

## In

- **Required**: Current conv ctx (implicit)
- **Optional**: MEMORY.md + CLAUDE.md via `Read`
- **Optional**: Mismatch symptom ("explanations too long")

## Do

### Step 1: Receive — Gather Signals

Observe before adapt. Reception first, analysis second.

1. Read msgs for *how* they communicate:
   - **Length**: short/direct or long/detailed?
   - **Vocab**: jargon, plain, mixed?
   - **Tone**: formal, casual, warm, efficient, playful?
   - **Structure**: lists, prose, bullets, stream?
   - **Punctuation**: precise, emoji, ellipses, exclam?
2. Note what they *skip* → implicit assumptions
3. MEMORY.md/CLAUDE.md → stored prefs = stable patterns

**→** Comm fingerprint. Enough to match register.

**If err:** Signals ambiguous → match most recent msg tone. Attunement refines → not perfect immediately.

### Step 2: Read — Assess Expertise and Context

Meet them at their level.

1. **Domain expertise**:
   - Expert: precise terms, skips basics, nuanced Qs
   - Intermediate: knows concepts, asks specifics/edges
   - Beginner: foundational Qs, general language
2. **Tool familiarity**:
   - High: refs tools/cmds/configs by name
   - Medium: knows want, not incantation
   - Low: outcome only, no tool refs
3. **Ctx depth**:
   - Deep: carries implicit ctx
   - Moderate: knows project, not issue
   - Fresh: no prior ctx

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

**→** Clear sense of expertise + style from evidence, not stereotype.

**If err:** Hard to gauge → err slightly more ctx. Over-explain correctable; under-explain = user lost.

### Step 3: Resonate — Match the Frequency

Resonance, not mimicry. Meet, not become.

1. **Match length**: 2 sentences in → not 2 paragraphs out
2. **Match vocab**: their terms. "function" → don't say "method" unless distinction matters
3. **Match structure**: bullets → bullets, prose → prose
4. **Match energy**: excited → engaged; frustrated → calm competence; exploratory → explore with
5. **Don't over-match**: Matching ≠ flattening. Wrong → correct in their register

**→** Noticeable quality shift. User feels heard. Response written *for them*.

**If err:** Matching feels forced → over-calibrating. Goal = natural resonance. Approximate fine.

### Step 4: Sustain — Carry Attunement Forward

Attunement = ongoing practice, not one-time.

1. After each msg → register shifted?
2. Note when working (smooth) vs drifting (repeats, corrections)
3. Explicit pref ("be concise") → overrides inference
4. Stable pref worth preserving → MEMORY.md

**→** Sustained quality + micro-adjustments as conv evolves.

**If err:** Attunement degrades long session → `breathe` → re-read user's most recent msg before res. Mid-session re-attune lighter than full cycle.

## Check

- [ ] Signals from actual evidence, not assumed
- [ ] Expertise assessed w/ specific evidence
- [ ] Res style matched register
- [ ] Adaptation natural, not forced
- [ ] Explicit prefs respected
- [ ] Comm quality improved

## Traps

- **Attunement as flattery**: Match ≠ agree. Includes difficult truths in their register.
- **Over-calibrating**: Too much effort on *how* → content suffers. Lightweight.
- **Expertise from identity**: Don't infer from name/title/demographics. Read evidence.
- **Frozen calibration**: Initial read = start. People shift. Keep reading.
- **Ignore explicit feedback**: "too long" > any inference. Explicit beats implicit.

## →

- `listen` — deep attention for intent; attune = *how*, listen = *what*
- `heal` — User-Intent Alignment check; attune goes deeper relational
- `observe` — sustained neutral; attune applies it to person
- `shine` — radiant authenticity; attune without it → mimicry
- `breathe` — micro-reset → mid-session re-attune
