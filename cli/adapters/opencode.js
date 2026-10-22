/**
 * opencode.js — OpenCode adapter.
 *
 * Scans: .opencode/skills/, .opencode/agents/, opencode.json
 * Skills and agents supported. No teams.
 */

import { existsSync, mkdirSync, symlinkSync, readdirSync } from 'fs';
import { resolve, relative } from 'path';
import { homedir } from 'os';
import { FrameworkAdapter, childPath } from './base.js';
import { clearForInstall, removeEntry } from '../lib/placement.js';

export class OpenCodeAdapter extends FrameworkAdapter {
  static id = 'opencode';
  static displayName = 'OpenCode';
  static strategy = 'symlink';
  static contentTypes = ['skill', 'agent'];
  /** @type {Record<string, string[]>} #607: _targetBase() branches on scope before the content-type split, so both follow it. */
  static scopes = { skill: ['project', 'global'], agent: ['project', 'global'] };

  async detect(projectDir) {
    return existsSync(resolve(projectDir, '.opencode')) ||
           existsSync(resolve(projectDir, 'opencode.json'));
  }

  _targetBase(projectDir, scope, contentType) {
    const base = scope === 'global'
      ? resolve(homedir(), '.config/opencode')
      : resolve(projectDir, '.opencode');
    return contentType === 'agent'
      ? resolve(base, 'agents')
      : resolve(base, 'skills');
  }

  async install(item, projectDir, scope, options = {}) {
    const targetBase = this._targetBase(projectDir, scope, item.type);

    if (item.type === 'agent') return this._installAgent(item, targetBase, scope, options);

    const targetPath = childPath(targetBase, item.id);

    if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
    const blocked = clearForInstall(targetPath, { force: options.force });
    if (blocked) return blocked;

    mkdirSync(targetBase, { recursive: true });

    const source = item.sourceDir || resolve(options.almanacRoot, 'skills', item.id);
    symlinkSync(scope === 'global' ? source : relative(targetBase, source), targetPath);
    return { action: 'created', path: targetPath };
  }

  /**
   * An agent is one file, linked at <agents>/<id>.md. It used to run the
   * skill-shaped steps of install() first, at <agents>/<id> with no extension:
   * --force unlinked a user's own file at that path, and a directory there made
   * the agent install report "skipped" without writing the link (S3-B2 P2e).
   */
  _installAgent(item, targetBase, scope, options) {
    const agentSource = item.sourcePath || resolve(options.almanacRoot, 'agents', `${item.id}.md`);
    const agentTarget = childPath(targetBase, `${item.id}.md`);
    if (options.dryRun) return { action: 'created', path: agentTarget, details: 'dry-run' };
    const blocked = clearForInstall(agentTarget, { force: options.force });
    if (blocked) return blocked;
    mkdirSync(targetBase, { recursive: true });
    symlinkSync(scope === 'global' ? agentSource : relative(targetBase, agentSource), agentTarget);
    return { action: 'created', path: agentTarget };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    const targetBase = this._targetBase(projectDir, scope, item.type);
    const targetPath = item.type === 'agent'
      ? childPath(targetBase, `${item.id}.md`)
      : childPath(targetBase, item.id);

    if (options.dryRun) return { action: 'removed', path: targetPath, details: 'dry-run' };
    return removeEntry(targetPath);
  }

  async listInstalled(projectDir, scope) {
    const items = [];
    for (const type of ['skill', 'agent']) {
      const dir = this._targetBase(projectDir, scope, type);
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        const fullPath = resolve(dir, name);
        const id = name.replace(/\.md$/, '');
        items.push({ id, type, path: fullPath, broken: !existsSync(fullPath) });
      }
    }
    return items;
  }

  async audit(projectDir, scope) {
    const installed = await this.listInstalled(projectDir, scope);
    const broken = installed.filter(i => i.broken);
    const valid = installed.filter(i => !i.broken);
    return {
      framework: OpenCodeAdapter.displayName,
      ok: valid.length > 0 ? [`${valid.length} items installed`] : [],
      warnings: installed.length === 0 ? ['No OpenCode content installed'] : [],
      errors: broken.length > 0 ? [`${broken.length} broken links`] : [],
    };
  }
}
