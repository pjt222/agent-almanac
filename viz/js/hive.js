// hive.js - Hive plot visualization (D3 SVG)
// put id:"mode_hive", label:"SVG-based 3-axis radial hive plot (D3)", node_type:"process", input:"active_module"
// 3-axis multi-track radial layout: Skills (210), Agents (330), Teams (90)
// Nodes positioned along axes by rank metric; links as Bezier curves.
// Loaded lazily when user clicks the Hive toggle button.

import * as d3 from 'd3';
import {
  getColor, getAgentColor, getTeamColor, hexToRgba,
  AGENT_PRIORITY_CONFIG, TEAM_CONFIG, getCurrentThemeName
} from './colors.js';
import { getIconMode, getIconPath, isIconLoaded, markIconLoaded } from './icons.js';
import { logEvent } from './eventlog.js';
import { t } from './i18n.js';

let svg = null;
let rootG = null;
let zoomBehavior = null;
let fullData = { nodes: [], links: [] };
let visibleAgentIds = null;
let visibleTeamIds = null;
let visibleSkillSet = null;
let onNodeClick = null;
let onNodeHover = null;
let containerEl = null;
let resizeHandler = null;
let resizeTimer = null;
let hoveredNodeId = null;
let selectedNodeId = null;
let adjacencyByLinkType = null; // { team: Map, agent: Map, skill: Map }
let linkElementArr = [];        // [{ el, source, target, type }]
let nodeElementArr = [];        // [{ el, id, type }]
let currentNodeById = null;

// Axis angles (radians): skills=210°, agents=330°, teams=90°
const AXIS_ANGLES = {
  skill:  (7 * Math.PI) / 6,
  agent: (11 * Math.PI) / 6,
  team:   Math.PI / 2,
};

function getAxisLabels() {
  return { skill: t('hive.axisSkills'), agent: t('hive.axisAgents'), team: t('hive.axisTeams') };
}

// Per-axis track count and perpendicular spread (px between parallel lines)
const AXIS_CONFIG = {
  skill: { tracks: 7, spread: 5 },
  agent: { tracks: 5, spread: 4 },
  team:  { tracks: 3, spread: 5 },
};

const HIVE_ICON_SIZE = { skill: 10, agent: 14, team: 18 };

// ── Sort mode state ─────────────────────────────────────────────────
let hiveSortMode = 'ranked'; // 'ranked' | 'interleaved'

export function setHiveSortMode(mode) {
  hiveSortMode = mode;
  render();
}

export function getHiveSortMode() {
  return hiveSortMode;
}

// ── Domain focus state ────────────────────────────────────────────────
let domainFocus = null; // null = all domains, string = specific domain

export function setDomainFocus(domain) {
  domainFocus = domain || null;
  render();
}

export function getDomainFocus() {
  return domainFocus;
}

export function getDomainList() {
  const domains = new Set();
  for (const n of fullData.nodes) {
    if (n.type === 'skill' && n.domain) domains.add(n.domain);
  }
  return [...domains].sort();
}

// ── Spread multiplier state ─────────────────────────────────────────
let hiveSpreadMultiplier = 1.0;

export function setHiveSpread(v) {
  hiveSpreadMultiplier = v;
  render();
}

export function getHiveSpread() {
  return hiveSpreadMultiplier;
}

// ── Helpers ─────────────────────────────────────────────────────────

function polar(angle, radius) {
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}

function getNodeColor(node) {
  if (node.type === 'agent') return getAgentColor(node.id.replace('agent:', ''));
  if (node.type === 'team') return getTeamColor(node.id.replace('team:', ''));
  return getColor(node.domain);
}

function linkColor(link, nodeById) {
  const src = nodeById.get(link.source) || nodeById.get(link.target);
  const tgt = nodeById.get(link.target) || nodeById.get(link.source);
  if (link.type === 'team') {
    const teamNode = src?.type === 'team' ? src : tgt;
    return getTeamColor((teamNode?.id || '').replace('team:', ''));
  }
  if (link.type === 'agent') {
    const agentNode = src?.type === 'agent' ? src : tgt;
    return getAgentColor((agentNode?.id || '').replace('agent:', ''));
  }
  // skill↔skill: use source domain color
  return getColor(src?.domain);
}

function computeLayout(nodes, links) {
  if (!containerEl) return { positioned: [], posLinks: [], innerR: 0, outerR: 0 };

  const w = containerEl.clientWidth || window.innerWidth;
  const h = containerEl.clientHeight || (window.innerHeight - 48);
  const dim = Math.min(w, h);
  const innerR = dim * 0.08;
  const outerR = dim * 0.46;

  // Build adjacency for degree computation
  const degree = new Map();
  for (const n of nodes) degree.set(n.id, 0);
  for (const l of links) {
    degree.set(l.source, (degree.get(l.source) || 0) + 1);
    degree.set(l.target, (degree.get(l.target) || 0) + 1);
  }

  // Group nodes by type
  const byType = { skill: [], agent: [], team: [] };
  for (const n of nodes) {
    if (byType[n.type]) byType[n.type].push(n);
  }

  // Sort and rank each axis
  byType.skill.sort((a, b) => (degree.get(a.id) || 0) - (degree.get(b.id) || 0));
  byType.agent.sort((a, b) => ((a.skills?.length || 0) - (b.skills?.length || 0)));
  byType.team.sort((a, b) => ((a.members?.length || 0) - (b.members?.length || 0)));

  const positioned = [];
  const nodeById = new Map();

  for (const type of ['skill', 'agent', 'team']) {
    const axis = byType[type];
    const angle = AXIS_ANGLES[type];
    const maxRank = Math.max(axis.length - 1, 1);
    const scale = d3.scaleLinear().domain([0, maxRank]).range([innerR, outerR]);
    const perpAngle = angle + Math.PI / 2;
    const { tracks: N, spread } = AXIS_CONFIG[type];

    for (let i = 0; i < axis.length; i++) {
      const node = axis[i];
      const r = scale(i);
      let track;
      if (hiveSortMode === 'interleaved') {
        const stride = Math.ceil(N / 2);
        track = (i * stride) % N;
      } else {
        track = i % N;
      }
      const side = track - Math.floor(N / 2);
      const offset = side * spread * hiveSpreadMultiplier;
      const x = r * Math.cos(angle) + offset * Math.cos(perpAngle);
      const y = r * Math.sin(angle) + offset * Math.sin(perpAngle);
      const pos = { ...node, _x: x, _y: y, _r: r, _angle: angle, _rank: i };
      positioned.push(pos);
      nodeById.set(node.id, pos);
    }
  }

  // Build positioned links
  const posLinks = [];
  for (const l of links) {
    const src = nodeById.get(l.source);
    const tgt = nodeById.get(l.target);
    if (src && tgt) {
      posLinks.push({ ...l, _src: src, _tgt: tgt });
    }
  }

  return { positioned, posLinks, nodeById, innerR, outerR };
}

function linkPath(pl) {
  const s = pl._src;
  const t = pl._tgt;

  if (s._angle === t._angle) {
    // Same-axis link: bow outward perpendicular to axis
    const angle = s._angle;
    const perpAngle = angle + Math.PI / 2;
    const midR = (s._r + t._r) / 2;
    const bowAmount = Math.abs(s._r - t._r) * 0.5 + 15;
    const cx = midR * Math.cos(angle) + bowAmount * Math.cos(perpAngle);
    const cy = midR * Math.sin(angle) + bowAmount * Math.sin(perpAngle);
    return `M ${s._x},${s._y} Q ${cx},${cy} ${t._x},${t._y}`;
  }

  // Inter-axis link: control point pulled toward center
  const mx = (s._x + t._x) / 2;
  const my = (s._y + t._y) / 2;
  const cx = mx * 0.3;
  const cy = my * 0.3;
  return `M ${s._x},${s._y} Q ${cx},${cy} ${t._x},${t._y}`;
}

function nodeShape(d) {
  // Skills: circle, Agents: octagon, Teams: pentagon
  if (d.type === 'agent') {
    const r = 4;
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8 - Math.PI / 8;
      pts.push(`${d._x + r * Math.cos(a)},${d._y + r * Math.sin(a)}`);
    }
    return { tag: 'polygon', attrs: { points: pts.join(' ') } };
  }
  if (d.type === 'team') {
    const r = 6;
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      pts.push(`${d._x + r * Math.cos(a)},${d._y + r * Math.sin(a)}`);
    }
    return { tag: 'polygon', attrs: { points: pts.join(' ') } };
  }
  return { tag: 'circle', attrs: { cx: d._x, cy: d._y, r: 2 } };
}

// ── Pre-computed adjacency & highlight helpers ──────────────────────

function buildAdjacencyMap(posLinks) {
  const map = { team: new Map(), agent: new Map(), skill: new Map() };
  for (const pl of posLinks) {
    const m = map[pl.type];
    if (!m) continue;
    if (!m.has(pl.source)) m.set(pl.source, new Set());
    if (!m.has(pl.target)) m.set(pl.target, new Set());
    m.get(pl.source).add(pl.target);
    m.get(pl.target).add(pl.source);
  }
  return map;
}

function getConnected(node) {
  const connected = new Set([node.id]);
  const neighbors = (id, linkType) => adjacencyByLinkType[linkType]?.get(id) || new Set();

  if (node.type === 'team') {
    const agents = neighbors(node.id, 'team');
    agents.forEach(a => { connected.add(a); neighbors(a, 'agent').forEach(s => connected.add(s)); });
  } else if (node.type === 'agent') {
    neighbors(node.id, 'team').forEach(t => connected.add(t));
    neighbors(node.id, 'agent').forEach(s => connected.add(s));
  } else {
    const agents = neighbors(node.id, 'agent');
    agents.forEach(a => { connected.add(a); neighbors(a, 'team').forEach(t => connected.add(t)); });
    neighbors(node.id, 'skill').forEach(s => connected.add(s));
  }

  return connected;
}

function applyHighlight(connected) {
  rootG.classed('hive-active-hover', true);
  for (const { el, source, target } of linkElementArr) {
    el.classed('highlighted', connected.has(source) && connected.has(target));
  }
  for (const { el, id } of nodeElementArr) {
    el.classed('highlighted', connected.has(id));
  }
}

function clearHighlight() {
  rootG.classed('hive-active-hover', false);
  for (const { el } of linkElementArr) el.classed('highlighted', false);
  for (const { el } of nodeElementArr) el.classed('highlighted', false);
}

// ── Filter helpers ──────────────────────────────────────────────────

function getFilteredData() {
  // When domain focus is active, first find the matching skills, then
  // include only agents/teams connected to those skills via links.
  let focusedSkillIds = null;
  let connectedAgentIds = null;
  let connectedTeamIds = null;

  if (domainFocus) {
    focusedSkillIds = new Set();
    for (const n of fullData.nodes) {
      if (n.type === 'skill' && n.domain === domainFocus) focusedSkillIds.add(n.id);
    }

    // Find agents connected to these skills
    connectedAgentIds = new Set();
    connectedTeamIds = new Set();
    for (const l of fullData.links) {
      if (l.type === 'agent') {
        if (focusedSkillIds.has(l.source)) connectedAgentIds.add(l.target);
        if (focusedSkillIds.has(l.target)) connectedAgentIds.add(l.source);
      }
    }
    // Find teams connected to those agents
    for (const l of fullData.links) {
      if (l.type === 'team') {
        if (connectedAgentIds.has(l.source)) connectedTeamIds.add(l.target);
        if (connectedAgentIds.has(l.target)) connectedTeamIds.add(l.source);
      }
    }
  }

  const nodes = fullData.nodes.filter(n => {
    if (n.type === 'team') {
      if (connectedTeamIds && !connectedTeamIds.has(n.id)) return false;
      return visibleTeamIds === null || visibleTeamIds.has(n.id);
    }
    if (n.type === 'agent') {
      if (connectedAgentIds && !connectedAgentIds.has(n.id)) return false;
      return visibleAgentIds === null || visibleAgentIds.has(n.id);
    }
    // skill
    if (focusedSkillIds && !focusedSkillIds.has(n.id)) return false;
    return visibleSkillSet === null || visibleSkillSet.has(n.id);
  });

  const nodeIds = new Set(nodes.map(n => n.id));
  const links = fullData.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

  return { nodes, links };
}

// ── Render ──────────────────────────────────────────────────────────

function render(preserveZoom = false) {
  if (!svg || !rootG) return;

  const w = containerEl.clientWidth || window.innerWidth;
  const h = containerEl.clientHeight || (window.innerHeight - 48);
  svg.attr('width', w).attr('height', h);

  const { nodes, links } = getFilteredData();
  const { positioned, posLinks, nodeById, innerR, outerR } = computeLayout(nodes, links);

  rootG.selectAll('*').remove();
  linkElementArr = [];
  nodeElementArr = [];

  const g = rootG.append('g');

  // ── Axis lines (multi-track) ──
  for (const [type, angle] of Object.entries(AXIS_ANGLES)) {
    const perpAngle = angle + Math.PI / 2;
    const { tracks: N, spread } = AXIS_CONFIG[type];

    const sides = Array.from({ length: N }, (_, k) => k - Math.floor(N / 2));
    for (const side of sides) {
      const ox = side * spread * hiveSpreadMultiplier * Math.cos(perpAngle);
      const oy = side * spread * hiveSpreadMultiplier * Math.sin(perpAngle);
      const inner = polar(angle, innerR * 0.8);
      const outer = polar(angle, outerR * 1.08);
      g.append('line')
        .attr('class', 'hive-axis')
        .attr('x1', inner.x + ox).attr('y1', inner.y + oy)
        .attr('x2', outer.x + ox).attr('y2', outer.y + oy);
    }

    // Label
    const labelPos = polar(angle, outerR * 1.15);
    g.append('text')
      .attr('class', 'hive-axis-label')
      .attr('x', labelPos.x).attr('y', labelPos.y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .text(getAxisLabels()[type]);
  }

  // ── Links ──
  const linkG = g.append('g').attr('class', 'hive-links');

  // Draw skill↔skill links first (lowest layer)
  const skillLinks = posLinks.filter(l => l.type === 'skill');
  const otherLinks = posLinks.filter(l => l.type !== 'skill');

  for (const pl of skillLinks) {
    const el = linkG.append('path')
      .attr('class', 'hive-link hive-link-skill')
      .attr('d', linkPath(pl))
      .attr('stroke', hexToRgba(linkColor(pl, nodeById), 0.12));
    linkElementArr.push({ el, source: pl.source, target: pl.target, type: 'skill' });
  }

  for (const pl of otherLinks) {
    const opacity = pl.type === 'team' ? 0.25 : 0.18;
    const width = pl.type === 'team' ? 0.8 : 0.5;
    const el = linkG.append('path')
      .attr('class', `hive-link hive-link-${pl.type}`)
      .attr('d', linkPath(pl))
      .attr('stroke', hexToRgba(linkColor(pl, nodeById), opacity))
      .attr('stroke-width', width);
    linkElementArr.push({ el, source: pl.source, target: pl.target, type: pl.type });
  }

  // ── Nodes ──
  const nodeG = g.append('g').attr('class', 'hive-nodes');

  for (const d of positioned) {
    const color = getNodeColor(d);
    let el;

    if (getIconMode() && isIconLoaded(d.id)) {
      const iconSize = HIVE_ICON_SIZE[d.type] || 10;
      el = nodeG.append('image')
        .attr('href', getIconPath(d, getCurrentThemeName()))
        .attr('x', d._x - iconSize)
        .attr('y', d._y - iconSize)
        .attr('width', iconSize * 2)
        .attr('height', iconSize * 2);
    } else {
      const shape = nodeShape(d);
      if (shape.tag === 'circle') {
        el = nodeG.append('circle')
          .attr('cx', shape.attrs.cx)
          .attr('cy', shape.attrs.cy)
          .attr('r', shape.attrs.r);
      } else {
        el = nodeG.append('polygon')
          .attr('points', shape.attrs.points);
      }
      el.attr('fill', color);
    }

    el.attr('class', 'hive-node')
      .attr('data-id', d.id)
      .attr('data-type', d.type)
      .on('mouseenter', () => handleHover(d))
      .on('mouseleave', () => handleHoverEnd())
      .on('click', (event) => {
        event.stopPropagation();
        if (selectedNodeId === d.id) {
          handleDeselect();
          if (onNodeClick) onNodeClick(null);
        } else {
          handleSelect(d);
          if (onNodeClick) onNodeClick(d);
        }
      })
      .on('touchstart', (event) => {
        // Trigger hover highlight on touch
        handleHover(d);
      }, { passive: true })
      .on('touchend', (event) => {
        handleHoverEnd();
      }, { passive: true });
    nodeElementArr.push({ el, id: d.id, type: d.type });
  }

  // Build adjacency map for hover/select lookups
  adjacencyByLinkType = buildAdjacencyMap(posLinks);
  currentNodeById = nodeById;

  // Background click clears selection
  svg.on('click', () => {
    logEvent('hive', { event: 'bgClick' });
    handleDeselect();
    if (onNodeClick) onNodeClick(null);
  });

  // Re-apply selection highlighting if a node is selected
  if (selectedNodeId && nodeById.has(selectedNodeId)) {
    handleSelect(nodeById.get(selectedNodeId));
  }

  // Fit content to viewport after rebuild
  if (preserveZoom) {
    const currentTransform = d3.zoomTransform(svg.node());
    rootG.attr('transform', currentTransform);
  } else {
    zoomToFitHive(0);
  }
}

// ── Hover highlight ─────────────────────────────────────────────────

function handleHover(node) {
  if (selectedNodeId) return;
  hoveredNodeId = node.id;

  const connected = getConnected(node);

  const connArr = [...connected];
  logEvent('hive', {
    event: 'hover',
    node: { id: node.id, type: node.type, domain: node.domain },
    connected: connArr,
    connectedByType: {
      skills: connArr.filter(id => (currentNodeById.get(id) || {}).type === 'skill').length,
      agents: connArr.filter(id => (currentNodeById.get(id) || {}).type === 'agent').length,
      teams: connArr.filter(id => (currentNodeById.get(id) || {}).type === 'team').length,
    },
    linksHighlighted: linkElementArr.filter(({ source, target }) => connected.has(source) && connected.has(target)).length,
  });

  applyHighlight(connected);
  if (onNodeHover) onNodeHover(node);
}

function handleHoverEnd() {
  if (selectedNodeId) return;
  logEvent('hive', { event: 'hoverEnd', node: hoveredNodeId });
  hoveredNodeId = null;
  clearHighlight();
  if (onNodeHover) onNodeHover(null);
}

// ── Click select (type-aware neighbors) ─────────────────────────────

function handleSelect(node) {
  selectedNodeId = node.id;

  const connected = getConnected(node);

  const connArr = [...connected];
  logEvent('hive', {
    event: 'click',
    node: { id: node.id, type: node.type, domain: node.domain },
    connected: connArr,
    connectedByType: {
      skills: connArr.filter(id => (currentNodeById.get(id) || {}).type === 'skill').length,
      agents: connArr.filter(id => (currentNodeById.get(id) || {}).type === 'agent').length,
      teams: connArr.filter(id => (currentNodeById.get(id) || {}).type === 'team').length,
    },
    linksHighlighted: linkElementArr.filter(({ source, target }) => connected.has(source) && connected.has(target)).length,
  });

  applyHighlight(connected);
}

function handleDeselect() {
  logEvent('hive', { event: 'deselect' });
  selectedNodeId = null;
  clearHighlight();
}

// ── Public API ──────────────────────────────────────────────────────

export function initHiveGraph(container, data, { onClick, onHover } = {}) {

  containerEl = container;
  onNodeClick = onClick;
  onNodeHover = onHover;

  fullData = {
    nodes: data.nodes.map(n => ({ ...n })),
    links: data.links.map(l => ({
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target,
      type: l.type,
    })),
  };

  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || (window.innerHeight - 48);

  svg = d3.select(container).append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('overflow', 'visible')
    .style('display', 'block');

  rootG = svg.append('g');

  // Zoom behavior
  zoomBehavior = d3.zoom()
    .scaleExtent([0.3, 5])
    .clickDistance(5)
    .filter((event) => {
      // Block pointer/touch on nodes so native click fires, but allow wheel zoom everywhere
      if (event.target.classList?.contains('hive-node') && event.type !== 'wheel') return false;
      // Replicate d3-zoom default: allow ctrl+wheel (trackpad pinch), reject secondary buttons
      return (!event.ctrlKey || event.type === 'wheel') && !event.button;
    })
    .on('zoom', (event) => {
      rootG.attr('transform', event.transform);
    });

  svg.call(zoomBehavior);

  // Resize handler — debounced, animates zoom-to-fit instead of rebuilding DOM
  resizeHandler = () => {
    if (!svg || !containerEl) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nw = containerEl.clientWidth || window.innerWidth;
      const nh = containerEl.clientHeight || (window.innerHeight - 48);
      svg.attr('width', nw).attr('height', nh);
      zoomToFitHive(300);
    }, 100);
  };
  window.addEventListener('resize', resizeHandler);

  render();
}

export function destroyHiveGraph() {
  clearTimeout(resizeTimer);
  resizeTimer = null;
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  if (svg) {
    svg.remove();
    svg = null;
  }
  rootG = null;
  zoomBehavior = null;
  fullData = { nodes: [], links: [] };
  visibleAgentIds = null;
  visibleTeamIds = null;
  visibleSkillSet = null;
  onNodeClick = null;
  onNodeHover = null;
  containerEl = null;
  domainFocus = null;
  hoveredNodeId = null;
  selectedNodeId = null;
  adjacencyByLinkType = null;
  linkElementArr = [];
  nodeElementArr = [];
  currentNodeById = null;
}

export function setSkillVisibilityHive(ids) {
  visibleSkillSet = ids instanceof Set ? ids : new Set(ids);
  render();
}

export function setVisibleAgentsHive(ids) {
  visibleAgentIds = new Set(ids);
  // Render is deferred to setSkillVisibilityHive (always called after)
}

export function setVisibleTeamsHive(ids) {
  visibleTeamIds = new Set(ids);
  // Render is deferred to setSkillVisibilityHive (always called after)
}

export function getVisibleAgentIdsHive() {
  return visibleAgentIds;
}

export function refreshHiveGraph() {
  render(true);
}

export function focusNodeHive(id) {
  if (!svg || !rootG) return;
  const node = rootG.select(`.hive-node[data-id="${id}"]`);
  if (node.empty()) return;

  // Flash the node
  const origFill = node.attr('fill');
  node.attr('fill', '#ffffff')
    .transition().duration(400)
    .attr('fill', origFill);
}

function zoomToFitHive(duration = 500) {
  if (!svg || !rootG || !zoomBehavior) return;
  const bbox = rootG.node().getBBox();
  if (!bbox.width || !bbox.height) return;

  const w = containerEl.clientWidth || window.innerWidth;
  const h = containerEl.clientHeight || (window.innerHeight - 48);
  const padding = 40;

  const scale = Math.min(
    (w - padding * 2) / bbox.width,
    (h - padding * 2) / bbox.height
  );
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  const transform = d3.zoomIdentity
    .translate(w / 2 - cx * scale, h / 2 - cy * scale)
    .scale(scale);

  svg.transition().duration(duration).call(zoomBehavior.transform, transform);
}

export function resetViewHive() {
  if (!svg || !zoomBehavior) return;
  zoomToFitHive(500);
  hoveredNodeId = null;
}

export function zoomInHive() {
  if (!svg || !zoomBehavior) return;
  svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.4);
}

export function zoomOutHive() {
  if (!svg || !zoomBehavior) return;
  svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7);
}

let _hiveIconRefreshTimer = null;
function _scheduleHiveIconRefresh() {
  if (_hiveIconRefreshTimer) return;
  _hiveIconRefreshTimer = setTimeout(() => {
    _hiveIconRefreshTimer = null;
    render(true);
  }, 200);
}

export function preloadHiveIcons(nodes, palette) {
  const pal = palette || getCurrentThemeName();
  const pending = nodes.filter(n => !isIconLoaded(n.id, pal));
  const BATCH = 12;
  let idx = 0;

  function loadBatch() {
    const end = Math.min(idx + BATCH, pending.length);
    let remaining = end - idx;
    if (remaining <= 0) return;
    for (let i = idx; i < end; i++) {
      const node = pending[i];
      const img = new Image();
      img.onload = img.onerror = () => {
        if (img.naturalWidth) markIconLoaded(pal, node.id);
        if (--remaining === 0) { _scheduleHiveIconRefresh(); loadBatch(); }
      };
      img.src = getIconPath(node, pal);
    }
    idx = end;
  }
  loadBatch();
}

