---
name: design-acoustic-levitation
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Design an acoustic levitation system that uses standing waves to trap and
  suspend small objects at pressure nodes. Covers ultrasonic transducer
  selection, standing wave formation between a transducer and reflector,
  node spacing and trapping position calculation, acoustic radiation pressure
  analysis, and phased array configurations for multi-axis manipulation.
  Use when designing contactless sample handling for chemistry, biology,
  materials science, or demonstration purposes.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: levitation
  complexity: intermediate
  language: natural
  tags: levitation, acoustic-levitation, standing-waves, ultrasonic, radiation-pressure
---

# Design Acoustic Levitation

Design + validate acoustic levitation. Determine radiation pressure → balance gravity, select transducer+reflector → standing wave, compute node positions + trapping strength, verify stability vs lateral/axial perturbations.

## Use When

- Contactless sample holder → chem/bio
- Levitator demo → education
- Eval: can object levitate (size, density, freq)?
- Single-axis (transducer-reflector) vs phased array
- Calc node positions + trapping forces
- Extend single → multi-axis w/ phased arrays

## In

- **Required**: Object props (mass, density, radius, compressibility if known)
- **Required**: Medium (air, water, inert gas) + density + speed of sound
- **Optional**: Transducer freq (default 40 kHz)
- **Optional**: Transducer power/voltage
- **Optional**: Manipulation cap (static vs dynamic)

## Do

### Step 1: Object props + acoustic contrast

Characterize → fundamental feasibility:

1. **Object params**: m, density rho_p, radius a, bulk modulus K_p (kappa_p = 1/K_p). Rigid metal → K_p effectively inf.
2. **Medium params**: rho_0, c_0, K_0 = rho_0 * c_0^2.
3. **Contrast factors** (Gor'kov → node vs antinode):
   - Monopole: f_1 = 1 - (K_0 / K_p) = 1 - (rho_0 * c_0^2) / (rho_p * c_p^2)
   - Dipole: f_2 = 2 * (rho_p - rho_0) / (2 * rho_p + rho_0)
   - Most solids in air: f_1 ~ 1, f_2 ~ 1 → trapped at pressure nodes (velocity antinodes).
4. **Size constraint**: a << lambda = c_0 / f (Gor'kov requires a << lambda, typically a < lambda/4). Else ray acoustics or full num sim.

```markdown
## Object and Medium Parameters
- **Object**: [material, mass, density, radius, bulk modulus]
- **Medium**: [gas/liquid, rho_0, c_0, K_0]
- **Contrast factors**: f_1 = [value], f_2 = [value]
- **Wavelength**: lambda = [value] at f = [frequency]
- **Size ratio**: a / lambda = [value] (must be << 1)
- **Trapping location**: [pressure node / pressure antinode]
```

→ Complete character. Object confirmed → pressure nodes. Size constraint OK.

If err: a / lambda > 0.25 → Gor'kov breaks. Use FEM acoustic sim or calibration. If f_1, f_2 opposite signs → intermediate position, map Gor'kov potential.

### Step 2: Required radiation pressure

Field intensity → balance gravity:

1. **Radiation force** (small sphere at node, 1D standing wave):
   - F_ax = -(4 * pi / 3) * a^3 * [f_1 * (1 / (2 * rho_0 * c_0^2)) * d(p^2)/dz - (3 * f_2 * rho_0 / 4) * d(v^2)/dz]
   - Plane standing wave p(z,t) = P_0 * cos(kz) * cos(omega*t) near node:
   - F_ax = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi * sin(2kz)
   - Phi = f_1 + (3/2) * f_2, k = 2*pi/lambda.
2. **Force balance**: Max force (sin(2kz) = 1, at lambda/8 from node) = gravity:
   - F_ax_max = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi = m * g = (4/3) * pi * a^3 * rho_p * g
   - Solve: P_0 = sqrt(4 * rho_p * rho_0 * c_0^2 * g / (k * Phi))
3. **Intensity**: I = P_0^2 / (2 * rho_0 * c_0). Compare transducer rating.
4. **SPL**: L = 20 * log10(P_0 / 20e-6). Typical air levitation 150-165 dB SPL.

```markdown
## Acoustic Requirements
- **Required pressure amplitude**: P_0 = [value] Pa
- **Required intensity**: I = [value] W/m^2
- **Sound pressure level**: L = [value] dB SPL
- **Safety note**: [hearing protection required if > 120 dB at audible frequencies]
```

→ P_0 min in Pa, W/m^2, dB SPL. Achievable w/ specified or commercial transducer.

If err: P_0 exceeds available → reduce mass/density, lighter material, denser medium (SF6). Multi transducers focused array.

### Step 3: Transducer-reflector geometry

HW → stable standing wave:

1. **Transducer**: Ultrasonic at f (28 kHz, 40 kHz, 60-80 kHz piezo). Higher f → smaller lambda, tighter trap, smaller max obj. Verify P_0 at operating distance.
2. **Reflector**: Flat or concave opposite transducer. Acoustically hard (high impedance mismatch). Metal/glass in air. Concave → concentrates sound + increases P at axis.
3. **Cavity length**: L = n * lambda/2 (n int). Creates n nodes spaced lambda/2.
4. **Node positions**: z_j = (2j - 1) * lambda/4 from reflector, j = 1..n. Node nearest center = most stable.
5. **Resonance tuning**: Fine-tune L w/ micrometer stage, monitor force or P w/ mic. Optimal → strongest standing wave.

```markdown
## Geometry Design
- **Transducer**: [model, frequency, rated power or SPL]
- **Reflector**: [material, shape (flat/concave), dimensions]
- **Cavity length**: L = [n] x lambda/2 = [value] mm
- **Number of nodes**: [n]
- **Node positions from reflector**: z_1 = [value], z_2 = [value], ...
- **Selected trapping node**: z_[j] = [value]
```

→ Complete HW spec + node positions + selected trap node.

If err: No standing wave (L not precise n*lambda/2) → 0.1 mm increments. Temp shifts c_0 + lambda → re-tune. Beam diverges → horn/waveguide or reduce L.

### Step 4: Trapping potential + restoring forces

Quantify strength + spatial extent:

1. **Gor'kov potential**:
   - U(r) = (4/3) * pi * a^3 * [(f_1 / (2 * rho_0 * c_0^2)) * <p^2> - (3 * f_2 * rho_0 / 4) * <v^2>]
   - Object trapped at min of U(r) + m*g*z.
2. **Axial restoring**:
   - F_z ~ -k_z * delta_z, k_z = (2 * pi * a^3 * P_0^2 * k^2) / (3 * rho_0 * c_0^2) * Phi
   - omega_z = sqrt(k_z / m).
3. **Lateral restoring** (Gaussian beam waist w):
   - k_r ~ k_z * (a / w)^2 (lateral weaker than axial)
   - Lateral = limiting factor for stability.
4. **Trap depth**: Max displacement before escape. Axial well: Delta_U = F_ax_max * lambda / (2 * pi). Express as × k_B*T if relevant.

```markdown
## Trapping Analysis
- **Axial stiffness**: k_z = [value] N/m
- **Axial natural frequency**: omega_z / (2*pi) = [value] Hz
- **Lateral stiffness**: k_r = [value] N/m
- **Lateral natural frequency**: omega_r / (2*pi) = [value] Hz
- **Axial well depth**: Delta_U = [value] J = [value] x k_B*T
- **Stiffness ratio**: k_z / k_r = [value] (lateral is weaker)
```

→ Stiffness for both axes + freqs + well depth. Lateral confirmed positive.

If err: Lateral neg/negligible → drifts sideways. Wider transducer (bigger waist), add lateral transducers, phased array, concave reflector for converging wavefront.

### Step 5: Stability vs perturbations

Reliable trap + hold:

1. **Gravity offset**: delta_z = m * g / k_z. Must be << lambda/4. If ~lambda/4 → falls out.
2. **Air currents**: F_drag = 6 * pi * eta * a * v_air (Stokes). Max tolerable: v_max = k_r / (6 * pi * eta).
3. **Acoustic streaming** (Rayleigh, steady circulation): v_stream ~ P_0^2 / (4 * rho_0 * c_0^3 * eta) * lambda. Drag on object. Must be < lateral restoring.
4. **Thermal**: Absorption heats medium → c_0 shifts → nodes drift. High-intensity (>160 dB SPL) → estimate temp rise + drift over time.
5. **Phased array ext** (dynamic): Replace single pair w/ phased array. Adjusting phases → nodes move continuously, carry object. Phase resolution: delta_z ~ lambda / (2 * pi * N_phase_bits).

```markdown
## Stability Verification
| Perturbation | Magnitude | Restoring Force | Margin | Stable? |
|-------------|-----------|----------------|--------|---------|
| Gravity offset | delta_z = [val] | k_z * delta_z | delta_z / (lambda/4) = [val] | [Yes/No] |
| Air currents | v_air = [val] m/s | F_lat = [val] N | F_lat / F_drag = [val] | [Yes/No] |
| Acoustic streaming | v_stream = [val] | F_lat = [val] N | F_lat / F_stream_drag = [val] | [Yes/No] |
| Thermal drift | Delta_T = [val] K | Re-tune interval | [time] | [Acceptable/No] |
```

→ All perturbations quantified + w/in margins. Gravity offset small frac of lambda/4. Air + streaming don't overwhelm lateral trap.

If err: Gravity offset too big → increase P_0 or higher freq. Air currents → draft shield. Streaming destabilizes → reduce amplitude, shallow concave reflector minimizes vortices.

## Check

- [ ] a << lambda (Gor'kov applicable)
- [ ] Contrast factors + node/antinode identified
- [ ] P_0 calc + achievable w/ HW
- [ ] Cavity L = n * lambda/2 + nodes computed
- [ ] Axial + lateral stiffness both positive
- [ ] Gravity offset small frac of lambda/4
- [ ] Air + streaming w/in margins
- [ ] Safety for high-SPL docs
- [ ] Phased array: phase res + precision specified

## Traps

- **Violating small-particle**: Gor'kov assumes a << lambda. Approaching lambda/4 → point-particle breaks, force diffs (mag + direction). Full-wave sim for large.
- **Ignoring lateral**: Most treatments focus axial, neglect lateral. Lateral instability = primary failure mode near size limit.
- **Forget streaming**: High-intensity → steady streaming drag vs radiation force. Not small — dominant destabilizer at high SPL.
- **Temp sensitivity**: c_0 in air → 0.6 m/s per °C. 10° swing → lambda shifts ~2% → nodes drift mm in typical cavity. Long runs need active comp or temp ctrl.
- **Pressure vs velocity nodes**: P nodes = v antinodes + vice versa. Solids w/ positive contrast → P nodes (P min, v max). Reversed → wrong position.
- **Nonlinear at high amp**: >155-160 dB SPL → harmonic gen, shock formation → reduces trapping vs linear theory.

## →

- `evaluate-levitation-mechanism` — compare acoustic vs magnetic, electrostatic, aerodynamic
- `analyze-magnetic-levitation` — complement for compare
- `derive-theoretical-result` — radiation pressure from first principles
