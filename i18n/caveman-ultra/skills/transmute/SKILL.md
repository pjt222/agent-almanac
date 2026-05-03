---
name: transmute
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Transform single fn, module, data structure → another form preserving
  essential behavior. Lighter-weight than full athanor cycle, suitable
  for targeted conversions where in/out forms well-understood. Use →
  convert fn between langs, shift module between paradigms, migrate API
  consumer to new ver, convert data formats, replace dep — when scope =
  single fn, class, module not full system.
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

Transform specific code/data → another form (lang translation, paradigm shift, format conversion, API migration) preserving essential behavior + semantics.

## Use When

- Convert fn between langs (Python → R, JS → TS)
- Shift module between paradigms (class-based → functional, callbacks → async/await)
- Migrate API consumer v1 → v2
- Convert data formats (CSV → Parquet, REST → GraphQL schema)
- Replace dep w/ equiv (moment.js → date-fns, jQuery → vanilla JS)
- Scope = single fn, class, module (NOT full system)

## In

- **Required**: Source (file path, fn name, data sample)
- **Required**: Target form (lang, paradigm, format, API ver)
- **Optional**: Behavioral contract (tests, type signatures, expected I/O pairs)
- **Optional**: Constraints (backward compat, perf budget)

## Do

### Step 1: Analyze Source

Understand exactly what src does before transforming.

1. Read src completely — every branch, edge case, err path
2. ID **behavioral contract**:
   - What ins accepts? (types, ranges, edge cases)
   - What outs produces? (return values, side effects, err signals)
   - What invariants maintains? (ordering, uniqueness, ref integrity)
3. Catalog deps: what src imports, calls, relies on?
4. Tests exist → read for expected behavior
5. No tests → write behavioral characterization tests before transmuting

**Got:** Complete understanding of what src does (not how). Behavioral contract explicit + testable.

**If err:** Src too complex for single transmute → break into smaller pieces | escalate to full `athanor` proc. Behavior ambiguous → ask clarification vs guess.

### Step 2: Map Source → Target

Design transformation mapping.

1. Per src element, ID target equivalent:
   - Lang constructs: loops → map/filter, classes → closures
   - API calls: old endpoint → new, req/res shape changes
   - Data types: dataframe cols → schema fields, nested JSON → flat tables
2. ID elements w/ **no direct equiv**:
   - Src features missing in target (pattern matching in lang w/o it)
   - Target idioms not in src (R vectorization vs Python loops)
3. Per gap, choose adaptation strategy:
   - Emulate: reproduce behavior w/ target-native constructs
   - Simplify: src construct was workaround → use target's native solution
   - Document: behavior changes slightly → note explicit
4. Write **transformation map**: src → target per piece

**Got:** Complete mapping where every src element has target dest. Gaps ID'd + adaptation chosen.

**If err:** Too many no direct equivs → transformation may be inappropriate (highly OO design → lang w/o classes). Reconsider target | escalate `athanor`.

### Step 3: Execute

Write target form following map.

1. Create target file(s) w/ structure + boilerplate
2. Transmute each element per Step 2 map:
   - Preserve behavioral contract — same ins → same outs
   - Use target-native idioms not literal translations
   - Maintain | improve err handling
3. Handle deps:
   - Replace src deps w/ target equivs
   - No equiv → impl minimal adapter
4. Inline comments ONLY where transformation non-obvious

**Got:** Complete target impl following map. Reads like written natively in target, not mechanically translated.

**If err:** Specific element resists → isolate. Transform everything else first, tackle resistant w/ focused attention. Truly can't be transmuted → doc why + workaround.

### Step 4: Verify Behavioral Equivalence

Confirm transmuted preserves original's behavior.

1. Run behavioral contract tests vs target impl
2. Per test:
   - Same ins → same outs (within tolerance for numeric conversions)
   - Same err conditions → equiv err signals
   - Side effects (if any) preserved | doc'd as changed
3. Check edge cases explicit:
   - Null/NA/undefined handling
   - Empty collections
   - Boundary values (max int, empty string, zero-length arrays)
4. Target adds capabilities (type safety) → verify those too

**Got:** All behavioral contract tests pass. Edge cases handled equivalent. Behavioral diffs doc'd + intentional.

**If err:** Tests fail → diff src vs target behavior, find divergence. Fix target → match src contract. Divergence intentional (fixing src bug) → doc explicit.

## Check

- [ ] Src fully analyzed w/ explicit behavioral contract
- [ ] Transformation map covers every src element
- [ ] Gaps ID'd w/ adaptation strategies doc'd
- [ ] Target uses native idioms (not literal translation)
- [ ] All behavioral contract tests pass vs target
- [ ] Edge cases verified (null, empty, boundary)
- [ ] Deps resolved w/ target equivs
- [ ] Behavioral diffs doc'd + intentional

## Traps

- **Literal translation**: Python-in-R | Java-in-JS vs using target idioms. Result should look native.
- **Skip behavioral tests**: Transmute w/o tests → can't verify equivalence. Write characterization tests first.
- **Ignore edge cases**: Happy path transmutes easy; edge cases hide bugs.
- **Over-engineer adapter**: Dep needs 200-line adapter → scope too large.
- **Transmute comments verbatim**: Comments explain target code, not echo src. Rewrite.

## →

- `athanor` — Full 4-stage transformation for systems too large for single transmute
- `chrysopoeia` — Optimizing transmuted code for max value extraction
- `review-software-architecture` — Post-transmutation arch review for larger conversions
- `serialize-data-formats` — Specialized data format conversion procedures
