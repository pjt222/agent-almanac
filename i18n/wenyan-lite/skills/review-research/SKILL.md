---
name: review-research
locale: wenyan-lite
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

# 評研究

對研究作結構化同儕評，評方法論、統計擇、可重現性與整體科學嚴謹度。

## 適用時機

- 評稿件、預印本或內部研究報告
- 評研究提案或研究協議
- 評對某主張或建議之證據品質
- 對同事之研究設計於資料收集前提供回饋
- 評論文章節或學位論文段

## 輸入

- **必要**：研究文件（稿件、報告、提案或協議）
- **必要**：學科上下文（影響方法論標準）
- **選擇性**：期刊或場館指南（評以發表時）
- **選擇性**：補充材料（資料、代碼、附錄）
- **選擇性**：先前評論（評修訂時）

## 步驟

### 步驟一：首讀——範圍與結構

整讀文件一次以解：
1. **研究問題**：清陳且具體否？
2. **貢獻主張**：何為新？
3. **整體結構**：循預期格式（IMRaD 或場館特定）否？
4. **範圍合**：作品適合目標受眾／場館否？

```markdown
## First Pass Assessment
- **Research question**: [Clear / Vague / Missing]
- **Novelty claim**: [Stated and supported / Overstated / Unclear]
- **Structure**: [Complete / Missing sections: ___]
- **Scope fit**: [Appropriate / Marginal / Not appropriate]
- **Recommendation after first pass**: [Continue review / Major concerns to flag early]
```

**預期：** 對論文主張與貢獻有明理解。
**失敗時：** 若整讀後研究問題仍不清，記為主要憂慮並續行。

### 步驟二：評方法論

對該領域標準評研究設計：

#### 量化研究
- [ ] 研究設計合研究問題（實驗、準實驗、觀察、調查）
- [ ] 樣本大小有理由（功效分析或實際依據）
- [ ] 抽樣法已述且適當（隨機、分層、便利）
- [ ] 變數明定（自變、因變、控制、混淆）
- [ ] 量測工具已驗證且報可靠性
- [ ] 自描述可重現之資料收集程序
- [ ] 倫理考量已論（IRB／倫理批准、知情同意）

#### 質性研究
- [ ] 方法論明（紮根理論、現象學、案例、民族誌）
- [ ] 已論參與者選擇標準與飽和
- [ ] 已述資料收集法（訪談、觀察、文件）
- [ ] 研究者位置已承
- [ ] 已報可信度策略（三角測量、成員檢核、稽核軌跡）
- [ ] 倫理考量已論

#### 混合方法
- [ ] 已釋混合設計之理由
- [ ] 已述整合策略（聚斂、解釋順序、探索順序）
- [ ] 量化與質性兩部分皆合各自標準

**預期：** 方法論清單已完成，附每項之具體觀察。
**失敗時：** 若關鍵方法論資訊缺，標為主要憂慮而非假設。

### 步驟三：評統計與分析擇

- [ ] 統計法合資料類型與研究問題
- [ ] 統計檢之假設已檢並報（常態、同方差、獨立）
- [ ] 與 p 值並報效應大小
- [ ] 適時提供信賴區間
- [ ] 必要時施多重比較校正（Bonferroni、FDR 等）
- [ ] 缺失資料處理已述且適當
- [ ] 對主要假設作敏感度分析
- [ ] 結果解釋與分析一致（不誇大發現）

常見統計紅旗：
- p-hacking 指標（多比較、選擇性報告、「邊際顯著」）
- 不適當之檢（無理由對非常態資料用 t-test、對序資料用參數檢）
- 混統計顯著與實際顯著
- 無效應大小報告
- 後驗假設冒充先驗

**預期：** 統計擇已評，具體憂慮已記。
**失敗時：** 若評者於特定法上乏專長，承認之並建議專家評者。

### 步驟四：評可重現性

- [ ] 已陳資料可得性（開放資料、倉庫鏈接、可請求）
- [ ] 已陳分析代碼可得性
- [ ] 軟體版本與環境已記
- [ ] 隨機種子或可重現性機制已述
- [ ] 主要參數與超參數已報
- [ ] 計算環境已述（硬體、OS、依賴）

可重現性等級：
| 等級 | 描述 | 證據 |
|------|-------------|----------|
| Gold | 完全可重現 | 開放資料 + 開放代碼 + 容器化環境 |
| Silver | 大致可重現 | 資料可得，分析詳述 |
| Bronze | 潛在可重現 | 法已述但無資料／代碼分享 |
| Opaque | 不可重現 | 法細節不足或專有資料 |

**預期：** 已分配可重現性等級，附理由。
**失敗時：** 若資料不可分享（隱私、專有），合成資料或詳偽代碼為可接受之替——註是否提供。

### 步驟五：識潛在偏倚

- [ ] 選擇偏倚：參與者代表目標群體否？
- [ ] 量測偏倚：量測過程恐系統化扭曲結果否？
- [ ] 報告偏倚：所有結果（含非顯著者）皆報否？
- [ ] 確認偏倚：作者僅尋支持假設之證據否？
- [ ] 倖存者偏倚：退出、排除資料或失敗實驗已計否？
- [ ] 資助偏倚：資助源已揭且恐影響發現否？
- [ ] 發表偏倚：此為完整圖抑或負面結果恐缺？

**預期：** 已識潛在偏倚，附稿件中之具體例。
**失敗時：** 若自可得資訊無法評偏倚，建議作者明論之。

### 步驟六：撰評論

建設性結構化評論：

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

**預期：** 評論具體、建設性、引稿件之精確位置。
**失敗時：** 若評論過長，將主要憂慮優先並於摘要清單中註小議題。

## 驗證

- [ ] 每主要憂慮引特定段、圖或主張
- [ ] 回饋建設性——問題與建議成對
- [ ] 與憂慮並承正面之處
- [ ] 統計評合所用之分析法
- [ ] 已明評可重現性
- [ ] 建議與所提憂慮之嚴重度一致
- [ ] 語調專業、尊重、同事

## 常見陷阱

- **模糊批評**：「方法論弱」無助。指明何弱且為何
- **要求不同研究**：評已作之研究，非爾欲之研究
- **忽範圍**：會議論文有異於期刊文之期望
- **人身攻擊**：評作品，非作者。永不引作者身份
- **完美主義**：無研究完美。聚焦於恐改變結論之憂慮

## 相關技能

- `review-data-analysis` — 對資料品質與模型驗證之更深聚焦
- `format-apa-report` — 研究報告之 APA 格式化標準
- `generate-statistical-tables` — 出版級統計表
- `validate-statistical-output` — 統計輸出驗證
