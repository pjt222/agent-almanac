---
name: teach-guidance
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Guide a person in becoming a better teacher and explainer. AI coaches
  content structuring, audience calibration, explanation clarity, Socratic
  questioning technique, feedback interpretation, and reflective practice
  for technical presentations, documentation, and mentoring. Use when a
  person needs to present technical content and wants preparation coaching,
  wants to write better documentation or tutorials, struggles to explain
  concepts across expertise levels, is mentoring a colleague, or is
  preparing for a talk or knowledge-sharing session.
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

Guide person in becoming more effective teacher, explainer, or presenter. AI acts as teaching coach — helps assess what needs communicated and to whom, structures content for clarity, rehearses explanations, refines based on feedback, supports delivery, reflects on what worked.

## When Use

- Person needs present technical content to audience, wants prepare effectively
- Someone wants write better documentation, tutorials, or explanations
- Person struggles explain concepts to people with different expertise levels
- Someone mentoring colleague or junior developer, wants be more effective
- Person preparing for talk, workshop, or knowledge-sharing session
- After `learn-guidance` helped them acquire knowledge, they now need transfer to others

## Inputs

- **Required**: What person needs to teach or explain (topic, concept, system, process)
- **Required**: Who audience is (expertise level, context, relationship to person)
- **Optional**: Format of delivery (presentation, documentation, one-on-one mentoring, workshop)
- **Optional**: Time constraints (5-minute explanation, 30-minute talk, written document)
- **Optional**: Previous teaching attempts and what did not work
- **Optional**: Person's own comfort level with topic (deep expert vs. recent learner)

## Steps

### Step 1: Assess — Understand Teaching Challenge

Before structuring content, understand full context of teaching situation.

1. Ask what they need to teach and why: "What concept needs to land, and what happens if it does not?"
2. Identify the audience: "Who will you be explaining this to? What do they already know?"
3. Assess the person's own understanding: do they know the topic deeply enough to teach it? (If not, suggest `learn-guidance` first)
4. Identify the format: presentation, document, conversation, code review, pair programming
5. Determine success criteria: "How will you know the audience understood?"
6. Surface fears or concerns: "What part of this makes you most nervous?"

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

**Got:** Clear picture of teaching challenge: what, to whom, in what format, with what constraints, where person feels least confident.

**If fail:** Person cannot articulate audience? Help create persona: "Imagine one specific person who will hear this. What do they know? What do they care about?" Cannot articulate topic? May need learn it more deep first.

### Step 2: Structure — Organize Content for Clarity

Help person build clear narrative structure for explanation.

1. Identify the single core message: "If the audience remembers only one thing, what should it be?"
2. Build outward from the core: what context is needed before the core message, and what details follow after?
3. Apply the inverted pyramid: most important information first, supporting details after
4. For technical content, choose a structural pattern:
   - **Concept explanation**: What → Why → How → Example → Edge cases
   - **Tutorial**: Goal → Prerequisites → Steps → Verification → Next steps
   - **Architecture overview**: Problem → Constraints → Solution → Trade-offs → Alternatives considered
   - **Debugging walkthrough**: Symptom → Investigation → Root cause → Fix → Prevention
5. Ensure each section has a clear purpose: if a section does not serve the core message, cut it
6. Plan transitions: "We covered X. Now, building on that, we need to understand Y because..."

**Got:** Structured outline where every element serves core message. Structure should feel logical and inevitable — each section naturally leads to next.

**If fail:** Structure keeps growing? Scope too broad — help them cut. Structure feels flat (everything at same level)? Hierarchy needs work — identify which points primary and which supporting. They resist structure ("I'll just explain it naturally")? Note natural explanations work for simple topics but fail for complex ones — structure is scaffold.

### Step 3: Practice — Rehearse Explanation

Have person practice explaining concept, with AI acting as audience.

1. Ask them to explain the concept as they would to their actual audience
2. Listen without interrupting for the first pass — let them find their natural flow
3. Note where the explanation is clear and where it becomes confused or vague
4. Note where they use jargon the audience might not know
5. Note where they skip steps or assume knowledge the audience may not have
6. Note where they spend too long on easy parts and rush through hard parts
7. Time the explanation if there is a time constraint

**Got:** First-draft explanation reveals person's natural teaching patterns — strengths to build on and habits to adjust. Practice should feel low-stakes: "This is rough draft, not performance."

**If fail:** Person freezes or says "I don't know where to start"? Return to structure from Step 2, have them explain one section at a time rather than whole thing. Over self-critical ("that was terrible")? Redirect to specifics: "Actually, the way you explained X was very clear — let's focus on making Y match that quality."

### Step 4: Refine — Improve Based on Feedback

Provide specific, actionable feedback on practice explanation.

1. Lead with strengths: "The part where you explained X using the analogy of Y was very effective because..."
2. Identify the biggest improvement opportunity (not all the issues — focus on one or two)
3. Suggest specific alternatives: "Instead of saying [complex version], try: [simpler version]"
4. Check for the curse of knowledge: are there places where their expertise makes them skip steps the audience needs?
5. Check for audience calibration: is the depth right for the audience, or is it too shallow/deep?
6. If they use analogies, check if the analogies are accurate (misleading analogies are worse than no analogy)
7. Have them re-explain the refined section to test the improvement

**Got:** Targeted feedback improves explanation measurable. Person can feel difference between first and second attempt. Feedback framed constructive — what to do, not just what to avoid.

**If fail:** Person defensive about feedback? Reframe from "this was unclear" to "audience might not follow here — how could we make it even clearer?" Refined version not better? Issue may be structural (Step 2) rather than presentational — return to outline.

### Step 5: Deliver — Support During Teaching

Teaching happens in real time? Provide support during delivery.

1. For live presentations: help prepare answers to likely questions in advance
2. For documentation: review the written version for clarity, structure, and audience calibration
3. Help them prepare for the "I don't know" moment: "If asked something you cannot answer, say: 'Great question — I'll look into that and follow up.' This is always acceptable."
4. Encourage interaction: help them prepare check questions for the audience
5. Prepare recovery plans: what to do if the audience is lost, bored, or ahead of the explanation
6. If coaching during delivery: provide brief, specific prompts ("slow down here," "they look confused — check in")

**Got:** Person feels prepared and supported. They have answers for likely questions, strategies for unexpected situations, confidence that not knowing everything is acceptable.

**If fail:** Anxiety primary blocker? Address direct: preparation reduces anxiety, acknowledging nervousness to audience often creates connection. Delivery format keeps changing? Help them accept format and adapt rather than trying to control conditions.

### Step 6: Reflect — Analyze What Worked

After teaching event, guide reflection for continuous improvement.

1. Ask: "What went well? What are you proud of?"
2. Ask: "Where did you notice the audience was most engaged? Least engaged?"
3. Ask: "Did anything surprise you about the audience's response?"
4. Ask: "If you could change one thing, what would it be?"
5. Connect the reflection to principles: "The part that worked used [technique]. You can apply that more broadly."
6. Identify one specific improvement goal for next time
7. Celebrate the accomplishment: teaching is a skill that improves with practice

**Got:** Person gains concrete insight about teaching effectiveness — not vague feelings but specific observations about what worked and why. They leave with one actionable improvement for next time.

**If fail:** They only see negatives? Redirect to specific moments that worked. They see only positives? Gentle probe for areas where audience was confused. No reflection happens (they move on immediately)? Note reflection is where most durable improvement happens — even 5 minutes of review matters.

## Checks

- [ ] Teaching challenge assessed before structuring began (audience, format, constraints)
- [ ] Core message identified, structure organized around it
- [ ] Person practiced explanation at least once before delivery
- [ ] Feedback specific, actionable, led to measurable improvement
- [ ] Person prepared for questions, uncertainty, audience adaptation
- [ ] Post-delivery reflection identified at least one specific improvement for next time
- [ ] Coaching encouraging throughout — teaching is hard and should be acknowledged

## Pitfalls

- **Coach content, not teaching**: Help them learn material instead of help them present it. They need learn? Use `learn-guidance` first
- **Over-structuring**: Make structure so rigid person's natural teaching voice lost. Structure should support their style, not replace it
- **Perfectionism trap**: Rehearse endless instead of delivering. At some point, practice has diminishing returns — push toward delivery
- **Ignore audience diversity**: Mixed audience needs layered explanation — core idea for everyone, details for experts, analogies for newcomers
- **Feedback overload**: Giving too many notes at once overwhelms. Focus on one or two changes with highest impact
- **Neglect emotional preparation**: Teaching anxiety real. Addressing confidence as important as addressing content

## See Also

- `teach` — AI self-directed variant for calibrated knowledge transfer
- `learn-guidance` — coaching person through learning; prerequisite to teaching effective
- `listen-guidance` — active listening skills help teachers respond to audience needs in real time
- `meditate-guidance` — calming anxiety and achieving focus before teaching event
