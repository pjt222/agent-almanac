/**
 * detector.js — Auto-detect agentic frameworks in a project directory.
 *
 * Scans for framework-specific markers (directories, config files) and returns
 * a list of detected frameworks with their adapter ids.
 */

import { existsSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

/** @typedef {{ id: string, displayName: string, marker: string, scope: string }} Detection */

/**
 * Framework detection rules.
 * Each rule specifies a marker path (relative to project or home) and metadata.
 */
const RULES = [
  // Universal (always check project-level)
  { id: 'universal', displayName: 'Universal (.agents/)', check: (dir) => existsSync(resolve(dir, '.agents')) || true, marker: '.agents/', scope: 'project' },
  // Claude Code
  { id: 'claude-code', displayName: 'Claude Code', check: (dir) => existsSync(resolve(dir, '.claude')), marker: '.claude/', scope: 'project' },
  // OpenCode
  { id: 'opencode', displayName: 'OpenCode', check: (dir) => existsSync(resolve(dir, '.opencode')) || existsSync(resolve(dir, 'opencode.json')), marker: '.opencode/ or opencode.json', scope: 'project' },
  // Cursor
  { id: 'cursor', displayName: 'Cursor', check: (dir) => existsSync(resolve(dir, '.cursor')) || existsSync(resolve(dir, '.cursorrules')), marker: '.cursor/ or .cursorrules', scope: 'project' },
  // Windsurf
  { id: 'windsurf', displayName: 'Windsurf', check: (dir) => existsSync(resolve(dir, '.windsurf')) || existsSync(resolve(dir, '.windsurfrules')), marker: '.windsurf/ or .windsurfrules', scope: 'project' },
  // GitHub Copilot
  { id: 'copilot', displayName: 'GitHub Copilot', check: (dir) => existsSync(resolve(dir, '.github/copilot-instructions.md')), marker: '.github/copilot-instructions.md', scope: 'project' },
  // Codex
  { id: 'codex', displayName: 'OpenAI Codex', check: (dir) => existsSync(resolve(dir, 'AGENTS.md')), marker: 'AGENTS.md', scope: 'project' },
  // Gemini CLI
  { id: 'gemini', displayName: 'Gemini CLI', check: (dir) => existsSync(resolve(dir, '.gemini')), marker: '.gemini/', scope: 'project' },
  // Mistral Vibe
  { id: 'vibe', displayName: 'Mistral Vibe', check: (dir) => existsSync(resolve(dir, '.vibe')), marker: '.vibe/', scope: 'project' },
  // Aider
  { id: 'aider', displayName: 'Aider', check: (dir) => existsSync(resolve(dir, '.aider.conf.yml')) || existsSync(resolve(dir, 'CONVENTIONS.md')), marker: '.aider.conf.yml or CONVENTIONS.md', scope: 'project' },
];

const GLOBAL_RULES = [
  // OpenClaw (global only)
  { id: 'openclaw', displayName: 'OpenClaw/NemoClaw', check: () => existsSync(resolve(homedir(), '.openclaw/openclaw.json')) || existsSync(resolve(homedir(), '.nemoclaw')), marker: '~/.openclaw/', scope: 'global' },
  // Hermes (global only)
  { id: 'hermes', displayName: 'Hermes Agent', check: () => existsSync(resolve(homedir(), '.hermes/config.yaml')), marker: '~/.hermes/', scope: 'global' },
];

/**
 * Detect all frameworks present in the given project directory.
 * @param {string} projectDir - Absolute path to project root
 * @returns {Detection[]}
 */
export function detectFrameworks(projectDir) {
  const detected = [];

  for (const rule of RULES) {
    if (rule.check(projectDir)) {
      detected.push({
        id: rule.id,
        displayName: rule.displayName,
        marker: rule.marker,
        scope: rule.scope,
      });
    }
  }

  for (const rule of GLOBAL_RULES) {
    if (rule.check()) {
      detected.push({
        id: rule.id,
        displayName: rule.displayName,
        marker: rule.marker,
        scope: rule.scope,
      });
    }
  }

  return detected;
}

/**
 * Check if a specific framework is detected.
 * @param {string} projectDir
 * @param {string} frameworkId
 * @returns {boolean}
 */
export function isFrameworkDetected(projectDir, frameworkId) {
  return detectFrameworks(projectDir).some(d => d.id === frameworkId);
}
