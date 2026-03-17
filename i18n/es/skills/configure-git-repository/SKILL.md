---
name: configure-git-repository
description: >
  Configura un repositorio Git con .gitignore adecuado, estrategia de ramas,
  convenciones de commits, hooks y configuración remota. Cubre la configuración
  inicial y los patrones comunes para proyectos R, Node.js y Python. Úsalo al
  inicializar el control de versiones para un nuevo proyecto, añadir un
  .gitignore para un lenguaje o framework específico, establecer protección de
  ramas y convenciones, o configurar hooks de commit.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: git, version-control, gitignore, hooks, branching
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# Configurar Repositorio Git

Configura un repositorio Git con la configuración adecuada para el tipo de proyecto.

## Cuándo Usar

- Al inicializar el control de versiones para un nuevo proyecto
- Al añadir `.gitignore` para un lenguaje o framework específico
- Al establecer protección de ramas y convenciones
- Al configurar hooks de commit

## Entradas

- **Requerido**: Directorio del proyecto
- **Requerido**: Tipo de proyecto (paquete R, Node.js, Python, general)
- **Opcional**: URL del repositorio remoto
- **Opcional**: Estrategia de ramas (trunk-based, Git Flow)
- **Opcional**: Convención de mensajes de commit

## Procedimiento

### Paso 1: Inicializar Repositorio

```bash
cd /path/to/project
git init
git branch -M main
```

**Esperado:** Se crea el directorio `.git/`. La rama predeterminada se llama `main`.

**En caso de fallo:** Si `git init` falla, asegúrate de que Git esté instalado (`git --version`). Si el directorio ya tiene un `.git/`, el repositorio ya está inicializado — omite este paso.

### Paso 2: Crear .gitignore

**Paquete R**:

```gitignore
# R artifacts
.Rhistory
.RData
.Rproj.user/
*.Rproj

# Environment (sensitive)
.Renviron

# renv library (machine-specific)
renv/library/
renv/staging/
renv/cache/

# Build artifacts
*.tar.gz
src/*.o
src/*.so
src/*.dll

# Documentation build
docs/
inst/doc/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

**Node.js/TypeScript**:

```gitignore
node_modules/
dist/
build/
.next/
.env
.env.local
.env.*.local
*.log
npm-debug.log*
.DS_Store
Thumbs.db
.vscode/
.idea/
coverage/
```

**Python**:

```gitignore
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.eggs/
.venv/
venv/
.env
*.log
.mypy_cache/
.pytest_cache/
htmlcov/
.coverage
.DS_Store
.idea/
.vscode/
```

**Esperado:** Se crea el archivo `.gitignore` con entradas apropiadas para el tipo de proyecto. Los archivos sensibles (`.Renviron`, `.env`) y los artefactos generados quedan excluidos.

**En caso de fallo:** Si no estás seguro de qué entradas incluir, usa `gitignore.io` o las plantillas de `.gitignore` de GitHub como punto de partida y personalízalas para el proyecto.

### Paso 3: Crear Commit Inicial

```bash
git add .gitignore
git add .  # Review what's being added first with git status
git commit -m "Initial project setup"
```

**Esperado:** Se crea el primer commit con el `.gitignore` y los archivos iniciales del proyecto. `git log` muestra un commit.

**En caso de fallo:** Si `git commit` falla con "nothing to commit," asegúrate de que los archivos fueron añadidos con `git add`. Si falla con un error de identidad del autor, establece `git config user.name` y `git config user.email`.

### Paso 4: Conectar Repositorio Remoto

```bash
# Add remote
git remote add origin git@github.com:username/repo.git

# Push
git push -u origin main
```

**Esperado:** El remoto `origin` está configurado. `git remote -v` muestra las URLs de fetch y push. El commit inicial se sube al remoto.

**En caso de fallo:** Si el push falla con "Permission denied (publickey)," configura las claves SSH (ver `setup-wsl-dev-environment`). Si el remoto ya existe, actualízalo con `git remote set-url origin <url>`.

### Paso 5: Establecer Convenciones de Ramas

**Trunk-based (recomendado para equipos pequeños)**:

- `main`: código listo para producción
- Ramas de funcionalidad: `feature/descripcion`
- Corrección de errores: `fix/descripcion`

```bash
# Create feature branch
git checkout -b feature/add-authentication

# After work is done, merge or create PR
git checkout main
git merge feature/add-authentication
```

**Esperado:** La convención de nombres de ramas está establecida y documentada. Los miembros del equipo saben qué prefijo usar para cada tipo de trabajo.

**En caso de fallo:** Si las ramas ya tienen nombres inconsistentes, renómbralas con `git branch -m old-name new-name` y actualiza cualquier PR abierto.

### Paso 6: Configurar Convenciones de Commits

Formato de Commits Convencionales:

```
type(scope): description

feat: add user authentication
fix: correct calculation in weighted_mean
docs: update README installation section
test: add edge case tests for parser
refactor: extract helper function
chore: update dependencies
```

**Esperado:** La convención de mensajes de commit está documentada y acordada por el equipo. Los commits futuros siguen el formato `tipo: descripción`.

**En caso de fallo:** Si los miembros del equipo no siguen la convención, aplícala con un hook commit-msg que valide el formato (ver Paso 7).

### Paso 7: Configurar Hooks Pre-Commit (Opcional)

Crear `.githooks/pre-commit`:

```bash
#!/bin/bash
# Run linter before commit

# For R packages
if [ -f "DESCRIPTION" ]; then
  Rscript -e "lintr::lint_package()" || exit 1
fi

# For Node.js
if [ -f "package.json" ]; then
  npm run lint || exit 1
fi
```

```bash
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

**Esperado:** El hook pre-commit se ejecuta automáticamente en cada `git commit`. Los errores de linting bloquean el commit hasta que se corrijan.

**En caso de fallo:** Si el hook no se ejecuta, verifica que `core.hooksPath` esté establecido (`git config core.hooksPath`) y que el archivo del hook sea ejecutable (`chmod +x`).

### Paso 8: Crear README

```bash
# Minimal README
echo "# Project Name" > README.md
echo "" >> README.md
echo "Brief description of the project." >> README.md
git add README.md
git commit -m "Add README"
```

**Esperado:** `README.md` comprometido en el repositorio. El proyecto tiene una página de inicio mínima pero informativa en GitHub.

**En caso de fallo:** Si `README.md` ya existe, actualízalo en lugar de sobreescribirlo. Usa `usethis::use_readme_md()` en proyectos R para obtener una plantilla con insignias.

## Validación

- [ ] `.gitignore` excluye archivos sensibles y generados
- [ ] Ningún dato sensible (tokens, contraseñas) en archivos rastreados
- [ ] Repositorio remoto conectado y accesible
- [ ] Convenciones de nombres de ramas documentadas
- [ ] Commit inicial creado correctamente

## Errores Comunes

- **Hacer commit antes del .gitignore**: Añade `.gitignore` primero. Los archivos ya rastreados no se ven afectados por entradas añadidas posteriormente al `.gitignore`.
- **Datos sensibles en el historial**: Si se cometen secretos, permanecen en el historial incluso después de borrarlos. Usa `git filter-repo` o BFG para limpiar.
- **Archivos binarios grandes**: No hagas commit de binarios grandes. Usa Git LFS para archivos > 1MB.
- **Fin de línea**: Establece `core.autocrlf=input` en Windows/WSL para evitar problemas CRLF/LF.

## Habilidades Relacionadas

- `commit-changes` - flujo de trabajo de staging y commit
- `manage-git-branches` - creación de ramas y convenciones
- `create-r-package` - configuración de Git como parte de la creación de paquetes R
- `setup-wsl-dev-environment` - instalación de Git y claves SSH
- `create-github-release` - creación de releases desde el repositorio
- `security-audit-codebase` - verificar secretos comprometidos
