---
name: dissolve-form
locale: caveman-ultra
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

Controlled dismantle of rigid systems → dissolve calcified arch + tech debt + org rigidity, preserve imaginal discs → seed new form.

## Use When

- `assess-form` → PREPARE or CRITICAL (too rigid to transform direct)
- So calcified incremental change impossible
- Tech debt blocks all fwd progress
- Org structure too rigid for new reqs
- Before `adapt-architecture` → soften before reshape
- Legacy decommission → extract value before shutdown

## In

- **Required**: Form assessment → high rigidity (`assess-form`)
- **Required**: ID essential capabilities → preserve (imaginal discs)
- **Optional**: Target form (post-dissolve; may be unknown)
- **Optional**: Timeline + constraints
- **Optional**: Stakeholder concerns on specific components
- **Optional**: Prior dissolve attempts + outcomes

## Do

### Step 1: ID Imaginal Discs

Bio metamorphosis → imaginal discs = cell clusters in caterpillar → survive dissolve → become butterfly organs. ID what must survive.

1. Catalog every capability:
   - User features
   - Data processing
   - External integrations
   - Institutional knowledge in code/process
   - Business rules (often implicit, undoc)
2. Classify:
   - **Imaginal disc** (must survive): core biz logic, critical integrations, irreplaceable data
   - **Replaceable tissue** (rebuild): UI, infra, standard algos
   - **Dead tissue** (discard): workarounds for fixed bugs, shims for dead systems, unused features
3. Extract imaginal discs → portable:
   - Doc biz rules explicit (may only exist as comments or tribal)
   - Extract algos → standalone tested modules
   - Export data → format-independent
   - Record integration contracts + actual (not doc) behavior

→ Clear capability inventory: preserve/rebuild/discard. Essentials extracted portable before dissolve starts.

If err: imaginal disc ID uncertain (stakeholder disagree) → err on preserve side. Extract more than need → discard after dissolve easy, recover lost knowledge often impossible.

### Step 2: Map Dissolve Sequence

Order → outer layers first, core last.

1. Order by dep depth:
   - L1 (outermost): no dependents → nothing breaks on remove
   - L2: dependents only in L1 (already dissolved)
   - L3: deeper deps → careful interface mgmt
   - LN (core): load-bearing → dissolved last
2. Per layer:
   - What dissolved (removed, decommission, archive)
   - What replaces (new comp, nothing, stub)
   - Interfaces to maintain for remaining layers
   - How verify post-dissolve
3. Dissolve checkpoints:
   - Post-layer → tested + verified operational
   - Each checkpoint = stable state → pause poss
   - If layer dissolve breaks → restore prior checkpoint

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

→ Layer-ordered sequence, each step safe (checkpoint) + reversible (prior checkpoint restorable). Most critical dissolved last when team has most exp + confidence.

If err: dep mapping reveals circular (A→B→A) → break cycle first. Add interface A↔B, break cycle, then proceed.

### Step 3: Interface Archaeology

Before dissolve → excavate + doc actual interfaces, not documented, actual in use.

1. Instrument interfaces:
   - Log every call/msg/exchange at each interface
   - Run ≥1 full biz cycle (daily/weekly/monthly)
   - Capture actual payload shapes, not just doc schemas
2. Compare actual vs documented:
   - Doc interfaces never called? (L1 candidates)
   - Undoc interfaces actively used? (hidden deps → preserve or explicit replace)
   - Edge cases in traffic doc doesn't mention
3. Build contract from actual behavior:
   - Contract → spec for replacement
   - Real input/output examples
   - Doc actual error handling (not should-be)

→ Empirical contract: actual communication + undoc behaviors + hidden deps.

If err: instrumentation too invasive (perf or code changes) → sample traffic. Biz cycle too long → available data + stakeholder interviews on "what calls what when".

### Step 4: Execute Dissolve

Systematic remove + maintain imaginal disc viability.

1. Start L1 (outermost, no dependents):
   - Remove dead features + unused code
   - Archive (don't delete) for reference
   - Verify: all tests pass, no runtime errs
2. Per layer:
   - Per component dissolved:
     a. Verify imaginal discs extracted (Step 1)
     b. Install replacement or stub (if dependents remain)
     c. Remove component
     d. Run valid. suite
     e. Monitor for side effects
   - Per checkpoint: doc state + verify operational
3. Handle resistance:
   - Some resist (hidden deps surface)
   - When remove breaks:
     a. Restore checkpoint
     b. Investigate hidden dep
     c. Add to interface archaeology (Step 3)
     d. Explicit stub for dep
     e. Re-attempt
4. Track progress:
   - Components remaining vs dissolved
   - Imaginal discs extracted + verified portable
   - Unexpected deps found + handled

→ Systematic verified dissolve of non-essential. Post-layer: smaller, simpler, operational. Imaginal discs preserved portable.

If err: cascading failure → layer order wrong, hidden deps deeper than expected. Stop, restore, remap deps, re-sequence. Imaginal disc more complex than expected → more extract time.

### Step 5: Prep Foundation for Reconstruction

Post-dissolve → minimal viable core + extracted imaginal discs ready.

1. Assess post-state:
   - What remains? (minimal core + extracted capabilities)
   - Maintainable? (team understands + modifies)
   - All imaginal discs accessible + verified? (portable + tested + doc'd)
2. Reconstruction manifest:
   - Per disc: contract + data + test suite
   - Target arch (or TBD)
   - Gaps: partial extracts or quality concerns
3. Handoff:
   - Target known → `adapt-architecture` w/ minimal core
   - Target unknown → operate on minimal core while designing
   - Either way: system flexible → reshape-able

→ Minimal maintainable system + doc'd extracted capabilities. Foundation clean, ready for reconstruction in any form.

If err: post-state less maintainable than expected → some essential was dissolved. Check imaginal disc inventory → if critical capability missing, may still be in archive. Minimal core too minimal → "replaceable" was actually essential → restore from checkpoint.

## Check

- [ ] Imaginal discs IDed + extracted + verified portable
- [ ] Sequence: outermost (no dependents) → core
- [ ] Interface archaeology → actual (not just doc) behavior
- [ ] Each layer verified checkpoint
- [ ] No essential lost
- [ ] Post-state minimal + maintainable + operational
- [ ] Reconstruction manifest: capabilities + gaps

## Traps

- **Dissolve w/o extract**: Remove rigid component before extract → destroys irreplaceable knowledge. Extract imaginal discs first.
- **Trust docs over observation**: Docs often diverge from actual. Interface archaeology reveals truth, docs show intent.
- **Core first**: Load-bearing before dependents → cascading failure. Outside-in.
- **Total dissolve**: Everything gone "clean slate" → lose institutional knowledge, edge-case handling, operational continuity. Preserve imaginal discs.
- **Dissolve as punishment**: "Because it's bad" w/o reconstruction plan → vacuum. Dissolve is prep for rebuild, not end itself.

## →

- `assess-form` — prereq assessment → IDs rigidity, triggers dissolve
- `adapt-architecture` — reconstruction after dissolve
- `repair-damage` — targeted repair vs full dissolve
- `build-consensus` — consensus before dissolve → prevents team fragmentation
- `decommission-validated-system` — formal decommission for regulated
- `conduct-post-mortem` — shares investigative rigor w/ dissolve
