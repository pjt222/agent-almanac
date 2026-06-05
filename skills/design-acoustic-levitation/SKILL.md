---
name: design-acoustic-levitation
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

Design and validate an acoustic levitation system by determining the acoustic radiation pressure required to balance gravity, selecting transducer and reflector geometry to form a stable standing wave, computing the positions and trapping strength of pressure nodes, and verifying that the trapped object is stable against lateral and axial perturbations.

## When to Use

- Designing a contactless sample holder for chemical or biological experiments
- Building an acoustic levitation demonstrator for education or outreach
- Evaluating whether a given object can be levitated acoustically (size, density, and frequency constraints)
- Selecting between single-axis (transducer-reflector) and phased array configurations
- Calculating the node positions and trapping forces for a given transducer frequency and geometry
- Extending a single-axis levitator to multi-axis manipulation using phased arrays

## Inputs

- **Required**: Object properties (mass, density, radius or characteristic dimension, compressibility if known)
- **Required**: Target levitation medium (air, water, inert gas) with its density and speed of sound
- **Optional**: Available transducer frequency (default: 40 kHz, common for hobbyist and lab systems)
- **Optional**: Transducer power or voltage rating
- **Optional**: Desired manipulation capability (static trapping only, or dynamic repositioning)

## Procedure

### Step 1: Determine Object Properties and Acoustic Contrast

Characterize the object and the medium to establish the fundamental feasibility of acoustic levitation:

1. **Object parameters**: Record the mass m, density rho_p, radius a (or equivalent sphere radius for non-spherical objects), and bulk modulus K_p (compressibility kappa_p = 1/K_p). For rigid objects like metal spheres, K_p is effectively infinite.
2. **Medium parameters**: Record the density rho_0, speed of sound c_0, and bulk modulus K_0 = rho_0 * c_0^2 for the host medium.
3. **Acoustic contrast factor**: Compute the Gor'kov contrast factors that determine whether the object migrates to pressure nodes or antinodes:
   - Monopole coefficient: f_1 = 1 - (K_0 / K_p) = 1 - (rho_0 * c_0^2) / (rho_p * c_p^2)
   - Dipole coefficient: f_2 = 2 * (rho_p - rho_0) / (2 * rho_p + rho_0)
   - For most solid objects in air, f_1 ~ 1 and f_2 ~ 1, so the object is trapped at pressure nodes (velocity antinodes).
4. **Size constraint**: Verify that the object radius a is much smaller than the acoustic wavelength lambda = c_0 / f. The Gor'kov theory requires a << lambda (typically a < lambda/4). If this condition is not met, ray acoustics or full numerical simulation is needed.

```markdown
## Object and Medium Parameters
- **Object**: [material, mass, density, radius, bulk modulus]
- **Medium**: [gas/liquid, rho_0, c_0, K_0]
- **Contrast factors**: f_1 = [value], f_2 = [value]
- **Wavelength**: lambda = [value] at f = [frequency]
- **Size ratio**: a / lambda = [value] (must be << 1)
- **Trapping location**: [pressure node / pressure antinode]
```

**Expected:** Complete characterization of the object and medium with contrast factors computed. The object should be confirmed to migrate toward pressure nodes (typical case for solids in air). The size constraint a << lambda is satisfied.

**On failure:** If a / lambda > 0.25, the Gor'kov point-particle theory breaks down. Use numerical methods (finite element acoustic simulation) or experimental calibration instead. If f_1 and f_2 have opposite signs, the object may be trapped at an intermediate position rather than a clean node or antinode -- this requires careful Gor'kov potential mapping.

### Step 2: Calculate Required Acoustic Radiation Pressure

Determine the acoustic field intensity needed to balance gravity:

1. **Acoustic radiation force**: For a small sphere at a pressure node in a one-dimensional standing wave, the time-averaged axial force is:
   - F_ax = -(4 * pi / 3) * a^3 * [f_1 * (1 / (2 * rho_0 * c_0^2)) * d(p^2)/dz - (3 * f_2 * rho_0 / 4) * d(v^2)/dz]
   - In a plane standing wave p(z,t) = P_0 * cos(kz) * cos(omega*t), this simplifies near a node to:
   - F_ax = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi * sin(2kz)
   - where Phi = f_1 + (3/2) * f_2 is the acoustic contrast factor and k = 2*pi/lambda.
2. **Force balance**: Set the maximum radiation force (at sin(2kz) = 1, which occurs at lambda/8 from the node) equal to gravity:
   - F_ax_max = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi = m * g = (4/3) * pi * a^3 * rho_p * g
   - Solve for the required pressure amplitude:
   - P_0 = sqrt(4 * rho_p * rho_0 * c_0^2 * g / (k * Phi))
3. **Acoustic intensity**: Convert pressure amplitude to intensity: I = P_0^2 / (2 * rho_0 * c_0). Compare with the transducer's rated output.
4. **Sound pressure level**: Express in dB SPL: L = 20 * log10(P_0 / 20e-6). Typical acoustic levitation in air requires 150-165 dB SPL.

```markdown
## Acoustic Requirements
- **Required pressure amplitude**: P_0 = [value] Pa
- **Required intensity**: I = [value] W/m^2
- **Sound pressure level**: L = [value] dB SPL
- **Safety note**: [hearing protection required if > 120 dB at audible frequencies]
```

**Expected:** A quantitative determination of the minimum acoustic pressure amplitude to achieve levitation, expressed in Pa, W/m^2, and dB SPL. The required intensity should be achievable with the specified or a commercially available transducer.

**On failure:** If the required pressure amplitude exceeds what available transducers can produce, reduce the object mass or density, use a lighter material, or switch to a medium with higher density (e.g., levitate in a dense gas like SF6 to increase the radiation force). Alternatively, use multiple transducers in a focused array to concentrate acoustic energy at the trapping point.

### Step 3: Design Transducer-Reflector Geometry

Configure the physical hardware to produce a stable standing wave:

1. **Transducer selection**: Choose an ultrasonic transducer at frequency f (common: 28 kHz, 40 kHz, or 60-80 kHz piezoelectric transducers). Higher frequency gives smaller wavelength and tighter trapping, but reduces the maximum object size. Verify that the transducer can produce the required P_0 at the operating distance.
2. **Reflector design**: Place a flat or concave reflector opposite the transducer. The reflector surface should be acoustically hard (high acoustic impedance mismatch with the medium). Metal or glass plates work well in air. A concave reflector concentrates the sound field and increases the pressure amplitude at the axis.
3. **Cavity length**: Set the transducer-reflector distance L to an integer number of half-wavelengths: L = n * lambda/2, where n is a positive integer. This creates n pressure nodes between the transducer and reflector, spaced lambda/2 apart.
4. **Node positions**: The pressure nodes are located at z_j = (2j - 1) * lambda/4 from the reflector surface, for j = 1, 2, ..., n. The node closest to the center of the cavity is typically the most stable trapping site.
5. **Resonance tuning**: Fine-tune L by adjusting the transducer-reflector distance with a micrometer stage while monitoring the levitation force or the acoustic pressure with a microphone. The optimal distance produces the strongest standing wave.

```markdown
## Geometry Design
- **Transducer**: [model, frequency, rated power or SPL]
- **Reflector**: [material, shape (flat/concave), dimensions]
- **Cavity length**: L = [n] x lambda/2 = [value] mm
- **Number of nodes**: [n]
- **Node positions from reflector**: z_1 = [value], z_2 = [value], ...
- **Selected trapping node**: z_[j] = [value]
```

**Expected:** A complete hardware specification with transducer, reflector, and cavity length determined. Node positions are computed and the trapping node is selected.

**On failure:** If no stable standing wave forms (common when L is not precisely n * lambda/2), adjust the cavity length in increments of 0.1 mm. Temperature changes shift c_0 and thus lambda, requiring re-tuning. If the transducer beam diverges too much for the cavity length, add a horn or waveguide to collimate the beam, or reduce L.

### Step 4: Compute Trapping Potential and Restoring Forces

Quantify the strength and spatial extent of the acoustic trap:

1. **Gor'kov potential**: For a small sphere in the standing wave field, compute the Gor'kov potential:
   - U(r) = (4/3) * pi * a^3 * [(f_1 / (2 * rho_0 * c_0^2)) * <p^2> - (3 * f_2 * rho_0 / 4) * <v^2>]
   - where <p^2> and <v^2> are the time-averaged squared pressure and velocity fields.
   - The object is trapped at the minimum of U(r) + m*g*z (including gravity).
2. **Axial restoring force**: Near the trapping node, expand F_z to first order:
   - F_z ~ -k_z * delta_z, where k_z = (2 * pi * a^3 * P_0^2 * k^2) / (3 * rho_0 * c_0^2) * Phi
   - The axial natural frequency is omega_z = sqrt(k_z / m).
3. **Lateral restoring force**: In a finite-width beam, the lateral radiation force arises from the transverse intensity gradient. For a Gaussian beam profile with waist w:
   - k_r ~ k_z * (a / w)^2 (approximate, lateral stiffness is weaker than axial)
   - Lateral trapping is weaker than axial; this is the limiting factor for stability.
4. **Trapping depth**: The maximum displacement before the object escapes the trap is determined by the potential well depth. For the axial direction, the well depth is Delta_U = F_ax_max * lambda / (2 * pi). Express as a multiple of the thermal energy k_B * T if relevant (always relevant for micrometer-scale particles, negligible for millimeter-scale objects in air).

```markdown
## Trapping Analysis
- **Axial stiffness**: k_z = [value] N/m
- **Axial natural frequency**: omega_z / (2*pi) = [value] Hz
- **Lateral stiffness**: k_r = [value] N/m
- **Lateral natural frequency**: omega_r / (2*pi) = [value] Hz
- **Axial well depth**: Delta_U = [value] J = [value] x k_B*T
- **Stiffness ratio**: k_z / k_r = [value] (lateral is weaker)
```

**Expected:** Quantitative stiffness values for both axial and lateral directions, natural frequencies computed, and the trapping potential well depth determined. Lateral stiffness is confirmed to be positive (though weaker than axial).

**On failure:** If the lateral stiffness is negative or negligibly small, the object will drift sideways out of the beam. Solutions include using a wider transducer (larger beam waist), adding lateral transducers, switching to a phased array configuration, or using a concave reflector to create a converging wavefront that provides stronger lateral confinement.

### Step 5: Verify Stability Against Perturbations

Confirm that the designed system will reliably trap and hold the object:

1. **Gravity offset**: The equilibrium position is shifted below the pressure node by delta_z = m * g / k_z. Verify that delta_z << lambda/4 (the distance to the potential maximum). If delta_z approaches lambda/4, the object falls out of the trap.
2. **Air current sensitivity**: Estimate the drag force from ambient air currents. For a sphere, F_drag = 6 * pi * eta * a * v_air (Stokes drag). Compare with the lateral restoring force: the maximum tolerable air speed is v_max = k_r * a / (6 * pi * eta * a) = k_r / (6 * pi * eta).
3. **Acoustic streaming**: The standing wave drives steady circulatory flows (Rayleigh streaming) with velocity v_stream ~ P_0^2 / (4 * rho_0 * c_0^3 * eta) * lambda. These flows exert drag on the levitated object. Verify that the streaming drag is smaller than the lateral restoring force.
4. **Thermal effects**: Acoustic absorption heats the medium, changing c_0 and shifting the node positions. For high-intensity operation (> 160 dB SPL), estimate the temperature rise and the resulting node drift over the operating time.
5. **Phased array extension** (if manipulation is needed): For dynamic object repositioning, replace the single transducer-reflector pair with a phased array of transducers. By adjusting the relative phases, the pressure node positions can be moved continuously, carrying the trapped object with them. The phase resolution determines the positioning precision: delta_z ~ lambda / (2 * pi * N_phase_bits).

```markdown
## Stability Verification
| Perturbation | Magnitude | Restoring Force | Margin | Stable? |
|-------------|-----------|----------------|--------|---------|
| Gravity offset | delta_z = [val] | k_z * delta_z | delta_z / (lambda/4) = [val] | [Yes/No] |
| Air currents | v_air = [val] m/s | F_lat = [val] N | F_lat / F_drag = [val] | [Yes/No] |
| Acoustic streaming | v_stream = [val] | F_lat = [val] N | F_lat / F_stream_drag = [val] | [Yes/No] |
| Thermal drift | Delta_T = [val] K | Re-tune interval | [time] | [Acceptable/No] |
```

**Expected:** All perturbation sources are quantified and shown to be within the trapping margins. The gravity offset is a small fraction of lambda/4. Air current and streaming effects do not overwhelm the lateral trap.

**On failure:** If the gravity offset is too large (heavy object, weak field), increase P_0 or use a higher frequency (stronger gradient per wavelength). If air currents are a problem, enclose the levitator in a draft shield. If acoustic streaming destabilizes the object, reduce the driving amplitude and use a reflector geometry that minimizes streaming vortices (e.g., a shallow concave reflector).

## Validation

- [ ] Object size satisfies a << lambda (Gor'kov theory applicable)
- [ ] Acoustic contrast factors are computed and the trapping location (node/antinode) is identified
- [ ] Required pressure amplitude P_0 is calculated and achievable with specified hardware
- [ ] Transducer-reflector cavity length is set to n * lambda/2 with node positions computed
- [ ] Axial and lateral stiffness are both positive
- [ ] Gravity offset delta_z is a small fraction of lambda/4
- [ ] Air current and acoustic streaming perturbations are within trapping margins
- [ ] Safety considerations for high-SPL operation are documented
- [ ] If phased array is used, phase control resolution and positioning precision are specified

## Common Pitfalls

- **Violating the small-particle assumption**: The Gor'kov radiation force formula assumes a << lambda. For objects approaching lambda/4 in size, the point-particle approximation breaks down and the actual force can differ significantly (both in magnitude and direction) from the Gor'kov prediction. Use full-wave simulation for large objects.
- **Ignoring lateral confinement**: Most introductory treatments focus on the axial (vertical) trapping force and neglect the much weaker lateral restoring force. In practice, lateral instability is the primary failure mode, especially for objects near the upper size limit.
- **Forgetting acoustic streaming**: High-intensity standing waves always drive steady streaming flows. These flows exert drag on the levitated object that competes with the radiation force. Streaming is not a small effect -- it can be the dominant destabilizing influence at high SPL.
- **Temperature sensitivity**: The speed of sound in air changes by about 0.6 m/s per degree Celsius. Over a 10-degree temperature swing, the wavelength shifts by about 2%, which moves the node positions by millimeters in a typical cavity. Long-running experiments need active length compensation or temperature control.
- **Confusing pressure nodes with velocity nodes**: Pressure nodes are velocity antinodes and vice versa. Solid objects with positive contrast factors are trapped at pressure nodes (where the pressure oscillation is minimum and the velocity oscillation is maximum). Reversing this leads to trapping at the wrong position.
- **Neglecting nonlinear effects at high amplitude**: Above approximately 155-160 dB SPL, nonlinear acoustic effects (harmonic generation, shock formation) become significant and reduce the effective trapping force compared to linear theory predictions.

## Related Skills

- `evaluate-levitation-mechanism` -- compare acoustic levitation with magnetic, electrostatic, and aerodynamic alternatives
- `analyze-magnetic-levitation` -- complementary magnetic levitation analysis for comparison
- `derive-theoretical-result` -- derive acoustic radiation pressure from first principles
