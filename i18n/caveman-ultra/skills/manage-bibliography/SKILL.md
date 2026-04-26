---
name: manage-bibliography
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Create, merge, deduplicate BibTeX bib files via R pkgs (RefManageR, bibtex).
  Parse .bib → structured R objects, merge multi bibs w/ dedup by DOI / title
  similarity, gen entries from DOI/ISBN/arXiv ID, export clean sorted .bib.
  Use creating new .bib for R Markdown / Quarto, merging bibs from multi
  collaborators, dedup .bib grown by copy-paste, gen entries from DOIs.
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

Create, merge, dedup BibTeX bib files via R. Full lifecycle: parse existing .bib → structured R, gen new entries from identifiers (DOI, ISBN, arXiv ID), merge multi bibs w/ intelligent dedup, export clean consistent .bib.

## Use When

- New .bib for R Markdown / Quarto project
- Merge bibs from multi collaborators / sources
- Dedup .bib grown by copy-paste accumulation
- Gen BibTeX entries programmatically from DOIs / identifiers
- Clean + standardize existing .bib (consistent keys, sorted fields)

## In

- **Req**: Path to ≥1 .bib files, or list of DOIs/ISBNs/arXiv IDs
- **Opt**: Output .bib path (default: `references.bib`)
- **Opt**: Dedup strategy (`doi`, `title`, `both`; default: `both`)
- **Opt**: Sort order (`author`, `year`, `key`; default: `key`)
- **Opt**: Key gen pattern (default: `AuthorYear`)

## Do

### Step 1: Install + Load Pkgs

```r
required_packages <- c("RefManageR", "bibtex", "stringdist")
missing <- required_packages[!vapply(required_packages, requireNamespace,
                                     logical(1), quietly = TRUE)]
if (length(missing) > 0) install.packages(missing)

library(RefManageR)
```

→ All pkgs load w/o errs.

**If err:** RefManageR fails → check `curl` + `xml2` sys libs avail. Ubuntu: `sudo apt install libcurl4-openssl-dev libxml2-dev`.

### Step 2: Parse Existing .bib

```r
bib <- RefManageR::ReadBib("references.bib", check = FALSE)
message(sprintf("Parsed %d entries from references.bib", length(bib)))

# Inspect structure
print(bib[1:3])

# Access fields programmatically
keys <- names(bib)
years <- vapply(bib, function(x) x$year %||% NA_character_, character(1))
```

→ `BibEntry` obj w/ all entries. Count matches `@article{`, `@book{`, etc blocks.

**If err:** Parse fails → check unmatched braces / invalid UTF-8. Fallback: `bibtex::read.bib()` w/ stricter parsing.

### Step 3: Gen Entries from Identifiers

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

→ BibEntry objs w/ complete metadata (title, author, journal, year, DOI) per resolved identifier.

**If err:** DOI resolution → CrossRef API. Failed → check connectivity + DOI valid. Rate limiting for large batches → `Sys.sleep(1)` between reqs.

### Step 4: Merge Multi Bibs

```r
bib1 <- RefManageR::ReadBib("project_a.bib", check = FALSE)
bib2 <- RefManageR::ReadBib("project_b.bib", check = FALSE)

# Simple merge
merged <- c(bib1, bib2)
message(sprintf("Merged: %d + %d = %d entries (before dedup)",
                length(bib1), length(bib2), length(merged)))
```

→ Combined BibEntry obj w/ entries from both files.

### Step 5: Dedup Entries

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

→ Dup entries removed. Count of removed dups printed.

**If err:** Title comparison too aggressive (removing non-dups) → raise threshold > 0.95 or switch `method = "doi"` only.

### Step 6: Sort + Export

```r
# Sort by citation key
sorted_bib <- sort(merged, sorting = "nyt")  # name-year-title

# Export to .bib file
RefManageR::WriteBib(sorted_bib, file = "references.bib", biblatex = FALSE)
message(sprintf("Wrote %d entries to references.bib", length(sorted_bib)))
```

→ Clean .bib on disk w/ consistent format, one entry per block, sorted alphabetically by key.

**If err:** WriteBib encoding issues → ensure R locale supports UTF-8: `Sys.setlocale("LC_ALL", "en_US.UTF-8")`.

## Check

- [ ] Output .bib parses w/o errs: `RefManageR::ReadBib("references.bib")`
- [ ] Entry count matches expectations (input - dups)
- [ ] No dup DOIs remain: all DOIs in output unique
- [ ] All entries have citation key
- [ ] Required fields per entry type (author, title, year min)
- [ ] File valid BibTeX (test w/ `bibtex::read.bib()`)

## Traps

- **Encoding issues**: Latin-1 accents break UTF-8 parsers. Convert first: `iconv -f ISO-8859-1 -t UTF-8 old.bib > new.bib`
- **Unmatched braces**: Single missing `}` silently drops entries. Validate balance before parsing large.
- **DOI rate limiting**: CrossRef throttles unauthenticated. Set polite email w/ `RefManageR::BibOptions(check.entries = FALSE)` + batch reqs.
- **Key collisions**: Merging files w/ dup keys (both have `Smith2020`) silently overwrites. Regen keys after merge.
- **LaTeX in titles**: Titles w/ `{DNA}` / `$\alpha$` need careful handling. RefManageR preserves but downstream may strip.

## →

- `format-citations` — format bib entries → styled citations
- `validate-references` — verify completeness + DOI resolution
- `../reporting/format-apa-report` — APA-formatted reports using bibs
- `../r-packages/write-vignette` — pkg vignettes citing refs
