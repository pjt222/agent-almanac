---
name: prepare-print-model
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Export + optimize 3D models for FDM/SLA printing: STL/3MF export, mesh
  integrity verify, wall thickness check, support gen, slicing. Use → CAD/
  modeling export for 3D print, verify STL/3MF printable before slice,
  troubleshoot fail-to-slice models, optimize part orientation for strength/
  finish, convert formats preserving printability.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: 3d-printing
  complexity: intermediate
  language: multi
  tags: 3d-printing, fdm, sla, slicing, mesh-repair, supports
---

# Prepare Print Model

Export + optimize 3D models for additive manufacturing. CAD/modeling export → mesh repair → printability analysis → support gen → slicer config. Ensures models manifold, adequate wall thickness, properly oriented for strength + quality.

## Use When

- Export from CAD (Fusion 360, SolidWorks, Onshape) or 3D modeling (Blender, Maya) for 3D print
- Verify STL/3MF printable before slicing
- Troubleshoot fail-to-slice or fail-to-print models
- Optimize orientation for strength, finish, min support
- Mech parts w/ specific strength or tolerance reqs
- Convert formats (STL, 3MF, OBJ) preserving printability

## In

- **source_model**: CAD or 3D model file (STEP, F3D, STL, OBJ, 3MF)
- **target_process**: Process (`fdm`, `sla`, `sls`)
- **material**: Print material (e.g., `pla`, `petg`, `abs`, `standard-resin`)
- **functional_requirements**: Load direction, tolerance, surface finish
- **printer_specs**: Build vol, nozzle dia (FDM), layer height
- **slicer_tool**: Target slicer (`cura`, `prusaslicer`, `orcaslicer`, `chitubox`)

## Do

### 1. Export Model from Source Software

Export 3D model in suitable format:

**FDM/SLA**:
```bash
# If starting from CAD (Fusion 360, SolidWorks)
# Export as: STL (binary) or 3MF
# Resolution: High (triangle count sufficient for detail)
# Units: mm (verify scale)

# Example export settings:
# STL: Binary format, refinement 0.1mm
# 3MF: Include color/material data if using multi-material printer
```

→ Model exported w/ appropriate resolution (0.1mm chord tolerance for mech parts, 0.05mm for organic).

If err: check model fully defined (no construction geometry), no missing faces, all components visible.

### 2. Verify Mesh Integrity

Mesh manifold + printable:

```bash
# Install mesh repair tools if needed
# sudo apt install meshlab admesh

# Check STL file for errors
admesh --check model.stl

# Look for:
# - Non-manifold edges: 0 (every edge connects exactly 2 faces)
# - Holes: 0
# - Backwards/inverted normals: 0
# - Degenerate facets: 0
```

**Common issues**:
- **Non-manifold edges**: Multiple faces share edge, or edge has only one face
- **Holes**: Mesh surface gaps
- **Inverted normals**: In/out reversed
- **Intersecting faces**: Self-intersecting geometry

→ Report shows 0 errors, or errors repairable.

If err: repair mesh auto or manual:

```bash
# Automatic repair with admesh
admesh --write-binary-stl=model_fixed.stl \
       --exact \
       --nearby \
       --remove-unconnected \
       --fill-holes \
       --normal-directions \
       model.stl

# Or use meshlab GUI for manual inspection/repair
meshlab model.stl
# Filters → Cleaning and Repairing → Remove Duplicate Vertices
# Filters → Cleaning and Repairing → Remove Duplicate Faces
# Filters → Normals → Re-Orient all faces coherently
```

Auto repair fails → return to source, fix modeling errors (coincident vertices, open edges, overlapping bodies).

### 3. Check Wall Thickness

Verify min wall thickness for process:

**Min wall thickness by process**:

| Process | Min Wall | Recommended Min | Structural Parts |
|---------|----------|-----------------|------------------|
| FDM (0.4mm nozzle) | 0.8mm | 1.2mm | 2.4mm+ |
| FDM (0.6mm nozzle) | 1.2mm | 1.8mm | 3.6mm+ |
| SLA (standard) | 0.4mm | 0.8mm | 2.0mm+ |
| SLA (engineering) | 0.6mm | 1.2mm | 2.5mm+ |
| SLS (nylon) | 0.7mm | 1.0mm | 2.0mm+ |

```bash
# Check wall thickness visually in slicer:
# - Import model
# - Enable "Thin walls" detection
# - Slice with 0 infill to see wall structure

# For precise measurement, use CAD software:
# - Measure distance between parallel surfaces
# - Check in critical load-bearing areas
```

→ All walls meet min thickness for process. Thin walls flagged.

If err: return to CAD + thicken, or:
- Smaller nozzle (FDM)
- "Detect thin walls" slicer setting
- Accept reduced strength for prototypes

### 4. Determine Print Orientation

Pick orientation → optimize strength, finish, support usage:

**Decision matrix**:

**Strength**:
- Layer lines perpendicular to primary load direction
- Bracket under tension → print vertically, layers stack along load axis

**Surface finish**:
- Largest/most visible surface flat on bed (min stair-stepping)
- Critical dimensions in X/Y plane (higher precision than Z)

**Min supports**:
- Minimize overhangs >45° (FDM) or >30° (SLA)
- Flat surfaces on bed when possible

**Load direction analysis**:
```
If part experiences:
- Tensile load along axis → print with layers perpendicular to axis
- Compressive load → layers can be parallel (less critical)
- Bending moment → layers perpendicular to neutral axis
- Shear → avoid layer interfaces parallel to shear direction
```

→ Orientation chosen w/ explicit rationale for strength, finish, or support tradeoffs.

If err: no orientation satisfies all → prioritize: functional strength → dimensional accuracy → surface finish → support min.

### 5. Generate Support Structures

Auto or manual supports for overhangs:

**Support angle thresholds**:
- FDM: 45° from vertical (some bridging up to 60°)
- SLA: 30° from vertical (less bridging)
- SLS: No supports (powder bed)

**Support types**:

**Tree supports** (FDM, recommended):
- Fewer contact points
- Easier removal
- Better for organic shapes
- Branch angle 40-50°, density medium

**Linear supports** (FDM, traditional):
- More stable for large overhangs
- More contact points (harder removal)
- Pattern grid, density 15-20%, interface layers 2-3

**Heavy supports** (SLA):
- Thicker contact points for heavy parts
- Risk of marks
- Contact diameter 0.5-0.8mm, density by part weight

**Interface layers**:
- 2-3 between support + model
- Reduces surface marks
- Easier removal

```bash
# In slicer (PrusaSlicer example):
# Print Settings → Support material
# - Generate support material: Yes
# - Overhang threshold: 45° (FDM) / 30° (SLA)
# - Pattern: Rectilinear / Tree (auto)
# - Interface layers: 3
# - Interface pattern spacing: 0.2mm
```

→ Supports gen'd for all overhangs > threshold, preview shows no floating geometry.

If err: auto supports inadequate:
- Add manual support enforcers in critical areas
- Increase support density near thin overhangs
- Split model + print in sections if supports infeasible

### 6. Configure Slicer Profile

Set process-appropriate params:

**FDM layer heights**:
- Draft: 0.28-0.32mm (fast, visible layers)
- Standard: 0.16-0.20mm (balanced)
- Fine: 0.08-0.12mm (smooth, slow)
- Rule: layer height = 25-75% of nozzle dia

**SLA layer heights**:
- Standard: 0.05mm (balanced)
- Fine: 0.025mm (miniatures, high detail)
- Fast: 0.1mm (prototypes)

**Key params by process**:

**FDM**:
```yaml
layer_height: 0.2mm
line_width: 0.4mm (= nozzle diameter)
perimeters: 3-4 (structural), 2 (cosmetic)
top_bottom_layers: 5 (0.2mm layers = 1mm solid)
infill_percentage: 20% (cosmetic), 40-60% (functional)
infill_pattern: gyroid (FDM), grid (basic)
print_speed: 50mm/s perimeter, 80mm/s infill
temperature: material-specific (see select-print-material skill)
```

**SLA**:
```yaml
layer_height: 0.05mm
bottom_layers: 6-8 (strong bed adhesion)
exposure_time: material-specific (2-8s per layer)
bottom_exposure_time: 30-60s
lift_speed: 60-80mm/min
retract_speed: 150-180mm/min
```

→ Profile w/ process-appropriate defaults, modified for material/model reqs.

If err: unsure → start w/ slicer's default "Standard Quality" profile for material, iterate.

### 7. Preview Slice Layer-by-Layer

Inspect sliced G-code:

```bash
# In slicer:
# - Slice model
# - Use layer preview slider to inspect each layer
# - Check for:
#   * Gaps in perimeters (indicates thin walls)
#   * Floating regions (missing supports)
#   * Excessive stringing paths (reduce travel)
#   * First layer: proper squish and adhesion
#   * Top layers: sufficient solid infill
```

**Red flags**:
- **White gaps in solid regions**: Walls too thin for line width
- **Travels over large distances**: Increase retraction or add z-hop
- **First layer not squishing**: Adjust Z-offset down by 0.05mm
- **Sparse top layers**: Increase top solid layers to 5+

→ Continuous perimeters, proper infill, clean travels, no obvious defects.

If err: adjust slicer + re-slice. Common fixes:
- Thin wall gaps → enable "Detect thin walls" or reduce line width
- Poor bridging → bridge speed 30mm/s, increase cooling
- Stringing → retraction +1mm, temp -5°C

### 8. Export G-code + Verify

Save G-code w/ descriptive name:

```bash
# Naming convention:
# <part_name>_<material>_<layer_height>_<profile>.gcode
# Example: bracket_petg_0.2mm_standard.gcode

# Verify G-code:
grep "^;PRINT_TIME:" model.gcode  # Check estimated time
grep "^;Filament used:" model.gcode  # Check material usage
head -n 50 model.gcode | grep "^M104\|^M140"  # Verify temperatures

# Expected first layer temp:
# M140 S85  (bed temp for PETG)
# M104 S245 (hotend temp for PETG)
```

**Pre-print checklist**:
- [ ] Bed leveled and clean
- [ ] Correct material loaded and dry
- [ ] Temperatures match material requirements
- [ ] First layer Z-offset calibrated
- [ ] Adequate filament/resin remaining
- [ ] Print time acceptable for monitoring plan

→ G-code saved w/ embedded metadata, temps verified, time/material reasonable.

If err: print time excessive (>12 hrs):
- Layer height up (0.2 → 0.28mm saves ~30% time)
- Reduce perimeters (4 → 3)
- Reduce infill (40% → 20% non-structural)
- Scale down if size not critical

## Check

- [ ] Model exported w/ correct units (mm) + scale
- [ ] Mesh integrity verified: manifold, no holes, normals correct
- [ ] Wall thickness meets min for process (≥0.8mm FDM, ≥0.4mm SLA)
- [ ] Orientation optimized for strength, finish, support tradeoffs
- [ ] Supports gen'd for all overhangs >45° (FDM) or >30° (SLA)
- [ ] Slicer profile w/ appropriate layer height + params
- [ ] Layer preview inspected, no gaps or floating regions
- [ ] G-code exported w/ verified temps + reasonable print time
- [ ] Pre-print checklist done (bed leveled, material loaded, etc.)

## Traps

1. **Skip mesh repair**: Non-manifold meshes can slice but fail w/ gaps or malformed layers
2. **Ignore wall thickness**: Thin walls (< min) → gaps, drastically reduced strength
3. **Wrong orientation for strength**: Tensile parts w/ layers parallel to load → weak delamination plane
4. **Insufficient supports**: Underestimate overhang angle → sagging, stringing, complete failure
5. **First layer neglect**: 90% of print failures in first layer → Z-offset + bed adhesion critical
6. **Temp from Internet**: Every printer/material combo unique. Always calibrate w/ tower tests.
7. **Excessive detail for layer height**: Features < 2× layer height won't resolve
8. **Don't preview slice**: Slicers make unexpected decisions (thin wall gaps, weird infill). Always preview.
9. **Material hygroscopy**: Wet filament (Nylon, TPU, PETG) → poor layer adhesion, stringing, brittleness
10. **Overconfident in supports**: Heavy parts w/ large overhangs can sag even w/ supports. Test on smaller first.

## →

- **[select-print-material](../select-print-material/SKILL.md)**: Pick material by mech, thermal, chem reqs
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**: Diagnose + fix failures if prepared model still fails
- **Model with Blender** (future skill): Create 3D models optimized for printing
- **Calibrate 3D Printer** (future skill): E-steps, flow rate, temp towers, retraction tuning
