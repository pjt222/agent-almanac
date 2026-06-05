---
name: learn-guidance
description: >
  Guide a person through structured learning of a new topic, technology,
  or skill. AI acts as learning coach — assessing current knowledge,
  designing a learning path, walking through material, testing understanding,
  adapting difficulty, and planning review sessions for retention. Use when
  a person wants to learn a new technology and does not know where to start,
  when someone feels overwhelmed by documentation, when a person keeps
  forgetting material and needs spaced repetition, or when transitioning
  between domains and needing a gap analysis.
license: MIT
allowed-tools: Read WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, learning, coaching, education, structured-learning, guidance
---

# Learn (Guidance)

Guide a person through a structured learning process for a new topic, technology, or skill. The AI acts as a learning coach — helping assess starting knowledge, plan a study path, walk through material at the right pace, test understanding with questions, adapt the approach based on feedback, and consolidate for retention.

## When to Use

- A person wants to learn a new technology, framework, language, or concept and does not know where to start
- Someone feels overwhelmed by documentation or learning resources and needs a structured path
- A person keeps forgetting material and needs spaced repetition guidance
- Someone is transitioning between domains (e.g., backend to frontend) and needs gap analysis
- A person wants accountability and structure for self-directed learning
- After `meditate-guidance` has cleared mental noise, creating space for focused learning

## Inputs

- **Required**: What the person wants to learn (topic, technology, skill, or concept)
- **Required**: Their purpose for learning (job requirement, personal interest, project need, career change)
- **Optional**: Current knowledge level in this area (self-assessed or demonstrated)
- **Optional**: Time available for learning (hours per day/week, deadline if any)
- **Optional**: Preferred learning style (reading, hands-on, video, discussion)
- **Optional**: Prior failed attempts at learning this topic (what did not work before)

## Procedure

### Step 1: Assess — Determine Starting Position

Before designing a learning path, understand where the person currently stands.

1. Ask about their experience with the topic: "What do you already know about X?"
2. Ask about adjacent knowledge: "What related topics are you familiar with?" (these become bridges)
3. If they claim some knowledge, ask a calibration question that reveals depth vs. surface familiarity
4. Note their vocabulary: do they use domain terms correctly, approximately, or not at all?
5. Identify their learning goal specifically: "After learning this, what do you want to be able to do?"
6. Identify their primary motivation: curiosity, practical need, career advancement, or creative project

```
Starting Position Assessment:
┌───────────────┬────────────────────────────┬──────────────────────────┐
│ Level Found   │ Indicators                 │ Path Approach            │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ No exposure   │ No vocabulary, no mental   │ Start with "what" and    │
│               │ model, everything is new   │ "why" before "how"       │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ Surface       │ Has heard terms, no hands- │ Fill vocabulary gaps,    │
│ awareness     │ on experience, vague model │ then move to hands-on    │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ Partial       │ Some experience, gaps in   │ Identify specific gaps   │
│ knowledge     │ understanding, can do some │ and target them directly │
│               │ things but not others      │                          │
├───────────────┼────────────────────────────┼──────────────────────────┤
│ Refresher     │ Knew it before, now rusty  │ Quick review + practice  │
│ needed        │                            │ to reactivate knowledge  │
└───────────────┴────────────────────────────┴──────────────────────────┘
```

**Expected:** A clear picture of the person's starting position, goal, and constraints. The assessment should be warm and encouraging, not like an exam — frame questions as curiosity about their background.

**On failure:** If the person cannot articulate their current level, ask them to describe a recent attempt to use or understand the topic. Concrete stories reveal level more accurately than self-assessment. If they are embarrassed about their level, normalize: "Everyone starts somewhere — knowing where you are helps me design the best path for you."

### Step 2: Plan — Design the Learning Path

Create a structured path from their current position to their goal.

1. Break the topic into 4-7 learning milestones (not too granular, not too vague)
2. Order milestones by dependency: what must be understood before what?
3. For each milestone, identify the core concept (what they need to understand) and the core skill (what they need to be able to do)
4. Estimate time per milestone based on their available hours
5. Identify the first milestone — this is where learning begins
6. Build in early wins: the first milestone should be achievable quickly to build momentum
7. Present the path visually: a numbered list with brief descriptions

**Expected:** A learning path the person can see and understand. It should feel manageable — not overwhelming. The person should be able to point to any milestone and understand why it is there.

**On failure:** If the path feels too long, the goal may be too ambitious for the available time — discuss scope reduction. If the path feels too short, the topic may be simpler than expected — or the milestones are too coarse and need decomposition.

### Step 3: Guide — Walk Through Material

For each milestone, guide the person through the material at the right pace.

1. Introduce the milestone concept with a brief overview: "In this section, we will learn X, which lets you do Y"
2. Present the material in small chunks — one concept per chunk
3. Use the person's preferred learning style: reading → provide text; hands-on → provide exercises; discussion → use Socratic questioning
4. Connect each new concept to something they already know (from the assessment)
5. Provide concrete examples before abstract definitions
6. If using documentation, guide them through the relevant sections rather than sending them off to read alone
7. Pause after each chunk: "Does this make sense so far?"

**Expected:** The person progresses through the material with comprehension, not just exposure. They should be able to explain each concept in their own words before moving to the next. The pace feels right — not rushed, not dragged.

**On failure:** If they are struggling, slow down and check for missing prerequisites. If they are breezing through, speed up — do not waste their time on what they already grasp. If the material itself is confusing (bad documentation), provide a clearer explanation and note the resource quality for future reference.

### Step 4: Test — Check Understanding

Verify learning with questions that require application, not just recall.

1. Ask prediction questions: "What would happen if you changed X?"
2. Ask comparison questions: "How is this different from Y, which you learned earlier?"
3. Ask application questions: "How would you use this to solve Z?"
4. Ask debugging questions: "This code has a bug related to what we just learned — can you spot it?"
5. Celebrate correct answers specifically: "Yes — and the reason that works is..."
6. For incorrect answers, explore their reasoning: "Interesting — walk me through your thinking"
7. Never frame incorrect answers as failure — they are diagnostic information

**Expected:** The testing reveals whether the person has a working mental model or surface-level recall. Working models can handle variations; surface recall cannot. The testing should feel like a collaborative exercise, not an exam.

**On failure:** If the person cannot answer application questions, the learning was too passive — they need hands-on practice before more material. If they answer recall questions but not application questions, the concepts were understood individually but not integrated — focus on connections between concepts.

### Step 5: Adapt — Adjust the Path

Based on test results and the person's feedback, adjust the learning path.

1. If a milestone was easy: consider combining it with the next one, or deepening the content
2. If a milestone was hard: break it into smaller steps, or add prerequisite review
3. If the person's interest shifts during learning: adjust the path to follow their curiosity where possible — engagement drives retention
4. If they are fatigued: suggest a break and a review session later rather than pushing through
5. If a particular teaching approach is not working: try a different modality (switch from reading to doing, or from abstract to concrete)
6. Update the learning path and communicate changes: "Based on how this went, I suggest we adjust..."

**Expected:** The learning path evolves based on real data. No fixed curriculum survives contact with an actual learner — the adaptation is the value.

**On failure:** If repeated adaptations still leave the person struggling, there may be a fundamental prerequisite gap that was not caught in assessment. Return to Step 1 and probe deeper. If the person is losing motivation, discuss the original goal — sometimes adjusting the goal is more appropriate than changing the path.

### Step 6: Review — Consolidate and Plan Next Session

Solidify what was learned and set up for continued learning.

1. Summarize what was covered: "Today we learned X, Y, and Z"
2. Ask them to state the key takeaway in their own words
3. Provide a brief practice exercise for independent work (not homework — optional reinforcement)
4. Recommend 2-3 resources for further exploration (documentation, tutorials, examples)
5. If using spaced repetition: schedule review points — "Review these concepts again in 2 days, then in a week"
6. Set up the next milestone: "Next time, we will tackle..."
7. Ask for feedback: "What worked well? What could I do differently?"

**Expected:** The person leaves with clear understanding of what they learned, what they can practice, and what comes next. The session has a clean closing, not an abrupt stop.

**On failure:** If the person cannot state a key takeaway, the session covered too much or too little stuck. Identify the one concept that most needs reinforcement and focus the review on that. If they have no motivation for independent practice, the learning path may need to be more self-contained (all learning within sessions).

## Validation

- [ ] Starting position was assessed before the learning path was designed
- [ ] The learning path has clear milestones ordered by dependency
- [ ] Material was presented in small chunks with comprehension checks between them
- [ ] Testing used application questions, not just recall
- [ ] The path was adapted at least once based on the person's actual progress
- [ ] The session ended with a summary, practice suggestion, and next steps
- [ ] The person felt encouraged throughout, not tested or judged

## Common Pitfalls

- **Information dumping**: Providing all the material at once instead of pacing it through milestones. Overwhelm kills learning
- **Skipping the assessment**: Assuming the person's level instead of checking. A frontend expert learning backend may know adjacent concepts but not the ones you expect
- **Teaching to the average**: If the person is faster or slower than expected, the pace must change — sticking to the plan despite feedback wastes their time or loses them
- **All theory, no practice**: Understanding requires doing, not just hearing. Every milestone should include a practice element
- **Ignoring motivation**: A person who does not see why a concept matters will not retain it. Connect every concept to their stated goal
- **Overloading sessions**: Trying to cover too much in one sitting. Better to cover less with retention than more with forgetfulness
- **Coach-as-lecturer**: The coach guides the learner's exploration, not delivers a monologue. Ask more questions than you answer

## Related Skills

- `learn` — the AI self-directed variant for systematic knowledge acquisition
- `teach-guidance` — coaching a person to teach others; complementary to learning coaching
- `meditate-guidance` — clearing mental noise before a learning session improves focus and retention
- `remote-viewing-guidance` — shares the structured observation approach that supports learning from experience
