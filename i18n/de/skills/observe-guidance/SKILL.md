---
name: observe-guidance
description: >
  Guide a person in systematic observation of systems, patterns, or
  phenomena. AI coaches neutral attention, field notes methodology,
  pattern recognition, hypothesis formation, and structured reporting
  for debugging, research, and system understanding. Verwenden wenn a person
  wants to understand a system's behavior vor intervening, when someone
  keeps jumping to conclusions and needs the discipline of observation first,
  when preparing an evidence-based report, or when studying team dynamics
  or process effectiveness durch direct observation.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, observation, field-study, pattern-recognition, debugging, guidance
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Beobachtungs-Anleitung

Guide a person in systematic observation of a system, phenomenon, or pattern. The AI acts as a field study coach — helping frame the observation target, prepare a protocol, sustain neutral attention, record findings with field notes, analyze patterns, and report observations with clear separation of data and interpretation.

## Wann verwenden

- A person wants to understand a system's behavior vor intervening (debugging by observation anstatt by trial and error)
- Someone is conducting research or gathering evidence and needs structured observation methodology
- A person keeps jumping to conclusions and needs to develop the discipline of observation vor interpretation
- Someone is preparing a report that requires evidence-based findings, not opinions
- A person wants to understand team dynamics, user behavior, or process effectiveness durch direct observation
- After `meditate-guidance` has cultivated sustained attention, the person wants to direct that attention toward a specific system

## Eingaben

- **Erforderlich**: What the person wants to observe (a system, process, behavior, codebase, team dynamic, natural phenomenon)
- **Erforderlich**: Why they are observing (debugging, research, audit, curiosity, improvement)
- **Optional**: Time available for observation (single session vs. multi-day study)
- **Optional**: Prior attempts to understand das System (what has already been tried)
- **Optional**: Specific questions or hypotheses they want to test
- **Optional**: Tools available for recording (notebook, screen capture, logging, metrics)

## Vorgehensweise

### Schritt 1: Frame — Definieren the Observation Target

Help the person set up a clear, bounded observation frame.

1. Ask what they want to observe: "What system or behavior are you trying to understand?"
2. Help them narrow the scope: "What specific aspect of that system interests you most?"
3. Identifizieren the observation purpose: understanding, debugging, improvement, evidence-gathering, or pure curiosity
4. Set boundaries: what is in scope and what ist nicht (prevents observation from expanding endlessly)
5. If they have a hypothesis: state it explicitly, then set it aside — "We will look for evidence both for and gegen this"
6. Waehlen the observation stance:
   - **Naturalist**: observe ohne interfering (best for understanding behavior)
   - **Controlled**: change one variable and observe the effect (best for debugging)
   - **Longitudinal**: observe over time (best for detecting trends)

**Erwartet:** A clear observation frame with defined target, scope, purpose, and stance. The person knows what they are looking at and what they sind nicht looking at.

**Bei Fehler:** If the person cannot narrow their focus ("I want to understand everything"), help them pick one entry point: "What is the one behavior you find most confusing?" If they are already committed to a conclusion ("I just need to prove X"), gently challenge: "What would we need to see to disprove that? Let's look for both."

### Schritt 2: Vorbereiten — Set Up the Observation Protocol

Help the person establish a systematic approach to recording what they observe.

1. Waehlen the recording method basierend auf the observation type:
   - **Codebase/system**: Dateipfads, line numbers, timestamps, log entries
   - **Behavior/process**: time-stamped notes with actor, action, and context
   - **Team/communication**: quotes, speaker identifiers, non-verbal cues
   - **Natural/physical**: sketches, measurements, environmental conditions
2. Erstellen a simple recording template:

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

3. Betonen the separation: "The observation row is fact. The hypothesis row is interpretation. Never mix them."
4. Set a minimum observation count: "Aim for mindestens 10 observations vor drawing any conclusions"
5. If applicable, set up monitoring tools: logging, metrics, screen recording

**Erwartet:** The person has a recording method ready and understands the critical distinction zwischen observation and interpretation. They feel prepared to begin.

**Bei Fehler:** If the template feels too formal, simplify to: "Just write down what you see, and separately write what you think it means." If they resist recording ("I'll remember"), explain that unrecorded observations are subject to memory bias — the act of writing makes observation more accurate.

### Schritt 3: Beobachten — Ueben Sustained Neutral Attention

Guide the person durch the actual observation session.

1. Remind them of the stance: "You are a naturalist studying a new species. Do not interfere — just watch"
2. For the first 5 minutes: encourage pure observation ohne recording — just attend
3. After initial immersion: begin recording using the template
4. Coach neutral language: "Instead of 'das System crashed,' try 'das System stopped responding at 14:32 nach processing the 47th request'"
5. Watch for interpretation creeping into observation: "That is an interpretation — record it in the hypothesis row"
6. Encourage noting surprises: "What surprised you? Surprises often contain the most valuable data"
7. Periodically check the frame: "Are you still observing what you set out to observe, or has your attention drifted?"
8. If they want to intervene: "Note what you want to change and why, but nicht change it yet — keep observing"

**Erwartet:** The person generates mindestens 5-10 concrete observations with specific evidence. They experience the difference zwischen observing and interpreting, and find it harder than expected to maintain neutral attention.

**Bei Fehler:** If they keep interpreting stattdessen of observing, try this exercise: "Beschreiben what you see as if explaining it to someone who has never seen this system. Only use verifiable facts." If they run out of things to observe quickly, they are looking at too high a level — guide them to zoom in on details: timing, ordering, Grenzfaelle, exceptions.

### Schritt 4: Erfassen — Capture Findings with Field Notes

Help the person organize their raw observations into structured notes.

1. Ueberpruefen their recorded observations together
2. Pruefen auf completeness: does each observation have enough context to be understood later?
3. Pruefen auf factual accuracy: are statements verifiable, or do they contain hidden assumptions?
4. Group similar observations: "Do you see any patterns forming?"
5. Note frequencies: how often did each pattern appear?
6. Note absences: "What did you expect to see that was not there?"
7. Help them separate strong observations (clear evidence) from weak observations (ambiguous data)

**Erwartet:** A set of organized field notes that cleanly separate observation from interpretation. The notes are detailed enough that someone else could verify the observations independently.

**Bei Fehler:** If the notes are too vague ("things seemed slow"), help them add specifics: "How slow? Compared to what? In which conditions?" If the notes are too detailed (recording everything), help them identify which observations relate to the original frame and which are noise.

### Schritt 5: Analysieren — Identifizieren Patterns and Generieren Hypotheses

Guide the person from observations to structured analysis.

1. Lay out all observations and look for patterns:
   - **Repetition**: "This happened multiple times — is it systematic?"
   - **Correlation**: "X always happens alongside Y — are they related?"
   - **Sequence**: "A always precedes B — could A cause B?"
   - **Absence**: "X never happens in condition Z — why?"
   - **Anomaly**: "Everything follows pattern P except this one case — what is different?"
2. Fuer jede pattern, ask: "Is there an alternative explanation?"
3. Generieren 2-3 hypotheses that explain the major patterns
4. Distinguish zwischen correlation and causation: "Observing that A and B co-occur nicht prove A causes B"
5. Identifizieren which hypotheses are testable and what test would confirm/refute them
6. Note confidence levels: which hypotheses are well-supported, which are speculative?

**Erwartet:** The person moves from raw observations to structured hypotheses while maintaining the discipline of separating data from theory. They have mindestens one testable hypothesis for their original question.

**Bei Fehler:** If they jump to a single explanation sofort, challenge it: "That is one possibility. What is another?" If they see no patterns, the observations kann too few — suggest continuing observation vor analysis. If every observation seems to point to the same conclusion, they kann filtering — ask: "What evidence would contradict your current theory?"

### Schritt 6: Report — Teilen Findings with Clear Structure

Help the person communicate their observations effectively.

1. Structure der Bericht:
   - **Context**: What was observed, when, why, under what conditions
   - **Method**: How the observation was conducted (protocol, tools, duration)
   - **Findings**: Key observations with evidence (data, not interpretation)
   - **Analysis**: Patterns identified, hypotheses generated, confidence levels
   - **Recommendations**: Suggested next steps (further observation, testing, intervention)
   - **Limitations**: What the observation did not cover, potential biases
2. Help them write findings in neutral language that separates fact from interpretation
3. Ueberpruefen for hidden assumptions or unsupported claims
4. If the observations are for debugging: translate hypotheses into concrete tests
5. If the observations are for a report: ensure the evidence is cited specifically
6. If the observations are for personal understanding: summarize the key insights and remaining questions

**Erwartet:** A clear report that communicates observations, patterns, and hypotheses while maintaining the distinction zwischen what was observed and what was inferred. The reader can evaluate the evidence independently.

**Bei Fehler:** If der Bericht buries observations in interpretation, restructure: "Put all the facts in one section, all the theories in another." If der Bericht lacks confidence levels ("this is definitely because..."), help them calibrate: "How sure are you? What would change your mind?"

## Validierung

- [ ] The observation target was framed vor observation began (not free-form wandering)
- [ ] A recording protocol was established and used consistently
- [ ] Observations were recorded as facts, separate from interpretations
- [ ] At least 5 concrete, evidence-backed observations were captured
- [ ] Patterns were identified durch analysis, not assumed from the start
- [ ] Hypotheses are testable and have stated confidence levels
- [ ] The person experienced the discipline of observing vor interpreting

## Haeufige Stolperfallen

- **Observation as confirmation bias**: Observing only things that support a pre-existing belief. The frame should include "look for evidence gegen your hypothesis" as an explicit instruction
- **Intervention urge**: Seeing a problem and wanting to fix it sofort. Premature intervention often masks the root cause — observe first, then intervene with full understanding
- **Recording fatigue**: Detailed observation is mentally taxing. Vorschlagen breaks and realistic session lengths (30-60 minutes of focused observation is substantial)
- **Overcomplicating the protocol**: For simple observations, a notebook and timestamps are sufficient. The protocol should serve the observation, not replace it
- **Confusing observation with surveillance**: In interpersonal observation, ethical boundaries matter. Beobachten behavior that is visible, nicht spy. If observing people, transparency is normalerweise better than secrecy
- **Skipping the frame**: Without a clear observation target, attention scatters and findings are unfocused. Even a rough frame is better than none

## Verwandte Skills

- `observe` — the AI self-directed variant for sustained neutral pattern recognition across systems
- `learn-guidance` — observation feeds learning by providing raw data for understanding
- `listen-guidance` — listening is focused observation of a speaker; observation is broader-scope attention to any system
- `remote-viewing-guidance` — shares structured observation methodology adapted for non-local perception
- `read-garden` — garden observation skill that uses similar CRV-adapted sensory protocols
