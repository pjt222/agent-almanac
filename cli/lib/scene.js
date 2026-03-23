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

// Inline image display size in character cells.
// Terminal cells are ~2:1 height:width, so height = width/2 for square images.
const INLINE_ICON_W = 16;  // character cells wide
const INLINE_ICON_H = 8;   // character cells tall (square aspect)
const INLINE_ICON_GAP = 2; // spaces between inline icons

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
  const firePng = getCampfirePng(fireState || 'burning');
  if (firePng) {
    const fireCells = 16; // display width in character cells
    const fireH = 8;      // display height (roughly square for the fire aspect)
    const fireIndent = Math.max(0, Math.floor((maxWidth - fireCells) / 2));
    lines.push(' '.repeat(fireIndent) + renderInlineImage(firePng, fireCells, fireH));
    // Reserve space for the fire image.
    for (let i = 0; i < fireH; i++) lines.push('');
  } else {
    const fireW = fireSprite[0].length;
    const fireIndent = Math.max(0, Math.floor((maxWidth - fireW) / 2));
    lines.push(...renderSprite(fireSprite, { indent: fireIndent }));
  }
  lines.push(''); // gap

  if (stripPng) {
    // Single pre-composed strip image — all agents side by side.
    const count = agentCount || 4;
    const stripCells = count * INLINE_ICON_W + (count - 1) * INLINE_ICON_GAP;
    // Center the strip under the fire.
    const stripIndent = Math.max(0, Math.floor((maxWidth - stripCells) / 2));
    lines.push(' '.repeat(stripIndent) + renderInlineImage(stripPng, stripCells, INLINE_ICON_H));
  } else if (agentIds) {
    // Individual images (vertical fallback).
    for (const id of agentIds) {
      const png = getAgentPng(id);
      if (png) lines.push(renderInlineImage(png, INLINE_ICON_W, INLINE_ICON_H));
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
