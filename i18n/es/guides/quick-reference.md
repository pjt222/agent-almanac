---
title: "Referencia Rápida"
description: "Hoja de referencia de comandos para agentes, habilidades, equipos, Git, R y operaciones de shell"
category: reference
agents: []
teams: []
skills: []
locale: es
source_locale: en
source_commit: befb7ac1
translator: Claude Opus 4.6
translation_date: 2026-03-13
---

# Referencia Rápida

Hoja de referencia de comandos para invocar agentes, habilidades y equipos a través de Claude Code, además de comandos esenciales de Git, R, shell y WSL.

## Agentes, Habilidades y Equipos

### Invocar Habilidades (Comandos de Barra)

Las habilidades se invocan como comandos de barra en Claude Code cuando están enlazadas simbólicamente en `.claude/skills/`:

```bash
# Hacer disponible una habilidad como comando de barra
ln -s ../../skills/submit-to-cran .claude/skills/submit-to-cran

# En Claude Code, invocar con:
/submit-to-cran

# Otros ejemplos
/commit-changes
/security-audit-codebase
/review-skill-format
```

Las habilidades también se pueden referenciar en la conversación: "Usa la habilidad create-r-package para generar la estructura de esto."

### Lanzar Agentes

Los agentes se lanzan como subagentes mediante la herramienta Task de Claude Code. Pedir a Claude Code directamente:

```
"Usa el agente r-developer para agregar integración Rcpp"
"Lanza el security-analyst para auditar este código"
"Que el code-reviewer revise este PR"
```

Los agentes se descubren desde `.claude/agents/` (enlazado simbólicamente a `agents/` en este proyecto).

### Activar Equipos

Los equipos se crean con TeamCreate y se gestionan mediante listas de tareas:

```
"Crear el equipo r-package-review para revisar este paquete"
"Configurar el scrum-team para este sprint"
"Lanzar el equipo tending para una sesión de meditación"
```

Equipos disponibles: r-package-review, gxp-compliance-validation, fullstack-web-dev, ml-data-science-review, devops-platform-engineering, tending, scrum-team, opaque-team, agentskills-alignment, entomology.

### Consultas al Registro

```bash
# Contar habilidades, agentes, equipos
grep "total_skills" skills/_registry.yml
grep "total_agents" agents/_registry.yml
grep "total_teams" teams/_registry.yml

# Listar todos los dominios
grep "^  [a-z]" skills/_registry.yml | head -50

# Listar todos los agentes
grep "^  - id:" agents/_registry.yml

# Listar todos los equipos
grep "^  - id:" teams/_registry.yml
```

### Automatización de README

```bash
# Regenerar todos los READMEs desde los registros
npm run update-readmes

# Verificar si los READMEs están actualizados (prueba seca de CI)
npm run check-readmes
```

## Integración WSL-Windows

### Conversión de Rutas

```bash
# Windows a WSL
C:\Users\Name\Documents  ->  /mnt/c/Users/Name/Documents
D:\dev\projects          ->  /mnt/d/dev/projects

# Acceder a R de Windows desde WSL (ajustar versión)
"/mnt/c/Program Files/R/R-4.5.0/bin/R.exe"
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"

# Abrir el directorio actual en el Explorador de Windows
explorer.exe .
```

## Desarrollo de Paquetes R

### Ciclo de Desarrollo

```r
devtools::load_all()        # Cargar paquete para desarrollo
devtools::document()        # Actualizar documentación
devtools::test()            # Ejecutar pruebas
devtools::check()           # Verificación completa del paquete
devtools::install()         # Instalar paquete
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
rhub::rhub_check()              # R-hub multiplataforma
devtools::release()             # Envío interactivo a CRAN
```

### Estructura Inicial

```r
usethis::use_r("function_name")           # Nuevo archivo R
usethis::use_test("function_name")        # Nuevo archivo de pruebas
usethis::use_vignette("guide_name")       # Nueva viñeta
usethis::use_mit_license()                # Agregar licencia MIT
usethis::use_github_action_check_standard() # CI/CD
```

## Comandos Git

### Operaciones Diarias

```bash
git status                 # Mostrar estado del árbol de trabajo
git diff                   # Mostrar cambios no preparados
git diff --staged          # Mostrar cambios preparados
git log --oneline -10      # Commits recientes

git add filename           # Preparar archivo específico
git commit -m "message"    # Confirmar con mensaje
git commit --amend         # Enmendar último commit

git checkout -b new-branch # Crear y cambiar a rama
git merge feature-branch   # Fusionar rama
```

### Operaciones Remotas

```bash
git remote -v              # Listar remotos
git fetch origin           # Obtener cambios
git pull origin main       # Pull y merge
git push origin main       # Enviar al remoto
git push -u origin branch  # Enviar nueva rama
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
claude                     # Iniciar Claude Code
claude mcp list            # Listar servidores MCP configurados
claude mcp get r-mcptools  # Obtener detalles del servidor
```

### Archivos de Configuración

```
Claude Code (CLI/WSL):      ~/.claude.json
Claude Desktop (GUI/Win):   %APPDATA%\Claude\claude_desktop_config.json
```

### Servidores MCP

```bash
# Integración R
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
pwd                        # Mostrar directorio de trabajo
ls -la                     # Listar archivos con detalles
tree                       # Mostrar árbol de directorios
z project-name             # Saltar a directorio frecuente

rg "pattern"               # Búsqueda con Ripgrep
rg -t r "pattern"          # Buscar solo en archivos R
fd "pattern"               # Find amigable
fd -e R                    # Buscar por extensión
```

### Operaciones con Archivos

```bash
mkdir -p path/to/dir       # Crear directorios anidados
cp -r source/ dest/        # Copiar directorio recursivamente
tar -czf archive.tar.gz dir/  # Crear tar comprimido
tar -xzf archive.tar.gz      # Extraer tar.gz
du -sh directory           # Tamaño del directorio
df -h                      # Uso de espacio en disco
```

### Gestión de Procesos

```bash
htop                       # Visor interactivo de procesos
ps aux | grep process      # Buscar proceso específico
kill PID                   # Terminar proceso por ID
```

## Atajos de Teclado

### Terminal (Bash)

```
Ctrl+A    Inicio de línea          Ctrl+E    Fin de línea
Ctrl+K    Borrar hasta el final    Ctrl+U    Borrar hasta el inicio
Ctrl+W    Borrar palabra anterior  Ctrl+R    Buscar en historial
Ctrl+L    Limpiar pantalla         Ctrl+C    Cancelar comando
```

### tmux

```
Ctrl+A |       Dividir verticalmente    Ctrl+A -      Dividir horizontalmente
Ctrl+A flechas Navegar paneles          Ctrl+A d      Desacoplar sesión
```

### VS Code

```
Ctrl+`         Abrir terminal           Ctrl+P        Apertura rápida de archivo
Ctrl+Shift+P   Paleta de comandos       F1            Paleta de comandos
```

## Variables de Entorno

```bash
printenv              # Todas las variables de entorno
echo $PATH            # Variable PATH
export VAR=value      # Establecer para la sesión actual

# Establecer permanentemente
echo 'export VAR=value' >> ~/.bashrc
source ~/.bashrc
```

## Gestores de Paquetes

```bash
# APT
sudo apt update && sudo apt install package

# npm
npm install -g package       # Instalar globalmente
npm list -g --depth=0        # Listar paquetes globales

# R (renv)
renv::init()                 # Inicializar renv
renv::install("package")     # Instalar paquete
renv::snapshot()             # Guardar lockfile
renv::restore()              # Restaurar desde lockfile
```

## Resolución de Problemas

### Problemas con Paquetes R

```bash
which R                               # Ubicación de R
R --version                           # Versión de R
Rscript -e ".libPaths()"             # Rutas de bibliotecas
echo $RSTUDIO_PANDOC                  # Verificar ruta de pandoc
```

### Problemas con WSL

```bash
wsl --list --verbose   # Listar distribuciones WSL
wsl --status           # Estado de WSL
ip addr                # Direcciones IP
```

### Problemas con Git

```bash
git config --list          # Mostrar toda la configuración
git remote show origin     # Mostrar detalles del remoto
git status --porcelain     # Estado legible por máquina
```

## Recursos Relacionados

- [Configuración del Entorno](setting-up-your-environment.md) -- guía completa de configuración
- [Desarrollo de Paquetes R](r-package-development.md) -- flujo completo de paquetes R
- [Entender el Sistema](understanding-the-system.md) -- cómo funcionan agentes, habilidades y equipos
- [Biblioteca de Habilidades](../skills/) -- las 278 habilidades
- [Biblioteca de Agentes](../agents/) -- los 59 agentes
- [Biblioteca de Equipos](../teams/) -- los 10 equipos
