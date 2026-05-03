---
name: transmute
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Transform a single function, module, or data structure from one form to
  another while preserving its essential behavior. Lighter-weight than the full
  athanor cycle, suitable for targeted conversions where the input and output
  forms are well-understood. Use when converting a function between languages,
  shifting a module between paradigms, migrating an API consumer to a new
  version, converting data formats, or replacing a dependency — when the
  transformation scope is a single function, class, or module rather than a
  full system.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: intermediate
  language: multi
  tags: alchemy, transmutation, conversion, refactoring, transformation, targeted
---

# Transmute

Transform specific piece of code or data from one form to another — language translation, paradigm shift, format conversion, or API migration — while preserving essential behavior and semantics.

## When Use

- Convert function from one language to another (Python to R, JavaScript to TypeScript)
- Shift module from one paradigm (class-based to functional, callbacks to async/await)
- Migrate API consumer from v1 to v2 of external service
- Convert data between formats (CSV to Parquet, REST to GraphQL schema)
- Replace dependency with equivalent (moment.js to date-fns, jQuery to vanilla JS)
- Transformation scope is single function, class, or module (not full system)

## Inputs

- **Required**: Source material (file path, function name, or data sample)
- **Required**: Target form (language, paradigm, format, or API version)
- **Optional**: Behavioral contract (tests, type signatures, or expected I/O pairs)
- **Optional**: Constraints (must maintain backward compatibility, performance budget)

## Steps

### Step 1: Analyze Source Material

Understand exact what source does before attempting transformation.

1. Read the source completely — every branch, edge case, and error path
2. Identify the **behavioral contract**:
   - What inputs does it accept? (types, ranges, edge cases)
   - What outputs does it produce? (return values, side effects, error signals)
   - What invariants does it maintain? (ordering, uniqueness, referential integrity)
3. Catalog dependencies: what does the source import, call, or rely on?
4. If tests exist, read them to understand expected behavior
5. If no tests exist, write behavioral characterization tests before transmuting

**Got:** Complete understanding of what source does (not how it does it). Behavioral contract explicit and testable.

**If fail:** Source too complex for single transmute? Consider breaking into smaller pieces or escalating to full `athanor` procedure. Behavior ambiguous? Ask for clarification rather than guessing.

### Step 2: Map Source to Target Form

Design transformation mapping.

1. For each element in the source, identify the target equivalent:
   - Language constructs: loops → map/filter, classes → closures, etc.
   - API calls: old endpoint → new endpoint, request/response shape changes
   - Data types: data frame columns → schema fields, nested JSON → flat tables
2. Identify elements with **no direct equivalent**:
   - Source features missing in target (e.g., pattern matching in a language without it)
   - Target idioms that don't exist in source (e.g., R's vectorization vs. Python loops)
3. For each gap, choose an adaptation strategy:
   - Emulate: reproduce the behavior with target-native constructs
   - Simplify: if the source construct was a workaround, use the target's native solution
   - Document: if behavior changes slightly, note the difference explicitly
4. Write the **transformation map**: source element → target element, for every piece

**Got:** Complete mapping where every source element has target destination. Gaps identified and adaptation strategies chosen.

**If fail:** Too many elements lack direct equivalents? Transformation may be inappropriate (e.g., transmuting highly object-oriented design into language without classes). Reconsider target form or escalate to `athanor`.

### Step 3: Execute Transformation

Write target form following map.

1. Create the target file(s) with appropriate structure and boilerplate
2. Transmute each element following the map from Step 2:
   - Preserve the behavioral contract — same inputs produce same outputs
   - Use target-native idioms rather than literal translations
   - Maintain or improve error handling
3. Handle dependencies:
   - Replace source dependencies with target equivalents
   - If a dependency has no equivalent, implement a minimal adapter
4. Add inline comments only where the transformation was non-obvious

**Got:** Complete target implementation follows transformation map. Code reads like written native in target form, not mechanical translated.

**If fail:** Specific element resists transformation? Isolate it. Transform everything else first, then tackle resistant element with focused attention. Truly cannot be transmuted? Document why, provide workaround.

### Step 4: Verify Behavioral Equivalence

Confirm transmuted form preserves original's behavior.

1. Run the behavioral contract tests against the target implementation
2. For each test case, verify:
   - Same inputs → same outputs (within acceptable tolerance for numeric conversions)
   - Same error conditions → equivalent error signals
   - Side effects (if any) are preserved or documented as changed
3. Check edge cases explicitly:
   - Null/NA/undefined handling
   - Empty collections
   - Boundary values (max int, empty string, zero-length arrays)
4. If the target form adds capabilities (e.g., type safety), verify those too

**Got:** All behavioral contract tests pass. Edge cases handled equivalent. Any behavioral differences documented and intentional.

**If fail:** Tests fail? Diff source and target behavior to find divergence. Fix target to match source contract. Divergence intentional (e.g., fixing bug in original)? Document explicit.

## Checks Checklist

- [ ] Source material full analyzed with explicit behavioral contract
- [ ] Transformation map covers every source element
- [ ] Gaps identified with adaptation strategies documented
- [ ] Target implementation uses native idioms (not literal translation)
- [ ] All behavioral contract tests pass against target
- [ ] Edge cases verified (null, empty, boundary values)
- [ ] Dependencies resolved with target equivalents
- [ ] Any behavioral differences documented and intentional

## Pitfalls

- **Literal translation**: Writing Python-in-R or Java-in-JavaScript instead of using target idioms. Result should look native
- **Skip behavioral tests**: Transmuting without tests means you cannot verify equivalence. Write characterization tests first
- **Ignore edge cases**: Happy path transmutes easy; edge cases are where bugs hide
- **Over-engineer adapter**: Dependency needs 200-line adapter? Transmutation scope too large
- **Transmute comments verbatim**: Comments should explain target code, not echo source. Rewrite them

## See Also

- `athanor` — Full four-stage transformation for systems too large for single transmute
- `chrysopoeia` — Optimizing transmuted code for maximum value extraction
- `review-software-architecture` — Post-transmutation architecture review for larger conversions
- `serialize-data-formats` — Specialized data format conversion procedures
