/**
 * gemini.js — Google Gemini CLI adapter.
 *
 * Skills: .gemini/skills/<id>/ (symlink)
 * Skills only.
 */

import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { FrameworkAdapter, childPath } from './base.js';
import { describeEntry, installAt, isInternalName, removeEntry } from '../lib/placement.js';

export class GeminiAdapter extends FrameworkAdapter {
  static id = 'gemini';
  static displayName = 'Gemini CLI';
  static strategy = 'symlink';
  static contentTypes = ['skill'];
  /** @type {Record<string, string[]>} #607: writes into projectDir/.gemini/skills/. */
  static scopes = { skill: ['project'] };

  async detect(projectDir) {
    return existsSync(resolve(projectDir, '.gemini'));
  }

  _skillsDir(projectDir) {
    return resolve(projectDir, '.gemini/skills');
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type !== 'skill') return { action: 'skipped', path: '', details: 'Gemini supports skills only' };

    const skillsDir = this._skillsDir(projectDir);
    const targetPath = childPath(skillsDir, item.id);
    if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
    return installAt({
      base: skillsDir, name: item.id, item, options, relativeLink: true,
      source: item.sourceDir || resolve(options.almanacRoot, 'skills', item.id),
    });
  }

  async uninstall(item, projectDir, scope, options = {}) {
    return removeEntry(this._skillsDir(projectDir), item.id, { dryRun: options.dryRun });
  }

  async listInstalled(projectDir) {
    const items = [];
    const dir = this._skillsDir(projectDir);
    if (existsSync(dir)) {
      for (const name of readdirSync(dir)) {
        if (isInternalName(name)) continue;
        const fullPath = resolve(dir, name);
        items.push({ id: name, type: 'skill', path: fullPath, ...describeEntry(fullPath).fields });
      }
    }
    return items;
  }

  async audit(projectDir, scope, listed) {
    const installed = listed ?? await this.listInstalled(projectDir);
    const broken = installed.filter(i => i.broken);
    const valid = installed.filter(i => !i.broken);
    return {
      framework: GeminiAdapter.displayName,
      ok: valid.length > 0 ? [`${valid.length} skills installed`] : [],
      warnings: installed.length === 0 ? ['No Gemini skills installed'] : [],
      errors: broken.length > 0 ? [`${broken.length} broken skill symlinks`] : [],
    };
  }
}
