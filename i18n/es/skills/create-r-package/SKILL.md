---
name: create-r-package
description: >
  Generar la estructura inicial de un paquete R completo incluyendo DESCRIPTION,
  NAMESPACE, testthat, roxygen2, renv, Git, GitHub Actions CI y archivos de
  configuración para desarrollo (.Rprofile, .Renviron.example, CLAUDE.md).
  Sigue las convenciones de usethis y el estilo tidyverse. Utilizar al iniciar
  un paquete R desde cero, al convertir scripts R sueltos en un paquete
  estructurado, o al preparar un esqueleto de paquete para desarrollo colaborativo.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: basic
  language: R
  tags: r, package, usethis, scaffold, setup
  locale: es
  source_locale: en
  source_commit: 6a868d56
  translator: Claude Opus 4.6
  translation_date: 2026-03-13
---

# Crear Paquete R

Generar la estructura de un paquete R completamente configurado con herramientas modernas y buenas prácticas.

## Cuándo Usar

- Al iniciar un paquete R desde cero
- Al convertir scripts R sueltos en un paquete
- Al preparar un esqueleto de paquete para desarrollo colaborativo

## Entradas

- **Requerido**: Nombre del paquete (minúsculas, sin caracteres especiales excepto `.`)
- **Requerido**: Descripción en una línea del propósito del paquete
- **Opcional**: Tipo de licencia (predeterminado: MIT)
- **Opcional**: Información del autor (nombre, correo electrónico, ORCID)
- **Opcional**: Si se debe inicializar renv (predeterminado: sí)

## Procedimiento

### Paso 1: Crear el Esqueleto del Paquete

```r
usethis::create_package("packagename")
setwd("packagename")
```

**Esperado:** Directorio creado con `DESCRIPTION`, `NAMESPACE`, `R/` y subdirectorios `man/`.

**En caso de fallo:** Asegurar que usethis está instalado (`install.packages("usethis")`). Verificar que el directorio no exista previamente.

### Paso 2: Configurar DESCRIPTION

Editar `DESCRIPTION` con metadatos precisos:

```
Package: packagename
Title: What the Package Does (Title Case)
Version: 0.1.0
Authors@R:
    person("First", "Last", , "email@example.com", role = c("aut", "cre"),
           comment = c(ORCID = "0000-0000-0000-0000"))
Description: One paragraph describing what the package does. Must be more
    than one sentence. Avoid starting with "This package".
License: MIT + file LICENSE
Encoding: UTF-8
Roxygen: list(markdown = TRUE)
RoxygenNote: 7.3.2
URL: https://github.com/username/packagename
BugReports: https://github.com/username/packagename/issues
```

**Esperado:** DESCRIPTION válido que pasa `R CMD check` sin advertencias de metadatos.

**En caso de fallo:** Si `R CMD check` advierte sobre campos de DESCRIPTION, verificar que `Title` esté en formato Title Case, `Description` tenga más de una oración y `Authors@R` use la sintaxis válida de `person()`.

### Paso 3: Configurar la Infraestructura

```r
usethis::use_mit_license()
usethis::use_readme_md()
usethis::use_news_md()
usethis::use_testthat(edition = 3)
usethis::use_git()
usethis::use_github_action("check-standard")
```

**Esperado:** LICENSE, README.md, NEWS.md, directorio `tests/`, `.git/` inicializado y `.github/workflows/` creados.

**En caso de fallo:** Si alguna función `usethis::use_*()` falla, instalar la dependencia faltante y volver a ejecutar. Si `.git/` ya existe, `use_git()` omitirá la inicialización.

### Paso 4: Crear la Configuración de Desarrollo

Crear `.Rprofile`:

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}

if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

Crear `.Renviron.example`:

```
RSTUDIO_PANDOC="C:/Program Files/RStudio/resources/app/bin/quarto/bin/tools"
# GITHUB_PAT=your_github_token_here
```

Crear entradas en `.Rbuildignore`:

```
^\.Rprofile$
^\.Renviron$
^\.Renviron\.example$
^renv$
^renv\.lock$
^CLAUDE\.md$
^\.github$
^.*\.Rproj$
```

**Esperado:** `.Rprofile`, `.Renviron.example` y `.Rbuildignore` están creados. Los archivos de desarrollo están excluidos del paquete construido.

**En caso de fallo:** Si `.Rprofile` causa errores al iniciar, verificar problemas de sintaxis. Asegurar que las protecciones con `requireNamespace()` eviten fallos cuando no están instalados los paquetes opcionales.

### Paso 5: Inicializar renv

```r
renv::init()
```

**Esperado:** Directorio `renv/` y `renv.lock` creados. La biblioteca local del proyecto está activa.

**En caso de fallo:** Instalar renv con `install.packages("renv")`. Si renv se congela durante la inicialización, verificar la conectividad de red o establecer `options(timeout = 600)`.

### Paso 6: Crear el Archivo de Documentación del Paquete

Crear `R/packagename-package.R`:

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**Esperado:** `R/packagename-package.R` existe con el centinela `"_PACKAGE"`. Ejecutar `devtools::document()` genera la ayuda a nivel de paquete.

**En caso de fallo:** Asegurar que el nombre del archivo siga el patrón `R/<packagename>-package.R`. La cadena `"_PACKAGE"` debe ser una expresión independiente, no dentro de una función.

### Paso 7: Crear CLAUDE.md

Crear `CLAUDE.md` en la raíz del proyecto con instrucciones específicas del proyecto para asistentes de IA.

**Esperado:** `CLAUDE.md` existe en la raíz del proyecto con convenciones de edición, comandos de compilación y notas de arquitectura específicas del proyecto.

**En caso de fallo:** Si no se sabe qué incluir, comenzar con el nombre del paquete, una descripción de una línea, comandos comunes de desarrollo (`devtools::check()`, `devtools::test()`) y cualquier convención no obvia.

## Validación

- [ ] `devtools::check()` devuelve 0 errores, 0 advertencias
- [ ] La estructura del paquete coincide con el diseño esperado
- [ ] `.Rprofile` se carga sin errores
- [ ] `renv::status()` no muestra problemas
- [ ] Repositorio Git inicializado con `.gitignore` apropiado
- [ ] Archivo de flujo de trabajo de GitHub Actions presente

## Errores Comunes

- **Conflicto de nombres de paquete**: Verificar en CRAN con `available::available("packagename")` antes de decidirse por un nombre
- **Entradas faltantes en .Rbuildignore**: Los archivos de desarrollo (`.Rprofile`, `.Renviron`, `renv/`) deben excluirse del paquete construido
- **Olvidar Encoding**: Siempre incluir `Encoding: UTF-8` en DESCRIPTION
- **Discrepancia en RoxygenNote**: La versión en DESCRIPTION debe coincidir con el roxygen2 instalado

## Ejemplos

```r
# Creación mínima
usethis::create_package("myanalysis")

# Configuración completa en una sesión
usethis::create_package("myanalysis")
usethis::use_mit_license()
usethis::use_testthat(edition = 3)
usethis::use_readme_md()
usethis::use_git()
usethis::use_github_action("check-standard")
renv::init()
```

## Habilidades Relacionadas

- `write-roxygen-docs` - documentar las funciones creadas
- `write-testthat-tests` - agregar pruebas al paquete
- `setup-github-actions-ci` - configuración detallada de CI/CD
- `manage-renv-dependencies` - gestionar dependencias del paquete
- `write-claude-md` - crear instrucciones efectivas para asistentes de IA
