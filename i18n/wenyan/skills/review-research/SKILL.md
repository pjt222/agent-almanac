---
name: review-research
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Conduct a peer review of research methodology, experimental design, and
  manuscript quality. Covers methodology evaluation, statistical appropriateness,
  reproducibility assessment, bias identification, and constructive feedback.
  Use when reviewing a manuscript, preprint, or internal research report,
  evaluating a research proposal or study protocol, assessing evidence quality
  behind a claim, or reviewing a thesis chapter or dissertation section.
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

# 審研

行構之同行審於研之勞，評法、統擇、可復、整科嚴。

## 用時

- 審稿、預印、內研報乃用
- 評研議或研程乃用
- 估述或議後之證質乃用
- 數集前供反於同仁之研設乃用
- 審論章或博論之段乃用

## 入

- **必要**：研文（稿、報、議、程）
- **必要**：域之境（影法之標）
- **可選**：刊或場之則（若為示審）
- **可選**：補件（數、碼、附）
- **可選**：前審注（若審改稿）

## 法

### 第一步：首過——範與構

讀全文一過以解：

1. **研問**：明而具乎？
2. **獻稱**：何新？
3. **整構**：循期式（IMRaD 或場特）乎？
4. **範合**：勞合目眾/場乎？

```markdown
## First Pass Assessment
- **Research question**: [Clear / Vague / Missing]
- **Novelty claim**: [Stated and supported / Overstated / Unclear]
- **Structure**: [Complete / Missing sections: ___]
- **Scope fit**: [Appropriate / Marginal / Not appropriate]
- **Recommendation after first pass**: [Continue review / Major concerns to flag early]
```

得：明解稿之述與獻。

敗則：若全讀後研問仍不清，標此為主憂而續。

### 第二步：評其法

對域之標審研設：

#### 量研

- [ ] 研設合研問（試驗、準試驗、察、調）
- [ ] 樣大已釋（力析或實由）
- [ ] 樣法述且宜（隨、層、便）
- [ ] 諸變明定（獨、依、控、混）
- [ ] 量具已驗且報信
- [ ] 數集程自述可復
- [ ] 倫憂已處（IRB/倫准、承）

#### 質研

- [ ] 法明（紮根、現象、案、民族）
- [ ] 與者之擇規與飽和已議
- [ ] 數集法已述（訪、察、文）
- [ ] 研者之位已承
- [ ] 信策已報（三角、員察、審跡）
- [ ] 倫憂已處

#### 混法

- [ ] 混設之由已釋
- [ ] 集成策已述（合、釋序、探序）
- [ ] 量質二部皆合其標

得：法之單已成附各入之具察。

敗則：若關鍵法信缺，標為主憂而非假之。

### 第三步：察統與析之擇

- [ ] 統法合數類與研問
- [ ] 統試之假已察且報（常、同方差、獨）
- [ ] 效大與 p 值並報
- [ ] 信區於宜處供
- [ ] 多較校於需時施（Bonferroni、FDR 等）
- [ ] 缺數處已述且宜
- [ ] 為要假行敏析
- [ ] 果之釋與析合（不過述得）

常統紅旗：

- p 採之兆（多較、選報、「邊義」）
- 不宜之試（無釋於非常數據之 t 試、序數據之參試）
- 混統義與實義
- 無效大之報
- 後設假示為先設

得：統擇已評附具憂之書。

敗則：若審者於某法無專，承之而議專審。

### 第四步：評可復

- [ ] 數可得已述（開數、庫鏈、請可得）
- [ ] 析碼可得已述
- [ ] 軟版與境已書
- [ ] 隨種或可復機已述
- [ ] 要參與超參已報
- [ ] 算境已述（硬、OS、依）

可復之等：

| 等 | 述 | 證 |
|------|-------------|----------|
| Gold | 全可復 | 開數 + 開碼 + 容化境 |
| Silver | 大可復 | 數可得，析詳述 |
| Bronze | 或可復 | 法已述而無數/碼共 |
| Opaque | 不可復 | 法詳不足或專數 |

得：可復等已賦附其由。

敗則：若數不能共（私、專），合數或詳偽碼乃受替——記此是否供。

### 第五步：識可偏

- [ ] 擇偏：與者代目群乎？
- [ ] 量偏：量程或系扭果乎？
- [ ] 報偏：諸果皆報乎，含非義者？
- [ ] 確偏：著者獨尋支假之證乎？
- [ ] 倖存偏：脫者、除數、敗試已計乎？
- [ ] 資偏：資源已露且可影得乎？
- [ ] 示偏：此為全像或負果或缺？

得：可偏已識附稿之具例。

敗則：若可偏不能自可得信評，議著者明處之。

### 第六步：書其審

構審以建設：

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

得：審具、建、引稿之確所。

敗則：若審過長，先處主憂而於摘列記微患。

## 驗

- [ ] 各主憂引具段、圖、或述
- [ ] 反建——患附議
- [ ] 陽面已認附憂
- [ ] 統評合所用析法
- [ ] 可復明評
- [ ] 議合所提憂之重
- [ ] 調業、敬、同

## 陷

- **泛批**：「法弱」無助。具述何弱與何故
- **求異研**：審所行之研，非汝所欲行之研
- **忽範**：會文之期異於刊文
- **對人**：審其勞，非著者。永勿引著者識
- **求全**：無研全。專於改結論之憂

## 參

- `review-data-analysis` — 深專於數質與模驗
- `format-apa-report` — 為研報之 APA 式標
- `generate-statistical-tables` — 公示備之統表
- `validate-statistical-output` — 統出之驗
