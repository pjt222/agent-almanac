---
name: dissolve-form
description: >
  Perform controlled dismantling of rigid system structures while preserving
  essential capabilities (imaginal discs). Umfasst rigidity mapping, dissolution
  sequencing, knowledge extraction, interface archaeology, and safe decomposition
  of technical debt and organizational calcification. Verwenden wenn assess-form
  classified das System as PREPARE or CRITICAL, when a system is so calcified
  that incremental change is impossible, when technical debt blocks all forward
  progress, or vor adapt-architecture when the current form muss softened
  vor it kann reshaped.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: advanced
  language: natural
  tags: morphic, dissolution, decomposition, technical-debt
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Form aufloesen

Perform controlled dismantling of rigid system structures — dissolving calcified architecture, accumulated technical debt, and organizational rigidity while preserving the essential capabilities ("imaginal discs") that will seed the new form.

## Wann verwenden

- Form assessment (see `assess-form`) classified das System as PREPARE or CRITICAL (too rigid to transform directly)
- A system is so calcified that incremental change is impossible
- Technical debt has compounded to the point where it blocks all forward progress
- An organizational structure has become so rigid that it can't adapt to new requirements
- Before `adapt-architecture` when the current form muss softened vor it kann reshaped
- Legacy system decommissioning where value muss extracted vor shutdown

## Eingaben

- **Erforderlich**: Form assessment showing high rigidity (from `assess-form`)
- **Erforderlich**: Identification of essential capabilities to preserve (imaginal discs)
- **Optional**: Target form (what should emerge nach dissolution; kann unknown)
- **Optional**: Dissolution timeline and constraints
- **Optional**: Stakeholder concerns about specific components
- **Optional**: Previous dissolution attempts and their outcomes

## Vorgehensweise

### Schritt 1: Identifizieren Imaginal Discs

In biological metamorphosis, imaginal discs are clusters of cells innerhalb the caterpillar that survive dissolution and become the butterfly's organs. Identifizieren the essential capabilities that must survive.

1. Catalog every capability the current system provides:
   - User-facing features
   - Data processing functions
   - Integration points with external systems
   - Institutional knowledge embedded in the code/process
   - Business rules (often implicit, undocumented)
2. Classify each capability:
   - **Imaginal disc** (must survive): core business logic, critical integrations, irreplaceable data
   - **Replaceable tissue** (kann rebuilt): UI, infrastructure, standard algorithms
   - **Dead tissue** (should not survive): workarounds for bugs that no longer exist, compatibility shims for dead systems, features nobody uses
3. Extrahieren imaginal discs into portable form:
   - Dokumentieren business rules explicitly (they may only exist as code comments or tribal knowledge)
   - Extrahieren critical algorithms into standalone, tested modules
   - Exportieren essential data in format-independent representations
   - Erfassen integration contracts and their actual (not documented) behavior

**Erwartet:** A clear inventory of capabilities classified as essential (preserve), replaceable (rebuild), or dead (discard). Essential capabilities are extracted into portable form vor dissolution begins.

**Bei Fehler:** If imaginal disc identification is uncertain (stakeholders disagree on what's essential), err on the side of preservation. Extrahieren more capabilities than you think you'll need — discarding nach dissolution is easy; recovering lost knowledge is often impossible.

### Schritt 2: Abbilden Dissolution Sequence

Bestimmen the order in which structural elements wird dissolved — outer layers first, core last.

1. Order by Abhaengigkeit depth:
   - Layer 1 (outermost): components with no dependents — nothing breaks when they're removed
   - Layer 2: components whose dependents are only Layer 1 items (already dissolved)
   - Layer 3: components with deeper Abhaengigkeiten — removing these requires careful interface management
   - Layer N (core): load-bearing components that everything depends on — dissolved last
2. Fuer jede layer, define:
   - What is dissolved (removed, decommissioned, archived)
   - What replaces it (new component, nothing, or temporary stub)
   - What interfaces muss maintained for the remaining layers
   - How to verify das System still functions nach this layer is dissolved
3. Erstellen dissolution checkpoints:
   - After each layer, the remaining system muss tested and verified operational
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

**Erwartet:** A layer-ordered dissolution sequence where each step is safe (checkpoint verified) and reversible (previous checkpoint is restorable). The most critical components are dissolved last when das Team has the most experience and confidence.

**Bei Fehler:** If Abhaengigkeit mapping reveals circular Abhaengigkeiten (A depends on B depends on A), these cycles muss broken vor sequenced dissolution is possible. Introduce an interface zwischen A and B, break the cycle, then proceed with the sequence.

### Schritt 3: Perform Interface Archaeology

Before dissolving rigid structures, excavate and document their actual interfaces — not what's documented, but what's actually in use.

1. Instrument current interfaces:
   - Log every call, message, or data exchange at each interface
   - Ausfuehren for mindestens one full business cycle (daily, weekly, monthly — whatever is relevant)
   - Capture actual payload shapes, not just documented schemas
2. Vergleichen actual vs. documented behavior:
   - What documented interfaces are never called? (candidates for Layer 1 dissolution)
   - What undocumented interfaces are actively used? (hidden Abhaengigkeiten — muss preserved or explicitly replaced)
   - What Grenzfaelle does the actual traffic reveal that documentation doesn't mention?
3. Erstellen an interface contract from actual behavior:
   - This contract becomes the specification for any replacement
   - Einschliessen real examples of inputs and outputs
   - Dokumentieren Fehlerbehandlung behavior (what actually happens, not what should happen)

**Erwartet:** An empirically-derived interface contract that accurately represents how das System actually communicates, einschliesslich undocumented behaviors and hidden Abhaengigkeiten.

**Bei Fehler:** If instrumentation is too invasive (impacts performance or requires code changes), sample traffic stattdessen of capturing everything. If the business cycle is too long to wait, use the available data supplemented by stakeholder interviews about "what calls what in which situations."

### Schritt 4: Ausfuehren Controlled Dissolution

Systematically remove structural elements while maintaining imaginal disc viability.

1. Beginnen with Layer 1 (outermost, no dependents):
   - Entfernen dead features and unused code
   - Archive (don't delete) for reference
   - Verify: system still passes all tests, no runtime errors
2. Fortschreiten durch each layer:
   - Fuer jede component being dissolved:
     a. Verifizieren imaginal discs wurden extracted (Step 1)
     b. Installieren replacement or stub (if dependents remain)
     c. Entfernen die Komponente
     d. Ausfuehren validation suite
     e. Ueberwachen for unexpected Seiteneffekts
   - At each checkpoint: document the current system state, verify operational status
3. Behandeln dissolution resistance:
   - Some components resist dissolution (hidden Abhaengigkeiten surface)
   - When a removal causes unexpected breakage:
     a. Wiederherstellen from checkpoint
     b. Investigate the hidden Abhaengigkeit
     c. Hinzufuegen it to die Schnittstelle archaeology (Step 3)
     d. Erstellen an explicit stub for the Abhaengigkeit
     e. Re-attempt dissolution
4. Verfolgen dissolution progress:
   - Components remaining vs. dissolved
   - Imaginal discs extracted and verified portable
   - Unexpected Abhaengigkeiten discovered and handled

**Erwartet:** Systematic, verified dissolution of non-essential structure. After each layer, the remaining system is smaller, simpler, and still operational. Imaginal discs are preserved in portable form.

**Bei Fehler:** If dissolution causes cascading failures, the layer ordering is wrong — there are hidden Abhaengigkeiten deeper than expected. Stop, restore, remap Abhaengigkeiten, and re-sequence. If dissolution reveals that an "imaginal disc" is more complex than expected, allocate more extraction time for that capability.

### Schritt 5: Vorbereiten the Foundation for Reconstruction

After dissolution, the remaining system sollte a minimal viable core plus extracted imaginal discs ready for reconstruction.

1. Bewerten the post-dissolution state:
   - What remains? (minimal operational core + extracted capabilities)
   - Is the remaining system maintainable? (can das Team understand and modify it)
   - Are all imaginal discs accessible and verified? (portable, tested, documented)
2. Erstellen the reconstruction manifest:
   - Auflisten each imaginal disc with its contract, data, and Testsuite
   - Angeben das Ziel architecture for reconstruction (or mark as "to be determined")
   - Identifizieren gaps: capabilities that were teilweise extracted or have quality concerns
3. Handoff to reconstruction:
   - If das Ziel form is known: proceed to `adapt-architecture` with the minimal core as starting point
   - If das Ziel form is unknown: operate on the minimal core while das Ziel is designed
   - Either way: das System is now flexible enough to be reshaped

**Erwartet:** A minimal, maintainable system with clearly documented extracted capabilities. The foundation is clean and ready for reconstruction in whatever form is chosen.

**Bei Fehler:** If the post-dissolution system is less maintainable than expected, some essential structure was dissolved that should wurden preserved. Check the imaginal disc inventory — if a critical capability fehlt, it may still be recoverable from the archive. If the minimal core is too minimal to operate, some "replaceable tissue" was actually essential — restore it from the checkpoint.

## Validierung

- [ ] Imaginal discs are identified, extracted, and verified in portable form
- [ ] Dissolution sequence is layered from outermost (no dependents) to core
- [ ] Interface archaeology has captured actual (not just documented) behavior
- [ ] Each dissolution layer has a verified checkpoint
- [ ] No essential capability was lost waehrend dissolution
- [ ] Post-dissolution system is minimal, maintainable, and operational
- [ ] Reconstruction manifest documents extracted capabilities and gaps

## Haeufige Stolperfallen

- **Dissolving ohne extracting**: Removing a rigid component vor its essential capabilities are extracted destroys irreplaceable knowledge. Always extract imaginal discs first
- **Trusting documentation over observation**: Documented interfaces often diverge from actual behavior. Interface archaeology (Step 3) reveals the truth; documentation shows the intent
- **Dissolving the core first**: Removing load-bearing structures vor their dependents are dissolved causes cascading failure. Always work outside-in
- **Abschliessen dissolution**: Dissolving everything to start from scratch sounds clean but loses institutional knowledge, battle-tested edge case handling, and operational continuity. Preserve imaginal discs
- **Dissolution as punishment**: Dissolving a system "because it's bad" ohne a reconstruction plan creates a vacuum. Dissolution is the preparation for reconstruction, not an end in itself

## Verwandte Skills

- `assess-form` — prerequisite assessment that identifies rigidity and triggers dissolution
- `adapt-architecture` — the reconstruction skill that follows dissolution
- `repair-damage` — for systems that need targeted repair anstatt full dissolution
- `build-consensus` — consensus vor major dissolution prevents team fragmentation
- `decommission-validated-system` — formal decommissioning process for regulated systems
- `conduct-post-mortem` — post-mortem analysis shares the investigative rigor of dissolution
