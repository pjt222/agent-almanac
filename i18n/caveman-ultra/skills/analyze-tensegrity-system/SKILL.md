---
name: analyze-tensegrity-system
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Analyze a tensegrity system by identifying compression struts and tension
  cables, classifying type (class 1/2, biological/architectural), computing
  prestress equilibrium, verifying stability via Maxwell's rigidity criterion,
  and mapping biological tensegrity (microtubules, actin, intermediate
  filaments). Use when evaluating tensegrity in architecture, robotics,
  cell biology, or any system with isolated compression in continuous tension.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tensegrity
  complexity: advanced
  language: natural
  tags: tensegrity, structural-integrity, prestress, biomechanics, cytoskeleton, force-balance
---

# Analyze Tensegrity System

Tensegrity = isolated compression (struts) stabilized by continuous tension (cables). Determine force balance, prestress equilibrium, stability, cross-scale coherence molecular → architectural.

## Use When

- True tensegrity (compression-tension separation) vs conventional frame?
- Structural stability of design architecture/robotics/deployable
- Apply Ingber's cellular tensegrity model → cytoskeletal mechanics (microtubules, actin, IFs)
- Load capacity + failure modes existing system
- Bio structure (cell, tissue, musculoskel) modelable as tensegrity?
- Prestress reqs → rigidity despite more mechanisms than conventional truss

## In

- **Required**: System desc (physical, bio cell, architectural, robotic)
- **Required**: ID candidate compression + tension elements
- **Optional**: Material props (Young's mod, cross-section, length per element)
- **Optional**: External loads + boundary conds
- **Optional**: Scale (molecular, cellular, tissue, architectural)
- **Optional**: Known topology family (prism, octahedron, icosahedron, X-module)

## Do

### Step 1: Characterize System

ID every compression element (strut) + tension element (cable), connectivity, boundary conds.

1. **Compression inventory**: Struts — rigid elements resist compression. Length, cross-section, material, Young's mod. Bio → microtubules (hollow cyl, ~25 nm OD, 14 nm ID, E ~ 1.2 GPa, persistence length ~ 5 mm).
2. **Tension inventory**: Cables — resist tension only, slack under compression. Rest length, cross-section area, tensile stiffness. Bio → actin filaments (helical, ~7 nm, E ~ 2.6 GPa, persistence length ~ 17 um) + IFs (~10 nm, highly extensible, strain-stiffening).
3. **Connectivity topology**: Doc struts ↔ cables ↔ nodes. Incidence matrix C (rows = members, cols = nodes) encodes topology.
4. **Boundary conds**: Fixed nodes (grounded), free nodes, external loads. Gravitational loading direction + magnitude.
5. **Scale**: Molecular (nm), cellular (um), architectural (m), robotic (cm-m).

```markdown
## System Characterization
| ID | Type  | Length   | Cross-section | Material       | Stiffness     |
|----|-------|----------|---------------|----------------|---------------|
| S1 | strut | [value]  | [value]       | [material]     | E = [value]   |
| C1 | cable | [value]  | [value]       | [material]     | EA = [value]  |
- **Nodes**: [count], [fixed vs. free]
- **Scale**: [molecular / cellular / architectural / robotic]
- **Boundary conditions**: [description]
```

**→** Complete inventory compression + tension elements + material props + incidence matrix + boundary conds → setup equilibrium eqs.

**If err:** Props unknown (common bio) → published: microtubules (E ~ 1.2 GPa, persistence ~ 5 mm), actin (E ~ 2.6 GPa, persistence ~ 17 um), IFs (nonlinear strain-stiffening, initial ~1 MPa → ~1 GPa high strain). Connectivity unclear → simplest topology capturing essential force paths.

### Step 2: Classify Type

Class + bio vs engineered:

1. **Class**:
   - **Class 1**: Struts don't touch — all isolated, connected only via tension. Most Fuller/Snelson class 1.
   - **Class 2**: Struts may contact shared nodes. Many bio class 2 (microtubules share centrosome).
2. **Topology**: b = total (struts + cables), j = nodes. Known family: tensegrity prism (3-strut, 6-cable triangular antiprism), expanded octahedron (6-strut, 24-cable), icosahedral (30-strut, 90-cable), X-module (basic 2D unit).
3. **Bio vs engineered**: Bio — compression discrete + stiff (microtubules), tension continuous (actin cortex + IFs), prestress actively generated (actomyosin contractility via ATP), mechanotransduction (force→signal). Doc which features present.
4. **Dim**: 2D (planar) or 3D.

```markdown
## Tensegrity Classification
- **Class**: [1 (isolated struts) / 2 (strut-strut contact)]
- **Dimension**: [2D / 3D]
- **Topology**: [prism / octahedron / icosahedron / X-module / irregular]
- **Category**: [biological / architectural / robotic / artistic]
- **b** (members): [value], **j** (nodes): [value]

### Biological Tensegrity Mapping (if applicable)
| Cell Component          | Tensegrity Role       | Key Properties                              |
|-------------------------|-----------------------|---------------------------------------------|
| Microtubules            | Compression struts    | 25 nm OD, E~1.2 GPa, dynamic instability    |
| Actin filaments         | Tension cables        | 7 nm, cortical network, actomyosin contract. |
| Intermediate filaments  | Deep tension/prestress| 10 nm, strain-stiffening, nucleus-to-membrane|
| Extracellular matrix    | External anchor       | Collagen/fibronectin, integrin attachment     |
| Focal adhesions         | Ground nodes          | Mechanosensitive, connect cytoskeleton to ECM |
| Nucleus                 | Internal compression  | Lamina network forms sub-tensegrity           |
```

**→** Clear classification (class, dim, category) + bio mapping table for bio systems. Engineered → topology family ID'd.

**If err:** Not cleanly class 1 or 2 → hybrid or conventional frame. True tensegrity reqs ≥ some elements tension-only (cables slack under compression). No tension-only → not tensegrity — reclassify conventional truss/frame + std structural analysis.

### Step 3: Force Balance + Prestress Equilibrium

Compute static equilibrium each node, prestress (internal tension/compression no external load), verify all cables in tension.

1. **Equilibrium matrix**: b members, j nodes, d dims → build A (size dj x b). Col encodes direction cosines of member's force at 2 end nodes. Equilibrium: A * t = f_ext, t = vector of force densities (force/length), f_ext = external load.
2. **Solve self-stress**: f_ext = 0 → null space A. Each basis vec of null(A) = self-stress state — internal forces satisfy equilibrium no external. Independent self-stresses s = b - rank(A).
3. **Verify cable tension**: Valid tensegrity self-stress → all cables pos force density (tension) + all struts neg (compression). Self-stress puts cable in compression → not physically realizable (would slack).
4. **Compute prestress level**: Actual = linear combo self-stress basis chosen so all cable tensions pos. Record min cable tension t_min (margin before slack).
5. **Load capacity**: Add external loads + solve A * t = f_ext. Load at which first cable tension reaches 0 = critical F_crit.

```markdown
## Prestress Equilibrium
- **Equilibrium matrix A**: [dj] x [b] = [size]
- **Rank of A**: [value]
- **Self-stress states (s)**: s = b - rank(A) = [value]
- **Self-stress feasibility**: [all cables in tension? Yes/No]
- **Minimum cable tension**: t_min = [value]
- **Critical external load**: F_crit = [value]

| Member | Type  | Force Density | Force   | Status      |
|--------|-------|---------------|---------|-------------|
| S1     | strut | [negative]    | [value] | compression |
| C1     | cable | [positive]    | [value] | tension     |
```

**→** Self-stress states computed, physically realizable prestress (all cables tension, all struts compression) found, load capacity est.

**If err:** No self-stress keeps all cables in tension → topology no support tensegrity prestress. (a) incidence matrix errs, (b) needs more cables, or (c) mechanism not tensegrity. Large systems → force density method (Schek, 1974) or numerical null-space.

### Step 4: Maxwell's Stability Criterion

Rigid (stable vs infinitesimal perturbations) or mechanism (zero-energy modes)?

1. **Extended Maxwell rule**: Pin-jointed framework d dims, b bars, j nodes, k kinematic constraints (supports), s self-stresses, m infinitesimal mechanisms:

   **b - dj + k + s = m**

   Relates bars/joints/constraints to self-stress + mechanism balance.

2. **Compute from equilibrium matrix**: rank(A) = b - s. Mechanisms m = dj - k - rank(A). m = 0 → first-order rigid. m > 0 → prestress stability check.
3. **Prestress stability test**: Per mechanism mode q, compute 2nd-order energy E_2 = q^T * G * q, G = geometric stiffness matrix (stress matrix). E_2 > 0 all modes → prestress-stable (Connelly + Whiteley, 1996). Tensegrity achieves rigidity not via bar count but prestress stabilization of mechanisms.
4. **Classify rigidity**:
   - **Kinematically determinate**: m = 0, s = 0 (rare for tensegrity)
   - **Statically indeterminate + rigid**: m = 0, s > 0
   - **Prestress-stable**: m > 0, all mechanisms stabilized by prestress
   - **Mechanism**: m > 0, not stabilized (structure deforms)

```markdown
## Stability Analysis (Maxwell's Criterion)
- **Bars (b)**: [value]
- **Joints (j)**: [value]
- **Dimension (d)**: [2 or 3]
- **Kinematic constraints (k)**: [value]
- **Rank of A**: [value]
- **Self-stress states (s)**: [value]
- **Mechanisms (m)**: [value]
- **Maxwell check**: b - dj + k + s = m --> [values]
- **Prestress stability**: [stable / unstable / N/A]
- **Rigidity class**: [determinate / indeterminate / prestress-stable / mechanism]
```

**→** Maxwell count done, mechanisms determined, m > 0 → prestress stability eval'd. Structure classified rigid/prestress-stable/mechanism.

**If err:** Mechanism (m > 0 + not prestress-stable) → options: (a) add cables → increase b + reduce m, (b) increase prestress, (c) modify topology. Bio → active actomyosin continuously adjusts prestress → self-tuning tensegrity.

### Step 5: Bio Tensegrity (Cross-Scale)

If bio → map to Ingber's model + check cross-scale coherence. Skip for engineered-only.

1. **Molecular (nm)**: Proteins as tensegrity elements. Microtubules (alpha/beta-tubulin heterodimers, GTP-dependent polymerization, dynamic instability w/ catastrophe/rescue). Actin (G-actin → F-actin polymerization, treadmilling). IFs (type-dependent: vimentin, keratin, desmin, nuclear lamins).
2. **Cellular (um)**: Whole-cell tensegrity. Actin cortex = continuous tension shell. Microtubules radiating from centrosome = compression struts vs cortex. IFs = secondary tension path, nucleus ↔ focal adhesions. Actomyosin contractility (myosin II) = active prestress generator.
3. **Tissue (mm-cm)**: Cells form higher-order tensegrity. Each cell = compression-bearing element, connected via continuous ECM tension (collagen, elastin). Cell-cell junctions (cadherins) + cell-ECM (integrins) = nodes.
4. **Cross-scale coherence**: Perturbation at 1 scale propagates others. External force at ECM → via integrins → cytoskel → nucleus → mechanotransduction = signature of cross-scale tensegrity.

```markdown
## Cross-Scale Biological Tensegrity
| Scale      | Compression        | Tension              | Prestress Source      | Nodes              |
|------------|--------------------|----------------------|-----------------------|--------------------|
| Molecular  | Tubulin dimers     | Actin/IF subunits    | ATP/GTP hydrolysis    | Protein complexes  |
| Cellular   | Microtubules       | Actin cortex + IFs   | Actomyosin            | Focal adhesions    |
| Tissue     | Cells (turgor)     | ECM (collagen)       | Cell contractility    | Cell-ECM junctions |
| Organ      | Bones              | Muscles + fascia     | Muscle tone           | Joints             |

### Mechanotransduction Pathway
ECM --> integrin --> focal adhesion --> actin cortex --> IF --> nuclear lamina --> chromatin
```

**→** Bio tensegrity mapped each scale + compression + tension + prestress src + nodes ID'd. Cross-scale force transmission documented.

**If err:** Cross-scale mapping breaks (no tension continuity) → doc gap. Not all bio tensegrity at all scales. Spine = tensegrity musculoskeletal (bones=struts, muscles/fascia=cables) but individual vertebrae are conventional compression internally.

### Step 6: Synthesize + Assess Integrity

Combine preceding into final assessment:

1. **Force balance summary**: Prestress equilibrium achieved? Rigidity class + load capacity margin.
2. **Vulnerability**: Critical member — cable whose failure → greatest loss (highest force density rel strength), strut whose buckling → collapse (Euler: P_cr = pi^2 * EI / L^2).
3. **Redundancy**: How many cables removable before s → 0? Before system unstabilized mechanism?
4. **Design recs** (engineered): Cable pretension, strut sizing, topology mods for improved margins.
5. **Bio implications** (bio): Pathophysiology — reduced microtubule stability (colchicine/taxol), disrupted IF networks (laminopathies), altered prestress (cancer cell mechanics w/ increased contractility).
6. **Integrity rating**:
   - **ROBUST**: s >= 2, all cables well above slack, critical member failure no collapse
   - **MARGINAL**: s = 1 or min cable tension near 0 under expected loads
   - **FRAGILE**: s = 0, or critical member failure → collapse

```markdown
## Structural Integrity Assessment
- **Prestress equilibrium**: [achieved / not achieved]
- **Rigidity**: [determinate / indeterminate / prestress-stable / mechanism]
- **Load capacity margin**: [value or qualitative]
- **Critical member**: [ID] -- failure causes [consequence]
- **Redundancy**: [cables removable before mechanism]
- **Integrity rating**: [ROBUST / MARGINAL / FRAGILE]

### Recommendations
1. [specific recommendation]
2. [specific recommendation]
3. [specific recommendation]
```

**→** Complete structural integrity assessment + rigidity + vulnerability + redundancy + rating (ROBUST/MARGINAL/FRAGILE) + actionable recs.

**If err:** Incomplete (matrix too large, bio params unknown) → state conditional: "MARGINAL pending numerical verification" or "classification reqs experimental measurement". Partial + explicit gaps > no assessment.

## Check

- [ ] All compression (struts) + tension (cables) inventoried + props
- [ ] Connectivity topology documented (incidence matrix or equivalent)
- [ ] Tensegrity class (1 or 2) determined based on strut contact
- [ ] Equilibrium matrix constructed + rank computed
- [ ] ≥1 self-stress state found + all cables tension
- [ ] Maxwell's extended rule applied: b - dj + k + s = m
- [ ] Infinitesimal mechanisms checked prestress stability
- [ ] Rigidity class assigned
- [ ] Bio → cross-scale mapping table done
- [ ] Integrity rated ROBUST/MARGINAL/FRAGILE + justification

## Traps

- **Confuse tensegrity w/ conventional trusses**: Tensegrity reqs ≥ some tension-only elements (slack under compression). All elements both tension + compression → conventional frame not tensegrity. One-way nature of cables → nonlinearity → prestress for stability.
- **Ignore prestress in stability**: Unstressed tensegrity always mechanism — cables at rest length = no stiffness. Maxwell count alone often m > 0 → suggests instability. Prestress stability check (Step 4) essential.
- **Treat bio tensegrity static**: Cellular actively maintained by ATP-dependent myosin II on actin. Prestress dynamic not fixed. Static captures structural principle misses active regulation. Always note passive (pretension) or active (motor-generated).
- **Maxwell no cable slackening**: Maxwell assumes all members active. External loads cause cables slack → reduce effective b → changes stability calc. Track which cables taut per load case.
- **Conflate Snelson's sculptures w/ Ingber's cell**: Snelson rigid metal struts + steel cables. Ingber viscoelastic + active regulation + dynamic instability compression (microtubule catastrophe). Structural principle same; material behavior fundamentally different.
- **Neglect strut buckling**: Analysis treats struts as rigid. Slender struts can buckle (Euler: P_cr = pi^2 * EI / L^2). Compressive force approaches buckling load → rigid-strut assumption fails + actual load capacity lower.

## →

- `assess-form` — structural inventory + transformation readiness; generic, this applies specific tensegrity framework
- `adapt-architecture` — architectural metamorphosis; tensegrity analysis IDs tension continuity for safe mods during transform
- `repair-damage` — regenerative recovery; cable failure + strut failure diff consequences, critical member analysis (Step 6) informs priority
- `center` — dynamic reasoning balance; stability through balanced tension (not rigid compression) = structural metaphor for centering
- `integrate-gestalt` — tension-resonance mapping mirrors compression-tension duality; both find coherence through productive interplay of opposing forces
- `analyze-magnetic-levitation` — sister analysis shares rigor pattern (characterize, classify, verify stability); lev contactless force balance, tensegrity contact-based force balance via tension continuity
- `construct-geometric-figure` — geometric construction of tensegrity nodes; figure → initial topology, tensegrity analysis verifies stability
