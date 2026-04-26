---
name: learn-guidance
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Guide person thru structured learning of new topic / tech / skill. AI as
  coach — assess knowledge, design path, walk material, test understanding,
  adapt difficulty, plan review for retention. Use when person wants to learn
  new tech + doesn't know where to start, overwhelmed by docs, keeps forgetting
  + needs spaced repetition, or transitioning domains + needs gap analysis.
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

Guide person thru structured learning for new topic / tech / skill. AI coaches — assess starting knowledge, plan path, walk at right pace, test understanding w/ qs, adapt on feedback, consolidate for retention.

## Use When

- Person wants new tech / framework / lang / concept, doesn't know where to start
- Overwhelmed by docs / resources, needs structured path
- Keeps forgetting, needs spaced repetition guidance
- Transitioning domains (e.g., backend → frontend), needs gap analysis
- Wants accountability + structure for self-directed
- After `meditate-guidance` clears noise → space for focused learning

## In

- **Req**: What to learn (topic, tech, skill, concept)
- **Req**: Purpose (job, interest, project, career change)
- **Opt**: Current knowledge level (self-assessed / demonstrated)
- **Opt**: Time avail (hr/day/week, deadline)
- **Opt**: Preferred style (reading, hands-on, video, discussion)
- **Opt**: Prior failed attempts (what didn't work)

## Do

### Step 1: Assess — Starting Position

Before designing path → understand where person stands.

1. Ask experience: "What do you already know about X?"
2. Ask adjacent knowledge: "What related topics familiar?" (become bridges)
3. Some knowledge claimed → calibration q revealing depth vs surface
4. Note vocab: domain terms correct, approximate, or none?
5. ID goal specifically: "After learning this, what want to do?"
6. ID motivation: curiosity, practical, career, creative

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

→ Clear picture of starting pos, goal, constraints. Warm + encouraging, not exam — frame qs as curiosity.

**If err:** Can't articulate current level → ask to describe recent attempt. Concrete stories reveal level > self-assessment. Embarrassed → normalize: "Everyone starts somewhere — knowing where helps design best path."

### Step 2: Plan — Design Path

Create structured path from current pos → goal.

1. Break into 4-7 milestones (not too granular, not vague)
2. Order by dependency: what before what?
3. Per milestone → core concept + core skill
4. Estimate time per milestone from avail hours
5. ID first milestone — learning begins
6. Build early wins: first milestone achievable quickly → momentum
7. Present visually: numbered list w/ brief descriptions

→ Path person sees + understands. Feels manageable, not overwhelming. Person can point to any milestone + understand why there.

**If err:** Too long → goal ambitious for time → discuss scope reduction. Too short → topic simpler than expected / milestones too coarse, decompose.

### Step 3: Guide — Walk Material

Per milestone → guide at right pace.

1. Brief overview: "In this section, learn X → do Y"
2. Present in small chunks — one concept per chunk
3. Use preferred style: reading → text; hands-on → exercises; discussion → Socratic
4. Connect each new concept to something known (from assessment)
5. Concrete examples before abstract definitions
6. Using docs → guide thru relevant sections, don't send off to read alone
7. Pause per chunk: "Make sense so far?"

→ Person progresses w/ comprehension, not just exposure. Can explain each concept in own words before next. Pace feels right.

**If err:** Struggling → slow down, check missing prereqs. Breezing → speed up, don't waste time. Material confusing (bad docs) → clearer explanation + note resource quality.

### Step 4: Test — Check Understanding

Verify learning w/ application qs, not recall.

1. Prediction: "What would happen if changed X?"
2. Comparison: "How diff from Y learned earlier?"
3. Application: "How use this to solve Z?"
4. Debug: "This code has bug related to what we learned — spot it?"
5. Celebrate correct answers specifically: "Yes — reason that works is..."
6. Incorrect → explore reasoning: "Walk me thru your thinking"
7. Never frame incorrect as failure → diagnostic info

→ Testing reveals working model vs surface recall. Working handles variations; surface can't. Collaborative, not exam.

**If err:** Can't answer application → learning too passive, need hands-on before more. Recall yes, application no → concepts individual but not integrated → focus connections.

### Step 5: Adapt — Adjust Path

Based on tests + feedback → adjust.

1. Easy milestone → combine w/ next, or deepen content
2. Hard → break smaller, add prereq review
3. Interest shifts → adjust to curiosity where possible — engagement drives retention
4. Fatigued → break + review later vs push thru
5. Teaching approach not working → diff modality (reading→doing, abstract→concrete)
6. Update path + communicate: "Based on how this went, suggest adjust..."

→ Path evolves on real data. No fixed curriculum survives contact w/ actual learner — adaptation = value.

**If err:** Repeated adaptations still struggle → fundamental prereq gap missed in assessment → return Step 1, probe deeper. Losing motivation → discuss original goal — adjusting goal sometimes > changing path.

### Step 6: Review — Consolidate + Plan Next

Solidify + setup continued learning.

1. Summarize covered: "Today learned X, Y, Z"
2. Ask person state key takeaway in own words
3. Brief practice for indep work (not homework — optional reinforcement)
4. Recommend 2-3 resources (docs, tutorials, examples)
5. Spaced repetition → schedule reviews: "Review again in 2 days, then week"
6. Next milestone: "Next time, tackle..."
7. Ask feedback: "What worked? What diff?"

→ Person leaves w/ clear understanding of learned, practice, next. Clean closing, not abrupt stop.

**If err:** Can't state takeaway → covered too much / too little stuck. ID one concept most needing reinforcement + focus review. No motivation for indep practice → path more self-contained (all learning in sessions).

## Check

- [ ] Starting position assessed before path designed
- [ ] Path has clear milestones ordered by dependency
- [ ] Material presented in small chunks w/ comprehension checks
- [ ] Testing used application qs, not just recall
- [ ] Path adapted ≥1 based on actual progress
- [ ] Session ended w/ summary, practice suggestion, next steps
- [ ] Person felt encouraged, not tested / judged

## Traps

- **Info dumping**: All material at once vs pacing thru milestones. Overwhelm kills learning.
- **Skip assessment**: Assume level vs check. Frontend expert learning backend may know adjacent concepts but not ones you expect.
- **Teach to average**: Person faster / slower than expected → pace must change. Stick to plan despite feedback → wastes time / loses them.
- **All theory, no practice**: Understanding requires doing. Every milestone → practice element.
- **Ignore motivation**: Person doesn't see why matters → won't retain. Connect concepts to stated goal.
- **Overload sessions**: Too much one sitting. Less w/ retention > more w/ forgetting.
- **Coach-as-lecturer**: Coach guides exploration, doesn't monologue. More qs than answers.

## →

- `learn` — AI self-directed variant → systematic knowledge acquisition
- `teach-guidance` — coach person to teach others; complementary to learning coaching
- `meditate-guidance` — clear noise before learning → improves focus + retention
- `remote-viewing-guidance` — shares structured observation supporting learning from experience
