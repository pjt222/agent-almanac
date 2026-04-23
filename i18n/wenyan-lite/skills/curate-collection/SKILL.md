---
name: curate-collection
locale: wenyan-lite
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

# 館藏策展

經策略採購、系統剔除、用量分析、回應之讀者顧問以建、評、維圖書館藏。

## 適用時機

- 建含既定範圍與預算之新館藏
- 評既館藏之缺、冗、或陳舊材料
- 架擁擠而需系統剔除
- 用戶請館無之材料
- 欲立正式館藏發展政策

## 輸入

- **必要**：館藏範圍（主題區、讀者、格式）
- **必要**：預算（年採購預算或一次分配）
- **選擇性**：用量資料（流通統計、保留請求、ILL 請求）
- **選擇性**：社區或機構輪廓（人口、課程、研究區）
- **選擇性**：既館藏發展政策

## 步驟

### 步驟一：定館藏發展政策

立所有採購與剔除決定之引導文件。

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

**預期：** 書面政策引導一致、可辯護之採購與剔除決定。

**失敗時：** 若正式政策於小館藏覺過，寫一頁範圍聲明，涵使命、所採主題、基本擇準。即簡聲明亦防漂。

### 步驟二：評既館藏

決加或移前先明所有。

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

**預期：** 館藏之強、弱、缺、死重之明畫，以資料支。

**失敗時：** 若流通資料不可得（無自動系統），用架察：塵厚、擠塞、久不動之書示低用。館內用可以計留於桌上而非歸架之件估。

### 步驟三：策略採購

擇並購合缺、服用戶需之材料。

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

**預期：** 新採購系統填既辨之缺並應用戶需，守預算。

**失敗時：** 若預算嚴緊，優先用戶請（證需）於投機之購。以 ILL 補低需主題，而非購或不流通之材料。

### 步驟四：剔館藏（去登記）

移不再服館藏使命之材料。

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

**預期：** 館藏定期剔除，移出項與處置皆有明錄。餘館藏為時新、相關、狀況佳。

**失敗時：** 若剔除感情難（多館員然），憶：留誤導之醫學文比移之害。剔除為對用戶之護，非對書之不敬。

### 步驟五：提供讀者顧問與參考

連用戶於合其需之材料。

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

**預期：** 用戶尋所需，或於館藏或經 ILL，其回饋塑未來採購。

**失敗時：** 若 ILL 不可得（無館網），探開放存取源、數位圖書館（HathiTrust、Internet Archive、Project Gutenberg）、與近館互借協議。

## 驗證

- [ ] 館藏發展政策已書且核
- [ ] 館藏評已完，含量與質資料
- [ ] 缺已辨並優先採購
- [ ] 預算已分配於主題區與需類
- [ ] 採購工作流已立，含審源與供應商關係
- [ ] 剔除週期已排（年），含 CREW/MUSTIE 標準
- [ ] 用戶回饋迴圈已置（請求、ILL 資料、搜尋日誌）

## 常見陷阱

- **無政策而採**：無範圍聲明，館藏以積而長而非有意。皆加，無除，館藏成倉
- **畏剔除**：「萬一」皆留令有用之材料埋於死重。較小、策展之館藏服用戶勝過大而無別者
- **忽用量資料**：唯以專業判斷購略用戶實際所需。令流通與 ILL 資料驅動至少 30% 之採購決定
- **無替代預算**：新採購盡預算，磨損之熱門項永不替。留 10-15% 供替代
- **忽格式多樣**：非所有用戶皆讀印。有聲書、電子書、無障礙格式服不能或不偏好印之用戶

## 相關技能

- `catalog-collection` —— 新採之材需編目；移出之項需刪記
- `preserve-materials` —— 剔除時之狀況評辨需保存之項
- `review-research` —— 評資訊品質與評擇材料相通
