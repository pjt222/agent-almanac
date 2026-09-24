/**
 * hermes.js — Hermes Agent adapter (Nous Research).
 *
 * Skills: <hermes-home>/skills/<domain>/<id>/ (preserves domain hierarchy)
 * Agents: <hermes-home>/agents/<id>.md
 * Global scope only.
 *
 * The home is resolved via resolveHermesHome() (#604): $HERMES_HOME, then the
 * Windows-native default (%LOCALAPPDATA%\hermes, config-verified), then ~/.hermes.
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { FrameworkAdapter } from './base.js';
import { resolveHermesHome } from '../lib/hermes-home.js';

export class HermesAdapter extends FrameworkAdapter {
  static id = 'hermes';
  static displayName = 'Hermes Agent';
  static strategy = 'symlink';
  static contentTypes = ['skill', 'agent'];
  /** @type {Record<string, string[]>} #607: both land under resolveHermesHome(); projectDir never reaches a path. */
  static scopes = { skill: ['global'], agent: ['global'] };

  async detect() {
    return existsSync(resolve(resolveHermesHome(), 'config.yaml'));
  }

  _skillsBase() { return resolve(resolveHermesHome(), 'skills'); }
  _agentsBase() { return resolve(resolveHermesHome(), 'agents'); }

  async install(item, projectDir, scope, options = {}) {
    if (item.type === 'skill') {
      const domain = item.domain || 'general';
      const targetDir = resolve(this._skillsBase(), domain);
      const targetPath = resolve(targetDir, item.id);

      if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
      if (existsSync(targetPath) && !options.force) return { action: 'skipped', path: targetPath, details: 'already exists' };

      mkdirSync(targetDir, { recursive: true });
      if (existsSync(targetPath)) try { unlinkSync(targetPath); } catch {}
      const source = item.sourceDir || resolve(options.almanacRoot, 'skills', item.id);
      symlinkSync(source, targetPath);
      return { action: 'created', path: targetPath };
    }

    if (item.type === 'agent') {
      const targetPath = resolve(this._agentsBase(), `${item.id}.md`);
      if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
      if (existsSync(targetPath) && !options.force) return { action: 'skipped', path: targetPath, details: 'already exists' };

      mkdirSync(this._agentsBase(), { recursive: true });
      if (existsSync(targetPath)) try { unlinkSync(targetPath); } catch {}
      const source = item.sourcePath || resolve(options.almanacRoot, 'agents', `${item.id}.md`);
      symlinkSync(source, targetPath);
      return { action: 'created', path: targetPath };
    }

    return { action: 'skipped', path: '', details: `${item.type}s not supported` };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    if (item.type === 'skill') {
      const domain = item.domain || 'general';
      const targetPath = resolve(this._skillsBase(), domain, item.id);
      if (options.dryRun) return { action: 'removed', path: targetPath, details: 'dry-run' };
      if (!existsSync(targetPath)) return { action: 'skipped', path: targetPath, details: 'not installed' };
      unlinkSync(targetPath);
      return { action: 'removed', path: targetPath };
    }

    if (item.type === 'agent') {
      const targetPath = resolve(this._agentsBase(), `${item.id}.md`);
      if (options.dryRun) return { action: 'removed', path: targetPath, details: 'dry-run' };
      if (!existsSync(targetPath)) return { action: 'skipped', path: targetPath, details: 'not installed' };
      unlinkSync(targetPath);
      return { action: 'removed', path: targetPath };
    }

    return { action: 'skipped', path: '', details: `${item.type}s not supported` };
  }

  async listInstalled() {
    const items = [];
    const base = this._skillsBase();
    if (existsSync(base)) {
      for (const domain of readdirSync(base)) {
        const domainDir = resolve(base, domain);
        try {
          for (const name of readdirSync(domainDir)) {
            const fullPath = resolve(domainDir, name);
            items.push({ id: name, type: 'skill', domain, path: fullPath, broken: !existsSync(fullPath) });
          }
        } catch { /* not a directory */ }
      }
    }
    const agentsBase = this._agentsBase();
    if (existsSync(agentsBase)) {
      for (const name of readdirSync(agentsBase)) {
        const fullPath = resolve(agentsBase, name);
        items.push({ id: name.replace(/\.md$/, ''), type: 'agent', path: fullPath, broken: !existsSync(fullPath) });
      }
    }
    return items;
  }

  async audit() {
    const installed = await this.listInstalled();
    const broken = installed.filter(i => i.broken);
    const valid = installed.filter(i => !i.broken);
    return {
      framework: HermesAdapter.displayName,
      ok: valid.length > 0 ? [`${valid.length} items installed`] : [],
      warnings: installed.length === 0 ? ['No Hermes content installed'] : [],
      errors: broken.length > 0 ? [`${broken.length} broken links`] : [],
    };
  }
}
