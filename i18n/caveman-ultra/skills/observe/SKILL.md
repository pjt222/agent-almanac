---
name: observe
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Sustained neutral pattern recognition across systems without urgency or
  intervention. Maps naturalist field study methodology to AI reasoning:
  framing the observation target, witnessing with sustained attention,
  recording patterns, categorizing findings, generating hypotheses, and
  archiving a pattern library for future reference. Use when a system's
  behavior is unclear and action would be premature, when debugging an
  unknown root cause, when a codebase change needs its effects witnessed
  before further changes, or when auditing own reasoning patterns for
  biases or recurring errors.
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

Frame → witness → record → categorize → theorize → archive.

## Use When

- Behavior unclear → action premature
- Debug unknown cause → observe before intervene → no symptom mask
- Post-change → witness effects before more changes
- User patterns over conv → improve future
- Audit own reasoning → biases, habits, errors
- After `learn` → validate model

## In

- **Required**: Target — system, codebase, behavior, user, reasoning
- **Optional**: Duration/scope
- **Optional**: Guiding question/hypothesis
- **Optional**: Prior obs to compare (delta)

## Do

### Step 1: Frame

Define what + why + perspective.

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

1. Pick target, name explicitly
2. Define boundary: in/out scope
3. Stance: "observing, not intervening"
4. Guiding Q? state but hold lightly → notice outside scope too
5. Pick categories from matrix

→ Clear frame: directs attention, doesn't constrain. Observer knows where + categories, stays open.

If err: too broad ("observe everything") → narrow to one subsystem/behavior. Too narrow ("one variable") → zoom out → patterns at edges.

### Step 2: Witness

Hold attention, no interpret/judge/intervene.

1. Begin systematic obs: read files, trace exec, review history — whatever target needs
2. Record what seen, not meaning → desc before interpretation
3. Resist fixing problems → note + continue
4. Resist explaining patterns → wait for accumulation
5. Drift to other target → note drift (may be meaningful), return frame
6. Maintain ≥3-5 distinct points before categorize

→ Raw obs collection — specific, concrete, no interpretation. Reads like field notes: "File X imports Y but does not use function Z. File A 300 lines; B 30 lines, similar."

If err: instant analysis ("wrong because...") → analytical habit overrides. Separate phases: obs as fact, then interpretation as separate "hypothesis" note. Strong reaction → note reaction itself as data: "Strong concern when observing X — significant issue or my bias."

### Step 3: Record

Transcribe while fresh.

1. Each obs = single fact statement (what/where/when)
2. Group naturally similar — don't force, notice clusters
3. Frequency: once / occasional / pervasive?
4. Contrasts: where pattern broke? Exceptions > rules
5. Temporal: changed over time or static?
6. Exact evidence: paths, line numbers, words, examples

→ Structured 5-15 discrete obs, specific evidence. Detailed enough another observer can verify.

If err: too abstract ("code messy") → ground in specifics → which files, what makes messy? Too granular ("line 47 space before brace") → zoom to pattern level → one-off or systemic?

### Step 4: Categorize

Sort, no explain yet.

1. Review all → look for natural groupings
2. Assign to Step 1 category, or new
3. Within category: rank by frequency + significance
4. Identify well-documented (many obs) vs blind spots (few)
5. Cross-category patterns: same underlying manifests differently?
6. Note outliers — most interesting data

→ Categorized map w/ clear groupings. Each category = specific obs supporting. Map shows patterns + gaps.

If err: forced cat → may lack natural grouping (itself a finding — system lacks coherent structure). All in one cat → scope too narrow → zoom out.

### Step 5: Theorize

Now — only now — interpret.

1. Each major pattern → hypothesis: "exists because..."
2. Each hypothesis → supporting evidence
3. Each → counter-evidence that disproves
4. Rank by explanatory power
5. ≥1 contrarian: "obvious = X, could also be Y because..."
6. Testable vs speculative

→ 2-4 hypotheses explain major patterns, each w/ specific obs support. ≥1 surprising/contrarian. Obs vs interpretation distinction maintained.

If err: no hypotheses → more obs needed → Step 2. Too many ("everything maybe") → keep 2-3 strongest, set aside. Only obvious → force contrarian: "what if opposite?"

### Step 6: Archive

Preserve.

1. Summarize: 3-5 patterns w/ evidence
2. Leading hypotheses + confidence
3. What NOT observed (blind spots)
4. Follow-ups to strengthen/weaken
5. Durable patterns → MEMORY.md
6. Tag context: when, what prompted, scope

→ Archive future sessions can build on. Distinguishes obs (data) from hypotheses (interpretation). Honest about confidence + gaps.

If err: not worth archiving → too shallow OR genuinely routine. Archive negatives too: "Observed X, no anomalies" = useful future context.

## Check

- [ ] Frame set before obs began (not wandering)
- [ ] Raw obs recorded as facts before interpretation
- [ ] ≥5 discrete obs w/ specific evidence
- [ ] Interpretation separated from obs
- [ ] ≥1 surprising/contrarian finding
- [ ] Archive specific enough another observer can verify

## Traps

- **Premature intervention**: see + fix immediately → lose broader pattern
- **Obs bias**: see expected, not present. Expectations filter → frame mitigates not eliminates
- **Analysis paralysis**: obs endlessly → no action. Set time/data limit, commit to conclude
- **Narrative imposition**: connecting obs even when connections weak. Not all coherent — disconnected = valid
- **Familiarity ≠ understanding**: "seen before" ≠ "know why". False confidence
- **Ignore own reactions**: emotional/cognitive reactions = data. Confusion/boredom/alarm = signal

## →

- `observe-guidance` — human-guidance variant
- `learn` — obs feeds learning w/ raw data
- `listen` — outward to user; obs broader to any system
- `remote-viewing` — intuitive, validatable through obs
- `meditate` — sustained attention capacity
- `awareness` — threat-focused; obs curiosity-driven
