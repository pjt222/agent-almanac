---
name: analyze-magnetic-levitation
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

Determine whether a given magnetic system can achieve stable levitation, identify which physical mechanism enables or forbids it, calculate the conditions for force balance and stability, and verify that the levitation is stable against perturbations in all spatial degrees of freedom including tilting modes.

## When to Use

- Evaluating whether a proposed magnetic levitation design is physically viable
- Determining why a permanent magnet arrangement fails to levitate and identifying a workaround
- Analyzing superconducting levitation systems (Meissner effect, flux pinning, mixed-state trapping)
- Designing or troubleshooting active electromagnetic feedback levitation (maglev trains, magnetic bearings)
- Assessing diamagnetic levitation feasibility for a given material and field strength
- Understanding spin-stabilized magnetic levitation (Levitron) dynamics

## Inputs

- **Required**: Description of the levitated object (mass, geometry, magnetic moment or susceptibility)
- **Required**: Description of the field source (permanent magnets, electromagnets, superconducting coils, arrangement geometry)
- **Optional**: Operating environment (temperature, vacuum, vibration constraints)
- **Optional**: Desired levitation height or gap
- **Optional**: Stability requirements (stiffness, damping, bandwidth for active systems)

## Procedure

### Step 1: Characterize the System

Establish the complete physical description of the object and field source before any analysis:

1. **Object properties**: Record the mass m, geometry (sphere, disk, rod), magnetic moment mu (for permanent magnet objects), volume magnetic susceptibility chi_v (for paramagnetic, diamagnetic, or ferromagnetic materials), and electrical conductivity sigma (relevant for eddy current effects).
2. **Field source properties**: Describe the source configuration -- permanent magnet array (Halbach, dipole, quadrupole), electromagnet with coil parameters (turns, current, core material), or superconducting coil (critical current, critical field).
3. **Field geometry**: Determine the spatial profile of the magnetic field B(r). Identify the field gradient dB/dz along the levitation axis and the curvature d^2B/dz^2 that governs stability.
4. **Environmental constraints**: Note temperature range (cryogenic for superconductors), atmosphere (vacuum reduces damping), and vibration spectrum.

```markdown
## System Characterization
- **Object**: [mass, geometry, mu or chi_v, sigma]
- **Field source**: [type, configuration, key parameters]
- **Field profile**: [B(r) functional form or measured map]
- **Gradient**: [dB/dz at intended levitation point]
- **Environment**: [temperature, pressure, vibration]
```

**Expected:** A complete specification of the object and field source sufficient to determine forces and stability without further assumptions.

**On failure:** If the magnetic susceptibility or moment is unknown, measure or estimate it from material data tables. Without this quantity, force calculations are impossible. For composite objects, compute an effective susceptibility from the volume-weighted average.

### Step 2: Apply Earnshaw's Theorem

Determine whether passive static levitation is possible for the given system:

1. **State Earnshaw's theorem**: In a region free of currents and time-varying fields, no static arrangement of charges or permanent magnets can produce a point of stable equilibrium for a paramagnetic or ferromagnetic body. Mathematically, the Laplacian of the magnetic potential energy satisfies nabla^2 U >= 0 (for paramagnetic/ferromagnetic), so U has no local minimum.
2. **Classify the object's response**: Determine whether the levitated object is paramagnetic (chi_v > 0), diamagnetic (chi_v < 0), ferromagnetic (chi_v >> 0, nonlinear), superconducting (perfect diamagnet, chi_v = -1), or a permanent magnet (fixed mu).
3. **Apply the theorem**:
   - For paramagnetic, ferromagnetic, or permanent magnet objects in a static field from permanent magnets or fixed currents: Earnshaw forbids stable levitation. At least one spatial direction will be unstable.
   - For diamagnetic objects: Earnshaw does NOT forbid levitation. nabla^2 U <= 0 allows a local energy minimum. Passive static levitation is permitted.
   - For superconductors: The Meissner effect provides perfect diamagnetism, and flux pinning can provide both levitation and lateral stability.
4. **Document the verdict**: State clearly whether the system is Earnshaw-forbidden or Earnshaw-permitted, and which material property determines the classification.

```markdown
## Earnshaw Analysis
- **Object magnetic classification**: [paramagnetic / diamagnetic / ferromagnetic / superconducting / permanent magnet]
- **Susceptibility**: chi_v = [value with units]
- **Earnshaw verdict**: [FORBIDDEN / PERMITTED]
- **Reasoning**: [which condition of the theorem applies or fails]
```

**Expected:** A definitive classification of whether the proposed levitation is Earnshaw-forbidden or Earnshaw-permitted, with the specific physical reasoning documented.

**On failure:** If the object has mixed magnetic character (e.g., a ferromagnetic core with a diamagnetic shell), analyze each component separately. The overall stability depends on the net energy landscape, which may require numerical field computation.

### Step 3: Identify Circumvention Mechanism

If Earnshaw's theorem forbids passive static levitation, identify which of the four standard circumvention mechanisms applies:

1. **Diamagnetic levitation**: The levitated object itself is diamagnetic (chi_v < 0). Examples: pyrolytic graphite over NdFeB magnets, water droplets and frogs in 16 T Bitter magnets. Requires strong field gradients; the condition is (chi_v / mu_0) * B * (dB/dz) >= rho * g, where rho is density.

2. **Superconducting levitation**: The object is a type-I or type-II superconductor below T_c.
   - **Meissner levitation**: Complete flux expulsion provides a repulsive force. Stable but has limited load capacity and requires the superconductor to remain in the Meissner state (B < B_c1).
   - **Flux pinning** (type-II superconductors): Magnetic flux vortices are pinned at defect sites in the material. This provides both vertical levitation force and lateral restoring force, allowing the superconductor to be suspended below or above the magnet. The object is locked in 3D position relative to the field source.

3. **Active electromagnetic feedback**: Sensors measure the object's position, and a controller adjusts electromagnet currents to maintain the equilibrium. Examples: EMS maglev trains (Transrapid), active magnetic bearings. Requires power supply, sensors, and a control system with bandwidth exceeding the mechanical resonance frequency.

4. **Spin-stabilized levitation**: A spinning permanent magnet (Levitron) achieves a gyroscopic stabilization of the tilting mode that Earnshaw's theorem otherwise makes unstable. The spin must exceed a critical frequency omega_c for gyroscopic stiffness to overcome the magnetic torque. The object must also remain within a narrow mass window.

```markdown
## Circumvention Mechanism
- **Mechanism**: [diamagnetic / superconducting (Meissner or flux pinning) / active feedback / spin-stabilized]
- **Physical basis**: [why this mechanism evades Earnshaw's theorem]
- **Key requirements**: [material property, field strength, temperature, spin rate, or control bandwidth]
- **Limitations**: [load capacity, power consumption, cryogenics, mass window]
```

**Expected:** Identification of the specific mechanism with its physical basis clearly explained, including quantitative requirements for the mechanism to function.

**On failure:** If the system does not clearly fit any of the four mechanisms, check for hybrid approaches (e.g., permanent magnets for the primary force with eddy current damping for stability, or diamagnetic stabilization of a paramagnetic system). Also consider whether the system uses electrodynamic levitation (moving conductors in a magnetic field), which is a distinct mechanism based on Lenz's law.

### Step 4: Calculate Levitation Conditions

Compute the force balance and quantitative conditions for stable levitation:

1. **Vertical force balance**: The magnetic force must equal gravity.
   - For a magnetic dipole in a field gradient: F_z = mu * (dB/dz) = m * g.
   - For a diamagnetic object: F_z = (chi_v * V / mu_0) * B * (dB/dz) = m * g.
   - For a superconductor (image method): Model the superconductor as a mirror and compute the repulsion between the magnet and its image.
   - For active feedback: F_z = k_coil * I(t), where I(t) is the feedback-controlled current.

2. **Solve for levitation height**: The force balance equation F_z(z) = m * g determines the equilibrium height z_0. For analytic field profiles, solve algebraically. For measured or numerically computed fields, solve graphically or numerically.

3. **Restoring force gradient (stiffness)**: Compute k_z = -dF_z/dz evaluated at z_0. For stable levitation, k_z > 0 (force decreases with increasing height). The natural frequency of vertical oscillation is omega_z = sqrt(k_z / m).

4. **Lateral stiffness**: Compute the restoring force gradient in the horizontal plane, k_x = -dF_x/dx. For Earnshaw-permitted systems (diamagnetic, superconducting), this should be positive. For feedback systems, it depends on the sensor-actuator geometry.

5. **Load capacity**: Determine the maximum mass that can be levitated by finding the field gradient at which the equilibrium becomes marginally stable (k_z -> 0 at the maximum displacement).

```markdown
## Levitation Conditions
- **Force balance equation**: [F_z(z) = m*g, explicit form]
- **Equilibrium height**: z_0 = [value]
- **Vertical stiffness**: k_z = [value, units N/m]
- **Vertical natural frequency**: omega_z = [value, units rad/s]
- **Lateral stiffness**: k_x = k_y = [value, units N/m]
- **Maximum load**: m_max = [value, units kg]
```

**Expected:** A complete force balance with the equilibrium position determined, stiffness values computed for vertical and lateral directions, and the load capacity estimated.

**On failure:** If the force balance has no solution (magnetic force too weak to overcome gravity), the system cannot levitate the specified object. Either increase the field gradient (stronger magnets, closer spacing), reduce the object mass, or switch to a material with higher susceptibility. If stiffness is negative in any direction, the equilibrium is unstable in that direction -- return to Step 3 to identify an appropriate stabilization mechanism.

### Step 5: Verify Stability in All Degrees of Freedom

Confirm that the levitation is stable against perturbations in all six rigid-body degrees of freedom (three translations, three rotations):

1. **Translational stability**: Verify k_z > 0, k_x > 0, k_y > 0. For axially symmetric systems, k_x = k_y by symmetry. Compute the restoring force for small displacements delta_x, delta_y, delta_z from equilibrium.

2. **Tilting stability**: Compute the restoring torque for small angular deflections theta_x, theta_y about the horizontal axes. For a magnetic dipole, the torque depends on the field curvature and the object's moment of inertia. Tilting instability is the primary failure mode of passive permanent magnet levitation (and the mode that spin stabilization in the Levitron addresses).

3. **Spin stability** (if applicable): For spin-stabilized systems, verify that the spin rate exceeds the critical frequency omega > omega_c. The critical frequency is determined by the ratio of magnetic torque to angular momentum. Below omega_c, precession leads to tilting instability.

4. **Dynamic stability**: For active feedback systems, verify that the control loop has sufficient phase margin (> 30 degrees) and gain margin (> 6 dB) at all resonance frequencies. Check that sensor noise does not excite instability.

5. **Thermal and external perturbations**: Assess the effect of temperature fluctuations (critical for superconductors near T_c), air currents (significant for diamagnetic levitation of light objects), and mechanical vibration (transmitted through the field source mounting).

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

**Expected:** All six degrees of freedom are either inherently stable (positive restoring force/torque) or stabilized by an identified mechanism (feedback, gyroscopic, flux pinning). The system is confirmed viable for levitation.

**On failure:** If any degree of freedom is unstable and no stabilization mechanism is identified, the levitation design is not viable as specified. The most common fix is adding an active feedback loop for the unstable direction, adding diamagnetic material for passive stabilization of a lateral mode, or increasing spin rate for gyroscopic stabilization. Return to Step 3 to incorporate the additional mechanism.

## Validation

- [ ] Object properties (mass, susceptibility or magnetic moment, geometry) are fully specified
- [ ] Field source and spatial profile are characterized with gradients computed
- [ ] Earnshaw's theorem is correctly applied to the object's magnetic classification
- [ ] The circumvention mechanism is identified with its physical basis explained
- [ ] Force balance is solved with equilibrium position determined
- [ ] Stiffness is computed for all three translational directions
- [ ] Tilting stability is analyzed for both horizontal tilt axes
- [ ] For spin-stabilized systems, the critical spin rate is computed and verified
- [ ] For active systems, control bandwidth and stability margins are checked
- [ ] Load capacity limits are estimated

## Common Pitfalls

- **Assuming permanent magnets can levitate each other statically**: Earnshaw's theorem forbids this for paramagnetic and ferromagnetic objects, yet it is the most common misconception. The attraction or repulsion along one axis always produces instability along a perpendicular axis. Always apply the theorem before attempting force balance calculations.
- **Confusing Meissner levitation with flux pinning**: Meissner effect (type-I) produces pure repulsion and only works with the superconductor below the magnet. Flux pinning (type-II) locks the superconductor at a fixed position relative to the field, allowing suspension in any orientation. The physics and the design implications are fundamentally different.
- **Ignoring tilting modes**: Many analyses check only translational stability and declare the system stable. Tilting instability is the primary failure mode for passive magnetic levitation and requires separate analysis. A system can have positive translational stiffness in all directions while being tilt-unstable.
- **Underestimating diamagnetic levitation field requirements**: Diamagnetic susceptibilities are very small (chi_v ~ -10^-5 for most materials, -4.5 x 10^-4 for pyrolytic graphite). Levitating even milligram-scale objects requires strong field gradients, typically B * dB/dz > 1000 T^2/m for non-graphite materials.
- **Neglecting eddy current effects**: Time-varying fields or moving conductors generate eddy currents that produce both forces and heating. In active feedback systems, eddy currents in the levitated object create phase lag that can destabilize the control loop.
- **Treating superconductors as perfect diamagnets in all conditions**: Type-II superconductors in the mixed state (B_c1 < B < B_c2) have partial flux penetration. The levitation force depends on the magnetization history (hysteresis), not just the instantaneous field.

## Related Skills

- `evaluate-levitation-mechanism` -- comparative analysis to select the best levitation approach for an application
- `analyze-magnetic-field` -- detailed computation of magnetic field profiles needed as input to this skill
- `formulate-maxwell-equations` -- derive the electromagnetic field equations governing the levitation system
- `design-acoustic-levitation` -- alternative non-magnetic levitation approach for comparison
- `formulate-quantum-problem` -- quantum mechanical treatment for superconducting levitation (BCS theory, Ginzburg-Landau)
