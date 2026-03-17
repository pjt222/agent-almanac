---
name: setup-github-actions-ci
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  GitHub Actions CI/CD fuer R-Pakete konfigurieren einschliesslich R CMD check
  auf mehreren Plattformen, Testabdeckungsberichten und pkgdown-Site-
  Bereitstellung. Verwendet r-lib/actions fuer Standardworkflows. Anwenden
  beim Einrichten von CI/CD fuer ein neues R-Paket, beim Hinzufuegen von
  Multiplattform-Tests zu einem bestehenden Paket, beim Konfigurieren der
  automatisierten pkgdown-Site-Bereitstellung oder beim Hinzufuegen von
  Codeabdeckungsberichten zu einem Repository.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, github-actions, ci-cd, testing, automation
---

# GitHub Actions CI fuer R-Pakete einrichten

Automatisierten R CMD check, Testabdeckung und Dokumentationsbereitstellung ueber GitHub Actions konfigurieren.

## Wann verwenden

- Einrichten von CI/CD fuer ein neues R-Paket auf GitHub
- Hinzufuegen von Multiplattform-Tests zu einem bestehenden Paket
- Konfigurieren der automatisierten pkgdown-Site-Bereitstellung
- Hinzufuegen von Codeabdeckungsberichten

## Eingaben

- **Erforderlich**: R-Paket mit gueltigem DESCRIPTION und Tests
- **Erforderlich**: GitHub-Repository (oeffentlich oder privat)
- **Optional**: Ob pkgdown-Bereitstellung einbezogen werden soll (Standard: nein)
- **Optional**: Ob Abdeckungsberichte einbezogen werden sollen (Standard: nein)

## Vorgehensweise

### Schritt 1: R CMD Check Workflow erstellen

`.github/workflows/R-CMD-check.yaml` erstellen:

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

name: R-CMD-check

permissions: read-all

jobs:
  R-CMD-check:
    runs-on: ${{ matrix.config.os }}

    name: ${{ matrix.config.os }} (${{ matrix.config.r }})

    strategy:
      fail-fast: false
      matrix:
        config:
          - {os: macos-latest, r: 'release'}
          - {os: windows-latest, r: 'release'}
          - {os: ubuntu-latest, r: 'devel', http-user-agent: 'release'}
          - {os: ubuntu-latest, r: 'release'}
          - {os: ubuntu-latest, r: 'oldrel-1'}

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}
      R_KEEP_PKG_SOURCE: yes

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-pandoc@v2

      - uses: r-lib/actions/setup-r@v2
        with:
          r-version: ${{ matrix.config.r }}
          http-user-agent: ${{ matrix.config.http-user-agent }}
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::rcmdcheck
          needs: check

      - uses: r-lib/actions/check-r-package@v2
        with:
          upload-snapshots: true
          build_args: 'c("--no-manual", "--compact-vignettes=gs+qpdf")'
```

**Erwartet:** Workflow-Datei `.github/workflows/R-CMD-check.yaml` erstellt mit einer Multiplattform-Matrix (macOS, Windows, Ubuntu) die Release, Devel und Oldrel abdeckt.

**Bei Fehler:** Wenn das Verzeichnis `.github/workflows/` nicht existiert, mit `mkdir -p .github/workflows` erstellen. YAML-Syntax mit einem YAML-Linter verifizieren.

### Schritt 2: Testabdeckungs-Workflow erstellen (optional)

`.github/workflows/test-coverage.yaml` erstellen:

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

name: test-coverage

permissions: read-all

jobs:
  test-coverage:
    runs-on: ubuntu-latest

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-r@v2
        with:
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::covr, any::xml2
          needs: coverage

      - name: Test coverage
        run: |
          cov <- covr::package_coverage(
            quiet = FALSE,
            clean = FALSE,
            install_path = file.path(normalizePath(Sys.getenv("RUNNER_TEMP"), winslash = "/"), "package")
          )
          covr::to_cobertura(cov)
        shell: Rscript {0}

      - uses: codecov/codecov-action@v4
        with:
          fail_ci_if_error: ${{ github.event_name != 'pull_request' && true || false }}
          file: ./cobertura.xml
          plugin: noop
          token: ${{ secrets.CODECOV_TOKEN }}
```

**Erwartet:** Workflow-Datei `.github/workflows/test-coverage.yaml` erstellt. Abdeckungsberichte werden bei jedem Push und PR zu Codecov hochgeladen.

**Bei Fehler:** Wenn der Codecov-Upload fehlschlaegt, verifizieren dass das `CODECOV_TOKEN`-Secret in den Repository-Einstellungen gesetzt ist. Fuer oeffentliche Repos kann der Token optional sein.

### Schritt 3: pkgdown-Bereitstellungs-Workflow erstellen (optional)

`.github/workflows/pkgdown.yaml` erstellen:

```yaml
on:
  push:
    branches: [main, master]
  release:
    types: [published]
  workflow_dispatch:

name: pkgdown

permissions:
  contents: write
  pages: write

jobs:
  pkgdown:
    runs-on: ubuntu-latest

    env:
      GITHUB_PAT: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-pandoc@v2

      - uses: r-lib/actions/setup-r@v2
        with:
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: any::pkgdown, local::.
          needs: website

      - name: Build site
        run: pkgdown::build_site_github_pages(new_process = FALSE, install = FALSE)
        shell: Rscript {0}

      - name: Deploy to GitHub pages
        if: github.event_name != 'pull_request'
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          clean: false
          branch: gh-pages
          folder: docs
```

**Erwartet:** Workflow-Datei `.github/workflows/pkgdown.yaml` erstellt. Die Site wird bei Push nach main oder Release gebaut und auf den `gh-pages`-Branch bereitgestellt.

**Bei Fehler:** Wenn die Bereitstellung fehlschlaegt, sicherstellen dass das Repository `contents: write`-Berechtigungen aktiviert hat. Verifizieren dass `_pkgdown.yml` `development: mode: release` gesetzt hat.

### Schritt 4: Statusabzeichen zur README hinzufuegen

Zu `README.md` hinzufuegen:

```markdown
[![R-CMD-check](https://github.com/USERNAME/REPO/actions/workflows/R-CMD-check.yaml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/R-CMD-check.yaml)
```

**Erwartet:** README zeigt ein Live-CI-Statusabzeichen das nach jedem Workflow-Durchlauf automatisch aktualisiert wird.

**Bei Fehler:** Wenn das Abzeichen "no status" anzeigt, verifizieren dass der Workflow-Dateiname in der Abzeichen-URL mit der tatsaechlichen Datei uebereinstimmt. Einen Commit pushen um den ersten Workflow-Durchlauf auszuloesen.

### Schritt 5: GitHub-Repository-Einstellungen konfigurieren

1. GitHub Pages aktivieren (Settings > Pages) mit Verweis auf den `gh-pages`-Branch falls pkgdown verwendet wird
2. `CODECOV_TOKEN`-Secret hinzufuegen falls Abdeckungsberichte verwendet werden
3. Sicherstellen dass `GITHUB_TOKEN` ausreichende Berechtigungen hat

**Erwartet:** GitHub Pages ist fuer pkgdown-Bereitstellung konfiguriert. Erforderliche Secrets sind gesetzt. Token-Berechtigungen reichen fuer die Workflows aus.

**Bei Fehler:** Wenn die Pages-Bereitstellung fehlschlaegt, unter Settings > Pages pruefen ob die Quelle auf den `gh-pages`-Branch gesetzt ist. Wenn Secrets fehlen, unter Settings > Secrets and variables > Actions hinzufuegen.

### Schritt 6: Pushen und verifizieren

```bash
git add .github/
git commit -m "GitHub Actions CI Workflows hinzufuegen"
git push
```

Den Actions-Tab auf GitHub pruefen um zu verifizieren dass die Workflows erfolgreich laufen.

**Erwartet:** Gruene Haekchen bei allen Jobs im GitHub Actions-Tab. Workflows werden sowohl bei Push- als auch bei PR-Events ausgeloest.

**Bei Fehler:** Workflow-Logs im Actions-Tab pruefen. Haeufige Probleme: fehlende Systemabhaengigkeiten (zu `extra-packages` hinzufuegen), Vignetten-Build-Fehler (sicherstellen dass der Pandoc-Setup-Schritt vorhanden ist), YAML-Syntaxfehler.

## Validierung

- [ ] R CMD check besteht auf allen Matrix-Plattformen
- [ ] Abdeckungsbericht wird generiert (falls konfiguriert)
- [ ] pkgdown-Site wird bereitgestellt (falls konfiguriert)
- [ ] Statusabzeichen wird in README angezeigt
- [ ] Workflows werden sowohl bei Push als auch bei PR ausgeloest

## Haeufige Stolperfallen

- **Fehlende `permissions`**: GitHub Actions erfordert jetzt explizite Berechtigungen. Mindestens `permissions: read-all` hinzufuegen
- **Systemabhaengigkeiten**: Einige R-Pakete brauchen Systembibliotheken. `r-lib/actions/setup-r-dependencies` verwenden, das die meisten Faelle behandelt
- **Vignetten ohne Pandoc**: Immer `r-lib/actions/setup-pandoc@v2` einbeziehen
- **pkgdown-Entwicklungsmodus**: Sicherstellen dass `_pkgdown.yml` `development: mode: release` fuer GitHub Pages gesetzt hat
- **Caching-Probleme**: `r-lib/actions/setup-r-dependencies` handhabt Caching automatisch

## Verwandte Skills

- `create-r-package` -- Anfaengliches Paket-Setup einschliesslich CI-Workflow
- `build-pkgdown-site` -- Detaillierte pkgdown-Konfiguration
- `submit-to-cran` -- CI-Checks sollten CRAN-Erwartungen widerspiegeln
- `release-package-version` -- Bereitstellung bei Release ausloesen
