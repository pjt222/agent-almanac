---
name: design-electromagnetic-device
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
  locale: ja
  source_locale: en
  source_commit: b092becc
  translator: claude
  translation_date: "2026-03-17"
---

# 電磁デバイスの設計

Design a practical electromagnetic device by specifying performance requirements, selecting an appropriate topology, calculating design parameters from electromagnetic first principles, analyzing losses and efficiency, and validating the design against physical constraints including thermal limits and material saturation.

## 使用タイミング

- Sizing an electromagnet (solenoid or toroidal) for a target field strength, pull force, or holding force
- Selecting motor topology (DC brushed, brushless DC, stepper, induction) and computing torque, speed, and efficiency
- Designing a generator for a specified voltage, current, and frequency output
- Designing a transformer for a given voltage ratio, power rating, and frequency
- Analyzing and minimizing losses: copper (I^2 R), core (hysteresis and eddy current), stray flux

## 入力

- **必須**: Device type (electromagnet, motor, generator, or transformer)
- **必須**: Performance requirements (field strength, force, torque, voltage ratio, power, efficiency target)
- **必須**: Operating conditions (supply voltage and current, frequency, duty cycle, ambient temperature)
- **任意**: Preferred core material (silicon steel, ferrite, powdered iron, air core) with B-H data
- **任意**: Size and weight constraints
- **任意**: Cost or manufacturing constraints

## 手順

### ステップ1: Specify Device Requirements and Operating Conditions

Define the complete set of design targets before selecting a topology:

1. **Primary performance metric**: The single most important specification:
   - Electromagnet: target B-field (Tesla) at a specified point, or pull force (Newtons) on a specified armature
   - Motor: rated torque (N.m) at rated speed (RPM), or power (Watts) at rated speed
   - Generator: output voltage (V), current (A), and frequency (Hz) at rated mechanical speed
   - Transformer: primary and secondary voltages, power rating (VA), and operating frequency

2. **Secondary specifications**: Efficiency target (%), maximum temperature rise above ambient (K), duty cycle (continuous, intermittent, or pulsed), physical envelope (maximum diameter, length, weight).

3. **Supply constraints**: Available voltage and current, frequency (DC or AC with specified Hz), waveform (sinusoidal, PWM, trapezoidal).

4. **Environmental conditions**: Ambient temperature range, cooling method (natural convection, forced air, liquid), altitude (affects air cooling), and vibration/shock requirements.

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

**期待結果:** A complete, quantified set of requirements with no ambiguous specifications. Every requirement has a numerical value and units.

**失敗時:** If requirements conflict (e.g., high torque in a very small volume with high efficiency), identify the tradeoff explicitly and ask the designer to prioritize. Electromagnetic devices obey fundamental scaling laws: force scales with volume, losses scale with surface area, and thermal limits constrain the power density.

### ステップ2: Select Topology

Choose the device configuration that best matches the requirements:

1. **Electromagnet topologies**:
   - **Solenoid (cylindrical)**: Simple to wind, uniform interior field B = mu_0 n I (for long solenoid). Best for uniform-field applications. Air gap for pull-force applications.
   - **Toroid**: No external stray field (all flux contained). Best when stray field must be minimized. Less uniform than solenoid for partial windings.
   - **C-core / E-core**: High force in a compact volume. The air gap concentrates force. Standard for relays and holding magnets.
   - **Helmholtz pair**: Two coils separated by one radius. Produces highly uniform field in the central region. Best for calibration and measurement.

2. **Motor topologies**:
   - **DC brushed**: Simple drive (apply DC voltage), good low-speed torque. Brushes limit lifetime and speed. Torque: T = k_T * I.
   - **Brushless DC (BLDC)**: Electronic commutation, higher speed and lifetime than brushed. Trapezoidal or sinusoidal drive. Dominant in modern applications.
   - **Stepper**: Precise open-loop positioning (discrete steps, typically 1.8 or 0.9 degrees). Lower continuous torque than BLDC. Best for positioning without feedback.
   - **AC induction**: Robust, no permanent magnets, simple construction. Speed determined by supply frequency and slip. Dominant in industrial power applications.

3. **Generator topologies**: Motors operated in reverse. A BLDC motor becomes a BLDC generator (back-EMF becomes output). An induction motor becomes an induction generator when driven above synchronous speed. Permanent magnet generators are preferred for small-scale (wind, hydro).

4. **Transformer topologies**:
   - **Core type**: Windings on a single leg of a rectangular core. Standard for power transformers.
   - **Shell type**: Core surrounds the windings. Better magnetic shielding. Used in high-power applications.
   - **Toroidal**: No air gap, low stray flux, compact. Higher winding cost. Used in audio and sensitive electronics.
   - **Planar / PCB**: Windings are PCB traces. Low profile. Used in switched-mode power supplies at high frequency.

```markdown
## Topology Selection
- **Topology chosen**: [specific configuration]
- **Justification**: [why it matches the requirements]
- **Key advantages**: [for this application]
- **Key limitations**: [and mitigation strategy]
- **Alternatives considered**: [and why rejected]
```

**期待結果:** A justified topology selection with clear reasoning tied to the requirements from Step 1, including acknowledged limitations.

**失敗時:** If no standard topology meets all requirements, consider a hybrid design (e.g., Halbach array for higher field with less material) or relax a secondary constraint. Document the tradeoff.

### ステップ3: Calculate Design Parameters

Compute the physical dimensions and electrical parameters from electromagnetic principles:

1. **Electromagnet design parameters**:
   - Turns: N = B * l_core / (mu_0 * mu_r * I) for a solenoid of length l_core, or from the magnetic circuit: N * I = Phi * R_total (where R_total is the total reluctance)
   - Wire gauge: Select for the required current density J (typically 3-6 A/mm^2 for continuous duty, up to 15 A/mm^2 for intermittent). Wire cross-section: A_wire = I / J.
   - Core cross-section: A_core = Phi / B_max, where B_max is below saturation (typically 1.5-1.8 T for silicon steel, 0.3-0.5 T for ferrite)
   - Air gap force: F = B^2 * A_gap / (2 * mu_0) (Maxwell stress tensor result)
   - Winding resistance: R = rho_Cu * N * l_mean_turn / A_wire

2. **Motor design parameters**:
   - Torque constant: k_T = (2 * B * l * r * N) / (number of phases) for a simplified BLDC
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

**期待結果:** Numerical values for all physical dimensions and electrical parameters, derived from electromagnetic equations with units checked at each step.

**失敗時:** If the required turns do not fit in the available winding space, either increase the core size (larger window area), use finer wire (higher current density, but more heating), or reduce the performance target. If the core operates above B_max, increase the core cross-section or add turns (to reduce the flux for the same performance via a larger NI product with a larger gap).

### ステップ4: Analyze Losses and Efficiency

Quantify every loss mechanism and compute overall efficiency:

1. **Copper losses (I^2 R)**:
   - P_Cu = I^2 * R_winding (DC resistance losses)
   - At high frequency, account for skin effect: R_AC / R_DC increases when wire diameter > 2 * delta (skin depth)
   - Proximity effect in multi-layer windings further increases AC resistance
   - Mitigation: use Litz wire (many thin insulated strands twisted together) for frequencies above ~10 kHz

2. **Core losses (hysteresis + eddy current)**:
   - Hysteresis loss per unit volume per cycle: W_h = area of the B-H loop
   - Hysteresis power: P_h = k_h * f * B_max^n * V_core (Steinmetz equation, n typically 1.6-2.0, k_h from material data)
   - Eddy current power: P_e = k_e * f^2 * B_max^2 * t^2 * V_core (t = lamination thickness)
   - Combined (generalized Steinmetz): P_core = k * f^alpha * B_max^beta * V_core (coefficients from manufacturer data sheets)
   - Mitigation: laminated cores (typical lamination 0.25-0.5 mm for 50/60 Hz, thinner for higher frequency), ferrite cores for >100 kHz

3. **Eddy current losses in conductors and structure**:
   - Stray flux inducing currents in the frame, shields, and nearby conductors
   - Particularly significant in large transformers and machines
   - Mitigation: non-magnetic structural materials, magnetic shields

4. **Mechanical losses** (motors and generators):
   - Friction in bearings: P_friction = T_friction * omega
   - Windage (air resistance on rotor): P_windage approximately proportional to omega^3
   - Brush friction (DC brushed motors): additional wear-dependent term

5. **Efficiency calculation**:
   - Electromagnet: efficiency is not the primary metric; focus on power consumption P = I^2 R for a given field/force
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

**期待結果:** A complete loss breakdown with each mechanism quantified, total efficiency computed, and temperature rise estimated to verify thermal feasibility.

**失敗時:** If efficiency is below the target, identify the dominant loss mechanism and address it: copper losses dominate in small devices (increase wire size or reduce turns), core losses dominate at high frequency (switch to lower-loss core material or reduce B_max), mechanical losses dominate at high speed (improve bearings). If the temperature rise exceeds the thermal limit, increase the cooling (forced air, heat sinks) or reduce the power density.

### ステップ5: Validate Against Requirements and Physical Constraints

Verify that the design meets all specifications and is physically realizable:

1. **Performance verification**:
   - Recompute the primary performance metric (B, force, torque, voltage) from the final design parameters
   - Verify it meets or exceeds the requirement from Step 1
   - Compute the margin: (achieved - required) / required as a percentage

2. **Saturation check**:
   - Verify that B_max in the core is below the saturation flux density of the chosen material
   - Check every section of the magnetic circuit (core legs, yoke, air gap fringing)
   - The air gap region typically has the lowest flux density; the core section with the smallest cross-section has the highest

3. **Thermal check**:
   - Estimate surface temperature: T_surface = T_ambient + P_total / (h * A_surface)
   - For natural convection: h approximately 5-10 W/(m^2.K)
   - For forced air: h approximately 25-100 W/(m^2.K)
   - Wire insulation class limits: Class A (105 C), Class B (130 C), Class F (155 C), Class H (180 C)
   - Core Curie temperature: silicon steel ~770 C (rarely a limit), ferrite ~200-300 C (can be a limit)

4. **Dimensional check**:
   - Verify that the design fits within the specified envelope
   - Check that the winding fits in the window area with the assumed fill factor
   - Verify clearances and creepage distances for high-voltage designs

5. **Design margin and sensitivity**:
   - Compute how the primary metric changes with +/-10% variation in each key parameter (current, turns, air gap, core permeability)
   - Identify the most sensitive parameter -- this drives the manufacturing tolerance
   - For air-gapped designs, the gap length is almost always the most sensitive parameter

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

**期待結果:** All requirements met with documented margins, thermal feasibility confirmed, and the most sensitive design parameter identified.

**失敗時:** If a requirement is not met, iterate by adjusting the topology (Step 2), design parameters (Step 3), or loss mitigation strategy (Step 4). If the design is thermally infeasible, consider: reducing the duty cycle, increasing the size (more surface area for cooling), switching to a higher temperature insulation class, or adding active cooling. Document each iteration.

## バリデーション

- [ ] All requirements are quantified with numerical values and units
- [ ] Topology selection is justified and alternatives are documented
- [ ] Magnetic circuit analysis is complete (reluctances, flux, NI product)
- [ ] Wire gauge is selected for acceptable current density (3-6 A/mm^2 continuous, higher for intermittent)
- [ ] Core operates below saturation flux density with margin
- [ ] All loss mechanisms are quantified (copper, hysteresis, eddy current, mechanical)
- [ ] Efficiency meets the target specification
- [ ] Temperature rise is within the insulation class limit
- [ ] Design fits within the physical envelope
- [ ] Sensitivity analysis identifies the tightest-tolerance parameter
- [ ] The design is complete enough for a prototype to be built

## よくある落とし穴

- **Ignoring magnetic circuit reluctance**: The air gap reluctance dominates in most practical devices (even a 1 mm gap has more reluctance than 100 mm of silicon steel core). Designing without a magnetic circuit model produces devices that perform far below expectations because the gap was not accounted for.
- **Operating above core saturation**: Above the knee of the B-H curve, incremental permeability drops dramatically. Doubling the current does not double the flux. The device appears to "stop working" above saturation. Always check B_max in the narrowest core cross-section.
- **Undersizing copper for thermal limits**: Current density limits are thermal limits in disguise. A wire carrying 10 A/mm^2 in free air will overheat within minutes. Continuous-duty designs must stay below 5-6 A/mm^2 unless active cooling is provided.
- **Neglecting fringing flux at air gaps**: Flux spreads out at an air gap, increasing the effective gap area. For gaps comparable to the core dimension, fringing can increase the effective area by 20-50%. Ignoring fringing underestimates the flux (and overestimates the required NI product).
- **Using DC resistance at high frequency**: At 10 kHz, the skin depth in copper is about 0.66 mm. Standard magnet wire thicker than 1.3 mm diameter will have significantly higher AC resistance than DC resistance. Use Litz wire or parallel thin strands for high-frequency designs.
- **Confusing motor constants k_T and k_E units**: The torque constant k_T (N.m/A) and back-EMF constant k_E (V.s/rad) are numerically equal in SI units. However, if k_E is expressed in V/kRPM (common in datasheets), a unit conversion is needed: k_T [N.m/A] = k_E [V/kRPM] * 60 / (2 * pi * 1000).

## 関連スキル

- `analyze-magnetic-field` -- compute the B-field from the designed current distribution for detailed field analysis
- `solve-electromagnetic-induction` -- analyze the induction principles underlying motors, generators, and transformers
- `formulate-maxwell-equations` -- full electromagnetic analysis for high-frequency devices, waveguides, and antennas
- `simulate-cpu-architecture` -- digital control systems that drive modern motor controllers and power electronics
- `analyze-tensegrity-system` -- 引張・圧縮ネットワークの構造分析；電磁力バランスとプレストレス均衡手法を共有
