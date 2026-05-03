---
name: script-blender-automation
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
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

# 本 Blender 自動

進階 Blender Python—程序模、鍵動畫、批操、運算註、加件開發。

## 用

- 自動重複模/動務→用
- 自算或資生程序幾何→用
- 建批繪管含參變→用
- 築自運算或加件→用
- 接 Blender 與外資管或 API→用
- 數精動畫本→用
- 開組工→用

## 入

| 入 | 型 | 述 | 例 |
|----|---|----|---|
| 自動需 | 譜 | 務述、參、限 | 繪 100 變、動路自資 |
| 資源 | 檔/API | 程序生外資 | CSV 坐、JSON 參、API 應 |
| 算定 | 碼/數 | 程序生邏 | 分形、參曲、L 系 |
| 運算譜 | 需 | 自工為與 UI | 名、屬、模互 |
| 動參 | 鍵/資 | 時、緩、限 | 幀範、插曲 |

## 行

### 一：程序幾何生

用 BMesh 程生網：

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

    verts = []
    for i in range(u_res):
        for j in range(v_res):
            u = (i / (u_res - 1)) * 2 * math.pi
            v = (j / (v_res - 1)) * math.pi

            x = math.sin(v) * math.cos(u)
            y = math.sin(v) * math.sin(u)
            z = math.cos(v)

            vert = bm.verts.new((x, y, z))
            verts.append(vert)

    bm.verts.ensure_lookup_table()
    for i in range(u_res - 1):
        for j in range(v_res - 1):
            v1 = verts[i * v_res + j]
            v2 = verts[(i + 1) * v_res + j]
            v3 = verts[(i + 1) * v_res + (j + 1)]
            v4 = verts[i * v_res + (j + 1)]
            bm.faces.new([v1, v2, v3, v4])

    bm.to_mesh(mesh)
    bm.free()

    return obj
```

得：自數函生複幾何。

敗：察 BMesh API、驗點索、確面流形。

### 二：鍵動畫自動

本鍵動與驅：

```python
def animate_rotation(obj, start_frame=1, end_frame=250, axis='Z', rotations=2):
    """Animate object rotation over time."""
    obj.rotation_euler[2] = 0
    obj.keyframe_insert(data_path="rotation_euler", index=2, frame=start_frame)

    obj.rotation_euler[2] = rotations * 2 * math.pi
    obj.keyframe_insert(data_path="rotation_euler", index=2, frame=end_frame)

    if obj.animation_data and obj.animation_data.action:
        for fcurve in obj.animation_data.action.fcurves:
            if 'rotation_euler' in fcurve.data_path:
                for keyframe in fcurve.keyframe_points:
                    keyframe.interpolation = 'LINEAR'

def animate_material_property(mat, property_path, values, frames):
    """Animate material node values."""
    if not mat.node_tree:
        return

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
```

得：鍵插、動正回放。

敗：察屬路、驗 data_path 法、確物可鍵。

### 三：批處操

批處諸物或檔：

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
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()

        bpy.ops.import_scene.obj(filepath=str(obj_file))

        setup_camera()
        setup_lighting()

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
        bsdf.inputs['Base Color'].default_value = color + (1.0,)

        bpy.context.scene.render.filepath = f"{output_prefix}_{i:03d}.png"
        bpy.ops.render.render(write_still=True)
```

得：諸檔處、各變生繪。

敗：察徑存、驗入運算、理缺材。

### 四：自運算開發

築自運算為複用工：

```python
import bpy
from bpy.props import FloatProperty, IntProperty

class OBJECT_OT_generate_spiral(bpy.types.Operator):
    """Generate a spiral curve"""
    bl_idname = "object.generate_spiral"
    bl_label = "Generate Spiral"
    bl_options = {'REGISTER', 'UNDO'}

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
        curve = bpy.data.curves.new('Spiral', 'CURVE')
        curve.dimensions = '3D'

        spline = curve.splines.new('NURBS')
        num_points = self.turns * self.resolution

        spline.points.add(num_points - 1)

        for i in range(num_points):
            t = i / self.resolution
            angle = t * 2 * math.pi

            x = self.radius * math.cos(angle)
            y = self.radius * math.sin(angle)
            z = t * 0.5

            spline.points[i].co = (x, y, z, 1.0)

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

得：運算現於搜、行支撤。

敗：察 bl_idname 式（小寫底線）、驗屬型。

### 五：模運算為互動工

築互動模運算：

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
            delta = event.mouse_x - self.initial_mouse_x
            scale = self.initial_scale + (delta / 100.0)
            scale = max(0.1, scale)

            context.active_object.scale = (scale, scale, scale)

        elif event.type == 'LEFTMOUSE':
            return {'FINISHED'}

        elif event.type in {'RIGHTMOUSE', 'ESC'}:
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

得：互動運算應鼠、左確、ESC 撤。

敗：察事型、確模處加、理無活物。

### 六：加件包

組碼為可裝加件：

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

from .operators import OBJECT_OT_generate_spiral

classes = (
    OBJECT_OT_generate_spiral,
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

得：加件經 Preferences 裝、運算現於菜。

敗：察 bl_info 式、驗 Blender 本需、確諸類列。

### 七：資導程序生

自外資生幾何：

```python
import csv
import json

def create_from_csv(filepath):
    """Generate objects from CSV data."""
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)

        for row in reader:
            name = row['name']
            x, y, z = float(row['x']), float(row['y']), float(row['z'])
            scale = float(row.get('scale', 1.0))

            bpy.ops.mesh.primitive_uv_sphere_add(location=(x, y, z))
            obj = bpy.context.active_object
            obj.name = name
            obj.scale = (scale, scale, scale)

def create_from_json(filepath):
    """Generate scene from JSON configuration."""
    with open(filepath, 'r') as f:
        config = json.load(f)

    for obj_config in config.get('objects', []):
        obj_type = obj_config['type']
        location = obj_config['location']

        if obj_type == 'cube':
            bpy.ops.mesh.primitive_cube_add(location=location)
        elif obj_type == 'sphere':
            bpy.ops.mesh.primitive_uv_sphere_add(location=location)

        obj = bpy.context.active_object
        obj.name = obj_config.get('name', 'Object')

        if 'material' in obj_config:
            mat_name = obj_config['material']
            mat = bpy.data.materials.get(mat_name)
            if mat:
                obj.data.materials.append(mat)
```

得：物自外資檔生。

敗：驗檔式、理缺欄、予默值。

## 驗

- [ ] 本於 Blender Python 行無誤
- [ ] 程序幾何如期生
- [ ] 動鍵插於正幀
- [ ] 批操處諸檔
- [ ] 自運算現於搜並正行
- [ ] 模運算應鼠/鍵
- [ ] 加件裝/卸潔
- [ ] 外資檔正解
- [ ] 誤理覆邊例
- [ ] 碼循 PEP 8

## 忌

1. **加件循入**：用相對入、慎組模
2. **運算名**：bl_idname 必小寫單底線（類.名）
3. **屬型**：用正 bpy.props 型（FloatProperty、IntProperty 等）
4. **境訪**：非諸運算於諸境（視口 vs 繪）
5. **BMesh 清**：`bm.to_mesh()` 後恆 `bm.free()` 防漏
6. **動鍵時**：幀始 1 非 0
7. **驅式誤**：驗式、用安名空
8. **模運算阻**：勿阻於 modal()、用非阻操
9. **加件裝徑**：置於 Blender scripts/addons
10. **本相容**：API 跨本變、文錄需

## 參

- **[create-3d-scene](../create-3d-scene/SKILL.md)**
- **[render-blender-output](../render-blender-output/SKILL.md)**
- **[create-r-package](../../r-packages/create-r-package/SKILL.md)**
