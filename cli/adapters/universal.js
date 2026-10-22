/**
 * universal.js — Universal .agents/skills/ adapter.
 *
 * Installs skills to the de facto cross-client interoperability path.
 * Covers: OpenCode, Cursor, VS Code/Copilot, Gemini CLI, Mistral Vibe,
 * Autohand, Letta, and any agentskills.io-compliant tool.
 *
 * Skills only — agents and teams are framework-specific.
 */

import { existsSync, readdirSync, readlinkSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import { FrameworkAdapter, childPath } from './base.js';
import { describeEntry, installAt, isInternalName, removeEntry } from '../lib/placement.js';

export class UniversalAdapter extends FrameworkAdapter {
  static id = 'universal';
  static displayName = 'Universal (.agents/)';
  static strategy = 'symlink';
  static contentTypes = ['skill'];
  /** @type {Record<string, string[]>} #607: _targetBase() branches on scope. */
  static scopes = { skill: ['project', 'global'] };

  async detect(projectDir) {
    return true;
  }

  _targetBase(projectDir, scope) {
    return scope === 'global'
      ? resolve(homedir(), '.agents/skills')
      : resolve(projectDir, '.agents/skills');
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type !== 'skill') {
      return { action: 'skipped', path: '', details: 'Universal adapter only supports skills' };
    }

    const targetBase = this._targetBase(projectDir, scope);

    const targetPath = childPath(targetBase, item.id);

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

  async audit(projectDir, scope) {
    const installed = await this.listInstalled(projectDir, scope);
    const result = {
      framework: UniversalAdapter.displayName,
      ok: [],
      warnings: [],
      errors: [],
    };

    const broken = installed.filter(i => i.broken);
    const valid = installed.filter(i => !i.broken);

    if (valid.length > 0) {
      result.ok.push(`${valid.length} skills installed`);
    }
    if (broken.length > 0) {
      result.errors.push(`${broken.length} broken symlinks: ${broken.map(b => b.id).join(', ')}`);
    }
    if (installed.length === 0) {
      result.warnings.push('No skills installed in .agents/skills/');
    }

    return result;
  }
}
