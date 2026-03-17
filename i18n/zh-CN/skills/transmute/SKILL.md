---
name: transmute
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
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Transmute

Transform a specific piece of code or data from one form to another — language translation, paradigm shift, format conversion, or API migration — while preserving essential behavior and semantics.

## 适用场景

- Converting a function from one language to another (Python to R, JavaScript to TypeScript)
- Shifting a module from one paradigm (class-based to functional, callbacks to async/await)
- Migrating an API consumer from v1 to v2 of an external service
- Converting data between formats (CSV to Parquet, REST to GraphQL schema)
- Replacing a dependency with an equivalent (moment.js to date-fns, jQuery to vanilla JS)
- When the transformation scope is a single function, class, or module (not a full system)

## 输入

- **必需**: Source material (file path, function name, or data sample)
- **必需**: Target form (language, paradigm, format, or API version)
- **可选**: Behavioral contract (tests, type signatures, or expected I/O pairs)
- **可选**: Constraints (must maintain backward compatibility, performance budget)

## 步骤

### 第 1 步：Analyze the Source Material

Understand exactly what the source does before attempting transformation.

1. Read the source completely — every branch, edge case, and error path
2. Identify the **behavioral contract**:
   - What inputs does it accept? (types, ranges, edge cases)
   - What outputs does it produce? (return values, side effects, error signals)
   - What invariants does it maintain? (ordering, uniqueness, referential integrity)
3. Catalog dependencies: what does the source import, call, or rely on?
4. If tests exist, read them to understand expected behavior
5. If no tests exist, write behavioral characterization tests before transmuting

**预期结果：** A complete understanding of what the source does (not how it does it). The behavioral contract is explicit and testable.

**失败处理：** If the source is too complex for a single transmute, consider breaking it into smaller pieces or escalating to the full `athanor` procedure. If behavior is ambiguous, ask for clarification rather than guessing.

### 第 2 步：Map Source to Target Form

Design the transformation mapping.

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

**预期结果：** A complete mapping where every source element has a target destination. Gaps are identified and adaptation strategies chosen.

**失败处理：** If too many elements lack direct equivalents, the transformation may be inappropriate (e.g., transmuting a highly object-oriented design into a language without classes). Reconsider the target form or escalate to `athanor`.

### 第 3 步：Execute the Transformation

Write the target form following the map.

1. Create the target file(s) with appropriate structure and boilerplate
2. Transmute each element following the map from Step 2:
   - Preserve the behavioral contract — same inputs produce same outputs
   - Use target-native idioms rather than literal translations
   - Maintain or improve error handling
3. Handle dependencies:
   - Replace source dependencies with target equivalents
   - If a dependency has no equivalent, implement a minimal adapter
4. Add inline comments only where the transformation was non-obvious

**预期结果：** A complete target implementation that follows the transformation map. The code reads like it was written natively in the target form, not mechanically translated.

**失败处理：** If a specific element resists transformation, isolate it. Transform everything else first, then tackle the resistant element with focused attention. If it truly cannot be transmuted, document why and provide a workaround.

### 第 4 步：Verify Behavioral Equivalence

Confirm the transmuted form preserves the original's behavior.

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

**预期结果：** All behavioral contract tests pass. Edge cases are handled equivalently. Any behavioral differences are documented and intentional.

**失败处理：** If tests fail, diff the source and target behavior to find the divergence. Fix the target to match the source contract. If the divergence is intentional (e.g., fixing a bug in the original), document it explicitly.

## Validation Checklist

- [ ] Source material fully analyzed with explicit behavioral contract
- [ ] Transformation map covers every source element
- [ ] Gaps identified with adaptation strategies documented
- [ ] Target implementation uses native idioms (not literal translation)
- [ ] All behavioral contract tests pass against target
- [ ] Edge cases verified (null, empty, boundary values)
- [ ] Dependencies resolved with target equivalents
- [ ] Any behavioral differences documented and intentional

## 常见问题

- **Literal translation**: Writing Python-in-R or Java-in-JavaScript instead of using target idioms. The result should look native
- **Skipping behavioral tests**: Transmuting without tests means you can't verify equivalence. Write characterization tests first
- **Ignoring edge cases**: The happy path transmutes easily; edge cases are where bugs hide
- **Over-engineering the adapter**: If a dependency needs a 200-line adapter, the transmutation scope is too large
- **Transmuting comments verbatim**: Comments should explain the target code, not echo the source. Rewrite them

## 相关技能

- `athanor` — Full four-stage transformation for systems too large for a single transmute
- `chrysopoeia` — Optimizing transmuted code for maximum value extraction
- `review-software-architecture` — Post-transmutation architecture review for larger conversions
- `serialize-data-formats` — Specialized data format conversion procedures
