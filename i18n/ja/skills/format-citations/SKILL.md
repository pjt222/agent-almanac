---
name: format-citations
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
  locale: ja
  source_locale: en
  source_commit: 1d84967e5
  fence_basis_commit: 1d84967e5
  translator: "(untranslated stub)"
  translation_date: "2026-08-11"
---

# Format Citations

Format citations across academic styles using CSL (Citation Style Language)
processors and R tooling. This skill covers converting BibTeX entries into
properly formatted in-text citations and reference lists for APA 7, Chicago,
Vancouver, IEEE, and custom styles. It leverages Pandoc's citeproc, the
knitcitations package, and Quarto's native citation engine for reproducible
document production.

## When to Use

- Rendering an R Markdown or Quarto document with formatted citations
- Converting a bibliography from one citation style to another
- Generating a standalone reference list from a .bib file
- Validating that in-text citations match a specific style guide
- Setting up citation infrastructure for a multi-document project (book, thesis)

## Inputs

- **Required**: A .bib file (or other bibliography source recognized by Pandoc)
- **Required**: Target citation style (e.g., `apa`, `chicago-author-date`, `ieee`)
- **Optional**: CSL file path (default: uses Pandoc built-in styles)
- **Optional**: Output format (`html`, `pdf`, `docx`; default: inferred from document)
- **Optional**: Locale for language-specific formatting (default: `en-US`)

## Procedure

### Step 1: Verify Citation Infrastructure

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

**Expected:** Pandoc version 2.11+ detected with built-in citeproc support.

**On failure:** Install Pandoc or set `RSTUDIO_PANDOC` in `.Renviron` to point to
the RStudio-bundled Pandoc. Quarto also ships its own Pandoc.

### Step 2: Configure Document YAML for Citations

For R Markdown:

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

For Quarto:

```yaml
---
title: "My Document"
bibliography: references.bib
csl: apa.csl
link-citations: true
cite-method: citeproc
---
```

**Expected:** YAML header correctly references the .bib file and CSL style.

**On failure:** If the CSL file is not found, download it from the CSL repository
(see Step 3) and place it in the project directory.

### Step 3: Obtain and Customize CSL Style Files

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

A downloaded style is rarely the last word — journals routinely deviate from the
canonical style in small ways, and the fix is to edit the `.csl` file rather than to
post-process the rendered output.

A CSL style is XML rooted in a `<style>` element that declares the CSL namespace as
its default (`xmlns="http://purl.org/net/xbiblio/csl"`). Elements inside the file are
therefore written **unprefixed** — `<citation>`, `<bibliography>`, `<sort>`. The CSL
specification names the same elements as `cs:style`, `cs:citation` and so on; that
prefix is the spec's notation for talking about them, not text you will find in
`apa.csl`. Searching a downloaded style for `<cs:citation>` returns nothing.

Four parts account for nearly every journal-specific tweak:

- **Where the two formats live.** `<citation>` is required and appears exactly once;
  it controls the in-text citation or footnote. `<bibliography>` is optional and
  controls the reference list. Changing how a citation looks in the text and changing
  how it looks in the reference list are edits to *different* elements — this is the
  most common source of "I changed it and nothing happened".
- **Sort order.** Both `<citation>` and `<bibliography>` may carry a `<sort>` child,
  which must appear *before* `<layout>` and must contain one or more `<key>`
  elements. This is what switches a bibliography between author-alphabetical,
  by-year, and citation-order.
- **"et al." thresholds.** `et-al-min` and `et-al-use-first` together enable et-al
  abbreviation: once the author count reaches `et-al-min`, the list truncates after
  `et-al-use-first` names. Set them on `<name>`, or inherit them from `<style>`,
  `<citation>`, or `<bibliography>`.
- **Localization.** Set the `default-locale` attribute on the root `<style>` element
  to translate style-generated terms ("and", "et al.", "eds."). The attribute is
  `default-locale` — a bare `locale` attribute belongs on `<locale>` elements and
  will not do this.

Validate any edited style at <https://validator.citationstyles.org/>, which checks a
file (by URL, upload, or paste) against the CSL schema and reports the offending line.
Do this before rendering: Pandoc's failure mode for a malformed style is unhelpful.

**Expected:** CSL file downloaded to the project directory, and any journal-specific
edits validate cleanly against the CSL schema.

**On failure:** Check network connectivity. The CSL GitHub repository contains 10,000+
styles. For offline use, bundle required CSL files in the project. If an edited style
fails validation, the validator names the line — the usual causes are a `<sort>`
placed after `<layout>` rather than before it, and a misspelled attribute, which the
schema rejects rather than ignores.

### Step 4: Write In-Text Citations

Use Pandoc citation syntax in your document body:

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

**Expected:** Pandoc/Quarto renders these into properly formatted citations in the
target style (e.g., `(Smith, 2020)` for APA, `(Smith 2020)` for Chicago).

### Step 5: Generate Standalone Reference Lists with R

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

**Expected:** Formatted reference list printed to console or captured as character
vector for further processing.

### Step 6: Convert Between Citation Styles

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

For Quarto:

```bash
quarto render document.qmd --metadata csl:apa.csl -o output_apa.html
quarto render document.qmd --metadata csl:ieee.csl -o output_ieee.html
```

**Expected:** Multiple output files, each with the same content formatted in a
different citation style.

**On failure:** If rendering fails, check that all citation keys in the document body
exist in the .bib file. Missing keys produce warnings but may break formatting.

### Step 7: Validate Citation Formatting

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

**Expected:** Report of undefined keys (cited but not in .bib), unused entries
(in .bib but never cited), and valid citations.

**On failure:** False positives may occur with email addresses or code containing `@`.
Refine the regex or manually review flagged keys.

## Validation

- [ ] Document renders without citation warnings from Pandoc/citeproc
- [ ] All `@key` references in the document resolve to .bib entries
- [ ] Reference list appears at the end of the document (or in `div#refs`)
- [ ] In-text citations match the target style format
- [ ] Citation sorting follows style rules (alphabetical for APA, numbered for IEEE)
- [ ] Hyperlinks from in-text citations to reference list entries work (if `link-citations: true`)

## Common Pitfalls

- **Missing CSL file**: Pandoc falls back to Chicago author-date if no CSL is
  specified. Always set `csl:` explicitly for style consistency
- **Citation key typos**: A misspelled key like `@Smtih2020` silently renders as
  literal text. Enable Pandoc warnings with `--verbose` to catch these
- **Locale-dependent formatting**: APA requires "and" between authors in English
  but "und" in German. Set `lang:` in the YAML header to match
- **nocite for uncited entries**: To include entries in the reference list without
  citing them in text, add `nocite: '@*'` (all) or `nocite: '@key1, @key2'` to YAML
- **CSL version mismatch**: Some older CSL 0.8 files are incompatible with modern
  Pandoc. Always use CSL 1.0+ from the official repository
- **Quarto vs R Markdown differences**: Quarto uses `cite-method: citeproc` by
  default; R Markdown may need explicit `pandoc_args: ["--citeproc"]`
- **Confusing CSL styles with LaTeX bibliography styles**: three separate formats
  answer to "APA style" and none is interchangeable with the others. `.csl` drives
  Pandoc, Quarto, and Zotero. Legacy BibTeX uses `.bst` files, selected with
  `\bibliographystyle{}` and processed by the `bibtex` program. Modern biblatex uses
  its own `.bbx`/`.cbx` styles, selected with `\usepackage[style=apa]{biblatex}` and
  processed by `biber`. Putting a `.csl` filename in a `csl:` field is right; putting
  one anywhere in a LaTeX preamble is not, and each of these tools fails on the
  others' files in ways that do not name the cause

## Related Skills

- `manage-bibliography` - create and maintain the .bib files this skill consumes
- `validate-references` - verify .bib entry completeness before formatting
- `../reporting/format-apa-report` - full APA report formatting beyond citations
- `../reporting/create-quarto-report` - Quarto document setup with citation support
