---
name: release-package-version
description: >
  Publicar una nueva versión de un paquete R incluyendo el incremento de
  versión, actualizaciones de NEWS.md, etiquetado git, creación de versiones
  de GitHub y configuración de la versión de desarrollo post-publicación.
  Usar cuando un paquete está listo para un nuevo parche, versión menor o
  mayor, tras la aceptación en CRAN para crear la versión de GitHub
  correspondiente, o al configurar el incremento de la versión de desarrollo
  inmediatamente después de una publicación.
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
  complexity: intermediate
  language: R
  tags: r, versioning, release, git-tags, changelog
---

# Publicar Versión del Paquete

Ejecutar el ciclo completo de publicación de versiones para un paquete R.

## Cuándo Usar

- Listo para publicar una nueva versión (corrección de errores, nueva funcionalidad o cambio disruptivo)
- Tras la aceptación en CRAN, para crear la versión de GitHub correspondiente
- Configurar la versión de desarrollo post-publicación

## Entradas

- **Obligatorio**: Paquete con cambios listos para publicar
- **Obligatorio**: Tipo de publicación: parche (0.1.0 -> 0.1.1), menor (0.1.0 -> 0.2.0) o mayor (0.1.0 -> 1.0.0)
- **Opcional**: Si enviar a CRAN (predeterminado: no, usar la habilidad `submit-to-cran` por separado)

## Procedimiento

### Paso 1: Determinar el Tipo de Incremento

Seguir el versionado semántico:

| Tipo de Cambio | Incremento | Ejemplo |
|----------------|-----------|---------|
| Solo correcciones de errores | Parche | 0.1.0 -> 0.1.1 |
| Nuevas funcionalidades (compatibles hacia atrás) | Menor | 0.1.0 -> 0.2.0 |
| Cambios disruptivos | Mayor | 0.1.0 -> 1.0.0 |

**Esperado:** Se determina el tipo de incremento correcto (parche, menor o mayor) según la naturaleza de los cambios desde la última publicación.

**En caso de fallo:** Si hay dudas, revisar `git log` desde la última etiqueta y clasificar cada cambio. Cualquier cambio disruptivo de la API requiere un incremento mayor.

### Paso 2: Actualizar la Versión

```r
usethis::use_version("minor")  # o "patch" o "major"
```

Esto actualiza el campo `Version` en DESCRIPTION y añade un encabezado a NEWS.md.

**Esperado:** Versión de DESCRIPTION actualizada. NEWS.md tiene un nuevo encabezado de sección para la versión publicada.

**En caso de fallo:** Si `usethis::use_version()` no está disponible, actualizar manualmente el campo `Version` en DESCRIPTION y añadir un encabezado `# packagename x.y.z` a NEWS.md.

### Paso 3: Actualizar NEWS.md

Completar las notas de la versión bajo el nuevo encabezado:

```markdown
# packagename 0.2.0

## New Features
- Added `new_function()` for processing data (#42)
- Support for custom themes in `plot_results()` (#45)

## Bug Fixes
- Fixed crash when input contains all NAs (#38)
- Corrected off-by-one error in `window_calc()` (#41)

## Minor Improvements
- Improved error messages for invalid input types
- Updated documentation examples
```

Usar números de issue/PR para la trazabilidad.

**Esperado:** NEWS.md contiene un resumen completo de los cambios visibles para el usuario organizados por categoría, con números de issue/PR para la trazabilidad.

**En caso de fallo:** Si es difícil reconstruir los cambios, usar `git log --oneline v<previous>..HEAD` para listar todos los commits desde la última publicación y categorizarlos.

### Paso 4: Verificaciones Finales

```r
devtools::check()
devtools::spell_check()
urlchecker::url_check()
```

**Esperado:** `devtools::check()` devuelve 0 errores, 0 advertencias y 0 notas. La verificación ortográfica y de URLs no encuentra problemas.

**En caso de fallo:** Corregir todos los errores y advertencias antes de publicar. Añadir palabras con falso positivo a `inst/WORDLIST` para el corrector ortográfico. Reemplazar las URLs rotas.

### Paso 5: Confirmar la Publicación

```bash
git add DESCRIPTION NEWS.md
git commit -m "Release packagename v0.2.0"
```

**Esperado:** Un único commit que contiene el incremento de versión en DESCRIPTION y el NEWS.md actualizado.

**En caso de fallo:** Si hay otros cambios sin confirmar, preparar solo DESCRIPTION y NEWS.md. Los commits de publicación deben contener únicamente cambios relacionados con la versión.

### Paso 6: Etiquetar la Publicación

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

**Esperado:** Etiqueta anotada `v0.2.0` creada y enviada al remoto. `git tag -l` muestra la etiqueta localmente; `git ls-remote --tags origin` la confirma en el remoto.

**En caso de fallo:** Si el push falla, verificar que se tiene acceso de escritura. Si la etiqueta ya existe, comprobar que apunta al commit correcto con `git show v0.2.0`.

### Paso 7: Crear la Versión de GitHub

```bash
gh release create v0.2.0 \
  --title "packagename v0.2.0" \
  --notes-file NEWS.md
```

O usar:

```r
usethis::use_github_release()
```

**Esperado:** Versión de GitHub creada con las notas de la versión visibles en la página de Versiones del repositorio.

**En caso de fallo:** Si `gh release create` falla, asegurarse de que la CLI `gh` está autenticada (`gh auth status`). Si `usethis::use_github_release()` falla, crear la versión manualmente en GitHub.

### Paso 8: Configurar la Versión de Desarrollo

Tras la publicación, incrementar a la versión de desarrollo:

```r
usethis::use_dev_version()
```

Esto cambia la versión a `0.2.0.9000` indicando que es una versión de desarrollo.

```bash
git add DESCRIPTION NEWS.md
git commit -m "Begin development for next version"
git push
```

**Esperado:** La versión de DESCRIPTION es ahora `0.2.0.9000` (versión de desarrollo). NEWS.md tiene un nuevo encabezado para la versión de desarrollo. Los cambios se envían al remoto.

**En caso de fallo:** Si `usethis::use_dev_version()` no está disponible, cambiar manualmente la versión a `x.y.z.9000` en DESCRIPTION y añadir un encabezado `# packagename (development version)` a NEWS.md.

## Validación

- [ ] La versión en DESCRIPTION coincide con la publicación prevista
- [ ] NEWS.md tiene notas de versión completas y precisas
- [ ] `R CMD check` pasa
- [ ] La etiqueta git coincide con la versión (p. ej., `v0.2.0`)
- [ ] La versión de GitHub existe con las notas de la versión
- [ ] La versión de desarrollo post-publicación está configurada (x.y.z.9000)

## Errores Comunes

- **Olvidar enviar las etiquetas**: `git push` solo no envía las etiquetas. Usar `--tags` o `git push origin v0.2.0`
- **Formato de NEWS.md**: Usar encabezados markdown que coincidan con el formato esperado por pkgdown/CRAN
- **Etiquetar el commit incorrecto**: Siempre etiquetar después del commit de incremento de versión, no antes
- **La versión de CRAN ya existe**: CRAN no acepta una versión que ya ha sido publicada. Incrementar siempre.
- **Versión de desarrollo en la publicación**: Nunca enviar una versión `.9000` a CRAN

## Habilidades Relacionadas

- `submit-to-cran` - envío a CRAN tras la publicación de la versión
- `create-github-release` - creación general de versiones de GitHub
- `setup-github-actions-ci` - activa la recompilación de pkgdown al publicar una versión
- `build-pkgdown-site` - el sitio de documentación refleja la nueva versión
