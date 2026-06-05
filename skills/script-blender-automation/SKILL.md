---
name: script-blender-automation
description: >
  Write Blender Python scripts for procedural modeling, animation, batch
  operations, and add-on development using advanced bpy API patterns. Use
  when automating repetitive modeling or animation tasks, generating procedural
  geometry from algorithms or data, creating batch rendering pipelines with
  parameter variations, building custom operators or add-ons, or integrating
  Blender with external data pipelines and APIs.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: blender
  complexity: advanced
  language: Python
  tags: blender, bpy, automation, procedural, animation, batch-processing, add-on
---

# Script Blender Automation

Advanced Blender Python scripting for procedural modeling, keyframe animation, batch operations, operator registration, and add-on development. Covers complex geometry generation, automated workflows, and integration with external data sources.

## When to Use

- Automating repetitive modeling or animation tasks
- Generating procedural geometry from algorithms or data
- Creating batch rendering pipelines with parameter variations
- Building custom operators or add-ons for workflow enhancement
- Integrating Blender with external data pipelines or APIs
- Scripting complex animations with mathematical precision
- Developing reusable tools for team workflows

## Inputs

| Input | Type | Description | Example |
|-------|------|-------------|---------|
| Automation requirements | Specification | Task description, parameters, constraints | Render 100 variations, animate path from data |
| Data sources | Files/APIs | External data for procedural generation | CSV coordinates, JSON parameters, API responses |
| Algorithm definitions | Code/Math | Procedural generation logic | Fractal patterns, parametric curves, L-systems |
| Operator specifications | Requirements | Custom tool behavior and UI | Tool name, properties, modal interaction |
| Animation parameters | Keyframes/Data | Timing, easing, constraints | Frame ranges, interpolation curves |

## Procedure

### 1. Procedural Geometry Generation

Create mesh geometry programmatically using BMesh:

```python
import bpy
import bmesh
import math

def create_parametric_surface(name, u_res=32, v_res=32):
    """Generate parametric surface using mathematical function."""
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()

    # Create vertices using parametric equations
    verts = []
    for i in range(u_res):
        for j in range(v_res):
            u = (i / (u_res - 1)) * 2 * math.pi
            v = (j / (v_res - 1)) * math.pi

            # Sphere parametric equations
            x = math.sin(v) * math.cos(u)
            y = math.sin(v) * math.sin(u)
            z = math.cos(v)

            vert = bm.verts.new((x, y, z))
            verts.append(vert)

    # Create faces
    bm.verts.ensure_lookup_table()
    for i in range(u_res - 1):
        for j in range(v_res - 1):
            v1 = verts[i * v_res + j]
            v2 = verts[(i + 1) * v_res + j]
            v3 = verts[(i + 1) * v_res + (j + 1)]
            v4 = verts[i * v_res + (j + 1)]
            bm.faces.new([v1, v2, v3, v4])

    # Write to mesh
    bm.to_mesh(mesh)
    bm.free()

    return obj
```

**Expected:** Complex geometry generated from mathematical functions
**On failure:** Check BMesh API calls, verify vertex indexing, ensure faces are manifold

### 2. Keyframe Animation Automation

Script animation keyframes and drivers:

```python
def animate_rotation(obj, start_frame=1, end_frame=250, axis='Z', rotations=2):
    """Animate object rotation over time."""
    # Set initial keyframe
    obj.rotation_euler[2] = 0  # Z axis
    obj.keyframe_insert(data_path="rotation_euler", index=2, frame=start_frame)

    # Set end keyframe
    obj.rotation_euler[2] = rotations * 2 * math.pi
    obj.keyframe_insert(data_path="rotation_euler", index=2, frame=end_frame)

    # Set interpolation
    if obj.animation_data and obj.animation_data.action:
        for fcurve in obj.animation_data.action.fcurves:
            if 'rotation_euler' in fcurve.data_path:
                for keyframe in fcurve.keyframe_points:
                    keyframe.interpolation = 'LINEAR'

def animate_material_property(mat, property_path, values, frames):
    """Animate material node values."""
    if not mat.node_tree:
        return

    # Example: animate emission strength
    nodes = mat.node_tree.nodes
    emission = nodes.get('Emission')
    if emission:
        for frame, value in zip(frames, values):
            emission.inputs['Strength'].default_value = value
            emission.inputs['Strength'].keyframe_insert(
                data_path="default_value",
                frame=frame
            )

def create_driver(obj, property_path, expression):
    """Create driver for automated animation."""
    driver = obj.driver_add(property_path)
    driver.driver.type = 'SCRIPTED'
    driver.driver.expression = expression

    # Example: link rotation to frame number
    # expression = "frame / 10"
```

**Expected:** Keyframes inserted, animation plays back correctly
**On failure:** Check property paths, verify data_path syntax, ensure objects are keyable

### 3. Batch Processing Operations

Process multiple objects or files in batch:

```python
import os
from pathlib import Path

def batch_import_and_render(input_dir, output_dir, file_pattern="*.obj"):
    """Import multiple files and render each."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    scene = bpy.context.scene

    for obj_file in input_path.glob(file_pattern):
        # Clear existing objects
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()

        # Import model
        bpy.ops.import_scene.obj(filepath=str(obj_file))

        # Setup camera and lighting (reuse setup functions)
        setup_camera()
        setup_lighting()

        # Render
        output_file = output_path / f"{obj_file.stem}.png"
        scene.render.filepath = str(output_file)
        bpy.ops.render.render(write_still=True)

        print(f"Rendered: {output_file}")

def batch_material_variation(base_object, colors, output_prefix):
    """Render object with multiple material colors."""
    mat = base_object.data.materials[0]
    bsdf = mat.node_tree.nodes.get('Principled BSDF')

    if not bsdf:
        return

    for i, color in enumerate(colors):
        # Update material color
        bsdf.inputs['Base Color'].default_value = color + (1.0,)

        # Render
        bpy.context.scene.render.filepath = f"{output_prefix}_{i:03d}.png"
        bpy.ops.render.render(write_still=True)
```

**Expected:** Multiple files processed, renders generated for each variant
**On failure:** Check file paths exist, verify import operators, handle missing materials

### 4. Custom Operator Development

Create custom operators for reusable tools:

```python
import bpy
from bpy.props import FloatProperty, IntProperty

class OBJECT_OT_generate_spiral(bpy.types.Operator):
    """Generate a spiral curve"""
    bl_idname = "object.generate_spiral"
    bl_label = "Generate Spiral"
    bl_options = {'REGISTER', 'UNDO'}

    # Operator properties
    radius: FloatProperty(
        name="Radius",
        description="Spiral radius",
        default=2.0,
        min=0.1,
        max=10.0
    )

    turns: IntProperty(
        name="Turns",
        description="Number of spiral turns",
        default=5,
        min=1,
        max=20
    )

    resolution: IntProperty(
        name="Resolution",
        description="Points per turn",
        default=32,
        min=8,
        max=128
    )

    def execute(self, context):
        # Create curve
        curve = bpy.data.curves.new('Spiral', 'CURVE')
        curve.dimensions = '3D'

        spline = curve.splines.new('NURBS')
        num_points = self.turns * self.resolution

        spline.points.add(num_points - 1)  # -1 because one point exists

        for i in range(num_points):
            t = i / self.resolution
            angle = t * 2 * math.pi

            x = self.radius * math.cos(angle)
            y = self.radius * math.sin(angle)
            z = t * 0.5

            spline.points[i].co = (x, y, z, 1.0)

        # Create object
        obj = bpy.data.objects.new('Spiral', curve)
        context.collection.objects.link(obj)
        obj.select_set(True)
        context.view_layer.objects.active = obj

        self.report({'INFO'}, f"Generated spiral with {num_points} points")
        return {'FINISHED'}

def register():
    bpy.utils.register_class(OBJECT_OT_generate_spiral)

def unregister():
    bpy.utils.unregister_class(OBJECT_OT_generate_spiral)

if __name__ == "__main__":
    register()
```

**Expected:** Operator appears in search, executes with proper undo support
**On failure:** Check bl_idname format (lowercase with underscores), verify property types

### 5. Modal Operator for Interactive Tools

Create interactive modal operators:

```python
class OBJECT_OT_modal_scale(bpy.types.Operator):
    """Interactive scaling with mouse"""
    bl_idname = "object.modal_scale"
    bl_label = "Modal Scale"
    bl_options = {'REGISTER', 'UNDO'}

    def __init__(self):
        self.initial_mouse_x = 0
        self.initial_scale = 1.0

    def modal(self, context, event):
        if event.type == 'MOUSEMOVE':
            # Calculate scale based on mouse movement
            delta = event.mouse_x - self.initial_mouse_x
            scale = self.initial_scale + (delta / 100.0)
            scale = max(0.1, scale)  # Minimum scale

            # Apply to active object
            context.active_object.scale = (scale, scale, scale)

        elif event.type == 'LEFTMOUSE':
            return {'FINISHED'}

        elif event.type in {'RIGHTMOUSE', 'ESC'}:
            # Cancel - restore initial scale
            context.active_object.scale = (
                self.initial_scale,
                self.initial_scale,
                self.initial_scale
            )
            return {'CANCELLED'}

        return {'RUNNING_MODAL'}

    def invoke(self, context, event):
        if context.active_object:
            self.initial_mouse_x = event.mouse_x
            self.initial_scale = context.active_object.scale[0]

            context.window_manager.modal_handler_add(self)
            return {'RUNNING_MODAL'}
        else:
            self.report({'WARNING'}, "No active object")
            return {'CANCELLED'}
```

**Expected:** Interactive operator responds to mouse, left-click confirms, ESC cancels
**On failure:** Check event types, ensure modal handler is added, handle no active object

### 6. Add-on Packaging

Structure code as installable add-on:

```python
bl_info = {
    "name": "Custom Tools",
    "author": "Your Name",
    "version": (1, 0, 0),
    "blender": (3, 0, 0),
    "location": "View3D > Add > Mesh",
    "description": "Collection of custom modeling tools",
    "category": "Add Mesh",
}

import bpy

# Import operator classes
from .operators import OBJECT_OT_generate_spiral

classes = (
    OBJECT_OT_generate_spiral,
    # Add other classes
)

def menu_func(self, context):
    """Add to menu."""
    self.layout.operator(OBJECT_OT_generate_spiral.bl_idname)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)

    bpy.types.VIEW3D_MT_mesh_add.append(menu_func)

def unregister():
    bpy.types.VIEW3D_MT_mesh_add.remove(menu_func)

    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)

if __name__ == "__main__":
    register()
```

**Expected:** Add-on installs via Preferences, operators appear in menus
**On failure:** Check bl_info format, verify Blender version requirement, ensure all classes listed

### 7. Data-Driven Procedural Generation

Generate geometry from external data:

```python
import csv
import json

def create_from_csv(filepath):
    """Generate objects from CSV data."""
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)

        for row in reader:
            # Parse data
            name = row['name']
            x, y, z = float(row['x']), float(row['y']), float(row['z'])
            scale = float(row.get('scale', 1.0))

            # Create object
            bpy.ops.mesh.primitive_uv_sphere_add(location=(x, y, z))
            obj = bpy.context.active_object
            obj.name = name
            obj.scale = (scale, scale, scale)

def create_from_json(filepath):
    """Generate scene from JSON configuration."""
    with open(filepath, 'r') as f:
        config = json.load(f)

    # Process objects
    for obj_config in config.get('objects', []):
        obj_type = obj_config['type']
        location = obj_config['location']

        if obj_type == 'cube':
            bpy.ops.mesh.primitive_cube_add(location=location)
        elif obj_type == 'sphere':
            bpy.ops.mesh.primitive_uv_sphere_add(location=location)

        obj = bpy.context.active_object
        obj.name = obj_config.get('name', 'Object')

        # Apply material if specified
        if 'material' in obj_config:
            mat_name = obj_config['material']
            mat = bpy.data.materials.get(mat_name)
            if mat:
                obj.data.materials.append(mat)
```

**Expected:** Objects created based on external data files
**On failure:** Validate file format, handle missing fields, provide default values

## Validation Checklist

- [ ] Scripts run without errors in Blender Python environment
- [ ] Procedural geometry generates as expected
- [ ] Animation keyframes inserted at correct frames
- [ ] Batch operations process all files successfully
- [ ] Custom operators appear in search and execute correctly
- [ ] Modal operators respond to mouse/keyboard events
- [ ] Add-ons install and uninstall cleanly
- [ ] External data files parsed correctly
- [ ] Error handling covers edge cases
- [ ] Code follows PEP 8 style guidelines

## Common Pitfalls

1. **Circular imports in add-ons**: Use relative imports, structure modules carefully
2. **Operator naming**: bl_idname must be lowercase with single underscore (category.name)
3. **Property types**: Use correct bpy.props types (FloatProperty, IntProperty, etc.)
4. **Context access**: Not all operators work in all contexts (viewport vs render)
5. **BMesh cleanup**: Always call `bm.free()` after `bm.to_mesh()` to prevent memory leaks
6. **Animation keyframe timing**: Frame numbers start at 1, not 0
7. **Driver expression errors**: Validate expressions, use safe namespace
8. **Modal operator blocking**: Don't block in modal(), use non-blocking operations
9. **Add-on installation paths**: Place in Blender's scripts/addons directory
10. **Version compatibility**: API changes between Blender versions, document requirements

## Related Skills

- **[create-3d-scene](../create-3d-scene/SKILL.md)**: Basic scene setup and object creation
- **[render-blender-output](../render-blender-output/SKILL.md)**: Rendering workflows for automated output
- **[create-r-package](../../r-packages/create-r-package/SKILL.md)**: Similar packaging patterns for code distribution
