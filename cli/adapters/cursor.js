/**
 * cursor.js — Cursor adapter.
 *
 * Primary: .cursor/skills/<id>/ (modern, uses universal SKILL.md)
 * Legacy: .cursor/rules/<id>.mdc (rule file format)
 * Skills only.
 */

import { existsSync, mkdirSync, unlinkSync, writeFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { FrameworkAdapter, childPath } from './base.js';
import { describeEntry, installAt, isInternalName, removeEntry } from '../lib/placement.js';
import { condenseSkill, wrapAsMdc } from '../lib/transformer.js';

export class CursorAdapter extends FrameworkAdapter {
  static id = 'cursor';
  static displayName = 'Cursor';
  static strategy = 'file-per-item';
  static contentTypes = ['skill'];
  /** @type {Record<string, string[]>} #607: writes into projectDir/.cursor/. */
  static scopes = { skill: ['project'] };

  async detect(projectDir) {
    return existsSync(resolve(projectDir, '.cursor')) ||
           existsSync(resolve(projectDir, '.cursorrules'));
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type !== 'skill') return { action: 'skipped', path: '', details: 'Cursor supports skills only' };

    // Prefer modern .cursor/skills/ path (symlink)
    const skillsDir = resolve(projectDir, '.cursor/skills');
    const targetPath = childPath(skillsDir, item.id);

    if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
    return installAt({
      base: skillsDir, name: item.id, item, options, relativeLink: true,
      source: item.sourceDir || resolve(options.almanacRoot, 'skills', item.id),
    });
  }

  /**
   * Install as legacy .mdc rule file (use with --legacy flag or explicit call).
   */
  async installLegacyRule(item, projectDir, options = {}) {
    if (item.type !== 'skill') return { action: 'skipped', path: '', details: 'rules are skills only' };

    const rulesDir = resolve(projectDir, '.cursor/rules');
    const targetPath = childPath(rulesDir, `${item.id}.mdc`);

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
    const skillsDir = resolve(projectDir, '.cursor/skills');
    const skillPath = childPath(skillsDir, item.id);
    const rulePath = childPath(resolve(projectDir, '.cursor/rules'), `${item.id}.mdc`);

    // skillPath is a link install made, so it goes through removeEntry, which
    // sees a dangling link and keeps anything that is not a link. rulePath is
    // a file installLegacyRule writes, never a link: existsSync is right for it.
    const skill = removeEntry(skillsDir, item.id, { dryRun: options.dryRun });
    if (skill.action === 'removed') results.push(skillPath);
    if (existsSync(rulePath)) {
      if (!options.dryRun) unlinkSync(rulePath);
      results.push(rulePath);
    }

    if (results.length === 0) {
      return skill.note ? skill : { action: 'skipped', path: '', details: 'not installed' };
    }
    const removed = { action: 'removed', path: results.join(', ') };
    return skill.note ? { ...removed, note: `kept ${skillPath}: ${skill.note}` } : removed;
  }

  async listInstalled(projectDir) {
    const items = [];
    const skillsDir = resolve(projectDir, '.cursor/skills');
    if (existsSync(skillsDir)) {
      for (const name of readdirSync(skillsDir)) {
        if (isInternalName(name)) continue;
        const fullPath = resolve(skillsDir, name);
        items.push({ id: name, type: 'skill', path: fullPath, format: 'skills', ...describeEntry(fullPath).fields });
      }
    }
    const rulesDir = resolve(projectDir, '.cursor/rules');
    if (existsSync(rulesDir)) {
      for (const name of readdirSync(rulesDir)) {
        if (name.endsWith('.mdc')) {
          // Legacy .mdc rules are written files, not links — they cannot dangle.
          items.push({ id: name.replace(/\.mdc$/, ''), type: 'skill', path: resolve(rulesDir, name), format: 'mdc', broken: false });
        }
      }
    }
    return items;
  }

  async audit(projectDir) {
    const installed = await this.listInstalled(projectDir);
    const broken = installed.filter(i => i.broken).length;
    const valid = installed.length - broken;
    return {
      framework: CursorAdapter.displayName,
      ok: valid > 0 ? [`${valid} items installed`] : [],
      warnings: installed.length === 0 ? ['No Cursor content installed'] : [],
      errors: broken > 0 ? [`${broken} broken skill symlinks`] : [],
    };
  }
}
