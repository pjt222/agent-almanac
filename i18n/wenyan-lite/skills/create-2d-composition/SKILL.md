---
name: create-2d-composition
locale: wenyan-lite
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

# 造二維構圖

以程式生二維圖形：SVG 構建、圖表佈局演算法、影像合成、批次處理流。涵向量圖形生成、點陣圖像處理、字體排印，與圖表、示意圖、資訊圖之自動化產出。

## 適用時機

- 以程式生示意圖、流程圖、資訊圖
- 造可重現之科學圖或出版圖
- 自動化產出徽章、圖示、視覺資產
- 合成多圖像或資料可視化
- 建標準庫所無之自訂圖表型
- 以參數變動批次生圖
- 為網頁或印刷造 SVG 範本

## 輸入

| 輸入 | 類型 | 描述 | 範例 |
|-------|------|-------------|---------|
| 佈局規格 | 配置 | 尺寸、邊距、網格佈局 | 畫布 800x600px、20px 邊距 |
| 視覺元素 | 資料/資產 | 形狀、文字、圖像、資料點 | 矩形座標、標籤、圖示 |
| 樣式參數 | CSS/屬性 | 色、字體、筆劃寬、透明度 | `fill="#3366cc"`、`stroke-width="2"` |
| 資料源 | 檔案/陣列 | 待可視化或標註之值 | CSV 資料、JSON 配置 |
| 輸出格式 | 字串 | SVG、PNG、PDF、合成格式 | `output.svg`、300 DPI PNG |

## 步驟

### 1. 立 Python 環境

裝二維構圖所需之庫：

```bash
# Core libraries
pip install svgwrite pillow cairosvg

# Optional: advanced features
pip install drawsvg reportlab pycairo

# For data-driven graphics
pip install matplotlib numpy pandas
```

**預期：** 庫裝成
**失敗時：** 察 Python 版本（3.7+），用虛擬環境以避衝突

### 2. 造基本 SVG 圖形

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

**預期：** SVG 檔已生，含形狀與文字
**失敗時：** 察 svgwrite 版本，驗輸出目錄可寫

### 3. 以佈局邏輯建示意圖

以算出之位造結構化示意圖：

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

**預期：** 流程圖已生，含相連之方塊與箭頭
**失敗時：** 調佈局計算，驗箭頭標記之定義

### 4. 合成點陣圖像

以 Pillow 合多圖：

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

**預期：** 合成圖已生，佈局得宜
**失敗時：** 察輸入圖皆在、驗圖像模式相容

### 5. 生資料驅動之圖形

自資料造可視化：

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

**預期：** SVG 長條圖已生，資料已縮放
**失敗時：** 處邊界案（空資料、負值），加驗證

### 6. 批次生圖

自動化多圖之造：

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

**預期：** 各資料項皆生獨立圖形
**失敗時：** 察資料結構，缺欄以預設值處之

### 7. SVG 轉點陣

匯 SVG 為 PNG/PDF 以供多用：

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

**預期：** 點陣輸出已生於指定解析度
**失敗時：** 若缺則裝 cairo 系統庫，察 SVG 之有效性

## 驗證清單

- [ ] 圖形於目標應用中渲染無誤
- [ ] 文字可讀且位置得宜
- [ ] 色合規格（察十六進制碼）
- [ ] 尺寸合用例
- [ ] SVG 合標準（若需）
- [ ] 點陣匯出 DPI 正確
- [ ] 佈局適應資料變動
- [ ] 批次處理完而無誤
- [ ] 輸出檔分組得宜
- [ ] 程式含誤處理

## 常見陷阱

1. **單位之惑**：SVG 單位（px、mm、cm）與螢幕像素、印刷 DPI 之別
2. **文字溢**：文字超形狀邊界；宜施換行
3. **字體可得**：系統字體或異，宜內嵌或用網安之字體
4. **座標計**：網格佈局中之差一錯
5. **色格式**：SVG 用十六進制字串（`#rrggbb`），非元組
6. **SVG 有效性**：察 XML 結構，閉所有標籤
7. **檔路**：處特殊字元與檔名中之空
8. **記憶體用**：大批次操作或需分塊
9. **比例**：改尺寸時保比
10. **透明**：PNG 支援 alpha，JPEG 則否

## 相關技能

- **[render-publication-graphic](../render-publication-graphic/SKILL.md)**：出版專屬之輸出需求
- **[create-3d-scene](../../blender/create-3d-scene/SKILL.md)**：三維之類似程式化法
- **[generate-quarto-report](../../reporting/generate-quarto-report/SKILL.md)**：整合圖形於報告中
