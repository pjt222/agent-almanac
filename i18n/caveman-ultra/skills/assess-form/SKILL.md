---
name: assess-form
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Evaluate a system's current structural form, identify transformation pressure,
  and classify transformation readiness. Covers structural inventory, pressure
  mapping, rigidity assessment, change capacity estimation, and readiness
  classification for architectural metamorphosis. Use before any significant
  architectural change to understand the starting point, when a system feels
  stuck without clear reasons, when external pressure from growth or tech debt
  is mounting, or as periodic health checks for long-lived systems.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: basic
  language: natural
  tags: morphic, assessment, architecture, transformation-readiness
---

# Assess Form

Eval current structural form — architecture, rigidity, pressure pts, capacity for change → transformation readiness pre-metamorphosis.

## Use When

- Before significant architectural change → understand starting pt
- System feels "stuck" + reasons unclear
- External pressure (growth, market shift, tech debt) mounting + response uncertain
- Assess proposed transformation feasible given current form
- Periodic health checks long-lived systems (annual form assessment)
- Complementing `adapt-architecture` — assess first, then transform

## In

- **Required**: System (codebase, organization, infrastructure, process)
- **Optional**: Proposed transformation direction (what system need to become?)
- **Optional**: Known pain pts or pressure srcs
- **Optional**: Previous transformation attempts + outcomes
- **Optional**: Time horizon for potential transformation
- **Optional**: Available resources for transformation

## Do

### Step 1: Inventory Current Form

Catalog structural elements no judgment — understand what exists pre-eval.

1. Map structural components:
   - **Modules**: distinct functional units (services, teams, pkgs, depts)
   - **Interfaces**: how modules connect (APIs, protocols, contracts, reporting)
   - **Data flows**: info movement
   - **Dependencies**: what depends on what (direct, transitive, circular)
   - **Load-bearing**: components everything else relies on
2. Doc form's age + history:
   - When each major component introduced?
   - Which changed recently vs static?
   - "Geological layer" structure (old core, newer additions, recent patches)?
3. ID "skeleton" vs "flesh":
   - Skeleton: structural decisions extremely costly to change (lang, DB, deploy model)
   - Flesh: functional decisions easier to change (business logic, UI, config)

```
Structural Inventory Template:
┌──────────────┬──────────┬────────────┬───────────────────┬──────────┐
│ Component    │ Age      │ Last       │ Dependencies      │ Type     │
│              │          │ Modified   │ (in / out)        │          │
├──────────────┼──────────┼────────────┼───────────────────┼──────────┤
│ Auth service │ 3 years  │ 6 months   │ In: 12 / Out: 3  │ Skeleton │
│ Dashboard UI │ 1 year   │ 2 weeks    │ In: 2 / Out: 5   │ Flesh    │
│ Data pipeline│ 4 years  │ 1 year     │ In: 3 / Out: 8   │ Skeleton │
│ Config store │ 2 years  │ 3 months   │ In: 0 / Out: 15  │ Skeleton │
└──────────────┴──────────┴────────────┴───────────────────┴──────────┘
```

**→** Complete structural inventory: components + ages + mod recency + dep profiles + skeleton/flesh classification. "X-ray" of current form.

**If err:** Inventory incomplete (components unknown/undocumented) → finding — form has opacity = transformation risk. Doc what you can, flag unknowns, plan discovery gaps.

### Step 2: Map Transformation Pressure

Forces pushing change + forces resisting.

1. Catalog external pressures (demanding change):
   - Growth: current form can't handle increasing load
   - Market: competitors/users demand capabilities
   - Technology: underlying becoming obsolete/unsupported
   - Regulatory: compliance reqs current form doesn't meet
   - Integration: must connect w/ systems current form wasn't designed for
2. Catalog internal pressures (demanding change from within):
   - Tech debt: accumulated shortcuts slow dev
   - Knowledge concentration: critical knowledge in too few ppl
   - Morale: team frustration w/ current form
   - Operational burden: maintenance cost consuming dev resources
3. Catalog resistance forces (opposing change):
   - Inertia: existing form works "well enough"
   - Dep lock-in: too many things depend on current form
   - Knowledge loss risk: transformation may destroy institutional knowledge
   - Cost: transformation reqs investment uncertain return
   - Fear: previous attempts failed

**→** Pressure map showing direction + magnitude. Pressure significantly > resistance → transformation overdue. Resistance significantly > pressure → transformation fails w/o first reducing resistance.

**If err:** Balanced picture (neither strong) → system may not need transformation — or analysis surface-level. Dig deeper: interview stakeholders, measure specific pain pts, project 12-18 months. What pressures intensify?

### Step 3: Assess Rigidity

How flexible/rigid is current form — can bend or break?

1. Test interface flexibility:
   - Modules replaceable no cascading changes? (loose coupling = flexible)
   - Interfaces well-defined + stable? (contract clarity = flexible)
   - How many "god modules" exist (all depends)? (concentration = rigid)
2. Test data flexibility:
   - Data migration straightforward? (schema evolution tools, versioning)
   - Data formats standardized or bespoke? (bespoke = rigid)
   - How entangled is business logic w/ data structure? (entangled = rigid)
3. Test process flexibility:
   - Team ship changes quickly? (deploy pipeline health)
   - Test suite comprehensive? (safety net for change)
   - How many "don't touch" components exist? (forbidden zones = rigid)
4. Calc rigidity score:

```
Rigidity Assessment:
┌──────────────────────┬─────┬──────────┬──────┬──────────────────────┐
│ Dimension            │ Low │ Moderate │ High │ Your Assessment      │
├──────────────────────┼─────┼──────────┼──────┼──────────────────────┤
│ Interface coupling   │ 1   │ 2        │ 3    │ ___                  │
│ God module count     │ 1   │ 2        │ 3    │ ___                  │
│ Data entanglement    │ 1   │ 2        │ 3    │ ___                  │
│ Deployment friction  │ 1   │ 2        │ 3    │ ___                  │
│ Test coverage gaps   │ 1   │ 2        │ 3    │ ___                  │
│ "Don't touch" zones  │ 1   │ 2        │ 3    │ ___                  │
├──────────────────────┼─────┴──────────┴──────┼──────────────────────┤
│ Total (max 18)       │ 6-9: flexible         │ ___                  │
│                      │ 10-13: moderate        │                      │
│                      │ 14-18: rigid           │                      │
└──────────────────────┴───────────────────────┴──────────────────────┘
```

**→** Rigidity score quantifies structural resistance transformation encounters. Flexible (6-9) → incremental. Rigid (14-18) → dissolution before reconstruction (see `dissolve-form`).

**If err:** Inconclusive (moderate score but unclear where real problems) → focus highest-scoring dims. System can be flexible overall but 1 extremely rigid component blocks transformation. Target that specifically.

### Step 4: Estimate Change Capacity

System + team ability to absorb + execute transformation.

1. Available transformation energy:
   - % team capacity allocatable to transformation?
   - Org support (budget, mandate, patience)?
   - Right skills (architecture, migration, testing)?
2. Change absorption rate:
   - How many changes per time unit no destabilize?
   - Recovery time post-significant change?
   - Staging/canary mechanism for incremental?
3. Transformation experience:
   - Team successfully transformed similar before?
   - Tools + practices (feature flags, strangler fig, blue-green)?
   - Risk tolerance?
4. Calc change capacity:
   - High: dedicated team, strong tooling, prior exp, org support
   - Moderate: part-time, some tooling, limited exp
   - Low: no dedicated, no tooling, no exp, resistant org

**→** Change capacity assessment → can execute proposed transformation given resources + skills + org support?

**If err:** Low capacity + high pressure → first transformation isn't system — team capability. Invest tooling, training, org buy-in before architectural transformation.

### Step 5: Classify Readiness

Combine pressure + rigidity + capacity → readiness classification.

1. Plot on matrix:

```
Transformation Readiness Matrix:
┌─────────────────┬────────────────────────┬────────────────────────┐
│                  │ Low Rigidity           │ High Rigidity          │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ READY — Transform now  │ PREPARE — Reduce       │
│ + High Capacity │ using adapt-architecture│ rigidity first, then   │
│                 │                        │ use dissolve-form       │
├─────────────────┼────────────────────────┼────────────────────────┤
│ High Pressure   │ INVEST — Build capacity│ CRITICAL — Invest in   │
│ + Low Capacity  │ first, then transform  │ capacity AND reduce    │
│                 │                        │ rigidity before change │
├─────────────────┼────────────────────────┼────────────────────────┤
│ Low Pressure    │ OPTIONAL — Transform   │ DEFER — No urgency,    │
│ + Any Capacity  │ if strategic value is  │ monitor pressure and   │
│                 │ clear, otherwise defer │ reassess quarterly     │
└─────────────────┴────────────────────────┴────────────────────────┘
```

2. Doc classification:
   - Label (READY / PREPARE / INVEST / CRITICAL / OPTIONAL / DEFER)
   - Key findings per dim
   - Recommended next step
   - Risk factors changing classification
3. READY → `adapt-architecture`
4. PREPARE → `dissolve-form` reduce rigidity
5. INVEST → build capacity (training, tooling, org support) + reassess
6. CRITICAL → address capacity + rigidity simultaneously (may need external help)
7. OPTIONAL/DEFER → doc + set reassessment date

**→** Clear justified readiness classification + specific next steps. Enables informed decision about when + how to transform.

**If err:** Ambiguous (moderate pressure + moderate rigidity + moderate capacity) → default PREPARE — reduce rigidity incrementally while monitoring pressure. Builds capability + reduces risk whether or not full transformation eventually needed.

## Check

- [ ] Structural inventory complete: components + ages + deps + types
- [ ] Transformation pressure mapped (external, internal, resistance)
- [ ] Rigidity score calc'd across all dims
- [ ] Change capacity assessed (resources, absorption, exp)
- [ ] Readiness classification determined + justified
- [ ] Next steps documented per classification
- [ ] Reassessment date set (even if currently READY)

## Traps

- **Assess only technical system**: Transformation readiness includes organizational. Technically flexible system + org-rigid team still fails.
- **Optimistic capacity estimation**: Teams consistently overestimate capacity while maintaining normal ops. Use 50% of stated as realistic.
- **Ignore resistance forces**: Pressure mapping only cataloging change forces misses resistance slowing/stopping. Resistance often stronger than appears.
- **Assessment paralysis**: Form assessment hours to days, not weeks. Taking too long → system too complex to assess fully — higher abstraction + drill into problems.
- **Confuse rigidity w/ stability**: Rigid ≠ stable. Stability comes from well-designed flexibility; rigidity = absence of designed flexibility.

## →

- `adapt-architecture` — primary transformation skill; assess-form determines readiness
- `dissolve-form` — PREPARE or CRITICAL → rigidity reduction before transformation
- `repair-damage` — systems needing repair before assessment meaningful
- `shift-camouflage` — surface-level adaptation may resolve pressure no full transformation
- `forage-resources` — resource exploration informs form assessment when "what should we become?"
- `review-software-architecture` — detailed technical architecture eval
- `assess-context` — AI self-application variant; maps structural assessment → reasoning ctx malleability, rigidity mapping, readiness
