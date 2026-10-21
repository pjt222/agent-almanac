/**
 * resolver.js — Scope resolution and almanac path detection.
 *
 * Handles project/workspace/global scoping and auto-detects the almanac root.
 */

import { existsSync, readlinkSync, realpathSync } from 'fs';
import { resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

/**
 * The package this CLI ships in: two levels above cli/lib/. Under npm that is
 * `<prefix>/lib/node_modules/agent-almanac` (global) or
 * `<project>/node_modules/agent-almanac` (local); run from a clone, or through
 * `npm link`, it is the clone, because node resolves the bin symlink to the real
 * path before computing import.meta.url.
 */
const OWN_PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Auto-detect the almanac root directory.
 * Strategy:
 *   1. If cwd IS the almanac (has skills/_registry.yml), use it
 *   2. <cwd>/.claude/skills, when its own real path lies inside a checkout
 *      (e.g. `.claude/skills -> <clone>/skills`). Only that directory's real
 *      path is traced: the per-item links `install` creates
 *      (`.claude/skills/<id>`, `.agents/skills/<id>`, …) are never followed,
 *      nor is a hub of per-item links, so a project installed from a clone
 *      falls through to 5 (#606 AC2).
 *   3. ~/.claude/skills, by the same rule
 *   4. Walk up from cwd looking for skills/_registry.yml
 *   5. The package this CLI ships in (#606) — tried last, because it is the
 *      one answer that is always there: the npm tarball carries every skill,
 *      agent, team and guide beside cli/. Before this, the npm-installed CLI
 *      could not find the content shipped next to it, and README Path 3 failed
 *      at `agent-almanac install` for every npm user.
 *
 * A root found here may be an npm package directory. Finding it is enough for
 * the read-only commands; whether to INSTALL from it is decided by the caller
 * (see isNpmPackageRoot), not here.
 *
 * @param {string} [cwd] - Current working directory
 * @param {object} [options]
 * @param {string} [options.packageRoot] - Strategy 5's candidate. Injectable for
 *   tests; defaults to this module's own package root.
 * @returns {string|null}
 */
export function detectAlmanacRoot(cwd = process.cwd(), { packageRoot = OWN_PACKAGE_ROOT } = {}) {
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

  // 5. The package this CLI ships in, accepted only if it actually holds the
  //    registry — a package built without the content (a broken `files` list,
  //    a partial copy) must report "not found" rather than an empty catalogue.
  if (existsSync(resolve(packageRoot, 'skills/_registry.yml'))) return packageRoot;

  return null;
}

/**
 * Whether `root` is an installed npm package: a directory npm manages, and may
 * replace (`npm update`) or delete (`npm uninstall`) at any time (#606).
 *
 * The signal is a `node_modules` path SEGMENT — exact, so `node_modules_backup`
 * does not count. It covers every layout that puts the package where npm owns
 * it: a global prefix (`<prefix>/lib/node_modules/…`, `%APPDATA%\npm\node_modules\…`),
 * a local install, pnpm's `node_modules/.pnpm/…/node_modules/…`, and the npx
 * cache (`~/.npm/_npx/<hash>/node_modules/…`). Both separators are split on, so
 * a Windows path is recognised wherever this runs.
 *
 * Signals rejected: the absence of `.git` (a GitHub zip download has none and is
 * a stable copy, not one npm will replace), and a `package.json` naming this
 * package (a clone has one too).
 *
 * Limits, stated rather than fixed:
 *   - Not recognised: a package manager that installs outside any node_modules
 *     directory, such as Deno's npm cache.
 *   - Not recognised: a `Node_Modules` spelled in another case. The segment
 *     match is case-sensitive and realpathSync() does not canonicalise case,
 *     so on a case-insensitive filesystem (macOS, Windows) a hand-typed
 *     `--source …/Node_Modules/agent-almanac` reaches the package unrefused
 *     (reasoned from the code; not run, no such filesystem here).
 *   - Refused although npm does not manage it: a clone that lives under a
 *     directory literally named node_modules. `--from-package link` is its
 *     only way through, and that warning about npm then does not apply.
 *
 * The path is tested as given AND as its real path. As given, because the links
 * an install makes point at that spelling: `--source <prefix>/lib/node_modules/agent-almanac`
 * where npm link made that a symlink to a clone still writes links that run
 * through node_modules. As its real path, because a symlink of the user's own
 * (`~/almanac` -> a package directory) leads there.
 *
 * @param {string} root
 * @returns {boolean}
 */
export function isNpmPackageRoot(root) {
  const spellings = [root];
  try { spellings.push(realpathSync(root)); } catch { /* missing or unreadable: the given spelling decides */ }
  return spellings.some((spelling) => spelling.split(/[\\/]+/).includes('node_modules'));
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
