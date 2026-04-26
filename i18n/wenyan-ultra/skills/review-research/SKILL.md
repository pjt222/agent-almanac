---
name: review-research
locale: wenyan-ultra
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

行結構同行審於研工、估法、統擇、可復、總科嚴。

## 用

- 審稿、預稿、內研報
- 估研提或研協
- 估稱或薦背證之質
- 為同事研設於數集前供饋
- 審論章或論段

## 入

- **必**：研文（稿、報、提、協）
- **必**：域脈（影法準）
- **可**：刊或場導（為發審）
- **可**：補材（數、碼、附）
- **可**：前審註（若審改版）

## 行

### 一：首過——範與構

讀全文一過、解：
1. **研問**：明且特乎？
2. **貢稱**：何新？
3. **總構**：循期格（IMRaD 或場特）乎？
4. **範合**：工合標群/場乎？

```markdown
## First Pass Assessment
- **Research question**: [Clear / Vague / Missing]
- **Novelty claim**: [Stated and supported / Overstated / Unclear]
- **Structure**: [Complete / Missing sections: ___]
- **Scope fit**: [Appropriate / Marginal / Not appropriate]
- **Recommendation after first pass**: [Continue review / Major concerns to flag early]
```

得：明解稿稱與貢。
敗：研問全讀後仍不明→記為主憂續。

### 二：估法

評研設對域準：

#### 量研
- [ ] 研設應於研問（實、準實、察、查）
- [ ] 樣大有由（力析或實理）
- [ ] 樣法述應（隨、層、便）
- [ ] 變明定（獨、依、控、混）
- [ ] 量具驗、信報
- [ ] 數集程於述可復
- [ ] 倫顧處（IRB/倫准、同意）

#### 質研
- [ ] 法明（紮論、現象、案、人類學）
- [ ] 與選準與飽議
- [ ] 數集法述（訪、察、文）
- [ ] 研者位認
- [ ] 信策報（三角、員察、審跡）
- [ ] 倫顧處

#### 混法
- [ ] 混設由釋
- [ ] 整策述（聚、釋序、探序）
- [ ] 量質二要皆合各準

得：法單畢、各條有特察。
敗：關法訊缺→標主憂、勿設。

### 三：估統與析擇

- [ ] 統法應於數型與研問
- [ ] 統測設察報（正、同方、獨）
- [ ] 效大與 p 值並報
- [ ] 適處供信區
- [ ] 需處施多較正（Bonferroni、FDR）
- [ ] 缺數處述應
- [ ] 為關設行敏析
- [ ] 果釋合析（不過述發見）

常統紅旗：
- p-hacking 號（多較、選報、「邊際義」）
- 不應測（無由於非正數行 t 測、序數行參數測）
- 混統義與實義
- 無效大報
- 後設呈為先設

得：統擇估、特憂書。
敗：審者乏特法專→認、薦專審。

### 四：估可復

- [ ] 數可性述（開數、庫鏈、請可得）
- [ ] 析碼可性述
- [ ] 軟版環書
- [ ] 隨種或可復機述
- [ ] 關參與超參報
- [ ] 算環述（硬件、OS、依）

可復級：
| Tier | Description | Evidence |
|------|-------------|----------|
| Gold | Fully reproducible | Open data + open code + containerized environment |
| Silver | Substantially reproducible | Data available, analysis described in detail |
| Bronze | Potentially reproducible | Methods described but no data/code sharing |
| Opaque | Not reproducible | Insufficient method detail or proprietary data |

得：可復級分含由。
敗：數不可分（私、專）→合成數或詳偽碼為受替——記其供乎。

### 五：識潛偏

- [ ] 選偏：與代標群乎？
- [ ] 量偏：量程或系扭果乎？
- [ ] 報偏：諸果報乎、含非義者？
- [ ] 確偏：作者唯尋支設證乎？
- [ ] 存偏：脫者、排數、敗實顧乎？
- [ ] 資偏：資源露且可影發見乎？
- [ ] 發偏：此為全像乎、抑負果或缺？

得：潛偏識含稿特例。
敗：自可訊不能估偏→薦作者明處之。

### 六：書審

建設構審：

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

得：審特、建設、引稿確處。
敗：審過長→序主憂、記次患於摘列。

## 驗

- [ ] 各主憂引特段、圖、或稱
- [ ] 饋建設——患與薦並
- [ ] 正面與憂並認
- [ ] 統估合所用析法
- [ ] 可復明估
- [ ] 薦合所提憂之重
- [ ] 調業、敬、同

## 忌

- **糊評**：「法弱」無助。明何弱與何故
- **求他研**：審所為研、非汝所為
- **忽範**：會稿期異於刊文
- **人攻**：審工、非作者。永勿引作身
- **完美**：無研全。注於變結之憂

## 參

- `review-data-analysis` — 深注數質與模驗
- `format-apa-report` — APA 格準為研報
- `generate-statistical-tables` — 發備統表
- `validate-statistical-output` — 統出驗
