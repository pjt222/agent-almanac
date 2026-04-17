---
name: repair-broken-references
locale: de
source_locale: en
source_commit: acc252e6
translator: claude
translation_date: "2026-03-17"
description: >
  Defekte interne Links, tote externe URLs, veraltete Imports, fehlende
  Querverweise und verwaiste Dateien finden und reparieren. Stellt sicher
  dass alle Projektreferenzen gueltig und aktuell bleiben. Anwenden wenn
  Dokumentation defekte interne Links enthaelt, externe URLs 404-Fehler
  zurueckgeben, Import-Anweisungen auf verschobene oder geloeschte Module
  verweisen, Querverweise zwischen Dateien nicht synchron sind oder Dateien
  existieren die nirgends im Projekt referenziert werden.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: intermediate
  language: multi
  tags: maintenance, links, imports, references, orphans
---

# Defekte Referenzen reparieren

## Wann verwenden

Diesen Skill verwenden wenn Projektreferenzen veraltet sind:

- Dokumentation enthaelt defekte interne Links
- Externe URLs geben 404-Fehler zurueck
- Import-Anweisungen verweisen auf verschobene oder geloeschte Module
- Querverweise zwischen Dateien sind nicht synchron
- Dateien existieren die nirgends referenziert werden

**NICHT verwenden** fuer Refactoring von Modulabhaengigkeiten oder Neugestaltung der Informationsarchitektur. Dieser Skill repariert bestehende Referenzen, strukturiert sie nicht um.

## Eingaben

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|-------------|
| `project_path` | string | Ja | Absoluter Pfad zum Projektstamm |
| `check_external` | boolean | Nein | Externe URLs verifizieren (Standard: true, langsam) |
| `fix_mode` | enum | Nein | `auto` (offensichtliche beheben), `report` (nur dokumentieren), `interactive` (nachfragen) |
| `orphan_threshold` | integer | Nein | Tage seit letzter Aenderung um als verwaist zu markieren (Standard: 180) |

## Vorgehensweise

### Schritt 1: Defekte interne Links scannen

Alle Markdown-Links finden die auf nicht existierende Dateien zeigen.

```bash
# Alle Markdown-Dateien finden
find . -name "*.md" -type f > markdown_files.txt

# Alle Markdown-Links extrahieren: [Text](Pfad)
grep -oP '\[.*?\]\(\K[^)]+' *.md | sort | uniq > all_links.txt

# Fuer jeden Link:
while read link; do
  # Externe URLs ueberspringen (http/https)
  if [[ "$link" =~ ^https?:// ]]; then
    continue
  fi

  # Relativen Pfad aufloesen
  target=$(realpath -m "$link")

  # Pruefen ob Ziel existiert
  if [ ! -e "$target" ]; then
    echo "DEFEKT: $link (referenziert in $file)" >> broken_internal.txt
  fi
done < all_links.txt
```

**Erwartet:** `broken_internal.txt` listet alle defekten internen Referenzen auf

**Bei Fehler:** Wenn `realpath` nicht verfuegbar, jeden Link manuell pruefen

### Schritt 2: Externe URLs pruefen

Verifizieren dass externe Links noch erreichbar sind (HTTP 200 Antwort).

```bash
# Externe URLs extrahieren
grep -ohP 'https?://[^\s\)]+' *.md | sort | uniq > external_urls.txt

# Jede URL pruefen (Ratelimit um Sperren zu vermeiden)
while read url; do
  status=$(curl -o /dev/null -s -w "%{http_code}" "$url")

  if [ "$status" -ge 400 ]; then
    echo "TOT ($status): $url" >> dead_urls.txt
  fi

  sleep 0.5  # Ratelimit
done < external_urls.txt
```

**Erwartet:** `dead_urls.txt` listet URLs die 4xx/5xx-Fehler zurueckgeben

**Bei Fehler:** Wenn curl nicht verfuegbar oder blockiert, Online-Link-Checker verwenden oder ueberspringen

**Hinweis**: Einige URLs koennen 403 zurueckgeben wegen Bot-Erkennung, funktionieren aber im Browser. Manuelle Pruefung erforderlich.

### Schritt 3: Defekte Imports finden

Pruefen dass alle Import-/Require-Anweisungen auf existierende Module verweisen.

**JavaScript/TypeScript**:
```bash
# Alle Import-Anweisungen finden
grep -rh "^import.*from ['\"]" . | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/" > imports.txt

# Fuer jeden Import:
while read import; do
  # node_modules und externe Pakete ueberspringen
  if [[ "$import" =~ ^[./] ]]; then
    # Zu Dateipfad aufloesen
    target="${import}.js"  # .js, .ts, .jsx, .tsx versuchen

    if [ ! -e "$target" ]; then
      echo "DEFEKTER IMPORT: $import" >> broken_imports.txt
    fi
  fi
done < imports.txt
```

**Python**:
```bash
# Alle Import-Anweisungen finden
grep -rh "^from .* import\|^import " . --include="*.py" | \
  sed -E "s/from ([^ ]+) import.*/\1/" | \
  sed -E "s/import ([^ ]+)/\1/" > imports.txt

# Fuer jeden lokalen Import (beginnt mit .)
# Pruefen ob Moduldatei existiert
```

**R**:
```bash
# library()- und source()-Aufrufe finden
grep -rh "library(\\|source(" . --include="*.R" | \
  sed -E 's/.*library\("([^"]+)"\).*/\1/' > packages.txt

# Fuer source()-Aufrufe pruefen ob Datei existiert
# Fuer library()-Aufrufe pruefen ob Paket installiert
Rscript -e "installed.packages()[,'Package']" > installed_packages.txt
```

**Erwartet:** `broken_imports.txt` listet alle Referenzen auf geloeschte/verschobene Module

**Bei Fehler:** Wenn sprachspezifisches Werkzeug nicht verfuegbar, kuerzliche Refactoring-Commits manuell pruefen

### Schritt 4: Verwaiste Dateien finden

Dateien identifizieren die existieren aber nirgends referenziert werden.

```bash
# Alle Codedateien finden
find . -type f \( -name "*.js" -o -name "*.py" -o -name "*.R" \) > all_files.txt

# Fuer jede Datei:
while read file; do
  basename=$(basename "$file")

  # Nach Referenzen suchen (Import, Require, Source, href, Link)
  refs=$(grep -r "$basename" . --exclude-dir=node_modules --exclude-dir=.git | wc -l)

  # Wenn nur 1 Referenz (sich selbst):
  if [ "$refs" -le 1 ]; then
    # Letztes Aenderungsdatum pruefen
    last_mod=$(git log -1 --format="%ci" "$file")

    # Wenn laenger als orphan_threshold Tage nicht geaendert
    # Als potenziell verwaist markieren
    echo "VERWAIST: $file (letzte Aenderung: $last_mod)" >> orphans.txt
  fi
done < all_files.txt
```

**Erwartet:** `orphans.txt` listet Dateien die anderweitig nicht referenziert werden

**Bei Fehler:** Wenn git log fehlschlaegt, stattdessen Dateisystem-mtime verwenden

**Hinweis**: Einige Dateien (z.B. CLI-Einstiegspunkte, Top-Level-Skripte) sind legitimerweise unreferenziert aber keine Waisen. Erfordert manuelle Pruefung.

### Schritt 5: Interne Links reparieren

Defekte interne Referenzen mit einer von drei Strategien reparieren:

**Strategie 1: Verschobene Dateien finden**
```bash
# Fuer jeden defekten Link nach Datei nach Name suchen
while read broken_link; do
  filename=$(basename "$broken_link")

  # Im Projekt nach Datei suchen
  found=$(find . -name "$filename" | head -1)

  if [ -n "$found" ]; then
    # Link auf neuen Pfad aktualisieren
    old_path="$broken_link"
    new_path="$found"

    # Edit-Tool zum Ersetzen in allen Markdown-Dateien verwenden
    echo "KORREKTUR: $old_path -> $new_path"
  fi
done < broken_internal.txt
```

**Strategie 2: Weiterleitungs-Stub erstellen**
```bash
# Wenn Datei absichtlich geloescht wurde, Weiterleitungs-Stub erstellen
echo "# Verschoben" > "$broken_link"
echo "Dieser Inhalt wurde nach [neuer Ort](new_path.md) verschoben" >> "$broken_link"
```

**Strategie 3: Toten Link entfernen**
```bash
# Wenn Inhalt nicht mehr existiert, Link entfernen (Text beibehalten)
# [Text](defekter_link) durch Text (Klartext) ersetzen
```

**Erwartet:** Alle defekten internen Links entweder repariert, weitergeleitet oder entfernt

**Bei Fehler:** Wenn automatische Korrektur den Kontext bricht, zur manuellen Pruefung eskalieren

### Schritt 6: Defekte Imports reparieren

Import-Anweisungen aktualisieren um nach Verschiebungen auf korrekte Pfade zu verweisen.

**JavaScript-Beispiel**:
```javascript
// Vorher (defekt)
import { helper } from './utils/helper';

// Nachher (repariert — Datei nach lib/ verschoben)
import { helper } from './lib/helper';
```

Fuer jeden defekten Import:
1. Verschobenes Modul finden (aehnlich wie Schritt 5)
2. Importpfad in allen referenzierenden Dateien aktualisieren
3. Linter/Typechecker zur Verifizierung der Korrektur ausfuehren

**Erwartet:** Alle Imports loesen korrekt auf; keine Modul-nicht-gefunden-Fehler

**Bei Fehler:** Wenn Modul tatsaechlich geloescht wurde, eskalieren um festzustellen ob Funktionalitaet noch benoetigt wird

### Schritt 7: Verwaiste Dateien dokumentieren

Fuer als verwaist markierte Dateien Verwendungszweck bestimmen:

1. **Behalten**: Legitimerweise unreferenziert (Einstiegspunkte, Skripte, Vorlagen)
2. **Archivieren**: Alter Code nicht mehr benoetigt aber Historie bewahren
3. **Loeschen**: Toter Code ohne Wert

```markdown
# Pruefung verwaister Dateien

| Datei | Letzte Aenderung | Empfehlung | Grund |
|-------|------------------|------------|-------|
| scripts/old_deploy.sh | 2024-01-05 | Archivieren | Durch CI/CD ersetzt |
| src/legacy_api.js | 2023-06-12 | Loeschen | API v1 vollstaendig abgekuendigt |
| bin/cli.py | 2025-12-01 | Behalten | CLI-Einstiegspunkt (absichtlich unreferenziert) |
```

**Erwartet:** Dokument zur Pruefung verwaister Dateien erstellt; automatische Entscheidungen zur menschlichen Genehmigung markiert

**Bei Fehler:** (Entfaellt — auch ohne klare Empfehlung dokumentieren)

### Schritt 8: Reparaturbericht erstellen

Alle defekten Referenzen und angewandten Korrekturen zusammenfassen.

```markdown
# Referenz-Reparaturbericht

**Datum**: JJJJ-MM-TT
**Projekt**: <projektname>
**Korrekturmodus**: auto | report | interactive

## Defekte interne Links

- Gesamt: X
- Repariert: Y
- Weitergeleitet: Z
- Eskaliert: W

Details:
- [datei.md](datei.md) Zeile 45: Defekten Link zu verschobenem Dokument repariert
- [andere.md](andere.md) Zeile 12: Weiterleitungs-Stub erstellt

## Tote externe URLs

- Gesamt: X
- Repariert (Wayback Machine): Y
- Entfernt: Z

Details:
- https://example.com/old-page (404) → Entfernt
- https://api.old.com/docs (verschwunden) → Durch neue Dokumentation ersetzt

## Defekte Imports

- Gesamt: X
- Repariert: Y
- Eskaliert: Z

Details:
- src/main.js Zeile 3: Importpfad nach Refactoring aktualisiert

## Verwaiste Dateien

- Gesamt: X
- Behalten: Y
- Archiviert: Z
- Zur Pruefung eskaliert: W

Siehe ORPHAN_REVIEW.md fuer vollstaendige Analyse.

## Validierung

- [x] Alle Tests bestehen nach Korrekturen
- [x] Linter meldet keine Modul-nicht-gefunden-Fehler
- [x] Tote Links im Bericht dokumentiert
```

**Erwartet:** Bericht in `REFERENCE_REPAIR_REPORT.md` gespeichert

**Bei Fehler:** (Entfaellt — Bericht unabhaengig generieren)

## Validierung

Nach Reparaturen:

- [ ] Keine defekten internen Links in Dokumentation
- [ ] Tote externe URLs dokumentiert (nicht alle reparierbar)
- [ ] Alle Imports loesen korrekt auf
- [ ] Verwaiste Dateien geprueft und zugeordnet
- [ ] Tests bestehen nach Import-Korrekturen
- [ ] Linter meldet keine unaufgeloesten Referenzen
- [ ] Git-Historie erhalten (verwendet `git mv` fuer Verschiebungen)

## Haeufige Stolperfallen

1. **Automatische URL-Korrekturen brechen Kontext**: Tote Links durch web.archive.org-URLs zu ersetzen entspricht moeglicherweise nicht der Absicht des Autors. Manche Links werden besser entfernt.

2. **Ueberagressive Waisen-Loeschung**: Einstiegspunkte, CLI-Skripte und Vorlagen sind oft absichtlich unreferenziert. Nicht ohne Pruefung loeschen.

3. **Import-Pfad-Annahmen**: Annahme dass alle relativen Imports denselben Basispfad verwenden. Verschiedene Modulsysteme (CommonJS, ES6, TypeScript) behandeln Pfade unterschiedlich.

4. **Externe URL Falsch-Positive**: Einige Websites blockieren curl/Bots funktionieren aber einwandfrei im Browser. Tote URLs immer manuell verifizieren.

5. **Zirkulaere Referenz-Fallen**: Datei A importiert B, B importiert A. Aktualisierung einer bricht die andere. Erfordert gleichzeitige Korrektur.

6. **Fragment-Bezeichner ignorieren**: Reparatur von `[Link](#abschnitt)` erfordert Pruefung ob der `#abschnitt`-Anker existiert, nicht nur ob die Datei existiert.

7. **Falsches R-Binary auf Hybrid-Systemen**: Unter WSL oder Docker kann `Rscript` einen plattformuebergreifenden Wrapper statt nativem R aufloesen. Mit `which Rscript && Rscript --version` pruefen. Das native R-Binary bevorzugen (z.B. `/usr/local/bin/Rscript` unter Linux/WSL) fuer Zuverlaessigkeit. Fuer die R-Pfadkonfiguration siehe [Setting Up Your Environment](../../guides/setting-up-your-environment.md).

## Verwandte Skills

- [clean-codebase](../clean-codebase/SKILL.md) — Toten Code entfernen nach Bestaetigung verwaister Dateien
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — Dateien reorganisieren (kann defekte Referenzen erzeugen)
- [escalate-issues](../escalate-issues/SKILL.md) — Komplexe Referenzprobleme an Spezialisten weiterleiten
- [compliance/documentation-audit](../../compliance/documentation-audit/SKILL.md) — Umfassende Dokumentationspruefung
- [web-dev/link-checker](../../web-dev/link-checker/SKILL.md) — Erweiterte externe URL-Validierung
