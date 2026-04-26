---
name: observe-guidance
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Guide a person in systematic observation of systems, patterns, or
  phenomena. AI coaches neutral attention, field notes methodology,
  pattern recognition, hypothesis formation, and structured reporting
  for debugging, research, and system understanding. Use when a person
  wants to understand a system's behavior before intervening, when someone
  keeps jumping to conclusions and needs the discipline of observation first,
  when preparing an evidence-based report, or when studying team dynamics
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

Coach human in field study: frame → protocol → witness → record → analyze → report. Separate fact from interpretation.

## Use When

- Person wants understand system before intervene (debug by obs, not trial-error)
- Conducting research / evidence → needs structured method
- Person jumps to conclusions → needs obs discipline
- Preparing evidence-based report (not opinion)
- Team dynamics, user behavior, process effectiveness via direct obs
- After `meditate-guidance` cultivated attention → direct it at system

## In

- **Required**: What to observe (system, process, behavior, codebase, team, phenomenon)
- **Required**: Why (debug, research, audit, curiosity, improvement)
- **Optional**: Time available (single vs multi-day)
- **Optional**: Prior attempts
- **Optional**: Specific Qs / hypotheses
- **Optional**: Recording tools (notebook, screen capture, logging, metrics)

## Do

### Step 1: Frame

Help set bounded frame.

1. Ask what: "What system/behavior trying to understand?"
2. Narrow scope: "What specific aspect interests you most?"
3. Purpose: understanding / debug / improve / evidence / curiosity
4. Boundaries: in/out scope → prevents endless expansion
5. Hypothesis? state explicit, then set aside → "look for evidence both for + against"
6. Stance:
   - **Naturalist**: no interfere (best for behavior)
   - **Controlled**: change one var, observe effect (best for debug)
   - **Longitudinal**: over time (best for trends)

→ Clear frame: target, scope, purpose, stance defined.

If err: can't narrow ("understand everything") → pick one entry point: "what behavior most confusing?" Already committed conclusion ("just prove X") → gently challenge: "what would disprove it?"

### Step 2: Prep protocol

Systematic recording.

1. Method by type:
   - **Codebase/system**: paths, line numbers, timestamps, log entries
   - **Behavior/process**: time-stamped notes — actor, action, context
   - **Team/communication**: quotes, speaker IDs, non-verbal cues
   - **Natural/physical**: sketches, measurements, env conditions
2. Template:

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

3. Stress separation: "obs row = fact. hypothesis row = interpretation. Never mix."
4. Min count: "≥10 obs before any conclusion"
5. Set up monitoring tools if applicable

→ Recording method ready. Person gets obs↔interpretation distinction. Prepared.

If err: too formal → simplify: "write what you see, separately what you think it means." Resist recording ("I'll remember") → unrecorded = memory bias; writing makes obs accurate.

### Step 3: Witness

Guide actual obs session.

1. Remind stance: "naturalist studying new species. No interfere — just watch"
2. First 5min: pure obs no recording — just attend
3. After immersion: begin recording w/ template
4. Coach neutral lang: instead "system crashed" → "system stopped responding 14:32 after 47th request"
5. Watch interpretation creeping: "that's interpretation — record in hypothesis row"
6. Note surprises: "what surprised? surprises = most valuable data"
7. Check frame: "still observing what set out, or drifted?"
8. Wants to intervene: "note what + why, but don't change yet — keep observing"

→ ≥5-10 concrete obs w/ specific evidence. Experiences obs vs interpret diff. Finds harder than expected.

If err: keep interpreting → exercise: "describe as if to someone never seen this. Only verifiable facts." Run out fast → too high level → zoom in: timing, ordering, edge cases, exceptions.

### Step 4: Record

Organize raw → structured.

1. Review together
2. Completeness: enough context for later?
3. Factual accuracy: verifiable, or hidden assumptions?
4. Group similar: "patterns forming?"
5. Frequencies: how often?
6. Absences: "what expected but not there?"
7. Strong (clear evidence) vs weak (ambiguous)

→ Organized field notes cleanly separate obs from interpretation. Detailed enough another can verify.

If err: too vague ("things slow") → add specifics: "how slow? compared to what? which conditions?" Too detailed (record everything) → which relate to frame, which noise.

### Step 5: Analyze

Obs → structured analysis.

1. Look for patterns:
   - **Repetition**: "happened many times — systematic?"
   - **Correlation**: "X always w/ Y — related?"
   - **Sequence**: "A always before B — A causes B?"
   - **Absence**: "X never in condition Z — why?"
   - **Anomaly**: "all follow P except this — what diff?"
2. Each pattern: "alternative explanation?"
3. 2-3 hypotheses
4. Correlation ≠ causation: "co-occur ≠ proves cause"
5. Testable + what test confirms/refutes
6. Confidence levels: well-supported vs speculative

→ Raw obs → structured hypotheses, data/theory separation kept. ≥1 testable hypothesis for original Q.

If err: jumps single explanation → challenge: "one possibility. another?" No patterns → too few obs → continue. Every obs same conclusion → filtering → ask: "what would contradict your theory?"

### Step 6: Report

Communicate findings.

1. Structure:
   - **Context**: what/when/why/conditions
   - **Method**: protocol, tools, duration
   - **Findings**: key obs w/ evidence (data, not interpretation)
   - **Analysis**: patterns, hypotheses, confidence
   - **Recommendations**: next steps (more obs, test, intervene)
   - **Limitations**: not covered, potential biases
2. Findings in neutral lang separating fact from interpretation
3. Review for hidden assumptions / unsupported claims
4. Debug? translate hypotheses → concrete tests
5. Report? evidence cited specifically
6. Personal? summarize insights + remaining Qs

→ Clear report communicates obs/patterns/hypotheses, distinction kept. Reader can evaluate evidence independently.

If err: buries obs in interpretation → restructure: "facts one section, theories another." No confidence ("definitely because...") → calibrate: "how sure? what would change mind?"

## Check

- [ ] Frame set before obs (not wandering)
- [ ] Recording protocol established + used consistently
- [ ] Obs as facts, separate from interpretations
- [ ] ≥5 concrete evidence-backed obs
- [ ] Patterns from analysis, not assumed
- [ ] Hypotheses testable, stated confidence
- [ ] Person experienced obs-before-interpret discipline

## Traps

- **Confirmation bias**: only obs supporting belief. Frame must include "look for evidence against your hypothesis"
- **Intervention urge**: see + fix immediately → masks root cause → observe first
- **Recording fatigue**: detail = taxing. Breaks + realistic lengths (30-60min focused = substantial)
- **Over-protocol**: simple obs needs notebook+timestamps. Protocol serves obs, not replaces
- **Obs ≠ surveillance**: ethical boundaries matter. Visible behavior, no spy. People → transparency > secrecy
- **Skip frame**: no target → attention scatters → unfocused. Rough frame > none

## →

- `observe` — AI self-directed variant
- `learn-guidance` — obs feeds learning
- `listen-guidance` — focused obs of speaker; obs broader to any system
- `remote-viewing-guidance` — shares method adapted for non-local
- `read-garden` — garden obs uses similar CRV-adapted sensory protocols
