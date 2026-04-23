---
name: create-3d-scene
locale: wenyan-ultra
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

# 造三維場

以 Python API（bpy）程設全 Blender 場。設場層、加網件、以點基 shader 造 PBR 材、位光與機、立境/世設。

## 用

- 造可重三維視場
- 自品視或築渲設
- 程生多場變
- 築批渲之模場
- 手精前試排
- 融三維視於數流或報系

## 入

| 入 | 型 | 述 | 例 |
|-------|------|-------------|---------|
| 場規 | 設 | 件、材、光需 | 品寸、材色、光設 |
| 出需 | 參 | 解、渲擎、質設 | 1920x1080、Cycles、128 樣 |
| 資路 | 檔路 | 外模、紋、HDRI | `/path/to/hdri.exr`、`product_model.obj` |
| 機設 | 參 | 位、旋、焦距、DOF | `location=(7,-7,5)`、`lens=50mm` |
| 境 | 設 | 世 shader、背、環設 | HDRI 光、純色、梯 |

## 行

### 一、設本構

建含正引與構之 Python 本：

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

**得：** 本含 clear_scene() 與 main()
**敗：** 察 Python 文法、驗 bpy 於 Blender 境中可引

### 二、加網件

建原或引網件：

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

**得：** 件現於場，名與位正
**敗：** 察操文法、驗坐、保名無衝

### 三、以點基 shader 造材

用 shader 點設 PBR 材：

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

**得：** 材顯於 shader 編輯器含正點連
**敗：** 察點型存、驗連文法、保色值於 [0,1]

### 四、設光

配光以照場：

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

**得：** 三光含合強與位
**敗：** 按渲擎調能值、察旋式

### 五、位機

設機含正框：

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

**得：** 機位含正焦距與 DOF
**敗：** track_to 敗→用簡旋法、驗鏡單

### 六、設世境

配世 shader 與背：

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

**得：** 世 shader 含 HDRI 或純背
**敗：** 檔缺→略 HDRI 載，獨用 Background 含色

### 七、設渲參

立基渲參：

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

**得：** 渲參已配、可渲
**敗：** 察擎名、驗解值為正整

### 八、組場層

建組以理：

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

**得：** 件組於名組中便理
**敗：** 建前察組存、理孤件

## 驗

- [ ] 本於 Blender 背模中無誤行
- [ ] 諸件於場輪廓中
- [ ] 材於 shader 編輯器顯正色與性
- [ ] 機位含件於框
- [ ] 光足（試渲）
- [ ] 世境正載
- [ ] 渲參合出需
- [ ] 場以組理組
- [ ] 無孤數塊
- [ ] 本含 clear_scene() 為重現

## 忌

1. **件名衝**：用獨名、建前察存
2. **色式誤**：RGB 須為元 (r, g, b, a) 於 [0,1]
3. **缺 alpha**：設色含 alpha：`(r, g, b, 1.0)`
4. **點連誤**：連前驗點型含入出
5. **機非活**：須 `bpy.context.scene.camera = camera_object`
6. **相與絕路**：用絕路或 Path() 跨平台
7. **單惑**：Blender 默米、機鏡米厘
8. **旋式**：用 `math.radians()` 度轉弧
9. **渲擎異**：EEVEE 與 Cycles 特與參異
10. **存漏**：清孤塊防批中存積

## 參

- **[script-blender-automation](../script-blender-automation/SKILL.md)**：程模與批操之進本模
- **[render-blender-output](../render-blender-output/SKILL.md)**：設渲流與行渲
- **[create-2d-composition](../../visualization/create-2d-composition/SKILL.md)**：二維像構之類本法
