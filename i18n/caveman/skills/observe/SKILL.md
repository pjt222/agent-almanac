---
name: observe
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Sustained neutral pattern recognition across systems without urgency or
  intervention. Maps naturalist field study to AI reasoning: framing
  observation target, witnessing with sustained attention, recording patterns,
  categorizing findings, generating hypotheses, archiving pattern library
  for future reference. Use when system behavior unclear and action premature,
  when debugging unknown root cause, when codebase change needs effects
  witnessed before further changes, or when auditing own reasoning patterns
  for biases or recurring errors.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, observation, pattern-recognition, naturalist, field-study, meta-cognition
---

# Observe

Conduct structured observation session — frame target, witness with sustained neutral attention, record patterns without interpretation, categorize findings, generate hypotheses from patterns, archive observations for future reference.

## When Use

- System behavior unclear, action without observation premature
- Debugging unknown cause — observation before intervention prevents masking symptoms
- Codebase or system changed, effects need witnessing before more changes
- Understanding user behavior patterns over conversation to improve future interactions
- Auditing own reasoning patterns for biases, habits, recurring errors
- After `learn` built model needing validation through observation

## Inputs

- **Required**: Observation target — system, codebase, behavior pattern, user interaction, or reasoning process to observe
- **Optional**: Observation duration/scope — how long or deep before concluding
- **Optional**: Specific question or hypothesis to guide focus
- **Optional**: Prior observations to compare against (detect change over time)

## Steps

### Step 1: Frame — Set Observation Focus

Define what observed, why, from what perspective.

```
Observation Protocol by System Type:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ System Type      │ What to Observe          │ Categories to Watch      │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Codebase         │ File structure, naming   │ Patterns, anti-patterns, │
│                  │ conventions, dependency  │ consistency, dead code,  │
│                  │ flow, test coverage,     │ documentation quality,   │
│                  │ error handling patterns  │ coupling between modules │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ User behavior    │ Question patterns,       │ Expertise signals, pain  │
│                  │ vocabulary evolution,    │ points, unstated needs,  │
│                  │ repeated requests,       │ learning trajectory,     │
│                  │ emotional signals        │ communication style      │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Tool / API       │ Response patterns, error │ Rate limits, edge cases, │
│                  │ conditions, latency,     │ undocumented behavior,   │
│                  │ output format variations │ state dependencies       │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Own reasoning    │ Decision patterns, tool  │ Biases, habits, blind    │
│                  │ selection habits, error  │ spots, strengths,        │
│                  │ recovery approaches,     │ recurring failure modes, │
│                  │ communication patterns   │ over/under-confidence    │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

1. Pick observation target, name explicitly
2. Define boundary: what included, what out of scope
3. State stance: "I observe, not intervene"
4. If guiding question, state it — hold lightly; willing to notice things outside scope
5. Choose categories from matrix above

**Got:** Clear frame directing attention without constraining it. Observer knows where to look and what categories to sort observations into, stays open to unexpected.

**If fail:** Target too broad ("observe everything")? Narrow to one subsystem or behavior pattern. Too narrow ("observe this one variable")? Zoom out — interesting patterns often at edges.

### Step 2: Witness — Sustained Neutral Attention

Hold attention on target without interpreting, judging, intervening.

1. Begin systematic observation: read files, trace paths, review history — whatever target requires
2. Record what seen, not what means — description before interpretation
3. Resist urge to fix problems during observation — note them, continue
4. Resist urge to explain patterns before enough observations accumulate
5. Attention drifts to different target? Note drift (may be meaningful), return to frame
6. Maintain observation defined period: at least 3-5 distinct data points before categorizing

**Got:** Collection of raw observations — specific, concrete, free from interpretation. Reads like field notes: "File X imports Y but does not use function Z. File A has 300 lines; file B has 30 lines, similar functionality."

**If fail:** Observation immediately triggers analysis ("this wrong because...")? Analytical habit overriding observational stance. Separate phases: write observation as fact, write interpretation as separate note labeled "hypothesis." Neutrality impossible (strong reaction)? Note reaction itself as data: "Strong concern when observing X — may indicate significant issue or my bias."

### Step 3: Record — Capture Raw Patterns

Transcribe observations into structured format while fresh.

1. List each observation as single statement of fact (what seen, where, when)
2. Group similar observations naturally — don't force, but notice when they cluster
3. Note frequency: pattern appear once, occasionally, pervasively?
4. Note contrasts: where pattern broke? Exceptions often more informative than rules
5. Note temporal patterns: observation change over time, or static?
6. Capture exact evidence: file paths, line numbers, specific words, concrete examples

**Got:** Structured record of 5-15 discrete observations, each with specific evidence. Detailed enough another observer could verify each independently.

**If fail:** Observations too abstract ("code seems messy")? Need grounding in specifics — which files, which patterns, what makes it messy? Too granular ("line 47 has space before brace")? Zoom out to pattern level — one-off or systemic?

### Step 4: Categorize — Organize Findings

Sort observations into meaningful categories without explaining yet.

1. Review all observations, look for natural groupings
2. Assign each to category from Step 1 matrix, or create new categories if needed
3. Within each category, rank by frequency and significance
4. Identify which categories have many observations (well-documented) and which few (potential blind spots)
5. Look for cross-category patterns: same underlying pattern manifesting differently in different categories?
6. Note observations not fitting any category — outliers often most interesting

**Got:** Categorized observation map with clear groupings. Each category has specific supporting observations. Map shows both patterns and gaps.

**If fail:** Categorization feels forced? Observations may not have natural groupings — collection of unrelated findings is itself a finding (system may lack coherent structure). Everything fits one category? Scope too narrow — zoom out.

### Step 5: Theorize — Generate Hypotheses from Patterns

Now — only now — begin interpreting observations.

1. For each major pattern, propose hypothesis: "This pattern exists because..."
2. For each hypothesis, identify supporting evidence from observations
3. For each, identify what counter-evidence would disprove it
4. Rank by explanatory power: which explains most observations?
5. Generate at least one contrarian hypothesis: "Obvious explanation is X, but could also be Y because..."
6. Identify which testable, which speculative

**Got:** 2-4 hypotheses explaining major patterns, each supported by specific observations. At least one surprising or contrarian. Distinction between observation and interpretation maintained — clear which parts are data, which theory.

**If fail:** No hypotheses form? Observations may need more time to accumulate — return to Step 2. Too many hypotheses ("everything is maybe")? Select 2-3 with strongest evidence, set rest aside. Only obvious hypotheses? Force contrarian view: "What if opposite were true?"

### Step 6: Archive — Store Pattern Library

Preserve observations and hypotheses for future reference.

1. Summarize key findings: 3-5 patterns with evidence
2. State leading hypotheses and confidence levels
3. Note what was not observed (potential blind spots)
4. Identify follow-up observations that would strengthen or weaken hypotheses
5. Patterns durable (relevant across sessions)? Consider updating MEMORY.md
6. Tag observations with context: when made, what prompted, scope covered

**Got:** Archive future observation sessions can build on. Distinguishes clearly between observations (data) and hypotheses (interpretation). Honest about confidence levels and gaps.

**If fail:** Observations don't feel worth archiving? May have been too shallow — or genuinely routine (not every session produces insights). Archive even negative results: "Observed X, no anomalies" is useful future context.

## Checks

- [ ] Frame set before any observation began (not free-form wandering)
- [ ] Raw observations recorded as facts before any interpretation
- [ ] At least 5 discrete observations captured with specific evidence
- [ ] Interpretation (hypotheses) clearly separated from observation (data)
- [ ] At least one surprising or contrarian finding generated
- [ ] Archived record specific enough for another observer to verify

## Pitfalls

- **Premature intervention**: Seeing problem and fixing immediately, losing chance to understand broader pattern it belongs to
- **Observation bias**: Seeing what expected rather than what present. Expectations filter perception — clearing in Step 1 mitigates but doesn't eliminate
- **Analysis paralysis**: Observing endlessly without ever moving to action. Set time or data-point limit, commit to concluding
- **Narrative imposition**: Constructing story connecting observations even when connections weak. Not all observations form coherent narrative — disconnected findings valid
- **Confusing familiarity with understanding**: "Seen this before" ≠ "understand why this here." Prior exposure can create false confidence
- **Ignoring own reactions**: Observer's emotional or cognitive reactions to observations are data. Sense of confusion, boredom, alarm about system often contains real signal

## See Also

- `observe-guidance` — human-guidance variant for coaching person in systematic observation
- `learn` — observation feeds learning by providing raw data for model-building
- `listen` — outward-focused attention toward user signals; observation broader-scope attention toward any system
- `remote-viewing` — intuitive exploration that can be validated through systematic observation
- `meditate` — develops sustained attention capacity observation requires
- `awareness` — threat-focused situational awareness; observation curiosity-driven rather than defense-driven
