---
name: design-electromagnetic-device
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Design practical electromagnetic devices including electromagnets, DC and
  brushless motors, generators, and transformers by bridging theory to
  application. Use when sizing a solenoid or toroidal electromagnet for a
  target field or force, selecting motor topology and computing torque and
  efficiency, designing a transformer for a given voltage ratio and power
  rating, or analyzing losses from copper resistance, core hysteresis, and
  eddy currents.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: intermediate
  language: natural
  tags: electromagnetism, device-design, motors, generators, transformers, electromagnets
---

# Design Electromagnetic Device

Spec perf → topology → compute from EM first principles → analyze losses + efficiency → validate vs thermal + saturation.

## Use When

- Size electromagnet (solenoid/toroidal) for B-field, pull, hold force
- Select motor topology (DC brushed, BLDC, stepper, induction), compute torque + speed + eff
- Design generator → V, I, freq
- Design transformer → V ratio, power, freq
- Analyze + min losses: copper (I^2 R), core (hyst + eddy), stray flux

## In

- **Required**: Device type (electromagnet, motor, generator, transformer)
- **Required**: Perf reqs (B, force, torque, V ratio, power, eff target)
- **Required**: Operating (V, I, freq, duty, ambient T)
- **Optional**: Core mat (silicon steel, ferrite, powdered iron, air) + B-H
- **Optional**: Size/weight
- **Optional**: Cost/mfg

## Do

### Step 1: Reqs + operating

Full targets before topology:

1. **Primary metric**:
   - Electromagnet: B (T) at point, or pull force (N) on armature
   - Motor: rated T (N.m) at RPM, or power (W) at RPM
   - Generator: V, I, Hz at mech speed
   - Transformer: V1, V2, VA, freq

2. **Secondary**: Eff (%), max T rise above ambient (K), duty (cont, intermittent, pulsed), envelope (max D, L, weight).

3. **Supply**: V, I, freq (DC/AC w/ Hz), waveform (sine, PWM, trapezoidal).

4. **Environment**: T range, cooling (nat convection, forced air, liquid), altitude, vibration/shock.

```markdown
## Design Requirements
- **Device type**: [electromagnet / motor / generator / transformer]
- **Primary specification**: [value with units]
- **Efficiency target**: [%]
- **Supply**: [voltage, current, frequency]
- **Thermal limit**: [max temperature rise in K]
- **Size constraint**: [dimensions or weight]
- **Duty cycle**: [continuous / intermittent (on-time/off-time) / pulsed]
```

→ Complete quantified reqs, no ambiguity. Every req has val + units.

If err: Conflict (high T in tiny vol + high eff) → identify tradeoff explicit. EM scaling: force ~ volume, losses ~ surface area, thermal constrains power density.

### Step 2: Topology

Config matches reqs:

1. **Electromagnet**:
   - **Solenoid** (cylindrical): Simple wind, uniform B = mu_0 n I. Uniform-field apps. Air gap for pull.
   - **Toroid**: No stray field. Min stray. Less uniform for partial.
   - **C-core / E-core**: High force compact. Air gap concentrates. Relays + hold magnets.
   - **Helmholtz pair**: 2 coils sep by 1 radius. Uniform center. Calibration + measurement.

2. **Motor**:
   - **DC brushed**: Simple drive, good low-speed T. Brushes limit lifetime + speed. T = k_T * I.
   - **BLDC**: Electronic commutation, higher speed + lifetime. Trapezoidal/sinusoidal. Modern dominant.
   - **Stepper**: Precise open-loop (1.8 or 0.9 deg). Lower cont T than BLDC. Positioning w/o feedback.
   - **AC induction**: Robust, no PM, simple. Speed = supply freq + slip. Industrial power.

3. **Generator**: Motors reversed. BLDC motor → BLDC gen (back-EMF = output). Induction above sync. PM gen for small (wind, hydro).

4. **Transformer**:
   - **Core type**: Windings on single leg. Std power.
   - **Shell type**: Core around windings. Better shielding. High-power.
   - **Toroidal**: No gap, low stray, compact. Higher winding cost. Audio + sensitive electronics.
   - **Planar / PCB**: PCB trace windings. Low profile. SMPS at high freq.

```markdown
## Topology Selection
- **Topology chosen**: [specific configuration]
- **Justification**: [why it matches the requirements]
- **Key advantages**: [for this application]
- **Key limitations**: [and mitigation strategy]
- **Alternatives considered**: [and why rejected]
```

→ Justified selection tied to Step 1 reqs w/ acknowledged limitations.

If err: No std topology meets all → hybrid (Halbach array) or relax secondary. Doc tradeoff.

### Step 3: Design params

Physical dims + elec params from EM principles:

1. **Electromagnet**:
   - Turns: N = B * l_core / (mu_0 * mu_r * I), or mag circuit: N * I = Phi * R_total
   - Wire gauge: J (3-6 A/mm^2 cont, 15 A/mm^2 intermittent). A_wire = I / J.
   - Core X-sec: A_core = Phi / B_max (below sat: 1.5-1.8 T silicon steel, 0.3-0.5 T ferrite)
   - Gap force: F = B^2 * A_gap / (2 * mu_0) (Maxwell stress)
   - R winding: R = rho_Cu * N * l_mean_turn / A_wire

2. **Motor**:
   - Torque const: k_T = (2 * B * l * r * N) / phases (simplified BLDC)
   - Back-EMF: k_E = k_T (SI)
   - I_rated = T_rated / k_T
   - omega_no_load = V_supply / k_E
   - R from wire gauge + mean turn

3. **Transformer**:
   - Turns ratio: N_1 / N_2 = V_1 / V_2
   - Core X-sec: A_core = V_1 / (4.44 * f * N_1 * B_max) (sinusoidal)
   - N_1 = V_1 / (4.44 * f * B_max * A_core)
   - Window area: A_window = (N_1 * A_wire1 + N_2 * A_wire2) / k_fill (k_fill 0.3-0.5)
   - Core vol: V_core = A_core * l_mean_path

4. **Mag circuit** (cores + gaps):
   - R_core = l_core / (mu_0 * mu_r * A_core)
   - R_gap = l_gap / (mu_0 * A_gap) (much > R_core for small gaps)
   - R_total = R_core + R_gap (series), 1/R_total = sum(1/R_i) (parallel)
   - Phi = N * I / R_total

```markdown
## Design Parameters
- **Turns**: N = [value] (primary), N_2 = [value] (if applicable)
- **Wire gauge**: AWG [number] (diameter [mm], area [mm^2])
- **Core dimensions**: A_core = [mm^2], l_core = [mm], l_gap = [mm]
- **Core material**: [type], B_max = [T], mu_r = [value]
- **Winding resistance**: R = [Ohms]
- **Operating current**: I = [A], current density J = [A/mm^2]
- **Key performance**: [B-field / torque / voltage ratio = calculated value]
```

→ Numerical vals for all dims + elec params from EM equations w/ units at each step.

If err: Turns don't fit → bigger core (more window), finer wire (higher J, more heat), or reduce target. Core above B_max → bigger X-sec or more turns.

### Step 4: Losses + eff

Quantify all mechanisms + eff:

1. **Copper (I^2 R)**:
   - P_Cu = I^2 * R_winding (DC)
   - High freq: skin effect. R_AC / R_DC increases when diam > 2 * delta.
   - Proximity effect in multi-layer → more AC R.
   - Mitigate: Litz wire for >~10 kHz.

2. **Core (hyst + eddy)**:
   - Hyst vol per cycle: W_h = area B-H loop
   - P_h = k_h * f * B_max^n * V_core (Steinmetz, n 1.6-2.0, k_h from data)
   - Eddy: P_e = k_e * f^2 * B_max^2 * t^2 * V_core (t = lamination thick)
   - Combined (gen Steinmetz): P_core = k * f^alpha * B_max^beta * V_core
   - Mitigate: laminated (0.25-0.5 mm for 50/60 Hz, thinner higher freq), ferrite for >100 kHz

3. **Eddy in conductors/structure**:
   - Stray flux → currents in frame, shields, conductors
   - Big in large transformers + machines
   - Mitigate: non-mag struct mat, mag shields

4. **Mechanical** (motors, gens):
   - Bearing friction: P_friction = T_friction * omega
   - Windage (air): P_windage ~ omega^3
   - Brush friction (DC brushed): wear-dependent

5. **Eff calc**:
   - Electromagnet: not primary metric → focus P = I^2 R for field/force
   - Motor: eta = P_mech / P_elec = (T * omega) / (V * I)
   - Generator: eta = P_elec / P_mech
   - Transformer: eta = P_out / P_in = P_out / (P_out + P_Cu + P_core)
   - Typ: small motors 60-85%, large 90-97%, transformers 95-99%

```markdown
## Loss Analysis
| Loss Mechanism | Formula | Value (W) | Fraction of Total |
|---------------|---------|-----------|-------------------|
| Copper (I^2R) | [expression] | [W] | [%] |
| Core hysteresis | [expression] | [W] | [%] |
| Core eddy current | [expression] | [W] | [%] |
| Mechanical (if applicable) | [expression] | [W] | [%] |
| **Total losses** | | [W] | 100% |

- **Efficiency**: eta = [%]
- **Temperature rise estimate**: Delta_T = P_total / (h * A_surface) = [K]
```

→ Loss breakdown, each quantified, eff, T rise for thermal feas.

If err: Eff below target → ID dominant. Copper → bigger wire or fewer turns. Core → lower-loss mat or reduce B_max. Mech → better bearings. T rise exceeds → more cooling or reduce density.

### Step 5: Validate

Meets specs + physically realizable:

1. **Perf verify**:
   - Recompute primary from final params
   - Meets/exceeds Step 1
   - Margin: (achieved - required) / required %

2. **Saturation**:
   - B_max < sat flux density of mat
   - Every section (legs, yoke, gap fringing)
   - Gap region lowest flux density, smallest X-sec has highest

3. **Thermal**:
   - T_surface = T_ambient + P_total / (h * A_surface)
   - Nat convection: h ~ 5-10 W/(m^2.K)
   - Forced air: h ~ 25-100 W/(m^2.K)
   - Insulation class: A (105°C), B (130°C), F (155°C), H (180°C)
   - Core Curie: silicon steel ~770°C (rarely limit), ferrite ~200-300°C (can be limit)

4. **Dims**:
   - Fits envelope
   - Winding fits window w/ fill factor
   - Clearance + creepage for HV

5. **Margin + sensitivity**:
   - +/-10% var each key param (I, turns, gap, mu_r)
   - ID most sensitive → drives mfg tolerance
   - Air-gap: gap length almost always most sensitive

```markdown
## Design Validation
| Requirement | Target | Achieved | Margin |
|------------|--------|----------|--------|
| [Primary metric] | [value] | [value] | [%] |
| Efficiency | [%] | [%] | [%] |
| Temperature rise | < [K] | [K] | [K margin] |
| Envelope | [dimensions] | [dimensions] | [fits / exceeds] |

## Sensitivity Analysis
| Parameter | Nominal | +10% Effect on Primary Metric | Most Sensitive? |
|-----------|---------|-------------------------------|----------------|
| Current | [A] | [+/- %] | [Yes/No] |
| Turns | [N] | [+/- %] | [Yes/No] |
| Air gap | [mm] | [+/- %] | [Yes/No] |
| mu_r | [value] | [+/- %] | [Yes/No] |
```

→ All reqs met w/ docs margins, thermal OK, most sensitive param ID'd.

If err: Req not met → iterate topology (Step 2), params (Step 3), or loss mitigation (Step 4). Thermal infeasible → reduce duty, more size (cooling), higher-T insulation, active cooling. Doc each iter.

## Check

- [ ] All reqs quantified w/ vals + units
- [ ] Topology justified + alts docs
- [ ] Mag circuit complete (reluctances, flux, NI)
- [ ] Wire gauge for J (3-6 A/mm^2 cont)
- [ ] Core below sat w/ margin
- [ ] All losses quantified (copper, hyst, eddy, mech)
- [ ] Eff meets target
- [ ] T rise w/in insulation class
- [ ] Fits envelope
- [ ] Sensitivity ID's tightest-tolerance param
- [ ] Complete for prototype build

## Traps

- **Ignoring mag circuit reluctance**: Gap dominates (1 mm gap > 100 mm silicon steel core reluctance). No mag circuit model → devices far below expectations.
- **Operating above sat**: Above B-H knee, incremental mu drops. Doubling I ≠ doubling flux. Appears to "stop working". Always check B_max in narrowest X-sec.
- **Undersize copper for thermal**: J limits = thermal in disguise. 10 A/mm^2 free air → overheats in min. Cont-duty < 5-6 A/mm^2 w/o active cooling.
- **Neglect fringing at gaps**: Flux spreads → effective gap area bigger. Gaps ~ core dim → fringing 20-50%. Ignoring → underestimate flux + overestimate NI.
- **DC R at high freq**: 10 kHz skin depth in Cu ~ 0.66 mm. Magnet wire > 1.3 mm diam → AC R >> DC R. Litz or parallel thin strands.
- **Confuse k_T vs k_E units**: k_T (N.m/A) + k_E (V.s/rad) numerically equal SI. BUT k_E in V/kRPM (datasheets) → convert: k_T [N.m/A] = k_E [V/kRPM] * 60 / (2 * pi * 1000).

## →

- `analyze-magnetic-field` — B-field from current dist for detailed analysis
- `solve-electromagnetic-induction` — induction principles in motors/gens/transformers
- `formulate-maxwell-equations` — full EM for high-freq, waveguides, antennas
- `simulate-cpu-architecture` — digital ctrl sys driving motor controllers + power electronics
- `analyze-tensegrity-system` — tension-compression networks; shares prestress equilibrium
