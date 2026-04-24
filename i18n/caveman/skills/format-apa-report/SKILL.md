---
name: format-apa-report
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Format a Quarto or R Markdown report following APA 7th edition style.
  Covers apaquarto/papaja packages, title page, abstracts, citations,
  tables, figures, and reference formatting. Use when writing an academic
  paper in APA format, creating a psychology or social science research
  report, generating reproducible manuscripts with embedded analysis,
  or preparing a thesis or dissertation chapter.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: apa, academic, psychology, quarto, papaja
---

# Format APA Report

Make APA 7th edition formatted report using Quarto (apaquarto) or R Markdown (papaja).

## When Use

- Writing academic paper in APA format
- Making psychology or social science research report
- Making reproducible manuscripts with embedded analysis
- Prepping thesis or dissertation chapter

## Inputs

- **Required**: Analysis code and results
- **Required**: Bibliography file (.bib)
- **Optional**: Co-authors and affiliations
- **Optional**: Manuscript type (journal article, student paper)

## Steps

### Step 1: Choose Framework

**Option A: apaquarto (Quarto, advised)**

```r
install.packages("remotes")
remotes::install_github("wjschne/apaquarto")
```

**Option B: papaja (R Markdown)**

```r
remotes::install_github("crsh/papaja")
```

**Got:** Picked framework package installs OK and is loadable with `library(apaquarto)` or `library(papaja)`.

**If fail:** Install fails due to missing system deps (e.g., LaTeX for PDF output)? Install TinyTeX first with `quarto install tinytex`. For GitHub install fails, check `remotes` package is installed and GitHub is open.

### Step 2: Create Document (apaquarto)

Make `manuscript.qmd`:

```yaml
---
title: "Effects of Variable X on Outcome Y"
shorttitle: "Effects of X on Y"
author:
  - name: First Author
    corresponding: true
    orcid: 0000-0000-0000-0000
    email: author@university.edu
    affiliations:
      - name: University Name
        department: Department of Psychology
  - name: Second Author
    affiliations:
      - name: Other University
abstract: |
  This study examined the relationship between X and Y.
  Using a sample of N = 200 participants, we found...
  Results are discussed in terms of theoretical implications.
keywords: [keyword1, keyword2, keyword3]
bibliography: references.bib
format:
  apaquarto-docx: default
  apaquarto-pdf:
    documentmode: man
---
```

**Got:** File `manuscript.qmd` exists with valid YAML frontmatter holding title, shorttitle, author affiliations, abstract, keywords, bibliography ref, and APA-specific format options.

**If fail:** Check YAML indentation is consistent (2 spaces) and that `author:` entries use list format with `name:`, `affiliations:`, and `corresponding:` fields. Check `bibliography:` points to existing `.bib` file.

### Step 3: Write APA Content

````markdown
# Introduction

Previous research has established that... [@smith2023; @jones2022].
@smith2023 found significant effects of X on Y.

# Method

## Participants

We recruited `r nrow(data)` participants (*M*~age~ = `r mean(data$age)`,
*SD* = `r sd(data$age)`).

## Materials

The study used the Measurement Scale [@author2020].

## Procedure

Participants completed... (see @fig-design for the study design).

# Results

```{r}
#| label: fig-results
#| fig-cap: "Mean scores by condition with 95% confidence intervals."
#| fig-width: 6
#| fig-height: 4

ggplot(summary_data, aes(x = condition, y = mean, fill = condition)) +
  geom_col() +
  geom_errorbar(aes(ymin = ci_lower, ymax = ci_upper), width = 0.2) +
  theme_apa()
```

A two-way ANOVA revealed a significant main effect of condition,
*F*(`r anova_result$df1`, `r anova_result$df2`) = `r anova_result$F`,
*p* `r format_pvalue(anova_result$p)`, $\eta^2_p$ = `r anova_result$eta`.

# Discussion

The findings support the hypothesis that...

# References
````

**Got:** Content follows APA section shape (Introduction, Method, Results, Discussion, References) with inline R code for stats and proper cross-refs using `@fig-` and `@tbl-` prefixes.

**If fail:** Inline R code not render? Check backtick-r syntax is right (`` `r expression` ``). Cross-refs show as literal text? Check ref chunk labels use right prefix and chunk has matching caption option.

### Step 4: Format Tables in APA Style

```r
#| label: tbl-descriptives
#| tbl-cap: "Descriptive Statistics by Condition"

library(gt)

descriptive_table <- data |>
  group_by(condition) |>
  summarise(
    M = mean(score),
    SD = sd(score),
    n = n()
  )

gt(descriptive_table) |>
  fmt_number(columns = c(M, SD), decimals = 2) |>
  cols_label(
    condition = "Condition",
    M = "*M*",
    SD = "*SD*",
    n = "*n*"
  )
```

**Got:** Tables render with APA format: italic col headers for stat symbols, proper decimal align, and descriptive caption above table.

**If fail:** `gt` table not render in APA style? Check `gt` package is installed and that `cols_label()` uses markdown-style italics (`*M*`, `*SD*`). For papaja users, use `apa_table()` not `gt()`.

### Step 5: Manage Citations

Make `references.bib`:

```bibtex
@article{smith2023,
  author = {Smith, John A. and Jones, Mary B.},
  title = {Effects of intervention on outcomes},
  journal = {Journal of Psychology},
  year = {2023},
  volume = {45},
  pages = {123--145},
  doi = {10.1000/example}
}
```

APA citation styles:
- Parenthetical: `[@smith2023]` -> (Smith & Jones, 2023)
- Narrative: `@smith2023` -> Smith and Jones (2023)
- Multiple: `[@smith2023; @jones2022]` -> (Jones, 2022; Smith & Jones, 2023)

**Got:** `references.bib` has valid BibTeX entries with all needed fields (author, title, year, journal) and citation keys match those used in manuscript text.

**If fail:** Check BibTeX syntax with online validator or `bibtool -d references.bib`. Make sure citation keys in text exact match `.bib` keys (case-sensitive).

### Step 6: Render

```bash
# Word document (common for journal submission)
quarto render manuscript.qmd --to apaquarto-docx

# PDF (for preprint or review)
quarto render manuscript.qmd --to apaquarto-pdf
```

**Got:** Properly formatted APA document with title page, running head, and rightly formatted references section.

**If fail:** PDF render fails? Check TinyTeX is installed (`quarto install tinytex`). DOCX output issues? Check apaquarto Word template is open. References not show? Make sure `# References` heading is at end of doc.

## Validation

- [ ] Title page formatted right (title, authors, affiliations, author note)
- [ ] Abstract present with keywords
- [ ] In-text citations match reference list
- [ ] Tables and figures numbered right
- [ ] Stats formatted per APA (italic, proper symbols)
- [ ] References in APA 7th edition format
- [ ] Page numbers and running head present (PDF)

## Pitfalls

- **Inline R code format**: Use backtick-r syntax for inline stats, not hardcoded values
- **Citation key mismatches**: Make sure .bib keys match exact in text
- **Figure placement**: APA manuscripts usually place figures at end; set `documentmode: man`
- **Missing CSL file**: apaquarto has APA CSL; papaja users may need to set `csl: apa.csl`
- **Special chars in abstracts**: Avoid markdown format in YAML abstract block

## See Also

- `create-quarto-report` - general Quarto document make
- `generate-statistical-tables` - publication-ready tables
- `build-parameterized-report` - batch report make
