---
name: survey-theoretical-literature
locale: wenyan-ultra
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

# 察理論文

行構察某題之理論文、識奠基文、要果、開問、跨域接、生合圖。

## 用

- 始究生疏理論題、需圖境→用
- 為文、論、案書文獻覆→用
- 識理論域開問與缺→用
- 覓理論果與鄰域之接→用
- 評提理論貢之新於既存→用

## 入

- **必**：題述（具足以界搜；如「非 Hermitian 系拓相」非「拓」）
- **必**：範限（時段、含/不含子域、理論對實驗）
- **可**：知種文（請者已知文以錨搜）
- **可**：目讀與深（介覆對專家察）
- **可**：所求出式（注書、敘評、概圖）

## 行

### 一：定範與搜詞

精界察前搜：

1. **核題句**：書一句定察含。為文是否屬之納則
2. **搜詞**：生主次搜詞：
   - 主：用者所用準技（如「Kohn-Sham 方」「Berry 相」「重正化群」）
   - 次：他社或關工之廣或鄰（如「幾何相」為「Berry 相」之同義）
   - 除：致非關果之詞（如除植義「Berry」）
3. **時範**：定時窗。熟域→奠基或數十年舊而新展或限於末 5-10 年。新域→全史或唯數年
4. **域界**：明陳含與不含。如量誤改之察含拓碼而除典編碼

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

得：範定緊足兩究獨同某文是否屬。

敗：範過廣（潛 > 200 文）→加子域限或緊時窗。過窄（< 10 文）→廣次搜詞或延時窗。

### 二：識奠基文與要果

由最影貢構察脊：

1. **種發**：自種文（若予）或最近覆文始。追引向前向後識復現之文
2. **引數啟**：用引數為粗影代、然新文（末 5 年）重之、其積引時短
3. **奠基則**：文當奠至少滿一：
   - 引基概、形、法
   - 證重定向之果
   - 合先前散流
   - 為域中後文多引
4. **要果取**：各奠文取：
   - 主果（定理、方、測、法）
   - 所需設或近
   - 對後工之影

```markdown
## Seminal Papers
| # | Authors (Year) | Title | Main Result | Impact |
|---|---------------|-------|-------------|--------|
| 1 | [authors] ([year]) | [title] | [one-sentence result] | [influence on field] |
| 2 | ... | ... | ... | ... |
```

得：5-15 奠文成題之智脊、各文要果與影明陳。

敗：搜無顯奠文→題或過新或過窄。識最早與最引文為錨、記域典參未現。

### 三：時序圖思演

追域自源至今之演：

1. **源**：識核思何時何地始現。記思源於目域或自他域引
2. **長**：追初果如何廣、施、戰。識變域向之轉（如新證技、不期反例、實驗確）
3. **分**：圖文何分為子題。各分簡述焦與與主之關
4. **今**：定域今位。熟（果合）、活（速展）、停（少新）？
5. **時線**：建主展時序

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

得：敘時線、新人讀可解域至今路、含要思之智系。

敗：序不明（如多獨發、爭優）→文歧而非強線敘。並時線可。

### 四：識開問與活前

籍未知或未解：

1. **明陳開問**：搜覆文、問列、察文明列開問。多域維典列（如 Clay 千禧問、Hilbert 問、量訊開問）
2. **隱開問**：識猜未證之果、無理論釋之數察、理實異
3. **活前**：識末 2-3 年最受注之題。由新預印率高、會議專場、資金徵
4. **進阻**：各主開問簡述何難。何數或概阻在前？
5. **潛影**：各開問估解之影。增（補缺）或變（變域思）？

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

得：構至少 3-5 開問含難評、加最活前述。

敗：無顯開問→範或過窄（子題已解）或搜失關覆。廣範或專搜「open problems in [topic]」「future directions in [topic]」。

### 五：合跨域接、生構察

接察域於鄰域、合末出：

1. **跨域接**：識察題接他域：
   - 共數構（如同方現於光與量）
   - 類與對偶（如 AdS/CFT 接重力與場論）
   - 法引（如機器學施於理論物）
   - 實接（如冷原子或光系可測之測）

2. **接質評**：各接評：
   - 深（構等、證對偶）
   - 望（議類、活察）
   - 淺（表似、無證關）

3. **缺析**：識當存而未探之接。為潛察機

4. **察合**：合步一-五出為構文：
   - 執總（一段）
   - 範與法（步一）
   - 史展（步三）
   - 要果與奠文（步二）
   - 開問與前（步四）
   - 跨域接（此步）
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

得：全構察文圖題自源至今前、跨域接識評。

敗：察散→覆步三時線而以為脊。各奠文、開問、跨域接皆當位於時線。

## 驗

- [ ] 察範精定含納除則
- [ ] 奠文識含主果與影
- [ ] 時展含要里追
- [ ] 至少 3-5 開問構含難與影評
- [ ] 跨域接識而評深
- [ ] 書目含諸引文之全參
- [ ] 新人讀察可解域境
- [ ] 察分立果於猜與開問
- [ ] 察書時陳、讀者可評時新

## 忌

- **範蔓**：始焦題漸廣含一切隱關。步一核題句為納則；嚴施
- **新偏**：過示新工而失奠貢。2024 文 10 引或不及 1980 文 5000 引。重影、非新
- **崇引數**：唯以引數為重。高引或為法工（廣用而概不深）；變域之窄域文或少引
- **失負果**：敗試與駁猜為域史一部。略則生誤滑敘
- **淺跨接**：以同詞稱接（如熱力與訊論之「熵」相關、而物與編之「規」不關）。納前評深
- **今主**：以今標斷古文。1960 文當以 1960 知所貢評、非以未測

## 參

- `formulate-quantum-problem` — 為察中所識具問形
- `derive-theoretical-result` — 導或重導所察文中之要果
- `review-research` — 評察中所遇個文
