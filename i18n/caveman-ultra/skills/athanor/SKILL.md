---
name: athanor
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Four-stage alchemical code transmutation — nigredo (decomposition), albedo
  (purification), citrinitas (illumination), rubedo (synthesis) — with meditate
  and heal checkpoints between stages. Transforms tangled or legacy code into
  optimized, well-structured output through systematic material analysis. Use
  when transforming legacy code into modern equivalents, refactoring deeply
  tangled modules where incremental fixes keep failing, converting a codebase
  between paradigms, or when simpler refactoring approaches have stalled and a
  full-cycle transformation is needed.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: advanced
  language: multi
  tags: alchemy, transmutation, refactoring, transformation, four-stages, nigredo, albedo, citrinitas, rubedo
---

# Athanor

4-stage alchemical transmutation — decompose prima materia → purify essence → illuminate target form → synthesize refined. Athanor = furnace maintaining steady heat all stages.

## Use When

- Transform legacy → modern well-structured
- Refactor deeply tangled modules where incremental fixes keep failing
- Convert paradigm (procedural → functional, monolith → modular)
- Process raw messy data → clean analytical datasets
- Simpler refactoring stalled + full-cycle transformation needed

## In

- **Required**: Material (file paths, module names, data srcs)
- **Required**: Desired end state (target architecture, paradigm, format)
- **Optional**: Known constraints (preserve API, can't change DB schema, etc.)
- **Optional**: Prior failed attempts + why stalled

## Do

### Step 1: Nigredo — Decomposition

Break prima materia into constituent elements. Nothing sacred; everything cataloged.

1. Inventory completely:
   - Every fn, class, module, data entity
   - All deps (imports, calls, data flows)
   - Hidden coupling (shared globals, implicit state, side effects)
2. Surface hidden assumptions:
   - Undocumented behaviors code relies on?
   - Err conditions silently swallowed?
   - Ordering deps exist?
3. Catalog anti-patterns + tech debt:
   - God objects, circular deps, copy-paste duplication
   - Dead code paths, unreachable branches, vestigial features
   - Hardcoded values, magic numbers, embedded config
4. Produce **Nigredo Inventory**: structured catalog of every element + dep + assumption + anti-pattern

**→** Complete unflinching inventory. Should feel uncomfortable — if not, decomposition not thorough. Every hidden assumption now explicit.

**If err:** Material too large → decompose by module boundary + each module separate athanor run. Deps too tangled to map → `grep`/`Grep` trace actual call sites not docs.

### Step 2: Meditate — Calcination Checkpoint

Run `meditate` → clear assumptions accumulated during nigredo.

1. Set aside nigredo inventory + clear mental ctx
2. Anchor on transformation goal stated in Inputs
3. Observe nigredo biases — decomposition made certain approaches seem inevitable?
4. Label premature solution ideas "tangent" + return to goal

**→** Clear unbiased state → eval material no anchoring to current form. Goal feels fresh not constrained by what was found.

**If err:** Nigredo findings keep pulling attention (particularly bad anti-pattern, clever hack tempting to preserve) → write down + explicitly set aside. Proceed only when goal clearer than current form.

### Step 3: Albedo — Purification

Separate essential from accidental. Strip everything not serving target form.

1. From nigredo inventory classify each:
   - **Essential**: Core business logic, irreplaceable algos, critical data transformations
   - **Accidental**: Framework boilerplate, workarounds for old bugs, compat shims
   - **Toxic**: Anti-patterns, security vulnerabilities, dead code
2. Extract essential into isolation:
   - Pull core logic from framework wrappers
   - Separate data transformation from I/O
   - Extract interfaces from impls
3. Remove toxic entirely — doc what removed + why
4. Accidental → determine if equivalents exist in target form
5. Produce **Albedo Extract**: purified essential logic + clean interfaces

**→** Set of pure isolated fns/modules representing core value. Each piece testable in isolation. Extract significantly smaller than original.

**If err:** Essential + accidental too intertwined → introduce seam pts (interfaces) first. Material resists purification → may need `dissolve-form` before athanor continues.

### Step 4: Heal — Purification Assessment

Run `heal` → assess purification thorough.

1. Triage albedo extract: anything still carrying toxic residue?
2. Check drift: purification drifted from transformation goal?
3. Assess completeness: all essential accounted for, or discarded prematurely?
4. Rebalance: restore essential elements incorrectly classified as accidental

**→** Confidence that albedo extract complete + clean + ready for illumination. No essential logic lost; no toxic patterns remain.

**If err:** Assessment reveals significant gaps → return Step 3 w/ specific gaps ID'd. No proceed to citrinitas w/ incomplete material.

### Step 5: Citrinitas — Illumination

See target form. Map purified elements → optimal structure.

1. Pattern recognition: which design patterns serve purified:
   - Data flow suggests pipes/filters, event sourcing, CQRS?
   - Interfaces suggest strategy, adapter, facade?
   - Module structure suggests hexagonal, layered, micro-kernel?
2. Design target architecture:
   - Map each essential → new location
   - Define interfaces between components
   - Specify data flow through new structure
3. ID what must be new (no equivalent in original):
   - New abstractions unifying duplicated logic
   - New interfaces replacing implicit coupling
   - New err handling replacing silent failures
4. Produce **Citrinitas Blueprint**: complete mapping albedo extract → target form

**→** Clear detailed blueprint, every essential has home + every interface defined. Should feel inevitable — given purified elements, structure = natural fit.

**If err:** Multi valid architectures compete → eval each vs Input constraints. No clear winner → prefer simplest + doc alternatives as future options.

### Step 6: Meditate — Pre-Synthesis Checkpoint

Run `meditate` → prep for final synthesis.

1. Clear analytical ctx from citrinitas
2. Anchor on citrinitas blueprint as synthesis guide
3. Observe anxiety about transformation — anything rushed?
4. Confirm readiness: blueprint clear + material purified + constraints known

**→** Calm clarity about what to build. Synthesis should be execution, not design.

**If err:** Doubt persists about blueprint → revisit Step 5 w/ specific concerns. Better refine blueprint than begin synthesis w/ uncertainty.

### Step 7: Rubedo — Synthesis

Compose purified elements → target form. Philosopher's stone: working + optimized code.

1. Build new structure per citrinitas blueprint:
   - Create files, modules, interfaces as specified
   - Migrate each essential to new location
   - Impl new abstractions + interfaces
2. Wire components:
   - Connect data flows as designed
   - Impl err propagation through new paths
   - Config dep injection or module loading
3. Verify synthesis:
   - Each component works in isolation? (unit tests)
   - Components compose correctly? (integration tests)
   - Full system produces same out as original? (regression tests)
4. Remove scaffolding:
   - Delete temp compat shims
   - Remove migration aids
   - Clean up remaining refs to old structure
5. Produce **Rubedo Out**: transmuted code, fully functional in new form

**→** Working code measurably better than original: fewer lines, clearer structure, better test coverage, fewer deps. Transformation complete + old form can be retired.

**If err:** Synthesis reveals gaps in blueprint → no patch → return Step 5 (citrinitas) revise design. Individual components fail → isolate + fix before full integration. Rubedo must not produce half-transformed chimera.

## Check

- [ ] Nigredo inventory complete (all elements, deps, assumptions cataloged)
- [ ] Meditate checkpoint passed between nigredo/albedo (assumptions cleared)
- [ ] Albedo extract contains only essential + clean interfaces
- [ ] Heal assessment confirms purification completeness
- [ ] Citrinitas blueprint maps every essential → target form
- [ ] Meditate checkpoint passed between citrinitas/rubedo (ready for synthesis)
- [ ] Rubedo out passes regression tests vs original behavior
- [ ] Rubedo out measurably improved (complexity, coupling, test coverage)
- [ ] No toxic elements survived → final out
- [ ] Transformation constraints from Inputs satisfied

## Traps

- **Skip nigredo depth**: Rushing decomposition → hidden coupling surfaces during synthesis. Invest fully in inventory.
- **Preserve accidental complexity**: Attachment to clever workarounds or "it works, don't touch it" code. Not essential → goes.
- **Skip meditate checkpoints**: Cognitive momentum from 1 stage biases next. Pauses structural, not optional.
- **Blueprint-less synthesis**: Starting code pre-citrinitas complete → patchwork not transmutation.
- **Incomplete regression testing**: Rubedo must reproduce original behavior. Untested paths break silently.
- **Scope creep during citrinitas**: Illumination reveals opportunities beyond original goal. Note but don't pursue — athanor serves stated transformation not hypothetical ideal.

## →

- `transmute` — lighter-weight transformation for single fns or small modules
- `chrysopoeia` — value extraction + optimization (base code → gold)
- `meditate` — meta-cognitive clearing used as stage-gate checkpoints
- `heal` — subsystem assessment used for purification validation
- `dissolve-form` — material too rigid for athanor → dissolve first
- `adapt-architecture` — complementary approach for system-level migration patterns
- `review-software-architecture` — post-synthesis architecture review
