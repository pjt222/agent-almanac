---
name: select-print-material
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Choose 3D printing materials based on mechanical, thermal, and chemical
  requirements. Covers PLA, PETG, ABS, ASA, TPU, Nylon, and resin variants
  with property comparisons. Use when selecting material for parts with
  specific mechanical or thermal requirements, choosing for outdoor or chemical
  exposure, evaluating food-safe or biocompatible applications, balancing
  printability vs. performance, or troubleshooting material-related print
  failures.
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

Pick right 3D printing material by matching properties to functional needs. Covers FDM filaments (PLA, PETG, ABS, ASA, TPU, Nylon) and SLA resins (standard, tough, flexible, castable) with property comparisons for strength, temp, chemical, flexibility, post-processing.

## When Use

- Pick material for part with specific mechanical needs (tensile, impact, flex)
- Choose for temp-sensitive apps (hot, cold env)
- Parts exposed to chemicals, UV, outdoor weathering
- Food-safe or biocompatible apps
- Balance printability vs performance for prototypes vs production
- Troubleshoot material-related print failures or part issues
- Optimize cost vs properties for production runs

## Inputs

- **functional_requirements**: Load type (tensile, compressive, bending, torsion), magnitude, duty cycle
- **environmental_conditions**: Operating temp range, UV exposure, chemical contact, moisture
- **mechanical_properties_needed**: Strength, flexibility, impact, fatigue
- **surface_finish**: Appearance, post-processing planned
- **printability_constraints**: Printer (heated bed, enclosure), user experience
- **special_requirements**: Food safety, biocompatibility, electrical insulation, transparency

## Steps

### 1. Identify Primary Requirement Category

Determine dominant requirement that drives material selection.

**Mechanical Performance**.
- High strength under load
- Impact/shock absorption
- Flexibility or elastic behavior
- Fatigue resistance (repeated loading)

**Environmental Durability**.
- High/low temp exposure
- UV/outdoor weathering
- Chemical resistance (solvents, oils, acids)
- Moisture/water exposure

**Special Applications**.
- Food contact safety
- Biocompatibility (medical)
- Electrical properties (insulation, conductivity)
- Optical properties (transparency, color)

**Printability/Cost**.
- Easy printing for prototypes
- Minimal warping/support
- Low material cost for large parts
- Wide availability

**Got:** Primary requirement identified (e.g., "outdoor UV resistance" or "high impact strength").

**If fail:** Multiple requirements equally critical? Use decision matrix to score materials across requirements (see step 6).

### 2. Apply Material Selection Filters

Use requirement to filter material candidates.

**Filter 1: Process Type**.
- FDM: All thermoplastics (PLA, PETG, ABS, ASA, TPU, Nylon)
- SLA: All resins (standard, tough, flexible, castable, high-temp)
- Printer constraints: Heated bed (60-110°C) needed for ABS/ASA/Nylon; enclosure for ABS/ASA

**Filter 2: Temperature Range**.
```
Operating Temperature → Minimum Material Glass Transition (Tg):

< 45°C:  PLA, PLA+, Standard Resin, Tough Resin
< 60°C:  PETG, Flexible Resin
< 80°C:  ABS, ASA, CPE
< 100°C: Nylon, Polycarbonate, High-Temp Resin
> 100°C: PEEK, PEI (Ultem) - specialty printers only
```

**Filter 3: Mechanical Requirements**.
```
High tensile strength:     Nylon > ABS/ASA > PETG > PLA > TPU
High impact resistance:    Nylon > PETG > ABS > ASA > PLA
Flexibility:              TPU > Flexible Resin > PLA (brittle)
Fatigue resistance:       Nylon > PETG > ABS > PLA
```

**Filter 4: Environmental**.
```
UV resistance:            ASA > PETG > ABS > PLA (poor)
Chemical resistance:      Nylon > PETG > ABS/ASA > PLA
Outdoor durability:       ASA > Nylon > PETG > PLA (degrades)
Moisture resistance:      ABS/ASA > PETG > PLA > Nylon (hygroscopic)
```

**Got:** 2-5 candidate materials remain after filtering.

**If fail:** No materials pass all filters? Relax least-critical requirement or consider post-processing (UV coating for PLA).

### 3. Compare Material Properties

Consult property table for detailed comparison.

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

**Notes**.
- **Tensile Strength**: Higher = stronger under pulling load
- **Elongation**: Higher = more flexible before breaking
- **Tg/HDT**: Glass transition / heat deflection temperature (max operating temp)
- **Ease**: Printing difficulty (warping, adhesion, stringing, supports)
- **Hygroscopic**: Water absorption from air (needs dry box storage)

## SLA Resin Properties

| Resin Type | Cure Time | Tensile Strength | Elongation | HDT | Hardness | Best For |
|------------|-----------|------------------|------------|-----|----------|----------|
| **Standard** | 2-4s | 45-55 MPa | 6-8% | 60-70°C | 82-85 Shore D | Miniatures, prototypes |
| **Tough** | 4-6s | 55-65 MPa | 15-25% | 70-80°C | 80-85 Shore D | Functional parts, snaps |
| **Flexible** | 6-8s | 5-10 MPa | 80-120% | 50-60°C | 60-70 Shore A | Gaskets, grips |
| **High-Temp** | 8-12s | 60-70 MPa | 6-10% | 120-150°C | 85-88 Shore D | Heat-resistant parts |
| **Castable** | 3-5s | 35-45 MPa | 8-12% | 60°C | 80 Shore D | Jewelry (lost-wax) |

**Got:** Material properties compared, 1-3 top candidates identified by requirements.

**If fail:** Properties unclear? Consult manufacturer technical datasheets via WebFetch tool.

### 4. Evaluate Printability Tradeoffs

Assess printing difficulty vs performance for candidates.

**Printability factors**.

**Easy (PLA, PLA+)**.
- Min warping, good bed adhesion
- Wide temp tolerance
- Low stringing, supports remove easy
- Ideal for beginners + prototypes
- **Tradeoff**: Lower temp resistance, UV degradation, brittle

**Medium (PETG, TPU)**.
- Moderate warping (PETG needs 70°C+ bed)
- Some stringing (tune retraction)
- TPU needs direct drive extruder, slow speeds
- Good strength-to-ease ratio
- **Tradeoff**: PETG strings easy, TPU challenging for overhangs

**Hard (ABS, ASA, Nylon)**.
- Severe warping without enclosure
- Strong fumes (ABS/ASA need ventilation)
- Nylon extremely hygroscopic (dry box needed)
- High bed temps (95-110°C) + chamber heat
- **Tradeoff**: Excellent mechanical + environmental properties

**Cost considerations**.
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

**Got:** Printability assessed relative to printer + user experience. Decision balances performance needs vs practical constraints.

**If fail:** Material too difficult for current setup? Choose easier alternative, compensate with design changes (thicker walls, fillets).

### 5. Check Special Requirements

Verify material compat with special use cases.

**Food Safety**.
- **Safe when printed correct**: PLA, PETG (with food-safe additives)
- **Never food safe**: ABS, ASA (toxic additives), Nylon (porous, absorbs bacteria)
- **Requirements**: Food-safe nozzles (stainless steel, not brass), seal surface with food-safe epoxy
- **Note**: FDM layer lines trap bacteria — SLA smooth resin better for food contact

**Biocompatibility** (medical/dental).
- **FDM**: Nylon (some grades), PLA (limited)
- **SLA**: Medical-grade resins (certified for skin/tissue contact)
- **Warning**: Home 3D printing not sterile; consult regulations for medical devices

**Electrical Properties**.
- **Insulation**: PLA, PETG, ABS, ASA all good insulators (>10^14 Ω·m)
- **Conductivity**: Use conductive filaments (carbon black, metal-filled)
- **Considerations**: Moisture absorption (Nylon) reduces insulation

**Transparency**.
- **FDM**: Nearly impossible (layer lines scatter light); use very thin walls or polish hard
- **SLA**: Clear resins can achieve transparency with post-processing (sand/polish/coat)

**UV Resistance**.
- **Excellent**: ASA (designed for outdoor), Nylon
- **Good**: PETG, TPU
- **Poor**: PLA (yellows + degrades), ABS (yellows)

**Got:** Special requirements verified vs material capabilities.

**If fail:** Material does not meet special requirement? Apply post-processing (UV-resistant coating on PLA) or choose different material.

### 6. Make Final Selection with Decision Matrix

Score candidates across weighted criteria.

**Example for outdoor functional part**.

| Criterion | Weight | PLA | PETG | ABS | ASA | Nylon |
|-----------|--------|-----|------|-----|-----|-------|
| UV Resistance | 30% | 1 | 6 | 5 | 10 | 9 |
| Strength | 25% | 6 | 7 | 6 | 7 | 9 |
| Printability | 20% | 10 | 7 | 4 | 3 | 3 |
| Temperature | 15% | 2 | 6 | 8 | 8 | 9 |
| Cost | 10% | 10 | 8 | 8 | 6 | 4 |
| **Weighted Total** | | **5.35** | **6.80** | **5.90** | **7.25** | **7.45** |

**Scoring**: 1 (poor) to 10 (excellent)

**Decision**: Nylon scores highest (7.45) but ASA (7.25) nearly tied with better printability. **Select ASA** if printer has enclosure, or **PETG** (6.80) if printability important.

**Got:** Final material selected with documented rationale based on weighted priorities.

**If fail:** Decision unclear? Default to PETG for FDM or Tough Resin for SLA (best all-around compromises).

### 7. Document Material Settings

Record material-specific print settings for future use.

**FDM settings template**.
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

**SLA settings template**.
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

**Got:** Settings documented in project notes or slicer profile library.

**If fail:** Start with manufacturer recommended settings, then iterate, document successful changes.

## Checks

- [ ] Primary functional requirement identified (mechanical, environmental, special)
- [ ] Material candidates filtered by process, temp, requirements
- [ ] Material properties compared via reference table or manufacturer datasheets
- [ ] Printability assessed relative to printer (bed temp, enclosure, ventilation)
- [ ] Special requirements checked (food safety, UV, transparency, etc.)
- [ ] Final selection made using decision matrix with weighted priorities
- [ ] Material-specific print settings documented for reproducibility
- [ ] Cost + availability verified for planned quantity

## Pitfalls

1. **Choose PLA for everything**: PLA easy but unsuitable for temp >50°C, outdoor, long-term durability
2. **Ignore hygroscopy**: Nylon + TPU absorb moisture from air, cause bubbling, poor adhesion, brittleness — use dry box
3. **ABS without enclosure**: ABS warps severe without heated chamber; ASA slightly better but still needs enclosure
4. **Assume food safety**: FDM parts porous + trap bacteria; true food safety needs sealing or SLA smooth resin
5. **Over-design for strength**: Use expensive Nylon when PETG sufficient; overkill wastes money + adds difficulty
6. **Underestimate temperature**: Parts near motors, heated beds, or in cars reach 60°C+ where PLA softens
7. **UV exposure neglect**: PLA + ABS yellow + degrade in sunlight within months; use ASA or coat with UV-resistant finish
8. **Wet filament printing**: Moisture causes steam bubbles in extruder, weak layer adhesion, stringing — always dry hygroscopic materials
9. **Ignore fumes**: ABS + ASA emit styrene fumes; need active ventilation (not just open window)
10. **Resin handling**: Uncured resin is skin sensitizer + toxic; always wear gloves, work in ventilated area

## See Also

- **[prepare-print-model](../prepare-print-model/SKILL.md)**: Configure slicer settings for chosen material
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**: Fix material-related print failures (stringing, warping, adhesion)
- **Dry Filament** (future skill): Proper drying procedures for hygroscopic materials
- **Post-Process 3D Prints** (future skill): Sanding, vapor smoothing, painting, annealing for improved properties
