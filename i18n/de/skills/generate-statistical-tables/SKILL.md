---
name: generate-statistical-tables
description: >
  Publikationsreife statistische Tabellen mit gt, kableExtra oder flextable
  generieren. Umfasst deskriptive Statistiken, Regressionsergebnisse,
  ANOVA-Tabellen, Korrelationsmatrizen und APA-Formatierung. Verwenden,
  wenn deskriptive Statistiktabellen erstellt, Regressions- oder
  ANOVA-Ausgaben formatiert, Korrelationsmatrizen aufgebaut, APA-konforme
  Tabellen fuer akademische Arbeiten produziert oder Tabellen fuer
  Quarto- und R-Markdown-Dokumente generiert werden sollen.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: r, tables, gt, statistics, publication
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Statistische Tabellen generieren

Publikationsreife statistische Tabellen fuer Berichte und Manuskripte erstellen.

## Wann verwenden

- Deskriptive Statistiktabellen erstellen
- Regressions- oder ANOVA-Ausgaben formatieren
- Korrelationsmatrizen aufbauen
- APA-konforme Tabellen fuer akademische Arbeiten produzieren
- Tabellen fuer Quarto/R-Markdown-Dokumente generieren

## Eingaben

- **Erforderlich**: Statistische Analyseergebnisse (Modellobjekte, Zusammenfassungsdaten)
- **Erforderlich**: Ausgabeformat (HTML, PDF, Word)
- **Optional**: Stilrichtlinie (APA, zeitschriftenspezifisch)
- **Optional**: Tabellennummerierungsschema

## Vorgehensweise

### Schritt 1: Tabellenpaket waehlen

| Paket | Optimal fuer | Formate |
|-------|-------------|---------|
| `gt` | HTML, Allzweck | HTML, PDF, Word |
| `kableExtra` | LaTeX/PDF-Dokumente | PDF, HTML |
| `flextable` | Word-Dokumente | Word, PDF, HTML |
| `gtsummary` | Klinische/statistische Zusammenfassungen | Alle via gt/flextable |

**Erwartet:** Ein Tabellenpaket basierend auf dem Ausgabeformat und Anwendungsfall ausgewaehlt. Das gewaehlte Paket ist installiert und ladbar.

**Bei Fehler:** Wenn das benoetigte Paket nicht installiert ist, `install.packages("gt")` (oder das entsprechende Paket) ausfuehren. Fuer `gtsummary` muessen sowohl `gt` als auch `gtsummary` installiert sein.

### Schritt 2: Deskriptive Statistiktabelle

```r
library(gt)

descriptives <- data |>
  group_by(group) |>
  summarise(
    n = n(),
    M = mean(score, na.rm = TRUE),
    SD = sd(score, na.rm = TRUE),
    Min = min(score, na.rm = TRUE),
    Max = max(score, na.rm = TRUE)
  )

gt(descriptives) |>
  tab_header(
    title = "Table 1",
    subtitle = "Descriptive Statistics by Group"
  ) |>
  fmt_number(columns = c(M, SD), decimals = 2) |>
  fmt_number(columns = c(Min, Max), decimals = 1) |>
  cols_label(
    group = "Group",
    n = md("*n*"),
    M = md("*M*"),
    SD = md("*SD*")
  )
```

**Erwartet:** Ein `gt`-Tabellenobjekt mit formatierten Mittelwerten, Standardabweichungen und Haeufigkeiten nach Kategorie gruppiert. Spaltenkoepfe verwenden korrekte statistische Notation (kursiv *M*, *SD*, *n*).

**Bei Fehler:** Wenn `group_by()` unerwartete Ergebnisse liefert, sicherstellen, dass die Gruppierungsvariable existiert und die erwarteten Stufen hat. Wenn `fmt_number()` einen Fehler wirft, sicherstellen, dass die Zielspalten numerische Daten enthalten.

### Schritt 3: Regressionsergebnis-Tabelle

```r
model <- lm(outcome ~ predictor1 + predictor2 + predictor3, data = data)

library(gtsummary)

tbl_regression(model) |>
  bold_p() |>
  add_glance_source_note(
    include = c(r.squared, adj.r.squared, nobs)
  ) |>
  modify_header(label = "**Predictor**") |>
  modify_caption("Table 2: Regression Results")
```

**Erwartet:** Eine `gtsummary`-Regressionstabelle mit fett gedruckten p-Werten, Modellanpassungsstatistiken (R-Quadrat, N) in einer Quellnotiz und einer beschreibenden Ueberschrift.

**Bei Fehler:** Wenn `tbl_regression()` fehlschlaegt, sicherstellen, dass die Eingabe ein Modellobjekt ist (z.B. `lm`, `glm`). Wenn `add_glance_source_note()` Fehler wirft, pruefen, ob `broom` das Modell verarbeiten kann: `broom::glance(model)`.

### Schritt 4: Korrelationsmatrix

```r
library(gt)

cor_matrix <- cor(data[, c("var1", "var2", "var3", "var4")],
                  use = "pairwise.complete.obs")

# Format lower triangle
cor_matrix[upper.tri(cor_matrix)] <- NA

as.data.frame(cor_matrix) |>
  tibble::rownames_to_column("Variable") |>
  gt() |>
  fmt_number(decimals = 2) |>
  sub_missing(missing_text = "") |>
  tab_header(title = "Table 3", subtitle = "Correlation Matrix")
```

**Erwartet:** Eine Korrelationsmatrix mit unterem Dreieck als `gt`-Tabelle mit ausgeblendetem oberen Dreieck, zwei Dezimalstellen und einer klaren Ueberschrift.

**Bei Fehler:** Wenn `sub_missing()` das obere Dreieck nicht ausblendet, ueberpruefen, ob `NA`-Werte korrekt mit `cor_matrix[upper.tri(cor_matrix)] <- NA` gesetzt wurden. Wenn Variablen nicht-numerisch sind, wird `cor()` fehlschlagen; zuerst auf numerische Spalten filtern.

### Schritt 5: ANOVA-Tabelle

```r
aov_result <- aov(score ~ group * condition, data = data)

library(gtsummary)

tbl_anova <- broom::tidy(aov_result) |>
  gt() |>
  fmt_number(columns = c(sumsq, meansq, statistic), decimals = 2) |>
  fmt_number(columns = p.value, decimals = 3) |>
  cols_label(
    term = "Source",
    df = md("*df*"),
    sumsq = md("*SS*"),
    meansq = md("*MS*"),
    statistic = md("*F*"),
    p.value = md("*p*")
  ) |>
  tab_header(title = "Table 4", subtitle = "ANOVA Results")
```

**Erwartet:** Eine formatierte ANOVA-Tabelle mit Quelle, *df*, *SS*, *MS*, *F* und *p*-Spalten. Interaktionsterme sind klar beschriftet und p-Werte auf drei Dezimalstellen formatiert.

**Bei Fehler:** Wenn `broom::tidy(aov_result)` unerwartete Spalten liefert, sicherstellen, dass das Modell ein `aov`-Objekt ist. Fuer Typ-III-Quadratsummen `car::Anova(model, type = 3)` statt Basis-`aov()` verwenden.

### Schritt 6: Tabellen speichern

```r
# Save as HTML
gtsave(my_table, "table1.html")

# Save as Word
gtsave(my_table, "table1.docx")

# Save as PNG image
gtsave(my_table, "table1.png")

# For LaTeX/PDF (kableExtra)
kableExtra::save_kable(kable_table, "table1.pdf")
```

**Erwartet:** Tabelle im angegebenen Dateiformat gespeichert (HTML, Word, PNG oder PDF). Die Ausgabedatei oeffnet sich korrekt in der entsprechenden Anwendung.

**Bei Fehler:** Wenn `gtsave()` fuer das Word-Format fehlschlaegt, sicherstellen, dass das `webshot2`-Paket installiert ist. Fuer PDF-Ausgabe ueber `kableExtra` sicherstellen, dass eine LaTeX-Distribution (TinyTeX oder MiKTeX) installiert ist.

### Schritt 7: In Quarto-Dokument einbetten

````markdown
```{r}
#| label: tbl-descriptives
#| tbl-cap: "Descriptive Statistics by Group"

gt(descriptives) |>
  fmt_number(columns = c(M, SD), decimals = 2)
```

See @tbl-descriptives for summary statistics.
````

**Erwartet:** Die Tabelle wird inline im Quarto-Dokument mit einem querverweis-faehigen Label (`@tbl-*`) und einer korrekten Ueberschrift gerendert. Die Tabelle passt sich automatisch an das Ausgabeformat des Dokuments an.

**Bei Fehler:** Wenn die Tabelle nicht gerendert wird, ueberpruefen, ob das Chunk-Label fuer Quarto-Querverweise mit `tbl-` beginnt. Wenn die Formatierung in PDF verloren geht, von `gt` auf `kableExtra` fuer LaTeX-basierte Ausgabe wechseln.

## Validierung

- [ ] Tabelle rendert korrekt im Zielformat (HTML, PDF, Word)
- [ ] Zahlen sind konsistent formatiert (Dezimalstellen, Ausrichtung)
- [ ] Statistische Notation folgt der Stilrichtlinie (kursiv, korrekte Symbole)
- [ ] Tabelle hat eine klare Ueberschrift und Nummerierung
- [ ] Spaltenkoepfe sind aussagekraeftig
- [ ] Anmerkungen/Fussnoten erklaeren Abkuerzungen oder Signifikanzmarker

## Haeufige Fehler

- **gt in PDF**: gt hat eingeschraenkte PDF-Unterstuetzung. kableExtra fuer LaTeX-lastige Dokumente verwenden.
- **Rundungsinkonsistenz**: Immer `fmt_number()` (gt) oder `format()` statt `round()` fuer die Anzeige verwenden
- **Anzeige fehlender Werte**: Mit `sub_missing()` in gt oder `options(knitr.kable.NA = "")` konfigurieren
- **Breite Tabellen in PDF**: Tabellen, die die Seitenbreite ueberschreiten, benoetigen `landscape()` oder Schriftgroessenreduzierung
- **APA-Zahlenformatierung**: Keine fuehrende Null fuer Werte, die durch 1 begrenzt sind (p-Werte, Korrelationen): ".03" nicht "0.03"

## Verwandte Skills

- `format-apa-report` - Tabellen in APA-Manuskripten
- `create-quarto-report` - Tabellen in Berichte einbetten
- `build-parameterized-report` - Tabellen, die sich an Parameter anpassen
