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
let iconPreloadPending = 0;
let iconFailedIds = new Set();

// ── Warm palette ────────────────────────────────────────────────────

const WARM = {
  background: '#1a0e07',
  fire: '#FF6B35',
  amber: '#FFB347',
  spark: '#FFF4E0',
  ember: '#A0522D',
  trail: 'rgba(255, 165, 0, 0.25)',
  trailActive: 'rgba(255, 165, 0, 0.4)',
  dimNode: 'rgba(255, 255, 255, 0.15)',
  text: '#D4A574',
  textDim: 'rgba(212, 165, 116, 0.7)',
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

// ── Pattern labels ──────────────────────────────────────────────────

const PATTERN_LABELS = {
  'hub-and-spoke': 'patternHubAndSpoke',
  'sequential': 'patternSequential',
  'parallel': 'patternParallel',
  'reciprocal': 'patternReciprocal',
  'timeboxed': 'patternTimeboxed',
  'adaptive': 'patternAdaptive',
  'wave-parallel': 'patternWaveParallel',
  'synoptic': 'patternSynoptic',
};

function getPatternLabel(pattern) {
  const key = PATTERN_LABELS[pattern];
  if (key) {
    const fullKey = `campfire.${key}`;
    const label = t(fullKey);
    // t() returns the dotted key string on cache miss — fall back to raw pattern
    if (label && label !== fullKey) return label;
  }
  return pattern || '';
}

// ── Overview rendering ──────────────────────────────────────────────

function renderOverview() {
  if (!rootG || !fullData) return;
  rootG.selectAll('*').remove();
  removeBackButton();

  const teams = getTeamNodes(fullData);

  // Empty state
  if (teams.length === 0) {
    const width = containerEl.clientWidth;
    const height = containerEl.clientHeight;
    rootG.append('text')
      .attr('x', width / 2).attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', WARM.textDim)
      .attr('font-size', '14px')
      .attr('font-family', 'system-ui, sans-serif')
      .text(t('campfire.noFires'));
    rootG.append('text')
      .attr('x', width / 2).attr('y', height / 2 + 24)
      .attr('text-anchor', 'middle')
      .attr('fill', WARM.textDim)
      .attr('font-size', '11px')
      .attr('font-family', 'system-ui, sans-serif')
      .text(t('campfire.noFiresDetail'));
    return;
  }

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

    const agentCount = findTeamAgents(fullData, team.id).length;
    const ariaLabel = t('campfire.fireAriaLabel', {
      team: team.title || team.id,
      keepers: agentCount,
      practices: skillCount,
    }) || `${team.title || team.id} fire, ${agentCount} keepers, ${skillCount} practices`;

    const g = fireGroup.append('g')
      .attr('class', 'campfire-fire')
      .attr('transform', `translate(${pos.x}, ${pos.y})`)
      .attr('cursor', 'pointer')
      .attr('role', 'button')
      .attr('tabindex', '0')
      .attr('aria-label', ariaLabel)
      .on('click', () => {
        focusedTeamId = team.id;
        renderFocus(team.id);
        if (onNodeClick) onNodeClick(team);
        logEvent('campfire', { event: 'focusFire', team: team.id });
      })
      .on('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          focusedTeamId = team.id;
          renderFocus(team.id);
          if (onNodeClick) onNodeClick(team);
          logEvent('campfire', { event: 'focusFire', team: team.id });
        }
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

    // Core circle with pulse animation
    const teamColor = getTeamColor(team.id) || WARM.fire;
    const coreCircle = g.append('circle')
      .attr('r', radius)
      .attr('fill', warmColor(teamColor, 0.4))
      .attr('stroke', WARM.fire)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0)
      .transition().duration(400).delay(200)
      .attr('opacity', 1);

    // Subtle breathing pulse (non-color state indicator)
    function pulseLoop(el) {
      el.transition('pulse')
        .duration(2000)
        .ease(d3.easeSinInOut)
        .attr('stroke-width', 2.5)
        .transition('pulse')
        .duration(2000)
        .ease(d3.easeSinInOut)
        .attr('stroke-width', 1.5)
        .on('end', function () { pulseLoop(d3.select(this)); });
    }
    coreCircle.on('end', function () { pulseLoop(d3.select(this)); });

    // Icon (if available)
    const iconPath = getIconPath(team, getCurrentThemeName());
    if (iconPath && isIconLoaded(team.id, getCurrentThemeName())) {
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

  // Legend (bottom-right, collapsible)
  const legendX = width - 170;
  const legendY = height - 110;
  const legendG = rootG.append('g')
    .attr('class', 'campfire-legend')
    .attr('transform', `translate(${legendX}, ${legendY})`)
    .attr('cursor', 'pointer')
    .attr('opacity', 0);

  legendG.transition().duration(600).delay(900).attr('opacity', 0.8);

  const legendBg = legendG.append('rect')
    .attr('x', -8).attr('y', -16)
    .attr('width', 160).attr('height', 100)
    .attr('rx', 6)
    .attr('fill', WARM.background)
    .attr('stroke', WARM.trail)
    .attr('stroke-width', 1);

  const items = [
    { glyph: '\u25C9', color: WARM.fire, label: t('campfire.legendFire') || 'Fire (team)' },
    { glyph: '\u25CE', color: WARM.amber, label: t('campfire.legendKeeper') || 'Keeper (agent)' },
    { glyph: '\u2726', color: WARM.spark, label: t('campfire.legendPractice') || 'Practice (skill)' },
    { glyph: '\u2500', color: WARM.trail, label: t('campfire.legendTrail') || 'Shared keepers' },
  ];

  legendG.append('text')
    .attr('x', 0).attr('y', 0)
    .attr('fill', WARM.text)
    .attr('font-size', '10px')
    .attr('font-weight', 'bold')
    .attr('font-family', 'system-ui, sans-serif')
    .text(t('campfire.legendTitle') || 'Legend');

  items.forEach((item, i) => {
    legendG.append('text')
      .attr('class', 'legend-item')
      .attr('x', 0).attr('y', 18 + i * 18)
      .attr('fill', item.color)
      .attr('font-size', '12px')
      .attr('font-family', 'system-ui, sans-serif')
      .text(item.glyph);
    legendG.append('text')
      .attr('class', 'legend-item')
      .attr('x', 18).attr('y', 18 + i * 18)
      .attr('fill', WARM.textDim)
      .attr('font-size', '10px')
      .attr('font-family', 'system-ui, sans-serif')
      .text(item.label);
  });

  // Toggle legend visibility on click
  let legendVisible = true;
  legendG.on('click', () => {
    legendVisible = !legendVisible;
    legendG.selectAll('.legend-item').attr('opacity', legendVisible ? 1 : 0);
    legendBg.attr('height', legendVisible ? 100 : 20);
  });
}

// ── Back button (DOM overlay) ───────────────────────────────────────

function createBackButton() {
  removeBackButton();
  const btn = document.createElement('button');
  btn.setAttribute('data-campfire-back', '');
  btn.setAttribute('aria-label', t('campfire.backButtonAriaLabel') || 'Back to all campfires');
  btn.textContent = `\u2190 ${t('campfire.backToOverview')}`;
  btn.style.cssText = 'position:absolute;top:20px;left:20px;z-index:100;' +
    'background:transparent;border:1px solid ' + WARM.amber + ';' +
    'color:' + WARM.amber + ';font-size:12px;font-family:system-ui,sans-serif;' +
    'padding:4px 10px;border-radius:4px;cursor:pointer;';
  btn.addEventListener('click', () => {
    resetViewCampfire();
  });
  containerEl.appendChild(btn);
}

function removeBackButton() {
  if (!containerEl) return;
  const btn = containerEl.querySelector('[data-campfire-back]');
  if (btn) btn.remove();
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

  // Back button (DOM overlay for keyboard accessibility)
  createBackButton();

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
  if (iconPath && isIconLoaded(team.id, getCurrentThemeName())) {
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

  // Pattern info (human-readable label)
  const coordination = team.coordination || '';
  rootG.append('text')
    .attr('x', cx).attr('y', cy + 66)
    .attr('text-anchor', 'middle')
    .attr('fill', WARM.textDim)
    .attr('font-size', '10px')
    .attr('font-family', 'system-ui, sans-serif')
    .text(getPatternLabel(coordination))
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
    const agentAriaLabel = isLead
      ? (t('campfire.agentLeadAriaLabel', { agent: agent.title || agent.id }) || `${agent.title || agent.id}, fire keeper`)
      : (t('campfire.agentAriaLabel', { agent: agent.title || agent.id }) || agent.title || agent.id);

    const ag = rootG.append('g')
      .attr('transform', `translate(${ax}, ${ay})`)
      .attr('cursor', 'pointer')
      .attr('role', 'button')
      .attr('tabindex', '0')
      .attr('aria-label', agentAriaLabel)
      .on('click', () => { if (onNodeClick) onNodeClick(agent); })
      .on('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (onNodeClick) onNodeClick(agent);
        }
      })
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
    const maxVisible = 12;
    const visibleSkills = skills.slice(0, maxVisible);
    const overflowCount = skills.length - maxVisible;
    const skillRadius = Math.min(width, height) * 0.12;
    const fanAngle = (2 * Math.PI) / agentCount * 0.7; // Spread within this agent's sector
    const baseAngle = angle;

    visibleSkills.forEach((skill, si) => {
      const totalForLayout = overflowCount > 0 ? maxVisible + 1 : visibleSkills.length;
      const skillAngle = baseAngle + (si - (totalForLayout - 1) / 2) * (fanAngle / Math.max(totalForLayout, 1));
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

      // Spark dot (enlarged for target size)
      const skillG = rootG.append('g')
        .attr('transform', `translate(${ax + sx}, ${ay + sy})`)
        .attr('cursor', 'pointer')
        .attr('role', 'button')
        .attr('tabindex', '0')
        .attr('aria-label', skill.title || skill.id)
        .on('click', () => { if (onNodeClick) onNodeClick(skill); })
        .on('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (onNodeClick) onNodeClick(skill);
          }
        })
        .on('mouseenter', function () {
          d3.select(this).select('circle').transition().duration(100).attr('r', 12);
          if (onNodeHover) onNodeHover(skill);
        })
        .on('mouseleave', function () {
          d3.select(this).select('circle').transition().duration(100).attr('r', 8);
          if (onNodeHover) onNodeHover(null);
        });

      const skillColor = getColor(skill.domain) || WARM.spark;
      skillG.append('circle')
        .attr('r', 8)
        .attr('fill', warmColor(skillColor, 0.4))
        .attr('opacity', 0)
        .transition().duration(200).delay(550 + i * 50 + si * 10)
        .attr('opacity', 0.7);
    });

    // Overflow indicator
    if (overflowCount > 0) {
      const overflowAngle = baseAngle + (maxVisible - (maxVisible) / 2) * (fanAngle / Math.max(maxVisible + 1, 1));
      const osx = skillRadius * Math.cos(overflowAngle);
      const osy = skillRadius * Math.sin(overflowAngle);
      rootG.append('text')
        .attr('x', ax + osx).attr('y', ay + osy + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', WARM.textDim)
        .attr('font-size', '9px')
        .attr('font-family', 'system-ui, sans-serif')
        .text(t('campfire.moreSkills', { count: overflowCount }) || `+${overflowCount} more`)
        .attr('opacity', 0)
        .transition().duration(200).delay(550 + i * 50 + maxVisible * 10)
        .attr('opacity', 0.7);
    }
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
  if (focusTeam) {
    if (data.nodes.find(n => n.id === focusTeam && n.type === 'team')) {
      focusedTeamId = focusTeam;
    } else {
      // Show brief "not found" message, then render overview
      render();
      const w = container.clientWidth;
      const h = container.clientHeight;
      const msg = rootG.append('text')
        .attr('x', w / 2).attr('y', 40)
        .attr('text-anchor', 'middle')
        .attr('fill', WARM.amber)
        .attr('font-size', '13px')
        .attr('font-family', 'system-ui, sans-serif')
        .text(t('campfire.fireNotFound', { name: focusTeam }) || `Campfire "${focusTeam}" not found`)
        .attr('opacity', 1);
      msg.transition().delay(3000).duration(600).attr('opacity', 0).remove();
      logEvent('campfire', { event: 'init', teams: getTeamNodes(data).length });
      setupKeyboardHandlers();
      return;
    }
  }

  render();
  logEvent('campfire', { event: 'init', teams: getTeamNodes(data).length });
  setupKeyboardHandlers();
}

// ── Keyboard handlers ───────────────────────────────────────────────

let keydownHandler = null;

function setupKeyboardHandlers() {
  if (keydownHandler) document.removeEventListener('keydown', keydownHandler);

  keydownHandler = (event) => {
    if (!containerEl) return;

    // Escape: return to overview from focus view
    if (event.key === 'Escape' && focusedTeamId) {
      event.preventDefault();
      resetViewCampfire();
      return;
    }

    // Arrow keys: cycle between focusable elements within the SVG
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const focusable = Array.from(containerEl.querySelectorAll('[tabindex="0"]'));
      if (focusable.length === 0) return;
      const current = focusable.indexOf(document.activeElement);
      let next;
      if (event.key === 'ArrowRight') {
        next = current < focusable.length - 1 ? current + 1 : 0;
      } else {
        next = current > 0 ? current - 1 : focusable.length - 1;
      }
      focusable[next].focus();
      event.preventDefault();
    }
  };

  document.addEventListener('keydown', keydownHandler);
}

export function destroyCampfireGraph() {
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  removeBackButton();
  if (containerEl) {
    const preload = containerEl.querySelector('[data-campfire-preload]');
    if (preload) preload.remove();
    const toast = containerEl.querySelector('[data-campfire-toast]');
    if (toast) toast.remove();
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
  removeBackButton();
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

// ── Preload feedback ────────────────────────────────────────────────

function showPreloadIndicator() {
  if (!containerEl) return;
  let el = containerEl.querySelector('[data-campfire-preload]');
  if (el) return;
  el = document.createElement('div');
  el.setAttribute('data-campfire-preload', '');
  el.textContent = 'Loading icons\u2026';
  el.style.cssText = 'position:absolute;bottom:12px;right:16px;z-index:50;' +
    'color:' + WARM.textDim + ';font-size:11px;font-family:system-ui,sans-serif;' +
    'opacity:0.8;pointer-events:none;';
  containerEl.appendChild(el);
}

function removePreloadIndicator() {
  if (!containerEl) return;
  const el = containerEl.querySelector('[data-campfire-preload]');
  if (el) {
    el.style.transition = 'opacity 0.4s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 400);
  }
}

function showIconFailureToast() {
  if (!containerEl || iconFailedIds.size === 0) return;
  const count = iconFailedIds.size;
  const el = document.createElement('div');
  el.setAttribute('data-campfire-toast', '');
  el.textContent = `${count} icon${count !== 1 ? 's' : ''} could not be loaded`;
  el.style.cssText = 'position:absolute;bottom:12px;right:16px;z-index:50;' +
    'color:' + WARM.amber + ';font-size:11px;font-family:system-ui,sans-serif;' +
    'opacity:0.9;pointer-events:none;';
  containerEl.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.6s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 600);
  }, 4000);
}

export function preloadCampfireIcons(nodes, palette) {
  // Use existing icon system — ensure team/agent icons are loaded, then re-render
  const teamAndAgents = nodes.filter(n => n.type === 'team' || n.type === 'agent');
  iconPreloadPending = 0;
  iconFailedIds = new Set();
  for (const node of teamAndAgents) {
    const path = getIconPath(node, palette);
    if (path && !isIconLoaded(node.id, palette)) {
      iconPreloadPending++;
    }
  }
  if (iconPreloadPending > 0) showPreloadIndicator();

  for (const node of teamAndAgents) {
    const path = getIconPath(node, palette);
    if (path && !isIconLoaded(node.id, palette)) {
      const img = new Image();
      img.onload = () => {
        markIconLoaded(palette, node.id);
        iconPreloadPending--;
        if (iconPreloadPending === 0) {
          removePreloadIndicator();
          render();
          if (iconFailedIds.size > 0) showIconFailureToast();
        }
      };
      img.onerror = () => {
        console.warn(`[campfire] Failed to load icon for ${node.id}`);
        iconFailedIds.add(node.id);
        iconPreloadPending--;
        if (iconPreloadPending === 0) {
          removePreloadIndicator();
          render();
          showIconFailureToast();
        }
      };
      img.src = path;
    }
  }
}
