/**
 * resolver.js — Scope resolution and almanac path detection.
 *
 * Handles project/workspace/global scoping and auto-detects the almanac root.
 */

import { existsSync, readlinkSync, realpathSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir } from 'os';

/**
 * Auto-detect the almanac root directory.
 * Strategy:
 *   1. If cwd IS the almanac (has skills/_registry.yml), use it
 *   2. Follow .claude/skills/ symlinks to find the source
 *   3. Follow ~/.claude/skills/ symlinks
 *   4. Check common paths
 * @param {string} [cwd] - Current working directory
 * @returns {string|null}
 */
export function detectAlmanacRoot(cwd = process.cwd()) {
  // 1. Are we inside the almanac?
  if (existsSync(resolve(cwd, 'skills/_registry.yml'))) {
    return cwd;
  }

  // 2. Follow project-level symlink
  const projectSkills = resolve(cwd, '.claude/skills');
  const almanacFromProject = traceSymlinkToAlmanac(projectSkills);
  if (almanacFromProject) return almanacFromProject;

  // 3. Follow global symlink
  const globalSkills = resolve(homedir(), '.claude/skills');
  const almanacFromGlobal = traceSymlinkToAlmanac(globalSkills);
  if (almanacFromGlobal) return almanacFromGlobal;

  // 4. Walk up from cwd looking for skills/_registry.yml
  let dir = cwd;
  while (dir !== dirname(dir)) {
    dir = dirname(dir);
    if (existsSync(resolve(dir, 'skills/_registry.yml'))) {
      return dir;
    }
  }

  return null;
}

/**
 * Trace a symlink path back to the almanac root.
 * @param {string} symlinkPath
 * @returns {string|null}
 */
function traceSymlinkToAlmanac(symlinkPath) {
  try {
    if (!existsSync(symlinkPath)) return null;
    const real = realpathSync(symlinkPath);
    // real might be .../agent-almanac/skills or .../agent-almanac/skills/some-skill
    // Walk up until we find skills/_registry.yml
    let dir = real;
    for (let i = 0; i < 5; i++) {
      if (existsSync(resolve(dir, 'skills/_registry.yml'))) return dir;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch { /* symlink broken or unreadable */ }
  return null;
}

/**
 * Resolve the target directory for a given scope.
 * @param {string} scope - 'project' | 'workspace' | 'global'
 * @param {string} [cwd] - Current working directory
 * @returns {string}
 */
export function resolveTargetDir(scope, cwd = process.cwd()) {
  switch (scope) {
    case 'global':
      return homedir();
    case 'workspace':
      return dirname(cwd);
    case 'project':
    default:
      return cwd;
  }
}

/**
 * Determine the appropriate symlink type.
 * @param {string} scope
 * @param {string} almanacRoot
 * @param {string} targetDir
 * @returns {'relative'|'absolute'}
 */
export function symlinkType(scope, almanacRoot, targetDir) {
  // Use relative symlinks when target is within the almanac
  if (targetDir.startsWith(almanacRoot)) return 'relative';
  // Use absolute symlinks for global and workspace
  return 'absolute';
}
