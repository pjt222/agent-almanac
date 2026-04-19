---
name: analyze-codebase-for-mcp
locale: caveman-ultra
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

Scan codebase → fns, REST endpoints, CLI cmds, data access candidates → MCP tool exposure → structured tool spec doc.

## Use When

- Plan MCP server existing project → know what to expose
- Audit codebase pre-AI-tool-surface wrap
- Compare codebase capability vs MCP exposed
- Generate tool spec → hand to `scaffold-mcp-server`
- Evaluate 3rd-party lib worth wrapping

## In

- **Required**: Path to codebase root
- **Required**: Target lang(s) (TS, Python, R, Go)
- **Optional**: Existing MCP server code → gap analysis
- **Optional**: Domain focus ("data analysis", "file ops", "API integration")
- **Optional**: Max tools to recommend (default: 20)

## Do

### Step 1: Scan Structure

1.1. `Glob` → dir tree, src dirs:
   - `src/**/*.{ts,js,py,R,go,rs}` → src files
   - `**/routes/**`, `**/api/**`, `**/controllers/**` → endpoints
   - `**/cli/**`, `**/commands/**` → CLI entries
   - `**/package.json`, `**/setup.py`, `**/DESCRIPTION` → dep metadata

1.2. Categorize by role:
   - **Entry**: main files, route handlers, CLI cmds
   - **Core logic**: business fns, algos, data transformers
   - **Data access**: DB queries, file I/O, API clients
   - **Utilities**: helpers, formatters, validators

1.3. Count files, LOC, exported symbols → gauge size.

**→** Categorized inventory w/ role annotations.

**If err:** Too large (>10K files) → narrow via domain focus. No src found → verify root path + lang params.

### Step 2: Identify Fns + Endpoints

2.1. `Grep` exported fns + public APIs:
   - TS/JS: `export (async )?function`, `export default`, `module.exports`
   - Python: fns no `_` prefix, `@app.route`, `@router`
   - R: NAMESPACE or `#' @export` roxygen
   - Go: capitalized fn names (exported by convention)

2.2. Per candidate extract:
   - **Name**: fn/endpoint
   - **Signature**: params w/ types + defaults
   - **Return type**
   - **Docs**: docstrings, JSDoc, roxygen, godoc
   - **Location**: file path + line

2.3. REST APIs, also extract:
   - HTTP method + route pattern
   - Req body schema
   - Res shape
   - Auth reqs

2.4. Sort by potential utility (public, documented, well-typed first).

**→** 20-100 candidates w/ extracted metadata.

**If err:** Few candidates → broaden → include internal that could be public. Sparse docs → flag as risk.

### Step 3: Evaluate MCP Suitability

3.1. Per candidate → MCP tool criteria:

   - **In contract clarity**: params well-typed + documented? JSON Schema describable?
   - **Out predictability**: structured (JSON-serializable)? Consistent shape?
   - **Side effects**: modifies state (files, DB, external)? Must be labeled.
   - **Idempotency**: safe to retry? Non-idempotent → explicit warn.
   - **Exec time**: completes <30s? Long-running → async patterns.
   - **Err handling**: structured errs or silent fail?

3.2. Score 1-5:
   - **5**: Pure fn, typed I/O, documented, fast, no side effects
   - **4**: Well-typed, documented, minor side effects (logging)
   - **3**: Reasonable I/O, needs wrapping (raw objects)
   - **2**: Significant side effects or unclear, substantial adaptation
   - **1**: Not suitable no major refactor

3.3. Filter ≥3. Flag score-2 → "future candidates" needing refactor.

**→** Scored + filtered list w/ suitability rationale.

**If err:** Most <3 → codebase needs refactor pre-MCP. Doc gaps → recommend (add types, extract pure fns, wrap side effects).

### Step 4: Design Tool Specs

4.1. Per selected (≥3) draft spec:

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

4.2. Group logical categories ("Data Queries", "File Ops", "Analysis", "Config").

4.3. Identify deps between tools ("list_datasets" before "query_dataset").

4.4. Need wrappers?
   - Simplify complex param objects → flat in
   - Convert raw returns → structured text/JSON
   - Safety guards (read-only wrappers for DB fns)

**→** Complete YAML spec w/ categories, deps, wrapper notes.

**If err:** Ambiguous → Step 2 → more src detail. Param types uninferable → flag manual review.

### Step 5: Generate Tool Spec Doc

5.1. Final doc sections:
   - **Summary**: Codebase overview, lang, size, date
   - **Recommended Tools**: Full specs from Step 4, grouped
   - **Future Candidates**: Score-2 + refactor recs
   - **Excluded**: Score-1 + rationale
   - **Dependencies**: Tool dep graph
   - **Impl Notes**: Wrappers, auth, transport

5.2. Save `mcp-tool-spec.yml` (machine) + `mcp-tool-spec.md` (human).

5.3. Existing MCP server provided → gap analysis:
   - In spec, not impl
   - Impl, not in spec (stale)
   - Spec drift (impl diverges)

**→** Complete doc → consumable by `scaffold-mcp-server`.

**If err:** >200 tools → split modules w/ cross-refs. No candidates → "readiness assessment" doc w/ refactor recs.

## Check

- [ ] All src files scanned
- [ ] Candidates have names, signatures, returns
- [ ] Each candidate scored + rationale
- [ ] Tool specs complete param schemas w/ types
- [ ] Side effects explicit per tool
- [ ] Doc valid YAML (parseable)
- [ ] Tool names follow MCP (snake_case, unique)
- [ ] Categories + deps coherent
- [ ] Gap analysis if existing MCP provided
- [ ] Future candidates list refactor steps

## Traps

- **Too many tools**: AI works best 10-30 focused. Breadth > depth. Resist every public fn.
- **Ignore side effects**: "Just reads" + logs/cache = still side effects. Audit `Grep` file writes, network, DB.
- **Assume type safety**: Dynamic langs (Py, R, JS) may lack type annotations. Infer from usage, flag uncertainty.
- **Missing auth ctx**: Fns working in authed web req may fail via MCP no session. Check implicit session cookies, JWT, env creds.
- **Over-engineer wrappers**: 50-line wrapper → not good candidate. Prefer natural mapping.
- **Neglect err paths**: MCP must return structured errs. Untyped exceptions → err-handling wrappers.
- **Conflate internal + external APIs**: Internal helpers poor candidates. Focus external-consumption or boundary APIs.
- **Skip gap analysis**: Existing MCP provided → always compare. No gap analysis → duplicate work or stale tools.

## →

- `scaffold-mcp-server` — use out spec → working MCP
- `build-custom-mcp-server` — manual impl ref
- `configure-mcp-server` — connect to Claude Code/Desktop
- `troubleshoot-mcp-connection` — debug after deploy
- `review-software-architecture` — arch review for tool surface
- `security-audit-codebase` — audit pre-external exposure
