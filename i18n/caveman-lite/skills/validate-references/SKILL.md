---
name: validate-references
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Check BibTeX entries for completeness, DOI resolution, and broken links.
  Verify required fields per entry type (article, book, inproceedings), resolve
  and validate DOIs via the CrossRef API, check URL accessibility, and flag
  duplicate entries, missing abstracts, and inconsistent formatting. Use when
  preparing a manuscript bibliography for journal submission, auditing a shared
  .bib file before a project milestone, after merging bibliographies from
  multiple sources, when citations render incorrectly, or as a CI check on
  version-controlled .bib files.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: citations
  complexity: intermediate
  language: R
  tags: citations, validation, doi, bibtex, quality
---

# Validate References

Check BibTeX bibliography entries for completeness, accuracy, and consistency.
This skill covers verifying required fields per entry type, resolving DOIs via
the CrossRef API, checking URL accessibility, detecting duplicate entries, and
producing a structured validation report that flags issues by severity. It
ensures that .bib files are publication-ready before rendering.

## When to Use

- Preparing a manuscript bibliography for journal submission
- Auditing a shared .bib file for quality before a project milestone
- After merging bibliographies from multiple sources
- When citations render incorrectly and you need to diagnose .bib issues
- As a CI check on .bib files in version-controlled projects

## Inputs

- **Required**: Path to a .bib file
- **Optional**: Validation level (`basic`, `standard`, `strict`; default: `standard`)
- **Optional**: Whether to check DOI resolution online (default: `TRUE`)
- **Optional**: Whether to check URL accessibility (default: `TRUE`)
- **Optional**: Output report path (default: prints to console)
- **Optional**: CrossRef API email for polite pool (recommended for large files)

## Procedure

### Step 1: Install and Load Required Packages

```r
required_packages <- c("RefManageR", "httr2", "curl")
missing <- required_packages[!vapply(required_packages, requireNamespace,
                                     logical(1), quietly = TRUE)]
if (length(missing) > 0) install.packages(missing)

library(RefManageR)
```

**Got:** All packages load without errors.

**If fail:** If httr2 is unavailable, install it with `install.packages("httr2")`.
For systems without curl headers: `sudo apt install libcurl4-openssl-dev`.

### Step 2: Parse and Inventory the Bibliography

```r
bib <- RefManageR::ReadBib("references.bib", check = FALSE)
message(sprintf("Loaded %d entries from references.bib", length(bib)))

# Inventory entry types
entry_types <- vapply(bib, function(x) tolower(attr(x, "bibtype")), character(1))
type_counts <- sort(table(entry_types), decreasing = TRUE)
message("Entry types:")
for (type in names(type_counts)) {
  message(sprintf("  %s: %d", type, type_counts[[type]]))
}
```

**Got:** Summary of entry types (article, book, inproceedings, etc.) and total
count matching the number of `@type{` blocks in the file.

**If fail:** Parsing errors indicate malformed BibTeX. Check for unmatched braces,
missing commas between fields, or invalid UTF-8 characters.

### Step 3: Validate Required Fields per Entry Type

```r
# BibTeX required fields by entry type
required_fields <- list(
  article       = c("author", "title", "journal", "year"),
  book          = c("author", "title", "publisher", "year"),
  inproceedings = c("author", "title", "booktitle", "year"),
  incollection  = c("author", "title", "booktitle", "publisher", "year"),
  phdthesis     = c("author", "title", "school", "year"),
  mastersthesis = c("author", "title", "school", "year"),
  techreport    = c("author", "title", "institution", "year"),
  misc          = c("author", "title", "year"),
  unpublished   = c("author", "title", "note")
)

validate_fields <- function(bib) {
  issues <- list()
  for (i in seq_along(bib)) {
    key <- names(bib)[i]
    entry_type <- tolower(attr(bib[[i]], "bibtype"))
    req <- required_fields[[entry_type]]
    if (is.null(req)) {
      issues[[length(issues) + 1]] <- list(
        key = key, severity = "warning",
        message = sprintf("Unknown entry type: %s", entry_type)
      )
      next
    }
    for (field in req) {
      value <- bib[[i]][[field]]
      if (is.null(value) || !nzchar(trimws(as.character(value)))) {
        issues[[length(issues) + 1]] <- list(
          key = key, severity = "error",
          message = sprintf("Missing required field: %s (type: %s)", field, entry_type)
        )
      }
    }
  }
  issues
}

field_issues <- validate_fields(bib)
message(sprintf("Field validation: %d issues found", length(field_issues)))
```

**Got:** A list of issues where required fields are missing. Zero issues for a
well-maintained bibliography.

**If fail:** This step runs locally and should not fail. If it does, check that the
.bib file parsed correctly in Step 2.

### Step 4: Resolve and Validate DOIs

```r
validate_dois <- function(bib, email = NULL) {
  issues <- list()

  # Set polite API headers
  headers <- list(`User-Agent` = "R-bibliography-validator/1.0")
  if (!is.null(email)) {
    headers[["mailto"]] <- email
  }

  for (i in seq_along(bib)) {
    key <- names(bib)[i]
    doi <- bib[[i]]$doi
    if (is.null(doi) || !nzchar(doi)) {
      issues[[length(issues) + 1]] <- list(
        key = key, severity = "info",
        message = "No DOI present"
      )
      next
    }

    # Normalize DOI
    doi <- gsub("^https?://doi\\.org/", "", doi)
    doi <- gsub("^doi:", "", doi, ignore.case = TRUE)
    doi <- trimws(doi)

    # Resolve via CrossRef
    tryCatch({
      resp <- httr2::request(sprintf("https://api.crossref.org/works/%s", doi)) |>
        httr2::req_headers(!!!headers) |>
        httr2::req_timeout(10) |>
        httr2::req_perform()

      if (httr2::resp_status(resp) != 200) {
        issues[[length(issues) + 1]] <- list(
          key = key, severity = "error",
          message = sprintf("DOI does not resolve: %s (HTTP %d)", doi,
                            httr2::resp_status(resp))
        )
      }
    }, error = function(e) {
      issues[[length(issues) + 1]] <<- list(
        key = key, severity = "warning",
        message = sprintf("DOI check failed for %s: %s", doi, e$message)
      )
    })

    Sys.sleep(0.5)  # Rate limiting
  }
  issues
}

# Only run online checks if requested
doi_issues <- validate_dois(bib, email = "your.email@example.com")
message(sprintf("DOI validation: %d issues found", length(doi_issues)))
```

**Got:** Each DOI resolves successfully (HTTP 200 from CrossRef). Entries without
DOIs are flagged as informational.

**If fail:** Network errors or rate limiting produce warnings rather than hard
failures. Set the `email` parameter for higher rate limits from CrossRef's polite pool.

### Step 5: Check URL Accessibility

```r
validate_urls <- function(bib) {
  issues <- list()

  for (i in seq_along(bib)) {
    key <- names(bib)[i]
    url <- bib[[i]]$url

    if (is.null(url) || !nzchar(url)) next

    tryCatch({
      resp <- httr2::request(url) |>
        httr2::req_method("HEAD") |>
        httr2::req_timeout(10) |>
        httr2::req_error(is_error = function(resp) FALSE) |>
        httr2::req_perform()

      status <- httr2::resp_status(resp)
      if (status >= 400) {
        issues[[length(issues) + 1]] <- list(
          key = key, severity = "warning",
          message = sprintf("URL returned HTTP %d: %s", status, url)
        )
      }
    }, error = function(e) {
      issues[[length(issues) + 1]] <<- list(
        key = key, severity = "warning",
        message = sprintf("URL unreachable: %s (%s)", url, e$message)
      )
    })

    Sys.sleep(0.3)
  }
  issues
}

url_issues <- validate_urls(bib)
message(sprintf("URL validation: %d issues found", length(url_issues)))
```

**Got:** All URLs return HTTP 200 (or 301/302 redirects). Broken links flagged.

**If fail:** Some servers block HEAD requests. Retry with GET for failed HEAD
checks. Timeout errors are common for slow academic servers.

### Step 6: Detect Duplicate Entries

```r
detect_duplicates <- function(bib) {
  issues <- list()

  # Check for duplicate DOIs
  dois <- vapply(bib, function(x) {
    d <- x$doi
    if (is.null(d)) NA_character_ else tolower(trimws(d))
  }, character(1))

  doi_table <- table(dois[!is.na(dois)])
  dup_dois <- names(doi_table[doi_table > 1])
  for (d in dup_dois) {
    keys <- names(bib)[which(dois == d)]
    issues[[length(issues) + 1]] <- list(
      key = paste(keys, collapse = ", "), severity = "error",
      message = sprintf("Duplicate DOI %s in entries: %s", d,
                        paste(keys, collapse = ", "))
    )
  }

  # Check for duplicate titles (fuzzy)
  titles <- vapply(bib, function(x) {
    t <- x$title
    if (is.null(t)) NA_character_ else tolower(gsub("[^a-z0-9 ]", "", tolower(t)))
  }, character(1))

  seen <- character(0)
  for (i in seq_along(titles)) {
    if (is.na(titles[i])) next
    for (j in seen) {
      if (identical(titles[i], titles[as.integer(j)])) {
        issues[[length(issues) + 1]] <- list(
          key = sprintf("%s, %s", names(bib)[as.integer(j)], names(bib)[i]),
          severity = "warning",
          message = sprintf("Possible duplicate titles: '%s'",
                            substr(bib[[i]]$title, 1, 60))
        )
      }
    }
    seen <- c(seen, as.character(i))
  }

  issues
}

dup_issues <- detect_duplicates(bib)
message(sprintf("Duplicate detection: %d issues found", length(dup_issues)))
```

**Got:** Zero duplicates for a clean bibliography. Any detected duplicates are
flagged with the specific entry keys involved.

### Step 7: Generate Validation Report

```r
generate_report <- function(all_issues, bib, output_file = NULL) {
  errors   <- Filter(function(x) x$severity == "error", all_issues)
  warnings <- Filter(function(x) x$severity == "warning", all_issues)
  infos    <- Filter(function(x) x$severity == "info", all_issues)

  lines <- c(
    "# Bibliography Validation Report",
    "",
    sprintf("**File**: references.bib"),
    sprintf("**Entries**: %d", length(bib)),
    sprintf("**Date**: %s", Sys.Date()),
    "",
    sprintf("## Summary: %d errors, %d warnings, %d info",
            length(errors), length(warnings), length(infos)),
    ""
  )

  if (length(errors) > 0) {
    lines <- c(lines, "## Errors", "")
    for (issue in errors) {
      lines <- c(lines, sprintf("- **[%s]** %s", issue$key, issue$message))
    }
    lines <- c(lines, "")
  }

  if (length(warnings) > 0) {
    lines <- c(lines, "## Warnings", "")
    for (issue in warnings) {
      lines <- c(lines, sprintf("- **[%s]** %s", issue$key, issue$message))
    }
    lines <- c(lines, "")
  }

  report_text <- paste(lines, collapse = "\n")

  if (!is.null(output_file)) {
    writeLines(report_text, output_file)
    message(sprintf("Report written to %s", output_file))
  }

  cat(report_text)
  invisible(all_issues)
}

all_issues <- c(field_issues, doi_issues, url_issues, dup_issues)
generate_report(all_issues, bib, output_file = "validation-report.md")
```

**Got:** A structured markdown report listing all issues grouped by severity.

## Validation

- [ ] All entries have required fields for their type (no errors in field check)
- [ ] All DOIs resolve to valid CrossRef records
- [ ] No duplicate DOIs exist in the bibliography
- [ ] All URLs are accessible (HTTP 200 or redirect)
- [ ] Validation report generated without R errors
- [ ] Zero errors in report for a publication-ready bibliography

## Pitfalls

- **DOI format inconsistency**: DOIs may appear as `10.1234/...`,
  `https://doi.org/10.1234/...`, or `doi:10.1234/...`. Normalize before comparing
- **CrossRef rate limiting**: Unauthenticated requests are limited to ~50/second.
  Always use the `email` parameter to join the polite pool for higher limits
- **Transient URL failures**: Academic servers occasionally timeout. Retry failed
  URLs once before flagging them as broken
- **Entry type variations**: BibLaTeX uses `@online` where BibTeX uses `@misc`.
  The validator should handle both
- **False positive duplicates**: Entries like "Introduction" or "Methods" as titles
  trigger fuzzy matching. Review flagged duplicates manually
- **Missing DOIs for older works**: Pre-2000 publications often lack DOIs. Flag as
  informational, not as errors

## Related Skills

- `manage-bibliography` - fix issues found by this validator (dedup, add fields)
- `format-citations` - format validated entries into styled citations
- `../reporting/format-apa-report` - APA reports require complete, validated references
- `../r-packages/write-vignette` - vignettes with citations need valid .bib entries
