---
name: survey-theoretical-literature
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Survey and synthesize theoretical literature on a specific topic, identifying
  seminal papers, key results, open problems, and cross-domain connections.
  Use when starting research on an unfamiliar theoretical topic, writing a
  literature review for a paper or thesis, identifying open problems and
  research gaps, finding cross-domain connections, or evaluating the novelty
  of a proposed theoretical contribution against existing work.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: theoretical-science
  complexity: intermediate
  language: natural
  tags: theoretical, literature, survey, synthesis, review, research
---

# 察理論文獻

於某題行構之理論文獻察，生綜合——映種開之文、追要念之時序、識開題與活前線、顯跨域之連。

## 用時

- 始究未熟之理論題而須圖其景乃用
- 為論文、論、計撰文獻評乃用
- 識某理論域之開題與缺乃用
- 求某理論果與鄰域之連乃用
- 評所提理論貢獻於既存工之新乃用

## 入

- **必要**：題述（具體足以界搜——如「非 Hermitian 系之拓撲相」非僅「拓撲」）
- **必要**：範圍之限（時段、子域含／除、理論 vs 實驗之焦）
- **可選**：種文（請者已知之文，以錨搜）
- **可選**：對象與深（入門 vs 專家層）
- **可選**：所欲出之格（注書目、敘評、念圖）

## 法

### 第一步：定範與搜詞

搜前精界察：

1. **核題之言**：書一句定察含何。此句為文是否屬察之受準。
2. **搜詞**：生主與次之搜詞：
   - 主詞：實踐者所用之精技言（如「Kohn-Sham 方程」、「Berry 相」、「重整化群」）
   - 次詞：可捕他社相關工之廣或鄰之言（如「幾何相」為「Berry 相」之同）
   - 除詞：致引無關之言（如除植物義之「Berry」）
3. **時域**：定時窗。熟域中種文或十年前，而近進或限於最後 5-10 年。新域之全史或僅數年。
4. **域界**：明陳何子域於範內，何於範外。如量誤糾正之察含拓撲碼，除典編碼論。

```markdown
## Survey Scope
- **Core topic**: [one-sentence definition]
- **Primary search terms**: [list]
- **Secondary search terms**: [list]
- **Exclusion terms**: [list]
- **Time window**: [start year] to [end year]
- **In scope**: [subfields]
- **Out of scope**: [subfields]
```

得：範緊足以使二究者獨立同某文之屬察否。

敗則：若範太廣（200 以上之或關之文），加子域之限或緊時窗以縮之。若太窄（10 以下），廣次搜詞或延時窗。

### 第二步：識種開之文與要果

由最影響之貢建察之骨：

1. **由種發現**：自種文（若供）或最近之評文始。後追引、前追被引以識復現之文。
2. **引數之啟**：以引數為影響之粗代，然近文（最後五年）加重，蓋累引時短。
3. **種開之準**：文具其一即合：
   - 引基念、形、法
   - 證重定域之果
   - 合先異流之工
   - 為域中後文多所引
4. **要果之提**：各種開之文，提：
   - 主果（定理、方程、預測、法）
   - 所須之假或近
   - 對後工之衝

```markdown
## Seminal Papers
| # | Authors (Year) | Title | Main Result | Impact |
|---|---------------|-------|-------------|--------|
| 1 | [authors] ([year]) | [title] | [one-sentence result] | [influence on field] |
| 2 | ... | ... | ... | ... |
```

得：5-15 種開文之表為題之智之骨，各文之主果與影響明陳。

敗則：若搜無清種開文，題或太新或太隘。識最早文與最被引文為錨，注域之典參未現。

### 第三步：時序圖念之發

追域自源至今之化：

1. **源段**：識核念何時何處初現。注念生於目域內或自他域引。
2. **長段**：追初果如何廣、施、戰。識域向變之關鍵點（如新證術、不期之反例、實驗之確）。
3. **分支點**：圖文獻分為子題之處。各分支簡述其焦與其與主幹之關。
4. **當前**：陳域今所立。已熟（果合）、活（速進）、滯（少新文）？
5. **時線之構**：建最要進之時線。

```markdown
## Chronological Development

### Origin ([decade])
- [event/paper]: [description of foundational contribution]

### Key Developments
- **[year]**: [milestone and its significance]
- **[year]**: [milestone and its significance]
- ...

### Branching Points
- **[year]**: Field splits into [branch A] and [branch B]
  - Branch A focuses on [topic]
  - Branch B focuses on [topic]

### Current State ([year])
- **Activity level**: [mature / active / emerging / stagnant]
- **Dominant approach**: [current mainstream methodology]
- **Recent trend**: [direction of latest work]
```

得：新者可讀以解域如何至今之敘時線，含要念之智脈。

敗則：若時序不明（如多獨發、爭優先），書其歧而非強為線敘。並列時線可也。

### 第四步：識開題與活前線

列尚未知或未解者：

1. **明陳之開題**：搜評文、題列、察文以列開問。多域有典列（如 Clay 千禧題、Hilbert 題、量信息之開題）。
2. **隱之開題**：識所猜未證之果、無理論釋之數值觀、理論與實驗之差。
3. **活前線**：識最後 2-3 年最受注之題。多新預印、會節、資金徵為其徵。
4. **進之障**：各主開題，簡述其難。何數學或念之礙在前？
5. **潛之衝**：各開題，估其解之衝。為加增（補缺）抑變革（變域之思）？

```markdown
## Open Problems and Frontiers

### Explicitly Open
| # | Problem | Status | Barrier | Potential Impact |
|---|---------|--------|---------|-----------------|
| 1 | [statement] | [conjecture / partial / open] | [why hard] | [incremental / significant / transformative] |
| 2 | ... | ... | ... | ... |

### Active Frontiers
- **[frontier topic]**: [what is happening and why it matters]
- ...

### Implicit Gaps
- [observation without theoretical explanation]
- [conjecture without proof]
- ...
```

得：構之開題列，至少 3-5 題並難之評，並最活前線之述。

敗則：若無開題顯，察範或太隘（子題已解）或文獻搜失關之評文。廣範或專搜「open problems in [topic]」與「future directions in [topic]」。

### 第五步：合跨域之連而出構之察

連察域於鄰域而合終出：

1. **跨域之連**：識察題與他域連於：
   - 共數學構（如同方程現於光與量子力）
   - 類比與對偶（如 AdS/CFT 連重力與場論）
   - 法之引（如機學術施於理論物理）
   - 實連（如預測可於冷原或光子系試）

2. **連質之評**：各連評其為：
   - 深（構等、證對偶）
   - 望（暗類比、活察）
   - 淺（表似、無證關）

3. **缺析**：識當有而未探之連。乃潛察機。

4. **察之合**：合一至五步之出為構文：
   - 行政總（一段）
   - 範與法（自第一步）
   - 史發（自第三步）
   - 要果與種開文（自第二步）
   - 開題與前線（自第四步）
   - 跨域之連（自此步）
   - 書目

```markdown
## Cross-Domain Connections
| # | Connected Field | Type of Connection | Depth | Key Reference |
|---|----------------|-------------------|-------|---------------|
| 1 | [field] | [shared math / analogy / method import] | [deep / promising / superficial] | [paper] |
| 2 | ... | ... | ... | ... |

## Unexplored Connections (Research Opportunities)
- [potential connection]: [why it might exist and what it could yield]
- ...
```

得：完之構之察文，自源至今前線圖題，跨域之連已識而評。

敗則：若察感散，回時線（第三步）為組之脊。每種開文、開題、跨域之連皆當位於時線。

## 驗

- [ ] 察範精定，含與除之準
- [ ] 種開文已識，主果與影響已陳
- [ ] 時序之發已追，要里程已陳
- [ ] 至少 3-5 開題列，附難與衝之評
- [ ] 跨域之連已識，深已評
- [ ] 書目含諸引文之全參資
- [ ] 新者可讀察而解域之景
- [ ] 察分既立之果與猜與開問
- [ ] 察撰之時已陳，使讀者可評其新度

## 陷

- **範蔓**：始於焦題而漸廣含諸切相關。第一步之核題句為受準，嚴守之。
- **新偏**：過代近工而負基貢。2024 年 10 引之文或不重於 1980 年 5,000 引之文。權影響，非新。
- **崇引數**：徒以引數為要之量。多引之文可為法器（廣用而念非深），而變革之文於隘域或少引。
- **失負果**：敗試與被反之猜為域史之部。略之則敘誤滑。
- **淺跨域連**：因二域共一詞而稱連（如熱力與信息論之「熵」相關，然物理與編織之「規」非）。先評深而後含。
- **以今論古**：以今標判古文。1960 之文當以 1960 所知評其貢，非以其未預。

## 參

- `formulate-quantum-problem` — 立文獻察中所識之具題
- `derive-theoretical-result` — 推或重推察文中所現之要果
- `review-research` — 評察中所遇之個文
