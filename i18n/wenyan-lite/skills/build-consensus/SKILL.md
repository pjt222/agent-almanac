---
name: build-consensus
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Achieve distributed agreement without central authority using bee democracy,
  threshold voting, and quorum sensing. Covers proposal generation, advocacy
  dynamics, commitment thresholds, deadlock resolution, and consensus quality
  assessment. Use when a group must decide between options without a designated
  leader, when centralized decision-making is a bottleneck, when stakeholders
  have different perspectives to integrate, or when designing automated systems
  that must reach consensus such as distributed databases or multi-agent AI.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, consensus, quorum-sensing, distributed-agreement
---

# Build Consensus

於無中央權之分佈代理之間達集體合意——以探子之辯護、門檻法定之察、承諾動態，仿蜜蜂蜂群決議之式。

## 適用時機

- 一群須共決於多選，而無指定之領
- 中央決為瓶頸或單點之失
- 利益相關者持異信息與視角，須合之
- 過去之決受群思之苦（早合）或分析癱瘓（不合）
- 設計須達共識之自動系統（分佈式數據庫、多代理 AI）
- 補 `coordinate-swarm` 當協調須明集體之決

## 輸入

- **必要**：須決之事（二擇、自 N 選、參數設定）
- **必要**：參與之代理（團員、服務、投票者）
- **選擇性**：既知選項之初評
- **選擇性**：決之急（時預算）
- **選擇性**：可容之誤率（群可偶擇次佳乎？）
- **選擇性**：當前決之敗模（群思、僵、反覆）

## 步驟

### 步驟一：以獨立探求生提議

於任何辯護前確保決之空充探。

1. 派探子獨探選空：
   - 每探子評選而不知他探子之發
   - 獨評止早期眾行向流行但平庸之選
   - 探子數：最少每嚴肅選項三探子（為可靠）
2. 探子生結構化評估：
   - 選項識別符
   - 質分（歸一 0-100 或類別：差／平／佳／優）
   - 既辨之關鍵長與險
   - 信心層（此選評之多徹底？）
3. 聚探子之報而不濾——諸超最低質門檻之選入辯護階

**預期：** 具質分與評估之獨立評提議。無選為單評者所棄；視角多樣保全。

**失敗時：** 若探子不獨評而合於同選，則探非真獨。以明之信息障重運行。若入辯護階之選過多，升最低質門檻。若過少，降之或加探子。

### 步驟二：行辯護動態（搖擺舞）

令探子為所好之選辯護，辯強比其質分。

1. 每探子為其最高評之選辯護：
   - 辯強比其質分（佳者辯更強）
   - 辯為公——諸代理觀諸辯信號
   - 辯者呈證據與質評，非僅偏好
2. 未承代理觀辯而評：
   - 獨察所辯之選
   - 若自察確其質，則入辯
   - 若察揭質低於所宣，則不入
3. 交叉檢視動態：
   - 弱選之辯者於代理獨驗時自然失隨者
   - 強選之辯者於質得確而得隨者
   - 過程自正：誇之辯於驗階而敗

```
Advocacy Dynamics:
┌─────────────────────────────────────────────────────────┐
│ Scout A advocates Option 1 (quality 85) ──→ ◉◉◉◉◉     │
│ Scout B advocates Option 2 (quality 70) ──→ ◉◉◉        │
│ Scout C advocates Option 3 (quality 45) ──→ ◉           │
│                                                         │
│ Uncommitted agents inspect:                             │
│   Agent D inspects Option 1 → confirms → joins ◉◉◉◉◉◉  │
│   Agent E inspects Option 2 → confirms → joins ◉◉◉◉    │
│   Agent F inspects Option 3 → disagrees → inspects Opt 1│
│                               → confirms → joins ◉◉◉◉◉◉◉│
│                                                         │
│ Over time: Option 1 advocacy grows, Option 3 fades      │
└─────────────────────────────────────────────────────────┘
```

**預期：** 最佳選之辯隨時漸長，代理獨驗其質。弱選之辯於驗敗而衰。群自然朝最強選合，無代理專斷。

**失敗時：** 若辯不合（二選並懸），則選或真等——以任一進法定，或用破平之則。若辯過速合於平庸選，升評估之獨立（加探子、嚴信息障），並加強制交叉察步。

### 步驟三：立法定門檻而承

定觸集體行動之承諾門檻。

1. 立法定門檻：
   - **簡決**：代理五十加一承於一選
   - **要決**：六六至七五承於一選
   - **關鍵／不可逆決**：八十以上承於一選
   - 拇指之則：籌碼愈高 → 門檻愈高 → 愈慢而愈可靠
2. 監承諾累積：
   - 追幾代理已承於何選
   - 透明示承諾層（諸代理可見當前態）
   - 勿允循環中撤承（止反覆）
3. 法定達時：
   - 勝選為集體之決
   - 敗選之辯者承之（無叛代理）
   - 即行實作——共識後之延蝕承諾

**預期：** 明之法定刻，足代理獨承於一選。決為合法，因出於獨立評估，非權威或脅迫。

**失敗時：** 若時預算內法定未達，升至步驟四（解僵）。若法定達而代理不悅，辯階過短——代理於評未足而承。若共識誤（事後察），則獨立探求不足——下循環增探子多樣與評估徹底。

### 步驟四：解僵

自然共識過程滯時破決之僵。

1. 診僵之類：
   - **真平**：二選等佳 → 擲幣；延之代價超擇「誤」等選之代價
   - **信息不足**：代理不能足評選 → 再投探求，後再辯
   - **派形成**：頑之子群拒交叉察 → 引強制輪換，辯者須察對立選
   - **選過繁**：選過多碎承諾 → 汰底五十，再辯
2. 應合之解：
   - 真平：隨擇或若相容合選
   - 信息不足：時限之探求延
   - 派形成：強制交叉察之輪
   - 選過繁：排汰之淘汰賽
3. 解後重法定之鐘而再行步驟三

**預期：** 以合之干預解僵。解可見並為群所受為公正之程，即使個代理好異果。

**失敗時：** 若同決反覆僵，決之框或誤。退一步而問：決是否可分為更小獨立之決？範圍可減乎？有「兩試而觀」之選乎？時最佳共識為「我們將行限時實驗」。

### 步驟五：評共識之質

評共識過程生善決，非僅生一決。

1. 決後評：
   - 勝選是否為至少 N 代理獨驗？
   - 決速是否合（不過速／群思、不過慢／癱）？
   - 過程是否浮單決者漏之信息？
   - 代理承於實作，抑僅順從？
2. 追共識健康指標：
   - **至法定之時**：歷決減示學；增示愈繁或失調
   - **探子對承諾比**：每承諾需幾探求？高比 = 難決或低信
   - **決後悔率**：群多少時希擇他？
3. 反饋入過程：
   - 按決之要與過去準確調法定門檻
   - 按選之繁調探子數
   - 按歷時至法定調時預算

**預期：** 反饋環歷時改共識質。群學更效探求、更誠辯、更自信承諾。

**失敗時：** 若共識質指標差（高悔、慢決），審過程之結構之敗：探求多樣不足、辯無驗、門檻設過低。重建具體之敗階，非翻全過程。

## 驗證

- [ ] 提議以獨立探求生（無眾行）
- [ ] 辯強比所評之質
- [ ] 未承代理獨驗所辯之選
- [ ] 法定門檻合決之要
- [ ] 法定達且決速實作
- [ ] 解僵機制備（即使未用）
- [ ] 決後質評已行

## 常見陷阱

- **略去獨立探求**：直跳辯生群思。共識之質全依獨評之質
- **不等選之等辯護**：若每選不論質皆得等辯，過程退為隨擇。辯須比所評之質
- **撤承諾**：允代理撤承生反覆。一循環既承，代理留承至循環解
- **共識混於全同**：共識須足合意，非全合意。待百分百生永僵
- **忽敗之方**：辯敗選之代理持群所需之信息。其慮當導實作，即使不阻決

## 相關技能

- `coordinate-swarm` — 支信號本共識之基礎協調框架
- `defend-colony` — 集體防之決常須壓下速共識
- `scale-colony` — 群大小顯變時共識機制須適
- `dissolve-form` — 形變之技能，溶解前之共識關鍵
- `plan-sprint` — 衝刺規劃涉承諾範圍之團共識
- `conduct-retrospective` — 回顧為關過程改之共識建
- `build-coherence` — AI 自用變體；映蜂蜂民主至單代理多徑推理，帶信心門檻與解僵
