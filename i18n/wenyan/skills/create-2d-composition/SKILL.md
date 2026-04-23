---
name: create-2d-composition
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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
---

# 建二維之構

以 SVG 之生、圖佈之算、影像之合、批處之流，程式化建二維之圖。涵向量圖之生、點陣圖之操、排印、圖表與信息圖之自動作。

## 用時

- 程式化生圖、流程、信息圖
- 建可重現之科學圖或刊圖
- 自動作徽、標、視資
- 合多影像或數據視
- 建標準庫無之自訂圖類
- 批生參變之圖
- 為網或印建 SVG 樣

## 入

| 入 | 類 | 述 | 例 |
|-------|------|-------------|---------|
| 佈說 | 配置 | 尺、邊、格 | 畫布 800x600px，邊 20px |
| 視件 | 數／資 | 形、字、像、點 | 矩形坐標、標、標 |
| 樣參 | CSS／屬 | 色、字型、線寬、透 | `fill="#3366cc"`, `stroke-width="2"` |
| 數源 | 文件／陣 | 所視或注之值 | CSV 數、JSON 配 |
| 出式 | 字串 | SVG、PNG、PDF、合 | `output.svg`，300 DPI PNG |

## 法

### 一、設 Python 境

裝二維構所需諸庫：

```bash
# Core libraries
pip install svgwrite pillow cairosvg

# Optional: advanced features
pip install drawsvg reportlab pycairo

# For data-driven graphics
pip install matplotlib numpy pandas
```

**得：** 諸庫裝成
**敗則：** 察 Python 版（3.7+），用虛境避衝

### 二、建基本 SVG 圖

以 svgwrite 生 SVG：

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

**得：** SVG 文件生，含形字
**敗則：** 察 svgwrite 版，驗出目錄可書

### 三、以佈邏輯建圖

以算得位建構之圖：

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

**得：** 流程圖，盒相連而箭指
**敗則：** 調佈之算，驗箭標之定

### 四、合點陣之像

以 Pillow 合多像：

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

**得：** 合像成，佈正
**敗則：** 察諸入像皆存，驗像模式相容

### 五、依數而生圖

由數建視：

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

**得：** SVG 柱圖，數已縮
**敗則：** 處邊況（空數、負值），增驗

### 六、批生圖

自動作多圖：

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

**得：** 每數項生單獨之圖
**敗則：** 察數構，缺域以默填

### 七、SVG 轉點陣

出 SVG 為 PNG／PDF 以供諸用：

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

**得：** 點陣出生於定之解析
**敗則：** 若缺則裝 cairo 系庫，驗 SVG 合法

## 驗

- [ ] 圖於目標程式正現，字可讀位正
- [ ] 色合說（察十六進位），尺合用
- [ ] SVG 合標準（若需）
- [ ] 點陣出有正 DPI
- [ ] 佈適數變
- [ ] 批處無訛而畢，出文件有序
- [ ] 碼含訛處

## 陷

1. **單位混**：SVG 單（px、mm、cm）與屏素、印 DPI 異
2. **字溢**：字越形界，宜包
3. **字型缺**：系字或異，宜嵌或用網安字型
4. **坐標算**：格佈之差一
5. **色式**：SVG 用十六進位字串（`#rrggbb`），非元組
6. **SVG 合法**：察 XML 構，閉諸標
7. **路徑**：處特字、空格於名中
8. **記憶**：大批或需分塊
9. **比例與透**：調像時守比；PNG 支 alpha，JPEG 不支

## 參

- **[render-publication-graphic](../render-publication-graphic/SKILL.md)**：刊用出之需
- **[create-3d-scene](../../blender/create-3d-scene/SKILL.md)**：三維之程式法
- **[generate-quarto-report](../../reporting/generate-quarto-report/SKILL.md)**：圖入報告
