/**
 * copilot.js — GitHub Copilot adapter.
 *
 * Skills: .github/skills/<id>/ (modern) or sections in .github/copilot-instructions.md (legacy)
 * Skills only.
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, relative } from 'path';
import { FrameworkAdapter, childPath } from './base.js';
import { classify, clearForInstall, removeEntry } from '../lib/placement.js';
import { condenseSkill, wrapInMarkers, removeMarkedSection, hasMarkedSection } from '../lib/transformer.js';

export class CopilotAdapter extends FrameworkAdapter {
  static id = 'copilot';
  static displayName = 'GitHub Copilot';
  static strategy = 'append-to-file';
  static contentTypes = ['skill'];
  /** @type {Record<string, string[]>} #607: appends to projectDir/.github/copilot-instructions.md. */
  static scopes = { skill: ['project'] };

  async detect(projectDir) {
    return existsSync(resolve(projectDir, '.github/copilot-instructions.md'));
  }

  _instructionsFile(projectDir) {
    return resolve(projectDir, '.github/copilot-instructions.md');
  }

  _skillsDir(projectDir) {
    return resolve(projectDir, '.github/skills');
  }

  async install(item, projectDir, scope, options = {}) {
    if (item.type !== 'skill') return { action: 'skipped', path: '', details: 'Copilot supports skills only' };

    // Modern: .github/skills/<id>/ symlink
    const skillsDir = this._skillsDir(projectDir);
    const targetPath = childPath(skillsDir, item.id);
    if (options.dryRun) return { action: 'created', path: targetPath, details: 'dry-run' };
    const blocked = clearForInstall(targetPath, { force: options.force });
    if (blocked) return blocked;

    mkdirSync(skillsDir, { recursive: true });
    const source = item.sourceDir || resolve(options.almanacRoot, 'skills', item.id);
    symlinkSync(relative(skillsDir, source), targetPath);
    return { action: 'created', path: targetPath };
  }

  async uninstall(item, projectDir, scope, options = {}) {
    // Remove from skills dir
    const skillPath = childPath(this._skillsDir(projectDir), item.id);
    if (classify(skillPath).kind !== 'absent') return removeEntry(skillPath, { dryRun: options.dryRun });

    // Remove from instructions file
    const instrFile = this._instructionsFile(projectDir);
    if (existsSync(instrFile)) {
      let content = readFileSync(instrFile, 'utf8');
      if (hasMarkedSection(content, 'skill', item.id)) {
        if (options.dryRun) return { action: 'removed', path: instrFile, details: 'dry-run' };
        content = removeMarkedSection(content, 'skill', item.id);
        writeFileSync(instrFile, content, 'utf8');
        return { action: 'removed', path: instrFile };
      }
    }

    return { action: 'skipped', path: '', details: 'not installed' };
  }

  async listInstalled(projectDir) {
    const items = [];
    const skillsDir = this._skillsDir(projectDir);
    if (existsSync(skillsDir)) {
      for (const name of readdirSync(skillsDir)) {
        const fullPath = resolve(skillsDir, name);
        // existsSync follows the link, so it is false for a dangling symlink.
        // Real (copied) skill directories resolve, so they are never flagged.
        let broken = false;
        try { broken = !existsSync(fullPath); } catch { broken = true; }
        items.push({ id: name, type: 'skill', path: fullPath, broken });
      }
    }
    return items;
  }

  async audit(projectDir) {
    const installed = await this.listInstalled(projectDir);
    const broken = installed.filter(i => i.broken);
    const valid = installed.filter(i => !i.broken);
    return {
      framework: CopilotAdapter.displayName,
      ok: valid.length > 0 ? [`${valid.length} skills installed`] : [],
      warnings: installed.length === 0 ? ['No Copilot skills installed'] : [],
      errors: broken.length > 0 ? [`${broken.length} broken skill symlinks`] : [],
    };
  }
}
