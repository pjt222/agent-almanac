---
name: catalog-collection
locale: wenyan
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

# 編目藏

以標準館系編目而類圖書或檔之物。

## 用時

- 自始組個人、機構、或社區之庫
- 為新入分配索號與主題
- 為可尋建一致之目錄
- 重類已逾原系之藏
- 為作者、叢、主題立權威控

## 入

- **必要**：待編之物（書、刊、媒、檔）
- **必要**：所擇類系（Dewey Decimal 或 Library of Congress）
- **可選**：欲整合之現目或清單
- **可選**：主題之權威（LCSH、Sears、或自訂 thesaurus）
- **可選**：MARC 相容之編目件（Koha、Evergreen、LibraryThing）

## 法

### 第一步：擇類系

擇合藏之大、範、眾之系。

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

**得：** 所擇類系合藏之模與旨。

**敗則：** 若二系皆不合（如高專之檔），考面類或自訂法，然為互通記至 DDC 或 LCC 之映。

### 第二步：行描述編目

依標準為各物建書目描述。

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

**得：** 各物一致之書目，足識獨與察。

**敗則：** 若版資缺（老或自版常見），用方括示補訊：`[ca. 1920]`、`[s.l.]`（無地）、`[s.n.]`（無版）。

### 第三步：分主題

施控詞令用者依題尋物。

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

**得：** 各物有 1-3 主題自控詞選，跨藏一致施之。

**敗則：** 若汝權威中無合題，建本地題而記於本地權威檔。定期察其合主權威。

### 第四步：分索號

以所擇類系建架位。

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

**得：** 各編物有獨索號定架位。

**敗則：** 若二物生同索，加作號（題首字除冠詞）或副本號以辨。

### 第五步：建或更目錄

編輸入汝目系。

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

**得：** 各物有目錄含諸須欄。可自作者、題、主題、索號搜之。

**敗則：** 若無編目件，以善構表（欄名合上諸欄）為功能目錄。件可得時遷之。

### 第六步：整物架

依索號置物。

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

**得：** 物依索號序置，附清脊籤與成長之空。

**敗則：** 若空不足，先高借之物於易取架，移少用於密儲，於目錄記位變。

## 驗

- [ ] 類系已擇而記
- [ ] 諸物已描述編目，含題、作者、版資
- [ ] 自控詞分主題（各物 1-3）
- [ ] 索號分配而各物獨
- [ ] 目錄建於系或表
- [ ] 物依索號序置，附脊籤
- [ ] 名與主題之權威控已立以持一致

## 陷

- **題不一**：兼用「World War, 1939-1945」與「WWII」敗控詞之旨。擇一而守
- **過類**：為小私庫分十五位 DDC 增繁無益。適粒度於藏模
- **忽複編**：有複錄時作原錄費時。先察共庫
- **脊籤忽**：已編而無脊籤之書必誤置。編畢即籤
- **無成長之空**：架滿 100% 致每新入觸連移。留餘

## 參

- `preserve-materials` — 為持其況之物保
- `curate-collection` — 定何物入編之藏發決
- `manage-memory` — 組持久知庫（物編之數位對照）
