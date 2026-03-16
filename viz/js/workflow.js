// workflow.js - Mermaid workflow diagram visualization
// put id:"mode_flow", label:"Mermaid-based build pipeline diagram", node_type:"process", input:"active_module"
// Renders a pre-built Mermaid flowchart showing the viz build pipeline.
// Loaded lazily when user clicks the Flow button.
// Supports pan/zoom via CSS transforms and theme switching.

import { getCurrentThemeName } from './colors.js';
import { logEvent } from './eventlog.js';
import { t } from './i18n.js';

let containerEl = null;
let mermaidReady = false;
let lastMermaidTheme = null;

// ── Pan/zoom state ──────────────────────────────────────────────
let scale = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

// ── Touch state ─────────────────────────────────────────────────
let isTouchPanning = false;
let touchStartX = 0;
let touchStartY = 0;
let initialPinchDist = 0;
let initialPinchScale = 1;

// ── Visibility stubs (workflow doesn't filter graph data) ───────
let visibleSkillSet = null;
let visibleAgentIds = null;
let visibleTeamIds = null;

// ── Theme → Mermaid theme mapping ───────────────────────────────
const THEME_MAP = {
  cyberpunk: 'dark',
  viridis: 'default',
  inferno: 'dark',
  magma: 'dark',
  plasma: 'dark',
  cividis: 'default',
  mako: 'dark',
  rocket: 'dark',
  turbo: 'default',
};

// ── Public API ──────────────────────────────────────────────────

export function initWorkflowGraph(container, data, callbacks = {}) {
  containerEl = container;

  // Reset transform
  scale = 1;
  panX = 0;
  panY = 0;

  render();

  window.addEventListener('resize', handleResize);
}

export function destroyWorkflowGraph() {
  window.removeEventListener('resize', handleResize);
  if (containerEl) {
    containerEl.removeEventListener('wheel', handleWheel);
    containerEl.removeEventListener('mousedown', handleMouseDown);
    containerEl.removeEventListener('mousemove', handleMouseMove);
    containerEl.removeEventListener('mouseup', handleMouseUp);
    containerEl.removeEventListener('mouseleave', handleMouseUp);
    containerEl.removeEventListener('touchstart', handleTouchStart);
    containerEl.removeEventListener('touchmove', handleTouchMove);
    containerEl.removeEventListener('touchend', handleTouchEnd);
  }
  containerEl = null;
  mermaidReady = false;
}

export function refreshWorkflowGraph() {
  render();
}

// Filter stubs — workflow mode shows the build pipeline, not the graph data
export function setSkillVisibilityWorkflow(ids) {
  visibleSkillSet = ids ? new Set(ids) : null;
}

export function setVisibleAgentsWorkflow(ids) {
  visibleAgentIds = ids ? new Set(ids) : null;
}

export function setVisibleTeamsWorkflow(ids) {
  visibleTeamIds = ids ? new Set(ids) : null;
}

export function focusNodeWorkflow(id) {
  // No-op: workflow mode doesn't map to graph nodes
}

export function resetViewWorkflow() {
  scale = 1;
  panX = 0;
  panY = 0;
  applyTransform();
}

export function zoomInWorkflow() {
  scale = Math.min(scale * 1.2, 5);
  applyTransform();
}

export function zoomOutWorkflow() {
  scale = Math.max(scale / 1.2, 0.3);
  applyTransform();
}

export function getVisibleAgentIdsWorkflow() {
  return visibleAgentIds;
}

// ── Internal ────────────────────────────────────────────────────

function handleResize() {
  // Mermaid SVG is responsive via viewBox; no re-render needed
}

function handleWheel(e) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  scale = Math.min(Math.max(scale * delta, 0.3), 5);
  applyTransform();
}

function handleMouseDown(e) {
  if (e.button !== 0) return;
  isPanning = true;
  panStartX = e.clientX - panX;
  panStartY = e.clientY - panY;
  containerEl.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
  if (!isPanning) return;
  panX = e.clientX - panStartX;
  panY = e.clientY - panStartY;
  applyTransform();
}

function handleMouseUp() {
  isPanning = false;
  if (containerEl) containerEl.style.cursor = 'grab';
}

// ── Touch handlers ──────────────────────────────────────────────

function getPinchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function handleTouchStart(e) {
  if (e.touches.length === 1) {
    isTouchPanning = true;
    touchStartX = e.touches[0].clientX - panX;
    touchStartY = e.touches[0].clientY - panY;
  } else if (e.touches.length === 2) {
    isTouchPanning = false;
    initialPinchDist = getPinchDistance(e.touches);
    initialPinchScale = scale;
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  if (e.touches.length === 1 && isTouchPanning) {
    panX = e.touches[0].clientX - touchStartX;
    panY = e.touches[0].clientY - touchStartY;
    applyTransform();
  } else if (e.touches.length === 2) {
    const dist = getPinchDistance(e.touches);
    const ratio = dist / initialPinchDist;
    scale = Math.min(Math.max(initialPinchScale * ratio, 0.3), 5);
    applyTransform();
  }
}

function handleTouchEnd() {
  isTouchPanning = false;
}

function applyTransform() {
  const wrapper = containerEl?.querySelector('.workflow-wrapper');
  if (wrapper) {
    wrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  }
}

async function loadMermaid() {
  const vizTheme = getCurrentThemeName();
  const mermaidTheme = THEME_MAP[vizTheme] || 'dark';

  // Import mermaid once (Vite-compatible local dependency)
  if (!window.__mermaid) {
    const { default: mermaid } = await import('mermaid');
    window.__mermaid = mermaid;
  }

  // Re-initialize when theme changes (or on first load)
  if (!mermaidReady || mermaidTheme !== lastMermaidTheme) {
    window.__mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      themeVariables: mermaidTheme === 'dark' ? {
        darkMode: true,
        background: 'transparent',
        primaryColor: '#16213e',
        primaryTextColor: '#e0e0e0',
        primaryBorderColor: '#44ddff',
        lineColor: '#44ddff',
        secondaryColor: '#1a1a2e',
        tertiaryColor: '#0f3460',
        fontFamily: 'Share Tech Mono, monospace',
      } : {
        fontFamily: 'Share Tech Mono, monospace',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 16,
      },
    });

    lastMermaidTheme = mermaidTheme;
    mermaidReady = true;
  }
}

async function render() {
  if (!containerEl) return;

  try {
    await loadMermaid();

    // Fetch the pre-built workflow diagram
    let diagramSrc;
    try {
      const res = await fetch('data/workflow.mmd');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      diagramSrc = await res.text();
    } catch {
      diagramSrc = buildFallbackDiagram();
    }

    // Strip comment lines for Mermaid (it handles them, but be safe)
    const cleanSrc = diagramSrc
      .split('\n')
      .filter(line => !line.trimStart().startsWith('%%'))
      .join('\n');

    // Render via Mermaid API
    const id = `workflow-${Date.now()}`;
    const { svg } = await window.__mermaid.render(id, cleanSrc);

    containerEl.innerHTML = `
      <div class="workflow-container">
        <div class="workflow-wrapper" style="transform-origin: center center;">
          ${svg}
        </div>
      </div>
    `;

    // Re-apply pan/zoom state to the new wrapper element
    applyTransform();

    // Bind pan/zoom events (mouse + touch)
    containerEl.addEventListener('wheel', handleWheel, { passive: false });
    containerEl.addEventListener('mousedown', handleMouseDown);
    containerEl.addEventListener('mousemove', handleMouseMove);
    containerEl.addEventListener('mouseup', handleMouseUp);
    containerEl.addEventListener('mouseleave', handleMouseUp);
    containerEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    containerEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    containerEl.addEventListener('touchend', handleTouchEnd, { passive: true });
    containerEl.style.cursor = 'grab';

    logEvent('workflow', { event: 'rendered', theme: getCurrentThemeName() });
  } catch (err) {
    console.error('Workflow render failed:', err);
    const errDiv = document.createElement('div');
    errDiv.className = 'load-error';
    const errH2 = document.createElement('h2');
    errH2.textContent = t('error.workflowUnavailable');
    const errP = document.createElement('p');
    errP.textContent = t('error.workflowUnavailableDetail');
    const errCode = document.createElement('p');
    errCode.innerHTML = '<code>cd viz && node build-workflow.js</code>';
    const errDetail = document.createElement('p');
    errDetail.className = 'error-detail';
    errDetail.textContent = err.message;
    errDiv.append(errH2, errP, errCode, errDetail);
    containerEl.replaceChildren(errDiv);
  }
}

function buildFallbackDiagram() {
  return `flowchart TD
    A[/"YAML Registries"/] --> B["build-data.js"]
    B --> C[("skills.json")]
    D[/"Glyph Definitions"/] --> E["render.R"]
    E --> F[("WebP Icons")]
    C -.->|"runtime fetch"| G["app.js"]
    F -.->|"icon assets"| G
    G --> H{"Mode Switch"}
    H --> I["2D Force"]
    H --> J["3D Force"]
    H --> K["Hive Plot"]
    H --> L["Chord"]
    H --> M["Workflow"]

    classDef entry fill:#1a1a2e,stroke:#00ff88,color:#00ff88
    classDef step fill:#16213e,stroke:#44ddff,color:#44ddff
    classDef output fill:#0f3460,stroke:#ff3366,color:#ff3366
    classDef decision fill:#1a1a2e,stroke:#ffaa33,color:#ffaa33
    class A,D entry
    class B,E,G step
    class C,F output
    class H decision
    class I,J,K,L,M step`;
}
