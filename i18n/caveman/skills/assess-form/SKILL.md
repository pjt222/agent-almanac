---
name: assess-form
locale: caveman
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

Evaluate system's current structural form — its architecture, rigidity, pressure points, capacity for change — to determine transformation readiness before initiating metamorphosis.

## When Use

- Before any significant architectural change to understand starting point
- System feels "stuck" but reasons unclear
- External pressure (growth, market shift, tech debt) mounting but response uncertain
- Assessing whether proposed transformation feasible given current form
- Periodic health checks for long-lived systems (annual form assessment)
- Complementing `adapt-architecture` — assess first, then transform

## Inputs

- **Required**: System to assess (codebase, organization, infrastructure, process)
- **Optional**: Proposed transformation direction (what might system need to become?)
- **Optional**: Known pain points or pressure sources
- **Optional**: Previous transformation attempts and their outcomes
- **Optional**: Time horizon for potential transformation
- **Optional**: Available resources for transformation effort

## Steps

### Step 1: Inventory Current Form

Catalog system's structural elements without judgment — understand what exists before evaluating it.

1. Map structural components:
   - **Modules**: distinct functional units (services, teams, packages, departments)
   - **Interfaces**: how modules connect (APIs, protocols, contracts, reporting lines)
   - **Data flows**: how information moves through system
   - **Dependencies**: what depends on what (direct, transitive, circular)
   - **Load-bearing structures**: components that everything else relies on
2. Document form's age and history:
   - When was each major component introduced?
   - Which components have changed recently vs. remained static?
   - What is "geological layer" structure (old core, newer additions, recent patches)?
3. Identify form's "skeleton" vs. "flesh":
   - Skeleton: structural decisions extremely costly to change (language, database, deployment model)
   - Flesh: functional decisions that can change more easily (business logic, UI, configuration)

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

**Got:** Complete structural inventory showing components, their ages, modification recency, dependency profiles, classification as skeleton or flesh. This is "X-ray" of current form.

**If fail:** Inventory incomplete (components unknown or undocumented)? That itself is finding — form has opacity, transformation risk. Document what you can, flag unknowns, plan discovery for gaps.

### Step 2: Map Transformation Pressure

Identify forces pushing system toward change and forces resisting it.

1. Catalog external pressures (forces demanding change):
   - Growth pressure: current form can't handle increasing load
   - Market pressure: competitors or users demand capabilities current form can't support
   - Technology pressure: underlying technology becoming obsolete or unsupported
   - Regulatory pressure: compliance requirements current form doesn't meet
   - Integration pressure: must connect with systems current form wasn't designed for
2. Catalog internal pressures (forces demanding change from within):
   - Technical debt: accumulated shortcuts that slow development
   - Knowledge concentration: critical knowledge held by too few people
   - Morale pressure: team frustration with current form
   - Operational burden: maintenance cost consuming resources that should go to development
3. Catalog resistance forces (forces opposing change):
   - Inertia: existing form works "well enough"
   - Dependency lock-in: too many things depend on current form
   - Knowledge loss risk: transformation might destroy institutional knowledge
   - Cost: transformation requires investment with uncertain return
   - Fear: previous transformation attempts failed

**Got:** Pressure map showing direction and magnitude of forces acting on system. Transformation pressure significantly exceeds resistance? Transformation overdue. Resistance significantly exceeds pressure? Transformation will fail without first reducing resistance.

**If fail:** Pressure mapping produces balanced picture (neither strong pressure nor strong resistance)? System may not need transformation — or analysis surface-level. Dig deeper: interview stakeholders, measure specific pain points, project forward 12-18 months. What pressures will intensify?

### Step 3: Assess Structural Rigidity

Determine how flexible or rigid current form is — can it bend, or will it break?

1. Test interface flexibility:
   - Can modules be replaced without cascading changes? (loose coupling = flexible)
   - Are interfaces well-defined and stable? (contract clarity = flexible)
   - How many "god modules" exist (modules that everything depends on)? (concentration = rigid)
2. Test data flexibility:
   - Is data migration straightforward? (schema evolution tools, versioning)
   - Are data formats standardized or bespoke? (bespoke = rigid)
   - How entangled is business logic with data structure? (entangled = rigid)
3. Test process flexibility:
   - Can team ship changes quickly? (deployment pipeline health)
   - Is test suite comprehensive? (safety net for change)
   - How many "don't touch" components exist? (forbidden zones = rigid)
4. Calculate rigidity score:

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

**Got:** Rigidity score that quantifies how much structural resistance transformation will encounter. Flexible systems (6-9) can transform incrementally. Rigid systems (14-18) need dissolution before reconstruction (see `dissolve-form`).

**If fail:** Rigidity assessment inconclusive (moderate score but unclear where real problems are)? Focus on highest-scoring dimensions. System can be flexible overall but have one extremely rigid component that blocks transformation. Target that component specifically.

### Step 4: Estimate Change Capacity

Assess system's (and team's) ability to absorb and execute transformation.

1. Available transformation energy:
   - What percentage of team capacity can be allocated to transformation?
   - Is there organizational support (budget, mandate, patience)?
   - Are right skills available (architecture, migration, testing)?
2. Change absorption rate:
   - How many changes can system absorb per time unit without destabilizing?
   - What is recovery time after significant change?
   - Is there staging/canary mechanism for incremental transformation?
3. Transformation experience:
   - Has team successfully transformed similar systems before?
   - Are there transformation tools and practices in place (feature flags, strangler fig, blue-green)?
   - What is team's risk tolerance?
4. Calculate change capacity:
   - High capacity: dedicated team, strong tooling, prior experience, organizational support
   - Moderate capacity: part-time allocation, some tooling, limited experience
   - Low capacity: no dedicated resources, no tooling, no experience, resistant organization

**Got:** Change capacity assessment that indicates whether system/team can execute proposed transformation given current resources, skills, organizational support.

**If fail:** Change capacity low but transformation pressure high? First transformation isn't system — it's team's capability. Invest in tooling, training, organizational buy-in before attempting architectural transformation.

### Step 5: Classify Transformation Readiness

Combine pressure, rigidity, capacity assessments into readiness classification.

1. Plot system on readiness matrix:

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

2. Document readiness classification with:
   - Classification label (READY / PREPARE / INVEST / CRITICAL / OPTIONAL / DEFER)
   - Key findings from each assessment dimension
   - Recommended next step
   - Risk factors that could change classification
3. READY? Proceed to `adapt-architecture`
4. PREPARE? Proceed to `dissolve-form` to reduce rigidity
5. INVEST? Build capacity (training, tooling, organizational support), then reassess
6. CRITICAL? Address capacity and rigidity simultaneously (may require external help)
7. OPTIONAL/DEFER? Document assessment and set reassessment date

**Got:** Clear, justified transformation readiness classification with specific next steps. Classification enables informed decision-making about when and how to transform.

**If fail:** Classification ambiguous (e.g., moderate pressure, moderate rigidity, moderate capacity)? Default to PREPARE — reduce rigidity incrementally while monitoring pressure. Builds capability and reduces risk whether or not full transformation eventually needed.

## Checks

- [ ] Structural inventory complete with components, ages, dependencies, types
- [ ] Transformation pressure mapped (external, internal, resistance forces)
- [ ] Rigidity score calculated across all dimensions
- [ ] Change capacity assessed (resources, absorption rate, experience)
- [ ] Readiness classification determined with justified reasoning
- [ ] Next steps documented based on classification
- [ ] Reassessment date set (even if currently READY)

## Pitfalls

- **Assessing only technical system**: Transformation readiness includes organizational readiness. Technically flexible system with organizationally rigid team will still fail to transform
- **Optimistic capacity estimation**: Teams consistently overestimate their capacity for change while maintaining normal operations. Use 50% of stated capacity as realistic estimate
- **Ignoring resistance forces**: Pressure mapping that only catalogs change forces misses resistance that will slow or stop transformation. Resistance often stronger than it appears
- **Assessment paralysis**: Form assessment should take hours to days, not weeks. Taking too long? System too complex to assess fully — assess at higher abstraction level and drill into problem areas
- **Confusing rigidity with stability**: Rigid system not same as stable system. Stability comes from well-designed flexibility; rigidity is absence of designed flexibility

## See Also

- `adapt-architecture` — primary transformation skill; assess-form determines readiness for it
- `dissolve-form` — for systems classified as PREPARE or CRITICAL, rigidity reduction before transformation
- `repair-damage` — for systems that need repair before assessment can be meaningful
- `shift-camouflage` — surface-level adaptation that may resolve pressure without full transformation
- `forage-resources` — resource exploration informs form assessment when question is "what should we become?"
- `review-software-architecture` — complementary skill for detailed technical architecture evaluation
- `assess-context` — AI self-application variant; maps structural assessment to reasoning context malleability, rigidity mapping, transformation readiness
