/**
 * gemini.js — Google Gemini CLI adapter.
 *
 * Skills: .gemini/skills/<id>/ (symlink)
 * Skills only.
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, readdirSync } from 'fs';
import { resolve, relative } from 'path';
import { FrameworkAdapter } from './base.js';

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
    const targetPath = resolve(skillsDir, item.id);
    if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
    if (existsSync(targetPath) && !options.force) return { action: 'skipped', path: targetPath, details: 'already exists' };

    mkdirSync(skillsDir, { recursive: true });
    if (existsSync(targetPath)) try { unlinkSync(targetPath); } catch {}
    const source = item.sourceDir || resolve(options.almanacRoot, 'skills', item.id);
    symlinkSync(relative(skillsDir, source), targetPath);
    return { action: 'created', path: targetPath };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    const targetPath = resolve(this._skillsDir(projectDir), item.id);
    if (options.dryRun) return { action: 'removed', path: targetPath, details: 'dry-run' };
    if (!existsSync(targetPath)) return { action: 'skipped', path: targetPath, details: 'not installed' };
    unlinkSync(targetPath);
    return { action: 'removed', path: targetPath };
  }

  async listInstalled(projectDir) {
    const items = [];
    const dir = this._skillsDir(projectDir);
    if (existsSync(dir)) {
      for (const name of readdirSync(dir)) {
        const fullPath = resolve(dir, name);
        items.push({ id: name, type: 'skill', path: fullPath, broken: !existsSync(fullPath) });
      }
    }
    return items;
  }

  async audit(projectDir) {
    const installed = await this.listInstalled(projectDir);
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
