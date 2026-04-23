---
name: design-electromagnetic-device
locale: caveman
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

Design practical electromagnetic device by specifying performance requirements, selecting appropriate topology, calculating design parameters from electromagnetic first principles, analyzing losses and efficiency, validating design against physical constraints including thermal limits and material saturation.

## When Use

- Size electromagnet (solenoid or toroidal) for target field strength, pull force, or holding force
- Pick motor topology (DC brushed, brushless DC, stepper, induction) and compute torque, speed, efficiency
- Design generator for specified voltage, current, frequency output
- Design transformer for given voltage ratio, power rating, frequency
- Analyze and minimize losses: copper (I^2 R), core (hysteresis and eddy current), stray flux

## Inputs

- **Required**: Device type (electromagnet, motor, generator, or transformer)
- **Required**: Performance requirements (field strength, force, torque, voltage ratio, power, efficiency target)
- **Required**: Operating conditions (supply voltage and current, frequency, duty cycle, ambient temperature)
- **Optional**: Preferred core material (silicon steel, ferrite, powdered iron, air core) with B-H data
- **Optional**: Size and weight constraints
- **Optional**: Cost or manufacturing constraints

## Steps

### Step 1: Specify Device Requirements and Operating Conditions

Define complete set of design targets before selecting topology:

1. **Primary performance metric**: Single most important specification:
   - Electromagnet: target B-field (Tesla) at specified point, or pull force (Newtons) on specified armature
   - Motor: rated torque (N.m) at rated speed (RPM), or power (Watts) at rated speed
   - Generator: output voltage (V), current (A), frequency (Hz) at rated mechanical speed
   - Transformer: primary and secondary voltages, power rating (VA), operating frequency

2. **Secondary specifications**: Efficiency target (%), maximum temperature rise above ambient (K), duty cycle (continuous, intermittent, or pulsed), physical envelope (maximum diameter, length, weight).

3. **Supply constraints**: Available voltage and current, frequency (DC or AC with specified Hz), waveform (sinusoidal, PWM, trapezoidal).

4. **Environmental conditions**: Ambient temperature range, cooling method (natural convection, forced air, liquid), altitude (affects air cooling), vibration/shock requirements.

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

**Got:** Complete, quantified set of requirements with no ambiguous specifications. Every requirement has numerical value and units.

**If fail:** If requirements conflict (e.g., high torque in very small volume with high efficiency), identify tradeoff explicitly and ask designer to prioritize. Electromagnetic devices obey fundamental scaling laws: force scales with volume, losses scale with surface area, thermal limits constrain power density.

### Step 2: Select Topology

Pick device configuration best matching requirements:

1. **Electromagnet topologies**:
   - **Solenoid (cylindrical)**: Simple to wind, uniform interior field B = mu_0 n I (for long solenoid). Best for uniform-field applications. Air gap for pull-force applications.
   - **Toroid**: No external stray field (all flux contained). Best when stray field must be minimized. Less uniform than solenoid for partial windings.
   - **C-core / E-core**: High force in compact volume. Air gap concentrates force. Standard for relays and holding magnets.
   - **Helmholtz pair**: Two coils separated by one radius. Produces highly uniform field in central region. Best for calibration and measurement.

2. **Motor topologies**:
   - **DC brushed**: Simple drive (apply DC voltage), good low-speed torque. Brushes limit lifetime and speed. Torque: T = k_T * I.
   - **Brushless DC (BLDC)**: Electronic commutation, higher speed and lifetime than brushed. Trapezoidal or sinusoidal drive. Dominant in modern applications.
   - **Stepper**: Precise open-loop positioning (discrete steps, typically 1.8 or 0.9 degrees). Lower continuous torque than BLDC. Best for positioning without feedback.
   - **AC induction**: Robust, no permanent magnets, simple construction. Speed determined by supply frequency and slip. Dominant in industrial power applications.

3. **Generator topologies**: Motors operated in reverse. BLDC motor becomes BLDC generator (back-EMF becomes output). Induction motor becomes induction generator when driven above synchronous speed. Permanent magnet generators preferred for small-scale (wind, hydro).

4. **Transformer topologies**:
   - **Core type**: Windings on single leg of rectangular core. Standard for power transformers.
   - **Shell type**: Core surrounds windings. Better magnetic shielding. Used in high-power applications.
   - **Toroidal**: No air gap, low stray flux, compact. Higher winding cost. Used in audio and sensitive electronics.
   - **Planar / PCB**: Windings are PCB traces. Low profile. Used in switched-mode power supplies at high frequency.

```markdown
## Topology Selection
- **Topology chosen**: [specific configuration]
- **Justification**: [why matches requirements]
- **Key advantages**: [for this application]
- **Key limitations**: [and mitigation strategy]
- **Alternatives considered**: [and why rejected]
```

**Got:** Justified topology selection with clear reasoning tied to requirements from Step 1, including acknowledged limitations.

**If fail:** If no standard topology meets all requirements, consider hybrid design (e.g., Halbach array for higher field with less material) or relax secondary constraint. Document tradeoff.

### Step 3: Calculate Design Parameters

Compute physical dimensions and electrical parameters from electromagnetic principles:

1. **Electromagnet design parameters**:
   - Turns: N = B * l_core / (mu_0 * mu_r * I) for solenoid of length l_core, or from magnetic circuit: N * I = Phi * R_total (where R_total is total reluctance)
   - Wire gauge: Pick for required current density J (typically 3-6 A/mm^2 for continuous duty, up to 15 A/mm^2 for intermittent). Wire cross-section: A_wire = I / J.
   - Core cross-section: A_core = Phi / B_max, where B_max is below saturation (typically 1.5-1.8 T for silicon steel, 0.3-0.5 T for ferrite)
   - Air gap force: F = B^2 * A_gap / (2 * mu_0) (Maxwell stress tensor result)
   - Winding resistance: R = rho_Cu * N * l_mean_turn / A_wire

2. **Motor design parameters**:
   - Torque constant: k_T = (2 * B * l * r * N) / (number of phases) for simplified BLDC
   - Back-EMF constant: k_E = k_T (in SI units, same numerical value)
   - Rated current: I_rated = T_rated / k_T
   - No-load speed: omega_no_load = V_supply / k_E
   - Winding resistance from wire gauge and mean turn length

3. **Transformer design parameters**:
   - Turns ratio: N_1 / N_2 = V_1 / V_2
   - Core cross-section: A_core = V_1 / (4.44 * f * N_1 * B_max) (for sinusoidal excitation)
   - Primary turns: N_1 = V_1 / (4.44 * f * B_max * A_core)
   - Window area: A_window = (N_1 * A_wire1 + N_2 * A_wire2) / k_fill (fill factor k_fill typically 0.3-0.5)
   - Core volume: V_core = A_core * l_mean_path

4. **Magnetic circuit analysis**: For devices with cores and air gaps:
   - Reluctance of core: R_core = l_core / (mu_0 * mu_r * A_core)
   - Reluctance of air gap: R_gap = l_gap / (mu_0 * A_gap) (note: much larger than R_core for small gaps)
   - Total reluctance: R_total = R_core + R_gap (series) or 1/R_total = sum(1/R_i) (parallel)
   - Flux: Phi = N * I / R_total

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

**Got:** Numerical values for all physical dimensions and electrical parameters, derived from electromagnetic equations with units checked at each step.

**If fail:** If required turns do not fit in available winding space, either increase core size (larger window area), use finer wire (higher current density, but more heating), or reduce performance target. If core operates above B_max, increase core cross-section or add turns (to reduce flux for same performance via larger NI product with larger gap).

### Step 4: Analyze Losses and Efficiency

Quantify every loss mechanism and compute overall efficiency:

1. **Copper losses (I^2 R)**:
   - P_Cu = I^2 * R_winding (DC resistance losses)
   - At high frequency, account for skin effect: R_AC / R_DC increases when wire diameter > 2 * delta (skin depth)
   - Proximity effect in multi-layer windings further increases AC resistance
   - Mitigation: use Litz wire (many thin insulated strands twisted together) for frequencies above ~10 kHz

2. **Core losses (hysteresis + eddy current)**:
   - Hysteresis loss per unit volume per cycle: W_h = area of B-H loop
   - Hysteresis power: P_h = k_h * f * B_max^n * V_core (Steinmetz equation, n typically 1.6-2.0, k_h from material data)
   - Eddy current power: P_e = k_e * f^2 * B_max^2 * t^2 * V_core (t = lamination thickness)
   - Combined (generalized Steinmetz): P_core = k * f^alpha * B_max^beta * V_core (coefficients from manufacturer data sheets)
   - Mitigation: laminated cores (typical lamination 0.25-0.5 mm for 50/60 Hz, thinner for higher frequency), ferrite cores for >100 kHz

3. **Eddy current losses in conductors and structure**:
   - Stray flux inducing currents in frame, shields, and nearby conductors
   - Particularly significant in large transformers and machines
   - Mitigation: non-magnetic structural materials, magnetic shields

4. **Mechanical losses** (motors and generators):
   - Friction in bearings: P_friction = T_friction * omega
   - Windage (air resistance on rotor): P_windage approximately proportional to omega^3
   - Brush friction (DC brushed motors): additional wear-dependent term

5. **Efficiency calculation**:
   - Electromagnet: efficiency not primary metric. Focus on power consumption P = I^2 R for given field/force
   - Motor: eta = P_mechanical / P_electrical = (T * omega) / (V * I)
   - Generator: eta = P_electrical / P_mechanical
   - Transformer: eta = P_out / P_in = P_out / (P_out + P_Cu + P_core)
   - Typical efficiencies: small motors 60-85%, large motors 90-97%, transformers 95-99%

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

**Got:** Complete loss breakdown with each mechanism quantified. Total efficiency computed. Temperature rise estimated to verify thermal feasibility.

**If fail:** If efficiency below target, identify dominant loss mechanism and address: copper losses dominate in small devices (increase wire size or reduce turns), core losses dominate at high frequency (switch to lower-loss core material or reduce B_max), mechanical losses dominate at high speed (improve bearings). If temperature rise exceeds thermal limit, increase cooling (forced air, heat sinks) or reduce power density.

### Step 5: Validate Against Requirements and Physical Constraints

Verify design meets all specifications and is physically realizable:

1. **Performance verification**:
   - Recompute primary performance metric (B, force, torque, voltage) from final design parameters
   - Verify meets or exceeds requirement from Step 1
   - Compute margin: (achieved - required) / required as percentage

2. **Saturation check**:
   - Verify B_max in core is below saturation flux density of chosen material
   - Check every section of magnetic circuit (core legs, yoke, air gap fringing)
   - Air gap region typically has lowest flux density. Core section with smallest cross-section has highest.

3. **Thermal check**:
   - Estimate surface temperature: T_surface = T_ambient + P_total / (h * A_surface)
   - For natural convection: h approximately 5-10 W/(m^2.K)
   - For forced air: h approximately 25-100 W/(m^2.K)
   - Wire insulation class limits: Class A (105 C), Class B (130 C), Class F (155 C), Class H (180 C)
   - Core Curie temperature: silicon steel ~770 C (rarely a limit), ferrite ~200-300 C (can be a limit)

4. **Dimensional check**:
   - Verify design fits within specified envelope
   - Check winding fits in window area with assumed fill factor
   - Verify clearances and creepage distances for high-voltage designs

5. **Design margin and sensitivity**:
   - Compute how primary metric changes with +/-10% variation in each key parameter (current, turns, air gap, core permeability)
   - Identify most sensitive parameter -- drives manufacturing tolerance
   - For air-gapped designs, gap length almost always most sensitive parameter

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

**Got:** All requirements met with documented margins. Thermal feasibility confirmed. Most sensitive design parameter identified.

**If fail:** If requirement not met, iterate by adjusting topology (Step 2), design parameters (Step 3), or loss mitigation strategy (Step 4). If design thermally infeasible, consider: reducing duty cycle, increasing size (more surface area for cooling), switching to higher temperature insulation class, or adding active cooling. Document each iteration.

## Checks

- [ ] All requirements quantified with numerical values and units
- [ ] Topology selection justified and alternatives documented
- [ ] Magnetic circuit analysis complete (reluctances, flux, NI product)
- [ ] Wire gauge picked for acceptable current density (3-6 A/mm^2 continuous, higher for intermittent)
- [ ] Core operates below saturation flux density with margin
- [ ] All loss mechanisms quantified (copper, hysteresis, eddy current, mechanical)
- [ ] Efficiency meets target specification
- [ ] Temperature rise within insulation class limit
- [ ] Design fits within physical envelope
- [ ] Sensitivity analysis identifies tightest-tolerance parameter
- [ ] Design complete enough for prototype to be built

## Pitfalls

- **Ignoring magnetic circuit reluctance**: Air gap reluctance dominates in most practical devices (even 1 mm gap has more reluctance than 100 mm of silicon steel core). Designing without magnetic circuit model produces devices performing far below expectations because gap was not accounted for.
- **Operating above core saturation**: Above knee of B-H curve, incremental permeability drops dramatically. Doubling current does not double flux. Device appears to "stop working" above saturation. Always check B_max in narrowest core cross-section.
- **Undersizing copper for thermal limits**: Current density limits are thermal limits in disguise. Wire carrying 10 A/mm^2 in free air overheats within minutes. Continuous-duty designs must stay below 5-6 A/mm^2 unless active cooling provided.
- **Neglecting fringing flux at air gaps**: Flux spreads out at air gap, increasing effective gap area. For gaps comparable to core dimension, fringing can increase effective area by 20-50%. Ignoring fringing underestimates flux (and overestimates required NI product).
- **Using DC resistance at high frequency**: At 10 kHz, skin depth in copper about 0.66 mm. Standard magnet wire thicker than 1.3 mm diameter has significantly higher AC resistance than DC resistance. Use Litz wire or parallel thin strands for high-frequency designs.
- **Confusing motor constants k_T and k_E units**: Torque constant k_T (N.m/A) and back-EMF constant k_E (V.s/rad) numerically equal in SI units. However, if k_E expressed in V/kRPM (common in datasheets), unit conversion needed: k_T [N.m/A] = k_E [V/kRPM] * 60 / (2 * pi * 1000).

## See Also

- `analyze-magnetic-field` -- compute B-field from designed current distribution for detailed field analysis
- `solve-electromagnetic-induction` -- analyze induction principles underlying motors, generators, transformers
- `formulate-maxwell-equations` -- full electromagnetic analysis for high-frequency devices, waveguides, antennas
- `simulate-cpu-architecture` -- digital control systems driving modern motor controllers and power electronics
- `analyze-tensegrity-system` -- structural analysis of tension-compression networks; shares prestress equilibrium methods with electromagnetic force balancing
