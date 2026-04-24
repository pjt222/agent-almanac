---
name: format-apa-report
locale: caveman-ultra
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

Create APA 7th edition report via Quarto (apaquarto) or R Markdown (papaja).

## Use When

- Academic paper APA
- Psychology/social science report
- Reproducible manuscripts w/ embedded analysis
- Thesis/dissertation chapter

## In

- **Required**: Analysis code + results
- **Required**: Bibliography (.bib)
- **Optional**: Co-authors + affiliations
- **Optional**: Manuscript type (journal, student)

## Do

### Step 1: Choose Framework

**Option A: apaquarto (Quarto, recommended)**

```r
install.packages("remotes")
remotes::install_github("wjschne/apaquarto")
```

**Option B: papaja (R Markdown)**

```r
remotes::install_github("crsh/papaja")
```

→ Chosen framework installs + loadable via `library(apaquarto)` or `library(papaja)`.

If err: install fails due to missing system deps (LaTeX for PDF) → install TinyTeX first `quarto install tinytex`. GitHub install fails → check `remotes` installed + GitHub accessible.

### Step 2: Create Doc (apaquarto)

Create `manuscript.qmd`:

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

→ `manuscript.qmd` valid YAML: title, shorttitle, author affiliations, abstract, keywords, bibliography ref, APA format options.

If err: verify YAML indent consistent (2 spaces), `author:` entries list format w/ `name:`, `affiliations:`, `corresponding:`. Check `bibliography:` points to existing `.bib`.

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

→ Content follows APA section structure (Intro, Method, Results, Discussion, References) w/ inline R for stats + proper cross-refs via `@fig-` + `@tbl-`.

If err: inline R no render → verify backtick-r syntax (`` `r expression` ``). Cross-refs as literal text → check chunk labels correct prefix + chunk has caption option.

### Step 4: APA Tables

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

→ Tables render APA: italicized headers for stat symbols, proper decimal alignment, descriptive caption above.

If err: `gt` no APA style → `gt` installed + `cols_label()` md italics (`*M*`, `*SD*`). Papaja → `apa_table()` not `gt()`.

### Step 5: Citations

Create `references.bib`:

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

APA styles:
- Parenthetical: `[@smith2023]` -> (Smith & Jones, 2023)
- Narrative: `@smith2023` -> Smith and Jones (2023)
- Multiple: `[@smith2023; @jones2022]` -> (Jones, 2022; Smith & Jones, 2023)

→ `references.bib` valid BibTeX w/ all required fields (author, title, year, journal) + keys match manuscript.

If err: validate BibTeX via online or `bibtool -d references.bib`. Text keys exactly match `.bib` keys (case-sensitive).

### Step 6: Render

```bash
# Word document (common for journal submission)
quarto render manuscript.qmd --to apaquarto-docx

# PDF (for preprint or review)
quarto render manuscript.qmd --to apaquarto-pdf
```

→ APA doc properly formatted: title page, running head, references section.

If err: PDF fails → TinyTeX installed (`quarto install tinytex`). DOCX issues → apaquarto Word template accessible. No references → `# References` heading at end.

## Check

- [ ] Title page correct (title, authors, affiliations, author note)
- [ ] Abstract w/ keywords
- [ ] In-text citations match reference list
- [ ] Tables + figures numbered correctly
- [ ] Stats APA (italicized, proper symbols)
- [ ] References APA 7th edition
- [ ] Page numbers + running head (PDF)

## Traps

- **Inline R formatting**: Backtick-r for stats, not hardcoded.
- **Citation key mismatch**: .bib keys match exactly in text.
- **Figure placement**: APA manuscripts typically figures at end → `documentmode: man`.
- **Missing CSL**: apaquarto includes APA CSL; papaja may need `csl: apa.csl`.
- **Special chars abstracts**: Avoid markdown formatting in YAML abstract block.

## →

- `create-quarto-report` — general Quarto doc
- `generate-statistical-tables` — publication-ready tables
- `build-parameterized-report` — batch generation
