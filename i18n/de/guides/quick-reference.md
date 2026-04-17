---
title: "Kurzreferenz"
description: "Befehlsuebersicht fuer Agenten, Skills, Teams, Git, R und Shell-Operationen"
category: reference
agents: []
teams: []
skills: []
locale: de
source_locale: en
source_commit: befb7ac1
translator: claude-opus-4-6
translation_date: 2026-03-13
---

# Kurzreferenz

Befehlsuebersicht zum Aufrufen von Agenten, Skills und Teams durch Claude Code, plus grundlegende Git-, R-, Shell- und WSL-Befehle.

## Agenten, Skills und Teams

### Skills aufrufen (Slash-Befehle)

Skills werden als Slash-Befehle in Claude Code aufgerufen, wenn sie in `.claude/skills/` verlinkt sind:

```bash
# Einen Skill als Slash-Befehl verfuegbar machen
ln -s ../../skills/submit-to-cran .claude/skills/submit-to-cran

# In Claude Code aufrufen mit:
/submit-to-cran

# Weitere Beispiele
/commit-changes
/security-audit-codebase
/review-skill-format
```

Skills koennen auch im Gespraech referenziert werden: "Verwende den create-r-package-Skill, um dies aufzusetzen."

### Agenten starten

Agenten werden als Subagenten ueber das Task-Tool von Claude Code gestartet. Claude Code direkt bitten:

```
"Verwende den r-developer-Agenten, um Rcpp-Integration hinzuzufuegen"
"Starte den security-analyst, um diese Codebasis zu auditieren"
"Lass den code-reviewer diesen PR pruefen"
```

Agenten werden aus `.claude/agents/` entdeckt (in diesem Projekt als Symlink auf `agents/`).

### Teams aktivieren

Teams werden mit TeamCreate erstellt und ueber Aufgabenlisten verwaltet:

```
"Erstelle das r-package-review-Team, um dieses Paket zu pruefen"
"Stelle das scrum-team fuer diesen Sprint zusammen"
"Starte das tending-Team fuer eine Meditationssitzung"
```

Verfuegbare Teams: r-package-review, gxp-compliance-validation, fullstack-web-dev, ml-data-science-review, devops-platform-engineering, tending, scrum-team, opaque-team, agentskills-alignment, entomology.

### Registry-Abfragen

```bash
# Skills, Agenten, Teams zaehlen
grep "total_skills" skills/_registry.yml
grep "total_agents" agents/_registry.yml
grep "total_teams" teams/_registry.yml

# Alle Domaenen auflisten
grep "^  [a-z]" skills/_registry.yml | head -50

# Alle Agenten auflisten
grep "^  - id:" agents/_registry.yml

# Alle Teams auflisten
grep "^  - id:" teams/_registry.yml
```

### README-Automatisierung

```bash
# Alle READMEs aus Registries neu generieren
npm run update-readmes

# Pruefen ob READMEs aktuell sind (CI-Trockenlauf)
npm run check-readmes
```

## WSL-Windows-Integration

### Pfadkonvertierung

```bash
# Windows nach WSL
C:\Users\Name\Documents  ->  /mnt/c/Users/Name/Documents
D:\dev\projects          ->  /mnt/d/dev/projects

# Windows-R von WSL aus zugreifen (Version anpassen)
"/mnt/c/Program Files/R/R-4.5.0/bin/R.exe"
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"

# Aktuelles Verzeichnis im Windows Explorer oeffnen
explorer.exe .
```

## R-Paketentwicklung

### Entwicklungszyklus

```r
devtools::load_all()        # Paket fuer Entwicklung laden
devtools::document()        # Dokumentation aktualisieren
devtools::test()            # Tests ausfuehren
devtools::check()           # Vollstaendige Paketpruefung
devtools::install()         # Paket installieren
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
devtools::check_win_devel()     # Windows Builder
devtools::check_win_release()   # Windows Builder
rhub::rhub_check()              # R-hub Multiplattform
devtools::release()             # Interaktive CRAN-Einreichung
```

### Geruest erstellen

```r
usethis::use_r("function_name")           # Neue R-Datei
usethis::use_test("function_name")        # Neue Testdatei
usethis::use_vignette("guide_name")       # Neue Vignette
usethis::use_mit_license()                # MIT-Lizenz hinzufuegen
usethis::use_github_action_check_standard() # CI/CD
```

## Git-Befehle

### Taegliche Operationen

```bash
git status                 # Arbeitsbaumstatus anzeigen
git diff                   # Nicht bereitgestellte Aenderungen anzeigen
git diff --staged          # Bereitgestellte Aenderungen anzeigen
git log --oneline -10      # Letzte Commits

git add filename           # Bestimmte Datei bereitstellen
git commit -m "message"    # Commit mit Nachricht
git commit --amend         # Letzten Commit nachbessern

git checkout -b new-branch # Branch erstellen und wechseln
git merge feature-branch   # Branch mergen
```

### Remote-Operationen

```bash
git remote -v              # Remotes auflisten
git fetch origin           # Aenderungen abrufen
git pull origin main       # Pullen und mergen
git push origin main       # Zum Remote pushen
git push -u origin branch  # Neuen Branch pushen
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
claude                     # Claude Code starten
claude mcp list            # Konfigurierte MCP-Server auflisten
claude mcp get r-mcptools  # Serverdetails abrufen
```

### Konfigurationsdateien

```
Claude Code (CLI/WSL):      ~/.claude.json
Claude Desktop (GUI/Win):   %APPDATA%\Claude\claude_desktop_config.json
```

### MCP-Server

```bash
# R-Integration
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
pwd                        # Arbeitsverzeichnis anzeigen
ls -la                     # Dateien mit Details auflisten
tree                       # Verzeichnisbaum anzeigen
z project-name             # Zu haeufigem Verzeichnis springen

rg "pattern"               # Ripgrep-Suche
rg -t r "pattern"          # Nur in R-Dateien suchen
fd "pattern"               # Benutzerfreundliches Find
fd -e R                    # Nach Erweiterung suchen
```

### Dateioperationen

```bash
mkdir -p path/to/dir       # Verschachtelte Verzeichnisse erstellen
cp -r source/ dest/        # Verzeichnis rekursiv kopieren
tar -czf archive.tar.gz dir/  # Komprimiertes tar erstellen
tar -xzf archive.tar.gz      # tar.gz extrahieren
du -sh directory           # Verzeichnisgroesse
df -h                      # Speicherplatznutzung
```

### Prozessverwaltung

```bash
htop                       # Interaktiver Prozessbetrachter
ps aux | grep process      # Bestimmten Prozess finden
kill PID                   # Prozess nach ID beenden
```

## Tastenkuerzel

### Terminal (Bash)

```
Strg+A    Zeilenanfang            Strg+E    Zeilenende
Strg+K    Bis Ende loeschen       Strg+U    Bis Anfang loeschen
Strg+W    Vorheriges Wort loeschen  Strg+R  Historie durchsuchen
Strg+L    Bildschirm loeschen     Strg+C    Befehl abbrechen
```

### tmux

```
Strg+A |       Vertikal teilen     Strg+A -      Horizontal teilen
Strg+A Pfeile  Zwischen Panels     Strg+A d      Sitzung trennen
```

### VS Code

```
Strg+`         Terminal oeffnen    Strg+P        Datei schnell oeffnen
Strg+Umsch+P   Befehlspalette     F1            Befehlspalette
```

## Umgebungsvariablen

```bash
printenv              # Alle Umgebungsvariablen
echo $PATH            # PATH-Variable
export VAR=value      # Fuer aktuelle Sitzung setzen

# Dauerhaft setzen
echo 'export VAR=value' >> ~/.bashrc
source ~/.bashrc
```

## Paketverwaltungen

```bash
# APT
sudo apt update && sudo apt install package

# npm
npm install -g package       # Global installieren
npm list -g --depth=0        # Globale Pakete auflisten

# R (renv)
renv::init()                 # renv initialisieren
renv::install("package")     # Paket installieren
renv::snapshot()             # Lockfile speichern
renv::restore()              # Aus Lockfile wiederherstellen
```

## Fehlerbehebung

### R-Paket-Probleme

```bash
which R                               # R-Speicherort
R --version                           # R-Version
Rscript -e ".libPaths()"             # Bibliothekspfade
echo $RSTUDIO_PANDOC                  # Pandoc-Pfad pruefen
```

### WSL-Probleme

```bash
wsl --list --verbose   # WSL-Distributionen auflisten
wsl --status           # WSL-Status
ip addr                # IP-Adressen
```

### Git-Probleme

```bash
git config --list          # Gesamte Konfiguration anzeigen
git remote show origin     # Remote-Details anzeigen
git status --porcelain     # Maschinenlesbarer Status
```

## Verwandte Ressourcen

- [Umgebung einrichten](setting-up-your-environment.md) -- Vollstaendige Einrichtungsanleitung
- [R-Paketentwicklung](r-package-development.md) -- Vollstaendiger R-Paket-Workflow
- [Das System verstehen](understanding-the-system.md) -- Wie Agenten, Skills und Teams zusammenarbeiten
- [Skills-Bibliothek](../skills/) -- Alle 278 Skills
- [Agenten-Bibliothek](../agents/) -- Alle 59 Agenten
- [Teams-Bibliothek](../teams/) -- Alle 10 Teams
