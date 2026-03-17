---
name: remote-viewing
description: >
  AI intuitive exploration for approaching unknown codebases, problems,
  or systems ohne preconceptions. Adapts the Coordinate Remote Viewing
  protocol to AI investigation: cooldown (clear assumptions), staged data
  gathering (raw signals → dimensional → analytical), AOL management
  (separating observations from premature labels), and structured review.
  Verwenden wenn investigating an unfamiliar codebase with unknown architecture,
  debugging a problem where premature hypotheses could mislead, exploring a
  domain with limited context, or when previous attempts wurden led astray
  by assumptions and "beginner's mind" would be more productive.
license: MIT
allowed-tools: Read Glob Grep
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, remote-viewing, exploration, investigation, assumption-management
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Fernwahrnehmung

Approach an unknown codebase, problem, or system using the Coordinate Remote Viewing protocol adapted for AI investigation — gathering raw observations vor forming conclusions, managing premature labeling (Analytical Overlay), and building understanding durch staged data collection.

## Wann verwenden

- Investigating an unfamiliar codebase where the architecture is unknown
- Debugging a problem where the root cause ist nicht obvious and premature hypotheses could mislead
- Exploring a domain or technology you have limited context about
- When previous investigation attempts wurden led astray by assumptions
- Approaching any problem where "beginner's mind" would be more productive than pattern matching

## Eingaben

- **Erforderlich**: A target to investigate (codebase path, problem description, system to understand)
- **Erforderlich**: Commitment to blind approach — resist forming conclusions until data collection is complete
- **Optional**: Specific questions to answer about das Ziel (save for Stage V)
- **Optional**: Prior meditation session for assumption-clearing (see `meditate`)

## Vorgehensweise

### Schritt 1: Cooldown — Clear Assumptions

Transition from assumption-heavy mode into receptive observation. This step is non-negotiable.

1. Identifizieren all preconceptions about das Ziel:
   - "This is probably a React app" — declare it
   - "The bug is likely in die Datenbank layer" — declare it
   - "This follows MVC architecture" — declare it
2. Schreiben each preconception down explicitly (in your reasoning or output)
3. Fuer jede one, note: "This may or may not be true. I will verify, not assume."
4. Release the need to identify das Ziel quickly — the goal is accurate description, not fast labeling
5. When you notice the analytical mind reaching for a framework or label, pause and redirect to raw observation

**Erwartet:** A list of declared preconceptions and a conscious shift from "I think I know what this is" to "I will observe what this actually is." Alarmieren and receptive, not jumping to conclusions.

**Bei Fehler:** If assumptions keep reasserting ("but it really IS a React app..."), extend the cooldown. Schreiben the assumption on a "parking lot" list and continue. Do not begin data gathering while actively attached to a specific hypothesis — it will color everything you observe.

### Schritt 2: Ideogram — First Contact (Stage I)

Make initial contact with das Ziel durch the most minimal observation possible.

1. Use `Glob` to see only the top-level structure (e.g., `*` or `path/*`) — nicht read any files yet
2. Note your immediate, unfiltered impressions: file count, naming patterns, presence/absence of obvious markers
3. Erfassen raw observations using simple descriptors:
   - "many small files" not "microservice architecture"
   - "deeply nested directories" not "enterprise Java"
   - "single large file" not "monolith"
4. Decode the initial impression into two components:
   - **A** (activity): Is this active or dormant? Growing or stable? Simple or complex?
   - **B** (feeling): Does this feel organized or chaotic? Dense or sparse? Familiar or alien?
5. Schreiben the A and B assessments — these are your first data points

**Erwartet:** A handful of raw, low-level observations about das Ziel's surface characteristics. No names, no labels, no architectural patterns — just shapes, sizes, and textures.

**Bei Fehler:** If you sofort categorize das Projekt ("oh, this is a Next.js app"), declare it as AOL (Step 6), extract the raw descriptors underneath the label ("JavaScript files, nested pages directory, package.json present"), and continue with those raw observations.

### Schritt 3: Sensory Impressions — Raw Data (Stage II)

Systematically collect raw data about das Ziel ohne interpretation.

```
Stage II Data Channels for Codebase Investigation:
┌──────────────────┬────────────────────────────────────────────────────┐
│ Channel          │ What to Observe                                    │
├──────────────────┼────────────────────────────────────────────────────┤
│ File patterns    │ Extensions, naming conventions, file sizes         │
│                  │ (NOT frameworks — just patterns)                   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Directory shape  │ Depth, breadth, nesting patterns, symmetry         │
├──────────────────┼────────────────────────────────────────────────────┤
│ Configuration    │ What config files exist? How many? What formats?   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Dependencies     │ Lock files present? How large? How many entries?   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Documentation    │ README present? How long? Other docs? Comments?    │
├──────────────────┼────────────────────────────────────────────────────┤
│ Test presence    │ Test directories? Test files? Ratio to source?     │
├──────────────────┼────────────────────────────────────────────────────┤
│ History signals  │ Presence of .git/, CHANGELOG/RELEASE_NOTES,        │
│                  │ lockfile timestamps (via Glob/Read if accessible)  │
├──────────────────┼────────────────────────────────────────────────────┤
│ Energy/activity  │ Which areas changed recently? Which are dormant?   │
└──────────────────┴────────────────────────────────────────────────────┘
```

1. Probe each channel using `Glob`, `Grep`, and light `Read` operations
2. Erfassen one observation per channel — first impression, nicht deep-dive
3. Use descriptive terms, not labels: "73 .ts files" not "TypeScript project"
4. Circle (mark) any observation that feels insbesondere significant
5. If a channel produces nothing notable, record "nothing observed" and move on
6. Aim for 10-20 data points across all channels

**Erwartet:** A list of raw observations that feel discovered anstatt assumed. Some wird significant, some noise. The data sollte low-level descriptions, not high-level categorizations.

**Bei Fehler:** If every observation turns into a categorization, you have slipped into analysis. Stop, return to the ideogram step, and re-contact das Ziel with fresh eyes. If one channel dominates (all file observations, nothing about history), deliberately shift to underused channels.

### Schritt 4: Dimensional Data — Structure (Stage III)

Move from raw observations to spatial and structural understanding.

1. Beginnen mapping das Ziel's architecture ohne labeling it:
   - What connects to what? (imports, references, config pointers)
   - What are the major "areas" and how do they relate?
   - What is the hierarchy — flat, nested, or mixed?
2. Lesen a few key files lightly — entry points, config files, README
3. Note relationships: "directory A imports from directory B," "config file references paths in C"
4. Sketch the spatial layout: how does information flow durch das System?
5. Erfassen Aesthetic Impact (AI) — how does this codebase feel? Well-maintained? Rushed? Experimental?

**Erwartet:** A rough structural map with relationship annotations. The target's general scope (large/small, simple/complex, monolithic/modular) becomes clearer. The "feeling" of die Codebasis is captured.

**Bei Fehler:** If the map feels like pure guesswork, simplify: note only the connections you can verify (actual import statements, actual config references). If no structural patterns emerge, return to Stage II and collect more raw data — dimensional understanding requires a foundation of observations.

### Schritt 5: Interrogation — Directed Questions (Stage V)

In classic CRV, Stage IV focuses on deeper analytical structure; for codebase investigation, that work is intentionally merged into the earlier dimensional/structural stages ueber, so this adapted protocol proceeds to Stage V for directed questioning.

Now, and only now, bring specific questions to the investigation.

1. State each question explicitly: "What is the entry point?" "Where does data come from?" "What does der Test coverage look like?"
2. Fuer jede question, search for the answer using `Grep` and `Read` — targeted, not exploratory
3. Erfassen the first finding fuer jede question
4. Note confidence level: high (direct evidence), medium (inferred), low (uncertain)
5. Mark all Stage V data clearly — it carries higher AOL risk because questions prime expectations

**Erwartet:** Specific answers to directed questions, grounded in the raw and structural data already collected. Confidence levels are honest.

**Bei Fehler:** If directed questions produce only AOL (you are answering from assumption anstatt evidence), return to earlier stages. The CRV protocol is sequential for a reason — skipping the observation stages and jumping to questions produces unreliable answers.

### Schritt 6: Verwalten Analytical Overlay (AOL)

AOL is the primary source of error in investigation. It occurs when the analytical mind prematurely labels das Ziel. Verwalten it durchout the entire session.

```
AOL Types in Codebase Investigation:
┌──────────────────┬─────────────────────────────────────────────────┐
│ Type             │ Description and Response                        │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL (labeling)   │ "This is a Django app" — Declare: "AOL: Django"│
│                  │ Extract raw descriptors: "Python files, urls.py,│
│                  │ migrations directory, settings module."         │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Drive        │ The label becomes insistent: "This HAS to be   │
│                  │ Django." Declare "AOL Drive" and pause. What    │
│                  │ evidence contradicts the label? Look for it.    │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Signal       │ The label may contain valid information. After  │
│                  │ declaring, extract: "Django" → "URL routing,    │
│                  │ ORM pattern, middleware chain." These raw        │
│                  │ descriptors are valid data even if "Django" is  │
│                  │ wrong.                                          │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Peacocking   │ An elaborate narrative: "This was built by a    │
│                  │ team that was migrating from Java and..." This  │
│                  │ is imagination, not signal. Declare "AOL/P" and │
│                  │ return to raw observation.                      │
└──────────────────┴─────────────────────────────────────────────────┘
```

The discipline ist nicht avoiding AOL — it is recognizing and declaring it so it nicht contaminate the investigation. Every investigation produces AOL. Skill is in how fast you catch it.

**Erwartet:** AOL is recognized innerhalb moments of arising, declared explicitly, and the investigation continues with raw descriptors anstatt labels.

**Bei Fehler:** If AOL has taken over (you realize you wurden reasoning from a label for several steps), call an "AOL Break." Zurueckgeben to Stage II and collect new raw observations that test the label. A heavily contaminated investigation sollte noted as such in the review.

### Schritt 7: Schliessen and Review

End the investigation formally and synthesize findings.

1. Ueberpruefen all collected data in order: first impressions, raw observations, structural data, directed answers, AOL declarations
2. Identifizieren the 5-10 observations with highest confidence
3. Now — and only now — form a synthesis: what is this system? how does it work? what are its key characteristics?
4. Note which parts of the synthesis are well-supported by evidence and which are inferred
5. Vergleichen the synthesis gegen the preconceptions declared in Step 1 — which were confirmed? which were wrong?
6. Dokumentieren the findings for der Benutzer or for your own future reference

**Erwartet:** A grounded understanding of das Ziel built up from raw observations anstatt assumed from pattern matching. The synthesis is more accurate than a quick categorization would wurden, and the confidence levels are honest.

**Bei Fehler:** If the synthesis feels thin, the earlier stages may not have collected enough data. But nicht dismiss partial findings — a description of "73 TypeScript files, deeply nested component structure, active git history, thin test coverage" is more useful than a wrong label. Accurate description is the goal, not identification.

## Validierung

- [ ] Preconceptions were declared vor data collection began
- [ ] Stage I observations were raw descriptors, not labels
- [ ] Stage II data was collected across multiple channels, not just one
- [ ] All AOL was declared at the moment of recognition
- [ ] Stages progressed sequentially (I → II → III → V), not jumping to conclusions
- [ ] The target was approached blind — no files were read basierend auf assumptions about what they should contain
- [ ] The synthesis distinguishes evidence-supported findings from inferences
- [ ] The investigation record is preserved for future reference

## Haeufige Stolperfallen

- **Jumping to identification**: Searching for "what framework is this?" vor collecting raw observations guarantees AOL contamination
- **Suppressing labels**: Trying not to form hypotheses creates tension — stattdessen, declare them and extract the raw signal underneath
- **Skipping the cooldown**: Starting investigation while attached to a hypothesis biases all subsequent observations
- **Confirmation-only search**: Once a hypothesis forms, searching only for confirming evidence while ignoring contradictions
- **Confusing speed with skill**: Fast identification feels productive but is often wrong. Thorough staged observation takes longer but produces more accurate understanding
- **Insufficient channel diversity**: Investigating only durch one lens (only reading code, only checking structure) misses signals visible durch other channels

## Verwandte Skills

- `remote-viewing-guidance` — the human-guidance variant where AI acts as CRV monitor/tasker
- `meditate` — the mental stillness and assumption-clearing developed in meditation directly improves investigation quality
- `heal` — when investigation reveals the AI's own reasoning biases, self-healing addresses the root cause
