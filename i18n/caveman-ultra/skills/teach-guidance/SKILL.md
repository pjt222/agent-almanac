---
name: teach-guidance
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Guide person to be better teacher + explainer. AI coaches content
  structuring, audience calibration, explanation clarity, Socratic Q tech,
  feedback interpretation, reflective practice for tech presentations,
  docs, mentoring. Use → person needs prep coaching for tech presentation,
  wants better docs/tutorials, struggles to explain across expertise
  levels, mentoring colleague, prepping for talk.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, teaching, coaching, presentation, documentation, explanation, guidance
---

# Teach (Guidance)

Guide person → effective teacher/explainer/presenter. AI = teaching coach: assess what to communicate to whom, structure for clarity, rehearse, refine on feedback, support delivery, reflect.

## Use When

- Person needs to present tech content + wants prep
- Wants better docs, tutorials, explanations
- Struggles to explain across expertise levels
- Mentoring colleague | junior dev
- Prepping for talk, workshop, knowledge-sharing
- After `learn-guidance` acquired knowledge → now transfer

## In

- **Required**: What teach/explain (topic, concept, system, process)
- **Required**: Audience (expertise, context, relationship)
- **Optional**: Format (presentation, doc, 1:1 mentoring, workshop)
- **Optional**: Time constraints (5m explanation, 30m talk, written)
- **Optional**: Prev attempts + what didn't work
- **Optional**: Person's comfort w/ topic (deep expert vs recent learner)

## Do

### Step 1: Assess — Teaching Challenge

Before structuring, understand full context.

1. Ask what teach + why: "What concept needs to land, what if not?"
2. ID audience: "Who explaining to? What know already?"
3. Assess person's understanding: deep enough to teach? Else suggest `learn-guidance` first.
4. ID format: presentation, doc, conversation, code review, pair prog
5. Success criteria: "How know audience understood?"
6. Surface fears: "What part most nervous?"

```
Teaching Challenge Matrix:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ Challenge Type   │ Indicators               │ Focus Area               │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Knowledge gap    │ "I sort of know it       │ Deepen their own under-  │
│                  │ but can't explain it"     │ standing first (learn)   │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Audience gap     │ "I don't know what       │ Build audience empathy   │
│                  │ they already know"        │ and calibration          │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Structure gap    │ "I know it all but       │ Organize content into    │
│                  │ don't know where to       │ a narrative arc          │
│                  │ start"                    │                          │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Confidence gap   │ "What if they ask        │ Practice and preparation │
│                  │ something I can't         │ for edge cases           │
│                  │ answer?"                  │                          │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

**Got:** Clear picture: what, to whom, what format, what constraints, where least confident.

**If err:** Can't articulate audience → create persona: "Imagine 1 specific person. What know? Care about?" Can't articulate topic → may need to learn deeper first.

### Step 2: Structure — Clarity

Help build clear narrative for explanation.

1. ID single core msg: "If audience remembers 1 thing, what?"
2. Build outward: what context needed before, what details after?
3. Inverted pyramid: most important first, supporting after
4. Tech content patterns:
   - **Concept**: What → Why → How → Example → Edge cases
   - **Tutorial**: Goal → Prereqs → Steps → Verification → Next steps
   - **Architecture**: Problem → Constraints → Solution → Tradeoffs → Alternatives considered
   - **Debugging**: Symptom → Investigation → Root cause → Fix → Prevention
5. Each section clear purpose: doesn't serve core msg → cut
6. Plan transitions: "Covered X. Building on that, need to understand Y because..."

**Got:** Outline where every element serves core msg. Logical + inevitable — each section naturally → next.

**If err:** Structure keeps growing → scope too broad, cut. Flat (everything same level) → hierarchy needs work, ID primary vs supporting. Resists structure ("just explain naturally") → natural works for simple, fails for complex; structure = scaffold.

### Step 3: Practice — Rehearse

Person practices explaining, AI = audience.

1. Ask explain as to actual audience
2. Listen w/o interrupt first pass — find natural flow
3. Note where clear vs confused/vague
4. Note jargon audience may not know
5. Note skipped steps or assumed knowledge
6. Note too long on easy parts, rush hard parts
7. Time if constraint

**Got:** First-draft revealing natural patterns — strengths to build on, habits to adjust. Low-stakes: "Rough draft, not performance."

**If err:** Freezes/says "don't know where to start" → back to Step 2 structure, explain 1 section at time. Self-critical ("terrible") → redirect specifics: "X very clear — let's match Y to that quality."

### Step 4: Refine — Improve from Feedback

Specific, actionable feedback.

1. Lead w/ strengths: "X using Y analogy was effective because..."
2. ID biggest improvement opp (not all, focus on 1-2)
3. Specific alternatives: "Instead of [complex], try [simpler]"
4. Curse of knowledge: places expertise → skip steps audience needs?
5. Audience calibration: depth right? too shallow/deep?
6. Analogies accurate? (Misleading > no analogy)
7. Re-explain refined section → test improvement

**Got:** Targeted feedback measurably improves. Difference between 1st + 2nd attempt felt. Constructive — what to do, not avoid.

**If err:** Defensive about feedback → reframe "this was unclear" → "audience might not follow here, how clearer?" Refined no better → may be structural (Step 2), back to outline.

### Step 5: Deliver — Support During

Live → support during.

1. Live: prep answers to likely Q's in advance
2. Docs: review written for clarity, structure, audience calibration
3. Prep "I don't know" moment: "If asked something can't answer, say: 'Great Q — I'll look into it + follow up.' Always acceptable."
4. Encourage interaction: prep check Q's for audience
5. Recovery plans: audience lost, bored, ahead?
6. Coaching during: brief specific prompts ("slow down", "they look confused — check in")

**Got:** Person feels prepped + supported. Has answers for likely Q's, strategies for unexpected, confidence not knowing everything OK.

**If err:** Anxiety primary blocker → address direct: prep reduces anxiety, acknowledging nervousness creates connection. Format keeps changing → accept format + adapt vs control conditions.

### Step 6: Reflect — Analyze What Worked

Post-event, guide reflection.

1. "What went well? Proud of?"
2. "Where audience most engaged? Least?"
3. "Anything surprise about audience response?"
4. "If could change 1 thing, what?"
5. Connect reflection to principles: "Part that worked used [tech]. Apply more broadly."
6. ID 1 specific improvement goal next time
7. Celebrate accomplishment: teaching = skill improving w/ practice

**Got:** Concrete insight, not vague feelings. 1 actionable improvement next time.

**If err:** Only sees negatives → redirect specific moments worked. Only positives → probe areas audience confused. No reflection (moves on) → reflection = where most durable improvement happens, even 5 min matters.

## Check

- [ ] Challenge assessed before structuring (audience, format, constraints)
- [ ] Core msg ID'd, structure organized around it
- [ ] Practiced ≥1× before delivery
- [ ] Feedback specific, actionable, measurable improvement
- [ ] Prepared for Q's, uncertainty, audience adaptation
- [ ] Post-delivery reflection ID'd ≥1 specific improvement
- [ ] Coaching encouraging throughout — teaching hard, acknowledge

## Traps

- **Coach content vs teaching**: Helping learn material vs present. Need to learn → use `learn-guidance` first.
- **Over-structuring**: Rigid structure → person's natural voice lost. Structure supports style, not replace.
- **Perfectionism trap**: Rehearsing endless vs delivering. Diminishing returns — push to delivery.
- **Ignore audience diversity**: Mixed audience → layered explanation: core for all, details for experts, analogies for newcomers.
- **Feedback overload**: Too many notes → overwhelms. Focus 1-2 highest impact.
- **Neglect emotional prep**: Teaching anxiety real. Confidence as important as content.

## →

- `teach` — AI self-directed variant for calibrated knowledge transfer
- `learn-guidance` — coaching person through learning; prereq to teaching effectively
- `listen-guidance` — active listening helps teachers respond to audience real-time
- `meditate-guidance` — calm anxiety + focus before teaching event
