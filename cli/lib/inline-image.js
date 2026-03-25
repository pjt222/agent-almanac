/**
 * inline-image.js — iTerm2 inline image protocol for terminal rendering.
 *
 * Detects whether the terminal supports inline images (WezTerm, iTerm2,
 * Mintty, etc.) and emits escape sequences that render actual PNG pixels
 * inline at the cursor position.
 *
 * Protocol: ESC ] 1337 ; File=inline=1;width=<N>px : <base64png> BEL
 *
 * Uses pixel units (Npx) instead of character cells to avoid ambiguity
 * across terminals with different cell dimensions.
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

  if (prog === 'WezTerm') return true;
  if (prog === 'iTerm.app') return true;
  if (lcTerm === 'iTerm2') return true;
  if (prog === 'mintty') return true;

  return false;
}

/**
 * Render a base64 PNG as an inline image escape sequence.
 *
 * Size is specified in screen pixels (px suffix) for consistency across
 * terminals. Omit a dimension to let the terminal auto-calculate it
 * from the image's aspect ratio.
 *
 * @param {string} base64png - Base64-encoded PNG data.
 * @param {object} [size] - Display size in screen pixels.
 * @param {number} [size.widthPx] - Width in pixels.
 * @param {number} [size.heightPx] - Height in pixels.
 * @returns {string} Escape sequence string (print to stdout).
 */
export function renderInlineImage(base64png, size = {}) {
  const parts = ['inline=1'];
  if (size.widthPx) parts.push(`width=${size.widthPx}px`);
  if (size.heightPx) parts.push(`height=${size.heightPx}px`);
  parts.push('preserveAspectRatio=1');
  return `${ESC}]1337;File=${parts.join(';')}:${base64png}${BEL}`;
}
