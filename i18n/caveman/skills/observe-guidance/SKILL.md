---
name: observe-guidance
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Guide person in systematic observation of systems, patterns, or
  phenomena. AI coaches neutral attention, field notes methodology,
  pattern recognition, hypothesis formation, structured reporting
  for debugging, research, system understanding. Use when person
  wants to understand system behavior before intervening, when someone
  keeps jumping to conclusions and needs discipline of observation first,
  when preparing evidence-based report, or when studying team dynamics
  or process effectiveness through direct observation.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, observation, field-study, pattern-recognition, debugging, guidance
---

# Observe (Guidance)

Guide person in systematic observation of system, phenomenon, or pattern. AI acts as field study coach — frame target, prepare protocol, sustain neutral attention, record findings with field notes, analyze patterns, report observations with clear separation of data and interpretation.

## When Use

- Person wants to understand system behavior before intervening (debug by observation rather than trial and error)
- Someone conducting research or gathering evidence, needs structured observation methodology
- Person keeps jumping to conclusions, needs discipline of observation before interpretation
- Someone preparing report requiring evidence-based findings, not opinions
- Person wants to understand team dynamics, user behavior, or process effectiveness through direct observation
- After `meditate-guidance` cultivated sustained attention, person wants to direct it toward specific system

## Inputs

- **Required**: What person wants to observe (system, process, behavior, codebase, team dynamic, natural phenomenon)
- **Required**: Why observing (debugging, research, audit, curiosity, improvement)
- **Optional**: Time available (single session vs. multi-day study)
- **Optional**: Prior attempts to understand system (what already tried)
- **Optional**: Specific questions or hypotheses to test
- **Optional**: Tools for recording (notebook, screen capture, logging, metrics)

## Steps

### Step 1: Frame — Define Observation Target

Help person set up clear, bounded frame.

1. Ask what they want to observe: "What system or behavior trying to understand?"
2. Help narrow scope: "What specific aspect of that system interests you most?"
3. Identify purpose: understanding, debugging, improvement, evidence-gathering, pure curiosity
4. Set boundaries: what in scope and what not (prevents endless expansion)
5. They have hypothesis? State explicitly, then set aside — "We look for evidence both for and against"
6. Choose stance:
   - **Naturalist**: observe without interfering (best for understanding behavior)
   - **Controlled**: change one variable, observe effect (best for debugging)
   - **Longitudinal**: observe over time (best for detecting trends)

**Got:** Clear frame with defined target, scope, purpose, stance. Person knows what they look at and what not.

**If fail:** Person can't narrow focus ("I want to understand everything")? Help pick one entry point: "What is one behavior you find most confusing?" Already committed to conclusion ("just need to prove X")? Gently challenge: "What would we need to see to disprove that? Let's look for both."

### Step 2: Prepare — Set Up Protocol

Help person establish systematic recording approach.

1. Choose method based on observation type:
   - **Codebase/system**: file paths, line numbers, timestamps, log entries
   - **Behavior/process**: time-stamped notes with actor, action, context
   - **Team/communication**: quotes, speaker IDs, non-verbal cues
   - **Natural/physical**: sketches, measurements, environmental conditions
2. Create simple template:

```
Field Notes Template:
┌─────────────┬────────────────────────────────────────────────────────┐
│ Timestamp   │ When the observation occurred                          │
├─────────────┼────────────────────────────────────────────────────────┤
│ Observation │ What was seen/heard/measured (fact only)               │
├─────────────┼────────────────────────────────────────────────────────┤
│ Context     │ What was happening around the observation              │
├─────────────┼────────────────────────────────────────────────────────┤
│ Reaction    │ Observer's response (thoughts, emotions, surprises)    │
├─────────────┼────────────────────────────────────────────────────────┤
│ Hypothesis  │ Tentative interpretation (kept separate from fact)     │
└─────────────┴────────────────────────────────────────────────────────┘
```

3. Emphasize separation: "Observation row is fact. Hypothesis row is interpretation. Never mix."
4. Set minimum count: "Aim for at least 10 observations before drawing conclusions"
5. If applicable, set up monitoring tools: logging, metrics, screen recording

**Got:** Person has recording method ready, understands critical distinction between observation and interpretation. Feels prepared to begin.

**If fail:** Template feels too formal? Simplify: "Just write what you see, separately write what you think it means." Resist recording ("I'll remember")? Explain unrecorded observations subject to memory bias — writing makes observation more accurate.

### Step 3: Observe — Practice Sustained Neutral Attention

Guide person through actual session.

1. Remind them of stance: "You are naturalist studying new species. Do not interfere — just watch"
2. First 5 minutes: encourage pure observation without recording — just attend
3. After initial immersion: begin recording using template
4. Coach neutral language: "Instead of 'system crashed,' try 'system stopped responding at 14:32 after processing 47th request'"
5. Watch for interpretation creeping into observation: "That is interpretation — record in hypothesis row"
6. Encourage noting surprises: "What surprised you? Surprises often contain most valuable data"
7. Periodically check frame: "Still observing what you set out to, or has attention drifted?"
8. They want to intervene? "Note what you want to change and why, but don't change yet — keep observing"

**Got:** Person generates at least 5-10 concrete observations with specific evidence. Experiences difference between observing and interpreting, finds it harder than expected to maintain neutral attention.

**If fail:** Keeps interpreting instead of observing? Try this exercise: "Describe what you see as if explaining to someone who has never seen this system. Only verifiable facts." Run out of things quickly? Looking too high level — guide to zoom in: timing, ordering, edge cases, exceptions.

### Step 4: Record — Capture Findings with Field Notes

Help person organize raw observations into structured notes.

1. Review recorded observations together
2. Check completeness: each observation has enough context to be understood later?
3. Check factual accuracy: statements verifiable, or contain hidden assumptions?
4. Group similar observations: "Any patterns forming?"
5. Note frequencies: how often did each pattern appear?
6. Note absences: "What did you expect to see that wasn't there?"
7. Help separate strong observations (clear evidence) from weak (ambiguous data)

**Got:** Set of organized field notes cleanly separating observation from interpretation. Detailed enough someone else could verify observations independently.

**If fail:** Notes too vague ("things seemed slow")? Help add specifics: "How slow? Compared to what? In which conditions?" Too detailed (recording everything)? Help identify which observations relate to original frame, which are noise.

### Step 5: Analyze — Identify Patterns and Generate Hypotheses

Guide person from observations to structured analysis.

1. Lay out observations, look for patterns:
   - **Repetition**: "This happened multiple times — systematic?"
   - **Correlation**: "X always happens with Y — related?"
   - **Sequence**: "A always precedes B — could A cause B?"
   - **Absence**: "X never happens in condition Z — why?"
   - **Anomaly**: "Everything follows pattern P except this one case — what's different?"
2. For each pattern, ask: "Alternative explanation?"
3. Generate 2-3 hypotheses explaining major patterns
4. Distinguish correlation and causation: "Observing A and B co-occur doesn't prove A causes B"
5. Identify testable hypotheses, what test confirms/refutes them
6. Note confidence levels: which well-supported, which speculative?

**Got:** Person moves from raw observations to structured hypotheses while maintaining discipline of separating data from theory. Has at least one testable hypothesis for original question.

**If fail:** Jumps to single explanation immediately? Challenge: "That's one possibility. What's another?" Sees no patterns? Observations may be too few — continue observation before analysis. Every observation points to same conclusion? May be filtering — ask: "What evidence would contradict your current theory?"

### Step 6: Report — Share Findings with Clear Structure

Help person communicate observations effectively.

1. Structure report:
   - **Context**: What observed, when, why, under what conditions
   - **Method**: How observation conducted (protocol, tools, duration)
   - **Findings**: Key observations with evidence (data, not interpretation)
   - **Analysis**: Patterns identified, hypotheses generated, confidence levels
   - **Recommendations**: Next steps (further observation, testing, intervention)
   - **Limitations**: What observation did not cover, potential biases
2. Help write findings in neutral language separating fact from interpretation
3. Review for hidden assumptions or unsupported claims
4. Observations for debugging? Translate hypotheses into concrete tests
5. Observations for report? Ensure evidence cited specifically
6. Observations for personal understanding? Summarize key insights and remaining questions

**Got:** Clear report communicating observations, patterns, hypotheses while maintaining distinction between what observed and what inferred. Reader can evaluate evidence independently.

**If fail:** Report buries observations in interpretation? Restructure: "Put all facts in one section, all theories in another." Lacks confidence levels ("this is definitely because...")? Help calibrate: "How sure? What would change your mind?"

## Checks

- [ ] Frame set before observation began (not free-form wandering)
- [ ] Recording protocol established and used consistently
- [ ] Observations recorded as facts, separate from interpretations
- [ ] At least 5 concrete, evidence-backed observations captured
- [ ] Patterns identified through analysis, not assumed from start
- [ ] Hypotheses testable, with stated confidence levels
- [ ] Person experienced discipline of observing before interpreting

## Pitfalls

- **Observation as confirmation bias**: Observing only things supporting pre-existing belief. Frame should include "look for evidence against your hypothesis" as explicit instruction
- **Intervention urge**: Seeing problem and wanting to fix immediately. Premature intervention masks root cause — observe first, then intervene with full understanding
- **Recording fatigue**: Detailed observation mentally taxing. Suggest breaks and realistic session lengths (30-60 min focused observation is substantial)
- **Overcomplicating protocol**: For simple observations, notebook and timestamps enough. Protocol should serve observation, not replace it
- **Confusing observation with surveillance**: In interpersonal observation, ethical boundaries matter. Observe visible behavior, don't spy. If observing people, transparency usually better than secrecy
- **Skipping frame**: Without clear target, attention scatters, findings unfocused. Even rough frame better than none

## See Also

- `observe` — AI self-directed variant for sustained neutral pattern recognition across systems
- `learn-guidance` — observation feeds learning by providing raw data for understanding
- `listen-guidance` — listening is focused observation of speaker; observation broader-scope attention to any system
- `remote-viewing-guidance` — shares structured observation methodology adapted for non-local perception
- `read-garden` — garden observation skill using similar CRV-adapted sensory protocols
