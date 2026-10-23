/**
 * pi.js — pi coding agent adapter (pi.dev, @earendil-works/pi-coding-agent), #1006.
 *
 * Skills: <project>/.pi/skills/<id>/ (project) and <agent-dir>/skills/<id>/
 * (global), the folders pi documents for its own skills. <agent-dir> is
 * resolved as pi resolves it: $PI_CODING_AGENT_DIR, else ~/.pi/agent
 * (cli/lib/pi-agent-dir.js).
 *
 * pi also reads the universal adapter's .agents/skills/, so a default install
 * in a pi project places a skill in both folders. Measured with pi 1.4.0: two
 * links to one source load once, while a copy beside a link loads once with a
 * "name collision" warning (#1006). A project's .pi/skills/ loads only after
 * pi's project-trust decision.
 *
 * Agents for pi's subagent extension are #1007.
 */

import { existsSync, readdirSync, readlinkSync } from 'fs';
import { resolve } from 'path';
import { FrameworkAdapter, childPath } from './base.js';
import { describeEntry, installAt, isInternalName, removeEntry } from '../lib/placement.js';
import { isHomeDirectory, isPiProject, resolvePiAgentDir } from '../lib/pi-agent-dir.js';

export class PiAdapter extends FrameworkAdapter {
  static id = 'pi';
  static displayName = 'Pi Coding Agent';
  static strategy = 'symlink';
  static contentTypes = ['skill'];
  /** @type {Record<string, string[]>} #607: _targetBase() branches on scope. */
  static scopes = { skill: ['project', 'global'] };

  async detect(projectDir) {
    return isPiProject(projectDir);
  }

  _targetBase(projectDir, scope) {
    return scope === 'global'
      ? resolve(resolvePiAgentDir(), 'skills')
      : resolve(projectDir, '.pi/skills');
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type !== 'skill') {
      return { action: 'skipped', path: '', details: 'pi adapter only supports skills' };
    }

    const targetBase = this._targetBase(projectDir, scope);
    const targetPath = childPath(targetBase, item.id);

    // At the home directory, project scope would write ~/.pi/skills/: pi reads
    // it only when started in ~, and it is not <agent-dir>/skills/, where pi's
    // user skills live. Refused, with the flag that does what was meant.
    if (scope !== 'global' && isHomeDirectory(projectDir)) {
      return {
        action: 'skipped', path: targetPath, details: 'home directory',
        note: `project scope in your home directory would write ~/.pi/skills/; install with -g for ${resolve(resolvePiAgentDir(), 'skills')}`,
      };
    }

    if (options.dryRun) {
      return { action: 'created', path: targetPath, details: 'dry-run' };
    }

    // A link is relative for project scope, absolute for global.
    return installAt({
      base: targetBase, name: item.id, item, options, relativeLink: scope !== 'global',
      source: item.sourceDir || resolve(options.almanacRoot, 'skills', item.id),
    });
  }

  async uninstall(item, projectDir, scope, options = {}) {
    return removeEntry(this._targetBase(projectDir, scope), item.id, { dryRun: options.dryRun });
  }

  async listInstalled(projectDir, scope) {
    const targetBase = this._targetBase(projectDir, scope);

    if (!existsSync(targetBase)) return [];

    // Staging directories and markers are the CLI's bookkeeping, not items.
    const entries = readdirSync(targetBase).filter((name) => !isInternalName(name));
    return entries.map(name => {
      const fullPath = resolve(targetBase, name);
      const { kind, fields } = describeEntry(fullPath);
      let target = null;
      if (kind === 'link') {
        try { target = readlinkSync(fullPath); } catch { /* removed since it was listed */ }
      }
      return { id: name, type: 'skill', path: fullPath, isSymlink: kind === 'link', target, ...fields };
    });
  }

  async audit(projectDir, scope, listed) {
    const installed = listed ?? await this.listInstalled(projectDir, scope);
    const result = {
      framework: PiAdapter.displayName,
      ok: [],
      warnings: [],
      errors: [],
    };

    const broken = installed.filter(i => i.broken);
    const valid = installed.filter(i => !i.broken);

    if (valid.length > 0) {
      result.ok.push(`${valid.length} skills installed in ${this._targetBase(projectDir, scope)}`);
    }
    if (broken.length > 0) {
      result.errors.push(`${broken.length} broken symlinks: ${broken.map(b => b.id).join(', ')}`);
    }
    if (installed.length === 0) {
      result.warnings.push(`No skills installed in ${this._targetBase(projectDir, scope)}`);
    }

    return result;
  }
}
