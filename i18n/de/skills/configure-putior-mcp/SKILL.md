---
name: configure-putior-mcp
description: >
  Den putior-MCP-Server konfigurieren, um 16 Workflow-Visualisierungswerkzeuge
  fuer KI-Assistenten bereitzustellen. Umfasst Claude Code- und Claude Desktop-
  Einrichtung, Abhaengigkeitsinstallation (mcptools, ellmer), Werkzeugverifizierung
  und optionale ACP-Serverkonfiguration fuer Agent-zu-Agent-Kommunikation.
  Verwenden beim Aktivieren von KI-Assistenten zur interaktiven Annotation und
  Visualisierung von Workflows, beim Einrichten einer neuen Entwicklungsumgebung
  mit putior-MCP-Integration oder beim Konfigurieren von Agent-zu-Agent-
  Kommunikation ueber ACP fuer automatisierte Pipelines.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: R
  tags: putior, mcp, acp, ai-assistant, claude, tools, integration
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Putior-MCP konfigurieren

Den putior-MCP-Server einrichten, damit KI-Assistenten (Claude Code, Claude Desktop) Workflow-Annotations- und Diagrammgenerierungswerkzeuge direkt aufrufen koennen.

## Wann verwenden

- KI-Assistenten zur interaktiven Annotation und Visualisierung von Workflows aktivieren
- Eine neue Entwicklungsumgebung mit putior-MCP-Integration einrichten
- Nach der Installation von putior KI-gestuetzte Workflow-Dokumentation nutzen wollen
- Agent-zu-Agent-Kommunikation ueber ACP fuer automatisierte Pipelines konfigurieren

## Eingaben

- **Erforderlich**: putior installiert (siehe `install-putior`)
- **Erforderlich**: Ziel-Client: Claude Code, Claude Desktop oder beide
- **Optional**: Ob auch der ACP-Server konfiguriert werden soll (Standard: nein)
- **Optional**: Benutzerdefinierter Host/Port fuer ACP-Server (Standard: localhost:8080)

## Vorgehensweise

### Schritt 1: MCP-Abhaengigkeiten installieren

Die erforderlichen Pakete fuer die MCP-Serverfunktionalitaet installieren.

```r
# Required: MCP framework
remotes::install_github("posit-dev/mcptools")

# Required: Tool definition framework
install.packages("ellmer")

# Verify both load
library(mcptools)
library(ellmer)
```

**Erwartet:** Beide Pakete installieren und laden sich ohne Fehler.

**Bei Fehler:** `mcptools` benoetigt das `remotes`-Paket. Zuerst installieren: `install.packages("remotes")`. Bei GitHub-Rate-Limiting einen `GITHUB_PAT` in `~/.Renviron` konfigurieren (die Zeile `GITHUB_PAT=your_token_here` hinzufuegen und R neu starten). Tokens **nicht** in Shell-Befehle einfuegen oder in die Versionskontrolle committen.

### Schritt 2: Claude Code konfigurieren (WSL/Linux/macOS)

Den putior-MCP-Server zur Konfiguration von Claude Code hinzufuegen.

```bash
# One-line setup
claude mcp add putior -- Rscript -e "putior::putior_mcp_server()"
```

Fuer WSL mit Windows-R:
```bash
claude mcp add putior -- "/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "putior::putior_mcp_server()"
```

Die Konfiguration verifizieren:
```bash
claude mcp list
claude mcp get putior
```

**Erwartet:** `putior` erscheint in der MCP-Serverliste mit dem Status "configured".

**Bei Fehler:** Wenn Claude Code nicht im PATH ist, hinzufuegen: `export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`. Wenn der Rscript-Pfad falsch ist, R mit `which Rscript` oder `ls "/mnt/c/Program Files/R/"` lokalisieren.

### Schritt 3: Claude Desktop konfigurieren (Windows)

putior zur MCP-Konfigurationsdatei von Claude Desktop hinzufuegen.

`%APPDATA%\Claude\claude_desktop_config.json` bearbeiten:

```json
{
  "mcpServers": {
    "putior": {
      "command": "C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe",
      "args": ["-e", "putior::putior_mcp_server()"]
    }
  }
}
```

Oder mit dem vollstaendigen Pfad:
```json
{
  "mcpServers": {
    "putior": {
      "command": "C:\\Program Files\\R\\R-4.5.2\\bin\\x64\\Rscript.exe",
      "args": ["-e", "putior::putior_mcp_server()"]
    }
  }
}
```

Claude Desktop nach dem Bearbeiten der Konfiguration neu starten.

**Erwartet:** Claude Desktop zeigt putior in seiner MCP-Serverliste. Werkzeuge werden im Gespraech verfuegbar.

**Bei Fehler:** JSON-Syntax mit einem JSON-Linter validieren. Pruefen, dass der R-Pfad existiert. 8.3-Kurznamen (`PROGRA~1`, `R-45~1.0`) verwenden, wenn Leerzeichen in Pfaden Probleme verursachen.

### Schritt 4: Alle 16 Werkzeuge verifizieren

Testen, dass alle MCP-Werkzeuge zugaenglich und funktionsfaehig sind.

```r
# Get tool definitions
tools <- putior::putior_mcp_tools()
cat(sprintf("Total tools: %d\n", length(tools)))

# List tool names
vapply(tools, function(t) t$name, character(1))
```

Die 16 Werkzeuge nach Kategorie organisiert:

**Core Workflow (5):**
- `put` — Dateien nach PUT-Annotationen scannen (unterstuetzt `exclude`-Parameter fuer regex-basierte Dateifilterung)
- `put_diagram` — Mermaid-Diagramme generieren
- `put_auto` — Workflow automatisch aus Code erkennen (unterstuetzt `exclude`-Parameter)
- `put_generate` — Annotationsvorschlaege generieren (unterstuetzt `exclude`-Parameter)
- `put_merge` — Manuelle + automatische Annotationen zusammenfuehren (unterstuetzt `exclude`-Parameter)

**Reference/Discovery (7):**
- `get_comment_prefix` — Kommentarpraefix fuer Dateierweiterung abrufen
- `get_supported_extensions` — Unterstuetzte Erweiterungen auflisten
- `list_supported_languages` — Unterstuetzte Sprachen auflisten
- `get_detection_patterns` — Auto-Detection-Muster abrufen
- `get_diagram_themes` — Verfuegbare Themes auflisten
- `putior_guide` — KI-Assistenten-Dokumentation
- `putior_help` — Kurzreferenz-Hilfe

**Utilities (3):**
- `is_valid_put_annotation` — Annotationssyntax validieren
- `split_file_list` — Dateilisten parsen
- `ext_to_language` — Dateierweiterung zu Sprachname

**Configuration (1):**
- `set_putior_log_level` — Logging-Verbositaet konfigurieren

Kern-Werkzeuge aus Claude Code testen:
```
Use the putior_help tool to see available commands
Use the put tool to scan ./R/ for annotations
Use the put_diagram tool to generate a diagram
```

**Erwartet:** Alle 16 Werkzeuge aufgelistet. Kern-Werkzeuge liefern erwartete Ergebnisse bei Aufruf mit gueltigen Eingaben.

**Bei Fehler:** Wenn Werkzeuge fehlen, pruefen, ob die putior-Version aktuell ist: `packageVersion("putior")`. Aeltere Versionen haben moeglicherweise weniger Werkzeuge. Mit `remotes::install_github("pjt222/putior")` aktualisieren.

### Schritt 5: ACP-Server konfigurieren (Optional)

Den ACP-Server (Agent Communication Protocol) fuer Agent-zu-Agent-Kommunikation einrichten.

```r
# Install ACP dependency
install.packages("plumber2")

# Start ACP server (blocks — run in a separate R session or background)
putior::putior_acp_server()

# Custom host/port
putior::putior_acp_server(host = "0.0.0.0", port = 9000)
```

ACP-Endpunkte testen:
```bash
# Discover agent
curl http://localhost:8080/agents

# Execute a scan
curl -X POST http://localhost:8080/runs \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "parts": [{"content": "scan ./R/"}]}]}'

# Generate diagram
curl -X POST http://localhost:8080/runs \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "parts": [{"content": "generate diagram for ./R/"}]}]}'
```

**Erwartet:** ACP-Server startet auf dem konfigurierten Port. `/agents` gibt das putior-Agent-Manifest zurueck. `/runs` akzeptiert natuerlichsprachliche Anfragen und gibt Workflow-Ergebnisse zurueck.

**Bei Fehler:** Wenn Port 8080 bereits belegt ist, einen anderen Port angeben. Wenn `plumber2` nicht installiert ist, gibt die Serverfunktion eine hilfreiche Fehlermeldung mit Installationshinweis aus.

## Validierung

- [ ] `putior::putior_mcp_tools()` stellt die Kern-Werkzeuge bereit (`put`, `put_diagram`, `put_auto`, `put_generate`, `put_merge`) und gibt ca. 16 Werkzeuge fuer die aktuelle Version zurueck
- [ ] Claude Code: `claude mcp list` zeigt `putior` als konfiguriert
- [ ] Claude Code: `putior_help`-Werkzeug gibt Hilfetext bei Aufruf zurueck
- [ ] Claude Desktop: putior erscheint in der MCP-Serverliste nach Neustart
- [ ] Kern-Werkzeuge (`put`, `put_diagram`, `put_auto`) fuehren sich ohne Fehler aus
- [ ] (Optional) ACP-Server antwortet auf `curl http://localhost:8080/agents`

## Haeufige Stolperfallen

- **mcptools nicht installiert**: Der MCP-Server benoetigt `mcptools` (von GitHub) und `ellmer` (von CRAN). Beide muessen installiert sein. putior prueft und gibt hilfreiche Meldungen aus, wenn sie fehlen.
- **Falscher R-Pfad in Claude Desktop**: Windows-Pfade muessen in JSON escaped werden (`\\`). 8.3-Kurznamen verwenden, um Leerzeichen zu vermeiden: `C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe`.
- **Neustart vergessen**: Claude Desktop muss nach dem Bearbeiten der Konfigurationsdatei neu gestartet werden. Claude Code uebernimmt Aenderungen beim naechsten Sitzungsstart.
- **renv-Isolation**: Wenn putior in einer renv-Bibliothek installiert ist, aber Claude Code/Desktop R ohne renv startet, werden die Pakete nicht gefunden. Sicherstellen, dass `mcptools` und `ellmer` in der globalen Bibliothek installiert sind oder die renv-Aktivierung im MCP-Serverbefehl konfigurieren.
- **Portkonflikte fuer ACP**: Der Standard-ACP-Port (8080) wird haeufig verwendet. Mit `lsof -i :8080` oder `netstat -tlnp | grep 8080` vor dem Start pruefen.
- **Nur bestimmte Werkzeuge einbinden**: Um eine Teilmenge von Werkzeugen bereitzustellen, `putior_mcp_tools(include = c("put", "put_diagram"))` beim Erstellen benutzerdefinierter MCP-Server-Wrapper verwenden.
- **Benutzerdefinierte Paletten ueber MCP**: Der `palette`-Parameter bei `put_diagram` benoetigt ein `putior_theme`-R-Objekt (erstellt durch `put_theme()`), das nicht ueber MCPs JSON-Schnittstelle serialisiert werden kann. Den eingebauten `theme`-Parameterstring fuer MCP-Aufrufe verwenden. Fuer benutzerdefinierte Paletten R direkt nutzen.

## Verwandte Skills

- `install-putior` — Voraussetzung: putior und optionale Abhaengigkeiten muessen installiert sein
- `configure-mcp-server` — Allgemeine MCP-Serverkonfiguration fuer Claude Code/Desktop
- `troubleshoot-mcp-connection` — Verbindungsprobleme diagnostizieren, wenn Werkzeuge nicht erscheinen
- `build-custom-mcp-server` — Benutzerdefinierte MCP-Server erstellen, die putior-Werkzeuge wrappen
- `analyze-codebase-workflow` — MCP-Werkzeuge interaktiv fuer Codebase-Analyse verwenden
