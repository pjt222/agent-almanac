/**
 * state.js — Campfire state management.
 *
 * Manages .agent-almanac/state.json — the bridge between CLI and viz.
 * Tracks gathered fires, timestamps, and fire health states.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const STATE_DIR = '.agent-almanac';
const STATE_FILE = 'state.json';
const STATE_VERSION = 1;

// Fire state thresholds (milliseconds)
const BURNING_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;   // 7 days
const EMBERS_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;    // 30 days

/**
 * Get the state file path for a project directory.
 * @param {string} [projectDir] - Project root (default: cwd)
 * @returns {string}
 */
export function statePath(projectDir = process.cwd()) {
  return resolve(projectDir, STATE_DIR, STATE_FILE);
}

/**
 * Migrate state between versions.
 * @param {object} state
 * @returns {object} Migrated state
 */
function migrateState(state) {
  // Future: handle STATE_VERSION upgrades
  // if (state.version < 2) { ... migrate ... state.version = 2; }
  return state;
}

/**
 * Load the campfire state file.
 * @param {string} [projectDir]
 * @returns {object} State object (empty structure if file doesn't exist)
 */
export function loadState(projectDir = process.cwd()) {
  const path = statePath(projectDir);
  if (!existsSync(path)) {
    return {
      version: STATE_VERSION,
      welcomed: false,
      fires: {},
      // Reserved for future standalone agent tracking (not yet implemented)
      wanderers: [],
    };
  }
  try {
    return migrateState(JSON.parse(readFileSync(path, 'utf8')));
  } catch {
    return {
      version: STATE_VERSION,
      welcomed: false,
      fires: {},
      // Reserved for future standalone agent tracking (not yet implemented)
      wanderers: [],
    };
  }
}

/**
 * Save the campfire state file.
 * @param {object} state
 * @param {string} [projectDir]
 */
export function saveState(state, projectDir = process.cwd()) {
  const dir = resolve(projectDir, STATE_DIR);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(
    resolve(dir, STATE_FILE),
    JSON.stringify(state, null, 2) + '\n',
    'utf8',
  );
}

/**
 * Record that a team was gathered (installed).
 * @param {object} state - Current state
 * @param {string} teamId - Team name
 * @param {string[]} agentIds - Agent IDs in the team
 * @param {number} skillCount - Total skills installed
 * @param {string[]} [failedSkills] - Skills that failed to install
 * @returns {object} Updated state
 */
export function recordGather(state, teamId, agentIds, skillCount, failedSkills = []) {
  const now = new Date().toISOString();
  state.fires[teamId] = {
    gathered: now,
    lastWarmed: now,
    agents: agentIds,
    skillCount,
    failedSkills,
  };
  return state;
}

/**
 * Record that a team was scattered (uninstalled).
 * @param {object} state - Current state
 * @param {string} teamId - Team name
 * @returns {object} Updated state
 */
export function recordScatter(state, teamId) {
  delete state.fires[teamId];
  return state;
}

/**
 * Record that a fire was warmed (used/updated).
 * @param {object} state - Current state
 * @param {string} teamId - Team name
 * @returns {object} Updated state
 */
export function recordWarm(state, teamId) {
  if (state.fires[teamId]) {
    state.fires[teamId].lastWarmed = new Date().toISOString();
  }
  return state;
}

/**
 * Mark the welcome message as shown.
 * @param {object} state
 * @returns {object} Updated state
 */
export function markWelcomed(state) {
  state.welcomed = true;
  return state;
}

/**
 * Compute the fire state based on lastWarmed timestamp.
 * @param {string} lastWarmed - ISO timestamp
 * @param {Date} [now] - Current time (for testing)
 * @returns {'burning'|'embers'|'cold'}
 */
export function computeFireState(lastWarmed, now = new Date()) {
  const elapsed = now.getTime() - new Date(lastWarmed).getTime();
  if (elapsed < BURNING_THRESHOLD_MS) return 'burning';
  if (elapsed < EMBERS_THRESHOLD_MS) return 'embers';
  return 'cold';
}

/**
 * Get all fire states with computed thermal status.
 * @param {object} state - Full state object
 * @returns {object[]} Array of { id, ...fireData, state: 'burning'|'embers'|'cold' }
 */
export function getFireStates(state) {
  return Object.entries(state.fires).map(([id, fire]) => ({
    id,
    ...fire,
    state: computeFireState(fire.lastWarmed),
  }));
}

/**
 * Get a single fire's state.
 * @param {object} state - Full state object
 * @param {string} teamId
 * @returns {object|null} Fire data with computed state, or null
 */
export function getFireState(state, teamId) {
  const fire = state.fires[teamId];
  if (!fire) return null;
  return {
    id: teamId,
    ...fire,
    state: computeFireState(fire.lastWarmed),
  };
}

/**
 * Find agents that appear in multiple gathered fires.
 * @param {object} state
 * @returns {Map<string, string[]>} agentId → [teamId, ...]
 */
export function findHearthKeepers(state) {
  const agentTeams = new Map();
  for (const [teamId, fire] of Object.entries(state.fires)) {
    for (const agentId of fire.agents || []) {
      if (!agentTeams.has(agentId)) agentTeams.set(agentId, []);
      agentTeams.get(agentId).push(teamId);
    }
  }
  // Only return agents at multiple fires
  const keepers = new Map();
  for (const [agentId, teams] of agentTeams) {
    if (teams.length > 1) keepers.set(agentId, teams);
  }
  return keepers;
}

/**
 * Find skills shared between gathered fires.
 * @param {object} state
 * @param {object} reg - Registry (to look up agent skills)
 * @returns {Set<string>} Set of skill IDs that appear in multiple fires
 */
export function findSharedSkills(state, reg) {
  const skillFires = new Map();
  for (const [teamId, fire] of Object.entries(state.fires)) {
    for (const agentId of fire.agents || []) {
      const agent = reg.agents.find(a => a.id === agentId);
      if (!agent) continue;
      for (const skillId of agent.skills || []) {
        if (!skillFires.has(skillId)) skillFires.set(skillId, new Set());
        skillFires.get(skillId).add(teamId);
      }
    }
  }
  const shared = new Set();
  for (const [skillId, fires] of skillFires) {
    if (fires.size > 1) shared.add(skillId);
  }
  return shared;
}
