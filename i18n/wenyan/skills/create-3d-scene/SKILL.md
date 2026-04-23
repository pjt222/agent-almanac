---
name: create-3d-scene
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

# 建三維之景

以 Python API（bpy）程式化設 Blender 之全景。配景層級、增網體、建 PBR 材質含節式著色、置光與鏡、設環境與世界。

## 用時

- 由無而建可重現之三維視景
- 自動設產品視或建築渲染
- 程式化生多景之變
- 為批渲染建樣景
- 手修前之原型佈
- 三維視入數管或報告系

## 入

| 入 | 類 | 述 | 例 |
|-------|------|-------------|---------|
| 景說 | 配置 | 物、材、光之求 | 產品尺、材色、光設 |
| 出求 | 參 | 解析、引擎、質 | 1920x1080、Cycles、128 樣 |
| 資路 | 路 | 外模型、紋、HDRI | `/path/to/hdri.exr`、`product_model.obj` |
| 鏡設 | 參 | 位、旋、焦、景深 | `location=(7,-7,5)`、`lens=50mm` |
| 環 | 配置 | 世著色、背、環境 | HDRI 光、純色、漸層 |

## 法

### 一、設腳本之構

建 Python 腳本，有正入與構：

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

**得：** 腳本有 clear_scene() 與 main() 之構
**敗則：** 察 Python 語法，驗 bpy 於 Blender Python 境可入

### 二、增網體

建原始或入網體：

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

**得：** 物現於景，名位皆正
**敗則：** 察算子語法、驗坐標、防名衝

### 三、以節式著色建材

以著色節設 PBR 材：

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

**得：** 材現於著色編，節聯正
**敗則：** 察節類存，驗聯語法，確色值於 [0,1] 內

### 四、設光

設光以照景：

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

**得：** 三光，強度與位皆宜
**敗則：** 依引擎（Cycles 對 EEVEE）調能量，察旋式

### 五、置鏡

設鏡以正取景：

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

**得：** 鏡置而焦長、景深皆正
**敗則：** 若 track_to 敗，用簡旋法；驗鏡頭單位

### 六、設世界之環境

設世之著色與背：

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

**得：** 世著色以 HDRI 或純背設
**敗則：** 若 HDRI 文件缺，略其加載，獨用 Background 節與色

### 七、設渲染

設基本渲參：

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

**得：** 渲設已配，可渲
**敗則：** 察引擎名拼寫，驗解析為正整數

### 八、組景之層

建集以組：

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

**得：** 物按名組於諸集，易管
**敗則：** 建前察集存，處孤物

## 驗

- [ ] 腳本於 Blender 背景模式無訛而運
- [ ] 諸物現於景概
- [ ] 材於著色編顯正色與性
- [ ] 鏡置而物於框
- [ ] 光足（試渲）
- [ ] 世環正加載（HDRI 或背色）
- [ ] 渲設合出之求
- [ ] 景按集有序
- [ ] 無孤資料（無用之材、網）
- [ ] 腳本含 clear_scene() 以可重現

## 陷

1. **物名衝**：用唯一之名，建前察物存
2. **色式誤**：RGB 值宜為 (r,g,b,a) 元組，值於 [0,1]
3. **缺 alpha**：設色時含 alpha：`(r, g, b, 1.0)`
4. **節聯訛**：聯前驗節類有所期之入出
5. **鏡未激**：宜設 `bpy.context.scene.camera = camera_object`
6. **相對對絕對路**：用絕對路或 Path() 以跨平台
7. **單位混**：Blender 默用米，鏡頭以毫米
8. **旋式**：用 `math.radians()` 度轉弧度
9. **引擎異**：EEVEE 與 Cycles 功能參數異
10. **記憶漏**：清孤資以防批處積

## 參

- **[script-blender-automation](../script-blender-automation/SKILL.md)**：程序建模與批處之進階腳本
- **[render-blender-output](../render-blender-output/SKILL.md)**：配渲管而執渲
- **[create-2d-composition](../../visualization/create-2d-composition/SKILL.md)**：以似法作二維構
