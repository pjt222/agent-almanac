---
name: manage-git-branches
description: >
  Crea, rastrea, cambia, sincroniza y limpia ramas de Git. Cubre convenciones
  de nombres, cambio seguro de ramas con stash, sincronización con el upstream
  y eliminación de ramas fusionadas. Úsalo al comenzar trabajo en una nueva
  funcionalidad o corrección de error, al cambiar entre tareas en distintas
  ramas, al mantener una rama de funcionalidad actualizada con main, o al
  limpiar ramas tras fusionar pull requests.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, branches, branching-strategy, stash, remote-tracking
locale: es
source_locale: en
source_commit: aa73494d
fence_basis_commit: aa73494d
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# Gestionar Ramas Git

Crea, cambia, sincroniza y limpia ramas siguiendo convenciones de nombres consistentes.

## Cuándo Usar

- Al comenzar trabajo en una nueva funcionalidad o corrección de error
- Al cambiar entre tareas en distintas ramas
- Al mantener una rama de funcionalidad actualizada con main
- Al limpiar ramas después de fusionar pull requests
- Al listar e inspeccionar ramas

## Entradas

- **Requerido**: Repositorio con al menos un commit
- **Opcional**: Convención de nombres de ramas (por defecto: `tipo/descripcion`)
- **Opcional**: Rama base para nuevas ramas (por defecto: `main`)
- **Opcional**: Nombre del remoto (por defecto: `origin`)

## Procedimiento

### Paso 1: Crear una Rama de Funcionalidad

Usa una convención de nombres consistente:

| Prefijo | Propósito | Ejemplo |
|---|---|---|
| `feature/` | Nueva funcionalidad | `feature/add-weighted-mean` |
| `fix/` | Corrección de error | `fix/null-pointer-in-parser` |
| `docs/` | Documentación | `docs/update-api-reference` |
| `refactor/` | Reestructuración de código | `refactor/extract-validation` |
| `chore/` | Mantenimiento | `chore/update-dependencies` |
| `test/` | Adición de pruebas | `test/add-edge-case-coverage` |

```bash
# Create and switch to a new branch from main
git checkout -b feature/add-weighted-mean main

# Or using the newer switch command
git switch -c feature/add-weighted-mean main
```

**Esperado:** Se crea la nueva rama y se activa. `git branch` muestra la nueva rama con un asterisco.

**En caso de fallo:** Si la rama base no existe localmente, primero haz fetch: `git fetch origin main && git checkout -b feature/name origin/main`.

### Paso 2: Rastrear Ramas Remotas

Configura el rastreo al subir una nueva rama por primera vez:

```bash
# Push and set upstream tracking
git push -u origin feature/add-weighted-mean

# Check tracking relationship
git branch -vv
```

Para hacer checkout de una rama remota creada por otra persona:

```bash
git fetch origin
git checkout feature/their-branch
# Git auto-creates a local tracking branch
```

**Esperado:** La rama local rastrea la rama remota correspondiente. `git branch -vv` muestra el upstream.

**En caso de fallo:** Si el rastreo automático falla, configúralo manualmente: `git branch --set-upstream-to=origin/feature/name feature/name`.

### Paso 3: Cambiar de Rama de Forma Segura

Antes de cambiar, asegúrate de que el árbol de trabajo esté limpio:

```bash
# Check for uncommitted changes
git status
```

**Si hay cambios**, haz commit o guárdalos con stash:

```bash
# Option 1: Commit work in progress
git add <files>
git commit -m "wip: save progress on validation logic"

# Option 2: Stash changes temporarily
git stash push -m "validation work in progress"

# Switch branches
git checkout main

# Later, restore stashed changes
git checkout feature/add-weighted-mean
git stash pop
```

Listar y gestionar el stash:

```bash
# List all stashes
git stash list

# Apply a specific stash (without removing it)
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}
```

**Esperado:** El cambio de rama tiene éxito. El árbol de trabajo refleja el estado de la rama destino. Los cambios guardados con stash son recuperables.

**En caso de fallo:** Si el cambio está bloqueado por cambios sin commit que serían sobreescritos, primero usa stash o haz commit. `git stash` no puede guardar archivos no rastreados a menos que uses `git stash push -u`.

### Paso 4: Sincronizar con el Upstream

Mantén tu rama de funcionalidad actualizada con la rama base:

```bash
# Fetch latest changes
git fetch origin

# Rebase onto latest main (preferred — keeps linear history)
git rebase origin/main

# Or merge main into your branch (creates merge commit)
git merge origin/main
```

**Esperado:** La rama incluye los últimos cambios de main. Sin conflictos, o conflictos resueltos (ver `resolve-git-conflicts`).

**En caso de fallo:** Si el rebase genera conflictos, resuelve cada uno y ejecuta `git rebase --continue`. Si los conflictos son demasiado complejos, aborta con `git rebase --abort` e intenta `git merge origin/main` en su lugar.

### Paso 5: Limpiar Ramas Fusionadas

Después de que los pull requests sean fusionados, elimina las ramas obsoletas. Primero confirma que el trabajo de cada rama llegó a `main`, porque `git branch -d` no responde a esa pregunta (ver En caso de fallo más abajo). Deben cumplirse dos condiciones a la vez. La forja (forge) debe informar que el PR se fusionó en `main`: `gh pr view <n> --json state,baseRefName,headRefOid,mergeCommit` muestra `MERGED` y `main`. Y la rama local no debe contener nada que el PR no tuviera: `git merge-base --is-ancestor <branch> <headRefOid>` termina con código de salida 0. `headRefOid` es el head del PR que la forja fusionó, por lo que esta única prueba funciona igual para un merge commit, un squash merge y un rebase merge. El estado del PR por sí solo no basta, porque no puede ver un commit local que el PR nunca tuvo.

El código de salida 1 significa que la rama lleva un commit así (uno hecho después del último push, o uno que la rama remota perdió por un force-push): conserva la rama. El código de salida 128 significa que el head del PR no está presente localmente, por ejemplo porque otra persona hizo push al PR antes de que se eliminara la rama: tráelo con `git fetch origin refs/pull/<n>/head`, que GitHub conserva tras eliminar la rama, y vuelve a ejecutar la prueba. Para un merge commit, la prueba de ascendencia contra el merge commit (`mergeCommit.oid` en la misma salida de `gh`, tras `git fetch origin main`) responde a la misma pregunta. Un squash merge, y un rebase merge que reescribió los commits, fallan esa prueba contra el merge commit por construcción, porque sus commits son nuevos y no contienen los commits de la rama; aun así pasan la prueba de `headRefOid`. Solo `MERGED` junto con el código de salida 0 autoriza una eliminación. El bloque de código de abajo enumera las formas de eliminación como referencia. Una vez superada la comprobación, `git branch -D` es seguro, y si la línea `-d` del bloque se niega a eliminar, se trata del caso descrito en En caso de fallo.

```bash
# Delete a local branch that has been merged
git branch -d feature/add-weighted-mean

# Delete a local branch (force, even if not merged)
git branch -D feature/abandoned-experiment

# Delete a remote branch
git push origin --delete feature/add-weighted-mean

# Prune remote-tracking references for deleted remote branches
git fetch --prune
```

**Esperado:** Las ramas fusionadas se eliminan local y remotamente. `git branch` muestra solo las ramas activas.

**En caso de fallo:** `git branch -d` no es una comprobación de fusión (#865, #900). Según `git help branch`, la rama debe estar completamente fusionada en su upstream, o en HEAD si no hay upstream configurado; medido (git 2.43), un upstream mostrado como `gone` cuenta como inexistente, así que se comprueba HEAD. Por tanto, una rama subida con `-u` (Paso 2) y sin nada pendiente de subir pasa la comprobación tanto si llegó a `main` como si no: `-d` la elimina, termina con código de salida 0 y solo imprime una advertencia en stderr (`deleting branch … that has been merged to 'refs/remotes/origin/…', but not yet merged to HEAD`). Si luego se ejecuta en orden el bloque de código anterior, también se elimina la rama remota, y no queda ninguna ref que contenga el trabajo. Una rama sin upstream se comprueba contra el HEAD del worktree en el que se ejecuta el comando, de modo que cuando HEAD es una rama apilada que la contiene, `-d` la elimina sin imprimir absolutamente nada en stderr. En la dirección contraria, `-d` rechaza una rama que *sí* fue fusionada siempre que a la referencia que comprueba le falte la punta (tip): HEAD (por ejemplo, un `main` local aún no actualizado) una vez que el upstream ha desaparecido tras eliminarse la rama remota, o un upstream que va por detrás de la punta porque esta se subió desde otro clon y aún no se ha hecho fetch. Una punta por delante de su upstream porque un commit nunca se subió no es ese caso: ese commit no está en ningún PR, y el rechazo es correcto. Una rama fusionada mediante squash merge solo se rechaza cuando a la referencia comprobada le falta la punta, por ejemplo HEAD una vez que el upstream ha desaparecido; mientras su propio upstream subido siga vivo, `-d` la elimina. La respuesta es la misma en ambos casos: ejecuta la comprobación del inicio de este paso y elimina con `git branch -D` solo cuando se supere.

### Paso 6: Listar e Inspeccionar Ramas

```bash
# List local branches
git branch

# List all branches (local and remote)
git branch -a

# List branches with last commit info
git branch -v

# List branches merged into main
git branch --merged main

# List branches NOT yet merged
git branch --no-merged main

# See which remote branch each local branch tracks
git branch -vv
```

**Esperado:** Vista clara de todas las ramas, su estado y las relaciones de rastreo.

**En caso de fallo:** Si las ramas remotas aparecen desactualizadas, ejecuta `git fetch --prune` para limpiar las referencias a ramas remotas eliminadas.

## Validación

- [ ] Los nombres de las ramas siguen la convención acordada
- [ ] Las ramas de funcionalidad se crean desde la rama base correcta
- [ ] Las ramas locales rastrean sus contrapartes remotas
- [ ] Las ramas fusionadas están limpias (local y remotamente)
- [ ] El árbol de trabajo está limpio antes de cambiar de rama
- [ ] Los cambios guardados con stash no quedan huérfanos

## Errores Comunes

- **Trabajar directamente en main**: Crea siempre una rama de funcionalidad. Hacer commit directamente en main dificulta la creación de PRs y la colaboración.
- **Olvidar hacer fetch antes de crear una rama**: Crear una rama desde un main local desactualizado significa empezar atrasado. Siempre ejecuta `git fetch origin` primero.
- **Ramas de larga duración**: Las ramas de funcionalidad que viven semanas acumulan conflictos de fusión. Sincroniza con frecuencia y mantén las ramas de corta duración.
- **Stashes huérfanos**: `git stash` es almacenamiento temporal. No dependas de él para trabajo a largo plazo. Haz commit o crea una rama en su lugar.
- **Eliminar trabajo no fusionado**: Ninguna de las dos opciones de eliminación es segura por sí sola. `git branch -D` elimina sin importar el estado de fusión, y `git branch -d` elimina una rama no fusionada que esté completamente subida a su propio upstream o, sin upstream, una que el HEAD actual contenga aunque `main` no la contenga (sin ninguna advertencia). Antes de usar cualquiera de las dos, ejecuta la comprobación del inicio del Paso 5: el PR está `MERGED` en `main` y `git merge-base --is-ancestor <branch> <headRefOid>` termina con código de salida 0.
- **No hacer prune**: Las ramas remotas eliminadas en GitHub siguen apareciendo localmente hasta que ejecutas `git fetch --prune`.

## Habilidades Relacionadas

- `commit-changes` - hacer commit del trabajo en las ramas
- `create-pull-request` - abrir PRs desde ramas de funcionalidad
- `resolve-git-conflicts` - resolver conflictos durante la sincronización
- `configure-git-repository` - configuración del repositorio y estrategia de ramas
