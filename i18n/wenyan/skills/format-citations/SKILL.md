---
name: format-citations
locale: wenyan
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

以 CSL（Citation Style Language）處理器與 R 具格諸學風之引用。此技含 BibTeX 條轉為正格 APA 7、Chicago、Vancouver、IEEE、自風之文內引與參考列。用 Pandoc citeproc、knitcitations 包、Quarto 原引擎以造可復製之文。

## 用時

- 渲附格引之 R Markdown 或 Quarto 文
- 轉參考自一引風至另一
- 自 .bib 生獨立參考列
- 驗文內引合某風
- 為多文項（書、論）設引基設

## 入

- **必要**：.bib 檔（或 Pandoc 認之他參源）
- **必要**：目引風（如 `apa`、`chicago-author-date`、`ieee`）
- **可選**：CSL 檔路（默：用 Pandoc 內建風）
- **可選**：出格（`html`、`pdf`、`docx`；默：自文推）
- **可選**：語特格之 locale（默 `en-US`）

## 法

### 第一步：驗引基設

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

**得：** Pandoc 版本 2.11+ 察附內建 citeproc 援。

**敗則：** 裝 Pandoc 或於 `.Renviron` 設 `RSTUDIO_PANDOC` 指 RStudio 所附 Pandoc。Quarto 亦自攜 Pandoc。

### 第二步：設文 YAML 供引

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

**得：** YAML 頭正引 .bib 與 CSL 風。

**敗則：** 若 CSL 檔不見，自 CSL 庫下（見三步）置於項目。

### 第三步：取 CSL 風檔

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

**得：** CSL 檔下至項目。

**敗則：** 察網。CSL GitHub 庫含萬餘風。離線用則將所需 CSL 捆於項目。

### 第四步：書文內引

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

**得：** Pandoc/Quarto 渲此為目風之正格引（如 APA 之 `(Smith, 2020)`、Chicago 之 `(Smith 2020)`）。

### 第五步：以 R 生獨立參考列

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

**得：** 格之參考列印於控台或捕為字向供後處。

### 第六步：轉引風

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

**得：** 多出檔，同容各以異引風格。

**敗則：** 若渲敗，察文體諸引鍵於 .bib 存。缺鍵生警然或破格。

### 第七步：驗引格

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

**得：** 未定鍵（引而不於 .bib）、未用條（於 .bib 而未引）、與有效引之報。

**敗則：** 郵址或含 `@` 之碼或致誤肯。精正則或手審所標鍵。

## 驗

- [ ] 文渲無 Pandoc/citeproc 引警
- [ ] 文中諸 `@key` 皆解於 .bib
- [ ] 參列於文末現（或 `div#refs`）
- [ ] 文內引合目風格
- [ ] 引序循風則（APA 字序、IEEE 編序）
- [ ] 文內引至參列之超鏈行（若 `link-citations: true`）

## 陷

- **缺 CSL 檔**：若無 CSL 指，Pandoc 退至 Chicago author-date。恆明設 `csl:` 以一
- **引鍵拼誤**：拼誤鍵如 `@Smtih2020` 默渲為字。以 `--verbose` 啟 Pandoc 警以捕
- **locale 格異**：APA 英中作者間用「and」，德用「und」。於 YAML 頭設 `lang:` 以合
- **nocite 供未引條**：欲參列含文中未引條，於 YAML 加 `nocite: '@*'`（諸）或 `nocite: '@key1, @key2'`
- **CSL 版失配**：老 CSL 0.8 檔或不兼現 Pandoc。恆用官庫之 CSL 1.0+
- **Quarto 對 R Markdown 異**：Quarto 默 `cite-method: citeproc`；R Markdown 或需明 `pandoc_args: ["--citeproc"]`

## 參

- `manage-bibliography` - 造並維此技所用之 .bib 檔
- `validate-references` - 格前驗 .bib 條全
- `../reporting/format-apa-report` - 引之外全 APA 報格
- `../reporting/create-quarto-report` - 附引援之 Quarto 文設
