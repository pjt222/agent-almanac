---
name: script-blender-automation
locale: wenyan-lite
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

# 編寫 Blender 自動化腳本

進階 Blender Python 腳本：程序式建模、關鍵幀動畫、批次操作、運算子註冊與附加元件開發。涵蓋複雜幾何生成、自動化工作流與外部資料源整合。

## 適用時機

- 自動化重複之建模或動畫任務
- 從演算法或資料生成程序式幾何
- 建立含參數變化之批次渲染管道
- 建構工作流增強之自訂運算子或附加元件
- 將 Blender 與外部資料管道或 API 整合
- 以數學精度撰寫複雜動畫
- 為團隊工作流開發可重用工具

## 輸入

| 輸入 | 類型 | 描述 | 範例 |
|-------|------|-------------|---------|
| 自動化需求 | 規格 | 任務描述、參數、限制 | 渲染 100 種變化、依資料動畫路徑 |
| 資料源 | 文件/API | 程序式生成之外部資料 | CSV 座標、JSON 參數、API 回應 |
| 演算法定義 | 代碼/數學 | 程序式生成邏輯 | 碎形模式、參數曲線、L-系統 |
| 運算子規格 | 需求 | 自訂工具行為與 UI | 工具名、屬性、模態互動 |
| 動畫參數 | 關鍵幀/資料 | 時序、緩動、限制 | 幀範圍、插值曲線 |

## 步驟

### 1. 程序式幾何生成

以 BMesh 程式化建立網格幾何：

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

**預期：** 由數學函數生成複雜幾何
**失敗時：** 檢查 BMesh API 呼叫、驗證頂點索引、確保面為流形

### 2. 關鍵幀動畫自動化

以腳本動畫關鍵幀與驅動器：

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

**預期：** 關鍵幀已插入、動畫正確播放
**失敗時：** 檢查屬性路徑、驗證 data_path 語法、確保物件可加幀

### 3. 批次處理操作

批次處理多個物件或文件：

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

**預期：** 多個文件已處理、各變體之渲染已生成
**失敗時：** 檢查文件路徑存在、驗證引入運算子、處理缺失材質

### 4. 自訂運算子開發

建立可重用工具之自訂運算子：

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

**預期：** 運算子出現於搜尋中，正確支援撤銷執行
**失敗時：** 檢查 bl_idname 格式（小寫含底線）、驗證屬性類型

### 5. 互動工具之模態運算子

建立互動式模態運算子：

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

**預期：** 互動運算子回應滑鼠、左鍵確認、ESC 取消
**失敗時：** 檢查事件類型、確保模態處理器已加、處理無作用物件之情況

### 6. 附加元件打包

將代碼結構為可安裝之附加元件：

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

**預期：** 附加元件經偏好設定安裝，運算子出現於選單
**失敗時：** 檢查 bl_info 格式、驗證 Blender 版本要求、確保所有類已列

### 7. 資料驅動之程序式生成

從外部資料生成幾何：

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

**預期：** 物件依外部資料文件建立
**失敗時：** 驗證文件格式、處理缺失欄位、提供預設值

## 驗證清單

- [ ] 腳本於 Blender Python 環境無錯執行
- [ ] 程序式幾何如預期生成
- [ ] 動畫關鍵幀已於正確幀插入
- [ ] 批次操作成功處理所有文件
- [ ] 自訂運算子出現於搜尋並正確執行
- [ ] 模態運算子回應滑鼠/鍵盤事件
- [ ] 附加元件乾淨地安裝與卸載
- [ ] 外部資料文件正確解析
- [ ] 錯誤處理覆蓋邊緣情況
- [ ] 代碼遵循 PEP 8 風格指引

## 常見陷阱

1. **附加元件中之循環引入**：用相對引入、謹慎結構模組
2. **運算子命名**：bl_idname 須小寫含單一底線（category.name）
3. **屬性類型**：用正確 bpy.props 類型（FloatProperty、IntProperty 等）
4. **情境存取**：非所有運算子於所有情境可運作（視窗 vs 渲染）
5. **BMesh 清理**：`bm.to_mesh()` 後始終呼叫 `bm.free()` 以防記憶體洩漏
6. **動畫關鍵幀時序**：幀號從 1 開始，非 0
7. **驅動器表達式錯誤**：驗證表達式、用安全命名空間
8. **模態運算子阻塞**：勿於 modal() 中阻塞，用非阻塞操作
9. **附加元件安裝路徑**：置於 Blender 之 scripts/addons 目錄
10. **版本相容性**：API 於 Blender 版本間變化，記錄要求

## 相關技能

- **[create-3d-scene](../create-3d-scene/SKILL.md)**：基本場景設置與物件建立
- **[render-blender-output](../render-blender-output/SKILL.md)**：自動化輸出之渲染工作流
- **[create-r-package](../../r-packages/create-r-package/SKILL.md)**：代碼分發之相似打包模式
