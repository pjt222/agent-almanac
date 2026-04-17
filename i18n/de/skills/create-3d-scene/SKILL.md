---
name: create-3d-scene
description: >
  Eine Blender-Szene programmatisch ueber Python (bpy) mit Objekten, Materialien,
  Beleuchtung, Kamera und Umgebungskonfiguration einrichten. Verwenden beim
  Erstellen reproduzierbarer 3D-Visualisierungsszenen, beim Automatisieren von
  Produkt- oder Architekturrendering-Setup, beim programmatischen Generieren
  mehrerer Szenenvariationen, beim Erstellen von Vorlagenszenen fuer Stapel-
  Rendering-Workflows oder beim Integrieren von 3D-Visualisierung in
  Datenpipelines.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: blender
  complexity: intermediate
  language: Python
  tags: blender, bpy, 3d, scene-setup, materials, lighting, camera
  locale: de
  source_locale: en
  source_commit: 4859067d
  translator: claude
  translation_date: "2026-03-17"
---

# 3D-Szene erstellen

Eine vollstaendige Blender-Szene programmatisch mit der Python-API (bpy) einrichten. Szenenhierarchie konfigurieren, Mesh-Objekte hinzufuegen, PBR-Materialien mit node-basierten Shadern erstellen, Beleuchtung und Kameras positionieren und Umgebungs-/Welteinstellungen einrichten.

## Wann verwenden

- Reproduzierbare 3D-Visualisierungsszenen von Grund auf erstellen
- Produktvisualisierung oder Architekturrendering-Setup automatisieren
- Mehrere Szenenvariationen programmatisch generieren
- Vorlagenszenen fuer Stapel-Rendering-Workflows erstellen
- Szenenlayouts vor manueller Verfeinerung prototypisieren
- 3D-Visualisierung in Datenpipelines oder Berichtssysteme integrieren

## Eingaben

| Eingabe | Typ | Beschreibung | Beispiel |
|---------|-----|--------------|----------|
| Szenenspezifikationen | Konfiguration | Objekte, Materialien, Beleuchtungsanforderungen | Produktabmessungen, Materialfarben, Beleuchtungssetup |
| Ausgabeanforderungen | Parameter | Aufloesung, Render-Engine, Qualitaetseinstellungen | 1920x1080, Cycles, 128 Samples |
| Asset-Pfade | Dateipfade | Externe Modelle, Texturen, HDRIs | `/path/to/hdri.exr`, `product_model.obj` |
| Kameraeinstellungen | Parameter | Position, Rotation, Brennweite, DOF | `location=(7,-7,5)`, `lens=50mm` |
| Umgebung | Konfiguration | Welt-Shader, Hintergrund, Umgebungseinstellungen | HDRI-Beleuchtung, Volltonfarbe, Verlauf |

## Vorgehensweise

### 1. Skriptstruktur einrichten

Ein Python-Skript mit korrekten Imports und Struktur erstellen:

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

**Erwartet:** Skriptstruktur mit clear_scene()- und main()-Funktionen
**Bei Fehler:** Python-Syntax ueberpruefen, bpy-Import in der Blender-Python-Umgebung testen

### 2. Mesh-Objekte hinzufuegen

Primitive oder importierte Mesh-Objekte erstellen:

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

**Erwartet:** Objekte erscheinen in der Szene mit korrekten Namen und Positionen
**Bei Fehler:** Operator-Syntax pruefen, Koordinaten verifizieren, sicherstellen, dass keine Namenskonflikte bestehen

### 3. Materialien mit Node-basierten Shadern erstellen

PBR-Materialien mit Shader-Nodes einrichten:

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

**Erwartet:** Materialien im Shader-Editor mit korrekten Node-Verbindungen sichtbar
**Bei Fehler:** Node-Typen auf Existenz pruefen, Link-Syntax verifizieren, sicherstellen, dass Farbwerte im Bereich [0,1] liegen

### 4. Beleuchtung einrichten

Lichter fuer die Szenenbeleuchtung konfigurieren:

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

**Erwartet:** Drei Lichter mit angemessenen Intensitaeten und Positionen
**Bei Fehler:** Energiewerte fuer Render-Engine anpassen (Cycles vs. EEVEE), Rotationsformat pruefen

### 5. Kamera positionieren

Kamera mit korrektem Bildausschnitt einrichten:

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

**Erwartet:** Kamera mit korrekter Brennweite und DOF-Einstellungen positioniert
**Bei Fehler:** Einfachere Rotationsmethode verwenden, wenn track_to fehlschlaegt, Objektiveinheiten verifizieren

### 6. Weltumgebung konfigurieren

Welt-Shader und Hintergrund einrichten:

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

**Erwartet:** Welt-Shader mit HDRI oder Volltonhintergrund konfiguriert
**Bei Fehler:** HDRI-Laden ueberspringen, wenn Datei fehlt, Background-Node allein mit Farbe verwenden

### 7. Render-Einstellungen konfigurieren

Grundlegende Renderparameter festlegen:

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

**Erwartet:** Render-Einstellungen konfiguriert, bereit zum Rendern
**Bei Fehler:** Engine-Namenorthografie pruefen, sicherstellen, dass Aufloesungswerte positive Ganzzahlen sind

### 8. Szenenhierarchie organisieren

Collections zur Organisation erstellen:

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

**Erwartet:** Objekte in benannten Collections fuer einfachere Verwaltung organisiert
**Bei Fehler:** Pruefen, ob Collection bereits existiert, bevor sie erstellt wird, verwaiste Objekte behandeln

## Validierung

- [ ] Skript laeuft ohne Fehler im Blender-Hintergrundmodus
- [ ] Alle erwarteten Objekte im Szenen-Outliner vorhanden
- [ ] Materialien zeigen korrekte Farben und Eigenschaften im Shader-Editor
- [ ] Kamera positioniert mit Objekten im Bildausschnitt
- [ ] Beleuchtung bietet ausreichende Ausleuchtung (Testrender)
- [ ] Weltumgebung laedt korrekt (HDRI oder Hintergrundfarbe)
- [ ] Render-Einstellungen angemessen fuer Ausgabeanforderungen konfiguriert
- [ ] Szene logisch in Collections organisiert
- [ ] Keine verwaisten Datenbloecke (Materialien, Meshes ohne Benutzer)
- [ ] Skript enthaelt clear_scene() fuer Reproduzierbarkeit

## Haeufige Stolperfallen

1. **Objektbenennungskonflikte**: Eindeutige Namen verwenden, vor dem Erstellen auf bestehende Objekte pruefen
2. **Falsches Farbformat**: RGB-Werte muessen Tupel (r, g, b, a) im Bereich [0,1] sein
3. **Fehlender Alpha-Kanal**: Beim Setzen von Farben Alpha einschliessen: `(r, g, b, 1.0)`
4. **Node-Verbindungsfehler**: Node-Typen auf erwartete Ein-/Ausgaenge vor dem Verlinken verifizieren
5. **Kamera nicht aktiv**: `bpy.context.scene.camera = camera_object` muss gesetzt werden
6. **Relative vs. absolute Pfade**: Absolute Pfade oder Path() fuer plattformuebergreifende Kompatibilitaet verwenden
7. **Einheitenverwirrung**: Blender verwendet standardmaessig Meter, Kameraobjektiv in Millimetern
8. **Rotationsformate**: `math.radians()` fuer Grad-zu-Radiant-Umrechnung verwenden
9. **Render-Engine-Unterschiede**: EEVEE und Cycles haben unterschiedliche Funktionen und Parameter
10. **Speicherlecks**: Verwaiste Datenbloecke bereinigen, um Speicheraufbau bei Stapeloperationen zu verhindern

## Verwandte Skills

- `script-blender-automation` — Fortgeschrittene Scripting-Muster fuer prozedurale Modellierung und Stapeloperationen
- `render-blender-output` — Rendering-Pipeline konfigurieren und Renders ausfuehren
- `create-2d-composition` — 2D-Grafik-Komposition mit aehnlichen Scripting-Ansaetzen
