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
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, branches, branching-strategy, stash, remote-tracking
locale: es
source_locale: en
source_commit: 6f65f316
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
|---------|-----------|---------|
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

Después de que los pull requests sean fusionados, elimina las ramas obsoletas:

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

**En caso de fallo:** `git branch -d` se niega a eliminar ramas no fusionadas. Si la rama fue fusionada mediante squash merge en GitHub, Git puede no reconocerla como fusionada. Usa `git branch -D` si tienes la certeza de que el trabajo está preservado.

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
- **Eliminar trabajo no fusionado**: `git branch -D` es destructivo. Verifica con `git log branch-name` antes de forzar la eliminación.
- **No hacer prune**: Las ramas remotas eliminadas en GitHub siguen apareciendo localmente hasta que ejecutas `git fetch --prune`.

## Habilidades Relacionadas

- `commit-changes` - hacer commit del trabajo en las ramas
- `create-pull-request` - abrir PRs desde ramas de funcionalidad
- `resolve-git-conflicts` - resolver conflictos durante la sincronización
- `configure-git-repository` - configuración del repositorio y estrategia de ramas
