/**
 * panel.js - Right-side detail panel (open/close/populate)
 */

import { getColor, COMPLEXITY_BADGE_COLORS, getAgentColor, getTeamColor, getCurrentThemeName } from './colors.js';
import { getHdMode } from './icons.js';
import { t } from './i18n.js';

// TODO(#76): Make configurable for forks — could read from skills.json metadata or data attribute
const GITHUB_REPO_BASE = 'https://github.com/pjt222/agent-almanac/blob/main/';
const GITHUB_SKILLS_BASE = `${GITHUB_REPO_BASE}skills/`;

const PRIORITY_BADGE_COLORS = {
  critical: '#ff4444',
  high:     '#ffaa00',
  normal:   '#888899',
};

let panelEl = null;
let onRelatedClick = null;
let currentNode = null;

export function initPanel(el, { onRelated } = {}) {
  panelEl = el;
  onRelatedClick = onRelated;

  const closeBtn = panelEl.querySelector('.panel-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }

  // ── Swipe-down to dismiss on mobile ────────────
  let touchStartY = 0;
  let touchDeltaY = 0;
  const SWIPE_DISMISS_THRESHOLD = 80;

  panelEl.addEventListener('touchstart', e => {
    // Only track if touching the drag handle or top bar area
    const topBar = panelEl.querySelector('.panel-top-bar');
    if (topBar && topBar.contains(e.target)) {
      touchStartY = e.touches[0].clientY;
      touchDeltaY = 0;
    } else {
      touchStartY = 0;
    }
  }, { passive: true });

  panelEl.addEventListener('touchmove', e => {
    if (!touchStartY) return;
    touchDeltaY = e.touches[0].clientY - touchStartY;
    // Only allow downward drag
    if (touchDeltaY > 0) {
      panelEl.style.transition = 'none';
      panelEl.style.transform = `translateY(${touchDeltaY}px)`;
    }
  }, { passive: true });

  panelEl.addEventListener('touchend', () => {
    if (!touchStartY) return;
    panelEl.style.transition = '';
    if (touchDeltaY > SWIPE_DISMISS_THRESHOLD) {
      closePanel();
    } else {
      // Snap back
      panelEl.style.transform = '';
    }
    touchStartY = 0;
    touchDeltaY = 0;
  }, { passive: true });
}

export function openPanel(node) {
  if (!panelEl || !node) return;
  currentNode = node;

  if (node.type === 'team') {
    openTeamPanel(node);
    return;
  }

  if (node.type === 'agent') {
    openAgentPanel(node);
    return;
  }

  openSkillPanel(node);
}

/**
 * Re-render the panel for the current node (e.g. after theme change).
 */
export function refreshPanelTheme() {
  if (!panelEl || !currentNode) return;
  if (!panelEl.classList.contains('open')) return;
  openPanel(currentNode);
}

function openSkillPanel(node) {
  const color = getColor(node.domain);
  const badgeColor = COMPLEXITY_BADGE_COLORS[node.complexity] || '#999';

  const iconDir = getHdMode() ? 'icons-hd' : 'icons';
  const iconSrc = `${iconDir}/${getCurrentThemeName()}/${encodeURI(node.domain)}/${encodeURI(node.id)}.webp`;
  let html = `
    <div class="panel-icon-wrapper">
      <img class="panel-icon" src="${iconSrc}" alt="">
    </div>
    <h2 class="panel-title" style="color: ${color}; text-shadow: 0 0 12px ${color}">${escHtml(node.title || node.id)}</h2>
    <div class="panel-badges">
      <span class="badge badge-domain" style="border-color: ${color}; color: ${color}">${escHtml(node.domain)}</span>
      <span class="badge badge-complexity" style="border-color: ${badgeColor}; color: ${badgeColor}">${escHtml(node.complexity)}</span>
      <span class="badge badge-lang">${escHtml(node.language)}</span>
    </div>
    <p class="panel-desc">${escHtml(node.description)}</p>
  `;

  if (node.tags && node.tags.length) {
    html += `<div class="panel-tags">${node.tags.map(tag =>
      `<span class="tag">${escHtml(tag)}</span>`
    ).join('')}</div>`;
  }

  if (node.related && node.related.length) {
    html += `<h3 class="panel-section-title">${t('panel.relatedSkills')}</h3><ul class="panel-related">`;
    for (const rid of node.related) {
      html += `<li><a href="#" class="related-link" data-id="${escAttr(rid)}">${escHtml(rid)}</a></li>`;
    }
    html += `</ul>`;
  }

  html += `
    <div class="panel-actions">
      <a href="${GITHUB_SKILLS_BASE}${encodeURI(node.path)}" target="_blank" rel="noopener" class="source-link">
        ${t('panel.viewSourceSkill')}
      </a>
    </div>
  `;

  setPanelContent(html);
  attachIconErrorHandler(() => {
    const wrapper = panelEl.querySelector('.panel-icon')?.parentElement;
    if (wrapper) wrapper.style.display = 'none';
  });
}

function openTeamPanel(node) {
  const teamId = node.id.replace('team:', '');
  const color = getTeamColor(teamId);

  const iconDirTeam = getHdMode() ? 'icons-hd' : 'icons';
  const iconSrc = `${iconDirTeam}/${getCurrentThemeName()}/teams/${encodeURI(teamId)}.webp`;

  let html = `
    <div class="panel-icon-wrapper">
      <img class="panel-icon" src="${iconSrc}" alt="">
    </div>
    <h2 class="panel-title" style="color: ${color}; text-shadow: 0 0 12px ${color}">${escHtml(node.title || node.id)}</h2>
    <div class="panel-badges">
      <span class="badge" style="border-color: ${color}; color: ${color}">${t('panel.badgeTeam')}</span>
      <span class="badge" style="border-color: #888; color: #888">${escHtml(node.coordination || 'hub-and-spoke')}</span>
    </div>
    <p class="panel-desc">${escHtml(node.description)}</p>
  `;

  if (node.lead) {
    html += `<h3 class="panel-section-title">${t('panel.lead')}</h3>`;
    html += `<ul class="panel-related"><li><a href="#" class="related-link" data-id="agent:${escAttr(node.lead)}">${escHtml(node.lead)}</a></li></ul>`;
  }

  if (node.members && node.members.length) {
    html += `<h3 class="panel-section-title">${t('panel.members', { count: node.members.length })}</h3><ul class="panel-related">`;
    for (const memberId of node.members) {
      const isLead = memberId === node.lead;
      html += `<li><a href="#" class="related-link" data-id="agent:${escAttr(memberId)}">${escHtml(memberId)}</a>${isLead ? ` <span class="badge" style="border-color: ${color}; color: ${color}; font-size: 0.7em">${t('panel.badgeLead')}</span>` : ''}</li>`;
    }
    html += `</ul>`;
  }

  if (node.tags && node.tags.length) {
    html += `<h3 class="panel-section-title">${t('panel.tags')}</h3>`;
    html += `<div class="panel-tags">${node.tags.map(tag =>
      `<span class="tag">${escHtml(tag)}</span>`
    ).join('')}</div>`;
  }

  html += `
    <div class="panel-actions">
      <a href="${GITHUB_REPO_BASE}${encodeURI(node.path)}" target="_blank" rel="noopener" class="source-link">
        ${t('panel.viewTeamDefinition')}
      </a>
    </div>
  `;

  setPanelContent(html);
  attachIconErrorHandler(() => {
    const wrapper = panelEl.querySelector('.panel-icon')?.parentElement;
    if (wrapper) {
      wrapper.textContent = '';
      const fallback = document.createElement('div');
      fallback.className = 'panel-agent-hex';
      Object.assign(fallback.style, { color, textShadow: `0 0 16px ${color}` });
      fallback.textContent = '\u2B1F';
      wrapper.appendChild(fallback);
    }
  });
}

function openAgentPanel(node) {
  const agentId = node.id.replace('agent:', '');
  const color = getAgentColor(agentId);
  const priorityColor = PRIORITY_BADGE_COLORS[node.priority] || '#888899';

  const iconDirAgent = getHdMode() ? 'icons-hd' : 'icons';
  const iconSrc = `${iconDirAgent}/${getCurrentThemeName()}/agents/${encodeURI(agentId)}.webp`;

  let html = `
    <div class="panel-icon-wrapper">
      <img class="panel-icon" src="${iconSrc}" alt="">
    </div>
    <h2 class="panel-title" style="color: ${color}; text-shadow: 0 0 12px ${color}">${escHtml(node.title || node.id)}</h2>
    <div class="panel-badges">
      <span class="badge" style="border-color: ${color}; color: ${color}">${t('panel.badgeAgent')}</span>
      <span class="badge" style="border-color: ${priorityColor}; color: ${priorityColor}">${escHtml(node.priority)}</span>
    </div>
    <p class="panel-desc">${escHtml(node.description)}</p>
  `;

  if (node.tools && node.tools.length) {
    html += `<h3 class="panel-section-title">${t('panel.tools')}</h3>`;
    html += `<div class="panel-tags">${node.tools.map(tool =>
      `<span class="tag">${escHtml(tool)}</span>`
    ).join('')}</div>`;
  }

  if (node.mcp_servers && node.mcp_servers.length) {
    html += `<h3 class="panel-section-title">${t('panel.mcpServers')}</h3>`;
    html += `<div class="panel-tags">${node.mcp_servers.map(srv =>
      `<span class="tag">${escHtml(srv)}</span>`
    ).join('')}</div>`;
  }

  if (node.tags && node.tags.length) {
    html += `<h3 class="panel-section-title">${t('panel.tags')}</h3>`;
    html += `<div class="panel-tags">${node.tags.map(tag =>
      `<span class="tag">${escHtml(tag)}</span>`
    ).join('')}</div>`;
  }

  if (node.skills && node.skills.length) {
    html += `<h3 class="panel-section-title">${t('panel.skills', { count: node.skills.length })}</h3><ul class="panel-related">`;
    for (const sid of node.skills) {
      html += `<li><a href="#" class="related-link" data-id="${escAttr(sid)}">${escHtml(sid)}</a></li>`;
    }
    html += `</ul>`;
  }

  html += `
    <div class="panel-actions">
      <a href="${GITHUB_REPO_BASE}${encodeURI(node.path)}" target="_blank" rel="noopener" class="source-link">
        ${t('panel.viewAgentDefinition')}
      </a>
    </div>
  `;

  setPanelContent(html);
  attachIconErrorHandler(() => {
    const wrapper = panelEl.querySelector('.panel-icon')?.parentElement;
    if (wrapper) {
      wrapper.textContent = '';
      const fallback = document.createElement('div');
      fallback.className = 'panel-agent-hex';
      Object.assign(fallback.style, { color, textShadow: `0 0 16px ${color}` });
      fallback.textContent = '\u2B22';
      wrapper.appendChild(fallback);
    }
  });
}

function setPanelContent(html) {
  const content = panelEl.querySelector('.panel-content');
  if (content) content.innerHTML = html;

  // Bind related/skill links
  panelEl.querySelectorAll('.related-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.dataset.id;
      if (onRelatedClick) onRelatedClick(id);
    });
  });

  panelEl.classList.add('open');

  // Move focus into panel for accessibility
  const title = panelEl.querySelector('.panel-title');
  if (title) {
    title.setAttribute('tabindex', '-1');
    title.focus();
  }
}

export function closePanel() {
  if (panelEl) {
    panelEl.classList.remove('open');
    panelEl.style.transform = '';
  }
}

function attachIconErrorHandler(onError) {
  const img = panelEl.querySelector('.panel-icon');
  if (img) img.addEventListener('error', onError, { once: true });
}

function escHtml(s) {
  const div = document.createElement('div');
  div.textContent = s || '';
  return div.innerHTML;
}

function escAttr(s) {
  return (s || '').replace(/"/g, '&quot;');
}
