---
name: render-blender-output
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

# Render Blender Output

Configure render engines (Cycles, EEVEE), set output parameters, build compositing node graphs, and execute renders via Python API or command-line interface. Covers render settings optimization, file format selection, and post-processing workflows.

## When to Use

- Automating render execution for batch processing
- Configuring render quality and performance trade-offs
- Setting up compositing pipelines for post-processing
- Generating multiple output formats from single render
- Optimizing render settings for different hardware
- Creating command-line rendering workflows
- Producing final output for publication or presentation

## Inputs

| Input | Type | Description | Example |
|-------|------|-------------|---------|
| Scene file | .blend file | Blender scene to render | `scene.blend` |
| Render engine | String | Cycles, EEVEE, or Workbench | `CYCLES` |
| Quality settings | Parameters | Samples, resolution, denoising | 128 samples, 1920x1080, OptiX denoiser |
| Output format | String | PNG, EXR, JPEG, TIFF | `OPEN_EXR`, 16-bit, ZIP compression |
| Compositing setup | Node graph | Post-processing effects | Color grading, glare, vignette |
| Output path | File path | Render destination | `/renders/output_####.png` |

## Procedure

### 1. Configure Render Engine

Set render engine and basic parameters:

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

**Expected:** Render engine configured with appropriate quality settings
**On failure:** Check engine name spelling, verify GPU availability for GPU rendering

### 2. Set Resolution and Output Format

Configure output dimensions and file format:

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

**Expected:** Output format and resolution configured correctly
**On failure:** Check format names are valid, verify color depth compatible with format

### 3. Configure Compositing

Set up compositing node graph:

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

**Expected:** Compositing nodes configured with post-processing effects
**On failure:** Check node type names, verify inputs exist, ensure link connections valid

### 4. Set Output File Paths

Configure output file naming with frame numbers:

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

**Expected:** Output directory created, filepath configured with frame numbering
**On failure:** Check directory permissions, verify path syntax for OS

### 5. Configure View Layers and Passes

Set up render passes for compositing:

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

**Expected:** Render passes enabled for advanced compositing
**On failure:** Check if passes available for current engine, verify view layer name

### 6. Execute Render

Render via Python API or command line:

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

**Expected:** Render executes, output files written to specified location
**On failure:** Check scene setup, verify camera exists, ensure output directory writable

### 7. Batch Render Multiple Cameras

Render from multiple camera angles:

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

**Expected:** Renders generated for each camera in scene
**On failure:** Check cameras exist, verify each camera positioned correctly

### 8. Optimize Render Performance

Configure performance settings:

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

**Expected:** Render settings optimized for target hardware
**On failure:** Test with lower quality first, monitor memory usage

## Validation Checklist

- [ ] Render engine configured correctly (Cycles/EEVEE)
- [ ] Resolution and aspect ratio match requirements
- [ ] Output format appropriate for use case
- [ ] Color depth and compression settings verified
- [ ] Compositing nodes connected properly
- [ ] Output directory exists and is writable
- [ ] Filename includes frame numbering if needed
- [ ] Render passes enabled as required
- [ ] Camera positioned correctly in scene
- [ ] Test render completes without errors
- [ ] Output files have correct format and quality

## Common Pitfalls

1. **Missing camera**: Scene must have active camera set for rendering
2. **Output path not set**: Always specify `scene.render.filepath` before rendering
3. **Insufficient samples**: Low sample counts cause noise in Cycles renders
4. **Wrong color space**: Check color management settings for correct display
5. **File format incompatibility**: Not all formats support all color depths
6. **Memory overflow**: Large resolutions or complex scenes may exceed RAM
7. **GPU out of memory**: Reduce tile size or switch to CPU for large scenes
8. **Background mode output**: In background mode, must use --render-output flag or set filepath
9. **Frame number formatting**: Use #### for automatic frame padding
10. **Compositing disabled**: Enable `scene.use_nodes` to use compositing

## Related Skills

- **[create-3d-scene](../create-3d-scene/SKILL.md)**: Scene setup required before rendering
- **[script-blender-automation](../script-blender-automation/SKILL.md)**: Batch rendering automation patterns
- **[render-publication-graphic](../../visualization/render-publication-graphic/SKILL.md)**: Publication output requirements and formatting
