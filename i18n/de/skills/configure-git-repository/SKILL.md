---
name: configure-git-repository
description: >
  Ein Git-Repository mit geeignetem .gitignore, Branch-Strategie,
  Commit-Konventionen, Hooks und Remote-Einrichtung konfigurieren. Umfasst
  die Ersteinrichtung und gängige Muster fuer R-, Node.js- und
  Python-Projekte. Verwenden beim Initialisieren der Versionskontrolle
  fuer ein neues Projekt, beim Hinzufuegen einer .gitignore fuer eine
  bestimmte Sprache oder ein Framework, beim Einrichten von
  Branch-Schutz und -Konventionen oder beim Konfigurieren von
  Commit-Hooks.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: git, version-control, gitignore, hooks, branching
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# Git-Repository konfigurieren

Ein Git-Repository mit geeigneter Konfiguration fuer den jeweiligen Projekttyp einrichten.

## Wann verwenden

- Versionskontrolle fuer ein neues Projekt initialisieren
- `.gitignore` fuer eine bestimmte Sprache oder ein Framework hinzufuegen
- Branch-Schutz und -Konventionen einrichten
- Commit-Hooks konfigurieren

## Eingaben

- **Erforderlich**: Projektverzeichnis
- **Erforderlich**: Projekttyp (R-Paket, Node.js, Python, allgemein)
- **Optional**: URL des Remote-Repositorys
- **Optional**: Branch-Strategie (Trunk-based, Git Flow)
- **Optional**: Commit-Message-Konvention

## Vorgehensweise

### Schritt 1: Repository initialisieren

```bash
cd /path/to/project
git init
git branch -M main
```

**Erwartet:** Das Verzeichnis `.git/` wurde erstellt. Der Standard-Branch heisst `main`.

**Bei Fehler:** Wenn `git init` fehlschlaegt, sicherstellen, dass Git installiert ist (`git --version`). Ist bereits ein `.git/`-Verzeichnis vorhanden, ist das Repository bereits initialisiert — diesen Schritt ueberspringen.

### Schritt 2: .gitignore erstellen

**R-Paket**:

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

**Erwartet:** Die `.gitignore`-Datei wurde mit projekttyp-geeigneten Eintraegen erstellt. Sensible Dateien (`.Renviron`, `.env`) und generierte Artefakte sind ausgeschlossen.

**Bei Fehler:** Wenn unklar ist, welche Eintraege aufzunehmen sind, `gitignore.io` oder GitHubs `.gitignore`-Vorlagen als Ausgangspunkt nutzen und fuer das Projekt anpassen.

### Schritt 3: Ersten Commit erstellen

```bash
git add .gitignore
git add .  # Review what's being added first with git status
git commit -m "Initial project setup"
```

**Erwartet:** Der erste Commit wurde erstellt und enthaelt `.gitignore` sowie die initialen Projektdateien. `git log` zeigt einen Commit.

**Bei Fehler:** Wenn `git commit` mit "nothing to commit" fehlschlaegt, sicherstellen, dass Dateien mit `git add` gestaged wurden. Wenn mit einem Autorenidentitaetsfehler fehlschlaegt, `git config user.name` und `git config user.email` setzen.

### Schritt 4: Remote verbinden

```bash
# Add remote
git remote add origin git@github.com:username/repo.git

# Push
git push -u origin main
```

**Erwartet:** Das Remote `origin` ist konfiguriert. `git remote -v` zeigt Fetch- und Push-URLs. Der initiale Commit wurde zum Remote gepusht.

**Bei Fehler:** Wenn der Push mit "Permission denied (publickey)" fehlschlaegt, SSH-Schluessel konfigurieren (siehe `setup-wsl-dev-environment`). Wenn das Remote bereits existiert, mit `git remote set-url origin <url>` aktualisieren.

### Schritt 5: Branch-Konventionen einrichten

**Trunk-based (empfohlen fuer kleine Teams)**:

- `main`: produktionsreifer Code
- Feature-Branches: `feature/beschreibung`
- Fehlerbehebungen: `fix/beschreibung`

```bash
# Create feature branch
git checkout -b feature/add-authentication

# After work is done, merge or create PR
git checkout main
git merge feature/add-authentication
```

**Erwartet:** Die Branch-Namenskonvention ist etabliert und dokumentiert. Teammitglieder wissen, welches Praefix fuer welche Art von Arbeit zu verwenden ist.

**Bei Fehler:** Wenn Branches bereits inkonsistent benannt sind, mit `git branch -m alter-name neuer-name` umbenennen und offene Pull Requests aktualisieren.

### Schritt 6: Commit-Konventionen konfigurieren

Format der Conventional Commits:

```
type(scope): description

feat: add user authentication
fix: correct calculation in weighted_mean
docs: update README installation section
test: add edge case tests for parser
refactor: extract helper function
chore: update dependencies
```

**Erwartet:** Die Commit-Message-Konvention ist dokumentiert und vom Team vereinbart. Kuenftige Commits folgen dem Format `type: description`.

**Bei Fehler:** Wenn Teammitglieder die Konvention nicht einhalten, mit einem commit-msg Hook erzwingen, der das Format validiert (siehe Schritt 7).

### Schritt 7: Pre-Commit-Hooks einrichten (Optional)

`.githooks/pre-commit` erstellen:

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

**Erwartet:** Der Pre-Commit-Hook laeuft automatisch bei jedem `git commit`. Linting-Fehler blockieren den Commit, bis sie behoben sind.

**Bei Fehler:** Wenn der Hook nicht ausgefuehrt wird, pruefen ob `core.hooksPath` gesetzt ist (`git config core.hooksPath`) und die Hook-Datei ausfuehrbar ist (`chmod +x`).

### Schritt 8: README erstellen

```bash
# Minimal README
echo "# Project Name" > README.md
echo "" >> README.md
echo "Brief description of the project." >> README.md
git add README.md
git commit -m "Add README"
```

**Erwartet:** `README.md` wurde in das Repository eingecheckt. Das Projekt hat eine minimale, aber informative Einstiegsseite auf GitHub.

**Bei Fehler:** Wenn `README.md` bereits existiert, aktualisieren statt ueberschreiben. In R-Projekten `usethis::use_readme_md()` fuer eine Vorlage mit Badges verwenden.

## Validierung

- [ ] `.gitignore` schliesst sensible und generierte Dateien aus
- [ ] Keine sensiblen Daten (Tokens, Passwoerter) in getrackten Dateien
- [ ] Remote-Repository verbunden und erreichbar
- [ ] Branch-Namenskonventionen dokumentiert
- [ ] Initialer Commit sauber erstellt

## Haeufige Stolperfallen

- **Commit vor .gitignore**: Zuerst `.gitignore` hinzufuegen. Bereits getrackte Dateien werden von spaeter hinzugefuegten `.gitignore`-Eintraegen nicht beeinflusst.
- **Sensible Daten in der Historie**: Wenn Geheimnisse eingecheckt wurden, bleiben sie auch nach dem Loeschen in der Historie. `git filter-repo` oder BFG zum Bereinigen verwenden.
- **Grosse Binaerdateien**: Keine grossen Binaerdateien einchecken. Git LFS fuer Dateien > 1 MB verwenden.
- **Zeilenenden**: `core.autocrlf=input` unter Windows/WSL setzen, um CRLF/LF-Probleme zu vermeiden.

## Verwandte Skills

- `commit-changes` - Staging- und Commit-Workflow
- `manage-git-branches` - Branch-Erstellung und -Konventionen
- `create-r-package` - Git-Einrichtung als Teil der R-Paketerstellung
- `setup-wsl-dev-environment` - Git-Installation und SSH-Schluessel
- `create-github-release` - Releases aus dem Repository erstellen
- `security-audit-codebase` - Auf eingecheckte Geheimnisse pruefen
