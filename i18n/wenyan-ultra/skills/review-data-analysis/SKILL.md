---
name: review-data-analysis
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
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

# 審數析

評數析管之正、韌、可復。

## 用

- 審同事析簿或本於發前
- 驗 ML 管於生產發前
- 審析報為規或業決
- 估析支所述結乎
- 行第二析審於規環

## 入

- **必**：析碼（本、簿、管定）
- **必**：析出（果、表、圖、模指）
- **可**：原數或數典
- **可**：析計或協（預登或臨）
- **可**：標群與決脈

## 行

### 一：估數質

評析前審入數：

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

得：數質患書、含其對果或影。
敗：數不可審→自碼估質（何察與化施）。

### 二：察設

各統法或所用模：

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

得：各統法之設明察或認。
敗：設違→察作者處之乎（韌法、化、敏析）。

### 三：察數漏

數漏即訓集外訊影模、致過樂效：

#### 常漏模：
- [ ] **標漏**：直編標變之徵（如「treatment_outcome」用以測「treatment_success」）
- [ ] **時漏**：未來訊用以測過（自測時不可得之數計徵）
- [ ] **訓測污**：預處（縮、補、徵選）於分前合全集
- [ ] **群漏**：相關察（同患、同器）跨訓測分
- [ ] **徵工漏**：聚於整集計、非於訓折內

```markdown
## Leakage Assessment
| Check | Status | Evidence |
|-------|--------|----------|
| Target leakage | Clear | No features derived from target |
| Temporal leakage | CONCERN | Feature X uses 30-day forward average |
| Train-test contamination | Clear | StandardScaler fit on train only |
| Group leakage | CONCERN | Patient IDs not used for stratified split |
```

得：諸常漏模察含潔/憂態。
敗：漏發見→重行無漏徵估其影（若可）或標令析者察。

### 四：驗模效

#### 為測模：
- [ ] 應問之正指（非僅準——考精、召、F1、AUC、RMSE、MAE）
- [ ] 交驗或留策述且應
- [ ] 訓對測/驗集效較（過擬察）
- [ ] 基較（樸模、隨機、前法）
- [ ] 效指之信區或標誤
- [ ] 相子群效估（公、邊例）

#### 為推/釋模：
- [ ] 模合統報（R²、AIC、BIC、deviance）
- [ ] 系正釋（向、量、義）
- [ ] 多共線估（VIF < 5–10）
- [ ] 影察識（Cook 距、leverage）
- [ ] 多規測時模較

得：模驗應用例（測對推）。
敗：測集效疑近訓效→標潛漏。

### 五：估可復

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

得：可復重行析驗（或數無時自碼估）。
敗：果不確復→定異於浮容內乎抑示問。

### 六：書審

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

得：審供可動饋含特碼處引。
敗：時限→質與漏察優於格患。

## 驗

- [ ] 數質跨完、恆、唯、時、源估
- [ ] 各所用法統設察
- [ ] 數漏系估
- [ ] 模效以應指與基驗
- [ ] 可復估（碼行、果合）
- [ ] 饋特、引碼行或報段
- [ ] 調建設且協

## 忌

- **唯審碼**：析計與結與實同要
- **忽數質**：壞數上精模生信誤答
- **由複設正**：95% 準隨機林或有數漏；簡 t 或為正法
- **不行碼**：可則行碼以驗可復。讀碼不足
- **失林為樹**：勿迷碼格患而失基析誤

## 參

- `review-research` — 廣研法與稿審
- `validate-statistical-output` — 雙程驗法
- `generate-statistical-tables` — 發備統表
- `review-software-architecture` — 碼構與設審
