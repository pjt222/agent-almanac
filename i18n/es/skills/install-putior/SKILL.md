---
name: install-putior
description: >
  Instalar y configurar el paquete R putior para visualización de flujos de
  trabajo. Cubre la instalación desde CRAN y GitHub, dependencias opcionales
  (mcptools, ellmer, shiny, shinyAce, logger, plumber2) y verificación del
  pipeline completo de anotación a diagrama. Úsalo al configurar putior por
  primera vez, al preparar una máquina para tareas de visualización de flujos
  de trabajo, cuando una habilidad descendente requiere que putior esté
  instalado, o al restaurar un entorno después de una actualización de versión
  de R o un borrado de renv.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: basic
  language: R
  tags: putior, install, workflow, mermaid, visualization, R
---

# Install putior

Instalar el paquete R putior y sus dependencias opcionales para que el pipeline de anotación a diagrama esté listo para usar.

## Cuándo Usar

- Al configurar putior por primera vez en un proyecto o entorno
- Al preparar una máquina para tareas de visualización de flujos de trabajo
- Cuando una habilidad descendente (analyze-codebase-workflow, generate-workflow-diagram) requiere que putior esté instalado
- Al restaurar un entorno después de una actualización de versión de R o un borrado de renv

## Entradas

- **Requerido**: Acceso a una instalación de R (>= 4.1.0)
- **Opcional**: Si instalar desde CRAN (predeterminado) o versión de desarrollo de GitHub
- **Opcional**: Qué grupos de dependencias opcionales instalar: MCP (`mcptools`, `ellmer`), interactivo (`shiny`, `shinyAce`), registro (`logger`), ACP (`plumber2`)

## Procedimiento

### Paso 1: Verificar la Instalación de R

Confirma que R está disponible y cumple el requisito de versión mínima.

```r
R.Version()$version.string
# Debe ser >= 4.1.0
```

```bash
# Desde WSL con R de Windows
"/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "cat(R.version.string)"
```

**Esperado:** Cadena de versión de R impresa, >= 4.1.0.

**En caso de fallo:** Instala o actualiza R. En Windows, descarga desde https://cran.r-project.org/bin/windows/base/. En Linux, usa `sudo apt install r-base`.

### Paso 2: Instalar putior

Instala desde CRAN (estable) o GitHub (desarrollo).

```r
# CRAN (recomendado)
install.packages("putior")

# Versión de desarrollo de GitHub (si se necesitan las últimas funcionalidades)
remotes::install_github("pjt222/putior")
```

**Esperado:** El paquete se instala sin errores. `library(putior)` carga silenciosamente.

**En caso de fallo:** Si la instalación de CRAN falla con "not available for this version of R", usa la versión de GitHub. Si GitHub falla, verifica que `remotes` esté instalado: `install.packages("remotes")`.

### Paso 3: Instalar las Dependencias Opcionales

Instala los paquetes opcionales según la funcionalidad requerida.

```r
# Integración del servidor MCP (para acceso del asistente de IA)
remotes::install_github("posit-dev/mcptools")
install.packages("ellmer")

# Sandbox interactivo
install.packages("shiny")
install.packages("shinyAce")

# Registro estructurado
install.packages("logger")

# Servidor ACP (comunicación agente a agente)
install.packages("plumber2")
```

**Esperado:** Cada paquete se instala sin errores.

**En caso de fallo:** Para `mcptools`, asegúrate de que `remotes` esté instalado primero. Para errores de dependencias del sistema en Linux, instala las bibliotecas requeridas (p.ej., `sudo apt install libcurl4-openssl-dev` para la dependencia httr2).

### Paso 4: Verificar la Instalación

Ejecuta el pipeline básico para confirmar que todo funciona.

```r
library(putior)

# Verificar la versión del paquete
packageVersion("putior")

# Verificar que las funciones principales están disponibles
stopifnot(
  is.function(put),
  is.function(put_auto),
  is.function(put_diagram),
  is.function(put_generate),
  is.function(put_merge),
  is.function(put_theme)
)

# Probar el pipeline básico con un archivo temporal
tmp <- tempfile(fileext = ".R")
writeLines("# put id:'test', label:'Hello putior'", tmp)
cat(put_diagram(put(tmp)))
```

**Esperado:** Código de diagrama Mermaid impreso en la consola que contiene `test` y `Hello putior`.

**En caso de fallo:** Si `put` no se encuentra, el paquete no se instaló correctamente. Reinstala con `install.packages("putior", dependencies = TRUE)`. Si el diagrama está vacío, verifica que el archivo temporal fue creado y que la sintaxis de anotación usa comillas simples dentro de comillas dobles.

## Validación

- [ ] `library(putior)` carga sin errores
- [ ] `packageVersion("putior")` devuelve una versión válida
- [ ] `put()` con un archivo que contiene una anotación PUT válida devuelve un data frame con una fila
- [ ] `put_diagram()` produce código Mermaid que comienza con `flowchart`
- [ ] Todas las dependencias opcionales solicitadas cargan sin errores

## Errores Comunes

- **Anidamiento de comillas incorrecto**: Las anotaciones PUT usan comillas simples dentro de la anotación: `id:'name'`, no `id:"name"` (que entra en conflicto con el delimitador de cadena de comentario en algunos contextos).
- **Pandoc faltante para viñetas**: Si planeas compilar las viñetas de putior localmente, asegúrate de que `RSTUDIO_PANDOC` esté configurado en `.Renviron`.
- **Aislamiento de renv**: Si el proyecto usa renv, debes instalar putior dentro de la biblioteca de renv. Ejecuta `renv::install("putior")` en lugar de `install.packages("putior")`.
- **Límites de tasa de GitHub**: Instalar `mcptools` desde GitHub puede fallar sin un `GITHUB_PAT`. Configura uno via `usethis::create_github_token()`.

## Habilidades Relacionadas

- `analyze-codebase-workflow` — siguiente paso después de la instalación para examinar un codebase
- `configure-putior-mcp` — configurar el servidor MCP después de instalar las dependencias opcionales
- `manage-renv-dependencies` — gestionar putior dentro de un entorno renv
- `configure-mcp-server` — configuración general del servidor MCP
