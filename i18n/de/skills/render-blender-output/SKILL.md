---
name: render-blender-output
locale: de
source_locale: en
source_commit: 4859067d
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
|---------|-----|-------------|---------|
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
    """Cycles-Render-Engine konfigurieren."""
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'

    # Geraeteeinstellungen
    scene.cycles.device = 'GPU'  # oder 'CPU'

    # Sampling
    scene.cycles.samples = 128
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.adaptive_threshold = 0.01

    # Entrauschen
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = 'OPTIX'  # oder 'OPENIMAGEDENOISE', 'NLM'

    # Lichtpfade
    scene.cycles.max_bounces = 12
    scene.cycles.diffuse_bounces = 4
    scene.cycles.glossy_bounces = 4
    scene.cycles.transmission_bounces = 12
    scene.cycles.volume_bounces = 0

def setup_eevee_engine():
    """EEVEE-Render-Engine konfigurieren."""
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'

    # Sampling
    scene.eevee.taa_render_samples = 64

    # Effekte
    scene.eevee.use_bloom = True
    scene.eevee.bloom_threshold = 0.8
    scene.eevee.bloom_intensity = 0.1

    scene.eevee.use_gtao = True  # Umgebungsverdeckung
    scene.eevee.gtao_distance = 0.2

    scene.eevee.use_ssr = True  # Bildschirmraum-Reflexionen
    scene.eevee.ssr_quality = 0.5

    # Schatten
    scene.eevee.shadow_cube_size = '1024'
    scene.eevee.shadow_cascade_size = '1024'
```

**Erwartet:** Render-Engine mit geeigneten Qualitaetseinstellungen konfiguriert
**Bei Fehler:** Engine-Namensbuchstabierung pruefen, GPU-Verfuegbarkeit fuer GPU-Rendering verifizieren

### Schritt 2: Aufloesung und Ausgabeformat festlegen

Ausgabedimensionen und Dateiformat konfigurieren:

```python
def configure_output(width=1920, height=1080, file_format='PNG', color_depth='16'):
    """Ausgabeaufloesung und -format festlegen."""
    scene = bpy.context.scene

    # Aufloesung
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100

    # Seitenverhaeltnis
    scene.render.pixel_aspect_x = 1.0
    scene.render.pixel_aspect_y = 1.0

    # Dateiformat
    scene.render.image_settings.file_format = file_format

    if file_format == 'PNG':
        scene.render.image_settings.color_mode = 'RGBA'
        scene.render.image_settings.color_depth = color_depth  # '8' oder '16'
        scene.render.image_settings.compression = 15  # 0-100

    elif file_format == 'OPEN_EXR':
        scene.render.image_settings.color_mode = 'RGBA'
        scene.render.image_settings.color_depth = '32'  # oder '16'
        scene.render.image_settings.exr_codec = 'ZIP'  # oder 'DWAA', 'PIZ'

    elif file_format == 'JPEG':
        scene.render.image_settings.color_mode = 'RGB'
        scene.render.image_settings.quality = 90  # 0-100

    elif file_format == 'TIFF':
        scene.render.image_settings.color_mode = 'RGBA'
        scene.render.image_settings.color_depth = color_depth
        scene.render.image_settings.tiff_codec = 'DEFLATE'

    # Bildbereich (fuer Animationen)
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
    """Compositing-Knoten-Setup erstellen."""
    scene = bpy.context.scene
    scene.use_nodes = True

    tree = scene.node_tree
    nodes = tree.nodes
    links = tree.links

    # Standardknoten loeschen
    nodes.clear()

    # Render-Ebenen-Eingabe
    render_layers = nodes.new(type='CompositorNodeRLayers')
    render_layers.location = (-400, 300)

    # Farbkorrektur
    color_correct = nodes.new(type='CompositorNodeColorCorrection')
    color_correct.location = (0, 300)
    color_correct.master_saturation = 1.1
    color_correct.master_gain = 1.05

    # Glanz-Effekt
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

    # Mischknoten
    mix1 = nodes.new(type='CompositorNodeMixRGB')
    mix1.location = (400, 250)
    mix1.blend_type = 'ADD'
    mix1.inputs['Fac'].default_value = 0.3

    # Composite-Ausgabe
    composite = nodes.new(type='CompositorNodeComposite')
    composite.location = (600, 300)

    # Betrachter-Ausgabe (fuer Vorschau)
    viewer = nodes.new(type='CompositorNodeViewer')
    viewer.location = (600, 100)

    # Knoten verbinden
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
    """Ausgabedateipfad konfigurieren."""
    scene = bpy.context.scene

    # Ausgabeverzeichnis erstellen
    output_dir = Path(base_dir) / project_name / "renders"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Dateipfad festlegen
    if use_frame_number:
        # #### wird durch Bildnummer ersetzt (0001, 0002, usw.)
        filename = f"{project_name}_####"
    else:
        filename = project_name

    scene.render.filepath = str(output_dir / filename)
```

**Erwartet:** Ausgabeverzeichnis erstellt, Dateipfad mit Bildnummerierung konfiguriert
**Bei Fehler:** Verzeichnisberechtigungen pruefen, Pfadsyntax fuer Betriebssystem verifizieren

### Schritt 5: Ansichtsebenen und Paesse konfigurieren

Render-Paesse fuer Compositing einrichten:

```python
def configure_view_layers():
    """Render-Paesse aktivieren."""
    scene = bpy.context.scene
    view_layer = scene.view_layers['ViewLayer']

    # Paesse aktivieren
    view_layer.use_pass_combined = True
    view_layer.use_pass_z = True  # Tiefe
    view_layer.use_pass_mist = False
    view_layer.use_pass_normal = True
    view_layer.use_pass_vector = True  # Bewegungsvektoren
    view_layer.use_pass_ambient_occlusion = True

    # Cycles-spezifische Paesse
    cycles = view_layer.cycles
    cycles.use_pass_diffuse_direct = True
    cycles.use_pass_diffuse_indirect = True
    cycles.use_pass_glossy_direct = True
    cycles.use_pass_glossy_indirect = True
    cycles.use_pass_emission = True
    cycles.use_pass_environment = True

    # Cryptomatte-Paesse (fuer Postproduktion)
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
    """Aktuelles Bild rendern."""
    bpy.ops.render.render(write_still=True)

def render_animation():
    """Animations-Bildbereich rendern."""
    bpy.ops.render.render(animation=True)

def render_frame(frame_number):
    """Bestimmtes Bild rendern."""
    scene = bpy.context.scene
    scene.frame_set(frame_number)
    bpy.ops.render.render(write_still=True)

# Kommandozeilen-Rendering (vom Terminal ausfuehren)
# Einzelbild:
# blender scene.blend --background --render-frame 1

# Animation:
# blender scene.blend --background --render-anim

# Bestimmter Bildbereich:
# blender scene.blend --background --frame-start 10 --frame-end 20 --render-anim

# Ausgabepfad ueberschreiben:
# blender scene.blend --background --render-output /tmp/render_#### --render-anim

# Python-Skript verwenden:
# blender scene.blend --background --python render_script.py
```

**Erwartet:** Render wird ausgefuehrt, Ausgabedateien an angegebenen Ort geschrieben
**Bei Fehler:** Szenen-Setup pruefen, Kamera-Existenz verifizieren, Schreibberechtigung des Ausgabeverzeichnisses sicherstellen

### Schritt 7: Stapelrender aus mehreren Kameras

Aus mehreren Kamerawinkeln rendern:

```python
def render_all_cameras(output_dir):
    """Szene aus allen Kameras rendern."""
    scene = bpy.context.scene
    original_camera = scene.camera

    cameras = [obj for obj in bpy.data.objects if obj.type == 'CAMERA']

    for camera in cameras:
        # Aktive Kamera setzen
        scene.camera = camera

        # Ausgabepfad aktualisieren
        camera_name = camera.name.replace(' ', '_')
        scene.render.filepath = os.path.join(output_dir, f"{camera_name}_####")

        # Rendern
        bpy.ops.render.render(write_still=True)
        print(f"Gerendert von Kamera: {camera.name}")

    # Urspruengliche Kamera wiederherstellen
    scene.camera = original_camera
```

**Erwartet:** Renders fuer jede Kamera in der Szene erzeugt
**Bei Fehler:** Kamera-Existenz pruefen, korrekte Positionierung jeder Kamera verifizieren

### Schritt 8: Renderleistung optimieren

Leistungseinstellungen konfigurieren:

```python
def optimize_performance():
    """Rendereinstellungen fuer Geschwindigkeit optimieren."""
    scene = bpy.context.scene

    if scene.render.engine == 'CYCLES':
        # Kachelgroesse (GPU: groessere Kacheln, CPU: kleinere Kacheln)
        if scene.cycles.device == 'GPU':
            scene.render.tile_x = 256
            scene.render.tile_y = 256
        else:
            scene.render.tile_x = 32
            scene.render.tile_y = 32

        # Leistungseinstellungen
        scene.cycles.use_adaptive_sampling = True
        scene.render.use_persistent_data = True  # Szene im Speicher halten

        # Lichtpfad-Komplexitaet fuer Vorschau reduzieren
        scene.cycles.max_bounces = 4
        scene.cycles.diffuse_bounces = 2
        scene.cycles.glossy_bounces = 2

        # Progressives Verfeinern (fuer Viewport)
        scene.cycles.use_progressive_refine = True

    elif scene.render.engine == 'BLENDER_EEVEE':
        # Vereinfachungseinstellungen fuer Vorschau
        scene.render.use_simplify = True
        scene.render.simplify_subdivision = 2

        # Sampling reduzieren
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
