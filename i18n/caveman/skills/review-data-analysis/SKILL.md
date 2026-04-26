---
name: review-data-analysis
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Review data analysis for quality, correctness, reproducibility. Covers
  data quality assessment, assumption checking, model validation, data
  leakage detection, reproducibility verification. Use when reviewing
  colleague analysis before publication, validating ML pipeline before
  production deployment, auditing report for regulatory or business
  decision-making, or performing second-analyst review in regulated
  environment.
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

Evaluate data analysis pipeline for correctness, robustness, reproducibility.

## When Use

- Reviewing colleague analysis notebook or script before publication
- Validating machine learning pipeline before production deployment
- Auditing analytical report for regulatory or business decision-making
- Assessing whether analysis supports its stated conclusions
- Performing second-analyst review in regulated environment

## Inputs

- **Required**: Analysis code (scripts, notebooks, or pipeline definitions)
- **Required**: Analysis output (results, tables, figures, model metrics)
- **Optional**: Raw data or data dictionary
- **Optional**: Analysis plan or protocol (pre-registered or ad-hoc)
- **Optional**: Target audience and decision context

## Steps

### Step 1: Assess Data Quality

Review input data before evaluate analysis:

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

**Got:** Data quality issues documented with their potential impact on results.
**If fail:** Data not accessible for review? Assess quality from code (what checks and transformations are applied).

### Step 2: Check Assumptions

For each statistical method or model used:

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

**Got:** Every statistical method has its assumptions explicit checked or acknowledged.
**If fail:** Assumptions violated? Check whether authors addressed this (robust methods, transformations, sensitivity analysis).

### Step 3: Detect Data Leakage

Data leakage occurs when information from outside training set influences model, leading to over-optimistic performance:

#### Common leakage patterns:
- [ ] **Target leakage**: Feature that directly encodes target variable (e.g., "treatment_outcome" used to predict "treatment_success")
- [ ] **Temporal leakage**: Future information used to predict the past (features computed from data that wouldn't be available at prediction time)
- [ ] **Train-test contamination**: Preprocessing (scaling, imputation, feature selection) fitted on full dataset before splitting
- [ ] **Group leakage**: Related observations (same patient, same device) split across train and test sets
- [ ] **Feature engineering leakage**: Aggregates computed across the entire dataset rather than within the training fold

```markdown
## Leakage Assessment
| Check | Status | Evidence |
|-------|--------|----------|
| Target leakage | Clear | No features derived from target |
| Temporal leakage | CONCERN | Feature X uses 30-day forward average |
| Train-test contamination | Clear | StandardScaler fit on train only |
| Group leakage | CONCERN | Patient IDs not used for stratified split |
```

**Got:** All common leakage patterns checked with clear/concern status.
**If fail:** Leakage found? Estimate its impact by re-running without leaked feature (if possible) or flag for analyst to investigate.

### Step 4: Validate Model Performance

#### For predictive models:
- [ ] Appropriate metrics for problem (not just accuracy — consider precision, recall, F1, AUC, RMSE, MAE)
- [ ] Cross-validation or holdout strategy described and appropriate
- [ ] Performance on training vs test/validation set compared (overfitting check)
- [ ] Baseline comparison provided (naive model, random chance, previous approach)
- [ ] Confidence intervals or standard errors on performance metrics
- [ ] Performance evaluated on relevant subgroups (fairness, edge cases)

#### For inferential/explanatory models:
- [ ] Model fit statistics reported (R², AIC, BIC, deviance)
- [ ] Coefficients interpreted correctly (direction, magnitude, significance)
- [ ] Multicollinearity assessed (VIF < 5–10)
- [ ] Influential observations identified (Cook's distance, leverage)
- [ ] Model comparison if multiple specifications tested

**Got:** Model validation appropriate for use case (prediction vs inference).
**If fail:** Test set performance suspiciously close to training performance? Flag potential leakage.

### Step 5: Assess Reproducibility

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

**Got:** Reproducibility verified by re-running analysis (or assessing from code if data unavailable).
**If fail:** Results do not reproduce exactly? Determine if differences within floating-point tolerance or indicate a problem.

### Step 6: Write the Review

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

**Got:** Review provides actionable feedback with specific references to code locations.
**If fail:** Time-constrained? Prioritize data quality and leakage checks over style issues.

## Checks

- [ ] Data quality assessed across completeness, consistency, uniqueness, timeliness, provenance
- [ ] Statistical assumptions checked for each method used
- [ ] Data leakage systematically assessed
- [ ] Model performance validated with appropriate metrics and baselines
- [ ] Reproducibility evaluated (code runs, results match)
- [ ] Feedback specific, referencing code lines or report sections
- [ ] Tone constructive and collaborative

## Pitfalls

- **Review only the code**: Analysis plan and conclusions matter as much as implementation.
- **Ignore data quality**: Sophisticated models on bad data produce confident wrong answers.
- **Assume correctness from complexity**: Random forest with 95% accuracy might have data leakage; simple t-test might be correct approach.
- **No run the code**: If at all possible, execute code to verify reproducibility. Reading code not sufficient.
- **Miss forest for trees**: Don't get lost in code style issues while missing fundamental analytical error.

## See Also

- `review-research` — broader research methodology and manuscript review
- `validate-statistical-output` — double-programming verification methodology
- `generate-statistical-tables` — publication-ready statistical tables
- `review-software-architecture` — code structure and design review
