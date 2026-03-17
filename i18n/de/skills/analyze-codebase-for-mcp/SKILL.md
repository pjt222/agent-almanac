---
name: analyze-codebase-for-mcp
description: >
  Analysieren an arbitrary codebase to identify functions, APIs, and Datenquelles
  suitable for exposure as MCP tools, producing a tool specification document.
  Verwenden wenn planning an MCP server for an existing project, auditing a codebase
  vor wrapping it as an AI-accessible tool surface, comparing what a codebase
  can do versus what is already exposed via MCP, or generating a tool spec to
  hand off to scaffold-mcp-server.
license: MIT
allowed-tools: Read Grep Glob Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: advanced
  language: multi
  tags: mcp, analysis, tool-design, codebase
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Codebasis fuer MCP analysieren

Scannen a codebase to discover functions, REST endpoints, CLI commands, and data access patterns that are good candidates for MCP tool exposure, then produce a structured tool specification document.

## Wann verwenden

- Planning an MCP server for an existing project and need to know what to expose
- Auditing a codebase vor wrapping it as an AI-accessible tool surface
- Comparing what a codebase can do versus what is already exposed via MCP
- Generating a tool specification document to hand off to `scaffold-mcp-server`
- Evaluating whether a third-party library is worth wrapping as MCP tools

## Eingaben

- **Erforderlich**: Path to die Codebasis root directory
- **Erforderlich**: Target language(s) of die Codebasis (e.g., TypeScript, Python, R, Go)
- **Optional**: Existing MCP server code to compare gegen (gap analysis)
- **Optional**: Domain focus (e.g., "data analysis", "file operations", "API integration")
- **Optional**: Maximum number of tools to recommend (default: 20)

## Vorgehensweise

### Schritt 1: Scannen Codebase Structure

1.1. Use `Glob` to map das Verzeichnis tree, focusing on source directories:
   - `src/**/*.{ts,js,py,R,go,rs}` for Quelldateis
   - `**/routes/**`, `**/api/**`, `**/controllers/**` for endpoint definitions
   - `**/cli/**`, `**/commands/**` for CLI entry points
   - `**/package.json`, `**/setup.py`, `**/DESCRIPTION` for Abhaengigkeit metadata

1.2. Categorize files by role:
   - **Entry points**: main files, route handlers, CLI commands
   - **Core logic**: business logic functions, algorithms, data transformers
   - **Data access**: database queries, file I/O, API clients
   - **Utilities**: helpers, formatters, validators

1.3. Zaehlen total files, lines of code, and exported symbols to gauge project size.

**Erwartet:** A categorized file inventory with role annotations.

**Bei Fehler:** If die Codebasis is too large (>10,000 files), narrow the scan to specific directories or modules using the domain focus input. If no Quelldateis are found, verify the root path and language parameters.

### Schritt 2: Identifizieren Exposed Functions and Endpoints

2.1. Use `Grep` to find exported functions and oeffentliche APIs:
   - TypeScript/JavaScript: `export (async )?function`, `export default`, `module.exports`
   - Python: functions not prefixed with `_`, `@app.route`, `@router`
   - R: functions listed in NAMESPACE or `#' @export` roxygen tags
   - Go: capitalized function names (exported by convention)

2.2. Fuer jede candidate function, extract:
   - **Name**: function or endpoint name
   - **Signature**: parameters with types and defaults
   - **Zurueckgeben type**: what die Funktion produces
   - **Documentation**: docstrings, JSDoc, roxygen, godoc
   - **Location**: Dateipfad and line number

2.3. For REST APIs, zusaetzlich extract:
   - HTTP method and route pattern
   - Request body schema
   - Response shape
   - Authentication requirements

2.4. Erstellen a candidate list sorted by potential utility (public, documented, well-typed functions first).

**Erwartet:** A list of 20-100 candidate functions/endpoints with extracted metadata.

**Bei Fehler:** If few candidates are found, broaden the search to include internal functions that could be made public. If documentation is sparse, flag this as a risk in die Ausgabe.

### Schritt 3: Bewerten MCP Suitability

3.1. Fuer jede candidate, assess gegen MCP tool criteria:

   - **Input contract clarity**: Are parameters well-typed and documented? Can they be described in a JSON Schema?
   - **Output predictability**: Does die Funktion return structured data (JSON-serializable)? Is the return shape consistent?
   - **Side effects**: Does die Funktion modify state (files, database, external services)? Side effects muss clearly labeled.
   - **Idempotency**: Is the operation safe to retry? Non-idempotent tools need explicit warnings.
   - **Execution time**: Will it complete innerhalb a reasonable timeout (< 30 seconds)? Long-running operations need async patterns.
   - **Error handling**: Does it throw structured errors or fail silently?

3.2. Score each candidate on a 1-5 scale:
   - **5**: Pure function, typed I/O, documented, fast, no Seiteneffekts
   - **4**: Well-typed, documented, minor Seiteneffekts (e.g., logging)
   - **3**: Reasonable I/O contract but needs wrapping (e.g., returns raw objects)
   - **2**: Significant Seiteneffekts or unclear contract, needs substantial adaptation
   - **1**: Not suitable ohne major refactoring

3.3. Filtern candidates to those scoring 3 or ueber. Flag score-2 items as "future candidates" requiring refactoring.

**Erwartet:** A scored and filtered candidate list with suitability rationale for each.

**Bei Fehler:** If most candidates score unter 3, die Codebasis may need refactoring vor MCP exposure. Dokumentieren the gaps and recommend specific improvements (add types, extract pure functions, wrap Seiteneffekts).

### Schritt 4: Entwerfen Tool Specifications

4.1. Fuer jede selected candidate (score >= 3), draft a tool specification:

```yaml
- name: tool_name
  description: >
    One-line description of what the tool does.
  source_function: module.function_name
  source_file: src/path/to/file.ts:42
  parameters:
    param_name:
      type: string | number | boolean | object | array
      description: What this parameter controls
      required: true | false
      default: value_if_optional
  returns:
    type: string | object | array
    description: What the tool returns
  side_effects:
    - description of any side effect
  estimated_latency: fast | medium | slow
  suitability_score: 5
```

4.2. Group tools into logical categories (e.g., "Data Queries", "File Operations", "Analysis", "Configuration").

4.3. Identifizieren Abhaengigkeiten zwischen tools (e.g., "list_datasets" sollte called vor "query_dataset").

4.4. Bestimmen if any tools need wrappers to:
   - Simplify complex parameter objects into flat inputs
   - Konvertieren raw return values to structured text or JSON
   - Hinzufuegen safety guards (e.g., read-only wrappers for database functions)

**Erwartet:** A complete YAML tool specification with categories, Abhaengigkeiten, and wrapper notes.

**Bei Fehler:** If tool specifications are ambiguous, revisit Step 2 to extract more detail from Quellcode. If parameter types cannot be inferred, flag for manual review.

### Schritt 5: Generieren Tool Spec Document

5.1. Schreiben the final specification document with these sections:
   - **Summary**: Codebase overview, language, size, and analysis date
   - **Recommended Tools**: Full specifications from Step 4, grouped by category
   - **Future Candidates**: Score-2 items with refactoring recommendations
   - **Excluded Items**: Score-1 items with exclusion rationale
   - **Dependencies**: Tool Abhaengigkeit graph
   - **Implementation Notes**: Wrapper requirements, Authentifizierung needs, transport recommendations

5.2. Speichern as `mcp-tool-spec.yml` (machine-readable) and optionally `mcp-tool-spec.md` (human-readable summary).

5.3. If an existing MCP server was provided, include a gap analysis section:
   - Tools in the spec but not yet implemented
   - Implemented tools not in the spec (possibly stale)
   - Tools with specification drift (implementation diverges from spec)

**Erwartet:** A complete tool specification document ready for consumption by `scaffold-mcp-server`.

**Bei Fehler:** If the document exceeds reasonable size (>200 tools), split into modules with cross-references. If die Codebasis has no suitable candidates, produce a "readiness assessment" document with refactoring recommendations stattdessen.

## Validierung

- [ ] All Quelldateis in das Ziel codebase were scanned
- [ ] Candidate functions have extracted names, signatures, and return types
- [ ] Each candidate has a suitability score with written rationale
- [ ] Tool specifications include complete parameter schemas with types
- [ ] Side effects are explicitly documented for every tool
- [ ] The output document is valid YAML (parseable by any YAML library)
- [ ] Tool names follow MCP conventions (snake_case, descriptive, unique)
- [ ] Categories and Abhaengigkeiten form a coherent tool surface
- [ ] Gap analysis is included when an existing MCP server was provided
- [ ] Future candidates section lists refactoring steps needed for score-2 items

## Haeufige Stolperfallen

- **Exposing too many tools**: AI assistants work best with 10-30 focused tools. Priorisieren breadth of capability over depth. Resist exposing every public function.
- **Ignoring Seiteneffekts**: A function that "just reads" but also writes to a log or cache still has Seiteneffekts. Audit carefully with `Grep` for file writes, network calls, and database mutations.
- **Assuming type safety**: Dynamic languages (Python, R, JavaScript) may have functions with no type annotations. Infer types from usage patterns and tests, but flag uncertainty in the spec.
- **Missing Authentifizierung context**: Functions that work in an authenticated web request may fail when called via MCP ohne session context. Pruefen auf implicit auth Abhaengigkeiten wie z.B. session cookies, JWT tokens, or environment-injected Zugangsdaten.
- **Over-engineering wrappers**: If a function needs a 50-line wrapper to be MCP-compatible, it may not be a good candidate. Bevorzugen functions that map naturally to tool interfaces.
- **Neglecting error paths**: MCP tools must return structured errors. Functions that throw untyped exceptions need error-handling wrappers.
- **Conflating internal and external APIs**: Internal helper functions called by other internal code are poor MCP candidates. Fokussieren auf functions designed for external consumption or clear boundary APIs.
- **Skipping the gap analysis**: If an existing MCP server is provided, always compare the spec gegen current implementation. Without gap analysis, you risk duplicating work or missing stale tools.

## Verwandte Skills

- `scaffold-mcp-server` - use die Ausgabe spec to generate a working MCP server
- `build-custom-mcp-server` - manual server implementation reference
- `configure-mcp-server` - connect das Ergebnising server to Claude Code/Desktop
- `troubleshoot-mcp-connection` - debug connectivity nach deploying der Server
- `review-software-architecture` - architecture review for tool surface design
- `security-audit-codebase` - security audit vor exposing functions externally
