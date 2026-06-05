---
name: render-publication-graphic
description: >
  Produce publication-ready 2D graphics with proper DPI, color profiles,
  typography, and export formats for print and digital media. Use when
  preparing figures for academic journal submission, creating graphics for
  print publications, ensuring graphics meet publisher technical specifications,
  exporting visualizations for web with proper optimization, or creating
  multi-format exports from a single source.
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

# Render Publication Graphic

Produce publication-ready graphics that meet technical requirements for academic journals, books, presentations, and web publication. Covers DPI requirements, color space management, typography best practices, file format selection, and metadata embedding.

## When to Use

- Preparing figures for academic journal submission
- Creating graphics for print publications (books, magazines)
- Generating high-quality assets for presentations
- Exporting visualizations for web publication with proper optimization
- Ensuring graphics meet publisher technical specifications
- Archiving graphics with proper metadata
- Creating multi-format exports from single source

## Inputs

| Input | Type | Description | Example |
|-------|------|-------------|---------|
| Source graphic | File/Data | Original visualization or artwork | SVG, R ggplot, Python matplotlib, Blender render |
| Publication target | Specification | Journal, web, print, presentation | Nature journal, IEEE paper, website |
| Technical requirements | Parameters | DPI, dimensions, color space, format | 300 DPI, 180mm width, CMYK, TIFF |
| Style guide | Document | Publisher typography and formatting rules | Font families, line widths, color palette |
| Metadata | Information | Title, author, date, copyright, description | Figure caption, license info |

## Procedure

### 1. Determine Output Requirements

Identify technical specifications for target publication:

```yaml
# Common publication requirements

academic_journal:
  dpi: 300-600
  format: TIFF, EPS, PDF
  color_space: RGB or CMYK (check guidelines)
  max_width: 180mm (single column) or 390mm (double column)
  fonts: Embed or outline
  resolution_minimums:
    line_art: 1000 DPI
    halftone: 300 DPI
    combination: 600 DPI

web_publication:
  dpi: 72-96 (retina: 144-192)
  format: PNG, WebP, SVG
  color_space: sRGB
  max_file_size: 200KB-500KB
  optimization: Compress, progressive loading

presentation:
  dpi: 96-150
  format: PNG, PDF, SVG
  color_space: RGB
  dimensions: 16:9 or 4:3 aspect ratio
  contrast: High contrast for projectors

print_book:
  dpi: 300-600
  format: TIFF, PDF/X
  color_space: CMYK
  bleed: 3-5mm beyond trim
  fonts: Embedded
```

**Expected:** Clear understanding of target requirements
**On failure:** Contact publisher for specific guidelines, use conservative defaults

### 2. Set Correct DPI for Raster Graphics

Configure resolution based on output medium:

```python
from PIL import Image

def set_dpi_pillow(image_path, output_path, target_dpi=300):
    """Set DPI metadata for PNG/TIFF."""
    img = Image.open(image_path)

    # Save with DPI metadata
    img.save(output_path, dpi=(target_dpi, target_dpi))
    print(f"Saved with {target_dpi} DPI: {output_path}")

def calculate_dimensions(width_mm, height_mm, dpi=300):
    """Calculate pixel dimensions from physical size."""
    # Convert mm to inches
    width_inches = width_mm / 25.4
    height_inches = height_mm / 25.4

    # Calculate pixels
    width_px = int(width_inches * dpi)
    height_px = int(height_inches * dpi)

    return width_px, height_px

# Example: 180mm wide figure at 300 DPI
width, height = calculate_dimensions(180, 120, dpi=300)
print(f"Required resolution: {width}x{height} pixels")
# Output: Required resolution: 2126x1417 pixels
```

```r
# R ggplot2 export with proper DPI
library(ggplot2)

# Create plot
p <- ggplot(mtcars, aes(x = wt, y = mpg)) +
  geom_point() +
  theme_minimal(base_size = 12)

# Save for publication (300 DPI)
ggsave(
  filename = "figure1.png",
  plot = p,
  width = 180,
  height = 120,
  units = "mm",
  dpi = 300
)

# Save as vector for flexibility
ggsave(
  filename = "figure1.pdf",
  plot = p,
  width = 180,
  height = 120,
  units = "mm",
  device = cairo_pdf  # Better text rendering
)
```

**Expected:** Graphics rendered at correct resolution for print quality
**On failure:** Verify DPI metadata saved correctly, check file size appropriate

### 3. Configure Color Space

Set appropriate color profile:

```python
from PIL import Image, ImageCms

def convert_to_cmyk(rgb_image_path, cmyk_output_path):
    """Convert RGB to CMYK for print."""
    img = Image.open(rgb_image_path)

    if img.mode != 'RGB':
        img = img.convert('RGB')

    # Convert to CMYK
    cmyk_img = img.convert('CMYK')
    cmyk_img.save(cmyk_output_path, format='TIFF', compression='tiff_lzw')
    print(f"Converted to CMYK: {cmyk_output_path}")

def apply_srgb_profile(image_path, output_path):
    """Apply sRGB profile for web."""
    img = Image.open(image_path)

    # sRGB profile (embedded in Pillow)
    srgb_profile = ImageCms.createProfile('sRGB')

    # Convert to sRGB
    img_srgb = ImageCms.profileToProfile(
        img,
        srgb_profile,
        srgb_profile,
        renderingIntent=ImageCms.Intent.PERCEPTUAL
    )

    img_srgb.save(output_path)
```

```bash
# ImageMagick for color space conversion
convert input.png -colorspace sRGB output_srgb.png
convert input.png -colorspace CMYK output_cmyk.tiff

# Check color profile
identify -verbose image.png | grep -i colorspace
```

**Expected:** Color space matches publication requirements
**On failure:** Verify color profile embedded, test print preview

### 4. Configure Typography

Ensure text is readable and properly formatted:

```python
from PIL import ImageFont

def get_publication_fonts():
    """Load fonts appropriate for publication."""
    # Common publication-safe fonts
    fonts = {
        'serif': 'Times New Roman',
        'sans': 'Arial',
        'mono': 'Courier New'
    }

    try:
        # Load with proper size for DPI
        # At 300 DPI, 12pt = 12 * 300/72 = 50 pixels
        base_size_300dpi = 50

        font_regular = ImageFont.truetype(f"{fonts['sans']}.ttf", base_size_300dpi)
        font_bold = ImageFont.truetype(f"{fonts['sans']} Bold.ttf", base_size_300dpi)

        return {'regular': font_regular, 'bold': font_bold}
    except:
        return {'regular': ImageFont.load_default(), 'bold': ImageFont.load_default()}

# Typography guidelines
typography_specs = {
    'minimum_font_size': '8pt',  # Readable when printed
    'line_width_min': 0.5,  # Points, for print clarity
    'panel_labels': {
        'font': 'Arial Bold',
        'size': '12pt',
        'position': 'top-left',
        'style': 'A, B, C'  # Or (a), (b), (c)
    },
    'axis_labels': {
        'font': 'Arial',
        'size': '10pt'
    },
    'legend': {
        'font': 'Arial',
        'size': '9pt',
        'position': 'outside plot area'
    }
}
```

```r
# R publication-quality typography
library(ggplot2)

p <- ggplot(mtcars, aes(x = wt, y = mpg)) +
  geom_point(size = 2) +
  labs(
    title = "Fuel Efficiency vs Weight",
    x = "Weight (1000 lbs)",
    y = "Miles per Gallon"
  ) +
  theme_bw(base_size = 12, base_family = "Arial") +
  theme(
    plot.title = element_text(size = 14, face = "bold"),
    axis.title = element_text(size = 12),
    axis.text = element_text(size = 10),
    legend.text = element_text(size = 10),
    panel.grid.minor = element_blank(),
    # Ensure text is black for print
    text = element_text(color = "black")
  )
```

**Expected:** Text readable at publication size, fonts embedded properly
**On failure:** Increase font sizes, check font licensing, convert text to outlines

### 5. Select Appropriate File Format

Choose format based on use case:

```python
def export_multi_format(source_path, output_base, formats=['png', 'pdf', 'tiff']):
    """Export graphic in multiple formats."""
    from PIL import Image
    import cairosvg
    import os

    base, ext = os.path.splitext(output_base)

    if ext.lower() in ['.svg']:
        # SVG source - convert to rasters
        for fmt in formats:
            output = f"{base}.{fmt}"

            if fmt == 'png':
                cairosvg.svg2png(
                    url=source_path,
                    write_to=output,
                    output_width=2126,  # 180mm @ 300 DPI
                    output_height=1417   # 120mm @ 300 DPI
                )
            elif fmt == 'pdf':
                cairosvg.svg2pdf(url=source_path, write_to=output)
            elif fmt == 'tiff':
                # Convert via PNG intermediate
                temp_png = f"{base}_temp.png"
                cairosvg.svg2png(url=source_path, write_to=temp_png)
                img = Image.open(temp_png)
                img.save(output, format='TIFF', compression='tiff_lzw')
                os.remove(temp_png)

    else:
        # Raster source
        img = Image.open(source_path)

        for fmt in formats:
            output = f"{base}.{fmt}"

            if fmt == 'png':
                img.save(output, format='PNG', dpi=(300, 300), optimize=True)
            elif fmt == 'tiff':
                img.save(output, format='TIFF', compression='tiff_lzw', dpi=(300, 300))
            elif fmt == 'pdf':
                # Use img2pdf or similar for raster-to-PDF
                img.save(output, format='PDF', resolution=300.0)

    print(f"Exported in formats: {', '.join(formats)}")

# Format selection guide
format_guide = {
    'TIFF': {
        'use_for': 'Journal submission, archival',
        'benefits': 'Lossless, supports CMYK, high quality',
        'compression': 'LZW or ZIP (lossless)'
    },
    'PDF': {
        'use_for': 'Submission, print, archival',
        'benefits': 'Vector or raster, text searchable, widely accepted',
        'variants': 'PDF/A (archival), PDF/X (print)'
    },
    'PNG': {
        'use_for': 'Web, presentations, digital',
        'benefits': 'Lossless, transparency, good compression',
        'limitation': 'RGB only, larger than JPEG'
    },
    'SVG': {
        'use_for': 'Web, further editing, scalable graphics',
        'benefits': 'Vector, infinitely scalable, small file size',
        'limitation': 'Not always accepted by journals'
    },
    'EPS': {
        'use_for': 'Legacy journal requirements',
        'benefits': 'Vector format accepted by older systems',
        'limitation': 'Being phased out, use PDF instead'
    }
}
```

**Expected:** Appropriate format for publication channel
**On failure:** Check publisher requirements, provide multiple formats

### 6. Optimize for Web

Create web-optimized versions:

```python
def optimize_for_web(input_path, output_path, max_width=1200, quality=85):
    """Optimize image for web publication."""
    from PIL import Image

    img = Image.open(input_path)

    # Resize if too large
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.LANCZOS)

    # Convert to RGB if needed
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
        img = background

    # Save optimized
    img.save(output_path, format='JPEG', quality=quality, optimize=True, progressive=True)

    # Check file size
    import os
    file_size_kb = os.path.getsize(output_path) / 1024
    print(f"Optimized: {file_size_kb:.1f} KB")

def create_responsive_set(input_path, output_base):
    """Create multiple resolutions for responsive web."""
    from PIL import Image

    img = Image.open(input_path)
    sizes = [
        (640, '640w'),
        (1024, '1024w'),
        (1920, '1920w')
    ]

    for width, suffix in sizes:
        if img.width >= width:
            ratio = width / img.width
            height = int(img.height * ratio)
            resized = img.resize((width, height), Image.LANCZOS)

            output = f"{output_base}_{suffix}.jpg"
            resized.save(output, format='JPEG', quality=85, optimize=True)
```

**Expected:** Web-optimized images under 500KB, responsive sizes generated
**On failure:** Reduce quality, resize further, consider WebP format

### 7. Embed Metadata

Add descriptive metadata for archival:

```python
from PIL import Image
from PIL.PngImagePlugin import PngInfo

def embed_metadata(image_path, output_path, metadata):
    """Embed metadata in PNG."""
    img = Image.open(image_path)

    # Create metadata
    png_info = PngInfo()
    for key, value in metadata.items():
        png_info.add_text(key, str(value))

    # Save with metadata
    img.save(output_path, format='PNG', pnginfo=png_info)

# Example metadata
metadata = {
    'Title': 'Figure 1: Relationship between weight and fuel efficiency',
    'Author': 'Jane Doe',
    'Description': 'Scatter plot showing negative correlation',
    'Copyright': 'CC-BY 4.0',
    'Software': 'R 4.3.0, ggplot2 3.4.0',
    'Creation Date': '2026-02-16',
    'Source': 'mtcars dataset'
}

embed_metadata('figure1.png', 'figure1_with_metadata.png', metadata)
```

**Expected:** Metadata embedded and retrievable
**On failure:** Check format supports metadata (PNG, TIFF, PDF yes; JPEG limited)

## Validation Checklist

- [ ] DPI meets publication requirements (typically 300+)
- [ ] Physical dimensions correct for publication
- [ ] Color space appropriate (RGB for web, CMYK for print)
- [ ] File format accepted by publisher
- [ ] Text is readable at publication size
- [ ] Fonts embedded or outlined
- [ ] Line widths visible when printed
- [ ] Color contrast sufficient for grayscale printing
- [ ] File size within limits
- [ ] Metadata embedded
- [ ] Tested print preview or rendering

## Common Pitfalls

1. **Insufficient resolution**: 72 DPI web graphics cannot be printed at quality
2. **Wrong color space**: RGB graphics may print differently than displayed
3. **Font substitution**: Non-embedded fonts replaced with defaults
4. **Small text**: Fonts below 8pt may be illegible when printed
5. **Thin lines**: Lines below 0.5pt may not print clearly
6. **File size**: High DPI graphics can be very large, compress appropriately
7. **Compression artifacts**: JPEG compression unsuitable for line art or text
8. **Missing bleed**: Print graphics need 3-5mm bleed beyond trim
9. **Transparency issues**: Some formats don't preserve transparency correctly
10. **Aspect ratio**: Distortion from incorrect dimension calculations

## Related Skills

- **[create-2d-composition](../create-2d-composition/SKILL.md)**: Creating the source graphics
- **[render-blender-output](../../blender/render-blender-output/SKILL.md)**: 3D rendering settings for publication
- **[generate-quarto-report](../../reporting/generate-quarto-report/SKILL.md)**: Integrating graphics into documents
