---
name: format-citations
locale: caveman
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

Format citations across academic styles using CSL (Citation Style Language) processors and R tooling. This skill covers turning BibTeX entries into properly formatted in-text citations and reference lists for APA 7, Chicago, Vancouver, IEEE, and custom styles. Uses Pandoc's citeproc, knitcitations package, and Quarto's native citation engine for reproducible document making.

## When Use

- Rendering R Markdown or Quarto document with formatted citations
- Turning bibliography from one citation style to another
- Making standalone reference list from .bib file
- Check that in-text citations match specific style guide
- Setting up citation infra for multi-document project (book, thesis)

## Inputs

- **Required**: .bib file (or other bibliography source known by Pandoc)
- **Required**: Target citation style (e.g., `apa`, `chicago-author-date`, `ieee`)
- **Optional**: CSL file path (default: uses Pandoc built-in styles)
- **Optional**: Output format (`html`, `pdf`, `docx`; default: guessed from document)
- **Optional**: Locale for lang-specific format (default: `en-US`)

## Steps

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

**Got:** Pandoc version 2.11+ spotted with built-in citeproc support.

**If fail:** Install Pandoc or set `RSTUDIO_PANDOC` in `.Renviron` to point to RStudio-bundled Pandoc. Quarto also ships its own Pandoc.

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

**Got:** YAML header right refs .bib file and CSL style.

**If fail:** CSL file not found? Download it from CSL repo (see Step 3) and place it in project directory.

### Step 3: Obtain CSL Style Files

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

**Got:** CSL file downloaded to project directory.

**If fail:** Check network. CSL GitHub repo has 10,000+ styles. For offline use, bundle needed CSL files in project.

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

**Got:** Pandoc/Quarto renders these into properly formatted citations in target style (e.g., `(Smith, 2020)` for APA, `(Smith 2020)` for Chicago).

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

**Got:** Formatted reference list printed to console or caught as char vector for more handle.

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

**Got:** Many output files, each with same content formatted in different citation style.

**If fail:** Rendering fails? Check all citation keys in document body exist in .bib file. Missing keys make warnings but may break format.

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

**Got:** Report of undefined keys (cited but not in .bib), unused entries (in .bib but never cited), and valid citations.

**If fail:** False positives may show up with email addresses or code with `@`. Refine regex or by hand review flagged keys.

## Validation

- [ ] Document renders with no citation warnings from Pandoc/citeproc
- [ ] All `@key` refs in document resolve to .bib entries
- [ ] Reference list shows at end of document (or in `div#refs`)
- [ ] In-text citations match target style format
- [ ] Citation sorting follows style rules (alphabetical for APA, numbered for IEEE)
- [ ] Hyperlinks from in-text citations to reference list entries work (if `link-citations: true`)

## Pitfalls

- **Missing CSL file**: Pandoc falls back to Chicago author-date if no CSL is set. Always set `csl:` clear for style consistency
- **Citation key typos**: Misspelled key like `@Smtih2020` silent renders as literal text. Turn on Pandoc warnings with `--verbose` to catch these
- **Locale-dependent format**: APA needs "and" between authors in English but "und" in German. Set `lang:` in YAML header to match
- **nocite for uncited entries**: To add entries in reference list with no cite in text, add `nocite: '@*'` (all) or `nocite: '@key1, @key2'` to YAML
- **CSL version mismatch**: Some older CSL 0.8 files clash with modern Pandoc. Always use CSL 1.0+ from official repo
- **Quarto vs R Markdown diffs**: Quarto uses `cite-method: citeproc` by default; R Markdown may need clear `pandoc_args: ["--citeproc"]`

## See Also

- `manage-bibliography` - make and keep .bib files this skill consumes
- `validate-references` - check .bib entry completeness before format
- `../reporting/format-apa-report` - full APA report format beyond citations
- `../reporting/create-quarto-report` - Quarto document setup with citation support
