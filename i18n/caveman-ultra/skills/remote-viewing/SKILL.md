---
name: remote-viewing
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  AI intuitive exploration → unknown codebases, problems, systems w/o
  preconceptions. Adapts CRV protocol → AI investigation: cooldown (clear
  assumptions), staged data gathering (raw → dimensional → analytical), AOL
  mgmt (separate obs from premature labels), structured review. Use →
  unfamiliar codebase, debug w/ premature hypotheses risk, limited ctx domain,
  prev attempts led astray by assumptions, "beginner's mind".
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

Approach unknown codebase/problem/system using CRV protocol adapted for AI investigation — gather raw obs before conclusions, manage premature labeling (AOL), build understanding via staged data collection.

## Use When

- Investigate unfamiliar codebase, arch unknown
- Debug problem, root cause not obvious + premature hypotheses could mislead
- Explore domain/tech w/ limited ctx
- Prev attempts led astray by assumptions
- Any problem where "beginner's mind" > pattern matching

## In

- **Required**: Target (codebase path, problem desc, system to understand)
- **Required**: Commitment to blind approach — resist conclusions til collection complete
- **Optional**: Specific questions about target (save Stage V)
- **Optional**: Prior meditation for assumption-clearing (see `meditate`)

## Do

### Step 1: Cooldown — Clear Assumptions

Transition assumption-heavy → receptive obs. Non-negotiable.

1. ID all preconceptions about target:
   - "This is probably a React app" — declare
   - "The bug is likely in the database layer" — declare
   - "This follows MVC architecture" — declare
2. Write each preconception explicit (in reasoning or output)
3. For each: "This may or may not be true. I will verify, not assume."
4. Release need to ID target quickly — goal = accurate description, not fast labeling
5. When notice analytical mind reaching for framework/label, pause + redirect to raw obs

→ List of declared preconceptions + conscious shift "I think I know" → "I will observe what this actually is." Alert + receptive, not jumping conclusions.

If err: assumptions keep reasserting ("but it really IS a React app...") → extend cooldown. Write to "parking lot" + continue. Don't begin gathering while attached to specific hypothesis — colors everything.

### Step 2: Ideogram — First Contact (Stage I)

Initial contact w/ target via most minimal obs possible.

1. Use `Glob` → top-level structure only (e.g. `*` or `path/*`) — no read files yet
2. Note immediate unfiltered impressions: file count, naming patterns, presence/absence of obvious markers
3. Record raw obs w/ simple descriptors:
   - "many small files" not "microservice architecture"
   - "deeply nested directories" not "enterprise Java"
   - "single large file" not "monolith"
4. Decode initial impression into 2 components:
   - **A** (activity): Active or dormant? Growing or stable? Simple or complex?
   - **B** (feeling): Organized or chaotic? Dense or sparse? Familiar or alien?
5. Write A + B assessments — first data points

→ Handful of raw low-level obs about target's surface. No names, labels, architectural patterns — just shapes, sizes, textures.

If err: immediately categorize ("oh, Next.js app") → declare AOL (Step 6), extract raw descriptors underneath label ("JavaScript files, nested pages directory, package.json present"), continue w/ raw.

### Step 3: Sensory — Raw Data (Stage II)

Systematically collect raw data w/o interpretation.

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

1. Probe each channel via `Glob`, `Grep`, light `Read`
2. Record one obs per channel — first impression, no deep-dive
3. Use descriptive terms not labels: "73 .ts files" not "TypeScript project"
4. Circle (mark) any obs feeling significant
5. Channel produces nothing → record "nothing observed" + move on
6. Aim 10-20 data points across channels

→ List of raw obs feeling discovered not assumed. Some significant, some noise. Low-level descriptions, not high-level categorizations.

If err: every obs becomes categorization → slipped into analysis. Stop, return ideogram, re-contact w/ fresh eyes. One channel dominates (all file obs, no history) → deliberately shift to underused.

### Step 4: Dimensional — Structure (Stage III)

Move raw obs → spatial + structural understanding.

1. Begin mapping target arch w/o labeling:
   - What connects to what? (imports, refs, config pointers)
   - Major "areas" + how relate?
   - Hierarchy — flat, nested, mixed?
2. Read few key files lightly — entry points, configs, README
3. Note relationships: "directory A imports from directory B," "config file references paths in C"
4. Sketch spatial layout: how does info flow through system?
5. Record Aesthetic Impact (AI) — how does codebase feel? Well-maintained? Rushed? Experimental?

→ Rough structural map w/ relationship annotations. General scope (large/small, simple/complex, monolithic/modular) clearer. "Feeling" of codebase captured.

If err: map feels pure guesswork → simplify: note only verifiable connections (actual imports, actual config refs). No structural patterns emerge → return Stage II + collect more raw data — dimensional needs foundation.

### Step 5: Interrogation — Directed Q (Stage V)

Classic CRV Stage IV → deeper analytical structure; for codebase investigation that work intentionally merged into earlier dimensional/structural stages above, so this proceeds to Stage V for directed q.

Now, only now, bring specific q to investigation.

1. State each q explicit: "What is entry point?" "Where does data come from?" "Test coverage?"
2. For each q, search via `Grep` + `Read` — targeted not exploratory
3. Record first finding for each q
4. Note confidence: high (direct evidence), medium (inferred), low (uncertain)
5. Mark all Stage V data clearly — higher AOL risk because q prime expectations

→ Specific answers to directed q, grounded in raw + structural data already collected. Confidence levels honest.

If err: directed q produce only AOL (answering from assumption not evidence) → return earlier stages. Protocol sequential for reason — skipping obs + jumping q → unreliable answers.

### Step 6: Manage AOL

AOL = primary source of error. Occurs when analytical mind prematurely labels target. Manage entire session.

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

Discipline ≠ avoiding AOL → recognizing + declaring so no contaminate. Every investigation produces AOL. Skill = how fast you catch.

→ AOL recognized in moments, declared explicit, investigation continues w/ raw descriptors not labels.

If err: AOL has taken over (reasoning from label for several steps) → call "AOL Break". Return Stage II + collect new raw obs testing label. Heavily contaminated investigation noted as such in review.

### Step 7: Close + Review

End investigation formally + synthesize findings.

1. Review all data in order: first impressions, raw obs, structural data, directed answers, AOL declarations
2. ID 5-10 obs w/ highest confidence
3. Now — only now — form synthesis: what is this system? how works? key characteristics?
4. Note which parts well-supported by evidence vs inferred
5. Compare synthesis vs preconceptions declared Step 1 — confirmed? wrong?
6. Document findings for user or own future ref

→ Grounded understanding built up from raw obs not assumed from pattern matching. Synthesis more accurate than quick categorization, confidence levels honest.

If err: synthesis feels thin → earlier stages may not collected enough. Don't dismiss partial findings — description of "73 TypeScript files, deeply nested component structure, active git history, thin test coverage" > wrong label. Accurate description = goal not identification.

## Check

- [ ] Preconceptions declared before collection
- [ ] Stage I obs = raw descriptors not labels
- [ ] Stage II data collected across multi channels not just one
- [ ] All AOL declared at moment of recognition
- [ ] Stages progressed sequential (I → II → III → V), no jumping
- [ ] Target approached blind — no files read on assumptions
- [ ] Synthesis distinguishes evidence-supported from inferences
- [ ] Investigation record preserved for future ref

## Traps

- **Jump to ID**: Searching "what framework?" before raw obs guarantees AOL contamination
- **Suppress labels**: Trying not to form hypotheses creates tension → declare them + extract raw signal underneath
- **Skip cooldown**: Start investigation while attached to hypothesis biases all obs
- **Confirmation-only search**: Once hypothesis forms, search only confirming + ignore contradictions
- **Confuse speed w/ skill**: Fast ID feels productive but often wrong. Thorough staged obs longer but more accurate
- **Insufficient channel diversity**: Investigating only one lens (only code, only structure) misses signals via other channels

## →

- `remote-viewing-guidance` — human-guidance variant where AI = CRV monitor/tasker
- `meditate` — mental stillness + assumption-clearing in meditation directly improves investigation quality
- `heal` — when investigation reveals AI's own reasoning biases, self-healing addresses root cause
