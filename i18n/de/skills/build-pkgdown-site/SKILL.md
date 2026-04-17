---
name: build-pkgdown-site
description: >
  Eine pkgdown-Dokumentationswebsite fuer ein R-Paket auf GitHub Pages
  erstellen und bereitstellen. Behandelt die Konfiguration von
  _pkgdown.yml, Themen, Artikelorganisation, Anpassung des
  Referenzindex und Bereitstellungsmethoden. Verwenden beim Erstellen
  einer Dokumentationsseite fuer ein neues oder bestehendes Paket,
  beim Anpassen von Layout oder Navigation, beim Beheben von
  404-Fehlern auf einer bereitgestellten Website oder beim Wechsel
  zwischen branch-basierter und GitHub Actions-Bereitstellung.
locale: de
source_locale: en
source_commit: acc252e6
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, pkgdown, documentation, github-pages, website
---

# pkgdown-Website bauen

Eine pkgdown-Dokumentationswebsite fuer ein R-Paket konfigurieren und bereitstellen.

## Wann verwenden

- Eine Dokumentationswebsite fuer ein R-Paket erstellen
- pkgdown-Layout, Thema oder Navigation anpassen
- 404-Fehler auf einer bereitgestellten pkgdown-Website beheben
- Zwischen Bereitstellungsmethoden wechseln

## Eingaben

- **Erforderlich**: R-Paket mit roxygen2-Dokumentation
- **Erforderlich**: GitHub-Repository
- **Optional**: Benutzerdefiniertes Thema oder Branding
- **Optional**: Als Artikel einzuschliessende Vignetten

## Vorgehensweise

### Schritt 1: pkgdown initialisieren

```r
usethis::use_pkgdown()
```

Erstellt `_pkgdown.yml` und fuegt pkgdown zu `.Rbuildignore` hinzu.

**Erwartet:** `_pkgdown.yml` existiert im Projektstammverzeichnis. `.Rbuildignore` enthaelt pkgdown-bezogene Eintraege.

**Bei Fehler:** pkgdown mit `install.packages("pkgdown")` installieren. Wenn `_pkgdown.yml` bereits existiert, aktualisiert die Funktion `.Rbuildignore`, ohne die Konfiguration zu ueberschreiben.

### Schritt 2: `_pkgdown.yml` konfigurieren

```yaml
url: https://username.github.io/packagename/

development:
  mode: release

template:
  bootstrap: 5
  bootswatch: flatly

navbar:
  structure:
    left: [intro, reference, articles, news]
    right: [search, github]
  components:
    github:
      icon: fa-github
      href: https://github.com/username/packagename

reference:
  - title: Core Functions
    desc: Primary package functionality
    contents:
      - main_function
      - helper_function
  - title: Utilities
    desc: Helper and utility functions
    contents:
      - starts_with("util_")

articles:
  - title: Getting Started
    contents:
      - getting-started
  - title: Advanced Usage
    contents:
      - advanced-features
      - customization
```

**Kritisch**: `development: mode: release` setzen. Der Standard `mode: auto` verursacht 404-Fehler auf GitHub Pages, da `/dev/` an URLs angehaengt wird.

**Erwartet:** `_pkgdown.yml` enthaelt gueltiges YAML mit den Abschnitten `url`, `template`, `navbar`, `reference` und `articles`, die zum Paket passen.

**Bei Fehler:** YAML-Syntax mit einem Online-YAML-Linter validieren. Sicherstellen, dass alle Funktionsnamen in `reference.contents` mit tatsaechlich exportierten Funktionen uebereinstimmen.

### Schritt 3: Lokal bauen

```r
pkgdown::build_site()
```

**Erwartet:** Verzeichnis `docs/` mit einer vollstaendigen Website erstellt, einschliesslich `index.html`, Funktionsreferenzseiten und Artikeln.

**Bei Fehler:** Haeufige Probleme: fehlendes pandoc (`RSTUDIO_PANDOC` in `.Renviron` setzen), fehlende Vignetten-Abhaengigkeiten (vorgeschlagene Pakete installieren) oder fehlerhafte Beispiele (beheben oder in `\dontrun{}` einschliessen).

### Schritt 4: Website voranschauen

```r
pkgdown::preview_site()
```

Navigation, Funktionsreferenz, Artikel und Suche auf korrekte Funktion pruefen.

**Erwartet:** Website oeffnet sich im Browser unter localhost. Alle Navigationslinks funktionieren, Funktionsreferenzseiten werden angezeigt und die Suche liefert Ergebnisse.

**Bei Fehler:** Wenn die Vorschau sich nicht oeffnet, `docs/index.html` manuell im Browser oeffnen. Wenn Seiten fehlen, pruefen, ob `devtools::document()` vor dem Bauen der Website ausgefuehrt wurde.

### Schritt 5: Auf GitHub Pages bereitstellen

**Methode A: GitHub Actions (empfohlen)**

Siehe Skill `setup-github-actions-ci` fuer den pkgdown-Workflow.

**Methode B: Manuelle Branch-Bereitstellung**

```bash
# Website bauen
Rscript -e "pkgdown::build_site()"

# gh-pages-Branch erstellen, falls er nicht existiert
git checkout --orphan gh-pages
git rm -rf .
cp -r docs/* .
git add .
git commit -m "Deploy pkgdown site"
git push origin gh-pages

# Zurueck zu main wechseln
git checkout main
```

**Erwartet:** Der `gh-pages`-Branch existiert auf dem Remote mit den Website-Dateien auf der Root-Ebene.

**Bei Fehler:** Wenn der Push abgelehnt wird, sicherstellen, dass Schreibzugriff auf das Repository besteht. Wenn stattdessen GitHub Actions-Bereitstellung verwendet wird, diesen Schritt ueberspringen und dem Skill `setup-github-actions-ci` folgen.

### Schritt 6: GitHub Pages konfigurieren

1. Zu Repository-Einstellungen > Pages navigieren
2. Quelle auf "Deploy from a branch" setzen
3. Branch `gh-pages` und Ordner `/ (root)` auswaehlen
4. Speichern

**Erwartet:** Website unter `https://username.github.io/packagename/` innerhalb weniger Minuten verfuegbar.

**Bei Fehler:** Wenn die Website 404 zurueckgibt, pruefen, ob die Pages-Quelle zur Bereitstellungsmethode passt (Branch-Bereitstellung erfordert "Deploy from a branch"). Pruefen, ob `development: mode: release` in `_pkgdown.yml` gesetzt ist.

### Schritt 7: URL zu DESCRIPTION hinzufuegen

```
URL: https://username.github.io/packagename/, https://github.com/username/packagename
```

**Erwartet:** Das `URL`-Feld in DESCRIPTION enthaelt sowohl die pkgdown-Website-URL als auch die GitHub-Repository-URL, durch ein Komma getrennt.

**Bei Fehler:** Wenn `R CMD check` vor ungueltigen URLs warnt, sicherstellen, dass die pkgdown-Website tatsaechlich bereitgestellt und erreichbar ist, bevor die URL hinzugefuegt wird.

## Validierung

- [ ] Website baut lokal ohne Fehler
- [ ] Alle Funktionsreferenzseiten werden korrekt angezeigt
- [ ] Artikel/Vignetten sind zugaenglich und werden korrekt angezeigt
- [ ] Suchfunktion funktioniert
- [ ] Navigationslinks sind korrekt
- [ ] Website wird erfolgreich auf GitHub Pages bereitgestellt
- [ ] Keine 404-Fehler auf der bereitgestellten Website
- [ ] `development: mode: release` ist in `_pkgdown.yml` gesetzt

## Haeufige Stolperfallen

- **404-Fehler nach Bereitstellung**: Fast immer verursacht durch `development: mode: auto` (den Standard). Zu `mode: release` wechseln.
- **Fehlende Referenzseiten**: Funktionen muessen exportiert und dokumentiert sein. Zuerst `devtools::document()` ausfuehren.
- **Defekte Vignetten-Links**: Syntax `vignette("name")` fuer Querverweise verwenden, keine Dateipfade.
- **Logo wird nicht angezeigt**: Logo unter `man/figures/logo.png` ablegen und in `_pkgdown.yml` referenzieren.
- **Suche funktioniert nicht**: Erfordert, dass das `url`-Feld in `_pkgdown.yml` korrekt gesetzt ist.

- **Falsches R-Binary auf Hybrid-Systemen**: Unter WSL oder Docker kann `Rscript` einen plattformuebergreifenden Wrapper statt nativem R aufloesen. Mit `which Rscript && Rscript --version` pruefen. Das native R-Binary bevorzugen (z.B. `/usr/local/bin/Rscript` unter Linux/WSL) fuer Zuverlaessigkeit. Fuer die R-Pfadkonfiguration siehe [Setting Up Your Environment](../../guides/setting-up-your-environment.md).

## Verwandte Skills

- `setup-github-actions-ci` - automatisierter pkgdown-Bereitstellungs-Workflow
- `write-roxygen-docs` - Funktionsdokumentation, die auf der Website erscheint
- `write-vignette` - Artikel, die in der Website-Navigation erscheinen
- `release-package-version` - Website-Neuerstellung bei Release ausloesen
