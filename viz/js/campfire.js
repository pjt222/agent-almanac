// campfire.js - Campfire visualization mode (D3 SVG)
// put id:"mode_campfire", label:"SVG-based radial campfire layout showing team social structure (D3)", node_type:"process", input:"active_module"
// Mode 6: warm radial layout revealing team communities, bridges, and fire states.
// Overview: 15 fires as warm points, light trails between shared agents.
// Focus: team center, agents inner ring, skills outer ring.

import * as d3 from 'd3';
import {
  getColor, getAgentColor, getTeamColor, hexToRgba,
  TEAM_CONFIG, getCurrentThemeName
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
let focusedTeamId = null;

// ── Warm palette ────────────────────────────────────────────────────

const WARM = {
  background: '#1a0e07',
  fire: '#FF6B35',
  amber: '#FFB347',
  spark: '#FFF4E0',
  ember: '#8B4513',
  trail: 'rgba(255, 165, 0, 0.15)',
  trailActive: 'rgba(255, 165, 0, 0.4)',
  dimNode: 'rgba(255, 255, 255, 0.08)',
  text: '#D4A574',
  textDim: 'rgba(212, 165, 116, 0.5)',
};

/**
 * Warm a hex color toward amber.
 * @param {string} hex - e.g. '#3a86ff'
 * @param {number} [intensity=0.5]
 * @returns {string} Warmed hex
 */
function warmColor(hex, intensity = 0.5) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Shift toward orange (255, 165, 0)
  const wr = Math.round(r + (255 - r) * intensity);
  const wg = Math.round(g + (165 - g) * intensity * 0.7);
  const wb = Math.round(b + (0 - b) * intensity);
  return `rgb(${wr}, ${wg}, ${wb})`;
}

// ── Data helpers ────────────────────────────────────────────────────

function getTeamNodes(data) {
  return data.nodes.filter(n => n.type === 'team');
}

function getAgentNodes(data) {
  return data.nodes.filter(n => n.type === 'agent');
}

function getSkillNodes(data) {
  return data.nodes.filter(n => n.type === 'skill');
}

/** Build a map of shared agents between teams. */
function buildSharedAgents(data) {
  const teamAgents = new Map();
  for (const link of data.links) {
    if (link.type !== 'team') continue;
    const src = typeof link.source === 'object' ? link.source.id : link.source;
    const tgt = typeof link.target === 'object' ? link.target.id : link.target;
    // team -> agent links
    const teamNode = data.nodes.find(n => n.id === src && n.type === 'team') ||
                     data.nodes.find(n => n.id === tgt && n.type === 'team');
    const agentNode = data.nodes.find(n => n.id === src && n.type === 'agent') ||
                      data.nodes.find(n => n.id === tgt && n.type === 'agent');
    if (!teamNode || !agentNode) continue;
    if (!teamAgents.has(teamNode.id)) teamAgents.set(teamNode.id, new Set());
    teamAgents.get(teamNode.id).add(agentNode.id);
  }
  return teamAgents;
}

function findTeamAgents(data, teamId) {
  const agents = [];
  for (const link of data.links) {
    if (link.type !== 'team') continue;
    const src = typeof link.source === 'object' ? link.source.id : link.source;
    const tgt = typeof link.target === 'object' ? link.target.id : link.target;
    if (src === teamId) {
      const agent = data.nodes.find(n => n.id === tgt && n.type === 'agent');
      if (agent) agents.push(agent);
    } else if (tgt === teamId) {
      const agent = data.nodes.find(n => n.id === src && n.type === 'agent');
      if (agent) agents.push(agent);
    }
  }
  return agents;
}

function findAgentSkills(data, agentId) {
  const skills = [];
  for (const link of data.links) {
    if (link.type !== 'agent') continue;
    const src = typeof link.source === 'object' ? link.source.id : link.source;
    const tgt = typeof link.target === 'object' ? link.target.id : link.target;
    if (src === agentId) {
      const skill = data.nodes.find(n => n.id === tgt && n.type === 'skill');
      if (skill) skills.push(skill);
    } else if (tgt === agentId) {
      const skill = data.nodes.find(n => n.id === src && n.type === 'skill');
      if (skill) skills.push(skill);
    }
  }
  return skills;
}

function countTeamSkills(data, teamId) {
  const agents = findTeamAgents(data, teamId);
  const skillIds = new Set();
  for (const agent of agents) {
    for (const skill of findAgentSkills(data, agent.id)) {
      skillIds.add(skill.id);
    }
  }
  return skillIds.size;
}

// ── Overview rendering ──────────────────────────────────────────────

function renderOverview() {
  if (!rootG || !fullData) return;
  rootG.selectAll('*').remove();

  const teams = getTeamNodes(fullData);
  const teamAgents = buildSharedAgents(fullData);
  const width = containerEl.clientWidth;
  const height = containerEl.clientHeight;
  const cx = width / 2;
  const cy = height / 2;

  // Layout: force simulation just for team nodes
  const teamPositions = new Map();
  const simNodes = teams.map(t => ({
    id: t.id,
    x: cx + (Math.random() - 0.5) * 200,
    y: cy + (Math.random() - 0.5) * 200,
  }));

  // Build links between teams that share agents
  const simLinks = [];
  const teamIds = teams.map(t => t.id);
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      const a1 = teamAgents.get(teamIds[i]) || new Set();
      const a2 = teamAgents.get(teamIds[j]) || new Set();
      const shared = [...a1].filter(a => a2.has(a));
      if (shared.length > 0) {
        simLinks.push({
          source: teamIds[i],
          target: teamIds[j],
          strength: shared.length,
          agents: shared,
        });
      }
    }
  }

  // Quick simulation
  const sim = d3.forceSimulation(simNodes)
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(cx, cy))
    .force('link', d3.forceLink(simLinks)
      .id(d => d.id)
      .distance(d => 200 / d.strength)
      .strength(d => 0.3 * d.strength))
    .force('collide', d3.forceCollide(60))
    .stop();

  for (let i = 0; i < 200; i++) sim.tick();

  for (const n of simNodes) {
    teamPositions.set(n.id, { x: n.x, y: n.y });
  }

  // Draw light trails (shared agent connections)
  const trailGroup = rootG.append('g').attr('class', 'campfire-trails');
  for (const link of simLinks) {
    const s = teamPositions.get(typeof link.source === 'object' ? link.source.id : link.source);
    const t = teamPositions.get(typeof link.target === 'object' ? link.target.id : link.target);
    if (!s || !t) continue;
    trailGroup.append('line')
      .attr('x1', s.x).attr('y1', s.y)
      .attr('x2', t.x).attr('y2', t.y)
      .attr('stroke', WARM.trail)
      .attr('stroke-width', 1 + link.strength)
      .attr('opacity', 0)
      .transition().duration(800).delay(300)
      .attr('opacity', 1);
  }

  // Draw fires
  const fireGroup = rootG.append('g').attr('class', 'campfire-fires');
  for (const team of teams) {
    const pos = teamPositions.get(team.id);
    if (!pos) continue;
    const skillCount = countTeamSkills(fullData, team.id);
    const radius = 18 + Math.sqrt(skillCount) * 2;

    const g = fireGroup.append('g')
      .attr('class', 'campfire-fire')
      .attr('transform', `translate(${pos.x}, ${pos.y})`)
      .attr('cursor', 'pointer')
      .on('click', () => {
        focusedTeamId = team.id;
        renderFocus(team.id);
        if (onNodeClick) onNodeClick(team);
        logEvent('campfire', { event: 'focusFire', team: team.id });
      })
      .on('mouseenter', () => { if (onNodeHover) onNodeHover(team); })
      .on('mouseleave', () => { if (onNodeHover) onNodeHover(null); });

    // Warm glow
    const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
    const gradId = `fire-glow-${team.id.replace(/[^a-z0-9]/g, '-')}`;
    if (defs.select(`#${gradId}`).empty()) {
      const grad = defs.append('radialGradient').attr('id', gradId);
      grad.append('stop').attr('offset', '0%').attr('stop-color', WARM.fire).attr('stop-opacity', 0.9);
      grad.append('stop').attr('offset', '40%').attr('stop-color', WARM.amber).attr('stop-opacity', 0.4);
      grad.append('stop').attr('offset', '100%').attr('stop-color', WARM.ember).attr('stop-opacity', 0);
    }

    // Glow circle
    g.append('circle')
      .attr('r', radius * 2)
      .attr('fill', `url(#${gradId})`)
      .attr('opacity', 0)
      .transition().duration(600).delay(100)
      .attr('opacity', 0.6);

    // Core circle
    const teamColor = getTeamColor(team.id) || WARM.fire;
    g.append('circle')
      .attr('r', radius)
      .attr('fill', warmColor(teamColor, 0.4))
      .attr('stroke', WARM.fire)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0)
      .transition().duration(400).delay(200)
      .attr('opacity', 1);

    // Icon (if available)
    const iconPath = getIconPath(team, getCurrentThemeName());
    if (iconPath && isIconLoaded(team, getCurrentThemeName())) {
      g.append('image')
        .attr('href', iconPath)
        .attr('width', radius * 1.4)
        .attr('height', radius * 1.4)
        .attr('x', -radius * 0.7)
        .attr('y', -radius * 0.7)
        .attr('opacity', 0)
        .transition().duration(400).delay(300)
        .attr('opacity', 0.85);
    }

    // Label
    g.append('text')
      .attr('y', radius + 16)
      .attr('text-anchor', 'middle')
      .attr('fill', WARM.text)
      .attr('font-size', '11px')
      .attr('font-family', 'system-ui, sans-serif')
      .text(team.title || team.id)
      .attr('opacity', 0)
      .transition().duration(400).delay(400)
      .attr('opacity', 1);

    // Member count
    const agentCount = findTeamAgents(fullData, team.id).length;
    g.append('text')
      .attr('y', radius + 28)
      .attr('text-anchor', 'middle')
      .attr('fill', WARM.textDim)
      .attr('font-size', '9px')
      .attr('font-family', 'system-ui, sans-serif')
      .text(`${agentCount} keepers`)
      .attr('opacity', 0)
      .transition().duration(400).delay(500)
      .attr('opacity', 1);
  }

  // Prompt text
  rootG.append('text')
    .attr('x', cx)
    .attr('y', height - 30)
    .attr('text-anchor', 'middle')
    .attr('fill', WARM.textDim)
    .attr('font-size', '12px')
    .attr('font-family', 'system-ui, sans-serif')
    .text(t('campfire.focusPrompt'))
    .attr('opacity', 0)
    .transition().duration(600).delay(800)
    .attr('opacity', 1);
}

// ── Focus rendering (one fire) ──────────────────────────────────────

function renderFocus(teamId) {
  if (!rootG || !fullData) return;
  rootG.selectAll('*').remove();

  const team = fullData.nodes.find(n => n.id === teamId && n.type === 'team');
  if (!team) return;

  const width = containerEl.clientWidth;
  const height = containerEl.clientHeight;
  const cx = width / 2;
  const cy = height / 2;

  const agents = findTeamAgents(fullData, teamId);
  const agentCount = agents.length;

  // Vignette overlay (CSS handles this via the container)
  containerEl.style.setProperty('--fire-x', `${cx}px`);
  containerEl.style.setProperty('--fire-y', `${cy}px`);

  // Back button
  rootG.append('text')
    .attr('x', 20)
    .attr('y', 30)
    .attr('fill', WARM.amber)
    .attr('font-size', '12px')
    .attr('font-family', 'system-ui, sans-serif')
    .attr('cursor', 'pointer')
    .text(`← ${t('campfire.backToOverview')}`)
    .on('click', () => {
      focusedTeamId = null;
      containerEl.style.removeProperty('--fire-x');
      containerEl.style.removeProperty('--fire-y');
      renderOverview();
    });

  // Central team glow
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
  const gradId = 'fire-focus-glow';
  if (defs.select(`#${gradId}`).empty()) {
    const grad = defs.append('radialGradient').attr('id', gradId);
    grad.append('stop').attr('offset', '0%').attr('stop-color', WARM.fire).attr('stop-opacity', 0.9);
    grad.append('stop').attr('offset', '30%').attr('stop-color', WARM.amber).attr('stop-opacity', 0.5);
    grad.append('stop').attr('offset', '70%').attr('stop-color', WARM.ember).attr('stop-opacity', 0.15);
    grad.append('stop').attr('offset', '100%').attr('stop-color', 'transparent').attr('stop-opacity', 0);
  }

  // Central glow
  rootG.append('circle')
    .attr('cx', cx).attr('cy', cy)
    .attr('r', 120)
    .attr('fill', `url(#${gradId})`)
    .attr('opacity', 0)
    .transition().duration(600)
    .attr('opacity', 0.8);

  // Team icon at center
  const teamColor = getTeamColor(teamId) || WARM.fire;
  rootG.append('circle')
    .attr('cx', cx).attr('cy', cy)
    .attr('r', 32)
    .attr('fill', warmColor(teamColor, 0.3))
    .attr('stroke', WARM.fire)
    .attr('stroke-width', 2)
    .attr('opacity', 0)
    .transition().duration(400)
    .attr('opacity', 1);

  const iconPath = getIconPath(team, getCurrentThemeName());
  if (iconPath && isIconLoaded(team, getCurrentThemeName())) {
    rootG.append('image')
      .attr('href', iconPath)
      .attr('x', cx - 24).attr('y', cy - 24)
      .attr('width', 48).attr('height', 48)
      .attr('opacity', 0)
      .transition().duration(400).delay(100)
      .attr('opacity', 0.9);
  }

  // Team label
  rootG.append('text')
    .attr('x', cx).attr('y', cy + 50)
    .attr('text-anchor', 'middle')
    .attr('fill', WARM.fire)
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .attr('font-family', 'system-ui, sans-serif')
    .text(team.title || team.id)
    .attr('opacity', 0)
    .transition().duration(400).delay(200)
    .attr('opacity', 1);

  // Pattern info
  const coordination = team.coordination || '';
  rootG.append('text')
    .attr('x', cx).attr('y', cy + 66)
    .attr('text-anchor', 'middle')
    .attr('fill', WARM.textDim)
    .attr('font-size', '10px')
    .attr('font-family', 'system-ui, sans-serif')
    .text(coordination)
    .attr('opacity', 0)
    .transition().duration(400).delay(250)
    .attr('opacity', 1);

  // Agent ring (inner ring, ~150px from center)
  const agentRadius = Math.min(width, height) * 0.22;
  agents.forEach((agent, i) => {
    const angle = (i / agentCount) * 2 * Math.PI - Math.PI / 2;
    const ax = cx + agentRadius * Math.cos(angle);
    const ay = cy + agentRadius * Math.sin(angle);

    // Line from center to agent
    rootG.append('line')
      .attr('x1', cx).attr('y1', cy)
      .attr('x2', ax).attr('y2', ay)
      .attr('stroke', WARM.trail)
      .attr('stroke-width', 1)
      .attr('opacity', 0)
      .transition().duration(400).delay(300 + i * 50)
      .attr('opacity', 0.5);

    const agentColor = getAgentColor(agent.id) || WARM.amber;
    const isLead = agent.id === (team.lead || team.members?.[0]);

    // Agent node
    const ag = rootG.append('g')
      .attr('transform', `translate(${ax}, ${ay})`)
      .attr('cursor', 'pointer')
      .on('click', () => { if (onNodeClick) onNodeClick(agent); })
      .on('mouseenter', () => { if (onNodeHover) onNodeHover(agent); })
      .on('mouseleave', () => { if (onNodeHover) onNodeHover(null); });

    // Octagon shape for agents
    const octSize = isLead ? 16 : 13;
    const octPath = octagonPath(octSize);
    ag.append('path')
      .attr('d', octPath)
      .attr('fill', warmColor(agentColor, 0.35))
      .attr('stroke', isLead ? WARM.fire : WARM.amber)
      .attr('stroke-width', isLead ? 2 : 1)
      .attr('opacity', 0)
      .transition().duration(300).delay(350 + i * 50)
      .attr('opacity', 1);

    // Agent label
    ag.append('text')
      .attr('y', octSize + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', isLead ? WARM.fire : WARM.amber)
      .attr('font-size', isLead ? '11px' : '10px')
      .attr('font-family', 'system-ui, sans-serif')
      .text(agent.title || agent.id)
      .attr('opacity', 0)
      .transition().duration(300).delay(400 + i * 50)
      .attr('opacity', 1);

    if (isLead) {
      ag.append('text')
        .attr('y', octSize + 25)
        .attr('text-anchor', 'middle')
        .attr('fill', WARM.textDim)
        .attr('font-size', '8px')
        .attr('font-family', 'system-ui, sans-serif')
        .text(t('campfire.fireKeeper'))
        .attr('opacity', 0)
        .transition().duration(300).delay(450 + i * 50)
        .attr('opacity', 1);
    }

    // Skills (outer ring, sparks radiating from each agent)
    const skills = findAgentSkills(fullData, agent.id);
    const skillRadius = Math.min(width, height) * 0.12;
    const fanAngle = (2 * Math.PI) / agentCount * 0.7; // Spread within this agent's sector
    const baseAngle = angle;

    skills.forEach((skill, si) => {
      const skillAngle = baseAngle + (si - (skills.length - 1) / 2) * (fanAngle / Math.max(skills.length, 1));
      const sx = skillRadius * Math.cos(skillAngle);
      const sy = skillRadius * Math.sin(skillAngle);

      // Spark line
      rootG.append('line')
        .attr('x1', ax).attr('y1', ay)
        .attr('x2', ax + sx).attr('y2', ay + sy)
        .attr('stroke', WARM.dimNode)
        .attr('stroke-width', 0.5)
        .attr('opacity', 0)
        .transition().duration(200).delay(500 + i * 50 + si * 10)
        .attr('opacity', 0.4);

      // Spark dot
      const skillG = rootG.append('g')
        .attr('transform', `translate(${ax + sx}, ${ay + sy})`)
        .attr('cursor', 'pointer')
        .on('click', () => { if (onNodeClick) onNodeClick(skill); })
        .on('mouseenter', () => { if (onNodeHover) onNodeHover(skill); })
        .on('mouseleave', () => { if (onNodeHover) onNodeHover(null); });

      const skillColor = getColor(skill.domain) || WARM.spark;
      skillG.append('circle')
        .attr('r', 4)
        .attr('fill', warmColor(skillColor, 0.4))
        .attr('opacity', 0)
        .transition().duration(200).delay(550 + i * 50 + si * 10)
        .attr('opacity', 0.7);
    });
  });

  // Total practice count
  const totalSkills = countTeamSkills(fullData, teamId);
  rootG.append('text')
    .attr('x', cx).attr('y', height - 30)
    .attr('text-anchor', 'middle')
    .attr('fill', WARM.textDim)
    .attr('font-size', '11px')
    .attr('font-family', 'system-ui, sans-serif')
    .text(t('campfire.practicesTotal', { count: totalSkills }))
    .attr('opacity', 0)
    .transition().duration(400).delay(800)
    .attr('opacity', 1);
}

function octagonPath(size) {
  const points = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8 - Math.PI / 8;
    points.push([size * Math.cos(angle), size * Math.sin(angle)]);
  }
  return `M${points.map(p => p.join(',')).join('L')}Z`;
}

// ── Render dispatcher ───────────────────────────────────────────────

function render() {
  if (focusedTeamId) {
    renderFocus(focusedTeamId);
  } else {
    renderOverview();
  }
}

// ── Public API (mode interface) ─────────────────────────────────────

export function initCampfireGraph(container, data, { onClick, onHover } = {}) {
  containerEl = container;
  fullData = data;
  onNodeClick = onClick;
  onNodeHover = onHover;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Set warm background
  container.style.backgroundColor = WARM.background;

  svg = d3.select(container).append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'hidden');

  svg.append('defs');

  rootG = svg.append('g');

  // Zoom behavior
  zoomBehavior = d3.zoom()
    .scaleExtent([0.3, 5])
    .on('zoom', (event) => {
      rootG.attr('transform', event.transform);
    });
  svg.call(zoomBehavior);

  // Resize handler
  resizeHandler = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    svg.attr('viewBox', `0 0 ${w} ${h}`);
    render();
  };
  window.addEventListener('resize', resizeHandler);

  // Check for URL params
  const params = new URLSearchParams(window.location.search);
  const focusTeam = params.get('fire') || params.get('focus');
  if (focusTeam && data.nodes.find(n => n.id === focusTeam && n.type === 'team')) {
    focusedTeamId = focusTeam;
  }

  render();
  logEvent('campfire', { event: 'init', teams: getTeamNodes(data).length });
}

export function destroyCampfireGraph() {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  if (containerEl) {
    containerEl.style.backgroundColor = '';
    containerEl.style.removeProperty('--fire-x');
    containerEl.style.removeProperty('--fire-y');
  }
  if (svg) {
    svg.remove();
    svg = null;
  }
  rootG = null;
  focusedTeamId = null;
}

export function setSkillVisibilityCampfire(ids) {
  visibleSkillSet = ids ? new Set(ids) : null;
}

export function setVisibleAgentsCampfire(ids) {
  visibleAgentIds = ids;
}

export function setVisibleTeamsCampfire(ids) {
  visibleTeamIds = ids;
}

export function getVisibleAgentIdsCampfire() {
  return visibleAgentIds;
}

export function refreshCampfireGraph() {
  render();
}

export function focusNodeCampfire(id) {
  if (!fullData) return;
  const node = fullData.nodes.find(n => n.id === id);
  if (!node) return;

  if (node.type === 'team') {
    focusedTeamId = id;
    renderFocus(id);
  } else if (onNodeClick) {
    onNodeClick(node);
  }
}

export function resetViewCampfire() {
  focusedTeamId = null;
  if (containerEl) {
    containerEl.style.removeProperty('--fire-x');
    containerEl.style.removeProperty('--fire-y');
  }
  if (svg && zoomBehavior) {
    svg.transition().duration(400).call(zoomBehavior.transform, d3.zoomIdentity);
  }
  renderOverview();
}

export function zoomInCampfire() {
  if (svg && zoomBehavior) {
    svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.3);
  }
}

export function zoomOutCampfire() {
  if (svg && zoomBehavior) {
    svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.77);
  }
}

export function preloadCampfireIcons(nodes, palette) {
  // Use existing icon system — just ensure team/agent icons are loaded
  const teamAndAgents = nodes.filter(n => n.type === 'team' || n.type === 'agent');
  for (const node of teamAndAgents) {
    const path = getIconPath(node, palette);
    if (path && !isIconLoaded(node, palette)) {
      const img = new Image();
      img.onload = () => markIconLoaded(node, palette);
      img.src = path;
    }
  }
}
