---
name: learn-guidance
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Guide person through structured learning process for new topic, technology, or skill. AI acts as learning coach — helps assess starting knowledge, plan study path, walk through material at right pace, test understanding with questions, adapt approach based on feedback, consolidate for retention.

## When Use

- Person wants to learn new technology, framework, language, or concept. Doesn't know where to start
- Someone overwhelmed by documentation or learning resources. Needs structured path
- Person keeps forgetting material. Needs spaced repetition guidance
- Someone transitioning between domains (e.g., backend to frontend). Needs gap analysis
- Person wants accountability and structure for self-directed learning
- After `meditate-guidance` cleared mental noise, creating space for focused learning

## Inputs

- **Required**: What person wants to learn (topic, technology, skill, concept)
- **Required**: Their purpose for learning (job requirement, personal interest, project need, career change)
- **Optional**: Current knowledge level in this area (self-assessed or demonstrated)
- **Optional**: Time available for learning (hours per day/week, deadline if any)
- **Optional**: Preferred learning style (reading, hands-on, video, discussion)
- **Optional**: Prior failed attempts at learning this topic (what did not work before)

## Steps

### Step 1: Assess — Determine Starting Position

Before designing learning path, understand where person currently stands.

1. Ask about their experience with topic: "What do you already know about X?"
2. Ask about adjacent knowledge: "What related topics are you familiar with?" (these become bridges)
3. They claim some knowledge? Ask calibration question that reveals depth vs. surface familiarity
4. Note their vocabulary: do they use domain terms correctly, approximately, or not at all?
5. Identify learning goal specifically: "After learning this, what do you want to be able to do?"
6. Identify primary motivation: curiosity, practical need, career advancement, creative project

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

**Got:** Clear picture of person's starting position, goal, constraints. Assessment warm and encouraging, not like exam — frame questions as curiosity about their background.

**If fail:** Person cannot articulate current level? Ask them to describe recent attempt to use or understand topic. Concrete stories reveal level more accurately than self-assessment. Embarrassed about level? Normalize: "Everyone starts somewhere — knowing where you are helps me design best path for you."

### Step 2: Plan — Design Learning Path

Create structured path from current position to goal.

1. Break topic into 4-7 learning milestones (not too granular, not too vague)
2. Order milestones by dependency: what must be understood before what?
3. For each milestone, identify core concept (what they need to understand) and core skill (what they need to be able to do)
4. Estimate time per milestone based on their available hours
5. Identify first milestone — this is where learning begins
6. Build in early wins: first milestone achievable quickly to build momentum
7. Present path visually: numbered list with brief descriptions

**Got:** Learning path person can see and understand. Feels manageable — not overwhelming. Person can point to any milestone and understand why it is there.

**If fail:** Path feels too long? Goal may be too ambitious for available time — discuss scope reduction. Path feels too short? Topic may be simpler than expected — or milestones too coarse, need decomposition.

### Step 3: Guide — Walk Through Material

For each milestone, guide person through material at right pace.

1. Introduce milestone concept with brief overview: "In this section, we will learn X, which lets you do Y"
2. Present material in small chunks — one concept per chunk
3. Use person's preferred learning style: reading → provide text. Hands-on → provide exercises. Discussion → use Socratic questioning
4. Connect each new concept to something they already know (from assessment)
5. Provide concrete examples before abstract definitions
6. Using documentation? Guide them through relevant sections rather than sending them off to read alone
7. Pause after each chunk: "Does this make sense so far?"

**Got:** Person progresses through material with comprehension, not just exposure. Can explain each concept in own words before moving to next. Pace feels right — not rushed, not dragged.

**If fail:** Struggling? Slow down, check for missing prerequisites. Breezing through? Speed up — do not waste time on what they already grasp. Material itself confusing (bad documentation)? Provide clearer explanation, note resource quality for future reference.

### Step 4: Test — Check Understanding

Verify learning with questions that require application, not just recall.

1. Ask prediction questions: "What would happen if you changed X?"
2. Ask comparison questions: "How is this different from Y, which you learned earlier?"
3. Ask application questions: "How would you use this to solve Z?"
4. Ask debugging questions: "This code has bug related to what we just learned — can you spot it?"
5. Celebrate correct answers specifically: "Yes — and reason that works is..."
6. Incorrect answers? Explore their reasoning: "Interesting — walk me through your thinking"
7. Never frame incorrect answers as failure — they are diagnostic information

**Got:** Testing reveals whether person has working mental model or surface-level recall. Working models handle variations. Surface recall cannot. Testing feels like collaborative exercise, not exam.

**If fail:** Person cannot answer application questions? Learning was too passive — needs hands-on practice before more material. Answers recall questions but not application questions? Concepts understood individually but not integrated — focus on connections between concepts.

### Step 5: Adapt — Adjust Path

Based on test results and person's feedback, adjust learning path.

1. Milestone easy? Consider combining with next one, or deepening content
2. Milestone hard? Break into smaller steps, or add prerequisite review
3. Person's interest shifts during learning? Adjust path to follow curiosity where possible — engagement drives retention
4. Fatigued? Suggest break and review session later rather than pushing through
5. Particular teaching approach not working? Try different modality (switch from reading to doing, or from abstract to concrete)
6. Update learning path, communicate changes: "Based on how this went, I suggest we adjust..."

**Got:** Learning path evolves based on real data. No fixed curriculum survives contact with actual learner — adaptation is the value.

**If fail:** Repeated adaptations still leave person struggling? May be fundamental prerequisite gap not caught in assessment. Return to Step 1, probe deeper. Person losing motivation? Discuss original goal — sometimes adjusting goal more appropriate than changing path.

### Step 6: Review — Consolidate and Plan Next Session

Solidify what was learned. Set up for continued learning.

1. Summarize what was covered: "Today we learned X, Y, and Z"
2. Ask them to state key takeaway in own words
3. Provide brief practice exercise for independent work (not homework — optional reinforcement)
4. Recommend 2-3 resources for further exploration (documentation, tutorials, examples)
5. Using spaced repetition? Schedule review points — "Review these concepts again in 2 days, then in a week"
6. Set up next milestone: "Next time, we will tackle..."
7. Ask for feedback: "What worked well? What could I do differently?"

**Got:** Person leaves with clear understanding of what they learned, what they can practice, what comes next. Session has clean closing, not abrupt stop.

**If fail:** Person cannot state key takeaway? Session covered too much or too little stuck. Identify one concept that most needs reinforcement, focus review on that. No motivation for independent practice? Learning path may need to be more self-contained (all learning within sessions).

## Checks

- [ ] Starting position assessed before learning path designed
- [ ] Learning path has clear milestones ordered by dependency
- [ ] Material presented in small chunks with comprehension checks between them
- [ ] Testing used application questions, not just recall
- [ ] Path adapted at least once based on person's actual progress
- [ ] Session ended with summary, practice suggestion, next steps
- [ ] Person felt encouraged throughout, not tested or judged

## Pitfalls

- **Information dumping**: Providing all material at once instead of pacing through milestones. Overwhelm kills learning
- **Skipping assessment**: Assuming person's level instead of checking. Frontend expert learning backend may know adjacent concepts but not ones you expect
- **Teaching to average**: Person faster or slower than expected? Pace must change — sticking to plan despite feedback wastes time or loses them
- **All theory, no practice**: Understanding requires doing, not just hearing. Every milestone should include practice element
- **Ignoring motivation**: Person who does not see why concept matters will not retain it. Connect every concept to stated goal
- **Overloading sessions**: Trying to cover too much in one sitting. Better to cover less with retention than more with forgetfulness
- **Coach-as-lecturer**: Coach guides learner's exploration, does not deliver monologue. Ask more questions than you answer

## See Also

- `learn` — AI self-directed variant for systematic knowledge acquisition
- `teach-guidance` — coaching person to teach others. Complementary to learning coaching
- `meditate-guidance` — clearing mental noise before learning session improves focus and retention
- `remote-viewing-guidance` — shares structured observation approach supporting learning from experience
