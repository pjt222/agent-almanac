/**
 * scene.js — Compose pixel art sprites into campfire scenes.
 *
 * Arranges a campfire sprite with agent icons below it, centered
 * for the terminal width. Uses iTerm2 inline images when the terminal
 * supports them (WezTerm, iTerm2), otherwise falls back to half-block
 * pixel art.
 *
 * Inline images: the terminal handles vertical spacing after each image.
 * No blank-line reservations — WezTerm advances the cursor past the
 * image automatically.
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

// Inline image display sizes in screen pixels.
// Fire PNG is 512×640 → display at 150px wide (height auto = 188px).
// Agent icon PNGs are 128×128 → strip display at 120px tall (width auto).
const INLINE_FIRE_W_PX = 150;
const INLINE_ICON_H_PX = 120;

/**
 * Build a campfire scene with agents gathered around the fire.
 *
 * @param {object} options
 * @param {'burning'|'embers'|'cold'} options.state - Fire state.
 * @param {string[]} [options.agentIds] - Agent IDs to show.
 * @param {string}   [options.teamId]   - Team ID (for pre-composed strip lookup).
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
        return [renderInlineImage(firePng, { widthPx: INLINE_FIRE_W_PX })];
      }
    }
    const indent = Math.max(0, Math.floor((maxWidth - fireW) / 2));
    return renderSprite(fireSprite, { indent });
  }

  // Try inline images first (WezTerm, iTerm2).
  if (canInlineImage()) {
    const strip = teamId ? getTeamStrip(teamId) : null;
    if (strip) {
      return buildInlineScene({ fireState: state, stripPng: strip, agentIds });
    }
    const hasAllPngs = agentIds.every(id => getAgentPng(id));
    if (hasAllPngs) {
      return buildInlineScene({ fireState: state, agentIds });
    }
  }

  // Fallback: half-block pixel art.
  return buildHalfBlockScene({ fireSprite, agentIds, leadId, maxWidth });
}

/**
 * Build scene with inline PNG images.
 * Each image is emitted on its own line — WezTerm advances the cursor
 * past the image automatically. No blank-line hacks.
 */
function buildInlineScene({ fireState, stripPng, agentIds }) {
  const lines = [];

  // Campfire image.
  const firePng = getCampfirePng(fireState || 'burning');
  if (firePng) {
    lines.push(renderInlineImage(firePng, { widthPx: INLINE_FIRE_W_PX }));
  }

  // Agent icons — team strip or individual.
  if (stripPng) {
    lines.push(renderInlineImage(stripPng, { heightPx: INLINE_ICON_H_PX }));
  } else if (agentIds) {
    for (const id of agentIds) {
      const png = getAgentPng(id);
      if (png) lines.push(renderInlineImage(png, { heightPx: INLINE_ICON_H_PX }));
    }
  }

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

  const fireX = Math.floor((canvasW - fireW) / 2);
  layers.push({ sprite: fireSprite, x: fireX, y: 0 });

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
