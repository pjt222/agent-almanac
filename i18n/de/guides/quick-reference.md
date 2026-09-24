---
title: "Kurzreferenz"
description: "Befehlsuebersicht fuer Agenten, Skills, Teams, Git, R und Shell-Operationen"
category: reference
agents: []
teams: []
skills: []
locale: de
source_locale: en
source_commit: 33b561c9
fence_basis_commit: 33b561c9
translator: claude-opus-4-6
translation_date: 2026-03-13
---

# Kurzreferenz

Befehlsuebersicht zum Aufrufen von Agenten, Skills und Teams durch Claude Code, plus grundlegende Git-, R-, Shell- und WSL-Befehle.

## Agenten, Skills und Teams

### Skills aufrufen (Slash-Befehle)

Skills werden als Slash-Befehle in Claude Code aufgerufen, wenn sie in `.claude/skills/` verlinkt sind:

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

Skills koennen auch im Gespraech referenziert werden: "Verwende den create-r-package-Skill, um dies aufzusetzen."

### Agenten starten

Agenten werden als Subagenten ueber das Task-Tool von Claude Code gestartet. Claude Code direkt bitten:

```text
"Verwende den r-developer-Agenten, um Rcpp-Integration hinzuzufuegen"
"Starte den security-analyst, um diese Codebasis zu auditieren"
"Lass den code-reviewer diesen PR pruefen"
```

Agenten werden aus `.claude/agents/` entdeckt (in diesem Projekt als Symlink auf `agents/`).

### Teams aktivieren

Teams werden mit TeamCreate erstellt und ueber Aufgabenlisten verwaltet:

```text
"Erstelle das r-package-review-Team, um dieses Paket zu pruefen"
"Stelle das scrum-team fuer diesen Sprint zusammen"
"Starte das tending-Team fuer eine Meditationssitzung"
```

Verfuegbare Teams: r-package-review, gxp-compliance-validation, fullstack-web-dev, ml-data-science-review, devops-platform-engineering, tending, scrum-team, opaque-team, agentskills-alignment, entomology.

### Registry-Abfragen

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

### README-Automatisierung

```bash
# Regenerate all READMEs from registries
npm run update-readmes

# Check if READMEs are up to date (CI dry-run)
npm run check-readmes
```

## WSL-Windows-Integration

### Pfadkonvertierung

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

## R-Paketentwicklung

### Entwicklungszyklus

```r
devtools::load_all()        # Load package for development
devtools::document()        # Update documentation
devtools::test()            # Run tests
devtools::check()           # Full package check
devtools::install()         # Install package
```

### Schnellpruefungen

```r
devtools::test_file("tests/testthat/test-feature.R")
devtools::run_examples()
devtools::spell_check()
urlchecker::url_check()
```

### CRAN-Einreichung

```r
devtools::check_win_devel()     # Windows builder
devtools::check_win_release()   # Windows builder
rhub::rhub_check()              # R-hub multi-platform
devtools::release()             # Interactive CRAN submission
```

### Geruest erstellen

```r
usethis::use_r("function_name")           # New R file
usethis::use_test("function_name")        # New test file
usethis::use_vignette("guide_name")       # New vignette
usethis::use_mit_license()                # Add MIT license
usethis::use_github_action_check_standard() # CI/CD
```

## Git-Befehle

### Taegliche Operationen

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

### Remote-Operationen

```bash
git remote -v              # List remotes
git fetch origin           # Fetch changes
git pull origin main       # Pull and merge
git push origin main       # Push to remote
git push -u origin branch  # Push new branch
```

### Nuetzliche Aliase

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.last 'log -1 HEAD'
```

## Claude Code und MCP

### Sitzungsverwaltung

```bash
claude                     # Start Claude Code
claude mcp list            # List configured MCP servers
claude mcp get r-mcptools  # Get server details
```

### Konfigurationsdateien

```text
Claude Code (CLI/WSL):      ~/.claude.json
Claude Desktop (GUI/Win):   %APPDATA%\Claude\claude_desktop_config.json
```

### MCP-Server

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

## Shell-Befehle

### Navigation und Suche

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

### Dateioperationen

```bash
mkdir -p path/to/dir       # Create nested directories
cp -r source/ dest/        # Copy directory recursively
tar -czf archive.tar.gz dir/  # Create compressed tar
tar -xzf archive.tar.gz      # Extract tar.gz
du -sh directory           # Directory size
df -h                      # Disk space usage
```

### Prozessverwaltung

```bash
htop                       # Interactive process viewer
ps aux | grep process      # Find specific process
kill PID                   # Kill process by ID
```

## Tastenkuerzel

### Terminal (Bash)

```text
Strg+A    Zeilenanfang            Strg+E    Zeilenende
Strg+K    Bis Ende loeschen       Strg+U    Bis Anfang loeschen
Strg+W    Vorheriges Wort loeschen  Strg+R  Historie durchsuchen
Strg+L    Bildschirm loeschen     Strg+C    Befehl abbrechen
```

### tmux

```text
Strg+A |       Vertikal teilen     Strg+A -      Horizontal teilen
Strg+A Pfeile  Zwischen Panels     Strg+A d      Sitzung trennen
```

### VS Code

```text
Strg+`         Terminal oeffnen    Strg+P        Datei schnell oeffnen
Strg+Umsch+P   Befehlspalette     F1            Befehlspalette
```

## Umgebungsvariablen

```bash
printenv              # All environment variables
echo $PATH            # PATH variable
export VAR=value      # Set for current session

# Set permanently
echo 'export VAR=value' >> ~/.bashrc
source ~/.bashrc
```

## Paketverwaltungen

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

## Fehlerbehebung

### R-Paket-Probleme

```bash
which R                               # R location
R --version                           # R version
Rscript -e ".libPaths()"             # Library paths
echo $RSTUDIO_PANDOC                  # Check pandoc path
```

### WSL-Probleme

```bash
wsl --list --verbose   # List WSL distributions
wsl --status           # WSL status
ip addr                # IP addresses
```

### Git-Probleme

```bash
git config --list          # Show all config
git remote show origin     # Show remote details
git status --porcelain     # Machine-readable status
```

## Verwandte Ressourcen

- [Umgebung einrichten](setting-up-your-environment.md) -- Vollstaendige Einrichtungsanleitung
- [R-Paketentwicklung](r-package-development.md) -- Vollstaendiger R-Paket-Workflow
- [Das System verstehen](understanding-the-system.md) -- Wie Agenten, Skills und Teams zusammenarbeiten
- [Skills-Bibliothek](../skills/) -- Alle 278 Skills
- [Agenten-Bibliothek](../agents/) -- Alle 59 Agenten
- [Teams-Bibliothek](../teams/) -- Alle 10 Teams
