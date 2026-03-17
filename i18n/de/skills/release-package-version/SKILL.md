---
name: release-package-version
description: >
  Eine neue Version eines R-Pakets veroeffentlichen, einschliesslich
  Versionserhoehung, NEWS.md-Aktualisierungen, Git-Tagging, GitHub
  Release-Erstellung und Post-Release-Entwicklungsversionierung. Verwenden,
  wenn ein Paket fuer ein neues Patch-, Minor- oder Major-Release bereit ist,
  nach CRAN-Annahme zur Erstellung des entsprechenden GitHub-Releases oder
  beim Einrichten der Entwicklungsversion-Erhoehung unmittelbar nach einem Release.
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
  tags: r, versioning, release, git-tags, changelog
---

# Paketversion veroeffentlichen

Den vollstaendigen Versions-Release-Zyklus fuer ein R-Paket ausfuehren.

## Wann verwenden

- Bereit, eine neue Version zu veroeffentlichen (Fehlerbehebung, Feature oder Breaking Change)
- Nach CRAN-Annahme das entsprechende GitHub-Release erstellen
- Post-Release-Entwicklungsversion einrichten

## Eingaben

- **Erforderlich**: Paket mit releasebereit en Aenderungen
- **Erforderlich**: Release-Typ: patch (0.1.0 -> 0.1.1), minor (0.1.0 -> 0.2.0) oder major (0.1.0 -> 1.0.0)
- **Optional**: Ob bei CRAN eingereicht werden soll (Standard: nein, Skill `submit-to-cran` separat verwenden)

## Vorgehensweise

### Schritt 1: Art der Versionserhoehung bestimmen

Semantische Versionierung befolgen:

| Aenderungstyp | Versionserhoehung | Beispiel |
|---------------|------------------|---------|
| Nur Fehlerbehebungen | Patch | 0.1.0 -> 0.1.1 |
| Neue Features (rueckwaertskompatibel) | Minor | 0.1.0 -> 0.2.0 |
| Breaking Changes | Major | 0.1.0 -> 1.0.0 |

**Erwartet:** Der korrekte Erhoehungstyp (patch, minor oder major) wird basierend auf der Art der Aenderungen seit dem letzten Release bestimmt.

**Bei Fehler:** Bei Unsicherheit `git log` seit dem letzten Tag durchsehen und jede Aenderung klassifizieren. Jede nicht abwaertskompatible API-Aenderung erfordert eine Major-Erhoehung.

### Schritt 2: Version aktualisieren

```r
usethis::use_version("minor")  # oder "patch" oder "major"
```

Aktualisiert das `Version`-Feld in DESCRIPTION und fuegt eine Ueberschrift zu NEWS.md hinzu.

**Erwartet:** DESCRIPTION-Version aktualisiert. NEWS.md hat eine neue Abschnittsunterschrift fuer die Release-Version.

**Bei Fehler:** Wenn `usethis::use_version()` nicht verfuegbar ist, das `Version`-Feld in DESCRIPTION manuell aktualisieren und eine `# packagename x.y.z`-Ueberschrift zu NEWS.md hinzufuegen.

### Schritt 3: NEWS.md aktualisieren

Release-Notizen unter der neuen Versionsunterschrift eintragen:

```markdown
# packagename 0.2.0

## New Features
- Added `new_function()` for processing data (#42)
- Support for custom themes in `plot_results()` (#45)

## Bug Fixes
- Fixed crash when input contains all NAs (#38)
- Corrected off-by-one error in `window_calc()` (#41)

## Minor Improvements
- Improved error messages for invalid input types
- Updated documentation examples
```

Issue/PR-Nummern fuer Nachverfolgbarkeit verwenden.

**Erwartet:** NEWS.md enthaelt eine vollstaendige Zusammenfassung der benutzerseitigen Aenderungen, nach Kategorien gegliedert, mit Issue/PR-Nummern fuer Nachverfolgbarkeit.

**Bei Fehler:** Wenn Aenderungen schwer zu rekonstruieren sind, `git log --oneline v<vorherige>..HEAD` verwenden, um alle Commits seit dem letzten Release aufzulisten und zu kategorisieren.

### Schritt 4: Abschliessende Pruefungen

```r
devtools::check()
devtools::spell_check()
urlchecker::url_check()
```

**Erwartet:** `devtools::check()` liefert 0 Fehler, 0 Warnungen und 0 Hinweise. Rechtschreib- und URL-Pruefung finden keine Probleme.

**Bei Fehler:** Alle Fehler und Warnungen vor der Veroeffentlichung beheben. Falsch-positive Woerter fuer die Rechtschreibpruefung zu `inst/WORDLIST` hinzufuegen. Defekte URLs ersetzen.

### Schritt 5: Release committen

```bash
git add DESCRIPTION NEWS.md
git commit -m "Release packagename v0.2.0"
```

**Erwartet:** Ein einzelner Commit, der die Versionserhoehung in DESCRIPTION und die aktualisierte NEWS.md enthaelt.

**Bei Fehler:** Wenn andere uncommittete Aenderungen vorhanden sind, nur DESCRIPTION und NEWS.md stagen. Release-Commits sollten nur versionsbezogene Aenderungen enthalten.

### Schritt 6: Release taggen

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

**Erwartet:** Annotierter Tag `v0.2.0` erstellt und zum Remote gepusht. `git tag -l` zeigt den Tag lokal; `git ls-remote --tags origin` bestaetigt ihn auf dem Remote.

**Bei Fehler:** Wenn der Push fehlschlaegt, pruefen, ob Schreibzugriff vorhanden ist. Wenn der Tag bereits existiert, mit `git show v0.2.0` pruefen, ob er auf den richtigen Commit zeigt.

### Schritt 7: GitHub-Release erstellen

```bash
gh release create v0.2.0 \
  --title "packagename v0.2.0" \
  --notes-file NEWS.md
```

Oder verwenden:

```r
usethis::use_github_release()
```

**Erwartet:** GitHub-Release mit sichtbaren Release-Notizen auf der Releases-Seite des Repositorys erstellt.

**Bei Fehler:** Wenn `gh release create` fehlschlaegt, sicherstellen, dass die `gh`-CLI authentifiziert ist (`gh auth status`). Wenn `usethis::use_github_release()` fehlschlaegt, den Release manuell auf GitHub erstellen.

### Schritt 8: Entwicklungsversion setzen

Nach dem Release auf Entwicklungsversion hochsetzen:

```r
usethis::use_dev_version()
```

Aendert die Version auf `0.2.0.9000` als Kennzeichnung der Entwicklungsphase.

```bash
git add DESCRIPTION NEWS.md
git commit -m "Begin development for next version"
git push
```

**Erwartet:** DESCRIPTION-Version ist jetzt `0.2.0.9000` (Entwicklungsversion). NEWS.md hat eine neue Ueberschrift fuer die Entwicklungsversion. Aenderungen sind zum Remote gepusht.

**Bei Fehler:** Wenn `usethis::use_dev_version()` nicht verfuegbar ist, die Version in DESCRIPTION manuell auf `x.y.z.9000` aendern und eine `# packagename (development version)`-Ueberschrift zu NEWS.md hinzufuegen.

## Validierung

- [ ] Version in DESCRIPTION stimmt mit dem beabsichtigten Release ueberein
- [ ] NEWS.md hat vollstaendige, korrekte Release-Notizen
- [ ] `R CMD check` besteht
- [ ] Git-Tag stimmt mit der Version ueberein (z.B. `v0.2.0`)
- [ ] GitHub-Release existiert mit Release-Notizen
- [ ] Post-Release-Entwicklungsversion gesetzt (x.y.z.9000)

## Haeufige Stolperfallen

- **Tags zu pushen vergessen**: `git push` allein pusht keine Tags. `--tags` oder `git push origin v0.2.0` verwenden
- **NEWS.md-Format**: Markdown-Ueberschriften verwenden, die dem pkgdown/CRAN-erwarteten Format entsprechen
- **Falschen Commit taggen**: Immer nach dem Versions-Erhoehungs-Commit taggen, nicht davor
- **CRAN-Version existiert bereits**: CRAN akzeptiert keine Version, die bereits veroeffentlicht wurde. Immer inkrementieren.
- **Entwicklungsversion im Release**: Niemals eine `.9000`-Version bei CRAN einreichen

## Verwandte Skills

- `submit-to-cran` - CRAN-Einreichung nach der Versionsveroeffentlichung
- `create-github-release` - allgemeine GitHub Release-Erstellung
- `setup-github-actions-ci` - loest pkgdown-Neuerstellung bei Release aus
- `build-pkgdown-site` - Dokumentationswebsite spiegelt neue Version wider
