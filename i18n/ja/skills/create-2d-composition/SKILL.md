---
name: create-2d-composition
description: >
  SVG生成、ダイアグラムレイアウトアルゴリズム、画像合成、バッチ処理ワークフローを使用して
  プログラム的に2Dグラフィックスを作成する。ダイアグラム、フローチャート、インフォグラフィックスの
  プログラム的生成時、再現可能な科学的図版の作成時、バッジやビジュアルアセットの自動生成時、
  標準ライブラリにないカスタムチャートタイプの構築時、パラメータバリエーションによる
  バッチグラフィックス生成時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: intermediate
  language: Python
  tags: svg, 2d, graphics, composition, diagrams, scripting, batch-processing
  locale: ja
  source_locale: en
  source_commit: 4859067d
  translator: claude
  translation_date: "2026-03-17"
---

# 2Dコンポジションの作成

SVG構築、ダイアグラムレイアウトアルゴリズム、画像合成、バッチ処理ワークフローを使用してプログラム的に2Dグラフィックスを生成する。ベクターグラフィックス生成、ラスター画像操作、タイポグラフィ、チャート・ダイアグラム・インフォグラフィックスの自動生成をカバーする。

## 使用タイミング

- ダイアグラム、フローチャート、インフォグラフィックスをプログラム的に生成する時
- 再現可能な科学的図版や出版用グラフィックスを作成する時
- バッジ、アイコン、ビジュアルアセットの生成を自動化する時
- 複数の画像やデータビジュアライゼーションを合成する時
- 標準ライブラリにないカスタムチャートタイプを構築する時
- パラメータバリエーションによりグラフィックスをバッチ生成する時
- Web用またはプリント用のSVGテンプレートを作成する時

## 入力

| 入力 | 型 | 説明 | 例 |
|------|------|------|------|
| レイアウト仕様 | 設定 | 寸法、マージン、グリッドレイアウト | キャンバス800x600px、20pxマージン |
| ビジュアル要素 | データ/アセット | 図形、テキスト、画像、データポイント | 矩形座標、ラベル、アイコン |
| スタイルパラメータ | CSS/属性 | 色、フォント、線幅、不透明度 | `fill="#3366cc"`, `stroke-width="2"` |
| データソース | ファイル/配列 | 可視化またはアノテーション用の値 | CSVデータ、JSON設定 |
| 出力フォーマット | 文字列 | SVG、PNG、PDF、合成フォーマット | `output.svg`、300 DPI PNG |

## 手順

### 1. Python環境のセットアップ

2Dコンポジションに必要なライブラリをインストールする:

```bash
# Core libraries
pip install svgwrite pillow cairosvg

# Optional: advanced features
pip install drawsvg reportlab pycairo

# For data-driven graphics
pip install matplotlib numpy pandas
```

**期待結果:** ライブラリが正常にインストールされる
**失敗時:** Pythonバージョン（3.7以上）を確認し、競合を避けるため仮想環境を使用する

### 2. 基本的なSVGグラフィックスの作成

svgwriteを使用してSVGを生成する:

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

**期待結果:** 図形とテキストを含むSVGファイルが生成される
**失敗時:** svgwriteのバージョンを確認し、出力ディレクトリが書き込み可能か確認する

### 3. レイアウトロジックによるダイアグラムの構築

計算された配置で構造化ダイアグラムを作成する:

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

**期待結果:** 接続されたボックスと矢印を持つフローチャート
**失敗時:** レイアウト計算を調整し、矢印マーカー定義を確認する

### 4. ラスター画像の合成

Pillowを使用して複数の画像を結合する:

```python
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

def composite_images(image_paths, output_path, layout='grid'):
    """Composite multiple images into single output."""
    # Load images
    images = [Image.open(path) for path in image_paths]

    if layout == 'grid':
        n = len(images)
        cols = int(n ** 0.5)
        rows = (n + cols - 1) // cols
        max_width = max(img.width for img in images)
        max_height = max(img.height for img in images)
        canvas_width = cols * max_width
        canvas_height = rows * max_height
        composite = Image.new('RGB', (canvas_width, canvas_height), 'white')
        for i, img in enumerate(images):
            row = i // cols
            col = i % cols
            x = col * max_width
            y = row * max_height
            composite.paste(img, (x, y))

    elif layout == 'horizontal':
        total_width = sum(img.width for img in images)
        max_height = max(img.height for img in images)
        composite = Image.new('RGB', (total_width, max_height), 'white')
        x_offset = 0
        for img in images:
            composite.paste(img, (x_offset, 0))
            x_offset += img.width

    elif layout == 'vertical':
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
    try:
        font = ImageFont.truetype("Arial.ttf", 24)
    except:
        font = ImageFont.load_default()

    for annotation in annotations:
        text = annotation['text']
        position = annotation['position']
        color = annotation.get('color', 'black')
        shadow_offset = 2
        draw.text(
            (position[0] + shadow_offset, position[1] + shadow_offset),
            text, font=font, fill='white'
        )
        draw.text(position, text, font=font, fill=color)

    img.save(output_path)
```

**期待結果:** 適切なレイアウトで合成画像が作成される
**失敗時:** すべての入力画像が存在するか確認し、画像モードに互換性があるか検証する

### 5. データ駆動グラフィックスの生成

データからビジュアライゼーションを作成する:

```python
import numpy as np

def create_bar_chart_svg(data, labels, output_path):
    """Generate SVG bar chart from data."""
    dwg = svgwrite.Drawing(output_path, size=('600px', '400px'))
    margin = 50
    chart_width = 500
    chart_height = 300
    bar_spacing = 10
    n_bars = len(data)
    bar_width = (chart_width - (n_bars - 1) * bar_spacing) / n_bars
    max_value = max(data)
    scale = chart_height / max_value

    # Draw axes
    dwg.add(dwg.line(start=(margin, margin), end=(margin, margin + chart_height),
        stroke='black', stroke_width=2))
    dwg.add(dwg.line(start=(margin, margin + chart_height),
        end=(margin + chart_width, margin + chart_height),
        stroke='black', stroke_width=2))

    for i, (value, label) in enumerate(zip(data, labels)):
        x = margin + i * (bar_width + bar_spacing)
        bar_height = value * scale
        y = margin + chart_height - bar_height
        dwg.add(dwg.rect(insert=(x, y), size=(bar_width, bar_height),
            fill='steelblue', stroke='navy', stroke_width=1))
        dwg.add(dwg.text(f'{value:.1f}', insert=(x + bar_width/2, y - 5),
            text_anchor='middle', font_size='10pt', fill='black'))
        dwg.add(dwg.text(label, insert=(x + bar_width/2, margin + chart_height + 20),
            text_anchor='middle', font_size='10pt', fill='black'))

    dwg.save()
```

**期待結果:** スケーリングされたデータを持つSVG棒グラフ
**失敗時:** エッジケース（空データ、負の値）を処理し、バリデーションを追加する

### 6. グラフィックスのバッチ生成

複数グラフィックスの作成を自動化する:

```python
def batch_generate_badges(users, template_path, output_dir):
    """Generate badge for each user."""
    os.makedirs(output_dir, exist_ok=True)

    for user in users:
        output_path = os.path.join(output_dir, f"{user['id']}_badge.svg")
        dwg = svgwrite.Drawing(output_path, size=('300px', '100px'))
        dwg.add(dwg.rect(insert=(0, 0), size=('100%', '100%'),
            fill='#3366cc', rx=10, ry=10))
        dwg.add(dwg.text(user['name'], insert=(150, 40),
            text_anchor='middle', font_size='20pt',
            font_weight='bold', fill='white'))
        dwg.add(dwg.text(user['role'], insert=(150, 70),
            text_anchor='middle', font_size='14pt', fill='lightblue'))
        dwg.save()
        print(f"Generated badge: {output_path}")
```

**期待結果:** 各データ項目に対して個別のグラフィックが生成される
**失敗時:** データ構造を確認し、欠損フィールドにデフォルト値を設定する

### 7. SVGからラスターへの変換

SVGをPNG/PDFに書き出して様々な用途に使用する:

```python
import cairosvg

def svg_to_png(svg_path, png_path, dpi=300):
    """Convert SVG to PNG with specified DPI."""
    width_inches = 8.27
    height_inches = 11.69
    width_px = int(width_inches * dpi)
    height_px = int(height_inches * dpi)
    cairosvg.svg2png(url=svg_path, write_to=png_path,
        output_width=width_px, output_height=height_px)
    print(f"Converted to PNG: {png_path}")

def svg_to_pdf(svg_path, pdf_path):
    """Convert SVG to PDF."""
    cairosvg.svg2pdf(url=svg_path, write_to=pdf_path)
    print(f"Converted to PDF: {pdf_path}")
```

**期待結果:** 指定された解像度でラスター出力が生成される
**失敗時:** cairoシステムライブラリが不足している場合はインストールし、SVGの妥当性を確認する

## バリデーション

- [ ] ターゲットアプリケーションでグラフィックスが正しくレンダリングされる
- [ ] テキストが読みやすく適切に配置されている
- [ ] 色が仕様に一致している（16進コードを確認）
- [ ] 用途に適した寸法である
- [ ] SVGが標準に対して妥当である（必要な場合）
- [ ] ラスター書き出しが正しいDPIである
- [ ] レイアウトがデータのバリエーションに対応している
- [ ] バッチ処理がエラーなく完了する
- [ ] 出力ファイルが論理的に整理されている
- [ ] コードにエラーハンドリングが含まれている

## よくある落とし穴

1. **単位の混同**: SVG単位（px、mm、cm）とスクリーンピクセル、プリントDPIの違い
2. **テキストのオーバーフロー**: テキストが図形の境界を超える場合、折り返しを実装する
3. **フォントの可用性**: システムフォントは環境により異なる。埋め込みフォントまたはWebセーフフォントを使用する
4. **座標計算**: グリッドレイアウトでのオフバイワンエラー
5. **色フォーマット**: SVGは16進文字列（`#rrggbb`）を使用し、タプルではない
6. **SVGの妥当性**: XML構造を確認し、すべてのタグを閉じる
7. **ファイルパス**: 特殊文字やファイル名のスペースを処理する
8. **メモリ使用量**: 大規模なバッチ操作にはチャンキングが必要な場合がある
9. **アスペクト比**: 画像のリサイズ時に比率を維持する
10. **透過性**: PNGはアルファをサポートするが、JPEGはサポートしない

## 関連スキル

- **[render-publication-graphic](../render-publication-graphic/SKILL.md)**: 出版物固有の出力要件
- **[create-3d-scene](../../blender/create-3d-scene/SKILL.md)**: 3D向けの同様のプログラマティックアプローチ
- **[generate-quarto-report](../../reporting/generate-quarto-report/SKILL.md)**: レポートへのグラフィックス統合
