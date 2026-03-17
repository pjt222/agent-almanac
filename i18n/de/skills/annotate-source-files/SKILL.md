---
name: annotate-source-files
description: >
  PUT-Workflow-Annotationen zu Quelldateien hinzufügen, mit dem korrekten
  sprachspezifischen Kommentar-Präfix. Behandelt Annotationssyntax,
  Skeleton-Generierung via put_generate(), mehrzeilige Annotationen,
  .internal-Variablen und Validierung. Unterstützt 30+ Sprachen mit
  automatischer Kommentar-Präfix-Erkennung. Verwenden, nach der
  Codebase-Analyse mit einem Annotationsplan, beim Hinzufügen von
  Workflow-Dokumentation oder beim Dokumentieren von Datenpipelines.
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
  tags: putior, annotation, workflow, comment-syntax, polyglot, documentation
---

# Quelldateien annotieren

PUT-Workflow-Annotationen zu Quelldateien hinzufügen, sodass putior strukturierte Workflow-Daten extrahieren und Mermaid-Diagramme generieren kann.

## Wann verwenden

- Nach der Codebase-Analyse mit `analyze-codebase-workflow` mit vorhandenem Annotationsplan
- Workflow-Dokumentation zu neuen oder bestehenden Quelldateien hinzufügen
- Auto-erkannte Workflows mit manuellen Beschriftungen und Verbindungen anreichern
- Datenpipelines, ETL-Prozesse oder mehrstufige Berechnungen dokumentieren

## Eingaben

- **Erforderlich**: Zu annotierende Quelldateien
- **Erforderlich**: Annotationsplan oder Kenntnis der Workflow-Schritte
- **Optional**: Stil-Präferenz: einzeilig oder mehrzeilig (Standard: einzeilig)
- **Optional**: Ob `put_generate()` für Skeleton-Generierung verwendet werden soll (Standard: ja)

## Vorgehensweise

### Schritt 1: Kommentar-Präfix bestimmen

Jede Sprache hat ein spezifisches Kommentar-Präfix für PUT-Annotationen. `get_comment_prefix()` verwenden, um das korrekte zu finden.

```r
library(putior)

# Häufige Präfixe
get_comment_prefix("R")    # "#"
get_comment_prefix("py")   # "#"
get_comment_prefix("sql")  # "--"
get_comment_prefix("js")   # "//"
get_comment_prefix("ts")   # "//"
get_comment_prefix("go")   # "//"
get_comment_prefix("rs")   # "//"
get_comment_prefix("m")    # "%"
get_comment_prefix("lua")  # "--"
```

**Erwartet:** Ein String wie `"#"`, `"--"`, `"//"` oder `"%"`.

> **Zeilen- und Block-Kommentare:** putior erkennt Annotationen sowohl in Zeilen-Kommentaren (`//`, `#`, `--`) als auch in C-Stil-Block-Kommentaren (`/* */`, `/** */`). Für JS/TS werden sowohl `//` als auch `/* */`-Blöcke gescannt. Python-Triple-Quote-Strings (`''' '''`) werden **nicht** erkannt — für Python `#` verwenden.

**Bei Fehler:** Wenn die Erweiterung nicht erkannt wird, ist die Dateisprache möglicherweise nicht unterstützt. `get_supported_extensions()` für die vollständige Liste prüfen. Für nicht unterstützte Sprachen `#` als konventionellen Standard verwenden.

### Schritt 2: Annotations-Skeletons generieren

`put_generate()` verwenden, um Annotations-Templates basierend auf auto-erkanntem I/O zu erstellen.

```r
# Vorschläge in der Konsole ausgeben
put_generate("./src/etl/")

# Einzeiliger Stil (Standard)
put_generate("./src/etl/", style = "single")

# Mehrzeiliger Stil für komplexe Annotationen
put_generate("./src/etl/", style = "multiline")

# In Zwischenablage kopieren zum Einfügen
put_generate("./src/etl/", output = "clipboard")
```

Beispiel-Ausgabe für eine R-Datei:
```r
# put id:'extract_data', label:'Extract Customer Data', input:'customers.csv', output:'raw_data.internal'
```

Beispiel-Ausgabe für SQL:
```sql
-- put id:'load_data', label:'Load Customer Table', output:'customers'
```

**Erwartet:** Eine oder mehrere Annotations-Kommentarzeilen pro Quelldatei, vorausgefüllt mit erkannten Funktionsnamen und I/O.

**Bei Fehler:** Wenn keine Vorschläge generiert werden, enthält die Datei möglicherweise keine erkennbaren I/O-Muster. Annotationen manuell basierend auf dem Verständnis des Codes schreiben.

### Schritt 3: Annotationen verfeinern

Die generierten Skeletons bearbeiten, um genaue Beschriftungen, Verbindungen und Metadaten hinzuzufügen.

**Annotationssyntax-Referenz:**

```
<prefix> put id:'unique_id', label:'Menschenlesbare Beschriftung', input:'datei1.csv, datei2.rds', output:'ergebnis.parquet, zusammenfassung.internal'
```

Felder:
- `id` (erforderlich): Eindeutige Kennung, für Knotenverbindungen verwendet
- `label` (erforderlich): Menschenlesbare Beschreibung, im Diagramm angezeigt
- `input`: Komma-getrennte Liste von Input-Dateien oder -Variablen
- `output`: Komma-getrennte Liste von Output-Dateien oder -Variablen
- `.internal`-Erweiterung: Markiert In-Memory-Variablen (nicht zwischen Skripten persistiert)
- `node_type`: Steuert Mermaid-Knotenform und CSS-Klassen-Styling. Werte:
  - `"input"` — Stadion-Form `([...])` für Datenquellen und Konfiguration
  - `"output"` — Subroutinen-Form `[[...]]` für generierte Artefakte
  - `"process"` — Rechteck `[...]` für Verarbeitungsschritte (Standard)
  - `"decision"` — Raute `{...}` für bedingte Logik
  - `"start"` / `"end"` — Stadion-Form `([...])` für Einstiegs-/Endknoten

Beispiel mit `node_type`:
```r
# put id:'config', label:'Load Config', node_type:'input', output:'config.internal'
# put id:'transform', label:'Apply Rules', node_type:'process', input:'config.internal', output:'result.rds'
# put id:'report', label:'Generate Report', node_type:'output', input:'result.rds'
```

**Mehrzeilige Syntax** (für komplexe Annotationen):
```r
# put id:'complex_step', \
#   label:'Mehrzeilige Beschriftung', \
#   input:'data.csv, config.yaml', \
#   output:'result.parquet'
```

**Dateiübergreifender Datenfluss** (Skripte über dateibasiertes I/O verbinden):
```r
# Skript 1: extract.R
# put id:'extract', label:'Daten extrahieren', output:'raw_data.internal, raw_data.rds'
data <- read.csv("source.csv")
saveRDS(data, "raw_data.rds")

# Skript 2: transform.R
# put id:'transform', label:'Daten transformieren', input:'raw_data.rds', output:'clean_data.parquet'
data <- readRDS("raw_data.rds")
arrow::write_parquet(clean, "clean_data.parquet")
```

**Erwartet:** Annotationen mit genauen IDs, Beschriftungen und I/O-Feldern verfeinert, die den tatsächlichen Datenfluss widerspiegeln.

**Bei Fehler:** Wenn I/O unklar ist, `.internal`-Erweiterung für In-Memory-Intermediate-Werte und explizite Dateinamen für persistierte Daten verwenden.

### Schritt 4: Annotationen in Dateien einfügen

Annotationen am Anfang jeder Datei oder unmittelbar über dem relevanten Code-Block platzieren.

**Platzierungskonventionen:**
1. **Datei-Level-Annotation**: Am Anfang der Datei platzieren, nach eventueller Shebang-Zeile oder Datei-Header-Kommentar
2. **Block-Level-Annotation**: Unmittelbar über dem beschriebenen Code-Block platzieren
3. **Mehrere Annotationen pro Datei**: Für Dateien mit unterschiedlichen Workflow-Phasen verwenden

Beispiel-Platzierung in einer R-Datei:
```r
#!/usr/bin/env Rscript
# ETL-Extraktionsskript
#
# put id:'read_source', label:'Quelldaten einlesen', input:'raw_data.csv', output:'df.internal'

df <- read.csv("raw_data.csv")

# put id:'clean_data', label:'Bereinigen und validieren', input:'df.internal', output:'clean.rds'

df_clean <- df[complete.cases(df), ]
saveRDS(df_clean, "clean.rds")
```

Das Edit-Tool verwenden, um Annotationen in bestehende Dateien einzufügen, ohne umgebenden Code zu stören.

**Erwartet:** Annotationen an geeigneten Stellen in jeder Quelldatei eingefügt.

**Bei Fehler:** Wenn Annotationen die Syntax-Hervorhebung im Editor stören, sicherstellen, dass das Kommentar-Präfix für die Sprache korrekt ist. PUT-Annotationen sind Standard-Kommentare und sollten die Code-Ausführung nicht beeinflussen.

### Schritt 5: Annotationen validieren

putiors Validierung ausführen, um Annotationssyntax und Konnektivität zu prüfen.

```r
# Annotierte Dateien scannen
workflow <- put("./src/", validate = TRUE)

# Auf Validierungsprobleme prüfen
print(workflow)
cat(sprintf("Gesamtknoten: %d\n", nrow(workflow)))

# Verbindungen durch Prüfung von Input/Output-Überschneidung verifizieren
inputs <- unlist(strsplit(workflow$input, ",\\s*"))
outputs <- unlist(strsplit(workflow$output, ",\\s*"))
connected <- intersect(inputs, outputs)
cat(sprintf("Verbundene Datenflüsse: %d\n", length(connected)))

# Diagramm generieren zur visuellen Inspektion
cat(put_diagram(workflow, theme = "github", show_source_info = TRUE))

# Mit auto-erkannten Daten zusammenführen für maximale Abdeckung
merged <- put_merge("./src/", merge_strategy = "supplement")
cat(put_diagram(merged, theme = "github"))
```

**Erwartet:** Alle Annotationen werden ohne Fehler geparst. Das Diagramm zeigt einen verbundenen Workflow. `put_merge()` füllt Lücken aus der Auto-Erkennung.

**Bei Fehler:** Häufige Validierungsprobleme:
- Fehlende schließende Anführungszeichen: `id:'name` → `id:'name'`
- Doppelte Anführungszeichen innerhalb: `id:"name"` → `id:'name'`
- Doppelte IDs über Dateien hinweg: jede `id` muss innerhalb des gesamten gescannten Verzeichnisses eindeutig sein
- Backslash-Fortsetzung auf der falschen Zeile: `\` muss das letzte Zeichen vor dem Zeilenumbruch sein

## Validierung

- [ ] Jede annotierte Datei hat syntaktisch gültige PUT-Annotationen
- [ ] `put("./src/")` gibt einen DataFrame mit der erwarteten Knotenanzahl zurück
- [ ] Keine doppelten `id`-Werte im gescannten Verzeichnis
- [ ] `put_diagram()` erzeugt ein verbundenes Flowchart (nicht nur isolierte Knoten)
- [ ] Mehrzeilige Annotationen (wenn verwendet) werden korrekt mit Backslash-Fortsetzung geparst
- [ ] `.internal`-Variablen erscheinen nur als Outputs, nie als dateiübergreifende Inputs

## Haeufige Stolperfallen

- **Anführungszeichen-Verschachtelungsfehler**: PUT-Annotationen verwenden einfache Anführungszeichen: `id:'name'`. Doppelte Anführungszeichen verursachen Parsing-Probleme in String-Kontexten.
- **Doppelte IDs**: Jede `id` muss innerhalb des gescannten Bereichs global eindeutig sein. Namenskonvention wie `<skript>_<schritt>` verwenden (z. B. `extract_read`, `transform_clean`).
- **`.internal` als dateiübergreifender Input**: `.internal`-Variablen existieren nur während der Skript-Ausführung. Um Daten zwischen Skripten zu übergeben, ein persistiertes Dateiformat als Output eines Skripts und Input des nächsten verwenden.
- **Fehlende Verbindungen**: Wenn das Diagramm getrennte Knoten zeigt, prüfen, dass Output-Dateinamen in einer Annotation exakt mit Input-Dateinamen in einer anderen übereinstimmen (einschließlich Erweiterungen).
- **Falsches Kommentar-Präfix**: `#` in einer SQL-Datei oder `//` in Python zu verwenden, lässt die Annotation als Code statt als Kommentar behandelt werden.
- **Vergessene Mehrzeilige Fortsetzung**: Bei mehrzeiligen Annotationen muss jede fortgesetzte Zeile mit `\` enden und die nächste Zeile muss mit dem Kommentar-Präfix beginnen.
- **Python-Triple-Quote-Strings**: putior scannt Python-Triple-Quote-Strings nicht. Immer `#` für Python-PUT-Annotationen verwenden.

## Verwandte Skills

- `analyze-codebase-workflow` — Voraussetzung: erzeugt den Annotationsplan, dem dieses Skill folgt
- `generate-workflow-diagram` — nächster Schritt: endgültiges Diagramm aus Annotationen generieren
- `install-putior` — putior muss vor dem Annotieren installiert sein
- `configure-putior-mcp` — MCP-Tools bieten interaktive Annotationshilfe
