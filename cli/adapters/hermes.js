/**
 * hermes.js — Hermes Agent adapter (Nous Research).
 *
 * Skills: ~/.hermes/skills/<domain>/<id>/ (preserves domain hierarchy)
 * Agents: ~/.hermes/agents/<id>.md
 * Global scope only.
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import { FrameworkAdapter } from './base.js';

export class HermesAdapter extends FrameworkAdapter {
  static id = 'hermes';
  static displayName = 'Hermes Agent';
  static strategy = 'symlink';
  static contentTypes = ['skill', 'agent'];

  async detect() {
    return existsSync(resolve(homedir(), '.hermes/config.yaml'));
  }

  _skillsBase() { return resolve(homedir(), '.hermes/skills'); }
  _agentsBase() { return resolve(homedir(), '.hermes/agents'); }

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
            items.push({ id: name, type: 'skill', domain, path: resolve(domainDir, name) });
          }
        } catch { /* not a directory */ }
      }
    }
    const agentsBase = this._agentsBase();
    if (existsSync(agentsBase)) {
      for (const name of readdirSync(agentsBase)) {
        items.push({ id: name.replace(/\.md$/, ''), type: 'agent', path: resolve(agentsBase, name) });
      }
    }
    return items;
  }

  async audit() {
    const installed = await this.listInstalled();
    return {
      framework: HermesAdapter.displayName,
      ok: installed.length > 0 ? [`${installed.length} items installed`] : [],
      warnings: installed.length === 0 ? ['No Hermes content installed'] : [],
      errors: [],
    };
  }
}
