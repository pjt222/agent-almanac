---
name: create-3d-scene
description: >
  Set up a Blender scene programmatically via Python (bpy) with objects,
  materials, lighting, camera, and environment configuration. Use when
  creating reproducible 3D visualization scenes, automating product or
  architectural rendering setup, generating multiple scene variations
  programmatically, building template scenes for batch rendering workflows,
  or integrating 3D visualization into data pipelines.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: blender
  complexity: intermediate
  language: Python
  tags: blender, bpy, 3d, scene-setup, materials, lighting, camera
---

# Create 3D Scene

Set up a complete Blender scene programmatically using the Python API (bpy). Configure scene hierarchy, add mesh objects, create PBR materials with node-based shaders, position lighting and cameras, and set up environment/world settings.

## When to Use

- Creating reproducible 3D visualization scenes from scratch
- Automating product visualization or architectural rendering setup
- Generating multiple scene variations programmatically
- Building template scenes for batch rendering workflows
- Prototyping scene layouts before manual refinement
- Integrating 3D visualization into data pipelines or reporting systems

## Inputs

| Input | Type | Description | Example |
|-------|------|-------------|---------|
| Scene specifications | Configuration | Objects, materials, lighting requirements | Product dimensions, material colors, lighting setup |
| Output requirements | Parameters | Resolution, render engine, quality settings | 1920x1080, Cycles, 128 samples |
| Asset paths | File paths | External models, textures, HDRIs | `/path/to/hdri.exr`, `product_model.obj` |
| Camera settings | Parameters | Position, rotation, focal length, DOF | `location=(7,-7,5)`, `lens=50mm` |
| Environment | Configuration | World shader, background, ambient settings | HDRI lighting, solid color, gradient |

## Procedure

### 1. Set Up Script Structure

Create a Python script with proper imports and structure:

```python
#!/usr/bin/env python3
"""
Scene setup script for Blender.
Usage: blender --background --python setup_scene.py
"""

import bpy
import math
import os
from pathlib import Path

def clear_scene():
    """Remove all objects from the scene."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # Clear orphaned data
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)

    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)

def main():
    clear_scene()
    # Scene setup steps follow

if __name__ == "__main__":
    main()
```

**Expected:** Script structure with clear_scene() and main() functions
**On failure:** Review Python syntax, check bpy import works in Blender Python environment

### 2. Add Mesh Objects

Create primitive or imported mesh objects:

```python
def add_objects():
    """Add mesh objects to scene."""
    # Add cube
    bpy.ops.mesh.primitive_cube_add(
        size=2.0,
        location=(0, 0, 1)
    )
    cube = bpy.context.active_object
    cube.name = "Product_Base"

    # Add sphere
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=1.0,
        segments=32,
        ring_count=16,
        location=(3, 0, 1)
    )
    sphere = bpy.context.active_object
    sphere.name = "Detail_Sphere"

    # Import external model (optional)
    # bpy.ops.import_scene.obj(filepath="model.obj")

    return cube, sphere
```

**Expected:** Objects appear in scene with correct names and positions
**On failure:** Check operator syntax, verify coordinates, ensure no naming conflicts

### 3. Create Materials with Node-Based Shaders

Set up PBR materials using shader nodes:

```python
def create_material(name, base_color, metallic=0.0, roughness=0.5):
    """Create a PBR material with node setup."""
    # Create material
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    # Clear default nodes
    nodes.clear()

    # Add Principled BSDF
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.location = (0, 0)
    node_bsdf.inputs['Base Color'].default_value = base_color + (1.0,)  # Add alpha
    node_bsdf.inputs['Metallic'].default_value = metallic
    node_bsdf.inputs['Roughness'].default_value = roughness

    # Add Material Output
    node_output = nodes.new(type='ShaderNodeOutputMaterial')
    node_output.location = (300, 0)

    # Link nodes
    links.new(node_bsdf.outputs['BSDF'], node_output.inputs['Surface'])

    return mat

def apply_materials(cube, sphere):
    """Apply materials to objects."""
    # Create materials
    mat_red = create_material("RedPlastic", (0.8, 0.1, 0.1), metallic=0.0, roughness=0.4)
    mat_metal = create_material("Metal", (0.8, 0.8, 0.8), metallic=1.0, roughness=0.2)

    # Assign to objects
    if cube.data.materials:
        cube.data.materials[0] = mat_red
    else:
        cube.data.materials.append(mat_red)

    if sphere.data.materials:
        sphere.data.materials[0] = mat_metal
    else:
        sphere.data.materials.append(mat_metal)
```

**Expected:** Materials visible in shader editor with proper node connections
**On failure:** Check node types exist, verify link syntax, ensure color values in [0,1] range

### 4. Set Up Lighting

Configure lights for scene illumination:

```python
def setup_lighting():
    """Add lights to scene."""
    # Sun light
    bpy.ops.object.light_add(
        type='SUN',
        location=(5, 5, 10)
    )
    sun = bpy.context.active_object
    sun.name = "KeyLight"
    sun.data.energy = 3.0
    sun.rotation_euler = (math.radians(45), 0, math.radians(45))

    # Area light (fill light)
    bpy.ops.object.light_add(
        type='AREA',
        location=(-4, -4, 6)
    )
    area = bpy.context.active_object
    area.name = "FillLight"
    area.data.energy = 200.0
    area.data.size = 5.0
    area.rotation_euler = (math.radians(60), 0, math.radians(-135))

    # Point light (rim light)
    bpy.ops.object.light_add(
        type='POINT',
        location=(2, -5, 3)
    )
    point = bpy.context.active_object
    point.name = "RimLight"
    point.data.energy = 500.0
```

**Expected:** Three lights with appropriate intensities and positions
**On failure:** Adjust energy values for render engine (Cycles vs EEVEE), check rotation format

### 5. Position Camera

Set up camera with proper framing:

```python
def setup_camera():
    """Add and configure camera."""
    bpy.ops.object.camera_add(
        location=(7, -7, 5)
    )
    camera = bpy.context.active_object
    camera.name = "MainCamera"

    # Point camera at origin
    direction = (0, 0, 1) - camera.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    camera.rotation_euler = rot_quat.to_euler()

    # Camera settings
    camera.data.lens = 50  # Focal length in mm
    camera.data.dof.use_dof = True
    camera.data.dof.focus_distance = 10.0
    camera.data.dof.aperture_fstop = 2.8

    # Set as active camera
    bpy.context.scene.camera = camera
```

**Expected:** Camera positioned with correct focal length and DOF settings
**On failure:** Use simpler rotation method if track_to fails, verify lens units

### 6. Configure World Environment

Set up world shader and background:

```python
def setup_world():
    """Configure world environment."""
    world = bpy.data.worlds['World']
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links

    # Clear default nodes
    nodes.clear()

    # Add Environment Texture (for HDRI)
    node_env = nodes.new(type='ShaderNodeTexEnvironment')
    node_env.location = (-300, 0)

    # Load HDRI if available
    hdri_path = "/path/to/hdri.exr"
    if os.path.exists(hdri_path):
        node_env.image = bpy.data.images.load(hdri_path)

    # Add Background shader
    node_bg = nodes.new(type='ShaderNodeBackground')
    node_bg.location = (0, 0)
    node_bg.inputs['Strength'].default_value = 1.0

    # Add World Output
    node_output = nodes.new(type='ShaderNodeOutputWorld')
    node_output.location = (300, 0)

    # Link nodes
    links.new(node_env.outputs['Color'], node_bg.inputs['Color'])
    links.new(node_bg.outputs['Background'], node_output.inputs['Surface'])
```

**Expected:** World shader with HDRI or solid background configured
**On failure:** Skip HDRI loading if file missing, use Background node alone with color

### 7. Configure Render Settings

Set basic render parameters:

```python
def setup_render_settings():
    """Configure render settings."""
    scene = bpy.context.scene

    # Render engine
    scene.render.engine = 'CYCLES'  # or 'BLENDER_EEVEE'
    scene.cycles.samples = 128
    scene.cycles.use_denoising = True

    # Output settings
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100

    # File format
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '16'
    scene.render.filepath = "/tmp/render_"
```

**Expected:** Render settings configured, ready for rendering
**On failure:** Check engine name spelling, verify resolution values are positive integers

### 8. Organize Scene Hierarchy

Create collections for organization:

```python
def organize_collections():
    """Organize objects into collections."""
    # Create collections
    col_geometry = bpy.data.collections.new("Geometry")
    col_lights = bpy.data.collections.new("Lights")
    col_cameras = bpy.data.collections.new("Cameras")

    # Link to scene
    bpy.context.scene.collection.children.link(col_geometry)
    bpy.context.scene.collection.children.link(col_lights)
    bpy.context.scene.collection.children.link(col_cameras)

    # Move objects to collections
    for obj in bpy.data.objects:
        # Unlink from main collection
        bpy.context.scene.collection.objects.unlink(obj)

        # Link to appropriate collection
        if obj.type == 'MESH':
            col_geometry.objects.link(obj)
        elif obj.type == 'LIGHT':
            col_lights.objects.link(obj)
        elif obj.type == 'CAMERA':
            col_cameras.objects.link(obj)
```

**Expected:** Objects organized in named collections for easier management
**On failure:** Check collection already exists before creating, handle orphaned objects

## Validation Checklist

- [ ] Script runs without errors in Blender background mode
- [ ] All expected objects present in scene outliner
- [ ] Materials show correct colors and properties in shader editor
- [ ] Camera positioned with objects in frame
- [ ] Lighting provides adequate illumination (test render)
- [ ] World environment loads correctly (HDRI or background color)
- [ ] Render settings configured appropriately for output requirements
- [ ] Scene organized logically in collections
- [ ] No orphaned data blocks (materials, meshes without users)
- [ ] Script includes clear_scene() for reproducibility

## Common Pitfalls

1. **Object naming conflicts**: Use unique names, check for existing objects before creating
2. **Incorrect color format**: RGB values must be tuples (r, g, b, a) in [0,1] range
3. **Missing alpha channel**: When setting colors, include alpha: `(r, g, b, 1.0)`
4. **Node connection errors**: Verify node types have expected inputs/outputs before linking
5. **Camera not active**: Must set `bpy.context.scene.camera = camera_object`
6. **Relative vs absolute paths**: Use absolute paths or Path() for cross-platform compatibility
7. **Units confusion**: Blender uses meters by default, camera lens in millimeters
8. **Rotation formats**: Use `math.radians()` for degree-to-radian conversion
9. **Render engine differences**: EEVEE and Cycles have different features and parameters
10. **Memory leaks**: Clear orphaned data blocks to prevent memory buildup in batch operations

## Related Skills

- **[script-blender-automation](../script-blender-automation/SKILL.md)**: Advanced scripting patterns for procedural modeling and batch operations
- **[render-blender-output](../render-blender-output/SKILL.md)**: Configure rendering pipeline and execute renders
- **[create-2d-composition](../../visualization/create-2d-composition/SKILL.md)**: 2D graphics composition using similar scripting approaches
