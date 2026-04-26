---
name: remote-viewing
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  AI intuitive exploration for approaching unknown codebases, problems,
  or systems without preconceptions. Adapts Coordinate Remote Viewing
  protocol to AI investigation: cooldown (clear assumptions), staged
  data gathering (raw signals → dimensional → analytical), AOL
  management (separate observations from premature labels), structured
  review. Use when investigating unfamiliar codebase with unknown
  architecture, debugging problem where premature hypotheses could
  mislead, exploring domain with limited context, or when previous
  attempts led astray by assumptions and "beginner's mind" would be more
  productive.
license: MIT
allowed-tools: Read Glob Grep
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, remote-viewing, exploration, investigation, assumption-management
---

# Remote View

Approach unknown codebase, problem, or system using Coordinate Remote Viewing protocol adapted for AI investigation — gather raw observations before form conclusions, manage premature labeling (Analytical Overlay), build understanding through staged data collection.

## When Use

- Investigate unfamiliar codebase where architecture unknown
- Debug problem where root cause not obvious and premature hypotheses could mislead
- Explore domain or technology you have limited context about
- Previous investigation attempts led astray by assumptions
- Approach any problem where "beginner's mind" more productive than pattern matching

## Inputs

- **Required**: Target to investigate (codebase path, problem description, system to understand)
- **Required**: Commitment to blind approach — resist forming conclusions until data collection complete
- **Optional**: Specific questions to answer about target (save for Stage V)
- **Optional**: Prior meditation session for assumption-clearing (see `meditate`)

## Steps

### Step 1: Cooldown — Clear Assumptions

Transition from assumption-heavy mode into receptive observation. Non-negotiable.

1. ID all preconceptions about target:
   - "This is probably a React app" — declare it
   - "The bug is likely in the database layer" — declare it
   - "This follows MVC architecture" — declare it
2. Write each preconception down explicit (in reasoning or output)
3. For each, note: "This may or may not be true. I will verify, not assume."
4. Release need to identify target quickly — goal = accurate description, not fast labeling
5. When notice analytical mind reaching for framework or label, pause and redirect to raw observation

**Got:** List of declared preconceptions. Conscious shift from "I think I know what this is" to "I will observe what this actually is." Alert and receptive, not jumping to conclusions.

**If fail:** Assumptions keep reasserting ("but it really IS a React app...")? Extend cooldown. Write assumption on "parking lot" list and continue. Do not begin data gathering while active attached to specific hypothesis — it colors everything you observe.

### Step 2: Ideogram — First Contact (Stage I)

Make initial contact with target through most minimal observation possible.

1. Use `Glob` to see only top-level structure (e.g., `*` or `path/*`) — do not read any files yet
2. Note immediate, unfiltered impressions: file count, naming patterns, presence/absence of obvious markers
3. Record raw observations using simple descriptors:
   - "many small files" not "microservice architecture"
   - "deeply nested directories" not "enterprise Java"
   - "single large file" not "monolith"
4. Decode initial impression into two components:
   - **A** (activity): Is this active or dormant? Growing or stable? Simple or complex?
   - **B** (feeling): Does this feel organized or chaotic? Dense or sparse? Familiar or alien?
5. Write A and B assessments — these are your first data points

**Got:** Handful of raw, low-level observations about target surface characteristics. No names, no labels, no architectural patterns — just shapes, sizes, textures.

**If fail:** Immediately categorize project ("oh, this is a Next.js app")? Declare as AOL (Step 6). Extract raw descriptors underneath label ("JavaScript files, nested pages directory, package.json present"). Continue with those raw observations.

### Step 3: Sensory Impressions — Raw Data (Stage II)

Systematically collect raw data about target without interpretation.

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

1. Probe each channel using `Glob`, `Grep`, light `Read` operations
2. Record one observation per channel — first impression, no deep-dive
3. Use descriptive terms, not labels: "73 .ts files" not "TypeScript project"
4. Circle (mark) any observation that feels particularly significant
5. Channel produces nothing notable? Record "nothing observed" and move on
6. Aim for 10-20 data points across all channels

**Got:** List of raw observations that feel discovered, not assumed. Some significant, some noise. Data should be low-level descriptions, not high-level categorizations.

**If fail:** Every observation turns into categorization? You slipped into analysis. Stop, return to ideogram step, re-contact target with fresh eyes. One channel dominates (all file observations, nothing about history)? Deliberately shift to underused channels.

### Step 4: Dimensional Data — Structure (Stage III)

Move from raw observations to spatial and structural understanding.

1. Begin mapping target architecture without labeling it:
   - What connects to what? (imports, references, config pointers)
   - What are major "areas" and how do they relate?
   - What is hierarchy — flat, nested, or mixed?
2. Read few key files lightly — entry points, config files, README
3. Note relationships: "directory A imports from directory B," "config file references paths in C"
4. Sketch spatial layout: how does information flow through system?
5. Record Aesthetic Impact (AI) — how does this codebase feel? Well-maintained? Rushed? Experimental?

**Got:** Rough structural map with relationship annotations. Target general scope (large/small, simple/complex, monolithic/modular) becomes clearer. "Feeling" of codebase captured.

**If fail:** Map feels like pure guesswork? Simplify: note only connections you can verify (actual import statements, actual config references). No structural patterns emerge? Return to Stage II and collect more raw data — dimensional understanding needs foundation of observations.

### Step 5: Interrogation — Directed Questions (Stage V)

In classic CRV, Stage IV focuses on deeper analytical structure; for codebase investigation, that work is intentionally merged into earlier dimensional/structural stages above. So this adapted protocol proceeds to Stage V for directed questioning.

Now, and only now, bring specific questions to investigation.

1. State each question explicit: "What is the entry point?" "Where does data come from?" "What does the test coverage look like?"
2. For each question, search for answer using `Grep` and `Read` — targeted, not exploratory
3. Record first finding for each question
4. Note confidence level: high (direct evidence), medium (inferred), low (uncertain)
5. Mark all Stage V data clearly — carries higher AOL risk because questions prime expectations

**Got:** Specific answers to directed questions, grounded in raw and structural data already collected. Confidence levels honest.

**If fail:** Directed questions produce only AOL (you answer from assumption rather than evidence)? Return to earlier stages. CRV protocol sequential for a reason — skip observation stages and jump to questions = unreliable answers.

### Step 6: Manage Analytical Overlay (AOL)

AOL = primary source of error in investigation. Occurs when analytical mind prematurely labels target. Manage throughout entire session.

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

The discipline = not avoiding AOL — recognize and declare it so it does not contaminate investigation. Every investigation produces AOL. Skill = how fast you catch it.

**Got:** AOL recognized within moments of arising, declared explicit, investigation continues with raw descriptors rather than labels.

**If fail:** AOL has taken over (you realize you have been reasoning from a label for several steps)? Call "AOL Break." Return to Stage II and collect new raw observations that test the label. Heavily contaminated investigation should be noted as such in review.

### Step 7: Close and Review

End investigation formal. Synthesize findings.

1. Review all collected data in order: first impressions, raw observations, structural data, directed answers, AOL declarations
2. ID 5-10 observations with highest confidence
3. Now — and only now — form synthesis: what is this system? how does it work? what are its key characteristics?
4. Note which parts of synthesis well-supported by evidence and which inferred
5. Compare synthesis against preconceptions declared in Step 1 — which confirmed? which wrong?
6. Document findings for user or for future reference

**Got:** Grounded understanding of target built up from raw observations rather than assumed from pattern matching. Synthesis more accurate than quick categorization would have been. Confidence levels honest.

**If fail:** Synthesis feels thin? Earlier stages may not have collected enough data. But do not dismiss partial findings — description of "73 TypeScript files, deeply nested component structure, active git history, thin test coverage" more useful than wrong label. Accurate description is goal, not identification.

## Checks

- [ ] Preconceptions declared before data collection began
- [ ] Stage I observations were raw descriptors, not labels
- [ ] Stage II data collected across multiple channels, not just one
- [ ] All AOL declared at moment of recognition
- [ ] Stages progressed sequential (I → II → III → V), no jumping to conclusions
- [ ] Target approached blind — no files read based on assumptions about what they should contain
- [ ] Synthesis distinguishes evidence-supported findings from inferences
- [ ] Investigation record preserved for future reference

## Pitfalls

- **Jump to identification**: Search for "what framework is this?" before collect raw observations = guarantees AOL contamination
- **Suppress labels**: Try not to form hypotheses creates tension — instead, declare them and extract raw signal underneath
- **Skip cooldown**: Start investigation while attached to hypothesis biases all subsequent observations
- **Confirmation-only search**: Once hypothesis forms, search only for confirming evidence while ignore contradictions
- **Confuse speed with skill**: Fast identification feels productive but often wrong. Thorough staged observation takes longer but produces more accurate understanding
- **Insufficient channel diversity**: Investigate only through one lens (only reading code, only checking structure) misses signals visible through other channels

## See Also

- `remote-viewing-guidance` — human-guidance variant where AI acts as CRV monitor/tasker
- `meditate` — mental stillness and assumption-clearing developed in meditation directly improves investigation quality
- `heal` — when investigation reveals AI own reasoning biases, self-healing addresses root cause
