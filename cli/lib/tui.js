/**
 * tui.js — Interactive terminal UI for the agent-almanac campfire.
 *
 * Exports a single function startTui() that runs the full TUI loop.
 * Returns false if not in a TTY, or a Promise<true> that resolves on exit.
 */

import { loadRegistries } from './registry.js';
import { detectAlmanacRoot } from './resolver.js';
import { loadState, saveState, recordWarm, markWelcomed, computeFireState, findHearthKeepers } from './state.js';
import { buildFireScene } from './scene.js';

let chalk;
try {
  chalk = (await import('chalk')).default;
} catch {
  const id = (s) => s;
  chalk = new Proxy({}, { get: () => id });
}

// ── Color palette ──────────────────────────────────────────────────
const C = {
  flame: chalk.hex('#FF6B35'),
  amber: chalk.hex('#FFB347'),
  spark: chalk.hex('#FFF4E0'),
  ember: chalk.hex('#8B4513'),
  warm:  chalk.hex('#D4A574'),
  dim:   chalk.dim,
  fail:  chalk.red,
};

const GLYPH = {
  spark: '✦', burning: '◉', embers: '◎', cold: '○',
  available: '◌', sep: '─',
};

const VIEW = { WELCOME: 0, CLEARING: 1, FIRE: 2, AGENT: 3, HELP: 4, SEARCH: 5 };

// ── Terminal escape helpers ────────────────────────────────────────
const ESC = '\x1b';
const enterAlt  = () => process.stdout.write(`${ESC}[?1049h${ESC}[2J${ESC}[H`);
const exitAlt   = () => process.stdout.write(`${ESC}[?1049l`);
const hideCursor = () => process.stdout.write(`${ESC}[?25l`);
const showCursor = () => process.stdout.write(`${ESC}[?25h`);
const moveTo = (r, c) => process.stdout.write(`${ESC}[${r};${c}H`);
const clearScreen = () => process.stdout.write(`${ESC}[2J${ESC}[H`);

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}
function visibleWidth(str) { return stripAnsi(str).length; }

function wordWrap(str, width) {
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (cur && cur.length + 1 + w.length > width) { lines.push(cur); cur = w; }
    else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

function timeSince(isoDate) {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function parseKey(buf) {
  const s = buf.toString();
  if (s === '\x03') return { name: 'ctrl-c' };
  if (s === '\x1b[A') return { name: 'up' };
  if (s === '\x1b[B') return { name: 'down' };
  if (s === '\x1b[C') return { name: 'right' };
  if (s === '\x1b[D') return { name: 'left' };
  if (s === '\r' || s === '\n') return { name: 'enter' };
  if (s === '\x1b') return { name: 'esc' };
  if (s === '\x7f' || s === '\x08') return { name: 'backspace' };
  if (s === '\t') return { name: 'tab' };
  if (s.length === 1 && s >= ' ') return { name: 'char', value: s };
  return { name: 'unknown' };
}

// ── Data helpers ───────────────────────────────────────────────────
function countTeamSkillSet(team, reg) {
  const s = new Set();
  for (const memberId of team.members || []) {
    const agent = reg.agents.find(a => a.id === memberId);
    if (agent) for (const sk of agent.skills || []) s.add(sk);
  }
  for (const sk of reg.defaultSkills || []) s.add(sk);
  return s;
}

function stateGlyph(state) {
  if (state === 'burning') return C.flame(GLYPH.burning);
  if (state === 'embers') return C.ember(GLYPH.embers);
  if (state === 'cold') return C.dim(GLYPH.cold);
  return C.dim(GLYPH.available);
}

function autoTend(state) {
  const now = new Date().toISOString();
  for (const [, fire] of Object.entries(state.fires)) {
    const fs = computeFireState(fire.lastWarmed);
    if (fs === 'burning' || fs === 'embers') fire.lastWarmed = now;
  }
  return state;
}

function fuzzyMatch(team, query) {
  const q = query.toLowerCase();
  return [team.id, team.description, team.lead, ...(team.tags || [])].some(
    f => f && f.toLowerCase().includes(q),
  );
}

// ── Render helpers ─────────────────────────────────────────────────
function cols() { return process.stdout.columns || 80; }
function rows() { return process.stdout.rows || 24; }

function center(str, width) {
  const vis = visibleWidth(str);
  const pad = Math.max(0, Math.floor((width - vis) / 2));
  return ' '.repeat(pad) + str;
}

// ── View renderers ─────────────────────────────────────────────────
function renderWelcome(data) {
  const W = cols();
  const lines = [''];
  if (rows() > 20) {
    try {
      const scene = buildFireScene({ state: 'burning', maxWidth: W });
      lines.push(...scene, '');
    } catch { /* pixel art unavailable */ }
  }
  lines.push(center(C.warm('Welcome to the campfire. This is your clearing.'), W));
  lines.push('');
  lines.push(center(C.dim(`The almanac holds ${data.reg.totalTeams} circles of practice.`), W));
  lines.push('');
  lines.push(center(C.dim('Press ') + C.amber('g') + C.dim(' to kindle  ') + C.amber('?') + C.dim(' for help  ') + C.amber('q') + C.dim(' to leave'), W));
  lines.push('');
  return lines;
}

function buildFireRows(data) {
  const { teams, state, reg } = data;
  const gathered = [], available = [];
  for (const team of teams) {
    const fd = state.fires[team.id];
    if (fd) gathered.push(team);
    else available.push(team);
  }
  gathered.sort((a, b) => {
    const order = { burning: 0, embers: 1, cold: 2 };
    const sa = computeFireState(state.fires[a.id].lastWarmed);
    const sb = computeFireState(state.fires[b.id].lastWarmed);
    return (order[sa] ?? 3) - (order[sb] ?? 3);
  });
  return { gathered, available };
}

function renderClearingLines(data, selected, scrollOffset, searchQuery) {
  const W = cols();
  const H = rows();
  const { gathered, available } = buildFireRows(data);
  const allItems = [...gathered, null, ...available]; // null = separator
  const visH = Math.max(3, H - 5);
  const maxVisible = Math.floor(visH / 3);
  const startIdx = Math.min(scrollOffset, Math.max(0, allItems.length - maxVisible));

  const lines = [];
  lines.push(C.warm('  THE CLEARING'));
  lines.push(C.dim(`  ${gathered.length} fires burning · ${available.length} unlit`));
  lines.push('');

  let rendered = 0;
  for (let i = startIdx; i < allItems.length && rendered < maxVisible; i++) {
    const item = allItems[i];
    if (item === null) {
      lines.push(C.dim(`  ${GLYPH.sep.repeat(Math.min(W - 4, 24))} not yet kindled ${GLYPH.sep.repeat(3)}`));
      lines.push('');
      rendered++;
      continue;
    }

    const isGathered = !!data.state.fires[item.id];
    const fd = data.state.fires[item.id];
    const fs = fd ? computeFireState(fd.lastWarmed) : null;
    const glyph = isGathered ? stateGlyph(fs) : C.dim(GLYPH.available);
    const skillCount = countTeamSkillSet(item, data.reg).size;
    const memberCount = (item.members || []).length;

    const itemIdx = i - (i > gathered.length ? 1 : 0);
    const isSel = itemIdx === selected;
    const dimFilter = searchQuery ? !fuzzyMatch(item, searchQuery) : false;
    const prefix = isSel ? C.flame(' ▸ ') : '   ';
    const nameStr = dimFilter ? C.dim(item.id) : (isGathered ? C.flame(item.id) : C.dim(item.id));

    lines.push(prefix + glyph + ' ' + nameStr);
    const detail = isGathered && fd
      ? C.dim(`  ${item.lead} (keeper) · ${memberCount} agents · ${skillCount} sparks · ${fs} ${timeSince(fd.lastWarmed)}`)
      : C.dim(`  ${item.lead} · ${memberCount} agents · ${skillCount} sparks`);
    lines.push(dimFilter ? C.dim(stripAnsi(detail)) : detail);
    lines.push('');
    rendered++;
  }

  // Hearth-keeper trails — agents shared across multiple fires
  const keepers = findHearthKeepers(data.state);
  if (keepers.size > 0 && !searchQuery) {
    lines.push(C.dim(`  ${GLYPH.sep.repeat(3)} hearth-keepers ${GLYPH.sep.repeat(3)}`));
    for (const [agentId, teamIds] of keepers) {
      const brightness = Math.min(teamIds.length, 4);
      const trail = teamIds.map(t => C.ember(t)).join(C.dim(' ─ '));
      const label = brightness >= 3 ? C.amber(agentId) : C.dim(agentId);
      lines.push(`  ${label} ${C.dim('serves')} ${trail}`);
    }
    lines.push('');
  }

  if (searchQuery) {
    lines.push(C.dim('  /') + searchQuery + C.dim('_'));
  }

  return lines;
}

function renderFire(data, team, selectedAgent) {
  const W = cols();
  const H = rows();
  const fd = data.state.fires[team.id];
  const fs = fd ? computeFireState(fd.lastWarmed) : null;
  const lines = [''];

  if (H > 30) {
    try {
      const scene = buildFireScene({
        state: fs || 'cold',
        agentIds: team.members || [],
        teamId: team.id,
        leadId: team.lead,
        maxWidth: W,
      });
      lines.push(...scene, '');
    } catch { /* unavailable */ }
  }

  const glyph = stateGlyph(fs);
  const stateLabel = fs ? (fs === 'burning' ? C.flame('burning') : fs === 'embers' ? C.ember('embers') : C.dim('cold')) : C.dim('unlit');
  const ago = fd ? timeSince(fd.lastWarmed) : '';
  lines.push(`  ${glyph} ${C.flame(team.id)}  ${stateLabel}${ago ? C.dim(' · ' + ago) : ''}`);
  lines.push('');

  const descLines = wordWrap(team.description || '', W - 6);
  for (const dl of descLines) lines.push(C.dim('  ' + dl));
  if (descLines.length) lines.push('');

  lines.push(C.dim('  Circle:'));
  for (let i = 0; i < (team.members || []).length; i++) {
    const memberId = team.members[i];
    const isLead = memberId === team.lead;
    const agent = data.reg.agents.find(a => a.id === memberId);
    const skills = agent ? (agent.skills || []) : [];
    const skillSnip = skills.slice(0, 6).map(s => C.dim(GLYPH.spark) + C.dim(s)).join('  ');
    const more = skills.length > 6 ? C.dim(` +${skills.length - 6}`) : '';
    const isSel = i === selectedAgent;
    const prefix = isSel ? C.flame(' ▸ ') : '   ';
    const label = isLead ? C.amber(memberId) + C.dim(' (fire keeper)') : C.amber(memberId);
    lines.push(prefix + label);
    lines.push(`     ${skillSnip}${more}`);
    lines.push('');
  }

  lines.push(C.dim('  Esc to return'));
  return lines;
}

function renderAgent(agent) {
  const W = cols();
  const lines = ['', center(C.amber(agent.id), W), ''];
  for (const dl of wordWrap(agent.description || '', W - 6)) {
    lines.push(C.dim('  ' + dl));
  }
  lines.push('');

  const skills = agent.skills || [];
  const halfLen = Math.ceil(skills.length / 2);
  lines.push(C.dim('  Skills:'));
  for (let i = 0; i < halfLen; i++) {
    const left = `${C.dim(GLYPH.spark)} ${skills[i] || ''}`;
    const right = skills[i + halfLen] ? `  ${C.dim(GLYPH.spark)} ${skills[i + halfLen]}` : '';
    lines.push('  ' + left + right);
  }
  lines.push('');
  if (agent.model) lines.push(C.dim(`  model: ${agent.model}  tools: ${(agent.tools || []).length}`));
  if ((agent.tags || []).length) lines.push(C.dim(`  tags: ${agent.tags.join(', ')}`));
  lines.push('');
  lines.push(C.dim('  Esc to return'));
  return lines;
}

function renderHelp() {
  const W = cols();
  const lines = ['', center(C.warm('Campfire Controls'), W), ''];
  const binds = [
    ['j / ↓', 'approach (next)'],  ['k / ↑', 'step away (prev)'],
    ['Enter', 'sit by the fire'],   ['Esc', 'rise and look around'],
    ['g', 'kindle a fire'],         ['t', 'tend fires'],
    ['/', 'search the clearing'],   ['1-9', 'jump to fire N'],
    ['Tab', 'next gathering'],      ['?', 'this help'],
    ['q / Ctrl+C', 'leave'],
  ];
  for (const [key, desc] of binds) {
    lines.push(`  ${C.amber(key.padEnd(14))} ${C.dim(desc)}`);
  }
  lines.push('', C.dim('  Press any key to return'), '');
  return lines;
}

// ── Main TUI ────────────────────────────────────────────────────────
export async function startTui() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return false;

  return new Promise((resolve) => {
    const almanacRoot = detectAlmanacRoot();
    if (!almanacRoot) { resolve(false); return; }

    const reg = loadRegistries(almanacRoot);
    let state = loadState();
    state = autoTend(state);

    const teams = reg.teams || [];
    const data = { reg, state, teams };

    let view = state.welcomed ? VIEW.CLEARING : VIEW.WELCOME;
    let selected = 0;
    let scrollOffset = 0;
    let selectedAgent = 0;
    let currentTeam = null;
    let currentAgent = null;
    let searchQuery = '';
    let helpOverlay = false;

    // ── Terminal setup ──
    enterAlt();
    hideCursor();
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let cleanedUp = false;
    function cleanup() {
      if (cleanedUp) return;
      cleanedUp = true;
      clearInterval(tickTimer);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      showCursor();
      exitAlt();
      saveState(state);
      resolve(true);
    }

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // ── Render ──
    function render() {
      let lines;
      if (helpOverlay) {
        lines = renderHelp();
      } else if (view === VIEW.WELCOME) {
        lines = renderWelcome(data);
      } else if (view === VIEW.CLEARING || view === VIEW.SEARCH) {
        lines = renderClearingLines(data, selected, scrollOffset, searchQuery);
      } else if (view === VIEW.FIRE && currentTeam) {
        lines = renderFire(data, currentTeam, selectedAgent);
      } else if (view === VIEW.AGENT && currentAgent) {
        lines = renderAgent(currentAgent);
      } else {
        lines = renderClearingLines(data, selected, scrollOffset, '');
      }
      clearScreen();
      moveTo(1, 1);
      process.stdout.write(lines.join('\n'));
    }

    // ── Scroll helper ──
    function adjustScroll() {
      const H = rows();
      const maxVisible = Math.max(1, Math.floor((H - 5) / 3));
      const { gathered, available } = buildFireRows(data);
      const totalItems = gathered.length + available.length;
      const half = Math.floor(maxVisible / 2);
      scrollOffset = Math.max(0, Math.min(selected - half, totalItems - maxVisible));
    }

    // ── Input handler ──
    function isQuit(key) {
      return key.name === 'ctrl-c' || (key.name === 'char' && key.value === 'q');
    }

    process.stdin.on('data', (buf) => {
      const key = parseKey(buf);

      // Ctrl+C always quits
      if (key.name === 'ctrl-c') { cleanup(); return; }

      // Help overlay — any key dismisses
      if (helpOverlay) { helpOverlay = false; render(); return; }

      // ── Welcome ──
      if (view === VIEW.WELCOME) {
        if (isQuit(key)) { cleanup(); return; }
        state = markWelcomed(state);
        data.state = state;
        view = VIEW.CLEARING;
        render();
        return;
      }

      // ── Search ── (must come before clearing to capture chars including q)
      if (view === VIEW.SEARCH) {
        if (key.name === 'esc') { searchQuery = ''; view = VIEW.CLEARING; render(); return; }
        if (key.name === 'enter') {
          const { gathered, available } = buildFireRows(data);
          const all = [...gathered, ...available];
          const idx = all.findIndex(t => fuzzyMatch(t, searchQuery));
          if (idx >= 0) selected = idx;
          searchQuery = '';
          view = VIEW.CLEARING;
          adjustScroll();
          render();
          return;
        }
        if (key.name === 'backspace') { searchQuery = searchQuery.slice(0, -1); render(); return; }
        if (key.name === 'char') { searchQuery += key.value; render(); return; }
        return;
      }

      // q quits from non-search views
      if (isQuit(key)) { cleanup(); return; }

      // Vim navigation keys (only outside search mode)
      const isUp = key.name === 'up' || (key.name === 'char' && key.value === 'k');
      const isDown = key.name === 'down' || (key.name === 'char' && key.value === 'j');

      // ── Clearing ──
      if (view === VIEW.CLEARING) {
        const { gathered, available } = buildFireRows(data);
        const allItems = [...gathered, ...available];
        const total = allItems.length;

        if (isDown) { selected = Math.min(selected + 1, total - 1); adjustScroll(); }
        else if (isUp) { selected = Math.max(selected - 1, 0); adjustScroll(); }
        else if (key.name === 'char' && /^[1-9]$/.test(key.value)) {
          selected = Math.min(parseInt(key.value, 10) - 1, total - 1);
          adjustScroll();
        } else if (key.name === 'tab') {
          const gIdx = gathered.findIndex((_, i) => i > selected);
          selected = gIdx >= 0 ? gIdx : 0;
          adjustScroll();
        } else if (key.name === 'enter' || (key.name === 'char' && key.value === 'g')) {
          const team = allItems[selected];
          if (team) { currentTeam = team; selectedAgent = 0; view = VIEW.FIRE; }
        } else if (key.name === 'char' && key.value === 't') {
          state = autoTend(state);
          data.state = state;
          saveState(state);
        } else if (key.name === 'char' && key.value === '/') {
          searchQuery = ''; view = VIEW.SEARCH;
        } else if (key.name === 'char' && key.value === '?') {
          helpOverlay = true;
        }
        render();
        return;
      }

      // ── Fire ──
      if (view === VIEW.FIRE && currentTeam) {
        const members = currentTeam.members || [];
        if (key.name === 'esc') { view = VIEW.CLEARING; currentTeam = null; }
        else if (isDown) { selectedAgent = Math.min(selectedAgent + 1, members.length - 1); }
        else if (isUp) { selectedAgent = Math.max(selectedAgent - 1, 0); }
        else if (key.name === 'enter') {
          const agentId = members[selectedAgent];
          const agent = reg.agents.find(a => a.id === agentId);
          if (agent) { currentAgent = agent; view = VIEW.AGENT; }
        } else if (key.name === 'char' && key.value === 't') {
          if (state.fires[currentTeam.id]) {
            state = recordWarm(state, currentTeam.id);
            data.state = state;
            saveState(state);
          }
        } else if (key.name === 'char' && key.value === '?') {
          helpOverlay = true;
        }
        render();
        return;
      }

      // ── Agent ──
      if (view === VIEW.AGENT && currentAgent) {
        if (key.name === 'esc') { view = VIEW.FIRE; currentAgent = null; }
        else if (key.name === 'char' && key.value === '?') { helpOverlay = true; }
        render();
        return;
      }
    });

    // ── Resize handler ──
    process.stdout.on('resize', render);

    // ── Animation tick ──
    const tickTimer = setInterval(render, 500);

    render();
  });
}
