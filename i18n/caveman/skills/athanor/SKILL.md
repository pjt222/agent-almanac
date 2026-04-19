---
name: athanor
locale: caveman
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

Execute four-stage alchemical transmutation of code or data — decomposing prima materia, purifying its essence, illuminating its target form, synthesizing refined output. Athanor is furnace that maintains steady heat across all stages.

## When Use

- Transforming legacy code into modern, well-structured equivalents
- Refactoring deeply tangled modules where incremental fixes keep failing
- Converting codebase from one paradigm to another (procedural to functional, monolith to modular)
- Processing raw, messy data into clean analytical datasets
- Simpler refactoring approaches have stalled and full-cycle transformation needed

## Inputs

- **Required**: Material to transform (file paths, module names, or data sources)
- **Required**: Desired end state (target architecture, paradigm, or format)
- **Optional**: Known constraints (must preserve API, can't change database schema, etc.)
- **Optional**: Prior failed transformation attempts and why they stalled

## Steps

### Step 1: Nigredo — Decomposition

Break prima materia into its constituent elements. Nothing sacred; everything cataloged.

1. Inventory material complete:
   - List every function, class, module, or data entity
   - Map all dependencies (imports, calls, data flows)
   - Identify hidden coupling (shared globals, implicit state, side effects)
2. Surface hidden assumptions:
   - What undocumented behaviors does code rely on?
   - What error conditions silently swallowed?
   - What ordering dependencies exist?
3. Catalog anti-patterns and technical debt:
   - God objects, circular dependencies, copy-paste duplication
   - Dead code paths, unreachable branches, vestigial features
   - Hardcoded values, magic numbers, embedded configuration
4. Produce **Nigredo Inventory**: structured catalog of every element, dependency, assumption, anti-pattern

**Got:** Complete, unflinching inventory of material. Inventory should feel uncomfortable — if it doesn't, decomposition isn't thorough enough. Every hidden assumption now explicit.

**If fail:** Material too large to inventory fully? Decompose by module boundary and treat each module as separate athanor run. Dependencies too tangled to map? Use `grep`/`Grep` to trace actual call sites rather than relying on documentation.

### Step 2: Meditate — Calcination Checkpoint

Run `meditate` skill to clear assumptions accumulated during nigredo.

1. Set aside nigredo inventory and clear mental context
2. Anchor on transformation goal stated in Inputs
3. Observe what biases nigredo introduced — did decomposition make certain approaches seem inevitable?
4. Label any premature solution ideas as "tangent" and return to goal

**Got:** Clear, unbiased state ready to evaluate material without being anchored to its current form. Goal feels fresh rather than constrained by what was found.

**If fail:** Nigredo findings keep pulling attention (particularly bad anti-pattern, clever hack tempting to preserve)? Write it down and explicitly set it aside. Proceed only when goal clearer than current form.

### Step 3: Albedo — Purification

Separate essential from accidental. Strip away everything that doesn't serve target form.

1. From nigredo inventory, classify each element:
   - **Essential**: Core business logic, irreplaceable algorithms, critical data transformations
   - **Accidental**: Framework boilerplate, workarounds for old bugs, compatibility shims
   - **Toxic**: Anti-patterns, security vulnerabilities, dead code
2. Extract essential elements into isolation:
   - Pull core logic out of framework wrappers
   - Separate data transformation from I/O
   - Extract interfaces from implementations
3. Remove toxic elements entirely — document what was removed and why
4. For accidental elements, determine if equivalents exist in target form
5. Produce **Albedo Extract**: purified essential logic with clean interfaces

**Got:** Set of pure, isolated functions/modules that represent core value of original material. Each piece testable in isolation. Extract significantly smaller than original.

**If fail:** Essential and accidental too intertwined to separate? Introduce seam points (interfaces) first. Material resists purification? May need `dissolve-form` before athanor can continue.

### Step 4: Heal — Purification Assessment

Run `heal` skill to assess whether purification was thorough.

1. Triage albedo extract: is anything still carrying toxic residue?
2. Check for drift: has purification drifted from original transformation goal?
3. Assess completeness: are all essential elements accounted for, or were some discarded prematurely?
4. Rebalance if needed: restore any essential elements that were incorrectly classified as accidental

**Got:** Confidence that albedo extract is complete, clean, ready for illumination. No essential logic was lost; no toxic patterns remain.

**If fail:** Assessment reveals significant gaps? Return to Step 3 with specific gaps identified. Do not proceed to citrinitas with incomplete material.

### Step 5: Citrinitas — Illumination

See target form. Map purified elements to their optimal structure.

1. Pattern recognition: identify which design patterns serve purified elements
   - Does data flow suggest pipes/filters, event sourcing, CQRS?
   - Do interfaces suggest strategy, adapter, facade?
   - Does module structure suggest hexagonal, layered, micro-kernel?
2. Design target architecture:
   - Map each essential element to its new location
   - Define interfaces between components
   - Specify data flow through new structure
3. Identify what must be created new (has no equivalent in original):
   - New abstractions that unify duplicated logic
   - New interfaces that replace implicit coupling
   - New error handling that replaces silent failures
4. Produce **Citrinitas Blueprint**: complete mapping from albedo extract to target form

**Got:** Clear, detailed blueprint where every essential element has home and every interface defined. Blueprint should feel inevitable — given purified elements, this structure is natural fit.

**If fail:** Multiple valid architectures compete? Evaluate each against constraints from Inputs. No clear winner emerges? Prefer simplest option and document alternatives as future options.

### Step 6: Meditate — Pre-Synthesis Checkpoint

Run `meditate` skill to prepare for final synthesis.

1. Clear analytical context from citrinitas
2. Anchor on citrinitas blueprint as synthesis guide
3. Observe any anxiety about transformation — is anything being rushed?
4. Confirm readiness: blueprint clear, material purified, constraints known

**Got:** Calm clarity about what needs to be built. Synthesis phase should be execution, not design.

**If fail:** Doubt persists about blueprint? Revisit Step 5 with specific concerns. Better to refine blueprint than to begin synthesis with uncertainty.

### Step 7: Rubedo — Synthesis

Compose purified elements into their target form. Philosopher's stone: working, optimized code.

1. Build new structure following citrinitas blueprint:
   - Create files, modules, interfaces as specified
   - Migrate each essential element to its new location
   - Implement new abstractions and interfaces
2. Wire components together:
   - Connect data flows as designed
   - Implement error propagation through new paths
   - Configure dependency injection or module loading
3. Verify synthesis:
   - Does each component work in isolation? (unit tests)
   - Do components compose correctly? (integration tests)
   - Does full system produce same outputs as original? (regression tests)
4. Remove scaffolding:
   - Delete temporary compatibility shims
   - Remove migration aids
   - Clean up any remaining references to old structure
5. Produce **Rubedo Output**: transmuted code, fully functional in its new form

**Got:** Working code measurably better than original: fewer lines, clearer structure, better test coverage, fewer dependencies. Transformation complete and old form can be retired.

**If fail:** Synthesis reveals gaps in blueprint? Do not patch — return to Step 5 (citrinitas) to revise design. Individual components fail? Isolate and fix them before attempting full integration. Rubedo must not produce half-transformed chimera.

## Validation Checklist

- [ ] Nigredo inventory complete (all elements, dependencies, assumptions cataloged)
- [ ] Meditate checkpoint passed between nigredo/albedo (assumptions cleared)
- [ ] Albedo extract contains only essential elements with clean interfaces
- [ ] Heal assessment confirms purification completeness
- [ ] Citrinitas blueprint maps every essential element to target form
- [ ] Meditate checkpoint passed between citrinitas/rubedo (ready for synthesis)
- [ ] Rubedo output passes regression tests against original behavior
- [ ] Rubedo output measurably improved (complexity, coupling, test coverage)
- [ ] No toxic elements survived into final output
- [ ] Transformation constraints from Inputs satisfied

## Pitfalls

- **Skipping nigredo depth**: Rushing decomposition means hidden coupling surfaces during synthesis. Invest fully in inventory
- **Preserving accidental complexity**: Attachment to clever workarounds or "it works, don't touch it" code. Not essential? It goes
- **Skipping meditate checkpoints**: Cognitive momentum from one stage biases next. Pauses are structural, not optional
- **Blueprint-less synthesis**: Starting to code before citrinitas complete produces patchwork, not transmutation
- **Incomplete regression testing**: Rubedo must reproduce original behavior. Untested paths will break silently
- **Scope creep during citrinitas**: Illumination phase reveals opportunities for improvement beyond original goal. Note them but don't pursue them — athanor serves stated transformation, not hypothetical ideal

## See Also

- `transmute` — Lighter-weight transformation for single functions or small modules
- `chrysopoeia` — Value extraction and optimization (turning base code into gold)
- `meditate` — Meta-cognitive clearing used as stage-gate checkpoints
- `heal` — Subsystem assessment used for purification validation
- `dissolve-form` — When material too rigid for athanor, dissolve first
- `adapt-architecture` — Complementary approach for system-level migration patterns
- `review-software-architecture` — Post-synthesis architecture review
