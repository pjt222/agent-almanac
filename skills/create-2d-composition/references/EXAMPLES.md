# Examples — create-2d-composition

Extended reference material extracted from `SKILL.md` to keep it under the 500-line limit (progressive disclosure: https://agentskills.io/specification).

## Composite Raster Images (Step 4)

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
