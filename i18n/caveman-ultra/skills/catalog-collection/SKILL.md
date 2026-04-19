---
name: catalog-collection
locale: caveman-ultra
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

Catalog + classify library/archival materials via standard classification systems + descriptive cataloging.

## Use When

- Organize personal/institutional/community library from scratch
- Assign call numbers + subject headings to new acquisitions
- Create consistent catalog records for findability
- Reclassify collection outgrown orig system
- Establish authority control for authors, series, subjects

## In

- **Required**: Materials to catalog (books, serials, media, archival)
- **Required**: Classification system (Dewey Decimal or LoC)
- **Optional**: Existing catalog/inventory to integrate
- **Optional**: Subject heading authority (LCSH, Sears, custom thesaurus)
- **Optional**: MARC-compatible cataloging sw (Koha, Evergreen, LibraryThing)

## Do

### Step 1: Pick Classification System

Match collection size, scope, audience.

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

**→** System chosen fits scale + purpose.

**If err:** Neither fits (highly specialized archive) → faceted classification or custom, but document mapping to DDC/LCC for interoperability.

### Step 2: Descriptive Cataloging

Bibliographic description per item.

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

**→** Consistent bibliographic record per item, enough detail for unique ID + discovery.

**If err:** Pub info missing (older/self-published) → sq brackets for supplied info: `[ca. 1920]`, `[s.l.]` (no place), `[s.n.]` (no publisher).

### Step 3: Subject Headings

Controlled vocab terms → users find by topic.

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

**→** Each item 1-3 subject headings from controlled vocab, applied consistently.

**If err:** No suitable heading in authority → create local + document in local authority file. Review periodically for alignment w/ main.

### Step 4: Call Numbers

Shelf address via chosen system.

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

**→** Every item has unique call number determining shelf pos.

**If err:** Two items same call number → add work mark (first letter of title, excluding articles) or copy number to disambiguate.

### Step 5: Create/Update Catalog Records

Enter info into catalog system.

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

**→** Each item has record w/ all req fields. Searchable by author, title, subject, call number.

**If err:** Cataloging sw unavailable → well-structured spreadsheet (consistent col headings matching fields above) serves as functional catalog. Migrate to proper sw when available.

### Step 6: Physical Shelf

Arrange by call numbers.

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

**→** Materials physically arranged in call number order w/ clear spine labels + growth space.

**If err:** Space insufficient → prioritize high-circ on accessible shelves, move low-use to compact storage, note loc change in records.

## Check

- [ ] Classification system chosen + documented
- [ ] Descriptive cataloging done for all items w/ title, author, pub data
- [ ] Subject headings from controlled vocab (1-3 per item)
- [ ] Call numbers assigned + unique per item
- [ ] Records created in system or spreadsheet
- [ ] Physical materials shelved in call number order w/ spine labels
- [ ] Authority control for consistent name + subject forms

## Traps

- **Inconsistent headings**: "World War, 1939-1945" + "WWII" defeats controlled vocab. Pick one authority, stick
- **Over-classification**: 15-digit DDC for small personal library = complexity w/o benefit. Match granularity to size
- **Ignore copy cataloging**: Create originals when copies exist = waste. Always check shared DBs first
- **Spine label neglect**: Cataloged book w/o spine label → misshelved. Label immediately after cataloging
- **No growth space**: Pack shelves 100% → every new acquisition = chain of shifting. Leave room

## →

- `preserve-materials` — conservation of cataloged materials
- `curate-collection` — collection development decisions
- `manage-memory` — organizing persistent knowledge stores (digital parallel)
