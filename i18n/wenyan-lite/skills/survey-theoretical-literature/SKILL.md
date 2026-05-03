---
name: survey-theoretical-literature
locale: wenyan-lite
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

# 調查理論文獻

對所定主題行結構化之理論文獻調查，產一綜述：標出奠基貢獻、追溯關鍵想法之年代發展、識別開放問題與活躍研究前沿，並標明跨領域連結。

## 適用時機

- 開始研究一不熟之理論主題並需繪其景觀
- 為論文、論文集或補助提案寫文獻回顧之段
- 識別理論領域中之開放問題與差距
- 尋理論結果與鄰域工作之連結
- 對既有工作評估提議之理論貢獻之新穎性

## 輸入

- **必要**：主題描述（具體至足以界定搜索；如「非厄米系統中之拓樸相」而非僅「拓樸」）
- **必要**：範圍限制（時段、含／除之子領域、理論 vs. 實驗焦點）
- **選擇性**：已知種子論文（請求者已知之論文，以錨定搜索）
- **選擇性**：目標讀者與深度（入門概覽 vs. 專家級綜述）
- **選擇性**：所需輸出格式（注釋書目、敘事回顧、概念圖）

## 步驟

### 步驟一：定義範圍與搜索詞

於搜索前精準界定：

1. **核心主題陳述**：寫一句定義調查所涵者。此句即一論文是否屬本調查之接受標準。
2. **搜索詞**：產主與次搜索詞：
   - 主詞：實踐者所用之確切技術短語（如「Kohn-Sham equations」、「Berry phase」、「renormalization group」）
   - 次詞：可能自其他社群捕獲相關工作之較廣或鄰接短語（如「geometric phase」為「Berry phase」之同義）
   - 排除詞：將拉入無關結果之短語（如於植物學意義之「Berry」加排除）
3. **時間範圍**：定義時間窗。對成熟領域，奠基論文或數十年前，但近期進展或縮至最近 5-10 年。對新興領域，整個歷史可僅跨數年。
4. **領域邊界**：明示哪些子領域於範圍內、哪些於外。例如，量子糾錯之調查或含拓樸碼但除經典編碼理論。

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

**預期：** 範圍定義緊至兩研究者將獨立同意某論文是否屬調查。

**失敗時：** 若範圍過廣（200 篇以上潛在相關論文），加子領域限制或縮緊時間窗以縮之。若過窄（少於 10 篇），廣其次搜索詞或延時間窗。

### 步驟二：識別奠基論文與關鍵結果

自最具影響力之貢獻建調查之骨幹：

1. **種子驅動之發現**：自種子論文（如有提供）或主題上最近之回顧文章起。後追參考、前追引用以識重複出現之論文。
2. **引用計數啟發**：以引用計數為影響力之粗略代理，但對近期論文（最近 5 年）加重，因其積引用之時間較短。
3. **奠基論文準則**：論文符以下至少其一即為奠基：
   - 引入了奠基性概念、形式或方法
   - 證明了重塑領域之結果
   - 將先前互不相干之工作鏈統一
   - 為其後該領域多數論文所引用
4. **關鍵結果萃取**：對每奠基論文，萃：
   - 主要結果（定理、方程、預測或方法）
   - 所需之假設或近似
   - 對其後工作之影響

```markdown
## Seminal Papers
| # | Authors (Year) | Title | Main Result | Impact |
|---|---------------|-------|-------------|--------|
| 1 | [authors] ([year]) | [title] | [one-sentence result] | [influence on field] |
| 2 | ... | ... | ... | ... |
```

**預期：** 5-15 篇奠基論文之表，構成主題之智識骨幹，每篇之主要結果與影響皆已清晰陳述。

**失敗時：** 若搜索未產清晰奠基論文，主題或太新或太冷門。則識最早論文與最常被引論文為錨，並註明該領域之經典參考尚未浮現。

### 步驟三：年代繪想法之發展

追溯領域如何自起源演至當前：

1. **起源期**：識別核心想法首次出現之時與地。註想法是源於目標領域內或自他域引入。
2. **成長期**：追溯初始結果如何被推廣、應用或挑戰。識別領域方向變之關鍵轉捩（如新證明技巧、意外反例、實驗確認）。
3. **分支點**：繪文獻分為子主題之處。對每分支，簡描其焦點與其與主幹之關係。
4. **當前狀態**：刻畫該領域今處何地。是否成熟（結果在固化）、活躍（迅速發展），或停滯（近期論文少）？
5. **時間線構造**：建最重要發展之年代時間線。

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

**預期：** 一敘事時間線，新人可讀以理解領域如何抵當前狀態，含關鍵想法之智識傳承。

**失敗時：** 若年代不清（如多獨立發現、優先權有爭），記錄歧義而非強加假線性敘事。並行時間線可接受。

### 步驟四：識別開放問題與活躍前沿

編列尚未知或未解者：

1. **明示開放問題**：搜索回顧文章、問題清單與調查論文，明列開放問題者。許多領域維護經典清單（如克雷千禧年問題、希爾伯特問題、量子資訊中之開放問題）。
2. **隱式開放問題**：識別已猜想但未證之結果、無理論解釋之數值觀察，或理論與實驗之差異。
3. **活躍前沿**：識別最近 2-3 年最受注意之主題。其特徵為高頻之新預印本、會議場次與資助呼。
4. **進展障礙**：對每主要開放問題，簡描其困難之因。何種數學或概念障礙橫亙？
5. **潛在影響**：對每開放問題，估其解決之影響。將為漸進式（填空）或變革式（改變領域思維）？

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

**預期：** 結構化編列至少 3-5 個開放問題含難度評估，並刻畫最活躍研究前沿。

**失敗時：** 若無開放問題顯，調查範圍或太窄（子主題已解）或文獻搜索遺漏相關回顧文章。廣範圍或專搜「open problems in [topic]」與「future directions in [topic]」。

### 步驟五：綜合跨領域連結並產結構化調查

將所調查之領域連於鄰域並組成最終輸出：

1. **跨領域連結**：識別所調查主題與其他領域之連結處：
   - 共享數學結構（如同方程於光學與量子力學中現）
   - 類比與對偶（如 AdS/CFT 連重力與場論）
   - 方法論引入（如機器學習技術應用於理論物理）
   - 實驗連結（如於冷原子或光子系統中可測之預測）

2. **連結品質評估**：對每連結，評其為：
   - 深（結構等價、已證對偶）
   - 有望（暗示性類比、活躍探究）
   - 表面（表面相似、無已證關係）

3. **差距分析**：識別應存在但未被探之連結。其為潛在研究機會。

4. **調查組裝**：將步驟一至五之輸出匯為結構化文件：
   - 執行摘要（一段）
   - 範圍與方法論（自步驟一）
   - 歷史發展（自步驟三）
   - 關鍵結果與奠基論文（自步驟二）
   - 開放問題與前沿（自步驟四）
   - 跨領域連結（自此步）
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

**預期：** 完整、結構化之調查文件，繪主題自起源至當前前沿，跨領域連結已識別並評估。

**失敗時：** 若調查感支離，重訪年代時間線（步驟三）並以其為組織之脊。每奠基論文、開放問題與跨領域連結皆應可定位於時間線上。

## 驗證

- [ ] 調查範圍以納入與排除準則精準定義
- [ ] 已識別奠基論文並陳主要結果與影響
- [ ] 已追溯年代發展含關鍵里程碑
- [ ] 至少 3-5 個開放問題已編列含難度與影響評估
- [ ] 跨領域連結已識別且其深度已評估
- [ ] 書目含所有引用論文之完整參考資訊
- [ ] 該領域之新人可讀調查並理解景觀
- [ ] 調查區分既定結果與猜想及開放問題
- [ ] 已陳述調查撰寫之時，使讀者可評其時效

## 常見陷阱

- **範圍蔓延**：自聚焦主題起並逐漸擴至納入一切沾邊者。步驟一之核心主題句即接受準則；嚴格執行之。
- **近期偏見**：以犧牲奠基貢獻為代過度代表近期工作。具 10 引用之 2024 論文或不如具 5,000 引用之 1980 論文重要。權衡影響，非新穎。
- **崇拜引用計數**：以引用計數為唯一重要性度量。高引用論文可為方法工具（廣用但非概念深），而冷門領域之變革論文或引用較少。
- **遺漏負面結果**：失敗嘗試與被反駁之猜想為領域歷史之一部分。略之則給誤導性平滑敘事。
- **表面跨領域連結**：因兩領域用同詞而宣稱有連結（如熱力學之「entropy」與資訊理論者相關，但物理之「gauge」與編織者不）。納入前評其深度。
- **以今論古**：以現代標準判歷史論文。1960 年論文應依 1960 年所知評其貢獻，非以其未預見之事評之。

## 相關技能

- `formulate-quantum-problem` — 形式化文獻調查中所識之具體問題
- `derive-theoretical-result` — 推導或重推所調查文獻中之關鍵結果
- `review-research` — 評估調查中所遇之個別論文
