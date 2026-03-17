---
name: manage-renv-dependencies
description: >
  R-Paketabhaengigkeiten mit renv fuer reproduzierbare Umgebungen
  verwalten. Behandelt Initialisierung, Snapshot/Restore-Workflow,
  Fehlerbehebung bei haeufigen Problemen und CI/CD-Integration.
  Verwenden beim Initialisieren der Abhaengigkeitsverwaltung fuer
  ein neues R-Projekt, beim Hinzufuegen oder Aktualisieren von Paketen,
  beim Wiederherstellen einer Umgebung auf einem neuen Rechner,
  bei Fehlerbehebung von Restore-Fehlschlaegen oder beim Integrieren
  von renv in CI/CD-Pipelines.
locale: de
source_locale: en
source_commit: 6f65f316
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
  tags: r, renv, dependencies, reproducibility, lockfile
---

# renv-Abhaengigkeiten verwalten

Reproduzierbare R-Paketumgebungen mit renv einrichten und pflegen.

## Wann verwenden

- Abhaengigkeitsverwaltung fuer ein neues R-Projekt initialisieren
- Paketabhaengigkeiten hinzufuegen oder aktualisieren
- Eine Projektumgebung auf einem neuen Rechner wiederherstellen
- Fehlerbehebung bei renv-Restore-Fehlschlaegen
- renv in CI/CD-Pipelines integrieren

## Eingaben

- **Erforderlich**: R-Projektverzeichnis
- **Optional**: Vorhandene `renv.lock`-Datei (fuer Restore)
- **Optional**: GitHub PAT fuer private Pakete

## Vorgehensweise

### Schritt 1: renv initialisieren

```r
renv::init()
```

Erstellt:
- `renv/`-Verzeichnis (Bibliothek, Einstellungen, Aktivierungsskript)
- `renv.lock` (Abhaengigkeits-Snapshot)
- Aktualisiert `.Rprofile` zur automatischen Aktivierung von renv beim Laden

**Erwartet:** Projektlokale Bibliothek erstellt. `renv/`-Verzeichnis und `renv.lock` vorhanden. `.Rprofile` mit Aktivierungsskript aktualisiert.

**Bei Fehler:** Wenn es haengt, Netzwerkkonnektivitaet pruefen. Wenn es bei einem bestimmten Paket fehlschlaegt, dieses Paket zuerst manuell mit `install.packages()` installieren und dann `renv::init()` erneut ausfuehren.

### Schritt 2: Abhaengigkeiten hinzufuegen

Pakete wie gewohnt installieren:

```r
install.packages("dplyr")
renv::install("github-user/private-pkg")
```

Dann den Zustand per Snapshot festhalten:

```r
renv::snapshot()
```

**Erwartet:** `renv.lock` mit neuen Paketen und ihren Versionen aktualisiert. `renv::status()` zeigt keine nicht synchronisierten Pakete.

**Bei Fehler:** Wenn `renv::snapshot()` Validierungsfehler meldet, `renv::dependencies()` ausfuehren, um zu pruefen, welche Pakete tatsaechlich verwendet werden, dann `renv::snapshot(force = TRUE)` zum Umgehen der Validierung.

### Schritt 3: Auf einem anderen Rechner wiederherstellen

```r
renv::restore()
```

**Erwartet:** Alle Pakete in den in `renv.lock` angegebenen exakten Versionen installiert.

**Bei Fehler:** Haeufige Probleme: GitHub-Pakete schlagen fehl (`GITHUB_PAT` in `.Renviron` setzen), Systemabhaengigkeiten fehlen (unter Linux mit `apt-get` installieren), Zeitlimitueberschreitungen bei grossen Paketen (`options(timeout = 600)` vor restore setzen) oder Binaerdateien nicht verfuegbar (renv kompiliert aus dem Quellcode; Buildwerkzeuge sicherstellen).

### Schritt 4: Abhaengigkeiten aktualisieren

```r
# Ein bestimmtes Paket aktualisieren
renv::update("dplyr")

# Alle Pakete aktualisieren
renv::update()

# Nach Aktualisierungen snapshot erstellen
renv::snapshot()
```

**Erwartet:** Zielpakete auf ihre neuesten kompatiblen Versionen aktualisiert. `renv.lock` spiegelt die neuen Versionen nach dem Snapshot wider.

**Bei Fehler:** Wenn `renv::update()` fuer ein bestimmtes Paket fehlschlaegt, versuchen, es direkt mit `renv::install("package@version")` zu installieren und dann snapshot erstellen.

### Schritt 5: Status pruefen

```r
renv::status()
```

**Erwartet:** "No issues found" oder eine klare Liste nicht synchronisierter Pakete mit handlungsorientierten Hinweisen.

**Bei Fehler:** Wenn der Status Pakete als verwendet, aber nicht aufgezeichnet meldet, `renv::snapshot()` ausfuehren. Wenn Pakete aufgezeichnet, aber nicht installiert sind, `renv::restore()` ausfuehren.

### Schritt 6: `.Rprofile` fuer bedingte Aktivierung konfigurieren

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}
```

Stellt sicher, dass das Projekt auch funktioniert, wenn renv nicht installiert ist (CI-Umgebungen, Mitarbeiter).

**Erwartet:** R-Sitzungen aktivieren renv beim Start im Projektverzeichnis automatisch. Sitzungen ohne renv starten weiterhin ohne Fehler.

**Bei Fehler:** Wenn `.Rprofile` Fehler verursacht, sicherstellen, dass die `file.exists()`-Schutzklausel vorhanden ist. `source("renv/activate.R")` nie bedingungslos aufrufen.

### Schritt 7: Git-Konfiguration

Diese Dateien verfolgen:

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

**Erwartet:** `renv.lock`, `renv/activate.R` und `renv/settings.json` werden von Git verfolgt. Maschinenspezifische Verzeichnisse (`renv/library/`, `renv/cache/`) werden ignoriert.

**Bei Fehler:** Wenn `renv/library/` versehentlich committet wurde, es mit `git rm -r --cached renv/library/` entfernen und zu `.gitignore` hinzufuegen.

### Schritt 8: CI/CD-Integration

In GitHub Actions die renv-Cache-Action verwenden:

```yaml
- uses: r-lib/actions/setup-renv@v2
```

Stellt aus `renv.lock` mit Caching automatisch wieder her.

**Erwartet:** CI-Pipeline stellt Pakete aus `renv.lock` mit aktiviertem Caching wieder her. Nachfolgende Laeufe sind durch gecachte Pakete schneller.

**Bei Fehler:** Wenn der CI-Restore fehlschlaegt, pruefen, ob `renv.lock` committet und aktuell ist. Fuer private GitHub-Pakete sicherstellen, dass `GITHUB_PAT` als Repository-Secret gesetzt ist.

## Validierung

- [ ] `renv::status()` meldet keine Probleme
- [ ] `renv.lock` ist in die Versionskontrolle eingecheckt
- [ ] `renv::restore()` funktioniert auf einem sauberen Checkout
- [ ] `.Rprofile` aktiviert renv bedingt
- [ ] CI/CD verwendet `renv.lock` fuer die Abhaengigkeitsaufloeosung

## Haeufige Stolperfallen

- **`renv::init()` im falschen Verzeichnis ausfuehren**: Zuerst immer `getwd()` pruefen
- **renv- und Systembibliothek mischen**: Nach `renv::init()` nur die Projektbibliothek verwenden
- **Snapshot vergessen**: Nach der Installation von Paketen immer `renv::snapshot()` ausfuehren
- **`--vanilla`-Flag**: `Rscript --vanilla` ueberspringt `.Rprofile`, sodass renv nicht aktiviert wird
- **Grosse Lockfiles in Diffs**: Normal — `renv.lock` ist als diffbares JSON konzipiert
- **Bioconductor-Pakete**: `renv::install("bioc::PackageName")` verwenden und sicherstellen, dass BiocManager konfiguriert ist

## Verwandte Skills

- `create-r-package` - umfasst renv-Initialisierung
- `setup-github-actions-ci` - CI-Integration mit renv
- `submit-to-cran` - Abhaengigkeitsverwaltung fuer CRAN-Pakete
