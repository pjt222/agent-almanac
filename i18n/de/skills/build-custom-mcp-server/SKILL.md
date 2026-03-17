---
name: build-custom-mcp-server
description: >
  Einen benutzerdefinierten MCP-Server (Model Context Protocol) erstellen, der
  domaenenspezifische Werkzeuge fuer KI-Assistenten bereitstellt. Umfasst
  Server-Implementierung in Node.js oder R, Werkzeugdefinitionen, Transport-
  Konfiguration und Tests mit Claude Code. Verwenden wenn benutzerdefinierte
  Funktionalitaet ueber mcptools hinaus bereitgestellt werden muss, beim
  Erstellen spezialisierter domaenenspezifischer KI-Integrationen oder beim
  Wrappen bestehender APIs oder Dienste als MCP-Werkzeuge.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: advanced
  language: multi
  tags: mcp, server, custom-tools, node-js, protocol
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Benutzerdefinierten MCP-Server bauen

Einen benutzerdefinierten MCP-Server erstellen, der domaenenspezifische Werkzeuge fuer KI-Assistenten bereitstellt.

## Wann verwenden

- Benutzerdefinierte Funktionalitaet fuer Claude Code oder Claude Desktop bereitstellen
- Spezialisierte Werkzeuge ueber mcptools hinaus erstellen
- Eine domaenenspezifische KI-Assistenten-Integration aufbauen
- Bestehende APIs oder Dienste als MCP-Werkzeuge wrappen

## Eingaben

- **Erforderlich**: Liste der bereitzustellenden Werkzeuge (Name, Beschreibung, Parameter, Verhalten)
- **Erforderlich**: Implementierungssprache (Node.js oder R)
- **Erforderlich**: Transporttyp (stdio oder HTTP)
- **Optional**: Authentifizierungsanforderungen
- **Optional**: Docker-Paketierungsbedarf

## Vorgehensweise

### Schritt 1: Werkzeugspezifikationen definieren

Vor dem Schreiben von Code jedes Werkzeug definieren:

```yaml
tools:
  - name: query_database
    description: Execute a read-only SQL query against the analysis database
    parameters:
      query:
        type: string
        description: SQL SELECT query to execute
        required: true
      limit:
        type: integer
        description: Maximum rows to return
        default: 100
    returns: JSON array of result rows

  - name: run_analysis
    description: Execute a predefined statistical analysis by name
    parameters:
      analysis_name:
        type: string
        description: Name of the analysis to run
        enum: [descriptive, regression, survival]
      dataset:
        type: string
        description: Dataset identifier
        required: true
```

**Erwartet:** Eine YAML- oder Markdown-Spezifikation fuer jedes Werkzeug mit Name, Beschreibung, Parametern (einschliesslich Typen, Standardwerten und Pflichtflags) und Rueckgabetyp, dokumentiert vor dem Schreiben von Code.

**Bei Fehler:** Wenn Werkzeugspezifikationen unklar sind, den Domaenenexperten befragen oder die bestehende API-Dokumentation pruefen, um Parametertypen und Rueckgabeformate zu bestimmen.

### Schritt 2: In Node.js implementieren (mit MCP SDK)

```javascript
// server.js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-analysis-server",
  version: "1.0.0",
});

// Define tools
server.tool(
  "query_database",
  "Execute a read-only SQL query against the analysis database",
  {
    query: z.string().describe("SQL SELECT query"),
    limit: z.number().default(100).describe("Max rows to return"),
  },
  async ({ query, limit }) => {
    // Validate read-only
    if (!/^\s*SELECT/i.test(query)) {
      return {
        content: [{ type: "text", text: "Error: Only SELECT queries allowed" }],
        isError: true,
      };
    }

    const results = await executeQuery(query, limit);
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  }
);

server.tool(
  "run_analysis",
  "Execute a predefined statistical analysis",
  {
    analysis_name: z.enum(["descriptive", "regression", "survival"]),
    dataset: z.string().describe("Dataset identifier"),
  },
  async ({ analysis_name, dataset }) => {
    const result = await runAnalysis(analysis_name, dataset);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// Start server with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

**Erwartet:** Eine funktionierende `server.js`-Datei, die das MCP SDK importiert, Werkzeuge mit Zod-Schemas definiert und ueber stdio-Transport verbindet. `node server.js` startet den Server ohne Fehler.

**Bei Fehler:** Sicherstellen, dass `@modelcontextprotocol/sdk` und `zod` installiert sind (`npm install`). Pruefen, dass die Import-Pfade zur SDK-Version passen (das SDK hat Exports zwischen Versionen umstrukturiert).

### Schritt 3: In R implementieren (mit mcptools)

```r
# server.R
library(mcptools)

# Register custom tools
mcp_tool(
  name = "query_database",
  description = "Execute a read-only SQL query",
  parameters = list(
    query = list(type = "string", description = "SQL SELECT query"),
    limit = list(type = "integer", description = "Max rows", default = 100)
  ),
  handler = function(query, limit = 100) {
    if (!grepl("^\\s*SELECT", query, ignore.case = TRUE)) {
      stop("Only SELECT queries allowed")
    }
    result <- DBI::dbGetQuery(con, paste(query, "LIMIT", limit))
    jsonlite::toJSON(result, auto_unbox = TRUE)
  }
)

# Start server
mcptools::mcp_server()
```

**Erwartet:** Eine funktionierende `server.R`-Datei, die benutzerdefinierte Werkzeuge mit `mcp_tool()` registriert und den Server mit `mcp_server()` startet. `Rscript server.R` startet den MCP-Server.

**Bei Fehler:** Sicherstellen, dass `mcptools` von GitHub installiert ist (`remotes::install_github("posit-dev/mcptools")`). Pruefen, dass die Handler-Funktionssignaturen zu den Parameterdefinitionen passen.

### Schritt 4: Projektstruktur einrichten

```
my-mcp-server/
├── package.json          # Node.js dependencies
├── server.js             # Server implementation
├── tools/                # Tool implementations
│   ├── database.js
│   └── analysis.js
├── test/                 # Tests
│   └── tools.test.js
├── Dockerfile            # Container packaging
└── README.md             # Setup instructions
```

**Erwartet:** Projektverzeichnis erstellt mit `server.js` (oder `server.R`), `package.json`, `tools/`-Verzeichnis fuer modulare Werkzeugimplementierungen und `test/`-Verzeichnis fuer Tests.

**Bei Fehler:** Wenn die Verzeichnisstruktur nicht zur Implementierungssprache passt, entsprechend anpassen. R-Server verwenden moeglicherweise `R/` statt `tools/` und `tests/testthat/` statt `test/`.

### Schritt 5: Den Server testen

**Manuelles Testen mit stdio**:

```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node server.js
```

**Bei Claude Code registrieren**:

```bash
claude mcp add my-server stdio "node" "/path/to/server.js"
```

**Werkzeuge erscheinen verifizieren**:

Eine Claude-Code-Sitzung starten und pruefen, dass benutzerdefinierte Werkzeuge aufgelistet und funktionsfaehig sind.

**Erwartet:** Der `tools/list` JSON-RPC-Aufruf gibt alle definierten Werkzeuge mit korrekten Namen und Schemas zurueck. `claude mcp list` zeigt den registrierten Server. Werkzeuge sind aus einer Claude-Code-Sitzung aufrufbar.

**Bei Fehler:** Wenn `tools/list` ein leeres Array zurueckgibt, wurden die Werkzeuge nicht vor `server.connect()` registriert. Wenn Claude Code den Server nicht finden kann, pruefen, dass der Befehlspfad in `claude mcp add` absolut ist und die Binaerdatei ausfuehrbar ist.

### Schritt 6: Fehlerbehandlung hinzufuegen

```javascript
server.tool("risky_operation", "...", schema, async (params) => {
  try {
    const result = await performOperation(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});
```

**Erwartet:** Jeder Werkzeug-Handler ist in try/catch gewrappt. Ungueltige Eingaben geben `isError: true` mit einer beschreibenden Nachricht zurueck, anstatt den Serverprozess zum Absturz zu bringen.

**Bei Fehler:** Wenn der Server bei schlechter Eingabe immer noch abstuerzt, pruefen, dass try/catch den gesamten Handler-Body einschliesslich aller asynchronen Operationen umschliesst. Sicherstellen, dass Promises innerhalb des try-Blocks awaited werden.

### Schritt 7: Fuer Distribution paketieren

Eine `package.json` mit einem bin-Eintrag erstellen:

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "bin": {
    "my-mcp-server": "./server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  }
}
```

Benutzer koennen dann installieren und konfigurieren:

```bash
npm install -g my-mcp-server
claude mcp add my-server stdio "my-mcp-server"
```

**Erwartet:** Eine `package.json` mit einem `bin`-Eintrag, der auf den Server-Einstiegspunkt zeigt. Benutzer koennen global mit `npm install -g` installieren und mit `claude mcp add` registrieren.

**Bei Fehler:** Wenn der bin-Eintrag nach globaler Installation nicht funktioniert, sicherstellen, dass `server.js` eine Shebang-Zeile hat (`#!/usr/bin/env node`) und als ausfuehrbar markiert ist. Pruefen, dass der Paketname nicht mit bestehenden npm-Paketen kollidiert.

## Validierung

- [ ] Server startet ohne Fehler
- [ ] `tools/list` gibt alle definierten Werkzeuge mit korrekten Schemas zurueck
- [ ] Jedes Werkzeug fuehrt korrekt mit gueltiger Eingabe aus
- [ ] Werkzeuge geben angemessene Fehler fuer ungueltige Eingaben zurueck
- [ ] Server funktioniert mit Claude Code ueber stdio-Transport
- [ ] Werkzeuge sind in Claude-Sitzungen auffindbar und nutzbar

## Haeufige Stolperfallen

- **Blockierende Operationen**: MCP-Server sollten Anfragen asynchron bearbeiten. Lang laufende Operationen blockieren andere Werkzeugaufrufe
- **Fehlende Fehlerbehandlung**: Unbehandelte Ausnahmen bringen den Server zum Absturz. Werkzeug-Handler immer in try/catch wrappen
- **Schema-Inkompatibilitaeten**: Werkzeug-Parameterschemas muessen exakt dem entsprechen, was der Handler erwartet
- **stdio-Pufferung**: Bei Verwendung von stdio-Transport sicherstellen, dass die Ausgabe geflusht wird. Node.js puffert stdout standardmaessig
- **Sicherheit**: MCP-Server haben den gleichen Zugriff wie der Prozess. Eingaben sorgfaeltig validieren, besonders fuer Shell-Befehle oder Datenbankabfragen

## Verwandte Skills

- `configure-mcp-server` — Den gebauten Server mit Clients verbinden
- `troubleshoot-mcp-connection` — Verbindungsprobleme debuggen
- `containerize-mcp-server` — Den Server in Docker paketieren
