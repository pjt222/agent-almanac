// app.js - Bootstrap: load data, init subsystems, bind controls
// put id:"fetch_data", label:"Fetch skills.json data", node_type:"input", output:"skills_data"
// put id:"init_ui", label:"Init filter panel, detail panel, graph", input:"skills_data", output:"ui_ready"
// put id:"bind_modes", label:"Bind mode switching (2D/3D/Hive/Chord/Flow)", input:"ui_ready", output:"mode_bindings"
// put id:"lazy_load", label:"Lazy-load mode modules on demand", input:"mode_bindings", output:"active_module"
// put id:"render_mode", label:"Render active mode with current filters", node_type:"output", input:"active_module"

import { initGraph, destroyGraph, focusNode, resetView, zoomIn, zoomOut, setSkillVisibility, getGraph, refreshGraph, preloadIcons, switchIconPalette, setVisibleAgents, setVisibleTeams, getVisibleAgentIds } from './graph.js';
import { setIconMode, getIconMode, setHdMode, getHdMode } from './icons.js';
import { initPanel, openPanel, closePanel, refreshPanelTheme } from './panel.js';
import { initFilters, getVisibleSkillIds, getVisibleAgentIds as getFilteredAgentIds, getVisibleTeamIds as getFilteredTeamIds, refreshSwatches, setLocaleFilter } from './filters.js';
import { setTheme, getThemeNames, getCurrentThemeName } from './colors.js';
import { logEvent, isEnabled as isEventLogEnabled, downloadLog } from './eventlog.js';
import { t, initI18n, loadLocale, detectLocale, getSupportedLocales, getLocale, applyLocaleToDOM, onLocaleChange } from './i18n.js';

const DATA_URL = 'data/skills.json';
const LAYOUT_SETTLE_MS = 3500;
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// ── Dynamic favicon switching ───────────────────────────────────────
function switchFavicon(palette) {
  if (!getThemeNames().includes(palette)) return;
  const bustParam = `?v=${Date.now()}`;
  const svgLink = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
  if (svgLink) {
    svgLink.href = `favicons/${palette}/favicon.svg${bustParam}`;
  }
  const pngLink = document.querySelector('link[rel="icon"][sizes="32x32"]');
  if (pngLink) {
    pngLink.href = `favicons/${palette}/favicon-512.png${bustParam}`;
  }
}

let allData = null;
let currentMode = '2d';
let switching = false;

// ── Mode Strategy pattern ───────────────────────────────────────────
// Each mode exposes a uniform interface for dispatch.
// The 2D mode is built from static imports; others are wrapped on lazy-load.

const graph2dMode = {
  focusNode,
  resetView,
  zoomIn,
  zoomOut,
  setSkillVisibility,
  setVisibleAgents,
  setVisibleTeams,
  refreshGraph,
  getVisibleAgentIds,
  destroy: destroyGraph,
};

const modes = { '2d': graph2dMode, '3d': null, hive: null, chord: null, workflow: null };
let activeMode = graph2dMode;

// ── Layout button helper ────────────────────────────────────────────

const MODE_BUTTON_IDS = {
  '2d': 'btn-2d',
  '3d': 'btn-3d',
  hive: 'btn-hive',
  chord: 'btn-chord',
  workflow: 'btn-flow',
};

function setActiveMode(mode) {
  for (const [modeName, btnId] of Object.entries(MODE_BUTTON_IDS)) {
    const btn = document.getElementById(btnId);
    if (!btn) continue;
    const isActive = modeName === mode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  }
}

function hideAllModeControls() {
  const ids = ['btn-hive-sort', 'hive-spread-label', 'hive-domain-focus', 'sprite-label-3d'];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }
}

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

// ── Shared mode callbacks ───────────────────────────────────────────

function modeCallbacks() {
  return {
    onClick(node) {
      if (node) openPanel(node);
      else closePanel();
    },
    onHover(node) {
      showTooltip(node);
    },
  };
}

// ── Lazy-load and wrap mode modules ─────────────────────────────────
// Each loader returns a mode object conforming to the same interface as graph2dMode.
// The raw module reference is also stored for mode-specific extras (e.g. setSpriteScale3D).

let graph3dMod = null;
let hiveMod = null;
let chordMod = null;
let workflowMod = null;

async function loadMode(name) {
  if (modes[name]) return modes[name];

  if (name === '3d') {
    if (!graph3dMod) graph3dMod = await import('./graph3d.js');
    modes['3d'] = {
      focusNode: graph3dMod.focusNode3D,
      resetView: graph3dMod.resetView3D,
      zoomIn: graph3dMod.zoomIn3D,
      zoomOut: graph3dMod.zoomOut3D,
      setSkillVisibility: graph3dMod.setSkillVisibility3D,
      setVisibleAgents: graph3dMod.setVisibleAgents3D,
      setVisibleTeams: graph3dMod.setVisibleTeams3D,
      refreshGraph: graph3dMod.refreshGraph3D,
      getVisibleAgentIds: graph3dMod.getVisibleAgentIds3D,
      destroy: graph3dMod.destroy3DGraph,
    };
  } else if (name === 'hive') {
    if (!hiveMod) hiveMod = await import('./hive.js');
    modes.hive = {
      focusNode: hiveMod.focusNodeHive,
      resetView: hiveMod.resetViewHive,
      zoomIn: hiveMod.zoomInHive,
      zoomOut: hiveMod.zoomOutHive,
      setSkillVisibility: hiveMod.setSkillVisibilityHive,
      setVisibleAgents: hiveMod.setVisibleAgentsHive,
      setVisibleTeams: hiveMod.setVisibleTeamsHive,
      refreshGraph: hiveMod.refreshHiveGraph,
      getVisibleAgentIds: hiveMod.getVisibleAgentIdsHive,
      destroy: hiveMod.destroyHiveGraph,
    };
  } else if (name === 'chord') {
    if (!chordMod) chordMod = await import('./chord.js');
    modes.chord = {
      focusNode: chordMod.focusNodeChord,
      resetView: chordMod.resetViewChord,
      zoomIn: chordMod.zoomInChord,
      zoomOut: chordMod.zoomOutChord,
      setSkillVisibility: chordMod.setSkillVisibilityChord,
      setVisibleAgents: chordMod.setVisibleAgentsChord,
      setVisibleTeams: chordMod.setVisibleTeamsChord,
      refreshGraph: chordMod.refreshChordGraph,
      getVisibleAgentIds: chordMod.getVisibleAgentIdsChord,
      destroy: chordMod.destroyChordGraph,
    };
  } else if (name === 'workflow') {
    if (!workflowMod) workflowMod = await import('./workflow.js');
    modes.workflow = {
      focusNode: workflowMod.focusNodeWorkflow,
      resetView: workflowMod.resetViewWorkflow,
      zoomIn: workflowMod.zoomInWorkflow,
      zoomOut: workflowMod.zoomOutWorkflow,
      setSkillVisibility: workflowMod.setSkillVisibilityWorkflow,
      setVisibleAgents: workflowMod.setVisibleAgentsWorkflow,
      setVisibleTeams: workflowMod.setVisibleTeamsWorkflow,
      refreshGraph: workflowMod.refreshWorkflowGraph,
      getVisibleAgentIds: workflowMod.getVisibleAgentIdsWorkflow,
      destroy: workflowMod.destroyWorkflowGraph,
    };
  }
  return modes[name];
}

// ── Unified mode switching ──────────────────────────────────────────

async function switchMode(newModeName) {
  if (newModeName === '3d' && !isWebGLAvailable()) {
    alert(t('error.noWebGL'));
    return;
  }

  const container = document.getElementById('graph-container');

  try {
    // Load the target mode module (lazy)
    await loadMode(newModeName);

    // Destroy the current mode
    activeMode.destroy();
    container.innerHTML = '';

    // Initialize the new mode
    if (newModeName === '2d') {
      initGraph(container, allData, modeCallbacks());
      const savedIconMode = localStorage.getItem('skillnet-icons') === 'true';
      if (savedIconMode) setIconMode(true);
      preloadIcons(allData.nodes, getCurrentThemeName());
    } else if (newModeName === '3d') {
      graph3dMod.init3DGraph(container, allData, modeCallbacks());
      graph3dMod.preload3DIcons(allData.nodes, getCurrentThemeName());
    } else if (newModeName === 'hive') {
      hiveMod.initHiveGraph(container, allData, modeCallbacks());
    } else if (newModeName === 'chord') {
      chordMod.initChordGraph(container, allData, modeCallbacks());
    } else if (newModeName === 'workflow') {
      workflowMod.initWorkflowGraph(container, allData, modeCallbacks());
    }

    // Update active mode reference
    activeMode = modes[newModeName];
    currentMode = newModeName;

    // Apply current filter state
    activeMode.setVisibleAgents(getFilteredAgentIds());
    activeMode.setVisibleTeams(getFilteredTeamIds());
    activeMode.setSkillVisibility(getVisibleSkillIds());

    logEvent('app', { event: 'modeSwitch', mode: newModeName });
    setActiveMode(newModeName);

    // Toggle mode-specific UI controls
    hideAllModeControls();

    if (newModeName === '3d') {
      // Show and restore 3D sprite scale slider
      const spriteLabel = document.getElementById('sprite-label-3d');
      const spriteSlider = document.getElementById('sprite-scale-3d');
      if (spriteLabel && spriteSlider) {
        spriteLabel.style.display = '';
        const savedScale = clamp(parseFloat(localStorage.getItem('skillnet-sprite-scale-3d')) || 1.0, 0.5, 3.0);
        spriteSlider.value = savedScale;
        graph3dMod.setSpriteScale3D(savedScale);
      }
      // Auto zoom-to-fit after layout settles
      setTimeout(() => {
        const g = graph3dMod.getGraph3D();
        if (g) g.zoomToFit(800, 40);
      }, LAYOUT_SETTLE_MS);
    } else if (newModeName === 'hive') {
      // Show and populate domain focus dropdown
      const domainSelect = document.getElementById('hive-domain-focus');
      if (domainSelect) {
        domainSelect.style.display = '';
        const domains = hiveMod.getDomainList();
        if (domainSelect.options.length !== domains.length + 1) {
          domainSelect.innerHTML = `<option value="">${t('controls.hiveAllDomains')}</option>`;
          for (const d of domains) {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            domainSelect.appendChild(opt);
          }
        }
        const savedDomain = localStorage.getItem('skillnet-hive-domain') || '';
        domainSelect.value = savedDomain;
        hiveMod.setDomainFocus(savedDomain);
      }
      // Show and restore hive sort toggle
      const sortBtn = document.getElementById('btn-hive-sort');
      if (sortBtn) {
        sortBtn.style.display = '';
        const savedSort = localStorage.getItem('skillnet-hive-sort') || 'ranked';
        hiveMod.setHiveSortMode(savedSort);
        sortBtn.classList.toggle('active', savedSort === 'interleaved');
        sortBtn.textContent = savedSort === 'interleaved' ? t('controls.hiveSortRanked') : t('controls.hiveSortSpread');
      }
      // Show and restore hive spread slider
      const spreadLabel = document.getElementById('hive-spread-label');
      const spreadSlider = document.getElementById('hive-spread');
      if (spreadLabel && spreadSlider) {
        spreadLabel.style.display = '';
        const savedSpread = clamp(parseFloat(localStorage.getItem('skillnet-hive-spread')) || 3.0, 0.5, 10.0);
        spreadSlider.value = savedSpread;
        hiveMod.setHiveSpread(savedSpread);
      }
    } else if (newModeName === '2d') {
      // Auto zoom-to-fit after layout settles
      setTimeout(() => {
        const g = getGraph();
        if (g) g.zoomToFit(800, 40);
      }, LAYOUT_SETTLE_MS);
    }
  } catch (err) {
    console.error(`Failed to switch to ${newModeName}:`, err);
    if (newModeName !== '2d') {
      switchMode('2d');
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  // ── Init i18n ──
  await initI18n();
  const detectedLocale = detectLocale();
  if (detectedLocale !== 'en') {
    await loadLocale(detectedLocale);
  }

  // ── Populate locale picker ──
  const localeSelect = document.getElementById('locale-select');
  if (localeSelect) {
    for (const loc of getSupportedLocales()) {
      const opt = document.createElement('option');
      opt.value = loc.code;
      opt.textContent = loc.name;
      localeSelect.appendChild(opt);
    }
    localeSelect.value = getLocale();
  }

  // ── Load data ──
  let data;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    const errContainer = document.getElementById('graph-container');
    const errDiv = document.createElement('div');
    errDiv.className = 'load-error';
    const errH2 = document.createElement('h2');
    errH2.textContent = t('error.dataNotFound');
    const errP = document.createElement('p');
    errP.textContent = t('error.dataNotFoundDetail');
    const errCode = document.createElement('p');
    errCode.innerHTML = '<code>cd viz && npm install && node build-data.js</code>';
    const errDetail = document.createElement('p');
    errDetail.className = 'error-detail';
    errDetail.textContent = err.message;
    errDiv.append(errH2, errP, errCode, errDetail);
    errContainer.replaceChildren(errDiv);
    return;
  }

  allData = data;

  // ── Update header stats ──
  document.getElementById('stat-skills').textContent = data.meta.totalSkills;
  document.getElementById('stat-edges').textContent = data.meta.totalLinks;
  document.getElementById('stat-domains').textContent = data.meta.totalDomains;
  document.getElementById('stat-agents').textContent = data.meta.totalAgents;
  document.getElementById('stat-teams').textContent = data.meta.totalTeams;

  // ── Restore saved theme ──
  const savedTheme = localStorage.getItem('skillnet-theme');
  if (savedTheme && getThemeNames().includes(savedTheme)) {
    setTheme(savedTheme);
  }
  const themeSelect = document.getElementById('theme-select');
  themeSelect.value = getCurrentThemeName();
  switchFavicon(getCurrentThemeName());

  // ── Init detail panel ──
  initPanel(document.getElementById('detail-panel'), {
    onRelated(id) {
      // Skill links from agent panel use plain skill IDs
      const node = allData.nodes.find(n => n.id === id || n.id === `agent:${id}`);
      if (node) {
        activeMode.focusNode(node.id);
        openPanel(node);
      }
    },
  });

  // ── Init filter panel ──
  const skillNodes = data.nodes.filter(n => n.type === 'skill');
  const agentNodes = data.nodes.filter(n => n.type === 'agent');
  const teamNodes = data.nodes.filter(n => n.type === 'team');
  initFilters(document.getElementById('filter-panel'), skillNodes, agentNodes, teamNodes, {
    onFilterChange(visibleSkillIds) {
      activeMode.setSkillVisibility(visibleSkillIds);
      updateFilteredStats(visibleSkillIds);
    },
    onAgentFilterChange(visibleIds) {
      activeMode.setVisibleAgents(visibleIds);
      activeMode.setSkillVisibility(getVisibleSkillIds());
      updateFilteredStats(getVisibleSkillIds());
    },
    onTeamFilterChange(visibleIds) {
      activeMode.setVisibleTeams(visibleIds);
      activeMode.setSkillVisibility(getVisibleSkillIds());
      updateFilteredStats(getVisibleSkillIds());
    },
    onTagFilterChange() {
      // Update agent/team ID sets BEFORE setSkillVisibility, which
      // re-renders the graph using visibleAgentIds and visibleTeamIds.
      activeMode.setVisibleAgents(getFilteredAgentIds());
      activeMode.setVisibleTeams(getFilteredTeamIds());
      const visSkills = getVisibleSkillIds();
      activeMode.setSkillVisibility(visSkills);
      updateFilteredStats(visSkills);
    },
    onLanguageFilterChange() {
      activeMode.setVisibleAgents(getFilteredAgentIds());
      activeMode.setVisibleTeams(getFilteredTeamIds());
      const visSkills = getVisibleSkillIds();
      activeMode.setSkillVisibility(visSkills);
      updateFilteredStats(visSkills);
    },
    onLocaleFilterChange() {
      activeMode.setVisibleAgents(getFilteredAgentIds());
      activeMode.setVisibleTeams(getFilteredTeamIds());
      const visSkills = getVisibleSkillIds();
      activeMode.setSkillVisibility(visSkills);
      updateFilteredStats(visSkills);
    },
  });

  // ── Init graph ──
  const container = document.getElementById('graph-container');
  initGraph(container, data, modeCallbacks());

  // ── Preload icons ──
  preloadIcons(data.nodes, getCurrentThemeName());

  // ── Bind controls ──
  document.getElementById('btn-zoom-in').addEventListener('click', () => activeMode.zoomIn());
  document.getElementById('btn-zoom-out').addEventListener('click', () => activeMode.zoomOut());
  document.getElementById('btn-reset').addEventListener('click', () => {
    activeMode.resetView();
    closePanel();
  });

  // ── Locale picker ──
  if (localeSelect) {
    localeSelect.addEventListener('change', async () => {
      const code = localeSelect.value;
      logEvent('app', { event: 'localeChange', locale: code });
      localStorage.setItem('skillnet-locale', code);
      await loadLocale(code);
      // Trigger locale-based node filtering
      setLocaleFilter(code);
    });
  }

  // Apply initial locale filter if non-English locale was restored
  const initialLocale = getLocale();
  if (initialLocale !== 'en') {
    setLocaleFilter(initialLocale);
  }

  // ── Re-render dynamic text on locale change ──
  onLocaleChange(() => {
    // Search box placeholder
    const searchInput = document.querySelector('.filter-search');
    if (searchInput) {
      searchInput.placeholder = t('filter.searchPlaceholder');
      searchInput.setAttribute('aria-label', t('filter.searchAriaLabel'));
    }
    // Tags count
    const tagsCount = document.getElementById('tags-section-count');
    if (tagsCount) tagsCount.textContent = t('filter.selected', { count: 0 });
    // Languages count
    const langsCount = document.getElementById('languages-section-count');
    if (langsCount) langsCount.textContent = t('filter.selected', { count: 0 });
    // Hive sort button
    const hiveSortBtn = document.getElementById('btn-hive-sort');
    if (hiveSortBtn && hiveMod) {
      const mode = hiveMod.getHiveSortMode();
      hiveSortBtn.textContent = mode === 'interleaved' ? t('controls.hiveSortRanked') : t('controls.hiveSortSpread');
    }
    // Hive "All Domains" option
    const domainSelect = document.getElementById('hive-domain-focus');
    if (domainSelect && domainSelect.options.length > 0) {
      domainSelect.options[0].textContent = t('controls.hiveAllDomains');
    }
    // Event log button title
    const logBtn = document.getElementById('btn-event-log');
    if (logBtn) logBtn.title = t('controls.downloadEventLog');
  });

  // ── Event log download ──
  const logBtn = document.getElementById('btn-event-log');
  if (isEventLogEnabled()) {
    logBtn.style.display = '';
    logBtn.title = t('controls.downloadEventLog');
    logBtn.addEventListener('click', () => downloadLog());
  }

  // ── Layout buttons (radio group: 2D / 3D / Hive / Chord / Flow) ──
  for (const [modeName, btnId] of Object.entries(MODE_BUTTON_IDS)) {
    document.getElementById(btnId).addEventListener('click', async () => {
      if (switching || currentMode === modeName) return;
      switching = true;
      try { await switchMode(modeName); } finally { switching = false; }
    });
  }

  // ── Hive sort toggle ──
  const hiveSortBtn = document.getElementById('btn-hive-sort');
  if (hiveSortBtn) hiveSortBtn.addEventListener('click', () => {
    if (!hiveMod) return;
    const next = hiveMod.getHiveSortMode() === 'ranked' ? 'interleaved' : 'ranked';
    hiveMod.setHiveSortMode(next);
    const btn = document.getElementById('btn-hive-sort');
    btn.classList.toggle('active', next === 'interleaved');
    btn.textContent = next === 'interleaved' ? t('controls.hiveSortRanked') : t('controls.hiveSortSpread');
    localStorage.setItem('skillnet-hive-sort', next);
    logEvent('app', { event: 'hiveSortToggle', mode: next });
  });

  // ── Hive spread slider ──
  const hiveSpreadSlider = document.getElementById('hive-spread');
  if (hiveSpreadSlider) hiveSpreadSlider.addEventListener('input', function () {
    if (!hiveMod) return;
    const val = parseFloat(this.value);
    hiveMod.setHiveSpread(val);
    localStorage.setItem('skillnet-hive-spread', val);
    logEvent('app', { event: 'hiveSpreadChange', value: val });
  });

  // ── Hive domain focus dropdown ──
  const hiveDomainSelect = document.getElementById('hive-domain-focus');
  if (hiveDomainSelect) hiveDomainSelect.addEventListener('change', function () {
    if (!hiveMod) return;
    const domain = this.value;
    hiveMod.setDomainFocus(domain);
    localStorage.setItem('skillnet-hive-domain', domain);
    logEvent('app', { event: 'hiveDomainFocus', domain: domain || 'all' });
  });

  // ── 3D sprite scale slider ──
  const spriteScaleSlider = document.getElementById('sprite-scale-3d');
  if (spriteScaleSlider) spriteScaleSlider.addEventListener('input', function () {
    if (!graph3dMod) return;
    const val = parseFloat(this.value);
    graph3dMod.setSpriteScale3D(val);
    localStorage.setItem('skillnet-sprite-scale-3d', val);
    logEvent('app', { event: 'spriteScaleChange', value: val });
  });

  // ── Theme dropdown ──
  themeSelect.addEventListener('change', () => {
    try {
      logEvent('app', { event: 'themeChange', theme: themeSelect.value });
      setTheme(themeSelect.value);
      localStorage.setItem('skillnet-theme', themeSelect.value);
      switchFavicon(themeSelect.value);
      switchIconPalette(themeSelect.value, data.nodes);  // 2D cache
      if (graph3dMod) graph3dMod.switchIconPalette3D(themeSelect.value, data.nodes);
      // Hive: preload icons for new palette so isIconLoaded() passes
      if (currentMode === 'hive' && hiveMod) hiveMod.preloadHiveIcons(data.nodes, themeSelect.value);
      // Chord: refresh to pick up new palette colors
      if (currentMode === 'chord' && chordMod) chordMod.refreshChordGraph();
      refreshSwatches();
      refreshPanelTheme();
      activeMode.refreshGraph();
    } catch (err) {
      console.error('Theme switch failed:', err);
    }
  });

  // ── Icon toggle ──
  const iconBtn = document.getElementById('btn-icon-toggle');
  const hdBtn = document.getElementById('btn-hd-toggle');
  const savedIconMode = localStorage.getItem('skillnet-icons') === 'true';
  if (savedIconMode) {
    setIconMode(true);
    iconBtn.classList.add('active');
    hdBtn.style.display = '';
  }
  iconBtn.addEventListener('click', () => {
    const next = !getIconMode();
    logEvent('app', { event: 'iconToggle', enabled: next });
    setIconMode(next);
    iconBtn.classList.toggle('active', next);
    localStorage.setItem('skillnet-icons', next);
    // Show/hide HD button based on icon mode
    hdBtn.style.display = next ? '' : 'none';
    activeMode.refreshGraph();
  });

  // ── HD toggle ──
  const savedHdMode = localStorage.getItem('skillnet-hd') === 'true';
  if (savedHdMode) {
    setHdMode(true);
    hdBtn.classList.add('active');
  }
  hdBtn.addEventListener('click', () => {
    const next = !getHdMode();
    logEvent('app', { event: 'hdToggle', enabled: next });
    setHdMode(next);
    hdBtn.classList.toggle('active', next);
    localStorage.setItem('skillnet-hd', next);
    // Reload icons for current palette at new resolution
    const pal = getCurrentThemeName();
    preloadIcons(data.nodes, pal);
    if (graph3dMod) graph3dMod.preload3DIcons(data.nodes, pal);
    if (currentMode === 'hive' && hiveMod) hiveMod.preloadHiveIcons(data.nodes, pal);
    refreshPanelTheme();
    activeMode.refreshGraph();
  });

  logEvent('app', { event: 'sessionStart', mode: currentMode, nodeCount: data.nodes.length, linkCount: data.links.length });

  // ── Auto zoom-to-fit after layout settles ──
  setTimeout(() => {
    const g = getGraph();
    if (g) g.zoomToFit(800, 40);
  }, LAYOUT_SETTLE_MS);
}

// ── Tooltip ──
const tooltip = document.getElementById('tooltip');

function showTooltip(node) {
  if (!node || !tooltip) {
    if (tooltip) tooltip.style.display = 'none';
    return;
  }
  // In 3D mode, use built-in HTML tooltip from nodeLabel; skip custom tooltip
  // In hive mode, show custom tooltip as in 2D
  if (currentMode === '3d') {
    if (tooltip) tooltip.style.display = 'none';
    return;
  }
  // Chord mode: use _chordTooltip if available
  if (node._chordTooltip) {
    tooltip.textContent = node._chordTooltip;
    tooltip.style.display = 'block';
    return;
  }
  let label;
  if (node.type === 'team') {
    label = t('tooltip.team', { title: node.title || node.id, count: node.members ? node.members.length : 0 });
  } else if (node.type === 'agent') {
    label = t('tooltip.agent', { title: node.title || node.id, priority: node.priority });
  } else {
    label = t('tooltip.skill', { title: node.title || node.id, domain: node.domain });
  }
  tooltip.textContent = label;
  tooltip.style.display = 'block';
}

// Track mouse/touch for tooltip position
document.addEventListener('mousemove', e => {
  if (tooltip && tooltip.style.display === 'block') {
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top = (e.clientY + 14) + 'px';
  }
});

document.addEventListener('touchmove', e => {
  if (tooltip && tooltip.style.display === 'block' && e.touches.length === 1) {
    tooltip.style.left = (e.touches[0].clientX + 14) + 'px';
    tooltip.style.top = (e.touches[0].clientY - 40) + 'px';
  }
}, { passive: true });

function updateFilteredStats(visibleSkillIds) {
  if (!allData) return;
  const skillSet = new Set(visibleSkillIds);
  const agentIds = activeMode.getVisibleAgentIds();

  const visSkills = allData.nodes.filter(n => n.type === 'skill' && skillSet.has(n.id));
  const visAgents = allData.nodes.filter(n => {
    if (n.type !== 'agent') return false;
    if (agentIds === null) return true;
    return agentIds.has(n.id);
  });
  const filteredTeamIds = new Set(getFilteredTeamIds());
  const visTeams = allData.nodes.filter(n => n.type === 'team' && filteredTeamIds.has(n.id));
  const visNodeIds = new Set([...visSkills, ...visAgents, ...visTeams].map(n => n.id));
  const visLinks = allData.links.filter(l => visNodeIds.has(l.source) && visNodeIds.has(l.target));

  // Count unique domains among visible skills
  const visDomains = new Set(visSkills.map(n => n.domain));

  document.getElementById('stat-skills').textContent = visSkills.length;
  document.getElementById('stat-edges').textContent = visLinks.length;
  document.getElementById('stat-domains').textContent = visDomains.size;
  document.getElementById('stat-agents').textContent = visAgents.length;
  document.getElementById('stat-teams').textContent = visTeams.length;
}

// ── Hamburger Menu ──────────────────────────────
const hamburgerToggle = document.getElementById('hamburger-toggle');
const headerDrawer = document.getElementById('header-drawer');

if (hamburgerToggle && headerDrawer) {
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'header-drawer-backdrop';
  document.body.appendChild(backdrop);

  let previouslyFocusedElement = null;

  function toggleDrawer() {
    const isOpen = headerDrawer.classList.toggle('open');
    hamburgerToggle.setAttribute('aria-expanded', isOpen);
    backdrop.classList.toggle('visible', isOpen);

    if (isOpen) {
      previouslyFocusedElement = document.activeElement;
      // Focus the first focusable element in the drawer
      const firstFocusable = headerDrawer.querySelector('button, select, input, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    } else {
      if (previouslyFocusedElement) previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    }
  }

  function closeDrawer() {
    headerDrawer.classList.remove('open');
    hamburgerToggle.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('visible');
    if (previouslyFocusedElement) previouslyFocusedElement.focus();
    previouslyFocusedElement = null;
  }

  // Focus trap: keep Tab cycling within the drawer when open
  headerDrawer.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !headerDrawer.classList.contains('open')) return;

    const focusable = Array.from(
      headerDrawer.querySelectorAll('button, select, input, [tabindex]:not([tabindex="-1"])')
    ).filter(el => el.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Close on Escape
  headerDrawer.addEventListener('keydown', e => {
    if (e.key === 'Escape' && headerDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  hamburgerToggle.addEventListener('click', toggleDrawer);
  backdrop.addEventListener('click', closeDrawer);

  // Close drawer when a layout button is clicked
  headerDrawer.querySelectorAll('button').forEach(btn => {
    if (btn !== hamburgerToggle) {
      btn.addEventListener('click', () => {
        if (window.innerWidth <= 768) closeDrawer();
      });
    }
  });
}

// ── Orientation change ──────────────────────────
window.addEventListener('orientationchange', () => {
  // Small delay to let browser settle orientation
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 100);
});

// Also handle resize for orientation changes on devices that don't fire orientationchange
window.addEventListener('resize', () => {
  // Close open mobile panels on significant size changes
  if (window.innerWidth > 768) {
    const drawer = document.getElementById('header-drawer');
    const hamburger = document.getElementById('hamburger-toggle');
    if (drawer) drawer.classList.remove('open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    const backdrop = document.querySelector('.header-drawer-backdrop');
    if (backdrop) backdrop.classList.remove('visible');
  }
});

main().catch(err => {
  console.error(err);
  const container = document.getElementById('graph-container');
  const wrapper = document.createElement('div');
  wrapper.className = 'load-error';
  const h2 = document.createElement('h2');
  h2.textContent = t('error.runtimeError');
  const p1 = document.createElement('p');
  p1.textContent = err.message;
  const p2 = document.createElement('p');
  p2.className = 'error-detail';
  p2.textContent = err.stack || '';
  wrapper.append(h2, p1, p2);
  container.replaceChildren(wrapper);
});
