---
name: apply-semantic-versioning
description: >
  Aplicar versionado semántico (SemVer 2.0.0) para determinar el incremento de
  versión correcto basado en análisis de cambios. Cubre clasificación
  mayor/menor/parche, identificadores de pre-lanzamiento, metadatos de
  compilación y detección de cambios incompatibles. Usar al preparar un nuevo
  lanzamiento para determinar el número de versión correcto, después de fusionar
  cambios antes de etiquetar, al evaluar si un cambio constituye un cambio
  incompatible, al agregar identificadores de pre-lanzamiento, o al resolver
  desacuerdos sobre qué incremento de versión es apropiado.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: intermediate
  language: multi
  tags: versioning, semver, version-bump, breaking-changes
  locale: es
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# Apply Semantic Versioning

Determinar y aplicar el incremento de versión semántico correcto analizando los cambios desde el último lanzamiento. Esta habilidad lee archivos de versión, clasifica cambios como incompatibles (mayor), funcionalidad (menor) o corrección (parche), calcula el nuevo número de versión y actualiza los archivos apropiados. Sigue la especificación [SemVer 2.0.0](https://semver.org/).

## Cuándo Usar

- Preparar un nuevo lanzamiento y necesitar determinar el número de versión correcto
- Después de fusionar un conjunto de cambios y antes de etiquetar un lanzamiento
- Evaluar si un cambio constituye un cambio incompatible
- Agregar identificadores de pre-lanzamiento (alpha, beta, rc) a una versión
- Resolver desacuerdos sobre qué incremento de versión es apropiado

## Entradas

- **Requerido**: Directorio raíz del proyecto que contiene un archivo de versión (DESCRIPTION, package.json, Cargo.toml, pyproject.toml o VERSION)
- **Requerido**: Historial de Git desde el último lanzamiento (etiqueta o commit)
- **Opcional**: Convención de commits en uso (Conventional Commits, forma libre)
- **Opcional**: Etiqueta de pre-lanzamiento a aplicar (alpha, beta, rc)
- **Opcional**: Versión anterior si no es legible desde los archivos

## Procedimiento

### Paso 1: Leer la Versión Actual

Localizar y leer el archivo de versión en la raíz del proyecto.

```bash
# R packages
grep "^Version:" DESCRIPTION

# Node.js
grep '"version"' package.json

# Rust
grep '^version' Cargo.toml

# Python
grep 'version' pyproject.toml

# Plain file
cat VERSION
```

Analizar la versión actual en componentes mayor.menor.parche. Si la versión contiene un sufijo de pre-lanzamiento (ej., `1.2.0-beta.1`), anotarlo por separado.

**Esperado:** Versión actual identificada como `MAYOR.MENOR.PARCHE[-PRELANZAMIENTO]`.

**En caso de fallo:** Si no se encuentra un archivo de versión, buscar un archivo VERSION o etiquetas de git (`git describe --tags --abbrev=0`). Si no existe ninguna versión, comenzar en `0.1.0` para desarrollo inicial o `1.0.0` si el proyecto tiene una API pública estable.

### Paso 2: Analizar los Cambios Desde el Último Lanzamiento

Obtener la lista de cambios desde el último lanzamiento etiquetado.

```bash
# Find the last version tag
git describe --tags --abbrev=0

# List commits since that tag
git log --oneline v1.2.3..HEAD

# If using Conventional Commits, filter by type
git log --oneline v1.2.3..HEAD | grep -E "^[a-f0-9]+ (feat|fix|BREAKING)"
```

Si no existen etiquetas, comparar contra el commit inicial o una línea base conocida.

**Esperado:** Una lista de commits con mensajes que pueden clasificarse por tipo de cambio.

**En caso de fallo:** Si el historial de git no está disponible o faltan etiquetas, pedir al desarrollador que describa los cambios manualmente. Clasificar basándose en su descripción.

### Paso 3: Clasificar los Cambios

Aplicar las reglas de clasificación SemVer:

| Tipo de Cambio | Incremento de Versión | Ejemplos |
|---|---|---|
| **Incompatible** (cambio de API incompatible) | MAYOR | Función pública renombrada/eliminada, tipo de retorno cambiado, parámetro eliminado, comportamiento predeterminado cambiado |
| **Funcionalidad** (nueva funcionalidad retrocompatible) | MENOR | Nueva función exportada, nuevo parámetro con valor predeterminado, soporte de nuevo formato de archivo |
| **Corrección** (corrección de error retrocompatible) | PARCHE | Corrección de error, corrección de documentación, mejora de rendimiento con la misma API |

Reglas de clasificación:
1. Si CUALQUIER cambio es incompatible, el incremento es MAYOR (reinicia menor y parche a 0)
2. Si no hay cambios incompatibles pero HAY nuevas funcionalidades, el incremento es MENOR (reinicia parche a 0)
3. Si solo hay correcciones, el incremento es PARCHE

Casos especiales:
- **Pre-1.0.0**: Durante el desarrollo inicial (`0.x.y`), los incrementos menores pueden contener cambios incompatibles. Documentar claramente.
- **Deprecación**: Deprecar una función es un cambio MENOR (aún funciona). Eliminarla es MAYOR.
- **Cambios internos**: Refactorización que no cambia la API pública es PARCHE.

**Esperado:** Cada cambio clasificado como incompatible/funcionalidad/corrección, y el nivel de incremento general determinado.

**En caso de fallo:** Si los cambios son ambiguos, errar hacia un incremento mayor. Un incremento mayor conservador es mejor que un incremento menor que rompe código dependiente.

### Paso 4: Calcular la Nueva Versión

Aplicar el incremento a la versión actual:

| Actual | Incremento | Nueva Versión |
|---|---|---|
| 1.2.3 | MAYOR | 2.0.0 |
| 1.2.3 | MENOR | 1.3.0 |
| 1.2.3 | PARCHE | 1.2.4 |
| 0.9.5 | MENOR | 0.10.0 |
| 2.0.0-rc.1 | (lanzamiento) | 2.0.0 |

Si se solicita una etiqueta de pre-lanzamiento:
- `1.3.0-alpha.1` para la primera alpha del próximo 1.3.0
- `1.3.0-beta.1` para la primera beta
- `1.3.0-rc.1` para el primer candidato a lanzamiento

Precedencia de pre-lanzamiento: `alpha < beta < rc < (lanzamiento)`.

**Esperado:** Nuevo número de versión calculado siguiendo las reglas de SemVer.

**En caso de fallo:** Si la versión actual tiene formato incorrecto o no es SemVer, normalizarla primero. Por ejemplo, `1.2` se convierte en `1.2.0`.

### Paso 5: Actualizar los Archivos de Versión

Escribir la nueva versión en el o los archivos apropiados.

```r
# R: Update DESCRIPTION
# Change "Version: 1.2.3" to "Version: 1.3.0"
```

```json
// Node.js: Update package.json
// Change "version": "1.2.3" to "version": "1.3.0"
// Also update package-lock.json if present
```

```toml
# Rust: Update Cargo.toml
# Change version = "1.2.3" to version = "1.3.0"
```

Si el proyecto tiene múltiples archivos que referencian la versión (ej., `_pkgdown.yml`, `CITATION`, `codemeta.json`), actualizar todos.

**Esperado:** Todos los archivos de versión actualizados consistentemente al nuevo número de versión.

**En caso de fallo:** Si la actualización de un archivo falla, revertir todos los cambios para mantener la consistencia. Nunca dejar archivos de versión en un estado parcialmente actualizado.

### Paso 6: Crear la Etiqueta de Versión

Después de hacer commit del incremento de versión, crear una etiqueta de git.

```bash
# Annotated tag (preferred)
git tag -a v1.3.0 -m "Release v1.3.0"

# Lightweight tag (acceptable)
git tag v1.3.0
```

Usar el formato de etiqueta establecido del proyecto:
- `v1.3.0` (más común)
- `1.3.0` (sin prefijo)
- `package-name@1.3.0` (monorepo)

**Esperado:** Etiqueta de Git creada coincidiendo con la nueva versión.

**En caso de fallo:** Si la etiqueta ya existe, la versión no se incrementó correctamente. Verificar etiquetas duplicadas con `git tag -l "v1.3*"` y resolver antes de continuar.

## Validación

- [ ] La versión actual se leyó del archivo de versión correcto
- [ ] Todos los commits desde el último lanzamiento fueron analizados
- [ ] Cada cambio se clasifica como incompatible, funcionalidad o corrección
- [ ] El nivel de incremento coincide con el cambio de mayor severidad (incompatible > funcionalidad > corrección)
- [ ] La nueva versión sigue el formato SemVer 2.0.0: `MAYOR.MENOR.PARCHE[-PRELANZAMIENTO][+COMPILACIÓN]`
- [ ] Todos los archivos de versión en el proyecto están actualizados consistentemente
- [ ] No se saltó ninguna versión (ej., 1.2.3 a 1.4.0 sin que 1.3.0 fuera lanzada)
- [ ] La etiqueta de Git coincide con la nueva versión y la convención de formato de etiqueta del proyecto
- [ ] El sufijo de pre-lanzamiento, si se usa, sigue la precedencia correcta (alpha < beta < rc)

## Errores Comunes

- **Saltar versiones menores**: Ir de 1.2.3 directamente a 1.4.0 porque "agregamos dos funcionalidades." Cada lanzamiento obtiene un incremento; el número de funcionalidades no determina la versión.
- **Tratar la deprecación como incompatible**: Deprecar una función (agregar una advertencia) es un cambio menor. Solo eliminarla es un cambio incompatible.
- **Olvidar las reglas pre-1.0.0**: Antes de 1.0.0, la API se considera inestable. Algunos proyectos incrementan menor para cambios incompatibles durante esta fase, pero debería documentarse.
- **Archivos de versión inconsistentes**: Actualizar package.json pero no package-lock.json, o actualizar DESCRIPTION pero no CITATION. Todas las referencias de versión deben mantenerse sincronizadas.
- **Confusión de metadatos de compilación**: Los metadatos de compilación (`+build.123`) no afectan la precedencia de versión. `1.0.0+build.1` y `1.0.0+build.2` tienen la misma precedencia.
- **No etiquetar lanzamientos**: Sin etiquetas de git, los futuros incrementos de versión no pueden determinar la línea base para el análisis de cambios.

## Habilidades Relacionadas

- `manage-changelog` -- Mantener entradas de registro de cambios que se emparejan con incrementos de versión
- `plan-release-cycle` -- Planificar hitos de lanzamiento que determinan cuándo ocurren los incrementos de versión
- `release-package-version` -- Flujo de trabajo de lanzamiento específico de R que incluye incremento de versión
- `commit-changes` -- Hacer commit del incremento de versión con un mensaje apropiado
- `create-github-release` -- Crear un lanzamiento de GitHub desde la etiqueta de versión
