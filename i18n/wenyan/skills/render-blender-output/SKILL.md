---
name: render-blender-output
locale: wenyan
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

# 渲 Blender 之出

設諸渲、合節、出式，以 Cycles 或 EEVEE 由 Python API 或命行行渲。涵渲設之優、檔式之擇、後處之流。

## 用時

- 自動行批渲乃用
- 設渲質與性之衡乃用
- 立後處之合線乃用
- 自一渲生多出式乃用
- 為異硬優渲設乃用
- 立命行之渲流乃用
- 生公示或陳之終出乃用

## 入

| 入 | 類 | 述 | 例 |
|-------|------|-------------|---------|
| 場文 | .blend 文 | 欲渲之 Blender 場 | `scene.blend` |
| 渲擎 | 串 | Cycles、EEVEE、Workbench | `CYCLES` |
| 質設 | 參 | 樣、解、去噪 | 128 樣、1920x1080、OptiX 去噪 |
| 出式 | 串 | PNG、EXR、JPEG、TIFF | `OPEN_EXR`、16 位、ZIP 縮 |
| 合設 | 節圖 | 後處之效 | 色調、眩、暈 |
| 出路 | 文路 | 渲之的 | `/renders/output_####.png` |

## 法

### 1. 設渲擎

設渲擎與基參：

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

**得：** 渲擎已設附宜質之諸值
**敗則：** 察擎名之拼，驗 GPU 之可用以行 GPU 渲

### 2. 設解與出式

設出之維與檔式：

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

**得：** 出式與解已正設
**敗則：** 察式名為效，驗色深合於式

### 3. 設合

立合節之圖：

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

**得：** 合節已設附後處之效
**敗則：** 察節類名，驗入存，確連有效

### 4. 設出檔之路

設出檔之命附幀號：

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

**得：** 出之所已立，文路設附幀編
**敗則：** 察所之權，驗路之 OS 語法

### 5. 設視層與通

立合用之渲通：

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

**得：** 渲通已啟以行進階之合
**敗則：** 察通是否於當擎可用，驗視層之名

### 6. 行渲

由 Python API 或命行行渲：

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

**得：** 渲已行，出檔書於所指
**敗則：** 察場設，驗鏡存，確出之所可書

### 7. 自多鏡批渲

自多鏡角而渲：

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

**得：** 場之諸鏡皆生渲
**敗則：** 察鏡存，驗各鏡位正

### 8. 優渲性

設性之諸值：

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

**得：** 渲設已對目硬優之
**敗則：** 先試以低質，察存之用

## 驗

- [ ] 渲擎已正設（Cycles/EEVEE）
- [ ] 解與比合需
- [ ] 出式宜境
- [ ] 色深與縮設已驗
- [ ] 合節連正
- [ ] 出之所存且可書
- [ ] 文名含幀編若需
- [ ] 渲通依需而啟
- [ ] 鏡於場中位正
- [ ] 試渲畢無誤
- [ ] 出檔之式與質正

## 陷

1. **無鏡**：場必有活鏡乃可渲
2. **出路未設**：渲前必設 `scene.render.filepath`
3. **樣不足**：低樣致 Cycles 渲生噪
4. **色空誤**：察色管之諸值以正示
5. **檔式不容**：非凡式皆持諸色深
6. **存溢**：大解或繁場或越 RAM
7. **GPU 存盡**：減瓦大或轉至 CPU 處大場
8. **背景模出**：背景模必用 --render-output 旗或設文路
9. **幀號之式**：用 #### 自動補幀
10. **合未啟**：啟 `scene.use_nodes` 以用合

## 參

- **[create-3d-scene](../create-3d-scene/SKILL.md)**：渲前場之設
- **[script-blender-automation](../script-blender-automation/SKILL.md)**：批渲自動之形
- **[render-publication-graphic](../../visualization/render-publication-graphic/SKILL.md)**：公示之出需與式
