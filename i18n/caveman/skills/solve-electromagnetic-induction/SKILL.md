---
name: solve-electromagnetic-induction
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Solve problems involving changing magnetic flux using Faraday's law, Lenz's
  law, motional EMF, mutual and self-inductance, and RL circuit transients.
  Use when computing induced EMF from time-varying B-fields or moving
  conductors, determining current direction via Lenz's law, analyzing
  inductance and energy storage in magnetic fields, or solving RL circuit
  differential equations for switching transients.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: intermediate
  language: natural
  tags: electromagnetism, induction, faraday, lenz, inductance, rl-circuits
---

# Solve Electromagnetic Induction

Analyze electromagnetic induction phenomena. Identify source of changing magnetic flux. Compute flux through relevant surface. Apply Faraday's law to obtain induced EMF. Determine induced current direction via Lenz's law. Solve resulting circuit equations including RL transients and energy stored in magnetic field.

## When Use

- Compute induced EMF in loop or coil due to time-varying magnetic field
- Analyze motional EMF from conductor moving through static B-field
- Determine direction of induced current using Lenz's law
- Calculate mutual inductance between coupled coils or self-inductance of single coil
- Solve RL circuit transients (energizing, de-energizing, switching between states)
- Compute energy stored in magnetic field or in inductor

## Inputs

- **Required**: Source of changing flux (time-varying B-field, moving conductor, or changing loop area)
- **Required**: Geometry of circuit or loop through which flux is computed
- **Required**: Relevant physical parameters (B-field magnitude, velocity, resistance, inductance, or geometry for inductance calculation)
- **Optional**: Circuit elements connected to induction loop (resistors, additional inductors, sources)
- **Optional**: Initial conditions for transient analysis (initial current, initial stored energy)
- **Optional**: Time interval of interest for transient solutions

## Steps

### Step 1: Identify Source of Changing Flux

Classify physical mechanism that produces time-varying magnetic flux:

1. **Changing B-field**: The magnetic field itself varies in time (e.g., AC electromagnet, approaching magnet, current ramp in a nearby coil). The loop is stationary.
2. **Changing area**: The loop area changes (e.g., expanding or contracting loop, rotating coil in a static field). The B-field may be static.
3. **Moving conductor (motional EMF)**: A straight conductor moves through a static B-field. The flux change arises from the conductor sweeping out area.
4. **Combined**: Both the field and geometry change simultaneously (e.g., a coil rotating in a time-varying field). Separate the contributions for clarity.

For each mechanism, identify the relevant surface S bounded by the circuit loop C:

```markdown
## Flux Change Classification
- **Mechanism**: [changing B / changing area / motional / combined]
- **Surface S**: [description of the surface bounded by the loop]
- **Time dependence**: [which quantities vary: B(t), A(t), v(t), theta(t)]
- **Relevant parameters**: [B magnitude, loop dimensions, velocity, angular frequency]
```

**Got:** Clear identification of why flux changes, what surface to integrate over, which physical quantities carry time dependence.

**If fail:** Source of changing flux ambiguous (e.g., deforming loop in non-uniform field)? Decompose problem into sum of contributions: one from field change at fixed geometry, one from geometry change in instantaneous field. Decomposition always valid.

### Step 2: Calculate Magnetic Flux Through Relevant Surface

Compute the magnetic flux Phi_B = integral of B . dA over the surface S:

1. **Uniform field, flat loop**: Phi_B = B * A * cos(theta), where theta is the angle between B and the area normal vector n_hat. This is the most common textbook case.

2. **Non-uniform field**: Parameterize the surface S and evaluate the integral:
   - Choose coordinates aligned with the surface (e.g., polar for a circular loop)
   - Express B(r) at each point on the surface
   - Compute the dot product B . dA = B . n_hat dA
   - Integrate over the surface

3. **Coupled coils (mutual inductance)**: For coil 2 linked to coil 1:
   - Compute B_1 (field from coil 1) at the location of coil 2
   - Integrate B_1 over the area of each turn of coil 2
   - Multiply by N_2 (number of turns in coil 2) for total flux linkage: Lambda_21 = N_2 * Phi_21
   - Mutual inductance: M = Lambda_21 / I_1

4. **Self-inductance**: For a single coil carrying current I:
   - Compute B inside the coil from the coil's own current
   - Integrate B over one turn's cross-section and multiply by N
   - Self-inductance: L = N * Phi / I = Lambda / I
   - Known results: solenoid L = mu_0 * n^2 * A * l; toroid L = mu_0 * N^2 * A / (2 pi R)

5. **Time dependence**: Express Phi_B(t) explicitly by substituting the time-varying quantities identified in Step 1.

```markdown
## Flux Calculation
- **Flux expression**: Phi_B(t) = [formula]
- **Evaluation**: [analytic / numeric]
- **Flux linkage** (if multi-turn): Lambda = N * Phi_B = [formula]
- **Inductance** (if applicable): L = [value with units] or M = [value with units]
```

**Got:** Explicit expression for Phi_B(t) with correct units (Weber = T . m^2) and, if applicable, inductance values with units of Henry.

**If fail:** Flux integral cannot be evaluated analytic (e.g., non-uniform field over non-trivial surface)? Use numerical quadrature. Mutual inductance of complex geometries? Consider Neumann formula: M = (mu_0 / 4 pi) * double_contour_integral of (dl_1 . dl_2) / |r_1 - r_2|.

### Step 3: Apply Faraday's Law for Induced EMF

Compute induced EMF from time derivative of flux:

1. **Faraday's law**: EMF = -d(Lambda)/dt = -N * d(Phi_B)/dt. The negative sign encodes Lenz's law (opposition to the change).

2. **Differentiation**: Take the total time derivative of Phi_B(t):
   - If B = B(t) and A, theta are constant: EMF = -N * A * cos(theta) * dB/dt
   - If theta = omega * t (rotating coil in static B): EMF = N * B * A * omega * sin(omega * t)
   - If the area changes (e.g., sliding rail): EMF = -B * l * v (motional EMF, where l is the rail length and v the velocity)
   - For the general case: use the Leibniz integral rule to differentiate under the integral sign

3. **Motional EMF (alternative derivation)**: For a conductor of length l moving with velocity v in field B:
   - The Lorentz force on charges in the conductor: F = q(v x B)
   - EMF = integral of (v x B) . dl along the conductor
   - This is equivalent to Faraday's law but can be more intuitive for moving conductors

4. **Sign and magnitude check**: The magnitude of EMF should be physically reasonable. For typical laboratory setups: mV to V range. For power generation: V to kV range.

```markdown
## Induced EMF
- **EMF expression**: EMF(t) = [formula]
- **Peak EMF** (if AC): EMF_0 = [value with units]
- **RMS EMF** (if AC): EMF_rms = EMF_0 / sqrt(2) = [value]
- **Derivation method**: [Faraday's law / motional EMF / Leibniz rule]
```

**Got:** Explicit expression for EMF(t) with correct units (Volts) and physically reasonable magnitude.

**If fail:** EMF has wrong units? Trace back to flux calculation -- missing factor of area or inconsistent unit system (e.g., mixing CGS and SI) most likely cause. EMF sign seems wrong? Re-examine surface normal orientation relative to circuit loop direction (right-hand rule).

### Step 4: Determine Current Direction via Lenz's Law

Establish direction of induced current and physical consequences:

1. **Lenz's law statement**: The induced current flows in the direction that opposes the change in magnetic flux that produced it. This is a consequence of energy conservation.

2. **Application procedure**:
   - Determine whether the flux through the loop is increasing or decreasing
   - If flux is increasing: induced current creates a B-field that opposes the increase (opposing the external field direction through the loop)
   - If flux is decreasing: induced current creates a B-field that supports the decreasing flux (same direction as the external field through the loop)
   - Use the right-hand rule to convert the required B-field direction into a current direction

3. **Force consequences**: The induced current in the presence of the external B-field experiences a force:
   - Eddy current braking: the force opposes the relative motion (always decelerating)
   - Magnetic levitation: the repulsive force supports weight when the geometry is appropriate
   - These forces are a direct manifestation of Lenz's law at the mechanical level

4. **Qualitative verification**: The induced effects should always resist the change. A falling magnet through a conducting tube falls slower than in free fall. A generator requires mechanical work input to produce electrical energy.

```markdown
## Current Direction
- **Flux change**: [increasing / decreasing]
- **Induced B direction**: [opposing increase / supporting decrease]
- **Current direction**: [CW / CCW as viewed from specified direction]
- **Mechanical consequence**: [braking force / levitation / energy transfer]
```

**Got:** Clear stated current direction consistent with Lenz's law, with physical consequence (force, braking, energy transfer) identified.

**If fail:** Current direction seems to amplify flux change rather than oppose? Surface normal orientation or right-hand rule application reversed. Re-examine loop orientation convention. Current that reinforces flux change would violate energy conservation.

### Step 5: Solve Resulting Circuit Equation

Formulate and solve circuit equation including inductance:

1. **RL circuit formation**: When the induced EMF drives current through a circuit with resistance R and inductance L, Kirchhoff's voltage law gives:
   - Energizing (switch closes onto DC source V_0): V_0 = L dI/dt + R I
   - De-energizing (source removed, loop closed): 0 = L dI/dt + R I
   - General (time-varying EMF): EMF(t) = L dI/dt + R I

2. **Solution of the first-order ODE**:
   - Energizing: I(t) = (V_0 / R) * [1 - exp(-t / tau)], where tau = L / R is the time constant
   - De-energizing: I(t) = I_0 * exp(-t / tau)
   - AC drive EMF = EMF_0 sin(omega t): solve using phasor methods or particular + homogeneous solution
   - Transient duration: current reaches ~63% of final value after 1 tau, ~95% after 3 tau, ~99.3% after 5 tau

3. **Energy analysis**:
   - Energy stored in the inductor: U_L = (1/2) L I^2
   - Energy stored in the magnetic field per unit volume: u_B = B^2 / (2 mu_0) in vacuum, or u_B = (1/2) B . H in magnetic materials
   - Power dissipated in resistance: P_R = I^2 R
   - Energy conservation: rate of energy input = rate of energy storage + rate of dissipation

4. **Mutual inductance coupling**: For two coupled coils with mutual inductance M:
   - V_1 = L_1 dI_1/dt + M dI_2/dt + R_1 I_1
   - V_2 = M dI_1/dt + L_2 dI_2/dt + R_2 I_2
   - Coupling coefficient: k = M / sqrt(L_1 L_2), where 0 <= k <= 1
   - Solve the coupled ODEs simultaneously (matrix exponential or Laplace transform)

5. **Steady-state and transient separation**: For AC-driven circuits, decompose the solution into a transient (decaying exponential) and steady-state (sinusoidal at the drive frequency). Report impedance Z_L = j omega L and phase angle.

```markdown
## Circuit Solution
- **Circuit type**: [RL energizing / de-energizing / AC driven / coupled coils]
- **Time constant**: tau = L/R = [value with units]
- **Current solution**: I(t) = [expression]
- **Energy stored**: U_L = [value at specified time]
- **Energy dissipated**: [total or rate]
- **Steady-state impedance** (if AC): Z_L = [value]
```

**Got:** Complete time-domain solution for current with correct exponential time constants, energy balance verified, physically reasonable magnitudes.

**If fail:** Current grows without bound? Sign error in ODE setup likely (inductance term should oppose changes in current). Time constant unreasonably large or small? Double-check inductance calculation from Step 2 and resistance value. Time constants for typical laboratory RL circuits range from microseconds to seconds.

## Checks

- [ ] Source of changing flux clear identified (changing B, changing area, motional, combined)
- [ ] Magnetic flux integral set up over correct surface with proper orientation
- [ ] Flux has correct units (Weber = T . m^2)
- [ ] Inductance values (self or mutual) have correct units (Henry) and reasonable magnitude
- [ ] EMF has correct units (Volts) and physically reasonable magnitude
- [ ] EMF sign consistent with Lenz's law (opposes flux change)
- [ ] Current direction determined by Lenz's law and verified with right-hand rule
- [ ] RL circuit ODE correctly set up with proper signs
- [ ] Time constant tau = L/R has correct units (seconds) and reasonable magnitude
- [ ] Energy balance verified: input energy = stored energy + dissipated energy
- [ ] Limiting cases checked (t -> 0 for initial conditions, t -> infinity for steady state)

## Pitfalls

- **Wrong sign in Faraday's law**: EMF is EMF = -d(Lambda)/dt, not +d(Lambda)/dt. Negative sign essential -- encodes Lenz's law and energy conservation. Omitting produces current that amplifies flux change, violating thermodynamics.
- **Confuse flux and flux linkage**: Single-turn loop? Phi_B and Lambda same. N-turn coil? Lambda = N * Phi_B. Inductance defined as L = Lambda / I, not L = Phi_B / I. Missing factor of N produces inductance values N times too small.
- **Surface normal inconsistency**: Surface normal n_hat must be related to loop circulation direction by right-hand rule. Choosing independent leads to sign errors in both flux and EMF.
- **Ignore back-EMF in RL circuits**: Current changes in inductor? Inductor generates back-EMF opposing change. Omit this term from Kirchhoff's voltage law makes circuit equation algebraic instead of differential, missing transient entirely.
- **Assume instantaneous current change**: Current through ideal inductor cannot change instantaneous (would need infinite voltage). Initial conditions for RL transients must satisfy continuity of inductor current across switching events.
- **Neglect eddy currents in bulk conductors**: Faraday's law applies to any closed path in conductor, not just discrete wire loops. Time-varying fields in bulk conductors induce distributed eddy currents that produce heating (loss) and opposing fields (shielding). Critical in transformer cores; must be minimized with lamination.

## See Also

- `analyze-magnetic-field` -- compute B-field from current distributions that serve as flux source
- `formulate-maxwell-equations` -- generalize induction to full Maxwell framework including displacement current
- `design-electromagnetic-device` -- apply induction principles to motors, generators, transformers
- `derive-theoretical-result` -- derive analytic results for inductance, EMF, or transient solutions from first principles
