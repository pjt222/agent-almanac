---
name: validate-references
locale: wenyan-lite
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

# 驗證參考文獻

檢查 BibTeX 文獻條目之完整性、準確性與一致性。本技能涵蓋按條目類型驗證必填欄位、經 CrossRef API 解析 DOI、檢查 URL 可達性、偵測重複條目,並產出一份按嚴重性標記問題之結構化驗證報告。確保 .bib 文件於渲染前已可發表。

## 適用時機

- 為投稿期刊準備手稿之文獻
- 於專案里程碑前審計共享 .bib 文件之品質
- 自多來源合併文獻後
- 引用渲染不正確,需診斷 .bib 問題時
- 作為版本控制專案中對 .bib 文件之 CI 檢查

## 輸入

- **必要**：.bib 文件之路徑
- **選擇性**：驗證層級（`basic`、`standard`、`strict`；預設 `standard`）
- **選擇性**：是否線上檢查 DOI 解析（預設 `TRUE`）
- **選擇性**：是否檢查 URL 可達性（預設 `TRUE`）
- **選擇性**：輸出報告路徑（預設：印至控制台）
- **選擇性**：CrossRef API 之 email,用於 polite pool（大文件建議）

## 步驟

### 步驟一：安裝並載入所需套件

```r
required_packages <- c("RefManageR", "httr2", "curl")
missing <- required_packages[!vapply(required_packages, requireNamespace,
                                     logical(1), quietly = TRUE)]
if (length(missing) > 0) install.packages(missing)

library(RefManageR)
```

**預期：** 所有套件無錯誤載入。

**失敗時：** 若 httr2 不可用,以 `install.packages("httr2")` 安裝。對缺 curl 標頭之系統：`sudo apt install libcurl4-openssl-dev`。

### 步驟二：解析並盤點文獻

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

**預期：** 條目類型摘要（article、book、inproceedings 等）及總計與文件中 `@type{` 區塊數匹配。

**失敗時：** 解析錯誤指示 BibTeX 格式有誤。檢查不匹配之大括號、欄位間缺逗號或無效之 UTF-8 字元。

### 步驟三：依條目類型驗證必填欄位

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

**預期：** 缺必填欄位之問題清單。維護良好之文獻零問題。

**失敗時：** 此步本地運行,不應失敗。若失敗,檢查 .bib 文件於步驟二是否正確解析。

### 步驟四：解析並驗證 DOI

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

**預期：** 各 DOI 自 CrossRef 成功解析（HTTP 200）。無 DOI 之條目標為資訊性。

**失敗時：** 網路錯誤或速率限制產生警告而非硬失敗。設 `email` 參數以獲 CrossRef polite pool 之較高速率限制。

### 步驟五：檢查 URL 可達性

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

**預期：** 所有 URL 返回 HTTP 200（或 301/302 重定向）。失效連結被標記。

**失敗時：** 部分伺服器封鎖 HEAD 請求。對失敗之 HEAD 檢查改用 GET 重試。慢學術伺服器常見超時錯誤。

### 步驟六：偵測重複條目

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

**預期：** 乾淨文獻零重複。任何已偵測之重複以涉及之具體條目鍵標記。

### 步驟七：產生驗證報告

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

**預期：** 一份依嚴重性分組列出所有問題之結構化 markdown 報告。

## 驗證

- [ ] 所有條目皆有其類型所需之欄位（欄位檢查無錯誤）
- [ ] 所有 DOI 解析至有效之 CrossRef 記錄
- [ ] 文獻中無重複 DOI
- [ ] 所有 URL 可達（HTTP 200 或重定向）
- [ ] 驗證報告已生成,無 R 錯誤
- [ ] 可發表文獻之報告中零錯誤

## 常見陷阱

- **DOI 格式不一致**：DOI 可能呈為 `10.1234/...`、`https://doi.org/10.1234/...` 或 `doi:10.1234/...`。比較前先規範化
- **CrossRef 速率限制**：未認證請求限約 50/秒。永遠用 `email` 參數加入 polite pool 以獲較高限制
- **暫時性 URL 失敗**：學術伺服器偶有超時。標為失效前先重試一次
- **條目類型變體**：BibLaTeX 用 `@online`,BibTeX 用 `@misc`。驗證器應兩者皆處理
- **誤報重複**：標題如「Introduction」或「Methods」之條目觸發模糊匹配。手動審查標記之重複
- **舊作品缺 DOI**：2000 年前出版物常無 DOI。標為資訊性,非錯誤

## 相關技能

- `manage-bibliography` — 修復本驗證器發現之問題（去重、加欄位）
- `format-citations` — 將已驗證之條目格式化為樣式化引用
- `../reporting/format-apa-report` — APA 報告需完整、已驗證之文獻
- `../r-packages/write-vignette` — 含引用之 vignette 需有效 .bib 條目
