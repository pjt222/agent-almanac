---
name: argumentation
locale: caveman
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

Build rigorous arguments from hypothesis through reasoning to concrete evidence. Every persuasive technical claim follows same triad: clear hypothesis states *what* you believe, argument explains *why* it holds, examples prove *that* it holds. This skill teaches you to apply that structure to code reviews, design decisions, research writing, any context where claims need justification.

## When Use

- Writing or reviewing PR description that proposes technical change
- Justifying design decision in ADR (Architecture Decision Record)
- Constructing feedback in code review that goes beyond "I don't like this"
- Writing research argument or technical proposal
- Challenging or defending approach in technical discussion

## Inputs

- **Required**: Claim or position that needs justification
- **Required**: Context (code review, design decision, research, documentation)
- **Optional**: Audience (peer developers, reviewers, stakeholders, researchers)
- **Optional**: Counterarguments or alternative positions to address
- **Optional**: Evidence or data available to support claim

## Steps

### Step 1: Formulate Hypothesis

State your claim as clear, falsifiable hypothesis. Hypothesis is not opinion or preference -- specific assertion that can be tested against evidence.

1. Write claim in one sentence
2. Apply falsifiability test: can someone prove this wrong with evidence?
3. Scope it narrow: constrain to specific context, codebase, or domain
4. Distinguish from opinions by checking for testable criteria

**Falsifiable vs. unfalsifiable:**

| Unfalsifiable (opinion)              | Falsifiable (hypothesis)                                       |
|--------------------------------------|----------------------------------------------------------------|
| "This code is bad"                   | "This function has O(n^2) complexity where O(n) is achievable" |
| "We should use TypeScript"           | "TypeScript's type system will catch the class of null-reference bugs that caused 4 of our last 6 production incidents" |
| "The API design is cleaner"          | "Replacing the 5 endpoint variants with a single parameterized endpoint reduces the public API surface by 60%" |
| "This research approach is better"   | "Method A achieves higher precision than Method B on dataset X at the 95% confidence level" |

**Got:** One-sentence hypothesis that is specific, scoped, falsifiable. Someone reading it can immediately imagine what evidence would confirm or refute it.

**If fail:** Hypothesis feels vague? Apply "how would I disprove this?" test. Cannot imagine counter-evidence? Claim is opinion, not hypothesis. Narrow scope or add measurable criteria until testable.

### Step 2: Identify Argument Type

Select logical structure that best supports your hypothesis. Different claims call for different reasoning strategies.

1. Review four argument types:

| Type        | Structure                                  | Best for                          |
|-------------|--------------------------------------------|-----------------------------------|
| Deductive   | If A then B; A is true; therefore B        | Formal proofs, type safety claims |
| Inductive   | Observed pattern across N cases; therefore likely in general | Performance data, test results    |
| Analogical  | X is similar to Y in relevant ways; Y has property P; therefore X likely has P | Design decisions, technology choices |
| Evidential  | Evidence E is more likely under hypothesis H1 than H2; therefore H1 is supported | Research findings, A/B test results |

2. Match your hypothesis to strongest argument type:
   - Claiming something *must* be true? Use **deductive**
   - Claiming something *tends* to be true based on observations? Use **inductive**
   - Claiming something *will likely work* based on similar prior cases? Use **analogical**
   - Claiming one explanation *fits the data better* than alternatives? Use **evidential**

3. Consider combining types for stronger arguments (e.g., analogical reasoning backed by inductive evidence)

**Got:** Chosen argument type (or combination) with clear rationale for why it fits hypothesis.

**If fail:** No single type fits cleanly? Hypothesis may need splitting into sub-claims. Break into parts that each have natural argument structure.

### Step 3: Construct Argument

Build logical chain that connects your hypothesis to its justification.

1. State premises (facts or assumptions you start from)
2. Show logical connection (how premises lead to conclusion)
3. Steelman strongest counterargument: state best opposing case *before* refuting it
4. Address counterargument direct with evidence or reasoning

**Worked example -- Code Review (deductive + inductive):**

> **Hypothesis**: "Extracting the validation logic into a shared module will reduce bug duplication across the three API handlers."
>
> **Premises**:
> - The three handlers (`createUser`, `updateUser`, `deleteUser`) each implement the same input validation with slight variations (observed in `src/handlers/`)
> - In the last 6 months, 3 of 5 validation bugs were fixed in one handler but not propagated to the others (see issues #42, #57, #61)
> - Shared modules enforce a single source of truth for logic (deductive: if one implementation, then one place to fix)
>
> **Logical chain**: Because the three handlers duplicate the same validation (premise 1), bugs fixed in one are missed in others (premise 2, inductive from 3/5 cases). A shared module means fixes apply once to all callers (deductive from shared-module semantics). Therefore, extraction will reduce bug duplication.
>
> **Counterargument (steelmanned)**: "Shared modules introduce coupling -- a change to validation for one handler could break the others."
>
> **Rebuttal**: The handlers already share identical validation *intent*; the coupling is implicit and harder to maintain. Making it explicit via a shared module with parameterized options (e.g., `validate(input, { requireEmail: true })`) makes the coupling visible and testable. The current implicit duplication is riskier because it hides the dependency.

**Worked example -- Research (evidential):**

> **Hypothesis**: "Pre-training on domain-specific corpora improves downstream task performance more than increasing general corpus size for biomedical NER."
>
> **Premises**:
> - BioBERT pre-trained on PubMed (4.5B words) outperforms BERT-Large pre-trained on general English (16B words) on 6/6 biomedical NER benchmarks (Lee et al., 2020)
> - SciBERT pre-trained on Semantic Scholar (3.1B words) outperforms BERT-Base on SciERC and JNLPBA despite a smaller pre-training corpus
> - General-domain scaling (BERT-Base to BERT-Large, 3x parameters) yields smaller gains on biomedical NER than domain adaptation (BERT-Base to BioBERT, same parameters)
>
> **Logical chain**: The evidence consistently shows that domain corpus selection outweighs corpus scale for biomedical NER (evidential: these results are more likely if domain specificity matters more than scale). Three independent comparisons point the same direction, strengthening the inductive case.
>
> **Counterargument (steelmanned)**: "These results may not generalize beyond biomedical NER -- biomedicine has unusually specialized vocabulary that inflates the domain-adaptation advantage."
>
> **Rebuttal**: Valid limitation. The hypothesis is scoped to biomedical NER specifically. However, similar domain-adaptation gains appear in legal NLP (Legal-BERT) and financial NLP (FinBERT), suggesting the pattern may generalize to other specialized domains, though that is a separate claim requiring its own evidence.

**Got:** Complete argument chain with premises, logical connection, steelmanned counterargument, rebuttal. Reader can follow reasoning step by step.

**If fail:** Argument feels weak? Check premises. Weak arguments usually stem from unsupported premises, not faulty logic. Find evidence for each premise or acknowledge it as assumption. Counterargument stronger than rebuttal? Hypothesis may need revision.

### Step 4: Provide Concrete Examples

Support argument with independently verifiable evidence. Examples not illustrations -- empirical foundation that makes argument testable.

1. Provide at least one **positive example** that confirms hypothesis
2. Provide at least one **edge case or boundary example** that tests limits
3. Ensure each example **independently verifiable**: another person can reproduce or check it without relying on your interpretation
4. For code claims, reference specific files, line numbers, or commits
5. For research claims, cite specific papers, datasets, or experimental results

**Example selection criteria:**

| Criterion              | Good example                                        | Bad example                              |
|------------------------|-----------------------------------------------------|------------------------------------------|
| Independently verifiable | "Issue #42 shows the bug was fixed in handler A but not B" | "We've seen this kind of bug before"     |
| Specific               | "`createUser` at line 47 re-implements the same regex as `updateUser` at line 23" | "There's duplication in the codebase"    |
| Representative         | "3 of 5 validation bugs in the last 6 months followed this pattern" | "I once saw a bug like this"             |
| Includes edge cases    | "This pattern holds for string inputs but not for file upload validation, which has handler-specific constraints" | (no limitations mentioned)               |

**Got:** Concrete examples that reader can verify independently. At least one positive and one edge case. Each references specific artifact (file, line, issue, paper, dataset).

**If fail:** Examples hard to find? Hypothesis may be too broad or not grounded in observable reality. Narrow scope to what you can actually point to. Absence of examples is signal, not gap to paper over with vague references.

### Step 5: Assemble Complete Argument

Combine hypothesis, argument, examples into appropriate format for context.

1. **For code reviews** -- structure comment as:
   ```
   [S] <one-line summary of the suggestion>

   **Hypothesis**: <what you believe should change and why>

   **Argument**: <the logical case, with premises>

   **Evidence**: <specific files, lines, issues, or metrics>

   **Suggestion**: <concrete code change or approach>
   ```

2. **For PR descriptions** -- structure body as:
   ```markdown
   ## Why

   <Hypothesis: what problem this solves and the specific improvement claim>

   ## Approach

   <Argument: why this approach was chosen over alternatives>

   ## Evidence

   <Examples: benchmarks, bug references, before/after comparisons>
   ```

3. **For ADRs (Architecture Decision Records)** -- use standard ADR format with triad mapped to Context (hypothesis), Decision (argument), Consequences (examples/evidence of expected outcomes)

4. **For research writing** -- map to standard structure: Introduction states hypothesis, Methods/Results provide argument and examples, Discussion addresses counterarguments

5. Review assembled argument for:
   - Logical gaps (does conclusion actually follow from premises?)
   - Missing evidence (any unsupported premises?)
   - Unaddressed counterarguments (is strongest objection answered?)
   - Scope creep (does argument stay within hypothesis bounds?)

**Got:** Complete, formatted argument appropriate for its context. Reader can evaluate hypothesis, follow reasoning, check evidence, consider counterarguments -- all in one coherent structure.

**If fail:** Assembled argument feels disjointed? Hypothesis may be too broad. Split into focused sub-arguments, each with its own hypothesis-argument-example triad. Two tight arguments stronger than one sprawling one.

## Checks

- [ ] Hypothesis is falsifiable (someone could disprove it with evidence)
- [ ] Hypothesis scoped to specific context, not universal claim
- [ ] Argument type identified and appropriate for claim
- [ ] Premises stated explicitly, not assumed as shared knowledge
- [ ] Logical chain connects premises to conclusion without gaps
- [ ] Strongest counterargument steelmanned and addressed
- [ ] At least one positive example supports hypothesis
- [ ] At least one edge case or limitation acknowledged
- [ ] All examples independently verifiable (references provided)
- [ ] Output format matches context (code review, PR, ADR, research)
- [ ] No logical fallacies (appeal to authority, false dichotomy, strawman)

## Pitfalls

- **Stating opinions as hypotheses**: "This code is messy" is preference, not hypothesis. Rewrite as testable claim: "This module has 4 responsibilities that should be separated per single-responsibility principle, as evidenced by its 6 public methods spanning 3 unrelated domains."
- **Skipping counterargument**: Unaddressed objections weaken argument even if reader never voices them. Always steelman -- state strongest opposing case in its best form before rebutting it.
- **Vague examples**: "We've seen this pattern before" is not evidence. Point to specific issues, commits, lines, papers, datasets. Cannot find concrete example? Hypothesis may not be well-grounded.
- **Argument from authority**: "The senior engineer said so" or "Google does it this way" is not logical argument. Authority can *motivate* investigation, but argument must stand on its own evidence and reasoning.
- **Scope creep in conclusions**: Drawing conclusions broader than evidence supports. Examples cover 3 API handlers? Don't conclude about entire codebase. Match conclusion scope to evidence scope.
- **Conflating argument types**: Using inductive language ("tends to") for deductive claims ("must be") or vice versa. Be precise about strength of conclusion -- deductive arguments give certainty, inductive arguments give probability.

## See Also

- `review-pull-request` -- applying argumentation to structured code review feedback
- `review-research` -- constructing evidence-based arguments in research contexts
- `review-software-architecture` -- justifying architectural decisions with hypothesis-argument-example triad
- `create-skill` -- skills themselves are structured arguments for how to accomplish a task
- `write-claude-md` -- documenting conventions and decisions that benefit from clear justification

### Composition: Argumentation + Advocatus Diaboli

For high-stakes decisions, compose this skill with `advocatus-diaboli` agent to form pre-decision review loop. Pattern:

1. **Structure** via argumentation -- build hypothesis-argument-example triad
2. **Stress-test** via advocatus-diaboli -- steelman proposal, then challenge each assumption with specific questions. Flag severity: Critical (redesign or abandon), Medium (adjust), Low (note and proceed)
3. **Revise** based on findings -- critical findings trigger redesign; medium findings trigger adjustment; low findings noted

**When to compose vs. use alone:**
- Use argumentation alone when constructing proposal, PR description, or design justification
- Use advocatus-diaboli alone when reviewing someone else's existing argument
- Compose both when you are both proposer and need adversarial self-review before committing

**Example -- PR response refinement:**
Argumentation structured response (hypothesis: combining PRs is better, argument with evidence, collaboration offer). Advocatus-diaboli then caught two critical issues: claim about proxy process identification was speculative rather than factual (would have been embarrassing on security PR), and "I have tested this in practice" was unverifiable. Both removed. Final response was 40-50% shorter -- overexplaining signals insecurity.

**Example -- System design triage:**
Argumentation (via Plan agent) designed full 500-line triage pipeline. Advocatus-diaboli killed it: at 9 items, system was premature and would itself become maintenance burden (recursive trap). Final solution: 25 lines added to existing script.
