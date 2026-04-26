---
name: review-data-analysis
locale: wenyan-lite
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

# 評資料分析

評資料分析管線之正確性、穩健性與可重現性。

## 適用時機

- 同事之分析筆記或腳本於發布前之評
- 機器學習管線於部署生產前之驗
- 為法規或商業決策之分析報告稽核
- 評分析是否支持其所陳之結論
- 受規環境之第二分析師評

## 輸入

- **必要**：分析代碼（腳本、筆記或管線定義）
- **必要**：分析輸出（結果、表、圖、模型指標）
- **選擇性**：原始資料或資料字典
- **選擇性**：分析計畫或協議（預登記或臨時）
- **選擇性**：目標受眾與決策上下文

## 步驟

### 步驟一：評資料品質

評分析之前先評輸入資料：

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

**預期：** 資料品質問題已記錄，附其對結果之潛在影響。
**失敗時：** 若資料不可達以資評審，自代碼評品質（施何檢查與轉換）。

### 步驟二：檢假設

對所用之每統計法或模型：

| 法 | 主要假設 | 如何檢 |
|--------|----------------|-------------|
| 線性回歸 | 線性、獨立、殘差常態、同方差 | 殘差圖、Q-Q 圖、Durbin-Watson、Breusch-Pagan |
| 邏輯回歸 | 獨立、無多重共線、線性 logit | VIF、Box-Tidwell、殘差診斷 |
| t-test | 獨立、常態（或大 n）、方差等 | Shapiro-Wilk、Levene's test、目視 |
| ANOVA | 獨立、常態、方差同質 | 每組 Shapiro-Wilk、Levene's test |
| 卡方 | 獨立、預期頻率 ≥ 5 | 預期頻率表 |
| 隨機森林 | 訓練資料足、特徵相關 | OOB 錯誤、特徵重要性、學習曲線 |
| 神經網路 | 資料足、適當架構、無資料洩漏 | 驗證曲線、過擬合檢查 |

```markdown
## Assumption Check Results
| Analysis Step | Method | Assumption | Checked? | Result |
|---------------|--------|------------|----------|--------|
| Primary model | Linear regression | Normality of residuals | Yes | Q-Q plot shows mild deviation — acceptable for n>100 |
| Primary model | Linear regression | Homoscedasticity | No | Not checked — recommend adding Breusch-Pagan test |
```

**預期：** 每統計法之假設皆明檢或承認。
**失敗時：** 若假設違，檢作者是否處之（穩健法、轉換、敏感度分析）。

### 步驟三：察資料洩漏

資料洩漏發生於訓練集外之資訊影響模型，致過於樂觀之效能：

#### 常見洩漏模式：
- [ ] **目標洩漏**：直接編碼目標變數之特徵（如以「treatment_outcome」預測「treatment_success」）
- [ ] **時間洩漏**：用未來資訊預測過去（自預測時不可得之資料計算之特徵）
- [ ] **訓練-測試污染**：預處理（縮放、填補、特徵選擇）於分割前對全資料集擬合
- [ ] **群組洩漏**：相關觀察（同病人、同裝置）跨訓練與測試集分割
- [ ] **特徵工程洩漏**：跨整個資料集計算之聚合而非於訓練摺內

```markdown
## Leakage Assessment
| Check | Status | Evidence |
|-------|--------|----------|
| Target leakage | Clear | No features derived from target |
| Temporal leakage | CONCERN | Feature X uses 30-day forward average |
| Train-test contamination | Clear | StandardScaler fit on train only |
| Group leakage | CONCERN | Patient IDs not used for stratified split |
```

**預期：** 所有常見洩漏模式皆檢，附 clear／concern 狀態。
**失敗時：** 若見洩漏，藉重跑而無洩漏特徵（若可）以估其影響或標予分析師察。

### 步驟四：驗模型效能

#### 對預測模型：
- [ ] 適合問題之指標（非僅準度——考慮精度、召回率、F1、AUC、RMSE、MAE）
- [ ] 交叉驗證或保留策略已述且適當
- [ ] 訓練 vs. 測試／驗證集之效能比對（過擬合檢）
- [ ] 已提供基線比對（樸素模型、隨機機會、先前法）
- [ ] 效能指標之信賴區間或標準誤
- [ ] 於相關子組（公平、邊例）評之效能

#### 對推論／解釋模型：
- [ ] 已報模型擬合統計（R²、AIC、BIC、deviance）
- [ ] 係數正解（方向、大小、顯著性）
- [ ] 已評多重共線（VIF < 5–10）
- [ ] 已識具影響之觀察（Cook's distance、leverage）
- [ ] 若測多規格則模型比對

**預期：** 模型驗證合用例（預測 vs. 推論）。
**失敗時：** 若測試集效能可疑近於訓練效能，標潛在洩漏。

### 步驟五：評可重現性

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

**預期：** 可重現性藉重跑分析驗（若資料不可得則自代碼評）。
**失敗時：** 若結果不精確重現，定差異是否於浮點容差內或表問題。

### 步驟六：撰評論

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

**預期：** 評論提供可行之回饋，附具體之代碼位置引用。
**失敗時：** 若時受限，將資料品質與洩漏檢優於風格問題。

## 驗證

- [ ] 跨完整性、一致性、唯一性、時效性、來源已評資料品質
- [ ] 每法之統計假設已檢
- [ ] 已系統化評資料洩漏
- [ ] 已以適當指標與基線驗模型效能
- [ ] 已評可重現性（代碼跑、結果合）
- [ ] 回饋具體，引代碼行或報段
- [ ] 語調建設且協作

## 常見陷阱

- **僅評代碼**：分析計畫與結論之重等於實作
- **忽資料品質**：精模型於差資料上產自信而錯之答
- **由複雜假設正確**：95% 準度之隨機森林恐有資料洩漏；簡 t-test 恐為正法
- **不跑代碼**：盡可能執代碼以驗可重現性。讀代碼不足
- **見木不見林**：勿於代碼風格問題中迷而漏基本分析錯

## 相關技能

- `review-research` — 更廣之研究方法論與稿件評審
- `validate-statistical-output` — 雙重編程驗證方法論
- `generate-statistical-tables` — 出版級統計表
- `review-software-architecture` — 代碼結構與設計評審
