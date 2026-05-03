---
name: survey-theoretical-literature
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Survey and synthesize theoretical literature on a specific topic, identifying
  seminal papers, key results, open problems, and cross-domain connections.
  Use when starting research on an unfamiliar theoretical topic, writing a
  literature review for a paper or thesis, identifying open problems and
  research gaps, finding cross-domain connections, or evaluating the novelty
  of a proposed theoretical contribution against existing work.
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

Conduct structured survey of theoretical literature on defined topic. Produce synthesis mapping seminal contributions, chronological development of key ideas, open problems and active research frontiers, cross-domain connections.

## When Use

- Starting research on unfamiliar theoretical topic, need map landscape
- Writing literature review section for paper, thesis, or grant proposal
- Identifying open problems and gaps in theoretical field
- Finding connections between theoretical result and work in adjacent fields
- Evaluating novelty of proposed theoretical contribution against existing work

## Inputs

- **Required**: Topic description (specific enough to bound search; e.g., "topological phases in non-Hermitian systems" not just "topology")
- **Required**: Scope constraints (time period, subfields to include/exclude, theoretical vs. experimental focus)
- **Optional**: Known seed papers (papers requester already knows, to anchor search)
- **Optional**: Target audience and depth (introductory overview vs. expert-level survey)
- **Optional**: Desired output format (annotated bibliography, narrative review, concept map)

## Steps

### Step 1: Define Scope and Search Terms

Bound survey precise before searching:

1. **Core topic statement**: Write a single sentence defining what the survey covers. This sentence is the acceptance criterion for whether a paper belongs in the survey.
2. **Search terms**: Generate primary and secondary search terms:
   - Primary terms: the exact technical phrases used by practitioners (e.g., "Kohn-Sham equations", "Berry phase", "renormalization group")
   - Secondary terms: broader or adjacent phrases that might capture relevant work from other communities (e.g., "geometric phase" as a synonym for "Berry phase")
   - Exclusion terms: phrases that would pull in irrelevant results (e.g., excluding "Berry" in the botanical sense)
3. **Temporal scope**: Define the time window. For a mature field, the seminal papers may be decades old but recent advances may narrow to the last 5-10 years. For an emerging field, the entire history may span only a few years.
4. **Domain boundaries**: Explicitly state which subfields are in scope and which are out. For example, a survey on quantum error correction might include topological codes but exclude classical coding theory.

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

**Got:** Scope definition tight enough two researchers would independent agree on whether given paper belongs in survey.

**If fail:** Scope too broad (more than ~200 potentially relevant papers)? Narrow by adding subfield constraints or tightening time window. Too narrow (fewer than ~10 papers)? Broaden secondary search terms or extend time window.

### Step 2: Identify Seminal Papers and Key Results

Build backbone of survey from most influential contributions:

1. **Seed-based discovery**: Start from the seed papers (if provided) or from the most recent review article on the topic. Trace references backward and citations forward to identify the papers that appear repeatedly.
2. **Citation-count heuristic**: Use citation counts as a rough proxy for influence, but weight recent papers (last 5 years) more heavily since they have had less time to accumulate citations.
3. **Seminal paper criteria**: A paper qualifies as seminal if it meets at least one of:
   - Introduced a foundational concept, formalism, or method
   - Proved a result that redirected the field
   - Unified previously disparate strands of work
   - Is cited by a majority of subsequent papers in the field
4. **Key result extraction**: For each seminal paper, extract:
   - The main result (theorem, equation, prediction, or method)
   - The assumptions or approximations required
   - The impact on subsequent work

```markdown
## Seminal Papers
| # | Authors (Year) | Title | Main Result | Impact |
|---|---------------|-------|-------------|--------|
| 1 | [authors] ([year]) | [title] | [one-sentence result] | [influence on field] |
| 2 | ... | ... | ... | ... |
```

**Got:** Table of 5-15 seminal papers form intellectual backbone of topic, each paper's main result and impact clear stated.

**If fail:** Search yields no clear seminal papers? Topic may be too new or too niche. Identify earliest papers and most-cited papers as anchors, note field's canonical references not yet emerged.

### Step 3: Map Development of Ideas Chronological

Trace how field evolved from origins to present:

1. **Origin phase**: Identify when and where the core ideas first appeared. Note whether the ideas originated within the target field or were imported from another domain.
2. **Growth phase**: Trace how the initial results were generalized, applied, or challenged. Identify key turning points where the field's direction changed (e.g., a new proof technique, an unexpected counterexample, an experimental confirmation).
3. **Branching points**: Map where the literature branches into sub-topics. For each branch, briefly characterize its focus and its relationship to the main trunk.
4. **Current state**: Characterize where the field stands today. Is it mature (results are consolidating), active (rapid development), or stagnant (few recent papers)?
5. **Timeline construction**: Build a chronological timeline of the most important developments.

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

**Got:** Narrative timeline newcomer could read to understand how field arrived at current state, including intellectual lineage of key ideas.

**If fail:** Chronology unclear (e.g., multiple independent discoveries, disputed priority)? Document ambiguity rather than imposing false linear narrative. Parallel timelines acceptable.

### Step 4: Identify Open Problems and Active Frontiers

Catalog what is not yet known or resolved:

1. **Explicitly stated open problems**: Search for review articles, problem lists, and survey papers that explicitly list open questions. Many fields maintain canonical lists (e.g., the Clay Millennium Problems, Hilbert's problems, open problems in quantum information).
2. **Implicitly open problems**: Identify results that are conjectured but not proven, numerical observations without theoretical explanation, or discrepancies between theory and experiment.
3. **Active frontiers**: Identify the topics that are receiving the most attention in the last 2-3 years. These are characterized by a high rate of new preprints, conference sessions, and funding calls.
4. **Barriers to progress**: For each major open problem, briefly describe why it is hard. What mathematical or conceptual obstacle stands in the way?
5. **Potential impact**: For each open problem, estimate the impact of its resolution. Would it be incremental (filling in a gap) or transformative (changing how the field thinks)?

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

**Got:** Structured catalog of at least 3-5 open problems with difficulty assessments, plus characterization of most active research frontiers.

**If fail:** No open problems apparent? Survey scope may be too narrow (sub-topic solved) or literature search missed relevant review articles. Broaden scope or specific search for "open problems in [topic]" and "future directions in [topic]."

### Step 5: Synthesize Cross-Domain Connections and Produce Structured Survey

Connect surveyed field to adjacent areas, assemble final output:

1. **Cross-domain connections**: Identify where the surveyed topic connects to other fields:
   - Shared mathematical structures (e.g., the same equation appearing in optics and quantum mechanics)
   - Analogies and dualities (e.g., AdS/CFT connecting gravity and field theory)
   - Methodological imports (e.g., machine learning techniques applied to theoretical physics)
   - Experimental connections (e.g., predictions testable in cold-atom or photonic systems)

2. **Connection quality assessment**: For each connection, assess whether it is:
   - Deep (structural equivalence, proven duality)
   - Promising (suggestive analogy, active investigation)
   - Superficial (surface similarity, no proven relationship)

3. **Gap analysis**: Identify connections that should exist but have not been explored. These are potential research opportunities.

4. **Survey assembly**: Compile the outputs from Steps 1-5 into a structured document:
   - Executive summary (1 paragraph)
   - Scope and methodology (from Step 1)
   - Historical development (from Step 3)
   - Key results and seminal papers (from Step 2)
   - Open problems and frontiers (from Step 4)
   - Cross-domain connections (from this step)
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

**Got:** Complete, structured survey document maps topic from origins through current frontiers, cross-domain connections identified and assessed.

**If fail:** Survey feels disjointed? Revisit chronological timeline (Step 3), use as organizing spine. Every seminal paper, open problem, cross-domain connection should be locatable on timeline.

## Checks

- [ ] Survey scope precise defined with inclusion and exclusion criteria
- [ ] Seminal papers identified with main results and impact stated
- [ ] Chronological development traced with key milestones
- [ ] At least 3-5 open problems cataloged with difficulty and impact assessments
- [ ] Cross-domain connections identified, depth assessed
- [ ] Bibliography includes all cited papers with complete reference information
- [ ] Newcomer to field could read survey and understand landscape
- [ ] Survey distinguishes established results from conjectures and open questions
- [ ] Survey's time of writing stated so readers can assess currency

## Pitfalls

- **Scope creep**: Starting with focused topic and gradually expanding to include everything tangential related. Core topic sentence from Step 1 is acceptance criterion; enforce ruthless.
- **Recency bias**: Over-representing recent work at expense of foundational contributions. 2024 paper with 10 citations may be less important than 1980 paper with 5,000 citations. Weight influence, not novelty.
- **Citation count worship**: Using citation counts as sole measure of importance. High cited papers can be methodological tools (widely used but not conceptual deep) while transformative papers in niche fields may be less cited.
- **Miss negative results**: Failed attempts and disproven conjectures part of field's history. Omitting gives misleading smooth narrative.
- **Superficial cross-domain connections**: Claiming connection between two fields because they use same word (e.g., "entropy" in thermodynamics and information theory related, but "gauge" in physics and knitting not). Assess depth before including.
- **Presentism**: Judging historical papers by modern standards. Paper from 1960 should be evaluated for contribution given what was known in 1960, not for what it failed anticipate.

## See Also

- `formulate-quantum-problem` -- formulate specific problems identified during literature survey
- `derive-theoretical-result` -- derive or re-derive key results found in surveyed literature
- `review-research` -- evaluate individual papers encountered during survey
