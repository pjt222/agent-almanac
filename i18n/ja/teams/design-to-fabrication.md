---
name: design-to-fabrication
description: Sequential decorative-object pipeline that carries an ornamental concept from style brief through Blender modeling to 3D-print fabrication, with print defects routed back to the modeler as revision requests
lead: blender-artist
version: "1.0.0"
author: Philipp Thoss
created: 2026-07-24
updated: 2026-07-24
tags: [design, blender, 3d-printing, visualization, ornament, fabrication, display-piece, sequential]
coordination: sequential
members:
  - id: designer
    role: Ornamental Designer
    responsibilities: Produces the design brief — historical or modern ornamental style analysis, colorblind-accessible colorway, and Z-Image reference imagery. Authors style guides and palette specs, not CAD geometry
  - id: blender-artist
    role: Lead / Modeler
    responsibilities: Pipeline hub. Translates the design brief into Blender Python (bpy) scripts for procedural modeling and produces approval renders; absorbs print-defect feedback and issues model revisions
  - id: fabricator
    role: Fabrication Specialist
    responsibilities: Prepares the model for print (mesh repair, orientation, supports), selects the material, slices for FDM/SLA/SLS, and diagnoses print defects — routing failures back to the modeler as revision requests
locale: ja
source_locale: en
source_commit: 7de503a4
translator: "Claude + human review"
translation_date: "2026-07-24"
---

# Design-to-Fabrication Team

A three-agent, single-track team that carries a **decorative or ornamental display piece** from concept to a fabricable 3D print. The designer sets style and colorway, the blender-artist (lead) turns that brief into a scripted 3D model and approval render, and the fabricator slices, selects material, and prints — feeding any print defects back to the modeler as revision requests.

## Purpose

Making a physical ornament — a display sculpture, a decorative bracket, a patterned panel, a shelf piece — spans three distinct crafts that rarely live in one head: the *visual language* of ornament, the *procedural geometry* of a 3D model, and the *material reality* of a printer. This team decomposes that arc into three personas whose outputs chain, with one deliberate loop back:

- **Ornamental design** (designer): what the piece should *look like* — the tradition or genre it belongs to, its motif structure, and a colorblind-accessible palette, delivered as a style guide plus reference imagery.
- **Procedural modeling** (blender-artist): turning that brief into printable geometry through Blender Python scripts, plus an approval render so the human can sign off before any filament is spent.
- **Fabrication** (fabricator): making the model real — orientation, supports, material choice, slicer profile, and systematic diagnosis when a print fails.

The **scope is intentionally narrow**: this is *decorative and display-piece* fabrication, not generic concept-to-manufacture. The designer is an ornamental-design specialist producing style guides and reference imagery — it does **not** author consumable CAD, engineering tolerances, or assembly drawings. Load-bearing mechanical design, injection-mold tooling, or production-line manufacture are out of this team's lane.

What makes this a coordination problem and not a one-way relay is stage 4: print defects (warping, unsupportable overhangs, wall-thickness violations, fragile ornamental detail) are frequently a *geometry* problem, not a slicer problem. The fabricator cannot always fix them at the machine — the fix is a model revision. That defect-to-modeler loop is why the blender-artist sits at the hub: both neighbours interface with the model, so the modeler is the natural coordination point.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Designer | `designer` | Ornamental Designer | Style analysis (historical + modern), colorblind-accessible palette, Z-Image reference imagery, style-guide authoring |
| Lead | `blender-artist` | Lead / Modeler | bpy procedural modeling, approval renders, 2D composition, revision absorption |
| Fabricator | `fabricator` | Fabrication Specialist | Mesh prep, orientation, supports, material selection, slicing, defect diagnosis |

### Domain coverage

This team spans four skill domains, one only in part:

- **design** — fully in scope via the designer's `ornament-style-mono`, `ornament-style-color`, and `ornament-style-modern` skills.
- **blender** — fully in scope via `create-3d-scene`, `script-blender-automation`, and `render-blender-output`.
- **3d-printing** — fully in scope via `prepare-print-model`, `select-print-material`, and `troubleshoot-print-issues`.
- **visualization** — **partially** in scope. Only `create-2d-composition` and `render-publication-graphic` are used, for approval sheets and reference-render polish. The repo-internal icon-pipeline skills (`render-icon-pipeline`, `create-glyph`, `enhance-glyph`, `audit-icon-pipeline`) are viz tooling for the almanac's own visual layer and are **out of scope** for this team.

## Coordination Pattern

**Sequential with a fabricator to modeler feedback loop.** Each stage's output is the next stage's input, so the members process in order — but the fabricator can send print defects back to the blender-artist as model-revision requests, forming a loop rather than a straight pipe. The blender-artist leads because it is the pipeline hub: both the designer (upstream brief) and the fabricator (downstream defects) interface with the model it owns.

```text
designer ─────▶ blender-artist (Lead) ─────▶ fabricator
  (style,          │  (bpy model +               │ (slice, material,
   colorway,       │   approval render)          │  print)
   reference)      │                             │
                   └──◀── model-revision ◀───────┘
                          requests (print defects)
```

**Flow:**

1. **Designer** produces the brief: style/genre, motif structure, colorway, and reference imagery.
2. **Blender-artist** (lead) scripts the model and renders it for human approval against the brief.
3. **Fabricator** prepares, slices, selects material, and prints.
4. **Defects loop back**: unprintable or failed geometry returns to the blender-artist as a scoped revision request; the revised model re-enters at stage 3.

## Task Decomposition

### Stage 1: Design Brief (designer)
The designer establishes what the piece should look like — no geometry yet:

- Identify the ornamental tradition (Egyptian through Art Nouveau) or modern genre (cyberpunk, solarpunk, brutalist, etc.) and its motif vocabulary.
- Decompose the motif structurally (symmetry type, scaffold, fill, edge treatment).
- Define a colorblind-accessible colorway (viridis/cividis/Okabe-Ito or a period-authentic palette) using the 60/30/10 distribution.
- Generate reference imagery via Z-Image and author a style guide the modeler can build against.

**Output:** style guide + palette spec + reference render (the design brief).

### Stage 2: Model & Render (blender-artist, Lead)
The lead turns the brief into printable geometry:

- Author `bpy` scripts (`create-3d-scene`, `script-blender-automation`) that realize the motif structure as 3D geometry — procedural modeling, modifiers, geometry nodes.
- Apply the colorway and materials for the approval render only (print color comes from filament/resin, not the render).
- Produce an approval render (`render-blender-output`) and, where useful, a `create-2d-composition` / `render-publication-graphic` approval sheet comparing render against reference.
- Gate: the human approves the render before the model moves downstream.

**Output:** Blender script + exported mesh (STL/3MF) + approval render.

### Stage 3: Slice, Material & Print (fabricator)
The fabricator makes it real:

- `prepare-print-model` — mesh repair, wall-thickness check against the ornament's finest detail, orientation for surface finish, support strategy for overhangs.
- `select-print-material` — match a material to the display context (e.g. PLA for indoor display detail, ASA for UV-stable outdoor pieces, resin for fine ornamental relief).
- Configure the slicer profile (Cura / PrusaSlicer / OrcaSlicer) and print.

**Output:** slicer profile + print (or a print-attempt with observed defects).

### Stage 4: Defect Feedback Loop (fabricator to blender-artist)
When a print fails or a defect is fundamentally geometric, the fabricator uses `troubleshoot-print-issues` to classify the cause, then routes a **scoped model-revision request** back to the lead:

- Unsupportable overhang → thicken, reorient-friendly geometry, or add sacrificial structure in the model.
- Wall too thin for the process → increase minimum wall in the bpy script.
- Ornamental detail too fine to resolve at layer height → coarsen or rescale the motif.

The blender-artist revises the model and re-emits it into stage 3. The loop repeats until a clean print.

## Configuration

Machine-readable configuration block Claude reads when activating this team. In ordinary interactive sessions, activation spawns each listed member as a subagent via the Agent tool (`subagent_type`), coordinated with SendMessage under the session's single implicit team. (`TeamCreate` is a gated FleetView/cloud-only fallback.)

<!-- CONFIG:START -->
```yaml
team:
  name: design-to-fabrication
  lead: blender-artist
  coordination: sequential
  members:
    - agent: designer
      role: Ornamental Designer
      subagent_type: designer
    - agent: blender-artist
      role: Lead / Modeler
      subagent_type: blender-artist
    - agent: fabricator
      role: Fabrication Specialist
      subagent_type: fabricator
  tasks:
    - name: design-brief
      assignee: designer
      description: Produce ornamental style guide, colorblind-accessible colorway, and Z-Image reference imagery
    - name: model-and-render
      assignee: blender-artist
      description: Script the bpy model from the brief and produce an approval render for human sign-off
      blocked_by: [design-brief]
    - name: slice-and-print
      assignee: fabricator
      description: Prepare mesh, select material, slice, and print the approved model
      blocked_by: [model-and-render]
    - name: revise-model
      assignee: blender-artist
      description: Absorb print-defect feedback as a scoped model-revision request and re-emit the model
      blocked_by: [slice-and-print]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Ornamental display piece, end to end
The primary use case — a decorative object from style to print:

```text
User: I want a printable Art Nouveau wall panel — whiplash-curve motif, muted organic colorway, about 20cm.
```

The designer establishes the Art Nouveau motif structure and a sage/rose/amber palette with reference imagery; the blender-artist scripts the relief geometry and renders it for approval; the fabricator orients for the finest surface finish, picks a detail-friendly material, and slices — looping back if the whiplash detail is too fine for the chosen layer height.

### Scenario 2: Reprint after a print failure
Entering mid-pipeline at the feedback loop:

```text
User: My print of the ornamental bracket keeps failing — the thin scrollwork snaps off during support removal.
```

The fabricator diagnoses the defect as a geometry-fragility problem, not a slicer setting, and routes a revision request to the blender-artist to thicken the scrollwork and add fillets; the revised model re-enters slicing.

### Scenario 3: Colorway and material co-decision
When the display context constrains both palette and material:

```text
User: An outdoor solarpunk garden marker — needs to survive sun and rain.
```

The designer proposes a CVD-safe solarpunk colorway; the fabricator constrains material to a UV-stable option (e.g. ASA), and the designer adapts the colorway to the achievable filament palette before the blender-artist finalizes the model.

## Limitations

- **Decorative and display-piece scope only.** This team targets ornamental and display objects, not functional/mechanical CAD, tolerance-critical assemblies, or production manufacturing. The designer produces style guides and reference imagery, not consumable CAD.
- **Handoffs are artifact-level and advisory, not live control.** Both automation-facing members hand off *artifacts*, and the human executes the tools at each stage boundary:
  - The **blender-artist generates scripts only** — it does not run Blender. The human executes the `.py` script in a Blender install to produce the mesh and render.
  - The **fabricator has no direct printer control** — it produces slicer profiles and instructions, not machine G-code streaming. The human runs the slicer and drives the printer.
- **Visualization coverage is partial** — only `create-2d-composition` and `render-publication-graphic` apply here; the almanac's icon-pipeline skills are out of scope.
- **Z-Image dependency.** The designer's reference imagery needs a working `hf-mcp-server` Z-Image connection; without it the design stage falls back to written style guidance only.
- **Raster reference, not print geometry.** Z-Image output is raster reference imagery for the modeler to build against — it is not itself printable geometry.
- **Requires all three agent types** to be available as subagents; a single agent covering all three crafts would lose the deliberate approval and defect-loop checkpoints.

## See Also

- [designer](../agents/designer.md) — Ornamental design specialist (style brief, colorway, reference imagery)
- [blender-artist](../agents/blender-artist.md) — Lead / modeler via Blender Python (bpy)
- [fabricator](../agents/fabricator.md) — 3D printing and additive-manufacturing specialist
- [ornament-style-color](../skills/ornament-style-color/SKILL.md) — Polychromatic ornamental design skill
- [create-3d-scene](../skills/create-3d-scene/SKILL.md) — bpy scene/model construction skill
- [prepare-print-model](../skills/prepare-print-model/SKILL.md) — Model preparation for printing
- [troubleshoot-print-issues](../skills/troubleshoot-print-issues/SKILL.md) — Print-defect diagnosis (drives the feedback loop)

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-07-24
