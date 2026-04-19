---
name: adapt-architecture
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Execute structural metamorphosis using strangler fig migration, chrysalis
  phases, and interface preservation. Covers transformation planning, parallel
  running, progressive cutover, rollback design, and post-metamorphosis
  stabilization for system architecture evolution. Use when assess-form has
  classified the system as READY for transformation, when migrating from
  monolith to microservices, when replacing a core subsystem while dependents
  continue operating, or when any architectural change must be gradual rather
  than big-bang.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, adaptation, architecture, migration, strangler-fig
---

# Adapt Architecture

Execute structural metamorphosis — transform system architecture from current form to target form while keep operational continuity. Use strangler fig migration, chrysalis phases, interface preservation. System never stops working during transformation.

## When Use

- Form assessment (see `assess-form`) classified system as READY
- System must evolve architecture to meet new requirements without downtime
- Migrating from monolith to microservices (or reverse)
- Replacing core subsystem while dependent systems keep operating
- Evolving data model while keep backward compatibility
- Any architectural change must be gradual, not big-bang

## Inputs

- **Required**: Current form assessment (from `assess-form` or equivalent analysis)
- **Required**: Target architecture (what system should become)
- **Required**: Operational continuity requirements (what must not break during transformation)
- **Optional**: Available transformation budget (time, people, compute)
- **Optional**: Rollback requirements (how far back must retreat?)
- **Optional**: Parallel running duration (how long run old and new together)

## Steps

### Step 1: Design Transformation Blueprint

Plan metamorphosis path from current form to target form.

1. Map transformation as sequence of intermediate forms:
   - Current form → Intermediate form 1 → ... → Target form
   - Each intermediate form must be operationally viable (serves traffic, passes tests)
   - No intermediate form harder to maintain than current form
2. Identify transformation seams:
   - Where can current form be "cut" to insert new architecture?
   - Natural seams: existing interfaces, module boundaries, data partitions
   - Artificial seams: interfaces created specifically to enable cut (anti-corruption layers)
3. Choose metamorphosis pattern:
   - **Strangler fig**: new system grows around old, gradually replaces it
   - **Chrysalis**: old system wrapped in new shell; internals replaced while shell preserves external interface
   - **Budding**: new system grows alongside old; traffic gradually shifts (see `scale-colony` for colony budding)
   - **Metamorphic migration**: phased replacement of components in dependency order (leaves first, roots last)
4. Design interface preservation layer:
   - External consumers must not experience disruption
   - API versioning, backward-compatible contracts, adapter patterns
   - Preservation layer is temporary scaffolding — plan its removal

```
Metamorphosis Patterns:
┌───────────────┬───────────────────────────────────────────────────┐
│ Strangler Fig │ New code intercepts routes one by one;            │
│               │ old code handles everything else until replaced   │
│               │ ┌──────────┐                                     │
│               │ │ Old ████ │ → │ Old ██ New ██ │ → │ New ████ │  │
│               │ └──────────┘                                     │
├───────────────┼───────────────────────────────────────────────────┤
│ Chrysalis     │ Wrap old system in new interface; replace         │
│               │ internals while external shell stays stable       │
│               │ ┌──────────┐     ┌──[new]───┐     ┌──[new]───┐  │
│               │ │ old core │ → │ old core │ → │ new core │  │
│               │ └──────────┘     └──────────┘     └──────────┘  │
├───────────────┼───────────────────────────────────────────────────┤
│ Budding       │ New system runs in parallel; traffic shifts       │
│               │ ┌──────┐ ┌──────┐     ┌──────┐ ┌──────┐         │
│               │ │ Old  │ │ New  │  →  │ Old  │ │ New  │         │
│               │ │ 100% │ │  0%  │     │  0%  │ │ 100% │         │
│               │ └──────┘ └──────┘     └──────┘ └──────┘         │
└───────────────┴───────────────────────────────────────────────────┘
```

**Got:** Transformation blueprint shows intermediate forms, seams, chosen metamorphosis pattern, interface preservation strategy. Each step concrete and testable.

**If fail:** No clean seam? System may need preliminary dissolution (see `dissolve-form`) to create seams before transformation. Intermediate forms not operationally viable? Transformation steps too large — decompose into smaller increments.

### Step 2: Build Scaffolding

Construct temporary infrastructure that supports metamorphosis.

1. Create anti-corruption layer:
   - Thin translation layer between old and new systems
   - Routes requests to appropriate system (old or new) based on migration state
   - Translates data formats between old and new representations
   - This layer is "cocoon" that protects transformation
2. Set up parallel running infrastructure:
   - Both old and new systems must be deployable together
   - Feature flags control which system handles which traffic
   - Comparison mechanisms validate that old and new produce equivalent results
3. Establish rollback checkpoints:
   - At each intermediate form, verify rollback to previous form possible
   - Rollback must be faster than forward transformation step
   - Data migration must be reversible (or data must be dual-written during transition)
4. Build validation harness:
   - Automated tests verify operational continuity at each intermediate form
   - Performance benchmarks detect regression
   - Data integrity checks catch migration errors

**Got:** Scaffolding infrastructure (anti-corruption layer, parallel running, rollback, validation) in place before any transformation begins. Scaffolding itself tested and verified.

**If fail:** Scaffolding too expensive? Simplify: minimum viable scaffolding is feature flag and rollback procedure. Anti-corruption layers and parallel running add safety but not always necessary for smaller transformations.

### Step 3: Execute Progressive Cutover

Migrate functionality from old form to new form incrementally.

1. Order components for migration:
   - Start with least-coupled, lowest-risk component (build confidence)
   - Progress toward more critical, more coupled components
   - Save most coupled/critical component for last (by then team has experience)
2. For each component:
   a. Implement new version behind anti-corruption layer
   b. Run parallel: both old and new process same inputs
   c. Compare outputs — should be equivalent (or differences should be expected and documented)
   d. When confident, switch traffic to new version (feature flag flip)
   e. Monitor for anomalies (increase monitoring sensitivity post-cutover)
   f. After stability period, decommission old version of this component
3. Maintain continuous delivery throughout:
   - Each cutover step is normal deployment, not special event
   - System always in known, tested, operational state
   - Cutover causes issues? Roll back to previous state (still operational)

**Got:** Functionality migrates component by component with validation at each step. System always operational. Each cutover builds confidence for next.

**If fail:** Parallel running reveals discrepancies? New implementation has bug — fix before cutting over. Cutover causes performance degradation? New component may need optimization or anti-corruption layer adding too much overhead. Team loses confidence mid-migration? Pause and stabilize — half-migrated system in known state far better than rushed full migration.

### Step 4: Manage Chrysalis Phase

Navigate most vulnerable period — when system between forms.

1. Acknowledge chrysalis reality:
   - During migration, system is partly old and partly new
   - This hybrid state inherently more complex than either pure state
   - Complexity peaks at midpoint of migration, then decreases
2. Chrysalis discipline:
   - No new features during chrysalis phase (transformation only)
   - Minimal external changes (freeze non-essential deployments)
   - Increased monitoring and on-call coverage
   - Daily check-ins on migration progress and system health
3. Mid-chrysalis assessment:
   - At halfway point, assess: target form still right goal?
   - Anything changed (market, requirements, team) that affects target?
   - Should transformation continue, pause, or redirect?
4. Protect chrysalis:
   - Keep rollback path clear at all times
   - Document current hybrid state thoroughly (future debuggers will need it)
   - Resist temptation to "clean up" temporary scaffolding before migration complete

**Got:** Chrysalis phase managed as deliberate, time-bounded period with increased discipline and monitoring. Team understands temporary complexity is cost of safe transformation.

**If fail:** Chrysalis phase drags too long? Hybrid state becomes new normal — worse than either old or new. Set time limit. Limit reached? Either accelerate remaining migration or accept hybrid state as "new form" and stabilize it.

### Step 5: Complete Metamorphosis and Stabilize

Finish transformation. Remove scaffolding.

1. Final cutover:
   - Migrate last component(s) to new form
   - Run full validation suite against complete new system
   - Performance test under production-equivalent load
2. Remove scaffolding:
   - Decommission anti-corruption layer (no longer needed)
   - Remove feature flags related to migration
   - Clean up parallel running infrastructure
   - Archive (don't delete) old system code for reference
3. Post-metamorphosis stabilization:
   - Run in new form for 2-4 weeks with enhanced monitoring
   - Address any issues that emerge under real-world conditions
   - Update documentation to reflect new architecture
4. Retrospective:
   - What went well in transformation?
   - What was harder than expected?
   - What would do differently next time?
   - Update team's transformation playbook

**Got:** Transformation complete. System operates in new form. Scaffolding removed. Documentation updated. Team captured learnings for future transformations.

**If fail:** New form unstable after cutover? Maintain rollback path and continue stabilization. Stabilization takes more than planned period? Design issue in new architecture — consider whether targeted fixes or partial rollback of most problematic component appropriate.

## Checks

- [ ] Transformation blueprint shows viable intermediate forms
- [ ] Scaffolding (anti-corruption layer, rollback, validation harness) in place before migration starts
- [ ] Components migrate in order from lowest to highest risk
- [ ] Parallel running validates equivalence at each step
- [ ] Chrysalis phase time-bounded with feature freeze discipline
- [ ] All scaffolding removed after transformation completes
- [ ] Post-metamorphosis stabilization period passes without critical issues
- [ ] Retrospective captures learnings

## Pitfalls

- **Big-bang migration**: Transform everything at once. Abandons safety of incremental cutover. Maximizes blast radius. Always migrate incrementally
- **Permanent scaffolding**: Anti-corruption layers and feature flags never removed become technical debt. Plan scaffolding removal as part of transformation, not afterthought
- **Chrysalis denial**: Pretend hybrid state is normal. Leads to feature development on unstable foundations. Acknowledge chrysalis phase and enforce discipline
- **Target fixation**: Becoming so committed to target architecture that signs of better alternative ignored. Mid-chrysalis assessment exists for this reason
- **Transformation fatigue**: Long migrations exhaust teams. Keep each transformation step small enough to complete in days, not weeks. Celebrate milestones to maintain momentum

## See Also

- `assess-form` — prerequisite assessment determines if system ready for transformation
- `dissolve-form` — for systems too rigid to transform directly; dissolution creates seams needed here
- `repair-damage` — recovery skill for when transformation introduces damage
- `shift-camouflage` — surface adaptation may suffice without deep architectural change
- `coordinate-swarm` — swarm coordination informs sequencing of transformation across distributed systems
- `scale-colony` — growth pressure is common trigger for architectural adaptation
- `implement-gitops-workflow` — GitOps provides deployment infrastructure for progressive cutover
- `review-software-architecture` — complementary review skill for evaluating target architecture
