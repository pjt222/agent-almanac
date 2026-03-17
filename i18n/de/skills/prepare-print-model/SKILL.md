---
name: prepare-print-model
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  3D-Modelle fuer FDM/SLA-Druck exportieren und optimieren einschliesslich
  STL/3MF-Export, Netz-Integritaetspruefung, Wandstaerke-Kontrolle,
  Stuetzstruktur-Generierung und Slicing. Anwenden beim Export aus CAD- oder
  Modellierungssoftware fuer 3D-Druck, bei Pruefung von STL/3MF-Dateien auf
  Druckbarkeit vor dem Slicing, bei der Fehlersuche an Modellen die nicht
  korrekt geslicet werden, bei Optimierung der Teileorientierung fuer Festigkeit
  oder Oberflaechenqualitaet oder bei Formatkonvertierung unter Beibehaltung
  der Druckbarkeit.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: 3d-printing
  complexity: intermediate
  language: multi
  tags: 3d-printing, fdm, sla, slicing, mesh-repair, supports
---

# Druckmodell vorbereiten

3D-Modelle fuer die additive Fertigung exportieren und optimieren. Dieser Skill deckt den vollstaendigen Workflow vom CAD/Modellierungssoftware-Export ueber Netzreparatur, Druckbarkeitsanalyse, Stuetzstruktur-Generierung bis zur Slicer-Konfiguration ab. Stellt sicher dass Modelle mannigfaltig sind, ausreichende Wandstaerke aufweisen und korrekt fuer Festigkeit und Druckqualitaet orientiert sind.

## Wann verwenden

- Modelle aus CAD-Software (Fusion 360, SolidWorks, Onshape) oder 3D-Modellierungswerkzeugen (Blender, Maya) fuer 3D-Druck exportieren
- Bestehende STL/3MF-Dateien vor dem Senden an den Slicer auf Druckbarkeit pruefen
- Fehlersuche an Modellen die nicht korrekt geslicet oder gedruckt werden
- Teileorientierung fuer Festigkeit, Oberflaechenqualitaet oder minimalen Stuetzmaterialverbrauch optimieren
- Mechanische Teile mit spezifischen Festigkeits- oder Toleranzanforderungen vorbereiten
- Zwischen Modellformaten (STL, 3MF, OBJ) konvertieren unter Beibehaltung der Druckbarkeit

## Eingaben

- **source_model**: Pfad zur CAD-Datei oder 3D-Modelldatei (STEP, F3D, STL, OBJ, 3MF)
- **target_process**: Druckverfahren (`fdm`, `sla`, `sls`)
- **material**: Vorgesehenes Druckmaterial (z.B. `pla`, `petg`, `abs`, `standard-resin`)
- **functional_requirements**: Lastrichtung, Toleranzanforderungen, Oberflaechenqualitaetsansprueche
- **printer_specs**: Bauraum, Duesengroesse (FDM), Schichthoehe-Faehigkeiten
- **slicer_tool**: Ziel-Slicer (`cura`, `prusaslicer`, `orcaslicer`, `chitubox`)

## Vorgehensweise

### Schritt 1: Modell aus Quellsoftware exportieren

Das 3D-Modell in einem geeigneten Format fuer den Druck exportieren:

**Fuer FDM/SLA**:
```bash
# Bei Start aus CAD (Fusion 360, SolidWorks)
# Exportieren als: STL (binaer) oder 3MF
# Aufloesung: Hoch (Dreiecksanzahl ausreichend fuer Details)
# Einheiten: mm (Massstab ueberpruefen)

# Beispiel-Exporteinstellungen:
# STL: Binaerformat, Verfeinerung 0.1mm
# 3MF: Farb-/Materialdaten einschliessen bei Multimaterial-Drucker
```

**Erwartet:** Modelldatei mit geeigneter Aufloesung exportiert (0.1mm Sehnentoleranz fuer mechanische Teile, 0.05mm fuer organische Formen).

**Bei Fehler:** Pruefen ob Modell vollstaendig definiert ist (keine Konstruktionsgeometrie), keine fehlenden Flaechen, alle Komponenten sichtbar.

### Schritt 2: Netz-Integritaet verifizieren

Pruefen ob das Netz mannigfaltig und druckbar ist:

```bash
# Netzreparatur-Werkzeuge bei Bedarf installieren
# sudo apt install meshlab admesh

# STL-Datei auf Fehler pruefen
admesh --check model.stl

# Pruefen auf:
# - Nicht-mannigfaltige Kanten: 0 (jede Kante verbindet genau 2 Flaechen)
# - Loecher: 0
# - Umgekehrte/invertierte Normalen: 0
# - Degenerierte Facetten: 0
```

**Haeufige Probleme**:
- **Nicht-mannigfaltige Kanten**: Mehrere Flaechen teilen eine Kante oder Kante hat nur eine Flaeche
- **Loecher**: Luecken in der Netzoberflaeche
- **Invertierte Normalen**: Innen/Aussen des Modells vertauscht
- **Sich schneidende Flaechen**: Selbstschneidende Geometrie

**Erwartet:** Bericht zeigt 0 Fehler oder Fehler sind reparierbar.

**Bei Fehler:** Netz automatisch oder manuell reparieren:

```bash
# Automatische Reparatur mit admesh
admesh --write-binary-stl=model_fixed.stl \
       --exact \
       --nearby \
       --remove-unconnected \
       --fill-holes \
       --normal-directions \
       model.stl

# Oder meshlab GUI fuer manuelle Inspektion/Reparatur
meshlab model.stl
# Filters → Cleaning and Repairing → Remove Duplicate Vertices
# Filters → Cleaning and Repairing → Remove Duplicate Faces
# Filters → Normals → Re-Orient all faces coherently
```

Wenn automatische Reparatur fehlschlaegt, zur Quellsoftware zurueckkehren und Modellierungsfehler beheben (koinzidente Vertices, offene Kanten, ueberlappende Koerper).

### Schritt 3: Wandstaerke pruefen

Mindestwandstaerke fuer gewaehltes Verfahren verifizieren:

**Mindestwandstaerke nach Verfahren**:

| Verfahren | Min. Wand | Empfohlenes Min. | Strukturteile |
|-----------|-----------|-------------------|---------------|
| FDM (0.4mm Duese) | 0.8mm | 1.2mm | 2.4mm+ |
| FDM (0.6mm Duese) | 1.2mm | 1.8mm | 3.6mm+ |
| SLA (Standard) | 0.4mm | 0.8mm | 2.0mm+ |
| SLA (Engineering) | 0.6mm | 1.2mm | 2.5mm+ |
| SLS (Nylon) | 0.7mm | 1.0mm | 2.0mm+ |

```bash
# Wandstaerke visuell im Slicer pruefen:
# - Modell importieren
# - "Duennwaende"-Erkennung aktivieren
# - Mit 0 Fuellung slicen um Wandstruktur zu sehen

# Fuer praezise Messung CAD-Software verwenden:
# - Abstand zwischen parallelen Flaechen messen
# - In kritischen lasttragenden Bereichen pruefen
```

**Erwartet:** Alle Waende erfuellen Mindeststärke fuer gewaehltes Verfahren. Duenne Waende zur Pruefung markiert.

**Bei Fehler:** Zurueck zum CAD und Waende verstaerken, oder:
- Auf kleinere Duese wechseln (FDM)
- "Duennwaende erkennen"-Slicer-Einstellung verwenden
- Reduzierte Festigkeit fuer Prototypen akzeptieren

### Schritt 4: Druckorientierung bestimmen

Orientierung zur Optimierung von Festigkeit, Oberflaechenqualitaet und Stuetzstrukturverbrauch waehlen:

**Orientierungs-Entscheidungsmatrix**:

**Fuer Festigkeit**:
- Orientieren damit Schichtlinien senkrecht zur primaeren Lastrichtung verlaufen
- Beispiel: Halterung unter Zug nach oben drucken damit Schichten entlang der Lastachse gestapelt werden

**Fuer Oberflaechenqualitaet**:
- Groesste/sichtbarste Flaeche flach aufs Bett (minimale Treppenstufenbildung)
- Kritische Masse in X/Y-Ebene ausrichten (hoehere Praezision als Z)

**Fuer minimale Stuetzstrukturen**:
- Ueberhaenge >45 Grad (FDM) oder >30 Grad (SLA) minimieren
- Flache Flaechen auf das Bett legen wenn moeglich

**Lastrichtungsanalyse**:
```
Wenn Teil erfaehrt:
- Zuglast entlang Achse → mit Schichten senkrecht zur Achse drucken
- Drucklast → Schichten koennen parallel sein (weniger kritisch)
- Biegemoment → Schichten senkrecht zur neutralen Achse
- Scherung → Schichtgrenzflaechen parallel zur Scherrichtung vermeiden
```

**Erwartet:** Orientierung mit expliziter Begruendung fuer Festigkeits-, Oberflaechenqualitaets- oder Stuetzstruktur-Kompromisse gewaehlt.

**Bei Fehler:** Wenn keine Orientierung alle Anforderungen erfuellt, in folgender Reihenfolge priorisieren: funktionale Festigkeit, Massgenauigkeit, Oberflaechenqualitaet, Stuetzstruktur-Minimierung.

### Schritt 5: Stuetzstrukturen generieren

Automatische oder manuelle Stuetzstrukturen fuer Ueberhaenge konfigurieren:

**Stuetzwinkel-Schwellenwerte**:
- FDM: 45 Grad von der Vertikalen (etwas Brueckenbildung bis 60 Grad moeglich)
- SLA: 30 Grad von der Vertikalen (weniger Brueckenbildungsfaehigkeit)
- SLS: Keine Stuetzstrukturen noetig (Pulverbett-Stuetzung)

**Stuetzstrukturtypen**:

**Baumstrukturen** (FDM, empfohlen):
- Weniger Kontaktpunkte mit Modell
- Einfachere Entfernung
- Besser fuer organische Formen
- Konfiguration: Astwinkel 40-50 Grad, Astdichte mittel

**Lineare Stuetzstrukturen** (FDM, traditionell):
- Stabiler fuer grosse Ueberhaenge
- Mehr Kontaktpunkte (schwierigere Entfernung)
- Konfiguration: Muster Gitter, Dichte 15-20%, Grenzschichten 2-3

**Schwere Stuetzstrukturen** (SLA):
- Dickere Kontaktpunkte fuer schwere Teile
- Risiko von Markierungen auf der Oberflaeche
- Konfiguration: Kontaktdurchmesser 0.5-0.8mm, Dichte basierend auf Teilgewicht

**Grenzschichten**:
- 2-3 Grenzschichten zwischen Stuetzstruktur und Modell hinzufuegen
- Reduziert Oberflaechenmarkierungen
- Etwas einfachere Entfernung

```bash
# Im Slicer (PrusaSlicer Beispiel):
# Print Settings → Support material
# - Generate support material: Yes
# - Overhang threshold: 45° (FDM) / 30° (SLA)
# - Pattern: Rectilinear / Tree (auto)
# - Interface layers: 3
# - Interface pattern spacing: 0.2mm
```

**Erwartet:** Stuetzstrukturen fuer alle Ueberhaenge ueber Schwellenwertwinkel generiert, Vorschau zeigt keine schwebende Geometrie.

**Bei Fehler:** Wenn automatische Stuetzstrukturen unzureichend:
- Manuelle Stuetzverstaerker in kritischen Bereichen hinzufuegen
- Stuetzdichte nahe duennen Ueberhaengen erhoehen
- Modell teilen und in Abschnitten drucken wenn Stuetzstrukturen nicht realisierbar

### Schritt 6: Slicer-Profil konfigurieren

Verfahrensgerechte Parameter einstellen:

**FDM-Schichthoehen**:
- Entwurf: 0.28-0.32mm (schnell, sichtbare Schichten)
- Standard: 0.16-0.20mm (ausgewogene Qualitaet/Geschwindigkeit)
- Fein: 0.08-0.12mm (glatt, langsam)
- Regel: Schichthoehe = 25-75% des Duesendurchmessers

**SLA-Schichthoehen**:
- Standard: 0.05mm (ausgewogen)
- Fein: 0.025mm (Miniaturen, hohe Detailtreue)
- Schnell: 0.1mm (Prototypen)

**Schluesselparameter nach Verfahren**:

**FDM**:
```yaml
layer_height: 0.2mm
line_width: 0.4mm (= Duesendurchmesser)
perimeters: 3-4 (strukturell), 2 (kosmetisch)
top_bottom_layers: 5 (0.2mm Schichten = 1mm Vollmaterial)
infill_percentage: 20% (kosmetisch), 40-60% (funktional)
infill_pattern: gyroid (FDM), grid (einfach)
print_speed: 50mm/s Perimeter, 80mm/s Fuellung
temperature: materialspezifisch (siehe select-print-material Skill)
```

**SLA**:
```yaml
layer_height: 0.05mm
bottom_layers: 6-8 (starke Betthaftung)
exposure_time: materialspezifisch (2-8s pro Schicht)
bottom_exposure_time: 30-60s
lift_speed: 60-80mm/min
retract_speed: 150-180mm/min
```

**Erwartet:** Profil mit verfahrensgerechten Standardwerten konfiguriert, modifiziert fuer spezifische Material-/Modellanforderungen.

**Bei Fehler:** Wenn Parameter unsicher, mit dem Standard-"Standardqualitaet"-Profil des Slicers fuer gewaehltes Material beginnen, dann iterieren.

### Schritt 7: Schicht-fuer-Schicht-Vorschau pruefen

Gesliceten G-Code auf Probleme untersuchen:

```bash
# Im Slicer:
# - Modell slicen
# - Schichtvorschau-Schieberegler zur Inspektion jeder Schicht verwenden
# - Pruefen auf:
#   * Luecken in Perimetern (zeigt duenne Waende an)
#   * Schwebende Bereiche (fehlende Stuetzstrukturen)
#   * Uebermassige Fadenzieh-Pfade (Fahrwege reduzieren)
#   * Erste Schicht: korrekte Anpressung und Haftung
#   * Obere Schichten: ausreichende Vollmaterial-Fuellung
```

**Warnsignale in der Vorschau**:
- **Weisse Luecken in Vollbereichen**: Waende zu duenn fuer aktuelle Linienbreite
- **Fahrwege ueber grosse Distanzen**: Einzug erhoehen oder Z-Hop hinzufuegen
- **Erste Schicht presst nicht**: Z-Offset um 0.05mm nach unten anpassen
- **Spaerliche obere Schichten**: Obere Vollschichten auf 5+ erhoehen

**Erwartet:** Vorschau zeigt durchgaengige Perimeter, korrekte Fuellung, saubere Fahrwege und keine offensichtlichen Defekte.

**Bei Fehler:** Slicer-Einstellungen anpassen und neu slicen. Haeufige Korrekturen:
- Duennwand-Luecken: "Duennwaende erkennen" aktivieren oder Linienbreite reduzieren
- Schlechte Brueckenbildung: Brueckengeschwindigkeit auf 30mm/s reduzieren, Kuehlung erhoehen
- Fadenziehen: Einzugsdistanz +1mm erhoehen, Temperatur -5 Grad C senken

### Schritt 8: G-Code exportieren und verifizieren

Gesliceten G-Code mit beschreibendem Namen speichern:

```bash
# Namenskonvention:
# <teilname>_<material>_<schichthoehe>_<profil>.gcode
# Beispiel: halterung_petg_0.2mm_standard.gcode

# G-Code verifizieren:
grep "^;PRINT_TIME:" model.gcode  # Geschaetzte Zeit pruefen
grep "^;Filament used:" model.gcode  # Materialverbrauch pruefen
head -n 50 model.gcode | grep "^M104\|^M140"  # Temperaturen verifizieren

# Erwartete Erstschicht-Temperaturen:
# M140 S85  (Betttemperatur fuer PETG)
# M104 S245 (Hotend-Temperatur fuer PETG)
```

**Vor-Druck-Checkliste**:
- [ ] Bett nivelliert und sauber
- [ ] Korrektes Material geladen und trocken
- [ ] Temperaturen entsprechen Materialanforderungen
- [ ] Erstschicht-Z-Offset kalibriert
- [ ] Ausreichend Filament/Resin vorhanden
- [ ] Druckzeit akzeptabel fuer Ueberwachungsplan

**Erwartet:** G-Code-Datei mit eingebetteten Metadaten gespeichert, Temperaturen verifiziert, Druckzeit-/Materialschaetzung plausibel.

**Bei Fehler:** Wenn Druckzeit uebermassig (>12 Stunden), erwaegen:
- Schichthoehe erhoehen (0.2 auf 0.28mm spart ca. 30% Zeit)
- Perimeter reduzieren (4 auf 3)
- Fuellung reduzieren (40% auf 20% fuer nicht-strukturelle Teile)
- Modell verkleinern wenn Groesse nicht kritisch

## Validierung

- [ ] Modell aus Quellsoftware mit korrekten Einheiten (mm) und Massstab exportiert
- [ ] Netz-Integritaet verifiziert: mannigfaltig, keine Loecher, Normalen korrekt
- [ ] Wandstaerke erfuellt Minimum fuer gewaehltes Verfahren (>=0.8mm FDM, >=0.4mm SLA)
- [ ] Druckorientierung fuer Festigkeits-, Oberflaechenqualitaets- oder Stuetzstruktur-Kompromisse optimiert
- [ ] Stuetzstrukturen fuer alle Ueberhaenge >45 Grad (FDM) oder >30 Grad (SLA) generiert
- [ ] Slicer-Profil mit geeigneter Schichthoehe und Parametern konfiguriert
- [ ] Schicht-fuer-Schicht-Vorschau inspiziert, keine Luecken oder schwebende Bereiche
- [ ] G-Code mit verifizierten Temperaturen und plausibeler Druckzeit exportiert
- [ ] Vor-Druck-Checkliste abgeschlossen (Bett nivelliert, Material geladen usw.)

## Haeufige Stolperfallen

1. **Netzreparatur ueberspringen**: Nicht-mannigfaltige Netze koennen geslicet werden, drucken aber mit Luecken oder fehlerhaften Schichten nicht korrekt
2. **Wandstaerke ignorieren**: Duenne Waende (< Minimum) weisen Luecken auf und reduzieren die Festigkeit drastisch
3. **Falsche Orientierung fuer Festigkeit**: Zugteile mit Schichten parallel zur Lastrichtung drucken erzeugt eine schwache Delaminationsebene
4. **Unzureichende Stuetzstrukturen**: Unterschaetzung des Ueberhangwinkels fuehrt zu Durchhaengen, Fadenziehen oder vollstaendigem Versagen
5. **Erste-Schicht-Vernachlaessigung**: 90% der Druckfehler treten in der ersten Schicht auf — Z-Offset und Betthaftung sind entscheidend
6. **Temperatur aus dem Internet**: Jede Drucker/Material-Kombination ist einzigartig; immer mit Temperaturtuerme kalibrieren
7. **Uebermassige Details fuer Schichthoehe**: Feine Merkmale kleiner als 2x Schichthoehe werden nicht korrekt aufgeloest
8. **Slice nicht vorschauen**: Slicer koennen unerwartete Entscheidungen treffen (Duennwand-Luecken, seltsame Fuellung); vor dem Drucken immer vorschauen
9. **Material-Hygroskopie**: Feuchtes Filament (besonders Nylon, TPU, PETG) verursacht schlechte Schichthaftung, Fadenziehen und Sproedigkeit
10. **Uebervertrauen in Stuetzstrukturen**: Schwere Teile mit grossen Ueberhaengen koennen trotz Stuetzstrukturen durchhaengen — zuerst an kleineren Modellen testen

## Verwandte Skills

- **[select-print-material](../select-print-material/SKILL.md)**: Geeignetes Material basierend auf mechanischen, thermischen und chemischen Anforderungen waehlen
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**: Druckfehler diagnostizieren und beheben wenn vorbereitetes Modell trotzdem versagt
- **Modellieren mit Blender** (zukuenftiger Skill): Fuer Druck optimierte 3D-Modelle von Grund auf erstellen
- **3D-Drucker kalibrieren** (zukuenftiger Skill): E-Steps, Durchflussrate, Temperaturtuerme und Einzugstuning
