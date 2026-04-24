---
name: dissolve-form
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Controlled dismantling of rigid system structures. Dissolve calcified architecture, technical debt, organizational rigidity. Preserve essential capabilities ("imaginal discs") that seed new form.

## When Use

- Form assessment (see `assess-form`) classified system as PREPARE or CRITICAL (too rigid to transform directly)
- System so calcified, incremental change impossible
- Technical debt compounded — blocks all forward progress
- Organizational structure rigid, can't adapt to new requirements
- Before `adapt-architecture` when current form must soften before reshape
- Legacy system decommissioning — extract value before shutdown

## Inputs

- **Required**: Form assessment showing high rigidity (from `assess-form`)
- **Required**: Essential capabilities to preserve (imaginal discs) identified
- **Optional**: Target form (what emerges after dissolution; may be unknown)
- **Optional**: Dissolution timeline + constraints
- **Optional**: Stakeholder concerns about specific components
- **Optional**: Previous dissolution attempts + outcomes

## Steps

### Step 1: Identify Imaginal Discs

In biological metamorphosis, imaginal discs are clusters of cells within the caterpillar that survive dissolution and become the butterfly's organs. Identify essential capabilities that must survive.

1. Catalog every capability current system provides:
   - User-facing features
   - Data processing functions
   - Integration points with external systems
   - Institutional knowledge embedded in code/process
   - Business rules (often implicit, undocumented)
2. Classify each capability:
   - **Imaginal disc** (must survive): core business logic, critical integrations, irreplaceable data
   - **Replaceable tissue** (can rebuild): UI, infrastructure, standard algorithms
   - **Dead tissue** (must not survive): workarounds for bugs gone, compatibility shims for dead systems, features nobody uses
3. Extract imaginal discs into portable form:
   - Document business rules explicitly (may only exist as code comments or tribal knowledge)
   - Extract critical algorithms into standalone, tested modules
   - Export essential data in format-independent representations
   - Record integration contracts + their actual (not documented) behavior

**Got:** Clear inventory of capabilities classified: essential (preserve), replaceable (rebuild), dead (discard). Essential capabilities extracted into portable form before dissolution begins.

**If fail:** Imaginal disc identification uncertain (stakeholders disagree on what's essential)? Err on side of preservation. Extract more capabilities than you think needed — discarding after dissolution is easy; recovering lost knowledge often impossible.

### Step 2: Map Dissolution Sequence

Determine order structural elements dissolve — outer layers first, core last.

1. Order by dependency depth:
   - Layer 1 (outermost): components with no dependents — nothing breaks when removed
   - Layer 2: components whose dependents are only Layer 1 items (already dissolved)
   - Layer 3: components with deeper dependencies — removing these needs careful interface management
   - Layer N (core): load-bearing components everything depends on — dissolved last
2. For each layer, define:
   - What dissolves (removed, decommissioned, archived)
   - What replaces it (new component, nothing, or temporary stub)
   - What interfaces must be maintained for remaining layers
   - How to verify system still functions after layer dissolved
3. Create dissolution checkpoints:
   - After each layer, remaining system must be tested + verified operational
   - Each checkpoint = stable state from which dissolution can pause
   - Layer's dissolution causes unexpected breakage? Restore from previous checkpoint

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

**Got:** Layer-ordered dissolution sequence. Each step safe (checkpoint verified) + reversible (previous checkpoint restorable). Most critical components dissolved last — when team has most experience + confidence.

**If fail:** Dependency mapping reveals circular dependencies (A depends on B depends on A)? Cycles must be broken before sequenced dissolution possible. Introduce interface between A + B, break cycle, then proceed.

### Step 3: Perform Interface Archaeology

Before dissolving rigid structures, excavate + document their actual interfaces — not what's documented, but what's actually in use.

1. Instrument current interfaces:
   - Log every call, message, or data exchange at each interface
   - Run for at least one full business cycle (daily, weekly, monthly — whatever relevant)
   - Capture actual payload shapes, not just documented schemas
2. Compare actual vs documented behavior:
   - What documented interfaces are never called? (candidates for Layer 1 dissolution)
   - What undocumented interfaces are actively used? (hidden dependencies — must be preserved or explicitly replaced)
   - What edge cases does actual traffic reveal that docs don't mention?
3. Build interface contract from actual behavior:
   - Contract becomes specification for any replacement
   - Include real examples of inputs + outputs
   - Document error handling behavior (what actually happens, not what should happen)

**Got:** Empirically-derived interface contract accurately represents how system actually communicates, incl undocumented behaviors + hidden dependencies.

**If fail:** Instrumentation too invasive (impacts performance or needs code changes)? Sample traffic instead of capturing everything. Business cycle too long to wait? Use available data plus stakeholder interviews about "what calls what in which situations."

### Step 4: Execute Controlled Dissolution

Systematically remove structural elements while maintaining imaginal disc viability.

1. Begin with Layer 1 (outermost, no dependents):
   - Remove dead features + unused code
   - Archive (don't delete) for reference
   - Verify: system still passes all tests, no runtime errors
2. Progress through each layer:
   - For each component being dissolved:
     a. Verify imaginal discs extracted (Step 1)
     b. Install replacement or stub (if dependents remain)
     c. Remove component
     d. Run validation suite
     e. Monitor for unexpected side effects
   - At each checkpoint: document current system state, verify operational status
3. Handle dissolution resistance:
   - Some components resist dissolution (hidden dependencies surface)
   - Removal causes unexpected breakage?
     a. Restore from checkpoint
     b. Investigate hidden dependency
     c. Add to interface archaeology (Step 3)
     d. Create explicit stub for dependency
     e. Re-attempt dissolution
4. Track dissolution progress:
   - Components remaining vs dissolved
   - Imaginal discs extracted + verified portable
   - Unexpected dependencies discovered + handled

**Got:** Systematic, verified dissolution of non-essential structure. After each layer, remaining system smaller, simpler, still operational. Imaginal discs preserved in portable form.

**If fail:** Dissolution causes cascading failures? Layer ordering wrong — hidden dependencies deeper than expected. Stop, restore, remap dependencies, re-sequence. Dissolution reveals "imaginal disc" more complex than expected? Allocate more extraction time for that capability.

### Step 5: Prepare Foundation for Reconstruction

After dissolution, remaining system should be minimal viable core plus extracted imaginal discs ready for reconstruction.

1. Assess post-dissolution state:
   - What remains? (minimal operational core + extracted capabilities)
   - Is remaining system maintainable? (can team understand + modify it)
   - Are all imaginal discs accessible + verified? (portable, tested, documented)
2. Create reconstruction manifest:
   - List each imaginal disc with contract, data, test suite
   - Specify target architecture for reconstruction (or mark "to be determined")
   - Identify gaps: capabilities partially extracted or with quality concerns
3. Handoff to reconstruction:
   - Target form known? Proceed to `adapt-architecture` with minimal core as starting point
   - Target form unknown? Operate on minimal core while target designed
   - Either way: system now flexible enough to reshape

**Got:** Minimal, maintainable system with clearly documented extracted capabilities. Foundation clean, ready for reconstruction in whatever form chosen.

**If fail:** Post-dissolution system less maintainable than expected? Some essential structure was dissolved that should have been preserved. Check imaginal disc inventory — critical capability missing? May still be recoverable from archive. Minimal core too minimal to operate? Some "replaceable tissue" was actually essential — restore from checkpoint.

## Checks

- [ ] Imaginal discs identified, extracted, verified in portable form
- [ ] Dissolution sequence layered outermost (no dependents) to core
- [ ] Interface archaeology captured actual (not just documented) behavior
- [ ] Each dissolution layer has verified checkpoint
- [ ] No essential capability lost during dissolution
- [ ] Post-dissolution system minimal, maintainable, operational
- [ ] Reconstruction manifest documents extracted capabilities + gaps

## Pitfalls

- **Dissolving without extracting**: Removing rigid component before essential capabilities extracted destroys irreplaceable knowledge. Always extract imaginal discs first.
- **Trusting docs over observation**: Documented interfaces often diverge from actual behavior. Interface archaeology (Step 3) reveals truth; documentation shows intent.
- **Dissolving core first**: Removing load-bearing structures before their dependents dissolved → cascading failure. Always work outside-in.
- **Complete dissolution**: Dissolving everything to start from scratch sounds clean but loses institutional knowledge, battle-tested edge case handling, operational continuity. Preserve imaginal discs.
- **Dissolution as punishment**: Dissolving system "because bad" without reconstruction plan creates vacuum. Dissolution = preparation for reconstruction, not end in itself.

## See Also

- `assess-form` — prerequisite assessment identifies rigidity + triggers dissolution
- `adapt-architecture` — reconstruction skill that follows dissolution
- `repair-damage` — for systems needing targeted repair rather than full dissolution
- `build-consensus` — consensus before major dissolution stops team fragmentation
- `decommission-validated-system` — formal decommissioning process for regulated systems
- `conduct-post-mortem` — post-mortem analysis shares investigative rigor of dissolution
