/**
 * windsurf.js — Windsurf adapter.
 *
 * Supports .windsurf/rules/<id>.md (directory mode) or .windsurfrules (single file).
 * Auto-detects which pattern is in use. Skills only.
 */

import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { FrameworkAdapter } from './base.js';
import { condenseSkill, wrapInMarkers, removeMarkedSection, hasMarkedSection } from '../lib/transformer.js';

export class WindsurfAdapter extends FrameworkAdapter {
  static id = 'windsurf';
  static displayName = 'Windsurf';
  static strategy = 'file-per-item';
  static contentTypes = ['skill'];

  async detect(projectDir) {
    return existsSync(resolve(projectDir, '.windsurf')) ||
           existsSync(resolve(projectDir, '.windsurfrules'));
  }

  _usesSingleFile(projectDir) {
    return existsSync(resolve(projectDir, '.windsurfrules')) &&
           !existsSync(resolve(projectDir, '.windsurf/rules'));
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type !== 'skill') return { action: 'skipped', path: '', details: 'Windsurf supports skills only' };

    if (this._usesSingleFile(projectDir)) {
      return this._appendToFile(item, projectDir, options);
    }

    // Directory mode: .windsurf/rules/<id>.md
    const rulesDir = resolve(projectDir, '.windsurf/rules');
    const targetPath = resolve(rulesDir, `${item.id}.md`);
    if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
    if (existsSync(targetPath) && !options.force) return { action: 'skipped', path: targetPath, details: 'already exists' };

    mkdirSync(rulesDir, { recursive: true });
    const skillPath = resolve(item.sourceDir || resolve(options.almanacRoot, 'skills', item.id), 'SKILL.md');
    const condensed = condenseSkill(skillPath);
    writeFileSync(targetPath, condensed, 'utf8');
    return { action: 'created', path: targetPath };
  }

  async _appendToFile(item, projectDir, options) {
    const filePath = resolve(projectDir, '.windsurfrules');
    if (options.dryRun) return { action: 'created', path: filePath, details: 'dry-run: append to .windsurfrules' };

    let content = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
    if (hasMarkedSection(content, 'skill', item.id) && !options.force) {
      return { action: 'skipped', path: filePath, details: 'already in .windsurfrules' };
    }

    content = removeMarkedSection(content, 'skill', item.id);
    const skillPath = resolve(item.sourceDir || resolve(options.almanacRoot, 'skills', item.id), 'SKILL.md');
    const condensed = condenseSkill(skillPath);
    const section = wrapInMarkers('skill', item.id, condensed);
    content = content.trimEnd() + '\n\n' + section + '\n';
    writeFileSync(filePath, content, 'utf8');
    return { action: 'created', path: filePath };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    // Try directory mode first
    const rulePath = resolve(projectDir, '.windsurf/rules', `${item.id}.md`);
    if (existsSync(rulePath)) {
      if (options.dryRun) return { action: 'removed', path: rulePath, details: 'dry-run' };
      unlinkSync(rulePath);
      return { action: 'removed', path: rulePath };
    }

    // Try single file mode
    const filePath = resolve(projectDir, '.windsurfrules');
    if (existsSync(filePath)) {
      let content = readFileSync(filePath, 'utf8');
      if (hasMarkedSection(content, 'skill', item.id)) {
        if (options.dryRun) return { action: 'removed', path: filePath, details: 'dry-run' };
        content = removeMarkedSection(content, 'skill', item.id);
        writeFileSync(filePath, content, 'utf8');
        return { action: 'removed', path: filePath };
      }
    }

    return { action: 'skipped', path: '', details: 'not installed' };
  }

  async listInstalled(projectDir) {
    const items = [];
    const rulesDir = resolve(projectDir, '.windsurf/rules');
    if (existsSync(rulesDir)) {
      for (const name of readdirSync(rulesDir)) {
        if (name.endsWith('.md')) {
          items.push({ id: name.replace(/\.md$/, ''), type: 'skill', path: resolve(rulesDir, name) });
        }
      }
    }
    return items;
  }

  async audit(projectDir) {
    const installed = await this.listInstalled(projectDir);
    return {
      framework: WindsurfAdapter.displayName,
      ok: installed.length > 0 ? [`${installed.length} rules installed`] : [],
      warnings: installed.length === 0 ? ['No Windsurf content installed'] : [],
      errors: [],
    };
  }
}
