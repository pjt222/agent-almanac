---
name: catalog-collection
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

Catalog and classify library or archival materials using standard classification systems and descriptive cataloging practices.

## When to Use

- You are organizing a personal, institutional, or community library from scratch
- You need to assign call numbers and subject headings to new acquisitions
- You want to create consistent catalog records for findability
- You are reclassifying a collection that has outgrown its original system
- You need to establish authority control for authors, series, or subjects

## Inputs

- **Required**: Materials to catalog (books, serials, media, archival items)
- **Required**: Chosen classification system (Dewey Decimal or Library of Congress)
- **Optional**: Existing catalog or inventory to integrate with
- **Optional**: Subject heading authority (LCSH, Sears, or custom thesaurus)
- **Optional**: MARC-compatible cataloging software (Koha, Evergreen, LibraryThing)

## Procedure

### Step 1: Choose the Classification System

Select a system that matches the collection's size, scope, and audience.

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

**Expected:** A classification system chosen that fits the collection's scale and purpose.

**On failure:** If neither system fits (e.g., a highly specialized archive), consider a faceted classification or custom scheme, but document the mapping to DDC or LCC for interoperability.

### Step 2: Perform Descriptive Cataloging

Create a bibliographic description for each item following standard practice.

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

**Expected:** A consistent bibliographic record for each item with enough detail for unique identification and discovery.

**On failure:** If publication information is missing (common in older or self-published works), use square brackets to indicate supplied information: `[ca. 1920]`, `[s.l.]` (no place), `[s.n.]` (no publisher).

### Step 3: Assign Subject Headings

Apply controlled vocabulary terms so users can find materials by topic.

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

**Expected:** Each item has 1-3 subject headings from a controlled vocabulary, applied consistently across the collection.

**On failure:** If no suitable heading exists in your authority, create a local heading and document it in a local authority file. Review periodically for alignment with the main authority.

### Step 4: Assign Call Numbers

Build the shelf address using the chosen classification system.

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

**Expected:** Every cataloged item has a unique call number that determines its shelf position.

**On failure:** If two items generate the same call number, add a work mark (first letter of title, excluding articles) or a copy number to disambiguate.

### Step 5: Create or Update Catalog Records

Enter the cataloged information into your catalog system.

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

**Expected:** Each item has a catalog record in the system with all required fields populated. Records are searchable by author, title, subject, and call number.

**On failure:** If cataloging software is unavailable, a well-structured spreadsheet (with consistent column headings matching the fields above) serves as a functional catalog. Migrate to proper software when available.

### Step 6: Organize the Physical Shelf

Arrange materials according to their call numbers.

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

**Expected:** Materials are physically arranged in call number order with clear spine labels and growth space.

**On failure:** If space is insufficient, prioritize high-circulation items on accessible shelves and move low-use items to compact storage, noting the location change in catalog records.

## Validation

- [ ] Classification system chosen and documented
- [ ] Descriptive cataloging completed for all items with title, author, and publication data
- [ ] Subject headings assigned from a controlled vocabulary (1-3 per item)
- [ ] Call numbers assigned and unique for each item
- [ ] Catalog records created in system or spreadsheet
- [ ] Physical materials shelved in call number order with spine labels
- [ ] Authority control established for consistent name and subject forms

## Common Pitfalls

- **Inconsistent headings**: Using both "World War, 1939-1945" and "WWII" defeats the purpose of controlled vocabulary. Pick one authority and stick to it
- **Over-classification**: Assigning a 15-digit DDC number to a small personal library adds complexity without benefit. Match granularity to collection size
- **Ignoring copy cataloging**: Creating original records when copy records exist wastes time. Always check shared databases first
- **Spine label neglect**: A cataloged book without a spine label will be misshelved. Label immediately after cataloging
- **No growth space**: Packing shelves to 100% capacity means every new acquisition triggers a chain of shifting. Leave room

## Related Skills

- `preserve-materials` — Conservation of cataloged materials to maintain their condition
- `curate-collection` — Collection development decisions that determine what gets cataloged
- `manage-memory` — Organizing persistent knowledge stores (digital parallel to physical cataloging)
