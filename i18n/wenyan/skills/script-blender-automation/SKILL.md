---
name: script-blender-automation
locale: wenyan
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

# 寫 Blender 自動之本

於 Blender 寫 Python 之本：程序之模、關鍵幀之動畫、批處理、操作子之註、附加之發。涵繁形之生、自動之流、與外數源之集。

## 用時

- 自動重複之建模或動畫之務乃用
- 自算或數生程序之形乃用
- 立批渲染之管線附參之變乃用
- 建自定操作子或附加以增工作流乃用
- Blender 與外數管或 API 之集乃用
- 以數學精度寫繁動畫乃用
- 建可重用之器以共團之流乃用

## 入

| 入 | 類 | 述 | 例 |
|-------|------|-------------|---------|
| 自動之求 | 規 | 務述、參、限 | 渲百變、自數動路 |
| 數源 | 文件/API | 外數以為程序生 | CSV 坐標、JSON 參、API 應 |
| 算之定 | 碼/數 | 程序生之邏 | 分形、參曲線、L-系統 |
| 操作子之規 | 求 | 自定器之行與 UI | 器名、屬、模式之交互 |
| 動畫之參 | 關鍵幀/數 | 時、緩、限 | 幀範、插曲線 |

## 法

### 一、程序之形之生

以 BMesh 程序立網形：

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

**得**：自數函生繁形
**敗則**：察 BMesh API 之呼，驗頂索之引，確面為流形

### 二、關鍵幀動畫之自動

寫關鍵幀與驅動：

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

**得**：關鍵幀已插，動畫播放正
**敗則**：察屬之徑，驗 data_path 之語法，確物可下關鍵幀

### 三、批處理之操

批處諸物或諸文件：

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

**得**：諸文件皆處，每變皆生渲
**敗則**：察文徑存，驗導入之操作子，處缺材之事

### 四、自定操作子之發

立可重用之自定操作子：

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

**得**：操作子現於搜，行而支撤
**敗則**：察 bl_idname 之式（小寫加底線），驗屬之類

### 五、模式之操作子為交互之器

立交互模式之操作子：

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

**得**：交互之操作子應鼠，左擊確，ESC 取消
**敗則**：察事件之類，確模式之手已加，處無活物之例

### 六、附加之裝包

碼結構為可裝之附加：

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

**得**：附加由偏好設置裝，操作子現於菜
**敗則**：察 bl_info 之式，驗 Blender 之版求，確諸類皆列

### 七、依數而生形

自外數生形：

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

**得**：物依外數文件生
**敗則**：驗文件之式，處缺域，供默值

## 驗

- [ ] 本於 Blender Python 之境行而無誤
- [ ] 程序之形如預期生
- [ ] 動畫關鍵幀於正幀插
- [ ] 批操處諸文件成
- [ ] 自定操作子現於搜而行正
- [ ] 模式之操作子應鼠/鍵之事件
- [ ] 附加裝/卸皆潔
- [ ] 外數文件解析正
- [ ] 誤處覆邊例
- [ ] 碼遵 PEP 8 之風

## 陷

1. **附加之循環引**：用相對引，慎結構模
2. **操作子之名**：bl_idname 必為小寫加單底線（category.name）
3. **屬之類**：用正之 bpy.props 類（FloatProperty、IntProperty 等）
4. **境之訪**：非諸操作子皆於諸境可行（視口 vs 渲）
5. **BMesh 之清**：於 `bm.to_mesh()` 後常呼 `bm.free()` 以防漏
6. **動畫關鍵幀之時**：幀始於 1，非 0
7. **驅動表達之誤**：驗表達，用安全命名空
8. **模式操作子之阻**：勿於 modal() 阻，用非阻之操
9. **附加裝之徑**：置於 Blender 之 scripts/addons 目
10. **版兼容**：API 於諸 Blender 版間變，書其求

## 參

- **[create-3d-scene](../create-3d-scene/SKILL.md)**：基景之設與物之立
- **[render-blender-output](../render-blender-output/SKILL.md)**：自動出之渲流
- **[create-r-package](../../r-packages/create-r-package/SKILL.md)**：相似之碼散裝包模
