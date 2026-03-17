/**
 * opencode.js — OpenCode adapter.
 *
 * Scans: .opencode/skills/, .opencode/agents/, opencode.json
 * Skills and agents supported. No teams.
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, readdirSync, lstatSync } from 'fs';
import { resolve, relative } from 'path';
import { homedir } from 'os';
import { FrameworkAdapter } from './base.js';

export class OpenCodeAdapter extends FrameworkAdapter {
  static id = 'opencode';
  static displayName = 'OpenCode';
  static strategy = 'symlink';
  static contentTypes = ['skill', 'agent'];

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
    const targetPath = resolve(targetBase, item.id);

    if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
    if (existsSync(targetPath) && !options.force) return { action: 'skipped', path: targetPath, details: 'already exists' };

    mkdirSync(targetBase, { recursive: true });
    if (existsSync(targetPath)) try { unlinkSync(targetPath); } catch {}

    const source = item.type === 'skill'
      ? (item.sourceDir || resolve(options.almanacRoot, 'skills', item.id))
      : resolve(options.almanacRoot, 'agents');

    if (item.type === 'agent') {
      // For agents, symlink the individual agent file
      const agentSource = item.sourcePath || resolve(options.almanacRoot, 'agents', `${item.id}.md`);
      const agentTarget = resolve(targetBase, `${item.id}.md`);
      if (existsSync(agentTarget) && !options.force) return { action: 'skipped', path: agentTarget, details: 'already exists' };
      if (existsSync(agentTarget)) try { unlinkSync(agentTarget); } catch {}
      mkdirSync(targetBase, { recursive: true });
      symlinkSync(scope === 'global' ? agentSource : relative(targetBase, agentSource), agentTarget);
      return { action: 'created', path: agentTarget };
    }

    symlinkSync(scope === 'global' ? source : relative(targetBase, source), targetPath);
    return { action: 'created', path: targetPath };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    const targetBase = this._targetBase(projectDir, scope, item.type);
    const targetPath = item.type === 'agent'
      ? resolve(targetBase, `${item.id}.md`)
      : resolve(targetBase, item.id);

    if (options.dryRun) return { action: 'removed', path: targetPath, details: 'dry-run' };
    if (!existsSync(targetPath)) return { action: 'skipped', path: targetPath, details: 'not installed' };
    unlinkSync(targetPath);
    return { action: 'removed', path: targetPath };
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
    return {
      framework: OpenCodeAdapter.displayName,
      ok: installed.length > 0 ? [`${installed.length} items installed`] : [],
      warnings: installed.length === 0 ? ['No OpenCode content installed'] : [],
      errors: broken.length > 0 ? [`${broken.length} broken links`] : [],
    };
  }
}
