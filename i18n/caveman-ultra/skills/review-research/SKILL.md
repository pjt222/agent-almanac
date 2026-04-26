---
name: review-research
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Peer review research methodology, experimental design, manuscript quality.
  Methodology eval, statistical appropriateness, reproducibility assess, bias
  ID, constructive feedback. Use → review manuscript/preprint/internal report,
  eval research proposal/protocol, assess evidence quality behind claim,
  review thesis chapter or dissertation section.
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

Structured peer review of research, eval methodology, statistical choices, reproducibility, overall scientific rigour.

## Use When

- Review manuscript, preprint, internal research report
- Eval research proposal or study protocol
- Assess evidence quality behind claim/recommendation
- Provide feedback on colleague's design before data collection
- Review thesis chapter or dissertation section

## In

- **Required**: Research doc (manuscript, report, proposal, protocol)
- **Required**: Field/discipline ctx (affects methodology stds)
- **Optional**: Journal/venue guidelines (if reviewing for publication)
- **Optional**: Supplementary materials (data, code, appendices)
- **Optional**: Prior reviewer comments (if reviewing revision)

## Do

### Step 1: First Pass — Scope + Structure

Read entire doc once → understand:
1. **Research q**: Clearly stated + specific?
2. **Contribution claim**: What is novel?
3. **Overall structure**: Follows expected format (IMRaD, venue-specific)?
4. **Scope match**: Appropriate for target audience/venue?

```markdown
## First Pass Assessment
- **Research question**: [Clear / Vague / Missing]
- **Novelty claim**: [Stated and supported / Overstated / Unclear]
- **Structure**: [Complete / Missing sections: ___]
- **Scope fit**: [Appropriate / Marginal / Not appropriate]
- **Recommendation after first pass**: [Continue review / Major concerns to flag early]
```

→ Clear understanding of paper's claims + contribution.
If err: research q unclear after full read → note as major concern + proceed.

### Step 2: Eval Methodology

Assess design vs std for field:

#### Quantitative Research
- [ ] Study design appropriate for q (experimental, quasi-experimental, observational, survey)
- [ ] Sample size justified (power analysis or practical rationale)
- [ ] Sampling method described + appropriate (random, stratified, convenience)
- [ ] Vars clearly defined (independent, dependent, control, confounding)
- [ ] Measurement instruments validated + reliability reported
- [ ] Data collection procedure reproducible from description
- [ ] Ethical considerations addressed (IRB/ethics approval, consent)

#### Qualitative Research
- [ ] Methodology explicit (grounded theory, phenomenology, case study, ethnography)
- [ ] Participant selection criteria + saturation discussed
- [ ] Data collection methods described (interviews, observations, documents)
- [ ] Researcher positionality acknowledged
- [ ] Trustworthiness strategies reported (triangulation, member checking, audit trail)
- [ ] Ethical considerations addressed

#### Mixed Methods
- [ ] Rationale for mixed design explained
- [ ] Integration strategy described (convergent, explanatory sequential, exploratory sequential)
- [ ] Both quant + qual components meet respective stds

→ Methodology checklist completed w/ specific obs each item.
If err: critical methodology missing → flag major concern not assume.

### Step 3: Statistical + Analytical Choices

- [ ] Stats appropriate for data type + research q
- [ ] Assumptions checked + reported (normality, homoscedasticity, independence)
- [ ] Effect sizes reported alongside p-values
- [ ] Confidence intervals provided where appropriate
- [ ] Multi comparison corrections applied when needed (Bonferroni, FDR, etc.)
- [ ] Missing data handling described + appropriate
- [ ] Sensitivity analyses for key assumptions
- [ ] Results interpretation consistent w/ analysis (no overstating)

Common stat red flags:
- p-hacking indicators (many comparisons, selective reporting, "marginally significant")
- Inappropriate tests (t-test on non-normal w/o justification, parametric on ordinal)
- Confusing statistical significance w/ practical
- No effect size reporting
- Post-hoc hypotheses presented as a priori

→ Stat choices eval'd w/ specific concerns documented.
If err: reviewer lacks expertise in specific method → ack + recommend specialist reviewer.

### Step 4: Reproducibility

- [ ] Data availability stated (open data, repo link, on req)
- [ ] Analysis code availability stated
- [ ] Software vers + envs documented
- [ ] Random seeds or reproducibility mechanisms described
- [ ] Key params + hyperparameters reported
- [ ] Computational env described (hardware, OS, deps)

Reproducibility tiers:
| Tier | Description | Evidence |
|------|-------------|----------|
| Gold | Fully reproducible | Open data + open code + containerized environment |
| Silver | Substantially reproducible | Data available, analysis described in detail |
| Bronze | Potentially reproducible | Methods described but no data/code sharing |
| Opaque | Not reproducible | Insufficient method detail or proprietary data |

→ Reproducibility tier assigned w/ justification.
If err: data can't be shared (privacy, proprietary) → synthetic data or detailed pseudocode acceptable alt — note if provided.

### Step 5: Identify Biases

- [ ] Selection bias: Participants representative of target pop?
- [ ] Measurement bias: Could measurement systematically distort results?
- [ ] Reporting bias: All outcomes reported, including non-significant?
- [ ] Confirmation bias: Did authors only look for evidence supporting hypothesis?
- [ ] Survivorship bias: Dropouts, excluded data, failed exps accounted for?
- [ ] Funding bias: Funding source disclosed + could influence findings?
- [ ] Publication bias: Complete picture or might negative results be missing?

→ Potential biases ID'd w/ specific examples from manuscript.
If err: biases can't be assessed from available info → recommend authors address explicitly.

### Step 6: Write Review

Structure constructive:

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

→ Review specific, constructive, refs exact locations in manuscript.
If err: review running long → prioritize major concerns + note minor in summary list.

## Check

- [ ] Every major concern refs specific section, figure, claim
- [ ] Feedback constructive — problems paired w/ suggestions
- [ ] Positive aspects ack'd alongside concerns
- [ ] Stat assessment matches analysis methods used
- [ ] Reproducibility explicitly eval'd
- [ ] Recommendation consistent w/ severity of concerns raised
- [ ] Tone professional, respectful, collegial

## Traps

- **Vague criticism**: "Methodology is weak" unhelpful. Specify what + why.
- **Demand diff study**: Review research done, not research you would have done.
- **Ignore scope**: Conference paper has diff expectations than journal article.
- **Ad hominem**: Review work, not authors. Never ref author identity.
- **Perfectionism**: No study perfect. Focus on concerns changing conclusions.

## →

- `review-data-analysis` — deeper focus on data quality + model validation
- `format-apa-report` — APA formatting stds for research reports
- `generate-statistical-tables` — publication-ready statistical tables
- `validate-statistical-output` — statistical output verification
