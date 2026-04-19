---
name: chrysopoeia
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Extract maximum value from existing code — performance optimization, API
  surface refinement, and dead weight elimination. The art of turning base code
  into gold through systematic identification and amplification of value-bearing
  patterns. Use when optimizing a working but sluggish codebase, refining an
  API surface that has accumulated cruft, reducing bundle size or memory
  footprint, or preparing code for open-source release — when code works
  correctly but doesn't shine and needs polish rather than a full rewrite.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: intermediate
  language: multi
  tags: alchemy, optimization, value-extraction, performance, refinement, gold
---

# Chrysopoeia

提碼之極值：辨金（值高、善構）、鉛（重、拙）、渣（死）。揚金、轉鉛、去渣。

## 用

- 可用而遲→優
- API 積垢→修
- 減包量、減存、減啟時
- 開源前→取其精
- 碼可而不耀→磨非重寫

## 入

- **必**：碼庫/模塊（路徑）
- **必**：值度（性能、API 明、包量、可讀）
- **可**：剖析或基準數據
- **可**：標（如「減包 40%」、「響應 < 100ms」）
- **可**：約束（API 不變、向後兼容）

## 行

### 一：察——分料

按值分諸元。

1. 依入定值度
2. 列碼元（函、模、出、依）
3. 各元分級：

```
Value Classification:
+--------+---------------------------------------------------------+
| Gold   | High value, well-designed. Amplify and protect.         |
| Silver | Good value, minor imperfections. Polish.                |
| Lead   | Functional but heavy — poor performance, complex API.   |
|        | Transmute into something lighter.                       |
| Dross  | Dead code, unused exports, vestigial features.          |
|        | Remove entirely.                                        |
+--------+---------------------------------------------------------+
```

4. 優化性能→先剖：
   - 識熱路（耗時處）
   - 識冷路（少行之碼→或渣）
   - 量存配模式
5. 出**察報**：逐元+證據

**得：** 諸要元皆分+證。金者得護。鉛者按影響序。

**敗：** 無剖析具→用靜析：函複雜度、依數、碼量。庫過大→先焦路。

### 二：煉——揚金

護且強至貴者。

1. 每金元：
   - 確有全備測試（最貴資產）
   - 介面明文
   - 或可抽為可重用模
2. 每銀元：
   - 施定點改（命名、類型、微優）
   - 測覆至金級
   - 除微瑕不重構
3. 勿變金銀之行——只磨不改

**得：** 金銀更備測、文、護。無行變，只磨。

**敗：** 「金」細察現瑕→重分。誠於值，勝護瑕碼。

### 三：轉——鉛化金

化重拙為優。

1. 鉛按影響序（耗資最大先）
2. 每鉛擇策：
   - **算優**：O(n^2)→O(n log n)、除冗算
   - **緩存/記憶化**：存昂貴多求之果
   - **惰求**：用時方算
   - **批處**：併小為大
   - **結構簡化**：減複雜度、平深嵌
3. 施策→量變：
   - 性能→前後基準
   - 複雜度→前後行數
   - 耦合→前後依數
4. 每轉後驗行相等

**得：** 度上可量之進。每轉元優於鉛且行同。

**敗：** 鉛於現介面拒優→或介面即病。須變調用法，非只實現。

### 四：滌——除渣

系統除死重。

1. 每渣驗真未用：
   - 尋諸引（grep、IDE find-usages）
   - 察動引（字串派發、反射）
   - 察外用（若為庫）
2. 去確渣：
   - 刪死碼、未用出、退化功能
   - 除未用依於清單
   - 清已去功能之配
3. 每去後驗不破（行測）
4. 記所去與因（於提交訊息，非碼）

**得：** 庫輕矣。包量/依數/碼量可量減。諸測猶過。

**敗：** 去破某物→非渣，重分。動引難驗→暫加日誌，確無運行存取後刪。

### 五：驗——稱金

量總進。

1. 行步一同之基準
2. 比前後於值度
3. 記 chrysopoeia 果：
   - 煉元（金銀之磨）
   - 轉元（鉛→金+量）
   - 滌元（渣去+量）
   - 總進（如「快 47%」、「包小 32%」）

**得：** 可量有文之進於值度。庫明勝於前。

**敗：** 總進微→原碼或勝於所設。記所學——知碼近極優亦貴。

## 驗

- [ ] 察報分諸要元+證
- [ ] 金有全測與文
- [ ] 鉛轉可量前後進
- [ ] 渣刪前驗引
- [ ] 每階後諸測皆過
- [ ] 總進有量有文
- [ ] 無行退
- [ ] 入之約束皆守

## 忌

- **早優**：未剖即優——先量再優熱路
- **磨渣**：費力於當刪之碼——先分再煉
- **破金**：優致最佳碼退——金只進不退
- **無量之辭**：「感覺快」非 chrysopoeia——每進須有量
- **優冷路**：費力於啟時單行之碼，瓶頸實在求環

## 參

- `athanor` — 四階全變，chrysopoeia 揭須重構非只優時
- `transmute` — 點轉，鉛元須范式變時
- `review-software-architecture` — 架構級察，補碼級 chrysopoeia
- `review-data-analysis` — 數據管道優，合於碼優
