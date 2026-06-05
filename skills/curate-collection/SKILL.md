---
name: curate-collection
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

Build, assess, and maintain a library collection through strategic acquisitions, systematic weeding, usage analysis, and responsive reader advisory.

## When to Use

- You are building a new collection with a defined scope and budget
- An existing collection needs assessment for gaps, redundancies, or outdated materials
- Shelves are overcrowded and systematic weeding is needed
- Users request materials the collection does not hold
- You want to establish a formal collection development policy

## Inputs

- **Required**: Collection scope (subject areas, audience, formats)
- **Required**: Budget (annual acquisitions budget or one-time allocation)
- **Optional**: Usage data (circulation statistics, hold requests, ILL requests)
- **Optional**: Community or institutional profile (demographics, curriculum, research areas)
- **Optional**: Existing collection development policy

## Procedure

### Step 1: Define the Collection Development Policy

Establish the guiding document for all acquisition and weeding decisions.

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

**Expected:** A written policy that guides consistent, defensible acquisition and weeding decisions.

**On failure:** If a formal policy seems excessive for a small collection, write a one-page scope statement covering mission, subjects collected, and basic selection criteria. Even a brief statement prevents drift.

### Step 2: Assess the Existing Collection

Understand what you have before deciding what to add or remove.

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

**Expected:** A clear picture of the collection's strengths, weaknesses, gaps, and deadweight, supported by data.

**On failure:** If circulation data is unavailable (no automated system), use shelf observation: dusty, tightly packed books that haven't moved indicate low use. In-library use can be estimated by counting items left on tables rather than reshelved.

### Step 3: Acquire Materials Strategically

Select and purchase materials that fill gaps and serve user needs.

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

**Expected:** New acquisitions systematically fill identified gaps and respond to user demand, within budget.

**On failure:** If budget is severely constrained, prioritize user requests (proven demand) over speculative purchases. Supplement with ILL for low-demand subjects rather than buying materials that may not circulate.

### Step 4: Weed the Collection (Deaccessioning)

Remove materials that no longer serve the collection's mission.

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

**Expected:** Collection is regularly weeded, with clear documentation of withdrawn items and disposition. The remaining collection is current, relevant, and in good condition.

**On failure:** If weeding feels emotionally difficult (it does for many librarians), remember: keeping a misleading medical text is more harmful than removing it. Weeding is an act of care for the user, not disrespect for the book.

### Step 5: Provide Reader Advisory and Reference

Connect users with materials that meet their needs.

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

**Expected:** Users find what they need, either in the collection or through ILL, and their feedback shapes future acquisitions.

**On failure:** If ILL is not available (no library network), explore open access sources, digital libraries (HathiTrust, Internet Archive, Project Gutenberg), and reciprocal borrowing agreements with nearby libraries.

## Validation

- [ ] Collection development policy written and approved
- [ ] Collection assessment completed with quantitative and qualitative data
- [ ] Gaps identified and prioritized for acquisition
- [ ] Budget allocated across subject areas and need categories
- [ ] Acquisition workflow established with review sources and vendor relationships
- [ ] Weeding cycle scheduled (annual) with CREW/MUSTIE criteria
- [ ] User feedback loop in place (requests, ILL data, search logs)

## Common Pitfalls

- **Collecting without a policy**: Without a scope statement, collections grow by accumulation rather than intention. Everything gets added, nothing gets removed, and the collection becomes a warehouse
- **Fear of weeding**: Keeping everything "just in case" buries useful materials under deadweight. A smaller, curated collection serves users better than a large, undifferentiated one
- **Ignoring usage data**: Buying based on professional judgment alone misses what users actually need. Let circulation and ILL data drive at least 30% of acquisition decisions
- **No budget for replacement**: New acquisitions get all the budget, and worn-out popular items never get replaced. Reserve 10-15% for replacements
- **Neglecting format diversity**: Not all users read print. Audiobooks, ebooks, and accessible formats serve users who can't or prefer not to read print

## Related Skills

- `catalog-collection` — Newly acquired materials need cataloging; withdrawn items need record deletion
- `preserve-materials` — Condition assessment during weeding identifies items needing preservation
- `review-research` — Evaluating information quality parallels evaluating materials for selection
