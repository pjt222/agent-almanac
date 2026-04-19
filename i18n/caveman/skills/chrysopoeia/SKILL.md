---
name: chrysopoeia
locale: caveman
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

Extract max value from existing code. Identify gold (high-value, well-designed), lead (resource-heavy, poorly optimized), dross (dead weight). Amplify gold, transmute lead, remove dross.

## When Use

- Optimizing working but sluggish codebase for performance
- Refining API surface with accumulated cruft
- Reducing bundle size, memory footprint, startup time
- Prepping code for open-source release (extract valuable core)
- Code works correctly but doesn't shine — needs polish, not rewrite

## Inputs

- **Required**: Codebase or module to optimize (file paths)
- **Required**: Value metric (performance, API clarity, bundle size, readability)
- **Optional**: Profiling data or benchmarks showing current performance
- **Optional**: Budget or target (e.g., "reduce bundle by 40%", "sub-100ms response")
- **Optional**: Constraints (can't change public API, must maintain backward compat)

## Steps

### Step 1: Assay — Classify the Material

Classify every element by value contribution.

1. Define value metric from Inputs (performance, clarity, size, etc.)
2. Inventory elements (functions, modules, exports, dependencies)
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

4. Performance optimization: profile first.
   - Identify hot paths (where time spent)
   - Identify cold paths (rarely-run code, may be dross)
   - Measure memory allocation patterns
5. Produce **Assay Report**: element-by-element classification with evidence

**Got:** Every significant element classified with evidence. Gold elements identified for protection. Lead elements prioritized by impact.

**If fail:** No profiling tools? Use static analysis — function complexity (cyclomatic), dependency count, code size as proxies. Codebase too large? Focus critical path first.

### Step 2: Refine — Amplify the Gold

Protect and enhance highest-value elements.

1. Each Gold element:
   - Ensure comprehensive tests (most valuable assets)
   - Document interface clearly if not already
   - Consider extraction as reusable module
2. Each Silver element:
   - Apply targeted improvements (better naming, clearer types, minor optimizations)
   - Bring test coverage to Gold level
   - Resolve minor code smells without restructuring
3. Do not modify Gold/Silver behavior. Only improve polish and protection.

**Got:** Gold and Silver elements better tested, documented, protected. No behavioral changes. Quality improvements only.

**If fail:** "Gold" element reveals hidden problems under closer inspection? Reclassify. Honest about value beats protecting flawed code.

### Step 3: Transmute — Convert Lead to Gold

Transform heavy, inefficient elements into optimized equivalents.

1. Prioritize Lead elements by impact (highest resource consumption first)
2. Each Lead element, choose transmutation strategy:
   - **Algorithm optimization**: Replace O(n^2) with O(n log n). Eliminate redundant computation.
   - **Caching/memoization**: Store expensive results requested repeatedly
   - **Lazy evaluation**: Defer computation until results actually needed
   - **Batch processing**: Combine many small operations into fewer large ones
   - **Structural simplification**: Reduce cyclomatic complexity, flatten deep nesting
3. Apply strategy. Measure improvement.
   - Before/after benchmarks for performance changes
   - Before/after line counts for complexity changes
   - Before/after dependency counts for coupling changes
4. Verify behavioral equivalence after each transmutation.

**Got:** Measurable improvement on target value metric. Each transmuted element performs better than Lead predecessor. Identical behavior maintained.

**If fail:** Lead element resists optimization within current interface? Interface itself may be problem. Transmutation may require changing how element is called, not just implementation.

### Step 4: Purge — Remove the Dross

Eliminate dead weight.

1. Each Dross element, verify truly unused:
   - Search all references (grep, IDE find-usages)
   - Check dynamic references (string-based dispatch, reflection)
   - Check external consumers (if library)
2. Remove confirmed dross:
   - Delete dead code, unused exports, vestigial features
   - Remove unused dependencies from package manifests
   - Clean up config for removed features
3. Verify nothing breaks after each removal (run tests)
4. Document what removed and why (commit messages, not code)

**Got:** Codebase lighter. Bundle size, dependency count, or code volume measurably reduced. All tests pass.

**If fail:** Removing element breaks something? Wasn't dross. Reclassify. Dynamic references make usage hard to verify? Add temp logging before deletion to confirm no runtime access.

### Step 5: Verify — Weigh the Gold

Measure overall improvement.

1. Run same benchmarks/metrics from Step 1
2. Compare before/after on target value metric
3. Document chrysopoeia results:
   - Elements refined (Gold/Silver improvements)
   - Elements transmuted (Lead → Gold, with measurements)
   - Elements purged (Dross removed, with size/count impact)
   - Overall metric improvement (e.g., "47% faster", "32% smaller bundle")

**Got:** Measurable, documented improvement on target value metric. Codebase demonstrably more valuable.

**If fail:** Overall improvement marginal? Original code may have been better than assumed. Document learnings — knowing code is near-optimal is itself valuable.

## Checks

- [ ] Assay report classifies all significant elements with evidence
- [ ] Gold elements have comprehensive tests and documentation
- [ ] Lead transmutations show measurable before/after improvement
- [ ] Dross removal verified with reference checks before deletion
- [ ] All tests pass after each stage
- [ ] Overall improvement measured and documented
- [ ] No behavioral regressions introduced
- [ ] Constraints from Inputs satisfied

## Pitfalls

- **Premature optimization**: Optimizing without profiling. Measure first. Optimize hot paths.
- **Polishing dross**: Effort on code that should be deleted. Classify before refining.
- **Breaking Gold**: Optimization that degrades best code. Gold should only get better, never worse.
- **Unmeasured claims**: "Feels faster" is not chrysopoeia. Every improvement quantified.
- **Optimizing cold paths**: Effort on code that runs once at startup when bottleneck is request loop.

## See Also

- `athanor` — Full four-stage transformation when chrysopoeia reveals code needs restructuring, not just optimization
- `transmute` — Targeted conversion when Lead element needs paradigm shift
- `review-software-architecture` — Architecture-level evaluation complementing code-level chrysopoeia
- `review-data-analysis` — Data pipeline optimization parallels code optimization
