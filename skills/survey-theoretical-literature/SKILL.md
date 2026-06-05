---
name: survey-theoretical-literature
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

Conduct a structured survey of theoretical literature on a defined topic, producing a synthesis that maps seminal contributions, traces the chronological development of key ideas, identifies open problems and active research frontiers, and highlights cross-domain connections.

## When to Use

- Starting research on an unfamiliar theoretical topic and needing to map the landscape
- Writing a literature review section for a paper, thesis, or grant proposal
- Identifying open problems and gaps in a theoretical field
- Finding connections between a theoretical result and work in adjacent fields
- Evaluating the novelty of a proposed theoretical contribution against existing work

## Inputs

- **Required**: Topic description (specific enough to bound the search; e.g., "topological phases in non-Hermitian systems" not just "topology")
- **Required**: Scope constraints (time period, subfields to include/exclude, theoretical vs. experimental focus)
- **Optional**: Known seed papers (papers the requester already knows, to anchor the search)
- **Optional**: Target audience and depth (introductory overview vs. expert-level survey)
- **Optional**: Desired output format (annotated bibliography, narrative review, concept map)

## Procedure

### Step 1: Define Scope and Search Terms

Bound the survey precisely before searching:

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

**Expected:** A scope definition tight enough that two researchers would independently agree on whether a given paper belongs in the survey.

**On failure:** If the scope is too broad (more than ~200 potentially relevant papers), narrow by adding subfield constraints or tightening the time window. If too narrow (fewer than ~10 papers), broaden the secondary search terms or extend the time window.

### Step 2: Identify Seminal Papers and Key Results

Build the backbone of the survey from the most influential contributions:

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

**Expected:** A table of 5-15 seminal papers that form the intellectual backbone of the topic, with each paper's main result and impact clearly stated.

**On failure:** If the search yields no clear seminal papers, the topic may be too new or too niche. In that case, identify the earliest papers and the most-cited papers as anchors, and note that the field's canonical references have not yet emerged.

### Step 3: Map the Development of Ideas Chronologically

Trace how the field evolved from its origins to the present:

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

**Expected:** A narrative timeline that a newcomer could read to understand how the field arrived at its current state, including the intellectual lineage of key ideas.

**On failure:** If the chronology is unclear (e.g., multiple independent discoveries, disputed priority), document the ambiguity rather than imposing a false linear narrative. Parallel timelines are acceptable.

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

**Expected:** A structured catalog of at least 3-5 open problems with difficulty assessments, plus a characterization of the most active research frontiers.

**On failure:** If no open problems are apparent, the survey scope may be too narrow (the sub-topic is solved) or the literature search missed the relevant review articles. Broaden the scope or specifically search for "open problems in [topic]" and "future directions in [topic]."

### Step 5: Synthesize Cross-Domain Connections and Produce Structured Survey

Connect the surveyed field to adjacent areas and assemble the final output:

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

**Expected:** A complete, structured survey document that maps the topic from origins through current frontiers, with cross-domain connections identified and assessed.

**On failure:** If the survey feels disjointed, revisit the chronological timeline (Step 3) and use it as the organizing spine. Every seminal paper, open problem, and cross-domain connection should be locatable on the timeline.

## Validation

- [ ] The survey scope is precisely defined with inclusion and exclusion criteria
- [ ] Seminal papers are identified with main results and impact stated
- [ ] The chronological development is traced with key milestones
- [ ] At least 3-5 open problems are cataloged with difficulty and impact assessments
- [ ] Cross-domain connections are identified and their depth is assessed
- [ ] The bibliography includes all cited papers with complete reference information
- [ ] A newcomer to the field could read the survey and understand the landscape
- [ ] The survey distinguishes established results from conjectures and open questions
- [ ] The survey's time of writing is stated so readers can assess currency

## Common Pitfalls

- **Scope creep**: Starting with a focused topic and gradually expanding to include everything tangentially related. The core topic sentence from Step 1 is the acceptance criterion; enforce it ruthlessly.
- **Recency bias**: Over-representing recent work at the expense of foundational contributions. A 2024 paper with 10 citations may be less important than a 1980 paper with 5,000 citations. Weight influence, not novelty.
- **Citation count worship**: Using citation counts as the sole measure of importance. Highly cited papers can be methodological tools (widely used but not conceptually deep) while transformative papers in niche fields may be less cited.
- **Missing the negative results**: Failed attempts and disproven conjectures are part of the field's history. Omitting them gives a misleadingly smooth narrative.
- **Superficial cross-domain connections**: Claiming a connection between two fields because they use the same word (e.g., "entropy" in thermodynamics and information theory are related, but "gauge" in physics and knitting are not). Assess depth before including.
- **Presentism**: Judging historical papers by modern standards. A paper from 1960 should be evaluated for its contribution given what was known in 1960, not for what it failed to anticipate.

## Related Skills

- `formulate-quantum-problem` -- formulate specific problems identified during the literature survey
- `derive-theoretical-result` -- derive or re-derive key results found in the surveyed literature
- `review-research` -- evaluate individual papers encountered during the survey
