---
name: create-3d-scene
locale: wenyan-lite
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

# 造三維場景

以 Python API（bpy）程式化立一完整 Blender 場景。配置場景階層、加網格物件、以節點式著色器造 PBR 材質、置光與相機、設環境/世界之設。

## 適用時機

- 由頭造可重現之三維可視化場景
- 自動化產品視覺化或建築渲染之設
- 以程式生多場景變體
- 為批次渲染流建範本場景
- 手動精修前之場景佈局原型
- 整合三維可視化於資料管線或報告系統

## 輸入

| 輸入 | 類型 | 描述 | 範例 |
|-------|------|-------------|---------|
| 場景規格 | 配置 | 物件、材質、光之需 | 產品尺寸、材色、光設 |
| 輸出需求 | 參數 | 解析度、渲染引擎、品質設 | 1920x1080、Cycles、128 取樣 |
| 資產路 | 檔路 | 外部模型、貼圖、HDRI | `/path/to/hdri.exr`、`product_model.obj` |
| 相機設 | 參數 | 位、旋、焦距、景深 | `location=(7,-7,5)`、`lens=50mm` |
| 環境 | 配置 | 世界著色器、背景、環境光設 | HDRI 光、純色、漸層 |

## 步驟

### 1. 立腳本結構

造一 Python 腳本，含當之匯入與結構：

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

**預期：** 腳本結構含 clear_scene() 與 main() 函式
**失敗時：** 察 Python 語法，驗 bpy 匯入於 Blender Python 環境中可行

### 2. 加網格物件

造原始或匯入之網格物件：

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

**預期：** 物件顯於場景，名與位皆合
**失敗時：** 察運算子語法，驗座標，確保無命名衝突

### 3. 以節點式著色器造材質

以著色器節點立 PBR 材質：

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

**預期：** 材質於著色器編輯器中顯，節點連接無誤
**失敗時：** 察節點型存否，驗連結語法，確保色值於 [0,1] 區間

### 4. 立光

配光以照場景：

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

**預期：** 三光，強度與位皆當
**失敗時：** 依渲染引擎（Cycles 與 EEVEE 之別）調能量值，察旋轉格式

### 5. 置相機

立相機，框取得宜：

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

**預期：** 相機已置，焦距與景深設皆當
**失敗時：** track_to 敗則用簡旋轉法，驗鏡頭單位

### 6. 配世界環境

立世界著色器與背景：

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

**預期：** 世界著色器已配 HDRI 或純背景
**失敗時：** 檔缺則跳 HDRI 載入，單用 Background 節點加色

### 7. 配渲染設

設基本渲染參數：

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

**預期：** 渲染設已配，可備渲染
**失敗時：** 察引擎名拼法，驗解析度為正整數

### 8. 組織場景階層

造集合以便組織：

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

**預期：** 物件組織於名集合中，便於管理
**失敗時：** 造前察集合已存否，處孤立物件

## 驗證清單

- [ ] 腳本於 Blender 背景模式無誤運行
- [ ] 所期物件皆顯於場景大綱
- [ ] 材質於著色器編輯器中顯正色與性
- [ ] 相機已置，物件於框中
- [ ] 光給充足之照（測渲染）
- [ ] 世界環境載入無誤（HDRI 或背景色）
- [ ] 渲染設合輸出需求
- [ ] 場景於集合中組織得當
- [ ] 無孤立資料塊（無使用者之材質、網格）
- [ ] 腳本含 clear_scene() 以便重現

## 常見陷阱

1. **物件命名衝突**：用唯一名，造前察既存物件
2. **色格式誤**：RGB 值須為元組 (r, g, b, a) 於 [0,1] 區間
3. **缺 alpha 通道**：設色時含 alpha：`(r, g, b, 1.0)`
4. **節點連接誤**：連結前驗節點型有所期之輸入/輸出
5. **相機未激活**：須設 `bpy.context.scene.camera = camera_object`
6. **相對與絕對路之別**：用絕對路或 Path() 以跨平台相容
7. **單位之惑**：Blender 預設以公尺為單位，相機鏡頭以毫米
8. **旋轉格式**：用 `math.radians()` 行度-弧度之轉換
9. **渲染引擎之別**：EEVEE 與 Cycles 有異之功能與參數
10. **記憶體洩漏**：清孤立資料塊以防批次操作中之記憶體累積

## 相關技能

- **[script-blender-automation](../script-blender-automation/SKILL.md)**：程序化建模與批次操作之進階腳本模式
- **[render-blender-output](../render-blender-output/SKILL.md)**：配渲染管線並執渲染
- **[create-2d-composition](../../visualization/create-2d-composition/SKILL.md)**：以類似腳本法行二維圖形構圖
