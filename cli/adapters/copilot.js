/**
 * copilot.js — GitHub Copilot adapter.
 *
 * Skills: .github/skills/<id>/ (modern) or sections in .github/copilot-instructions.md (legacy)
 * Skills only.
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, relative } from 'path';
import { FrameworkAdapter } from './base.js';
import { condenseSkill, wrapInMarkers, removeMarkedSection, hasMarkedSection } from '../lib/transformer.js';

export class CopilotAdapter extends FrameworkAdapter {
  static id = 'copilot';
  static displayName = 'GitHub Copilot';
  static strategy = 'append-to-file';
  static contentTypes = ['skill'];

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
    // Remove from skills dir
    const skillPath = resolve(this._skillsDir(projectDir), item.id);
    if (existsSync(skillPath)) {
      if (options.dryRun) return { action: 'removed', path: skillPath, details: 'dry-run' };
      unlinkSync(skillPath);
      return { action: 'removed', path: skillPath };
    }

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
        items.push({ id: name, type: 'skill', path: resolve(skillsDir, name) });
      }
    }
    return items;
  }

  async audit(projectDir) {
    const installed = await this.listInstalled(projectDir);
    return {
      framework: CopilotAdapter.displayName,
      ok: installed.length > 0 ? [`${installed.length} skills installed`] : [],
      warnings: installed.length === 0 ? ['No Copilot skills installed'] : [],
      errors: [],
    };
  }
}
