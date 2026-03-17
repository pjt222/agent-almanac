---
name: render-publication-graphic
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Publikationsfertige 2D-Grafiken mit korrekter DPI, Farbprofilen, Typografie
  und Exportformaten fuer Print und digitale Medien erzeugen. Anwenden bei
  Vorbereitung von Abbildungen fuer akademische Zeitschrifteneinreichung,
  Erstellung von Grafiken fuer Printveroeffentlichungen, Sicherstellung dass
  Grafiken technische Verlags-Spezifikationen erfuellen, Export von
  Visualisierungen fuer Web mit korrekter Optimierung oder Erstellung von
  Multiformat-Exporten aus einer einzelnen Quelle.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: intermediate
  language: multi
  tags: publication, dpi, color-profile, typography, export, print, digital
---

# Publikationsgrafik rendern

Publikationsfertige Grafiken erzeugen die technische Anforderungen fuer akademische Zeitschriften, Buecher, Praesentationen und Web-Veroeffentlichung erfuellen. Umfasst DPI-Anforderungen, Farbraum-Management, Typografie-Best-Practices, Dateiformatwahl und Metadaten-Einbettung.

## Wann verwenden

- Abbildungen fuer akademische Zeitschrifteneinreichung vorbereiten
- Grafiken fuer Printveroeffentlichungen (Buecher, Zeitschriften) erstellen
- Hochwertige Assets fuer Praesentationen erzeugen
- Visualisierungen fuer Web-Veroeffentlichung mit korrekter Optimierung exportieren
- Sicherstellen dass Grafiken technische Verlags-Spezifikationen erfuellen
- Grafiken mit korrekten Metadaten archivieren
- Multiformat-Exporte aus einer einzelnen Quelle erstellen

## Eingaben

| Eingabe | Typ | Beschreibung | Beispiel |
|---------|-----|-------------|---------|
| Quellgrafik | Datei/Daten | Originalvisualisierung oder Kunstwerk | SVG, R ggplot, Python matplotlib, Blender-Render |
| Publikationsziel | Spezifikation | Zeitschrift, Web, Print, Praesentation | Nature-Zeitschrift, IEEE-Paper, Website |
| Technische Anforderungen | Parameter | DPI, Abmessungen, Farbraum, Format | 300 DPI, 180mm Breite, CMYK, TIFF |
| Stilhandbuch | Dokument | Verlags-Typografie- und Formatierungsregeln | Schriftfamilien, Linienbreiten, Farbpalette |
| Metadaten | Informationen | Titel, Autor, Datum, Copyright, Beschreibung | Abbildungsunterschrift, Lizenzinfo |

## Vorgehensweise

### Schritt 1: Ausgabeanforderungen bestimmen

Technische Spezifikationen fuer die Zielpublikation identifizieren:

```yaml
# Gaengige Publikationsanforderungen

academic_journal:
  dpi: 300-600
  format: TIFF, EPS, PDF
  color_space: RGB oder CMYK (Richtlinien pruefen)
  max_width: 180mm (einspaltig) oder 390mm (zweispaltig)
  fonts: Einbetten oder als Pfade konvertieren
  resolution_minimums:
    line_art: 1000 DPI
    halftone: 300 DPI
    combination: 600 DPI

web_publication:
  dpi: 72-96 (Retina: 144-192)
  format: PNG, WebP, SVG
  color_space: sRGB
  max_file_size: 200KB-500KB
  optimization: Komprimieren, progressives Laden

presentation:
  dpi: 96-150
  format: PNG, PDF, SVG
  color_space: RGB
  dimensions: 16:9 oder 4:3 Seitenverhaeltnis
  contrast: Hoher Kontrast fuer Projektoren

print_book:
  dpi: 300-600
  format: TIFF, PDF/X
  color_space: CMYK
  bleed: 3-5mm ueber Beschnitt hinaus
  fonts: Eingebettet
```

**Erwartet:** Klares Verstaendnis der Zielanforderungen
**Bei Fehler:** Verlag fuer spezifische Richtlinien kontaktieren, konservative Standardwerte verwenden

### Schritt 2: Korrekte DPI fuer Rastergrafiken festlegen

Aufloesung basierend auf Ausgabemedium konfigurieren:

```python
from PIL import Image

def set_dpi_pillow(image_path, output_path, target_dpi=300):
    """DPI-Metadaten fuer PNG/TIFF setzen."""
    img = Image.open(image_path)
    img.save(output_path, dpi=(target_dpi, target_dpi))
    print(f"Gespeichert mit {target_dpi} DPI: {output_path}")

def calculate_dimensions(width_mm, height_mm, dpi=300):
    """Pixelabmessungen aus physischer Groesse berechnen."""
    # mm in Zoll umrechnen
    width_inches = width_mm / 25.4
    height_inches = height_mm / 25.4

    # Pixel berechnen
    width_px = int(width_inches * dpi)
    height_px = int(height_inches * dpi)

    return width_px, height_px

# Beispiel: 180mm breite Abbildung bei 300 DPI
width, height = calculate_dimensions(180, 120, dpi=300)
print(f"Erforderliche Aufloesung: {width}x{height} Pixel")
# Ausgabe: Erforderliche Aufloesung: 2126x1417 Pixel
```

```r
# R ggplot2-Export mit korrekter DPI
library(ggplot2)

# Plot erstellen
p <- ggplot(mtcars, aes(x = wt, y = mpg)) +
  geom_point() +
  theme_minimal(base_size = 12)

# Fuer Publikation speichern (300 DPI)
ggsave(
  filename = "figure1.png",
  plot = p,
  width = 180,
  height = 120,
  units = "mm",
  dpi = 300
)

# Als Vektorgrafik fuer Flexibilitaet speichern
ggsave(
  filename = "figure1.pdf",
  plot = p,
  width = 180,
  height = 120,
  units = "mm",
  device = cairo_pdf  # Bessere Textdarstellung
)
```

**Erwartet:** Grafiken mit korrekter Aufloesung fuer Druckqualitaet gerendert
**Bei Fehler:** Korrekte Speicherung der DPI-Metadaten verifizieren, angemessene Dateigroesse pruefen

### Schritt 3: Farbraum konfigurieren

Geeignetes Farbprofil festlegen:

```python
from PIL import Image, ImageCms

def convert_to_cmyk(rgb_image_path, cmyk_output_path):
    """RGB zu CMYK fuer Druck konvertieren."""
    img = Image.open(rgb_image_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    cmyk_img = img.convert('CMYK')
    cmyk_img.save(cmyk_output_path, format='TIFF', compression='tiff_lzw')
    print(f"Zu CMYK konvertiert: {cmyk_output_path}")

def apply_srgb_profile(image_path, output_path):
    """sRGB-Profil fuer Web anwenden."""
    img = Image.open(image_path)
    srgb_profile = ImageCms.createProfile('sRGB')
    img_srgb = ImageCms.profileToProfile(
        img, srgb_profile, srgb_profile,
        renderingIntent=ImageCms.Intent.PERCEPTUAL
    )
    img_srgb.save(output_path)
```

```bash
# ImageMagick fuer Farbraum-Konvertierung
convert input.png -colorspace sRGB output_srgb.png
convert input.png -colorspace CMYK output_cmyk.tiff

# Farbprofil pruefen
identify -verbose image.png | grep -i colorspace
```

**Erwartet:** Farbraum entspricht Publikationsanforderungen
**Bei Fehler:** Eingebettetes Farbprofil verifizieren, Druckvorschau testen

### Schritt 4: Typografie konfigurieren

Sicherstellen dass Text lesbar und korrekt formatiert ist:

```python
from PIL import ImageFont

def get_publication_fonts():
    """Fuer Publikation geeignete Schriften laden."""
    fonts = {
        'serif': 'Times New Roman',
        'sans': 'Arial',
        'mono': 'Courier New'
    }
    try:
        # Mit korrekter Groesse fuer DPI laden
        # Bei 300 DPI: 12pt = 12 * 300/72 = 50 Pixel
        base_size_300dpi = 50
        font_regular = ImageFont.truetype(f"{fonts['sans']}.ttf", base_size_300dpi)
        font_bold = ImageFont.truetype(f"{fonts['sans']} Bold.ttf", base_size_300dpi)
        return {'regular': font_regular, 'bold': font_bold}
    except:
        return {'regular': ImageFont.load_default(), 'bold': ImageFont.load_default()}

# Typografie-Richtlinien
typography_specs = {
    'minimum_font_size': '8pt',  # Lesbar beim Drucken
    'line_width_min': 0.5,  # Punkte, fuer Druckklarheit
    'panel_labels': {
        'font': 'Arial Bold',
        'size': '12pt',
        'position': 'oben-links',
        'style': 'A, B, C'  # Oder (a), (b), (c)
    },
    'axis_labels': {'font': 'Arial', 'size': '10pt'},
    'legend': {'font': 'Arial', 'size': '9pt', 'position': 'ausserhalb Plotbereich'}
}
```

```r
# R publikationsqualitaet Typografie
library(ggplot2)

p <- ggplot(mtcars, aes(x = wt, y = mpg)) +
  geom_point(size = 2) +
  labs(
    title = "Kraftstoffeffizienz vs. Gewicht",
    x = "Gewicht (1000 lbs)",
    y = "Meilen pro Gallone"
  ) +
  theme_bw(base_size = 12, base_family = "Arial") +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    axis.title = element_text(size = 12),
    axis.text = element_text(size = 10),
    legend.text = element_text(size = 10),
    panel.grid.minor = element_blank(),
    text = element_text(color = "black")  # Schwarz fuer Druck
  )
```

**Erwartet:** Text bei Publikationsgroesse lesbar, Schriften korrekt eingebettet
**Bei Fehler:** Schriftgroessen erhoehen, Schriftlizenzen pruefen, Text in Pfade konvertieren

### Schritt 5: Geeignetes Dateiformat waehlen

Format basierend auf Anwendungsfall waehlen:

```python
def export_multi_format(source_path, output_base, formats=['png', 'pdf', 'tiff']):
    """Grafik in mehreren Formaten exportieren."""
    from PIL import Image
    import cairosvg
    import os

    base, ext = os.path.splitext(output_base)

    if ext.lower() in ['.svg']:
        for fmt in formats:
            output = f"{base}.{fmt}"
            if fmt == 'png':
                cairosvg.svg2png(url=source_path, write_to=output,
                    output_width=2126, output_height=1417)
            elif fmt == 'pdf':
                cairosvg.svg2pdf(url=source_path, write_to=output)
            elif fmt == 'tiff':
                temp_png = f"{base}_temp.png"
                cairosvg.svg2png(url=source_path, write_to=temp_png)
                img = Image.open(temp_png)
                img.save(output, format='TIFF', compression='tiff_lzw')
                os.remove(temp_png)
    else:
        img = Image.open(source_path)
        for fmt in formats:
            output = f"{base}.{fmt}"
            if fmt == 'png':
                img.save(output, format='PNG', dpi=(300, 300), optimize=True)
            elif fmt == 'tiff':
                img.save(output, format='TIFF', compression='tiff_lzw', dpi=(300, 300))
            elif fmt == 'pdf':
                img.save(output, format='PDF', resolution=300.0)

    print(f"In Formaten exportiert: {', '.join(formats)}")
```

**Erwartet:** Geeignetes Format fuer Publikationskanal
**Bei Fehler:** Verlags-Anforderungen pruefen, mehrere Formate bereitstellen

### Schritt 6: Fuer Web optimieren

Web-optimierte Versionen erstellen:

```python
def optimize_for_web(input_path, output_path, max_width=1200, quality=85):
    """Bild fuer Web-Veroeffentlichung optimieren."""
    from PIL import Image

    img = Image.open(input_path)

    # Bei Uebergroesse verkleinern
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.LANCZOS)

    # Bei Bedarf zu RGB konvertieren
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
        img = background

    # Optimiert speichern
    img.save(output_path, format='JPEG', quality=quality, optimize=True, progressive=True)

    import os
    file_size_kb = os.path.getsize(output_path) / 1024
    print(f"Optimiert: {file_size_kb:.1f} KB")
```

**Erwartet:** Web-optimierte Bilder unter 500KB, responsive Groessen erzeugt
**Bei Fehler:** Qualitaet reduzieren, weiter verkleinern, WebP-Format in Betracht ziehen

### Schritt 7: Metadaten einbetten

Beschreibende Metadaten fuer Archivierung hinzufuegen:

```python
from PIL import Image
from PIL.PngImagePlugin import PngInfo

def embed_metadata(image_path, output_path, metadata):
    """Metadaten in PNG einbetten."""
    img = Image.open(image_path)
    png_info = PngInfo()
    for key, value in metadata.items():
        png_info.add_text(key, str(value))
    img.save(output_path, format='PNG', pnginfo=png_info)

# Beispiel-Metadaten
metadata = {
    'Title': 'Abbildung 1: Zusammenhang zwischen Gewicht und Kraftstoffeffizienz',
    'Author': 'Jane Doe',
    'Description': 'Streudiagramm zeigt negative Korrelation',
    'Copyright': 'CC-BY 4.0',
    'Software': 'R 4.3.0, ggplot2 3.4.0',
    'Creation Date': '2026-02-16',
    'Source': 'mtcars-Datensatz'
}

embed_metadata('figure1.png', 'figure1_with_metadata.png', metadata)
```

**Erwartet:** Metadaten eingebettet und abrufbar
**Bei Fehler:** Metadaten-Unterstuetzung des Formats pruefen (PNG, TIFF, PDF ja; JPEG eingeschraenkt)

## Validierung

- [ ] DPI erfuellt Publikationsanforderungen (typischerweise 300+)
- [ ] Physische Abmessungen korrekt fuer Publikation
- [ ] Farbraum geeignet (RGB fuer Web, CMYK fuer Druck)
- [ ] Dateiformat vom Verlag akzeptiert
- [ ] Text bei Publikationsgroesse lesbar
- [ ] Schriften eingebettet oder als Pfade konvertiert
- [ ] Linienbreiten beim Drucken sichtbar
- [ ] Farbkontrast fuer Graustufen-Druck ausreichend
- [ ] Dateigroesse innerhalb der Grenzen
- [ ] Metadaten eingebettet
- [ ] Druckvorschau oder Rendering getestet

## Haeufige Stolperfallen

1. **Unzureichende Aufloesung**: 72 DPI-Webgrafiken koennen nicht in Qualitaet gedruckt werden
2. **Falscher Farbraum**: RGB-Grafiken koennen im Druck anders aussehen als am Bildschirm
3. **Schriftersetzung**: Nicht eingebettete Schriften werden durch Standardschriften ersetzt
4. **Zu kleine Schrift**: Schriften unter 8pt koennen beim Drucken unleserlich sein
5. **Duenne Linien**: Linien unter 0.5pt drucken moeglicherweise nicht deutlich
6. **Dateigroesse**: Grafiken mit hoher DPI koennen sehr gross werden, angemessen komprimieren
7. **Kompressionsartefakte**: JPEG-Kompression ungeeignet fuer Strichgrafiken oder Text
8. **Fehlender Beschnitt**: Druckgrafiken benoetigen 3-5mm Beschnitt ueber Schnittkante hinaus
9. **Transparenzprobleme**: Einige Formate bewahren Transparenz nicht korrekt
10. **Seitenverhaeltnis**: Verzerrung durch falsche Abmessungsberechnungen

## Verwandte Skills

- **[create-2d-composition](../create-2d-composition/SKILL.md)**: Quellgrafiken erstellen
- **[render-blender-output](../../blender/render-blender-output/SKILL.md)**: 3D-Rendereinstellungen fuer Publikation
- **[generate-quarto-report](../../reporting/generate-quarto-report/SKILL.md)**: Grafiken in Dokumente integrieren
