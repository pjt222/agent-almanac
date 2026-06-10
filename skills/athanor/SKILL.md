---
name: athanor
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

Execute a four-stage alchemical transmutation of code or data — decomposing the prima materia, purifying its essence, illuminating its target form, and synthesizing the refined output. The athanor is the furnace that maintains steady heat across all stages.

## When to Use

- Transforming legacy code into modern, well-structured equivalents
- Refactoring deeply tangled modules where incremental fixes keep failing
- Converting a codebase from one paradigm to another (procedural to functional, monolith to modular)
- Processing raw, messy data into clean analytical datasets
- When simpler refactoring approaches have stalled and a full-cycle transformation is needed

## Inputs

- **Required**: The material to transform (file paths, module names, or data sources)
- **Required**: The desired end state (target architecture, paradigm, or format)
- **Optional**: Known constraints (must preserve API, can't change database schema, etc.)
- **Optional**: Prior failed transformation attempts and why they stalled

## Procedure

### Step 1: Nigredo — Decomposition

Break the prima materia into its constituent elements. Nothing is sacred; everything is cataloged.

1. Inventory the material completely:
   - List every function, class, module, or data entity
   - Map all dependencies (imports, calls, data flows)
   - Identify hidden coupling (shared globals, implicit state, side effects)
2. Surface hidden assumptions:
   - What undocumented behaviors does the code rely on?
   - What error conditions are silently swallowed?
   - What ordering dependencies exist?
3. Catalog anti-patterns and technical debt:
   - God objects, circular dependencies, copy-paste duplication
   - Dead code paths, unreachable branches, vestigial features
   - Hardcoded values, magic numbers, embedded configuration
4. Produce the **Nigredo Inventory**: a structured catalog of every element, dependency, assumption, and anti-pattern

**Expected:** A complete, unflinching inventory of the material. The inventory should feel uncomfortable — if it doesn't, the decomposition isn't thorough enough. Every hidden assumption is now explicit.

**On failure:** If the material is too large to inventory fully, decompose by module boundary and treat each module as a separate athanor run. If dependencies are too tangled to map, use `grep`/`Grep` to trace actual call sites rather than relying on documentation.

### Step 2: Meditate — Calcination Checkpoint

Run the `meditate` skill to clear assumptions accumulated during nigredo.

1. Set aside the nigredo inventory and clear mental context
2. Anchor on the transformation goal stated in Inputs
3. Observe what biases nigredo introduced — did the decomposition make certain approaches seem inevitable?
4. Label any premature solution ideas as "tangent" and return to the goal

**Expected:** A clear, unbiased state ready to evaluate the material without being anchored to its current form. The goal feels fresh rather than constrained by what was found.

**On failure:** If the nigredo findings keep pulling attention (a particularly bad anti-pattern, a clever hack that's tempting to preserve), write it down and explicitly set it aside. Proceed only when the goal is clearer than the current form.

### Step 3: Albedo — Purification

Separate the essential from the accidental. Strip away everything that doesn't serve the target form.

1. From the nigredo inventory, classify each element:
   - **Essential**: Core business logic, irreplaceable algorithms, critical data transformations
   - **Accidental**: Framework boilerplate, workarounds for old bugs, compatibility shims
   - **Toxic**: Anti-patterns, security vulnerabilities, dead code
2. Extract the essential elements into isolation:
   - Pull core logic out of framework wrappers
   - Separate data transformation from I/O
   - Extract interfaces from implementations
3. Remove toxic elements entirely — document what was removed and why
4. For accidental elements, determine if equivalents exist in the target form
5. Produce the **Albedo Extract**: purified essential logic with clean interfaces

**Expected:** A set of pure, isolated functions/modules that represent the core value of the original material. Each piece is testable in isolation. The extract is significantly smaller than the original.

**On failure:** If essential and accidental are too intertwined to separate, introduce seam points (interfaces) first. If the material resists purification, it may need `dissolve-form` before the athanor can continue.

### Step 4: Heal — Purification Assessment

Run the `heal` skill to assess whether the purification was thorough.

1. Triage the albedo extract: is anything still carrying toxic residue?
2. Check for drift: has the purification drifted from the original transformation goal?
3. Assess completeness: are all essential elements accounted for, or were some discarded prematurely?
4. Rebalance if needed: restore any essential elements that were incorrectly classified as accidental

**Expected:** Confidence that the albedo extract is complete, clean, and ready for illumination. No essential logic was lost; no toxic patterns remain.

**On failure:** If the assessment reveals significant gaps, return to Step 3 with the specific gaps identified. Do not proceed to citrinitas with incomplete material.

### Step 5: Citrinitas — Illumination

See the target form. Map the purified elements to their optimal structure.

1. Pattern recognition: identify which design patterns serve the purified elements
   - Does the data flow suggest pipes/filters, event sourcing, CQRS?
   - Do the interfaces suggest strategy, adapter, facade?
   - Does the module structure suggest hexagonal, layered, micro-kernel?
2. Design the target architecture:
   - Map each essential element to its new location
   - Define the interfaces between components
   - Specify the data flow through the new structure
3. Identify what must be created new (has no equivalent in the original):
   - New abstractions that unify duplicated logic
   - New interfaces that replace implicit coupling
   - New error handling that replaces silent failures
4. Produce the **Citrinitas Blueprint**: a complete mapping from albedo extract to target form

**Expected:** A clear, detailed blueprint where every essential element has a home and every interface is defined. The blueprint should feel inevitable — given the purified elements, this structure is the natural fit.

**On failure:** If multiple valid architectures compete, evaluate each against the constraints from Inputs. If no clear winner emerges, prefer the simplest option and document the alternatives as future options.

### Step 6: Meditate — Pre-Synthesis Checkpoint

Run the `meditate` skill to prepare for the final synthesis.

1. Clear the analytical context from citrinitas
2. Anchor on the citrinitas blueprint as the synthesis guide
3. Observe any anxiety about the transformation — is anything being rushed?
4. Confirm readiness: the blueprint is clear, the material is purified, the constraints are known

**Expected:** Calm clarity about what needs to be built. The synthesis phase should be execution, not design.

**On failure:** If doubt persists about the blueprint, revisit Step 5 with the specific concerns. Better to refine the blueprint than to begin synthesis with uncertainty.

### Step 7: Rubedo — Synthesis

Compose the purified elements into their target form. The philosopher's stone: working, optimized code.

1. Build the new structure following the citrinitas blueprint:
   - Create files, modules, and interfaces as specified
   - Migrate each essential element to its new location
   - Implement new abstractions and interfaces
2. Wire the components together:
   - Connect data flows as designed
   - Implement error propagation through new paths
   - Configure dependency injection or module loading
3. Verify the synthesis:
   - Does each component work in isolation? (unit tests)
   - Do the components compose correctly? (integration tests)
   - Does the full system produce the same outputs as the original? (regression tests)
4. Remove scaffolding:
   - Delete temporary compatibility shims
   - Remove migration aids
   - Clean up any remaining references to the old structure
5. Produce the **Rubedo Output**: the transmuted code, fully functional in its new form

**Expected:** Working code that is measurably better than the original: fewer lines, clearer structure, better test coverage, fewer dependencies. The transformation is complete and the old form can be retired.

**On failure:** If synthesis reveals gaps in the blueprint, do not patch — return to Step 5 (citrinitas) to revise the design. If individual components fail, isolate and fix them before attempting full integration. The rubedo must not produce a half-transformed chimera.

## Validation Checklist

- [ ] Nigredo inventory is complete (all elements, dependencies, assumptions cataloged)
- [ ] Meditate checkpoint passed between nigredo/albedo (assumptions cleared)
- [ ] Albedo extract contains only essential elements with clean interfaces
- [ ] Heal assessment confirms purification completeness
- [ ] Citrinitas blueprint maps every essential element to target form
- [ ] Meditate checkpoint passed between citrinitas/rubedo (ready for synthesis)
- [ ] Rubedo output passes regression tests against original behavior
- [ ] Rubedo output is measurably improved (complexity, coupling, test coverage)
- [ ] No toxic elements survived into the final output
- [ ] Transformation constraints from Inputs are satisfied

## Common Pitfalls

- **Skipping nigredo depth**: Rushing decomposition means hidden coupling surfaces during synthesis. Invest fully in the inventory
- **Preserving accidental complexity**: Attachment to clever workarounds or "it works, don't touch it" code. If it's not essential, it goes
- **Skipping meditate checkpoints**: Cognitive momentum from one stage biases the next. The pauses are structural, not optional
- **Blueprint-less synthesis**: Starting to code before citrinitas is complete produces patchwork, not transmutation
- **Incomplete regression testing**: The rubedo must reproduce original behavior. Untested paths will break silently
- **Scope creep during citrinitas**: The illumination phase reveals opportunities for improvement beyond the original goal. Note them but don't pursue them — the athanor serves the stated transformation, not a hypothetical ideal

## Related Skills

- `transmute` — Lighter-weight transformation for single functions or small modules
- `chrysopoeia` — Value extraction and optimization (turning base code into gold)
- `meditate` — Meta-cognitive clearing used as stage-gate checkpoints
- `heal` — Subsystem assessment used for purification validation
- `dissolve-form` — When material is too rigid for the athanor, dissolve first
- `adapt-architecture` — Complementary approach for system-level migration patterns
- `review-software-architecture` — Post-synthesis architecture review
