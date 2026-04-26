---
name: render-publication-graphic
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
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

# 渲公示之圖

生公示備之圖，附正 DPI、色圖、字體、為印與數媒之出式，合學刊、書、講、網之需。

## 用時

- 為學刊投稿備圖乃用
- 為印物（書、誌）立圖乃用
- 為講生高質之件乃用
- 為網公出視之化附正優乃用
- 確圖合示者技規乃用
- 附正屬以存圖乃用
- 自單源生多式之出乃用

## 入

| 入 | 類 | 述 | 例 |
|-------|------|-------------|---------|
| 源圖 | 文/數 | 原視化或藝品 | SVG、R ggplot、Python matplotlib、Blender 渲 |
| 公示之的 | 規 | 刊、網、印、講 | Nature 刊、IEEE 文、網 |
| 技需 | 參 | DPI、維、色空、式 | 300 DPI、180mm 寬、CMYK、TIFF |
| 體規 | 文 | 示者之字與式之則 | 字族、線寬、色板 |
| 屬 | 信 | 名、著、日、版權、述 | 圖題、許證 |

## 法

### 1. 定出之需

識目示之技規：

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

**得：** 目需明矣
**敗則：** 求示者之具體則，用保守之默

### 2. 為點陣圖設正 DPI

依出媒設解：

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

**得：** 圖以印質之解渲
**敗則：** 驗 DPI 屬正存，察文大宜

### 3. 設色空

設宜之色圖：

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

**得：** 色空合公示之需
**敗則：** 驗色圖已嵌，試印之預

### 4. 設字體

確文可讀且式正：

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

**得：** 文於公示尺可讀，字體已正嵌
**敗則：** 增字尺，察字之許，化文為輪廓

### 5. 擇宜之檔式

依用境擇式：

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

**得：** 出之式合公示之道
**敗則：** 察示者之需，供多式

### 6. 為網優之

立網優之版：

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

**得：** 網優之圖未及 500KB，響應之尺已生
**敗則：** 減質、再縮、考 WebP 式

### 7. 嵌屬

加述之屬以為存：

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

**得：** 屬已嵌且可取
**敗則：** 察式持屬乎（PNG、TIFF、PDF 然；JPEG 限）

## 驗

- [ ] DPI 合公示之需（常 300+）
- [ ] 物理之維合公示
- [ ] 色空合宜（網用 RGB，印用 CMYK）
- [ ] 文式為示者所受
- [ ] 文於公示尺可讀
- [ ] 字體已嵌或化輪廓
- [ ] 線寬印時可見
- [ ] 色對足供灰印
- [ ] 文大於限內
- [ ] 屬已嵌
- [ ] 已試印之預或渲

## 陷

1. **解不足**：72 DPI 之網圖不能以質印
2. **色空誤**：RGB 圖印時或異於示
3. **字體替**：未嵌之字體被默替
4. **小文**：8pt 下之字體印時或不可讀
5. **細線**：0.5pt 下之線印時或不清
6. **文大**：高 DPI 之圖可甚大，宜縮之
7. **縮偽影**：JPEG 縮不宜線藝或文
8. **缺出血**：印圖需 3-5mm 出血逾切
9. **透明患**：某式不存透明
10. **比例**：誤算維致變形

## 參

- **[create-2d-composition](../create-2d-composition/SKILL.md)**：源圖之立
- **[render-blender-output](../../blender/render-blender-output/SKILL.md)**：3D 渲為公示之諸值
- **[generate-quarto-report](../../reporting/generate-quarto-report/SKILL.md)**：集圖於文檔
