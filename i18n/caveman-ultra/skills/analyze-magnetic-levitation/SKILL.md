---
name: analyze-magnetic-levitation
locale: caveman-ultra
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

Can system achieve stable lev? ID mechanism enabling/forbidding, calc force balance + stability, verify stable vs perturbations in all DOF including tilting.

## Use When

- Eval proposed lev design physically viable
- Determine why perm magnet fails + ID workaround
- Analyze superconducting lev (Meissner, flux pinning, mixed-state trapping)
- Design/troubleshoot active EM feedback lev (maglev trains, magnetic bearings)
- Assess diamagnetic lev feasibility given material + field
- Understand spin-stabilized lev (Levitron) dynamics

## In

- **Required**: Levitated object (mass, geometry, magnetic moment or susceptibility)
- **Required**: Field src (perm magnets, electromagnets, supercond coils, geometry)
- **Optional**: Op env (temp, vacuum, vibration constraints)
- **Optional**: Desired lev height/gap
- **Optional**: Stability reqs (stiffness, damping, bandwidth active)

## Do

### Step 1: Characterize System

Complete physical desc of object + field src pre-analysis:

1. **Object props**: Mass m, geometry (sphere, disk, rod), magnetic moment mu (perm magnet objects), vol susceptibility chi_v (para/dia/ferromagnetic), conductivity sigma (eddy currents).
2. **Field src props**: Config — perm magnet array (Halbach, dipole, quadrupole), electromagnet coil params (turns, current, core), or supercond coil (critical current, critical field).
3. **Field geometry**: Spatial profile B(r). ID gradient dB/dz along lev axis + curvature d^2B/dz^2 governing stability.
4. **Env constraints**: Temp range (cryogenic for supercond), atm (vacuum reduces damping), vibration spectrum.

```markdown
## System Characterization
- **Object**: [mass, geometry, mu or chi_v, sigma]
- **Field source**: [type, configuration, key parameters]
- **Field profile**: [B(r) functional form or measured map]
- **Gradient**: [dB/dz at intended levitation point]
- **Environment**: [temperature, pressure, vibration]
```

**→** Complete spec of object + field src → determine forces + stability no more assumptions.

**If err:** Susceptibility/moment unknown → measure or estimate material data tables. No quantity → force calc impossible. Composite objects → effective susceptibility vol-weighted avg.

### Step 2: Apply Earnshaw

Passive static lev possible?

1. **State Earnshaw**: Region free of currents + time-varying fields, no static arrangement of charges/perm magnets produces stable equilibrium pt for para/ferromagnetic body. Laplacian of magnetic potential energy nabla^2 U >= 0 (para/ferro) → U has no local min.
2. **Classify response**: Object paramagnetic (chi_v > 0), diamagnetic (chi_v < 0), ferromagnetic (chi_v >> 0, nonlinear), supercond (perfect diamagnet, chi_v = -1), or perm magnet (fixed mu).
3. **Apply**:
   - Para/ferro/perm magnet in static field from perm magnets/fixed currents → Earnshaw forbids stable lev. ≥1 spatial direction unstable.
   - Diamagnetic → Earnshaw does NOT forbid. nabla^2 U <= 0 allows local min. Passive static permitted.
   - Supercond → Meissner = perfect diamagnetism, flux pinning → both lev + lateral stability.
4. **Doc verdict**: Clearly state Earnshaw-forbidden or Earnshaw-permitted + which material prop determines.

```markdown
## Earnshaw Analysis
- **Object magnetic classification**: [paramagnetic / diamagnetic / ferromagnetic / superconducting / permanent magnet]
- **Susceptibility**: chi_v = [value with units]
- **Earnshaw verdict**: [FORBIDDEN / PERMITTED]
- **Reasoning**: [which condition of the theorem applies or fails]
```

**→** Definitive classification Earnshaw-forbidden or permitted + specific physical reasoning.

**If err:** Mixed magnetic character (ferromagnetic core + diamagnetic shell) → analyze each separately. Overall stability from net energy landscape → may need numerical field computation.

### Step 3: ID Circumvention

If Earnshaw forbids passive static → ID which of 4 std circumventions:

1. **Diamagnetic lev**: Object itself diamagnetic (chi_v < 0). Examples: pyrolytic graphite over NdFeB, water drops + frogs in 16 T Bitter magnets. Reqs strong gradients: (chi_v / mu_0) * B * (dB/dz) >= rho * g, rho = density.

2. **Supercond lev**: Type-I or type-II supercond below T_c.
   - **Meissner lev**: Complete flux expulsion → repulsive force. Stable but limited load + supercond must stay in Meissner state (B < B_c1).
   - **Flux pinning** (type-II): Flux vortices pinned at defect sites. Provides both vertical lev force + lateral restoring. Supercond suspended below or above magnet. Locked in 3D position rel to field src.

3. **Active EM feedback**: Sensors measure position, controller adjusts electromagnet currents → equilibrium. Examples: EMS maglev (Transrapid), active magnetic bearings. Reqs power + sensors + control system bandwidth > mechanical resonance freq.

4. **Spin-stabilized lev**: Spinning perm magnet (Levitron) → gyroscopic stabilization of tilting mode Earnshaw makes unstable. Spin > critical freq omega_c → gyroscopic stiffness overcomes magnetic torque. Object must stay within narrow mass window.

```markdown
## Circumvention Mechanism
- **Mechanism**: [diamagnetic / superconducting (Meissner or flux pinning) / active feedback / spin-stabilized]
- **Physical basis**: [why this mechanism evades Earnshaw's theorem]
- **Key requirements**: [material property, field strength, temperature, spin rate, or control bandwidth]
- **Limitations**: [load capacity, power consumption, cryogenics, mass window]
```

**→** ID specific mechanism + physical basis clearly + quant reqs.

**If err:** Doesn't fit any → check hybrid (perm magnets primary force + eddy current damping stability, or diamagnetic stabilization of paramagnetic). Consider electrodynamic lev (moving conductors in field) → distinct via Lenz.

### Step 4: Calc Lev Conditions

Force balance + quant conditions:

1. **Vertical force balance**: Magnetic force = gravity.
   - Magnetic dipole in gradient: F_z = mu * (dB/dz) = m * g.
   - Diamagnetic: F_z = (chi_v * V / mu_0) * B * (dB/dz) = m * g.
   - Supercond (image method): Model as mirror + compute repulsion between magnet + image.
   - Active feedback: F_z = k_coil * I(t), I(t) feedback-controlled.

2. **Solve lev height**: F_z(z) = m * g → equilibrium z_0. Analytic → solve algebraic. Measured/numerical → graphically or numerically.

3. **Restoring force gradient (stiffness)**: k_z = -dF_z/dz at z_0. Stable → k_z > 0 (force decreases w/ increasing height). Vertical oscillation freq omega_z = sqrt(k_z / m).

4. **Lateral stiffness**: k_x = -dF_x/dx in horizontal. Earnshaw-permitted (diamagnetic, supercond) → should be positive. Feedback systems → depends on sensor-actuator geometry.

5. **Load capacity**: Max mass levitated → field gradient where equilibrium marginally stable (k_z → 0 at max displacement).

```markdown
## Levitation Conditions
- **Force balance equation**: [F_z(z) = m*g, explicit form]
- **Equilibrium height**: z_0 = [value]
- **Vertical stiffness**: k_z = [value, units N/m]
- **Vertical natural frequency**: omega_z = [value, units rad/s]
- **Lateral stiffness**: k_x = k_y = [value, units N/m]
- **Maximum load**: m_max = [value, units kg]
```

**→** Complete force balance + equilibrium pos + stiffness vertical + lateral + load capacity.

**If err:** No force balance solution (too weak for gravity) → can't levitate. Increase gradient (stronger magnets, closer spacing), reduce mass, or switch higher-susceptibility material. Neg stiffness any direction → unstable that direction → Step 3 for stabilization.

### Step 5: Verify Stability All DOF

Stable all 6 rigid-body DOF (3 trans, 3 rot):

1. **Translational**: k_z > 0, k_x > 0, k_y > 0. Axially symmetric → k_x = k_y by sym. Compute restoring force small delta_x, delta_y, delta_z.

2. **Tilting**: Restoring torque small ang deflections theta_x, theta_y about horizontal axes. Magnetic dipole → torque depends on field curvature + moment of inertia. Tilting instability = primary failure passive perm magnet lev (spin stabilization Levitron addresses).

3. **Spin** (if applicable): Spin-stabilized → spin > critical omega > omega_c. Critical freq determined by magnetic torque / ang momentum ratio. Below omega_c → precession → tilting instability.

4. **Dynamic**: Active feedback → control loop phase margin (>30°) + gain margin (>6 dB) at all resonance freqs. Sensor noise no excite instability.

5. **Thermal + external perturbations**: Temp fluctuations (supercond near T_c), air currents (diamagnetic lev of light objects), mechanical vibration (field src mounting).

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

**→** All 6 DOF inherently stable or stabilized by ID'd mechanism (feedback, gyroscopic, flux pinning). System viable.

**If err:** Any DOF unstable + no stabilization → design not viable. Common fix: add active feedback unstable direction, diamagnetic material passive stabilization lateral mode, or increase spin → gyroscopic. Step 3 → incorporate additional mechanism.

## Check

- [ ] Object props (mass, susceptibility/moment, geometry) fully specified
- [ ] Field src + profile characterized + gradients computed
- [ ] Earnshaw correctly applied to magnetic classification
- [ ] Circumvention mechanism ID'd + physical basis
- [ ] Force balance solved + equilibrium pos
- [ ] Stiffness computed all 3 translational
- [ ] Tilting stability analyzed both horizontal tilt axes
- [ ] Spin-stabilized → critical spin rate computed + verified
- [ ] Active → control bandwidth + stability margins checked
- [ ] Load capacity limits estimated

## Traps

- **Assume perm magnets levitate each other statically**: Earnshaw forbids para/ferro, yet common misconception. Attraction/repulsion along 1 axis always → instability perp axis. Always apply theorem pre-force balance.
- **Confuse Meissner w/ flux pinning**: Meissner (type-I) pure repulsion, only works supercond below magnet. Flux pinning (type-II) locks supercond at fixed position rel to field → suspension any orientation. Physics + design implications fundamentally different.
- **Ignore tilting modes**: Many analyses check only translational + declare stable. Tilting instability = primary failure passive magnetic lev, needs separate analysis. Pos translational stiffness all directions while tilt-unstable possible.
- **Underestimate diamagnetic field reqs**: Diamagnetic susceptibilities very small (chi_v ~ -10^-5 most, -4.5 x 10^-4 pyrolytic graphite). Levitate mg objects → strong gradients, typically B * dB/dz > 1000 T^2/m for non-graphite.
- **Neglect eddy current effects**: Time-varying or moving conductors → eddy currents → forces + heating. Active feedback → eddy currents in object create phase lag → destabilize control loop.
- **Treat supercond as perfect diamagnets all conditions**: Type-II in mixed state (B_c1 < B < B_c2) partial flux penetration. Lev force depends on magnetization history (hysteresis), not just instantaneous field.

## →

- `evaluate-levitation-mechanism` — comparative analysis → select best approach
- `analyze-magnetic-field` — detailed field profile computation, input to this
- `formulate-maxwell-equations` — derive EM field eqs
- `design-acoustic-levitation` — alternative non-magnetic lev for compare
- `formulate-quantum-problem` — quantum treatment supercond lev (BCS, Ginzburg-Landau)
