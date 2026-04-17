---
name: script-blender-automation
locale: de
source_locale: en
source_commit: 4859067d
translator: claude
translation_date: "2026-03-17"
description: >
  Blender-Python-Skripte fuer prozedurale Modellierung, Animation,
  Stapeloperationen und Add-on-Entwicklung mit fortgeschrittenen bpy-API-Mustern
  schreiben. Anwenden bei Automatisierung sich wiederholender Modellierungs-
  oder Animationsaufgaben, Generierung prozeduraler Geometrie aus Algorithmen
  oder Daten, Erstellung von Stapelrender-Pipelines mit Parametervariationen,
  Entwicklung benutzerdefinierter Operatoren oder Add-ons oder Integration
  von Blender mit externen Datenpipelines und APIs.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: blender
  complexity: advanced
  language: Python
  tags: blender, bpy, automation, procedural, animation, batch-processing, add-on
---

# Blender-Automatisierung skripten

Fortgeschrittenes Blender-Python-Skripting fuer prozedurale Modellierung, Keyframe-Animation, Stapeloperationen, Operator-Registrierung und Add-on-Entwicklung. Umfasst komplexe Geometrieerzeugung, automatisierte Workflows und Integration mit externen Datenquellen.

## Wann verwenden

- Sich wiederholende Modellierungs- oder Animationsaufgaben automatisieren
- Prozedurale Geometrie aus Algorithmen oder Daten generieren
- Stapelrender-Pipelines mit Parametervariationen erstellen
- Benutzerdefinierte Operatoren oder Add-ons fuer Workflow-Verbesserung entwickeln
- Blender mit externen Datenpipelines oder APIs integrieren
- Komplexe Animationen mit mathematischer Praezision skripten
- Wiederverwendbare Werkzeuge fuer Team-Workflows entwickeln

## Eingaben

| Eingabe | Typ | Beschreibung | Beispiel |
|---------|-----|-------------|---------|
| Automatisierungsanforderungen | Spezifikation | Aufgabenbeschreibung, Parameter, Einschraenkungen | 100 Variationen rendern, Pfad aus Daten animieren |
| Datenquellen | Dateien/APIs | Externe Daten fuer prozedurale Generierung | CSV-Koordinaten, JSON-Parameter, API-Antworten |
| Algorithmus-Definitionen | Code/Mathematik | Prozedurale Generierungslogik | Fraktalmuster, parametrische Kurven, L-Systeme |
| Operator-Spezifikationen | Anforderungen | Benutzerdefiniertes Werkzeugverhalten und UI | Werkzeugname, Eigenschaften, modale Interaktion |
| Animationsparameter | Keyframes/Daten | Timing, Easing, Constraints | Bildbereiche, Interpolationskurven |

## Vorgehensweise

### Schritt 1: Prozedurale Geometrieerzeugung

Netzgeometrie programmatisch mit BMesh erstellen:

```python
import bpy
import bmesh
import math

def create_parametric_surface(name, u_res=32, v_res=32):
    """Parametrische Oberflaeche mit mathematischer Funktion erzeugen."""
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()

    # Vertices mit parametrischen Gleichungen erstellen
    verts = []
    for i in range(u_res):
        for j in range(v_res):
            u = (i / (u_res - 1)) * 2 * math.pi
            v = (j / (v_res - 1)) * math.pi

            # Kugel-parametrische Gleichungen
            x = math.sin(v) * math.cos(u)
            y = math.sin(v) * math.sin(u)
            z = math.cos(v)

            vert = bm.verts.new((x, y, z))
            verts.append(vert)

    # Flaechen erstellen
    bm.verts.ensure_lookup_table()
    for i in range(u_res - 1):
        for j in range(v_res - 1):
            v1 = verts[i * v_res + j]
            v2 = verts[(i + 1) * v_res + j]
            v3 = verts[(i + 1) * v_res + (j + 1)]
            v4 = verts[i * v_res + (j + 1)]
            bm.faces.new([v1, v2, v3, v4])

    # In Netz schreiben
    bm.to_mesh(mesh)
    bm.free()

    return obj
```

**Erwartet:** Komplexe Geometrie aus mathematischen Funktionen generiert
**Bei Fehler:** BMesh-API-Aufrufe pruefen, Vertex-Indizierung verifizieren, Mannigfaltigkeit der Flaechen sicherstellen

### Schritt 2: Keyframe-Animations-Automatisierung

Animations-Keyframes und Treiber skripten:

```python
def animate_rotation(obj, start_frame=1, end_frame=250, axis='Z', rotations=2):
    """Objektrotation ueber die Zeit animieren."""
    # Anfangs-Keyframe setzen
    obj.rotation_euler[2] = 0  # Z-Achse
    obj.keyframe_insert(data_path="rotation_euler", index=2, frame=start_frame)

    # End-Keyframe setzen
    obj.rotation_euler[2] = rotations * 2 * math.pi
    obj.keyframe_insert(data_path="rotation_euler", index=2, frame=end_frame)

    # Interpolation setzen
    if obj.animation_data and obj.animation_data.action:
        for fcurve in obj.animation_data.action.fcurves:
            if 'rotation_euler' in fcurve.data_path:
                for keyframe in fcurve.keyframe_points:
                    keyframe.interpolation = 'LINEAR'

def animate_material_property(mat, property_path, values, frames):
    """Material-Knotenwerte animieren."""
    if not mat.node_tree:
        return

    # Beispiel: Emissionsstaerke animieren
    nodes = mat.node_tree.nodes
    emission = nodes.get('Emission')
    if emission:
        for frame, value in zip(frames, values):
            emission.inputs['Strength'].default_value = value
            emission.inputs['Strength'].keyframe_insert(
                data_path="default_value",
                frame=frame
            )

def create_driver(obj, property_path, expression):
    """Treiber fuer automatisierte Animation erstellen."""
    driver = obj.driver_add(property_path)
    driver.driver.type = 'SCRIPTED'
    driver.driver.expression = expression

    # Beispiel: Rotation an Bildnummer koppeln
    # expression = "frame / 10"
```

**Erwartet:** Keyframes eingefuegt, Animation wird korrekt wiedergegeben
**Bei Fehler:** Eigenschaftspfade pruefen, data_path-Syntax verifizieren, Keyframe-Faehigkeit der Objekte sicherstellen

### Schritt 3: Stapelverarbeitungsoperationen

Mehrere Objekte oder Dateien stapelweise verarbeiten:

```python
import os
from pathlib import Path

def batch_import_and_render(input_dir, output_dir, file_pattern="*.obj"):
    """Mehrere Dateien importieren und jeweils rendern."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    scene = bpy.context.scene

    for obj_file in input_path.glob(file_pattern):
        # Bestehende Objekte loeschen
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()

        # Modell importieren
        bpy.ops.import_scene.obj(filepath=str(obj_file))

        # Kamera und Beleuchtung einrichten (Setup-Funktionen wiederverwenden)
        setup_camera()
        setup_lighting()

        # Rendern
        output_file = output_path / f"{obj_file.stem}.png"
        scene.render.filepath = str(output_file)
        bpy.ops.render.render(write_still=True)

        print(f"Gerendert: {output_file}")

def batch_material_variation(base_object, colors, output_prefix):
    """Objekt mit mehreren Materialfarben rendern."""
    mat = base_object.data.materials[0]
    bsdf = mat.node_tree.nodes.get('Principled BSDF')

    if not bsdf:
        return

    for i, color in enumerate(colors):
        # Materialfarbe aktualisieren
        bsdf.inputs['Base Color'].default_value = color + (1.0,)

        # Rendern
        bpy.context.scene.render.filepath = f"{output_prefix}_{i:03d}.png"
        bpy.ops.render.render(write_still=True)
```

**Erwartet:** Mehrere Dateien verarbeitet, Renders fuer jede Variante erzeugt
**Bei Fehler:** Dateipfade auf Existenz pruefen, Import-Operatoren verifizieren, fehlende Materialien behandeln

### Schritt 4: Benutzerdefinierte Operator-Entwicklung

Benutzerdefinierte Operatoren fuer wiederverwendbare Werkzeuge erstellen:

```python
import bpy
from bpy.props import FloatProperty, IntProperty

class OBJECT_OT_generate_spiral(bpy.types.Operator):
    """Spiralkurve generieren"""
    bl_idname = "object.generate_spiral"
    bl_label = "Spirale generieren"
    bl_options = {'REGISTER', 'UNDO'}

    # Operator-Eigenschaften
    radius: FloatProperty(
        name="Radius",
        description="Spiralradius",
        default=2.0,
        min=0.1,
        max=10.0
    )

    turns: IntProperty(
        name="Windungen",
        description="Anzahl der Spiralwindungen",
        default=5,
        min=1,
        max=20
    )

    resolution: IntProperty(
        name="Aufloesung",
        description="Punkte pro Windung",
        default=32,
        min=8,
        max=128
    )

    def execute(self, context):
        # Kurve erstellen
        curve = bpy.data.curves.new('Spiral', 'CURVE')
        curve.dimensions = '3D'

        spline = curve.splines.new('NURBS')
        num_points = self.turns * self.resolution

        spline.points.add(num_points - 1)  # -1 weil ein Punkt existiert

        for i in range(num_points):
            t = i / self.resolution
            angle = t * 2 * math.pi

            x = self.radius * math.cos(angle)
            y = self.radius * math.sin(angle)
            z = t * 0.5

            spline.points[i].co = (x, y, z, 1.0)

        # Objekt erstellen
        obj = bpy.data.objects.new('Spiral', curve)
        context.collection.objects.link(obj)
        obj.select_set(True)
        context.view_layer.objects.active = obj

        self.report({'INFO'}, f"Spirale mit {num_points} Punkten generiert")
        return {'FINISHED'}

def register():
    bpy.utils.register_class(OBJECT_OT_generate_spiral)

def unregister():
    bpy.utils.unregister_class(OBJECT_OT_generate_spiral)

if __name__ == "__main__":
    register()
```

**Erwartet:** Operator erscheint in der Suche, wird mit korrekter Rueckgaengig-Unterstuetzung ausgefuehrt
**Bei Fehler:** bl_idname-Format pruefen (Kleinbuchstaben mit Unterstrichen), Eigenschaftstypen verifizieren

### Schritt 5: Modaler Operator fuer interaktive Werkzeuge

Interaktive modale Operatoren erstellen:

```python
class OBJECT_OT_modal_scale(bpy.types.Operator):
    """Interaktive Skalierung mit Maus"""
    bl_idname = "object.modal_scale"
    bl_label = "Modale Skalierung"
    bl_options = {'REGISTER', 'UNDO'}

    def __init__(self):
        self.initial_mouse_x = 0
        self.initial_scale = 1.0

    def modal(self, context, event):
        if event.type == 'MOUSEMOVE':
            # Skalierung basierend auf Mausbewegung berechnen
            delta = event.mouse_x - self.initial_mouse_x
            scale = self.initial_scale + (delta / 100.0)
            scale = max(0.1, scale)  # Mindestskalierung

            # Auf aktives Objekt anwenden
            context.active_object.scale = (scale, scale, scale)

        elif event.type == 'LEFTMOUSE':
            return {'FINISHED'}

        elif event.type in {'RIGHTMOUSE', 'ESC'}:
            # Abbrechen - urspruengliche Skalierung wiederherstellen
            context.active_object.scale = (
                self.initial_scale,
                self.initial_scale,
                self.initial_scale
            )
            return {'CANCELLED'}

        return {'RUNNING_MODAL'}

    def invoke(self, context, event):
        if context.active_object:
            self.initial_mouse_x = event.mouse_x
            self.initial_scale = context.active_object.scale[0]

            context.window_manager.modal_handler_add(self)
            return {'RUNNING_MODAL'}
        else:
            self.report({'WARNING'}, "Kein aktives Objekt")
            return {'CANCELLED'}
```

**Erwartet:** Interaktiver Operator reagiert auf Maus, Linksklick bestaetigt, ESC bricht ab
**Bei Fehler:** Event-Typen pruefen, sicherstellen dass Modal-Handler hinzugefuegt wird, fehlendes aktives Objekt behandeln

### Schritt 6: Add-on-Paketierung

Code als installierbares Add-on strukturieren:

```python
bl_info = {
    "name": "Benutzerdefinierte Werkzeuge",
    "author": "Ihr Name",
    "version": (1, 0, 0),
    "blender": (3, 0, 0),
    "location": "View3D > Add > Mesh",
    "description": "Sammlung benutzerdefinierter Modellierungswerkzeuge",
    "category": "Add Mesh",
}

import bpy

# Operator-Klassen importieren
from .operators import OBJECT_OT_generate_spiral

classes = (
    OBJECT_OT_generate_spiral,
    # Weitere Klassen hinzufuegen
)

def menu_func(self, context):
    """Zum Menue hinzufuegen."""
    self.layout.operator(OBJECT_OT_generate_spiral.bl_idname)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.VIEW3D_MT_mesh_add.append(menu_func)

def unregister():
    bpy.types.VIEW3D_MT_mesh_add.remove(menu_func)
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)

if __name__ == "__main__":
    register()
```

**Erwartet:** Add-on installiert sich ueber Einstellungen, Operatoren erscheinen in Menues
**Bei Fehler:** bl_info-Format pruefen, Blender-Versionsanforderung verifizieren, sicherstellen dass alle Klassen aufgelistet sind

### Schritt 7: Datengetriebene prozedurale Generierung

Geometrie aus externen Daten erzeugen:

```python
import csv
import json

def create_from_csv(filepath):
    """Objekte aus CSV-Daten generieren."""
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)

        for row in reader:
            # Daten parsen
            name = row['name']
            x, y, z = float(row['x']), float(row['y']), float(row['z'])
            scale = float(row.get('scale', 1.0))

            # Objekt erstellen
            bpy.ops.mesh.primitive_uv_sphere_add(location=(x, y, z))
            obj = bpy.context.active_object
            obj.name = name
            obj.scale = (scale, scale, scale)

def create_from_json(filepath):
    """Szene aus JSON-Konfiguration generieren."""
    with open(filepath, 'r') as f:
        config = json.load(f)

    # Objekte verarbeiten
    for obj_config in config.get('objects', []):
        obj_type = obj_config['type']
        location = obj_config['location']

        if obj_type == 'cube':
            bpy.ops.mesh.primitive_cube_add(location=location)
        elif obj_type == 'sphere':
            bpy.ops.mesh.primitive_uv_sphere_add(location=location)

        obj = bpy.context.active_object
        obj.name = obj_config.get('name', 'Object')

        # Material anwenden falls angegeben
        if 'material' in obj_config:
            mat_name = obj_config['material']
            mat = bpy.data.materials.get(mat_name)
            if mat:
                obj.data.materials.append(mat)
```

**Erwartet:** Objekte basierend auf externen Datendateien erstellt
**Bei Fehler:** Dateiformat validieren, fehlende Felder behandeln, Standardwerte bereitstellen

## Validierung

- [ ] Skripte laufen fehlerfrei in der Blender-Python-Umgebung
- [ ] Prozedurale Geometrie wird wie erwartet generiert
- [ ] Animations-Keyframes an korrekten Bildern eingefuegt
- [ ] Stapeloperationen verarbeiten alle Dateien erfolgreich
- [ ] Benutzerdefinierte Operatoren erscheinen in der Suche und werden korrekt ausgefuehrt
- [ ] Modale Operatoren reagieren auf Maus-/Tastaturereignisse
- [ ] Add-ons installieren und deinstallieren sauber
- [ ] Externe Datendateien werden korrekt geparst
- [ ] Fehlerbehandlung deckt Grenzfaelle ab
- [ ] Code folgt PEP-8-Stilrichtlinien

## Haeufige Stolperfallen

1. **Zirkulaere Imports in Add-ons**: Relative Imports verwenden, Module sorgfaeltig strukturieren
2. **Operator-Benennung**: bl_idname muss kleingeschrieben sein mit einfachem Unterstrich (kategorie.name)
3. **Eigenschaftstypen**: Korrekte bpy.props-Typen verwenden (FloatProperty, IntProperty usw.)
4. **Kontextzugriff**: Nicht alle Operatoren funktionieren in allen Kontexten (Viewport vs Render)
5. **BMesh-Bereinigung**: Immer `bm.free()` nach `bm.to_mesh()` aufrufen um Speicherlecks zu vermeiden
6. **Animations-Keyframe-Timing**: Bildnummern beginnen bei 1, nicht bei 0
7. **Treiber-Ausdrucksfehler**: Ausdruecke validieren, sicheren Namensraum verwenden
8. **Modaler Operator blockiert**: Nicht in modal() blockieren, nicht-blockierende Operationen verwenden
9. **Add-on-Installationspfade**: In Blenders scripts/addons-Verzeichnis platzieren
10. **Versionskompatibilitaet**: API aendert sich zwischen Blender-Versionen, Anforderungen dokumentieren

## Verwandte Skills

- **[create-3d-scene](../create-3d-scene/SKILL.md)**: Grundlegendes Szenen-Setup und Objekterstellung
- **[render-blender-output](../render-blender-output/SKILL.md)**: Rendering-Workflows fuer automatisierte Ausgabe
- **[create-r-package](../../r-packages/create-r-package/SKILL.md)**: Aehnliche Paketierungsmuster fuer Code-Verteilung
