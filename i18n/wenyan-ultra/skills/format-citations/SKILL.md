---
name: format-citations
locale: wenyan-ultra
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

# 擬引

以 CSL（Citation Style Language）處器與 R 工於學式（APA 7、Chicago、Vancouver、IEEE）間擬引。此技覆自 BibTeX 條轉為 APA 7、Chicago、Vancouver、IEEE 及定式之正文中引與參列。用 Pandoc citeproc、knitcitations 包、Quarto 原生引擎以成可複文。

## 用

- 渲含引之 R Markdown 或 Quarto 文
- 轉書庫於不同引式間
- 自 .bib 生獨參列
- 驗文中引匹特式導
- 設多文項（書、論）之引基

## 入

- **必**：.bib 文（或 Pandoc 識之他書源）
- **必**：標引式（如 `apa`、`chicago-author-date`、`ieee`）
- **可**：CSL 文徑（默：用 Pandoc 內式）
- **可**：出式（`html`、`pdf`、`docx`；默：自文推）
- **可**：語之地（默：`en-US`）

## 行

### 一：驗引基

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

得：Pandoc 2.11+ 察並內含 citeproc。

敗：裝 Pandoc 或於 `.Renviron` 設 `RSTUDIO_PANDOC` 指 RStudio 捆之 Pandoc。Quarto 亦攜己 Pandoc。

### 二：設文 YAML 為引

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

得：YAML 首正引 .bib 文與 CSL 式。

敗：CSL 文不存→自 CSL 庫下（見三步）置於項目錄。

### 三：取 CSL 式文

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

得：CSL 文已下至項目錄。

敗：察網連。CSL GitHub 庫含 10,000+ 式。離線用→項中捆所需 CSL 文。

### 四：書文中引

於文體用 Pandoc 引語：

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

得：Pandoc/Quarto 渲為標式之正擬引（如 APA 之 `(Smith, 2020)`，Chicago 之 `(Smith 2020)`）。

### 五：以 R 生獨參列

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

得：擬參列印於控或捕為字向為後處。

### 六：引式間轉

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

Quarto：

```bash
quarto render document.qmd --metadata csl:apa.csl -o output_apa.html
quarto render document.qmd --metadata csl:ieee.csl -o output_ieee.html
```

得：多出文，各以異引式擬同容。

敗：渲敗→察文中諸引鍵存於 .bib。缺鍵生警而或破擬。

### 七：驗引擬

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

得：報示未定鍵（引而不於 .bib）、未用條（於 .bib 而未引）、及有效引。

敗：郵址或含 `@` 之碼或偽正。精正則或手閱標鍵。

## 驗

- [ ] 文渲無 Pandoc/citeproc 之引警
- [ ] 文中諸 `@key` 引皆解為 .bib 條
- [ ] 參列現於文末（或於 `div#refs`）
- [ ] 文中引匹標式
- [ ] 引序循式規（APA 字母、IEEE 序號）
- [ ] 自文中引至參列之鏈運（若 `link-citations: true`）

## 忌

- **缺 CSL 文**：無定 CSL→Pandoc 退至 Chicago 作者-日。式一致→必明設 `csl:`
- **引鍵誤**：誤鍵如 `@Smtih2020` 默擬為字。以 `--verbose` 啟 Pandoc 警捕之
- **地依擬**：APA 於英用「and」於德用「und」。於 YAML 首設 `lang:` 以匹
- **nocite 為未引條**：欲入條於參列而不於文引→加 `nocite: '@*'`（諸）或 `nocite: '@key1, @key2'` 於 YAML
- **CSL 版錯**：某 CSL 0.8 舊文不容現代 Pandoc。恒用官庫之 CSL 1.0+
- **Quarto 對 R Markdown 異**：Quarto 默 `cite-method: citeproc`；R Markdown 或須明 `pandoc_args: ["--citeproc"]`

## 參

- `manage-bibliography` - 造並維此技所用之 .bib 文
- `validate-references` - 擬前驗 .bib 條全
- `../reporting/format-apa-report` - 引外之全 APA 報擬
- `../reporting/create-quarto-report` - 含引持之 Quarto 文設
