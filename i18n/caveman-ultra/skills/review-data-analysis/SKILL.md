---
name: review-data-analysis
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Review data analysis → quality, correctness, reproducibility. Data quality
  assess, assumption check, model validation, leakage detect, reproducibility
  verify. Use → review colleague analysis pre-publication, validate ML
  pipeline pre-prod, audit report for regulatory/business decision, second-
  analyst review in regulated env.
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: data-quality, model-validation, leakage, reproducibility, statistics, review
---

# Review Data Analysis

Eval data analysis pipeline → correctness, robustness, reproducibility.

## Use When

- Review colleague analysis notebook/script pre-publication
- Validate ML pipeline pre-prod deploy
- Audit analytical report for regulatory or business decision
- Assess analysis supports stated conclusions
- Second-analyst review in regulated env

## In

- **Required**: Analysis code (scripts, notebooks, pipeline defs)
- **Required**: Analysis output (results, tables, figures, model metrics)
- **Optional**: Raw data or data dict
- **Optional**: Analysis plan/protocol (pre-registered or ad-hoc)
- **Optional**: Target audience + decision ctx

## Do

### Step 1: Data Quality

Review input data before eval analysis:

```markdown
## Data Quality Assessment

### Completeness
- [ ] Missing data quantified (% by column and by row)
- [ ] Missing data mechanism considered (MCAR, MAR, MNAR)
- [ ] Imputation method appropriate (if used) or complete-case analysis justified

### Consistency
- [ ] Data types match expectations (dates are dates, numbers are numbers)
- [ ] Value ranges are plausible (no negative ages, future dates in historical data)
- [ ] Categorical variables have expected levels (no misspellings, consistent coding)
- [ ] Units are consistent across records

### Uniqueness
- [ ] Duplicate records identified and handled
- [ ] Primary keys are unique where expected
- [ ] Join operations produce expected row counts (no fan-out or drop)

### Timeliness
- [ ] Data vintage appropriate for the analysis question
- [ ] Temporal coverage matches the study period
- [ ] No look-ahead bias in time-series data

### Provenance
- [ ] Data source documented
- [ ] Extraction date/version recorded
- [ ] Any transformations between source and analysis input documented
```

→ Data quality issues documented w/ potential impact on results.
If err: data not accessible for review → assess quality from code (what checks + transformations applied).

### Step 2: Check Assumptions

For each statistical method/model used:

| Method | Key Assumptions | How to Check |
|--------|----------------|-------------|
| Linear regression | Linearity, independence, normality of residuals, homoscedasticity | Residual plots, Q-Q plot, Durbin-Watson, Breusch-Pagan |
| Logistic regression | Independence, no multicollinearity, linear logit | VIF, Box-Tidwell, residual diagnostics |
| t-test | Independence, normality (or large n), equal variance | Shapiro-Wilk, Levene's test, visual inspection |
| ANOVA | Independence, normality, homogeneity of variance | Shapiro-Wilk per group, Levene's test |
| Chi-squared | Independence, expected frequency ≥ 5 | Expected frequency table |
| Random forest | Sufficient training data, feature relevance | OOB error, feature importance, learning curves |
| Neural network | Sufficient data, appropriate architecture, no data leakage | Validation curves, overfitting checks |

```markdown
## Assumption Check Results
| Analysis Step | Method | Assumption | Checked? | Result |
|---------------|--------|------------|----------|--------|
| Primary model | Linear regression | Normality of residuals | Yes | Q-Q plot shows mild deviation — acceptable for n>100 |
| Primary model | Linear regression | Homoscedasticity | No | Not checked — recommend adding Breusch-Pagan test |
```

→ Every method has assumptions explicitly checked or ack'd.
If err: assumptions violated → check if authors addressed (robust methods, transformations, sensitivity analysis).

### Step 3: Detect Leakage

Leakage occurs when info from outside training set influences model → over-optimistic perf:

#### Common patterns:
- [ ] **Target leakage**: Feature directly encoding target (e.g. "treatment_outcome" predicting "treatment_success")
- [ ] **Temporal leakage**: Future info predicting past (features computed from data unavailable at prediction time)
- [ ] **Train-test contamination**: Preprocessing (scaling, imputation, feature select) fitted on full dataset before split
- [ ] **Group leakage**: Related obs (same patient, same device) split across train/test
- [ ] **Feature engineering leakage**: Aggregates computed across entire dataset not within training fold

```markdown
## Leakage Assessment
| Check | Status | Evidence |
|-------|--------|----------|
| Target leakage | Clear | No features derived from target |
| Temporal leakage | CONCERN | Feature X uses 30-day forward average |
| Train-test contamination | Clear | StandardScaler fit on train only |
| Group leakage | CONCERN | Patient IDs not used for stratified split |
```

→ All common leakage patterns checked w/ clear/concern status.
If err: leakage found → est impact by re-running w/o leaked feature (if possible) or flag for analyst.

### Step 4: Validate Perf

#### Predictive models:
- [ ] Appropriate metrics for problem (not just accuracy — consider precision, recall, F1, AUC, RMSE, MAE)
- [ ] Cross-validation or holdout strategy described + appropriate
- [ ] Perf on training vs test/validation compared (overfitting check)
- [ ] Baseline comparison (naive model, random chance, prev approach)
- [ ] Confidence intervals or std errors on metrics
- [ ] Perf eval'd on relevant subgroups (fairness, edge cases)

#### Inferential/explanatory models:
- [ ] Model fit stats reported (R², AIC, BIC, deviance)
- [ ] Coefficients interpreted correctly (direction, magnitude, significance)
- [ ] Multicollinearity assessed (VIF < 5–10)
- [ ] Influential obs ID'd (Cook's distance, leverage)
- [ ] Model comparison if multi specifications tested

→ Validation appropriate for use case (prediction vs inference).
If err: test perf suspiciously close to training → flag potential leakage.

### Step 5: Reproducibility

```markdown
## Reproducibility Checklist
| Item | Status | Notes |
|------|--------|-------|
| Code runs without errors | [Yes/No] | Tested on [environment description] |
| Random seeds set | [Yes/No] | Line [N] in [file] |
| Dependencies documented | [Yes/No] | requirements.txt / renv.lock present |
| Data loading reproducible | [Yes/No] | Path is [relative/absolute/URL] |
| Results match reported values | [Yes/No] | Verified: Table 1 ✓, Figure 2 ✗ (minor discrepancy) |
| Environment documented | [Yes/No] | Python 3.11 / R 4.5.0 specified |
```

→ Reproducibility verified by re-running (or assess from code if data unavailable).
If err: results don't reproduce exactly → determine if diff w/in floating-point tolerance or indicates problem.

### Step 6: Write Review

```markdown
## Data Analysis Review

### Overall Assessment
[1-2 sentences: Is the analysis sound? Does it support the conclusions?]

### Data Quality
[Summary of data quality findings, impact on results]

### Methodological Concerns
1. **[Title]**: [Description, location in code/report, suggestion]
2. ...

### Strengths
1. [What was done well]
2. ...

### Reproducibility
[Tier assessment: Gold/Silver/Bronze/Opaque with justification]

### Recommendations
- [ ] [Specific action items for the analyst]
```

→ Review provides actionable feedback w/ specific refs to code locations.
If err: time-constrained → prioritize data quality + leakage checks over style.

## Check

- [ ] Data quality assessed across completeness, consistency, uniqueness, timeliness, provenance
- [ ] Statistical assumptions checked for each method
- [ ] Leakage systematically assessed
- [ ] Model perf validated w/ appropriate metrics + baselines
- [ ] Reproducibility eval'd (code runs, results match)
- [ ] Feedback specific, refs code lines or report sections
- [ ] Tone constructive + collaborative

## Traps

- **Review only code**: Plan + conclusions matter as much as impl.
- **Ignore data quality**: Sophisticated models on bad data → confident wrong answers.
- **Assume correctness from complexity**: Random forest w/ 95% accuracy may have leakage; simple t-test may be correct.
- **Not run code**: If possible, execute to verify reproducibility. Reading code not sufficient.
- **Miss forest for trees**: Don't get lost in code style while missing fundamental analytical err.

## →

- `review-research` — broader research methodology + manuscript review
- `validate-statistical-output` — double-programming verification methodology
- `generate-statistical-tables` — publication-ready statistical tables
- `review-software-architecture` — code structure + design review
