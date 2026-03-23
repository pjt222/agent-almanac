/**
 * scene.js — Compose pixel art sprites into campfire scenes.
 *
 * Arranges a campfire sprite with agent icons below it, centered
 * for the terminal width. Uses iTerm2 inline images when the terminal
 * supports them (WezTerm, iTerm2), otherwise falls back to half-block
 * pixel art.
 */

import { renderSprite, composite } from './pixel-renderer.js';
import {
  getCampfireSprite,
  createAgentGlyph,
  getAgentPng,
  getTeamStrip,
  getCampfirePng,
  GLYPH_SIZE,
} from './sprites.js';
import { canInlineImage, renderInlineImage } from './inline-image.js';

const MARKER_W = GLYPH_SIZE;
const MARKER_GAP = 4;
const MARKER_H = GLYPH_SIZE;
const VERT_GAP = 2; // pixel rows between fire and agents

// Inline image display sizes in character cells.
const INLINE_ICON_H = 8;    // icon height (width auto from aspect ratio)
const INLINE_ICON_GAP = 2;  // spaces between inline icons
const INLINE_FIRE_W = 16;   // fire width (height auto from aspect ratio)
const INLINE_FIRE_ROWS = 12; // approximate fire height in rows (for spacing reserve)

/**
 * Build a campfire scene with agents gathered around the fire.
 *
 * @param {object} options
 * @param {'burning'|'embers'|'cold'} options.state - Fire state.
 * @param {string[]} [options.agentIds] - Agent IDs to show.
 * @param {string}   [options.leadId]   - Fire keeper (gets amber accent).
 * @param {number}   [options.maxWidth] - Terminal width for centering.
 * @returns {string[]} Terminal-ready lines.
 */
export function buildFireScene({ state, agentIds = [], teamId, leadId, maxWidth = 80 }) {
  const fireSprite = getCampfireSprite(state || 'cold');
  const fireW = fireSprite[0].length;

  // Fire only — no agents.
  if (agentIds.length === 0) {
    if (canInlineImage()) {
      const firePng = getCampfirePng(state || 'cold');
      if (firePng) {
        return buildInlineFireOnly(firePng, maxWidth);
      }
    }
    const indent = Math.max(0, Math.floor((maxWidth - fireW) / 2));
    return renderSprite(fireSprite, { indent });
  }

  // Try inline images first (WezTerm, iTerm2).
  if (canInlineImage()) {
    // Prefer pre-composed team strip (all icons in one image).
    const strip = teamId ? getTeamStrip(teamId) : null;
    if (strip) {
      return buildInlineScene({ fireSprite, fireState: state, stripPng: strip, agentCount: agentIds.length, maxWidth });
    }
    // Fall back to individual PNGs if no strip.
    const hasAllPngs = agentIds.every(id => getAgentPng(id));
    if (hasAllPngs) {
      return buildInlineScene({ fireSprite, fireState: state, agentIds, maxWidth });
    }
  }

  // Fallback: half-block pixel art.
  return buildHalfBlockScene({ fireSprite, agentIds, leadId, maxWidth });
}

/**
 * Build scene with inline PNG images for agent icons.
 * Campfire stays as half-block art; agents render as actual pixel images.
 *
 * Uses a pre-composed team strip (single image with all members side by side)
 * to avoid cursor positioning issues in WezTerm.
 */
function buildInlineScene({ fireSprite, fireState, stripPng, agentIds, agentCount, maxWidth }) {
  const lines = [];

  // Render campfire — prefer inline PNG, fall back to half-block.
  // Fire is taller than wide (512×640), so specify WIDTH and let height auto-calculate.
  const firePng = getCampfirePng(fireState || 'burning');
  if (firePng) {
    const fireW = INLINE_FIRE_W;
    const fireIndent = Math.max(0, Math.floor((maxWidth - fireW) / 2));
    lines.push(' '.repeat(fireIndent) + renderInlineImage(firePng, { width: fireW }));
    // Reserve space — fire at width=16 with 512:640 ratio ≈ 20 rows tall.
    for (let i = 0; i < INLINE_FIRE_ROWS; i++) lines.push('');
  } else {
    const fireW = fireSprite[0].length;
    const fireIndent = Math.max(0, Math.floor((maxWidth - fireW) / 2));
    lines.push(...renderSprite(fireSprite, { indent: fireIndent }));
  }
  lines.push(''); // gap

  if (stripPng) {
    // Team strip is wider than tall — specify HEIGHT and let width auto-calculate.
    lines.push(renderInlineImage(stripPng, { height: INLINE_ICON_H }));
  } else if (agentIds) {
    // Individual images (vertical fallback).
    for (const id of agentIds) {
      const png = getAgentPng(id);
      if (png) lines.push(renderInlineImage(png, { height: INLINE_ICON_H }));
    }
  }

  // Blank lines to prevent text overlapping the image.
  for (let i = 0; i < INLINE_ICON_H; i++) lines.push('');

  return lines;
}

/**
 * Build scene with half-block pixel art for agent icons (fallback).
 */
function buildHalfBlockScene({ fireSprite, agentIds, leadId, maxWidth }) {
  const fireW = fireSprite[0].length;
  const fireH = fireSprite.length;

  const agentCount = agentIds.length;
  const agentsRowW = agentCount * (MARKER_W + MARKER_GAP) - MARKER_GAP;
  const canvasW = Math.max(fireW, agentsRowW);
  const canvasH = fireH + VERT_GAP + MARKER_H;

  const layers = [];

  // Center fire horizontally on canvas.
  const fireX = Math.floor((canvasW - fireW) / 2);
  layers.push({ sprite: fireSprite, x: fireX, y: 0 });

  // Place agent markers in a row below the fire.
  const agentsStartX = Math.floor((canvasW - agentsRowW) / 2);
  const agentsStartY = fireH + VERT_GAP;

  for (let i = 0; i < agentCount; i++) {
    const isLead = agentIds[i] === leadId;
    const marker = createAgentGlyph(agentIds[i], isLead);
    const markerX = agentsStartX + i * (MARKER_W + MARKER_GAP);
    layers.push({ sprite: marker, x: markerX, y: agentsStartY });
  }

  const canvas = composite(canvasW, canvasH, layers);
  const indent = Math.max(0, Math.floor((maxWidth - canvasW) / 2));
  return renderSprite(canvas, { indent });
}

/**
 * Build fire-only scene as inline image.
 */
function buildInlineFireOnly(firePng, maxWidth) {
  const fireIndent = Math.max(0, Math.floor((maxWidth - INLINE_FIRE_W) / 2));
  const lines = [];
  lines.push(' '.repeat(fireIndent) + renderInlineImage(firePng, { width: INLINE_FIRE_W }));
  for (let i = 0; i < INLINE_FIRE_ROWS; i++) lines.push('');
  return lines;
}
