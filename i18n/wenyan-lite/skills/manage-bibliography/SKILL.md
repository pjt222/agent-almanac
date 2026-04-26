---
name: manage-bibliography
locale: wenyan-lite
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

# 管文獻

以 R 創、合並去重 BibTeX 文獻文件。此技能涵文獻管理之全生命：解析既有 .bib 文件為結構化 R 物件、自標識（DOI、ISBN、arXiv ID）生新條目、以智能去重合並多文獻，並匯出潔、一致格式之 .bib 出。

## 適用時機

- 為 R Markdown 或 Quarto 項目創新 .bib 文件
- 合並多協作者或源之文獻
- 去重因複製粘貼積而長之 .bib 文件
- 自 DOI 或他標識以程式生 BibTeX 條目
- 清並標化既有 .bib 文件（一致鍵、已排之域）

## 輸入

- **必要**：一或多 .bib 文件之路，或 DOI/ISBN/arXiv ID 之清單
- **選擇性**：出 .bib 文件路（默認：`references.bib`）
- **選擇性**：去重策略（`doi`、`title`、`both`；默認：`both`）
- **選擇性**：排序（`author`、`year`、`key`；默認：`key`）
- **選擇性**：鍵生模式（默認：`AuthorYear`）

## 步驟

### 步驟一：裝並載所需套件

```r
required_packages <- c("RefManageR", "bibtex", "stringdist")
missing <- required_packages[!vapply(required_packages, requireNamespace,
                                     logical(1), quietly = TRUE)]
if (length(missing) > 0) install.packages(missing)

library(RefManageR)
```

**預期：** 所有套件無誤載。

**失敗時：** 若 RefManageR 裝敗，查 `curl` 與 `xml2` 系統庫可得。Ubuntu 上：`sudo apt install libcurl4-openssl-dev libxml2-dev`。

### 步驟二：解析既有 .bib 文件

```r
bib <- RefManageR::ReadBib("references.bib", check = FALSE)
message(sprintf("Parsed %d entries from references.bib", length(bib)))

# Inspect structure
print(bib[1:3])

# Access fields programmatically
keys <- names(bib)
years <- vapply(bib, function(x) x$year %||% NA_character_, character(1))
```

**預期：** 含文件中所有條目之 `BibEntry` 物件。條目數匹配文件中 `@article{`、`@book{` 等塊之數。

**失敗時：** 若解析敗，查 .bib 文件中未匹花括或無效 UTF-8。行 `bibtex::read.bib()` 為後備以嚴解析。

### 步驟三：自標識生條目

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

**預期：** 每成功解之標識之 BibEntry 物件附完整元數據（標題、作者、期刊、年、DOI）。

**失敗時：** DOI 解析依 CrossRef API。若請求敗，查網連與 DOI 有效。大批或適速率限制；於請求間加 `Sys.sleep(1)`。

### 步驟四：合並多文獻

```r
bib1 <- RefManageR::ReadBib("project_a.bib", check = FALSE)
bib2 <- RefManageR::ReadBib("project_b.bib", check = FALSE)

# Simple merge
merged <- c(bib1, bib2)
message(sprintf("Merged: %d + %d = %d entries (before dedup)",
                length(bib1), length(bib2), length(merged)))
```

**預期：** 合並之 BibEntry 物件含兩文件之條目。

### 步驟五：去重條目

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

**預期：** 重條目已除。已除重數已印。

**失敗時：** 若題比較過激（除非重），升相似閾值過 0.95 或僅換 `method = "doi"`。

### 步驟六：排序並匯出

```r
# Sort by citation key
sorted_bib <- sort(merged, sorting = "nyt")  # name-year-title

# Export to .bib file
RefManageR::WriteBib(sorted_bib, file = "references.bib", biblatex = FALSE)
message(sprintf("Wrote %d entries to references.bib", length(sorted_bib)))
```

**預期：** 潔 .bib 文件已書於磁，格式一致，每條一塊，按引鍵字母序排。

**失敗時：** 若 WriteBib 生編碼問題，確 R 會話語系支 UTF-8：`Sys.setlocale("LC_ALL", "en_US.UTF-8")`。

## 驗證

- [ ] 出 .bib 文件無誤解：`RefManageR::ReadBib("references.bib")`
- [ ] 條目數合期（輸入數減重）
- [ ] 無重 DOI 存：出中所有 DOI 唯一
- [ ] 所有條目有引鍵
- [ ] 依條類所需域已具（至少作者、題、年）
- [ ] 文件為有效 BibTeX（以 `bibtex::read.bib()` 測）

## 常見陷阱

- **編碼問題**：含 Latin-1 重音之 .bib 文件破 UTF-8 解析器。先轉編碼：`iconv -f ISO-8859-1 -t UTF-8 old.bib > new.bib`
- **未匹花括**：單缺 `}` 默丟條目。解大文件前驗花括平衡
- **DOI 速率限制**：CrossRef 節未認證請求。以 `RefManageR::BibOptions(check.entries = FALSE)` 設禮電郵並批請求
- **鍵衝突**：合並含重鍵之文件（如兩者皆有 `Smith2020`）默覆。合後重生鍵
- **題中 LaTeX**：含 `{DNA}` 或 `$\alpha$` 之題需謹處；RefManageR 保之而下游工具或剝之

## 相關技能

- `format-citations` - 化文獻條目為樣式引
- `validate-references` - 驗 .bib 條目之全與 DOI 解析
- `../reporting/format-apa-report` - 以文獻生 APA 格式之報
- `../r-packages/write-vignette` - 創引文獻之套件小品
