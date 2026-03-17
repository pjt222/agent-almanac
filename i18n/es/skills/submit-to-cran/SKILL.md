---
name: submit-to-cran
description: >
  Procedimiento completo para enviar un paquete R a CRAN, incluyendo
  verificaciones previas al envío (local, win-builder, R-hub), preparación
  de cran-comments.md, comprobación de URLs y ortografía, y el envío en sí.
  Cubre primeros envíos y actualizaciones. Usar cuando un paquete está listo
  para su publicación inicial en CRAN, al enviar una versión actualizada de un
  paquete ya en CRAN, o al reenviar tras recibir comentarios del revisor de CRAN.
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
  domain: r-packages
  complexity: advanced
  language: R
  tags: r, cran, submission, release, publishing
---

# Enviar a CRAN

Ejecutar el flujo completo de envío a CRAN desde las verificaciones previas hasta la presentación.

## Cuándo Usar

- El paquete está listo para su publicación inicial en CRAN
- Se envía una versión actualizada de un paquete ya publicado en CRAN
- Se reenvía tras recibir comentarios del revisor de CRAN

## Entradas

- **Obligatorio**: Paquete R que pasa `R CMD check` local con 0 errores y 0 advertencias
- **Obligatorio**: Número de versión actualizado en DESCRIPTION
- **Obligatorio**: NEWS.md actualizado con los cambios de esta versión
- **Opcional**: Comentarios previos del revisor de CRAN (para reenvíos)

## Procedimiento

### Paso 1: Verificación de Versión y NEWS

Verificar que DESCRIPTION tiene la versión correcta:

```r
desc::desc_get_version()
```

Verificar que NEWS.md tiene una entrada para esta versión. La entrada debe resumir los cambios visibles para el usuario.

**Esperado:** La versión sigue el versionado semántico. NEWS.md tiene una entrada correspondiente para esta versión.

**En caso de fallo:** Actualizar la versión con `usethis::use_version()` (elegir "major", "minor" o "patch"). Añadir una entrada en NEWS.md resumiendo los cambios visibles para el usuario.

### Paso 2: Verificación Local de R CMD Check

```r
devtools::check()
```

**Esperado:** 0 errores, 0 advertencias, 0 notas (1 nota aceptable en primeros envíos: "New submission").

**En caso de fallo:** Corregir todos los errores y advertencias antes de continuar. Leer el registro en `<pkg>.Rcheck/00check.log` para más detalles. Las notas deben explicarse en cran-comments.md.

### Paso 3: Verificación Ortográfica

```r
devtools::spell_check()
```

Añadir palabras legítimas a `inst/WORDLIST` (una palabra por línea, ordenadas alfabéticamente).

**Esperado:** Sin errores ortográficos inesperados. Todas las palabras marcadas se corrigen o se añaden a `inst/WORDLIST`.

**En caso de fallo:** Corregir los errores ortográficos genuinos. Para términos técnicos legítimos, añadirlos a `inst/WORDLIST` (una palabra por línea, ordenadas alfabéticamente).

### Paso 4: Verificación de URLs

```r
urlchecker::url_check()
```

**Esperado:** Todas las URLs devuelven HTTP 200. Sin enlaces rotos ni redirigidos.

**En caso de fallo:** Reemplazar las URLs rotas. Usar `\doi{}` para enlaces DOI en lugar de URLs directas. Eliminar enlaces a recursos que ya no existen.

### Paso 5: Verificaciones en Win-Builder

```r
devtools::check_win_devel()
devtools::check_win_release()
```

Esperar los resultados por correo electrónico (generalmente 15-30 minutos).

**Esperado:** 0 errores, 0 advertencias en Win-builder release y devel. Los resultados llegan por correo en 15-30 minutos.

**En caso de fallo:** Resolver los problemas específicos de la plataforma. Causas frecuentes: advertencias de compilador distintas, dependencias de sistema faltantes, diferencias en separadores de ruta. Corregir localmente y reenviar a Win-builder.

### Paso 6: Verificación en R-hub

```r
rhub::rhub_check()
```

Esto verifica en múltiples plataformas (Ubuntu, Windows, macOS).

**Esperado:** Todas las plataformas pasan con 0 errores y 0 advertencias.

**En caso de fallo:** Si una plataforma específica falla, revisar el registro de compilación de R-hub para errores específicos de esa plataforma. Usar `testthat::skip_on_os()` o código condicional para comportamientos dependientes de la plataforma.

### Paso 7: Preparar cran-comments.md

Crear o actualizar `cran-comments.md` en la raíz del paquete:

```markdown
## R CMD check results
0 errors | 0 warnings | 1 note

* This is a new release.

## Test environments
* local: Windows 11, R 4.5.0
* win-builder: R-release, R-devel
* R-hub: ubuntu-latest (R-release), windows-latest (R-release), macos-latest (R-release)

## Downstream dependencies
There are currently no downstream dependencies for this package.
```

Para actualizaciones, incluir:
- Qué cambió (brevemente)
- Respuesta a comentarios previos del revisor
- Resultados de la verificación de dependencias inversas si corresponde

**Esperado:** `cran-comments.md` resume con precisión los resultados de verificación en todos los entornos de prueba y explica cualquier nota.

**En caso de fallo:** Si los resultados difieren entre plataformas, documentar todas las variaciones. Los revisores de CRAN cotejarán estas declaraciones con sus propias pruebas.

### Paso 8: Verificación Final Previa al Envío

```r
# Una última verificación
devtools::check()

# Verificar el tarball compilado
devtools::build()
```

**Esperado:** El `devtools::check()` final pasa sin problemas. Se genera un tarball `.tar.gz` en el directorio padre.

**En caso de fallo:** Si aparece un problema de última hora, corregirlo y repetir todas las verificaciones desde el Paso 2. No enviar con fallos conocidos.

### Paso 9: Envío

```r
devtools::release()
```

Esto ejecuta verificaciones interactivas y envía. Responder todas las preguntas con honestidad.

Alternativamente, enviar manualmente en https://cran.r-project.org/submit.html subiendo el tarball.

**Esperado:** El correo de confirmación de CRAN llega en minutos. Hacer clic en el enlace de confirmación para finalizar el envío.

**En caso de fallo:** Revisar el correo para los motivos del rechazo. Problemas comunes: ejemplos demasiado lentos, etiquetas `\value` faltantes, código no portable. Corregir los problemas y reenviar, indicando en cran-comments.md qué cambió.

### Paso 10: Acciones Posteriores al Envío

Tras la aceptación:

```r
# Etiquetar la versión
usethis::use_github_release()

# Incrementar a versión de desarrollo
usethis::use_dev_version()
```

**Esperado:** Se crea la versión de GitHub con la etiqueta de la versión aceptada. DESCRIPTION se incrementa a la versión de desarrollo (`x.y.z.9000`).

**En caso de fallo:** Si la versión de GitHub falla, crearla manualmente con `gh release create`. Si la aceptación de CRAN se retrasa, esperar el correo de confirmación antes de etiquetar.

## Validación

- [ ] `R CMD check` devuelve 0 errores, 0 advertencias en la máquina local
- [ ] Win-builder pasa (release + devel)
- [ ] R-hub pasa en todas las plataformas probadas
- [ ] `cran-comments.md` describe con precisión los resultados de verificación
- [ ] Todas las URLs son válidas
- [ ] Sin errores ortográficos
- [ ] El número de versión es correcto e incrementado
- [ ] NEWS.md está actualizado
- [ ] Los metadatos de DESCRIPTION están completos y son precisos

## Errores Comunes

- **Ejemplos demasiado lentos**: Envolver los ejemplos costosos en `\donttest{}`. CRAN impone límites de tiempo.
- **Nombres de archivos/directorios no estándar**: Evitar archivos que generen notas de CRAN (revisar `.Rbuildignore`)
- **Falta `\value` en la documentación**: Todas las funciones exportadas necesitan una etiqueta `@return`
- **Fallos en la compilación de viñetas**: Asegurarse de que las viñetas compilan en un entorno limpio sin tu `.Renviron`
- **Formato del título en DESCRIPTION**: Debe ser en Mayúsculas de Título, sin punto al final, sin "A Package for..."
- **Olvidar las verificaciones de dependencias inversas**: Para actualizaciones, ejecutar `revdepcheck::revdep_check()`

## Ejemplos

```r
# Flujo completo previo al envío
devtools::spell_check()
urlchecker::url_check()
devtools::check()
devtools::check_win_devel()
rhub::rhub_check()
# Esperar resultados...
devtools::release()
```

## Habilidades Relacionadas

- `release-package-version` - incremento de versión y etiquetado git
- `write-roxygen-docs` - asegurar que la documentación cumple los estándares de CRAN
- `setup-github-actions-ci` - verificaciones de CI que reflejan las expectativas de CRAN
- `build-pkgdown-site` - sitio de documentación para paquetes aceptados
