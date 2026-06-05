---
name: dissolve-form
description: >
  Perform controlled dismantling of rigid system structures while preserving
  essential capabilities (imaginal discs). Covers rigidity mapping, dissolution
  sequencing, knowledge extraction, interface archaeology, and safe decomposition
  of technical debt and organizational calcification. Use when assess-form
  classified the system as PREPARE or CRITICAL, when a system is so calcified
  that incremental change is impossible, when technical debt blocks all forward
  progress, or before adapt-architecture when the current form must be softened
  before it can be reshaped.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: advanced
  language: natural
  tags: morphic, dissolution, decomposition, technical-debt
---

# Dissolve Form

Perform controlled dismantling of rigid system structures — dissolving calcified architecture, accumulated technical debt, and organizational rigidity while preserving the essential capabilities ("imaginal discs") that will seed the new form.

## When to Use

- Form assessment (see `assess-form`) classified the system as PREPARE or CRITICAL (too rigid to transform directly)
- A system is so calcified that incremental change is impossible
- Technical debt has compounded to the point where it blocks all forward progress
- An organizational structure has become so rigid that it can't adapt to new requirements
- Before `adapt-architecture` when the current form must be softened before it can be reshaped
- Legacy system decommissioning where value must be extracted before shutdown

## Inputs

- **Required**: Form assessment showing high rigidity (from `assess-form`)
- **Required**: Identification of essential capabilities to preserve (imaginal discs)
- **Optional**: Target form (what should emerge after dissolution; may be unknown)
- **Optional**: Dissolution timeline and constraints
- **Optional**: Stakeholder concerns about specific components
- **Optional**: Previous dissolution attempts and their outcomes

## Procedure

### Step 1: Identify Imaginal Discs

In biological metamorphosis, imaginal discs are clusters of cells within the caterpillar that survive dissolution and become the butterfly's organs. Identify the essential capabilities that must survive.

1. Catalog every capability the current system provides:
   - User-facing features
   - Data processing functions
   - Integration points with external systems
   - Institutional knowledge embedded in the code/process
   - Business rules (often implicit, undocumented)
2. Classify each capability:
   - **Imaginal disc** (must survive): core business logic, critical integrations, irreplaceable data
   - **Replaceable tissue** (can be rebuilt): UI, infrastructure, standard algorithms
   - **Dead tissue** (should not survive): workarounds for bugs that no longer exist, compatibility shims for dead systems, features nobody uses
3. Extract imaginal discs into portable form:
   - Document business rules explicitly (they may only exist as code comments or tribal knowledge)
   - Extract critical algorithms into standalone, tested modules
   - Export essential data in format-independent representations
   - Record integration contracts and their actual (not documented) behavior

**Expected:** A clear inventory of capabilities classified as essential (preserve), replaceable (rebuild), or dead (discard). Essential capabilities are extracted into portable form before dissolution begins.

**On failure:** If imaginal disc identification is uncertain (stakeholders disagree on what's essential), err on the side of preservation. Extract more capabilities than you think you'll need — discarding after dissolution is easy; recovering lost knowledge is often impossible.

### Step 2: Map Dissolution Sequence

Determine the order in which structural elements will be dissolved — outer layers first, core last.

1. Order by dependency depth:
   - Layer 1 (outermost): components with no dependents — nothing breaks when they're removed
   - Layer 2: components whose dependents are only Layer 1 items (already dissolved)
   - Layer 3: components with deeper dependencies — removing these requires careful interface management
   - Layer N (core): load-bearing components that everything depends on — dissolved last
2. For each layer, define:
   - What is dissolved (removed, decommissioned, archived)
   - What replaces it (new component, nothing, or temporary stub)
   - What interfaces must be maintained for the remaining layers
   - How to verify the system still functions after this layer is dissolved
3. Create dissolution checkpoints:
   - After each layer, the remaining system must be tested and verified operational
   - Each checkpoint is a stable state from which dissolution can pause
   - If a layer's dissolution causes unexpected breakage, restore from the previous checkpoint

```
Dissolution Sequence (outside in):
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Dead features, unused integrations, orphaned code      │
│          → Remove. Nothing depends on these.                    │
│                                                                 │
│ Layer 2: Replaceable UI, standard infrastructure                │
│          → Replace with modern equivalents or stubs             │
│                                                                 │
│ Layer 3: Business logic wrappers, data access layers            │
│          → Extract imaginal discs, then dissolve                │
│                                                                 │
│ Layer 4 (core): Load-bearing structures, data stores            │
│          → Dissolve last, with full replacement ready           │
└─────────────────────────────────────────────────────────────────┘
```

**Expected:** A layer-ordered dissolution sequence where each step is safe (checkpoint verified) and reversible (previous checkpoint is restorable). The most critical components are dissolved last when the team has the most experience and confidence.

**On failure:** If dependency mapping reveals circular dependencies (A depends on B depends on A), these cycles must be broken before sequenced dissolution is possible. Introduce an interface between A and B, break the cycle, then proceed with the sequence.

### Step 3: Perform Interface Archaeology

Before dissolving rigid structures, excavate and document their actual interfaces — not what's documented, but what's actually in use.

1. Instrument current interfaces:
   - Log every call, message, or data exchange at each interface
   - Run for at least one full business cycle (daily, weekly, monthly — whatever is relevant)
   - Capture actual payload shapes, not just documented schemas
2. Compare actual vs. documented behavior:
   - What documented interfaces are never called? (candidates for Layer 1 dissolution)
   - What undocumented interfaces are actively used? (hidden dependencies — must be preserved or explicitly replaced)
   - What edge cases does the actual traffic reveal that documentation doesn't mention?
3. Build an interface contract from actual behavior:
   - This contract becomes the specification for any replacement
   - Include real examples of inputs and outputs
   - Document error handling behavior (what actually happens, not what should happen)

**Expected:** An empirically-derived interface contract that accurately represents how the system actually communicates, including undocumented behaviors and hidden dependencies.

**On failure:** If instrumentation is too invasive (impacts performance or requires code changes), sample traffic instead of capturing everything. If the business cycle is too long to wait, use the available data supplemented by stakeholder interviews about "what calls what in which situations."

### Step 4: Execute Controlled Dissolution

Systematically remove structural elements while maintaining imaginal disc viability.

1. Begin with Layer 1 (outermost, no dependents):
   - Remove dead features and unused code
   - Archive (don't delete) for reference
   - Verify: system still passes all tests, no runtime errors
2. Progress through each layer:
   - For each component being dissolved:
     a. Verify imaginal discs have been extracted (Step 1)
     b. Install replacement or stub (if dependents remain)
     c. Remove the component
     d. Run validation suite
     e. Monitor for unexpected side effects
   - At each checkpoint: document the current system state, verify operational status
3. Handle dissolution resistance:
   - Some components resist dissolution (hidden dependencies surface)
   - When a removal causes unexpected breakage:
     a. Restore from checkpoint
     b. Investigate the hidden dependency
     c. Add it to the interface archaeology (Step 3)
     d. Create an explicit stub for the dependency
     e. Re-attempt dissolution
4. Track dissolution progress:
   - Components remaining vs. dissolved
   - Imaginal discs extracted and verified portable
   - Unexpected dependencies discovered and handled

**Expected:** Systematic, verified dissolution of non-essential structure. After each layer, the remaining system is smaller, simpler, and still operational. Imaginal discs are preserved in portable form.

**On failure:** If dissolution causes cascading failures, the layer ordering is wrong — there are hidden dependencies deeper than expected. Stop, restore, remap dependencies, and re-sequence. If dissolution reveals that an "imaginal disc" is more complex than expected, allocate more extraction time for that capability.

### Step 5: Prepare the Foundation for Reconstruction

After dissolution, the remaining system should be a minimal viable core plus extracted imaginal discs ready for reconstruction.

1. Assess the post-dissolution state:
   - What remains? (minimal operational core + extracted capabilities)
   - Is the remaining system maintainable? (can the team understand and modify it)
   - Are all imaginal discs accessible and verified? (portable, tested, documented)
2. Create the reconstruction manifest:
   - List each imaginal disc with its contract, data, and test suite
   - Specify the target architecture for reconstruction (or mark as "to be determined")
   - Identify gaps: capabilities that were partially extracted or have quality concerns
3. Handoff to reconstruction:
   - If the target form is known: proceed to `adapt-architecture` with the minimal core as starting point
   - If the target form is unknown: operate on the minimal core while the target is designed
   - Either way: the system is now flexible enough to be reshaped

**Expected:** A minimal, maintainable system with clearly documented extracted capabilities. The foundation is clean and ready for reconstruction in whatever form is chosen.

**On failure:** If the post-dissolution system is less maintainable than expected, some essential structure was dissolved that should have been preserved. Check the imaginal disc inventory — if a critical capability is missing, it may still be recoverable from the archive. If the minimal core is too minimal to operate, some "replaceable tissue" was actually essential — restore it from the checkpoint.

## Validation

- [ ] Imaginal discs are identified, extracted, and verified in portable form
- [ ] Dissolution sequence is layered from outermost (no dependents) to core
- [ ] Interface archaeology has captured actual (not just documented) behavior
- [ ] Each dissolution layer has a verified checkpoint
- [ ] No essential capability was lost during dissolution
- [ ] Post-dissolution system is minimal, maintainable, and operational
- [ ] Reconstruction manifest documents extracted capabilities and gaps

## Common Pitfalls

- **Dissolving without extracting**: Removing a rigid component before its essential capabilities are extracted destroys irreplaceable knowledge. Always extract imaginal discs first
- **Trusting documentation over observation**: Documented interfaces often diverge from actual behavior. Interface archaeology (Step 3) reveals the truth; documentation shows the intent
- **Dissolving the core first**: Removing load-bearing structures before their dependents are dissolved causes cascading failure. Always work outside-in
- **Complete dissolution**: Dissolving everything to start from scratch sounds clean but loses institutional knowledge, battle-tested edge case handling, and operational continuity. Preserve imaginal discs
- **Dissolution as punishment**: Dissolving a system "because it's bad" without a reconstruction plan creates a vacuum. Dissolution is the preparation for reconstruction, not an end in itself

## Related Skills

- `assess-form` — prerequisite assessment that identifies rigidity and triggers dissolution
- `adapt-architecture` — the reconstruction skill that follows dissolution
- `repair-damage` — for systems that need targeted repair rather than full dissolution
- `build-consensus` — consensus before major dissolution prevents team fragmentation
- `decommission-validated-system` — formal decommissioning process for regulated systems
- `conduct-post-mortem` — post-mortem analysis shares the investigative rigor of dissolution
