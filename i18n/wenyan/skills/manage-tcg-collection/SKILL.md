---
name: manage-tcg-collection
locale: wenyan
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

# 治卡集

整、錄、估卡集，以結構之錄、妥儲、據值之估行之。

## 用時

- 新集初設錄追
- 集已逾常識，需錄之
- 為保險、售、遺而估之
- 治求單與易冊以求特卡
- 依值勢決何卡送專評

## 入

- **必**：集中之牌戲（Pokemon、MTG、FaB、Kayou 等）
- **必**：集之範（全集、特定組、特定卡）
- **可選**：現錄系（表單、應用、實體冊組）
- **可選**：集之的（全組、競技、投資、懷舊）
- **可選**：儲與評之預算

## 法

### 第一步：設錄系

依集之大設追系。

1. 依集大選錄法：

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

2. 定每卡所追之欄：
   - **識**：組、卡號、名、變（亮、反、全圖）
   - **態**：原評估（NM、LP、MP、HP、DMG）或數評
   - **量**：擁幾份
   - **位**：所儲處（冊頁、盒簽、評殼）
   - **得**：得日、付價、源（包、購、易）
   - **值**：當前態值、末更日
3. 設所選系含此諸欄
4. 立更頻（活躍者每週、穩集每月）

**得：** 功能錄系已設，諸欄已定，可入數。系應集之規——小集勿過設，大集勿過簡。

**敗則：** 若理想應用於汝戲或台不可得，用表單。式不重於恆。簡表恆更勝精應用棄置一週。

### 第二步：錄集

入現有卡於錄系。

1. 數錄前先實體分：
   - 依組（同組之卡同處）
   - 組內依號（升序）
   - 變與基卡同組
2. 入卡於系：
   - 可量入處用之（條碼掃、組單）
   - 誠記態——自評過高致估誤
   - 記特出處（簽、初版、賽獎）之卡
3. 大集者，分節作之：
   - 每節處一組或一儲盒
   - 明記進（何盒冊已畢）
   - 每節隨抽樣驗其準
4. 與組單對照識完成率

**得：** 集中每卡皆入，含準態與位。每集之組完成率已知。

**敗則：** 若集太大難手入，先後序之：先入諸稀貴卡，再依組量入普卡附估量。八成準錄遠勝無錄。

### 第三步：整實儲

依值與用妥儲卡。

1. 施 **儲層系**：

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

2. 環境控：
   - 儲於涼、乾、暗處（勿閣樓、勿地窖）
   - 避日直、濕、溫變
   - 儲盒中置矽膠包以控濕
3. 諸物皆貼簽：
   - 每盒貼內容（組名、卡範、儲日）
   - 每冊頁對應錄位碼
   - 評卡貼錄號合於數系
4. 更錄系含儲位

**得：** 每卡依值妥儲，位於錄。貴卡受護，普卡有序可達。

**敗則：** 若高層儲料不即得，過 $10 之卡至少用便宜套加上層套。物來則升儲；要在使貴卡得某護。

### 第四步：估集

算當前市值。

1. 選價源：
   - **TCGPlayer 市價**：美市常用（MTG、Pokemon）
   - **CardMarket**：歐市標
   - **eBay 已售**：稀奇無標價者宜
   - **PSA/BGS 價單**：專為評卡
2. 更標、高層卡之值
3. 普卡用每組量價非逐查
4. 算集要：

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

5. 識評之候：評之溢逾評之費
   - 法：（預評值 − 原值）> 2 倍評費則評

**得：** 集之當前估，要卡有單值，普卡有總值。評候已識。

**敗則：** 若價數陳或不可得，記價日與源。極稀卡查多源用中位。勿信單一例外售。

### 第五步：守與優

立常治集之軌。

1. **常更**（合第一步之頻）：
   - 新得即入
   - 高層每季更，標層每半年
   - 值變則重評儲層
2. **求單治**：
   - 守欲卡及最高價之單
   - 求單與易冊互照
   - 應用支則設價警
3. **集析**：
   - 追總值過時（每月快照）
   - 監組完成率
   - 識集中風險（一卡或一組值過大）
4. **歲審**：
   - 隨抽樣實算對錄
   - 驗儲況（察濕、蟲害）
   - 依當前值審更評之候

**得：** 活之治集系，與時俱進，助購、售、評、易之決。

**敗則：** 若守怠，先後序之：先更高層值，再追新得。最要在知最貴卡今值幾何。

## 驗

- [ ] 錄系已設含所宜諸欄
- [ ] 諸卡皆錄含態與位
- [ ] 實儲合卡值層
- [ ] 環境控已設（涼、乾、暗）
- [ ] 集已估含當前市價與日
- [ ] 評之候已識附本益析
- [ ] 守頻已立並行
- [ ] 求單為得而守

## 陷

- **自評過高**：藏者常自評逾實 1-2 級。誠之，或用 `grade-tcg-card` 行結構估
- **忽普卡**：普卡聚則有值。八百普卡每卡 $0.10 即 $80——值得追
- **儲環境差**：濕與溫變比手觸更速損卡。環境逾套
- **估陳**：卡市動。半年前估或謬，尤組發或禁宣前後
- **無備**：數錄無備脆。每月出 CSV。攝高層卡為保險

## 參

- `grade-tcg-card` — 結構卡評以準估態
- `build-tcg-deck` — 用集錄構牌組
