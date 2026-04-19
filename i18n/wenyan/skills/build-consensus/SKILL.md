---
name: build-consensus
locale: wenyan
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

# 建共識

無中權而於分代理達集同——以探倡、閾諾感、諾動，模於蜂群擇穴之決。

## 用時

- 群須無指領而集擇諸選
- 中權之決為瓶或單敗點
- 諸利者有異訊異見須整
- 昔決患群思（早聚）或析癱（不聚）
- 設須達共識之自系（分庫、多代理 AI）
- 輔 `coordinate-swarm`——協須明集決時

## 入

- **必要**：待決之題（二擇、於 N 中擇、參設）
- **必要**：參之諸代理（隊員、服、投者）
- **可選**：已知諸選附初質評
- **可選**：決之急（時預）
- **可選**：可容錯率（群偶擇次佳可乎？）
- **可選**：當前決之敗模（群思、僵、搖）

## 法

### 第一步：獨探生提案

確決空已充探，倡前不始。

1. 派探者獨探諸選之空：
   - 各探不知他探之見而評
   - 獨評阻早聚於流中而平之選
   - 探數：至少三探為各要選（為可靠）
2. 探生結構化之評：
   - 選之識
   - 質分（歸 0-100 或類：劣/中/良/優）
   - 所識之要強與危
   - 信級（此選評幾徹？）
3. 集探之報而不篩——所有過最質閾者進倡階

**得：** 獨評之諸案附質分與察。無選為單評者所除；多見之繁保之。

**敗則：** 若諸探未獨評而聚於一選，探非真獨。以明訊障重之。若過多選過倡階，升最質閾。若過少，降之或加探。

### 第二步：行倡動（擺舞）

令探倡其好選，倡之力按質成比。

1. 各探倡其首選：
   - 倡力按質分（佳選得更烈之倡）
   - 倡為公——諸代理見諸倡信
   - 倡者呈證與質評，非止好
2. 未諾之代理觀倡而評：
   - 循倡之選而獨察
   - 己察證其質者，加入倡
   - 察示質劣於所宣者，不加
3. 交察之動：
   - 弱選之倡自失從——代理獨驗之
   - 強選之倡得從——因驗證其質
   - 過程自正：誇倡於驗階敗

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

**得：** 諸代理獨驗質時，佳選之倡漸長。弱選之倡因驗敗而淡。群自聚於強選而無代理定擇。

**敗則：** 若倡不聚（二選相持），諸選或真等——以任一達諾，或用破平之律。若倡過速聚於中選，增評之獨（更多探、嚴訊障），加必交察之步。

### 第三步：立諾閾而諾

定觸集行之諾閾。

1. 立諾閾：
   - **簡決**：50% + 1 之代理諾於一選
   - **要決**：66-75% 諾於一選
   - **要/不可逆決**：80%+ 諾於一選
   - 大律：賭高 → 閾高 → 共識慢而更可靠
2. 監諾之累：
   - 蹤隨時諸選之諾者數
   - 透明示諾級（諸代理見當態）
   - 環中不容撤諾（防搖）
3. 諾達時：
   - 勝選為集決
   - 敗選之倡者認決（無悖之代理）
   - 即始施——共後之延耗諾

**得：** 明諾之刻，足代理已獨諾於一選。決為合法——因生於獨評，非權或迫。

**敗則：** 若時預內諾不達，升至第四步（僵解）。若諾達而代理不悅，倡階過短——代理諾而未充評。若共識誤（事後發），獨探不足——下環宜增探之繁與評之徹。

### 第四步：解僵

自然共識停時破決之阻。

1. 診僵之類：
   - **真等**：二選等佳 → 擲幣；延之價過於擇「誤」之等選
   - **訊缺**：代理不能充評 → 投更多探後再行倡
   - **派成**：固黨拒交察 → 入必交之輪，倡者察反選
   - **選繁**：諸選分諾 → 除下半，重行倡
2. 施合解：
   - 真等：隨擇或若可合則合
   - 訊缺：時限之探延
   - 派成：強交察之輪
   - 選繁：排名淘汰之賽
3. 解後，重諾之鐘而重行第三步

**得：** 以合介解僵。解可見，群受為公過程，雖諸代理好別果。

**敗則：** 若同決反僵，決框或誤。退而問：決可分為小獨決乎？範可減乎？有「皆試而觀」之選乎？或最佳共識為「吾等行時限之試」。

### 第五步：評共識之質

察過程生佳決，抑只生決。

1. 決後評：
   - 勝選為至少 N 代理獨驗乎？
   - 決速合乎（不速為群思，不慢為癱）？
   - 過程浮單決者所失之訊乎？
   - 代理諾於施，抑止從？
2. 蹤共識康之度：
   - **達諾之時**：續減示學；續增示繁或失調
   - **探諾之比**：每諾須探幾？高比=難決或低信
   - **決後悔率**：群悔擇何頻？
3. 所學反饋於程：
   - 諾閾按決之要與昔準調之
   - 探數按選之繁調之
   - 時預按歷之達諾時調之

**得：** 反饋之環以時善共識。群學更善探、更實倡、更信諾。

**敗則：** 若共識質度劣（高悔、慢決），審程結構之敗：探繁不足、倡無驗、閾於決類太低。重建特敗之階，非翻全程。

## 驗

- [ ] 提案以獨探生（無流群）
- [ ] 倡力按評質成比
- [ ] 未諾之代理獨驗所倡之選
- [ ] 諾閾合決之要
- [ ] 諾達而決速施
- [ ] 僵解機備（雖未用）
- [ ] 決後質評已行

## 陷

- **略獨探**：直跳倡生群思。共識之質全依獨評之質
- **不等選均倡**：諸選得同倡不論質，過程降為隨擇。倡必按評質成比
- **撤諾**：容代理撤諾生搖。環中諾者留諾至環解
- **混共識與全同**：共識須足同，非全同。候 100% 生永僵
- **忽敗方**：倡敗選之代理有群所須之訊。其憂宜告施，雖不阻決

## 參

- `coordinate-swarm` — 支信號共識機之基協架
- `defend-colony` — 集防決常於危下須速共識
- `scale-colony` — 群大變時共識機宜調
- `dissolve-form` — 解前之共識要——morphic 之控解技
- `plan-sprint` — sprint 規含諾範之隊共識
- `conduct-retrospective` — 回顧為程善之共識形
- `build-coherence` — AI 自用之變；映蜂民主於單代理多徑推理，含信閾與僵解
