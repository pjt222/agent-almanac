---
name: learn
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  AI systematic knowledge acquisition from unfamiliar territory — deliberate
  model-building with feedback loops. Maps spaced repetition principles to
  AI reasoning: survey the territory, hypothesize structure, explore with
  probes, integrate findings, verify understanding, and consolidate for
  future retrieval. Use when encountering an unfamiliar codebase or domain,
  when a user asks about a topic requiring genuine investigation rather than
  recall, when multiple conflicting sources require building a coherent model,
  or when preparing to teach a topic and deep understanding is required first.
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

Structured knowledge acquisition session. Survey unfamiliar territory. Build initial models. Test them through deliberate exploration. Integrate findings into coherent understanding. Consolidate for durable retrieval.

## When Use

- Encountering unfamiliar codebase, framework, or domain with no prior context
- User asks about topic outside current working knowledge. Answer requires genuine investigation, not recall
- Multiple conflicting sources or patterns exist. Coherent mental model needs to be built from scratch
- After `remote-viewing` surfaces intuitive leads needing systematic validation
- Preparing to `teach` topic — AI must first understand it deeply enough to explain

## Inputs

- **Required**: Learning target — topic, codebase area, API, domain concept, or technology to understand
- **Optional**: Scope boundary — how deep to go (surface survey vs. deep expertise)
- **Optional**: User's purpose — why knowledge matters (guides which aspects to prioritize)
- **Optional**: Known starting points — files, docs, concepts already familiar

## Steps

### Step 1: Survey — Map Territory

Before trying to understand anything, map landscape to identify what exists.

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

1. Identify territory type. Select primary modality
2. Perform broad scan — not reading deeply, identifying landmarks (key files, entry points, core concepts)
3. Note boundaries: what is in scope, what is adjacent, what is out of scope
4. Identify gaps: areas looking important but opaque from surface
5. Create rough map: list major components and apparent relationships

**Got:** Skeletal map of territory with 5-15 landmarks identified. Sense of which areas clear from surface and which require deeper investigation. No understanding yet — just map.

**If fail:** Territory too large to survey? Narrow scope immediately. Ask: "What is minimum I need to understand to serve user's purpose?" No clear entry point? Start from output (what does this system produce?) and trace backward.

### Step 2: Hypothesize — Build Initial Models

From survey, construct initial hypotheses about how system works.

1. Formulate 2-3 hypotheses about territory's structure or behavior
2. State each hypothesis clearly: "I believe X because I observed Y"
3. For each hypothesis, identify what evidence would confirm it and what would refute it
4. Rank hypotheses by confidence: which feels most supported, which is shakiest
5. Identify highest-value hypothesis to test first (if confirmed, unlocks most understanding)

**Got:** Concrete, falsifiable hypotheses — not vague impressions. Each has test that would confirm or refute it. Hypotheses collectively cover most important aspects of territory.

**If fail:** No hypotheses form? Survey was too shallow — return to Step 1, read 2-3 landmarks in depth. All hypotheses feel equally uncertain? Start with simplest (Occam's razor), build from there.

### Step 3: Explore — Probe and Test

Systematically test each hypothesis through targeted investigation.

1. Select highest-priority hypothesis
2. Design minimal probe: smallest investigation that would confirm or refute it
3. Execute probe (read file, search for pattern, test assumption)
4. Record result: confirmed, refuted, or modified
5. Refuted? Update hypothesis based on new evidence
6. Confirmed? Probe deeper: does hypothesis hold at edges, or only in center?
7. Move to next hypothesis, repeat

**Got:** At least one hypothesis tested to conclusion. Mental model beginning to take shape — some parts confirmed, some revised. Surprises noted as particularly valuable data.

**If fail:** Probes consistently produce ambiguous results? Hypotheses may be testing wrong things. Step back, ask: "What would someone who understands this system consider most important fact?" Probe for that instead.

### Step 4: Integrate — Build Mental Model

Synthesize findings into coherent model connecting pieces.

1. Review all confirmed hypotheses and revised models
2. Identify central organizing principle: what is "spine" everything connects to?
3. Map relationships: which components depend on which? What flows where?
4. Identify surprising findings — often contain deepest insight
5. Look for patterns repeating across different parts of territory
6. Build mental model that can predict behavior: "Given input X, I expect Y because Z"

**Got:** Coherent mental model explaining territory's structure and predicting behavior. Model expressible in 3-5 sentences. Makes specific claims, not vague generalizations.

**If fail:** Pieces do not integrate into coherent model? May be fundamental misunderstanding in earlier hypothesis. Identify piece not fitting, re-test it. Alternatively, territory may genuinely be incoherent (poorly designed systems exist) — note this as finding rather than forcing coherence.

### Step 5: Verify — Challenge Understanding

Test mental model by making predictions, checking them.

1. Use model to make 3 specific predictions about territory
2. Test each prediction through investigation (not by assuming it is true)
3. Confirmed prediction → confidence increases
4. Refuted prediction → identify where model is wrong, correct it
5. Identify edge cases: does model hold at boundaries, or break down?
6. Ask: "What would surprise me?" — check if that surprise is possible

**Got:** Mental model survives at least 2 of 3 prediction tests. Where it breaks, failure is understood and model is corrected. Model now has both confirmed strengths and known limitations.

**If fail:** Most predictions fail? Mental model has fundamental flaw. Valuable info — territory works differently than expected. Return to Step 2 with new evidence, rebuild hypotheses from scratch. Second attempt much faster because wrong models eliminated.

### Step 6: Consolidate — Store for Retrieval

Capture learning in form supporting future retrieval and application.

1. Summarize mental model in 3-5 sentences
2. Note key landmarks — 3-5 most important things to remember
3. Record any counterintuitive findings that might be forgotten
4. Identify related topics this learning connects to
5. Learning durable (needed across sessions)? Update MEMORY.md
6. Learning session-specific? Note as context for current conversation
7. State what remains unknown — honest gaps more useful than false confidence

**Got:** Concise, retrievable summary capturing essential understanding. Future references to this topic can start from this summary rather than re-learning from scratch.

**If fail:** Learning resists summarization? May not yet be fully integrated — return to Step 4. Learning seems too obvious to store? What feels obvious now may not feel obvious in fresh context. Store non-obvious parts.

## Checks

- [ ] Survey conducted before any deep investigation (map before dive)
- [ ] Hypotheses explicitly stated and tested, not assumed
- [ ] At least one hypothesis revised based on evidence (indicates genuine learning)
- [ ] Mental model makes specific, testable predictions about territory
- [ ] Known unknowns identified alongside known knowns
- [ ] Consolidated summary concise enough to be useful for future retrieval

## Pitfalls

- **Skipping survey**: Diving into detail before understanding landscape wastes time on unimportant areas and misses big picture
- **Unfalsifiable hypotheses**: "This is probably complex" cannot be tested. "This module handles authentication because it imports crypto" can be
- **Confirmation bias during exploration**: Seeking only evidence supporting initial hypothesis while ignoring contradictions
- **Premature consolidation**: Storing model before tested → confidently wrong future predictions
- **Perfectionism**: Attempting to learn everything before applying any knowledge. Learning iterative — use partial understanding, then refine
- **Learning without purpose**: Acquiring knowledge with no application in mind → unfocused, shallow understanding

## See Also

- `learn-guidance` — human-guidance variant for coaching person through structured learning
- `teach` — knowledge transfer calibrated to learner. Builds on model constructed here
- `remote-viewing` — intuitive exploration surfacing leads for systematic learning to validate
- `meditate` — clearing prior context noise before entering new learning territory
- `observe` — sustained neutral pattern recognition feeding learning with raw data
