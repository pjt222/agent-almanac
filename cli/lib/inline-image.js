/**
 * inline-image.js — iTerm2 inline image protocol for terminal rendering.
 *
 * Detects whether the terminal supports inline images (WezTerm, iTerm2,
 * Mintty, etc.) and emits escape sequences that render actual PNG pixels
 * inline at the cursor position.
 *
 * Protocol: ESC ] 1337 ; File=inline=1;width=<N> : <base64png> BEL
 *
 * Falls back gracefully — canInlineImage() returns false for unsupported
 * terminals, and the caller uses half-block pixel art instead.
 */

const ESC = '\x1b';
const BEL = '\x07';

/**
 * Check whether the terminal supports iTerm2 inline images.
 * @returns {boolean}
 */
export function canInlineImage() {
  if (!process.stdout.isTTY) return false;

  const prog = process.env.TERM_PROGRAM || '';
  const lcTerm = process.env.LC_TERMINAL || '';

  // Known terminals with iTerm2 inline image support.
  if (prog === 'WezTerm') return true;
  if (prog === 'iTerm.app') return true;
  if (lcTerm === 'iTerm2') return true;
  if (prog === 'mintty') return true;

  return false;
}

/**
 * Render a base64 PNG as an inline image escape sequence.
 *
 * @param {string} base64png - Base64-encoded PNG data.
 * @param {number} [widthCells=16] - Display width in character cells.
 * @param {number} [heightCells=8] - Display height in character cells.
 * @returns {string} Escape sequence string (print to stdout).
 */
export function renderInlineImage(base64png, widthCells = 16, heightCells = 8) {
  return `${ESC}]1337;File=inline=1;width=${widthCells};height=${heightCells};preserveAspectRatio=1:${base64png}${BEL}`;
}

/**
 * Move cursor up N rows.
 * @param {number} n
 * @returns {string}
 */
export function cursorUp(n) {
  return `${ESC}[${n}A`;
}

/**
 * Move cursor right N columns.
 * @param {number} n
 * @returns {string}
 */
export function cursorRight(n) {
  return `${ESC}[${n}C`;
}
