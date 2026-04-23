---
name: curate-collection
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Build and maintain a library collection through acquisitions, weeding
  (deaccessioning), collection assessment, reader advisory, and interlibrary
  loan coordination. Covers selection criteria, collection development policies,
  the CREW/MUSTIE method for weeding, usage analysis, and responsive collection
  management. Use when building a new collection with a defined scope and budget,
  assessing an existing collection for gaps or outdated materials, when shelves
  are overcrowded and systematic weeding is needed, or when establishing a formal
  collection development policy.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: library-science
  complexity: intermediate
  language: natural
  tags: library-science, collection-development, weeding, acquisitions, reader-advisory, curation
---

# 策藏

以策購、除（解藏）、藏評、讀者導、館際借調築與守館藏。

## 用

- 築含定範與算之新藏
- 存藏需評以識缺、冗、陳
- 架滿而需系除
- 用求藏無之材
- 欲立正藏發策

## 入

- **必**：藏範（題域、眾、式）
- **必**：算（年購算或一時撥）
- **可**：用數（循計、掛求、ILL 求）
- **可**：社或機剖（人口、課、研域）
- **可**：存藏發策

## 行

### 一：定藏發策

立諸購與除決之導檔。

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

**得：** 書策導一致可辯之購與除決。

**敗：** 小藏正策過繁→書一頁範言含目、收題、基擇準。短言亦防漂。

### 二：評存藏

定加或去前知有何。

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

**得：** 藏強、弱、缺、死重之明圖、含數支持。

**敗：** 循數不可用（無自系）→用架察：塵密未動之書示低用。館內用可估為留桌上而非復架之項。

### 三：策購材

擇且購填缺並服用需之材。

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

**得：** 新購系填識缺、應用需、於算內。

**敗：** 算嚴限→優先用求（證需）勝推測購。低需域以 ILL 補而非購或不循者。

### 四：除藏（解藏）

去不再服藏目之材。

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

**得：** 藏常除、含去項與處之明備。餘藏現、關、狀佳。

**敗：** 除感情難（多館員皆然）→記：留誤醫文害勝去之。除為護用之行、非對書之不敬。

### 五：讀者導與參

聯用於合其需之材。

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

**得：** 用尋所需、或於藏中或經 ILL、而其回形後購。

**敗：** ILL 不可用（無館網）→探公開源、數庫（HathiTrust、Internet Archive、Project Gutenberg）、鄰館互借約。

## 驗

- [ ] 藏發策書且承
- [ ] 藏評含量與質數畢
- [ ] 缺識且優先為購
- [ ] 算撥跨題域與需類
- [ ] 購流立含評源與商關
- [ ] 除周定（年）含 CREW/MUSTIE 準
- [ ] 用回環立（求、ILL 數、搜誌）

## 忌

- **購無策**：無範言、藏以積長而非意。諸皆加、諸不去、藏為庫
- **懼除**：「備而不用」留諸者藏有用材於死重下。小策藏勝大無別
- **忽用數**：純按專判購錯用實需。至少 30% 購決由循與 ILL 數驅
- **無換算**：新購得諸算、舊熱項不換。留 10-15% 為換
- **略式多**：非諸用讀印。音書、電書、易達式服不能或不願讀印者

## 參

- `catalog-collection` — 新購材需編、去項需錄刪
- `preserve-materials` — 除中態評識需保之項
- `review-research` — 評信質與評購材相映
