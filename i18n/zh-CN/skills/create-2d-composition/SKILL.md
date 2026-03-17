---
name: create-2d-composition
description: >
  Compose 2D graphics programmatically using SVG generation, diagram layout
  algorithms, image compositing, and batch processing workflows. Use when
  generating diagrams, flowcharts, or infographics programmatically, creating
  reproducible scientific figures, automating production of badges or visual
  assets, building custom chart types not in standard libraries, or batch
  generating graphics with parameter variations.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: intermediate
  language: Python
  tags: svg, 2d, graphics, composition, diagrams, scripting, batch-processing
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Create 2D Composition

Generate 2D graphics programmatically using SVG construction, diagram layout algorithms, image compositing, and batch processing workflows. Covers vector graphics generation, raster image manipulation, typography, and automated production of charts, diagrams, and infographics.

## 适用场景

- Generating diagrams, flowcharts, or infographics programmatically
- Creating reproducible scientific figures or publication graphics
- Automating production of badges, icons, or visual assets
- Compositing multiple images or data visualizations
- Building custom chart types not available in standard libraries
- Batch generating graphics with parameter variations
- Creating SVG templates for web or print applications

## 输入

| Input | Type | Description | Example |
|-------|------|-------------|---------|
| Layout specification | Configuration | Dimensions, margins, grid layout | Canvas 800x600px, 20px margins |
| Visual elements | Data/Assets | Shapes, text, images, data points | Rectangle coordinates, labels, icons |
| Style parameters | CSS/Attributes | Colors, fonts, stroke widths, opacity | `fill="#3366cc"`, `stroke-width="2"` |
| Data sources | Files/Arrays | Values to visualize or annotate | CSV data, JSON configuration |
| Output format | String | SVG, PNG, PDF, composite formats | `output.svg`, 300 DPI PNG |

## 步骤

### 1. Set Up Python Environment

Install required libraries for 2D composition:

```bash
# Core libraries
pip install svgwrite pillow cairosvg

# Optional: advanced features
pip install drawsvg reportlab pycairo

# For data-driven graphics
pip install matplotlib numpy pandas
```

**预期结果：** Libraries installed successfully
**失败处理：** Check Python version (3.7+), use virtual environment to avoid conflicts

### 2. Create Basic SVG Graphics

Generate SVG using svgwrite:

```python
import svgwrite
from svgwrite import cm, mm

def create_basic_svg(output_path):
    """Create a simple SVG graphic."""
    # Initialize drawing (use mm for precise dimensions)
    dwg = svgwrite.Drawing(output_path, size=('180mm', '120mm'), profile='full')

    # Add background rectangle
    dwg.add(dwg.rect(
        insert=(0, 0),
        size=('100%', '100%'),
        fill='white'
    ))

    # Add shapes
    dwg.add(dwg.circle(
        center=(90*mm, 60*mm),
        r=30*mm,
        fill='lightblue',
        stroke='navy',
        stroke_width=2
    ))

    dwg.add(dwg.rect(
        insert=(30*mm, 30*mm),
        size=(60*mm, 40*mm),
        fill='lightgreen',
        stroke='darkgreen',
        stroke_width=2,
        rx=5,  # Rounded corners
        ry=5
    ))

    # Add text
    dwg.add(dwg.text(
        'Example Graphic',
        insert=(90*mm, 20*mm),
        text_anchor='middle',
        font_size='18pt',
        font_family='Arial',
        fill='black'
    ))

    dwg.save()
    print(f"Saved: {output_path}")
```

**预期结果：** SVG file generated with shapes and text
**失败处理：** Check svgwrite version, verify output directory writable

### 3. Build Diagrams with Layout Logic

Create structured diagrams with calculated positioning:

```python
def create_flowchart(steps, output_path):
    """Generate a flowchart from list of steps."""
    dwg = svgwrite.Drawing(output_path, size=('800px', '600px'))

    # Layout parameters
    box_width = 120
    box_height = 60
    spacing_y = 100
    start_x = 340
    start_y = 50

    for i, step in enumerate(steps):
        y_pos = start_y + i * spacing_y

        # Draw box
        box = dwg.add(dwg.g(id=f'step_{i}'))

        box.add(dwg.rect(
            insert=(start_x, y_pos),
            size=(box_width, box_height),
            fill='lightblue',
            stroke='navy',
            stroke_width=2,
            rx=5,
            ry=5
        ))

        # Add text (wrapped if needed)
        text_lines = wrap_text(step, max_width=16)
        text_y = y_pos + box_height/2 - (len(text_lines)-1) * 7

        for j, line in enumerate(text_lines):
            box.add(dwg.text(
                line,
                insert=(start_x + box_width/2, text_y + j*14),
                text_anchor='middle',
                font_size='12pt',
                font_family='Arial',
                fill='black'
            ))

        # Draw arrow to next step
        if i < len(steps) - 1:
            arrow_start_y = y_pos + box_height
            arrow_end_y = y_pos + spacing_y

            dwg.add(dwg.line(
                start=(start_x + box_width/2, arrow_start_y),
                end=(start_x + box_width/2, arrow_end_y),
                stroke='black',
                stroke_width=2,
                marker_end=dwg.marker(
                    id='arrow',
                    viewBox='0 0 10 10',
                    refX=5,
                    refY=5,
                    markerWidth=6,
                    markerHeight=6,
                    orient='auto'
                )
            ))

    dwg.save()

def wrap_text(text, max_width=20):
    """Simple text wrapping."""
    words = text.split()
    lines = []
    current_line = []

    for word in words:
        test_line = ' '.join(current_line + [word])
        if len(test_line) <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]

    if current_line:
        lines.append(' '.join(current_line))

    return lines
```

**预期结果：** Flowchart with connected boxes and arrows
**失败处理：** Adjust layout calculations, verify arrow marker definitions

### 4. Composite Raster Images

Combine multiple images using Pillow:

```python
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

def composite_images(image_paths, output_path, layout='grid'):
    """Composite multiple images into single output."""
    # Load images
    images = [Image.open(path) for path in image_paths]

    if layout == 'grid':
        # Calculate grid dimensions
        n = len(images)
        cols = int(n ** 0.5)
        rows = (n + cols - 1) // cols

        # Get max dimensions
        max_width = max(img.width for img in images)
        max_height = max(img.height for img in images)

        # Create composite canvas
        canvas_width = cols * max_width
        canvas_height = rows * max_height
        composite = Image.new('RGB', (canvas_width, canvas_height), 'white')

        # Paste images
        for i, img in enumerate(images):
            row = i // cols
            col = i % cols
            x = col * max_width
            y = row * max_height
            composite.paste(img, (x, y))

    elif layout == 'horizontal':
        # Horizontal concatenation
        total_width = sum(img.width for img in images)
        max_height = max(img.height for img in images)
        composite = Image.new('RGB', (total_width, max_height), 'white')

        x_offset = 0
        for img in images:
            composite.paste(img, (x_offset, 0))
            x_offset += img.width

    elif layout == 'vertical':
        # Vertical concatenation
        max_width = max(img.width for img in images)
        total_height = sum(img.height for img in images)
        composite = Image.new('RGB', (max_width, total_height), 'white')

        y_offset = 0
        for img in images:
            composite.paste(img, (0, y_offset))
            y_offset += img.height

    composite.save(output_path)
    print(f"Saved composite: {output_path}")

def add_annotations(image_path, annotations, output_path):
    """Add text annotations to image."""
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)

    # Load font
    try:
        font = ImageFont.truetype("Arial.ttf", 24)
    except:
        font = ImageFont.load_default()

    for annotation in annotations:
        text = annotation['text']
        position = annotation['position']
        color = annotation.get('color', 'black')

        # Add text shadow for readability
        shadow_offset = 2
        draw.text(
            (position[0] + shadow_offset, position[1] + shadow_offset),
            text,
            font=font,
            fill='white'
        )
        draw.text(position, text, font=font, fill=color)

    img.save(output_path)
```

**预期结果：** Composite image created with proper layout
**失败处理：** Check all input images exist, verify image modes compatible

### 5. Generate Data-Driven Graphics

Create visualizations from data:

```python
import numpy as np

def create_bar_chart_svg(data, labels, output_path):
    """Generate SVG bar chart from data."""
    dwg = svgwrite.Drawing(output_path, size=('600px', '400px'))

    # Chart area
    margin = 50
    chart_width = 500
    chart_height = 300
    bar_spacing = 10

    # Calculate bar dimensions
    n_bars = len(data)
    bar_width = (chart_width - (n_bars - 1) * bar_spacing) / n_bars

    # Scale data to fit chart
    max_value = max(data)
    scale = chart_height / max_value

    # Draw axes
    dwg.add(dwg.line(
        start=(margin, margin),
        end=(margin, margin + chart_height),
        stroke='black',
        stroke_width=2
    ))
    dwg.add(dwg.line(
        start=(margin, margin + chart_height),
        end=(margin + chart_width, margin + chart_height),
        stroke='black',
        stroke_width=2
    ))

    # Draw bars
    for i, (value, label) in enumerate(zip(data, labels)):
        x = margin + i * (bar_width + bar_spacing)
        bar_height = value * scale
        y = margin + chart_height - bar_height

        # Bar
        dwg.add(dwg.rect(
            insert=(x, y),
            size=(bar_width, bar_height),
            fill='steelblue',
            stroke='navy',
            stroke_width=1
        ))

        # Value label
        dwg.add(dwg.text(
            f'{value:.1f}',
            insert=(x + bar_width/2, y - 5),
            text_anchor='middle',
            font_size='10pt',
            fill='black'
        ))

        # X-axis label
        dwg.add(dwg.text(
            label,
            insert=(x + bar_width/2, margin + chart_height + 20),
            text_anchor='middle',
            font_size='10pt',
            fill='black'
        ))

    dwg.save()
```

**预期结果：** SVG bar chart with scaled data
**失败处理：** Handle edge cases (empty data, negative values), add validation

### 6. Batch Generate Graphics

Automate creation of multiple graphics:

```python
def batch_generate_badges(users, template_path, output_dir):
    """Generate badge for each user."""
    os.makedirs(output_dir, exist_ok=True)

    for user in users:
        output_path = os.path.join(output_dir, f"{user['id']}_badge.svg")

        dwg = svgwrite.Drawing(output_path, size=('300px', '100px'))

        # Background
        dwg.add(dwg.rect(
            insert=(0, 0),
            size=('100%', '100%'),
            fill='#3366cc',
            rx=10,
            ry=10
        ))

        # User name
        dwg.add(dwg.text(
            user['name'],
            insert=(150, 40),
            text_anchor='middle',
            font_size='20pt',
            font_weight='bold',
            fill='white'
        ))

        # User role
        dwg.add(dwg.text(
            user['role'],
            insert=(150, 70),
            text_anchor='middle',
            font_size='14pt',
            fill='lightblue'
        ))

        dwg.save()
        print(f"Generated badge: {output_path}")
```

**预期结果：** Individual graphic generated for each data item
**失败处理：** Check data structure, handle missing fields with defaults

### 7. Convert SVG to Raster

Export SVG to PNG/PDF for various uses:

```python
import cairosvg

def svg_to_png(svg_path, png_path, dpi=300):
    """Convert SVG to PNG with specified DPI."""
    # Calculate pixel dimensions from DPI
    # Assuming A4 size as example
    width_inches = 8.27
    height_inches = 11.69

    width_px = int(width_inches * dpi)
    height_px = int(height_inches * dpi)

    cairosvg.svg2png(
        url=svg_path,
        write_to=png_path,
        output_width=width_px,
        output_height=height_px
    )
    print(f"Converted to PNG: {png_path}")

def svg_to_pdf(svg_path, pdf_path):
    """Convert SVG to PDF."""
    cairosvg.svg2pdf(url=svg_path, write_to=pdf_path)
    print(f"Converted to PDF: {pdf_path}")
```

**预期结果：** Raster output generated at specified resolution
**失败处理：** Install cairo system library if missing, check SVG validity

## Validation Checklist

- [ ] Graphics render correctly in target applications
- [ ] Text is readable and properly positioned
- [ ] Colors match specifications (check hex codes)
- [ ] Dimensions appropriate for use case
- [ ] SVG validates against standard (if required)
- [ ] Raster exports have correct DPI
- [ ] Layout adapts to data variations
- [ ] Batch processing completes without errors
- [ ] Output files organized logically
- [ ] Code includes error handling

## 常见问题

1. **Unit confusion**: SVG units (px, mm, cm) vs screen pixels vs print DPI
2. **Text overflow**: Text exceeding shape boundaries, implement wrapping
3. **Font availability**: System fonts may differ, embed or use web-safe fonts
4. **Coordinate calculations**: Off-by-one errors in grid layouts
5. **Color format**: SVG uses hex strings (`#rrggbb`), not tuples
6. **SVG validity**: Check XML structure, close all tags
7. **File paths**: Handle special characters, spaces in filenames
8. **Memory usage**: Large batch operations may require chunking
9. **Aspect ratio**: Maintain proportions when resizing images
10. **Transparency**: PNG supports alpha, JPEG does not

## 相关技能

- **[render-publication-graphic](../render-publication-graphic/SKILL.md)**: Publication-specific output requirements
- **[create-3d-scene](../../blender/create-3d-scene/SKILL.md)**: Similar programmatic approach for 3D
- **[generate-quarto-report](../../reporting/generate-quarto-report/SKILL.md)**: Integrating graphics into reports
