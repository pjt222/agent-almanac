---
name: render-blender-output
locale: de
source_locale: en
source_commit: 75ded7a1
fence_basis_commit: 75ded7a1
translator: claude
translation_date: "2026-03-17"
description: >
  Rendereinstellungen, Compositing-Knoten, Ausgabeformate konfigurieren und
  Renders ueber Cycles- oder EEVEE-Engines mit Python-API oder
  Kommandozeilenschnittstelle ausfuehren. Anwenden bei automatisierter
  Render-Ausfuehrung fuer Stapelverarbeitung, Konfiguration von Qualitaets-
  und Leistungskompromissen, Einrichtung von Compositing-Pipelines fuer
  Nachbearbeitung, Erzeugung mehrerer Ausgabeformate aus einem einzelnen
  Render oder Produktion der Endausgabe fuer Veroeffentlichung oder
  Praesentation.
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

# Blender-Ausgabe rendern

Render-Engines (Cycles, EEVEE) konfigurieren, Ausgabeparameter festlegen, Compositing-Knotengraphen erstellen und Renders ueber Python-API oder Kommandozeilenschnittstelle ausfuehren. Umfasst Rendereinstellungs-Optimierung, Dateiformatwahl und Nachbearbeitungs-Workflows.

## Wann verwenden

- Render-Ausfuehrung fuer Stapelverarbeitung automatisieren
- Renderqualitaet und Leistungskompromisse konfigurieren
- Compositing-Pipelines fuer Nachbearbeitung einrichten
- Mehrere Ausgabeformate aus einem einzelnen Render erzeugen
- Rendereinstellungen fuer verschiedene Hardware optimieren
- Kommandozeilen-Rendering-Workflows erstellen
- Endausgabe fuer Veroeffentlichung oder Praesentation produzieren

## Eingaben

| Eingabe | Typ | Beschreibung | Beispiel |
|---|---|---|---|
| Szenendatei | .blend-Datei | Zu rendernde Blender-Szene | `scene.blend` |
| Render-Engine | String | Cycles, EEVEE oder Workbench | `CYCLES` |
| Qualitaetseinstellungen | Parameter | Samples, Aufloesung, Entrauschen | 128 Samples, 1920x1080, OptiX-Entrauscher |
| Ausgabeformat | String | PNG, EXR, JPEG, TIFF | `OPEN_EXR`, 16-Bit, ZIP-Kompression |
| Compositing-Setup | Knotengraph | Nachbearbeitungseffekte | Farbkorrektur, Glanz, Vignette |
| Ausgabepfad | Dateipfad | Renderziel | `/renders/output_####.png` |

## Vorgehensweise

### Schritt 1: Render-Engine konfigurieren

Render-Engine und Grundparameter festlegen:

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

**Erwartet:** Render-Engine mit geeigneten Qualitaetseinstellungen konfiguriert
**Bei Fehler:** Engine-Namensbuchstabierung pruefen, GPU-Verfuegbarkeit fuer GPU-Rendering verifizieren

### Schritt 2: Aufloesung und Ausgabeformat festlegen

Ausgabedimensionen und Dateiformat konfigurieren:

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

**Erwartet:** Ausgabeformat und Aufloesung korrekt konfiguriert
**Bei Fehler:** Formatnamen auf Gueltigkeit pruefen, Farbtiefe-Kompatibilitaet mit Format verifizieren

### Schritt 3: Compositing konfigurieren

Compositing-Knotengraph einrichten:

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

**Erwartet:** Compositing-Knoten mit Nachbearbeitungseffekten konfiguriert
**Bei Fehler:** Knotentyp-Namen pruefen, Eingaenge verifizieren, Verbindungsgueltigkeit sicherstellen

### Schritt 4: Ausgabedateipfade festlegen

Ausgabedatei-Benennung mit Bildnummern konfigurieren:

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

**Erwartet:** Ausgabeverzeichnis erstellt, Dateipfad mit Bildnummerierung konfiguriert
**Bei Fehler:** Verzeichnisberechtigungen pruefen, Pfadsyntax fuer Betriebssystem verifizieren

### Schritt 5: Ansichtsebenen und Paesse konfigurieren

Render-Paesse fuer Compositing einrichten:

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

**Erwartet:** Render-Paesse fuer erweitertes Compositing aktiviert
**Bei Fehler:** Verfuegbarkeit der Paesse fuer aktuelle Engine pruefen, Ansichtsebenen-Namen verifizieren

### Schritt 6: Render ausfuehren

Ueber Python-API oder Kommandozeile rendern:

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

**Erwartet:** Render wird ausgefuehrt, Ausgabedateien an angegebenen Ort geschrieben
**Bei Fehler:** Szenen-Setup pruefen, Kamera-Existenz verifizieren, Schreibberechtigung des Ausgabeverzeichnisses sicherstellen

### Schritt 7: Stapelrender aus mehreren Kameras

Aus mehreren Kamerawinkeln rendern:

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

**Erwartet:** Renders fuer jede Kamera in der Szene erzeugt
**Bei Fehler:** Kamera-Existenz pruefen, korrekte Positionierung jeder Kamera verifizieren

### Schritt 8: Renderleistung optimieren

Leistungseinstellungen konfigurieren:

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

**Erwartet:** Rendereinstellungen fuer Zielhardware optimiert
**Bei Fehler:** Zuerst mit niedrigerer Qualitaet testen, Speicherverbrauch ueberwachen

## Validierung

- [ ] Render-Engine korrekt konfiguriert (Cycles/EEVEE)
- [ ] Aufloesung und Seitenverhaeltnis entsprechen Anforderungen
- [ ] Ausgabeformat fuer Anwendungsfall geeignet
- [ ] Farbtiefe und Kompressionseinstellungen verifiziert
- [ ] Compositing-Knoten korrekt verbunden
- [ ] Ausgabeverzeichnis existiert und ist beschreibbar
- [ ] Dateiname enthaelt Bildnummerierung falls noetig
- [ ] Render-Paesse wie erforderlich aktiviert
- [ ] Kamera korrekt in Szene positioniert
- [ ] Testrender wird fehlerfrei abgeschlossen
- [ ] Ausgabedateien haben korrektes Format und Qualitaet

## Haeufige Stolperfallen

1. **Fehlende Kamera**: Szene muss aktive Kamera fuer Rendering gesetzt haben
2. **Ausgabepfad nicht gesetzt**: Immer `scene.render.filepath` vor dem Rendern angeben
3. **Unzureichende Samples**: Niedrige Sample-Anzahlen verursachen Rauschen in Cycles-Renders
4. **Falscher Farbraum**: Farbmanagement-Einstellungen fuer korrekte Anzeige pruefen
5. **Dateiformat-Inkompatibilitaet**: Nicht alle Formate unterstuetzen alle Farbtiefen
6. **Speicherueberlauf**: Grosse Aufloesungen oder komplexe Szenen koennen RAM ueberschreiten
7. **GPU-Speichermangel**: Kachelgroesse reduzieren oder fuer grosse Szenen auf CPU wechseln
8. **Hintergrundmodus-Ausgabe**: Im Hintergrundmodus muss --render-output Flag oder filepath gesetzt werden
9. **Bildnummer-Formatierung**: #### fuer automatische Bildnummer-Auffuellung verwenden
10. **Compositing deaktiviert**: `scene.use_nodes` aktivieren um Compositing zu verwenden

## Verwandte Skills

- **[create-3d-scene](../create-3d-scene/SKILL.md)**: Szenen-Setup vor dem Rendern erforderlich
- **[script-blender-automation](../script-blender-automation/SKILL.md)**: Stapelrender-Automatisierungsmuster
- **[render-publication-graphic](../../visualization/render-publication-graphic/SKILL.md)**: Veroeffentlichungs-Ausgabeanforderungen und Formatierung
