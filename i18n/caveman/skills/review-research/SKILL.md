---
name: review-research
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Conduct peer review of research methodology, experimental design,
  manuscript quality. Covers methodology evaluation, statistical
  appropriateness, reproducibility assessment, bias identification,
  constructive feedback. Use when reviewing manuscript, preprint, or
  internal research report; evaluating research proposal or study
  protocol; assessing evidence quality behind a claim; or reviewing
  thesis chapter or dissertation section.
license: MIT
allowed-tools: Read Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: natural
  tags: peer-review, methodology, research, reproducibility, bias, manuscript
---

# Review Research

Perform structured peer review of research work. Evaluate methodology, statistical choices, reproducibility, overall scientific rigour.

## When Use

- Reviewing manuscript, preprint, or internal research report
- Evaluating research proposal or study protocol
- Assessing quality of evidence behind a claim or recommendation
- Providing feedback on colleague research design before data collection
- Reviewing thesis chapter or dissertation section

## Inputs

- **Required**: Research document (manuscript, report, proposal, or protocol)
- **Required**: Field/discipline context (affects methodology standards)
- **Optional**: Journal or venue guidelines (if reviewing for publication)
- **Optional**: Supplementary materials (data, code, appendices)
- **Optional**: Prior reviewer comments (if reviewing a revision)

## Steps

### Step 1: First Pass — Scope and Structure

Read entire document once to understand:
1. **Research question**: Clearly stated and specific?
2. **Contribution claim**: What is novel or new?
3. **Overall structure**: Does it follow expected format (IMRaD, or venue-specific)?
4. **Scope match**: Work appropriate for target audience/venue?

```markdown
## First Pass Assessment
- **Research question**: [Clear / Vague / Missing]
- **Novelty claim**: [Stated and supported / Overstated / Unclear]
- **Structure**: [Complete / Missing sections: ___]
- **Scope fit**: [Appropriate / Marginal / Not appropriate]
- **Recommendation after first pass**: [Continue review / Major concerns to flag early]
```

**Got:** Clear understanding of paper claims and contribution.
**If fail:** Research question unclear after full read? Note this as major concern and proceed.

### Step 2: Evaluate Methodology

Assess research design against standards for the field:

#### Quantitative Research
- [ ] Study design appropriate for research question (experimental, quasi-experimental, observational, survey)
- [ ] Sample size justified (power analysis or practical rationale)
- [ ] Sampling method described and appropriate (random, stratified, convenience)
- [ ] Variables clearly defined (independent, dependent, control, confounding)
- [ ] Measurement instruments validated and reliability reported
- [ ] Data collection procedure reproducible from description
- [ ] Ethical considerations addressed (IRB/ethics approval, consent)

#### Qualitative Research
- [ ] Methodology explicit (grounded theory, phenomenology, case study, ethnography)
- [ ] Participant selection criteria and saturation discussed
- [ ] Data collection methods described (interviews, observations, documents)
- [ ] Researcher positionality acknowledged
- [ ] Trustworthiness strategies reported (triangulation, member checking, audit trail)
- [ ] Ethical considerations addressed

#### Mixed Methods
- [ ] Rationale for mixed design explained
- [ ] Integration strategy described (convergent, explanatory sequential, exploratory sequential)
- [ ] Both quantitative and qualitative components meet their respective standards

**Got:** Methodology checklist completed with specific observations for each item.
**If fail:** Critical methodology information missing? Flag as major concern rather than assume.

### Step 3: Assess Statistical and Analytical Choices

- [ ] Statistical methods appropriate for data type and research question
- [ ] Assumptions of statistical tests checked and reported (normality, homoscedasticity, independence)
- [ ] Effect sizes reported alongside p-values
- [ ] Confidence intervals provided where appropriate
- [ ] Multiple comparison corrections applied when needed (Bonferroni, FDR, etc.)
- [ ] Missing data handling described and appropriate
- [ ] Sensitivity analyses conducted for key assumptions
- [ ] Results interpretation consistent with analysis (not overstating findings)

Common statistical red flags:
- p-hacking indicators (many comparisons, selective reporting, "marginally significant")
- Inappropriate tests (t-test on non-normal data without justification, parametric tests on ordinal data)
- Confusing statistical significance with practical significance
- No effect size reporting
- Post-hoc hypotheses presented as a priori

**Got:** Statistical choices evaluated with specific concerns documented.
**If fail:** Reviewer lacks expertise in specific method? Acknowledge this and recommend specialist reviewer.

### Step 4: Evaluate Reproducibility

- [ ] Data availability stated (open data, repository link, available on request)
- [ ] Analysis code availability stated
- [ ] Software versions and environments documented
- [ ] Random seeds or reproducibility mechanisms described
- [ ] Key parameters and hyperparameters reported
- [ ] Computational environment described (hardware, OS, dependencies)

Reproducibility tiers:
| Tier | Description | Evidence |
|------|-------------|----------|
| Gold | Fully reproducible | Open data + open code + containerized environment |
| Silver | Substantially reproducible | Data available, analysis described in detail |
| Bronze | Potentially reproducible | Methods described but no data/code sharing |
| Opaque | Not reproducible | Insufficient method detail or proprietary data |

**Got:** Reproducibility tier assigned with justification.
**If fail:** Data cannot be shared (privacy, proprietary)? Synthetic data or detailed pseudocode acceptable alternative — note whether this provided.

### Step 5: Identify Potential Biases

- [ ] Selection bias: Were participants representative of target population?
- [ ] Measurement bias: Could measurement process have systematically distorted results?
- [ ] Reporting bias: Are all outcomes reported, including non-significant ones?
- [ ] Confirmation bias: Did authors only look for evidence supporting their hypothesis?
- [ ] Survivorship bias: Were dropouts, excluded data, or failed experiments accounted for?
- [ ] Funding bias: Is funding source disclosed and could it influence findings?
- [ ] Publication bias: Is this complete picture or might negative results be missing?

**Got:** Potential biases identified with specific examples from manuscript.
**If fail:** Biases cannot be assessed from available information? Recommend authors address this explicit.

### Step 6: Write the Review

Structure review constructively:

```markdown
## Summary
[2-3 sentences summarizing the paper's contribution and your overall assessment]

## Major Concerns
[Issues that must be addressed before the work can be considered sound]

1. **[Concern title]**: [Specific description with reference to section/page/figure]
   - *Suggestion*: [How the authors might address this]

2. ...

## Minor Concerns
[Issues that improve quality but are not fundamental]

1. **[Concern title]**: [Specific description]
   - *Suggestion*: [Recommended change]

## Questions for the Authors
[Clarifications needed to complete the evaluation]

1. ...

## Positive Observations
[Specific strengths worth acknowledging]

1. ...

## Recommendation
[Accept / Minor revision / Major revision / Reject]
[Brief rationale for the recommendation]
```

**Got:** Review specific, constructive, references exact locations in manuscript.
**If fail:** Review running long? Prioritize major concerns and note minor issues in summary list.

## Checks

- [ ] Every major concern references specific section, figure, or claim
- [ ] Feedback constructive — problems paired with suggestions
- [ ] Positive aspects acknowledged alongside concerns
- [ ] Statistical assessment matches analysis methods used
- [ ] Reproducibility explicit evaluated
- [ ] Recommendation consistent with severity of concerns raised
- [ ] Tone professional, respectful, collegial

## Pitfalls

- **Vague criticism**: "The methodology is weak" is unhelpful. Specify what is weak and why.
- **Demand a different study**: Review research that was done, not research you would have done.
- **Ignore scope**: Conference paper has different expectations than journal article.
- **Ad hominem**: Review the work, not the authors. Never reference author identity.
- **Perfectionism**: No study is perfect. Focus on concerns that would change conclusions.

## See Also

- `review-data-analysis` — deeper focus on data quality and model validation
- `format-apa-report` — APA formatting standards for research reports
- `generate-statistical-tables` — publication-ready statistical tables
- `validate-statistical-output` — statistical output verification
