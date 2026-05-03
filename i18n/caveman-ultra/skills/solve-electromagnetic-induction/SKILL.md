---
name: solve-electromagnetic-induction
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Solve EM induction probs via changing magnetic flux: Faraday's law, Lenz,
  motional EMF, mutual + self-inductance, RL circuit transients. Use → induced
  EMF from time-varying B | moving conductors, current direction via Lenz,
  inductance + energy storage in mag fields, RL ODE for switching transients.
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

# Solve EM Induction

ID flux source → compute flux through surface → Faraday → EMF → Lenz → current direction → solve circuit eqns (RL transients + mag field energy).

## Use When

- Induced EMF in loop/coil from time-varying B
- Motional EMF from conductor moving in static B
- Current direction via Lenz
- Mutual M (coupled coils) | self-L (single coil)
- RL transients (energize, de-energize, switch)
- Mag field energy | inductor energy

## In

- **Required**: Source of changing flux (time-varying B, moving conductor, changing area)
- **Required**: Geometry of circuit/loop
- **Required**: Phys params (B mag, vel, R, L, geometry)
- **Optional**: Other circuit elements (R, additional L, sources)
- **Optional**: Initial conditions (I_0, U_0)
- **Optional**: Time interval

## Do

### Step 1: ID Flux Source

Classify mechanism producing time-varying flux:

1. **Changing B**: B(t) varies. Loop static. (AC magnet, approaching magnet, current ramp in nearby coil)
2. **Changing area**: A(t) varies. B may be static. (expanding/contracting loop, rotating coil in static field)
3. **Motional EMF**: Straight conductor through static B. Flux change = conductor sweeping area.
4. **Combined**: Both field + geometry change. Separate contributions for clarity.

Per mechanism, ID surface S bounded by loop C:

```markdown
## Flux Change Classification
- **Mechanism**: [changing B / changing area / motional / combined]
- **Surface S**: [description of the surface bounded by the loop]
- **Time dependence**: [which quantities vary: B(t), A(t), v(t), theta(t)]
- **Relevant parameters**: [B magnitude, loop dimensions, velocity, angular frequency]
```

**Got:** Clear ID of why flux changes, surface to integrate, which quantities carry time dep.

**If err:** Ambiguous (deforming loop in non-uniform field) → decompose: field change at fixed geom + geom change in instantaneous field. Always valid.

### Step 2: Calculate Magnetic Flux

Compute Phi_B = ∫ B·dA over S:

1. **Uniform field, flat loop**: Phi_B = B·A·cos(theta), theta = angle B vs n_hat. Most common.

2. **Non-uniform**: Parameterize S, eval integral:
   - Coords aligned w/ surface (polar for circular loop)
   - Express B(r) at each point
   - Dot product B·dA = B·n_hat dA
   - Integrate

3. **Coupled coils (mutual M)**: Coil 2 linked to 1:
   - B_1 (from coil 1) at coil 2 location
   - Integrate B_1 over each turn of coil 2
   - × N_2 → flux linkage Lambda_21 = N_2·Phi_21
   - M = Lambda_21 / I_1

4. **Self-L**: Single coil w/ I:
   - B inside from own current
   - Integrate over one turn × N
   - L = N·Phi/I = Lambda/I
   - Known: solenoid L = mu_0·n²·A·l; toroid L = mu_0·N²·A/(2π·R)

5. **Time dep**: Express Phi_B(t) via time-varying quantities from Step 1.

```markdown
## Flux Calculation
- **Flux expression**: Phi_B(t) = [formula]
- **Evaluation**: [analytic / numeric]
- **Flux linkage** (if multi-turn): Lambda = N * Phi_B = [formula]
- **Inductance** (if applicable): L = [value with units] or M = [value with units]
```

**Got:** Explicit Phi_B(t), correct units (Wb = T·m²), inductance in H.

**If err:** Integral can't be analytical (non-uniform B over non-trivial S) → numerical quadrature. Mutual M for complex geom → Neumann formula: M = (mu_0/4π)·∮∮(dl_1·dl_2)/|r_1 - r_2|.

### Step 3: Faraday → EMF

Compute induced EMF from time deriv of flux:

1. **Faraday**: EMF = -dLambda/dt = -N·dPhi_B/dt. Negative sign = Lenz.

2. **Differentiate** Phi_B(t):
   - B = B(t), A + theta const → EMF = -N·A·cos(theta)·dB/dt
   - theta = omega·t (rotating in static B) → EMF = N·B·A·omega·sin(omega·t)
   - Area changes (sliding rail) → EMF = -B·l·v (motional EMF)
   - General → Leibniz integral rule

3. **Motional EMF (alt)**: Conductor length l, vel v in B:
   - Lorentz on charges: F = q(v × B)
   - EMF = ∫(v × B)·dl along conductor
   - Equiv to Faraday, more intuitive for moving conductors

4. **Sign + magnitude check**: Lab setups: mV-V. Power gen: V-kV.

```markdown
## Induced EMF
- **EMF expression**: EMF(t) = [formula]
- **Peak EMF** (if AC): EMF_0 = [value with units]
- **RMS EMF** (if AC): EMF_rms = EMF_0 / sqrt(2) = [value]
- **Derivation method**: [Faraday's law / motional EMF / Leibniz rule]
```

**Got:** Explicit EMF(t), correct units (V), reasonable magnitude.

**If err:** Wrong units → trace flux calc; missing area factor | mixing CGS/SI. Wrong sign → re-examine surface normal vs loop direction (right-hand rule).

### Step 4: Lenz → Current Direction

ID induced current direction + phys consequences:

1. **Lenz**: Induced current opposes the flux change that produced it. = Energy conservation.

2. **Apply**:
   - Flux ↑ → induced current → B opposes ↑ (opposite external B through loop)
   - Flux ↓ → induced current → B supports ↓ (same direction as external B)
   - Right-hand rule → B direction → current direction

3. **Force consequences**: Induced current in external B → force:
   - Eddy current braking: opposes relative motion (always decel)
   - Mag levitation: repulsive supports weight (right geom)
   - Lenz at mechanical level

4. **Qual verify**: Effects always resist change. Falling magnet through conductor tube falls slower than free fall. Generator needs mech work in → elec energy.

```markdown
## Current Direction
- **Flux change**: [increasing / decreasing]
- **Induced B direction**: [opposing increase / supporting decrease]
- **Current direction**: [CW / CCW as viewed from specified direction]
- **Mechanical consequence**: [braking force / levitation / energy transfer]
```

**Got:** Clear current direction consistent w/ Lenz, phys consequence ID'd.

**If err:** Current amplifies flux change → surface normal | RH rule reversed. Re-examine loop convention. Current reinforcing change → violates energy conservation.

### Step 5: Solve Circuit Eqn

Formulate + solve circuit eqn w/ inductance:

1. **RL formation**: Induced EMF drives I through R + L, KVL gives:
   - Energize (switch → DC V_0): V_0 = L·dI/dt + R·I
   - De-energize (source removed, loop closed): 0 = L·dI/dt + R·I
   - General (time-varying EMF): EMF(t) = L·dI/dt + R·I

2. **Solve 1st-order ODE**:
   - Energize: I(t) = (V_0/R)·[1 - exp(-t/tau)], tau = L/R
   - De-energize: I(t) = I_0·exp(-t/tau)
   - AC EMF = EMF_0·sin(omega·t) → phasor methods | particular + homogeneous
   - Transient: ~63% final after 1·tau, ~95% after 3·tau, ~99.3% after 5·tau

3. **Energy**:
   - Inductor: U_L = (1/2)·L·I²
   - Mag field per vol: u_B = B²/(2·mu_0) vacuum, (1/2)·B·H mag materials
   - R dissipation: P_R = I²·R
   - Conservation: rate energy in = rate stored + rate dissipated

4. **Mutual M coupling**: Two coupled coils:
   - V_1 = L_1·dI_1/dt + M·dI_2/dt + R_1·I_1
   - V_2 = M·dI_1/dt + L_2·dI_2/dt + R_2·I_2
   - Coupling k = M/sqrt(L_1·L_2), 0 ≤ k ≤ 1
   - Solve coupled ODEs (matrix exp | Laplace)

5. **Steady-state vs transient**: AC drive → decompose transient (decaying exp) + steady-state (sinusoidal at drive freq). Report Z_L = j·omega·L + phase angle.

```markdown
## Circuit Solution
- **Circuit type**: [RL energizing / de-energizing / AC driven / coupled coils]
- **Time constant**: tau = L/R = [value with units]
- **Current solution**: I(t) = [expression]
- **Energy stored**: U_L = [value at specified time]
- **Energy dissipated**: [total or rate]
- **Steady-state impedance** (if AC): Z_L = [value]
```

**Got:** Complete time-domain I solution, correct exp time constants, energy balance verified, reasonable magnitudes.

**If err:** Current grows unbounded → sign err in ODE (L term must oppose dI). Tau unreasonable → recheck L (Step 2) + R. Lab RL tau: μs to s.

## Check

- [ ] Source of flux change clearly ID'd
- [ ] Flux integral over correct S w/ proper orientation
- [ ] Flux units Wb = T·m²
- [ ] L (self/mutual) units H, reasonable mag
- [ ] EMF units V, reasonable mag
- [ ] EMF sign consistent w/ Lenz
- [ ] Current dir via Lenz + RH rule
- [ ] RL ODE correct setup, proper signs
- [ ] tau = L/R units s, reasonable mag
- [ ] Energy balance: in = stored + dissipated
- [ ] Limits checked (t→0 init, t→∞ steady)

## Traps

- **Wrong sign Faraday**: EMF = -dLambda/dt, NOT +. Negative = Lenz + energy conservation. Omit → current amplifies flux change → violates thermo.
- **Flux vs flux linkage**: Single-turn: Phi_B = Lambda. N-turn: Lambda = N·Phi_B. L = Lambda/I, NOT Phi_B/I. Missing N factor → L is N× too small.
- **Surface normal inconsistency**: n_hat must be RH-rule related to loop circulation. Independent → sign errs in flux + EMF.
- **Ignore back-EMF (RL)**: Current changes in L → back-EMF opposes change. Omit from KVL → algebraic not differential → miss transient entirely.
- **Instant current change**: Current through ideal L can't change instant (needs ∞ V). Initial conds for RL transients must satisfy continuity across switches.
- **Eddy currents bulk conductors**: Faraday applies to ANY closed path in conductor, not just wire loops. Time-varying fields in bulk → distributed eddy currents → heating + shielding. Critical in transformer cores → minimize w/ lamination.

## →

- `analyze-magnetic-field` — compute B from current distributions = flux source
- `formulate-maxwell-equations` — generalize induction → full Maxwell + displacement current
- `design-electromagnetic-device` — apply to motors, generators, transformers
- `derive-theoretical-result` — derive analytic L, EMF, transient solutions from first principles
