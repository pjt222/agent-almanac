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

import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { FrameworkAdapter, childPath } from './base.js';
import { describeEntry, installAt, isInternalName, removeEntry } from '../lib/placement.js';
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
      const targetDir = childPath(this._skillsBase(), domain);
      const targetPath = childPath(targetDir, item.id);

      if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
      return installAt({
        base: targetDir, name: item.id, item, options, relativeLink: false,
        source: item.sourceDir || resolve(options.almanacRoot, 'skills', item.id),
      });
    }

    if (item.type === 'agent') {
      const targetPath = childPath(this._agentsBase(), `${item.id}.md`);
      if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
      return installAt({
        base: this._agentsBase(), name: `${item.id}.md`, item, options, relativeLink: false,
        source: item.sourcePath || resolve(options.almanacRoot, 'agents', `${item.id}.md`),
      });
    }

    return { action: 'skipped', path: '', details: `${item.type}s not supported` };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    if (item.type === 'skill') {
      const domain = item.domain || 'general';
      return removeEntry(childPath(this._skillsBase(), domain), item.id, { dryRun: options.dryRun });
    }

    if (item.type === 'agent') {
      return removeEntry(this._agentsBase(), `${item.id}.md`, { dryRun: options.dryRun });
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
            if (isInternalName(name)) continue;
            const fullPath = resolve(domainDir, name);
            items.push({ id: name, type: 'skill', domain, path: fullPath, ...describeEntry(fullPath).fields });
          }
        } catch { /* not a directory */ }
      }
    }
    const agentsBase = this._agentsBase();
    if (existsSync(agentsBase)) {
      for (const name of readdirSync(agentsBase)) {
        // A copied agent's sidecar marker sits beside it; it is not an agent.
        if (isInternalName(name)) continue;
        const fullPath = resolve(agentsBase, name);
        items.push({ id: name.replace(/\.md$/, ''), type: 'agent', path: fullPath, ...describeEntry(fullPath).fields });
      }
    }
    return items;
  }

  async audit(projectDir, scope, listed) {
    const installed = listed ?? await this.listInstalled();
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
