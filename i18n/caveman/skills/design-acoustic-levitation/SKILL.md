---
name: design-acoustic-levitation
locale: caveman
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

Design and validate acoustic levitation system by determining acoustic radiation pressure required to balance gravity, selecting transducer and reflector geometry to form stable standing wave, computing positions and trapping strength of pressure nodes, and verifying trapped object stable against lateral and axial perturbations.

## When Use

- Design contactless sample holder for chemical or biological experiments
- Build acoustic levitation demonstrator for education or outreach
- Evaluate whether given object can be levitated acoustically (size, density, frequency constraints)
- Pick between single-axis (transducer-reflector) and phased array configurations
- Calculate node positions and trapping forces for given transducer frequency and geometry
- Extend single-axis levitator to multi-axis manipulation using phased arrays

## Inputs

- **Required**: Object properties (mass, density, radius or characteristic dimension, compressibility if known)
- **Required**: Target levitation medium (air, water, inert gas) with density and speed of sound
- **Optional**: Available transducer frequency (default: 40 kHz, common for hobbyist and lab systems)
- **Optional**: Transducer power or voltage rating
- **Optional**: Desired manipulation capability (static trapping only, or dynamic repositioning)

## Steps

### Step 1: Determine Object Properties and Acoustic Contrast

Characterize object and medium to establish fundamental feasibility of acoustic levitation:

1. **Object parameters**: Record mass m, density rho_p, radius a (or equivalent sphere radius for non-spherical objects), bulk modulus K_p (compressibility kappa_p = 1/K_p). For rigid objects like metal spheres, K_p effectively infinite.
2. **Medium parameters**: Record density rho_0, speed of sound c_0, bulk modulus K_0 = rho_0 * c_0^2 for host medium.
3. **Acoustic contrast factor**: Compute Gor'kov contrast factors determining whether object migrates to pressure nodes or antinodes:
   - Monopole coefficient: f_1 = 1 - (K_0 / K_p) = 1 - (rho_0 * c_0^2) / (rho_p * c_p^2)
   - Dipole coefficient: f_2 = 2 * (rho_p - rho_0) / (2 * rho_p + rho_0)
   - For most solid objects in air, f_1 ~ 1 and f_2 ~ 1, so object trapped at pressure nodes (velocity antinodes).
4. **Size constraint**: Verify object radius a much smaller than acoustic wavelength lambda = c_0 / f. Gor'kov theory requires a << lambda (typically a < lambda/4). If this condition not met, ray acoustics or full numerical simulation needed.

```markdown
## Object and Medium Parameters
- **Object**: [material, mass, density, radius, bulk modulus]
- **Medium**: [gas/liquid, rho_0, c_0, K_0]
- **Contrast factors**: f_1 = [value], f_2 = [value]
- **Wavelength**: lambda = [value] at f = [frequency]
- **Size ratio**: a / lambda = [value] (must be << 1)
- **Trapping location**: [pressure node / pressure antinode]
```

**Got:** Complete characterization of object and medium with contrast factors computed. Object confirmed to migrate toward pressure nodes (typical case for solids in air). Size constraint a << lambda satisfied.

**If fail:** If a / lambda > 0.25, Gor'kov point-particle theory breaks down. Use numerical methods (finite element acoustic simulation) or experimental calibration instead. If f_1 and f_2 have opposite signs, object may be trapped at intermediate position rather than clean node or antinode -- requires careful Gor'kov potential mapping.

### Step 2: Calculate Required Acoustic Radiation Pressure

Determine acoustic field intensity needed to balance gravity:

1. **Acoustic radiation force**: For small sphere at pressure node in one-dimensional standing wave, time-averaged axial force:
   - F_ax = -(4 * pi / 3) * a^3 * [f_1 * (1 / (2 * rho_0 * c_0^2)) * d(p^2)/dz - (3 * f_2 * rho_0 / 4) * d(v^2)/dz]
   - In plane standing wave p(z,t) = P_0 * cos(kz) * cos(omega*t), simplifies near node to:
   - F_ax = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi * sin(2kz)
   - where Phi = f_1 + (3/2) * f_2 is acoustic contrast factor and k = 2*pi/lambda.
2. **Force balance**: Set maximum radiation force (at sin(2kz) = 1, occurs at lambda/8 from node) equal to gravity:
   - F_ax_max = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi = m * g = (4/3) * pi * a^3 * rho_p * g
   - Solve for required pressure amplitude:
   - P_0 = sqrt(4 * rho_p * rho_0 * c_0^2 * g / (k * Phi))
3. **Acoustic intensity**: Convert pressure amplitude to intensity: I = P_0^2 / (2 * rho_0 * c_0). Compare with transducer's rated output.
4. **Sound pressure level**: Express in dB SPL: L = 20 * log10(P_0 / 20e-6). Typical acoustic levitation in air requires 150-165 dB SPL.

```markdown
## Acoustic Requirements
- **Required pressure amplitude**: P_0 = [value] Pa
- **Required intensity**: I = [value] W/m^2
- **Sound pressure level**: L = [value] dB SPL
- **Safety note**: [hearing protection required if > 120 dB at audible frequencies]
```

**Got:** Quantitative determination of minimum acoustic pressure amplitude to achieve levitation, expressed in Pa, W/m^2, dB SPL. Required intensity achievable with specified or commercially available transducer.

**If fail:** If required pressure amplitude exceeds what available transducers can produce, reduce object mass or density, use lighter material, or switch to medium with higher density (e.g., levitate in dense gas like SF6 to increase radiation force). Alternatively, use multiple transducers in focused array to concentrate acoustic energy at trapping point.

### Step 3: Design Transducer-Reflector Geometry

Configure physical hardware to produce stable standing wave:

1. **Transducer selection**: Choose ultrasonic transducer at frequency f (common: 28 kHz, 40 kHz, or 60-80 kHz piezoelectric transducers). Higher frequency gives smaller wavelength and tighter trapping, but reduces maximum object size. Verify transducer produces required P_0 at operating distance.
2. **Reflector design**: Place flat or concave reflector opposite transducer. Reflector surface should be acoustically hard (high acoustic impedance mismatch with medium). Metal or glass plates work well in air. Concave reflector concentrates sound field and increases pressure amplitude at axis.
3. **Cavity length**: Set transducer-reflector distance L to integer number of half-wavelengths: L = n * lambda/2, where n is positive integer. Creates n pressure nodes between transducer and reflector, spaced lambda/2 apart.
4. **Node positions**: Pressure nodes located at z_j = (2j - 1) * lambda/4 from reflector surface, for j = 1, 2, ..., n. Node closest to center of cavity typically most stable trapping site.
5. **Resonance tuning**: Fine-tune L by adjusting transducer-reflector distance with micrometer stage while monitoring levitation force or acoustic pressure with microphone. Optimal distance produces strongest standing wave.

```markdown
## Geometry Design
- **Transducer**: [model, frequency, rated power or SPL]
- **Reflector**: [material, shape (flat/concave), dimensions]
- **Cavity length**: L = [n] x lambda/2 = [value] mm
- **Number of nodes**: [n]
- **Node positions from reflector**: z_1 = [value], z_2 = [value], ...
- **Selected trapping node**: z_[j] = [value]
```

**Got:** Complete hardware specification with transducer, reflector, cavity length determined. Node positions computed. Trapping node selected.

**If fail:** If no stable standing wave forms (common when L not precisely n * lambda/2), adjust cavity length in increments of 0.1 mm. Temperature changes shift c_0 and thus lambda, requiring re-tuning. If transducer beam diverges too much for cavity length, add horn or waveguide to collimate beam, or reduce L.

### Step 4: Compute Trapping Potential and Restoring Forces

Quantify strength and spatial extent of acoustic trap:

1. **Gor'kov potential**: For small sphere in standing wave field, compute Gor'kov potential:
   - U(r) = (4/3) * pi * a^3 * [(f_1 / (2 * rho_0 * c_0^2)) * <p^2> - (3 * f_2 * rho_0 / 4) * <v^2>]
   - where <p^2> and <v^2> are time-averaged squared pressure and velocity fields.
   - Object trapped at minimum of U(r) + m*g*z (including gravity).
2. **Axial restoring force**: Near trapping node, expand F_z to first order:
   - F_z ~ -k_z * delta_z, where k_z = (2 * pi * a^3 * P_0^2 * k^2) / (3 * rho_0 * c_0^2) * Phi
   - Axial natural frequency is omega_z = sqrt(k_z / m).
3. **Lateral restoring force**: In finite-width beam, lateral radiation force arises from transverse intensity gradient. For Gaussian beam profile with waist w:
   - k_r ~ k_z * (a / w)^2 (approximate, lateral stiffness weaker than axial)
   - Lateral trapping weaker than axial; limiting factor for stability.
4. **Trapping depth**: Maximum displacement before object escapes trap determined by potential well depth. For axial direction, well depth Delta_U = F_ax_max * lambda / (2 * pi). Express as multiple of thermal energy k_B * T if relevant (always relevant for micrometer-scale particles, negligible for millimeter-scale objects in air).

```markdown
## Trapping Analysis
- **Axial stiffness**: k_z = [value] N/m
- **Axial natural frequency**: omega_z / (2*pi) = [value] Hz
- **Lateral stiffness**: k_r = [value] N/m
- **Lateral natural frequency**: omega_r / (2*pi) = [value] Hz
- **Axial well depth**: Delta_U = [value] J = [value] x k_B*T
- **Stiffness ratio**: k_z / k_r = [value] (lateral is weaker)
```

**Got:** Quantitative stiffness values for both axial and lateral directions. Natural frequencies computed. Trapping potential well depth determined. Lateral stiffness confirmed to be positive (though weaker than axial).

**If fail:** If lateral stiffness negative or negligibly small, object drifts sideways out of beam. Solutions: use wider transducer (larger beam waist), add lateral transducers, switch to phased array configuration, or use concave reflector to create converging wavefront providing stronger lateral confinement.

### Step 5: Verify Stability Against Perturbations

Confirm designed system will reliably trap and hold object:

1. **Gravity offset**: Equilibrium position shifted below pressure node by delta_z = m * g / k_z. Verify delta_z << lambda/4 (distance to potential maximum). If delta_z approaches lambda/4, object falls out of trap.
2. **Air current sensitivity**: Estimate drag force from ambient air currents. For sphere, F_drag = 6 * pi * eta * a * v_air (Stokes drag). Compare with lateral restoring force: maximum tolerable air speed v_max = k_r * a / (6 * pi * eta * a) = k_r / (6 * pi * eta).
3. **Acoustic streaming**: Standing wave drives steady circulatory flows (Rayleigh streaming) with velocity v_stream ~ P_0^2 / (4 * rho_0 * c_0^3 * eta) * lambda. Flows exert drag on levitated object. Verify streaming drag smaller than lateral restoring force.
4. **Thermal effects**: Acoustic absorption heats medium, changing c_0 and shifting node positions. For high-intensity operation (> 160 dB SPL), estimate temperature rise and resulting node drift over operating time.
5. **Phased array extension** (if manipulation needed): For dynamic object repositioning, replace single transducer-reflector pair with phased array of transducers. By adjusting relative phases, pressure node positions can be moved continuously, carrying trapped object with them. Phase resolution determines positioning precision: delta_z ~ lambda / (2 * pi * N_phase_bits).

```markdown
## Stability Verification
| Perturbation | Magnitude | Restoring Force | Margin | Stable? |
|-------------|-----------|----------------|--------|---------|
| Gravity offset | delta_z = [val] | k_z * delta_z | delta_z / (lambda/4) = [val] | [Yes/No] |
| Air currents | v_air = [val] m/s | F_lat = [val] N | F_lat / F_drag = [val] | [Yes/No] |
| Acoustic streaming | v_stream = [val] | F_lat = [val] N | F_lat / F_stream_drag = [val] | [Yes/No] |
| Thermal drift | Delta_T = [val] K | Re-tune interval | [time] | [Acceptable/No] |
```

**Got:** All perturbation sources quantified and shown to be within trapping margins. Gravity offset is small fraction of lambda/4. Air current and streaming effects do not overwhelm lateral trap.

**If fail:** If gravity offset too large (heavy object, weak field), increase P_0 or use higher frequency (stronger gradient per wavelength). If air currents problem, enclose levitator in draft shield. If acoustic streaming destabilizes object, reduce driving amplitude and use reflector geometry minimizing streaming vortices (e.g., shallow concave reflector).

## Checks

- [ ] Object size satisfies a << lambda (Gor'kov theory applicable)
- [ ] Acoustic contrast factors computed and trapping location (node/antinode) identified
- [ ] Required pressure amplitude P_0 calculated and achievable with specified hardware
- [ ] Transducer-reflector cavity length set to n * lambda/2 with node positions computed
- [ ] Axial and lateral stiffness both positive
- [ ] Gravity offset delta_z small fraction of lambda/4
- [ ] Air current and acoustic streaming perturbations within trapping margins
- [ ] Safety considerations for high-SPL operation documented
- [ ] If phased array used, phase control resolution and positioning precision specified

## Pitfalls

- **Violating small-particle assumption**: Gor'kov radiation force formula assumes a << lambda. For objects approaching lambda/4 in size, point-particle approximation breaks down. Actual force differs significantly (both in magnitude and direction) from Gor'kov prediction. Use full-wave simulation for large objects.
- **Ignoring lateral confinement**: Most introductory treatments focus on axial (vertical) trapping force and neglect much weaker lateral restoring force. In practice, lateral instability is primary failure mode, especially for objects near upper size limit.
- **Forgetting acoustic streaming**: High-intensity standing waves always drive steady streaming flows. Flows exert drag on levitated object competing with radiation force. Streaming not small effect -- can be dominant destabilizing influence at high SPL.
- **Temperature sensitivity**: Speed of sound in air changes by about 0.6 m/s per degree Celsius. Over 10-degree temperature swing, wavelength shifts by about 2%, moving node positions by millimeters in typical cavity. Long-running experiments need active length compensation or temperature control.
- **Confusing pressure nodes with velocity nodes**: Pressure nodes are velocity antinodes and vice versa. Solid objects with positive contrast factors trapped at pressure nodes (where pressure oscillation minimum and velocity oscillation maximum). Reversing leads to trapping at wrong position.
- **Neglecting nonlinear effects at high amplitude**: Above approximately 155-160 dB SPL, nonlinear acoustic effects (harmonic generation, shock formation) become significant and reduce effective trapping force compared to linear theory predictions.

## See Also

- `evaluate-levitation-mechanism` -- compare acoustic levitation with magnetic, electrostatic, aerodynamic alternatives
- `analyze-magnetic-levitation` -- complementary magnetic levitation analysis for comparison
- `derive-theoretical-result` -- derive acoustic radiation pressure from first principles
