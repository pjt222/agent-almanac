---
name: catalog-collection
description: >
  標準的な図書館システムを使用して資料を目録化・分類する。記述目録作成、件名標目、
  デューイ十進分類法と米国議会図書館分類法を使用した請求記号の付与、MARCレコードの
  基礎、書架整理、典拠コントロールをカバーする。個人、機関、またはコミュニティの
  図書館をゼロから整理する時、新規受入資料に請求記号と件名標目を付与する時、
  元のシステムでは対応しきれなくなったコレクションを再分類する時、著者・シリーズ・
  主題の典拠コントロールを確立する時に使用する。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: library-science
  complexity: intermediate
  language: natural
  tags: library-science, cataloging, classification, dewey, loc, marc, metadata, taxonomy
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# コレクションの目録化

標準的な分類システムと記述目録作成の実務を用いて、図書館またはアーカイブ資料を目録化・分類する。

## 使用タイミング

- 個人、機関、またはコミュニティの図書館をゼロから整理する時
- 新規受入資料に請求記号と件名標目を付与する必要がある時
- 検索性のために一貫したカタログレコードを作成したい時
- 元のシステムでは対応しきれなくなったコレクションを再分類する時
- 著者、シリーズ、または主題の典拠コントロールを確立する必要がある時

## 入力

- **必須**: 目録化する資料（書籍、逐次刊行物、メディア、アーカイブ資料）
- **必須**: 選択した分類システム（デューイ十進分類法または米国議会図書館分類法）
- **任意**: 統合対象の既存カタログまたはインベントリ
- **任意**: 件名標目典拠（LCSH、Sears、またはカスタムシソーラス）
- **任意**: MARC対応目録作成ソフトウェア（Koha、Evergreen、LibraryThing）

## 手順

### ステップ1: 分類システムの選択

コレクションの規模、範囲、対象者に合ったシステムを選択する。

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

**期待結果:** コレクションの規模と目的に合った分類システムが選択される。

**失敗時:** どちらのシステムも適合しない場合（例：高度に専門化されたアーカイブ）、ファセット分類法またはカスタムスキームを検討するが、相互運用性のためにDDCまたはLCCへのマッピングを文書化する。

### ステップ2: 記述目録作成の実施

標準的な実務に従い、各資料の書誌記述を作成する。

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

**期待結果:** 各資料について、一意の識別と発見に十分な詳細を持つ一貫した書誌レコード。

**失敗時:** 出版情報が欠落している場合（古い資料や自費出版の資料に多い）、角括弧を使用して補足情報を示す：`[ca. 1920]`、`[s.l.]`（出版地不明）、`[s.n.]`（出版者不明）。

### ステップ3: 件名標目の付与

統制語彙用語を適用して、利用者がトピックで資料を検索できるようにする。

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

**期待結果:** 各資料に統制語彙から1〜3の件名標目が付与され、コレクション全体で一貫して適用される。

**失敗時:** 典拠に適切な標目が存在しない場合、ローカル標目を作成してローカル典拠ファイルに文書化する。メインの典拠との整合性を定期的にレビューする。

### ステップ4: 請求記号の付与

選択した分類システムを使用して書架アドレスを構築する。

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

**期待結果:** 目録化されたすべての資料が、書架上の位置を決定する一意の請求記号を持つ。

**失敗時:** 2つの資料が同じ請求記号を生成する場合、著作記号（冠詞を除くタイトルの最初の文字）または複本番号を追加して区別する。

### ステップ5: カタログレコードの作成または更新

目録化した情報をカタログシステムに入力する。

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

**期待結果:** 各資料がシステム内にカタログレコードを持ち、すべての必須フィールドが入力されている。レコードは著者、タイトル、件名、請求記号で検索可能。

**失敗時:** 目録作成ソフトウェアが利用できない場合、上記のフィールドに一致する一貫した列見出しを持つ、構造化されたスプレッドシートが機能的なカタログとして代用できる。利用可能になった時に適切なソフトウェアに移行する。

### ステップ6: 実際の書架の整理

請求記号に従って資料を配置する。

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

**期待結果:** 資料が請求記号順に物理的に配置され、明確な背ラベルと増加余地がある。

**失敗時:** スペースが不十分な場合、アクセスしやすい棚には利用頻度の高い資料を優先し、利用頻度の低い資料は集密書架に移動し、カタログレコードの所在変更を記載する。

## バリデーション

- [ ] 分類システムが選択され文書化されている
- [ ] すべての資料について、タイトル、著者、出版データを含む記述目録が完了している
- [ ] 統制語彙から件名標目が付与されている（1資料あたり1〜3件）
- [ ] 各資料に一意の請求記号が付与されている
- [ ] システムまたはスプレッドシートにカタログレコードが作成されている
- [ ] 物理的な資料が背ラベル付きで請求記号順に配架されている
- [ ] 名前と件名の形式の一貫性のために典拠コントロールが確立されている

## よくある落とし穴

- **一貫性のない標目**: 「World War, 1939-1945」と「WWII」の両方を使用すると統制語彙の目的が失われる。1つの典拠を選んで徹底する
- **過度な分類**: 小規模な個人図書館に15桁のDDC番号を付与しても、利点なく複雑さが増すだけ。コレクション規模に合った粒度にする
- **コピーカタログの無視**: コピーレコードが存在するのにオリジナルレコードを作成するのは時間の無駄。まず共有データベースを確認する
- **背ラベルの放置**: 目録化された本に背ラベルがなければ配架ミスが起きる。目録化直後にラベルを貼る
- **増加余地なし**: 棚を100%の容量で詰めると、新規受入のたびに連鎖的な移動が必要になる。余白を残す

## 関連スキル

- `preserve-materials` -- 目録化された資料の状態を維持するための保存処理
- `curate-collection` -- 何を目録化するかを決定するコレクション構築の意思決定
- `manage-memory` -- 永続的な知識ストアの整理（物理的な目録作成のデジタル版）
