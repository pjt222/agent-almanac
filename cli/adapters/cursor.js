/**
 * cursor.js — Cursor adapter.
 *
 * Installs: .cursor/skills/<id>/ (a link, or a copy; uses universal SKILL.md).
 * Also looks at .cursor/rules/<id>.mdc, which no CLI command writes: a link
 * there, made as skills/README.md describes, is uninstalled and listed; a
 * file there is the user's and is kept (#998).
 * Skills only.
 */

import { existsSync, readdirSync, readlinkSync } from 'fs';
import { basename, resolve } from 'path';
import { FrameworkAdapter, childPath } from './base.js';
import { describeEntry, installAt, isInternalName, removeEntry } from '../lib/placement.js';

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

  async uninstall(item, projectDir, scope, options = {}) {
    // Both paths go through removeEntry, which removes a link, dangling or
    // not, or an unedited copy, and keeps anything else with a note. No CLI
    // command writes the .mdc rule (the unused installLegacyRule was removed
    // in #998), so a file there is the user's own and is kept; a link there,
    // made as skills/README.md describes, is removed.
    const entries = [
      removeEntry(resolve(projectDir, '.cursor/skills'), item.id, { dryRun: options.dryRun }),
      removeEntry(resolve(projectDir, '.cursor/rules'), `${item.id}.mdc`, { dryRun: options.dryRun }),
    ];
    const removed = entries.filter((r) => r.action === 'removed');
    const kept = entries.filter((r) => r.note);
    const keptNote = kept.map((r) => `kept ${r.path}: ${r.note}`).join('; ');

    if (removed.length > 0) {
      const result = { action: 'removed', path: removed.map((r) => r.path).join(', ') };
      return kept.length > 0 ? { ...result, note: keptNote } : result;
    }
    if (kept.length === 1) return kept[0];
    if (kept.length > 1) return { action: 'skipped', path: kept.map((r) => r.path).join(', '), reason: kept[0].reason, note: keptNote };
    return { action: 'skipped', path: '', details: 'not installed' };
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
        if (!name.endsWith('.mdc')) continue;
        // No CLI command writes a .mdc file, so a regular .mdc is the user's
        // own rule, not an installed skill (#998). Only a link to a SKILL.md
        // is listed, the shape skills/README.md describes: a link to the
        // user's own rule (from a dotfiles repository, say) is theirs too, and
        // a dangling one would make `audit` exit 3 (#1067 round 1, SF-2).
        const fullPath = resolve(rulesDir, name);
        const { kind, fields } = describeEntry(fullPath);
        if (kind === 'link' && basename(readlinkSync(fullPath)) === 'SKILL.md') items.push({ id: name.replace(/\.mdc$/, ''), type: 'skill', path: fullPath, format: 'mdc', ...fields });
      }
    }
    return items;
  }

  async audit(projectDir, scope, listed) {
    const installed = listed ?? await this.listInstalled(projectDir);
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
