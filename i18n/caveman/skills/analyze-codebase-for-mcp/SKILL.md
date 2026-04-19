---
name: analyze-codebase-for-mcp
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Analyze an arbitrary codebase to identify functions, APIs, and data sources
  suitable for exposure as MCP tools, producing a tool specification document.
  Use when planning an MCP server for an existing project, auditing a codebase
  before wrapping it as an AI-accessible tool surface, comparing what a codebase
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
---

# Analyze Codebase for MCP

Scan codebase to discover functions, REST endpoints, CLI commands, data access patterns. Good candidates for MCP tool exposure. Produce structured tool specification document.

## When Use

- Planning MCP server for existing project, need to know what to expose
- Auditing codebase before wrapping as AI-accessible tool surface
- Comparing what codebase can do versus what already exposed via MCP
- Generating tool specification document to hand off to `scaffold-mcp-server`
- Evaluating whether third-party library worth wrapping as MCP tools

## Inputs

- **Required**: Path to codebase root directory
- **Required**: Target language(s) of codebase (e.g., TypeScript, Python, R, Go)
- **Optional**: Existing MCP server code to compare against (gap analysis)
- **Optional**: Domain focus (e.g., "data analysis", "file operations", "API integration")
- **Optional**: Maximum number of tools to recommend (default: 20)

## Steps

### Step 1: Scan Codebase Structure

1.1. Use `Glob` to map directory tree, focusing on source directories:
   - `src/**/*.{ts,js,py,R,go,rs}` for source files
   - `**/routes/**`, `**/api/**`, `**/controllers/**` for endpoint definitions
   - `**/cli/**`, `**/commands/**` for CLI entry points
   - `**/package.json`, `**/setup.py`, `**/DESCRIPTION` for dependency metadata

1.2. Categorize files by role:
   - **Entry points**: main files, route handlers, CLI commands
   - **Core logic**: business logic functions, algorithms, data transformers
   - **Data access**: database queries, file I/O, API clients
   - **Utilities**: helpers, formatters, validators

1.3. Count total files, lines of code, exported symbols to gauge project size.

**Got:** Categorized file inventory with role annotations.

**If fail:** Codebase too large (>10,000 files)? Narrow scan to specific directories or modules using domain focus input. No source files found? Verify root path and language parameters.

### Step 2: Identify Exposed Functions and Endpoints

2.1. Use `Grep` to find exported functions and public APIs:
   - TypeScript/JavaScript: `export (async )?function`, `export default`, `module.exports`
   - Python: functions not prefixed with `_`, `@app.route`, `@router`
   - R: functions listed in NAMESPACE or `#' @export` roxygen tags
   - Go: capitalized function names (exported by convention)

2.2. For each candidate function, extract:
   - **Name**: function or endpoint name
   - **Signature**: parameters with types and defaults
   - **Return type**: what function produces
   - **Documentation**: docstrings, JSDoc, roxygen, godoc
   - **Location**: file path and line number

2.3. For REST APIs, additionally extract:
   - HTTP method and route pattern
   - Request body schema
   - Response shape
   - Authentication requirements

2.4. Build candidate list sorted by potential utility (public, documented, well-typed functions first).

**Got:** List of 20-100 candidate functions/endpoints with extracted metadata.

**If fail:** Few candidates found? Broaden search to include internal functions could be made public. Documentation sparse? Flag as risk in output.

### Step 3: Evaluate MCP Suitability

3.1. For each candidate, assess against MCP tool criteria:

   - **Input contract clarity**: Parameters well-typed and documented? Can they be described in JSON Schema?
   - **Output predictability**: Function returns structured data (JSON-serializable)? Return shape consistent?
   - **Side effects**: Function modifies state (files, database, external services)? Side effects must be clearly labeled.
   - **Idempotency**: Operation safe to retry? Non-idempotent tools need explicit warnings.
   - **Execution time**: Will complete within reasonable timeout (< 30 seconds)? Long-running operations need async patterns.
   - **Error handling**: Throws structured errors or fails silently?

3.2. Score each candidate on 1-5 scale:
   - **5**: Pure function, typed I/O, documented, fast, no side effects
   - **4**: Well-typed, documented, minor side effects (e.g., logging)
   - **3**: Reasonable I/O contract but needs wrapping (e.g., returns raw objects)
   - **2**: Significant side effects or unclear contract, needs substantial adaptation
   - **1**: Not suitable without major refactoring

3.3. Filter candidates to those scoring 3 or above. Flag score-2 items as "future candidates" requiring refactoring.

**Got:** Scored and filtered candidate list with suitability rationale for each.

**If fail:** Most candidates score below 3? Codebase may need refactoring before MCP exposure. Document gaps and recommend specific improvements (add types, extract pure functions, wrap side effects).

### Step 4: Design Tool Specifications

4.1. For each selected candidate (score >= 3), draft tool specification:

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

4.3. Identify dependencies between tools (e.g., "list_datasets" should be called before "query_dataset").

4.4. Determine if any tools need wrappers to:
   - Simplify complex parameter objects into flat inputs
   - Convert raw return values to structured text or JSON
   - Add safety guards (e.g., read-only wrappers for database functions)

**Got:** Complete YAML tool specification with categories, dependencies, wrapper notes.

**If fail:** Tool specifications ambiguous? Revisit Step 2 to extract more detail from source code. Parameter types cannot be inferred? Flag for manual review.

### Step 5: Generate Tool Spec Document

5.1. Write final specification document with these sections:
   - **Summary**: Codebase overview, language, size, analysis date
   - **Recommended Tools**: Full specifications from Step 4, grouped by category
   - **Future Candidates**: Score-2 items with refactoring recommendations
   - **Excluded Items**: Score-1 items with exclusion rationale
   - **Dependencies**: Tool dependency graph
   - **Implementation Notes**: Wrapper requirements, authentication needs, transport recommendations

5.2. Save as `mcp-tool-spec.yml` (machine-readable) and optionally `mcp-tool-spec.md` (human-readable summary).

5.3. Existing MCP server provided? Include gap analysis section:
   - Tools in spec but not yet implemented
   - Implemented tools not in spec (possibly stale)
   - Tools with specification drift (implementation diverges from spec)

**Got:** Complete tool specification document ready for consumption by `scaffold-mcp-server`.

**If fail:** Document exceeds reasonable size (>200 tools)? Split into modules with cross-references. Codebase has no suitable candidates? Produce "readiness assessment" document with refactoring recommendations instead.

## Checks

- [ ] All source files in target codebase scanned
- [ ] Candidate functions have extracted names, signatures, return types
- [ ] Each candidate has suitability score with written rationale
- [ ] Tool specifications include complete parameter schemas with types
- [ ] Side effects explicitly documented for every tool
- [ ] Output document is valid YAML (parseable by any YAML library)
- [ ] Tool names follow MCP conventions (snake_case, descriptive, unique)
- [ ] Categories and dependencies form coherent tool surface
- [ ] Gap analysis included when existing MCP server provided
- [ ] Future candidates section lists refactoring steps needed for score-2 items

## Pitfalls

- **Exposing too many tools**: AI assistants work best with 10-30 focused tools. Prioritize breadth of capability over depth. Resist exposing every public function.
- **Ignoring side effects**: Function that "just reads" but also writes to log or cache still has side effects. Audit careful with `Grep` for file writes, network calls, database mutations.
- **Assuming type safety**: Dynamic languages (Python, R, JavaScript) may have functions with no type annotations. Infer types from usage patterns and tests, but flag uncertainty in spec.
- **Missing authentication context**: Functions work in authenticated web request may fail when called via MCP without session context. Check for implicit auth dependencies such as session cookies, JWT tokens, environment-injected credentials.
- **Over-engineering wrappers**: Function needs 50-line wrapper to be MCP-compatible? May not be good candidate. Prefer functions map naturally to tool interfaces.
- **Neglecting error paths**: MCP tools must return structured errors. Functions throw untyped exceptions need error-handling wrappers.
- **Conflating internal and external APIs**: Internal helper functions called by other internal code are poor MCP candidates. Focus on functions designed for external consumption or clear boundary APIs.
- **Skipping gap analysis**: Existing MCP server provided? Always compare spec against current implementation. Without gap analysis, risk duplicating work or missing stale tools.

## See Also

- `scaffold-mcp-server` - use output spec to generate working MCP server
- `build-custom-mcp-server` - manual server implementation reference
- `configure-mcp-server` - connect resulting server to Claude Code/Desktop
- `troubleshoot-mcp-connection` - debug connectivity after deploying server
- `review-software-architecture` - architecture review for tool surface design
- `security-audit-codebase` - security audit before exposing functions externally
