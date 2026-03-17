---
name: assess-form
description: >
  Bewerten a system's current structural form, identify transformation pressure,
  and classify transformation readiness. Umfasst structural inventory, pressure
  mapping, rigidity assessment, change capacity estimation, and readiness
  classification for architectural metamorphosis. Verwenden vor any significant
  architectural change to understand the starting point, when a system feels
  stuck ohne clear reasons, when external pressure from growth or tech debt
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
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Form bewerten

Bewerten a system's current structural form — its architecture, rigidity, pressure points, and capacity for change — to determine transformation readiness vor initiating metamorphosis.

## Wann verwenden

- Before any significant architectural change to understand the starting point
- When a system feels "stuck" but the reasons are unclear
- When external pressure (growth, market shift, tech debt) is mounting but die Antwort is uncertain
- Assessing whether a proposed transformation is feasible given the current form
- Periodic health checks for long-lived systems (annual form assessment)
- Complementing `adapt-architecture` — assess first, then transform

## Eingaben

- **Erforderlich**: The system to assess (codebase, organization, infrastructure, process)
- **Optional**: Proposed transformation direction (what might das System need to become?)
- **Optional**: Known pain points or pressure sources
- **Optional**: Previous transformation attempts and their outcomes
- **Optional**: Time horizon for potential transformation
- **Optional**: Available resources for transformation effort

## Vorgehensweise

### Schritt 1: Inventory the Current Form

Catalog das System's structural elements ohne judgment — understand what exists vor evaluating it.

1. Abbilden the structural components:
   - **Modules**: distinct functional units (services, teams, packages, departments)
   - **Interfaces**: how modules connect (APIs, protocols, contracts, reporting lines)
   - **Data flows**: how information moves durch das System
   - **Dependencies**: what depends on what (direct, transitive, circular)
   - **Load-bearing structures**: components that everything else relies on
2. Dokumentieren the form's age and history:
   - When was each major component introduced?
   - Which components have changed recently vs. remained static?
   - What is the "geological layer" structure (old core, newer additions, recent patches)?
3. Identifizieren the form's "skeleton" vs. "flesh":
   - Skeleton: structural decisions that are extremely costly to change (language, database, deployment model)
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

**Erwartet:** A complete structural inventory showing components, their ages, modification recency, Abhaengigkeit profiles, and classification as skeleton or flesh. This is the "X-ray" of the current form.

**Bei Fehler:** If the inventory is incomplete (components are unknown or undocumented), that itself is a finding — the form has opacity, which is a transformation risk. Dokumentieren what you can, flag unknowns, and plan discovery for the gaps.

### Schritt 2: Abbilden Transformation Pressure

Identifizieren the forces pushing das System toward change and the forces resisting it.

1. Catalog external pressures (forces demanding change):
   - Growth pressure: current form can't handle increasing load
   - Market pressure: competitors or users demand capabilities the current form can't support
   - Technology pressure: underlying technology is becoming obsolete or unsupported
   - Regulatory pressure: compliance requirements the current form doesn't meet
   - Integration pressure: must connect with systems the current form wasn't designed for
2. Catalog internal pressures (forces demanding change from innerhalb):
   - Technical debt: accumulated shortcuts that slow development
   - Knowledge concentration: critical knowledge held by too few people
   - Morale pressure: team frustration with the current form
   - Operational burden: maintenance cost consuming resources that should go to development
3. Catalog resistance forces (forces opposing change):
   - Inertia: the existing form works "well enough"
   - Dependency lock-in: too many things depend on the current form
   - Knowledge loss risk: transformation might destroy institutional knowledge
   - Cost: transformation requires investment with uncertain return
   - Fear: previous transformation attempts failed

**Erwartet:** A pressure map showing the direction and magnitude of forces acting on das System. If transformation pressure erheblich exceeds resistance, transformation is overdue. If resistance erheblich exceeds pressure, transformation will fail ohne first reducing resistance.

**Bei Fehler:** If pressure mapping produces a balanced picture (neither strong pressure nor strong resistance), das System may not need transformation — or die Analyse is surface-level. Dig deeper: interview stakeholders, measure specific pain points, project forward 12-18 months. What pressures will intensify?

### Schritt 3: Bewerten Structural Rigidity

Bestimmen how flexible or rigid the current form is — can it bend, or will it break?

1. Testen interface flexibility:
   - Can modules be replaced ohne cascading changes? (loose coupling = flexible)
   - Are interfaces well-defined and stable? (contract clarity = flexible)
   - How many "god modules" exist (modules that everything depends on)? (concentration = rigid)
2. Testen data flexibility:
   - Is data migration straightforward? (schema evolution tools, versioning)
   - Are Datenformats standardized or bespoke? (bespoke = rigid)
   - How entangled is business logic with data structure? (entangled = rigid)
3. Testen process flexibility:
   - Can das Team ship changes quickly? (deployment pipeline health)
   - Is der Test suite comprehensive? (safety net for change)
   - How many "don't touch" components exist? (forbidden zones = rigid)
4. Berechnen the rigidity score:

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

**Erwartet:** A rigidity score that quantifies how much structural resistance transformation will encounter. Flexible systems (6-9) can transform incrementally. Rigid systems (14-18) need dissolution vor reconstruction (see `dissolve-form`).

**Bei Fehler:** If the rigidity assessment is inconclusive (moderate score but unclear where the real problems are), focus on the highest-scoring dimensions. A system kann flexible overall but have one extremely rigid component that blocks transformation. Target that component specifically.

### Schritt 4: Schaetzen Change Capacity

Bewerten das System's (and team's) ability to absorb and execute transformation.

1. Available transformation energy:
   - What percentage of team capacity kann allocated to transformation?
   - Is there organizational support (budget, mandate, patience)?
   - Are the right skills available (architecture, migration, testing)?
2. Change absorption rate:
   - How many changes can das System absorb per time unit ohne destabilizing?
   - What is the recovery time nach a significant change?
   - Is there a staging/canary mechanism for incremental transformation?
3. Transformation experience:
   - Has das Team erfolgreich transformed similar systems vor?
   - Are there transformation tools and practices in place (Feature-Flags, strangler fig, blue-green)?
   - What is das Team's risk tolerance?
4. Berechnen change capacity:
   - High capacity: dedicated team, strong tooling, prior experience, organizational support
   - Moderate capacity: part-time allocation, some tooling, limited experience
   - Low capacity: no dedicated resources, no tooling, no experience, resistant organization

**Erwartet:** A change capacity assessment that indicates whether das System/team can execute the proposed transformation given current resources, skills, and organizational support.

**Bei Fehler:** If change capacity is low but transformation pressure is high, the first transformation isn't das System — it's das Team's capability. Invest in tooling, training, and organizational buy-in vor attempting the architectural transformation.

### Schritt 5: Classify Transformation Readiness

Kombinieren pressure, rigidity, and capacity assessments into a readiness classification.

1. Plot das System on the readiness matrix:

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

2. Dokumentieren the readiness classification with:
   - Classification label (READY / PREPARE / INVEST / CRITICAL / OPTIONAL / DEFER)
   - Key findings from each assessment dimension
   - Recommended next step
   - Risk factors that could change the classification
3. If READY: proceed to `adapt-architecture`
4. If PREPARE: proceed to `dissolve-form` to reduce rigidity
5. If INVEST: build capacity (training, tooling, organizational support), then reassess
6. If CRITICAL: address capacity and rigidity simultaneously (may require external help)
7. If OPTIONAL/DEFER: document the assessment and set a reassessment date

**Erwartet:** A clear, justified transformation readiness classification with specific next steps. The classification enables informed decision-making about when and how to transform.

**Bei Fehler:** If the classification is ambiguous (e.g., moderate pressure, moderate rigidity, moderate capacity), default to PREPARE — reduce rigidity incrementally while monitoring pressure. This builds capability and reduces risk whether or not full transformation is eventually needed.

## Validierung

- [ ] Structural inventory is complete with components, ages, Abhaengigkeiten, and types
- [ ] Transformation pressure is mapped (external, internal, resistance forces)
- [ ] Rigidity score is calculated across all dimensions
- [ ] Change capacity is assessed (resources, absorption rate, experience)
- [ ] Readiness classification is determined with justified reasoning
- [ ] Next steps are documented basierend auf the classification
- [ ] Reassessment date is set (even if derzeit READY)

## Haeufige Stolperfallen

- **Assessing only the technical system**: Transformation readiness includes organizational readiness. A technically flexible system with an organizationally rigid team will still fail to transform
- **Optimistic capacity estimation**: Teams consistently overestimate their capacity for change while maintaining normal operations. Use 50% of stated capacity as the realistic estimate
- **Ignoring resistance forces**: Pressure mapping that only catalogs change forces misses the resistance that will slow or stop transformation. Resistance is often stronger than it appears
- **Assessment paralysis**: The form assessment should take hours to days, not weeks. If it's taking too long, das System is too complex to assess fully — assess at a higher abstraction level and drill into problem areas
- **Confusing rigidity with stability**: A rigid system ist nicht the same as a stable system. Stability comes from well-designed flexibility; rigidity is the absence of designed flexibility

## Verwandte Skills

- `adapt-architecture` — the primary transformation skill; assess-form determines readiness for it
- `dissolve-form` — for systems classified as PREPARE or CRITICAL, rigidity reduction vor transformation
- `repair-damage` — for systems that need repair vor assessment kann meaningful
- `shift-camouflage` — surface-level adaptation that may resolve pressure ohne full transformation
- `forage-resources` — resource exploration informs form assessment when the question is "what should we become?"
- `review-software-architecture` — complementary skill for detailed technical architecture evaluation
- `assess-context` — AI self-application variant; maps structural assessment to reasoning context malleability, rigidity mapping, and transformation readiness
