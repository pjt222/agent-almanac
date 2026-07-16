// graph.js - Force-graph setup, node/link rendering, interactions
// put id:"mode_2d", label:"Canvas-based 2D force-directed layout (force-graph)", node_type:"process", input:"active_module"

import ForceGraph from 'force-graph';
import { getColor, COMPLEXITY_CONFIG, FEATURED_NODES, hexToRgba, getAgentColor, getTeamColor, AGENT_PRIORITY_CONFIG, TEAM_CONFIG, getCurrentThemeName } from './colors.js';
import { getIconMode, getIconPath, ICON_ZOOM_THRESHOLD, markIconLoaded, iconCacheKey } from './icons.js';
import { logEvent } from './eventlog.js';

/** Resolve a link endpoint that may be a string ID or an object reference (force-graph mutates these). */
function resolveNodeId(ref) {
  return typeof ref === 'object' ? ref.id : ref;
}

let graph = null;
let graphData = { nodes: [], links: [] };
let fullData = { nodes: [], links: [] };
let selectedNodeId = null;
let hoveredNodeId = null;
let onNodeClick = null;
let onNodeHover = null;

// ── Icon state ──────────────────────────────────────────────────────
const cachedPaletteIcons = new Map(); // palette -> Map(nodeId -> Image)
let activeIconMap = new Map();        // current palette's nodeId -> Image

// ── Performance caches ──────────────────────────────────────────────
let highlightedNodeIds = null;  // Set of active + neighbor IDs (null = all highlighted)
let nodeById = new Map();       // id -> node for O(1) lookup
let cachedFontScale = 0;
let cachedFontBold = '';
let cachedFontNormal = '';

// ── Pre-computed adjacency map ───────────────────────────────────
let adjacencyMap = new Map(); // nodeId -> { skills: Set, agents: Set, teams: Set }

function buildAdjacencyMap(links) {
  adjacencyMap.clear();
  const ensure = (id) => {
    if (!adjacencyMap.has(id)) adjacencyMap.set(id, { skills: new Set(), agents: new Set(), teams: new Set() });
    return adjacencyMap.get(id);
  };
  for (const link of links) {
    const srcId = resolveNodeId(link.source);
    const tgtId = resolveNodeId(link.target);
    const srcAdj = ensure(srcId);
    const tgtAdj = ensure(tgtId);
    const type = link.type;
    if (type === 'team') {
      srcAdj.teams.add(tgtId);
      tgtAdj.teams.add(srcId);
    } else if (type === 'agent') {
      srcAdj.agents.add(tgtId);
      tgtAdj.agents.add(srcId);
    } else {
      srcAdj.skills.add(tgtId);
      tgtAdj.skills.add(srcId);
    }
  }
}

// ── Gradient texture cache ────────────────────────────────────────
const GLOW_TEX_SIZE = 64;
const glowCache = new Map(); // "profile|#hex" -> OffscreenCanvas

function getGlowTexture(profile, hex) {
  const key = profile + '|' + hex;
  let tex = glowCache.get(key);
  if (tex) return tex;
  if (typeof OffscreenCanvas === 'undefined') return null;
  const s = GLOW_TEX_SIZE, c = s / 2, outerR = c;
  const innerR = profile === 'icon' ? outerR * 0.3 : outerR * 0.17;
  tex = new OffscreenCanvas(s, s);
  const tctx = tex.getContext('2d');
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const grad = tctx.createRadialGradient(c, c, innerR, c, c, outerR);
  grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  tctx.fillStyle = grad;
  tctx.fillRect(0, 0, s, s);
  glowCache.set(key, tex);
  return tex;
}

function drawGlow(ctx, x, y, radius, profile, hex, opacity) {
  const tex = getGlowTexture(profile, hex);
  if (tex) {
    const prev = ctx.globalAlpha;
    ctx.globalAlpha = opacity;
    ctx.drawImage(tex, x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalAlpha = prev;
  } else {
    // Fallback: live gradient (old browsers without OffscreenCanvas)
    const innerR = profile === 'icon' ? radius * 0.3 : radius * 0.17;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(x, y, innerR, x, y, radius);
    grad.addColorStop(0, hexToRgba(hex, opacity));
    grad.addColorStop(1, hexToRgba(hex, 0));
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

// ── Agent & Team state ──────────────────────────────────────────────
let visibleAgentIds = null; // null = all visible, Set = specific IDs
let visibleTeamIds = null;  // null = all visible, Set = specific IDs

export function setAgentsVisible(v) {
  // Backward compat: boolean toggles all agents
  if (typeof v === 'boolean') {
    visibleAgentIds = v ? null : new Set();
  }
}

export function setVisibleAgents(ids) {
  visibleAgentIds = new Set(ids);
}

export function getAgentsVisible() {
  // Returns true if any agents are visible
  return visibleAgentIds === null || visibleAgentIds.size > 0;
}

export function getVisibleAgentIds() {
  return visibleAgentIds;
}

export function setVisibleTeams(ids) {
  visibleTeamIds = new Set(ids);
}

export function getVisibleTeamIds() {
  return visibleTeamIds;
}

// ── Performance helpers ─────────────────────────────────────────────
function rebuildHighlightSet() {
  const activeId = selectedNodeId || hoveredNodeId;
  if (!activeId) { highlightedNodeIds = null; return; }

  const activeNode = nodeById.get(activeId);
  const set = new Set([activeId]);
  const adj = adjacencyMap.get(activeId);
  if (!adj) { highlightedNodeIds = set; return; }

  if (activeNode && activeNode.type === 'team') {
    // Team: self + direct agents + those agents' skills
    for (const a of adj.teams) {
      set.add(a);
      const aAdj = adjacencyMap.get(a);
      if (aAdj) for (const s of aAdj.agents) set.add(s);
    }
  } else if (activeNode && activeNode.type === 'agent') {
    // Agent: self + direct skills + direct teams
    for (const t of adj.teams) set.add(t);
    for (const s of adj.agents) set.add(s);
  } else {
    // Skill: self + one-hop skills + direct agents + those agents' teams
    for (const a of adj.agents) {
      set.add(a);
      const aAdj = adjacencyMap.get(a);
      if (aAdj) for (const t of aAdj.teams) set.add(t);
    }
    for (const s of adj.skills) set.add(s);
  }

  highlightedNodeIds = set;
}

function rebuildNodeIndex() {
  nodeById = new Map();
  for (const n of graphData.nodes) nodeById.set(n.id, n);
}

function precomputeLinkColors() {
  for (const link of graphData.links) {
    if (link.type === 'team') {
      // Team links get team color from the source (team node)
      const src = typeof link.source === 'object' ? link.source : nodeById.get(resolveNodeId(link.source));
      if (src && src.type === 'team') {
        link._teamHex = getTeamColor(src.id.replace('team:', ''));
      } else {
        link._teamHex = getTeamColor();
      }
      link._agentHex = null;
      continue;
    }
    if (link.type !== 'agent') { link._agentHex = null; link._teamHex = null; continue; }
    link._teamHex = null;
    const src = typeof link.source === 'object' ? link.source : nodeById.get(resolveNodeId(link.source));
    if (src && src.type === 'agent') {
      link._agentHex = getAgentColor(src.id.replace('agent:', ''));
      continue;
    }
    const tgt = typeof link.target === 'object' ? link.target : nodeById.get(resolveNodeId(link.target));
    if (tgt && tgt.type === 'agent') {
      link._agentHex = getAgentColor(tgt.id.replace('agent:', ''));
    } else {
      link._agentHex = getAgentColor();
    }
  }
}

const SAME_DOMAIN_DISTANCE = 40;
const CROSS_DOMAIN_DISTANCE = 100;
const AGENT_LINK_DISTANCE = 120;
const TEAM_LINK_DISTANCE = 80;
const LABEL_ZOOM_THRESHOLD = 2.5;

export function initGraph(container, data, { onClick, onHover } = {}) {
  fullData = {
    nodes: data.nodes.map(n => ({ ...n })),
    links: data.links.map(l => ({ ...l })),
  };
  graphData = {
    nodes: fullData.nodes.map(n => ({ ...n })),
    links: fullData.links.map(l => ({ ...l })),
  };

  onNodeClick = onClick;
  onNodeHover = onHover;
  rebuildNodeIndex();
  buildAdjacencyMap(graphData.links);
  precomputeLinkColors();

  graph = ForceGraph()(container)
    .width(container.clientWidth || window.innerWidth)
    .height(container.clientHeight || (window.innerHeight - 48))
    .graphData(graphData)
    .backgroundColor('transparent')
    .nodeId('id')
    .linkSource('source')
    .linkTarget('target')
    .linkColor(link => {
      const isAgentLink = link.type === 'agent';
      const isTeamLink = link.type === 'team';
      const getAgentLinkColor = (alpha) => {
        if (link._agentHex) return hexToRgba(link._agentHex, alpha);
        return hexToRgba(getAgentColor(), alpha);
      };
      const getTeamLinkColor = (alpha) => {
        if (link._teamHex) return hexToRgba(link._teamHex, alpha);
        return hexToRgba(getTeamColor(), alpha);
      };
      if (!highlightedNodeIds) {
        if (isTeamLink) return getTeamLinkColor(0.06);
        return isAgentLink
          ? getAgentLinkColor(0.04)
          : 'rgba(255,255,255,0.06)';
      }
      const src = resolveNodeId(link.source);
      const tgt = resolveNodeId(link.target);
      const both = highlightedNodeIds.has(src) && highlightedNodeIds.has(tgt);
      if (both) {
        if (isTeamLink) return getTeamLinkColor(0.4);
        if (isAgentLink) return getAgentLinkColor(0.3);
        const activeId = selectedNodeId || hoveredNodeId;
        const connectedNode = nodeById.get(src === activeId ? tgt : src);
        const color = connectedNode ? getColor(connectedNode.domain) : '#ffffff';
        return hexToRgba(color, 0.35);
      }
      if (isTeamLink) return getTeamLinkColor(0.01);
      return isAgentLink ? getAgentLinkColor(0.01) : 'rgba(255,255,255,0.02)';
    })
    .linkWidth(link => {
      if (!highlightedNodeIds) return 0.5;
      const src = resolveNodeId(link.source);
      const tgt = resolveNodeId(link.target);
      return (highlightedNodeIds.has(src) && highlightedNodeIds.has(tgt)) ? 1.5 : 0.3;
    })
    .nodeCanvasObject(drawNode)
    .nodePointerAreaPaint(drawHitArea)
    .onNodeClick(handleNodeClick)
    .onNodeHover(handleNodeHover)
    .onBackgroundClick(handleBackgroundClick)
    .cooldownTicks(200)
    .warmupTicks(100);

  // Configure forces via the library's d3Force accessor
  graph.d3Force('link')
    .distance(link => {
      if (link.type === 'team') return TEAM_LINK_DISTANCE;
      if (link.type === 'agent') return AGENT_LINK_DISTANCE;
      const src = typeof link.source === 'object' ? link.source : nodeById.get(resolveNodeId(link.source));
      const tgt = typeof link.target === 'object' ? link.target : nodeById.get(resolveNodeId(link.target));
      return (src && tgt && src.domain === tgt.domain) ? SAME_DOMAIN_DISTANCE : CROSS_DOMAIN_DISTANCE;
    });

  graph.d3Force('charge').strength(-80);

  window.addEventListener('resize', () => {
    if (graph) {
      graph.width(container.clientWidth || window.innerWidth);
      graph.height(container.clientHeight || (window.innerHeight - 48));
    }
  });

  return graph;
}

export function destroyGraph() {
  if (graph) {
    graph.pauseAnimation();
    graph = null;
  }
  graphData = { nodes: [], links: [] };
  fullData = { nodes: [], links: [] };
  selectedNodeId = null;
  hoveredNodeId = null;
  highlightedNodeIds = null;
  nodeById = new Map();
  adjacencyMap.clear();
  glowCache.clear();
}

// ── Icon management ─────────────────────────────────────────────────
let _iconRefreshTimer = null;
function _scheduleIconRefresh() {
  if (_iconRefreshTimer) clearTimeout(_iconRefreshTimer);
  _iconRefreshTimer = setTimeout(() => {
    _iconRefreshTimer = null;
    if (graph) graph.nodeCanvasObject(drawNode);
  }, 100);
}

export function preloadIcons(nodes, palette) {
  const pal = palette || getCurrentThemeName();
  const cacheKey = iconCacheKey(pal);
  if (cachedPaletteIcons.has(cacheKey)) {
    activeIconMap = cachedPaletteIcons.get(cacheKey);
    return;
  }
  const palMap = new Map();
  cachedPaletteIcons.set(cacheKey, palMap);

  for (const node of nodes) {
    const path = getIconPath(node, pal);
    const img = new Image();
    img.onload = () => {
      palMap.set(node.id, img);
      markIconLoaded(pal, node.id);
      _scheduleIconRefresh();
    };
    img.onerror = () => { if (import.meta.env?.DEV) console.warn('Icon not found:', path); };
    img.src = path;
  }
  activeIconMap = palMap;
}

export function switchIconPalette(palette, nodes) {
  const cacheKey = iconCacheKey(palette);
  if (cachedPaletteIcons.has(cacheKey)) {
    activeIconMap = cachedPaletteIcons.get(cacheKey);
  } else {
    preloadIcons(nodes, palette);
  }
}

// ── Shape helpers ───────────────────────────────────────────────────
function drawHexPath(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // flat-top
    const vx = x + r * Math.cos(angle);
    const vy = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.closePath();
}

function drawOctPath(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 8; // flat-top octagon
    const vx = x + r * Math.cos(angle);
    const vy = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.closePath();
}

function drawPentPath(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (2 * Math.PI / 5) * i - Math.PI / 2; // point-up pentagon
    const vx = x + r * Math.cos(angle);
    const vy = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.closePath();
}

// ── Shared node rendering core ──────────────────────────────────────
// opts: { color, r, cfg, shapeFn, glowMult, centerDotR, labelFont, iconLabelY, glowLabelY, drawExtras? }
// drawExtras(ctx, node, x, y, r, iconSize, useIcon, alpha, color, globalScale) -- type-specific additions
function drawNodeBase(node, ctx, globalScale, opts) {
  const { color, r, cfg, shapeFn, centerDotR, labelFont, iconLabelY, glowLabelY } = opts;
  const glowMult = opts.glowMult || 1;
  const x = node.x;
  const y = node.y;

  const highlighted = isNodeHighlighted(node);
  const dimmed = (selectedNodeId || hoveredNodeId) && !highlighted;
  const alpha = dimmed ? 0.12 : 1;

  const useIcon = getIconMode() && activeIconMap.has(node.id) && globalScale > ICON_ZOOM_THRESHOLD;

  if (useIcon) {
    const img = activeIconMap.get(node.id);
    const iconSize = r * 5.0;

    drawGlow(ctx, x, y, iconSize * glowMult, 'icon', color, 0.12 * alpha);

    ctx.globalAlpha = alpha;
    ctx.drawImage(img, x - iconSize, y - iconSize, iconSize * 2, iconSize * 2);
    ctx.globalAlpha = 1;

    // Shape frame around icon
    if (shapeFn) {
      shapeFn(ctx, x, y, iconSize + 1);
      ctx.strokeStyle = hexToRgba(color, 0.5 * alpha);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (opts.drawExtras) opts.drawExtras(ctx, node, x, y, r, iconSize, true, alpha, color, globalScale);
  } else {
    const glowRadius = (cfg.glowRadius || r * 3) * glowMult;
    drawGlow(ctx, x, y, glowRadius, 'glow', color, (cfg.glowOpacity || 0.4) * alpha);

    // Solid shape core
    if (shapeFn) {
      shapeFn(ctx, x, y, r);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
    }
    ctx.fillStyle = hexToRgba(color, 0.85 * alpha);
    ctx.fill();

    // White center dot
    ctx.beginPath();
    ctx.arc(x, y, centerDotR, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255,255,255,${0.9 * alpha})`;
    ctx.fill();

    if (opts.drawExtras) opts.drawExtras(ctx, node, x, y, r, 0, false, alpha, color, globalScale);
  }

  // Label
  const hasActiveSelection = !!(selectedNodeId || hoveredNodeId);
  const showLabel = (hasActiveSelection && highlighted && !dimmed) || globalScale > LABEL_ZOOM_THRESHOLD;
  if (showLabel) {
    ctx.font = labelFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = `rgba(255,255,255,${0.9 * alpha})`;
    const labelY = useIcon ? iconLabelY(y, r) : glowLabelY(y, r);
    ctx.fillText(node.title || node.id, x, labelY);
  }
}

// ── Agent extras: critical priority ring ─────────────────────────────
function drawAgentExtras(ctx, node, x, y, r, iconSize, useIcon, alpha) {
  if (node.priority !== 'critical') return;
  if (useIcon) {
    drawOctPath(ctx, x, y, iconSize + 4);
  } else {
    drawOctPath(ctx, x, y, r + 2.5);
  }
  ctx.strokeStyle = `rgba(255,255,255,${0.6 * alpha})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ── Team extras: member count badge ──────────────────────────────────
function drawTeamExtras(ctx, node, x, y, r, iconSize, useIcon, alpha, color, globalScale) {
  if (useIcon) return; // no badge in icon mode
  const memberCount = node.members ? node.members.length : 0;
  if (memberCount > 0 && globalScale > 1.5) {
    const badgeR = r * 0.45;
    const badgeX = x + r * 0.7;
    const badgeY = y - r * 0.7;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, 2 * Math.PI);
    ctx.fillStyle = hexToRgba(color, 0.9 * alpha);
    ctx.fill();
    ctx.font = `bold ${badgeR * 1.4}px 'Share Tech Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(0,0,0,${0.9 * alpha})`;
    ctx.fillText(String(memberCount), badgeX, badgeY);
  }
}

// ── Skill extras: featured ring ──────────────────────────────────────
function drawSkillExtras(ctx, node, x, y, r, iconSize, useIcon, alpha) {
  const featured = FEATURED_NODES[node.id];
  if (!featured) return;
  const ringRadius = useIcon ? iconSize + 2 : r + 2;
  const strokeWidth = featured.tier === 'primary' ? 1.5 : 1;
  const ringAlpha = featured.tier === 'primary' ? 0.6 : 0.4;
  ctx.beginPath();
  ctx.arc(x, y, ringRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = `rgba(255,255,255,${ringAlpha * alpha})`;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
}

// ── Node rendering ──────────────────────────────────────────────────
function drawNode(node, ctx, globalScale) {
  // Font cache — recompute only when scale changes
  if (globalScale !== cachedFontScale) {
    cachedFontScale = globalScale;
    const fs = Math.max(10 / globalScale, 2);
    cachedFontBold = `bold ${fs}px 'Share Tech Mono', monospace`;
    cachedFontNormal = `${fs}px 'Share Tech Mono', monospace`;
  }

  const x = node.x;
  const y = node.y;
  if (!isFinite(x) || !isFinite(y)) return;

  if (node.type === 'agent') {
    const agentId = node.id.replace('agent:', '');
    const cfg = AGENT_PRIORITY_CONFIG[node.priority] || AGENT_PRIORITY_CONFIG.normal;
    drawNodeBase(node, ctx, globalScale, {
      color: getAgentColor(agentId),
      r: cfg.radius,
      cfg,
      shapeFn: drawOctPath,
      centerDotR: cfg.radius * 0.3,
      labelFont: cachedFontBold,
      iconLabelY: (y, r) => y + r * 3.5 + 4,
      glowLabelY: (y, r) => y + r + 4,
      drawExtras: drawAgentExtras,
    });
    return;
  }

  if (node.type === 'team') {
    const teamId = node.id.replace('team:', '');
    drawNodeBase(node, ctx, globalScale, {
      color: getTeamColor(teamId),
      r: TEAM_CONFIG.radius,
      cfg: TEAM_CONFIG,
      shapeFn: drawPentPath,
      centerDotR: TEAM_CONFIG.radius * 0.3,
      labelFont: cachedFontBold,
      iconLabelY: (y, r) => y + r * 3.5 + 4,
      glowLabelY: (y, r) => y + r + 4,
      drawExtras: drawTeamExtras,
    });
    return;
  }

  // Skill node
  const color = getColor(node.domain);
  const cfg = COMPLEXITY_CONFIG[node.complexity] || COMPLEXITY_CONFIG.intermediate;
  const featured = FEATURED_NODES[node.id];
  const r = featured ? featured.radius : cfg.radius;
  const glowMult = featured ? (featured.tier === 'primary' ? 1.5 : 1.3) : 1;

  drawNodeBase(node, ctx, globalScale, {
    color,
    r,
    cfg,
    shapeFn: null, // circle — drawNodeBase uses arc fallback
    glowMult,
    centerDotR: r * 0.35,
    labelFont: cachedFontNormal,
    iconLabelY: (y, r) => y + r * 2.8 + 2,
    glowLabelY: (y, r) => y + r + 4,
    drawExtras: drawSkillExtras,
  });
}

function drawHitArea(node, color, ctx) {
  if (!isFinite(node.x) || !isFinite(node.y)) return;
  let r;
  if (node.type === 'team') {
    r = TEAM_CONFIG.radius;
  } else if (node.type === 'agent') {
    const acfg = AGENT_PRIORITY_CONFIG[node.priority] || AGENT_PRIORITY_CONFIG.normal;
    r = acfg.radius;
  } else {
    const cfg = COMPLEXITY_CONFIG[node.complexity] || COMPLEXITY_CONFIG.intermediate;
    const featured = FEATURED_NODES[node.id];
    r = featured ? featured.radius : cfg.radius;
  }
  ctx.beginPath();
  ctx.arc(node.x, node.y, Math.max(r + 4, 8), 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function isNodeHighlighted(node) {
  return highlightedNodeIds === null || highlightedNodeIds.has(node.id);
}

/** Invalidate canvas so drawNode() re-runs with current state. */
function redraw() {
  if (graph) graph.nodeCanvasObject(drawNode);
}

function handleNodeClick(node) {
  if (node) {
    logEvent('graph', { event: 'click', node: { id: node.id, type: node.type, domain: node.domain } });
    selectedNodeId = node.id;
    rebuildHighlightSet();
    redraw();
    if (onNodeClick) onNodeClick(node);
  }
}

function handleNodeHover(node) {
  if (node) {
    logEvent('graph', { event: 'hover', node: { id: node.id, type: node.type, domain: node.domain } });
  } else {
    logEvent('graph', { event: 'hoverEnd' });
  }
  hoveredNodeId = node ? node.id : null;
  rebuildHighlightSet();
  redraw();
  if (onNodeHover) onNodeHover(node);
}

function handleBackgroundClick() {
  logEvent('graph', { event: 'bgClick' });
  selectedNodeId = null;
  rebuildHighlightSet();
  redraw();
  if (onNodeClick) onNodeClick(null);
}

export function selectNode(id) {
  logEvent('graph', { event: 'selectNode', nodeId: id });
  selectedNodeId = id;
  rebuildHighlightSet();
  const node = nodeById.get(id);
  if (node && graph) {
    graph.centerAt(node.x, node.y, 500);
    graph.zoom(4, 500);
  }
}

export function clearSelection() {
  logEvent('graph', { event: 'clearSelection' });
  selectedNodeId = null;
  hoveredNodeId = null;
  rebuildHighlightSet();
  redraw();
}

export function focusNode(id) {
  logEvent('graph', { event: 'focusNode', nodeId: id });
  const node = nodeById.get(id);
  if (node && graph) {
    selectedNodeId = id;
    rebuildHighlightSet();
    graph.centerAt(node.x, node.y, 800);
    graph.zoom(4, 800);
  }
}

export function resetView() {
  logEvent('graph', { event: 'resetView' });
  clearSelection();
  if (graph) graph.zoomToFit(600, 40);
}

export function zoomIn() {
  logEvent('graph', { event: 'zoomIn' });
  if (graph) graph.zoom(graph.zoom() * 1.5, 300);
}

export function zoomOut() {
  logEvent('graph', { event: 'zoomOut' });
  if (graph) graph.zoom(graph.zoom() / 1.5, 300);
}

export function setSkillVisibility(visibleSkillIds) {
  const visSet = visibleSkillIds instanceof Set ? visibleSkillIds : new Set(visibleSkillIds);
  logEvent('graph', { event: 'setSkillVisibility', visibleCount: visSet.size });

  const filteredNodes = fullData.nodes
    .filter(n => {
      if (n.type === 'team') {
        if (visibleTeamIds === null) return true;
        return visibleTeamIds.has(n.id);
      }
      if (n.type === 'agent') {
        if (visibleAgentIds === null) return true;
        return visibleAgentIds.has(n.id);
      }
      return visSet.has(n.id);
    })
    .map(n => ({ ...n }));

  const nodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = fullData.links
    .filter(l => {
      const src = resolveNodeId(l.source);
      const tgt = resolveNodeId(l.target);
      return nodeIds.has(src) && nodeIds.has(tgt);
    })
    .map(l => ({
      source: resolveNodeId(l.source),
      target: resolveNodeId(l.target),
      type: l.type,
    }));

  graphData = { nodes: filteredNodes, links: filteredLinks };
  rebuildNodeIndex();
  buildAdjacencyMap(graphData.links);
  precomputeLinkColors();

  if (graph) {
    graph.graphData(graphData);
    setTimeout(() => graph.zoomToFit(400, 40), 500);
  }
}

export function refreshGraph() {
  precomputeLinkColors();
  glowCache.clear(); // invalidate gradient textures on theme switch
  redraw();
}

export function getGraph() { return graph; }
