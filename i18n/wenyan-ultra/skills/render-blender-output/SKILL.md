---
name: render-blender-output
locale: wenyan-ultra
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

# 渲 Blender 出

設渲擎（Cycles、EEVEE）、設出參、建合節圖、執渲於 Python API 或命行。

## 用

- 自動化渲執為批處
- 設渲質與效衡
- 立合管為後處
- 一渲生多出格
- 為異硬件優渲設
- 建命行渲流
- 生終出為發或示

## 入

| Input | Type | Description | Example |
|-------|------|-------------|---------|
| Scene file | .blend file | Blender scene to render | `scene.blend` |
| Render engine | String | Cycles, EEVEE, or Workbench | `CYCLES` |
| Quality settings | Parameters | Samples, resolution, denoising | 128 samples, 1920x1080, OptiX denoiser |
| Output format | String | PNG, EXR, JPEG, TIFF | `OPEN_EXR`, 16-bit, ZIP compression |
| Compositing setup | Node graph | Post-processing effects | Color grading, glare, vignette |
| Output path | File path | Render destination | `/renders/output_####.png` |

## 行

### 一：設渲擎

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

得：渲擎已設、有應質設
敗：察擎名拼、驗 GPU 為 GPU 渲

### 二：設解與出格

設出維與檔格：

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

得：出格與解正設
敗：察格名有效、驗色深合格

### 三：設合

立合節圖：

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

得：合節已設、含後處效
敗：察節型名、驗入存、確連有效

### 四：設出檔路

設出檔命含幀號：

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

得：出錄已建、檔路含幀號設
敗：察錄權、驗路語對 OS

### 五：設視層與通

立渲通為合：

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

得：渲通已啟為進階合
敗：察通對當擎可用、驗視層名

### 六：執渲

經 Python API 或命行渲：

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

得：渲執、出檔書於指處
敗：察景設、驗鏡存、確出錄可寫

### 七：批渲多鏡

自多鏡角渲：

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

得：諸鏡皆生渲
敗：察鏡存、驗各鏡正定位

### 八：優渲效

設效設：

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

得：渲設為標硬件優
敗：先以低質測、察記用

## 驗

- [ ] 渲擎正設（Cycles/EEVEE）
- [ ] 解與比合需
- [ ] 出格合用
- [ ] 色深與壓設驗
- [ ] 合節正連
- [ ] 出錄存可寫
- [ ] 檔名含幀號若需
- [ ] 渲通按需啟
- [ ] 鏡於景中正位
- [ ] 試渲畢無錯
- [ ] 出檔有正格與質

## 忌

1. **缺鏡**：景必有活鏡乃可渲
2. **未設出路**：渲前常設 `scene.render.filepath`
3. **取樣不足**：低取樣致 Cycles 渲噪
4. **錯色空**：察色管設為正顯
5. **檔格不合**：非諸格皆支諸色深
6. **記溢**：大解或複景或超 RAM
7. **GPU 出記**：減塊大或為大景換 CPU
8. **背景模出**：背景模必用 --render-output 旗或設 filepath
9. **幀號格**：用 #### 為自動幀補
10. **合禁**：啟 `scene.use_nodes` 以用合

## 參

- **[create-3d-scene](../create-3d-scene/SKILL.md)**：渲前需景設
- **[script-blender-automation](../script-blender-automation/SKILL.md)**：批渲自動模
- **[render-publication-graphic](../../visualization/render-publication-graphic/SKILL.md)**：發出需與格
