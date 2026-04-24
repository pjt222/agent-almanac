---
name: format-citations
locale: caveman-ultra
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

# Format Citations

Format citations across academic styles via CSL (Citation Style Language) processors + R tooling. Convert BibTeX → formatted in-text + reference lists APA 7, Chicago, Vancouver, IEEE, custom. Leverages Pandoc citeproc, knitcitations, Quarto native engine.

## Use When

- Render Rmd/Quarto doc w/ formatted citations
- Convert bibliography 1 style → another
- Generate standalone reference list from .bib
- Validate in-text match style guide
- Setup citation infra multi-doc (book, thesis)

## In

- **Required**: .bib (or other bibliography source Pandoc recognizes)
- **Required**: Target style (`apa`, `chicago-author-date`, `ieee`)
- **Optional**: CSL file path (default Pandoc built-in)
- **Optional**: Output format (`html`, `pdf`, `docx`; default inferred)
- **Optional**: Locale (default `en-US`)

## Do

### Step 1: Verify Infra

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

→ Pandoc 2.11+ detected w/ built-in citeproc.

If err: install Pandoc or set `RSTUDIO_PANDOC` in `.Renviron` → RStudio-bundled. Quarto ships own Pandoc.

### Step 2: Configure YAML

R Markdown:

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

Quarto:

```yaml
---
title: "My Document"
bibliography: references.bib
csl: apa.csl
link-citations: true
cite-method: citeproc
---
```

→ YAML correctly references .bib + CSL.

If err: CSL not found → download from CSL repo (Step 3) + place in project.

### Step 3: Obtain CSL

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

→ CSL downloaded to project.

If err: check network. CSL GitHub has 10,000+ styles. Offline → bundle required CSL.

### Step 4: In-Text Citations

Pandoc citation syntax in body:

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

→ Pandoc/Quarto renders properly formatted in target style (`(Smith, 2020)` APA, `(Smith 2020)` Chicago).

### Step 5: Standalone Reference Lists via R

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

→ Formatted reference list to console or char vector.

### Step 6: Convert Between Styles

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

Quarto:

```bash
quarto render document.qmd --metadata csl:apa.csl -o output_apa.html
quarto render document.qmd --metadata csl:ieee.csl -o output_ieee.html
```

→ Multiple output files, same content diff styles.

If err: render fails → all citation keys in body exist in .bib. Missing keys produce warns but may break formatting.

### Step 7: Validate

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

→ Report undefined (cited not in .bib), unused (in .bib never cited), valid.

If err: false positives w/ email or code w/ `@`. Refine regex or manually review.

## Check

- [ ] Doc renders w/o citation warns Pandoc/citeproc
- [ ] All `@key` in doc resolve to .bib
- [ ] Reference list at end (or `div#refs`)
- [ ] In-text match target style
- [ ] Sorting follows rules (alphabetical APA, numbered IEEE)
- [ ] Hyperlinks in-text → reference list work (if `link-citations: true`)

## Traps

- **Missing CSL**: Pandoc falls back Chicago author-date if no CSL. Always `csl:` explicit.
- **Citation key typos**: `@Smtih2020` silently renders as literal text. `--verbose` catches.
- **Locale-dependent**: APA "and" English, "und" German. Set `lang:` in YAML.
- **nocite for uncited**: Include in reference list w/o citing → `nocite: '@*'` (all) or `nocite: '@key1, @key2'` in YAML.
- **CSL version mismatch**: Older CSL 0.8 incompat modern Pandoc. Use CSL 1.0+ official.
- **Quarto vs Rmd**: Quarto uses `cite-method: citeproc` default; Rmd may need `pandoc_args: ["--citeproc"]`.

## →

- `manage-bibliography` — create + maintain .bib this consumes
- `validate-references` — verify .bib completeness before formatting
- `../reporting/format-apa-report` — full APA beyond citations
- `../reporting/create-quarto-report` — Quarto doc w/ citation support
