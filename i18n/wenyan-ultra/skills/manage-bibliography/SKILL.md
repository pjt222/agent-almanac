---
name: manage-bibliography
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create, merge, and deduplicate BibTeX bibliography files using R packages
  (RefManageR, bibtex). Parse .bib files into structured R objects, merge
  multiple bibliographies with deduplication by DOI or title similarity,
  generate entries from DOI/ISBN/arXiv ID, and export clean sorted .bib files.
  Use when creating a new .bib file for an R Markdown or Quarto project,
  merging bibliographies from multiple collaborators, deduplicating a .bib
  that has grown through copy-paste accumulation, or generating BibTeX entries
  programmatically from DOIs or other identifiers.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: citations
  complexity: intermediate
  language: R
  tags: citations, bibliography, bibtex, R, RefManageR
---

# Manage Bibliography

Create, merge, and deduplicate BibTeX bibliography files using R. This skill
covers the full lifecycle of bibliography management: parsing existing .bib
files into structured R objects, generating new entries from identifiers (DOI,
ISBN, arXiv ID), merging multiple bibliographies with intelligent deduplication,
and exporting clean, consistently formatted .bib output.

## When to Use

- Creating a new .bib file for an R Markdown or Quarto project
- Merging bibliographies from multiple collaborators or sources
- Deduplicating a .bib file that has grown through copy-paste accumulation
- Generating BibTeX entries programmatically from DOIs or other identifiers
- Cleaning and standardizing an existing .bib file (consistent keys, sorted fields)

## Inputs

- **Required**: Path to one or more .bib files, or a list of DOIs/ISBNs/arXiv IDs
- **Optional**: Output .bib file path (default: `references.bib`)
- **Optional**: Deduplication strategy (`doi`, `title`, `both`; default: `both`)
- **Optional**: Sort order (`author`, `year`, `key`; default: `key`)
- **Optional**: Key generation pattern (default: `AuthorYear`)

## Procedure

### Step 1: Install and Load Required Packages

```r
required_packages <- c("RefManageR", "bibtex", "stringdist")
missing <- required_packages[!vapply(required_packages, requireNamespace,
                                     logical(1), quietly = TRUE)]
if (length(missing) > 0) install.packages(missing)

library(RefManageR)
```

**Expected:** All packages load without errors.

**On failure:** If RefManageR fails to install, check that `curl` and `xml2` system
libraries are available. On Ubuntu: `sudo apt install libcurl4-openssl-dev libxml2-dev`.

### Step 2: Parse Existing .bib Files

```r
bib <- RefManageR::ReadBib("references.bib", check = FALSE)
message(sprintf("Parsed %d entries from references.bib", length(bib)))

# Inspect structure
print(bib[1:3])

# Access fields programmatically
keys <- names(bib)
years <- vapply(bib, function(x) x$year %||% NA_character_, character(1))
```

**Expected:** A `BibEntry` object containing all entries from the file. Entry count
matches the number of `@article{`, `@book{`, etc. blocks in the file.

**On failure:** If parsing fails, check for unmatched braces or invalid UTF-8 in the
.bib file. Run `bibtex::read.bib()` as a fallback with stricter parsing.

### Step 3: Generate Entries from Identifiers

```r
# From DOI
entry_doi <- RefManageR::GetBibEntryWithDOI("10.1093/bioinformatics/btz848")

# From a vector of DOIs
dois <- c("10.1093/bioinformatics/btz848", "10.1038/s41586-020-2649-2")
entries <- do.call(c, lapply(dois, function(d) {
  tryCatch(
    RefManageR::GetBibEntryWithDOI(d),
    error = function(e) {
      warning(sprintf("Failed to fetch DOI %s: %s", d, e$message))
      NULL
    }
  )
}))
entries <- Filter(Negate(is.null), entries)
```

**Expected:** BibEntry objects with complete metadata (title, author, journal, year,
DOI) for each successfully resolved identifier.

**On failure:** DOI resolution depends on the CrossRef API. If requests fail, check
network connectivity and whether the DOI is valid. Rate limiting may apply for
large batches; add `Sys.sleep(1)` between requests.

### Step 4: Merge Multiple Bibliographies

```r
bib1 <- RefManageR::ReadBib("project_a.bib", check = FALSE)
bib2 <- RefManageR::ReadBib("project_b.bib", check = FALSE)

# Simple merge
merged <- c(bib1, bib2)
message(sprintf("Merged: %d + %d = %d entries (before dedup)",
                length(bib1), length(bib2), length(merged)))
```

**Expected:** A combined BibEntry object containing entries from both files.

### Step 5: Deduplicate Entries

```r
deduplicate_bib <- function(bib, method = "both") {
  n_before <- length(bib)
  keys_to_remove <- c()

  for (i in seq_along(bib)) {
    if (names(bib)[i] %in% keys_to_remove) next
    for (j in seq(i + 1, length(bib))) {
      if (j > length(bib)) break
      if (names(bib)[j] %in% keys_to_remove) next

      is_dup <- FALSE
      if (method %in% c("doi", "both")) {
        doi_i <- bib[[i]]$doi %||% ""
        doi_j <- bib[[j]]$doi %||% ""
        if (nzchar(doi_i) && nzchar(doi_j) && tolower(doi_i) == tolower(doi_j)) {
          is_dup <- TRUE
        }
      }
      if (!is_dup && method %in% c("title", "both")) {
        title_i <- tolower(gsub("[^a-z0-9 ]", "", tolower(bib[[i]]$title %||% "")))
        title_j <- tolower(gsub("[^a-z0-9 ]", "", tolower(bib[[j]]$title %||% "")))
        if (nzchar(title_i) && nzchar(title_j)) {
          sim <- 1 - stringdist::stringdist(title_i, title_j, method = "jw")
          if (sim > 0.95) is_dup <- TRUE
        }
      }
      if (is_dup) keys_to_remove <- c(keys_to_remove, names(bib)[j])
    }
  }

  if (length(keys_to_remove) > 0) {
    bib <- bib[!names(bib) %in% keys_to_remove]
  }
  message(sprintf("Deduplication: %d -> %d entries (%d duplicates removed)",
                  n_before, length(bib), n_before - length(bib)))
  bib
}

merged <- deduplicate_bib(merged, method = "both")
```

**Expected:** Duplicate entries removed. Count of removed duplicates printed.

**On failure:** If title comparison is too aggressive (removing non-duplicates), raise
the similarity threshold above 0.95 or switch to `method = "doi"` only.

### Step 6: Sort and Export

```r
# Sort by citation key
sorted_bib <- sort(merged, sorting = "nyt")  # name-year-title

# Export to .bib file
RefManageR::WriteBib(sorted_bib, file = "references.bib", biblatex = FALSE)
message(sprintf("Wrote %d entries to references.bib", length(sorted_bib)))
```

**Expected:** A clean .bib file written to disk with consistent formatting, one entry
per block, sorted alphabetically by citation key.

**On failure:** If WriteBib produces encoding issues, ensure the R session locale
supports UTF-8: `Sys.setlocale("LC_ALL", "en_US.UTF-8")`.

## Validation

- [ ] Output .bib file parses without errors: `RefManageR::ReadBib("references.bib")`
- [ ] Entry count matches expectations (input count minus duplicates)
- [ ] No duplicate DOIs remain: all DOIs in output are unique
- [ ] All entries have a citation key
- [ ] Required fields present per entry type (author, title, year at minimum)
- [ ] File is valid BibTeX (test with `bibtex::read.bib()`)

## Common Pitfalls

- **Encoding issues**: .bib files with Latin-1 accents break UTF-8 parsers. Convert
  encoding first: `iconv -f ISO-8859-1 -t UTF-8 old.bib > new.bib`
- **Unmatched braces**: A single missing `}` silently drops entries. Validate brace
  balance before parsing large files
- **DOI rate limiting**: CrossRef throttles unauthenticated requests. Set a polite
  email with `RefManageR::BibOptions(check.entries = FALSE)` and batch requests
- **Key collisions**: Merging files with duplicate keys (e.g., both have `Smith2020`)
  silently overwrites. Regenerate keys after merging
- **LaTeX in titles**: Titles with `{DNA}` or `$\alpha$` need careful handling;
  RefManageR preserves these but downstream tools may strip them

## Related Skills

- `format-citations` - format the bibliography entries into styled citations
- `validate-references` - verify completeness and DOI resolution of .bib entries
- `../reporting/format-apa-report` - generate APA-formatted reports using bibliographies
- `../r-packages/write-vignette` - create package vignettes that cite references
