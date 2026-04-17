---
name: curate-collection
description: >
  収集、除籍（蔵書整理）、コレクション評価、読書相談、図書館間貸借の連携を通じて
  図書館コレクションを構築・維持する。選定基準、コレクション開発方針、除籍のための
  CREW/MUSTIEメソッド、利用分析、レスポンシブなコレクション管理をカバーする。
  定められた範囲と予算で新規コレクションを構築する時、既存コレクションのギャップや
  古い資料の評価時、書架が過密で体系的な除籍が必要な時、正式なコレクション開発方針の
  策定時に使用する。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: library-science
  complexity: intermediate
  language: natural
  tags: library-science, collection-development, weeding, acquisitions, reader-advisory, curation
  locale: ja
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# コレクションのキュレーション

戦略的な収集、体系的な除籍、利用分析、レスポンシブな読書相談を通じて図書館コレクションを構築・評価・維持する。

## 使用タイミング

- 定められた範囲と予算で新規コレクションを構築する時
- 既存コレクションのギャップ、重複、古い資料の評価が必要な時
- 書架が過密で体系的な除籍が必要な時
- 利用者がコレクションにない資料をリクエストする時
- 正式なコレクション開発方針を策定したい時

## 入力

- **必須**: コレクション範囲（主題分野、対象利用者、フォーマット）
- **必須**: 予算（年間収集予算または一括配分額）
- **任意**: 利用データ（貸出統計、予約リクエスト、ILLリクエスト）
- **任意**: コミュニティまたは機関プロファイル（人口統計、カリキュラム、研究分野）
- **任意**: 既存のコレクション開発方針

## 手順

### ステップ1: コレクション開発方針の策定

すべての収集・除籍判断を導く基本文書を策定する。

```
Collection Development Policy Template:

1. MISSION STATEMENT
   What is the collection for? Who does it serve?
   Example: "Support the undergraduate curriculum in the
   humanities and social sciences with current and
   foundational works."

2. SCOPE
   +-------------------+------------------------------------------+
   | Element           | Definition                               |
   +-------------------+------------------------------------------+
   | Subject areas     | List of disciplines collected             |
   | Depth levels      | Basic, instructional, research,           |
   |                   | comprehensive, exhaustive                |
   | Formats           | Print, ebook, audiobook, media, serial    |
   | Languages         | Primary and secondary languages           |
   | Chronological     | Current only, or retrospective            |
   | Geographic        | Any focus area or exclusion               |
   +-------------------+------------------------------------------+

3. SELECTION CRITERIA (in priority order)
   a. Relevance to mission and audience needs
   b. Authority and reputation of author/publisher
   c. Currency (publication date vs. field currency)
   d. Quality of content (reviews, awards, citations)
   e. Format suitability (print vs. digital)
   f. Cost relative to budget and expected use
   g. Representation: diversity of perspectives and voices

4. WEEDING GUIDELINES
   - Frequency: annual review cycle
   - Method: CREW/MUSTIE (see Step 4)
   - Disposition: sale, donation, recycling

5. REVIEW SCHEDULE
   - Policy reviewed and updated every 3 years
```

**期待結果:** 一貫性のある、根拠に基づいた収集・除籍判断を導く成文化された方針。

**失敗時:** 小規模コレクションにとって正式な方針が過剰に思える場合、ミッション、収集主題、基本的な選定基準を記載した1ページの範囲声明書を作成する。簡潔な声明書でも方針のぶれを防ぐ。

### ステップ2: 既存コレクションの評価

追加・除去の判断前に、所蔵状況を把握する。

```
Collection Assessment Methods:

1. QUANTITATIVE ANALYSIS
   - Total volumes by subject area (using call number ranges)
   - Age distribution: what percentage published in last 5, 10, 20 years?
   - Format breakdown: print vs. digital vs. media
   - Circulation data: items checked out in last 1, 3, 5 years
   - Holds-to-copies ratio: >3:1 = need more copies

2. QUALITATIVE ANALYSIS
   - Spot-check condition (see preserve-materials condition survey)
   - Check currency: are key reference works up to date?
   - Compare against standard bibliographies or peer collections
   - Identify gaps: subjects in scope but underrepresented

3. USAGE ANALYSIS
   +-------------------+------------------+-------------------------+
   | Metric            | What It Shows    | Action                  |
   +-------------------+------------------+-------------------------+
   | High circ, few    | Popular subject, | Buy more in this area   |
   | copies            | unmet demand     |                         |
   +-------------------+------------------+-------------------------+
   | Zero circ in      | Possible dead    | Evaluate for weeding    |
   | 5 years           | weight           |                         |
   +-------------------+------------------+-------------------------+
   | High ILL requests | Gap in own       | Acquire in this subject |
   | in a subject      | collection       |                         |
   +-------------------+------------------+-------------------------+
   | Many copies, low  | Over-purchased   | Weed duplicates         |
   | circ per copy     |                  |                         |
   +-------------------+------------------+-------------------------+

Collection Map: Create a grid of subjects vs. depth levels.
Mark each cell as: Strong, Adequate, Weak, or Not Collected.
This visual map reveals gaps and overlaps at a glance.
```

**期待結果:** データに裏付けられたコレクションの強み、弱み、ギャップ、不要資料の明確な全体像。

**失敗時:** 貸出データが利用できない場合（自動化システムがない場合）、書架の観察を使用する: 埃をかぶり、ぎっしり詰まった動いていない本は低利用を示す。館内利用は、再配架されずにテーブルに残された資料を数えることで推定できる。

### ステップ3: 戦略的な資料収集

ギャップを埋め、利用者ニーズに応える資料を選定・購入する。

```
Acquisition Workflow:
1. IDENTIFY needs from:
   - Collection assessment gaps
   - User requests and purchase suggestions
   - Curriculum changes or new research areas
   - Professional review sources (Choice, Kirkus, Booklist,
     Publishers Weekly, discipline-specific journals)
   - Bestseller and award lists

2. EVALUATE each candidate against selection criteria (Step 1)

3. DECIDE using the Selection Decision Matrix:
   +-------------+-------------+------------------+
   | Relevance   | Quality     | Decision         |
   +-------------+-------------+------------------+
   | High        | High        | Buy              |
   | High        | Low/Unknown | Consider; check  |
   |             |             | reviews first    |
   | Low         | High        | Skip unless      |
   |             |             | scope expanding  |
   | Low         | Low         | Do not buy       |
   +-------------+-------------+------------------+

4. ORDER through appropriate channel:
   - Vendor (Baker & Taylor, Ingram, GOBI for academic)
   - Publisher direct (for small press or specialized)
   - Standing orders/approval plans for ongoing series

5. RECEIVE AND PROCESS:
   - Verify against order (correct title, edition, condition)
   - Send to cataloging (see catalog-collection)
   - Notify requestor if user-suggested

Budget Allocation Rule of Thumb:
- 60-70% of budget: materials in core subject areas
- 15-20%: emerging areas and user requests
- 10-15%: replacement of worn/lost copies
- 5%: reserve for urgent or unexpected needs
```

**期待結果:** 新規収集が特定されたギャップを体系的に埋め、利用者需要に応える。予算内に収まる。

**失敗時:** 予算が著しく制約されている場合、利用者リクエスト（実証された需要）を投機的購入より優先する。低需要の主題は購入せずILLで補完する。

### ステップ4: コレクションの除籍（蔵書整理）

コレクションのミッションに合わなくなった資料を除去する。

```
CREW Method / MUSTIE Criteria:
Evaluate each candidate for weeding against these factors:

M - Misleading: factually inaccurate or obsolete information
    (medical texts >5 years, technology >3 years, legal >2 years)

U - Ugly: worn, damaged, or unattractive condition that
    discourages use (torn covers, heavy underlining, staining)

S - Superseded: replaced by a newer edition, or better
    coverage exists in another item in the collection

T - Trivial: of no discernible literary, scientific, or
    informational value; ephemeral interest has passed

I - Irrelevant: no longer within the collection's scope
    or the community's needs

E - Elsewhere: readily available through ILL, digital access,
    or other local collections; no need to duplicate

Weeding Decision Flowchart:
  Is the item misleading or dangerous? → YES → Withdraw
  Is it in poor physical condition? → YES →
    Can it be repaired? → YES → Repair → Keep
                        → NO → Is it still relevant? →
                          YES → Replace → Withdraw original
                          NO → Withdraw
  Has it circulated in the last 5 years? → NO →
    Is it a classic, reference, or historically significant? →
      YES → Keep (flag for preservation)
      NO → Withdraw

Disposition of Withdrawn Items:
1. Offer to other libraries or book sales
2. Donate to literacy programs or schools
3. Recycle (last resort — not landfill)
Never discard items with local historical significance
without institutional review.
```

**期待結果:** コレクションが定期的に除籍され、除去資料と処分方法の明確な記録がある。残りのコレクションが最新で、関連性があり、良好な状態にある。

**失敗時:** 除籍に感情的な抵抗がある場合（多くの図書館員にとってそうである）、次のことを思い出す: 誤った医学書を保持することは除去することより有害である。除籍は利用者へのケアの行為であり、本への不敬ではない。

### ステップ5: 読書相談とレファレンス

利用者をニーズに合った資料につなげる。

```
Reader Advisory Framework:

1. THE REFERENCE INTERVIEW
   - Start open: "What are you looking for?"
   - Clarify: "Is this for research, personal interest, or a class?"
   - Scope: "How much do you already know about this topic?"
   - Format: "Do you prefer books, articles, or other formats?"
   - Follow-up: "Did you find what you needed?"

2. READ-ALIKE RECOMMENDATIONS
   When a user says "I liked X, what else would I like?"
   - Match on appeal factors: pacing, tone, subject, style
   - Use databases: NoveList, Goodreads, LibraryThing
   - Build displays and reading lists by theme

3. INTERLIBRARY LOAN (ILL)
   When the collection doesn't have what the user needs:
   - Submit ILL request through OCLC WorldShare or regional system
   - Typical turnaround: 3-10 business days for books
   - Articles often available same-day via electronic delivery
   - Track ILL requests by subject — patterns reveal collection gaps

4. FEEDBACK LOOP
   - Record user requests (fulfilled and unfulfilled)
   - Track "not owned" search results from the catalog
   - Use this data to inform next acquisition cycle
   - Display new acquisitions prominently — users notice responsiveness
```

**期待結果:** 利用者がコレクション内またはILLを通じて必要なものを見つけ、そのフィードバックが将来の収集方針を形づくる。

**失敗時:** ILLが利用できない場合（図書館ネットワークがない場合）、オープンアクセスソース、電子図書館（HathiTrust、Internet Archive、Project Gutenberg）、近隣図書館との相互貸借協定を探索する。

## バリデーション

- [ ] コレクション開発方針が策定・承認されている
- [ ] 定量的・定性的データによるコレクション評価が完了している
- [ ] ギャップが特定され、収集の優先順位が付けられている
- [ ] 主題分野とニーズカテゴリにわたって予算が配分されている
- [ ] レビューソースとベンダー関係を含む収集ワークフローが確立されている
- [ ] CREW/MUSTIE基準による除籍サイクルがスケジュールされている（年次）
- [ ] 利用者フィードバックループが整備されている（リクエスト、ILLデータ、検索ログ）

## よくある落とし穴

- **方針なしの収集**: 範囲声明書がないと、コレクションは意図ではなく蓄積により成長する。すべてが追加され、何も除去されず、コレクションは倉庫になる
- **除籍への恐怖**: 「万が一のため」にすべてを保持すると、有用な資料が不要資料に埋もれる。小規模でキュレーションされたコレクションは、大規模で未整理のものより利用者に良く奉仕する
- **利用データの無視**: 専門的判断だけに基づく購入は利用者の実際のニーズを見逃す。貸出とILLデータで少なくとも収集判断の30%を駆動させる
- **交換用予算の不足**: 新規収集にすべての予算が使われ、摩耗した人気資料が交換されない。交換用に10〜15%を確保する
- **フォーマット多様性の軽視**: すべての利用者が印刷物を読むわけではない。オーディオブック、電子書籍、アクセシブルなフォーマットは、印刷物を読めない、または好まない利用者に奉仕する

## 関連スキル

- `catalog-collection` -- 新規収集資料は目録作成が必要。除籍資料はレコード削除が必要
- `preserve-materials` -- 除籍時の状態評価で保存が必要な資料を特定する
- `review-research` -- 情報品質の評価は資料選定の評価と並行する
