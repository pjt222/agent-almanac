---
name: assess-ip-landscape
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Map the intellectual property landscape for a technology domain or product
  area. Covers patent cluster analysis, white space identification, competitor
  IP portfolio assessment, freedom-to-operate preliminary screening, and
  strategic IP positioning recommendations. Use before starting R&D in a new
  technology area, when evaluating market entry against incumbents with strong
  patent portfolios, preparing for investment due diligence, informing a patent
  filing strategy, or assessing freedom-to-operate risk for a new product.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: advanced
  language: natural
  tags: intellectual-property, patents, landscape, fto, trademark, ip-strategy, prior-art
---

# 評智財景

為技術領域或產品區對應智慧財產景——辨專利簇、空白、關鍵者、自由運營險。產告知 R&D 方向、授權決策、IP 申請策略之策略評估。

## 適用時機

- 始於新技術區之 R&D 前（已主張何？）
- 評具強專利組合之既有者所佔市場之入場
- 備投資盡職調查（IP 資產評估）
- 告知專利申請策略（何處申、何申）
- 為新產品或功能評自由運營險
- 為策略定位監對手 IP 活動

## 輸入

- **必要**：欲評之技術領域或產品區
- **必要**：地理範圍（US、EU、global）
- **選擇性**：欲聚焦之特定對手
- **選擇性**：自有專利組合（為缺口分析與 FTO）
- **選擇性**：時間範圍（過去 5 年、過去 10 年、全期）
- **選擇性**：分類碼（IPC、CPC）若知

## 步驟

### 步驟一：定搜範

立景分析之邊界。

1. 精定技術領域：
   - 核技術區（如「基於 transformer 之語言模型」非「AI」）
   - 鄰區以納（如「注意力機制、tokenization、推論最佳化」）
   - 明排之區（如「電腦視覺 transformer」若聚焦 NLP）
2. 辨相關分類碼：
   - IPC（International Patent Classification）——廣，世界用
   - CPC（Cooperative Patent Classification）——更特，US/EU 標準
   - 搜 WIPO 之 IPC 出版或 USPTO 之 CPC 瀏覽器
3. 定地理範：
   - US（USPTO）、EU（EPO）、WIPO（PCT）、特定國辦
   - 多分析自 US + EU + PCT 起以求廣覆蓋
4. 設時窗：
   - 近期活動：過去 3-5 年（當前競爭景）
   - 全史：10-20 年（成熟技術區）
   - 注過期專利重開設計空間
5. 將範記為**景章程**

**預期：** 清晰、有界之範，特定足以產可行結果，廣足以捕相關競爭景。為系統搜辨之分類碼。

**失敗時：** 若技術領域過廣（千數結果），加技術特定或聚焦特定應用以窄。若過窄（少結果），擴至鄰技術。對範通常產 100-1000 專利族。

### 步驟二：採專利資料

於定範內收專利資料。

1. 用景章程查專利資料庫：
   - **免費資料庫**：Google Patents、USPTO PatFT/AppFT、Espacenet、WIPO Patentscope
   - **商業資料庫**：Orbit、PatSnap、Derwent、Lens.org（freemium）
   - 合關鍵字搜 + 分類碼以求最佳覆蓋
2. 系統建搜查詢：

```
Query Construction:
+-------------------+------------------------------------------+
| Component         | Example                                  |
+-------------------+------------------------------------------+
| Core keywords     | "language model" OR "LLM" OR "GPT"       |
| Technical terms   | "attention mechanism" OR "transformer"    |
| Classification    | CPC: G06F40/*, G06N3/08                  |
| Date range        | filed:2019-2024                          |
| Assignee filter   | (optional) specific companies            |
+-------------------+------------------------------------------+
```

3. 以結構格式（CSV、JSON）下結果，含：
   - 專利／申請號、題、摘、申請日
   - 受讓人／申請人、發明人
   - 分類碼、引用資料
   - 法律狀態（granted、pending、expired、abandoned）
4. 按專利族去重（將同發明之國家申請組）
5. 記專利族總數與來源資料庫

**預期：** 範內專利族之結構化資料集，已去重附時戳。資料集為一切後續分析之基。

**失敗時：** 若資料庫存取受限，Google Patents + Lens.org（免費）供良覆蓋。若查詢回過多結果（>5000），加技術特定。若過少（<50），擴關鍵字或加分類碼。

### 步驟三：析景

對應專利簇、關鍵者、趨勢。

1. **簇分析**：將專利按子技術組：
   - 用分類碼或關鍵字聚類辨 5-10 子區
   - 計每簇之專利族數
   - 辨何簇增長（近期申請激增）vs. 成熟（平或降）
2. **關鍵者分析**：以下辨前 10 受讓人：
   - 總專利族數（組合廣度）
   - 近期申請率（過去 3 年——當前活動）
   - 平均引用數（專利品質代理）
   - 地理申請廣度（僅 US vs. 全球申請）
3. **趨勢分析**：將時窗內之申請趨勢繪：
   - 整體申請量按年
   - 按簇按年之申請量
   - 新進入者（首次於領域申請之受讓人）
4. **引用網絡**：辨被引最多之專利（基礎 IP）：
   - 高前向引用 = 後續申請大量依賴
   - 此為可能阻塞專利或必要先前技術
5. 產**景圖**：簇、者、趨勢、關鍵專利

**預期：** 誰擁何、活動集中於何、景如何演之清晰圖。關鍵阻塞專利已辨。空白（少申請之區）可見。

**失敗時：** 若資料集過小不能有意聚類，將簇合為更廣組。若一受讓人主導（>50% 申請），將其組合作為獨立子景析。

### 步驟四：辨空白與險

自景提策略洞察。

1. **空白分析**（機會）：
   - 範內少或無專利申請之技術區
   - 設計空間重開之過期專利族
   - 僅一者申請之活躍區（先動者然無競爭）
   - 鄰增長簇之空白（下一前沿）
2. **FTO 險篩**（威脅）——自 `heal` 分流矩陣適配：
   - **Critical**：直涵蓋君之計畫產品／功能之已授權專利
   - **High**：可能授權附相關權利範圍之待審申請
   - **Medium**：鄰區之已授權專利可廣解
   - **Low**：過期專利、窄權利範圍或地理上不相關之申請
3. **競爭定位**：
   - 君之組合（若有）相對於對手位於何？
   - 何對手於目標區有阻塞位？
   - 何對手或有興趣於交叉授權？
4. 產**策略評估**：空白、FTO 險、定位、建議

**預期：** 可行策略建議：何處申、何避、誰看、何險需詳 FTO 分析。

**失敗時：** 若辨 FTO 險，此篩為初步——**不**代專利律師之正式 FTO 意見。標關鍵險供法律審。若空白似過好（有值區無申請），驗搜範未誤排相關申請。

### 步驟五：記載並建議

將景評估包為決策者可用之物。

1. 撰**景報告**附以下節：
   - 行政摘要（一頁：關鍵發現、首要險、主建議）
   - 範與方法（搜詞、資料庫、日期範）
   - 景概覽（簇、趨勢、關鍵者附視覺化）
   - 空白分析（機會按策略值排）
   - 險評估（FTO 關切按嚴重度排）
   - 建議（申請策略、授權目標、監告）
2. 含支持資料：
   - 專利族列（結構、可排）
   - 簇圖（視覺）
   - 申請趨勢圖
   - 關鍵專利摘（前 10-20 最相關專利）
3. 設持續監測：
   - 為關鍵區之新申請定告查詢
   - 設複查節奏（活躍區季度，穩定區年度）

**預期：** 完整之景報告，使策略 IP 決策成為可能。報告以證據為基、清範、可行。

**失敗時：** 若報告過大，先產行政摘要並請求時供詳節。行政摘要應恆獨立為決策文件。

## 驗證

- [ ] 景章程定範、分類、地理、時窗
- [ ] 專利資料集自多資料庫採並去重
- [ ] 簇已辨附申請計數與趨勢方向
- [ ] 前 10 關鍵者已剖附組合指標
- [ ] 空白已辨並按策略值排
- [ ] FTO 險已篩並按嚴重度分類
- [ ] 關鍵阻塞專利已辨附引用分析
- [ ] 建議特定且可行
- [ ] 限制已承（篩 vs. 正式 FTO 意見）
- [ ] 為持續景追蹤定監告

## 常見陷阱

- **範過廣**：「AI 專利」非景——為海。對技術與應用特定
- **獨資料庫依**：無單一專利資料庫有完整覆蓋。用至少二源
- **忽專利族**：計個別申請而非族膨脹數。一發明於 10 國申請為一專利族非十
- **混申請與授權**：待審申請非可執行之權。區已授權專利與已公開申請
- **空白誤解**：空區或意「無人試」或「眾試而敗」。假機會前先查
- **景作法律意見**：此技能產策略情報，非法律建議。此處標之 FTO 險需專利律師之正式分析

## 相關技能

- `search-prior-art` — 為特定發明或專利效力挑戰之詳先前技術搜
- `screen-trademark` — IP 景之商標面之商標衝突篩與獨特性分析
- `file-trademark` — EUIPO、USPTO、Madrid Protocol 之商標申請程序
- `security-audit-codebase` — 險評估方法平行於 IP 險篩
- `review-research` — 文獻複查技能適用於先前技術分析
