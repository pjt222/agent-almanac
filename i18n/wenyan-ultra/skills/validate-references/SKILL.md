---
name: validate-references
locale: wenyan-ultra
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

# 驗參

察 BibTeX 目以盡、準、一。涵驗每型必欄、解 DOI、察 URL 通、標重項、生分嚴之結構驗報。確 .bib 呈版前備。

## 用

- 備稿目以投刊→用
- 案里程前審共 .bib 質→用
- 合多源目後→用
- 引示誤須診 .bib 疾→用
- 控版案 .bib 之 CI 察→用

## 入

- **必**：.bib 路
- **可**：驗級（`basic`、`standard`、`strict`；默 `standard`）
- **可**：在線察 DOI 否（默 `TRUE`）
- **可**：察 URL 通否（默 `TRUE`）
- **可**：報路（默：印於台）
- **可**：CrossRef API 信箱以入禮池（大檔薦）

## 行

### 一：裝載必包

```r
required_packages <- c("RefManageR", "httr2", "curl")
missing <- required_packages[!vapply(required_packages, requireNamespace,
                                     logical(1), quietly = TRUE)]
if (length(missing) > 0) install.packages(missing)

library(RefManageR)
```

得：諸包載無誤。

敗：httr2 缺→`install.packages("httr2")`。系無 curl 頭→`sudo apt install libcurl4-openssl-dev`。

### 二：析計目

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

得：目型摘（article、book、inproceedings 等）、總計合檔中 `@type{` 塊數。

敗：析誤示 BibTeX 壞。察不配括、欄間缺逗、非 UTF-8 字。

### 三：驗每型必欄

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

得：缺必欄之疾列。良養目零疾。

敗：此步本地行不應敗。若敗，察步二析正。

### 四：解驗 DOI

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

得：每 DOI 解成（CrossRef HTTP 200）。無 DOI 之目標為信息。

敗：網誤或率限生警，非硬敗。設 `email` 參以入 CrossRef 禮池得高率限。

### 五：察 URL 通

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

得：諸 URL 返 HTTP 200（或 301/302 重導）。壞鏈標。

敗：某器拒 HEAD。HEAD 敗以 GET 重試。慢學術器超時常見。

### 六：偵重項

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

得：清目零重。覓重者標附特目鍵。

### 七：生驗報

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

得：結構 markdown 報，諸疾按嚴分組。

## 驗

- [ ] 諸目按型有必欄（欄察無誤）
- [ ] 諸 DOI 解為效 CrossRef 記
- [ ] 目中無重 DOI
- [ ] 諸 URL 通（HTTP 200 或重導）
- [ ] 驗報無 R 誤生
- [ ] 呈版備之目報零誤

## 忌

- **DOI 式不一**：DOI 或現為 `10.1234/...`、`https://doi.org/10.1234/...`、`doi:10.1234/...`。較前規範
- **CrossRef 率限**：未認請限 ~50/秒。必用 `email` 參入禮池得高限
- **URL 過敗**：學術器偶超時。敗 URL 標壞前再試一
- **目型變**：BibLaTeX 用 `@online`、BibTeX 用 `@misc`。驗器應應二者
- **假重**：「Introduction」「Methods」標致模糊配。手察標重
- **舊作無 DOI**：2000 年前出版常無 DOI。標為信息、非誤

## 參

- `manage-bibliography` - 修此驗器覓之疾（去重、加欄）
- `format-citations` - 將驗目格式化為樣式引文
- `../reporting/format-apa-report` - APA 報須完驗之參
- `../r-packages/write-vignette` - 含引之示例須效 .bib 目
