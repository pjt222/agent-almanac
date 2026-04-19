---
name: assess-ip-landscape
locale: wenyan-ultra
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

# 評 IP 域

圖技或產之 IP 域——專利群、白區、要員、FTO 險、策略位。

## 用

- 入新技 R&D 前——已稱何→用
- 入既競強利之市→用
- 投資審（IP 評）備→用
- 告利申策→用
- 評新產 FTO 險→用
- 監競 IP 為策略位→用

## 入

- **必**：欲評技或產
- **必**：地範（US、EU、全）
- **可**：注定競
- **可**：自利集（為缺析與 FTO）
- **可**：時域（末 5 年、末 10 年、全）
- **可**：類碼（IPC、CPC）若知

## 行

### 一：定搜範

立域析界。

1. 定技域精：
   - 核技（如「變換器言模」非「AI」）
   - 含鄰域（如「注機、分詞、推優」）
   - 明排域（如注 NLP 則排「視變換器」）
2. 識相關類碼：
   - IPC（國際專利分類）——廣，世界用
   - CPC（協作專利分類）——細，US/EU 標
   - 搜 WIPO IPC 出或 USPTO CPC 覽
3. 定地範：
   - US（USPTO）、EU（EPO）、WIPO（PCT）、特國
   - 多析始於 US+EU+PCT 為廣覆
4. 設時窗：
   - 近活：末 3-5 年（今競域）
   - 全史：10-20 年（熟技域）
   - 察過期利開設計空
5. 文範為**域章**

得：清、定範足以出可行果而廣以捕相關競域。類碼識為系搜。

敗：技域太廣（千果）→加技具或注某用域。太窄（少果）→擴鄰技。正範常出 100-1000 利族。

### 二：採利數

收定範內利數。

1. 以域章詢利庫：
   - **免庫**：Google Patents、USPTO PatFT/AppFT、Espacenet、WIPO Patentscope
   - **商庫**：Orbit、PatSnap、Derwent、Lens.org（部免）
   - 合鍵詞+類碼為最佳覆
2. 系構詢：

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

3. 構式（CSV、JSON）下果含：
   - 利/申號、題、摘、申日
   - 受讓/申、發明
   - 類碼、引數
   - 法態（授、待、過、棄）
4. 按利族重複（同發明之國申聚）
5. 錄總利族數與源庫

得：定範內構之利族集，重複且時。集為諸後析之基。

敗：庫達限→Google Patents+Lens.org（免）供良覆。詢果太多（>5000）→加技具。太少（<50）→擴鍵詞或加類碼。

### 三：析域

圖利群、要員、趨。

1. **群析**：按子技聚利：
   - 用類碼或鍵詞聚識 5-10 子域
   - 計各群利族數
   - 識何群增（近申湧）對熟（平或退）
2. **要員析**：識頂十受讓按：
   - 總利族數（集廣）
   - 近申率（末 3 年——今活）
   - 均引數（利質代）
   - 地申廣（唯 US 對全）
3. **趨析**：圖時窗內申趨：
   - 年度總申量
   - 年度按群之申量
   - 新入者（首於域申之受讓）
4. **引網**：識最引利（基 IP）：
   - 高前引=後申重賴
   - 此或為阻利或要前藝
5. 出**域圖**：群、員、趨、要利

得：誰擁何、活何處聚、域如何演之明像。要阻利識。白區（少申域）見。

敗：集太小不能聚→合群為廣聚。一受讓主（>50% 申）→析其集為獨子域。

### 四：識白區與險

由域取策略見。

1. **白區析**（機）：
   - 範內少或無申技域
   - 過期利族設計空再開
   - 唯一員申之活域（先而無競）
   - 增群鄰之白區（次前沿）
2. **FTO 險篩**（威）——適自 `heal` 分類矩：
   - **關**：直覆計產/特之授利
   - **高**：將授含相關稱之待申
   - **中**：鄰域可廣釋之授利
   - **低**：過利、窄稱、地不關申
3. **競位**：
   - 自集（若有）相對競何處？
   - 何競於標域有阻位？
   - 何競或興於互授？
4. 出**策略評**：白區、FTO 險、位、薦

得：可行策略薦：何處申、何避、誰監、何險需詳 FTO 析。

敗：FTO 險識→此篩為初——**不**代利師正 FTO 意。標關險為法察。白區似太善（值域無申）→驗搜範未誤排相關申。

### 五：文與薦

包域評為決者。

1. 書**域報**含：
   - 行要（一頁：要發、頂險、主薦）
   - 範與法（搜詞、庫、日範）
   - 域覽（群、趨、要員附視）
   - 白區析（按策略值排機）
   - 險評（按嚴排 FTO 憂）
   - 薦（申策、授標、監警）
2. 含支數：
   - 利族列（構、可排）
   - 群圖（視）
   - 申趨圖
   - 要利要（頂 10-20 最相關利）
3. 設續監：
   - 為關區定新申警詢
   - 設察期（活區季、穩區年）

得：完域報使策 IP 決。報基證、清範、可行。

敗：報太大→先出行要而請詳段。行要當恆獨立為決文。

## 驗

- [ ] 域章定範、類、地、時窗
- [ ] 利集自多庫採且重複
- [ ] 群識附申數與趨向
- [ ] 頂十要員附集度評
- [ ] 白區識且按策略值排
- [ ] FTO 險篩且按嚴分
- [ ] 要阻利識附引析
- [ ] 薦具體可行
- [ ] 限認（篩對正 FTO 意）
- [ ] 續域追之監警定

## 忌

- **範太廣**：「AI 利」非域——乃海。具技與用
- **唯一庫**：無單利庫有完覆。用至少二源
- **忽利族**：計獨申非族膨數。一發明於十國申為一族非十
- **混申於授**：待申非可行權。分授利與出版申
- **白區誤釋**：空域或意「無人試」或「皆試而敗」。設機前察
- **域為法意**：此技出策略情非法導。此標 FTO 險需正析由利律師

## 參

- `search-prior-art` —— 詳前藝搜為具發明或利效挑
- `screen-trademark` —— 商標衝篩與獨性析
- `file-trademark` —— EUIPO、USPTO、Madrid 之商標申程
- `security-audit-codebase` —— 險評法鏡 IP 險篩
- `review-research` —— 文獻察適前藝析
