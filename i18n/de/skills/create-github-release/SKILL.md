---
name: create-github-release
description: >
  Ein GitHub-Release mit korrektem Tagging, Release-Notizen und
  optionalen Build-Artefakten erstellen. Umfasst semantische
  Versionierung, Changelog-Generierung und die Verwendung der
  GitHub CLI. Verwenden beim Kennzeichnen einer stabilen
  Softwareversion fuer die Verteilung, beim Veroeffentlichen einer
  neuen Bibliotheks- oder Anwendungsversion, beim Erstellen von
  Release-Notizen fuer Stakeholder oder beim Verteilen von
  Build-Artefakten (Binaerdateien, Tarballs).
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: github, release, git-tags, changelog, versioning
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# GitHub-Release erstellen

Ein getaggtes GitHub-Release mit Release-Notizen und optionalen Artefakten erstellen.

## Wann verwenden

- Eine stabile Softwareversion fuer die Verteilung kennzeichnen
- Eine neue Version einer Bibliothek oder Anwendung veroeffentlichen
- Release-Notizen fuer Stakeholder erstellen
- Build-Artefakte verteilen (Binaerdateien, Tarballs)

## Eingaben

- **Erforderlich**: Versionsnummer (semantische Versionierung)
- **Erforderlich**: Zusammenfassung der Aenderungen seit dem letzten Release
- **Optional**: Anzuhaengende Build-Artefakte
- **Optional**: Ob es sich um ein Pre-Release handelt

## Vorgehensweise

### Schritt 1: Versionsnummer bestimmen

Semantische Versionierung folgen (`MAJOR.MINOR.PATCH`):

| Aenderung | Beispiel | Wann |
|-----------|---------|------|
| MAJOR | 1.0.0 -> 2.0.0 | Inkompatible Aenderungen |
| MINOR | 1.0.0 -> 1.1.0 | Neue Features, rueckwaertskompatibel |
| PATCH | 1.0.0 -> 1.0.1 | Nur Fehlerbehebungen |

**Erwartet:** Eine Versionsnummer wurde gewaehlt, die den Umfang der Aenderungen seit dem letzten Release genau widerspiegelt.

**Bei Fehler:** Wenn unklar ist, ob Aenderungen inkompatibel sind, den Diff der oeffentlichen API pruefen. Jede Entfernung oder Signaturaeänderung einer exportierten Funktion ist eine inkompatible Aenderung und erfordert eine MAJOR-Erhoehung.

### Schritt 2: Version in Projektdateien aktualisieren

- `DESCRIPTION` (R-Pakete)
- `package.json` (Node.js)
- `Cargo.toml` (Rust)
- `pyproject.toml` (Python)

**Erwartet:** Die Versionsnummer ist in der entsprechenden Projektdatei aktualisiert und in die Versionskontrolle eingecheckt.

**Bei Fehler:** Wenn die Version bereits in einem vorherigen Schritt aktualisiert wurde (z.B. ueber `usethis::use_version()` in R), pruefen, ob sie mit der beabsichtigten Release-Version uebereinstimmt.

### Schritt 3: Release-Notizen verfassen

Changelog erstellen oder aktualisieren. Nach Kategorie organisieren:

```markdown
## What's Changed

### New Features
- Added user authentication (#42)
- Support for custom themes (#45)

### Bug Fixes
- Fixed crash on empty input (#38)
- Corrected date parsing in UTC (#41)

### Improvements
- Improved error messages
- Updated dependencies

### Breaking Changes
- `old_function()` renamed to `new_function()` (#50)

**Full Changelog**: https://github.com/user/repo/compare/v1.0.0...v1.1.0
```

**Erwartet:** Release-Notizen sind nach Kategorie organisiert (Features, Fehlerbehebungen, inkompatible Aenderungen) mit Issue-/PR-Referenzen fuer die Nachvollziehbarkeit.

**Bei Fehler:** Wenn Aenderungen schwer zu kategorisieren sind, `git log v1.0.0..HEAD --oneline` pruefen, um die Liste der Aenderungen seit dem letzten Release zu rekonstruieren.

### Schritt 4: Git-Tag erstellen

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

**Erwartet:** Ein annotierter Tag `v1.1.0` existiert lokal und auf dem Remote. `git tag -l` zeigt den Tag.

**Bei Fehler:** Wenn der Tag bereits existiert, mit `git tag -d v1.1.0 && git push origin :refs/tags/v1.1.0` loeschen und neu erstellen. Wenn der Push abgelehnt wird, sicherstellen, dass Schreibzugriff auf den Remote besteht.

### Schritt 5: GitHub-Release erstellen

**Mit GitHub CLI (empfohlen)**:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes-file CHANGELOG.md
```

Mit Artefakten:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes "Release notes here" \
  build/app-v1.1.0.tar.gz \
  build/app-v1.1.0.zip
```

Pre-Release:

```bash
gh release create v2.0.0-beta.1 \
  --title "v2.0.0 Beta 1" \
  --prerelease \
  --notes "Beta release for testing"
```

**Erwartet:** Release auf GitHub sichtbar mit Tag, Notizen und angehaengten Artefakten (falls vorhanden).

**Bei Fehler:** Wenn `gh` nicht authentifiziert ist, `gh auth login` ausfuehren. Wenn der Tag auf dem Remote nicht existiert, zuerst mit `git push origin v1.1.0` pushen.

### Schritt 6: Release-Notizen automatisch generieren

GitHub kann Notizen automatisch aus zusammengefuehrten PRs generieren:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --generate-notes
```

Kategorien in `.github/release.yml` konfigurieren:

```yaml
changelog:
  categories:
    - title: New Features
      labels:
        - enhancement
    - title: Bug Fixes
      labels:
        - bug
    - title: Documentation
      labels:
        - documentation
    - title: Other Changes
      labels:
        - "*"
```

**Erwartet:** Release-Notizen werden automatisch aus den Titeln zusammengefuehrter PRs generiert, nach Label kategorisiert. `.github/release.yml` steuert die Kategorien.

**Bei Fehler:** Wenn die automatisch generierten Notizen leer sind, sicherstellen, dass PRs zusammengefuehrt (nicht geschlossen) und mit Labels versehen wurden. Als Fallback Notizen manuell verfassen.

### Schritt 7: Release verifizieren

```bash
# List releases
gh release list

# View specific release
gh release view v1.1.0
```

**Erwartet:** `gh release list` zeigt das neue Release. `gh release view` zeigt den korrekten Titel, Tag, Notizen und Assets.

**Bei Fehler:** Wenn das Release fehlt, den Actions-Tab auf fehlgeschlagene Release-Workflows pruefen. Die Existenz des Tags mit `git tag -l` bestaetigen.

## Validierung

- [ ] Versions-Tag folgt der semantischen Versionierung
- [ ] Git-Tag zeigt auf den korrekten Commit
- [ ] Release-Notizen beschreiben Aenderungen akkurat
- [ ] Artefakte (falls vorhanden) sind angehaengt und herunterladbar
- [ ] Release ist auf der GitHub-Repository-Seite sichtbar
- [ ] Pre-Release-Flag ist korrekt gesetzt

## Haeufige Stolperfallen

- **Falschen Commit taggen**: Immer `git log` vor dem Taggen pruefen. Nach dem Versions-Bump-Commit taggen.
- **Vergessen, Tags zu pushen**: `git push` pusht keine Tags. `git push --tags` oder `git push origin v1.1.0` verwenden.
- **Inkonsistentes Versionsformat**: Sich auf `v1.0.0` oder `1.0.0` festlegen und dabei bleiben.
- **Leere Release-Notizen**: Immer aussagekraeftige Notizen bereitstellen. Nutzer muessen wissen, was sich geaendert hat.
- **Tags loeschen und neu erstellen**: Tags nach dem Pushen nicht mehr aendern. Bei Bedarf stattdessen eine neue Version erstellen.

## Verwandte Skills

- `commit-changes` - Staging- und Commit-Workflow
- `manage-git-branches` - Branch-Verwaltung fuer Release-Vorbereitung
- `release-package-version` - R-spezifischer Release-Workflow
- `configure-git-repository` - Git-Einrichtung als Voraussetzung
- `setup-github-actions-ci` - Releases ueber CI automatisieren
