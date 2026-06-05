---
name: prepare-print-model
description: >
  Export and optimize 3D models for FDM/SLA printing including STL/3MF export,
  mesh integrity verification, wall thickness checking, support generation, and
  slicing. Use when exporting from CAD or modeling software for 3D printing,
  verifying STL/3MF files are printable before slicing, troubleshooting models
  that fail to slice correctly, optimizing part orientation for strength or
  surface finish, or converting between model formats while preserving
  printability.
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

Export and optimize 3D models for additive manufacturing. This skill covers the complete workflow from CAD/modeling software export through mesh repair, printability analysis, support generation, and slicer configuration. Ensures models are manifold, have adequate wall thickness, and are properly oriented for strength and print quality.

## When to Use

- Exporting models from CAD software (Fusion 360, SolidWorks, Onshape) or 3D modeling tools (Blender, Maya) for 3D printing
- Verifying that existing STL/3MF files are printable before sending to slicer
- Troubleshooting models that fail to slice or print correctly
- Optimizing part orientation for strength, surface finish, or minimal support material
- Preparing mechanical parts with specific strength or tolerance requirements
- Converting between model formats (STL, 3MF, OBJ) while preserving printability

## Inputs

- **source_model**: Path to CAD file or 3D model file (STEP, F3D, STL, OBJ, 3MF)
- **target_process**: Printing process type (`fdm`, `sla`, `sls`)
- **material**: Intended print material (e.g., `pla`, `petg`, `abs`, `standard-resin`)
- **functional_requirements**: Load direction, tolerance requirements, surface finish needs
- **printer_specs**: Build volume, nozzle diameter (FDM), layer height capabilities
- **slicer_tool**: Target slicer (`cura`, `prusaslicer`, `orcaslicer`, `chitubox`)

## Procedure

### 1. Export Model from Source Software

Export the 3D model in a suitable format for printing:

**For FDM/SLA**:
```bash
# If starting from CAD (Fusion 360, SolidWorks)
# Export as: STL (binary) or 3MF
# Resolution: High (triangle count sufficient for detail)
# Units: mm (verify scale)

# Example export settings:
# STL: Binary format, refinement 0.1mm
# 3MF: Include color/material data if using multi-material printer
```

**Expected:** Model file exported with appropriate resolution (0.1mm chord tolerance for mechanical parts, 0.05mm for organic shapes).

**On failure:** Check that model is fully defined (no construction geometry), no missing faces, all components visible.

### 2. Verify Mesh Integrity

Check that the mesh is manifold and printable:

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
- **Non-manifold edges**: Multiple faces share an edge, or edge has only one face
- **Holes**: Gaps in mesh surface
- **Inverted normals**: Inside/outside of model reversed
- **Intersecting faces**: Self-intersecting geometry

**Expected:** Report shows 0 errors, or errors are repairable.

**On failure:** Repair mesh automatically or manually:

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

If automatic repair fails, return to source software and fix modeling errors (coincident vertices, open edges, overlapping bodies).

### 3. Check Wall Thickness

Verify minimum wall thickness for chosen process:

**Minimum wall thickness by process**:

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

**Expected:** All walls meet minimum thickness for chosen process. Thin walls flagged for review.

**On failure:** Return to CAD and thicken walls, or:
- Switch to smaller nozzle (FDM)
- Use "detect thin walls" slicer setting
- Accept reduced strength for prototypes

### 4. Determine Print Orientation

Select orientation to optimize strength, surface finish, and support usage:

**Orientation decision matrix**:

**For strength**:
- Orient so layer lines run perpendicular to primary load direction
- Example: Bracket under tension → print vertically so layers stack along load axis

**For surface finish**:
- Orient largest/most visible surface flat on bed (minimal stair-stepping)
- Critical dimensions aligned with X/Y plane (higher precision than Z)

**For minimal supports**:
- Minimize overhangs >45° (FDM) or >30° (SLA)
- Place flat surfaces on bed when possible

**Load direction analysis**:
```
If part experiences:
- Tensile load along axis → print with layers perpendicular to axis
- Compressive load → layers can be parallel (less critical)
- Bending moment → layers perpendicular to neutral axis
- Shear → avoid layer interfaces parallel to shear direction
```

**Expected:** Orientation chosen with explicit rationale for strength, finish, or support tradeoffs.

**On failure:** If no orientation satisfies all requirements, prioritize in order: functional strength → dimensional accuracy → surface finish → support minimization.

### 5. Generate Support Structures

Configure automatic or manual supports for overhangs:

**Support angle thresholds**:
- FDM: 45° from vertical (some bridging up to 60° possible)
- SLA: 30° from vertical (less bridging capability)
- SLS: No supports needed (powder bed support)

**Support types**:

**Tree supports** (FDM, recommended):
- Fewer contact points with model
- Easier removal
- Better for organic shapes
- Configure: Branch angle 40-50°, branch density medium

**Linear supports** (FDM, traditional):
- More stable for large overhangs
- More contact points (harder removal)
- Configure: Pattern grid, density 15-20%, interface layers 2-3

**Heavy supports** (SLA):
- Thicker contact points for heavy parts
- Risk of marks on surface
- Configure: Contact diameter 0.5-0.8mm, density based on part weight

**Interface layers**:
- Add 2-3 interface layers between support and model
- Reduces surface marks
- Slightly easier removal

```bash
# In slicer (PrusaSlicer example):
# Print Settings → Support material
# - Generate support material: Yes
# - Overhang threshold: 45° (FDM) / 30° (SLA)
# - Pattern: Rectilinear / Tree (auto)
# - Interface layers: 3
# - Interface pattern spacing: 0.2mm
```

**Expected:** Supports generated for all overhangs exceeding threshold angle, preview shows no floating geometry.

**On failure:** If automatic supports inadequate:
- Add manual support enforcers in critical areas
- Increase support density near thin overhangs
- Split model and print in sections if supports infeasible

### 6. Configure Slicer Profile

Set process-appropriate parameters:

**FDM layer heights**:
- Draft: 0.28-0.32mm (fast, visible layers)
- Standard: 0.16-0.20mm (balanced quality/speed)
- Fine: 0.08-0.12mm (smooth, slow)
- Rule: Layer height = 25-75% of nozzle diameter

**SLA layer heights**:
- Standard: 0.05mm (balanced)
- Fine: 0.025mm (miniatures, high detail)
- Fast: 0.1mm (prototypes)

**Key parameters by process**:

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

**Expected:** Profile configured with process-appropriate defaults, modified for specific material/model requirements.

**On failure:** If unsure about parameters, start with slicer's default "Standard Quality" profile for chosen material, then iterate.

### 7. Preview Slice Layer-by-Layer

Inspect sliced G-code for issues:

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

**Red flags in preview**:
- **White gaps in solid regions**: Walls too thin for current line width
- **Travels over large distances**: Increase retraction or add z-hop
- **First layer not squishing**: Adjust Z-offset down by 0.05mm
- **Sparse top layers**: Increase top solid layers to 5+

**Expected:** Preview shows continuous perimeters, proper infill, clean travels, and no obvious defects.

**On failure:** Adjust slicer settings and re-slice. Common fixes:
- Thin wall gaps → Enable "Detect thin walls" or reduce line width
- Poor bridging → Reduce bridge speed to 30mm/s, increase cooling
- Stringing → Increase retraction distance +1mm, reduce temperature -5°C

### 8. Export G-code and Verify

Save sliced G-code with descriptive name:

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

**Expected:** G-code file saved with embedded metadata, temperatures verified, print time/material estimate reasonable.

**On failure:** If print time excessive (>12 hours), consider:
- Increase layer height (0.2 → 0.28mm saves ~30% time)
- Reduce perimeters (4 → 3)
- Reduce infill (40% → 20% for non-structural)
- Scale model down if size not critical

## Validation Checklist

- [ ] Model exported from source software with correct units (mm) and scale
- [ ] Mesh integrity verified: manifold, no holes, normals correct
- [ ] Wall thickness meets minimum for chosen process (≥0.8mm FDM, ≥0.4mm SLA)
- [ ] Print orientation optimized for strength, finish, or support tradeoffs
- [ ] Supports generated for all overhangs >45° (FDM) or >30° (SLA)
- [ ] Slicer profile configured with appropriate layer height and parameters
- [ ] Layer-by-layer preview inspected, no gaps or floating regions
- [ ] G-code exported with verified temperatures and reasonable print time
- [ ] Pre-print checklist completed (bed leveled, material loaded, etc.)

## Common Pitfalls

1. **Skipping mesh repair**: Non-manifold meshes can slice but fail to print correctly with gaps or malformed layers
2. **Ignoring wall thickness**: Thin walls (< minimum) will have gaps, drastically reducing strength
3. **Wrong orientation for strength**: Printing tensile parts with layers parallel to load direction creates weak delamination plane
4. **Insufficient supports**: Underestimating overhang angle leads to sagging, stringing, or complete failure
5. **First layer neglect**: 90% of print failures occur in first layer—Z-offset and bed adhesion are critical
6. **Temperature from Internet**: Every printer/material combination is unique; always calibrate temperature with tower tests
7. **Excessive detail for layer height**: Fine features smaller than 2× layer height won't resolve properly
8. **Not previewing slice**: Slicers can make unexpected decisions (thin wall gaps, weird infill); always preview before printing
9. **Material hygroscopy**: Wet filament (especially Nylon, TPU, PETG) causes poor layer adhesion, stringing, and brittleness
10. **Overconfidence in supports**: Heavy parts with large overhangs can still sag even with supports—test on smaller models first

## Related Skills

- **[select-print-material](../select-print-material/SKILL.md)**: Choose appropriate material based on mechanical, thermal, and chemical requirements
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**: Diagnose and fix print failures if prepared model still fails
- **Model with Blender** (future skill): Create 3D models optimized for printing from scratch
- **Calibrate 3D Printer** (future skill): E-steps, flow rate, temperature towers, and retraction tuning
