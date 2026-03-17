---
name: resolve-git-conflicts
description: >
  Resuelve conflictos de merge y rebase con estrategias seguras de recuperación.
  Cubre la identificación de fuentes de conflicto, lectura de marcadores de
  conflicto, elección de estrategias de resolución y cómo continuar o abortar
  operaciones de forma segura. Úsalo cuando un git merge, rebase, cherry-pick
  o stash pop reporte conflictos, cuando un git pull resulte en cambios
  conflictivos, o cuando necesites abortar y reiniciar de forma segura una
  operación de merge o rebase fallida.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, merge-conflicts, rebase, conflict-resolution, version-control
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# Resolver Conflictos Git

Identifica, resuelve y recupera conflictos de merge y rebase.

## Cuándo Usar

- Un `git merge` o `git rebase` reporta conflictos
- Un `git cherry-pick` no puede aplicarse limpiamente
- Un `git pull` resulta en cambios conflictivos
- Un `git stash pop` entra en conflicto con el árbol de trabajo actual

## Entradas

- **Requerido**: Repositorio con conflictos activos
- **Opcional**: Estrategia de resolución preferida (ours, theirs, manual)
- **Opcional**: Contexto sobre qué cambios deben tener prioridad

## Procedimiento

### Paso 1: Identificar la Fuente del Conflicto

Determina qué operación causó el conflicto:

```bash
# Check current status
git status

# Look for indicators:
# "You have unmerged paths" — merge conflict
# "rebase in progress" — rebase conflict
# "cherry-pick in progress" — cherry-pick conflict
```

La salida del estado te indica qué archivos tienen conflictos y qué operación está en curso.

**Esperado:** `git status` muestra archivos listados bajo "Unmerged paths" e indica la operación activa.

**En caso de fallo:** Si `git status` muestra un árbol limpio pero esperabas conflictos, la operación puede haberse completado o abortado ya. Revisa `git log` para ver la actividad reciente.

### Paso 2: Leer los Marcadores de Conflicto

Abre cada archivo en conflicto y localiza los marcadores de conflicto:

```
<<<<<<< HEAD
// Your current branch's version
const result = calculateWeightedMean(data, weights);
=======
// Incoming branch's version
const result = computeWeightedAverage(data, weights);
>>>>>>> feature/rename-functions
```

- De `<<<<<<< HEAD` a `=======`: Tu rama actual (o la rama sobre la que estás haciendo rebase)
- De `=======` a `>>>>>>>`: Los cambios entrantes (la rama que se fusiona o el commit que se aplica)

**Esperado:** Cada archivo en conflicto contiene uno o más bloques con marcadores `<<<<<<<`, `=======` y `>>>>>>>`.

**En caso de fallo:** Si no se encuentran marcadores pero los archivos aparecen como conflictivos, el conflicto puede ser un archivo binario o un conflicto de archivo eliminado vs. modificado. Revisa `git diff --name-only --diff-filter=U` para la lista completa.

### Paso 3: Elegir una Estrategia de Resolución

**Merge manual** (más común): Edita el archivo para combinar lógicamente ambos cambios, luego elimina todos los marcadores de conflicto.

**Aceptar los nuestros** (conservar la versión de la rama actual):

```bash
# For a single file
git checkout --ours path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --ours .
git add -A
```

**Aceptar los suyos** (conservar la versión de la rama entrante):

```bash
# For a single file
git checkout --theirs path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --theirs .
git add -A
```

**Esperado:** Tras la resolución, el archivo contiene el contenido fusionado correcto sin marcadores de conflicto restantes.

**En caso de fallo:** Si elegiste el lado equivocado, vuelve a leer la versión en conflicto desde la base de la fusión. Durante un merge, `git checkout -m path/to/file` recrea los marcadores de conflicto para que puedas intentarlo de nuevo.

### Paso 4: Marcar Archivos como Resueltos

Después de editar cada archivo en conflicto:

```bash
# Stage the resolved file
git add path/to/resolved-file.R

# Check remaining conflicts
git status
```

Repite para cada archivo listado bajo "Unmerged paths".

**Esperado:** Todos los archivos pasan de "Unmerged paths" a "Changes to be committed". No quedan marcadores de conflicto en ningún archivo.

**En caso de fallo:** Si `git add` falla o quedan marcadores, vuelve a abrir el archivo y asegúrate de que todas las líneas `<<<<<<<`, `=======` y `>>>>>>>` fueron eliminadas.

### Paso 5: Continuar la Operación

Una vez resueltos todos los conflictos:

**Para merge**:

```bash
git commit
# Git auto-populates the merge commit message
```

**Para rebase**:

```bash
git rebase --continue
# May encounter more conflicts on subsequent commits — repeat steps 2-4
```

**Para cherry-pick**:

```bash
git cherry-pick --continue
```

**Para stash pop**:

```bash
# Stash pop conflicts don't need a continue — just commit or reset
git add .
git commit -m "Apply stashed changes with conflict resolution"
```

**Esperado:** La operación se completa. `git status` muestra un árbol de trabajo limpio (o avanza al siguiente commit durante el rebase).

**En caso de fallo:** Si el comando continue falla, revisa `git status` en busca de archivos no resueltos. Todos los conflictos deben estar resueltos antes de continuar.

### Paso 6: Abortar si es Necesario

Si la resolución es demasiado compleja o elegiste el enfoque equivocado, aborta de forma segura:

```bash
# Abort merge
git merge --abort

# Abort rebase
git rebase --abort

# Abort cherry-pick
git cherry-pick --abort
```

**Esperado:** El repositorio vuelve al estado anterior al inicio de la operación. Sin pérdida de datos.

**En caso de fallo:** Si el abort falla (poco frecuente), revisa `git reflog` para encontrar el commit anterior a la operación y usa `git reset --hard <commit>` para restaurarlo. Úsalo con precaución — esto descarta los cambios sin commit.

### Paso 7: Verificar la Resolución

Después de que la operación se complete:

```bash
# Verify clean working tree
git status

# Check that the merge/rebase result is correct
git log --oneline -5
git diff HEAD~1

# Run tests to confirm nothing is broken
# (language-specific: devtools::test(), npm test, cargo test, etc.)
```

**Esperado:** Árbol de trabajo limpio, historial de merge correcto, pruebas pasan.

**En caso de fallo:** Si las pruebas fallan tras la resolución, el merge puede haber introducido errores lógicos aunque los conflictos sintácticos estén resueltos. Revisa el diff detenidamente y corrige.

## Validación

- [ ] No quedan marcadores de conflicto (`<<<<<<<`, `=======`, `>>>>>>>`) en ningún archivo
- [ ] `git status` muestra un árbol de trabajo limpio
- [ ] El historial de merge/rebase es correcto en `git log`
- [ ] Las pruebas pasan después de la resolución de conflictos
- [ ] No se introdujeron cambios no intencionados

## Errores Comunes

- **Aceptar ciegamente un lado**: `--ours` o `--theirs` descarta completamente el otro lado. Úsalo solo cuando tengas la certeza de que una versión es completamente correcta.
- **Dejar marcadores de conflicto en el código**: Busca siempre en todo el archivo marcadores restantes después de editar. Una resolución parcial rompe el código.
- **Hacer amend durante el rebase**: Durante un rebase interactivo, no uses `--amend` a menos que el paso del rebase lo indique expresamente. Usa `git rebase --continue` en su lugar.
- **Perder trabajo al abortar**: `git rebase --abort` y `git merge --abort` descartan todo el trabajo de resolución. Solo aborta si quieres empezar de nuevo.
- **No probar después de la resolución**: Un merge sintácticamente correcto puede seguir siendo lógicamente incorrecto. Ejecuta siempre las pruebas.
- **Forzar push después del rebase**: Tras hacer rebase de una rama compartida, coordina con los colaboradores antes de forzar el push, ya que reescribe el historial.

## Habilidades Relacionadas

- `commit-changes` - hacer commit después de resolver conflictos
- `manage-git-branches` - flujos de trabajo de ramas que llevan a conflictos
- `configure-git-repository` - configuración del repositorio y estrategias de merge
