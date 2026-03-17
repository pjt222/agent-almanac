---
name: format-apa-report
description: >
  Einen Quarto- oder R-Markdown-Bericht im APA-7-Format erstellen.
  Umfasst apaquarto/papaja-Pakete, Titelseite, Zusammenfassung, Zitationen,
  Tabellen, Abbildungen und Literaturverzeichnis-Formatierung. Verwenden,
  wenn eine akademische Arbeit im APA-Format geschrieben, ein
  psychologischer oder sozialwissenschaftlicher Forschungsbericht erstellt,
  reproduzierbare Manuskripte mit eingebetteter Analyse generiert oder ein
  Kapitel einer Abschlussarbeit vorbereitet werden soll.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: apa, academic, psychology, quarto, papaja
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# APA-Bericht formatieren

Einen Bericht im APA-7-Format mit Quarto (apaquarto) oder R Markdown (papaja) erstellen.

## Wann verwenden

- Eine akademische Arbeit im APA-Format schreiben
- Einen psychologischen oder sozialwissenschaftlichen Forschungsbericht erstellen
- Reproduzierbare Manuskripte mit eingebetteter Analyse generieren
- Ein Kapitel einer Abschlussarbeit oder Dissertation vorbereiten

## Eingaben

- **Erforderlich**: Analysecode und Ergebnisse
- **Erforderlich**: Bibliografie-Datei (.bib)
- **Optional**: Ko-Autoren und Affiliationen
- **Optional**: Manuskripttyp (Zeitschriftenartikel, Studierendenarbeit)

## Vorgehensweise

### Schritt 1: Framework waehlen

**Option A: apaquarto (Quarto, empfohlen)**

```r
install.packages("remotes")
remotes::install_github("wjschne/apaquarto")
```

**Option B: papaja (R Markdown)**

```r
remotes::install_github("crsh/papaja")
```

**Erwartet:** Das gewaehlte Framework-Paket installiert sich erfolgreich und ist mit `library(apaquarto)` oder `library(papaja)` ladbar.

**Bei Fehler:** Falls die Installation aufgrund fehlender Systemabhaengigkeiten fehlschlaegt (z.B. LaTeX fuer PDF-Ausgabe), zuerst TinyTeX installieren mit `quarto install tinytex`. Bei GitHub-Installationsfehlern pruefen, ob das `remotes`-Paket installiert ist und GitHub erreichbar ist.

### Schritt 2: Dokument erstellen (apaquarto)

`manuscript.qmd` erstellen:

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

**Erwartet:** Datei `manuscript.qmd` existiert mit gueltigem YAML-Frontmatter mit Titel, Kurztitel, Autoren-Affiliationen, Zusammenfassung, Schluesselwoertern, Bibliografie-Verweis und APA-spezifischen Format-Optionen.

**Bei Fehler:** YAML-Einrueckung pruefen (konsistent 2 Leerzeichen) und sicherstellen, dass `author:`-Eintraege das Listenformat mit `name:`, `affiliations:` und `corresponding:` verwenden. Pruefen, ob `bibliography:` auf eine existierende `.bib`-Datei verweist.

### Schritt 3: APA-Inhalt schreiben

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

**Erwartet:** Inhalt folgt der APA-Abschnittsstruktur (Einleitung, Methode, Ergebnisse, Diskussion, Literatur) mit Inline-R-Code fuer Statistiken und korrekten Querverweisen mit `@fig-`- und `@tbl-`-Praefixen.

**Bei Fehler:** Wenn Inline-R-Code nicht gerendert wird, die Backtick-R-Syntax ueberpruefen (`` `r expression` ``). Wenn Querverweise als Klartext angezeigt werden, pruefen, ob die referenzierten Chunk-Labels das korrekte Praefix verwenden und der Chunk eine entsprechende Beschriftungsoption hat.

### Schritt 4: Tabellen im APA-Stil formatieren

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

**Erwartet:** Tabellen werden mit APA-Formatierung gerendert: kursive Spaltenkoepfe fuer statistische Symbole, korrekte Dezimalausrichtung und eine beschreibende Ueberschrift ueber der Tabelle.

**Bei Fehler:** Wenn die `gt`-Tabelle nicht im APA-Stil gerendert wird, sicherstellen, dass das `gt`-Paket installiert ist und `cols_label()` Markdown-Kursivschrift verwendet (`*M*`, `*SD*`). Fuer papaja-Nutzer stattdessen `apa_table()` verwenden.

### Schritt 5: Zitationen verwalten

`references.bib` erstellen:

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

APA-Zitationsstile:
- Parenthetisch: `[@smith2023]` -> (Smith & Jones, 2023)
- Narrativ: `@smith2023` -> Smith and Jones (2023)
- Mehrfach: `[@smith2023; @jones2022]` -> (Jones, 2022; Smith & Jones, 2023)

**Erwartet:** `references.bib` enthaelt gueltige BibTeX-Eintraege mit allen erforderlichen Feldern (author, title, year, journal) und Zitationsschluessel stimmen mit dem Manuskripttext ueberein.

**Bei Fehler:** BibTeX-Syntax mit einem Online-Validator oder `bibtool -d references.bib` validieren. Sicherstellen, dass Zitationsschluessel im Text exakt mit `.bib`-Schluesseln uebereinstimmen (Gross-/Kleinschreibung beachten).

### Schritt 6: Rendern

```bash
# Word document (common for journal submission)
quarto render manuscript.qmd --to apaquarto-docx

# PDF (for preprint or review)
quarto render manuscript.qmd --to apaquarto-pdf
```

**Erwartet:** Korrekt formatiertes APA-Dokument mit Titelseite, Kolumnentitel und korrekt formatiertem Literaturverzeichnis.

**Bei Fehler:** Bei PDF-Rendering-Fehlern sicherstellen, dass TinyTeX installiert ist (`quarto install tinytex`). Bei DOCX-Ausgabeproblemen pruefen, ob die Word-Vorlage von apaquarto zugaenglich ist. Wenn Literaturangaben nicht erscheinen, sicherstellen, dass die Ueberschrift `# References` am Ende des Dokuments vorhanden ist.

## Validierung

- [ ] Titelseite korrekt formatiert (Titel, Autoren, Affiliationen, Autorenhinweis)
- [ ] Zusammenfassung mit Schluesselwoertern vorhanden
- [ ] Zitationen im Text stimmen mit Literaturverzeichnis ueberein
- [ ] Tabellen und Abbildungen korrekt nummeriert
- [ ] Statistiken gemaess APA formatiert (kursiv, korrekte Symbole)
- [ ] Literaturverzeichnis im APA-7-Format
- [ ] Seitenzahlen und Kolumnentitel vorhanden (PDF)

## Haeufige Fehler

- **Inline-R-Code-Formatierung**: Backtick-R-Syntax fuer Inline-Statistiken verwenden, keine hartcodierten Werte
- **Zitationsschluessel-Abweichungen**: Sicherstellen, dass .bib-Schluessel exakt im Text uebereinstimmen
- **Abbildungsplatzierung**: APA-Manuskripte platzieren Abbildungen typischerweise am Ende; `documentmode: man` setzen
- **Fehlende CSL-Datei**: apaquarto enthaelt die APA-CSL; papaja-Nutzer muessen moeglicherweise `csl: apa.csl` angeben
- **Sonderzeichen in Zusammenfassungen**: Markdown-Formatierung im YAML-Zusammenfassungsblock vermeiden

## Verwandte Skills

- `create-quarto-report` - Allgemeine Quarto-Dokumenterstellung
- `generate-statistical-tables` - Publikationsreife Tabellen
- `build-parameterized-report` - Batch-Berichtsgenerierung
