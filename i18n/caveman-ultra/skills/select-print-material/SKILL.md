---
name: select-print-material
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Choose 3D print material → mechanical|thermal|chemical reqs. PLA, PETG, ABS, ASA, TPU, Nylon, resin variants w/ property compare. Use → select for specific reqs, outdoor|chemical exposure, food-safe|biocompat, balance printability vs perf, troubleshoot material-related fails.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: 3d-printing
  complexity: intermediate
  language: multi
  tags: 3d-printing, materials, fdm, sla, material-selection, properties
---

# Select Print Material

Choose 3D print material → match props to functional reqs. Covers FDM filaments (PLA, PETG, ABS, ASA, TPU, Nylon) + SLA resins (standard, tough, flexible, castable) w/ detailed property compare for strength, temp, chemical, flex, post-process.

## Use When

- Specific mechanical reqs (tensile, impact, flex)
- Temp-sensitive (hot|cold)
- Chemical|UV|outdoor exposure
- Food-safe|biocompat
- Balance printability vs perf for proto vs prod
- Troubleshoot material-related fails
- Optimize cost vs props for prod runs

## In

- **functional_requirements**: Load type (tensile|compress|bend|torsion), magnitude, duty cycle
- **environmental_conditions**: Temp range, UV, chemical, moisture
- **mechanical_properties_needed**: Strength, flex, impact, fatigue
- **surface_finish**: Appearance, post-process
- **printability_constraints**: Printer caps (heated bed, enclosure), user level
- **special_requirements**: Food safe, biocompat, electrical, transparency

## Do

### 1. ID Primary Req Category

Dominant req drives selection:

**Mechanical Perf**:
- High strength under load
- Impact|shock absorption
- Flex|elastic behavior
- Fatigue resistance (repeated load)

**Env Durability**:
- High|low temp
- UV|outdoor weathering
- Chemical (solvents, oils, acids)
- Moisture|water

**Special Apps**:
- Food contact safety
- Biocompat (medical)
- Electrical (insulation, conductivity)
- Optical (transparency, color)

**Printability/Cost**:
- Easy print for protos
- Min warp|support
- Low cost for large parts
- Wide availability

→ Primary req ID'd ("outdoor UV" or "high impact").

If err: multi reqs equally critical → decision matrix scoring (Step 6).

### 2. Material Filters

**Filter 1: Process**
- FDM: All thermoplastics
- SLA: All resins
- Printer constraints: Heated bed (60-110°C) for ABS|ASA|Nylon; enclosure for ABS|ASA

**Filter 2: Temp Range**
```
Operating Temperature → Minimum Material Glass Transition (Tg):

< 45°C:  PLA, PLA+, Standard Resin, Tough Resin
< 60°C:  PETG, Flexible Resin
< 80°C:  ABS, ASA, CPE
< 100°C: Nylon, Polycarbonate, High-Temp Resin
> 100°C: PEEK, PEI (Ultem) - specialty printers only
```

**Filter 3: Mechanical**
```
High tensile strength:     Nylon > ABS/ASA > PETG > PLA > TPU
High impact resistance:    Nylon > PETG > ABS > ASA > PLA
Flexibility:              TPU > Flexible Resin > PLA (brittle)
Fatigue resistance:       Nylon > PETG > ABS > PLA
```

**Filter 4: Env**
```
UV resistance:            ASA > PETG > ABS > PLA (poor)
Chemical resistance:      Nylon > PETG > ABS/ASA > PLA
Outdoor durability:       ASA > Nylon > PETG > PLA (degrades)
Moisture resistance:      ABS/ASA > PETG > PLA > Nylon (hygroscopic)
```

→ 2-5 candidates remain.

If err: no material passes → relax least-critical req or post-process (UV coat for PLA).

### 3. Compare Properties

## FDM Filament Properties

| Material | Print Temp | Bed Temp | Tensile Strength | Elongation | Tg/HDT | UV Resist | Ease | Hygroscopic |
|----------|------------|----------|------------------|------------|--------|-----------|------|-------------|
| **PLA** | 190-220°C | 50-60°C | 50-70 MPa | 5-7% | 55-60°C | Poor | Easy | Low |
| **PLA+** | 200-230°C | 50-60°C | 60-75 MPa | 10-15% | 60-65°C | Poor | Easy | Low |
| **PETG** | 220-250°C | 70-85°C | 50-60 MPa | 15-20% | 75-80°C | Good | Medium | Medium |
| **ABS** | 230-260°C | 95-110°C | 40-50 MPa | 20-40% | 95-105°C | Fair | Hard | Low |
| **ASA** | 240-260°C | 95-110°C | 45-55 MPa | 15-30% | 95-105°C | Excellent | Hard | Low |
| **TPU** | 210-230°C | 40-60°C | 30-50 MPa | 400-600% | 60-80°C | Good | Medium | Low |
| **Nylon** | 240-270°C | 70-90°C | 70-80 MPa | 50-150% | 75-90°C | Excellent | Hard | Very High |

Notes:
- **Tensile**: Higher = stronger pull
- **Elongation**: Higher = more flex before break
- **Tg/HDT**: Glass transition|heat deflection temp (max op)
- **Ease**: Print difficulty (warp, adhesion, stringing, supports)
- **Hygroscopic**: Water absorb (needs dry box)

## SLA Resin Properties

| Resin Type | Cure Time | Tensile Strength | Elongation | HDT | Hardness | Best For |
|------------|-----------|------------------|------------|-----|----------|----------|
| **Standard** | 2-4s | 45-55 MPa | 6-8% | 60-70°C | 82-85 Shore D | Miniatures, prototypes |
| **Tough** | 4-6s | 55-65 MPa | 15-25% | 70-80°C | 80-85 Shore D | Functional parts, snaps |
| **Flexible** | 6-8s | 5-10 MPa | 80-120% | 50-60°C | 60-70 Shore A | Gaskets, grips |
| **High-Temp** | 8-12s | 60-70 MPa | 6-10% | 120-150°C | 85-88 Shore D | Heat-resistant parts |
| **Castable** | 3-5s | 35-45 MPa | 8-12% | 60°C | 80 Shore D | Jewelry (lost-wax) |

→ Props compared, 1-3 top candidates ID'd.

If err: props unclear → manufacturer datasheets via WebFetch.

### 4. Eval Printability Tradeoffs

**Easy (PLA, PLA+)**:
- Min warp, good bed adhesion
- Wide temp tolerance
- Low stringing, easy supports
- Beginner|proto ideal
- **Tradeoff**: Lower temp resist, UV degrade, brittle

**Medium (PETG, TPU)**:
- Mod warp (PETG needs 70°C+ bed)
- Some stringing (tune retraction)
- TPU needs direct drive + slow speed
- Good strength-ease ratio
- **Tradeoff**: PETG strings, TPU hard overhangs

**Hard (ABS, ASA, Nylon)**:
- Severe warp w/o enclosure
- Strong fumes (ABS|ASA need ventilation)
- Nylon extremely hygroscopic (dry box req)
- High bed temps (95-110°C) + chamber heat
- **Tradeoff**: Excellent mechanical+env

**Cost**:
```
Material cost per kg (typical):
PLA:    $15-25
PETG:   $20-30
ABS:    $18-28
ASA:    $25-35
TPU:    $30-45
Nylon:  $35-55
Standard Resin: $30-50/L
Specialty Resin: $60-150/L
```

→ Printability vs printer caps + user. Decision balances perf vs constraints.

If err: material too hard for setup → easier alt + design changes (thicker walls, fillets).

### 5. Special Reqs

**Food Safety**:
- **Safe printed correctly**: PLA, PETG (w/ food-safe additives)
- **Never safe**: ABS, ASA (toxic additives), Nylon (porous)
- **Reqs**: Food-safe nozzles (stainless not brass), seal w/ food-safe epoxy
- **Note**: FDM layers trap bacteria — SLA smooth resin better

**Biocompat** (medical|dental):
- **FDM**: Nylon (some grades), PLA (limited)
- **SLA**: Medical-grade certified resins
- **Warning**: Home 3D not sterile; consult regs for medical

**Electrical**:
- **Insulation**: PLA, PETG, ABS, ASA all good (>10^14 Ω·m)
- **Conductivity**: Conductive filaments (carbon black, metal-fill)
- **Notes**: Moisture (Nylon) ↓insulation

**Transparency**:
- **FDM**: Nearly impossible (layer scatter); thin walls + extensive polish
- **SLA**: Clear resins → transparency w/ post-process (sand|polish|coat)

**UV Resist**:
- **Excellent**: ASA, Nylon
- **Good**: PETG, TPU
- **Poor**: PLA, ABS

→ Special reqs verified vs caps.

If err: doesn't meet → post-process (UV-resist coat on PLA) or diff material.

### 6. Final Selection Decision Matrix

Score candidates across weighted criteria:

**Outdoor functional part example**:

| Criterion | Weight | PLA | PETG | ABS | ASA | Nylon |
|-----------|--------|-----|------|-----|-----|-------|
| UV Resistance | 30% | 1 | 6 | 5 | 10 | 9 |
| Strength | 25% | 6 | 7 | 6 | 7 | 9 |
| Printability | 20% | 10 | 7 | 4 | 3 | 3 |
| Temperature | 15% | 2 | 6 | 8 | 8 | 9 |
| Cost | 10% | 10 | 8 | 8 | 6 | 4 |
| **Weighted Total** | | **5.35** | **6.80** | **5.90** | **7.25** | **7.45** |

Score: 1 (poor) → 10 (excellent)

Decision: Nylon highest (7.45) but ASA (7.25) close + better printability. Select ASA if enclosure, else PETG (6.80).

→ Final selected w/ documented rationale.

If err: unclear → default PETG (FDM) or Tough Resin (SLA) — best all-around.

### 7. Document Settings

**FDM template**:
```yaml
material: PETG
brand: "PolyMaker PolyLite"
color: "Blue"
nozzle_temp: 245°C
bed_temp: 80°C
chamber_temp: ambient
print_speed: 50mm/s
retraction_distance: 4.5mm
retraction_speed: 40mm/s
cooling: 50% (after layer 3)
notes: "Strings moderately, Z-hop helps. Dried 6h at 65°C."
```

**SLA template**:
```yaml
resin: "Anycubic Tough Resin"
color: "Clear"
layer_height: 0.05mm
exposure_time: 6s
bottom_exposure: 40s
lift_distance: 6mm
lift_speed: 65mm/min
notes: "Post-cure 15min at 60°C for full strength. Brittle without cure."
```

→ Settings documented in project notes|slicer profile.

If err: start manufacturer recommended → iterate + document.

## Check

- [ ] Primary req ID'd (mech|env|special)
- [ ] Candidates filtered by process, temp, reqs
- [ ] Props compared via table|datasheet
- [ ] Printability vs printer caps
- [ ] Special reqs checked
- [ ] Final via decision matrix w/ weighted priorities
- [ ] Settings documented for reproducibility
- [ ] Cost + availability verified for quantity

## Traps

1. **PLA for everything**: Easy but unsuitable >50°C, outdoor, long-term durability
2. **Ignore hygroscopy**: Nylon+TPU absorb moisture → bubbling, poor adhesion, brittle. Dry box.
3. **ABS w/o enclosure**: Severe warp w/o heated chamber; ASA slightly better but still needs
4. **Assume food safety**: FDM porous traps bacteria; true safety needs sealing|SLA smooth
5. **Over-design strength**: Expensive Nylon when PETG enough; overkill wastes $ + adds difficulty
6. **Underestimate temp**: Parts near motors, heated beds, cars reach 60°C+ → PLA softens
7. **UV neglect**: PLA+ABS yellow+degrade in sun within months; use ASA or coat
8. **Wet filament**: Moisture → steam bubbles in extruder, weak adhesion, stringing — always dry hygroscopic
9. **Ignore fumes**: ABS+ASA emit styrene; needs active ventilation
10. **Resin handling**: Uncured = skin sensitizer + toxic; always gloves + ventilated

## →

- **[prepare-print-model](../prepare-print-model/SKILL.md)**: Slicer settings for material
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**: Fix material fails
- **Dry Filament** (future): Drying for hygroscopic
- **Post-Process 3D Prints** (future): Sand, vapor smooth, paint, anneal
