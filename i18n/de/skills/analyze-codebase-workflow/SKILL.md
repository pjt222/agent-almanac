---
name: analyze-codebase-workflow
description: >
  Eine beliebige Codebase analysieren, um Workflows, Datenpipelines und
  Dateiabhängigkeiten mit putiors put_auto()-Engine automatisch zu erkennen.
  Erzeugt einen Annotationsplan, der erkannte I/O-Muster Quelldateien über
  30+ unterstützte Sprachen mit 902 Auto-Erkennungsmustern zuordnet. Verwenden,
  wenn eine unbekannte Codebase erkundet werden soll, putior-Integration in
  einem Projekt ohne Annotationen gestartet wird oder die Datenpipeline vor
  der Dokumentation auditiert werden soll.
license: MIT
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: multi
  tags: putior, workflow, analysis, auto-detect, polyglot, data-pipeline
---

# Codebase-Workflow analysieren

Ein beliebiges Repository analysieren, um Datenflüsse, Datei-I/O und Skript-Abhängigkeiten automatisch zu erkennen, dann einen strukturierten Annotationsplan zur manuellen Verfeinerung erzeugen.

## Wann verwenden

- Einarbeitung in eine unbekannte Codebase, um Datenflüsse zu verstehen
- putior-Integration in einem Projekt ohne PUT-Annotationen starten
- Vorhandene Datenpipeline eines Projekts vor der Dokumentation auditieren
- Annotationsplan vorbereiten vor Ausführung von `annotate-source-files`

## Eingaben

- **Erforderlich**: Pfad zum Repository oder Quellverzeichnis zum Analysieren
- **Optional**: Spezifische Unterverzeichnisse zum Fokussieren (Standard: gesamtes Repo)
- **Optional**: Sprachen zum Ein- oder Ausschließen (Standard: alle erkannten)
- **Optional**: Erkennungsumfang: nur Inputs, nur Outputs oder beides (Standard: beides + Abhängigkeiten)

## Vorgehensweise

### Schritt 1: Repository-Struktur erkunden

Quelldateien und ihre Sprachen identifizieren, um zu verstehen, was putior analysieren kann.

```r
library(putior)

# Alle unterstützten Sprachen und ihre Erweiterungen auflisten
list_supported_languages()
list_supported_languages(detection_only = TRUE)  # Nur Sprachen mit Auto-Erkennung

# Unterstützte Erweiterungen abrufen
exts <- get_supported_extensions()
```

Dateiauflistung zum Verstehen der Repo-Zusammensetzung verwenden:

```bash
# Dateien nach Erweiterung im Zielverzeichnis zählen
find /path/to/repo -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20
```

**Erwartet:** Liste der im Repo vorhandenen Dateiendungen mit Anzahlen. Diese gegen `get_supported_extensions()` abgleichen, um Abdeckung zu kennen.

**Bei Fehler:** Wenn das Repo keine Dateien mit unterstützten Erweiterungen hat, kann putior keine Workflows auto-erkennen. Überlegen, ob die Sprache unterstützt wird, aber Dateien nicht-standardmäßige Erweiterungen verwenden.

### Schritt 2: Spracherkennungsabdeckung prüfen

Für jede erkannte Sprache die Verfügbarkeit von Auto-Erkennungsmustern verifizieren.

```r
# Prüfen welche Sprachen Auto-Erkennungsmuster haben (18 Sprachen, 902 Muster)
detection_langs <- list_supported_languages(detection_only = TRUE)
cat("Sprachen mit Auto-Erkennung:\n")
print(detection_langs)

# Musterzahlen für spezifische im Repo gefundene Sprachen abrufen
for (lang in c("r", "python", "javascript", "sql", "dockerfile", "makefile")) {
  patterns <- get_detection_patterns(lang)
  cat(sprintf("%s: %d Input-, %d Output-, %d Abhängigkeitsmuster\n",
    lang,
    length(patterns$input),
    length(patterns$output),
    length(patterns$dependency)
  ))
}
```

**Erwartet:** Musterzahlen für jede Sprache ausgegeben. R hat 124 Muster, Python 159, JavaScript 71 usw.

**Bei Fehler:** Wenn eine Sprache keine Muster zurückgibt, unterstützt sie manuelle Annotationen aber keine Auto-Erkennung. Diese Dateien manuell annotieren planen.

### Schritt 3: Auto-Erkennung ausführen

`put_auto()` auf das Zielverzeichnis ausführen, um Workflow-Elemente zu entdecken.

```r
# Vollständige Auto-Erkennung
workflow <- put_auto("./src/",
  detect_inputs = TRUE,
  detect_outputs = TRUE,
  detect_dependencies = TRUE
)

# Build-Skripte und Test-Helfer vom Scan ausschließen
workflow <- put_auto("./src/",
  detect_inputs = TRUE,
  detect_outputs = TRUE,
  detect_dependencies = TRUE,
  exclude = c("build-", "test_helper")
)

# Erkannte Workflow-Knoten anzeigen
print(workflow)

# Knotenanzahl prüfen
cat(sprintf("Erkannte %d Workflow-Knoten\n", nrow(workflow)))
```

Für große Repos, Unterverzeichnisse schrittweise analysieren:

```r
# Spezifische Unterverzeichnisse analysieren
etl_workflow <- put_auto("./src/etl/")
api_workflow <- put_auto("./src/api/")
```

**Erwartet:** Ein DataFrame mit Spalten `id`, `label`, `input`, `output`, `source_file`. Jede Zeile repräsentiert einen erkannten Workflow-Schritt.

**Bei Fehler:** Wenn das Ergebnis leer ist, enthalten die Quelldateien möglicherweise keine erkennbaren I/O-Muster. Debug-Logging aktivieren: `workflow <- put_auto("./src/", log_level = "DEBUG")`, um zu sehen, welche Dateien gescannt und welche Muster zugeordnet werden.

### Schritt 4: Initialdiagramm generieren

Den automatisch erkannten Workflow visualisieren, um Abdeckung zu beurteilen und Lücken zu identifizieren.

```r
# Diagramm aus auto-erkanntem Workflow generieren
cat(put_diagram(workflow, theme = "github"))

# Mit Quelldatei-Info für Nachverfolgbarkeit
cat(put_diagram(workflow, show_source_info = TRUE))

# Zur Überprüfung in Datei speichern
writeLines(put_diagram(workflow, theme = "github"), "workflow-auto.md")
```

**Erwartet:** Mermaid-Flowchart mit erkannten Knoten, verbunden durch Datenfluss-Kanten. Knoten sollten mit aussagekräftigen Funktions-/Dateinamen beschriftet sein.

**Bei Fehler:** Wenn das Diagramm getrennte Knoten zeigt, hat die Auto-Erkennung I/O-Muster gefunden, konnte aber keine Verbindungen ableiten. Das ist normal — Verbindungen werden aus übereinstimmenden Output-Dateinamen mit Input-Dateinamen abgeleitet. Der Annotationsplan (nächster Schritt) adressiert Lücken.

### Schritt 5: Annotationsplan erstellen

Einen strukturierten Plan erstellen, der Gefundenes und manuell Anzunotierendes dokumentiert.

```r
# Annotationsvorschläge generieren
put_generate("./src/", style = "single")

# Mehrzeiliger Stil (lesbarer für komplexe Workflows)
put_generate("./src/", style = "multiline")

# Vorschläge in die Zwischenablage kopieren
put_generate("./src/", output = "clipboard")
```

Plan mit Abdeckungsbewertung dokumentieren:

```markdown
## Annotationsplan

### Auto-erkannt (kein manueller Aufwand nötig)
- `src/etl/extract.R` — 3 Inputs, 2 Outputs erkannt
- `src/etl/transform.py` — 1 Input, 1 Output erkannt

### Braucht manuelle Annotation
- `src/api/handler.js` — Sprache unterstützt, aber keine I/O-Muster zugeordnet
- `src/config/setup.sh` — Nur 12 Shell-Muster; komplexe Logik nicht erfasst

### Nicht unterstützt
- `src/legacy/process.f90` — Fortran nicht in Erkennungssprachen

### Empfohlene Verbindungen
- extract.R-Output `data.csv` → transform.py-Input `data.csv` (auto-verknüpft)
- transform.py-Output `clean.parquet` → load.R-Input (Annotation erforderlich)
```

**Erwartet:** Klarer Plan, der auto-erkannte Dateien von manuell zu annotierenden trennt, mit spezifischen Empfehlungen für jede Datei.

**Bei Fehler:** Wenn `put_generate()` keine Ausgabe erzeugt, sicherstellen, dass der Verzeichnispfad korrekt ist und Quelldateien in unterstützten Sprachen enthält.

## Validierung

- [ ] `put_auto()` wird ohne Fehler auf das Zielverzeichnis ausgeführt
- [ ] Erkannter Workflow hat mindestens einen Knoten (außer das Repo hat kein erkennbares I/O)
- [ ] `put_diagram()` erzeugt gültigen Mermaid-Code aus dem auto-erkannten Workflow
- [ ] `put_generate()` erzeugt Annotationsvorschläge für Dateien mit erkannten Mustern
- [ ] Annotationsplan-Dokument mit Abdeckungsbewertung erstellt

## Haeufige Stolperfallen

- **Zu breit scannen**: `put_auto(".")` auf einem Repo-Root einzuführen kann `node_modules/`, `.git/`, `venv/` usw. einschließen. Spezifische Quellverzeichnisse anvisieren.
- **Vollständige Abdeckung erwarten**: Auto-Erkennung findet Datei-I/O und Bibliotheksaufrufe, nicht Geschäftslogik. Eine Abdeckungsrate von 40-60 % ist typisch; der Rest benötigt manuelle Annotation.
- **Abhängigkeiten ignorieren**: Das Flag `detect_dependencies = TRUE` erfasst `source()`, `import`, `require()`-Aufrufe, die Skripte miteinander verknüpfen. Deaktivieren verliert dateiübergreifende Verbindungen.
- **Sprachabweichung**: Dateien mit nicht-standardmäßigen Erweiterungen (z. B. `.R` vs `.r`, `.jsx` vs `.js`) werden möglicherweise nicht erkannt. `get_comment_prefix()` verwenden, um zu prüfen ob eine Erweiterung erkannt wird.
- **Große Repos**: Für Repos mit 100+ Quelldateien nach Modul/Verzeichnis analysieren, um Diagramme lesbar zu halten.

## Verwandte Skills

- `install-putior` — Voraussetzung: putior muss zuerst installiert werden
- `annotate-source-files` — nächster Schritt: manuelle Annotationen basierend auf dem Plan hinzufügen
- `generate-workflow-diagram` — endgültiges Diagramm nach Abschluss der Annotation generieren
- `configure-putior-mcp` — MCP-Tools für interaktive Analysesitzungen verwenden
