/**
 * pixel-renderer.js — Half-block terminal pixel art renderer.
 *
 * Renders 2D arrays of hex colors to terminal strings using the upper half
 * block character (▀ U+2580). Each terminal character cell encodes two
 * vertical pixels: foreground = top pixel, background = bottom pixel.
 *
 * Zero dependencies beyond chalk (already in the project).
 */

import { chalk } from './reporter.js';

const UPPER_HALF = '\u2580'; // ▀
const LOWER_HALF = '\u2584'; // ▄

// Cache chalk instances per color to avoid repeated parsing.
const fgCache = new Map();
const bgCache = new Map();

function fgColor(hex) {
  if (!fgCache.has(hex)) fgCache.set(hex, chalk.hex(hex));
  return fgCache.get(hex);
}

function bgColor(hex) {
  if (!bgCache.has(hex)) bgCache.set(hex, chalk.bgHex(hex));
  return bgCache.get(hex);
}

/**
 * Check whether the terminal supports truecolor pixel art.
 * @returns {boolean}
 */
export function canRenderPixelArt() {
  const level = chalk.level;
  return typeof level === 'number'
    && level >= 1
    && process.stdout.isTTY === true
    && (process.stdout.columns || 0) >= 40;
}

/**
 * Render a sprite (2D pixel array) to terminal strings.
 *
 * @param {(string|null)[][]} pixels - Rows of hex color strings. null = transparent.
 * @param {object} [options]
 * @param {number} [options.indent=0] - Left padding in spaces.
 * @returns {string[]} One string per terminal row (each encodes 2 pixel rows).
 */
export function renderSprite(pixels, options = {}) {
  const indent = options.indent || 0;
  const pad = indent > 0 ? ' '.repeat(indent) : '';
  const rows = [...pixels];

  // Pad to even height.
  if (rows.length % 2 !== 0) {
    rows.push(new Array(rows[0]?.length || 0).fill(null));
  }

  const lines = [];
  for (let r = 0; r < rows.length; r += 2) {
    const topRow = rows[r];
    const bottomRow = rows[r + 1];
    const width = Math.max(topRow.length, bottomRow.length);
    const parts = [];

    for (let c = 0; c < width; c++) {
      const top = topRow[c] || null;
      const bottom = bottomRow[c] || null;

      if (top && bottom) {
        parts.push(fgColor(top)(bgColor(bottom)(UPPER_HALF)));
      } else if (top) {
        parts.push(fgColor(top)(UPPER_HALF));
      } else if (bottom) {
        parts.push(fgColor(bottom)(LOWER_HALF));
      } else {
        parts.push(' ');
      }
    }

    lines.push(pad + parts.join(''));
  }

  return lines;
}

/**
 * Composite multiple sprites onto a canvas.
 *
 * @param {number} width  - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {{sprite: (string|null)[][], x: number, y: number}[]} layers
 *   Layers painted in order (later layers overwrite earlier for non-null pixels).
 * @returns {(string|null)[][]} Composited pixel grid.
 */
export function composite(width, height, layers) {
  // Create blank canvas.
  const canvas = Array.from({ length: height }, () => new Array(width).fill(null));

  for (const { sprite, x, y } of layers) {
    for (let row = 0; row < sprite.length; row++) {
      const canvasRow = y + row;
      if (canvasRow < 0 || canvasRow >= height) continue;
      for (let col = 0; col < sprite[row].length; col++) {
        const canvasCol = x + col;
        if (canvasCol < 0 || canvasCol >= width) continue;
        const pixel = sprite[row][col];
        if (pixel !== null) {
          canvas[canvasRow][canvasCol] = pixel;
        }
      }
    }
  }

  return canvas;
}
