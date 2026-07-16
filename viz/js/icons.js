/**
 * icons.js - Shared icon state and path utility
 *
 * Single source of truth for icon mode across all visualization modes (2D, 3D, Hive).
 * Each renderer maintains its own format-specific cache (Image, THREE.Texture, SVG path).
 */

import { getCurrentThemeName } from './colors.js';

let iconMode = false;
let hdMode = false;
export const ICON_ZOOM_THRESHOLD = 1.0;

export function setIconMode(v) { iconMode = !!v; }
export function getIconMode() { return iconMode; }

export function setHdMode(v) { hdMode = !!v; }
export function getHdMode() { return hdMode; }

/** Cache key that distinguishes standard vs HD for a given palette */
export function iconCacheKey(palette) {
  const pal = palette || getCurrentThemeName();
  return hdMode ? `${pal}@hd` : pal;
}

export function getIconPath(node, palette) {
  const pal = palette || getCurrentThemeName();
  const dir = hdMode ? 'icons-hd' : 'icons';
  if (node.type === 'team') return `${dir}/${pal}/teams/${node.id.replace('team:', '')}.webp`;
  if (node.type === 'agent') return `${dir}/${pal}/agents/${node.id.replace('agent:', '')}.webp`;
  return `${dir}/${pal}/${node.domain}/${node.id}.webp`;
}

// ── Loaded-icon tracker (shared across renderers) ────────────────
const loadedIcons = new Map(); // cacheKey -> Set(nodeId)

export function markIconLoaded(palette, nodeId) {
  const key = iconCacheKey(palette);
  if (!loadedIcons.has(key)) loadedIcons.set(key, new Set());
  loadedIcons.get(key).add(nodeId);
}

export function isIconLoaded(nodeId, palette) {
  const key = iconCacheKey(palette);
  return loadedIcons.has(key) && loadedIcons.get(key).has(nodeId);
}
