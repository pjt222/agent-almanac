/**
 * aider.js — Aider adapter.
 *
 * Skills: .agents/skills/ (shared universal path)
 * Append-to-file: CONVENTIONS.md for additional instructions.
 * Skills only.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { FrameworkAdapter } from './base.js';
import { condenseSkill, wrapInMarkers, removeMarkedSection, hasMarkedSection } from '../lib/transformer.js';

export class AiderAdapter extends FrameworkAdapter {
  static id = 'aider';
  static displayName = 'Aider';
  static strategy = 'append-to-file';
  static contentTypes = ['skill'];

  async detect(projectDir) {
    return existsSync(resolve(projectDir, '.aider.conf.yml')) ||
           existsSync(resolve(projectDir, 'CONVENTIONS.md'));
  }

  _conventionsFile(projectDir) {
    return resolve(projectDir, 'CONVENTIONS.md');
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type !== 'skill') return { action: 'skipped', path: '', details: 'Aider supports skills only' };

    // Skills primarily use .agents/skills/ (universal), but we also append to CONVENTIONS.md
    const filePath = this._conventionsFile(projectDir);
    if (options.dryRun) return { action: 'created', path: filePath, details: 'dry-run: append to CONVENTIONS.md' };

    let content = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
    if (hasMarkedSection(content, 'skill', item.id) && !options.force) {
      return { action: 'skipped', path: filePath, details: 'already in CONVENTIONS.md' };
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
    const filePath = this._conventionsFile(projectDir);
    if (!existsSync(filePath)) return { action: 'skipped', path: filePath, details: 'no CONVENTIONS.md' };

    let content = readFileSync(filePath, 'utf8');
    if (!hasMarkedSection(content, 'skill', item.id)) return { action: 'skipped', path: '', details: 'not in CONVENTIONS.md' };

    if (options.dryRun) return { action: 'removed', path: filePath, details: 'dry-run' };
    content = removeMarkedSection(content, 'skill', item.id);
    writeFileSync(filePath, content, 'utf8');
    return { action: 'removed', path: filePath };
  }

  async listInstalled() { return []; }

  async audit(projectDir) {
    const filePath = this._conventionsFile(projectDir);
    return {
      framework: AiderAdapter.displayName,
      ok: existsSync(filePath) ? ['CONVENTIONS.md exists'] : [],
      warnings: !existsSync(filePath) ? ['No CONVENTIONS.md found'] : [],
      errors: [],
    };
  }
}
