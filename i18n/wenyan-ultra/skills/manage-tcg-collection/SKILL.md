---
name: manage-tcg-collection
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Organize, track, and value a trading card game collection. Covers inventory
  methods, storage best practices, grade-based valuation, want-list management,
  and collection analytics for Pokemon, MTG, Flesh and Blood, and Kayou cards.
  Use when starting a new collection and setting up inventory tracking, cataloging
  an existing collection that has grown beyond casual knowledge, valuing a
  collection for insurance or sale, or deciding which cards to submit for
  professional grading based on value potential.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tcg
  complexity: basic
  language: natural
  tags: tcg, collection, inventory, storage, valuation, pokemon, mtg, fab, kayou
---

# 理 TCG 藏

序、簿、估之，有結構之追蹤、合宜之儲、據數之估。

## 用

- 始新藏立簿
- 已有藏超記憶→編目
- 估藏供保、售、遺
- 理求單與易夾
- 擇何卡送專評

## 入

- **必**：藏中卡戲（Pokemon、MTG、FaB、Kayou 等）
- **必**：藏範（全藏、特組、特卡）
- **可**：現簿系（表、應、實夾）
- **可**：藏標（成組、競、投、舊憶）
- **可**：儲評之預

## 行

### 一：立簿系

依藏量設追系。

1. 依藏量擇法：

```
Collection Size Guide:
+-----------+-------+-------------------------------------------+
| Size      | Cards | Recommended System                        |
+-----------+-------+-------------------------------------------+
| Small     | <200  | Spreadsheet (Google Sheets, Excel)         |
| Medium    | 200-  | Dedicated app (TCGPlayer, Moxfield,        |
|           | 2000  | PokeCollector, Collectr)                   |
| Large     | 2000+ | Database + app combo with barcode scanning |
+-----------+-------+-------------------------------------------+
```

2. 定各卡欄位：
   - **身**：組、號、名、變（holo、reverse、full art）
   - **況**：估級（NM、LP、MP、HP、DMG）或數
   - **量**：副本數
   - **位**：何處（夾頁、箱標、評殼）
   - **得**：日、價、源（包、購、易）
   - **值**：今市值、更日
3. 以此欄位設系
4. 立更頻（活者週、穩者月）

得：成系欄定，可錄。系合藏量——小藏勿過工，大藏勿欠力。

敗：無理想應→用表。式不重於恆。簡表常更勝精應週棄。

### 二：編目

入既有卡。

1. 入前先實序：
   - 按組（同組相聚）
   - 組內按號（升）
   - 變與基同
2. 入系：
   - 用批入（掃碼、組單）
   - 誠錄況——自高估致估誤
   - 記特源（簽、初版、賽獎）
3. 大藏分次：
   - 一次一組或一箱
   - 明標進度
   - 各次抽檢精確
4. 對組單察成度

得：諸卡入含正況位。各組成度知。

敗：藏太大→先入稀貴，餘按組批入估量。八成準遠勝無簿。

### 三：序實儲

依值與用儲卡。

1. 用**儲層系**：

```
Storage Tiers:
+----------+---------------+----------------------------------------------+
| Tier     | Card Value    | Storage Method                               |
+----------+---------------+----------------------------------------------+
| Premium  | >$50          | Top-loader + team bag, or penny sleeve in    |
|          |               | magnetic case. Stored upright in a box.       |
| Standard | $5-$50        | Penny sleeve + top-loader or binder with      |
|          |               | side-loading pages.                          |
| Bulk     | <$5           | Row box (BCW 800-count or similar), sorted    |
|          |               | by set. No individual sleeves needed.         |
| Graded   | Any (slabbed) | Upright in graded card box. Never stack heavy.|
+----------+---------------+----------------------------------------------+
```

2. 環控：
   - 涼乾暗（非閣樓非地窖）
   - 避陽、濕、溫變
   - 箱用矽膠包除濕
3. 皆標：
   - 各箱標內容（組、號區、儲日）
   - 各夾頁對位碼
   - 評卡標 ID 對數系
4. 更系錄位

得：諸卡按值儲，位於簿。優卡護，散卡序可取。

敗：優儲未即→penny sleeves + top-loaders 為值 >$10 卡之底。供至漸升；先護貴。

### 四：估藏

算今市值。

1. 擇價源：
   - **TCGPlayer Market Price**：美市常（MTG、Pokemon）
   - **CardMarket**：歐市標
   - **eBay 已售**：稀獨無標價者最佳
   - **PSA/BGS 價單**：評卡專
2. 更標、優層諸值
3. 散卡用組批價非逐查
4. 算藏總：

```
Collection Value Summary:
+------------------+--------+--------+
| Category         | Count  | Value  |
+------------------+--------+--------+
| Graded cards     |        | $      |
| Premium ungraded |        | $      |
| Standard cards   |        | $      |
| Bulk cards       |        | $      |
+------------------+--------+--------+
| TOTAL            |        | $      |
+------------------+--------+--------+
```

5. 識評候：級溢逾評費者
   - 規：若（期評值 - 原值）> 2倍評費→評

得：今估含貴卡逐值與散卡聚值。評候已識。

敗：價陳或無→記價日源。極稀卡查多源用中位。勿憑一例外。

### 五：維持與優

立常理之例。

1. **常更**（頻同步一）：
   - 新得即入
   - 優層季更，標層半年
   - 值變則重評層
2. **求單理**：
   - 立欲卡單含上限價
   - 對求單與易夾
   - 應支則設價警
3. **藏析**：
   - 月攝總值
   - 監組成度
   - 識集中險（一卡一組占值過）
4. **年審**：
   - 抽樣實數對簿
   - 驗環（濕、蟲）
   - 依今值更評候

得：活簿恆新，助購售評易之決。

敗：維弛→先更優層值，後補新得。要在知今最貴卡之值。

## 驗

- [ ] 簿系立含合欄
- [ ] 諸卡編目含況位
- [ ] 實儲合層
- [ ] 環控（涼乾暗）
- [ ] 估含今價與日
- [ ] 評候析得失
- [ ] 維期立行
- [ ] 求單持續

## 忌

- **自高估**：藏者恒高自卡 1-2 級。誠或用 `grade-tcg-card`
- **忽散**：散卡聚成值。800 通卡每 $0.10 即 $80——值追
- **儲環劣**：濕溫變傷卡甚於把玩。環勝套
- **估陳**：卡市動。半年前估或誤甚，組發禁令時尤
- **無備**：數簿無備脆。月導 CSV。優卡攝以保

## 參

- `grade-tcg-card`
- `build-tcg-deck`
