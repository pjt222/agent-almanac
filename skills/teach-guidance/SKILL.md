---
name: teach-guidance
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

Guide a person in becoming a more effective teacher, explainer, or presenter. The AI acts as a teaching coach — helping assess what needs to be communicated and to whom, structuring content for clarity, rehearsing explanations, refining based on feedback, supporting delivery, and reflecting on what worked.

## When to Use

- A person needs to present technical content to an audience and wants to prepare effectively
- Someone wants to write better documentation, tutorials, or explanations
- A person struggles to explain concepts to people with different expertise levels
- Someone is mentoring a colleague or junior developer and wants to be more effective
- A person is preparing for a talk, workshop, or knowledge-sharing session
- After `learn-guidance` has helped them acquire knowledge, they now need to transfer it to others

## Inputs

- **Required**: What the person needs to teach or explain (topic, concept, system, process)
- **Required**: Who the audience is (expertise level, context, relationship to the person)
- **Optional**: Format of delivery (presentation, documentation, one-on-one mentoring, workshop)
- **Optional**: Time constraints (5-minute explanation, 30-minute talk, written document)
- **Optional**: Previous teaching attempts and what did not work
- **Optional**: The person's own comfort level with the topic (deep expert vs. recent learner)

## Procedure

### Step 1: Assess — Understand the Teaching Challenge

Before structuring content, understand the full context of the teaching situation.

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

**Expected:** A clear picture of the teaching challenge: what, to whom, in what format, with what constraints, and where the person feels least confident.

**On failure:** If the person cannot articulate their audience, help them create a persona: "Imagine one specific person who will hear this. What do they know? What do they care about?" If they cannot articulate the topic, they may need to learn it more deeply first.

### Step 2: Structure — Organize Content for Clarity

Help the person build a clear narrative structure for their explanation.

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

**Expected:** A structured outline where every element serves the core message. The structure should feel logical and inevitable — each section naturally leads to the next.

**On failure:** If the structure keeps growing, the scope is too broad — help them cut. If the structure feels flat (everything at the same level), the hierarchy needs work — identify which points are primary and which are supporting. If they resist structure ("I'll just explain it naturally"), note that natural explanations work for simple topics but fail for complex ones — structure is the scaffold.

### Step 3: Practice — Rehearse the Explanation

Have the person practice explaining the concept, with the AI acting as the audience.

1. Ask them to explain the concept as they would to their actual audience
2. Listen without interrupting for the first pass — let them find their natural flow
3. Note where the explanation is clear and where it becomes confused or vague
4. Note where they use jargon the audience might not know
5. Note where they skip steps or assume knowledge the audience may not have
6. Note where they spend too long on easy parts and rush through hard parts
7. Time the explanation if there is a time constraint

**Expected:** A first-draft explanation that reveals the person's natural teaching patterns — strengths to build on and habits to adjust. The practice should feel low-stakes: "This is a rough draft, not a performance."

**On failure:** If the person freezes or says "I don't know where to start," return to the structure from Step 2 and have them explain one section at a time rather than the whole thing. If they are overly self-critical ("that was terrible"), redirect to specifics: "Actually, the way you explained X was very clear — let's focus on making Y match that quality."

### Step 4: Refine — Improve Based on Feedback

Provide specific, actionable feedback on the practice explanation.

1. Lead with strengths: "The part where you explained X using the analogy of Y was very effective because..."
2. Identify the biggest improvement opportunity (not all the issues — focus on one or two)
3. Suggest specific alternatives: "Instead of saying [complex version], try: [simpler version]"
4. Check for the curse of knowledge: are there places where their expertise makes them skip steps the audience needs?
5. Check for audience calibration: is the depth right for the audience, or is it too shallow/deep?
6. If they use analogies, check if the analogies are accurate (misleading analogies are worse than no analogy)
7. Have them re-explain the refined section to test the improvement

**Expected:** Targeted feedback that improves the explanation measurably. The person can feel the difference between the first and second attempt. Feedback is framed constructively — what to do, not just what to avoid.

**On failure:** If the person is defensive about feedback, reframe from "this was unclear" to "the audience might not follow here — how could we make it even clearer?" If the refined version is not better, the issue may be structural (Step 2) rather than presentational — return to the outline.

### Step 5: Deliver — Support During Teaching

If the teaching happens in real time, provide support during delivery.

1. For live presentations: help prepare answers to likely questions in advance
2. For documentation: review the written version for clarity, structure, and audience calibration
3. Help them prepare for the "I don't know" moment: "If asked something you cannot answer, say: 'Great question — I'll look into that and follow up.' This is always acceptable."
4. Encourage interaction: help them prepare check questions for the audience
5. Prepare recovery plans: what to do if the audience is lost, bored, or ahead of the explanation
6. If coaching during delivery: provide brief, specific prompts ("slow down here," "they look confused — check in")

**Expected:** The person feels prepared and supported. They have answers for likely questions, strategies for unexpected situations, and confidence that not knowing everything is acceptable.

**On failure:** If anxiety is the primary blocker, address it directly: preparation reduces anxiety, and acknowledging nervousness to the audience often creates connection. If the delivery format keeps changing, help them accept the format and adapt rather than trying to control conditions.

### Step 6: Reflect — Analyze What Worked

After the teaching event, guide reflection for continuous improvement.

1. Ask: "What went well? What are you proud of?"
2. Ask: "Where did you notice the audience was most engaged? Least engaged?"
3. Ask: "Did anything surprise you about the audience's response?"
4. Ask: "If you could change one thing, what would it be?"
5. Connect the reflection to principles: "The part that worked used [technique]. You can apply that more broadly."
6. Identify one specific improvement goal for next time
7. Celebrate the accomplishment: teaching is a skill that improves with practice

**Expected:** The person gains concrete insight about their teaching effectiveness — not vague feelings but specific observations about what worked and why. They leave with one actionable improvement for next time.

**On failure:** If they only see negatives, redirect to specific moments that worked. If they see only positives, gently probe for areas where the audience was confused. If no reflection happens (they move on immediately), note that reflection is where the most durable improvement happens — even 5 minutes of review matters.

## Validation

- [ ] The teaching challenge was assessed before structuring began (audience, format, constraints)
- [ ] A core message was identified and the structure organized around it
- [ ] The person practiced the explanation at least once before delivery
- [ ] Feedback was specific, actionable, and led to measurable improvement
- [ ] The person was prepared for questions, uncertainty, and audience adaptation
- [ ] Post-delivery reflection identified at least one specific improvement for next time
- [ ] The coaching was encouraging throughout — teaching is hard and should be acknowledged

## Common Pitfalls

- **Coaching the content, not the teaching**: Helping them learn the material instead of helping them present it. If they need to learn, use `learn-guidance` first
- **Over-structuring**: Making the structure so rigid that the person's natural teaching voice is lost. Structure should support their style, not replace it
- **Perfectionism trap**: Rehearsing endlessly instead of delivering. At some point, the practice has diminishing returns — push toward delivery
- **Ignoring audience diversity**: A mixed audience needs layered explanation — core idea for everyone, details for experts, analogies for newcomers
- **Feedback overload**: Giving too many notes at once overwhelms. Focus on the one or two changes with the highest impact
- **Neglecting emotional preparation**: Teaching anxiety is real. Addressing confidence is as important as addressing content

## Related Skills

- `teach` — the AI self-directed variant for calibrated knowledge transfer
- `learn-guidance` — coaching a person through learning; the prerequisite to teaching effectively
- `listen-guidance` — active listening skills help teachers respond to audience needs in real time
- `meditate-guidance` — calming anxiety and achieving focus before a teaching event
