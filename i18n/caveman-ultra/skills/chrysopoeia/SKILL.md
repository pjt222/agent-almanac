---
name: chrysopoeia
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Extract maximum value from existing code — performance optimization, API
  surface refinement, and dead weight elimination. The art of turning base code
  into gold through systematic identification and amplification of value-bearing
  patterns. Use when optimizing a working but sluggish codebase, refining an
  API surface that has accumulated cruft, reducing bundle size or memory
  footprint, or preparing code for open-source release — when code works
  correctly but doesn't shine and needs polish rather than a full rewrite.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: intermediate
  language: multi
  tags: alchemy, optimization, value-extraction, performance, refinement, gold
---

# Chrysopoeia

Pull max value from code → find gold (high-val), lead (heavy), dross (dead). Amplify gold, transmute lead, purge dross.

## Use When

- Working code sluggish → optimize perf
- API surface crufty → refine
- Bundle/mem/startup too big → shrink
- Prep open-source release → extract core
- Code works but dull → polish, not rewrite

## In

- **Required**: Codebase/module (paths)
- **Required**: Value metric (perf, API clarity, bundle, readability)
- **Optional**: Profiling data/benchmarks
- **Optional**: Target (e.g., "-40% bundle", "sub-100ms res")
- **Optional**: Constraints (public API frozen, back-compat req)

## Do

### Step 1: Assay — Classify

Classify every element by value.

1. Define value metric from In
2. Inventory elements (fns, modules, exports, deps)
3. Classify each:

```
Value Classification:
+--------+---------------------------------------------------------+
| Gold   | High value, well-designed. Amplify and protect.         |
| Silver | Good value, minor imperfections. Polish.                |
| Lead   | Functional but heavy — poor performance, complex API.   |
|        | Transmute into something lighter.                       |
| Dross  | Dead code, unused exports, vestigial features.          |
|        | Remove entirely.                                        |
+--------+---------------------------------------------------------+
```

4. Perf work → profile first:
   - Hot paths (time sink)
   - Cold paths (rare → maybe dross)
   - Mem alloc patterns
5. Produce **Assay Report**: element-by-element w/ evidence

**→** Every element classified w/ evidence. Gold marked protect. Lead ranked by impact.

**If err:** No profiler → static analysis: cyclomatic complexity, dep count, size as proxies. Huge codebase → critical path first.

### Step 2: Refine — Amplify Gold

Protect + enhance highest-value elements.

1. Each Gold:
   - Full tests (most valuable asset)
   - Clear interface docs
   - Extractable as reusable module?
2. Each Silver:
   - Targeted improvements (naming, types, minor opt)
   - Tests → Gold-level
   - Resolve minor smells, no restructure
3. Do NOT modify Gold/Silver behavior → polish only

**→** Gold + Silver better tested, documented, protected. No behavior change, quality up.

**If err:** "Gold" reveals hidden problems → reclassify. Honest > protect flawed.

### Step 3: Transmute — Lead → Gold

Convert heavy elements to optimized equivalents.

1. Rank Lead by impact (highest resource first)
2. Each Lead → pick strategy:
   - **Algo opt**: O(n^2) → O(n log n), kill redundant compute
   - **Cache/memoize**: Store expensive res req'd repeat
   - **Lazy eval**: Defer compute until needed
   - **Batch proc**: Many small ops → fewer big ones
   - **Simplify**: Lower cyclomatic, flatten nesting
3. Apply + measure:
   - Before/after benchmarks (perf)
   - Before/after line counts (complexity)
   - Before/after dep counts (coupling)
4. Valid. behavior identical post-transmute

**→** Measurable metric improvement. Each transmuted > Lead predecessor, same behavior.

**If err:** Lead resists opt in current interface → interface itself = problem. Sometimes transmute = change caller, not impl.

### Step 4: Purge — Remove Dross

Kill dead weight systematically.

1. Each Dross → valid. truly unused:
   - Grep all refs (IDE find-usages)
   - Dynamic refs (string dispatch, reflection)?
   - External consumers (library)?
2. Remove confirmed:
   - Delete dead code, unused exports, vestigial features
   - Drop unused deps from manifests
   - Clean config for removed features
3. Valid. nothing breaks post-removal (tests)
4. Doc what + why (commit msgs, not code)

**→** Codebase lighter. Bundle/dep count/volume measurably down. Tests pass.

**If err:** Removal breaks → wasn't dross → reclassify. Dynamic refs hide usage → temp logging before delete to confirm no runtime access.

### Step 5: Verify — Weigh Gold

Measure overall improvement.

1. Run same benchmarks as Step 1
2. Before/after on metric
3. Doc results:
   - Refined elements (Gold/Silver wins)
   - Transmuted (Lead → Gold w/ measurements)
   - Purged (Dross removed w/ size/count impact)
   - Overall metric gain (e.g., "47% faster", "32% smaller bundle")

**→** Measurable, documented metric improvement. Codebase demonstrably more valuable.

**If err:** Marginal improvement → orig code better than assumed. Doc learning → knowing code near-optimal = valuable.

## Check

- [ ] Assay report classifies all w/ evidence
- [ ] Gold has full tests + docs
- [ ] Lead transmutes show before/after metric gain
- [ ] Dross removal valid'd w/ ref checks pre-delete
- [ ] Tests pass each stage
- [ ] Overall improvement measured + documented
- [ ] No behavior regressions
- [ ] In constraints met

## Traps

- **Premature opt**: Opt w/o profile → always measure first, opt hot paths
- **Polish dross**: Effort on code should-be-deleted → classify before refine
- **Break Gold**: Opt degrades best code → Gold only improves, never worse
- **Unmeasured**: "Feels faster" ≠ chrysopoeia → quantify every gain
- **Opt cold paths**: Effort on startup-once code when req loop = bottleneck

## →

- `athanor` — Full four-stage when restructure needed, not just opt
- `transmute` — Targeted conversion when Lead needs paradigm shift
- `review-software-architecture` — Architecture-level eval
- `review-data-analysis` — Data pipeline opt parallels code opt
