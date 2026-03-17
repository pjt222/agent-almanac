---
name: manage-renv-dependencies
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  R-Paketabhaengigkeiten mit renv fuer reproduzierbare Umgebungen verwalten.
  Behandelt Initialisierung, Snapshot/Restore-Workflow, Fehlersuche bei
  haeufigen Problemen und CI/CD-Integration. Anwenden bei der Initialisierung
  der Abhaengigkeitsverwaltung fuer ein neues R-Projekt, beim Hinzufuegen
  oder Aktualisieren von Paketen, beim Wiederherstellen einer Umgebung auf
  einem neuen Rechner, bei der Fehlersuche bei Wiederherstellungsfehlern
  oder bei der Integration von renv mit CI/CD-Pipelines.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, renv, dependencies, reproducibility, lockfile
---

# renv-Abhaengigkeiten verwalten

Reproduzierbare R-Paketumgebungen mit renv einrichten und pflegen.

## Wann verwenden

- Initialisierung der Abhaengigkeitsverwaltung fuer ein neues R-Projekt
- Hinzufuegen oder Aktualisieren von Paketabhaengigkeiten
- Wiederherstellen einer Projektumgebung auf einem neuen Rechner
- Fehlersuche bei renv-Wiederherstellungsfehlern
- Integration von renv mit CI/CD-Pipelines

## Eingaben

- **Erforderlich**: R-Projektverzeichnis
- **Optional**: Vorhandene `renv.lock`-Datei (fuer Wiederherstellung)
- **Optional**: GitHub PAT fuer private Pakete

## Vorgehensweise

### Schritt 1: renv initialisieren

```r
renv::init()
```

Dies erstellt:
- `renv/`-Verzeichnis (Bibliothek, Einstellungen, Aktivierungsskript)
- `renv.lock` (Abhaengigkeits-Snapshot)
- Aktualisiert `.Rprofile` um renv beim Laden zu aktivieren

**Erwartet:** Projektlokale Bibliothek erstellt. `renv/`-Verzeichnis und `renv.lock` vorhanden. `.Rprofile` mit Aktivierungsskript aktualisiert.

**Bei Fehler:** Wenn es haengt, die Netzwerkverbindung pruefen. Wenn es bei einem bestimmten Paket fehlschlaegt, dieses Paket zuerst manuell mit `install.packages()` installieren und dann `renv::init()` erneut ausfuehren.

### Schritt 2: Abhaengigkeiten hinzufuegen

Pakete wie gewohnt installieren:

```r
install.packages("dplyr")
renv::install("github-user/private-pkg")
```

Dann einen Snapshot erstellen um den Zustand festzuhalten:

```r
renv::snapshot()
```

**Erwartet:** `renv.lock` mit neuen Paketen und deren Versionen aktualisiert. `renv::status()` zeigt keine nicht-synchronisierten Pakete.

**Bei Fehler:** Wenn `renv::snapshot()` Validierungsfehler meldet, `renv::dependencies()` ausfuehren um zu pruefen welche Pakete tatsaechlich verwendet werden, dann `renv::snapshot(force = TRUE)` um die Validierung zu umgehen.

### Schritt 3: Auf einem anderen Rechner wiederherstellen

```r
renv::restore()
```

**Erwartet:** Alle Pakete in den exakten Versionen aus `renv.lock` installiert.

**Bei Fehler:** Haeufige Probleme: GitHub-Pakete schlagen fehl (`GITHUB_PAT` in `.Renviron` setzen), Systemabhaengigkeiten fehlen (unter Linux mit `apt-get` installieren), Timeouts bei grossen Paketen (`options(timeout = 600)` vor der Wiederherstellung setzen) oder Binaerpakete nicht verfuegbar (renv kompiliert aus Quellcode; sicherstellen dass Build-Werkzeuge installiert sind).

### Schritt 4: Abhaengigkeiten aktualisieren

```r
# Ein bestimmtes Paket aktualisieren
renv::update("dplyr")

# Alle Pakete aktualisieren
renv::update()

# Snapshot nach Aktualisierungen
renv::snapshot()
```

**Erwartet:** Zielpakete auf ihre neuesten kompatiblen Versionen aktualisiert. `renv.lock` spiegelt nach dem Snapshot die neuen Versionen wider.

**Bei Fehler:** Wenn `renv::update()` fuer ein bestimmtes Paket fehlschlaegt, es direkt mit `renv::install("package@version")` installieren und dann einen Snapshot erstellen.

### Schritt 5: Status pruefen

```r
renv::status()
```

**Erwartet:** "No issues found" oder eine klare Liste nicht-synchronisierter Pakete mit umsetzbaren Hinweisen.

**Bei Fehler:** Wenn der Status Pakete meldet die verwendet aber nicht erfasst sind, `renv::snapshot()` ausfuehren. Wenn Pakete erfasst aber nicht installiert sind, `renv::restore()` ausfuehren.

### Schritt 6: `.Rprofile` fuer bedingte Aktivierung konfigurieren

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}
```

Dies stellt sicher dass das Projekt auch funktioniert wenn renv nicht installiert ist (CI-Umgebungen, Mitarbeiter).

**Erwartet:** R-Sitzungen aktivieren renv automatisch beim Start im Projektverzeichnis. Sitzungen ohne installiertes renv starten weiterhin fehlerfrei.

**Bei Fehler:** Wenn `.Rprofile` Fehler verursacht, sicherstellen dass die `file.exists()`-Pruefung vorhanden ist. Nie `source("renv/activate.R")` bedingungslos aufrufen.

### Schritt 7: Git-Konfiguration

Diese Dateien versionieren:

```
renv.lock           # Immer committen
renv/activate.R     # Immer committen
renv/settings.json  # Immer committen
.Rprofile           # Committen (enthaelt renv-Aktivierung)
```

Diese ignorieren (bereits in renvs `.gitignore`):

```
renv/library/       # Maschinenspezifisch
renv/staging/       # Temporaer
renv/cache/         # Maschinenspezifischer Cache
```

**Erwartet:** `renv.lock`, `renv/activate.R` und `renv/settings.json` werden von Git versioniert. Maschinenspezifische Verzeichnisse (`renv/library/`, `renv/cache/`) werden ignoriert.

**Bei Fehler:** Wenn `renv/library/` versehentlich committet wurde, mit `git rm -r --cached renv/library/` entfernen und zu `.gitignore` hinzufuegen.

### Schritt 8: CI/CD-Integration

In GitHub Actions die renv-Cache-Action verwenden:

```yaml
- uses: r-lib/actions/setup-renv@v2
```

Dies stellt automatisch aus `renv.lock` mit Caching wieder her.

**Erwartet:** CI-Pipeline stellt Pakete aus `renv.lock` mit aktiviertem Caching wieder her. Nachfolgende Durchlaeufe sind durch gecachte Pakete schneller.

**Bei Fehler:** Wenn die CI-Wiederherstellung fehlschlaegt, pruefen dass `renv.lock` committet und aktuell ist. Fuer private GitHub-Pakete sicherstellen dass `GITHUB_PAT` als Repository-Secret gesetzt ist.

## Validierung

- [ ] `renv::status()` meldet keine Probleme
- [ ] `renv.lock` ist in die Versionskontrolle committet
- [ ] `renv::restore()` funktioniert bei einem sauberen Checkout
- [ ] `.Rprofile` aktiviert renv bedingt
- [ ] CI/CD verwendet `renv.lock` fuer die Abhaengigkeitsaufloesung

## Haeufige Stolperfallen

- **`renv::init()` im falschen Verzeichnis ausfuehren**: Immer zuerst `getwd()` verifizieren
- **renv und Systembibliothek mischen**: Nach `renv::init()` nur die Projektbibliothek verwenden
- **Snapshot vergessen**: Nach der Installation von Paketen immer `renv::snapshot()` ausfuehren
- **`--vanilla`-Flag**: `Rscript --vanilla` ueberspringt `.Rprofile`, sodass renv nicht aktiviert wird
- **Grosse Lock-Dateien in Diffs**: Normal -- `renv.lock` ist als diffbares JSON konzipiert
- **Bioconductor-Pakete**: `renv::install("bioc::PackageName")` verwenden und sicherstellen dass BiocManager konfiguriert ist

## Verwandte Skills

- `create-r-package` -- beinhaltet renv-Initialisierung
- `setup-github-actions-ci` -- CI-Integration mit renv
- `submit-to-cran` -- Abhaengigkeitsverwaltung fuer CRAN-Pakete
