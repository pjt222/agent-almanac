---
name: catalog-collection
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Catalog and classify materials using standard library systems. Covers
  descriptive cataloging, subject headings, call number assignment using Dewey
  Decimal and Library of Congress Classification, MARC record basics, shelf
  organization, and authority control for consistent access points. Use when
  organizing a personal, institutional, or community library from scratch,
  assigning call numbers and subject headings to new acquisitions, reclassifying
  a collection that has outgrown its original system, or establishing authority
  control for authors, series, or subjects.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: library-science
  complexity: intermediate
  language: natural
  tags: library-science, cataloging, classification, dewey, loc, marc, metadata, taxonomy
---

# Catalog Collection

以標準分類系統與描述編目法編錄並類分圖書或檔案資料。

## 適用時機

- 自頭組個人、機構或社區圖書館
- 為新入館書指派分類號與主題詞
- 為可尋性創一致之目錄記錄
- 為既有系統已不敷之館藏重類
- 為作者、叢書、主題立權威控制

## 輸入

- **必要**：欲編之資料（書、連續刊、媒、檔案）
- **必要**：所擇分類系統（Dewey Decimal 或 Library of Congress）
- **選擇性**：既有目錄或清冊以整合
- **選擇性**：主題詞權威（LCSH、Sears、或自訂辭典）
- **選擇性**：MARC 相容之編目軟體（Koha、Evergreen、LibraryThing）

## 步驟

### 步驟一：擇分類系統

擇合館藏之大、範、眾之系統。

```
Classification System Comparison:
+----------------------------+-------------------------------+-------------------------------+
| Criterion                  | Dewey Decimal (DDC)           | Library of Congress (LCC)     |
+----------------------------+-------------------------------+-------------------------------+
| Best for                   | Public/school libraries,      | Academic/research libraries,  |
|                            | personal collections <10K     | collections >10K volumes      |
+----------------------------+-------------------------------+-------------------------------+
| Structure                  | 10 main classes (000-999),    | 21 letter classes (A-Z),      |
|                            | decimal subdivision           | alphanumeric subdivision      |
+----------------------------+-------------------------------+-------------------------------+
| Granularity                | Broad at top levels,          | Very specific; designed for   |
|                            | expandable via decimals       | research-level distinction    |
+----------------------------+-------------------------------+-------------------------------+
| Learning curve             | Moderate — intuitive          | Steeper — requires schedules  |
|                            | decimal logic                 | and tables                    |
+----------------------------+-------------------------------+-------------------------------+
| Browsability               | Excellent for general         | Excellent for subject-deep    |
|                            | browsing                      | collections                   |
+----------------------------+-------------------------------+-------------------------------+

Decision Rule:
- Personal or small community library: DDC
- Academic, research, or large institutional: LCC
- Mixed or uncertain: Start with DDC; migrate to LCC if collection exceeds 10K
```

**預期：** 擇合館藏規模與旨之分類系統。

**失敗時：** 若二系統皆不合（如高度專之檔案），考慮刻面分類或自訂方案，而錄其映至 DDC 或 LCC 以互用。

### 步驟二：行描述編目

為每件循標準實務創書目描述。

```
Descriptive Cataloging Elements (RDA-aligned):
1. TITLE AND STATEMENT OF RESPONSIBILITY
   - Title proper (exactly as on title page)
   - Subtitle (if present)
   - Statement of responsibility (author, editor, translator)

2. EDITION
   - Edition statement ("2nd ed.", "Rev. ed.")

3. PUBLICATION INFORMATION
   - Place of publication
   - Publisher name
   - Date of publication

4. PHYSICAL DESCRIPTION
   - Extent (pages, volumes, running time)
   - Dimensions (cm for books)
   - Accompanying material (CD, maps)

5. SERIES
   - Series title and numbering

6. NOTES
   - Bibliography, index, language notes
   - Special features or provenance

7. STANDARD IDENTIFIERS
   - ISBN, ISSN, LCCN, OCLC number

Cataloging Principle: Describe what you see.
Take information from the item itself (title page first,
then cover, colophon, verso). Do not guess or embellish.
```

**預期：** 每件有一致之書目記錄，詳足以獨辨與發現。

**失敗時：** 若出版信息缺（舊或自出版常見），以方括示所補信息：`[ca. 1920]`、`[s.l.]`（無地）、`[s.n.]`（無出版者）。

### 步驟三：指派主題詞

用受控詞以便使用者按題尋資。

```
Subject Heading Sources:
+------------------------------+------------------------------------------+
| Authority                    | Use For                                  |
+------------------------------+------------------------------------------+
| LCSH (Library of Congress    | General and academic collections.        |
| Subject Headings)            | Most widely used worldwide.              |
+------------------------------+------------------------------------------+
| Sears List of Subject        | Small public and school libraries.       |
| Headings                     | Simpler vocabulary than LCSH.            |
+------------------------------+------------------------------------------+
| MeSH (Medical Subject        | Medical and health science collections.  |
| Headings)                    |                                          |
+------------------------------+------------------------------------------+
| Custom thesaurus             | Specialized archives or corporate        |
|                              | collections with domain-specific terms.  |
+------------------------------+------------------------------------------+

Assignment Rules:
1. Assign 1-3 subject headings per item (more is noise, fewer is loss)
2. Use the most specific heading available (not "Science" when
   "Marine Biology" exists)
3. Apply subdivisions where helpful:
   - Topical: "Cooking--Italian"
   - Geographic: "Architecture--France--Paris"
   - Chronological: "Art--20th century"
   - Form: "Poetry--Collections"
4. Check authority files for preferred forms before creating new headings
5. Be consistent: if you use "Automobiles" don't also use "Cars" as a heading
```

**預期：** 每件具一至三來自受控詞之主題詞，於全館一致施之。

**失敗時：** 若權威中無合主題詞，創本地詞並錄於本地權威檔。定期審以對主權威齊。

### 步驟四：指派分類號

以所擇分類系統建架上之位址。

```
Dewey Decimal Call Number Construction:
1. Main class number (3 digits minimum): 641.5
2. Add Cutter number for author: .S65 (Smith)
3. Add date for editions: 2023
   Result: 641.5 S65 2023

DDC Main Classes:
  000 - Computer Science, Information
  100 - Philosophy, Psychology
  200 - Religion
  300 - Social Sciences
  400 - Language
  500 - Science
  600 - Technology
  700 - Arts, Recreation
  800 - Literature
  900 - History, Geography

LCC Call Number Construction:
1. Class letter(s): QA (Mathematics)
2. Subclass number: 76.73 (Programming languages)
3. Cutter for specific topic: .P98 (Python)
4. Date: 2023
   Result: QA76.73.P98 2023

Shelving Rule: Call numbers sort left-to-right,
segment by segment. Numbers sort numerically,
letters sort alphabetically, Cutters sort as decimals.
```

**預期：** 每件具一唯一之分類號，以定其架位。

**失敗時：** 若二件生同分類號，加作品標記（書名之首字母，略冠詞）或副本號以辨之。

### 步驟五：創或更目錄記錄

將所編信息入目錄系統。

```
Minimum Viable Catalog Record:
+-----------------+----------------------------------------------+
| Field           | Example                                      |
+-----------------+----------------------------------------------+
| Call Number     | 641.5 S65 2023                               |
| Title           | The Joy of Cooking                           |
| Author          | Smith, Jane                                  |
| Edition         | 9th ed.                                      |
| Publisher       | New York : Scribner, 2023                    |
| Physical Desc.  | xii, 1200 p. : ill. ; 26 cm                 |
| ISBN            | 978-1-5011-6971-7                            |
| Subjects        | Cooking, American                            |
|                 | Cookbooks                                    |
| Status          | Available                                    |
| Location        | Main Stacks                                  |
+-----------------+----------------------------------------------+

If using MARC format:
- 245 $a Title $c Statement of responsibility
- 100 $a Author (personal name)
- 050 $a LCC call number
- 082 $a DDC call number
- 650 $a Subject headings
- 020 $a ISBN

Copy cataloging: Check OCLC WorldCat or your library system's
shared database before creating original records. Someone has
likely already cataloged the same edition.
```

**預期：** 每件於系統中有一目錄記錄，諸必要欄已填。記錄可按作者、書名、主題、分類號尋。

**失敗時：** 若無編目軟體可用，具一致列頭（合上欄）之結構化試算表可為功能目錄。有軟體時遷入之。

### 步驟六：組架

依分類號置資料。

```
Shelf Organization Principles:
1. Left to right, top to bottom (like reading a page)
2. Call numbers in strict sort order:
   - DDC: 000 → 999, then Cutter alphabetically
   - LCC: A → Z, then number, then Cutter
3. Spine labels: print or write call number on spine label
   (white label, black text, 3 lines max)
4. Shelf markers: place dividers at major class boundaries
   (every 100 in DDC, every letter in LCC)
5. Shifting: leave 20-30% empty space per shelf for growth
6. Oversize: shelve items taller than 30cm in a separate
   oversize section, with "+q" prefix on call number

Shelf Reading (periodic verification):
- Walk the stacks weekly
- Check that items are in correct call number order
- Reshelve any misplaced items
- Note damaged items for repair or replacement
```

**預期：** 資料按分類號置，附明脊標與生長空間。

**失敗時：** 若空不足，先置高流通品於易取之架，將低用品移至緊密庫存，於目錄記錄記位變。

## 驗證

- [ ] 分類系統已擇且已錄
- [ ] 諸件皆已完描述編目，含題、作者、出版
- [ ] 自受控詞指派主題詞（每件一至三）
- [ ] 每件已指派且唯一之分類號
- [ ] 目錄記錄於系統或試算表已創
- [ ] 實體資料按分類號排架，附脊標
- [ ] 立權威控制以求名與主題一致

## 常見陷阱

- **詞不一致**：同時用「二次世界大戰，1939-1945」與「二戰」敗受控詞之旨。擇一權威而守之
- **過分類**：於小個人館施十五位 DDC 號加繁而無益。令粒度合館大
- **忽復製編目**：複記錄既存而創原記錄費時。恆先查共享庫
- **忽脊標**：無脊標之已編書將誤架。編目後即標
- **無生長空**：架塞滿致每新入需連動。留餘地

## 相關技能

- `preserve-materials` — 編目資料之保存以維其態
- `curate-collection` — 決定何物入編之收藏發展
- `manage-memory` — 組持久知識庫（實體編目之數位平行）
