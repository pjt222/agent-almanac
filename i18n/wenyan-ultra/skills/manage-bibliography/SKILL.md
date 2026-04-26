---
name: manage-bibliography
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

# 管參書

以 R（RefManageR、bibtex）造、合、去重 BibTeX 參書。析 .bib 為 R 結構，以 DOI 或題似合去重，由 DOI/ISBN/arXiv ID 生項，出淨排 .bib。

## 用

- 為 R Markdown 或 Quarto 項造新 .bib
- 合多協作者或源之參書
- 去重於複製積之 .bib
- 由 DOI 或他識程生 BibTeX 項
- 清並標現 .bib（一致鍵、排字段）

## 入

- **必**：一或多 .bib 之路，或 DOI/ISBN/arXiv ID 列
- **可**：出 .bib 路（默 `references.bib`）
- **可**：去重策（`doi`、`title`、`both`；默 `both`）
- **可**：排序（`author`、`year`、`key`；默 `key`）
- **可**：鍵生式（默 `AuthorYear`）

## 行

### 一：裝並載包

```r
required_packages <- c("RefManageR", "bibtex", "stringdist")
missing <- required_packages[!vapply(required_packages, requireNamespace,
                                     logical(1), quietly = TRUE)]
if (length(missing) > 0) install.packages(missing)

library(RefManageR)
```

得：諸包載無誤。

敗：RefManageR 裝敗→查 `curl` 與 `xml2` 系統庫。Ubuntu：`sudo apt install libcurl4-openssl-dev libxml2-dev`。

### 二：析現 .bib

```r
bib <- RefManageR::ReadBib("references.bib", check = FALSE)
message(sprintf("Parsed %d entries from references.bib", length(bib)))

# Inspect structure
print(bib[1:3])

# Access fields programmatically
keys <- names(bib)
years <- vapply(bib, function(x) x$year %||% NA_character_, character(1))
```

得：含諸項之 `BibEntry`。項計匹文件中 `@article{`、`@book{` 塊數。

敗：析敗→查未匹括號或 .bib 中無效 UTF-8。`bibtex::read.bib()` 為嚴格析之退。

### 三：由識生項

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

得：各成功識之 BibEntry 附全元（題、作、刊、年、DOI）。

敗：DOI 解依 CrossRef API。請求敗→查網連與 DOI 是否有效。大批量或限速；請求間加 `Sys.sleep(1)`。

### 四：合多參書

```r
bib1 <- RefManageR::ReadBib("project_a.bib", check = FALSE)
bib2 <- RefManageR::ReadBib("project_b.bib", check = FALSE)

# Simple merge
merged <- c(bib1, bib2)
message(sprintf("Merged: %d + %d = %d entries (before dedup)",
                length(bib1), length(bib2), length(merged)))
```

得：含二文件項之合 BibEntry。

### 五：去重

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

得：重項除。除重數印。

敗：題比過激（除非重）→升似閾 > 0.95 或僅用 `method = "doi"`。

### 六：排並出

```r
# Sort by citation key
sorted_bib <- sort(merged, sorting = "nyt")  # name-year-title

# Export to .bib file
RefManageR::WriteBib(sorted_bib, file = "references.bib", biblatex = FALSE)
message(sprintf("Wrote %d entries to references.bib", length(sorted_bib)))
```

得：淨 .bib 寫於盤附一致格、一項一塊、按引鍵字排。

敗：WriteBib 生編誤→確 R 會話 locale 支 UTF-8：`Sys.setlocale("LC_ALL", "en_US.UTF-8")`。

## 驗

- [ ] 出 .bib 無誤析：`RefManageR::ReadBib("references.bib")`
- [ ] 項計合預（入計減重）
- [ ] 無重 DOI：諸出 DOI 獨
- [ ] 諸項有引鍵
- [ ] 類所需字段存（至少作、題、年）
- [ ] 文件為有效 BibTeX（以 `bibtex::read.bib()` 測）

## 忌

- **編問題**：.bib 含 Latin-1 重音破 UTF-8 析。先轉編：`iconv -f ISO-8859-1 -t UTF-8 old.bib > new.bib`
- **未匹括號**：缺一 `}` 默棄項。大文件前驗括號平
- **DOI 限速**：CrossRef 節未認請求。以 `RefManageR::BibOptions(check.entries = FALSE)` 設禮郵並批請求
- **鍵衝**：合重鍵文件（皆有 `Smith2020`）默覆。合後重生鍵
- **LaTeX 於題**：題含 `{DNA}` 或 `$\alpha$` 需謹處；RefManageR 保之而下游工或剝

## 參

- `format-citations` - 格參書項為式引
- `validate-references` - 驗 .bib 項全與 DOI 解
- `../reporting/format-apa-report` - 以參書生 APA 格報
- `../r-packages/write-vignette` - 造引參之包 vignette
