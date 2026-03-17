---
name: tidy-project-structure
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Projektdateien in konventionelle Verzeichnisse organisieren, veraltete READMEs
  aktualisieren, Konfigurationsdrift bereinigen und veraltete Elemente archivieren
  ohne Code-Logik zu aendern. Anwenden wenn Dateien ohne klare Organisation
  verstreut sind, READMEs veraltet sind oder defekte Beispiele enthalten,
  Konfigurationsdateien sich ueber Dev/Staging/Prod vermehrt haben, veraltete
  Dateien im Projektstamm verbleiben oder Namenskonventionen ueber Verzeichnisse
  hinweg inkonsistent sind.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: intermediate
  language: multi
  tags: maintenance, organization, structure, readme, config
---

# Projektstruktur aufraumen

## Wann verwenden

Diesen Skill verwenden wenn die Projektorganisation von Konventionen abgewichen ist:

- Dateien ohne klare Organisation ueber Verzeichnisse verstreut
- READMEs veraltet oder mit defekten Beispielen
- Konfigurationsdateien haben sich vermehrt (Dev-, Staging-, Prod-Drift)
- Veraltete Dateien verbleiben im Projektstamm
- Namenskonventionen inkonsistent ueber Verzeichnisse hinweg

**NICHT verwenden** fuer Code-Refactoring oder Abhaengigkeits-Umstrukturierung. Dieser Skill konzentriert sich auf Dateiorganisation und Dokumentationshygiene.

## Eingaben

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|-------------|
| `project_path` | string | Ja | Absoluter Pfad zum Projektstamm |
| `conventions` | string | Nein | Pfad zum Stilhandbuch (z.B. `docs/conventions.md`) |
| `archive_mode` | enum | Nein | `move` (Standard) oder `delete` fuer veraltete Dateien |
| `readme_update` | boolean | Nein | Veraltete READMEs aktualisieren (Standard: true) |

## Vorgehensweise

### Schritt 1: Verzeichnisstruktur pruefen

Aktuelle Struktur mit Projektkonventionen oder sprachspezifischen Best Practices vergleichen.

**Gaengige Konventionen nach Sprache**:

**JavaScript/TypeScript**:
```
src/          # Quellcode
tests/        # Testdateien
dist/         # Build-Ausgabe (gitignored)
docs/         # Dokumentation
.github/      # CI/CD-Workflows
```

**Python**:
```
package_name/      # Paketcode
tests/             # Testsuite
docs/              # Sphinx-Dokumentation
scripts/           # Hilfsskripte
```

**R**:
```
R/                 # R-Quellcode
tests/testthat/    # Testsuite
man/               # Dokumentation (generiert)
vignettes/         # Ausfuehrliche Anleitungen
inst/              # Installierte Dateien
data/              # Paketdaten
```

**Rust**:
```
src/          # Quellcode
tests/        # Integrationstests
benches/      # Benchmarks
examples/     # Verwendungsbeispiele
```

**Erwartet:** Liste der gegen Konventionen verstossenden Dateien/Verzeichnisse in `structure_audit.txt` gespeichert

**Bei Fehler:** Wenn keine Konventionen dokumentiert sind, sprachspezifische Standards verwenden

### Schritt 2: Fehlplatzierte Dateien verschieben

Dateien in ihre konventionellen Verzeichnisse umlagern.

**Haeufige Verschiebungen**:
1. Testdateien ausserhalb von `tests/` nach `tests/` verschieben
2. Dokumentation ausserhalb von `docs/` nach `docs/` verschieben
3. Build-Artefakte in `src/` loeschen (sollten gitignored sein)
4. Konfigurationsdateien im Stammverzeichnis nach `config/` oder `.config/` verschieben

Fuer jede Verschiebung:
```bash
# Pruefen ob Datei irgendwo referenziert wird
grep -r "filename" .

# Wenn keine Referenzen oder nur relative Pfadreferenzen:
mkdir -p target_directory/
git mv source/file target_directory/file

# Alle Imports/Requires aktualisieren
# (sprachspezifisch — siehe repair-broken-references Skill)
```

**Erwartet:** Alle Dateien an konventionellen Positionen; Git-Historie ueber `git mv` erhalten

**Bei Fehler:** Wenn Verschieben Imports bricht, Importpfade aktualisieren oder eskalieren

### Schritt 3: README-Aktualitaet pruefen

Veraltete Informationen in allen README-Dateien identifizieren.

**Veralterungsindikatoren**:
1. Letzte Aenderung vor >6 Monaten
2. Referenzen auf alte Versionsnummern
3. Defekte Links oder Code-Beispiele
4. Fehlende Abschnitte (Installation, Verwendung, Mitwirkung)
5. Kein Lizenz-Badge oder defekte Badge-Links

```bash
# Alle READMEs finden
find . -name "README.md" -o -name "readme.md"

# Fuer jede README:
# - Letztes Aenderungsdatum pruefen
git log -1 --format="%ci" README.md

# - Auf defekte Links pruefen
markdown-link-check README.md

# - Beispielcode auf Funktionsfaehigkeit pruefen (erstes Beispiel testen)
```

**Erwartet:** Liste veralteter READMEs in `readme_freshness.txt` mit konkreten Problemen

**Bei Fehler:** Wenn markdown-link-check nicht verfuegbar, externe Links manuell pruefen

### Schritt 4: Veraltete READMEs aktualisieren

Defekte Links reparieren, Beispiele aktualisieren, fehlende Abschnitte ergaenzen.

**Standard-Korrekturen**:
1. Defekte Badge-URLs ersetzen
2. Versionsnummern in Installationsanweisungen aktualisieren
3. Defekten Beispielcode reparieren (zur Verifizierung ausfuehren)
4. Fehlende Abschnitte ergaenzen (Vorlage aus Projektkonventionen verwenden)
5. Copyright-Jahr aktualisieren

**README-Vorlagenstruktur**:
```markdown
# Projektname

Kurzbeschreibung (1-2 Saetze).

## Installation

```bash
# Sprachspezifischer Installationsbefehl
```

## Verwendung

```language
# Grundlegendes Beispiel
```

## Dokumentation

Link zur vollstaendigen Dokumentation.

## Mitwirkung

Link zu CONTRIBUTING.md oder eingebettete Richtlinien.

## Lizenz

LIZENZ-Badge und Link.
```

**Erwartet:** Alle READMEs aktualisiert; Beispiele auf Funktionsfaehigkeit verifiziert

**Bei Fehler:** Wenn Beispielcode nicht verifizierbar, mit Warnkommentar markieren

### Schritt 5: Konfigurationsdateien ueberpruefen

Konfigurationsdrift identifizieren und doppelte Einstellungen konsolidieren.

**Haeufige Konfigurationsprobleme**:
1. Mehrere `.env`-Dateien (`.env`, `.env.local`, `.env.dev`, `.env.prod`)
2. Doppelte Einstellungen ueber Konfigurationsdateien hinweg
3. Hartcodierte Geheimnisse (sollten Umgebungsvariablen verwenden)
4. Veraltete API-Endpunkte oder Feature-Flags

```bash
# Alle Konfigurationsdateien finden
find . -name "*.config.*" -o -name ".env*" -o -name "*.yml" -o -name "*.yaml"

# Fuer jede Konfiguration:
# - Auf doppelte Schluessel pruefen
# - Nach hartcodierten Geheimnissen suchen (API-Schluessel, Token, Passwoerter)
grep -E "(api[_-]?key|token|password|secret)" config_file

# - Dev- vs Prod-Einstellungen vergleichen
diff .env.dev .env.prod
```

**Erwartet:** Konfigurationsdrift in `config_review.txt` dokumentiert; Geheimnisse zur Eskalation markiert

**Bei Fehler:** Wenn Diff grosse Abweichungen zeigt, an devops-engineer eskalieren

### Schritt 6: Veraltete Dateien archivieren

Nicht mehr benoetigte Dateien verschieben oder loeschen.

**Kandidaten fuer Archivierung**:
- Auskommentierte Konfigurationsdateien (z.B. `nginx.conf.old`)
- Altskripte die seit >1 Jahr nicht ausgefuehrt wurden
- Sicherungsdateien (z.B. `file.bak`, `file~`)
- Versehentlich committete Build-Artefakte

**Archivierungsprozess**:
```bash
# Archivverzeichnis erstellen (wenn archive_mode=move)
mkdir -p archive/YYYY-MM-DD/

# Fuer jede veraltete Datei:
# 1. Pruefen ob nirgends referenziert
grep -r "filename" .

# 2. Git-Historie auf letzte Aenderung pruefen
git log -1 --format="%ci" filename

# 3. Wenn seit >1 Jahr nicht geaendert und keine Referenzen:
if [ "$archive_mode" = "move" ]; then
  git mv filename archive/YYYY-MM-DD/
else
  git rm filename
fi

# 4. In ARCHIVE_LOG.md dokumentieren
echo "- filename (Grund, letzte Aenderung: DATUM)" >> ARCHIVE_LOG.md
```

**Erwartet:** Veraltete Dateien archiviert; `ARCHIVE_LOG.md` aktualisiert

**Bei Fehler:** Wenn unsicher ob Datei veraltet ist, belassen und im Bericht dokumentieren

### Schritt 7: Namenskonventionen ueberpruefen

Auf inkonsistente Dateibenennung im Projekt pruefen.

**Gaengige Konventionen**:
- **kebab-case**: `my-file.js` (ueblich in JS/Web-Projekten)
- **snake_case**: `my_file.py` (Python-Standard)
- **PascalCase**: `MyComponent.tsx` (React-Komponenten)
- **camelCase**: `myUtility.js` (JavaScript-Funktionen)

```bash
# Dateien finden die gegen Konventionen verstossen
# Beispiel: Python-Projekt mit erwarteter snake_case
find . -name "*.py" | grep -v "__pycache__" | grep -E "[A-Z-]"

# Fuer jeden Verstoss entweder:
# 1. Umbenennen um Konventionen einzuhalten
# 2. Ausnahme dokumentieren (z.B. Django settings.py Konvention)
```

**Erwartet:** Alle Dateien folgen Namenskonventionen oder Ausnahmen dokumentiert

**Bei Fehler:** Wenn Umbenennung Imports bricht, Referenzen aktualisieren oder eskalieren

### Schritt 8: Bereinigungsbericht erstellen

Alle strukturellen Aenderungen dokumentieren.

```markdown
# Projektstruktur-Bereinigungsbericht

**Datum**: JJJJ-MM-TT
**Projekt**: <projektname>

## Verzeichnisaenderungen

- X Dateien in konventionelle Verzeichnisse verschoben
- Y neue Verzeichnisse erstellt
- Z veraltete Dateien archiviert

## README-Aktualisierungen

- W veraltete READMEs aktualisiert
- X defekte Links repariert
- Y Code-Beispiele verifiziert

## Konfigurationsbereinigung

- X doppelte Einstellungen konsolidiert
- Y hartcodierte Geheimnisse zur Entfernung markiert
- Z Konfigurationsdrift-Probleme dokumentiert

## Archivierte Dateien

Siehe ARCHIVE_LOG.md fuer vollstaendige Liste (Z Dateien).

## Namenskonventionskorrekturen

- X Dateien entsprechend Konventionen umbenannt
- Y Ausnahmen dokumentiert

## Eskalierungen

- [Konfigurationsdrift erfordert DevOps-Pruefung]
- [Hartcodierte Geheimnisse erfordern Sicherheitsaudit]
```

**Erwartet:** Bericht in `TIDYING_REPORT.md` gespeichert

**Bei Fehler:** (Entfaellt — Bericht unabhaengig generieren)

## Validierung

Nach der Bereinigung:

- [ ] Alle Dateien in konventionellen Verzeichnissen
- [ ] Keine defekten Links in READMEs
- [ ] README-Beispiele auf Funktionsfaehigkeit verifiziert
- [ ] Konfigurationsdateien auf Geheimnisse geprueft
- [ ] Veraltete Dateien mit Dokumentation archiviert
- [ ] Namenskonventionen konsistent
- [ ] Git-Historie erhalten (verwendet `git mv`, nicht `mv`)
- [ ] Tests bestehen nach Verschiebungen weiterhin

## Haeufige Stolperfallen

1. **Relative Imports brechen**: Verschieben von Dateien bricht relative Importpfade. Alle Referenzen aktualisieren oder absolute Imports verwenden.

2. **Git-Historie verlieren**: Verwendung von `mv` statt `git mv` verliert Dateihistorie. Immer Git-Befehle fuer Verschiebungen verwenden.

3. **Ueberorganisation**: Zu viele verschachtelte Verzeichnisse erschweren die Navigation. Flach halten bis Komplexitaet Struktur erfordert.

4. **Loeschen statt Archivieren**: Direktes Loeschen verliert Wiederherstellungsmoeglichkeit. Immer zuerst archivieren wenn nicht sicher.

5. **Sprachkonventionen ignorieren**: Persoenliche Vorlieben ueber Sprachstandards stellen. Etablierte Konventionen befolgen.

6. **Dokumentation nicht aktualisieren**: Dateien verschieben ohne README-Pfade anzupassen hinterlaesst defekte Dokumentation.

## Verwandte Skills

- [clean-codebase](../clean-codebase/SKILL.md) — Toten Code entfernen, Lint-Warnungen beheben
- [repair-broken-references](../repair-broken-references/SKILL.md) — Links und Imports nach Verschiebungen reparieren
- [escalate-issues](../escalate-issues/SKILL.md) — Komplexe Konfigurationsprobleme an Spezialisten weiterleiten
- [devops/config-management](../../devops/config-management/SKILL.md) — Erweiterte Konfigurationskonsolidierung
- [compliance/documentation-audit](../../compliance/documentation-audit/SKILL.md) — Umfassende Dokumentationspruefung
