/**
 * cursor.js — Cursor adapter.
 *
 * Primary: .cursor/skills/<id>/ (modern, uses universal SKILL.md)
 * Legacy: .cursor/rules/<id>.mdc (rule file format)
 * Skills only.
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, writeFileSync, readdirSync } from 'fs';
import { resolve, relative } from 'path';
import { FrameworkAdapter } from './base.js';
import { condenseSkill, wrapAsMdc } from '../lib/transformer.js';

export class CursorAdapter extends FrameworkAdapter {
  static id = 'cursor';
  static displayName = 'Cursor';
  static strategy = 'file-per-item';
  static contentTypes = ['skill'];

  async detect(projectDir) {
    return existsSync(resolve(projectDir, '.cursor')) ||
           existsSync(resolve(projectDir, '.cursorrules'));
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type !== 'skill') return { action: 'skipped', path: '', details: 'Cursor supports skills only' };

    // Prefer modern .cursor/skills/ path (symlink)
    const skillsDir = resolve(projectDir, '.cursor/skills');
    const targetPath = resolve(skillsDir, item.id);

    if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
    if (existsSync(targetPath) && !options.force) return { action: 'skipped', path: targetPath, details: 'already exists' };

    mkdirSync(skillsDir, { recursive: true });
    if (existsSync(targetPath)) try { unlinkSync(targetPath); } catch {}

    const source = item.sourceDir || resolve(options.almanacRoot, 'skills', item.id);
    symlinkSync(relative(skillsDir, source), targetPath);
    return { action: 'created', path: targetPath };
  }

  /**
   * Install as legacy .mdc rule file (use with --legacy flag or explicit call).
   */
  async installLegacyRule(item, projectDir, options = {}) {
    if (item.type !== 'skill') return { action: 'skipped', path: '', details: 'rules are skills only' };

    const rulesDir = resolve(projectDir, '.cursor/rules');
    const targetPath = resolve(rulesDir, `${item.id}.mdc`);

    if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run (.mdc)' };
    if (existsSync(targetPath) && !options.force) return { action: 'skipped', path: targetPath, details: 'already exists' };

    mkdirSync(rulesDir, { recursive: true });
    const skillPath = resolve(item.sourceDir || resolve(options.almanacRoot, 'skills', item.id), 'SKILL.md');
    const condensed = condenseSkill(skillPath);
    const mdc = wrapAsMdc(item, condensed);
    writeFileSync(targetPath, mdc, 'utf8');
    return { action: 'created', path: targetPath };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    // Remove from both paths
    const results = [];
    const skillPath = resolve(projectDir, '.cursor/skills', item.id);
    const rulePath = resolve(projectDir, '.cursor/rules', `${item.id}.mdc`);

    for (const p of [skillPath, rulePath]) {
      if (existsSync(p)) {
        if (options.dryRun) { results.push(p); continue; }
        unlinkSync(p);
        results.push(p);
      }
    }

    if (results.length === 0) return { action: 'skipped', path: '', details: 'not installed' };
    return { action: 'removed', path: results.join(', ') };
  }

  async listInstalled(projectDir) {
    const items = [];
    const skillsDir = resolve(projectDir, '.cursor/skills');
    if (existsSync(skillsDir)) {
      for (const name of readdirSync(skillsDir)) {
        items.push({ id: name, type: 'skill', path: resolve(skillsDir, name), format: 'skills' });
      }
    }
    const rulesDir = resolve(projectDir, '.cursor/rules');
    if (existsSync(rulesDir)) {
      for (const name of readdirSync(rulesDir)) {
        if (name.endsWith('.mdc')) {
          items.push({ id: name.replace(/\.mdc$/, ''), type: 'skill', path: resolve(rulesDir, name), format: 'mdc' });
        }
      }
    }
    return items;
  }

  async audit(projectDir) {
    const installed = await this.listInstalled(projectDir);
    return {
      framework: CursorAdapter.displayName,
      ok: installed.length > 0 ? [`${installed.length} items installed`] : [],
      warnings: installed.length === 0 ? ['No Cursor content installed'] : [],
      errors: [],
    };
  }
}
