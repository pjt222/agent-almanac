---
name: clean-codebase
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Toten Code entfernen, ungenutzte Imports bereinigen, Lint-Warnungen beheben
  und Formatierung in einer Codebasis vereinheitlichen ohne Geschaeftslogik
  oder Architektur zu aendern. Anwenden wenn sich Lint-Warnungen waehrend
  schneller Entwicklung angehaeuft haben, ungenutzte Imports und Variablen
  Dateien ueberladen, tote Codepfade nie entfernt wurden, Formatierung
  ueber Dateien hinweg inkonsistent ist oder statische Analysewerkzeuge
  behebbare Hygienprobleme melden.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: intermediate
  language: multi
  tags: maintenance, cleanup, lint, dead-code, formatting
---

# Codebasis bereinigen

## Wann verwenden

Diesen Skill verwenden wenn eine Codebasis Hygieneschulden angehaeuft hat:

- Lint-Warnungen haben sich waehrend schneller Entwicklung angehaeuft
- Ungenutzte Imports und Variablen ueberladen Dateien
- Tote Codepfade existieren, wurden aber nie entfernt
- Formatierung ist ueber Dateien hinweg inkonsistent
- Statische Analysewerkzeuge melden behebbare Probleme

**NICHT verwenden** fuer architektonisches Refactoring, Fehlerbehebungen oder Aenderungen der Geschaeftslogik. Dieser Skill konzentriert sich ausschliesslich auf Hygiene und automatisierte Bereinigung.

## Eingaben

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|-------------|
| `codebase_path` | string | Ja | Absoluter Pfad zum Codebasis-Stammverzeichnis |
| `language` | string | Ja | Primaersprache (js, python, r, rust usw.) |
| `cleanup_mode` | enum | Nein | `safe` (Standard) oder `aggressive` |
| `run_tests` | boolean | Nein | Testsuite nach Bereinigung ausfuehren (Standard: true) |
| `backup` | boolean | Nein | Backup vor Loeschung erstellen (Standard: true) |

## Vorgehensweise

### Schritt 1: Vorbewertung

Den aktuellen Zustand messen um Verbesserungen spaeter zu quantifizieren.

```bash
# Lint-Warnungen nach Schweregrad zaehlen
lint_tool --format json > lint_before.json

# Codezeilen zaehlen
cloc . --json > cloc_before.json

# Ungenutzte Symbole auflisten (sprachabhaengig)
# JavaScript/TypeScript: ts-prune oder depcheck
# Python: vulture
# R: lintr-Pruefung ungenutzter Funktionen
```

**Erwartet:** Ausgangskennzahlen in `lint_before.json` und `cloc_before.json` gespeichert

**Bei Fehler:** Wenn das Lint-Werkzeug nicht gefunden wird, automatisierte Korrekturen ueberspringen und auf manuelle Pruefung konzentrieren

### Schritt 2: Automatisierte Lint-Warnungen beheben

Sichere automatisierte Korrekturen anwenden (Abstande, Anfuehrungszeichen, Semikolons, nachfolgende Leerzeichen).

**JavaScript/TypeScript**:
```bash
eslint --fix .
prettier --write .
```

**Python**:
```bash
black .
isort .
ruff check --fix .
```

**R**:
```bash
Rscript -e "styler::style_dir('.')"
```

**Rust**:
```bash
cargo fmt
cargo clippy --fix --allow-dirty
```

**Erwartet:** Alle sicheren Lint-Warnungen behoben; Dateien konsistent formatiert

**Bei Fehler:** Wenn automatisierte Korrekturen Testfehler einfuehren, Aenderungen rueckgaengig machen und eskalieren

### Schritt 3: Tote Codepfade identifizieren

Statische Analyse verwenden um unreferenzierte Funktionen, ungenutzte Variablen und verwaiste Dateien zu finden.

**JavaScript/TypeScript**:
```bash
ts-prune | tee dead_code.txt
depcheck | tee unused_deps.txt
```

**Python**:
```bash
vulture . | tee dead_code.txt
```

**R**:
```bash
Rscript -e "lintr::lint_dir('.', linters = lintr::unused_function_linter())"
```

**Allgemeiner Ansatz**:
1. Nach Funktionsdefinitionen suchen
2. Nach Funktionsaufrufen suchen
3. Funktionen melden die definiert aber nie aufgerufen werden

**Erwartet:** `dead_code.txt` listet ungenutzte Funktionen, Variablen und Dateien auf

**Bei Fehler:** Wenn das statische Analysewerkzeug nicht verfuegbar ist, manuell die juengste Commit-Historie auf verwaisten Code pruefen

### Schritt 4: Ungenutzte Imports entfernen

Importbloecke bereinigen indem Referenzen auf nie verwendete Pakete entfernt werden.

**JavaScript**:
```bash
eslint --fix --rule 'no-unused-vars: error'
```

**Python**:
```bash
autoflake --remove-all-unused-imports --in-place --recursive .
```

**R**:
```bash
# Manuelle Pruefung: nach library()-Aufrufen suchen, pruefen ob Paket verwendet wird
grep -r "library(" . | cut -d: -f2 | sort | uniq
```

**Erwartet:** Alle ungenutzten Import-Anweisungen entfernt

**Bei Fehler:** Wenn das Entfernen von Imports den Build bricht, wurden sie indirekt verwendet — wiederherstellen und dokumentieren

### Schritt 5: Toten Code entfernen (modusabhaengig)

**Sicherer Modus** (Standard):
- Nur explizit als veraltet markierten Code entfernen
- Auskommentierte Codebloecke entfernen (wenn >10 Zeilen und >6 Monate alt)
- TODO-Kommentare entfernen die auf abgeschlossene Issues verweisen

**Aggressiver Modus** (opt-in):
- Alle in Schritt 3 als ungenutzt identifizierten Funktionen entfernen
- Private Methoden mit null Referenzen entfernen
- Feature-Flags fuer veraltete Features entfernen

Fuer jede Loeschkandidatin:
1. Null Referenzen in der Codebasis verifizieren
2. Git-Historie auf juengste Aktivitaet pruefen (ueberspringen wenn in den letzten 30 Tagen geaendert)
3. Code entfernen und Eintrag in `CLEANUP_LOG.md` hinzufuegen

**Erwartet:** Toter Code entfernt; `CLEANUP_LOG.md` dokumentiert alle Loeschungen

**Bei Fehler:** Wenn unsicher ob Code wirklich tot ist, in ein `archive/`-Verzeichnis verschieben statt zu loeschen

### Schritt 6: Formatierung vereinheitlichen

Konsistente Formatierung ueber alle Dateien sicherstellen (auch wenn nicht von Lintern erfasst).

1. Zeilenenden normalisieren (LF vs CRLF)
2. Einzelnen Zeilenumbruch am Dateiende sicherstellen
3. Nachfolgende Leerzeichen entfernen
4. Einrueckung normalisieren (Leerzeichen vs Tabs, Einrueckungstiefe)

```bash
# Beispiel: Zeilenenden und nachfolgende Leerzeichen beheben
find . -type f -name "*.js" -exec sed -i 's/\r$//' {} +
find . -type f -name "*.js" -exec sed -i 's/[[:space:]]*$//' {} +
```

**Erwartet:** Alle Dateien folgen konsistenten Formatierungskonventionen

**Bei Fehler:** Wenn sed Binaerdateien beschaedigt, ueberspringen und dokumentieren

### Schritt 7: Tests ausfuehren

Validieren dass die Bereinigung die Funktionalitaet nicht beeintraechtigt hat.

```bash
# Sprachspezifischer Testbefehl
npm test              # JavaScript
pytest                # Python
R CMD check           # R
cargo test            # Rust
```

**Erwartet:** Alle Tests bestehen (oder dieselben Fehler wie vor der Bereinigung)

**Bei Fehler:** Aenderungen inkrementell rueckgaengig machen um die brechende Aenderung zu identifizieren, dann eskalieren

### Schritt 8: Bereinigungsbericht erstellen

Alle Aenderungen zur Pruefung dokumentieren.

```markdown
# Codebasis-Bereinigungsbericht

**Datum**: JJJJ-MM-TT
**Modus**: safe | aggressive
**Sprache**: <Sprache>

## Kennzahlen

| Kennzahl | Vorher | Nachher | Aenderung |
|----------|--------|---------|-----------|
| Lint-Warnungen | X | Y | -Z |
| Codezeilen | A | B | -C |
| Ungenutzte Imports | D | 0 | -D |
| Tote Funktionen | E | F | -G |

## Angewandte Aenderungen

1. X Lint-Warnungen behoben (automatisiert)
2. Y ungenutzte Imports entfernt
3. Z Zeilen toten Code geloescht (siehe CLEANUP_LOG.md)
4. Formatierung ueber W Dateien vereinheitlicht

## Eskalierungen

- [Problembeschreibung die menschliche Pruefung erfordert]
- [Unsichere Loeschung nach archive/ verschoben]

## Validierung

- [x] Alle Tests bestehen
- [x] Backup erstellt: backup_JJJJMMTT/
- [x] CLEANUP_LOG.md aktualisiert
```

**Erwartet:** Bericht als `CLEANUP_REPORT.md` im Projektstammverzeichnis gespeichert

**Bei Fehler:** (Entfaellt — Bericht unabhaengig vom Ergebnis erstellen)

## Validierung

Nach der Bereinigung:

- [ ] Alle Tests bestehen (oder dieselben Fehler wie vorher)
- [ ] Keine neuen Lint-Warnungen eingefuehrt
- [ ] Backup vor allen Loeschungen erstellt
- [ ] `CLEANUP_LOG.md` dokumentiert allen entfernten Code
- [ ] Bereinigungsbericht mit Kennzahlen erstellt
- [ ] Git-Diff auf unerwartete Aenderungen geprueft
- [ ] CI-Pipeline besteht

## Haeufige Stolperfallen

1. **Code entfernen der noch ueber Reflexion verwendet wird**: Statische Analyse uebersieht dynamische Aufrufe (z.B. `eval()`, Metaprogrammierung). Immer Git-Historie pruefen.

2. **Implizite Abhaengigkeiten brechen**: Imports entfernen die von Abhaengigkeiten verwendet wurden. Nach jeder Import-Entfernung Tests ausfuehren.

3. **Feature-Flags fuer aktive Features loeschen**: Auch wenn im aktuellen Branch ungenutzt, koennen Feature-Flags in anderen Umgebungen aktiv sein. Deployment-Konfigurationen pruefen.

4. **Ueberaggressive Formatierung**: Werkzeuge wie `black` oder `prettier` koennen Code auf eine Weise umformatieren die unnoetige Diffs ausloest. Werkzeuge so konfigurieren dass sie zum Projektstil passen.

5. **Testabdeckung ignorieren**: Codebasen ohne Tests koennen nicht sicher bereinigt werden. Wenn die Abdeckung niedrig ist, zuerst fuer Testergaenzungen eskalieren.

6. **Kein Backup erstellen**: Immer ein `backup_JJJJMMTT/`-Verzeichnis erstellen bevor irgendetwas geloescht wird, auch bei Verwendung von Git.

## Verwandte Skills

- `tidy-project-structure` — Verzeichnislayout organisieren, READMEs aktualisieren
- `repair-broken-references` — Tote Links und Imports reparieren
- `escalate-issues` — Komplexe Probleme an Spezialisten weiterleiten
