---
title: "Referencia Rápida"
description: "Hoja de referencia de comandos para agentes, habilidades, equipos, Git, R y operaciones de shell"
category: reference
agents: []
teams: []
skills: []
locale: es
source_locale: en
source_commit: 33b561c9
fence_basis_commit: 33b561c9
translator: Claude Opus 4.6
translation_date: 2026-03-13
---

# Referencia Rápida

Hoja de referencia de comandos para invocar agentes, habilidades y equipos a través de Claude Code, además de comandos esenciales de Git, R, shell y WSL.

## Agentes, Habilidades y Equipos

### Invocar Habilidades (Comandos de Barra)

Las habilidades se invocan como comandos de barra en Claude Code cuando están enlazadas simbólicamente en `.claude/skills/`:

```bash
# Make a skill available as a slash command
ln -s ../../skills/submit-to-cran .claude/skills/submit-to-cran

# In Claude Code, invoke with:
/submit-to-cran

# Other examples
/commit-changes
/security-audit-codebase
/review-skill-format
```

Las habilidades también se pueden referenciar en la conversación: "Usa la habilidad create-r-package para generar la estructura de esto."

### Lanzar Agentes

Los agentes se lanzan como subagentes mediante la herramienta Task de Claude Code. Pedir a Claude Code directamente:

```text
"Usa el agente r-developer para agregar integración Rcpp"
"Lanza el security-analyst para auditar este código"
"Que el code-reviewer revise este PR"
```

Los agentes se descubren desde `.claude/agents/` (enlazado simbólicamente a `agents/` en este proyecto).

### Activar Equipos

Los equipos se crean con TeamCreate y se gestionan mediante listas de tareas:

```text
"Crear el equipo r-package-review para revisar este paquete"
"Configurar el scrum-team para este sprint"
"Lanzar el equipo tending para una sesión de meditación"
```

Equipos disponibles: r-package-review, gxp-compliance-validation, fullstack-web-dev, ml-data-science-review, devops-platform-engineering, tending, scrum-team, opaque-team, agentskills-alignment, entomology.

### Consultas al Registro

```bash
# Count skills, agents, teams
grep "total_skills" skills/_registry.yml
grep "total_agents" agents/_registry.yml
grep "total_teams" teams/_registry.yml

# List all domains
grep "^  [a-z]" skills/_registry.yml | head -50

# List all agents
grep "^  - id:" agents/_registry.yml

# List all teams
grep "^  - id:" teams/_registry.yml
```

### Automatización de README

```bash
# Regenerate all READMEs from registries
npm run update-readmes

# Check if READMEs are up to date (CI dry-run)
npm run check-readmes
```

## Integración WSL-Windows

### Conversión de Rutas

```bash
# Windows to WSL
C:\Users\Name\Documents  ->  /mnt/c/Users/Name/Documents
D:\dev\projects          ->  /mnt/d/dev/projects

# Access Windows R from WSL (adjust version)
"/mnt/c/Program Files/R/R-4.5.0/bin/R.exe"
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"

# Open current directory in Windows Explorer
explorer.exe .
```

## Desarrollo de Paquetes R

### Ciclo de Desarrollo

```r
devtools::load_all()        # Load package for development
devtools::document()        # Update documentation
devtools::test()            # Run tests
devtools::check()           # Full package check
devtools::install()         # Install package
```

### Verificaciones Rápidas

```r
devtools::test_file("tests/testthat/test-feature.R")
devtools::run_examples()
devtools::spell_check()
urlchecker::url_check()
```

### Envío a CRAN

```r
devtools::check_win_devel()     # Windows builder
devtools::check_win_release()   # Windows builder
rhub::rhub_check()              # R-hub multi-platform
devtools::release()             # Interactive CRAN submission
```

### Estructura Inicial

```r
usethis::use_r("function_name")           # New R file
usethis::use_test("function_name")        # New test file
usethis::use_vignette("guide_name")       # New vignette
usethis::use_mit_license()                # Add MIT license
usethis::use_github_action_check_standard() # CI/CD
```

## Comandos Git

### Operaciones Diarias

```bash
git status                 # Show working tree status
git diff                   # Show unstaged changes
git diff --staged          # Show staged changes
git log --oneline -10      # Recent commits

git add filename           # Stage specific file
git commit -m "message"    # Commit with message
git commit --amend         # Amend last commit

git checkout -b new-branch # Create and switch to branch
git merge feature-branch   # Merge branch
```

### Operaciones Remotas

```bash
git remote -v              # List remotes
git fetch origin           # Fetch changes
git pull origin main       # Pull and merge
git push origin main       # Push to remote
git push -u origin branch  # Push new branch
```

### Alias Útiles

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.last 'log -1 HEAD'
```

## Claude Code y MCP

### Gestión de Sesión

```bash
claude                     # Start Claude Code
claude mcp list            # List configured MCP servers
claude mcp get r-mcptools  # Get server details
```

### Archivos de Configuración

```text
Claude Code (CLI/WSL):      ~/.claude.json
Claude Desktop (GUI/Win):   %APPDATA%\Claude\claude_desktop_config.json
```

### Servidores MCP

```bash
# R integration
claude mcp add r-mcptools stdio \
  "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" \
  -e "mcptools::mcp_server()"

# Hugging Face
claude mcp add hf-mcp-server \
  -e HF_TOKEN=your_token_here \
  -- mcp-remote https://huggingface.co/mcp
```

## Comandos de Shell

### Navegación y Búsqueda

```bash
pwd                        # Print working directory
ls -la                     # List files with details
tree                       # Show directory tree
z project-name             # Jump to frequent directory

rg "pattern"               # Ripgrep search
rg -t r "pattern"          # Search only R files
fd "pattern"               # User-friendly find
fd -e R                    # Find by extension
```

### Operaciones con Archivos

```bash
mkdir -p path/to/dir       # Create nested directories
cp -r source/ dest/        # Copy directory recursively
tar -czf archive.tar.gz dir/  # Create compressed tar
tar -xzf archive.tar.gz      # Extract tar.gz
du -sh directory           # Directory size
df -h                      # Disk space usage
```

### Gestión de Procesos

```bash
htop                       # Interactive process viewer
ps aux | grep process      # Find specific process
kill PID                   # Kill process by ID
```

## Atajos de Teclado

### Terminal (Bash)

```text
Ctrl+A    Inicio de línea          Ctrl+E    Fin de línea
Ctrl+K    Borrar hasta el final    Ctrl+U    Borrar hasta el inicio
Ctrl+W    Borrar palabra anterior  Ctrl+R    Buscar en historial
Ctrl+L    Limpiar pantalla         Ctrl+C    Cancelar comando
```

### tmux

```text
Ctrl+A |       Dividir verticalmente    Ctrl+A -      Dividir horizontalmente
Ctrl+A flechas Navegar paneles          Ctrl+A d      Desacoplar sesión
```

### VS Code

```text
Ctrl+`         Abrir terminal           Ctrl+P        Apertura rápida de archivo
Ctrl+Shift+P   Paleta de comandos       F1            Paleta de comandos
```

## Variables de Entorno

```bash
printenv              # All environment variables
echo $PATH            # PATH variable
export VAR=value      # Set for current session

# Set permanently
echo 'export VAR=value' >> ~/.bashrc
source ~/.bashrc
```

## Gestores de Paquetes

```bash
# APT
sudo apt update && sudo apt install package

# npm
npm install -g package       # Install globally
npm list -g --depth=0        # List global packages

# R (renv)
renv::init()                 # Initialize renv
renv::install("package")     # Install package
renv::snapshot()             # Save lockfile
renv::restore()              # Restore from lockfile
```

## Resolución de Problemas

### Problemas con Paquetes R

```bash
which R                               # R location
R --version                           # R version
Rscript -e ".libPaths()"             # Library paths
echo $RSTUDIO_PANDOC                  # Check pandoc path
```

### Problemas con WSL

```bash
wsl --list --verbose   # List WSL distributions
wsl --status           # WSL status
ip addr                # IP addresses
```

### Problemas con Git

```bash
git config --list          # Show all config
git remote show origin     # Show remote details
git status --porcelain     # Machine-readable status
```

## Recursos Relacionados

- [Configuración del Entorno](setting-up-your-environment.md) -- guía completa de configuración
- [Desarrollo de Paquetes R](r-package-development.md) -- flujo completo de paquetes R
- [Entender el Sistema](understanding-the-system.md) -- cómo funcionan agentes, habilidades y equipos
- [Biblioteca de Habilidades](../skills/) -- las 278 habilidades
- [Biblioteca de Agentes](../agents/) -- los 59 agentes
- [Biblioteca de Equipos](../teams/) -- los 10 equipos
