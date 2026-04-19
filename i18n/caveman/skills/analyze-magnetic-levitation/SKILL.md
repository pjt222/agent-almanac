---
name: analyze-magnetic-levitation
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Analyze magnetic levitation systems by applying Earnshaw's theorem to determine
  whether passive static levitation is possible, then identifying the appropriate
  circumvention mechanism (diamagnetic, superconducting, active feedback, or
  spin-stabilized). Use when evaluating maglev transport, magnetic bearings,
  superconducting levitation, diamagnetic suspension, or Levitron-type devices.
  Covers force balance calculations, stability analysis in all spatial and
  tilting modes, and Meissner effect versus flux pinning distinctions.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: levitation
  complexity: advanced
  language: natural
  tags: levitation, magnetic-levitation, earnshaw-theorem, superconducting, diamagnetic, maglev
---

# Analyze Magnetic Levitation

Determine whether given magnetic system can achieve stable levitation. Identify which physical mechanism enables or forbids it. Calculate conditions for force balance and stability. Verify levitation stable against perturbations in all spatial degrees of freedom including tilting modes.

## When Use

- Evaluating whether proposed magnetic levitation design physically viable
- Determining why permanent magnet arrangement fails to levitate and identifying workaround
- Analyzing superconducting levitation systems (Meissner effect, flux pinning, mixed-state trapping)
- Designing or troubleshooting active electromagnetic feedback levitation (maglev trains, magnetic bearings)
- Assessing diamagnetic levitation feasibility for given material and field strength
- Understanding spin-stabilized magnetic levitation (Levitron) dynamics

## Inputs

- **Required**: Description of levitated object (mass, geometry, magnetic moment or susceptibility)
- **Required**: Description of field source (permanent magnets, electromagnets, superconducting coils, arrangement geometry)
- **Optional**: Operating environment (temperature, vacuum, vibration constraints)
- **Optional**: Desired levitation height or gap
- **Optional**: Stability requirements (stiffness, damping, bandwidth for active systems)

## Steps

### Step 1: Characterize System

Establish complete physical description of object and field source before any analysis:

1. **Object properties**: Record mass m, geometry (sphere, disk, rod), magnetic moment mu (for permanent magnet objects), volume magnetic susceptibility chi_v (for paramagnetic, diamagnetic, ferromagnetic materials), electrical conductivity sigma (relevant for eddy current effects).
2. **Field source properties**: Describe source configuration -- permanent magnet array (Halbach, dipole, quadrupole), electromagnet with coil parameters (turns, current, core material), or superconducting coil (critical current, critical field).
3. **Field geometry**: Determine spatial profile of magnetic field B(r). Identify field gradient dB/dz along levitation axis and curvature d^2B/dz^2 that governs stability.
4. **Environmental constraints**: Note temperature range (cryogenic for superconductors), atmosphere (vacuum reduces damping), vibration spectrum.

```markdown
## System Characterization
- **Object**: [mass, geometry, mu or chi_v, sigma]
- **Field source**: [type, configuration, key parameters]
- **Field profile**: [B(r) functional form or measured map]
- **Gradient**: [dB/dz at intended levitation point]
- **Environment**: [temperature, pressure, vibration]
```

**Got:** Complete specification of object and field source sufficient to determine forces and stability without further assumptions.

**If fail:** Magnetic susceptibility or moment unknown? Measure or estimate from material data tables. Without this quantity, force calculations impossible. For composite objects, compute effective susceptibility from volume-weighted average.

### Step 2: Apply Earnshaw's Theorem

Determine whether passive static levitation possible for given system:

1. **State Earnshaw's theorem**: In region free of currents and time-varying fields, no static arrangement of charges or permanent magnets can produce point of stable equilibrium for paramagnetic or ferromagnetic body. Mathematically, Laplacian of magnetic potential energy satisfies nabla^2 U >= 0 (for paramagnetic/ferromagnetic), so U has no local minimum.
2. **Classify object's response**: Determine whether levitated object is paramagnetic (chi_v > 0), diamagnetic (chi_v < 0), ferromagnetic (chi_v >> 0, nonlinear), superconducting (perfect diamagnet, chi_v = -1), or permanent magnet (fixed mu).
3. **Apply theorem**:
   - For paramagnetic, ferromagnetic, or permanent magnet objects in static field from permanent magnets or fixed currents: Earnshaw forbids stable levitation. At least one spatial direction will be unstable.
   - For diamagnetic objects: Earnshaw does NOT forbid levitation. nabla^2 U <= 0 allows local energy minimum. Passive static levitation permitted.
   - For superconductors: Meissner effect provides perfect diamagnetism, and flux pinning can provide both levitation and lateral stability.
4. **Document verdict**: State clear whether system is Earnshaw-forbidden or Earnshaw-permitted, and which material property determines classification.

```markdown
## Earnshaw Analysis
- **Object magnetic classification**: [paramagnetic / diamagnetic / ferromagnetic / superconducting / permanent magnet]
- **Susceptibility**: chi_v = [value with units]
- **Earnshaw verdict**: [FORBIDDEN / PERMITTED]
- **Reasoning**: [which condition of the theorem applies or fails]
```

**Got:** Definitive classification of whether proposed levitation Earnshaw-forbidden or Earnshaw-permitted, with specific physical reasoning documented.

**If fail:** Object has mixed magnetic character (e.g., ferromagnetic core with diamagnetic shell)? Analyze each component separately. Overall stability depends on net energy landscape, which may require numerical field computation.

### Step 3: Identify Circumvention Mechanism

Earnshaw's theorem forbids passive static levitation? Identify which of four standard circumvention mechanisms applies:

1. **Diamagnetic levitation**: Levitated object itself diamagnetic (chi_v < 0). Examples: pyrolytic graphite over NdFeB magnets, water droplets and frogs in 16 T Bitter magnets. Requires strong field gradients; condition is (chi_v / mu_0) * B * (dB/dz) >= rho * g, where rho is density.

2. **Superconducting levitation**: Object is type-I or type-II superconductor below T_c.
   - **Meissner levitation**: Complete flux expulsion provides repulsive force. Stable but has limited load capacity and requires superconductor to remain in Meissner state (B < B_c1).
   - **Flux pinning** (type-II superconductors): Magnetic flux vortices pinned at defect sites in material. Provides both vertical levitation force and lateral restoring force, allowing superconductor to be suspended below or above magnet. Object locked in 3D position relative to field source.

3. **Active electromagnetic feedback**: Sensors measure object's position. Controller adjusts electromagnet currents to maintain equilibrium. Examples: EMS maglev trains (Transrapid), active magnetic bearings. Requires power supply, sensors, control system with bandwidth exceeding mechanical resonance frequency.

4. **Spin-stabilized levitation**: Spinning permanent magnet (Levitron) achieves gyroscopic stabilization of tilting mode that Earnshaw's theorem otherwise makes unstable. Spin must exceed critical frequency omega_c for gyroscopic stiffness to overcome magnetic torque. Object must also remain within narrow mass window.

```markdown
## Circumvention Mechanism
- **Mechanism**: [diamagnetic / superconducting (Meissner or flux pinning) / active feedback / spin-stabilized]
- **Physical basis**: [why this mechanism evades Earnshaw's theorem]
- **Key requirements**: [material property, field strength, temperature, spin rate, or control bandwidth]
- **Limitations**: [load capacity, power consumption, cryogenics, mass window]
```

**Got:** Identification of specific mechanism with its physical basis clearly explained, including quantitative requirements for mechanism to function.

**If fail:** System does not clearly fit any of four mechanisms? Check for hybrid approaches (e.g., permanent magnets for primary force with eddy current damping for stability, or diamagnetic stabilization of paramagnetic system). Also consider whether system uses electrodynamic levitation (moving conductors in magnetic field), distinct mechanism based on Lenz's law.

### Step 4: Calculate Levitation Conditions

Compute force balance and quantitative conditions for stable levitation:

1. **Vertical force balance**: Magnetic force must equal gravity.
   - For magnetic dipole in field gradient: F_z = mu * (dB/dz) = m * g.
   - For diamagnetic object: F_z = (chi_v * V / mu_0) * B * (dB/dz) = m * g.
   - For superconductor (image method): Model superconductor as mirror and compute repulsion between magnet and its image.
   - For active feedback: F_z = k_coil * I(t), where I(t) is feedback-controlled current.

2. **Solve for levitation height**: Force balance equation F_z(z) = m * g determines equilibrium height z_0. For analytic field profiles, solve algebraically. For measured or numerically computed fields, solve graphically or numerically.

3. **Restoring force gradient (stiffness)**: Compute k_z = -dF_z/dz evaluated at z_0. For stable levitation, k_z > 0 (force decreases with increasing height). Natural frequency of vertical oscillation is omega_z = sqrt(k_z / m).

4. **Lateral stiffness**: Compute restoring force gradient in horizontal plane, k_x = -dF_x/dx. For Earnshaw-permitted systems (diamagnetic, superconducting), this should be positive. For feedback systems, depends on sensor-actuator geometry.

5. **Load capacity**: Determine maximum mass that can be levitated by finding field gradient at which equilibrium becomes marginally stable (k_z -> 0 at maximum displacement).

```markdown
## Levitation Conditions
- **Force balance equation**: [F_z(z) = m*g, explicit form]
- **Equilibrium height**: z_0 = [value]
- **Vertical stiffness**: k_z = [value, units N/m]
- **Vertical natural frequency**: omega_z = [value, units rad/s]
- **Lateral stiffness**: k_x = k_y = [value, units N/m]
- **Maximum load**: m_max = [value, units kg]
```

**Got:** Complete force balance with equilibrium position determined, stiffness values computed for vertical and lateral directions, load capacity estimated.

**If fail:** Force balance has no solution (magnetic force too weak to overcome gravity)? System cannot levitate specified object. Either increase field gradient (stronger magnets, closer spacing), reduce object mass, or switch to material with higher susceptibility. Stiffness negative in any direction? Equilibrium unstable in that direction -- return to Step 3 to identify appropriate stabilization mechanism.

### Step 5: Verify Stability in All Degrees of Freedom

Confirm levitation stable against perturbations in all six rigid-body degrees of freedom (three translations, three rotations):

1. **Translational stability**: Verify k_z > 0, k_x > 0, k_y > 0. For axially symmetric systems, k_x = k_y by symmetry. Compute restoring force for small displacements delta_x, delta_y, delta_z from equilibrium.

2. **Tilting stability**: Compute restoring torque for small angular deflections theta_x, theta_y about horizontal axes. For magnetic dipole, torque depends on field curvature and object's moment of inertia. Tilting instability is primary failure mode of passive permanent magnet levitation (and mode that spin stabilization in Levitron addresses).

3. **Spin stability** (if applicable): For spin-stabilized systems, verify spin rate exceeds critical frequency omega > omega_c. Critical frequency determined by ratio of magnetic torque to angular momentum. Below omega_c, precession leads to tilting instability.

4. **Dynamic stability**: For active feedback systems, verify control loop has sufficient phase margin (> 30 degrees) and gain margin (> 6 dB) at all resonance frequencies. Check sensor noise does not excite instability.

5. **Thermal and external perturbations**: Assess effect of temperature fluctuations (critical for superconductors near T_c), air currents (significant for diamagnetic levitation of light objects), mechanical vibration (transmitted through field source mounting).

```markdown
## Stability Analysis
| Degree of Freedom | Stiffness / Restoring | Stable? | Notes |
|-------------------|----------------------|---------|-------|
| Vertical (z)      | k_z = [value]        | [Yes/No] | [primary levitation axis] |
| Lateral (x)       | k_x = [value]        | [Yes/No] | |
| Lateral (y)       | k_y = [value]        | [Yes/No] | |
| Tilt (theta_x)    | tau_x = [value]      | [Yes/No] | [most common failure mode] |
| Tilt (theta_y)    | tau_y = [value]      | [Yes/No] | |
| Spin (theta_z)    | [N/A or value]       | [Yes/No] | [only relevant for spin-stabilized] |
```

**Got:** All six degrees of freedom either inherently stable (positive restoring force/torque) or stabilized by identified mechanism (feedback, gyroscopic, flux pinning). System confirmed viable for levitation.

**If fail:** Any degree of freedom unstable and no stabilization mechanism identified? Levitation design not viable as specified. Most common fix: adding active feedback loop for unstable direction, adding diamagnetic material for passive stabilization of lateral mode, or increasing spin rate for gyroscopic stabilization. Return to Step 3 to incorporate additional mechanism.

## Checks

- [ ] Object properties (mass, susceptibility or magnetic moment, geometry) fully specified
- [ ] Field source and spatial profile characterized with gradients computed
- [ ] Earnshaw's theorem correctly applied to object's magnetic classification
- [ ] Circumvention mechanism identified with its physical basis explained
- [ ] Force balance solved with equilibrium position determined
- [ ] Stiffness computed for all three translational directions
- [ ] Tilting stability analyzed for both horizontal tilt axes
- [ ] For spin-stabilized systems, critical spin rate computed and verified
- [ ] For active systems, control bandwidth and stability margins checked
- [ ] Load capacity limits estimated

## Pitfalls

- **Assuming permanent magnets can levitate each other statically**: Earnshaw's theorem forbids this for paramagnetic and ferromagnetic objects, yet most common misconception. Attraction or repulsion along one axis always produces instability along perpendicular axis. Always apply theorem before attempting force balance calculations.
- **Confusing Meissner levitation with flux pinning**: Meissner effect (type-I) produces pure repulsion and only works with superconductor below magnet. Flux pinning (type-II) locks superconductor at fixed position relative to field, allowing suspension in any orientation. Physics and design implications fundamentally different.
- **Ignoring tilting modes**: Many analyses check only translational stability and declare system stable. Tilting instability is primary failure mode for passive magnetic levitation and requires separate analysis. System can have positive translational stiffness in all directions while being tilt-unstable.
- **Underestimating diamagnetic levitation field requirements**: Diamagnetic susceptibilities very small (chi_v ~ -10^-5 for most materials, -4.5 x 10^-4 for pyrolytic graphite). Levitating even milligram-scale objects requires strong field gradients, typically B * dB/dz > 1000 T^2/m for non-graphite materials.
- **Neglecting eddy current effects**: Time-varying fields or moving conductors generate eddy currents that produce both forces and heating. In active feedback systems, eddy currents in levitated object create phase lag that can destabilize control loop.
- **Treating superconductors as perfect diamagnets in all conditions**: Type-II superconductors in mixed state (B_c1 < B < B_c2) have partial flux penetration. Levitation force depends on magnetization history (hysteresis), not just instantaneous field.

## See Also

- `evaluate-levitation-mechanism` -- comparative analysis to select best levitation approach for application
- `analyze-magnetic-field` -- detailed computation of magnetic field profiles needed as input to this skill
- `formulate-maxwell-equations` -- derive electromagnetic field equations governing levitation system
- `design-acoustic-levitation` -- alternative non-magnetic levitation approach for comparison
- `formulate-quantum-problem` -- quantum mechanical treatment for superconducting levitation (BCS theory, Ginzburg-Landau)
