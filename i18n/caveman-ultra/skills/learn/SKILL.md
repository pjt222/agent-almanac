---
name: learn
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  AI systematic knowledge acquisition from unfamiliar territory — deliberate
  model-building w/ feedback loops. Spaced repetition → AI reasoning: survey,
  hypothesize, probe, integrate, verify, consolidate. Use when encountering
  unfamiliar codebase / domain, user asks topic requiring investigation not
  recall, conflicting sources require coherent model, or preparing to teach.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, learning, knowledge-acquisition, meta-cognition, model-building
---

# Learn

Structured knowledge acquisition session — survey unfamiliar, build initial models, test via deliberate exploration, integrate into coherent understanding, consolidate for durable retrieval.

## Use When

- Unfamiliar codebase / framework / domain, no prior ctx
- User asks topic outside working knowledge, answer needs investigation not recall
- Conflicting sources / patterns → coherent mental model from scratch
- After `remote-viewing` surfaces intuitive leads → systematic validation
- Prep to `teach` — must understand deeply enough to explain

## In

- **Req**: Learning target — topic, codebase area, API, concept, tech
- **Opt**: Scope boundary — surface survey vs deep expertise
- **Opt**: User's purpose — why this matters (prioritization)
- **Opt**: Known starting points — files, docs, concepts familiar

## Do

### Step 1: Survey — Map Territory

Before understanding anything, map landscape → ID what exists.

```
Learning Modality Selection:
┌──────────────────┬──────────────────────────┬──────────────────────────┐
│ Territory Type   │ Primary Modality         │ Tool Pattern             │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Codebase         │ Structural mapping —     │ Glob for file tree,      │
│                  │ find entry points, core  │ Grep for exports/imports,│
│                  │ modules, boundaries      │ Read for key files       │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ API / Library    │ Interface mapping —      │ WebFetch for docs,       │
│                  │ find public surface,     │ Read for examples,       │
│                  │ types, configuration     │ Grep for usage patterns  │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ Domain concept   │ Ontology mapping —       │ WebSearch for overviews,  │
│                  │ find core terms,         │ WebFetch for definitions,│
│                  │ relationships, debates   │ Read for local notes     │
├──────────────────┼──────────────────────────┼──────────────────────────┤
│ User's context   │ Conversational mapping   │ Read conversation,       │
│                  │ — find stated goals,     │ Read MEMORY.md,          │
│                  │ preferences, constraints │ Read CLAUDE.md           │
└──────────────────┴──────────────────────────┴──────────────────────────┘
```

1. ID territory type + select primary modality
2. Broad scan — not reading deeply, ID landmarks (key files, entry points, core concepts)
3. Note boundaries: in scope, adjacent, out of scope
4. ID gaps: important-looking but opaque from surface
5. Rough map: list major components + apparent relationships

→ Skeletal map w/ 5-15 landmarks. Sense of clear surface vs deeper investigation needed. No understanding yet — just map.

**If err:** Territory too large → narrow scope. Ask: "Min to understand → serve user's purpose?" No clear entry → start from output (what produces?) + trace backward.

### Step 2: Hypothesize — Initial Models

From survey → construct hypotheses.

1. Formulate 2-3 hypotheses about structure / behavior
2. State clearly: "I believe X because I observed Y"
3. Per hypothesis → what evidence confirms, what refutes
4. Rank by confidence: most supported, shakiest
5. ID highest-value to test first (unlocks most understanding if confirmed)

→ Concrete falsifiable hypotheses — not vague impressions. Each has test. Collectively cover most important aspects.

**If err:** No hypotheses → survey too shallow → back to Step 1, read 2-3 landmarks in depth. All equally uncertain → simplest (Occam's) + build from there.

### Step 3: Explore — Probe + Test

Systematically test each hypothesis via targeted investigation.

1. Select highest-priority
2. Design minimal probe: smallest investigation confirming/refuting
3. Execute (read file, search pattern, test assumption)
4. Record: confirmed, refuted, modified
5. If refuted → update hypothesis w/ new evidence
6. If confirmed → probe deeper: holds at edges or only center?
7. Next hypothesis, repeat

→ ≥1 hypothesis tested to conclusion. Model taking shape — some confirmed, some revised. Surprises noted as valuable data.

**If err:** Probes consistently ambiguous → testing wrong things. Step back: "What would an expert consider most important fact?" Probe for that.

### Step 4: Integrate — Mental Model

Synthesize findings → coherent model connecting pieces.

1. Review confirmed hypotheses + revised models
2. ID central organizing principle: "spine" everything connects to
3. Map relationships: which components depend on which? What flows where?
4. ID surprising findings — often deepest insight
5. Look for patterns repeating across territory
6. Build model predicting behavior: "Given input X, expect Y because Z"

→ Coherent model explaining structure + predicting behavior. Expressible in 3-5 sentences, specific claims not vague.

**If err:** Pieces don't integrate → fundamental misunderstanding in earlier hypothesis. ID piece that doesn't fit → re-test. Or territory genuinely incoherent (poorly designed exist) → note as finding rather than forcing.

### Step 5: Verify — Challenge Understanding

Test model via predictions + check.

1. Use model → 3 specific predictions
2. Test each via investigation (not assuming true)
3. Per confirmed → confidence increases
4. Per refuted → ID where model wrong + correct
5. Edge cases: hold at boundaries or break?
6. Ask: "What would surprise me?" → check if possible

→ Model survives ≥2 of 3 prediction tests. Failures understood, model corrected. Now has confirmed strengths + known limitations.

**If err:** Most predictions fail → model fundamental flaw. Valuable info — territory works differently than expected. Return Step 2 w/ new evidence, rebuild. 2nd attempt much faster (wrong models eliminated).

### Step 6: Consolidate — Store for Retrieval

Capture learning in form supporting future retrieval + application.

1. Summarize model in 3-5 sentences
2. Note key landmarks — 3-5 most important to remember
3. Record counterintuitive findings (might be forgotten)
4. ID related topics this connects to
5. Durable learning (needed across sessions) → update MEMORY.md
6. Session-specific → note as ctx for current conv
7. State what remains unknown — honest gaps > false confidence

→ Concise retrievable summary capturing essential understanding. Future references start from summary, not re-learning.

**If err:** Learning resists summarization → not fully integrated → return Step 4. Learning too obvious to store → what feels obvious now may not in fresh ctx. Store non-obvious.

## Check

- [ ] Survey before deep investigation (map before dive)
- [ ] Hypotheses explicit + tested, not assumed
- [ ] ≥1 hypothesis revised based on evidence (= genuine learning)
- [ ] Model makes specific testable predictions
- [ ] Known unknowns ID'd alongside known knowns
- [ ] Consolidated summary concise for future retrieval

## Traps

- **Skip survey**: Diving into detail before landscape → wastes time on unimportant + misses big picture.
- **Unfalsifiable hypotheses**: "This is probably complex" can't be tested. "This module handles auth because it imports crypto" can.
- **Confirmation bias**: Seeking only supporting evidence, ignoring contradictions.
- **Premature consolidation**: Store model before tested → confidently wrong future predictions.
- **Perfectionism**: Learn everything before applying anything. Iterative — use partial, then refine.
- **Learning w/o purpose**: Knowledge w/o application → unfocused shallow understanding.

## →

- `learn-guidance` — human-guidance variant → coach person thru structured learning
- `teach` — knowledge transfer calibrated to learner; builds on model constructed here
- `remote-viewing` — intuitive exploration surfaces leads for systematic learning to validate
- `meditate` — clear prior ctx noise before new learning territory
- `observe` — sustained neutral pattern recognition feeding learning w/ raw data
