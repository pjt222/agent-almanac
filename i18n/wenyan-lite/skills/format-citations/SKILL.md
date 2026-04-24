---
name: format-citations
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Format citations across academic styles (APA 7, Chicago, Vancouver, IEEE)
  using CSL processors and R tooling. Convert between citation styles, generate
  in-text citations and reference lists, and validate formatting against style
  guides using citeproc, knitcitations, and Quarto's built-in citation engine.
  Use when rendering a Quarto or R Markdown document with formatted citations,
  converting a bibliography between citation styles, generating a standalone
  reference list, or setting up citation infrastructure for a multi-document
  project.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: citations
  complexity: intermediate
  language: R
  tags: citations, formatting, csl, apa, academic
---

# 格引用

以 CSL（Citation Style Language）處理器與 R 工具於學術風格（APA 7、Chicago、Vancouver、IEEE）間格引用。此技涵將 BibTeX 項轉為正格之文內引用與引用清單，於 APA 7、Chicago、Vancouver、IEEE 及自訂風格。其藉 Pandoc 之 citeproc、knitcitations 包及 Quarto 之原生引用引擎以行可復現之文件生產。

## 適用時機

- 渲含格之引用之 R Markdown 或 Quarto 文件
- 自一引用風格轉書目至另一
- 自 .bib 檔生獨之引用清單
- 驗文內引用配特定風格指南
- 為多文件項目（書、論文）設引用基礎設施

## 輸入

- **必要**：.bib 檔（或 Pandoc 識之其他書目源）
- **必要**：目標引用風格（如 `apa`、`chicago-author-date`、`ieee`）
- **選擇性**：CSL 檔路徑（預設：用 Pandoc 內建風格）
- **選擇性**：輸出格（`html`、`pdf`、`docx`；預設：自文件推）
- **選擇性**：語言特定格之 locale（預設：`en-US`）

## 步驟

### 步驟一：驗引用基礎設施

```r
# Check Pandoc availability (required for citeproc)
pandoc_path <- Sys.which("pandoc")
if (!nzchar(pandoc_path)) {
  pandoc_path <- Sys.getenv("RSTUDIO_PANDOC")
}
stopifnot("Pandoc not found" = nzchar(pandoc_path))
message(sprintf("Pandoc: %s", system2(pandoc_path, "--version", stdout = TRUE)[1]))

# Check for citeproc support
citeproc_ok <- any(grepl("citeproc", system2(pandoc_path, "--list-extensions", stdout = TRUE)))
message(sprintf("Citeproc: %s", ifelse(citeproc_ok, "built-in", "external needed")))
```

**預期：** 偵 Pandoc 2.11+ 版，內建 citeproc 支援。

**失敗時：** 裝 Pandoc 或於 `.Renviron` 設 `RSTUDIO_PANDOC` 指 RStudio 附之 Pandoc。Quarto 亦自附其 Pandoc。

### 步驟二：為引用配文件 YAML

R Markdown：

```yaml
---
title: "My Document"
bibliography: references.bib
csl: apa.csl
link-citations: true
output:
  html_document:
    pandoc_args: ["--citeproc"]
---
```

Quarto：

```yaml
---
title: "My Document"
bibliography: references.bib
csl: apa.csl
link-citations: true
cite-method: citeproc
---
```

**預期：** YAML 頭正引 .bib 檔與 CSL 風格。

**失敗時：** 若 CSL 檔未尋，自 CSL 倉庫下（見步驟三）並置於項目目錄。

### 步驟三：取 CSL 風格檔

```r
# Common CSL styles and their repository names
csl_styles <- list(
  apa         = "apa.csl",
  chicago     = "chicago-author-date.csl",
  vancouver   = "vancouver.csl",
  ieee        = "ieee.csl",
  nature      = "nature.csl",
  harvard     = "harvard-cite-them-right.csl",
  mla         = "modern-language-association.csl"
)

download_csl <- function(style, dest_dir = ".") {
  base_url <- "https://raw.githubusercontent.com/citation-style-language/styles/master"
  filename <- csl_styles[[style]]
  if (is.null(filename)) stop(sprintf("Unknown style: %s", style))
  dest <- file.path(dest_dir, filename)
  utils::download.file(
    url = sprintf("%s/%s", base_url, filename),
    destfile = dest, quiet = TRUE
  )
  message(sprintf("Downloaded %s to %s", filename, dest))
  dest
}

# Download APA 7 style
download_csl("apa")
```

**預期：** CSL 檔下至項目目錄。

**失敗時：** 察網絡連通。CSL GitHub 倉庫含 10,000+ 風格。於離線用，綑所需 CSL 檔於項目。

### 步驟四：書文內引用

於文件體中用 Pandoc 引用語法：

```markdown
<!-- Single citation -->
According to @Smith2020, the method improves accuracy.

<!-- Parenthetical citation -->
The method improves accuracy [@Smith2020].

<!-- Multiple citations -->
Several studies confirm this [@Smith2020; @Jones2021; @Lee2022].

<!-- Citation with page number -->
As noted by @Smith2020 [p. 42], the results are significant.

<!-- Suppress author name -->
The results are significant [-@Smith2020].

<!-- Citation with prefix -->
[see @Smith2020, pp. 42-45; also @Jones2021, ch. 3]
```

**預期：** Pandoc/Quarto 渲此為目標風格之正格引用（如 APA 之 `(Smith, 2020)`、Chicago 之 `(Smith 2020)`）。

### 步驟五：以 R 生獨之引用清單

```r
# Using RefManageR to print formatted references
library(RefManageR)
BibOptions(style = "text", bib.style = "authoryear", sorting = "nyt")
bib <- ReadBib("references.bib", check = FALSE)

# Print all entries in text format
print(bib)

# Format specific entries
print(bib[author = "Smith"])

# Generate markdown reference list programmatically
format_reference_list <- function(bib, style = "apa") {
  BibOptions(style = "text", bib.style = "authoryear")
  entries <- capture.output(print(bib))
  entries <- entries[nzchar(trimws(entries))]
  paste(sprintf("- %s", entries), collapse = "\n")
}

cat(format_reference_list(bib))
```

**預期：** 格之引用清單印於控制臺或捕為字符向量以供後處。

### 步驟六：於引用風格間轉

```r
# Render the same document in different styles
styles <- c("apa", "chicago", "ieee")

for (style in styles) {
  csl_file <- download_csl(style)
  output_file <- sprintf("output_%s.html", style)

  rmarkdown::render(
    input = "document.Rmd",
    output_file = output_file,
    params = list(csl = csl_file),
    quiet = TRUE
  )
  message(sprintf("Rendered %s with %s style", output_file, style))
}
```

於 Quarto：

```bash
quarto render document.qmd --metadata csl:apa.csl -o output_apa.html
quarto render document.qmd --metadata csl:ieee.csl -o output_ieee.html
```

**預期：** 多輸出檔，各以異之引用風格格同內容。

**失敗時：** 若渲失敗，察文件體中所有引用 key 於 .bib 檔存。缺 key 生警但或壞格。

### 步驟七：驗引用格

```r
# Check for undefined citations in rendered output
validate_citations <- function(rmd_file, bib_file) {
  # Extract citation keys from document
  doc_text <- readLines(rmd_file, warn = FALSE)
  doc_keys <- unique(unlist(regmatches(
    doc_text,
    gregexpr("@([A-Za-z][A-Za-z0-9_:.#$%&+-?<>~/]*)", doc_text)
  )))
  doc_keys <- gsub("^@", "", doc_keys)
  # Remove false positives (email-like patterns)
  doc_keys <- doc_keys[!grepl("\\.", doc_keys)]

  # Extract keys from .bib file
  bib <- RefManageR::ReadBib(bib_file, check = FALSE)
  bib_keys <- names(bib)

  # Find mismatches
  undefined <- setdiff(doc_keys, bib_keys)
  unused <- setdiff(bib_keys, doc_keys)

  list(
    undefined = undefined,
    unused = unused,
    cited = intersect(doc_keys, bib_keys)
  )
}

result <- validate_citations("document.Rmd", "references.bib")
if (length(result$undefined) > 0) {
  warning(sprintf("Undefined citation keys: %s",
                  paste(result$undefined, collapse = ", ")))
}
if (length(result$unused) > 0) {
  message(sprintf("Unused .bib entries: %s",
                  paste(result$unused, collapse = ", ")))
}
```

**預期：** 報告未定之 key（引而不於 .bib）、未用項（於 .bib 而從未引）、有效引用。

**失敗時：** 假陽或於含 `@` 之電郵址或代碼生。精 regex 或手審所標之 key。

## 驗證

- [ ] 文件渲時 Pandoc/citeproc 無引用警
- [ ] 文件中所有 `@key` 引解於 .bib 項
- [ ] 引用清單現於文件末（或於 `div#refs`）
- [ ] 文內引用配目標風格格
- [ ] 引用排循風格規（APA 為字母、IEEE 為編號）
- [ ] 自文內引用至引用清單項之超連行（若 `link-citations: true`）

## 常見陷阱

- **缺 CSL 檔**：若未指 CSL，Pandoc 退為 Chicago author-date。恒明設 `csl:` 以求風格一致
- **引用 key 誤字**：誤拼之 key 如 `@Smtih2020` 默渲為字面文。以 `--verbose` 啟 Pandoc 警以捕之
- **locale 依之格**：APA 於英中作者間需 "and" 而於德需 "und"。於 YAML 頭設 `lang:` 以配
- **nocite 未引項**：欲納項於引用清單而不於文中引，加 `nocite: '@*'`（全）或 `nocite: '@key1, @key2'` 於 YAML
- **CSL 版不配**：某舊 CSL 0.8 檔與現代 Pandoc 不容。恒自官倉庫用 CSL 1.0+
- **Quarto vs R Markdown 之異**：Quarto 預設用 `cite-method: citeproc`；R Markdown 或需顯 `pandoc_args: ["--citeproc"]`

## 相關技能

- `manage-bibliography` - 建並維此技所用之 .bib 檔
- `validate-references` - 格前驗 .bib 項之全
- `../reporting/format-apa-report` - 超出引用之全 APA 報告格
- `../reporting/create-quarto-report` - Quarto 文件設帶引用支援
