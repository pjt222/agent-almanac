---
name: generate-statistical-tables
description: >
  Generar tablas estadísticas listas para publicación usando gt, kableExtra
  o flextable. Cubre estadísticos descriptivos, resultados de regresión,
  tablas ANOVA, matrices de correlación y formato APA. Usar al crear tablas
  de estadísticos descriptivos, formatear resultados de regresión o ANOVA,
  construir matrices de correlación, producir tablas estilo APA para artículos
  académicos o generar tablas para documentos Quarto y R Markdown.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: r, tables, gt, statistics, publication
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Generar Tablas Estadísticas

Crear tablas estadísticas listas para publicación para informes y manuscritos.

## Cuándo Usar

- Crear tablas de estadísticos descriptivos
- Formatear resultados de regresión o ANOVA
- Construir matrices de correlación
- Producir tablas estilo APA para artículos académicos
- Generar tablas para documentos Quarto/R Markdown

## Entradas

- **Requerido**: Resultados de análisis estadístico (objetos de modelo, datos resumidos)
- **Requerido**: Formato de salida (HTML, PDF, Word)
- **Opcional**: Guía de estilo (APA, específica de revista)
- **Opcional**: Esquema de numeración de tablas

## Procedimiento

### Paso 1: Elegir Paquete de Tablas

| Paquete | Mejor para | Formatos |
|---------|----------|---------|
| `gt` | HTML, propósito general | HTML, PDF, Word |
| `kableExtra` | Documentos LaTeX/PDF | PDF, HTML |
| `flextable` | Documentos Word | Word, PDF, HTML |
| `gtsummary` | Resúmenes clínicos/estadísticos | Todos vía gt/flextable |

**Esperado:** Un paquete de tablas seleccionado basado en el formato de salida y caso de uso. El paquete elegido está instalado y es cargable.

**En caso de fallo:** Si el paquete requerido no está instalado, ejecutar `install.packages("gt")` (o el paquete apropiado). Para `gtsummary`, tanto `gt` como `gtsummary` deben estar instalados.

### Paso 2: Tabla de Estadísticos Descriptivos

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

**Esperado:** Un objeto tabla `gt` con medias, desviaciones estándar y conteos formateados agrupados por categoría. Los encabezados de columna usan notación estadística apropiada (*M*, *SD*, *n* en cursiva).

**En caso de fallo:** Si `group_by()` produce resultados inesperados, verificar que la variable de agrupación exista y tenga los niveles esperados. Si `fmt_number()` produce un error, asegurar que las columnas objetivo contengan datos numéricos.

### Paso 3: Tabla de Resultados de Regresión

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

**Esperado:** Una tabla de regresión `gtsummary` con valores p en negrita, estadísticos de ajuste del modelo (R-cuadrado, N) en una nota al pie, y un subtítulo descriptivo.

**En caso de fallo:** Si `tbl_regression()` falla, verificar que la entrada sea un objeto de modelo (p. ej., `lm`, `glm`). Si `add_glance_source_note()` produce errores, verificar que `broom` pueda procesar el modelo: `broom::glance(model)`.

### Paso 4: Matriz de Correlación

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

**Esperado:** Una matriz de correlación de triángulo inferior renderizada como tabla `gt` con triángulo superior en blanco, dos decimales y un subtítulo claro.

**En caso de fallo:** Si `sub_missing()` no oculta el triángulo superior, verificar que los valores `NA` se establecieron correctamente con `cor_matrix[upper.tri(cor_matrix)] <- NA`. Si las variables no son numéricas, `cor()` fallará; filtrar solo columnas numéricas primero.

### Paso 5: Tabla ANOVA

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

**Esperado:** Una tabla ANOVA formateada con columnas Fuente, *df*, *SS*, *MS*, *F* y *p*. Los términos de interacción están claramente etiquetados y los valores p están formateados a tres decimales.

**En caso de fallo:** Si `broom::tidy(aov_result)` produce columnas inesperadas, verificar que el modelo sea un objeto `aov`. Para sumas de cuadrados Tipo III, usar `car::Anova(model, type = 3)` en lugar de `aov()` base.

### Paso 6: Guardar Tablas

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

**Esperado:** Tabla guardada en el formato de archivo especificado (HTML, Word, PNG o PDF). El archivo de salida se abre correctamente en la aplicación apropiada.

**En caso de fallo:** Si `gtsave()` falla para formato Word, asegurar que el paquete `webshot2` esté instalado. Para salida PDF vía `kableExtra`, asegurar que una distribución LaTeX (TinyTeX o MiKTeX) esté instalada.

### Paso 7: Incrustar en Documento Quarto

````markdown
```{r}
#| label: tbl-descriptives
#| tbl-cap: "Descriptive Statistics by Group"

gt(descriptives) |>
  fmt_number(columns = c(M, SD), decimals = 2)
```

See @tbl-descriptives for summary statistics.
````

**Esperado:** La tabla se renderiza en línea en el documento Quarto con una etiqueta referenciable (`@tbl-*`) y un subtítulo apropiado. La tabla se adapta al formato de salida del documento automáticamente.

**En caso de fallo:** Si la tabla no se renderiza, verificar que la etiqueta del bloque comience con `tbl-` para referencias cruzadas en Quarto. Si el formato se pierde en PDF, cambiar de `gt` a `kableExtra` para salida basada en LaTeX.

## Validación

- [ ] La tabla se renderiza correctamente en el formato objetivo (HTML, PDF, Word)
- [ ] Los números están formateados consistentemente (decimales, alineación)
- [ ] La notación estadística sigue la guía de estilo (cursivas, símbolos apropiados)
- [ ] La tabla tiene un subtítulo claro y numeración
- [ ] Los encabezados de columna son significativos
- [ ] Las notas/notas al pie explican abreviaturas o marcadores de significancia

## Errores Comunes

- **gt en PDF**: gt tiene soporte limitado para PDF. Usar kableExtra para documentos con mucho LaTeX.
- **Inconsistencia en redondeo**: Siempre usar `fmt_number()` (gt) o `format()` en lugar de `round()` para visualización
- **Visualización de valores faltantes**: Configurar con `sub_missing()` en gt o `options(knitr.kable.NA = "")`
- **Tablas anchas en PDF**: Las tablas que exceden el ancho de página necesitan `landscape()` o reducción del tamaño de fuente
- **Formato numérico APA**: Sin cero inicial para valores acotados por 1 (valores p, correlaciones): ".03" no "0.03"

## Habilidades Relacionadas

- `format-apa-report` - tablas dentro de manuscritos APA
- `create-quarto-report` - incrustar tablas en informes
- `build-parameterized-report` - tablas que se adaptan a parámetros
