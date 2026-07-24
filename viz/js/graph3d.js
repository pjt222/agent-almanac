// graph3d.js - 3D force-graph setup and rendering using 3d-force-graph (WebGL/Three.js)
// put id:"mode_3d", label:"WebGL-based 3D force-directed layout (Three.js)", node_type:"process", input:"active_module"
// Parallel module to graph.js. Shares colors.js for theming.
// Loaded lazily when user clicks the 3D toggle button.

import * as THREE from 'three';
import ForceGraph3D from '3d-force-graph';
import {
  getColor, COMPLEXITY_CONFIG, FEATURED_NODES,
  hexToRgba, getAgentColor, getTeamColor,
  AGENT_PRIORITY_CONFIG, TEAM_CONFIG, getCurrentThemeName
} from './colors.js';
import { getIconMode, getIconPath, ICON_ZOOM_THRESHOLD, markIconLoaded, iconCacheKey } from './icons.js';
import { logEvent } from './eventlog.js';
import { t } from './i18n.js';

let graph3d = null;
let graphData = { nodes: [], links: [] };
let fullData = { nodes: [], links: [] };
let selectedNodeId = null;
let hoveredNodeId = null;
let onNodeClick = null;
let onNodeHover = null;

let spriteScale = 1.0;
let visibleAgentIds = null;
let visibleTeamIds = null;
let nodeById = new Map();
let highlightedNodeIds = null;

// ── Icon texture cache ────────────────────────────────────────────
const textureLoader = new THREE.TextureLoader();
const cachedPaletteTextures = new Map(); // palette -> Map(nodeId -> THREE.Texture)
let activeTextureMap = new Map();
let _texRefreshTimer = null;

function _scheduleTexRefresh() {
  if (_texRefreshTimer) clearTimeout(_texRefreshTimer);
  _texRefreshTimer = setTimeout(() => {
    _texRefreshTimer = null;
    if (graph3d && getIconMode()) graph3d.nodeThreeObject(createNodeObject);
  }, 500);
}

export function preload3DIcons(nodes, palette) {
  const pal = palette || getCurrentThemeName();
  const cacheKey = iconCacheKey(pal);
  if (cachedPaletteTextures.has(cacheKey)) {
    activeTextureMap = cachedPaletteTextures.get(cacheKey);
    _scheduleTexRefresh();
    return;
  }
  const palMap = new Map();
  cachedPaletteTextures.set(cacheKey, palMap);
  for (const node of nodes) {
    textureLoader.load(getIconPath(node, pal), (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      palMap.set(node.id, texture);
      markIconLoaded(pal, node.id);
      _scheduleTexRefresh();
    }, undefined, () => {});
  }
  activeTextureMap = palMap;
}

export function switchIconPalette3D(palette, nodes) {
  const cacheKey = iconCacheKey(palette);
  if (cachedPaletteTextures.has(cacheKey)) {
    activeTextureMap = cachedPaletteTextures.get(cacheKey);
  } else {
    preload3DIcons(nodes, palette);
  }
}

// ── Helpers ────────────────────────────────────────────────────────

function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

function rebuildNodeIndex() {
  nodeById = new Map();
  for (const n of graphData.nodes) nodeById.set(n.id, n);
}

function rebuildHighlightSet() {
  try {
    const activeId = selectedNodeId || hoveredNodeId;
    if (!activeId) { highlightedNodeIds = null; return; }

    const activeNode = nodeById.get(activeId);
    const set = new Set([activeId]);

    // Use library's current data to ensure links are up-to-date
    const links = (graph3d && graph3d.graphData) ? graph3d.graphData().links : graphData.links;

    // Build typed adjacency
    const byType = { team: [], agent: [], skill: [] };
    for (const l of links) {
      const src = typeof l.source === 'object' ? l.source.id : l.source;
      const tgt = typeof l.target === 'object' ? l.target.id : l.target;
      if (src && tgt && l.type && byType[l.type]) byType[l.type].push({ src, tgt });
    }

    const neighbors = (id, linkType) => {
      const result = [];
      for (const { src, tgt } of byType[linkType]) {
        if (src === id) result.push(tgt);
        if (tgt === id) result.push(src);
      }
      return result;
    };

    if (activeNode && activeNode.type === 'team') {
      const agents = neighbors(activeId, 'team');
      agents.forEach(a => set.add(a));
      agents.forEach(a => neighbors(a, 'agent').forEach(s => set.add(s)));
    } else if (activeNode && activeNode.type === 'agent') {
      neighbors(activeId, 'team').forEach(t => set.add(t));
      neighbors(activeId, 'agent').forEach(s => set.add(s));
    } else {
      const agents = neighbors(activeId, 'agent');
      agents.forEach(a => set.add(a));
      agents.forEach(a => neighbors(a, 'team').forEach(t => set.add(t)));
      neighbors(activeId, 'skill').forEach(s => set.add(s));
    }

    highlightedNodeIds = set;
  } catch (e) {
    console.error('[graph3d] rebuildHighlightSet error:', e);
    highlightedNodeIds = null;
  }
}

function getLinkColor(link) {
  if (!highlightedNodeIds) {
    if (link.type === 'team') return hexToRgba(getTeamLinkHex(link), 0.15);
    if (link.type === 'agent') return hexToRgba(getAgentLinkHex(link), 0.1);
    return 'rgba(255,255,255,0.1)';
  }
  const src = typeof link.source === 'object' ? link.source.id : link.source;
  const tgt = typeof link.target === 'object' ? link.target.id : link.target;
  const both = highlightedNodeIds.has(src) && highlightedNodeIds.has(tgt);
  if (both) {
    if (link.type === 'team') return hexToRgba(getTeamLinkHex(link), 0.5);
    if (link.type === 'agent') return hexToRgba(getAgentLinkHex(link), 0.4);
    return 'rgba(255,255,255,0.4)';
  }
  if (link.type === 'team') return hexToRgba(getTeamLinkHex(link), 0.02);
  if (link.type === 'agent') return hexToRgba(getAgentLinkHex(link), 0.01);
  return 'rgba(255,255,255,0.02)';
}

function getLinkWidth(link) {
  if (!highlightedNodeIds) return 0.5;
  const src = typeof link.source === 'object' ? link.source.id : link.source;
  const tgt = typeof link.target === 'object' ? link.target.id : link.target;
  return (highlightedNodeIds.has(src) && highlightedNodeIds.has(tgt)) ? 1.5 : 0.3;
}

function updateVisuals() {
  if (!graph3d) return;

  try {
    // Get the library's internal data (has __threeObj references)
    const currentData = graph3d.graphData();
    let updated = 0;

    // Dim/brighten node materials directly via __threeObj
    currentData.nodes.forEach(node => {
      const obj = node.__threeObj;
      if (!obj || !obj.material) return;
      const hl = !highlightedNodeIds || highlightedNodeIds.has(node.id);
      obj.material.opacity = hl ? 0.9 : 0.08;
      if (obj.material.emissiveIntensity !== undefined) {
        obj.material.emissiveIntensity = hl ? 0.4 : 0.05;
      }
      updated++;
    });

    // Force link re-evaluation with new function references
    graph3d
      .linkColor(link => getLinkColor(link))
      .linkWidth(link => getLinkWidth(link));

  } catch (e) {
    console.error('[graph3d] updateVisuals error:', e);
  }
}

// ── Link color helpers ─────────────────────────────────────────────

function getAgentLinkHex(link) {
  const src = typeof link.source === 'object' ? link.source : nodeById.get(link.source);
  if (src && src.type === 'agent') return getAgentColor(src.id.replace('agent:', ''));
  const tgt = typeof link.target === 'object' ? link.target : nodeById.get(link.target);
  if (tgt && tgt.type === 'agent') return getAgentColor(tgt.id.replace('agent:', ''));
  return getAgentColor();
}

function getTeamLinkHex(link) {
  const src = typeof link.source === 'object' ? link.source : nodeById.get(link.source);
  if (src && src.type === 'team') return getTeamColor(src.id.replace('team:', ''));
  return getTeamColor();
}

// ── Force distances ────────────────────────────────────────────────

const SAME_DOMAIN_DISTANCE = 40;
const CROSS_DOMAIN_DISTANCE = 100;
const AGENT_LINK_DISTANCE = 120;
const TEAM_LINK_DISTANCE = 80;

// ── Node object creation ───────────────────────────────────────────

function createIconSprite(node) {
  const texture = activeTextureMap.get(node.id);
  let size;
  if (node.type === 'agent') {
    size = (AGENT_PRIORITY_CONFIG[node.priority] || AGENT_PRIORITY_CONFIG.normal).radius * 7.0 * spriteScale;
  } else if (node.type === 'team') {
    size = TEAM_CONFIG.radius * 7.0 * spriteScale;
  } else {
    const cfg = COMPLEXITY_CONFIG[node.complexity] || COMPLEXITY_CONFIG.intermediate;
    const featured = FEATURED_NODES[node.id];
    size = (featured ? featured.radius : cfg.radius) * 5.0 * spriteScale;
  }
  const material = new THREE.SpriteMaterial({
    map: texture, transparent: true, opacity: 0.9,
    depthWrite: false, sizeAttenuation: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(size, size, 1);
  sprite.userData.nodeId = node.id;
  return sprite;
}

function createNodeObject(node) {
  if (getIconMode() && activeTextureMap.has(node.id)) {
    return createIconSprite(node);
  }

  let geometry, material, size;

  if (node.type === 'agent') {
    const agentId = node.id.replace('agent:', '');
    const color = getAgentColor(agentId);
    const cfg = AGENT_PRIORITY_CONFIG[node.priority] || AGENT_PRIORITY_CONFIG.normal;
    size = cfg.radius * 0.8;
    geometry = new THREE.OctahedronGeometry(size);
    material = new THREE.MeshLambertMaterial({
      color: hexToInt(color),
      emissive: hexToInt(color),
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.9,
    });
  } else if (node.type === 'team') {
    const teamId = node.id.replace('team:', '');
    const color = getTeamColor(teamId);
    size = TEAM_CONFIG.radius * 0.8;
    geometry = new THREE.IcosahedronGeometry(size);
    material = new THREE.MeshLambertMaterial({
      color: hexToInt(color),
      emissive: hexToInt(color),
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.9,
    });
  } else {
    const color = getColor(node.domain);
    const cfg = COMPLEXITY_CONFIG[node.complexity] || COMPLEXITY_CONFIG.intermediate;
    const featured = FEATURED_NODES[node.id];
    size = (featured ? featured.radius : cfg.radius) * 0.6;
    geometry = new THREE.SphereGeometry(size, 16, 12);
    material = new THREE.MeshLambertMaterial({
      color: hexToInt(color),
      emissive: hexToInt(color),
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.85,
    });
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.nodeId = node.id;
  return mesh;
}

// ── Init ───────────────────────────────────────────────────────────

export function init3DGraph(container, data, { onClick, onHover } = {}) {
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

  graph3d = ForceGraph3D()(container)
    .width(container.clientWidth || window.innerWidth)
    .height(container.clientHeight || (window.innerHeight - 48))
    .graphData(graphData)
    .backgroundColor('#0a0a0f')
    .nodeId('id')
    .linkSource('source')
    .linkTarget('target')
    .nodeThreeObject(createNodeObject)
    .nodeThreeObjectExtend(false)
    .nodeLabel(node => {
      if (node.type === 'team') {
        return t('tooltip.team', { title: node.title || node.id, count: node.members ? node.members.length : 0 });
      }
      if (node.type === 'agent') {
        return t('tooltip.agent', { title: node.title || node.id, priority: node.priority });
      }
      return t('tooltip.skill', { title: node.title || node.id, domain: node.domain });
    })
    .linkColor(getLinkColor)
    .linkWidth(getLinkWidth)
    .linkOpacity(0.6)
    .onNodeClick(node => {
      if (node) {
        logEvent('graph3d', { event: 'click', node: { id: node.id, type: node.type, domain: node.domain } });
        selectedNodeId = node.id;
        rebuildHighlightSet();
        updateVisuals();
        if (onNodeClick) onNodeClick(node);
      }
    })
    .onNodeHover(node => {
      if (node) {
        logEvent('graph3d', { event: 'hover', node: { id: node.id, type: node.type, domain: node.domain } });
      } else {
        logEvent('graph3d', { event: 'hoverEnd' });
      }
      hoveredNodeId = node ? node.id : null;
      rebuildHighlightSet();
      updateVisuals();
      container.style.cursor = node ? 'pointer' : 'default';
      if (onNodeHover) onNodeHover(node);
    })
    .onBackgroundClick(() => {
      logEvent('graph3d', { event: 'bgClick' });
      selectedNodeId = null;
      rebuildHighlightSet();
      updateVisuals();
      if (onNodeClick) onNodeClick(null);
    })
    .cooldownTicks(200)
    .warmupTicks(100);

  // Configure forces
  graph3d.d3Force('link')
    .distance(link => {
      if (link.type === 'team') return TEAM_LINK_DISTANCE;
      if (link.type === 'agent') return AGENT_LINK_DISTANCE;
      const src = typeof link.source === 'object' ? link.source : nodeById.get(link.source);
      const tgt = typeof link.target === 'object' ? link.target : nodeById.get(link.target);
      return (src && tgt && src.domain === tgt.domain)
        ? SAME_DOMAIN_DISTANCE
        : CROSS_DOMAIN_DISTANCE;
    });

  graph3d.d3Force('charge').strength(-80);

  // Window resize handler
  const onResize = () => {
    if (graph3d) {
      graph3d.width(container.clientWidth || window.innerWidth);
      graph3d.height(container.clientHeight || (window.innerHeight - 48));
    }
  };
  window.addEventListener('resize', onResize);
  graph3d.__resizeHandler = onResize;

  return graph3d;
}

// ── Destroy ────────────────────────────────────────────────────────

export function destroy3DGraph() {
  if (graph3d) {
    if (graph3d.__resizeHandler) {
      window.removeEventListener('resize', graph3d.__resizeHandler);
    }
    graph3d.pauseAnimation();
    try {
      const scene = graph3d.scene();
      if (scene) {
        scene.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        });
      }
      const renderer = graph3d.renderer();
      if (renderer) {
        renderer.dispose();
        const canvas = renderer.domElement;
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    } catch (e) { /* cleanup best-effort */ }
    graph3d = null;
  }
  graphData = { nodes: [], links: [] };
  fullData = { nodes: [], links: [] };
  selectedNodeId = null;
  hoveredNodeId = null;
  highlightedNodeIds = null;
  nodeById = new Map();
  visibleAgentIds = null;
  visibleTeamIds = null;
  activeTextureMap = new Map();
  // Note: cachedPaletteTextures kept across rebuilds for palette reuse
}

// ── Navigation ─────────────────────────────────────────────────────

export function focusNode3D(id) {
  logEvent('graph3d', { event: 'focusNode', nodeId: id });
  const node = nodeById.get(id);
  if (!node || !graph3d) return;
  selectedNodeId = id;
  rebuildHighlightSet();
  updateVisuals();
  const distance = 120;
  const hypot = Math.hypot(node.x || 0, node.y || 0, node.z || 0) || 1;
  const distRatio = 1 + distance / hypot;
  graph3d.cameraPosition(
    { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
    { x: node.x || 0, y: node.y || 0, z: node.z || 0 },
    1000
  );
}

export function resetView3D() {
  logEvent('graph3d', { event: 'resetView' });
  selectedNodeId = null;
  hoveredNodeId = null;
  highlightedNodeIds = null;
  updateVisuals();
  if (graph3d) graph3d.zoomToFit(600, 40);
}

export function zoomIn3D() {
  logEvent('graph3d', { event: 'zoomIn' });
  if (!graph3d) return;
  const cam = graph3d.camera();
  const pos = cam.position;
  graph3d.cameraPosition(
    { x: pos.x * 0.7, y: pos.y * 0.7, z: pos.z * 0.7 },
    undefined,
    300
  );
}

export function zoomOut3D() {
  logEvent('graph3d', { event: 'zoomOut' });
  if (!graph3d) return;
  const cam = graph3d.camera();
  const pos = cam.position;
  graph3d.cameraPosition(
    { x: pos.x * 1.4, y: pos.y * 1.4, z: pos.z * 1.4 },
    undefined,
    300
  );
}

// ── Filtering ──────────────────────────────────────────────────────

export function setSkillVisibility3D(visibleSkillIds) {
  const visSet = visibleSkillIds instanceof Set ? visibleSkillIds : new Set(visibleSkillIds);
  logEvent('graph3d', { event: 'setSkillVisibility', visibleCount: visSet.size });

  const filteredNodes = fullData.nodes
    .filter(n => {
      if (n.type === 'team') return visibleTeamIds === null || visibleTeamIds.has(n.id);
      if (n.type === 'agent') return visibleAgentIds === null || visibleAgentIds.has(n.id);
      return visSet.has(n.id);
    })
    .map(n => ({ ...n }));

  const nodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = fullData.links
    .filter(l => {
      const src = typeof l.source === 'object' ? l.source.id : l.source;
      const tgt = typeof l.target === 'object' ? l.target.id : l.target;
      return nodeIds.has(src) && nodeIds.has(tgt);
    })
    .map(l => ({
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target,
      type: l.type,
    }));

  graphData = { nodes: filteredNodes, links: filteredLinks };
  rebuildNodeIndex();

  if (graph3d) {
    graph3d.graphData(graphData);
    setTimeout(() => graph3d.zoomToFit(400, 40), 500);
  }
}

export function setVisibleAgents3D(ids) {
  visibleAgentIds = new Set(ids);
}

export function setVisibleTeams3D(ids) {
  visibleTeamIds = new Set(ids);
}

export function getVisibleAgentIds3D() {
  return visibleAgentIds;
}

// ── Refresh ────────────────────────────────────────────────────────

export function refreshGraph3D() {
  if (graph3d) graph3d.nodeThreeObject(createNodeObject);
}

export function setSpriteScale3D(factor) {
  spriteScale = factor;
  if (graph3d && getIconMode() && activeTextureMap.size > 0) {
    graph3d.nodeThreeObject(createNodeObject);
  }
}

export function getGraph3D() { return graph3d; }
