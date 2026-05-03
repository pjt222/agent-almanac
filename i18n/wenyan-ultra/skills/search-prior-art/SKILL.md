---
name: search-prior-art
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Search for prior art relevant to a specific invention or patent claim.
  Covers patent literature, non-patent literature (academic papers, products,
  open source), defensive publications, and standard-essential patents.
  Use when evaluating whether an invention is novel and non-obvious before
  filing, challenging the validity of an existing patent, supporting a
  freedom-to-operate analysis, documenting a defensive publication, or
  responding to a patent office action questioning novelty or obviousness.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: intermediate
  language: natural
  tags: intellectual-property, prior-art, patents, novelty, obviousness, invalidity, fto
---

# 搜先藝

行結構先藝搜以尋早於特造之刊、專利、品、披露。用為評可專（可專乎？）、議效（宜授乎？）、立行自由（既權覆此設乎？）。

## 用

- 評造為新非顯於申前→用
- 議既專效藉尋審員失之先藝→用
- 支 FTO 析藉尋窄阻專範之先藝→用
- 文錄防披露阻他專念→用
- 應專局疑新或顯之動→用

## 入

- **必**：造述（為何、如何、解何題）
- **必**：搜旨（可專、無效、FTO、防）
- **必**：關日（專申日，或先藝之造日）
- **可**：知關專或刊
- **可**：技分碼（IPC、CPC）
- **可**：要造或司

## 行

### 一：解造為可搜素

裂造為構技特。

1. 讀造述（或專請若搜既專）
2. 抽**要素**—各獨技特：
   - 含何件？
   - 程循何步？
   - 達何技效？
   - 解何題如何解？
3. 識**新合**—與知藝之異：
   - 新素加於知素乎？
   - 知素新合乎？
   - 知素施新域乎？
4. 為各素生搜詞：
   - 技詞、同義、縮
   - 寬窄詞（階）
   - 同念之異述
5. 文錄**搜圖**：素、詞、關

```
Search Map Example:
+------------------+-----------------------------------+-----------+
| Element          | Search Terms                      | Priority  |
+------------------+-----------------------------------+-----------+
| Attention layer  | attention mechanism, self-        | High      |
|                  | attention, multi-head attention   |           |
| Sparse routing   | mixture of experts, sparse MoE,   | High      |
|                  | top-k routing, expert selection   |           |
| Training method  | knowledge distillation, teacher-  | Medium    |
|                  | student, progressive training     |           |
+------------------+-----------------------------------+-----------+
```

得：完解附各素搜詞。新合識—此搜必尋（無效）或確無（支新）。

敗：造太抽不可解→求更具述。請不明→重各請素之最寬合理解。

### 二：搜專文

系搜專庫。

1. 構詢合素詞：
   - 各素先獨搜（寬）
   - 後合素以尋近藝（窄）
   - 用分碼濾按技域
2. 搜諸庫：
   - **Google Patents**：全文搜善、免、巨集
   - **USPTO PatFT/AppFT**：US 專與申、官源
   - **Espacenet**：歐專、佳分搜
   - **WIPO Patentscope**：PCT 申、全覆
3. 施日濾：
   - 先藝必早於**關日**（申或先日）
   - 含申前 1 年內之刊（寬期按管異）
4. 各關果錄：
   - 文號、題、申日、刊日
   - 何素披（映搜圖）
   - 披新合否
5. 按關分果：
   - **X 引**：獨披造（先用）
   - **Y 引**：披要素、可合他引（顯）
   - **A 引**：背藝、定一般技態

得：分專引列映造素。X 引（若得）為新之止。Y 引為顯論之磚。

敗：無關專藝→非示造為新—非專文（步三）可含關引。一庫無不謂諸庫無。

### 三：搜非專文

搜學論、品、開源、他非專披。

1. **學文**：
   - Google Scholar、arXiv、IEEE Xplore、ACM Digital Library
   - 用步一同詞
   - 會論與工坊紀常早於專申
2. **品與商披**：
   - 品文、用手、行料
   - Internet Archive（Wayback Machine）為日證之網容
   - 業刊與新聞
3. **開源與碼**：
   - GitHub、GitLab—搜技特之行
   - README、文、提史為日證
   - 軟釋含本日
4. **標與譜**：
   - IEEE、IETF（RFC）、W3C、ISO
   - 標必要專必披；搜標體 IP 庫
5. **防披**：
   - IBM Technical Disclosure Bulletin
   - Research Disclosure 刊
   - IP.com Prior Art Database
6. 各果驗**刊日**早於關日：
   - 網頁：用 Wayback Machine 為日證
   - 軟：用釋日或提時印
   - 論：用刊日非交日

得：非專引補專搜。學論與開源碼常為最強先藝因常較專更顯述技詳。

敗：非專文稀→技或主於企 R&D（專重）。重專文於合導顯論。

### 四：析映果

評集先藝與造之關。

1. 建**請陣**映先藝與造素：

```
Claim Element vs. Prior Art Matrix:
+------------------+--------+--------+--------+--------+
| Element          | Ref #1 | Ref #2 | Ref #3 | Ref #4 |
+------------------+--------+--------+--------+--------+
| Element A        |   X    |   X    |        |   X    |
| Element B        |        |   X    |   X    |        |
| Element C        |   X    |        |   X    |        |
| Novel combo A+B+C|        |        |        |        |
+------------------+--------+--------+--------+--------+
```

2. 評**新**：任單引披諸素乎？
   - 是→造為先用（非新）
   - 否→造或新（進顯析）
3. 評**顯**：少數引（2-3）合可覆諸素乎？
   - 有合動乎？（技人見合由乎？）
   - 引導離合乎？（示不行乎？）
4. 為 **FTO 搜**：先藝窄阻專請乎？
   - 與阻專請疊之先藝限其行範
5. 文錄析含具引段

得：明請陣示何素覆於何引、含新與顯評。各映引具段或圖。

敗：陣示缺（素於先藝無）→缺示或新處。後搜重特缺。

### 五：文錄交付

包搜果為宜用。

1. 書 **Prior Art Search Report**：
   - 搜旨範
   - 搜法（庫、詢、日範）
   - 果簡（引數、分）
   - 上引附詳析（請陣）
   - 評：新、顯、FTO 含
   - 限與後搜建
2. 組引：
   - 按關排（X 先、Y 次、A 末）
   - 各引含全書誌與達鏈
   - 要段標或抽
3. 按搜旨建：
   - **可專**：申/否、按缺建請範
   - **無效**：最強引合、建法論
   - **FTO**：險級、設繞機、授考
   - **防**：白空所得→宜防披露否

得：完組搜報直支擬決。引可達、析可追。

敗：搜未定（無強 X 或 Y、有關背）→明陳論：「無先用藝；近藝覆素 A、B 而非 C。建申強素 C 之請。」未定為有效有用之果。

## 驗

- [ ] 造解為別可搜素
- [ ] 新合顯識
- [ ] 專庫搜（≥ 2）
- [ ] 非專文搜（學 + 品 + 開源）
- [ ] 諸引早於關日（驗）
- [ ] 請陣映素於引附段引
- [ ] 新與顯評附理
- [ ] 果按關分（X、Y、A 引）
- [ ] 報含法、限、建
- [ ] 搜可重（詢與庫文錄）

## 忌

- **詞隧**：僅精詞失同義與異述。用步一階
- **僅專搜**：非專文（論、品、碼）常較專顯。勿略步三
- **日疏**：先藝必早於關日。申後一日之佳引無值
- **忽外語藝**：大造或先見於中、日、韓、德專文。機譯使可搜
- **確認偏**：搜以證新而非搜以尋無效藝。最佳搜最力尋近藝
- **過早止**：首數果罕為最佳。按早果迭詞按域語

## 參

- `assess-ip-landscape`
- `screen-trademark`
- `file-trademark`
- `review-research`
- `security-audit-codebase`
