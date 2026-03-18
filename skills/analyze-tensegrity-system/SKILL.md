---
name: analyze-tensegrity-system
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

Analyze a tensegrity (tensional integrity) system -- a structure where isolated compression elements (struts) are stabilized by a continuous tension network (cables/tendons). Determine the system's force balance, prestress equilibrium, structural stability, and cross-scale coherence from molecular cytoskeleton to architectural form.

## When to Use

- Evaluating whether a structure exhibits true tensegrity (compression-tension separation) or is a conventional frame
- Analyzing the structural stability of a tensegrity design in architecture, robotics, or deployable structures
- Applying Donald Ingber's cellular tensegrity model to cytoskeletal mechanics (microtubules, actin, intermediate filaments)
- Assessing the load capacity and failure modes of an existing tensegrity system
- Determining whether a biological structure (cell, tissue, musculoskeletal system) can be modeled as tensegrity
- Computing prestress requirements for a tensegrity to achieve rigidity despite having more mechanisms than a conventional truss

## Inputs

- **Required**: Description of the system (physical structure, biological cell, architectural model, or robotic mechanism)
- **Required**: Identification of candidate compression and tension elements
- **Optional**: Material properties (Young's modulus, cross-section, length for each element)
- **Optional**: External loads and boundary conditions
- **Optional**: Scale of interest (molecular, cellular, tissue, architectural)
- **Optional**: Known topology family (prism, octahedron, icosahedron, X-module)

## Procedure

### Step 1: Characterize the System

Establish the complete physical description by identifying every compression element (strut) and tension element (cable), their connectivity, and the boundary conditions.

1. **Compression inventory**: List all struts -- rigid elements that resist compression. Record each strut's length, cross-section, material, and Young's modulus. In biological systems, identify microtubules (hollow cylinders, ~25 nm outer diameter, 14 nm inner diameter, E ~ 1.2 GPa, persistence length ~ 5 mm).
2. **Tension inventory**: List all cables -- elements that resist tension only and go slack under compression. Record rest length, cross-sectional area, and tensile stiffness. In biological systems: actin filaments (helical, ~7 nm diameter, E ~ 2.6 GPa, persistence length ~ 17 um) and intermediate filaments (IFs, ~10 nm diameter, highly extensible, strain-stiffening).
3. **Connectivity topology**: Document which struts connect to which cables at which nodes (joints). Construct the incidence matrix C (rows = members, columns = nodes) encoding the topology.
4. **Boundary conditions**: Identify fixed nodes (grounded joints), free nodes, and external loads. Note gravitational loading direction and magnitude.
5. **Scale identification**: Classify as molecular (nm), cellular (um), architectural (m), or robotic (cm-m).

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

**Expected:** A complete inventory of all compression and tension elements with material properties, an incidence matrix, and boundary conditions sufficient to set up the equilibrium equations.

**On failure:** If element properties are unknown (common in biological systems), use published values: microtubules (E ~ 1.2 GPa, persistence length ~ 5 mm), actin (E ~ 2.6 GPa, persistence length ~ 17 um), intermediate filaments (highly nonlinear, strain-stiffening with low initial modulus ~1 MPa rising to ~1 GPa at high strain). If connectivity is unclear, reduce the system to the simplest topology that captures the essential force paths.

### Step 2: Classify the Tensegrity Type

Determine what class of tensegrity the system belongs to and whether it is biological or engineered.

1. **Class determination**:
   - **Class 1**: Struts do not touch each other -- all struts are isolated, connected only through the tension network. Most Fuller/Snelson structures are class 1.
   - **Class 2**: Struts may contact at shared nodes. Many biological systems are class 2 (microtubules share centrosome attachment points).
2. **Topology identification**: Count b = total members (struts + cables), j = nodes. Identify if the topology matches a known family: tensegrity prism (3-strut, 6-cable triangular antiprism), expanded octahedron (6-strut, 24-cable), icosahedral tensegrity (30-strut, 90-cable), or X-module (basic 2D unit cell).
3. **Biological vs. engineered**: Biological tensegrity has specific features: compression elements are discrete and stiff (microtubules), tension network is continuous (actin cortex + IFs), prestress is generated actively (actomyosin contractility via ATP hydrolysis), and the system exhibits mechanotransduction (force-to-signal conversion). Document which features are present.
4. **Dimension**: Classify as 2D (planar) or 3D.

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

**Expected:** A clear classification (class, dimension, category) with the biological mapping table completed for biological systems. For engineered systems, the topology family is identified.

**On failure:** If the system does not cleanly fit class 1 or class 2, it may be a hybrid or a conventional frame. A true tensegrity requires that at least some elements work only in tension (cables that go slack under compression). If no elements are tension-only, the system is not a tensegrity -- reclassify as a conventional truss or frame and apply standard structural analysis.

### Step 3: Analyze Force Balance and Prestress Equilibrium

Compute static equilibrium at every node, determine the state of prestress (internal tension/compression with no external load), and verify that all cables remain in tension.

1. **Construct the equilibrium matrix**: For b members and j nodes in d dimensions, build the equilibrium matrix A (size dj x b). Each column encodes the direction cosines of a member's force contribution at its two end nodes. The equilibrium equation is A * t = f_ext, where t is the vector of member force densities (force/length) and f_ext is the external load vector.
2. **Solve for self-stress**: With f_ext = 0, find the null space of A. Each basis vector of null(A) is a state of self-stress -- internal forces satisfying equilibrium without external load. The number of independent self-stress states is s = b - rank(A).
3. **Verify cable tension**: In any valid tensegrity self-stress, all cables must have positive force density (tension) and all struts must have negative force density (compression). A self-stress that puts a cable in compression is not physically realizable (the cable would go slack).
4. **Compute prestress level**: The actual prestress is a linear combination of self-stress basis vectors chosen so all cable tensions are positive. Record the minimum cable tension t_min (the margin before any cable goes slack).
5. **Load capacity**: Add external loads and solve A * t = f_ext. The load at which the first cable tension reaches zero is the critical load F_crit.

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

**Expected:** Self-stress states are computed, a physically realizable prestress (all cables in tension, all struts in compression) is found, and load capacity is estimated.

**On failure:** If no self-stress state keeps all cables in tension, the topology does not support a tensegrity prestress. Either (a) the incidence matrix has errors, (b) the system needs additional cables, or (c) it is a mechanism rather than a tensegrity. For large systems, use the force density method (Schek, 1974) or numerical null-space computation rather than hand calculation.

### Step 4: Check Stability Using Maxwell's Criterion

Determine whether the tensegrity is rigid (stable against infinitesimal perturbations) or a mechanism (has zero-energy deformation modes).

1. **Apply the extended Maxwell rule**: For a pin-jointed framework in d dimensions with b bars, j nodes, k kinematic constraints (supports), s self-stress states, and m infinitesimal mechanisms:

   **b - dj + k + s = m**

   This relates bars, joints, and constraints to the balance between self-stress and mechanism states.

2. **Compute from the equilibrium matrix**: rank(A) = b - s. The number of mechanisms is m = dj - k - rank(A). If m = 0, the structure is first-order rigid. If m > 0, prestress stability must be checked.
3. **Prestress stability test**: For each mechanism mode q, compute the second-order energy E_2 = q^T * G * q, where G is the geometric stiffness matrix (stress matrix). If E_2 > 0 for all mechanism modes, the tensegrity is prestress-stable (Connelly and Whiteley, 1996). This is how tensegrity achieves rigidity -- not through bar count, but through prestress stabilization of mechanisms.
4. **Classify rigidity**:
   - **Kinematically determinate**: m = 0, s = 0 (rare for tensegrity)
   - **Statically indeterminate and rigid**: m = 0, s > 0
   - **Prestress-stable**: m > 0, but all mechanisms stabilized by prestress
   - **Mechanism**: m > 0, not stabilized (structure can deform)

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

**Expected:** Maxwell count performed, mechanisms determined, and for m > 0, prestress stability evaluated. The structure is classified as rigid, prestress-stable, or mechanism.

**On failure:** If the structure is a mechanism (m > 0 and not prestress-stable), options: (a) add cables to increase b and reduce m, (b) increase prestress, (c) modify topology. In biological systems, active actomyosin contractility continuously adjusts prestress to maintain stability -- the cell is a self-tuning tensegrity.

### Step 5: Map Biological Tensegrity (Cross-Scale Analysis)

If the system has a biological interpretation, map the analysis to Ingber's cellular tensegrity model and check cross-scale coherence. Skip this step for purely engineered systems.

1. **Molecular scale (nm)**: Identify protein filaments as tensegrity elements. Microtubules (alpha/beta-tubulin heterodimers, GTP-dependent polymerization, dynamic instability with catastrophe/rescue). Actin (G-actin → F-actin polymerization, treadmilling). Intermediate filaments (type-dependent: vimentin, keratin, desmin, nuclear lamins).
2. **Cellular scale (um)**: Map the whole-cell tensegrity. Actin cortex = continuous tension shell. Microtubules radiating from centrosome = compression struts bearing against cortex. IFs = secondary tension path connecting nucleus to focal adhesions. Actomyosin contractility (myosin II motor proteins) = active prestress generator.
3. **Tissue scale (mm-cm)**: Cells form a higher-order tensegrity. Each cell acts as a compression-bearing element, connected by continuous ECM tension network (collagen, elastin). Cell-cell junctions (cadherins) and cell-ECM junctions (integrins) serve as nodes.
4. **Cross-scale coherence**: Verify that perturbation at one scale propagates to others. External force at ECM transmits through integrins to cytoskeleton to nucleus -- this mechanotransduction pathway is the signature of cross-scale tensegrity.

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

**Expected:** Biological tensegrity mapped at each relevant scale with compression, tension, prestress source, and nodes identified. Cross-scale force transmission documented.

**On failure:** If the cross-scale mapping breaks (no clear tension continuity between scales), document the gap. Not all biological structures are tensegrity at all scales. The spine is tensegrity at the musculoskeletal level (bones=struts, muscles/fascia=cables) but individual vertebrae are conventional compression structures internally.

### Step 6: Synthesize Analysis and Assess Structural Integrity

Combine all preceding analyses into a final assessment of the system's tensional integrity.

1. **Force balance summary**: State whether prestress equilibrium is achieved, the rigidity classification, and the load capacity margin.
2. **Vulnerability analysis**: Identify the critical member -- the cable whose failure causes the greatest loss of integrity (highest force density relative to strength), and the strut whose buckling would cause collapse (check against Euler buckling: P_cr = pi^2 * EI / L^2).
3. **Redundancy assessment**: How many cables can be removed before s drops to 0? How many before the system becomes an unstabilized mechanism?
4. **Design recommendations** (engineered systems): Cable pretension levels, strut sizing, topology modifications for improved margins.
5. **Biological implications** (biological systems): Relate to pathophysiology -- reduced microtubule stability (colchicine/taxol), disrupted IF networks (laminopathies), altered prestress (cancer cell mechanics with increased contractility).
6. **Integrity rating**:
   - **ROBUST**: s >= 2, all cables well above slack threshold, critical member failure does not cause collapse
   - **MARGINAL**: s = 1 or minimum cable tension near zero under expected loads
   - **FRAGILE**: s = 0, or critical member failure causes system collapse

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

**Expected:** Complete structural integrity assessment with rigidity classification, vulnerability identification, redundancy analysis, and integrity rating (ROBUST/MARGINAL/FRAGILE) with actionable recommendations.

**On failure:** If the analysis is incomplete (equilibrium matrix too large, biological parameters unknown), state the assessment as conditional: "MARGINAL pending numerical verification" or "classification requires experimental measurement of prestress level." Partial assessment with explicit gaps is more valuable than no assessment.

## Validation

- [ ] All compression elements (struts) and tension elements (cables) are inventoried with properties
- [ ] Connectivity topology is documented (incidence matrix or equivalent)
- [ ] Tensegrity class (1 or 2) is determined based on strut contact
- [ ] Equilibrium matrix is constructed and rank computed
- [ ] At least one self-stress state is found with all cables in tension
- [ ] Maxwell's extended rule is applied: b - dj + k + s = m
- [ ] Infinitesimal mechanisms (if any) are checked for prestress stability
- [ ] Rigidity classification is assigned
- [ ] For biological systems, cross-scale mapping table is completed
- [ ] Structural integrity is rated ROBUST, MARGINAL, or FRAGILE with justification

## Common Pitfalls

- **Confusing tensegrity with conventional trusses**: A tensegrity requires that some elements work only in tension (they go slack under compression). If all elements can bear both tension and compression, it is a conventional frame, not a tensegrity. The one-way nature of cables creates the nonlinearity that requires prestress for stability.
- **Ignoring prestress in stability analysis**: An unstressed tensegrity is always a mechanism -- cables at rest length provide no stiffness. Maxwell's count alone often yields m > 0 for tensegrity, suggesting instability. The prestress stability check (Step 4) is essential: prestress is what makes tensegrity rigid.
- **Treating biological tensegrity as static**: Cellular tensegrity is actively maintained by ATP-dependent myosin II motors generating contractility on actin. The prestress is dynamic, not fixed. Static analysis captures the structural principle but misses active regulation. Always note whether prestress is passive (cable pretension) or active (motor-generated).
- **Applying Maxwell's rule without accounting for cable slackening**: Maxwell's rule assumes all members are active. External loads causing cables to go slack reduce the effective b, changing the stability calculation. Track which cables remain taut under each load case.
- **Conflating Snelson's sculptures with Ingber's cell model**: Snelson's artistic tensegrities use rigid metal struts and steel cables. Ingber's cellular tensegrity features viscoelastic elements, active regulation, and dynamic instability of compression elements (microtubule catastrophe). The structural principle is the same; the material behavior is fundamentally different.
- **Neglecting strut buckling**: Tensegrity analysis treats struts as rigid. Slender struts can buckle (Euler: P_cr = pi^2 * EI / L^2). If compressive force approaches the buckling load, the rigid-strut assumption fails and actual load capacity is lower than predicted.

## Related Skills

- `assess-form` -- structural inventory and transformation readiness; assess-form evaluates a system's form generically, while this skill applies the specific tensegrity framework of compression-tension decomposition
- `adapt-architecture` -- architectural metamorphosis; tensegrity analysis identifies whether integrity depends on tension continuity, informing which elements can safely be modified during transformation
- `repair-damage` -- regenerative recovery; in tensegrity, cable failure and strut failure have different consequences, and the critical member analysis (Step 6) directly informs repair priority
- `center` -- dynamic reasoning balance; tensegrity's principle of stability through balanced tension (not rigid compression) is the structural metaphor underlying centering
- `integrate-gestalt` -- tension-resonance mapping in gestalt integration mirrors compression-tension duality; both find coherence through productive interplay of opposing forces
- `analyze-magnetic-levitation` -- sister analysis skill sharing the same rigor pattern (characterize, classify, verify stability); levitation achieves contactless force balance, tensegrity achieves contact-based force balance through tension continuity
- `construct-geometric-figure` -- geometric construction of tensegrity node positions; the geometric figure provides the initial topology that tensegrity analysis then verifies for stability
