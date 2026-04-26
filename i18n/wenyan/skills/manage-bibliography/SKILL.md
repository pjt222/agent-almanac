---
name: manage-bibliography
locale: wenyan
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

# 管書目

以 R 建、合、去重 BibTeX 書目檔。此技涵書目管之全期：解既 .bib 檔為結構化 R 物、自識別字（DOI、ISBN、arXiv ID）生新項、以智去重合多書目、並出淨一致格式之 .bib。

## 用時

- 為 R Markdown 或 Quarto 項目建新 .bib
- 合自多合作者或源之書目
- 去經複貼積之 .bib 之重
- 自 DOI 或他識別字程序化生 BibTeX 項
- 清並統一既 .bib（一致之鍵、序之欄）

## 入

- **必要**：一或多 .bib 檔之路，或 DOI／ISBN／arXiv ID 之列
- **可選**：出 .bib 檔之路（預設：`references.bib`）
- **可選**：去重策略（`doi`、`title`、`both`；預設：`both`）
- **可選**：序（`author`、`year`、`key`；預設：`key`）
- **可選**：鍵生型（預設：`AuthorYear`）

## 法

### 第一步：裝並載所需之包

```r
required_packages <- c("RefManageR", "bibtex", "stringdist")
missing <- required_packages[!vapply(required_packages, requireNamespace,
                                     logical(1), quietly = TRUE)]
if (length(missing) > 0) install.packages(missing)

library(RefManageR)
```

**得：**諸包無誤而載。

**敗則：**若 RefManageR 裝敗，察 `curl` 與 `xml2` 系統庫是否可得。Ubuntu：`sudo apt install libcurl4-openssl-dev libxml2-dev`。

### 第二步：解既 .bib 檔

```r
bib <- RefManageR::ReadBib("references.bib", check = FALSE)
message(sprintf("Parsed %d entries from references.bib", length(bib)))

# Inspect structure
print(bib[1:3])

# Access fields programmatically
keys <- names(bib)
years <- vapply(bib, function(x) x$year %||% NA_character_, character(1))
```

**得：**一 `BibEntry` 物含檔中諸項。項數配檔中 `@article{`、`@book{` 等塊之數。

**敗則：**若解敗，察未配之括或 .bib 中訛之 UTF-8。以嚴解為後備：`bibtex::read.bib()`。

### 第三步：自識別字生項

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

**得：**BibEntry 物具全元數據（題、作者、期刊、年、DOI）為每成功解之識別字。

**敗則：**DOI 解依 CrossRef API。若請敗，察網路與 DOI 之有效。大批或受速限；於請間加 `Sys.sleep(1)`。

### 第四步：合多書目

```r
bib1 <- RefManageR::ReadBib("project_a.bib", check = FALSE)
bib2 <- RefManageR::ReadBib("project_b.bib", check = FALSE)

# Simple merge
merged <- c(bib1, bib2)
message(sprintf("Merged: %d + %d = %d entries (before dedup)",
                length(bib1), length(bib2), length(merged)))
```

**得：**一合之 BibEntry 物含二檔之項。

### 第五步：去重

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

**得：**重項已除。所除重之數已印。

**敗則：**若題比過激（除非重者），升相似閾至 0.95 上，或僅用 `method = "doi"`。

### 第六步：序並出

```r
# Sort by citation key
sorted_bib <- sort(merged, sorting = "nyt")  # name-year-title

# Export to .bib file
RefManageR::WriteBib(sorted_bib, file = "references.bib", biblatex = FALSE)
message(sprintf("Wrote %d entries to references.bib", length(sorted_bib)))
```

**得：**淨 .bib 檔寫於盤，格式一致，每塊一項，依引鍵字母序。

**敗則：**若 WriteBib 生編碼之疑，確 R 會 locale 支援 UTF-8：`Sys.setlocale("LC_ALL", "en_US.UTF-8")`。

## 驗

- [ ] 出 .bib 檔無誤而解：`RefManageR::ReadBib("references.bib")`
- [ ] 項數合預期（入數減重）
- [ ] 無重 DOI 存：出中諸 DOI 皆唯一
- [ ] 諸項具引鍵
- [ ] 每項類之所需欄皆具（作者、題、年至少）
- [ ] 檔為有效 BibTeX（以 `bibtex::read.bib()` 試）

## 陷

- **編碼之疑**：Latin-1 重音之 .bib 破 UTF-8 解者。先轉編碼：`iconv -f ISO-8859-1 -t UTF-8 old.bib > new.bib`
- **未配之括**：單一缺之 `}` 靜失項。大檔解前驗括之衡
- **DOI 速限**：CrossRef 節未認證之請。以 `RefManageR::BibOptions(check.entries = FALSE)` 設禮之信並批請
- **鍵衝突**：合具重鍵之檔（二者皆有 `Smith2020`）靜蓋。合後重生鍵
- **題中之 LaTeX**：題含 `{DNA}` 或 `$\alpha$` 需謹處；RefManageR 保之而下游工具或剝之

## 參

- `format-citations` — 格式書目項為樣之引
- `validate-references` — 驗 .bib 項之全與 DOI 之可解
- `../reporting/format-apa-report` — 以書目生 APA 格之報
- `../r-packages/write-vignette` — 建引參考之包篇
