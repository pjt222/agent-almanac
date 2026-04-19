---
name: assess-ip-landscape
locale: wenyan
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

# 察 IP 地貌

繪技域或品區之 IP 地貌——識專利群、白地、要角、操自由險。生告研發向、許決、專利申之策評。

## 用時

- 新技域研發前（何已宣？）乃用
- 入有強專利庫之主者之市乃用
- 備投資盡職察（IP 資察）乃用
- 告專利申策（何地申、何宣）乃用
- 察新品或功之 FTO 險乃用
- 察對手 IP 動以策位乃用

## 入

- **必要**：待察之技域或品區
- **必要**：地理範（美、歐、全球）
- **可選**：特欲焦之對手
- **可選**：自有專利庫（隙析與 FTO）
- **可選**：時限（末五年、末十年、全時）
- **可選**：分類碼（IPC、CPC）若知

## 法

### 第一步：定搜範

立地貌析之界。

1. 精定技域：
   - 核技區（如「transformer 式語言模」非「AI」）
   - 欲納之鄰（如「注機、分詞、推優」）
   - 欲排之（如注 NLP 則排「電腦視覺 transformer」）
2. 識相關分類碼：
   - IPC（國際專利分類）——廣，全球用
   - CPC（合作專利分類）——細，美/歐標
   - 察 WIPO 之 IPC 刊或 USPTO 之 CPC 覽
3. 定地理範：
   - 美（USPTO）、歐（EPO）、WIPO（PCT）、特國局
   - 諸析多始於美 + 歐 + PCT 為廣覆
4. 設時窗：
   - 近動：末三五年（當競地貌）
   - 全史：十至廿年（熟技區）
   - 察過期專利重開設計空
5. 書範為**地貌章**

**得：** 清限之範，具足生可行果而廣足捕相關競地貌。分類碼識以系搜。

**敗則：** 若技域過廣（千果），加技具或注特應區狹之。若過狹（少果），廣至鄰技。適範典生百至千專利族。

### 第二步：采專利數

集所定範內之專利數。

1. 以地貌章查專利庫：
   - **免費**：Google Patents、USPTO PatFT/AppFT、Espacenet、WIPO Patentscope
   - **商業**：Orbit、PatSnap、Derwent、Lens.org（半免）
   - 合鍵字搜 + 分類碼為佳覆
2. 系建搜查：

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

3. 下果於結構式（CSV、JSON）含：
   - 專利/申請號、題、摘、申日
   - 持有者/申請者、發明者
   - 分類碼、引用數
   - 法狀（授、待、過、棄）
4. 以專利族去重（聚同發明之諸國申）
5. 記總專利族數與源庫

**得：** 結構化之專利族數於範內，已去重已時戳。此數為後續析之基。

**敗則：** 若庫訪限，Google Patents + Lens.org（免）供佳覆。若查返過多（>5000），加技具。若過少（<50），廣鍵或加分類。

### 第三步：析地貌

映專利群、要角、趨。

1. **群析**：按子技聚專利：
   - 以分類碼或鍵聚識五至十子區
   - 計每群專利族數
   - 識何群長（近申激）、何熟（平或降）
2. **要角析**：按下識十大持有者：
   - 總族數（庫廣）
   - 近申率（末三年——當動）
   - 均引計（專利質代）
   - 地理申廣（唯美對全球）
3. **趨析**：繪時窗申趨：
   - 年總申量
   - 按群按年申量
   - 新入（此域首申者）
4. **引網**：識最引專利（基 IP）：
   - 高前引 = 後申重依
   - 此或為阻專利或要前藝
5. 生**地貌圖**：群、角、趨、要專利

**得：** 誰有何、動於何處、地貌如何演之清圖。要阻專利識。白地（少申之區）可見。

**敗則：** 若數少不可義聚，合群為廣組。若一持有者主（>50%），析其庫為獨子地貌。

### 第四步：識白地與險

自地貌取策見。

1. **白地析**（機）：
   - 範內少無專利之技區
   - 設計空重開之過期族
   - 唯一者申之活區（先而無競）
   - 長群之鄰白地（下疆）
2. **FTO 險察**（威）——自 `heal` 分流矩改：
   - **關鍵**：授專利直覆擬品/功
   - **高**：待申或授附相關宣
   - **中**：鄰區授專利可廣釋
   - **低**：過期、窄宣、或地理無關之申
3. **競位**：
   - 自庫（若有）於對手如何？
   - 何對手於目區有阻位？
   - 何對手或欲交叉許？
4. 生**策評**：白地、FTO 險、位、薦

**得：** 可行策薦：何處申、何避、誰察、何險需詳 FTO 析。

**敗則：** 若識 FTO 險，此察為初——*不*代專利律師之正 FTO 見。標關鍵險為法審。若白地似過佳（有值而無申），驗搜範未誤排相關申。

### 第五步：書而薦

裝地貌評予決者。

1. 書**地貌報**含：
   - 要（一頁：要發現、頂險、主薦）
   - 範與法（搜辭、庫、日範）
   - 地貌概（群、趨、要角附視）
   - 白地析（機依策值排）
   - 險評（FTO 憂依重排）
   - 薦（申策、許目、察警）
2. 含支數：
   - 專利族列（結構、可排）
   - 群圖（視）
   - 申趨圖
   - 要專利要（最相關十至廿）
3. 設續察：
   - 定關鍵區新申之警查
   - 設察率（活區季、穩區年）

**得：** 全地貌報使策 IP 決可能。報證本、清限、可行。

**敗則：** 若報過大，先生要而詳段待求。要當獨立為決文。

## 驗

- [ ] 地貌章定範、分類、地、時窗
- [ ] 專利數自多庫采且去重
- [ ] 群識附申計與趨向
- [ ] 十大要角附庫指畫
- [ ] 白地識且按策值排
- [ ] FTO 險察且按重分
- [ ] 要阻專利識附引析
- [ ] 薦具而可行
- [ ] 限承（察對正 FTO 見）
- [ ] 續察警定

## 陷

- **範過廣**：「AI 專利」非地貌——乃海。技與應宜具
- **依單庫**：無單庫有全覆。至少用二源
- **忽專利族**：計個申代族虛其數。一發明於十國申為一族，非十
- **混申於授**：待申非可執權。別授專利與刊申
- **白地誤釋**：空區或「無人試」或「諸皆試敗」。察而後假機
- **地貌為法見**：此技生策情報，非法諮。此標 FTO 險需專利律師正析

## 參

- `search-prior-art` — 為具發明或專利有效挑之詳前藝搜
- `screen-trademark` — IP 地貌商標面之商標衝察與辨性析
- `file-trademark` — EUIPO、USPTO、馬德里條約之商標申程
- `security-audit-codebase` — 險評法映 IP 險察
- `review-research` — 文獻審技施於前藝析
