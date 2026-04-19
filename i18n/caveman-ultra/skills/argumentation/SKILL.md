---
name: argumentation
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Construct well-structured arguments using the hypothesis-argument-example
  triad. Covers formulating falsifiable hypotheses, building logical arguments
  (deductive, inductive, analogical, evidential), providing concrete examples,
  and steelmanning counterarguments. Use when writing or reviewing PR descriptions
  that propose technical changes, justifying design decisions in ADRs, constructing
  substantive code review feedback, or building a research argument or technical
  proposal.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: argumentation, reasoning, hypothesis, logic, rhetoric, critical-thinking
---

# Construct Arguments

Build rigorous arguments hypothesis → reasoning → concrete evidence. Triad: hypothesis = *what* you believe, argument = *why* holds, examples = *that* holds. Apply to code reviews, design decisions, research writing, any ctx w/ claims needing justification.

## Use When

- Writing/reviewing PR desc proposing technical change
- Justifying design decision in ADR
- Code review feedback beyond "I don't like this"
- Research argument or technical proposal
- Challenge/defend approach in technical discussion

## In

- **Required**: Claim or position needing justification
- **Required**: Context (code review, design decision, research, doc)
- **Optional**: Audience (peer devs, reviewers, stakeholders, researchers)
- **Optional**: Counterarguments or alternative positions
- **Optional**: Evidence or data available

## Do

### Step 1: Formulate Hypothesis

Clear, falsifiable claim. Not opinion or preference — specific assertion testable vs evidence.

1. Claim in 1 sentence
2. Falsifiability test: can someone prove wrong w/ evidence?
3. Scope narrowly: specific ctx, codebase, domain
4. Distinguish from opinions → testable criteria

**Falsifiable vs unfalsifiable:**

| Unfalsifiable (opinion)              | Falsifiable (hypothesis)                                       |
|--------------------------------------|----------------------------------------------------------------|
| "This code is bad"                   | "This function has O(n^2) complexity where O(n) is achievable" |
| "We should use TypeScript"           | "TypeScript's type system will catch the class of null-reference bugs that caused 4 of our last 6 production incidents" |
| "The API design is cleaner"          | "Replacing the 5 endpoint variants with a single parameterized endpoint reduces the public API surface by 60%" |
| "This research approach is better"   | "Method A achieves higher precision than Method B on dataset X at the 95% confidence level" |

**→** 1-sentence hypothesis specific + scoped + falsifiable. Reader immediately imagines evidence confirming/refuting.

**If err:** Vague → "how would I disprove?" test. Can't imagine counter-evidence → opinion not hypothesis. Narrow scope or add measurable criteria.

### Step 2: ID Argument Type

Logical structure for hypothesis. Diff claims need diff reasoning strategies.

1. Review 4 types:

| Type        | Structure                                  | Best for                          |
|-------------|--------------------------------------------|-----------------------------------|
| Deductive   | If A then B; A true; therefore B        | Formal proofs, type safety |
| Inductive   | Observed pattern N cases; therefore likely | Perf data, test results    |
| Analogical  | X similar to Y relevant ways; Y has P; therefore X likely P | Design decisions, tech choices |
| Evidential  | E more likely under H1 than H2; therefore H1 supported | Research findings, A/B results |

2. Match hypothesis → strongest type:
   - *must* be true → **deductive**
   - *tends* to be true via observations → **inductive**
   - *will likely work* via similar prior cases → **analogical**
   - one explanation *fits data better* → **evidential**

3. Combine types for stronger arguments (analogical + inductive evidence)

**→** Chosen type (or combo) + clear rationale why fits hypothesis.

**If err:** No single type fits cleanly → split hypothesis into sub-claims. Each w/ natural argument structure.

### Step 3: Construct Argument

Logical chain connecting hypothesis → justification.

1. State premises (facts/assumptions starting from)
2. Show logical connection (premises → conclusion)
3. Steelman strongest counterargument — state best opposing *before* refuting
4. Address counterargument directly w/ evidence or reasoning

**Worked example — Code Review (deductive + inductive):**

> **Hypothesis**: "Extracting validation logic into shared module will reduce bug duplication across 3 API handlers."
>
> **Premises**:
> - 3 handlers (`createUser`, `updateUser`, `deleteUser`) impl same input valid. w/ slight variations (observed `src/handlers/`)
> - Last 6 months, 3/5 valid. bugs fixed in 1 handler not propagated (issues #42, #57, #61)
> - Shared modules enforce single src of truth (deductive: if one impl, then one place to fix)
>
> **Logical chain**: Because 3 handlers duplicate same valid. (premise 1), bugs fixed in 1 missed in others (premise 2, inductive from 3/5). Shared module → fixes apply once to all callers (deductive from shared-module semantics). Therefore extraction reduces bug duplication.
>
> **Counterargument (steelmanned)**: "Shared modules introduce coupling — change to valid. for 1 handler could break others."
>
> **Rebuttal**: Handlers already share identical valid. *intent*; coupling implicit + harder to maintain. Making explicit via shared module w/ parameterized options (`validate(input, { requireEmail: true })`) makes coupling visible + testable. Current implicit duplication riskier — hides dependency.

**Worked example — Research (evidential):**

> **Hypothesis**: "Pre-training on domain-specific corpora improves downstream task perf more than increasing general corpus size for biomedical NER."
>
> **Premises**:
> - BioBERT pre-trained on PubMed (4.5B words) outperforms BERT-Large on general English (16B words) on 6/6 biomedical NER benchmarks (Lee et al., 2020)
> - SciBERT pre-trained on Semantic Scholar (3.1B words) outperforms BERT-Base on SciERC + JNLPBA despite smaller pre-training corpus
> - General-domain scaling (BERT-Base → BERT-Large, 3x params) smaller gains on biomedical NER than domain adaptation (BERT-Base → BioBERT, same params)
>
> **Logical chain**: Evidence consistently shows domain corpus selection outweighs scale for biomedical NER (evidential: these results more likely if domain specificity > scale). 3 independent comparisons same direction → strengthens inductive case.
>
> **Counterargument (steelmanned)**: "Results may not generalize beyond biomedical NER — biomedicine has unusually specialized vocab inflating domain-adaptation advantage."
>
> **Rebuttal**: Valid limitation. Hypothesis scoped biomedical NER specifically. Similar gains appear legal NLP (Legal-BERT) + financial NLP (FinBERT) → pattern may generalize to other specialized domains, separate claim needing its own evidence.

**→** Complete argument chain + premises + logical connection + steelmanned counterargument + rebuttal. Reader follows step by step.

**If err:** Argument weak → check premises. Weak args stem from unsupported premises not faulty logic. Find evidence per premise or acknowledge as assumption. Counterargument stronger than rebuttal → hypothesis needs revision.

### Step 4: Concrete Examples

Support w/ independently verifiable evidence. Not illustrations — empirical foundation making argument testable.

1. ≥1 **positive example** confirming hypothesis
2. ≥1 **edge case/boundary example** testing limits
3. Each **independently verifiable**: another person can reproduce or check no relying on your interpretation
4. Code claims → specific files, line nums, commits
5. Research claims → specific papers, datasets, experimental results

**Example selection criteria:**

| Criterion              | Good example                                        | Bad example                              |
|------------------------|-----------------------------------------------------|------------------------------------------|
| Independently verifiable | "Issue #42 shows the bug was fixed in handler A but not B" | "We've seen this kind of bug before"     |
| Specific               | "`createUser` at line 47 re-implements the same regex as `updateUser` at line 23" | "There's duplication in the codebase"    |
| Representative         | "3 of 5 validation bugs in the last 6 months followed this pattern" | "I once saw a bug like this"             |
| Includes edge cases    | "This pattern holds for string inputs but not for file upload validation, which has handler-specific constraints" | (no limitations mentioned)               |

**→** Concrete examples reader can verify independently. ≥1 positive + 1 edge case. Each refs specific artifact (file, line, issue, paper, dataset).

**If err:** Examples hard to find → hypothesis too broad or not grounded observable reality. Narrow scope → what you can actually point to. Absence = signal, not gap to paper over.

### Step 5: Assemble Complete Argument

Combine hypothesis + argument + examples → appropriate format for ctx.

1. **Code reviews** — structure:
   ```
   [S] <one-line summary of the suggestion>

   **Hypothesis**: <what you believe should change and why>

   **Argument**: <the logical case, with premises>

   **Evidence**: <specific files, lines, issues, or metrics>

   **Suggestion**: <concrete code change or approach>
   ```

2. **PR descriptions** — body:
   ```markdown
   ## Why

   <Hypothesis: what problem this solves and the specific improvement claim>

   ## Approach

   <Argument: why this approach was chosen over alternatives>

   ## Evidence

   <Examples: benchmarks, bug references, before/after comparisons>
   ```

3. **ADRs (Architecture Decision Records)** — std ADR format + triad → Context (hypothesis), Decision (argument), Consequences (examples/evidence of expected outcomes)

4. **Research writing** — std structure: Intro = hypothesis, Methods/Results = argument + examples, Discussion = counterarguments

5. Review assembled for:
   - Logical gaps (conclusion follow from premises?)
   - Missing evidence (unsupported premises?)
   - Unaddressed counterarguments (strongest objection answered?)
   - Scope creep (stays within hypothesis bounds?)

**→** Complete formatted argument appropriate for ctx. Reader can eval hypothesis, follow reasoning, check evidence, consider counterarguments — all in 1 coherent structure.

**If err:** Assembled feels disjointed → hypothesis too broad. Split into focused sub-arguments, each w/ own triad. 2 tight > 1 sprawling.

## Check

- [ ] Hypothesis falsifiable (could disprove w/ evidence)
- [ ] Hypothesis scoped specific ctx, not universal
- [ ] Argument type ID'd + appropriate for claim
- [ ] Premises stated explicitly, not assumed shared knowledge
- [ ] Logical chain connects premises → conclusion no gaps
- [ ] Strongest counterargument steelmanned + addressed
- [ ] ≥1 positive example supports
- [ ] ≥1 edge case or limitation acknowledged
- [ ] All examples independently verifiable (refs provided)
- [ ] Out format matches ctx (code review, PR, ADR, research)
- [ ] No logical fallacies (appeal to authority, false dichotomy, strawman)

## Traps

- **State opinions as hypotheses**: "This code is messy" = preference not hypothesis. Rewrite testable: "This module has 4 responsibilities that should be separated per single-responsibility principle, as evidenced by 6 public methods spanning 3 unrelated domains."
- **Skip counterargument**: Unaddressed objections weaken even if reader never voices. Always steelman — state strongest opposing in best form before rebutting.
- **Vague examples**: "We've seen this pattern" not evidence. Point to specific issues, commits, lines, papers, datasets. Can't find concrete → hypothesis not well-grounded.
- **Argument from authority**: "Senior engineer said so" or "Google does it this way" not logical argument. Authority *motivates* investigation; argument must stand on evidence + reasoning.
- **Scope creep in conclusions**: Drawing broader than evidence supports. Examples cover 3 API handlers → don't conclude about entire codebase. Match conclusion scope → evidence scope.
- **Conflate argument types**: Inductive lang ("tends to") for deductive ("must be") or vice versa. Precise about strength — deductive = certainty, inductive = probability.

## →

- `review-pull-request` — apply argumentation → structured code review feedback
- `review-research` — evidence-based arguments in research
- `review-software-architecture` — justify architectural decisions via triad
- `create-skill` — skills = structured arguments for how to accomplish task
- `write-claude-md` — doc conventions + decisions benefiting from clear justification

### Composition: Argumentation + Advocatus Diaboli

High-stakes decisions → compose w/ `advocatus-diaboli` agent → pre-decision review loop:

1. **Structure** via argumentation — build triad
2. **Stress-test** via advocatus-diaboli — steelman proposal, challenge each assumption w/ specific questions. Severity: Critical (redesign/abandon), Medium (adjust), Low (note + proceed)
3. **Revise** per findings — critical → redesign; medium → adjustment; low → noted

**When compose vs alone:**
- Argumentation alone → constructing proposal, PR desc, design justification
- Advocatus-diaboli alone → reviewing someone else's existing argument
- Compose both → you're both proposer + need adversarial self-review pre-committing

**Example — PR response refinement:**
Argumentation structured response (hypothesis: combining PRs better, argument w/ evidence, collaboration offer). Advocatus-diaboli caught 2 critical issues: claim about proxy proc ID speculative not factual (would've been embarrassing on security PR), "I have tested this in practice" unverifiable. Both removed. Final 40-50% shorter — overexplaining signals insecurity.

**Example — System design triage:**
Argumentation (via Plan agent) designed full 500-line triage pipeline. Advocatus-diaboli killed: at 9 items, premature + system itself would become maintenance burden (recursive trap). Final: 25 lines added to existing script.
