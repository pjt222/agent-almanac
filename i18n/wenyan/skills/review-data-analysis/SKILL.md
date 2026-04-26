---
name: review-data-analysis
locale: wenyan
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

評數析線之正、韌、可復。

## 用時

- 審同仁析示前乃用
- 驗 ML 線產部署前乃用
- 審析報為規或業決乃用
- 估析支其述論乎乃用
- 於規境行二析者審乃用

## 入

- **必要**：析碼（文、本、線定）
- **必要**：析出（果、表、圖、模指）
- **可選**：原數或數典
- **可選**：析計或程（先註或臨）
- **可選**：目眾與決境

## 法

### 第一步：察數質

評析前先審入數：

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

**得：** 數質患已書附其於果之影
**敗則：** 若數不可審，自碼察其質（何察與化已施）

### 第二步：察其假

各統法或所用之模：

| 法 | 要假 | 如何察 |
|--------|----------------|-------------|
| 線回歸 | 線、獨、殘之常、同方差 | 殘圖、Q-Q 圖、Durbin-Watson、Breusch-Pagan |
| 邏回歸 | 獨、無多共線、線 logit | VIF、Box-Tidwell、殘診 |
| t 試 | 獨、常（或大 n）、等方差 | Shapiro-Wilk、Levene 試、視察 |
| ANOVA | 獨、常、方差同 | 各組 Shapiro-Wilk、Levene 試 |
| 卡方 | 獨、期頻 ≥ 5 | 期頻表 |
| 隨森 | 訓數足、特相關 | OOB 誤、特要、學曲 |
| 神網 | 數足、構宜、無數漏 | 驗曲、過擬察 |

```markdown
## Assumption Check Results
| Analysis Step | Method | Assumption | Checked? | Result |
|---------------|--------|------------|----------|--------|
| Primary model | Linear regression | Normality of residuals | Yes | Q-Q plot shows mild deviation — acceptable for n>100 |
| Primary model | Linear regression | Homoscedasticity | No | Not checked — recommend adding Breusch-Pagan test |
```

**得：** 各統法之諸假明察或承
**敗則：** 若假違，察著者是否處之（韌法、化、敏析）

### 第三步：察數漏

數漏發於訓集外之信影模時，致過樂之性：

#### 常漏形：

- [ ] **目漏**：直編目變之特（如「treat_outcome」用以預「treat_success」）
- [ ] **時漏**：用未來信預過去（自預測時不可得之數算之特）
- [ ] **訓試污**：分前以全數合之預處（縮、補、特擇）
- [ ] **群漏**：相關察（同患、同器）分於訓試集
- [ ] **特工漏**：聚算於全數而非於訓折內

```markdown
## Leakage Assessment
| Check | Status | Evidence |
|-------|--------|----------|
| Target leakage | Clear | No features derived from target |
| Temporal leakage | CONCERN | Feature X uses 30-day forward average |
| Train-test contamination | Clear | StandardScaler fit on train only |
| Group leakage | CONCERN | Patient IDs not used for stratified split |
```

**得：** 諸常漏形已察附 clear/concern 之態
**敗則：** 若得漏，估其影由再行而無漏特（若可），或標待析者察

### 第四步：驗模性

#### 為預模：

- [ ] 為患宜之指（非獨準——慮精、召、F1、AUC、RMSE、MAE）
- [ ] 交驗或留之策已述且宜
- [ ] 訓對試/驗集之性已較（過擬之察）
- [ ] 基線較已供（樸模、隨機、前法）
- [ ] 性指之信區或標誤
- [ ] 性於相關子群評（公、邊例）

#### 為推/釋模：

- [ ] 模合統已報（R²、AIC、BIC、偏差）
- [ ] 系釋正（向、量、義）
- [ ] 多共線已察（VIF < 5–10）
- [ ] 影察已識（Cook 距、leverage）
- [ ] 若試多規格，模較已行

**得：** 模驗合用境（預對推）
**敗則：** 若試集之性疑近訓性，標可漏

### 第五步：察可復

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

**得：** 可復由再行析（或自碼察若數不可得）已驗
**敗則：** 若果不精復，定差於浮點容內或示患

### 第六步：書其審

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

**得：** 審供可行之反附碼所/報段之具引
**敗則：** 若時限，先處數質與漏察而後格患

## 驗

- [ ] 數質已察過全、恆、唯、時、源
- [ ] 各所用法之統假已察
- [ ] 數漏已系察
- [ ] 模性以宜指與基線驗
- [ ] 可復已評（碼行、果合）
- [ ] 反具體，引碼行或報段
- [ ] 調建設且協

## 陷

- **獨審其碼**：析計與結論等於施而要
- **忽數質**：劣數上之繁模生信誤之答
- **以繁假正**：95% 準之隨森或有數漏；簡 t 試或為正徑
- **不行其碼**：若可，行碼以驗可復。讀碼不足
- **見樹失林**：勿陷碼格而失基析誤

## 參

- `review-research` — 廣研法與稿審
- `validate-statistical-output` — 雙程驗法
- `generate-statistical-tables` — 公示備之統表
- `review-software-architecture` — 碼構與設審
