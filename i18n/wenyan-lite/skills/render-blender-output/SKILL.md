---
name: render-blender-output
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Configure render settings, compositing nodes, output formats, and execute
  renders via Cycles or EEVEE engines using Python API or command-line
  interface. Use when automating render execution for batch processing,
  configuring quality and performance trade-offs, setting up compositing
  pipelines for post-processing, generating multiple output formats from a
  single render, or producing final output for publication or presentation.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: blender
  complexity: intermediate
  language: Python
  tags: blender, bpy, rendering, cycles, eevee, compositing, output
---

# 渲染 Blender 輸出

配置渲染引擎（Cycles、EEVEE），設輸出參數，建合成節點圖，並透過 Python API 或命令列執行渲染。涵蓋渲染設定優化、文件格式選擇與後處理工作流。

## 適用時機

- 自動化渲染執行以作批次處理
- 配置渲染品質與效能之權衡
- 為後處理設置合成管線
- 自單一渲染生成多種輸出格式
- 為不同硬體優化渲染設定
- 建立命令列渲染工作流
- 為出版或簡報製作最終輸出

## 輸入

| 輸入 | 類型 | 描述 | 例 |
|-------|------|-------------|---------|
| Scene file | .blend file | 待渲之 Blender 場景 | `scene.blend` |
| Render engine | String | Cycles、EEVEE 或 Workbench | `CYCLES` |
| Quality settings | Parameters | 採樣、解析度、降噪 | 128 samples, 1920x1080, OptiX denoiser |
| Output format | String | PNG、EXR、JPEG、TIFF | `OPEN_EXR`, 16-bit, ZIP compression |
| Compositing setup | Node graph | 後處理效果 | Color grading, glare, vignette |
| Output path | File path | 渲染目的地 | `/renders/output_####.png` |

## 步驟

### 1. 配置渲染引擎

設渲染引擎與基本參數：

```python
import bpy

def setup_cycles_engine():
    """Configure Cycles render engine."""
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'

    # Device settings
    scene.cycles.device = 'GPU'  # or 'CPU'

    # Sampling
    scene.cycles.samples = 128  # Viewport: fewer samples
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.adaptive_threshold = 0.01

    # Denoising
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = 'OPTIX'  # or 'OPENIMAGEDENOISE', 'NLM'

    # Light paths
    scene.cycles.max_bounces = 12
    scene.cycles.diffuse_bounces = 4
    scene.cycles.glossy_bounces = 4
    scene.cycles.transmission_bounces = 12
    scene.cycles.volume_bounces = 0

def setup_eevee_engine():
    """Configure EEVEE render engine."""
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'

    # Sampling
    scene.eevee.taa_render_samples = 64

    # Effects
    scene.eevee.use_bloom = True
    scene.eevee.bloom_threshold = 0.8
    scene.eevee.bloom_intensity = 0.1

    scene.eevee.use_gtao = True  # Ambient occlusion
    scene.eevee.gtao_distance = 0.2

    scene.eevee.use_ssr = True  # Screen space reflections
    scene.eevee.ssr_quality = 0.5

    # Shadows
    scene.eevee.shadow_cube_size = '1024'
    scene.eevee.shadow_cascade_size = '1024'
```

**預期：** 渲染引擎配置完成，含適當之品質設定
**失敗時：** 檢查引擎名拼寫，確認 GPU 渲染之 GPU 可用

### 2. 設解析度與輸出格式

配置輸出尺寸與文件格式：

```python
def configure_output(width=1920, height=1080, file_format='PNG', color_depth='16'):
    """Set output resolution and format."""
    scene = bpy.context.scene

    # Resolution
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100

    # Aspect ratio
    scene.render.pixel_aspect_x = 1.0
    scene.render.pixel_aspect_y = 1.0

    # File format
    scene.render.image_settings.file_format = file_format

    if file_format == 'PNG':
        scene.render.image_settings.color_mode = 'RGBA'
        scene.render.image_settings.color_depth = color_depth  # '8' or '16'
        scene.render.image_settings.compression = 15  # 0-100

    elif file_format == 'OPEN_EXR':
        scene.render.image_settings.color_mode = 'RGBA'
        scene.render.image_settings.color_depth = '32'  # or '16'
        scene.render.image_settings.exr_codec = 'ZIP'  # or 'DWAA', 'PIZ'

    elif file_format == 'JPEG':
        scene.render.image_settings.color_mode = 'RGB'
        scene.render.image_settings.quality = 90  # 0-100

    elif file_format == 'TIFF':
        scene.render.image_settings.color_mode = 'RGBA'
        scene.render.image_settings.color_depth = color_depth
        scene.render.image_settings.tiff_codec = 'DEFLATE'

    # Frame range (for animations)
    scene.frame_start = 1
    scene.frame_end = 250
    scene.frame_step = 1
```

**預期：** 輸出格式與解析度配置正確
**失敗時：** 檢查格式名有效，確認顏色深度與格式相容

### 3. 配置合成

設合成節點圖：

```python
def setup_compositing():
    """Create compositing node setup."""
    scene = bpy.context.scene
    scene.use_nodes = True

    tree = scene.node_tree
    nodes = tree.nodes
    links = tree.links

    # Clear default nodes
    nodes.clear()

    # Render Layers input
    render_layers = nodes.new(type='CompositorNodeRLayers')
    render_layers.location = (-400, 300)

    # Denoise (if not using Cycles denoiser)
    # denoise = nodes.new(type='CompositorNodeDenoise')
    # denoise.location = (-200, 300)

    # Color correction
    color_correct = nodes.new(type='CompositorNodeColorCorrection')
    color_correct.location = (0, 300)
    color_correct.master_saturation = 1.1
    color_correct.master_gain = 1.05

    # Glare effect
    glare = nodes.new(type='CompositorNodeGlare')
    glare.location = (200, 200)
    glare.glare_type = 'FOG_GLOW'
    glare.threshold = 0.9
    glare.size = 8

    # Vignette
    lens_distortion = nodes.new(type='CompositorNodeLensdist')
    lens_distortion.location = (200, 0)
    lens_distortion.inputs['Dispersion'].default_value = 0.0
    lens_distortion.inputs['Distortion'].default_value = -0.02

    # Mix nodes
    mix1 = nodes.new(type='CompositorNodeMixRGB')
    mix1.location = (400, 250)
    mix1.blend_type = 'ADD'
    mix1.inputs['Fac'].default_value = 0.3

    # Composite output
    composite = nodes.new(type='CompositorNodeComposite')
    composite.location = (600, 300)

    # Viewer output (for preview)
    viewer = nodes.new(type='CompositorNodeViewer')
    viewer.location = (600, 100)

    # Link nodes
    links.new(render_layers.outputs['Image'], color_correct.inputs['Image'])
    links.new(color_correct.outputs['Image'], mix1.inputs[1])
    links.new(color_correct.outputs['Image'], glare.inputs['Image'])
    links.new(glare.outputs['Image'], mix1.inputs[2])
    links.new(mix1.outputs['Image'], composite.inputs['Image'])
    links.new(mix1.outputs['Image'], viewer.inputs['Image'])
```

**預期：** 合成節點配置完成，含後處理效果
**失敗時：** 檢查節點類型名，確認輸入存在，確保連結有效

### 4. 設輸出文件路徑

帶幀編號配置輸出文件命名：

```python
import os
from pathlib import Path

def set_output_path(base_dir, project_name, use_frame_number=True):
    """Configure output file path."""
    scene = bpy.context.scene

    # Create output directory
    output_dir = Path(base_dir) / project_name / "renders"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Set filepath
    if use_frame_number:
        # #### is replaced with frame number (0001, 0002, etc.)
        filename = f"{project_name}_####"
    else:
        filename = project_name

    scene.render.filepath = str(output_dir / filename)

    # Optional: Set file extension explicitly
    # Extension added automatically based on file_format
    # But can override: scene.render.file_extension = '.png'
```

**預期：** 輸出目錄已建，filepath 配置帶幀編號
**失敗時：** 檢查目錄權限，確認對應 OS 之路徑語法

### 5. 配置視圖層與通道

為合成設渲染通道：

```python
def configure_view_layers():
    """Enable render passes."""
    scene = bpy.context.scene
    view_layer = scene.view_layers['ViewLayer']

    # Enable passes
    view_layer.use_pass_combined = True
    view_layer.use_pass_z = True  # Depth
    view_layer.use_pass_mist = False
    view_layer.use_pass_normal = True
    view_layer.use_pass_vector = True  # Motion vectors
    view_layer.use_pass_ambient_occlusion = True

    # Cycles-specific passes
    cycles = view_layer.cycles
    cycles.use_pass_diffuse_direct = True
    cycles.use_pass_diffuse_indirect = True
    cycles.use_pass_glossy_direct = True
    cycles.use_pass_glossy_indirect = True
    cycles.use_pass_emission = True
    cycles.use_pass_environment = True

    # Cryptomatte passes (for post-production)
    cycles.use_pass_crypto_object = True
    cycles.use_pass_crypto_material = True
    cycles.use_pass_crypto_asset = True
```

**預期：** 渲染通道已啟用以供進階合成
**失敗時：** 檢查通道是否可用於當前引擎，確認視圖層名

### 6. 執行渲染

透過 Python API 或命令列渲染：

```python
def render_still():
    """Render current frame."""
    bpy.ops.render.render(write_still=True)

def render_animation():
    """Render animation frame range."""
    bpy.ops.render.render(animation=True)

def render_frame(frame_number):
    """Render specific frame."""
    scene = bpy.context.scene
    scene.frame_set(frame_number)
    bpy.ops.render.render(write_still=True)

# Command-line rendering (run from terminal)
# Single frame:
# blender scene.blend --background --render-frame 1

# Animation:
# blender scene.blend --background --render-anim

# Specific frame range:
# blender scene.blend --background --frame-start 10 --frame-end 20 --render-anim

# Override output path:
# blender scene.blend --background --render-output /tmp/render_#### --render-anim

# Use Python script:
# blender scene.blend --background --python render_script.py
```

**預期：** 渲染執行，輸出文件寫至所指位置
**失敗時：** 檢查場景設置，確認攝影機存在，確保輸出目錄可寫

### 7. 多攝影機批次渲染

自多攝影機角度渲染：

```python
def render_all_cameras(output_dir):
    """Render scene from all cameras."""
    scene = bpy.context.scene
    original_camera = scene.camera

    cameras = [obj for obj in bpy.data.objects if obj.type == 'CAMERA']

    for camera in cameras:
        # Set active camera
        scene.camera = camera

        # Update output path
        camera_name = camera.name.replace(' ', '_')
        scene.render.filepath = os.path.join(output_dir, f"{camera_name}_####")

        # Render
        bpy.ops.render.render(write_still=True)
        print(f"Rendered from camera: {camera.name}")

    # Restore original camera
    scene.camera = original_camera
```

**預期：** 為場景中每攝影機生成渲染
**失敗時：** 檢查攝影機存在，確認每攝影機定位正確

### 8. 優化渲染效能

配置效能設定：

```python
def optimize_performance():
    """Optimize render settings for speed."""
    scene = bpy.context.scene

    if scene.render.engine == 'CYCLES':
        # Tile size (GPU: larger tiles, CPU: smaller tiles)
        if scene.cycles.device == 'GPU':
            scene.render.tile_x = 256
            scene.render.tile_y = 256
        else:
            scene.render.tile_x = 32
            scene.render.tile_y = 32

        # Performance settings
        scene.cycles.use_adaptive_sampling = True
        scene.render.use_persistent_data = True  # Keep scene in memory

        # Reduce light path complexity for preview
        scene.cycles.max_bounces = 4
        scene.cycles.diffuse_bounces = 2
        scene.cycles.glossy_bounces = 2

        # Progressive refine (for viewport)
        scene.cycles.use_progressive_refine = True

    elif scene.render.engine == 'BLENDER_EEVEE':
        # Simplify settings for preview
        scene.render.use_simplify = True
        scene.render.simplify_subdivision = 2

        # Reduce sampling
        scene.eevee.taa_render_samples = 32
```

**預期：** 渲染設定已為目標硬體優化
**失敗時：** 先以較低品質測試，監視記憶體使用

## 驗證

- [ ] 渲染引擎配置正確（Cycles／EEVEE）
- [ ] 解析度與寬高比合需
- [ ] 輸出格式合用例
- [ ] 顏色深度與壓縮設定已驗
- [ ] 合成節點正確相連
- [ ] 輸出目錄存在且可寫
- [ ] 文件名按需含幀編號
- [ ] 渲染通道按需啟用
- [ ] 攝影機於場景中定位正確
- [ ] 試渲完成無誤
- [ ] 輸出文件具正確之格式與品質

## 常見陷阱

1. **缺攝影機**：場景渲染須有作用中之攝影機
2. **未設輸出路徑**：渲染前務必指定 `scene.render.filepath`
3. **採樣不足**：Cycles 渲染中低採樣致雜訊
4. **錯之色空間**：檢查色彩管理設定以資正確顯示
5. **文件格式不相容**：非所有格式皆支援所有顏色深度
6. **記憶體溢位**：大解析度或複雜場景恐逾 RAM
7. **GPU 記憶體不足**：減小 tile 或大場景轉用 CPU
8. **背景模式輸出**：背景模式中須用 --render-output 旗標或設 filepath
9. **幀編號格式**：用 #### 自動填充幀
10. **合成未啟**：啟用 `scene.use_nodes` 以用合成

## 相關技能

- **[create-3d-scene](../create-3d-scene/SKILL.md)**：渲染前須之場景設置
- **[script-blender-automation](../script-blender-automation/SKILL.md)**：批次渲染自動化模式
- **[render-publication-graphic](../../visualization/render-publication-graphic/SKILL.md)**：出版輸出之需求與格式化
