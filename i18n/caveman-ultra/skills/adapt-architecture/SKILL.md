---
name: adapt-architecture
locale: caveman-ultra
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

Structural metamorphosis → system transform current → target form. Strangler fig, chrysalis, interface preserve → never stops.

## Use When

- `assess-form` → READY
- Evolve architecture, no downtime
- Monolith ↔ microservices
- Replace core subsystem, dependents keep running
- Data model evolve w/ backward compat
- Gradual, not big-bang

## In

- **Required**: Current form assessment (`assess-form`)
- **Required**: Target architecture
- **Required**: Operational continuity reqs
- **Optional**: Transform budget (time, people, compute)
- **Optional**: Rollback reqs
- **Optional**: Parallel run duration

## Do

### Step 1: Blueprint

Plan path current → target.

1. Sequence of intermediate forms:
   - Current → Intermediate 1 → ... → Target
   - Each intermediate operationally viable
   - No intermediate harder to maintain
2. Seams:
   - Where cut current to insert new?
   - Natural: interfaces, module bounds, data partitions
   - Artificial: anti-corruption layers
3. Pattern:
   - **Strangler fig**: new grows around old, replaces gradually
   - **Chrysalis**: wrap old, replace internals, shell preserves external interface
   - **Budding**: parallel, traffic shifts (see `scale-colony`)
   - **Metamorphic migration**: phased in dep order (leaves→roots)
4. Interface preservation layer:
   - External consumers no disrupt
   - API versioning, backward-compat, adapters
   - Temp scaffold → plan removal

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

**→** Blueprint: intermediate forms, seams, pattern, preservation strategy. Concrete + testable.

**If err:** No clean seam → preliminary dissolution (`dissolve-form`) first. Intermediates not viable → steps too large → decompose.

### Step 2: Scaffold

Temp infra → supports metamorphosis.

1. Anti-corruption layer:
   - Thin translation old ↔ new
   - Routes reqs → correct system per migration state
   - Translates data formats
   - "Cocoon" protects transform
2. Parallel run infra:
   - Both systems deployable simultaneously
   - Feature flags → traffic routing
   - Comparison validates equivalence
3. Rollback checkpoints:
   - Each intermediate → rollback possible
   - Rollback faster than forward step
   - Data migration reversible (or dual-write during transition)
4. Valid. harness:
   - Auto tests → operational continuity
   - Perf benchmarks → regression detection
   - Data integrity checks

**→** Scaffold (anti-corruption, parallel, rollback, valid.) in place pre-transform. Scaffold itself tested.

**If err:** Too expensive → simplify. Minimum: feature flag + rollback proc. Anti-corruption + parallel optional for small transforms.

### Step 3: Progressive Cutover

Migrate incrementally.

1. Order components:
   - Start least-coupled, lowest-risk → build confidence
   - Progress → more critical
   - Most coupled/critical last
2. Per component:
   a. Impl new ver behind anti-corruption layer
   b. Parallel: both process same in
   c. Compare out → equivalent (or differences documented)
   d. Confident → flip feature flag → switch traffic
   e. Monitor anomalies (increased sensitivity)
   f. Stable → decommission old ver
3. Continuous delivery:
   - Each cutover = normal deploy, not event
   - System always known, tested, operational
   - Issue → rollback → prev state operational

**→** Functionality migrates component-by-component w/ valid. at each step. System always operational.

**If err:** Parallel reveals discrepancies → new impl bug → fix before cutover. Perf degrade → optimize new or anti-corruption layer too heavy. Team loses confidence → pause + stabilize. Half-migrated known > rushed full.

### Step 4: Chrysalis Phase

Manage most vulnerable period — system between forms.

1. Chrysalis reality:
   - Partly old + partly new during migration
   - Hybrid more complex than pure state
   - Complexity peaks at midpoint
2. Discipline:
   - No new features during chrysalis
   - Freeze non-essential deploys
   - Increased monitoring + on-call
   - Daily check-ins
3. Mid-chrysalis assessment:
   - Halfway → target still right?
   - Market/reqs/team change?
   - Continue, pause, redirect?
4. Protect:
   - Rollback path clear always
   - Doc hybrid state → future debuggers need
   - Resist "clean up" scaffold pre-complete

**→** Chrysalis = deliberate, time-bounded, increased discipline + monitoring. Temp complexity = cost of safe transform.

**If err:** Drags too long → hybrid = new normal = worse than either. Set time limit. Limit hit → accelerate or accept hybrid as "new form".

### Step 5: Complete + Stabilize

Finish + remove scaffold.

1. Final cutover:
   - Migrate last components
   - Full valid. against complete new system
   - Perf test under prod load
2. Remove scaffold:
   - Decommission anti-corruption layer
   - Remove migration feature flags
   - Clean up parallel infra
   - Archive (don't delete) old code
3. Post-metamorphosis stabilization:
   - Run new form 2-4 weeks w/ enhanced monitoring
   - Address real-world issues
   - Update docs → new architecture
4. Retrospective:
   - What went well?
   - Harder than expected?
   - Do differently next?
   - Update playbook

**→** Transform complete. System new form. Scaffold removed. Docs updated. Team captured learnings.

**If err:** New form unstable post-cutover → maintain rollback, continue stabilize. Stabilize > planned period → design issue → targeted fixes or partial rollback worst component.

## Check

- [ ] Blueprint shows viable intermediates
- [ ] Scaffold in place pre-migration
- [ ] Components migrate low→high risk
- [ ] Parallel validates equivalence each step
- [ ] Chrysalis time-bounded + feature freeze
- [ ] All scaffold removed post-transform
- [ ] Post-metamorphosis stabilization passes
- [ ] Retro captures learnings

## Traps

- **Big-bang**: Transform all at once → abandons incremental safety → max blast radius. Always incremental.
- **Permanent scaffold**: Never removed → tech debt. Plan removal part of transform.
- **Chrysalis denial**: Pretending hybrid normal → features on unstable foundation. Enforce discipline.
- **Target fixation**: Better alternative signs ignored. Mid-chrysalis assessment exists for this.
- **Transform fatigue**: Long migrations exhaust teams. Days, not weeks per step. Celebrate milestones.

## →

- `assess-form` — prereq assessment
- `dissolve-form` — rigid systems → create seams
- `repair-damage` — recovery when transform damages
- `shift-camouflage` — surface adapt may suffice
- `coordinate-swarm` — swarm sequencing across distributed
- `scale-colony` — growth pressure triggers architectural adapt
- `implement-gitops-workflow` — GitOps deploy infra for cutover
- `review-software-architecture` — evaluate target architecture
