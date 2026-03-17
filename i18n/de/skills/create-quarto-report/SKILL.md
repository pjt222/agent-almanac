---
name: create-quarto-report
description: >
  Ein Quarto-Dokument fuer reproduzierbare Berichte, Praesentationen oder
  Websites erstellen. Umfasst YAML-Konfiguration, Code-Chunk-Optionen,
  Ausgabeformate, Querverweise und Rendering. Verwenden, wenn ein
  reproduzierbarer Analysebericht erstellt, eine Praesentation mit
  eingebettetem Code aufgebaut, HTML-, PDF- oder Word-Dokumente aus Code
  generiert oder ein vorhandenes R-Markdown-Dokument zu Quarto migriert
  werden soll.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: basic
  language: R
  tags: quarto, report, reproducible, rmarkdown, publishing
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Quarto-Bericht erstellen

Ein reproduzierbares Quarto-Dokument fuer Analyseberichte, Praesentationen oder Websites einrichten und verfassen.

## Wann verwenden

- Einen reproduzierbaren Analysebericht erstellen
- Eine Praesentation mit eingebettetem Code aufbauen
- HTML-, PDF- oder Word-Dokumente aus Code generieren
- Von R Markdown zu Quarto migrieren

## Eingaben

- **Erforderlich**: Berichtsthema und Zielgruppe
- **Erforderlich**: Ausgabeformat (html, pdf, docx, revealjs)
- **Optional**: Datenquellen und Analysecode
- **Optional**: Zitations-Bibliografie (.bib-Datei)

## Vorgehensweise

### Schritt 1: Quarto-Dokument erstellen

`report.qmd` erstellen:

```yaml
---
title: "Analysis Report"
author: "Author Name"
date: today
format:
  html:
    toc: true
    toc-depth: 3
    code-fold: true
    theme: cosmo
    self-contained: true
execute:
  echo: true
  warning: false
  message: false
bibliography: references.bib
---
```

**Erwartet:** Datei `report.qmd` existiert mit gueltigem YAML-Frontmatter einschliesslich Titel, Autor, Datum, Format-Konfiguration und Ausfuehrungsoptionen.

**Bei Fehler:** Den YAML-Header validieren, indem auf uebereinstimmende `---`-Trennzeichen und korrekte Einrueckung geprueft wird. Sicherstellen, dass der `format:`-Schluessel einem der unterstuetzten Quarto-Ausgabeformate entspricht (`html`, `pdf`, `docx`, `revealjs`).

### Schritt 2: Inhalt mit Code-Chunks schreiben

````markdown
## Introduction

This report analyzes the relationship between variables X and Y.

## Data

```{r}
#| label: load-data
library(dplyr)
library(ggplot2)

data <- read.csv("data.csv")
glimpse(data)
```

## Analysis

```{r}
#| label: fig-scatter
#| fig-cap: "Scatter plot of X vs Y"
#| fig-width: 8
#| fig-height: 6

ggplot(data, aes(x = x_var, y = y_var)) +
  geom_point(alpha = 0.6) +
  geom_smooth(method = "lm") +
  theme_minimal()
```

As shown in @fig-scatter, there is a positive relationship.

## Results

```{r}
#| label: tbl-summary
#| tbl-cap: "Summary statistics"

data |>
  summarise(
    mean_x = mean(x_var),
    sd_x = sd(x_var),
    mean_y = mean(y_var),
    sd_y = sd(y_var)
  ) |>
  knitr::kable(digits = 2)
```

See @tbl-summary for descriptive statistics.
````

**Erwartet:** Inhaltsabschnitte enthalten korrekt formatierte Code-Chunks mit `{r}`-Sprachkennung und `#|`-Chunk-Optionen fuer Labels, Beschriftungen und Abmessungen.

**Bei Fehler:** Ueberpruefen, dass Code-Chunks die ` ```{r} `-Syntax verwenden (nicht Inline-Backticks), dass `#|`-Optionen innerhalb des Chunks stehen (nicht im YAML-Header) und dass Label-Praefixe den Querverweis-Typen entsprechen (`fig-` fuer Abbildungen, `tbl-` fuer Tabellen).

### Schritt 3: Chunk-Optionen konfigurieren

Gaengige Chunk-Optionen (mit `#|`-Syntax):

```
#| label: chunk-name        # Required for cross-references
#| echo: false               # Hide code
#| eval: false               # Show but don't run
#| output: false             # Run but hide output
#| fig-width: 8              # Figure dimensions
#| fig-height: 6
#| fig-cap: "Caption text"   # Enable @fig-name references
#| tbl-cap: "Caption text"   # Enable @tbl-name references
#| cache: true               # Cache expensive computations
```

**Erwartet:** Chunk-Optionen werden auf Chunk-Ebene mit `#|`-Syntax angewendet, und Labels folgen den fuer Querverweise erforderlichen Namenskonventionen.

**Bei Fehler:** Sicherstellen, dass Chunk-Optionen die `#|`-Syntax (Quarto-nativ) verwenden, nicht die alte `{r, option=value}`-R-Markdown-Syntax. Ueberpruefen, dass Label-Namen nur alphanumerische Zeichen und Bindestriche enthalten.

### Schritt 4: Querverweise und Zitationen hinzufuegen

```markdown
See @fig-scatter for the visualization and @tbl-summary for statistics.

This approach follows @smith2023 methodology.

::: {#fig-combined layout-ncol=2}
![Plot A](plot_a.png){#fig-plotA}
![Plot B](plot_b.png){#fig-plotB}

Combined figure caption
:::
```

**Erwartet:** Querverweise (`@fig-name`, `@tbl-name`) verweisen auf die korrekten Abbildungen und Tabellen, und Zitationen (`@key`) stimmen mit Eintraegen in der `.bib`-Datei ueberein.

**Bei Fehler:** Ueberpruefen, dass referenzierte Labels in Code-Chunks mit dem korrekten Praefix (`fig-`, `tbl-`) existieren. Fuer Zitationen pruefen, dass `.bib`-Schluessel exakt uebereinstimmen (Gross-/Kleinschreibung beachten) und dass `bibliography:` im YAML-Header gesetzt ist.

### Schritt 5: Dokument rendern

```bash
quarto render report.qmd

# Specific format
quarto render report.qmd --to pdf
quarto render report.qmd --to docx

# Preview with live reload
quarto preview report.qmd
```

**Erwartet:** Ausgabedatei im angegebenen Format generiert.

**Bei Fehler:**
- Fehlendes Quarto: Von https://quarto.org/docs/get-started/ installieren
- PDF-Fehler: TinyTeX installieren mit `quarto install tinytex`
- R-Paket-Fehler: Sicherstellen, dass alle Pakete installiert sind

### Schritt 6: Mehrformat-Ausgabe

```yaml
format:
  html:
    toc: true
    theme: cosmo
  pdf:
    documentclass: article
    geometry: margin=1in
  docx:
    reference-doc: template.docx
```

Alle Formate rendern: `quarto render report.qmd`

**Erwartet:** Alle angegebenen Ausgabeformate werden erfolgreich generiert, jeweils mit korrektem Styling und Layout fuer das Zielformat.

**Bei Fehler:** Wenn ein Format fehlschlaegt waehrend andere erfolgreich sind, formatspezifische Anforderungen pruefen: PDF benoetigt eine LaTeX-Engine (installieren mit `quarto install tinytex`), DOCX benoetigt eine gueltige Referenzvorlage falls angegeben, und formatspezifische YAML-Optionen muessen korrekt unter jedem Format-Schluessel verschachtelt sein.

## Validierung

- [ ] Dokument rendert ohne Fehler
- [ ] Alle Code-Chunks werden korrekt ausgefuehrt
- [ ] Querverweise werden aufgeloest (Abbildungen, Tabellen, Zitationen)
- [ ] Inhaltsverzeichnis ist korrekt
- [ ] Ausgabeformat ist fuer die Zielgruppe geeignet

## Haeufige Fehler

- **Fehlendes Label-Praefix**: Querverweis-faehige Abbildungen benoetigen `fig-`-Praefix im Label, Tabellen benoetigen `tbl-`
- **Cache-Invalidierung**: Gecachte Chunks werden nicht erneut ausgefuehrt, wenn sich vorgelagerte Daten aendern. `_cache/` loeschen, um dies zu erzwingen.
- **PDF ohne LaTeX**: TinyTeX installieren oder `format: pdf` mit `pdf-engine: weasyprint` fuer CSS-basiertes PDF verwenden
- **R-Markdown-Syntax in Quarto**: `#|`-Chunk-Optionen statt `{r, echo=FALSE}`-Stil verwenden

## Verwandte Skills

- `format-apa-report` - APA-formatierte akademische Berichte
- `build-parameterized-report` - Parametrisierte Mehrfach-Berichtsgenerierung
- `generate-statistical-tables` - Publikationsreife Tabellen
- `write-vignette` - Quarto-Vignetten in R-Paketen
