---
name: curate-collection
locale: wenyan
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

# 擇藏

以策取、系除、用析、應讀導建、察、守圖書藏。

## 用時

- 建有範有預之新藏
- 察現藏之缺、冗、陳
- 架擠需系除
- 用者請藏所無者
- 欲立正式藏策

## 入

- **必要**：藏範（題域、聽、式）
- **必要**：預（年取預或一次之撥）
- **可選**：用資（借出統、保留請、ILL 請）
- **可選**：社或機之概（人口、課、研）
- **可選**：現藏策

## 法

### 第一步：定藏策

立指取除決之文。

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

**得：** 書策指一致可辯之取除決。

**敗則：** 若正式策似過於小藏，書一頁範聲含志、所藏題、基本擇準。雖短聲防漂。

### 第二步：察現藏

擇增去前先知所有。

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

**得：** 清察藏之強、弱、缺、死重，有資支。

**敗則：** 若借出資不可得（無自動系），以架察：塵封密排之書未動示用低。館內用可計留桌而非復架者。

### 第三步：策取

擇而購合缺與用需之物。

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

**得：** 新取系填識之缺而應用需，於預內。

**敗則：** 若預限甚，先用者請（既證之需）後推測之購。ILL 補低需題勝於購可能不借之物。

### 第四步：除藏

去不再服藏志之物。

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

**得：** 藏有系除，撤物與處有清文。餘藏當、相關、況佳。

**敗則：** 若除感情難（多圖書員然），記：留誤之醫文害甚於除之。除乃為用者之護，非輕書。

### 第五步：供讀導與參

聯用者於合需之物。

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

**得：** 用者得所需，或於藏或由 ILL，其饋塑後取。

**敗則：** 若 ILL 不可得（無圖書網），探開放源、數字圖書館（HathiTrust、Internet Archive、Project Gutenberg）、近館之互借約。

## 驗

- [ ] 藏策已書已准
- [ ] 藏察以量質數畢
- [ ] 缺已識而排優先以取
- [ ] 預已分於題域與需類
- [ ] 取流立含審源與供商關
- [ ] 除周期排（年）含 CREW/MUSTIE 準
- [ ] 用饋環位（請、ILL 資、搜誌）

## 陷

- **無策而藏**：無範聲，藏由積而長非意圖。皆加皆不去，藏成庫
- **畏除**：「以備」留一切則埋用物於死重。小擇之藏勝大無別之藏
- **忽用資**：唯憑專判購失用者實需。令借與 ILL 資驅至少 30% 取決
- **無替預**：新取奪諸預，舊用物永不替。留 10-15% 於替
- **忽式多樣**：非皆讀印。音、電、可達式服不能或不喜印者

## 參

- `catalog-collection` — 新取之物需編目；撤物需記錄刪
- `preserve-materials` — 除時之況察識需護之物
- `review-research` — 估信質類估物以擇
