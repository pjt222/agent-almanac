---
name: survey-theoretical-literature
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Survey + synthesize theoretical lit on topic. ID seminal papers, key
  results, open problems, cross-domain connections. Use → start research
  on unfamiliar topic, write lit review for paper/thesis, ID open probs +
  research gaps, find cross-domain connections, eval novelty of proposed
  contribution vs existing.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: theoretical-science
  complexity: intermediate
  language: natural
  tags: theoretical, literature, survey, synthesis, review, research
---

# Survey Theoretical Literature

Structured survey on defined topic → synthesis mapping seminal contributions, chronological dev, open problems, cross-domain connections.

## Use When

- Start research unfamiliar topic, map landscape
- Lit review for paper/thesis/grant
- ID open probs + gaps in field
- Find connections between result + adjacent fields
- Eval novelty of proposed contribution

## In

- **Required**: Topic desc (specific enough to bound search; e.g. "topological phases in non-Hermitian systems" not just "topology")
- **Required**: Scope (time, subfields in/out, theoretical vs experimental)
- **Optional**: Known seed papers (anchor search)
- **Optional**: Audience + depth (intro overview vs expert)
- **Optional**: Output format (annotated bib, narrative, concept map)

## Do

### Step 1: Define Scope + Search Terms

Bound precisely before search.

1. **Core topic statement**: 1 sentence defining survey scope. Acceptance criterion for paper inclusion.
2. **Search terms**:
   - Primary: exact tech phrases (Kohn-Sham eqns, Berry phase, RG)
   - Secondary: broader/adjacent (geometric phase = Berry phase synonym)
   - Exclusion: prevent irrelevant ("Berry" botanical)
3. **Temporal**: Define window. Mature field → seminal decades old, recent narrow to last 5-10y. Emerging → entire history few years.
4. **Domain boundaries**: Subfields in vs out. e.g. quantum error correction → topological codes IN, classical coding theory OUT.

```markdown
## Survey Scope
- **Core topic**: [one-sentence definition]
- **Primary search terms**: [list]
- **Secondary search terms**: [list]
- **Exclusion terms**: [list]
- **Time window**: [start year] to [end year]
- **In scope**: [subfields]
- **Out of scope**: [subfields]
```

**Got:** Scope tight enough → 2 researchers independently agree on inclusion.

**If err:** Too broad (>~200 papers) → narrow w/ subfield constraints | tighten time. Too narrow (<~10) → broaden secondary | extend time.

### Step 2: ID Seminal Papers + Key Results

Build backbone from most influential.

1. **Seed-based**: Start from seeds (or most recent review). Trace refs back + citations forward → repeated papers.
2. **Citation count heuristic**: Rough proxy for influence. Weight recent (5y) more (less time to accumulate).
3. **Seminal criteria**: ≥1 of:
   - Introduced foundational concept, formalism, method
   - Proved result that redirected field
   - Unified disparate strands
   - Cited by majority of subsequent papers
4. **Key result extraction**: per seminal:
   - Main result (theorem, eqn, prediction, method)
   - Assumptions/approximations
   - Impact on subsequent work

```markdown
## Seminal Papers
| # | Authors (Year) | Title | Main Result | Impact |
|---|---------------|-------|-------------|--------|
| 1 | [authors] ([year]) | [title] | [one-sentence result] | [influence on field] |
| 2 | ... | ... | ... | ... |
```

**Got:** 5-15 seminal papers = backbone, each w/ result + impact.

**If err:** No clear seminals → topic too new | too niche. ID earliest + most-cited as anchors, note canonical refs not yet emerged.

### Step 3: Map Chronological Development

Trace evolution origins → present.

1. **Origin**: When + where core ideas first appeared. Within field | imported from another?
2. **Growth**: Initial generalized, applied, challenged. Key turning points (new proof tech, unexpected counterex, exp confirmation).
3. **Branching**: Where lit branches → sub-topics. Per branch: focus + relationship to trunk.
4. **Current**: Mature (consolidating) | active (rapid dev) | stagnant (few recent)?
5. **Timeline**: Build chronological of most important devs.

```markdown
## Chronological Development

### Origin ([decade])
- [event/paper]: [description of foundational contribution]

### Key Developments
- **[year]**: [milestone and its significance]
- **[year]**: [milestone and its significance]
- ...

### Branching Points
- **[year]**: Field splits into [branch A] and [branch B]
  - Branch A focuses on [topic]
  - Branch B focuses on [topic]

### Current State ([year])
- **Activity level**: [mature / active / emerging / stagnant]
- **Dominant approach**: [current mainstream methodology]
- **Recent trend**: [direction of latest work]
```

**Got:** Narrative timeline → newcomer can read + understand how field arrived current state.

**If err:** Chronology unclear (multi independent discoveries, disputed priority) → doc ambiguity vs imposing false linear narrative. Parallel timelines OK.

### Step 4: ID Open Problems + Frontiers

Catalog unknown/unresolved.

1. **Explicitly open**: Search reviews, problem lists, surveys w/ open questions. Many fields → canonical lists (Clay Millennium, Hilbert's, open probs in QI).
2. **Implicitly open**: Conjectured-not-proven, numerical observations w/o theory, theory-vs-experiment discrepancies.
3. **Active frontiers**: Topics most attention last 2-3y. High preprint rate, conf sessions, funding calls.
4. **Barriers**: Per major problem, why hard? What math/conceptual obstacle?
5. **Potential impact**: Resolution → incremental (gap fill) | transformative (changes field thinking)?

```markdown
## Open Problems and Frontiers

### Explicitly Open
| # | Problem | Status | Barrier | Potential Impact |
|---|---------|--------|---------|-----------------|
| 1 | [statement] | [conjecture / partial / open] | [why hard] | [incremental / significant / transformative] |
| 2 | ... | ... | ... | ... |

### Active Frontiers
- **[frontier topic]**: [what is happening and why it matters]
- ...

### Implicit Gaps
- [observation without theoretical explanation]
- [conjecture without proof]
- ...
```

**Got:** Cataloged ≥3-5 open problems w/ difficulty assessments + characterization of most active frontiers.

**If err:** No open problems apparent → scope too narrow (sub-topic solved) | search missed relevant reviews. Broaden | search "open problems in [topic]" + "future directions in [topic]".

### Step 5: Cross-Domain Connections + Final Survey

Connect to adjacent + assemble.

1. **Cross-domain**:
   - Shared math structures (same eqn in optics + QM)
   - Analogies + dualities (AdS/CFT → gravity + field theory)
   - Methodological imports (ML applied to theoretical physics)
   - Experimental connections (predictions testable in cold-atom | photonic)

2. **Connection quality**: per connection:
   - Deep (structural equiv, proven duality)
   - Promising (suggestive analogy, active investigation)
   - Superficial (surface similarity, no proven relationship)

3. **Gap analysis**: Connections that should exist but unexplored = research opportunities.

4. **Survey assembly**: Compile Steps 1-5 → structured doc:
   - Exec summary (1 para)
   - Scope + methodology (Step 1)
   - Historical dev (Step 3)
   - Key results + seminal (Step 2)
   - Open probs + frontiers (Step 4)
   - Cross-domain (this step)
   - Bibliography

```markdown
## Cross-Domain Connections
| # | Connected Field | Type of Connection | Depth | Key Reference |
|---|----------------|-------------------|-------|---------------|
| 1 | [field] | [shared math / analogy / method import] | [deep / promising / superficial] | [paper] |
| 2 | ... | ... | ... | ... |

## Unexplored Connections (Research Opportunities)
- [potential connection]: [why it might exist and what it could yield]
- ...
```

**Got:** Complete structured survey doc mapping topic origins → frontiers w/ cross-domain ID + assessed.

**If err:** Disjointed → revisit chronological timeline (Step 3) as organizing spine. Every seminal, open prob, cross-domain locatable on timeline.

## Check

- [ ] Scope precisely defined w/ in+out criteria
- [ ] Seminal papers ID'd w/ main results + impact
- [ ] Chronological dev traced w/ key milestones
- [ ] ≥3-5 open problems cataloged w/ difficulty + impact
- [ ] Cross-domain ID'd + depth assessed
- [ ] Bib has all cited papers w/ complete ref info
- [ ] Newcomer can read + understand landscape
- [ ] Survey distinguishes established vs conjectures vs open
- [ ] Time of writing stated → readers assess currency

## Traps

- **Scope creep**: Started focused → expanded to everything tangential. Core topic sentence (Step 1) = acceptance criterion. Enforce ruthless.
- **Recency bias**: Over-rep recent at expense of foundational. 2024 w/ 10 citations may < 1980 w/ 5000. Weight influence not novelty.
- **Citation count worship**: Sole measure of importance. Highly cited can be methodological tools (widely used, not conceptually deep). Transformative in niche fields may be less cited.
- **Missing negative results**: Failed attempts + disproven conjectures = part of history. Omitting → misleadingly smooth narrative.
- **Superficial cross-domain**: Claim connection because same word ("entropy" in thermo + info theory related; "gauge" in physics + knitting NOT). Assess depth before include.
- **Presentism**: Judging historical by modern standards. 1960 paper → eval given known in 1960, not what failed to anticipate.

## →

- `formulate-quantum-problem` — formulate specific problems ID'd during survey
- `derive-theoretical-result` — derive | re-derive key results found
- `review-research` — eval individual papers encountered
