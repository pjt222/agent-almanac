---
name: curate-collection
locale: caveman-ultra
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

# Curate Collection

Library collection: acquisitions + weeding + assessment + reader advisory.

## Use When

- New collection w/ scope + budget
- Existing → assess for gaps/outdated
- Overcrowded → systematic weeding
- Users req materials not held
- Formal dev policy

## In

- **Required**: Scope (subjects, audience, formats)
- **Required**: Budget (annual / one-time)
- **Optional**: Usage data (circ, holds, ILL)
- **Optional**: Community / institutional profile
- **Optional**: Existing dev policy

## Do

### Step 1: Dev Policy

Guiding doc for all acquisition + weeding.

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

**Got:** Written policy → consistent defensible decisions.

**If err:** Formal policy excessive for small → 1-page scope stmt (mission + subjects + basic criteria). Even brief prevents drift.

### Step 2: Assess Existing

Know what you have before add/remove.

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

**Got:** Clear picture of strengths + weaknesses + gaps + deadweight, data-backed.

**If err:** No circ data → shelf observation: dusty tightly-packed = low use. In-library use = count items on tables (not reshelved).

### Step 3: Acquire Strategically

Select + purchase → fill gaps + serve needs.

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

**Got:** New acquisitions fill gaps + respond to demand, on budget.

**If err:** Budget constrained → prioritize user reqs (proven demand) over speculative. Supplement ILL for low-demand.

### Step 4: Weed (Deaccession)

Remove materials no longer serving mission.

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

**Got:** Regular weeding + docs. Remaining = current + relevant + good condition.

**If err:** Weeding emotionally hard (common) → keeping misleading medical text more harmful than removing. Weed = care for user, not disrespect.

### Step 5: Reader Advisory + Reference

Connect users → materials matching needs.

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

**Got:** Users find needs (in collection or via ILL), feedback shapes future acquisitions.

**If err:** No ILL → open access (HathiTrust, Internet Archive, Project Gutenberg), reciprocal borrowing w/ nearby.

## Check

- [ ] Policy written + approved
- [ ] Assessment done (quant + qual)
- [ ] Gaps ID'd + prioritized
- [ ] Budget allocated across subjects + needs
- [ ] Acquisition workflow w/ review sources + vendors
- [ ] Weeding cycle scheduled (annual) + CREW/MUSTIE
- [ ] User feedback loop (reqs, ILL, search logs)

## Traps

- **No policy**: Accumulation not intention. Everything added, nothing removed → warehouse.
- **Fear of weeding**: "Just in case" buries useful under deadweight. Smaller curated > large undifferentiated.
- **Ignore usage data**: Judgment-only misses actual needs. Let circ + ILL drive ≥30% acquisition.
- **No replacement budget**: All to new → worn popular never replaced. Reserve 10-15%.
- **Format diversity**: Not all read print. Audiobooks, ebooks, accessible serve users who can't/won't.

## →

- `catalog-collection` — new materials → cataloging; withdrawn → record deletion
- `preserve-materials` — condition assessment during weeding → preservation
- `review-research` — evaluating info quality parallels evaluating materials for selection
