---
name: format-apa-report
description: >
  Formatear un informe Quarto o R Markdown siguiendo el estilo APA 7a edición.
  Cubre los paquetes apaquarto/papaja, página de título, resúmenes, citas,
  tablas, figuras y formato de referencias. Usar al escribir un artículo
  académico en formato APA, crear un informe de investigación en psicología
  o ciencias sociales, generar manuscritos reproducibles con análisis
  integrado, o preparar un capítulo de tesis o disertación.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: apa, academic, psychology, quarto, papaja
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Formatear Informe APA

Crear un informe con formato APA 7a edición usando Quarto (apaquarto) o R Markdown (papaja).

## Cuándo Usar

- Escribir un artículo académico en formato APA
- Crear un informe de investigación en psicología o ciencias sociales
- Generar manuscritos reproducibles con análisis integrado
- Preparar un capítulo de tesis o disertación

## Entradas

- **Requerido**: Código de análisis y resultados
- **Requerido**: Archivo de bibliografía (.bib)
- **Opcional**: Coautores y afiliaciones
- **Opcional**: Tipo de manuscrito (artículo de revista, trabajo estudiantil)

## Procedimiento

### Paso 1: Elegir Marco de Trabajo

**Opción A: apaquarto (Quarto, recomendado)**

```r
install.packages("remotes")
remotes::install_github("wjschne/apaquarto")
```

**Opción B: papaja (R Markdown)**

```r
remotes::install_github("crsh/papaja")
```

**Esperado:** El paquete del marco elegido se instala exitosamente y es cargable con `library(apaquarto)` o `library(papaja)`.

**En caso de fallo:** Si la instalación falla por dependencias del sistema faltantes (p. ej., LaTeX para salida PDF), instalar TinyTeX primero con `quarto install tinytex`. Para fallos de instalación desde GitHub, verificar que el paquete `remotes` esté instalado y que GitHub sea accesible.

### Paso 2: Crear Documento (apaquarto)

Crear `manuscript.qmd`:

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

**Esperado:** El archivo `manuscript.qmd` existe con frontmatter YAML válido que contiene título, título corto, afiliaciones de autores, resumen, palabras clave, referencia bibliográfica y opciones de formato específicas de APA.

**En caso de fallo:** Verificar que la indentación YAML sea consistente (2 espacios) y que las entradas de `author:` usen el formato de lista con campos `name:`, `affiliations:` y `corresponding:`. Verificar que `bibliography:` apunte a un archivo `.bib` existente.

### Paso 3: Escribir Contenido APA

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

**Esperado:** El contenido sigue la estructura de secciones APA (Introducción, Método, Resultados, Discusión, Referencias) con código R en línea para estadísticas y referencias cruzadas apropiadas usando prefijos `@fig-` y `@tbl-`.

**En caso de fallo:** Si el código R en línea no se renderiza, verificar que la sintaxis de comilla invertida-r sea correcta (`` `r expression` ``). Si las referencias cruzadas aparecen como texto literal, verificar que las etiquetas de bloque referenciadas usen el prefijo correcto y que el bloque tenga una opción de subtítulo correspondiente.

### Paso 4: Formatear Tablas en Estilo APA

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

**Esperado:** Las tablas se renderizan con formato APA: encabezados de columna en cursiva para símbolos estadísticos, alineación decimal apropiada y un subtítulo descriptivo sobre la tabla.

**En caso de fallo:** Si la tabla `gt` no se renderiza en estilo APA, asegurar que el paquete `gt` esté instalado y que `cols_label()` use cursivas estilo markdown (`*M*`, `*SD*`). Para usuarios de papaja, usar `apa_table()` en lugar de `gt()`.

### Paso 5: Gestionar Citas

Crear `references.bib`:

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

Estilos de cita APA:
- Parentética: `[@smith2023]` -> (Smith & Jones, 2023)
- Narrativa: `@smith2023` -> Smith and Jones (2023)
- Múltiple: `[@smith2023; @jones2022]` -> (Jones, 2022; Smith & Jones, 2023)

**Esperado:** `references.bib` contiene entradas BibTeX válidas con todos los campos requeridos (author, title, year, journal) y las claves de cita coinciden con las usadas en el texto del manuscrito.

**En caso de fallo:** Validar la sintaxis BibTeX con un validador en línea o `bibtool -d references.bib`. Asegurar que las claves de cita en el texto coincidan exactamente con las claves del `.bib` (sensible a mayúsculas).

### Paso 6: Renderizar

```bash
# Word document (common for journal submission)
quarto render manuscript.qmd --to apaquarto-docx

# PDF (for preprint or review)
quarto render manuscript.qmd --to apaquarto-pdf
```

**Esperado:** Documento APA correctamente formateado con página de título, encabezado continuo y sección de referencias correctamente formateada.

**En caso de fallo:** Para fallos de renderizado PDF, verificar que TinyTeX esté instalado (`quarto install tinytex`). Para problemas de salida DOCX, verificar que la plantilla Word de apaquarto sea accesible. Si las referencias no aparecen, asegurar que el encabezado `# References` esté presente al final del documento.

## Validación

- [ ] Página de título formateada correctamente (título, autores, afiliaciones, nota de autor)
- [ ] Resumen presente con palabras clave
- [ ] Citas en texto coinciden con la lista de referencias
- [ ] Tablas y figuras numeradas correctamente
- [ ] Estadísticas formateadas según APA (cursiva, símbolos apropiados)
- [ ] Referencias en formato APA 7a edición
- [ ] Números de página y encabezado continuo presentes (PDF)

## Errores Comunes

- **Formato de código R en línea**: Usar sintaxis comilla invertida-r para estadísticas en línea, no valores codificados
- **Discrepancias en claves de cita**: Asegurar que las claves .bib coincidan exactamente en el texto
- **Ubicación de figuras**: Los manuscritos APA típicamente colocan figuras al final; configurar `documentmode: man`
- **Archivo CSL faltante**: apaquarto incluye el CSL de APA; usuarios de papaja pueden necesitar especificar `csl: apa.csl`
- **Caracteres especiales en resúmenes**: Evitar formato markdown en el bloque abstract del YAML

## Habilidades Relacionadas

- `create-quarto-report` - Creación general de documentos Quarto
- `generate-statistical-tables` - Tablas listas para publicación
- `build-parameterized-report` - Generación de informes por lotes
