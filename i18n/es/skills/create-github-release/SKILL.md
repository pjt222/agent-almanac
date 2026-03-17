---
name: create-github-release
description: >
  Crea una release de GitHub con etiquetado adecuado, notas de release y
  artefactos de compilación opcionales. Cubre el versionado semántico,
  generación de changelog y uso de GitHub CLI. Úsalo al marcar una versión
  estable de software para distribución, al publicar una nueva versión de una
  biblioteca o aplicación, al crear notas de release para las partes
  interesadas, o al distribuir artefactos de compilación (binarios, tarballs).
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: github, release, git-tags, changelog, versioning
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# Crear Release en GitHub

Crea una release de GitHub etiquetada con notas de release y artefactos opcionales.

## Cuándo Usar

- Al marcar una versión estable de software para distribución
- Al publicar una nueva versión de una biblioteca o aplicación
- Al crear notas de release para las partes interesadas
- Al distribuir artefactos de compilación (binarios, tarballs)

## Entradas

- **Requerido**: Número de versión (versionado semántico)
- **Requerido**: Resumen de cambios desde la última release
- **Opcional**: Artefactos de compilación para adjuntar
- **Opcional**: Si es una pre-release

## Procedimiento

### Paso 1: Determinar el Número de Versión

Sigue el versionado semántico (`MAJOR.MINOR.PATCH`):

| Cambio | Ejemplo | Cuándo |
|--------|---------|--------|
| MAJOR | 1.0.0 -> 2.0.0 | Cambios incompatibles hacia atrás |
| MINOR | 1.0.0 -> 1.1.0 | Nuevas funcionalidades, compatible hacia atrás |
| PATCH | 1.0.0 -> 1.0.1 | Solo corrección de errores |

**Esperado:** Se elige un número de versión que refleja con precisión el alcance de los cambios desde la última release.

**En caso de fallo:** Si no estás seguro de si los cambios son incompatibles, revisa el diff de la API pública. Cualquier eliminación o cambio de firma de una función exportada es un cambio incompatible que requiere incrementar MAJOR.

### Paso 2: Actualizar la Versión en los Archivos del Proyecto

- `DESCRIPTION` (paquetes R)
- `package.json` (Node.js)
- `Cargo.toml` (Rust)
- `pyproject.toml` (Python)

**Esperado:** El número de versión se actualiza en el archivo de proyecto apropiado y se hace commit al control de versiones.

**En caso de fallo:** Si la versión ya se actualizó en un paso anterior (por ejemplo, mediante `usethis::use_version()` en R), verifica que coincida con la versión de release prevista.

### Paso 3: Escribir las Notas de Release

Crea o actualiza el changelog. Organiza por categoría:

```markdown
## What's Changed

### New Features
- Added user authentication (#42)
- Support for custom themes (#45)

### Bug Fixes
- Fixed crash on empty input (#38)
- Corrected date parsing in UTC (#41)

### Improvements
- Improved error messages
- Updated dependencies

### Breaking Changes
- `old_function()` renamed to `new_function()` (#50)

**Full Changelog**: https://github.com/user/repo/compare/v1.0.0...v1.1.0
```

**Esperado:** Las notas de release están organizadas por categoría (funcionalidades, correcciones, cambios incompatibles) con referencias a issues/PRs para trazabilidad.

**En caso de fallo:** Si los cambios son difíciles de categorizar, revisa `git log v1.0.0..HEAD --oneline` para reconstruir la lista de cambios desde la última release.

### Paso 4: Crear Etiqueta Git

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

**Esperado:** Existe una etiqueta anotada `v1.1.0` local y en el remoto. `git tag -l` muestra la etiqueta.

**En caso de fallo:** Si la etiqueta ya existe, elimínala con `git tag -d v1.1.0 && git push origin :refs/tags/v1.1.0` y vuelve a crearla. Si el push es rechazado, asegúrate de tener acceso de escritura al remoto.

### Paso 5: Crear la Release en GitHub

**Usando GitHub CLI (recomendado)**:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes-file CHANGELOG.md
```

Con artefactos:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes "Release notes here" \
  build/app-v1.1.0.tar.gz \
  build/app-v1.1.0.zip
```

Pre-release:

```bash
gh release create v2.0.0-beta.1 \
  --title "v2.0.0 Beta 1" \
  --prerelease \
  --notes "Beta release for testing"
```

**Esperado:** Release visible en GitHub con etiqueta, notas y artefactos adjuntos (si los hay).

**En caso de fallo:** Si `gh` no está autenticado, ejecuta `gh auth login`. Si la etiqueta no existe en el remoto, súbela primero con `git push origin v1.1.0`.

### Paso 6: Generar Notas de Release Automáticamente

GitHub puede generar notas automáticamente a partir de los PRs fusionados:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --generate-notes
```

Configura las categorías en `.github/release.yml`:

```yaml
changelog:
  categories:
    - title: New Features
      labels:
        - enhancement
    - title: Bug Fixes
      labels:
        - bug
    - title: Documentation
      labels:
        - documentation
    - title: Other Changes
      labels:
        - "*"
```

**Esperado:** Las notas de release se generan automáticamente a partir de los títulos de los PRs fusionados, categorizadas por etiqueta. `.github/release.yml` controla las categorías.

**En caso de fallo:** Si las notas generadas automáticamente están vacías, asegúrate de que los PRs fueron fusionados (no cerrados) y tenían etiquetas asignadas. Como alternativa, escribe las notas manualmente.

### Paso 7: Verificar la Release

```bash
# List releases
gh release list

# View specific release
gh release view v1.1.0
```

**Esperado:** `gh release list` muestra la nueva release. `gh release view` muestra el título, etiqueta, notas y activos correctos.

**En caso de fallo:** Si la release no aparece, revisa la pestaña Actions en busca de flujos de trabajo de release que puedan haber fallado. Verifica que la etiqueta exista con `git tag -l`.

## Validación

- [ ] La etiqueta de versión sigue el versionado semántico
- [ ] La etiqueta Git apunta al commit correcto
- [ ] Las notas de release describen con precisión los cambios
- [ ] Los artefactos (si los hay) están adjuntos y son descargables
- [ ] La release es visible en la página del repositorio GitHub
- [ ] El indicador de pre-release está correctamente establecido

## Errores Comunes

- **Etiquetar el commit equivocado**: Verifica siempre `git log` antes de etiquetar. Etiqueta después del commit de actualización de versión.
- **Olvidar subir las etiquetas**: `git push` no sube etiquetas. Usa `git push --tags` o `git push origin v1.1.0`.
- **Formato de versión inconsistente**: Decide entre `v1.0.0` y `1.0.0` y mantén la coherencia.
- **Notas de release vacías**: Proporciona siempre notas significativas. Los usuarios necesitan saber qué cambió.
- **Eliminar y recrear etiquetas**: Evita modificar etiquetas después de subirlas. Si es necesario, crea una nueva versión en su lugar.

## Habilidades Relacionadas

- `commit-changes` - flujo de trabajo de staging y commit
- `manage-git-branches` - gestión de ramas para preparar una release
- `release-package-version` - flujo de trabajo de release específico para R
- `configure-git-repository` - requisito previo de configuración Git
- `setup-github-actions-ci` - automatizar releases mediante CI
