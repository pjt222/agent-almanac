---
name: release-package-version
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Eine neue Version eines R-Pakets veroeffentlichen einschliesslich
  Versionserhoehung, NEWS.md-Aktualisierungen, Git-Tagging,
  GitHub-Release-Erstellung und Einrichtung der Post-Release-
  Entwicklungsversion. Anwenden wenn ein Paket fuer eine neue Patch-,
  Minor- oder Major-Veroeffentlichung bereit ist, nach CRAN-Akzeptanz
  zur Erstellung des entsprechenden GitHub-Release, oder beim Einrichten
  der Entwicklungsversionsanpassung direkt nach einer Veroeffentlichung.
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

Den vollstaendigen Versionsveroeffentlichungszyklus fuer ein R-Paket ausfuehren.

## Wann verwenden

- Bereit zur Veroeffentlichung einer neuen Version (Fehlerbehebung, neues Feature oder einschneidende Aenderung)
- Nach CRAN-Akzeptanz ein entsprechendes GitHub-Release erstellen
- Post-Release-Entwicklungsversion einrichten

## Eingaben

- **Erforderlich**: Paket mit veroeffentlichungsbereiten Aenderungen
- **Erforderlich**: Veroeffentlichungstyp: Patch (0.1.0 -> 0.1.1), Minor (0.1.0 -> 0.2.0) oder Major (0.1.0 -> 1.0.0)
- **Optional**: Ob bei CRAN eingereicht werden soll (Standard: nein, `submit-to-cran`-Skill separat verwenden)

## Vorgehensweise

### Schritt 1: Versionserhoehung bestimmen

Semantische Versionierung befolgen:

| Aenderungstyp | Versionserhoehung | Beispiel |
|---------------|-------------------|----------|
| Nur Fehlerbehebungen | Patch | 0.1.0 -> 0.1.1 |
| Neue Features (rueckwaertskompatibel) | Minor | 0.1.0 -> 0.2.0 |
| Einschneidende Aenderungen | Major | 0.1.0 -> 1.0.0 |

**Erwartet:** Der korrekte Erhoehungstyp (Patch, Minor oder Major) ist basierend auf der Art der Aenderungen seit der letzten Veroeffentlichung bestimmt.

**Bei Fehler:** Im Zweifelsfall `git log` seit dem letzten Tag ueberpruefen und jede Aenderung klassifizieren. Jede einschneidende API-Aenderung erfordert eine Major-Erhoehung.

### Schritt 2: Version aktualisieren

```r
usethis::use_version("minor")  # oder "patch" oder "major"
```

Dies aktualisiert das `Version`-Feld in DESCRIPTION und fuegt eine Ueberschrift zu NEWS.md hinzu.

**Erwartet:** DESCRIPTION-Version aktualisiert. NEWS.md hat einen neuen Abschnittstitel fuer die Veroeffentlichungsversion.

**Bei Fehler:** Wenn `usethis::use_version()` nicht verfuegbar ist, manuell das `Version`-Feld in DESCRIPTION aktualisieren und eine `# paketname x.y.z`-Ueberschrift zu NEWS.md hinzufuegen.

### Schritt 3: NEWS.md aktualisieren

Die Veroeffentlichungsnotizen unter der neuen Versionsueuberschrift ausfuellen:

```markdown
# paketname 0.2.0

## Neue Features
- `neue_funktion()` zur Datenverarbeitung hinzugefuegt (#42)
- Unterstuetzung fuer benutzerdefinierte Themes in `plot_results()` (#45)

## Fehlerbehebungen
- Absturz behoben wenn Eingabe nur NAs enthaelt (#38)
- Off-by-One-Fehler in `window_calc()` korrigiert (#41)

## Kleinere Verbesserungen
- Fehlermeldungen fuer ungueltige Eingabetypen verbessert
- Dokumentationsbeispiele aktualisiert
```

Issue-/PR-Nummern fuer die Rueckverfolgbarkeit verwenden.

**Erwartet:** NEWS.md enthaelt eine vollstaendige Zusammenfassung benutzersichtbarer Aenderungen nach Kategorien geordnet, mit Issue-/PR-Nummern fuer die Rueckverfolgbarkeit.

**Bei Fehler:** Wenn Aenderungen schwer zu rekonstruieren sind, `git log --oneline v<vorgaenger>..HEAD` verwenden um alle Commits seit der letzten Veroeffentlichung aufzulisten und zu kategorisieren.

### Schritt 4: Abschlusspruefungen

```r
devtools::check()
devtools::spell_check()
urlchecker::url_check()
```

**Erwartet:** `devtools::check()` gibt 0 Fehler, 0 Warnungen und 0 Anmerkungen zurueck. Rechtschreib- und URL-Pruefung finden keine Probleme.

**Bei Fehler:** Alle Fehler und Warnungen vor der Veroeffentlichung beheben. Falsch-positive Woerter zu `inst/WORDLIST` fuer die Rechtschreibpruefung hinzufuegen. Fehlerhafte URLs ersetzen.

### Schritt 5: Veroeffentlichung committen

```bash
git add DESCRIPTION NEWS.md
git commit -m "Release paketname v0.2.0"
```

**Erwartet:** Ein einzelner Commit der die Versionserhoehung in DESCRIPTION und die aktualisierte NEWS.md enthaelt.

**Bei Fehler:** Wenn andere nicht-committete Aenderungen vorhanden sind, nur DESCRIPTION und NEWS.md stagen. Veroeffentlichungs-Commits sollten nur versionsbezogene Aenderungen enthalten.

### Schritt 6: Das Release taggen

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

**Erwartet:** Annotierter Tag `v0.2.0` erstellt und zum Remote gepusht. `git tag -l` zeigt den Tag lokal; `git ls-remote --tags origin` bestaetigt ihn auf dem Remote.

**Bei Fehler:** Wenn der Push fehlschlaegt, Schreibzugriff pruefen. Wenn der Tag bereits existiert, verifizieren dass er auf den korrekten Commit zeigt mit `git show v0.2.0`.

### Schritt 7: GitHub-Release erstellen

```bash
gh release create v0.2.0 \
  --title "paketname v0.2.0" \
  --notes-file NEWS.md
```

Oder verwenden:

```r
usethis::use_github_release()
```

**Erwartet:** GitHub-Release erstellt mit Veroeffentlichungsnotizen sichtbar auf der Releases-Seite des Repositorys.

**Bei Fehler:** Wenn `gh release create` fehlschlaegt, sicherstellen dass die `gh`-CLI authentifiziert ist (`gh auth status`). Wenn `usethis::use_github_release()` fehlschlaegt, das Release manuell auf GitHub erstellen.

### Schritt 8: Entwicklungsversion setzen

Nach der Veroeffentlichung zur Entwicklungsversion wechseln:

```r
usethis::use_dev_version()
```

Dies aendert die Version zu `0.2.0.9000` als Kennzeichnung fuer Entwicklung.

```bash
git add DESCRIPTION NEWS.md
git commit -m "Entwicklung fuer naechste Version beginnen"
git push
```

**Erwartet:** DESCRIPTION-Version ist jetzt `0.2.0.9000` (Entwicklungsversion). NEWS.md hat eine neue Ueberschrift fuer die Entwicklungsversion. Aenderungen sind zum Remote gepusht.

**Bei Fehler:** Wenn `usethis::use_dev_version()` nicht verfuegbar ist, die Version manuell zu `x.y.z.9000` in DESCRIPTION aendern und eine `# paketname (Entwicklungsversion)`-Ueberschrift zu NEWS.md hinzufuegen.

## Validierung

- [ ] Version in DESCRIPTION stimmt mit beabsichtigter Veroeffentlichung ueberein
- [ ] NEWS.md hat vollstaendige, genaue Veroeffentlichungsnotizen
- [ ] `R CMD check` besteht
- [ ] Git-Tag stimmt mit Version ueberein (z.B. `v0.2.0`)
- [ ] GitHub-Release existiert mit Veroeffentlichungsnotizen
- [ ] Post-Release-Entwicklungsversion gesetzt (x.y.z.9000)

## Haeufige Stolperfallen

- **Vergessen Tags zu pushen**: `git push` allein pusht keine Tags. `--tags` verwenden oder `git push origin v0.2.0`
- **NEWS.md-Format**: Markdown-Ueberschriften im von pkgdown/CRAN erwarteten Format verwenden
- **Falschen Commit taggen**: Immer nach dem Versionserhoehungs-Commit taggen, nicht davor
- **CRAN-Version existiert bereits**: CRAN akzeptiert keine bereits veroeffentlichte Version. Immer inkrementieren.
- **Entwicklungsversion in der Veroeffentlichung**: Nie eine `.9000`-Version bei CRAN einreichen

## Verwandte Skills

- `submit-to-cran` -- CRAN-Einreichung nach Versionsveroeffentlichung
- `create-github-release` -- Allgemeine GitHub-Release-Erstellung
- `setup-github-actions-ci` -- Loest pkgdown-Neubau bei Release aus
- `build-pkgdown-site` -- Dokumentationsseite spiegelt neue Version wider
