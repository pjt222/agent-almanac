---
name: review-data-analysis
description: >
  Review a data analysis for quality, correctness, and reproducibility. Covers
  data quality assessment, assumption checking, model validation, data leakage
  detection, and reproducibility verification. Use when reviewing a colleague's
  analysis before publication, validating an ML pipeline before production
  deployment, auditing a report for regulatory or business decision-making, or
  performing a second-analyst review in a regulated environment.
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

Evaluate a data analysis pipeline for correctness, robustness, and reproducibility.

## When to Use

- Reviewing a colleague's analysis notebook or script before publication
- Validating a machine learning pipeline before production deployment
- Auditing an analytical report for regulatory or business decision-making
- Assessing whether an analysis supports its stated conclusions
- Performing a second-analyst review in a regulated environment

## Inputs

- **Required**: Analysis code (scripts, notebooks, or pipeline definitions)
- **Required**: Analysis output (results, tables, figures, model metrics)
- **Optional**: Raw data or data dictionary
- **Optional**: Analysis plan or protocol (pre-registered or ad-hoc)
- **Optional**: Target audience and decision context

## Procedure

### Step 1: Assess Data Quality

Review the input data before evaluating the analysis:

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

**Expected:** Data quality issues documented with their potential impact on results.
**On failure:** If data is not accessible for review, assess quality from the code (what checks and transformations are applied).

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

**Expected:** Every statistical method has its assumptions explicitly checked or acknowledged.
**On failure:** If assumptions are violated, check whether the authors addressed this (robust methods, transformations, sensitivity analysis).

### Step 3: Detect Data Leakage

Data leakage occurs when information from outside the training set influences the model, leading to over-optimistic performance:

#### Common leakage patterns:
- [ ] **Target leakage**: Feature that directly encodes the target variable (e.g., "treatment_outcome" used to predict "treatment_success")
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

**Expected:** All common leakage patterns checked with clear/concern status.
**On failure:** If leakage is found, estimate its impact by re-running without the leaked feature (if possible) or flag for the analyst to investigate.

### Step 4: Validate Model Performance

#### For predictive models:
- [ ] Appropriate metrics for the problem (not just accuracy — consider precision, recall, F1, AUC, RMSE, MAE)
- [ ] Cross-validation or holdout strategy described and appropriate
- [ ] Performance on training vs. test/validation set compared (overfitting check)
- [ ] Baseline comparison provided (naive model, random chance, previous approach)
- [ ] Confidence intervals or standard errors on performance metrics
- [ ] Performance evaluated on relevant subgroups (fairness, edge cases)

#### For inferential/explanatory models:
- [ ] Model fit statistics reported (R², AIC, BIC, deviance)
- [ ] Coefficients interpreted correctly (direction, magnitude, significance)
- [ ] Multicollinearity assessed (VIF < 5–10)
- [ ] Influential observations identified (Cook's distance, leverage)
- [ ] Model comparison if multiple specifications tested

**Expected:** Model validation appropriate for the use case (prediction vs. inference).
**On failure:** If test set performance is suspiciously close to training performance, flag potential leakage.

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

**Expected:** Reproducibility verified by re-running the analysis (or assessing from code if data is unavailable).
**On failure:** If results don't reproduce exactly, determine if differences are within floating-point tolerance or indicate a problem.

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

**Expected:** Review provides actionable feedback with specific references to code locations.
**On failure:** If time-constrained, prioritize data quality and leakage checks over style issues.

## Validation

- [ ] Data quality assessed across completeness, consistency, uniqueness, timeliness, provenance
- [ ] Statistical assumptions checked for each method used
- [ ] Data leakage systematically assessed
- [ ] Model performance validated with appropriate metrics and baselines
- [ ] Reproducibility evaluated (code runs, results match)
- [ ] Feedback is specific, referencing code lines or report sections
- [ ] Tone is constructive and collaborative

## Common Pitfalls

- **Reviewing only the code**: The analysis plan and conclusions matter as much as the implementation.
- **Ignoring data quality**: Sophisticated models on bad data produce confident wrong answers.
- **Assuming correctness from complexity**: A random forest with 95% accuracy might have data leakage; a simple t-test might be the correct approach.
- **Not running the code**: If at all possible, execute the code to verify reproducibility. Reading code is not sufficient.
- **Missing the forest for the trees**: Don't get lost in code style issues while missing a fundamental analytical error.

## Related Skills

- `review-research` — broader research methodology and manuscript review
- `validate-statistical-output` — double-programming verification methodology
- `generate-statistical-tables` — publication-ready statistical tables
- `review-software-architecture` — code structure and design review
