---
name: search-prior-art
locale: wenyan
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

# 搜先有技術

行結構之先有技術之搜，以得早於某發明之載、利、產、揭。用以量可專利（此可專乎）、挑戰效力（此專宜授乎）、立自由運作（此設覆於既權乎）。

## 用時

- 申專利之前，量發明之新與非顯乃用
- 挑戰既專之效，得審察所失之先有技術乃用
- 為自由運作之析，得限阻專之先有技術乃用
- 書防衛之揭，阻他人專之乃用
- 應專利局之動，問新或非顯乃用

## 入

- **必要**：發明之述（其為、其行、所解之患）
- **必要**：搜之旨（可專、無效、FTO、防衛）
- **必要**：關鍵之日（專申之日，或先有技術之發明日）
- **可選**：已知之相關專或載
- **可選**：技分類之碼（IPC、CPC）
- **可選**：域之要發明者或公司

## 法

### 第一步：分發明為可搜之元

破發明為其技要素。

1. 讀發明之述（或既專之申求項，若針既專而搜）
2. 取**要素**——每獨之技特：
   - 含何件？
   - 程依何步？
   - 達何技效？
   - 解何患而何以解之？
3. 識**新合**——別於既知之為何：
   - 新元加既知之元乎？
   - 既知之元之新合乎？
   - 既知之元用於新域乎？
4. 為各元生搜辭：
   - 技辭、同義、縮寫
   - 廣與狹之辭（層）
   - 同念之異述
5. 書**搜圖**：元、辭、關

```
Search Map Example:
+------------------+-----------------------------------+-----------+
| Element          | Search Terms                      | Priority  |
+------------------+-----------------------------------+-----------+
| Attention layer  | attention mechanism, self-         | High      |
|                  | attention, multi-head attention    |           |
| Sparse routing   | mixture of experts, sparse MoE,   | High      |
|                  | top-k routing, expert selection    |           |
| Training method  | knowledge distillation, teacher-   | Medium    |
|                  | student, progressive training      |           |
+------------------+-----------------------------------+-----------+
```

得：完備之分，每元皆有搜辭。新合已識——此乃搜必得（以無效）或必確其無（以支新）者。

敗則：發明過抽不可分，求更具體之述。求項不明，專於各求項元最廣之合理解。

### 第二步：搜專利之載

於專利庫系統而搜。

1. 構合元辭之查：
   - 先各元獨搜（廣）
   - 後合元以得近之技術（狹）
   - 用分類碼濾以技域

2. 搜諸庫：
   - **Google Patents**：宜全文搜，免費，大集
   - **USPTO PatFT/AppFT**：美專與申，官源
   - **Espacenet**：歐專，分類搜佳
   - **WIPO Patentscope**：PCT 申，全球之覆

3. 施日之濾：
   - 先有技術必早於**關鍵之日**（申日或優先日）
   - 含申前一年之載（寬限期依司法異）

4. 各相關之果皆錄：
   - 文號、題、申日、公開日
   - 揭何元（映於搜圖）
   - 是否揭新合

5. 依相關分果：
   - **X 引**：獨揭發明（先有預料）
   - **Y 引**：揭要元，可與他引合（顯而易見）
   - **A 引**：背景之技，定一般技態

得：分類之專引列，映於發明之元。X 引（若得）為新之絕殺。Y 引為顯而易見之積木。

敗則：未得相關專引，非謂發明為新——非專之載（第三步）或藏關鍵之引。一庫之闕非處處之闕。

### 第三步：搜非專之載

搜學術之文、產、開源、與他非專之揭。

1. **學術之載**：
   - Google Scholar、arXiv、IEEE Xplore、ACM Digital Library
   - 用第一步之同辭搜
   - 會議文與工作坊集常早於專申

2. **產與商揭**：
   - 產文檔、用戶手冊、營銷之物
   - Internet Archive（Wayback Machine）為日驗之網內容
   - 業之刊與新聞

3. **開源與碼**：
   - GitHub、GitLab——搜技特之施
   - README、文檔、提交史為日證
   - 軟之發附版日

4. **標準與規格**：
   - IEEE、IETF（RFCs）、W3C、ISO 標準
   - 標準必揭之專；搜標準體之 IP 庫

5. **防衛之揭**：
   - IBM Technical Disclosure Bulletin
   - Research Disclosure 刊
   - IP.com Prior Art Database

6. 各果皆驗**公開之日**早於關鍵之日：
   - 網頁：用 Wayback Machine 為日證
   - 軟：用發版之日或提交之戳
   - 文：用公開之日，非提交之日

得：非專引補專搜。學文與開源碼常為最強之先有技術，其述技詳於專。

敗則：非專之載稀，技或多發於企業 R&D（專重）。重專之載而專於合而顯之論。

### 第四步：析而映諸果

量所得先有技術與發明之關。

1. 立**求項表**映先有技術於發明之元：

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
X = element disclosed in this reference
```

2. 量**新**：單引揭諸元乎？
   - 若是 → 發明已被預料（非新）
   - 若否 → 發明或新（進至顯而易見）

3. 量**顯而易見**：少數引（2-3）合可覆諸元乎？
   - 有合之動機乎？（熟者見合之由乎？）
   - 引示反合乎？（示其不行乎？）

4. **FTO 搜**：先有技術窄阻專之求項乎？
   - 與阻專之求項疊之先有技術限其可執之範

5. 明書析，引特之段

得：明之求項表，示諸元為何引所覆，附新與顯而易見之量。各映引特之段或圖。

敗則：求項表示闕（諸元無一引含），此闕乃潛新處。後續搜專於此具體之闕。

### 第五步：書與交

裝搜果為其用。

1. 書 **Prior Art Search Report**：
   - 搜之旨與範
   - 搜之法（庫、查、日範）
   - 果摘（引數、分類分布）
   - 要引附詳析（求項表）
   - 量：新、顯而易見、FTO 之意
   - 限與後續搜之議

2. 整引：
   - 依相關排（X 在前，Y 次之，A 末）
   - 各引附全書誌與訪鏈
   - 要段標或取出

3. 依搜旨議：
   - **可專**：申/不申，依先有技術之闕議求項之範
   - **無效**：諸引最強之合，議法之論
   - **FTO**：險之等、設計繞過之機、許可之考
   - **防衛**：依得空白之地，是否發為防揭

得：完備整之搜報，直支所欲之決。引可訪，析可循。

敗則：搜未決（無強 X 或 Y 引，唯有相關背景），明書其結：「無預料之技術；最近之技術述元 A 與 B 而非 C。議申以重 C 為求項。」未決亦為合而有用之果。

## 驗

- [ ] 發明已分為別之可搜元
- [ ] 新合已明識
- [ ] 專庫已搜（至少二庫）
- [ ] 非專之載已搜（學+產+開源）
- [ ] 諸引皆早於關鍵之日（日已驗）
- [ ] 求項表映元於引附段引
- [ ] 新與顯而易見已量附由
- [ ] 果分類依相關（X、Y、A 引）
- [ ] 報含法、限、與議
- [ ] 搜可重（查與庫已書）

## 陷

- **關鍵詞之窄視**：唯精合搜失同義與異述。用第一步之辭層
- **唯專之搜**：非專之載（文、產、碼）常明於專。勿略第三步
- **日之忽**：先有技術必早於關鍵之日。申日後一日之佳引，無用
- **忽外語之技術**：要發明或先現於中、日、韓、德之專載。機譯使可搜
- **確認之偏**：搜以確新而非搜以得無效之技術。最佳之搜竭力得最近之技術
- **過早止**：首數果罕為最佳。依早果所示之域辭，反復搜之

## 參

- `assess-ip-landscape` — 寬之景繪，置具體先有技術搜於其中
- `screen-trademark` — 商標衝之篩（異庫、異法框）
- `file-trademark` — 篩成後之申程序
- `review-research` — 文獻審法多疊於先有技術搜
- `security-audit-codebase` — 系搜法之並行（全、書、可重）
